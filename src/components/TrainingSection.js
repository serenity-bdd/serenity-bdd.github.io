import React from 'react';
import Link from '@docusaurus/Link';

export default function TrainingSection() {
  const trainingCourses = [
    {
      title: 'Effective Web Test Automation With Serenity BDD And Selenium',
      description: 'Learn how to write high quality, easy to maintain test automation for your web applications with 50% less code using Serenity BDD.',
      link: 'https://www.udemy.com/course/serenity-bdd-web-testing/?couponCode=CM251220G2',
    },
    {
      title: 'The Test Automation Mastery Archives',
      description: 'Hone your Serenity BDD and Automation skills with over 500 hours of expert-led live coding recordings on real-world problems (40% discount, only $21 per month).',
      link: 'https://expansion.serenity-dojo.com/courses/live-sessions?coupon=livesess40',
    },
  ];

  return (
    <section className="training-section">
      <div className="container">
        <h2 className="training-section__title">Serenity BDD Training</h2>
        <div className="training-section__courses">
          {trainingCourses.map((course, idx) => (
            <div key={idx} className="training-course">
              <h3 className="training-course__title">{course.title}</h3>
              <p className="training-course__description">{course.description}</p>
              <Link
                className="button button--primary button--lg training-course__button"
                to={course.link}>
                Learn More
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
