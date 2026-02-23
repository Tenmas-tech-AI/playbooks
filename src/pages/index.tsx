import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>🚀 AI-Native Development</div>
          <Heading as="h1" className={clsx('hero__title', styles.heroTitle)}>
            Tenmás AI Playbooks
          </Heading>
          <p className={clsx('hero__subtitle', styles.heroSubtitle)}>
            Guías técnicas día a día para dominar el stack de IA.
            Desde Cursor AI hasta LangChain — todo lo que necesitas para
            desarrollar de forma AI-Native.
          </p>
          <div className={styles.buttons}>
            <Link
              className="button button--secondary button--lg"
              to="/docs/semana-1-2/resumen">
              Comenzar — Semanas 1 y 2 →
            </Link>
            <Link
              className={clsx('button button--outline button--lg', styles.buttonOutline)}
              to="/docs/introduccion/stack-tecnico">
              Ver Stack Técnico
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function ProgressSection() {
  const days = [
    { day: '01', title: 'Cursor AI + CodeRabbit', status: 'done', desc: 'Setup inicial y flujo de trabajo con IA', href: '/docs/semana-1-2/dia-01-cursor-coderabbit' },
    { day: '02', title: 'GitHub Security + PromptLayer', status: 'pending', desc: 'Seguridad y observabilidad de prompts', href: null },
    { day: '03', title: 'Make.com + Playwright', status: 'pending', desc: 'Automatización y testing E2E', href: null },
    { day: '04', title: 'LangChain', status: 'pending', desc: 'Cadenas de IA y agentes', href: null },
    { day: '05', title: 'Grafana + Métricas', status: 'pending', desc: 'Monitoreo y dashboards', href: null },
    { day: '06', title: 'Docusaurus Setup', status: 'pending', desc: 'Documentación como código', href: null },
    { day: '07', title: 'Docusaurus Deploy', status: 'pending', desc: 'CI/CD para documentación', href: null },
    { day: '08-09', title: 'Coding Playbook', status: 'pending', desc: 'Playbook principal de desarrollo', href: null },
    { day: '10', title: 'Quality Gates', status: 'pending', desc: 'Umbrales de calidad y métricas finales', href: null },
  ];

  return (
    <section className={styles.progressSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Plan Semanas 1–2</Heading>
          <p>10 días de contenido técnico estructurado para dominar el stack AI-Native</p>
        </div>
        <div className={styles.dayGrid}>
          {days.map(({ day, title, status, desc, href }) => {
            const card = (
              <div className={clsx(styles.dayCard, status === 'done' && styles.dayCardDone, href && styles.dayCardClickable)}>
                <div className={styles.dayNumber}>Día {day}</div>
                <div className={styles.dayStatus}>
                  {status === 'done' ? '✅ Completo' : '🔲 Pendiente'}
                </div>
                <div className={styles.dayTitle}>{title}</div>
                <div className={styles.dayDesc}>{desc}</div>
              </div>
            );
            return href ? (
              <Link key={day} to={href} className={styles.dayCardLink}>{card}</Link>
            ) : (
              <div key={day}>{card}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function QuickStartSection() {
  return (
    <section className={styles.quickStart}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Inicio Rápido</Heading>
          <p>Corre el proyecto localmente en menos de 2 minutos</p>
        </div>
        <div className={styles.codeBlock}>
          <pre className={styles.code}>{`# 1. Ir a la carpeta del proyecto
cd tenmas-ai-playbooks

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm start

# 4. Abrir en el browser: http://localhost:3000`}</pre>
        </div>
        <div className={styles.quickStartActions}>
          <Link className="button button--primary button--lg" to="/docs/introduccion/overview">
            Ver Documentación Completa
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Guías técnicas AI-Native para el equipo de desarrollo Tenmás">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <ProgressSection />
        <QuickStartSection />
      </main>
    </Layout>
  );
}
