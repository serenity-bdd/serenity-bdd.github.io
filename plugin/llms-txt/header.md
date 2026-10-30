# Serenity BDD

> Serenity BDD is an open-source Java library for writing acceptance and regression tests (web, REST and mobile) that produce rich living-documentation reports. Current release described here: 5.4.1 (the Playwright modules are published up to 5.3.11). Requires Java 17+. Source: https://github.com/serenity-bdd/serenity-core

## Notes for AI coding assistants

Serenity supports several styles. All of them are current and valid; none is preferred or deprecated:

- Page Objects with a step library (`@Steps`), using Selenium or Playwright
- Screenplay, using Selenium, Playwright or REST
- JUnit 5 or Cucumber as the test runner

If the user hasn't said which style to use and the project doesn't show one (check `pom.xml` for `serenity-screenplay*`, `serenity-playwright`, `serenity-cucumber`, and look at existing tests), ask. Don't pick a default. Within a project, stay in one style, one driver and one runner. Don't mix Page Objects and Screenplay in one test.

Packages that are often guessed wrongly (verified against 5.4.1):

- `@Step`, `@Steps`, `@Managed`, `@DefaultUrl`, `@WithTag`: `net.serenitybdd.annotations` (not `net.thucydides.core.annotations`).
- JUnit 5: `@ExtendWith(SerenityJUnit5Extension.class)` from `net.serenitybdd.junit5`. Don't use `@RunWith(SerenityRunner.class)` in a JUnit 5 project.
- Page Objects: `net.serenitybdd.core.pages.PageObject` and `WebElementFacade`. `PageObject.open()` is final: don't redeclare it; use `@DefaultUrl` or `openAt(url)`.
- Screenplay core: `Actor`, `Task`, `Question`, `Performable` in `net.serenitybdd.screenplay`; `OnStage` and `OnlineCast` in `net.serenitybdd.screenplay.actors`; `GivenWhenThen.seeThat` in `net.serenitybdd.screenplay`.
- Screenplay with Selenium (`serenity-screenplay-webdriver`): `BrowseTheWeb` in `net.serenitybdd.screenplay.abilities`; `Open`, `Click`, `Enter`, `Hit` in `net.serenitybdd.screenplay.actions`; `Target` in `net.serenitybdd.screenplay.targets` (`locatedBy` takes a String that is read as XPath if it compiles as XPath, otherwise CSS: `.new-todo` is CSS but `input.new-todo` is read as XPath and finds nothing, so use `located(By.cssSelector(..))` for tag-prefixed CSS); questions such as `Text` and `Value` in `net.serenitybdd.screenplay.questions`. `Text.ofEach(..)` is a `Question<Collection<String>>`. Web `Ensure` is `net.serenitybdd.screenplay.ensure.Ensure` (artifact `serenity-ensure`).
- Screenplay with Playwright (`serenity-screenplay-playwright`): everything is under `net.serenitybdd.screenplay.playwright` (`abilities.BrowseTheWebWithPlaywright`, `actors.PlaywrightCast`, `interactions.*`, `questions.*`, `assertions.Ensure`). Locators are Playwright selector strings. `Text.ofEach(..)` returns `List<String>`.
- Screenplay REST (`serenity-screenplay-rest`): `net.serenitybdd.screenplay.rest.abilities.CallAnApi`, `...rest.interactions.{Get,Post,Ensure}`, `...rest.questions.LastResponse`.
- Playwright Page Objects (`serenity-playwright`): plain classes holding a `com.microsoft.playwright.Page`, registered with `PlaywrightSerenity.registerPage(page)` from `net.serenitybdd.playwright`. They don't extend `PageObject`.
- `ScenarioSteps` (`net.thucydides.core.steps`) and `Pages` (`net.thucydides.core.pages`) are correctly in `net.thucydides`. Many `net.thucydides` packages are current core packages, so don't treat that prefix as a sign of old code.
- Cucumber with JUnit 5: a `@Suite` class with `@IncludeEngines("cucumber")` and the plugin `net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel`.
- Serenity 5.4.1 depends on JUnit 6.1.3 and Cucumber 8.0.4. Don't pin older JUnit or Cucumber versions in the pom: the code compiles but the tests fail at run time with "conflicting versions". Import the JUnit BOM (`org.junit:junit-bom`) to keep all JUnit artifacts aligned.
- Configuration lives in `src/test/resources/serenity.conf`. `serenity.*` and `thucydides.*` keys are synonyms. Use only keys listed in the reference.

Full package tables, common mistakes and compiling examples per style:

- Screenplay (Selenium, Playwright, REST, Cucumber): https://serenity-bdd.github.io/docs/ai/ai_screenplay_idioms
- Page Objects (Selenium, Playwright): https://serenity-bdd.github.io/docs/ai/ai_page_object_idioms
- Cucumber (runner, tags under Maven and Gradle, hooks, shared state, re-running failures, parallel): https://serenity-bdd.github.io/docs/ai/ai_cucumber
- Configuration (serenity.conf, properties, environments, reading values; which source wins): https://serenity-bdd.github.io/docs/ai/ai_configuration
- Upgrading from Serenity 2.x, 3.x or 4.x, and recognising old code (what moved, what to change; tested on real projects): https://serenity-bdd.github.io/docs/ai/ai_upgrading
- Dependencies and configuration: https://serenity-bdd.github.io/docs/ai/ai_project_setup
- Troubleshooting by error message (build, report and browser problems, each reproduced and fixed): https://serenity-bdd.github.io/docs/ai/ai_troubleshooting

Check that generated code compiles (`mvn test-compile`) before running it.
