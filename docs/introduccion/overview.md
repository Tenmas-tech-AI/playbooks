---
sidebar_position: 1
title: Overview
---

# Tenmás AI Playbooks

Bienvenido a la documentación oficial de estándares de IA para el equipo de ingeniería de **Tenmás**.

## ¿Por qué existe este playbook?

La IA está redefiniendo cómo se escribe, revisa y mantiene el software. En Tenmás no queremos quedarnos atrás — queremos estar en la **vanguardia**. Este playbook existe para que todos los ingenieros del equipo trabajen con IA de la misma forma: con criterio, con estándares y con resultados medibles.

No se trata de usar ChatGPT para autocompletar código. Se trata de integrar IA en cada etapa del ciclo de desarrollo: diseño, codificación, review, testing, documentación y monitoreo.

## ¿Para quién es?

| Rol | Cómo usar este playbook |
|-----|------------------------|
| **Desarrolladores** | Guías día a día, setup de herramientas, prompts recomendados |
| **Tech Leads** | Estándares de calidad, quality gates, métricas de productividad |
| **Nuevos integrantes** | Onboarding completo al stack AI-Native de Tenmás |

## Principios del equipo

### 1. IA como copiloto, no como piloto
La IA acelera tu trabajo, pero tú eres responsable del código. Siempre revisa, entiende y valida lo que genera la IA antes de mergear.

### 2. Observabilidad primero
Cada llamada a un LLM se registra. Usamos PromptLayer para auditar qué prompts se usan, cuánto cuestan y qué tan efectivos son.

### 3. Tests antes de merge
El código generado con IA pasa por los mismos quality gates que el código humano. Playwright corre los tests E2E. No hay excepciones.

### 4. Documentación viva
La documentación se actualiza con cada cambio. Este mismo sitio es el estándar — si algo no está aquí, no está definido.

### 5. Métricas reales
Medimos el impacto de la IA en productividad con datos reales de Grafana. Si una herramienta no mueve las métricas, la reemplazamos.

## Estructura del programa

| Semana | Días | Enfoque |
|--------|------|---------|
| Semana 1 | Días 1–5 | Setup del stack base |
| Semana 2 | Días 6–10 | Documentación, playbooks y quality gates |
| Ongoing | — | Playbooks, herramientas y métricas |

## Próximos pasos

→ [Ver objetivos del programa](./objetivos)
→ [Conocer el stack técnico](./stack-tecnico)
→ [Ir al plan Semanas 1–2](../semana-1-2/resumen)
