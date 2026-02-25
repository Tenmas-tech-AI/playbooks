---
sidebar_position: 4
title: "Día 3: n8n + Playwright"
---

# Día 3: n8n + Playwright

**Duración:** ~4 horas | **Estado:** Pendiente

⬅️ **Anterior:** [Día 2 — GitHub Security + PromptLayer](./dia-02-github-security-promptlayer)

## Objetivo del día

Al terminar este día debes tener:
- n8n self-hosted corriendo localmente con Docker
- Playwright instalado y con un test E2E básico ejecutándose
- Ambas herramientas listas para integrarse en el pipeline del equipo (Días 9–10)

---

## Parte 1: n8n — Workflow Automation

**Tiempo estimado:** 2 horas

### Prerequisitos

- Docker Desktop instalado y corriendo
- Puerto `5678` disponible
- Node.js 18+ (para el CLI, opcional)

### Instalación con Docker

La forma más rápida y la recomendada para self-hosted:

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

Para persistir datos entre reinicios y correr en background:

```bash
docker run -d \
  --name n8n \
  --restart unless-stopped \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=changeme \
  docker.n8n.io/n8nio/n8n
```

:::warning Cambia la contraseña
`N8N_BASIC_AUTH_PASSWORD=changeme` es solo para desarrollo local. Nunca uses esto en un entorno compartido o expuesto.
:::

### Configuración mínima para el stack de Tenmás

Crea un `docker-compose.yml` en la raíz del proyecto o en una carpeta `infra/n8n/`:

```yaml
# infra/n8n/docker-compose.yml
version: "3.8"

services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - WEBHOOK_URL=http://localhost:5678
      - GENERIC_TIMEZONE=America/Mexico_City
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

```bash
# .env (no commitear)
N8N_PASSWORD=tu_password_segura
```

```bash
# Levantar
docker compose -f infra/n8n/docker-compose.yml up -d

# Ver logs
docker compose -f infra/n8n/docker-compose.yml logs -f

# Detener
docker compose -f infra/n8n/docker-compose.yml down
```

### Verificación

1. Abre `http://localhost:5678`
2. Inicia sesión con las credenciales configuradas
3. Crea un workflow de prueba: **New Workflow** → agrega un nodo **Manual Trigger** → agrega un nodo **Set** → ejecuta con **Test Workflow**
4. El nodo Set debe mostrar output en el panel derecho

### Workflows de n8n para el stack de Tenmás

Estos son los workflows concretos que vas a construir. Se implementan en orden de valor.

---

#### Workflow 1: PR listo para review → notificación en Slack

**El flujo más valioso para empezar.** Cuando alguien abre o pone en "ready for review" un PR en GitHub, n8n notifica al canal de Slack del equipo con el link directo.

```
GitHub Webhook (pull_request: opened / ready_for_review)
  → n8n
    → Filtra: solo PRs que no son draft
      → Slack: mensaje en #pull-requests con autor, título y link
```

**Nodos en n8n:**
1. **Webhook** — recibe el evento de GitHub
2. **IF** — condición: `{{ $json.body.pull_request.draft }} === false`
3. **Slack** — mensaje con template:
   ```
   🔍 PR listo para review
   *{{ $json.body.pull_request.title }}*
   Autor: {{ $json.body.pull_request.user.login }}
   {{ $json.body.pull_request.html_url }}
   ```

**Configurar el webhook en GitHub:**
1. Repo → Settings → Webhooks → Add webhook
2. Payload URL: `http://TU_DOMINIO:5678/webhook/github-pr`
3. Content type: `application/json`
4. Events: selecciona **Pull requests**

