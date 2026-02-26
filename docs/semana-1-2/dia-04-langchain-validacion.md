---
sidebar_position: 5
title: "Día 4: LangChain + Validación del Stack"
---

# Día 4: LangChain + Validación del Stack

**Duración:** ~4 horas | **Estado:** ✅ Completo

⬅️ **Anterior:** [Día 3 — n8n + Playwright](./dia-03-n8n-playwright)

## Objetivo del día

Al terminar este día debes tener:
- LangChain instalado y corriendo con Claude (Anthropic) o GPT (OpenAI)
- Un agent funcional de prueba que resuelve una tarea real
- LangSmith configurado para observabilidad de las llamadas al LLM
- Todo el stack de los Días 1–4 validado y comunicándose sin errores

---

## Parte 1: LangChain

**Tiempo estimado:** 2.5 horas

### Prerequisitos

- Node.js 18+ o Python 3.9+
- `ANTHROPIC_API_KEY` o `OPENAI_API_KEY` disponible
- Un proyecto con `package.json` o `pyproject.toml` existente

:::tip LLM recomendado para Tenmás
Usa **Anthropic Claude** si ya tienes créditos del Día 2 (PromptLayer setup). Usa **OpenAI** si el equipo ya tiene cuenta activa. LangChain soporta ambos con la misma API.
:::

### Instalación

**Node.js / TypeScript:**

```bash
npm install langchain @langchain/anthropic @langchain/openai
# o solo el que vas a usar:
npm install langchain @langchain/anthropic
npm install langchain @langchain/openai
```

**Python:**

```bash
pip install langchain langchain-anthropic langchain-openai
```

### Variables de entorno

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-xxxx
OPENAI_API_KEY=sk-xxxx          # solo si usas OpenAI

# LangSmith — observabilidad (ver Parte 2)
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=lsv2_pt_xxxx
LANGCHAIN_PROJECT=nombre-del-proyecto
```

:::caution
Nunca subas el `.env` al repositorio. Asegúrate de que está en el `.gitignore`:
```
.env
```
:::

### Configuración mínima para el stack de Tenmás

**TypeScript:**

```typescript
// src/ai/client.ts
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";

// Elige uno según el LLM que uses en Tenmás
export const llm = new ChatAnthropic({
  model: "claude-haiku-4-5-20251001",
  temperature: 0,
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// export const llm = new ChatOpenAI({
//   model: "gpt-4o-mini",
//   temperature: 0,
//   apiKey: process.env.OPENAI_API_KEY,
// });
```

**Python:**

```python
# src/ai/client.py
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
import os

llm = ChatAnthropic(
    model="claude-haiku-4-5-20251001",
    temperature=0,
    api_key=os.environ["ANTHROPIC_API_KEY"],
)

# llm = ChatOpenAI(
#     model="gpt-4o-mini",
#     temperature=0,
#     api_key=os.environ["OPENAI_API_KEY"],
# )
```

### Agent de prueba: PR Reviewer

Este agent recibe el diff de un PR y genera un resumen técnico. Es el caso de uso más relevante para el stack de Tenmás — conecta directamente con el flujo de GitHub del Día 3.

**TypeScript:**

```typescript
// src/ai/pr-reviewer.ts
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { llm } from "./client";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `Eres un code reviewer técnico. Analiza el diff de PR y responde en español con:
1. Resumen de cambios (2-3 líneas)
2. Riesgos detectados (si los hay)
3. Sugerencia de mejora más importante (solo una)

Sé directo y conciso.`,
  ],
  ["human", "Diff del PR:\n\n{diff}"],
]);

const chain = prompt.pipe(llm).pipe(new StringOutputParser());

export async function reviewPR(diff: string): Promise<string> {
  return chain.invoke({ diff });
}

// Prueba local
const testDiff = `
+++ b/src/auth/login.ts
@@ -10,6 +10,12 @@ export async function login(email: string, password: string) {
+  const user = await db.query('SELECT * FROM users WHERE email = ' + email);
+  if (!user) throw new Error('User not found');
+  return generateToken(user);
`;

reviewPR(testDiff).then(console.log).catch(console.error);
```

```bash
# Ejecutar
npx ts-node src/ai/pr-reviewer.ts
# o con tsx:
npx tsx src/ai/pr-reviewer.ts
```

**Python:**

```python
# src/ai/pr_reviewer.py
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from src.ai.client import llm

prompt = ChatPromptTemplate.from_messages([
    ("system", """Eres un code reviewer técnico. Analiza el diff de PR y responde en español con:
1. Resumen de cambios (2-3 líneas)
2. Riesgos detectados (si los hay)
3. Sugerencia de mejora más importante (solo una)

Sé directo y conciso."""),
    ("human", "Diff del PR:\n\n{diff}"),
])

