import React from 'react';
import clsx from 'clsx';
import styles from './Testimonials.module.css';

const TestimonialList = [
  {
    title: 'Andreas Worm',
    photo: 'img/testimonials/andreas-worm.jpeg',
    quote: 'Serenity BDD magically solved some big issues I had with plain webdriver scripts',
    description: 'Serenity BDD magically solved some big issues I had with plain webdriver scripts: managing multiple users interacting with each other. Not only did the framework allow me to keep track of these different users and their test data, it also made it very easy to incorporate various interfaces which transformed my scripts from "use the browser for everything" to "mix and match http requests, database transactions, mail client actions, ..." whatever is most convenient to reach the goal. Serenity BDD with the screenplay pattern enabled me to create readable test scripts that can be easily understood by business stakeholders without programming background. You don\'t even have to use Cucumber, just looking at the source code was sufficient because the pattern of actors performing tasks and seeing results is so relatable and Serenity gets very close to scripts being like plain english.'
  },
  {
    title: 'Joe Colantonio',
    photo: 'img/testimonials/joe-colantonio.jpeg',
    quote: 'My favorite Java test automation framework!',
    description: 'One area my teams have struggled with is writing their BDD G/W/T .feature files at the right level. Because we work on medical devices, many engineers were writing their BDD at a really low implementation detail level. Writing BDD in this “imperative steps” style is an anti-pattern and goes against the whole purpose of creating scenarios in the “as a user,” So I was coaching them to create their G/W/T at a more abstract-level, non implementation — like using a more declarative approach. This was an ongoing struggle last year using just jBehave. Fortunately Serenity (formally Thucydides) has an extra annotation @step. Used correctly, this allows us to now create higher-level BDD statements without worrying about low-level detail at the G/W/T level. Also, the @step details are written to the report so the implementation details are still captured, but our scenarios are kept implementation free — a true win/win!'
  },
  {
    title: 'Theodor Radu',
    photo: 'img/testimonials/theodor-radu.jpeg',
    quote: 'An oasis of serenity amidst the bustling development process',
    description: 'Rarely you see a more lightweight, yet so powerful testing solution. Serenity is not just another testing solution, it’s the testing solution of our choice and we are really excited about using it in our daily work. Many solutions on the market, offering less capabilities and being way more complex to use, cost testing budgets more than a decent amount of money. Have I forgot to mention we got all above features as a free, open source project? Truly amazing. Thank you John, for giving us Serenity!'
  },
];

function Testimonial({ title, photo, quote, description }) {
  return (
    <div class="card">
      <img class="card-img-top" src="{photo}" alt="Card image cap" />
      <div class="card-body">
        <h5 class="card-title">{title}</h5>
        <p class="card-text">{quote}</p>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className={styles.features}>
      <h2 className={styles.sponsorsTitle}>Loved by Test Automation Engineers Around The World</h2>
      <div className="container">
        {TestimonialList.map((props, idx) => (
          <Testimonial key={idx} {...props} />
        ))}
      </div>
    </section>
  );
}
