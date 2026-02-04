import React from 'react';
import clsx from 'clsx';
import Translate from '@docusaurus/Translate';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    titleId: 'features.bringTeam.title',
    title: 'Bring Your Team Together',
    Svg: require('./img/icon_1.svg').default,
    descriptionId: 'features.bringTeam.description',
    description: "Don't be a lonely tester writing scripts in a corner, create test automation frameworks that your whole team enjoys using.",
  },
  {
    titleId: 'features.automateScale.title',
    title: 'Automate At Scale',
    Svg: require('./img/icon_2.svg').default,
    descriptionId: 'features.automateScale.description',
    description: 'Write clean, high quality, easily maintained automation code that scales with your test suite, so that you spend your time writing new scenarios, not fixing existing ones.',
  },
  {
    titleId: 'features.reporting.title',
    title: 'Report What Really Matters',
    Svg: require('./img/icon_3.svg').default,
    descriptionId: 'features.reporting.description',
    description: 'Serenity BDD provides powerful living documentation and test reporting that gives meaningful feedback to testers, business folks, and the team as a whole. Serenity tells you not only what tests have been executed, but more importantly, what requirements have been tested.',
  },
  {
    titleId: 'features.multiPlatform.title',
    title: 'Test UI, API and Mobile',
    Svg: require('./img/icon_4.svg').default,
    descriptionId: 'features.multiPlatform.description',
    description: 'Serenity supports both UI and API testing, and integrates seamlessly with standard industry tools such as Selenium 4 and RestAssured.',
  },
  {
    titleId: 'features.integrate.title',
    title: 'Integrate with your favorite test automation libraries',
    Svg: require('./img/icon_5.svg').default,
    descriptionId: 'features.integrate.description',
    description: 'Automate executable specifications with BDD tools like Cucumber, or write clean and maintainable test code with business-readable reporting in JUnit 4 or 5.',
  },
  {
    titleId: 'features.bestPractices.title',
    title: 'Apply Best Practices',
    Svg: require('./img/icon_6.svg').default,
    descriptionId: 'features.bestPractices.description',
    description: 'Use conventional Page Objects, and reduce the amount of code needed by 50% compared to traditional page object implementations, or try out more modern test automation design patterns such as Action Classes or the Screenplay Pattern, and write scalable, easy to maintain code tailor-fitted to your domain.',
  },
];

function Feature({Svg, titleId, title, descriptionId, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>
          <Translate id={titleId}>{title}</Translate>
        </h3>
        <p>
          <Translate id={descriptionId}>{description}</Translate>
        </p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
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