:::info Desarrollo local
Para recibir webhooks de GitHub en local necesitas exponer el puerto de n8n. Usa [ngrok](https://ngrok.com) temporalmente: `ngrok http 5678`. Para producción, n8n debe estar en un servidor con IP pública.
:::

---

#### Workflow 2: PR mergeado → notifica al autor

```
GitHub Webhook (pull_request: closed + merged: true)
  → n8n
    → IF: merged === true
      → Slack: mensaje directo al autor o en #deployments
```

**Nodos en n8n:**
1. **Webhook** — mismo webhook del Workflow 1, mismo endpoint
2. **IF** — condición: `{{ $json.body.pull_request.merged }} === true`
3. **Slack** — mensaje en #deployments:
   ```
   ✅ PR mergeado a main
   *{{ $json.body.pull_request.title }}*
   Por: {{ $json.body.pull_request.user.login }}
   ```

:::tip Un solo webhook, múltiples workflows
Configura un único webhook en GitHub que reciba todos los eventos de PR. Dentro de n8n, usa nodos IF para enrutar según `action` (`opened`, `closed`, `ready_for_review`, etc.).
:::

---

#### Workflow 3: Dependabot abre PR de seguridad crítica → alerta al tech lead

```
GitHub Webhook (pull_request: opened)
  → n8n
    → IF: autor === "dependabot[bot]" AND labels contiene "security"
      → Slack: mensaje directo al tech lead con severidad
```

**Nodos en n8n:**
1. **Webhook** — mismo endpoint
2. **IF** — condición:
   ```
   {{ $json.body.pull_request.user.login }} === "dependabot[bot]"
   ```
3. **IF** — segunda condición: labels contiene `security` o `critical`
4. **Slack** — DM al tech lead:
   ```
   🚨 Dependabot detectó vulnerabilidad crítica
   *{{ $json.body.pull_request.title }}*
   {{ $json.body.pull_request.html_url }}
   ```

---

#### Workflow 4: Reporte semanal de PRs

Cada lunes a las 9:00 AM, n8n consulta la API de GitHub y envía un resumen al equipo.

```
Schedule (lunes 09:00)
  → GitHub API: GET /repos/{owner}/{repo}/pulls?state=closed&per_page=50
    → Code node: filtra PRs de la última semana y calcula métricas
      → Slack: reporte en #engineering
```

**Nodos en n8n:**
1. **Schedule Trigger** — cada semana, lunes 09:00
2. **HTTP Request** — `GET https://api.github.com/repos/Tenmas-tech-AI/{repo}/pulls?state=closed&per_page=50`
   - Header: `Authorization: Bearer {{ $env.GITHUB_TOKEN }}`
3. **Code** (JavaScript):
   ```javascript
   const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
   const prs = $input.all()[0].json.filter(pr =>
     new Date(pr.merged_at) > oneWeekAgo && pr.merged_at !== null
   );
   return [{ json: { count: prs.length, prs } }];
   ```
4. **Slack** — reporte en #engineering:
   ```
   📊 Reporte semanal de PRs
   PRs mergeados esta semana: {{ $json.count }}
   ```

---

#### Workflow 5: Alerta de costo de tokens de Claude (PromptLayer)

Cuando el gasto mensual en la API de Anthropic supera un umbral, n8n alerta al equipo.

```
Schedule (diario 08:00)
  → HTTP Request: PromptLayer API — uso del mes
    → IF: tokens > umbral
      → Slack: alerta en #engineering con costo acumulado
```

**Nodos en n8n:**
1. **Schedule Trigger** — diario 08:00
2. **HTTP Request** — PromptLayer API (ver docs de PromptLayer para el endpoint de usage)
3. **IF** — `{{ $json.total_cost }} > 50` (umbral en USD)
4. **Slack** — alerta en #engineering

---

#### Resumen: qué construir en qué orden

| Prioridad | Workflow | Cuándo implementar |
|---|---|---|
| 1 | PR listo para review → Slack | Día 3 (hoy) |
| 2 | PR mergeado → Slack | Día 3 (hoy) |
| 3 | Dependabot crítico → DM tech lead | Día 3 (hoy) |
| 4 | Reporte semanal de PRs | Día 9 |
| 5 | Alerta de costo de Claude | Día 9 |

Los workflows 1–3 se pueden construir hoy porque solo necesitan el webhook de GitHub y Slack. Los workflows 4–5 requieren tokens adicionales y se integran en el Día 9.

:::tip Workflows listos para importar
Los JSONs de todos los workflows ya están disponibles en el repo de la organización:
**[Tenmas-tech-AI/n8n-workflows](https://github.com/Tenmas-tech-AI/n8n-workflows)**

Para usarlos en cualquier proyecto:
1. Clona o descarga el JSON del workflow que necesitas
2. En n8n: **Settings → Import workflow** → selecciona el archivo
3. Actualiza las credenciales de Slack y el webhook URL de GitHub según tu proyecto
4. Activa el workflow

No necesitas construir los workflows desde cero — importa y ajusta.
:::

---

### Qué NO configurar todavía

- Integraciones con Grafana (se hace en el Día 5)
- Webhooks expuestos a internet en producción (requiere dominio real, no ngrok)
- n8n Cloud — en esta fase es self-hosted

### Troubleshooting

**Error: `port 5678 is already in use`**

```bash
# Identifica qué proceso usa el puerto
lsof -i :5678
# Cambia el puerto en el docker run / docker-compose
ports:
  - "5679:5678"
```

**Error: `docker: Cannot connect to the Docker daemon`**

Docker Desktop no está corriendo. Ábrelo y espera a que el ícono deje de girar.

**Error: El volumen `n8n_data` no persiste workflows entre reinicios**

Verifica que el volumen esté declarado correctamente y que no estés usando `--rm` (que elimina el contenedor y sus datos al detenerlo):

```bash
docker volume ls | grep n8n_data
docker volume inspect n8n_data
```

---

## Parte 2: Playwright — Testing Automatizado

**Tiempo estimado:** 2 horas

### Prerequisitos

- Node.js 18+
- Un proyecto con `package.json` existente (puede ser el repo principal o uno dedicado a tests)

### Instalación

```bash
npm init playwright@latest
```

El CLI pregunta:
- **Where to put your end-to-end tests?** → `tests` (default)
- **Add a GitHub Actions workflow?** → `y`
- **Install Playwright browsers?** → `y`

Esto instala Playwright, crea `playwright.config.ts`, la carpeta `tests/` y el workflow de GitHub Actions.

Si lo agregas a un proyecto existente:

```bash
npm install -D @playwright/test
npx playwright install
```

### Configuración mínima para el stack de Tenmás

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html"], ["github"]],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

```bash
# .env
BASE_URL=http://localhost:3000
```

### Test de verificación

Crea `tests/smoke.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test("página principal carga correctamente", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator("body")).toBeVisible();
});
```

### Ejemplos de tests para Tenmás

Estos son los patrones más comunes que vas a necesitar. Úsalos como base para los tests de la aplicación.

---

#### Ejemplo 1: Navegación entre páginas

Verifica que las rutas principales de la app cargan y tienen el contenido esperado.

```typescript
// tests/navigation.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Navegación principal", () => {
  test("home carga con el título correcto", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Tenmás/);
  });

  test("ruta /dashboard es accesible", async ({ page }) => {
    await page.goto("/dashboard");
    // Verifica que no redirige a 404
    await expect(page).not.toHaveURL(/404/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("link de navegación lleva a la página correcta", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("botón atrás funciona correctamente", async ({ page }) => {
    await page.goto("/");
    await page.goto("/dashboard");
    await page.goBack();
    await expect(page).toHaveURL("/");
  });
});
```

---

#### Ejemplo 2: Login / autenticación

Verifica el flujo completo de login: credenciales correctas, incorrectas y redirección post-login.

```typescript
// tests/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Autenticación", () => {
  test("login exitoso redirige al dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("usuario@tenmas.com");
    await page.getByLabel("Contraseña").fill(process.env.TEST_PASSWORD!);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("Bienvenido")).toBeVisible();
  });

  test("credenciales incorrectas muestran error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("usuario@tenmas.com");
    await page.getByLabel("Contraseña").fill("password_incorrecto");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    await expect(page.getByText(/credenciales inválidas/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("usuario no autenticado es redirigido al login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("logout limpia la sesión", async ({ page }) => {
    // Login primero
    await page.goto("/login");
    await page.getByLabel("Email").fill("usuario@tenmas.com");
    await page.getByLabel("Contraseña").fill(process.env.TEST_PASSWORD!);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Logout
    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(page).toHaveURL(/\/login/);

    // Verificar que la sesión se limpió
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
```

**Variables de entorno para tests de auth:**

```bash
# .env.test (no commitear)
TEST_PASSWORD=password_del_usuario_de_prueba
TEST_USER_EMAIL=usuario@tenmas.com
```

```typescript
// playwright.config.ts — agregar para cargar .env.test
import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });
```

---

#### Patrón recomendado: autenticación compartida entre tests

Si múltiples tests requieren estar logueado, usa `storageState` para no repetir el login en cada test:

```typescript
// tests/setup/auth.setup.ts
import { test as setup } from "@playwright/test";

setup("autenticar usuario de prueba", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(process.env.TEST_USER_EMAIL!);
  await page.getByLabel("Contraseña").fill(process.env.TEST_PASSWORD!);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await page.waitForURL(/\/dashboard/);

  // Guarda la sesión en disco
  await page.context().storageState({ path: "tests/.auth/user.json" });
});
```

```typescript
// playwright.config.ts — agregar proyecto de setup
projects: [
  {
    name: "setup",
    testMatch: /setup\/.*\.setup\.ts/,
  },
  {
    name: "chromium",
    use: {
      ...devices["Desktop Chrome"],
      storageState: "tests/.auth/user.json", // reutiliza sesión
    },
    dependencies: ["setup"], // corre setup primero
  },
],
```

```bash
# .gitignore — agregar
tests/.auth/
```

Con este patrón, el login corre una sola vez y todos los tests de la suite reutilizan la sesión guardada.

---

### Verificación

```bash
# Corre todos los tests
npx playwright test

# Corre con UI interactiva (útil para debug)
npx playwright test --ui

# Genera reporte HTML
npx playwright show-report
```

La salida esperada:

```
Running 1 test using 1 worker
  ✓  tests/smoke.spec.ts:3:1 › página principal carga correctamente (1.2s)

  1 passed (2s)
```

### GitHub Actions — quality gate en PRs

El CLI ya genera el workflow. Revísalo y ajusta el `BASE_URL` si es necesario:

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npx playwright test
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

:::info Integración como quality gate
La integración completa con el flujo de PRs (bloquear merge si fallan tests) se configura en el **Día 10**. Por ahora déjalo como workflow informativo.
:::

### Qué NO configurar todavía

- Tests E2E completos de la aplicación (requiere que la app esté más madura)
- Visual regression testing (Playwright tiene soporte, pero es Día 10)
- Paralelización en CI con múltiples workers (optimizar después de tener tests reales)
- Integración con Grafana para métricas de tests (Día 5)

### Troubleshooting

**Error: `browserType.launch: Executable doesn't exist`**

Los browsers no están instalados:

```bash
npx playwright install
# o solo chromium
npx playwright install chromium
```

**Error: `page.goto: net::ERR_CONNECTION_REFUSED`**

La app no está corriendo. Playwright necesita que el servidor esté levantado antes de ejecutar los tests. Para desarrollo local, levanta la app primero:

```bash
# Terminal 1
npm run dev

# Terminal 2
npx playwright test
```

Para CI, usa `webServer` en `playwright.config.ts`:

```typescript
webServer: {
  command: "npm run start",
  url: "http://localhost:3000",
  reuseExistingServer: !process.env.CI,
},
```

**Error: `Test timeout of 30000ms exceeded`**

El test está esperando un elemento que no aparece. Aumenta el timeout o revisa el selector:

```typescript
// Aumentar timeout para un test específico
test("mi test", async ({ page }) => {
  test.setTimeout(60000);
  // ...
});

// O globalmente en playwright.config.ts
use: {
  actionTimeout: 10000,
  navigationTimeout: 30000,
},
```

---

## Checklist del Día 3

Al terminar el día, verifica:

**n8n:**
- [ ] Docker Desktop corriendo
- [ ] n8n levantado en `http://localhost:5678`
- [ ] `docker-compose.yml` creado en `infra/n8n/`
- [ ] `N8N_PASSWORD` en `.env` local (nunca en el repo)
- [ ] Workflow de prueba ejecutado correctamente en la UI
- [ ] Webhook de GitHub configurado apuntando al endpoint de n8n
- [ ] JSONs importados desde [Tenmas-tech-AI/n8n-workflows](https://github.com/Tenmas-tech-AI/n8n-workflows)
- [ ] Workflow 1: PR listo para review → notifica en Slack ✅
- [ ] Workflow 2: PR mergeado → notifica en Slack ✅
- [ ] Workflow 3: Dependabot crítico → DM al tech lead ✅

**Playwright:**
- [ ] `npm init playwright@latest` ejecutado
- [ ] `playwright.config.ts` con `baseURL` y reporters configurados
- [ ] `tests/smoke.spec.ts` creado y pasando
- [ ] `npx playwright test` retorna 1 passed
- [ ] Workflow de GitHub Actions generado en `.github/workflows/playwright.yml`

---

## Recursos

- [Tenmas-tech-AI/n8n-workflows](https://github.com/Tenmas-tech-AI/n8n-workflows) — JSONs listos para importar en n8n
- [n8n Docs — Self-hosted con Docker](https://docs.n8n.io/hosting/installation/docker/)
- [n8n Docs — Environment variables](https://docs.n8n.io/hosting/configuration/environment-variables/)
- [Playwright Docs — Getting started](https://playwright.dev/docs/intro)
- [Playwright Docs — Configuration](https://playwright.dev/docs/test-configuration)
- [Playwright Docs — CI/CD](https://playwright.dev/docs/ci)

➡️ **Siguiente:** Día 4 — LangChain (próximamente)
