# Cucumber: Runner, Tags, Hooks, Gradle and Parallel

Source: https://serenity-bdd.github.io/docs/ai/ai_cucumber

Verified against Serenity **5.4.1** (Cucumber 8.0.4, JUnit 6.1.3). Every command on this page was run against the example at the end of the page.

## 1. Setup

- **Maven:** the Cucumber row of the dependency table on the project-setup page: `serenity-core`, `serenity-junit5`, `serenity-cucumber`, `io.cucumber:cucumber-java`, `io.cucumber:cucumber-junit-platform-engine`, `junit-platform-suite`. Use the JUnit BOM, and use the Cucumber version Serenity brings.
- **Gradle:** the `build.gradle` at the end of this page is a working build (below).
- Feature files go in `src/test/resources/features`, step definitions and hooks in a package under `src/test/java`.

## 2. The runner

A JUnit Platform suite. No `@RunWith`:

```java
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "demo")   // the package(s) with steps and hooks
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME, value = "net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel,pretty")
public class RunCucumberTests {
}
```

- The plugin class is `net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel`. It connects Cucumber to Serenity: without it, Serenity APIs used in steps fail with "No BaseStepListener has been registered".
- Name the class so that Maven's test plugin runs it: ending in `Test` or `Tests` (`RunCucumberTests`). A name such as `CucumberSuite` is skipped silently (see the troubleshooting page, "Results: 0 tests").
- `@RunWith(CucumberWithSerenity.class)` (from `net.serenitybdd.cucumber`) is the JUnit 4 style runner. In a JUnit 5 project use the suite above.

## 3. Running part of the suite

All of these were run against the example. Add them to the Maven command line:

| Goal | Option | Scenarios run (of 5) |
|---|---|---|
| Only `@smoke` | `-Dcucumber.filter.tags=@smoke` |
| Everything except `@wip` | `-Dcucumber.filter.tags="not @wip"` |
| Tag expression | `-Dcucumber.filter.tags="@basket and not @wip"` |
| By scenario name (regular expression) | `-Dcucumber.filter.name="Adding passes"` |
| One feature file | `-Dcucumber.features=src/test/resources/features/basket.feature` |

The same filters can be fixed in the project instead of the command line:

- in the runner: `@ConfigurationParameter(key = FILTER_TAGS_PROPERTY_NAME, value = "not @wip")` (`Constants.FILTER_TAGS_PROPERTY_NAME`, the same class as `GLUE_PROPERTY_NAME`): 4 scenarios, or
- in `src/test/resources/junit-platform.properties`: `cucumber.filter.tags=not @wip`: 4 scenarios.

When `cucumber.features` is given, Cucumber ignores the runner's `@SelectClasspathResource` and prints a warning saying so; that is expected.

**Re-running failed scenarios.** Add the Cucumber `rerun` plugin to the runner (`...SerenityReporterParallel,pretty,rerun:target/rerun.txt`). After a run that has failures, `target/rerun.txt` lists them (`classpath:features/failing.feature:3`). Run only those with `-Dcucumber.features=@target/rerun.txt` (verified: 6 scenarios, then 1).

## 4. Gradle

the `build.gradle` at the end of this page (Serenity Gradle plugin `net.serenity-bdd.serenity-gradle-plugin` 5.4.1, Gradle 9.8.1 tested, tasks `test` and `aggregate`) was run: `gradle clean test` ran the 5 scenarios and `aggregate` produced `target/site/serenity/index.html`.

**Gradle does not pass `-D` options to the test JVM.** `gradle test -Dcucumber.filter.tags=@smoke` runs every scenario unless the build forwards the option (verified: 4 outcomes without it, 1 with it):

```groovy
test {
    useJUnitPlatform()
    systemProperties System.properties.findAll { k, v -> k.toString().startsWith('cucumber.') }
    finalizedBy 'aggregate'
}
```

The same applies to any other `-D` option your tests read. `ignoreFailures = true` in that file lets the report task run when a scenario fails (the same idea as `-Dmaven.test.failure.ignore=true` for Maven); leave it out if the build must fail.

## 5. Scenario outlines, data tables and parameter types

`cuke-plain/features/maths.feature` has a `Scenario Outline` with an `Examples` table (2 rows) and `basket.feature` has a `Background` and a data table. In the steps (`BasketSteps.java`):

- a data table argument is `io.cucumber.datatable.DataTable` (`items.asMaps()` gives a list of rows);
- a custom parameter type is a method annotated `@ParameterType("\\d+\\.\\d+")` that returns the type (`{money}` in the step text gives a `BigDecimal`);
- Maven counts each example row as a scenario (the example has 5: 1 + 2 + 2); the Serenity outcome files (`target/site/serenity/*.json`) count the outline once (4 files for these 5 scenarios), so two counts of the same run can differ.

