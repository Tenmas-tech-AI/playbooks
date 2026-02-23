---
sidebar_position: 2
title: "Día 1: Cursor AI + CodeRabbit"
---

# Día 1: Cursor AI + CodeRabbit

**Duración:** ~5 horas | **Estado:** ✅ Completo

## Objetivo del día

Al terminar este día debes tener:
- Cursor AI instalado, configurado con Claude Sonnet 4.6 y funcionando como tu editor principal
- CodeRabbit activo en el repositorio de Tenmás y tu primer PR revieweado automáticamente
- Un flujo de trabajo claro: cuándo usar `Cmd+K`, cuándo usar `Cmd+L`, cuándo usar Composer

---

## Parte 1: Cursor AI

### Instalación

1. Descarga Cursor desde [cursor.sh](https://cursor.sh)
2. Instala y abre la aplicación
3. En el primer inicio: **Sign in with GitHub** (usa tu cuenta del equipo de Tenmás)

```bash
# Verifica que está instalado correctamente
cursor --version
```

### Configuración del modelo

En Cursor, ve a **Settings → Models** y configura:

| Setting | Valor |
|---------|-------|
| Primary model | `claude-sonnet-4-6` |
| Fast model | `claude-haiku-4-5-20251001` |

:::tip
No necesitas configurar una API key. Cursor incluye acceso directo a Claude Sonnet 4.6 y otros modelos dentro de la suscripción. Solo inicia sesión con tu cuenta del equipo y los modelos ya están disponibles.
:::

### Importar configuración de VS Code

Si venías usando VS Code:

1. `Cmd+Shift+P` → escribe `Import VS Code Settings`
2. Cursor importa extensiones, keybindings y snippets automáticamente
3. Verifica que tus extensiones críticas estén instaladas en la pestaña Extensions

:::warning
Algunas extensiones de VS Code no tienen versión para Cursor todavía. Si alguna no aparece, búscala manualmente en el marketplace de Cursor.
:::

---

### Los 3 modos de Cursor — cuándo usar cada uno

Este es el punto donde más se confunde el equipo al principio. Cursor tiene 3 formas de interactuar con la IA y cada una tiene su caso de uso:

#### Modo 1: Inline Edit — `Cmd+K`
**Úsalo cuando:** quieres modificar código que ya tienes seleccionado.

```
Seleccionas código → Cmd+K → escribes instrucción → IA edita in situ
```

Ejemplos de cuándo usarlo:
- Refactorizar una función específica
- Agregar manejo de errores a un bloque existente
- Convertir código a un patrón diferente (ej: callbacks → async/await)
- Agregar tipos TypeScript a funciones sin tipos

#### Modo 2: Chat — `Cmd+L`
**Úsalo cuando:** necesitas hacer preguntas, pedir explicaciones o generar código nuevo con contexto del archivo.

```
Cmd+L → chat abre con contexto del archivo actual → haces preguntas o pides código
```

Ejemplos de cuándo usarlo:
- "¿Qué hace esta clase y cuáles son sus responsabilidades?"
- "¿Hay algún problema de seguridad en este endpoint?"
- "Genera una función que consuma esta interfaz que ya existe"
- Debugging: "¿Por qué este código podría fallar con inputs undefined?"

#### Modo 3: Composer — `Cmd+I`
**Úsalo cuando:** el cambio afecta múltiples archivos o necesitas crear features completos.

```
Cmd+I → Composer abre → describes el feature completo → IA propone cambios en varios archivos
```

Ejemplos de cuándo usarlo:
- "Crea un nuevo endpoint REST con su controlador, servicio y tests"
- "Refactoriza esta función y actualiza todos los lugares que la usan"
- "Agrega autenticación JWT a estos 3 endpoints"

:::info Regla práctica
Si el cambio es en **1 lugar** → `Cmd+K`. Si necesitas **contexto o pregunta** → `Cmd+L`. Si el cambio toca **varios archivos** → `Cmd+I`.
:::

---

### Cómo escribir buenos prompts en Cursor

La calidad del output de la IA depende directamente de la calidad del prompt. Aquí los patrones que funcionan en Tenmás:

#### Estructura de un buen prompt

```
[CONTEXTO] + [QUÉ QUIERES] + [RESTRICCIONES/CÓMO]
```

#### Ejemplos reales — del malo al bueno

**Caso 1: Agregar validación**

❌ Mal:
```
valida los inputs
```

✅ Bien:
```
Esta función recibe email y password desde un form de login.
Agrega validación: email debe ser formato válido, password mínimo 8 caracteres,
ambos obligatorios. Si falla la validación, lanza un ValidationError con mensaje
específico por campo. No uses librerías externas.
```

---

**Caso 2: Crear un servicio**

❌ Mal:
```
crea un servicio para usuarios
```

✅ Bien:
```
Crea un UserService en TypeScript que use el UserRepository que ya existe en
./repositories/user.repository.ts. El servicio debe tener: getUserById(id: string),
updateUser(id: string, data: Partial<User>), y deleteUser(id: string).
Todos los métodos deben ser async y lanzar NotFoundError si el usuario no existe.
Sigue el mismo patrón que AuthService en ./services/auth.service.ts.
```

---

**Caso 3: Debugging**

❌ Mal:
```
¿por qué no funciona?
```

✅ Bien:
```
Este endpoint devuelve 500 cuando el userId es undefined. El error en los logs es:
"Cannot read properties of undefined (reading 'id')". Analiza el código y dime
dónde exactamente falla y cómo arreglarlo sin romper los tests existentes.
```

---

**Caso 4: Refactoring**

❌ Mal:
```
mejora este código
```

✅ Bien:
```
Refactoriza esta función para que:
1. Use el patrón early return en vez de if-else anidados
2. Extraiga la lógica de validación a una función separada llamada validateOrderData
3. Mantenga exactamente el mismo comportamiento externo (no cambies la firma)
4. Agregue comentarios JSDoc a las funciones nuevas
```

---

### Anti-patrones: lo que NO debes hacer con Cursor

:::danger Errores comunes del equipo
**1. Aceptar sin leer**
Nunca presiones Tab en sugerencias largas sin leer qué hace el código. La IA puede introducir bugs sutiles o usar patrones que no son los de Tenmás.

**2. Prompts vagos para código crítico**
Para código de negocio crítico (pagos, autenticación, datos de usuario), sé extremadamente específico en el prompt. La IA no conoce tus reglas de negocio.

**3. Usar Cursor para código que ya tienes probado**
Si tienes código funcionando y con tests, no lo refactorices con IA solo por hacerlo. El riesgo no vale la pena.

**4. No dar contexto del codebase**
Si pides algo que depende de otros archivos, primero agrégalos al contexto del chat con `@filename` antes de hacer la pregunta.
:::

### Cómo agregar contexto con @

En el chat de Cursor, puedes referenciar archivos, carpetas y docs:

| Syntax | Qué hace |
|--------|----------|
| `@nombrearchivo.ts` | Agrega un archivo específico al contexto |
| `@src/services/` | Agrega toda una carpeta |
| `@docs` | Agrega la documentación del proyecto |
| `@git` | Agrega el diff actual de git |
| `@web` | Permite que Cursor busque en internet |

**Ejemplo de uso:**
```
@user.service.ts @user.repository.ts

Basándote en el servicio y repositorio de usuarios que ya existen,
crea un UserController con los mismos endpoints pero que valide
los permisos antes de ejecutar cada operación.
```

---

## Parte 2: CodeRabbit

:::warning Costo en organizaciones
CodeRabbit es gratuito para repositorios públicos, pero **para organizaciones privadas tiene un costo por seat** (~$15/mes por usuario). Si el equipo crece o no se quiere asumir ese costo, la alternativa recomendada es **PR-Agent** (ver [Parte 3](#parte-3-pr-agent-alternativa-gratuita-a-coderabbit)).

En Tenmás usamos CodeRabbit mientras el costo sea razonable. Si en algún momento se decide migrar, PR-Agent ya está configurado en la organización.
:::

### ¿Qué hace CodeRabbit exactamente?

CodeRabbit es un reviewer de código con IA que corre automáticamente en cada PR. Esto es lo que produce:

**1. Resumen del PR** (siempre, al inicio)
```
This PR adds user authentication with JWT tokens. Changes include:
- New AuthService with login/logout methods
- JWT middleware for protected routes
- Updated user model with password hashing
- 12 new tests covering auth flows

Potential concerns: password hashing uses bcrypt with cost factor 10,
consider increasing to 12 for production.
```

**2. Review por archivo** — comentarios inline como cualquier reviewer humano.

**3. Suggestions aplicables** — código que puedes aplicar con un click:

```diff
- const user = await User.findById(id)
+ const user = await User.findById(id).lean()
// Suggestion: Use .lean() for read-only operations to improve performance
```

**4. Walkthrough** — explicación en lenguaje natural de qué cambió y por qué.

### Conectar al repositorio de Tenmás

1. Ve a [coderabbit.ai](https://coderabbit.ai)
2. **Sign in with GitHub** → autoriza acceso a la organización de Tenmás
3. En el dashboard, selecciona el repositorio
4. CodeRabbit queda activo automáticamente en cada PR nuevo

### Configuración estándar de Tenmás

Crea `.coderabbit.yaml` en la **raíz de cada repositorio** de Tenmás:

```yaml
# .coderabbit.yaml — Configuración estándar Tenmás
# No modifiques esto sin hablar con el Tech Lead
language: "es-ES"

reviews:
  profile: "assertive"
  request_changes_workflow: false
  high_level_summary: true
  poem: false
  review_status: true
  collapse_walkthrough: false
  auto_review:
    enabled: true
    drafts: false
  path_filters:
    - "!**/*.lock"
    - "!**/node_modules/**"
    - "!**/*.min.js"
    - "!**/dist/**"
    - "!**/*.generated.ts"

chat:
  auto_reply: true
```

:::info ¿Por qué `assertive` y no `chill`?
`assertive` produce reviews más detallados y señala más problemas. En Tenmás queremos un reviewer exigente. Si al principio el volumen de comentarios te abruma, puedes temporalmente cambiar a `chill`, pero el estándar del equipo es `assertive`.
:::

### Flujo de trabajo completo con CodeRabbit

```
Developer                    GitHub                   CodeRabbit
    │                          │                          │
    ├──── git push ──────────► │                          │
    ├──── Abre PR ───────────► │                          │
    │                          ├──── Trigger ───────────► │
    │                          │                    (analiza código)
    │                          │ ◄── Review (~2 min) ─── │
    │ ◄── Notificación ─────── │                          │
    │                          │                          │
    ├── Lee resumen y comments  │                          │
    ├── Aplica suggestions ───► │                          │
    ├── Responde a CodeRabbit ► │ ──── Re-review ────────► │
    │                          │                          │
    ├── Pide review humano ───► │                          │
    ├── Human aprueba ────────► │                          │
    └──── Merge ──────────────► │                          │
```

### Cómo interactuar con CodeRabbit en un PR

CodeRabbit tiene un chat dentro del PR. Puedes preguntarle cosas directamente:

```
@coderabbitai ¿Por qué marcaste este código como problema de seguridad?
Entiendo que la variable está expuesta, pero en este caso es intencional
porque es un endpoint público.
```

CodeRabbit responde, actualiza su análisis y puede marcar el comentario como resuelto.

**Comandos útiles en el chat:**
- `@coderabbitai review` — fuerza un nuevo review
- `@coderabbitai summary` — regenera el resumen del PR
- `@coderabbitai ignore this file` — ignora un archivo en el review actual
- `@coderabbitai resolve` — marca todos los comentarios como resueltos

### Qué hacer cuando CodeRabbit señala un falso positivo

No todos los comentarios de CodeRabbit son problemas reales. Cuando encuentres un falso positivo:

1. **Responde en el comentario** explicando por qué es intencional
2. **Agrega un comentario en el código** para dejar contexto a futuros reviewers
3. **Si pasa seguido** para el mismo patrón, agrégalo a `path_filters` o crea una regla en `.coderabbit.yaml`

```yaml
# Ejemplo: ignorar un patrón específico
reviews:
  path_instructions:
    - path: "src/scripts/**"
      instructions: "These are one-off migration scripts. Focus only on data safety issues, not code style."
```

---

## Parte 3: PR-Agent — Alternativa gratuita a CodeRabbit

:::note Estado en Tenmás
PR-Agent ya está configurado en la organización de Tenmás. El secret de API y el reusable workflow en el repo `.github` ya existen. Solo necesitas agregar el workflow a tu repositorio.
:::

### ¿Por qué PR-Agent?

PR-Agent es open source y produce reviews similares a CodeRabbit. La diferencia clave es que usas tu propia API key — pagas directamente a OpenAI o Anthropic, sin intermediarios ni seats.

| | CodeRabbit | PR-Agent |
|---|---|---|
| Precio | ~$15/seat/mes (orgs privadas) | Solo el costo de la API |
| Costo por PR | Incluido | ~$0.01–0.05 con Claude Haiku 4.5 |
| Multi-lenguaje | Sí | Sí |
| Comentarios en PRs | Sí | Sí |
| Open source | No | Sí |

### Cómo funciona en Tenmás (Reusable Workflow)

El workflow está definido una sola vez en el repo `.github` de la organización. Cada repo solo necesita un archivo pequeño que lo llama.

**Lo que ya existe en la org:**
- Repo `Tenmas-tech-AI/.github` con el workflow reutilizable
- Secret `ANTHROPIC_API_KEY` configurado a nivel de organización

**Lo que debes hacer tú — agregar este archivo a tu repo:**

```
.github/
└── workflows/
    └── pr-agent.yml
```

```yaml
name: PR Agent

on:
  pull_request:
    types: [opened, reopened, synchronize]
  issue_comment:
    types: [created]

jobs:
  pr_agent:
    runs-on: ubuntu-latest
    permissions:
      issues: write
      pull-requests: write
      contents: read
    steps:
      - uses: Codium-ai/pr-agent@v0.26
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          ANTHROPIC.KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          config.model: "anthropic/claude-haiku-4-5-20251001"
          config.fallback_models: '["anthropic/claude-haiku-4-5-20251001"]'
          github_action_config.auto_review: "true"
          github_action_config.auto_describe: "false"
          github_action_config.auto_improve: "false"
```

Con esto, cada PR abrirá automáticamente un review de PR-Agent.

### Comandos disponibles en el PR

PR-Agent responde a comandos en los comentarios:

| Comando | Qué hace |
|---|---|
| `/review` | Fuerza un nuevo review completo |
| `/describe` | Regenera el resumen del PR |
| `/improve` | Sugiere mejoras de código |
| `/ask ¿pregunta?` | Pregunta sobre el código del PR |

**Ejemplo:**
```
/ask ¿Hay algún problema de seguridad en los cambios de autenticación?
```

---

## Ejercicios del Día 1

### Ejercicio 1: Los 3 modos de Cursor (30 min)

Abre un proyecto real de Tenmás y practica cada modo:

**Parte A — `Cmd+K` (Inline Edit)**
1. Busca una función sin tipos TypeScript
2. Selecciónala completa
3. `Cmd+K` → `"Agrega tipos TypeScript estrictos a todos los parámetros y al tipo de retorno"`
4. Acepta si es correcto, modifica si falta algo

**Parte B — `Cmd+L` (Chat)**
1. Abre el archivo más complejo del proyecto
2. `Cmd+L` → `"Analiza esta clase completa. ¿Tiene problemas de SOLID? ¿Hay responsabilidades mezcladas?"`
3. Haz al menos 2 preguntas de seguimiento

**Parte C — `Cmd+I` (Composer)**
1. `Cmd+I` → describe este task:
   ```
   Crea un archivo de utilidades llamado date.utils.ts en src/utils/ con funciones
   para: formatear fecha a string DD/MM/YYYY, calcular diferencia en días entre
   dos fechas, y verificar si una fecha es fin de semana. Incluye tests unitarios
   en date.utils.test.ts con al menos 3 casos por función.
   ```
2. Revisa todos los archivos que Composer propone crear
3. Acepta los cambios y verifica que los tests corran

### Ejercicio 2: Biblioteca de prompts (20 min)

Crea el archivo `docs/prompts-utiles.md` en el proyecto con al menos 3 prompts que hayas descubierto hoy que funcionan bien. Este archivo se va a compartir con todo el equipo.

Formato sugerido:
```markdown
## Nombre del prompt

**Cuándo usarlo:** ...
**Prompt:**
\```
...
\```
**Resultado esperado:** ...
```

### Ejercicio 3: Primer PR con CodeRabbit (30 min)

1. Crea una branch: `git checkout -b feat/test-coderabbit-[tu-nombre]`
2. Agrega las utilidades de fecha del Ejercicio 1 (o cualquier cambio real)
3. Haz commit con mensaje descriptivo:
   ```bash
   git commit -m "feat: add date utility functions with unit tests"
   ```
4. Abre un PR con título claro y descripción que explique qué hiciste
5. Espera el review de CodeRabbit
6. Lee el walkthrough completo
7. Aplica al menos 1 suggestion de CodeRabbit
8. Responde a al menos 1 comentario de CodeRabbit (aunque sea para decir que es un falso positivo)

---

## Troubleshooting

**Cursor no muestra sugerencias inline**
→ Verifica que `Editor: Inline Suggest` esté habilitado en Settings
→ Asegúrate de que el modelo esté seleccionado en Settings → Models

**El chat de Cursor responde en inglés aunque pides en español**
→ Agrega al inicio del chat: `"Responde siempre en español"` o configura el system prompt en Settings → AI → Rules for AI

**CodeRabbit no apareció en el PR después de 5 minutos**
→ Verifica que la GitHub App de CodeRabbit tenga permisos en el repo
→ Revisa la sección Webhooks del repositorio en GitHub Settings
→ Contacta al Tech Lead para revisar la configuración de la organización

**CodeRabbit da demasiados comentarios en archivos generados**
→ Agrégalos a `path_filters` en `.coderabbit.yaml`:
```yaml
path_filters:
  - "!**/*.generated.ts"
  - "!**/migrations/**"
```

---

## Checklist del Día 1

Al terminar el día, verifica:

- [ ] Cursor AI instalado y abriendo proyectos sin errores
- [ ] Modelo configurado: Claude Sonnet 4.6
- [ ] Probé los 3 modos: `Cmd+K`, `Cmd+L`, `Cmd+I`
- [ ] Completé el Ejercicio 1 (A, B y C)
- [ ] Creé `docs/prompts-utiles.md` con mis primeros prompts
- [ ] CodeRabbit conectado al repositorio de Tenmás
- [ ] `.coderabbit.yaml` creado y pusheado al repo
- [ ] Primer PR revieweado por CodeRabbit
- [ ] Apliqué al menos 1 suggestion de CodeRabbit
- [ ] Respondí al menos 1 comentario de CodeRabbit

---

## Recursos

- [Cursor Docs — Getting Started](https://docs.cursor.sh/get-started/migrate-from-vscode)
- [Cursor Docs — AI Features](https://docs.cursor.sh/ai-features)
- [Cursor — Keyboard shortcuts](https://docs.cursor.sh/kbd)
- [CodeRabbit Docs](https://docs.coderabbit.ai)
- [CodeRabbit — Configuration Reference](https://docs.coderabbit.ai/getting-started/configure-coderabbit)
- [Anthropic — Claude para código](https://docs.anthropic.com/en/docs/use-cases/coding)
- [Guía de prompting para ingenieros](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)
