---
sidebar_position: 6
---

# Three Strategies to Optimize Your Serenity BDD Reports

Serenity BDD stands out for its ability to produce detailed and informative reports. These reports offer insights not just on executed tests, but also on the fulfillment of business requirements. But like all tools, getting the most out of Serenity BDD involves a few tweaks and optimizations.

Here are three strategies to make your Serenity BDD reports more efficient:

1. **Stay Updated!**

   Ensure you're working with the latest version of Serenity BDD, ideally 4.0.12 or newer. With each update, you'll find several optimizations to enhance report performance and minimize generated files. For instance, standard report generation in version 4.0.11 is up to 10 times faster than in 3.9.8.

2. **Opt Out of Duration Reporting**

   By default, Serenity BDD generates in-depth reports detailing the runtime for each test. While these reports are richer in information, they consume more disk space. For substantial projects where disk space becomes an issue, consider turning off duration reporting. This can be done by setting the `serenity.report.test.durations` flag to false. As a testament to its efficacy, one project with over 11,000 tests witnessed its report size shrink from 397M to 250M, and the generation time was halved.

3. **Limit Screenshots to Failed Tests**

   When conducting web tests, a useful approach to conserve space is by capturing screenshots exclusively for failed tests. Achieve this by adjusting the `serenity.take.screenshots` property to FOR_FAILURES. This tweak not only accelerates the tests but also trims down the report size. Keep in mind, however, that this might slightly reduce the detail in your reporting.

Harness the power of Serenity BDD more effectively by applying these strategies and enjoy a streamlined testing report experience.