## 6. Hooks

`cuke-plain/demo/Hooks.java`:

- `@Before` and `@After` from `io.cucumber.java`; they take an optional `io.cucumber.java.Scenario` argument (`getName()`, `getSourceTagNames()`, `isFailed()`, `getStatus()`).
- `@Before("@basket")` runs only for scenarios with that tag; `order` sorts hooks: `@Before` hooks run from the lowest order to the highest, `@After` hooks from the highest to the lowest (verified: before-1, before-5, after-5, after-1).
- `Serenity.recordReportData().withTitle("..").andContents("..")` adds data to the scenario in the Serenity report (checked: it appears in the outcome files).

## 7. Sharing state between steps

Cucumber creates new step-definition objects for every scenario. Three ways to share state inside one scenario:

1. **Fields of one step class.** Fine when all the steps are in that class.
2. **Serenity session variables** (used in the example): `Serenity.setSessionVariable("basketTotal").to(value)` and `Serenity.sessionVariableCalled("basketTotal")`. They are per scenario (and per thread) and work from any class.
3. **Dependency injection with PicoContainer:** add `io.cucumber:cucumber-picocontainer` (same version as Cucumber), give each step class a constructor that takes the shared object, and Cucumber creates one instance per scenario (verified with two step classes sharing a `Shared` object).

Do not use static fields to share scenario state: with parallel execution scenarios overwrite each other.

## 8. Parallel execution

`src/test/resources/junit-platform.properties`:

```
cucumber.execution.parallel.enabled=true
cucumber.execution.parallel.config.strategy=fixed
cucumber.execution.parallel.config.fixed.parallelism=4
```

Verified: the 5 scenarios ran and the report was produced. Keep in mind that each scenario needs its own state (section 7) and, in a web test, its own browser. Reports of parallel runs are a common source of problems; the troubleshooting page says what has and has not been reproduced.

## 9. Cucumber with Screenplay

Put `OnStage.setTheStage(new OnlineCast())` in a `@Before` hook and a `@ParameterType` named `actor` that returns `OnStage.theActorCalled(name)`, as in the Screenplay page's Cucumber example.

## 10. Cucumber with page objects and a step library (no Screenplay)

The glue code is thin: each step definition calls one `@Step` method of a step library, and the step library uses a page object. The example `cuke-pages` has the whole chain (`SignInStepDefinitions` -> `ReaderSteps` -> `SignInPage`) and its 3 scenarios pass in headless Chrome; the verification script in the serenity-core repository (`docs/ai/skill`) runs the claims below.

- Declare the library in the step-definition class with **`@Steps ReaderSteps reader;`** (`net.serenitybdd.annotations.Steps`). Declare the page object as a plain field of the step library (`SignInPage signInPage;`); Serenity creates it and gives it the driver. With `ReaderSteps reader = new ReaderSteps();` the page field stays null and the scenario errors with `NullPointerException: ... "this.signInPage" is null`.
- Page objects extend `net.serenitybdd.core.pages.PageObject` and use `@FindBy` with `WebElementFacade`; no `@Managed` is needed in Cucumber. See `page-objects.md` for the idioms.
- The report shows both layers: the Gherkin line ("When Reader signs in as ...") with the `@Step` text nested under it ("Sign in as reader@example.com with the password wrong"). Write the `@Step` text in business language too.
- The runner and plugin are the same as in section 2: the plugin class is `net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel`.

### Optional text `book(s)` in a Cucumber expression

In a step written `@Then("the catalogue lists {int} book(s)")`, `(s)` is **optional text**: the step matches "5 book" and "5 books". It does **not** match a feature line that contains the characters `book(s)`. Reproduced: a feature saying `the catalogue lists 5 book(s)` gave `The step 'the catalogue lists 5 book(s)' is undefined.` and Maven failed the build, while the Serenity report shows the scenario as **pending** (not failed), so look at the console output as well as the report. Write the feature in plain words ("1 book", "5 books"); to match a literal `(s)`, escape it in the step as `book\\(s)`.

## 11. Not covered here

Gherkin in other languages, `@Before` for browser start-up in cloud grids, the Cucumber `Transpose`/`DocString` types, Spring or Guice object factories, and Cucumber-JVM versions other than the one Serenity brings.

## Examples

These files compile against Serenity 5.4.1 (Playwright examples: 5.3.11).

### `build.gradle`

