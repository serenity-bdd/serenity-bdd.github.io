import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import CodeBlock from '@theme/CodeBlock';
import styles from './AiSection.module.css';

const INSTALL = `/plugin marketplace add serenity-bdd/serenity-ai
/plugin install serenity-bdd@serenity`;

const points = [
  {
    titleId: 'ai.skill.title',
    title: 'A skill and a review agent for Claude Code',
    descriptionId: 'ai.skill.description',
    description: 'Ask for a Serenity test and the assistant picks the style you use, or asks you which one you want: Page Objects, Screenplay or Cucumber, with Selenium, Playwright or REST. A read-only review agent then checks that the new tests read as business-level living documentation.',
  },
  {
    titleId: 'ai.anyAssistant.title',
    title: 'Works with any assistant',
    descriptionId: 'ai.anyAssistant.description',
    description: 'Point your assistant at llms.txt, or copy an AGENTS.md for your style into your project so it stays in that style. The documentation pages are also available as plain markdown.',
  },
  {
    titleId: 'ai.verified.title',
    title: 'Checked, not guessed',
    descriptionId: 'ai.verified.description',
    description: 'The class and method names in the guidance are checked against the released jars, and the examples are compiled and run on every release. Assistants read test results from the JSON files Serenity writes, not by scraping the HTML report.',
  },
];

export default function AiSection() {
  return (
    <section className={styles.ai}>
      <div className="container">
        <h2 className={styles.title}>
          <Translate id="ai.sectionTitle">Built for AI-assisted testing</Translate>
        </h2>
        <p className={styles.lead}>
          <Translate id="ai.lead">
            AI coding assistants write Serenity tests quickly, and often get the packages and APIs wrong. Serenity BDD now ships current, verified guidance for them, so the tests they write compile, run and make good living documentation.
          </Translate>
        </p>
        <div className="row">
          {points.map((p, idx) => (
            <div key={idx} className={clsx('col col--4', styles.point)}>
              <h3>
                <Translate id={p.titleId}>{p.title}</Translate>
              </h3>
              <p>
                <Translate id={p.descriptionId}>{p.description}</Translate>
              </p>
            </div>
          ))}
        </div>
        <div className={styles.install}>
          <p className={styles.installLabel}>
            <Translate id="ai.install">Install the plugin in Claude Code:</Translate>
          </p>
          <CodeBlock language="text">{INSTALL}</CodeBlock>
        </div>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/ai/ai_using_assistants">
            <Translate id="ai.cta.guide">Using Serenity BDD with AI assistants</Translate>
          </Link>
          <Link className="button button--secondary button--lg" to="https://github.com/serenity-bdd/serenity-ai">
            <Translate id="ai.cta.plugin">Get the plugin</Translate>
          </Link>
          <Link className="button button--secondary button--lg" to="https://serenity-bdd.github.io/llms.txt">
            llms.txt
          </Link>
        </div>
      </div>
    </section>
  );
}
