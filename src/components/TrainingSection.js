import React from 'react';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';

export default function TrainingSection() {
  const trainingCourses = [
    {
      titleId: 'training.webAutomation.title',
      title: 'Effective Web Test Automation With Serenity BDD And Selenium',
      descriptionId: 'training.webAutomation.description',
      description: 'Learn how to write high quality, easy to maintain test automation for your web applications with 50% less code using Serenity BDD.',
      link: 'https://www.udemy.com/course/serenity-bdd-web-testing/?couponCode=CM251220G2',
    },
    {
      titleId: 'training.masteryArchives.title',
      title: 'The Test Automation Mastery Archives',
      descriptionId: 'training.masteryArchives.description',
      description: 'Hone your Serenity BDD and Automation skills with over 500 hours of expert-led live coding recordings on real-world problems (40% discount, only $21 per month).',
      link: 'https://expansion.serenity-dojo.com/courses/live-sessions?coupon=livesess40',
    },
  ];

  return (
    <section className="training-section">
      <div className="container">
        <h2 className="training-section__title">
          <Translate id="training.sectionTitle">Serenity BDD Training</Translate>
        </h2>
        <div className="training-section__courses">
          {trainingCourses.map((course, idx) => (
            <div key={idx} className="training-course">
              <h3 className="training-course__title">
                <Translate id={course.titleId}>{course.title}</Translate>
              </h3>
              <p className="training-course__description">
                <Translate id={course.descriptionId}>{course.description}</Translate>
              </p>
              <Link
                className="button button--primary button--lg training-course__button"
                to={course.link}>
                <Translate id="training.learnMore">Learn More</Translate>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