```groovy
plugins {
    id 'java'
    id 'net.serenity-bdd.serenity-gradle-plugin' version '5.4.1'
}

repositories {
    mavenCentral()
}

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

dependencies {
    // One JUnit version for every JUnit artifact (Serenity 5.4.1 brings JUnit 6.1.3)
    testImplementation platform('org.junit:junit-bom:6.1.3')
    testImplementation 'org.junit.jupiter:junit-jupiter'
    testImplementation 'org.junit.platform:junit-platform-suite'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'

    testImplementation 'net.serenity-bdd:serenity-core:5.4.1'
    testImplementation 'net.serenity-bdd:serenity-junit5:5.4.1'
    testImplementation 'net.serenity-bdd:serenity-cucumber:5.4.1'
    testImplementation 'io.cucumber:cucumber-java:8.0.4'
    testImplementation 'io.cucumber:cucumber-junit-platform-engine:8.0.4'
    testImplementation 'org.assertj:assertj-core:3.27.7'
    testRuntimeOnly 'org.slf4j:slf4j-simple:2.0.17'
}

test {
    useJUnitPlatform()
    ignoreFailures = true               // so that the report task still runs when a scenario fails
    // Gradle does not pass -D options on to the test JVM: forward the Cucumber ones
    systemProperties System.properties.findAll { k, v -> k.toString().startsWith('cucumber.') }
    finalizedBy 'aggregate'             // build the Serenity report after the tests
}
```

### `cuke-plain/demo/BasketSteps.java`

```java
package demo;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.ParameterType;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import net.serenitybdd.core.Serenity;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

public class BasketSteps {

    // A custom parameter type: "3.70 dollars" -> BigDecimal
    @ParameterType("\\d+\\.\\d+")
    public BigDecimal money(String amount) {
        return new BigDecimal(amount);
    }

    @Given("an empty basket")
    public void anEmptyBasket() {
        // Serenity session variables live for one scenario and can be read from any step class
        Serenity.setSessionVariable("basketTotal").to(BigDecimal.ZERO);
    }

    @When("I add these items:")
    public void iAddTheseItems(DataTable items) {
        List<Map<String, String>> rows = items.asMaps();
        for (Map<String, String> row : rows) {
            addToTotal(new BigDecimal(row.get("price")));
        }
    }

    @When("I add a {string} costing {money} dollars")
    public void iAddACosting(String name, BigDecimal price) {
        addToTotal(price);
    }

    @Then("the basket total should be {money} dollars")
    public void theTotalShouldBe(BigDecimal expected) {
        BigDecimal total = Serenity.sessionVariableCalled("basketTotal");
        assertThat(total).isEqualByComparingTo(expected);
    }

    private void addToTotal(BigDecimal price) {
        BigDecimal total = Serenity.sessionVariableCalled("basketTotal");
        Serenity.setSessionVariable("basketTotal").to(total.add(price));
    }
}
```

### `cuke-plain/demo/Hooks.java`

```java
package demo;

import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.Scenario;
import net.serenitybdd.core.Serenity;

public class Hooks {

    // Runs before every scenario. The Scenario parameter is optional.
    @Before(order = 0)
    public void beforeEachScenario(Scenario scenario) {
        Serenity.recordReportData().withTitle("Scenario tags").andContents(String.join(", ", scenario.getSourceTagNames()));
    }

    // Only for scenarios tagged @basket
    @Before(value = "@basket", order = 1)
    public void beforeBasketScenarios() {
        Serenity.recordReportData().withTitle("Setup").andContents("basket scenario");
    }

    @After
    public void afterEachScenario(Scenario scenario) {
        if (scenario.isFailed()) {
            Serenity.recordReportData().withTitle("Failed scenario").andContents(scenario.getName());
        }
    }
}
```

### `cuke-plain/demo/MathSteps.java`

```java
package demo;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;

import static org.assertj.core.api.Assertions.assertThat;

public class MathSteps {
    int sum;

    @Given("I have {int} and {int}")
    public void have(int a, int b) { sum = a + b; }

    @Then("the sum should be {int}")
    public void sumIs(int expected) { assertThat(sum).isEqualTo(expected); }
}
```

### `cuke-plain/demo/RunCucumberTests.java`

```java
package demo;

import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.PLUGIN_PROPERTY_NAME;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "demo")
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME, value = "net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel,pretty")
public class RunCucumberTests {
}
```

### `cuke-plain/features/basket.feature`

```gherkin
@basket
Feature: Shopping basket

  Background:
    Given an empty basket

  Scenario: Adding items
    When I add these items:
      | name  | price |
      | Tea   | 2.50  |
      | Bread | 1.20  |
    Then the basket total should be 3.70 dollars

  @wip
  Scenario: Work in progress
    When I add a "Cake" costing 4.00 dollars
    Then the basket total should be 4.00 dollars
```

### `cuke-plain/features/maths.feature`

