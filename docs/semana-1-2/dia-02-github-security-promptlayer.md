---
sidebar_position: 3
title: "Día 2: GitHub Security + PromptLayer"
---

# Día 2: GitHub Security + PromptLayer

**Duración:** ~3 horas | **Estado:** Pendiente

⬅️ **Anterior:** [Día 1 — Cursor AI + CodeRabbit](./dia-01-cursor-coderabbit)

## Objetivo del día

Al terminar este día debes tener:
- GitHub Security activado en los repos de Tenmás con las features disponibles en el plan gratuito
- PromptLayer configurado para observabilidad de prompts en el tier free
- Claridad sobre qué cubre cada herramienta y sus limitaciones reales

---

## Parte 1: GitHub Security

### Por qué GitHub Security en lugar de SonarQube

SonarQube requiere infraestructura propia (o pagar SonarCloud) y configuración por lenguaje. GitHub Security viene integrado al repositorio, corre en cada PR automáticamente y no requiere nada externo.

Para Tenmás en esta etapa es el shortcut correcto: mismo valor de seguridad, cero overhead de setup.

### Qué está disponible en el plan gratuito

:::warning Repos privados vs públicos
Las features más potentes (Code Scanning con CodeQL) son **gratuitas solo en repos públicos**. Para repos privados se requiere GitHub Advanced Security (pago). En Tenmás trabajamos con repos privados, así que el alcance es el siguiente:
:::

| Feature | Repos privados (free org) | Repos públicos |
|---|---|---|
| **Dependabot alerts** | ✅ Gratis | ✅ Gratis |
| **Dependabot security updates** | ✅ Gratis | ✅ Gratis |
| **Secret scanning (alertas)** | ✅ Gratis | ✅ Gratis |
| **Secret scanning (push protection)** | ❌ Requiere GHAS | ✅ Gratis |
| **Code scanning / CodeQL** | ❌ Requiere GHAS | ✅ Gratis |
| **Security overview dashboard** | ❌ Requiere GHAS | ❌ Requiere GHAS |

**En la práctica para Tenmás (repos privados, free org):**
- Dependabot — activo, detecta vulnerabilidades en dependencias
- Secret scanning — activo, alerta si se sube una API key, token, etc.
- Code scanning (CodeQL) — **no disponible** en repos privados con free plan

:::tip ¿Cuándo vale la pena CodeQL?
Si en el futuro algún repo es público (librerías open source, por ejemplo), CodeQL corre gratis y reemplaza completamente a SonarQube. Para repos privados críticos, evaluar GitHub Advanced Security a ~$49/committer/mes.
:::

---

### Setup: Dependabot

Dependabot alerta cuando una dependencia tiene una vulnerabilidad conocida y puede abrir PRs automáticamente para actualizarla.

:::info Ruta correcta en GitHub
La opción **no está** en Settings → Security → Advanced Security (esa es otra sección). Debes ir a:

**Repo individual:** `github.com/Tenmas-tech-AI/[repo]` → **Settings** → (scroll en el sidebar izquierdo hasta la sección **Security**) → **Code security and analysis**

**Toda la org (recomendado):** `github.com/organizations/Tenmas-tech-AI/settings/security_analysis`
:::

**Activar para toda la org (una sola vez, aplica a todos los repos):**

1. Ve a `github.com/organizations/Tenmas-tech-AI/settings/security_analysis`
2. En la sección **Dependabot**, habilita:
   - **Dependabot alerts** → Enable all
   - **Dependabot security updates** → Enable all

**O activarlo repo por repo:**

1. Ve al repo → **Settings** → sidebar izquierdo → sección **Security** → **Code security and analysis**
2. Habilita:
   - **Dependency graph** → Enable
   - **Dependabot alerts** → Enable
   - **Dependabot security updates** → Enable

#### Configuración de Dependabot (opcional pero recomendada)

Crea `.github/dependabot.yml` en cada repo para controlar frecuencia y agrupación de PRs:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"      # o "pip", "maven", "gradle", etc.
    directory: "/"
    schedule:
      interval: "weekly"          # daily | weekly | monthly
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 5
    groups:
      dev-dependencies:
        dependency-type: "development"
      production-dependencies:
        dependency-type: "production"
```

:::info Multi-lenguaje
Si el repo tiene múltiples lenguajes (ej: Node + Python), agrega un bloque `updates` por cada `package-ecosystem`. Dependabot los maneja de forma independiente.
:::

---

### Setup: Secret Scanning

Secret scanning busca patrones de API keys, tokens y credenciales en cada push y alerta al admin del repo.

**Activar para toda la org:**

1. Ve a `github.com/organizations/Tenmas-tech-AI/settings/security_analysis`
2. En la sección **Secret scanning**, habilita:
   - **Secret scanning** → Enable all

**O repo por repo:**

1. Ve al repo → **Settings** → sidebar izquierdo → sección **Security** → **Code security and analysis**
2. **Secret scanning** → Enable

#### Qué detecta automáticamente

GitHub tiene detectores para más de 200 tipos de secrets: AWS keys, Stripe tokens, API keys de Anthropic, Twilio, SendGrid, GitHub tokens, y muchos más.

Cuando detecta un secret:
1. Notifica al admin del repo por email
2. Opcionalmente notifica al proveedor del secret (ej: GitHub avisa a Stripe para que revoque el token)

#### Excluir archivos del scanning

Si tienes archivos de fixtures o tests con valores falsos que triggean falsos positivos:

```
# .github/secret_scanning.yml
paths-ignore:
  - "tests/fixtures/**"
  - "**/*.test.ts"
  - "docs/**"
