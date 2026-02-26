import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Introducción',
      collapsed: false,
      items: [
        'introduccion/overview',
        'introduccion/objetivos',
        'introduccion/stack-tecnico',
      ],
    },
    {
      type: 'category',
      label: 'Semanas 1–2',
      collapsed: false,
      items: [
        'semana-1-2/resumen',
        'semana-1-2/dia-01-cursor-coderabbit',
        'semana-1-2/dia-02-github-security-promptlayer',
        'semana-1-2/dia-03-n8n-playwright',
        'semana-1-2/dia-04-langchain-validacion',
      ],
    },
    {
      type: 'category',
      label: 'Playbooks',
      collapsed: true,
      items: [],
      link: {
        type: 'generated-index',
        description: 'Playbooks reutilizables para el equipo.',
      },
    },
    {
      type: 'category',
      label: 'Herramientas',
      collapsed: true,
      items: [],
      link: {
        type: 'generated-index',
        description: 'Documentación de cada herramienta del stack.',
      },
    },
    {
      type: 'category',
      label: 'Métricas',
      collapsed: true,
      items: [],
      link: {
        type: 'generated-index',
        description: 'Quality gates y dashboards de monitoreo.',
      },
    },
    {
      type: 'category',
      label: 'Recursos',
      collapsed: true,
      items: [],
      link: {
        type: 'generated-index',
        description: 'FAQ, troubleshooting y glosario.',
      },
    },
  ],
};

export default sidebars;
