import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import HomepageFeatures from '../components/HomepageFeatures';
import Sponsors from '../components/Sponsors';
import Testimonials from '../components/Testimonials';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="docs/tutorials/first_test">
            Write Your First Serenity BDD Test in under 10 min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome`}
      description="Serenity BDD is a modern automated test framework that makes writing high quality acceptance tests easier and faster">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        {/* <Testimonials /> */}
        <Sponsors />
        
      </main>
    </Layout>
  );
}