```

---

### Flujo de trabajo con GitHub Security

```
Developer                    GitHub                    Tenmás
    │                           │                         │
    ├──── git push ───────────► │                         │
    │                           ├── Secret scanning ──►   │
    │                           ├── Dependabot check ──►  │
    │                           │                         │
    │ ◄── Alerta (si hay) ───── │                         │
    │                           │                         │
    ├── Abre PR ──────────────► │                         │
    │                           ├── PR-Agent review ──►   │
    │                           │   (día 1)               │
    │ ◄── Review comments ───── │                         │
```

---

### Verificar que funciona

Después de activar Dependabot:

1. Ve al repo → **Security** → **Dependabot alerts**
2. Si hay dependencias vulnerables, ya aparecen listadas con severity (Critical/High/Medium/Low)
3. Cada alerta tiene un link a la CVE y el PR automático de fix (si está habilitado)

Para Secret Scanning:
1. Ve al repo → **Security** → **Secret scanning**
2. Si hay secrets detectados en el historial, aparecen aquí

---

## Parte 2: PromptLayer

### ¿Qué es PromptLayer?

PromptLayer es observabilidad para LLMs. Registra cada llamada que tu aplicación hace a la API de Claude (o cualquier otro LLM), con:

- El prompt exacto enviado
- La respuesta recibida
- Tokens usados y costo estimado
- Latencia
- Historial por versión de prompt

Es el equivalente a tener logs de API, pero específico para prompts.

### Limitaciones del tier free

| Límite | Free |
|---|---|
| Requests/mes | 2,500 |
| Usuarios | 5 |
| Prompts guardados | 10 |
| Workspaces | 1 |
| Retención de datos | 30 días |

2,500 requests/mes es suficiente para desarrollo y testing. Para producción con volumen real necesitarías el plan de pago.

---

### Setup (5 minutos)

**1. Crear cuenta**

Ve a [promptlayer.com](https://promptlayer.com) → Sign up (no requiere tarjeta de crédito)

**2. Obtener API key**

En el dashboard → **Settings** → copia tu `PROMPTLAYER_API_KEY`

**3. Agregar al proyecto**

```bash
npm install promptlayer        # Node.js
# o
pip install promptlayer        # Python
```

**4. Integrar con Claude**

La integración es un wrapper alrededor del cliente de Anthropic. No cambia la lógica de tu código:

```typescript
// Sin PromptLayer
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Con PromptLayer
import { PromptLayer } from "promptlayer";
const promptlayer = new PromptLayer({ apiKey: process.env.PROMPTLAYER_API_KEY });
const client = promptlayer.anthropic.Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// El resto del código es idéntico
const response = await client.messages.create({
  model: "claude-haiku-4-5-20251001",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hola" }],
});
```

```python
# Python
from promptlayer import PromptLayer
import os

pl_client = PromptLayer(api_key=os.environ.get("PROMPTLAYER_API_KEY"))
anthropic = pl_client.anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

response = anthropic.messages.create(
    model="claude-haiku-4-5-20251001",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hola"}]
)
```

**5. Agregar los secrets al proyecto**

```bash
# .env
PROMPTLAYER_API_KEY=pl_xxxx
ANTHROPIC_API_KEY=sk-ant-xxxx
```

---

### Qué ver en el dashboard

Después de hacer las primeras llamadas, en el dashboard de PromptLayer verás:

- **Request history** — cada llamada con timestamp, modelo, tokens, costo, latencia
- **Prompt versioning** — guarda versiones de tus prompts y compara resultados
- **Search** — busca por contenido del prompt o respuesta

:::tip Caso de uso principal en Tenmás
El uso más valioso del free tier es durante el desarrollo: ver exactamente qué prompt está enviando tu aplicación y qué está respondiendo Claude, sin tener que agregar `console.log` manualmente. Es el "inspector de red" para LLMs.
:::

---

## Checklist del Día 2

Al terminar el día, verifica:

**GitHub Security:**
- [ ] Dependabot alerts activado en los repos de Tenmás
- [ ] Dependabot security updates activado
- [ ] Secret scanning activado
- [ ] `.github/dependabot.yml` creado con la configuración del equipo
- [ ] Revisé el tab Security del repo y entiendo las alertas existentes

**PromptLayer:**
- [ ] Cuenta creada en promptlayer.com
- [ ] `PROMPTLAYER_API_KEY` guardada (en `.env` local, nunca en el repo)
- [ ] Integración funcionando en al menos un proyecto de prueba
- [ ] Hice al menos una llamada a Claude y la vi aparecer en el dashboard

---

## Recursos

- [GitHub Docs — Dependabot](https://docs.github.com/en/code-security/dependabot)
- [GitHub Docs — Secret scanning](https://docs.github.com/en/code-security/secret-scanning)
- [GitHub Security features por plan](https://docs.github.com/en/get-started/learning-about-github/githubs-plans)
- [PromptLayer Docs](https://docs.promptlayer.com)
- [PromptLayer — Integración con Anthropic](https://docs.promptlayer.com/languages/python#anthropic)
