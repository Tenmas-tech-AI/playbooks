---
sidebar_position: 1
title: Resumen del Plan
---

# Plan Semanas 1–2

## Visión general

10 días de trabajo estructurado para que el equipo de Tenmás adopte el stack AI-Native de forma ordenada. No es un sprint de experimentación — es el programa de adopción oficial con entregables concretos cada día.

Al terminar las 2 semanas, el equipo debe tener:
- El stack completo configurado y en uso
- Quality gates definidos y automatizados
- Playbooks documentados y publicados
- Métricas de productividad corriendo en Grafana

## Cronograma completo

### Semana 1 — Infraestructura AI

| Día | Foco | Herramientas | Estado |
|-----|------|-------------|--------|
| [**Día 1**](./dia-01-cursor-coderabbit) | Editor + Code Review | Cursor AI, CodeRabbit | ✅ Completo |
| [**Día 2**](./dia-02-github-security-promptlayer) | Seguridad + Observabilidad | GitHub Security, PromptLayer | ✅ Completo |
| [**Día 3**](./dia-03-n8n-playwright) | Automatización + Testing | n8n, Playwright | ✅ Completo |
| [**Día 4**](./dia-04-langchain-validacion) | Pipelines de IA + Validación | LangChain, LangSmith | ✅ Completo |
| [**Día 5**](./dia-05-grafana-timescaledb) | Monitoreo | Grafana, TimescaleDB | 🔲 Pendiente |

### Semana 2 — Estándares y Documentación

| Día | Foco | Herramientas | Estado |
|-----|------|-------------|--------|
| Día 6 | Documentación | Docusaurus Setup | 🔲 Pendiente |
| Día 7 | Deploy | Docusaurus CI/CD | 🔲 Pendiente |
| Días 8–9 | Playbook central | Coding Playbook completo | 🔲 Pendiente |
| Día 10 | Cierre | Quality Gates, revisión final | 🔲 Pendiente |

## Formato de cada día

Cada guía de día está estructurada así:

```
Objetivo del día     → ¿Qué vas a lograr exactamente?
Setup               → Instalación y configuración paso a paso
Ejercicios          → Tareas prácticas con instrucciones específicas
Checklist           → Lista de verificación al terminar el día
Recursos            → Links, docs y referencias adicionales
```

## Reglas del programa

:::info Cómo seguir este plan
- **No saltarse días** — cada día construye sobre el anterior
- **Hacer los ejercicios** — leer sin practicar no cuenta
- **Reportar bloqueos** — si algo no funciona, documentarlo en el canal del equipo
- **Actualizar el checklist** — marcar las tareas completadas al final de cada día
:::

## Entregables finales

Al terminar el Día 10, el equipo entrega:

1. **Stack funcionando** — todas las herramientas configuradas y en uso
2. **Playbooks publicados** — coding, debugging, testing y documentation playbooks
3. **Dashboard de métricas** — Grafana corriendo con KPIs reales
4. **Quality gates** — automatizados en CI/CD
5. **Este sitio** — documentación completa en ES y EN
