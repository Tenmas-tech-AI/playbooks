import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  emoji: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Playbooks por Día',
    emoji: '📅',
    description: (
      <>
        Guías detalladas día a día para las primeras 2 semanas. Desde Cursor AI
        y CodeRabbit hasta LangChain y Grafana. Cada día tiene objetivos claros
        y pasos concretos.
      </>
    ),
  },
  {
    title: 'Stack AI-Native',
    emoji: '🤖',
    description: (
      <>
        Documentación completa del stack técnico: Cursor AI, CodeRabbit,
        PromptLayer, Make.com, Playwright, LangChain, Grafana y más.
        Todo lo que necesitas para desarrollar con IA.
      </>
    ),
  },
  {
    title: 'Métricas y Calidad',
    emoji: '📊',
    description: (
      <>
        Quality gates, métricas de performance y dashboards de monitoreo.
        Aprende a medir el impacto real de las herramientas de IA en tu
        productividad como desarrollador.
      </>
    ),
  },
];

function Feature({title, emoji, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <div className={styles.featureEmoji} role="img" aria-label={title}>
          {emoji}
        </div>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
