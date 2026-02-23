---
sidebar_position: 3
title: Stack Técnico
---

# Stack Técnico AI-Native

Este es el stack oficial de herramientas de IA de Tenmás. No es una lista de sugerencias — es el estándar del equipo. Cada herramienta tiene un rol específico y fue elegida después de evaluar alternativas.

## Mapa del stack

```
┌──────────────────────────────────────────────────────────┐
│                      DESARROLLO                          │
│   Cursor AI (editor)       CodeRabbit (code review)     │
├──────────────────────────────────────────────────────────┤
│                   OBSERVABILIDAD                         │
│   PromptLayer (tracking LLMs)    Grafana (métricas)     │
├──────────────────────────────────────────────────────────┤
│                  AUTOMATIZACIÓN                          │
│    Make.com (workflows)     Playwright (testing E2E)    │
├──────────────────────────────────────────────────────────┤
│                    BACKEND IA                            │
│           LangChain (pipelines y agentes)               │
├──────────────────────────────────────────────────────────┤
│                   DOCUMENTACIÓN                          │
│         Docusaurus (este sitio — en ES y EN)            │
└──────────────────────────────────────────────────────────┘
```

## Herramientas en detalle

### Editor & AI Coding

| Herramienta | Rol en Tenmás | Setup |
|-------------|---------------|-------|
| **Cursor AI** | Editor principal con IA embebida. Reemplaza VS Code para todo el equipo. Usa Claude Sonnet 4.6 por defecto. | Día 1 |
| **CodeRabbit** | Review automático de cada PR. Detecta bugs, code smells y problemas de seguridad antes que el revisor humano. | Día 1 |

### Observabilidad de IA

| Herramienta | Rol en Tenmás | Setup |
|-------------|---------------|-------|
| **PromptLayer** | Registra cada llamada a LLM: prompt enviado, respuesta recibida, costo y latencia. Permite auditar y optimizar el uso de IA en producción. | Día 2 |
| **Grafana** | Dashboards con métricas reales de productividad del equipo y performance de los modelos de IA. | Día 5 |

### Automatización & Testing

| Herramienta | Rol en Tenmás | Setup |
|-------------|---------------|-------|
| **Make.com** | Automatiza workflows repetitivos: notificaciones, sincronización de datos, triggers entre servicios. | Día 3 |
| **Playwright** | Testing E2E obligatorio para features críticos. Se ejecuta en CI antes de cada merge. | Día 3 |

### Pipelines de IA

| Herramienta | Rol en Tenmás | Setup |
|-------------|---------------|-------|
| **LangChain** | Framework para construir aplicaciones con LLMs: cadenas de razonamiento, agentes autónomos y RAG (Retrieval-Augmented Generation). | Día 4 |

### Documentación

| Herramienta | Rol en Tenmás | Setup |
|-------------|---------------|-------|
| **Docusaurus** | Este sitio. Documentación técnica versionada, en español e inglés, con búsqueda integrada y deploy automático. | Días 6–7 |

---

## Modelos de IA que usamos

Tenmás usa la familia **Claude 4** de Anthropic como estándar. No uses versiones anteriores en proyectos nuevos.

| Modelo | ID de API | Cuándo usarlo | Costo relativo |
|--------|-----------|--------------|----------------|
| **Claude Sonnet 4.6** | `claude-sonnet-4-6` | Coding diario, análisis de código, code review, tasks complejos | ⚡ Balanceado |
| **Claude Haiku 4.5** | `claude-haiku-4-5-20251001` | Clasificación, respuestas cortas, pipelines de alto volumen | 💚 El más barato |
| **Claude Opus 4.6** | `claude-opus-4-6` | Arquitectura, razonamiento complejo, decisiones críticas | 🔴 El más caro |
| **GPT-4o** | — | Backup cuando Claude no disponible | — |
| **Llama 3 (local via Ollama)** | — | Datos que no pueden salir de la empresa | 💚 Gratis |

### Cuándo usar cada modelo — ejemplos concretos

**Usa Claude Sonnet 4.6 para:**
- Escribir código en Cursor (default)
- Generar tests unitarios
- Hacer code review asistido
- Responder preguntas sobre el codebase
- Tareas de documentación

**Usa Claude Haiku 4.5 para:**
- Clasificar categorías de tickets/issues
- Generar resúmenes cortos de PRs en pipelines automatizados
- Respuestas de chatbot donde latencia < calidad
- Pipelines que procesan cientos de requests por hora

**Usa Claude Opus 4.6 para:**
- Diseño de arquitectura de sistemas
- Análisis de seguridad profundo de código crítico
- Decisiones de refactoring de alto impacto
- Cuando Sonnet no produce el output esperado después de 2–3 intentos

:::tip Empieza siempre con Sonnet
Si no sabes cuál usar, usa Sonnet 4.6. Solo escala a Opus si necesitas más capacidad de razonamiento, y solo baja a Haiku si el costo o la latencia son un problema real.
:::

---

## Reglas del stack

:::warning Reglas no negociables
1. **Cursor AI es el editor estándar** — no VS Code, no Zed, no Neovim para trabajo del equipo durante el programa
2. **Ningún PR se mergea sin CodeRabbit** — es parte del flujo de CI, no opcional
3. **PromptLayer registra toda llamada a LLM en producción** — si usas un LLM en prod, va con tracking
4. **Playwright es obligatorio** para cualquier feature crítico de negocio
5. **No uses Claude 3.x en proyectos nuevos** — la familia Claude 4 está disponible y es superior
:::

---

## Preguntas frecuentes del stack

**¿Puedo usar GitHub Copilot además de Cursor?**
No durante las 2 semanas del programa. Queremos que el equipo aprenda profundamente Cursor antes de mezclar herramientas. Después del programa, habla con el Tech Lead.

**¿Puedo usar ChatGPT para tareas rápidas?**
Para tareas personales de aprendizaje, sí. Para código que va al repositorio, no — usa Cursor con Claude Sonnet 4.6 para que el contexto del codebase esté disponible y el prompt quede registrado.

**¿Qué pasa si Cursor está caído?**
Usa VS Code temporalmente. Si la caída dura más de 30 minutos, reporta al Tech Lead. No uses otras alternativas de IA sin aprobación.

**¿Tengo que pagar Cursor Pro de mi bolsillo?**
No. Tenmás cubre las licencias. Pide acceso al Tech Lead en el canal del equipo.

---

## Principios de selección

¿Por qué estas herramientas y no otras? Evaluamos cada una con estos criterios:

1. **Integración** — ¿Se conecta bien con el resto del stack?
2. **Observabilidad** — ¿Podemos ver qué hace y medir su impacto?
3. **Costo** — ¿El ROI justifica el precio?
4. **Curva de aprendizaje** — ¿Un nuevo ingeniero puede usarlo en un día?
5. **Soporte y comunidad** — ¿Tiene documentación activa y respaldo a largo plazo?
