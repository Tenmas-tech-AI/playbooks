---
sidebar_position: 6
title: "Día 5: Grafana + TimescaleDB + Métricas baseline"
---

# Día 5: Grafana + TimescaleDB + Métricas baseline

**Duración:** ~5 horas | **Estado:** 🔲 Pendiente

⬅️ **Anterior:** [Día 4 — LangChain + Validación del Stack](./dia-04-langchain-validacion)

## Objetivo del día

> "If it can't be measured, it can't be sold."

Al terminar este día el equipo tiene un dashboard en tiempo real con las 6 métricas target de Tenmás. Este dashboard es el artefacto que se muestra a clientes como evidencia de capacidad operacional.

Al terminar debes tener:
- Grafana Cloud con dashboard funcional
- TimescaleDB Cloud con schema de métricas creado
- Script de sincronización GitHub → TimescaleDB corriendo
- Las 6 métricas de Tenmás visibles en tiempo real

---

## Parte 1: Grafana Cloud Setup

**Tiempo estimado:** 45 minutos

### Crear cuenta y workspace

1. Ve a [grafana.com/auth/sign-up](https://grafana.com/auth/sign-up)
2. Selecciona **Free tier** — incluye 10k series de métricas, 14 días de retención
3. Nombra el stack: `tenmas` (este nombre aparece en la URL: `tenmas.grafana.net`)
4. Región: **US East** (mejor latencia para la mayoría del equipo)

Guarda la URL del workspace — la necesitarás en toda la sección:

```
https://tenmas.grafana.net
```

### Obtener API key

1. Ve a **Administration → Users and access → Service accounts**
2. **Add service account** → nombre: `metrics-writer` → rol: **Editor**
3. **Add service account token** → copia el token

```bash
# .env — agrega estas variables
GRAFANA_URL=https://tenmas.grafana.net
GRAFANA_API_KEY=glsa_xxxx
```

### Configurar data source de TimescaleDB

Lo hacemos en la siguiente sección después de tener el connection string. Por ahora solo verifica acceso:

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $GRAFANA_API_KEY" \
  "$GRAFANA_URL/api/health"
# Debe retornar: 200
```

---

## Parte 2: TimescaleDB Cloud Setup

**Tiempo estimado:** 45 minutos

### Crear instancia cloud

1. Ve a [console.cloud.timescale.com](https://console.cloud.timescale.com) → **Create service**
2. Plan: **Free tier** (0.5 CPU, 1GB RAM, 10GB storage — suficiente para métricas de desarrollo)
3. Región: **US East (N. Virginia)**
4. Nombre del servicio: `tenmas-metrics`

Al crear, Timescale muestra las credenciales una sola vez. Cópialas todas:

```bash
# .env
TIMESCALE_HOST=xxxx.tsdb.cloud.timescale.com
TIMESCALE_PORT=5432
TIMESCALE_DB=tsdb
TIMESCALE_USER=tsdbadmin
TIMESCALE_PASSWORD=xxxx
TIMESCALE_URL=postgresql://tsdbadmin:xxxx@xxxx.tsdb.cloud.timescale.com:5432/tsdb?sslmode=require
```

### Verificar conexión

```bash
psql "$TIMESCALE_URL" -c "SELECT version();"
# Debe mostrar: TimescaleDB x.x.x
```

Si no tienes `psql` instalado:

```bash
brew install libpq && echo 'export PATH="/opt/homebrew/opt/libpq/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

### Crear schema de métricas

Conéctate y ejecuta:

```sql
-- Habilitar TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Tabla principal de métricas de PRs
CREATE TABLE IF NOT EXISTS pr_metrics (
  time        TIMESTAMPTZ NOT NULL,
  repo        TEXT NOT NULL,
  pr_number   INTEGER NOT NULL,
  author      TEXT,
  opened_at   TIMESTAMPTZ,
  merged_at   TIMESTAMPTZ,
  cycle_time_hours FLOAT,  -- tiempo desde opened_at hasta merged_at
  additions   INTEGER DEFAULT 0,
  deletions   INTEGER DEFAULT 0,
  ai_assisted BOOLEAN DEFAULT FALSE,  -- detectado por label o descripción
  has_tests   BOOLEAN DEFAULT FALSE
);

-- Convertir a hypertable (particionado por tiempo automáticamente)
SELECT create_hypertable('pr_metrics', 'time', if_not_exists => TRUE);

-- Tabla de métricas semanales agregadas
CREATE TABLE IF NOT EXISTS weekly_metrics (
  week        DATE NOT NULL,
  repo        TEXT NOT NULL,
  prs_merged  INTEGER DEFAULT 0,
  avg_cycle_time_hours FLOAT,
  bug_prs     INTEGER DEFAULT 0,   -- PRs con label "bug" o "hotfix"
  ai_prs      INTEGER DEFAULT 0,
  PRIMARY KEY (week, repo)
);

-- Tabla de cobertura de tests (se llena desde CI)
CREATE TABLE IF NOT EXISTS test_coverage (
  time        TIMESTAMPTZ NOT NULL,
  repo        TEXT NOT NULL,
  coverage_pct FLOAT NOT NULL,
  branch      TEXT DEFAULT 'main'
);

SELECT create_hypertable('test_coverage', 'time', if_not_exists => TRUE);

-- Índices para queries frecuentes
CREATE INDEX IF NOT EXISTS idx_pr_metrics_repo ON pr_metrics (repo, time DESC);
CREATE INDEX IF NOT EXISTS idx_test_coverage_repo ON test_coverage (repo, time DESC);
```

Ejecuta el archivo guardándolo como `infra/timescale/schema.sql`:

```bash
psql "$TIMESCALE_URL" -f infra/timescale/schema.sql
```

---

## Parte 3: Conectar GitHub API → TimescaleDB

**Tiempo estimado:** 1.5 horas

### Variables de entorno adicionales

```bash
# .env
GITHUB_TOKEN=ghp_xxxx       # Personal Access Token con scope: repo, read:org
GITHUB_ORG=Tenmas-tech-AI   # organización de GitHub
```

El token lo creas en: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → permisos: `Pull requests: Read`, `Contents: Read`.

### Script de sincronización

Crea el archivo `scripts/metrics/sync-github.ts`:

```typescript
import "dotenv/config";
import { Pool } from "pg";
import { Octokit } from "@octokit/rest";

const db = new Pool({ connectionString: process.env.TIMESCALE_URL });
const gh = new Octokit({ auth: process.env.GITHUB_TOKEN });

const ORG = process.env.GITHUB_ORG!;

async function syncPRs(repo: string, since: Date) {
  console.log(`Syncing PRs for ${ORG}/${repo} since ${since.toISOString()}`);

  const { data: prs } = await gh.pulls.list({
    owner: ORG,
    repo,
    state: "closed",
    sort: "updated",
    direction: "desc",
    per_page: 100,
  });

  const merged = prs.filter(
    (pr) => pr.merged_at && new Date(pr.merged_at) >= since
  );

  console.log(`  Found ${merged.length} merged PRs`);

  for (const pr of merged) {
    const openedAt = new Date(pr.created_at);
    const mergedAt = new Date(pr.merged_at!);
    const cycleTimeHours =
      (mergedAt.getTime() - openedAt.getTime()) / (1000 * 60 * 60);

    const labels = pr.labels.map((l) => l.name?.toLowerCase() ?? "");
    const aiAssisted =
      labels.includes("ai-assisted") ||
      pr.body?.toLowerCase().includes("co-authored by claude") ||
      pr.body?.toLowerCase().includes("copilot") ||
      false;

    await db.query(
      `INSERT INTO pr_metrics
        (time, repo, pr_number, author, opened_at, merged_at,
         cycle_time_hours, additions, deletions, ai_assisted)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT DO NOTHING`,
      [
        mergedAt,
        repo,
        pr.number,
        pr.user?.login,
        openedAt,
        mergedAt,
        cycleTimeHours,
        pr.additions ?? 0,
        pr.deletions ?? 0,
        aiAssisted,
      ]
    );
  }
}

async function main() {
  // Sincronizar últimas 4 semanas por defecto
  const since = new Date();
  since.setDate(since.getDate() - 28);

  // Lista de repos a sincronizar
  const repos = ["playbooks"]; // agrega más repos de Tenmas-tech-AI

  for (const repo of repos) {
    await syncPRs(repo, since);
  }

  // Actualizar métricas semanales agregadas
  await db.query(`
    INSERT INTO weekly_metrics (week, repo, prs_merged, avg_cycle_time_hours, bug_prs, ai_prs)
    SELECT
      date_trunc('week', merged_at)::DATE AS week,
      repo,
      COUNT(*) AS prs_merged,
      AVG(cycle_time_hours) AS avg_cycle_time_hours,
      0 AS bug_prs,
      COUNT(*) FILTER (WHERE ai_assisted = TRUE) AS ai_prs
    FROM pr_metrics
    WHERE merged_at >= NOW() - INTERVAL '28 days'
    GROUP BY 1, 2
    ON CONFLICT (week, repo) DO UPDATE
      SET prs_merged = EXCLUDED.prs_merged,
          avg_cycle_time_hours = EXCLUDED.avg_cycle_time_hours,
          ai_prs = EXCLUDED.ai_prs
  `);

  console.log("Sync completed.");
  await db.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

### Instalar dependencias

```bash
npm install @octokit/rest pg
npm install --save-dev @types/pg
```

### Ejecutar el script

```bash
npx tsx scripts/metrics/sync-github.ts
```

Salida esperada:

```
Syncing PRs for Tenmas-tech-AI/playbooks since 2024-xx-xx...
  Found 12 merged PRs
Sync completed.
```

### Verificar datos en TimescaleDB

```bash
psql "$TIMESCALE_URL" -c "
  SELECT repo, COUNT(*) as prs, ROUND(AVG(cycle_time_hours)::numeric, 1) as avg_cycle_h
  FROM pr_metrics
  GROUP BY repo;
"
```

### Automatizar con n8n

En lugar de correr el script manualmente, usa n8n (Día 3) para ejecutarlo cada 6 horas:

1. Abre `http://localhost:5678`
2. **New workflow → Add node → Schedule Trigger**
   - Interval: `6 hours`
3. **Add node → Execute Command**
   - Command: `cd /ruta/al/repo && npx tsx scripts/metrics/sync-github.ts`
4. Activa el workflow

---

## Parte 4: Configurar Dashboard en Grafana

**Tiempo estimado:** 1.5 horas

### Conectar TimescaleDB como data source

1. En Grafana: **Connections → Data sources → Add new data source**
2. Selecciona **PostgreSQL**
3. Configura:

```
Host:     tu-host.tsdb.cloud.timescale.com:5432
Database: tsdb
User:     tsdbadmin
Password: tu-password
SSL Mode: require
```

4. **Save & test** — debe mostrar "Database connection OK"

### Crear los 6 panels de métricas

Crea un nuevo dashboard: **Dashboards → New → New dashboard → Add visualization**.

---

**Panel 1 — PRs per week** (target: 8.5)

Data source: TimescaleDB | Visualización: **Stat**

```sql
SELECT
  date_trunc('week', merged_at) AS time,
  COUNT(*) AS value
FROM pr_metrics
WHERE $__timeFilter(merged_at)
GROUP BY 1
ORDER BY 1
```

Threshold: rojo < 6, amarillo < 8.5, verde >= 8.5

---

**Panel 2 — Cycle time promedio** (target: 48h)

Visualización: **Stat** | Unidad: `hours`

```sql
SELECT
  date_trunc('week', merged_at) AS time,
  ROUND(AVG(cycle_time_hours)::numeric, 1) AS value
FROM pr_metrics
WHERE $__timeFilter(merged_at)
GROUP BY 1
ORDER BY 1
```

Threshold: verde <= 48, amarillo <= 72, rojo > 72

---

**Panel 3 — AI-assisted PRs %** (target: >70%)

Visualización: **Gauge** | Unidad: `percent (0-100)`

```sql
SELECT
  NOW() AS time,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE ai_assisted = TRUE) / NULLIF(COUNT(*), 0),
    1
  ) AS value
FROM pr_metrics
WHERE merged_at >= NOW() - INTERVAL '7 days'
```

Threshold: rojo < 50, amarillo < 70, verde >= 70

---

**Panel 4 — Test coverage %** (target: >80%)

Visualización: **Gauge** | Unidad: `percent (0-100)`

```sql
SELECT
  time,
  coverage_pct AS value
FROM test_coverage
WHERE $__timeFilter(time) AND repo = 'playbooks'
ORDER BY time DESC
LIMIT 1
```

Threshold: rojo < 60, amarillo < 80, verde >= 80

:::info Poblar coverage manualmente
Mientras no tienes CI reportando cobertura automáticamente, inserta el valor base:

```bash
psql "$TIMESCALE_URL" -c "
  INSERT INTO test_coverage (time, repo, coverage_pct)
  VALUES (NOW(), 'playbooks', 82.0);
"
```
:::

---

**Panel 5 — Post-release bug rate %** (target: 2.1%)

Visualización: **Stat** | Unidad: `percent (0-100)`

```sql
SELECT
  NOW() AS time,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE body ILIKE '%bug%' OR body ILIKE '%hotfix%')
    / NULLIF(COUNT(*), 0),
    2
  ) AS value
FROM pr_metrics
WHERE merged_at >= NOW() - INTERVAL '30 days'
```

Threshold: verde <= 2.1, amarillo <= 5, rojo > 5

---

**Panel 6 — Cycle time histórico** (gráfico de línea para ver tendencia)

Visualización: **Time series**

```sql
SELECT
  date_trunc('week', merged_at) AS time,
  AVG(cycle_time_hours) AS "Cycle time (h)",
  48 AS "Target"
FROM pr_metrics
WHERE $__timeFilter(merged_at)
GROUP BY 1
ORDER BY 1
```

---

### Guardar y compartir el dashboard

1. Click en el ícono de guardar → nombre: **Tenmás Engineering Metrics**
2. Para compartir: **Share → Public dashboard → Enable** (genera URL pública sin login)

Guarda la URL pública — es lo que se muestra a clientes.

### Configurar alertas básicas

En cualquier panel → **Alert tab → New alert rule**:

**Alerta: Cycle time fuera de target**

```
Condition: avg() OF query(A, 7d, now) IS ABOVE 72
Evaluate every: 1h
For: 2h
Message: "Cycle time supera 72h — revisar PRs bloqueados"
```

**Notificación:** Connections → Contact points → agrega Slack webhook del Día 3.

---

## Parte 5: Troubleshooting

**Los 3 errores más comunes:**

### Error: `SSL SYSCALL error: EOF detected`

TimescaleDB requiere `sslmode=require`. Verifica el connection string:

```bash
# Incorrecto
postgresql://user:pass@host:5432/tsdb

# Correcto
postgresql://user:pass@host:5432/tsdb?sslmode=require
```

### Error: `permission denied for table pr_metrics`

El usuario de Grafana necesita permisos de lectura:

```sql
-- Ejecuta como tsdbadmin
GRANT SELECT ON ALL TABLES IN SCHEMA public TO tsdbadmin;
```

Si usas un usuario separado para Grafana (recomendado en producción):

```sql
CREATE USER grafana_reader WITH PASSWORD 'xxxx';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO grafana_reader;
```

### Error: `No data` en Grafana panel

El rango de tiempo de Grafana no coincide con los datos. Verifica:

1. El selector de tiempo en Grafana (esquina superior derecha): cámbialo a **Last 30 days**
2. Que el script de sync corrió y tiene datos:

```bash
psql "$TIMESCALE_URL" -c "SELECT COUNT(*), MIN(merged_at), MAX(merged_at) FROM pr_metrics;"
```

3. Que `$__timeFilter(merged_at)` está en el query — si el campo de tiempo se llama distinto, ajústalo.

### Qué NO configurar todavía

- **Retención de datos personalizada** — el free tier de Timescale tiene 90 días, es suficiente para fase inicial
- **Alertas complejas con múltiples condiciones** — se diseñan cuando hay baseline de datos reales (semana 3+)
- **Copilot acceptance rate** — requiere instalar la extensión de GitHub Copilot Metrics que solo está disponible en GitHub Enterprise. Placeholder en el dashboard por ahora
- **Grafana OnCall o PagerDuty** — escalar alertas a on-call es fase 2

---

## Checklist del Día 5

- [ ] Grafana Cloud accesible en `https://tenmas.grafana.net`
- [ ] TimescaleDB Cloud conectado y schema creado (`pr_metrics`, `weekly_metrics`, `test_coverage`)
- [ ] `npx tsx scripts/metrics/sync-github.ts` corre sin errores y popula datos
- [ ] Dashboard **Tenmás Engineering Metrics** mostrando las 6 métricas target
- [ ] Al menos 1 alerta configurada (cycle time > 72h)
- [ ] URL pública del dashboard copiada para compartir con clientes

---

## Recursos

- [Grafana Cloud Free Tier](https://grafana.com/products/cloud/features/#free-forever-plan)
- [TimescaleDB Cloud Docs](https://docs.timescale.com/getting-started/latest/)
- [Grafana PostgreSQL Data Source](https://grafana.com/docs/grafana/latest/datasources/postgres/)
- [Octokit REST — GitHub API client](https://octokit.github.io/rest.js/)
- [TimescaleDB — Hypertables](https://docs.timescale.com/use-timescale/latest/hypertables/)

➡️ **Siguiente:** Día 6 — Docusaurus CI/CD (próximamente)