```gherkin
Feature: Arithmetic

  @smoke
  Scenario: Adding passes
    Given I have 2 and 2
    Then the sum should be 4

  Scenario Outline: Adding several pairs
    Given I have <a> and <b>
    Then the sum should be <sum>

    Examples:
      | a | b | sum |
      | 1 | 1 | 2   |
      | 2 | 3 | 5   |
```

### `cuke-pages/features/sign_in.feature`

```gherkin
Feature: Signing in to the bookshop

  Scenario: A reader with the right password reaches the catalogue
    Given Reader is on the sign-in page
    When Reader signs in as "reader@example.com" with the password "correct-horse"
    Then the Catalogue page is shown

  Scenario: A reader with the wrong password is refused
    Given Reader is on the sign-in page
    When Reader signs in as "reader@example.com" with the password "wrong"
    Then Reader is told "Invalid email or password"

  Scenario Outline: The catalogue says how many books it holds
    Given Reader is on the sign-in page
    When Reader signs in as "reader@example.com" with the password "correct-horse"
    Then the catalogue lists <count> books

    Examples:
      | count |
      | 5     |
```

### `cuke-pages/shop/ReaderSteps.java`

```java
package shop;

import net.serenitybdd.annotations.Step;

import static org.assertj.core.api.Assertions.assertThat;

/** The step library: business-level steps that use the page object. Cucumber's glue code calls these. */
public class ReaderSteps {

    SignInPage signInPage;   // page objects are created for you when declared as fields

    @Step("Open the sign-in page")
    public void opensTheSignInPage() {
        signInPage.show();
    }

    @Step("Sign in as {0} with the password {1}")
    public void signsInWith(String email, String password) {
        signInPage.signInWith(email, password);
    }

    @Step("The {0} page should be shown")
    public void shouldSeeThePage(String name) {
        assertThat(signInPage.headingText()).isEqualTo(name);
    }

    @Step("The message {0} should be shown")
    public void shouldBeToldThat(String message) {
        assertThat(signInPage.messageText()).isEqualTo(message);
    }
}
```

### `cuke-pages/shop/RunCucumberTests.java`

```java
package shop;

import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.PLUGIN_PROPERTY_NAME;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "shop")
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME, value = "net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel,pretty")
public class RunCucumberTests {
}
```

### `cuke-pages/shop/SignInPage.java`

```java
package shop;

import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.core.pages.WebElementFacade;
import org.openqa.selenium.support.FindBy;

// A small page served from a data: URL, so the example needs no server or network.
public class SignInPage extends PageObject {
    static final String HTML = "<html><head><title>Bookshop</title></head><body>"
            + "<h1 id='heading'>Sign in</h1>"
            + "<input id='email'><input id='password' type='password'>"
            + "<button id='go' onclick=\"if (document.getElementById('password').value == 'correct-horse') {"
            + "document.getElementById('heading').innerText='Catalogue';"
            + "document.getElementById('error').innerText='5 books'} else {"
            + "document.getElementById('error').innerText='Invalid email or password'}\">Sign in</button>"
            + "<p id='error'></p></body></html>";

    @FindBy(id = "email")
    WebElementFacade email;

    @FindBy(id = "password")
    WebElementFacade password;

    @FindBy(id = "go")
    WebElementFacade signInButton;

    @FindBy(id = "heading")
    WebElementFacade heading;

    @FindBy(id = "error")
    WebElementFacade message;

    public void show() {
        getDriver().get("data:text/html;charset=utf-8," + HTML.replace("#", "%23"));
    }

    public void signInWith(String emailAddress, String secret) {
        email.type(emailAddress);
        password.type(secret);
        signInButton.click();
    }

    public String headingText() {
        return heading.getText();
    }

    public String messageText() {
        return message.getText();
    }
}
```

### `cuke-pages/shop/SignInStepDefinitions.java`

```java
package shop;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import net.serenitybdd.annotations.Steps;

public class SignInStepDefinitions {

    @Steps
    ReaderSteps reader;

    @Given("Reader is on the sign-in page")
    public void readerIsOnTheSignInPage() {
        reader.opensTheSignInPage();
    }

    @When("Reader signs in as {string} with the password {string}")
    public void readerSignsIn(String email, String password) {
        reader.signsInWith(email, password);
    }

    @Then("the {word} page is shown")
    public void thePageIsShown(String name) {
        reader.shouldSeeThePage(name);
    }

    @Then("Reader is told {string}")
    public void readerIsTold(String message) {
        reader.shouldBeToldThat(message);
    }

    // "book(s)" is optional text in a Cucumber expression: this step matches "5 book" and "5 books",
    // but NOT the literal text "5 book(s)" if a feature file contains it.
    @Then("the catalogue lists {int} book(s)")
    public void theCatalogueLists(int count) {
        reader.shouldBeToldThat(count + " books");
    }
}
```