chain = prompt | llm | StrOutputParser()

def review_pr(diff: str) -> str:
    return chain.invoke({"diff": diff})

if __name__ == "__main__":
    test_diff = """
+++ b/src/auth/login.py
@@ -10,6 +10,4 @@ def login(email, password):
+    user = db.execute(f"SELECT * FROM users WHERE email = {email}")
+    if not user: raise Exception("User not found")
+    return generate_token(user)
    """
    print(review_pr(test_diff))
```

```bash
python src/ai/pr_reviewer.py
```

### Salida esperada del agent

```
1. **Resumen:** Se agrega función de login que consulta usuario por email y genera token de sesión.

2. **Riesgos:** SQL injection crítico — la query concatena el input directamente sin sanitizar.
   Cualquier valor en `email` se ejecuta como SQL.

3. **Sugerencia:** Usar prepared statements o un ORM:
   `db.query('SELECT * FROM users WHERE email = $1', [email])`
```

### Verificación

```bash
# TypeScript
npx tsx src/ai/pr-reviewer.ts

# Python
python src/ai/pr_reviewer.py
```

La respuesta debe aparecer en consola en menos de 10 segundos. Si tarda más de 30s, hay un problema de red o la API key es inválida.

### Qué NO configurar todavía

- **Pinecone / vector stores** — se integran en la fase de RAG (no está en el scope de semanas 1-2)
- **Agents con tools complejas** — el agent de prueba es intencionalmente simple
- **Memory persistente** — requiere base de datos, se diseña según el proyecto específico
- **Streaming de respuestas** — útil para UX pero no necesario en esta fase

### Troubleshooting

**Error: `AuthenticationError: Invalid API key`**

La API key está mal configurada. Verifica:

```bash
# Verifica que la variable existe
echo $ANTHROPIC_API_KEY
# o
node -e "console.log(process.env.ANTHROPIC_API_KEY)"
```

Asegúrate de que el `.env` se carga antes de importar el cliente. Usa `dotenv` al inicio del archivo de entrada:

```typescript
import "dotenv/config"; // debe ser el primer import
```

**Error: `Cannot find module '@langchain/anthropic'`**

El paquete no está instalado o hay un conflicto de versiones:

```bash
npm install @langchain/anthropic@latest
# Si persiste, limpia caché:
rm -rf node_modules package-lock.json && npm install
```

**Error: `RateLimitError` o respuestas muy lentas**

La cuenta tiene rate limits bajos (cuentas nuevas de Anthropic tienen límites estrictos). Soluciones:

```typescript
// Agregar retry automático
const llm = new ChatAnthropic({
  model: "claude-haiku-4-5-20251001",
  maxRetries: 3,
  temperature: 0,
});
```

O cambia a un modelo más barato/rápido temporalmente: `claude-haiku-4-5-20251001` es el más rápido de Claude.

---

## Parte 2: LangSmith — Observabilidad de LangChain

**Tiempo estimado:** 30 minutos

LangSmith es el dashboard oficial de LangChain. Registra automáticamente cada ejecución del pipeline: qué prompt se mandó, qué retornó el LLM, cuánto tardó cada paso, cuántos tokens se usaron.

### LangSmith vs PromptLayer

Ambas herramientas son complementarias — se usan en momentos distintos del ciclo de desarrollo:

| | **LangSmith** | **PromptLayer** |
|---|---|---|
| **Enfoque** | Debuggear el pipeline completo | Gestionar y versionar prompts |
| **Qué muestra** | Cada paso del chain (prompt → LLM → parser) | La llamada al LLM y la respuesta |
| **Mejor para** | Entender por qué falló un agent | Ver qué prompt genera mejores respuestas |
| **Versionado de prompts** | No | Sí — A/B testing de prompts |
| **Configuración** | Variables de entorno, nada en el código | Wrapper en el cliente |

**Regla práctica:**
- Usa **LangSmith** cuando estás **desarrollando** y necesitas ver qué pasa dentro del pipeline
- Usa **PromptLayer** cuando estás **iterando sobre el prompt** y quieres comparar versiones en producción

### Setup de LangSmith

**1. Crea la cuenta:**

Ve a [smith.langchain.com](https://smith.langchain.com) y crea una cuenta gratuita (no requiere tarjeta de crédito).

**2. Obtén la API key:**

Settings → API Keys → **Create API Key**

La key empieza con `lsv2_pt_...`

**3. Agrega las variables al `.env`:**

```bash
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=lsv2_pt_xxxx
LANGCHAIN_PROJECT=tenmas-playbooks   # nombre del proyecto en LangSmith
```

**No hay que cambiar nada en el código** — LangChain detecta estas variables automáticamente y envía las trazas a LangSmith en cada ejecución.

### Ejecutar el script con tracing activo

```bash
npx tsx scripts/ai/pr-reviewer.ts
```

El script en este repo está en [scripts/ai/pr-reviewer.ts](../../scripts/ai/pr-reviewer.ts):

```typescript
import "dotenv/config"; // carga .env automáticamente, incluidas las vars de LangSmith
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const llm = new ChatAnthropic({
  model: "claude-haiku-4-5-20251001",
  temperature: 0,
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const prompt = ChatPromptTemplate.fromMessages([
  ["system", `Eres un code reviewer técnico. Analiza el diff de PR y responde en español con:
1. Resumen de cambios (2-3 líneas)
2. Riesgos detectados (si los hay)
3. Sugerencia de mejora más importante (solo una)

Sé directo y conciso.`],
  ["human", "Diff del PR:\n\n{diff}"],
]);

const chain = prompt.pipe(llm).pipe(new StringOutputParser());

async function reviewPR(diff: string): Promise<string> {
  return chain.invoke({ diff });
}
```

### Salida esperada en consola

```
Analizando diff con LangChain + Claude...

## Resumen
Se añade lógica de autenticación que consulta usuarios en BD y genera token.
Sin embargo, contiene una vulnerabilidad crítica de seguridad.

## Riesgos detectados
🔴 SQL Injection: La consulta concatena directamente `email` sin escapar.

## Sugerencia de mejora
Usa prepared statements:
const user = await db.query('SELECT * FROM users WHERE email = ?', [email]);

✅ LangChain + Anthropic funcionando correctamente
```

### Qué ver en el dashboard de LangSmith

Después de ejecutar el script, ve a [smith.langchain.com](https://smith.langchain.com) → proyecto **tenmas-playbooks**:

- **Runs** — cada ejecución con el prompt completo y la respuesta
- **Latency** — cuánto tardó la llamada al LLM
- **Tokens** — tokens de entrada y salida (útil para estimar costos)
- **Trace** — el pipeline completo paso a paso: `ChatPromptTemplate → ChatAnthropic → StringOutputParser`

### Troubleshooting

**Las trazas no aparecen en LangSmith:**

```bash
# Verifica que las variables están cargadas
node -e "require('dotenv/config'); console.log(process.env.LANGCHAIN_TRACING_V2, process.env.LANGCHAIN_API_KEY?.slice(0,10))"
```

Si `LANGCHAIN_TRACING_V2` no es `"true"` (string, no booleano), el tracing no se activa.

**Error: `LangSmithAuthError`:**

La `LANGCHAIN_API_KEY` está mal copiada. Regénera la key en smith.langchain.com → Settings → API Keys.

---

## Parte 3: Validación del stack completo

**Tiempo estimado:** 1.5 horas

Este checklist verifica que los Días 1–4 funcionan en conjunto. No es opcional — es el entregable del día.

### Verificación Día 1: GitHub Copilot

```
1. Abre VS Code o Cursor en cualquier archivo del proyecto
2. Escribe un comentario: "// función que valida un email"
3. Espera 2-3 segundos
```

✅ Copilot está funcionando si aparece una sugerencia en gris que puedes aceptar con Tab.

❌ Si no aparece: verifica que el plugin está activo y que estás autenticado con la cuenta que tiene licencia Business.

### Verificación Día 2: GitHub Security

```
1. Ve a github.com/Tenmas-tech-AI/[tu-repo] → pestaña Security
2. Verifica que "Dependabot alerts" muestra el estado (aunque sea 0 alertas)
3. Ve a Settings → Code security → confirma que Secret scanning está activo
```

✅ Security está funcionando si la pestaña Security es visible y Dependabot está habilitado.

### Verificación Día 2: PR-Agent

```
1. Abre cualquier PR en el repo
2. Escribe en un comentario: /review
3. Espera ~1 minuto
```

✅ PR-Agent está funcionando si `github-actions` responde con el **PR Reviewer Guide**.

### Verificación Día 3: n8n

```bash
# Levanta n8n si no está corriendo
docker compose -f infra/n8n/docker-compose.yml up -d

# Verifica que responde
curl -s -o /dev/null -w "%{http_code}" http://localhost:5678
# Debe retornar: 200
```

```
1. Abre http://localhost:5678
2. Abre cualquier workflow creado → click "Test workflow"
3. Verifica que el nodo final muestra output verde
```

✅ n8n está funcionando si el workflow ejecuta sin errores.

### Verificación Día 3: Playwright

```bash
# Corre los tests E2E
npx playwright test --reporter=line
```

```
# Salida esperada:
7 passed (X.Xs)
```

✅ Playwright está funcionando si todos los tests pasan.

❌ Si fallan: verifica que la app está corriendo en el puerto configurado en `playwright.config.ts`.

### Verificación Día 4: LangChain + LangSmith

```bash
# Ejecuta el script del repo
npx tsx scripts/ai/pr-reviewer.ts
```

✅ LangChain está funcionando si el agent retorna el análisis del diff de prueba en menos de 30 segundos.

✅ LangSmith está funcionando si la traza aparece en [smith.langchain.com](https://smith.langchain.com) → proyecto configurado en `LANGCHAIN_PROJECT`.

### Verificación de integración: n8n → LangChain

Este es el test de integración más importante. Verifica que n8n puede llamar al agent de LangChain via HTTP.

**1. Expón el agent como endpoint HTTP:**

```typescript
// src/ai/server.ts
import express from "express";
import { reviewPR } from "./pr-reviewer";
import "dotenv/config";

const app = express();
app.use(express.json());

app.post("/review", async (req, res) => {
  try {
    const { diff } = req.body;
    if (!diff) return res.status(400).json({ error: "diff is required" });
    const review = await reviewPR(diff);
    res.json({ review });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.listen(3001, () => console.log("AI server running on :3001"));
```

```bash
npm install express @types/express
npx tsx src/ai/server.ts
```

**2. Prueba el endpoint:**

```bash
curl -X POST http://localhost:3001/review \
  -H "Content-Type: application/json" \
  -d '{"diff": "+ const x = eval(userInput)"}'
```

**3. En n8n, agrega un nodo HTTP Request:**
- Method: `POST`
- URL: `http://host.docker.internal:3001/review`
- Body: `{ "diff": "{{ $json.body.pull_request.diff_url }}" }`

✅ La integración funciona si n8n recibe la respuesta del agent y la puede usar en el siguiente nodo.

---

## Checklist del Día 4 — Stack completo Días 1–4


Al terminar, marca cada item. Si alguno falla, no avances al Día 5.

**Día 1 — GitHub Copilot:**
- [ ] Copilot genera sugerencias de código en el IDE
- [ ] La cuenta Business está activa (no individual)

**Día 2 — GitHub Security:**
- [ ] Dependabot alerts activado en los repos de Tenmás
- [ ] Secret scanning activado
- [ ] PR-Agent comenta automáticamente en PRs con `/review`

**Día 3 — n8n:**
- [ ] n8n corre en `http://localhost:5678`
- [ ] Al menos 1 workflow ejecuta sin errores
- [ ] Webhook de GitHub configurado

**Día 3 — Playwright:**
- [ ] `npx playwright test` retorna todos los tests en verde
- [ ] El GitHub Action de Playwright pasa en el PR

**Día 4 — LangChain:**
- [ ] `ANTHROPIC_API_KEY` o `OPENAI_API_KEY` cargada correctamente
- [ ] El agent de PR Reviewer ejecuta y retorna respuesta coherente (`npx tsx scripts/ai/pr-reviewer.ts`)
- [ ] El endpoint HTTP del agent responde en `localhost:3001`

**Día 4 — LangSmith:**
- [ ] Cuenta creada en [smith.langchain.com](https://smith.langchain.com)
- [ ] `LANGCHAIN_TRACING_V2=true` y `LANGCHAIN_API_KEY` en el `.env`
- [ ] Las trazas aparecen en el dashboard después de ejecutar el script

**Integración:**
- [ ] n8n puede llamar al agent de LangChain via HTTP Request
- [ ] LangSmith registra las trazas de cada ejecución del agent
- [ ] No hay errores de autenticación entre servicios

---

## Recursos

- [LangChain JS Docs](https://js.langchain.com/docs/)
- [LangChain Python Docs](https://python.langchain.com/docs/)
- [@langchain/anthropic](https://www.npmjs.com/package/@langchain/anthropic)
- [LangChain — Expression Language (LCEL)](https://js.langchain.com/docs/concepts/lcel)
- [LangSmith](https://smith.langchain.com) — dashboard de observabilidad
- [LangSmith Docs](https://docs.smith.langchain.com/)
- [PromptLayer + LangChain](https://docs.promptlayer.com/languages/python#langchain)

➡️ **Siguiente:** Día 5 — Grafana + Métricas baseline (próximamente)
