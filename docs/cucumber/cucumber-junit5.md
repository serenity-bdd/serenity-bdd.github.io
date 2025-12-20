---
id: cucumber-junit5
title: Cucumber with JUnit 5
sidebar_position: 1
---

# Running Cucumber Scenarios with Serenity BDD and JUnit 5

Serenity BDD provides seamless integration with Cucumber, allowing you to write executable specifications in Gherkin and run them using JUnit 5. This guide covers everything you need to know to use Cucumber with Serenity BDD and JUnit 5 effectively.

## Overview

Cucumber is a popular BDD (Behavior-Driven Development) tool that allows you to write test scenarios in plain language using the Gherkin syntax. When combined with Serenity BDD and JUnit 5, you get:

- **Living Documentation**: Serenity generates rich, narrative reports from your Cucumber scenarios
- **Modern Test Execution**: JUnit 5's powerful platform for running tests
- **Parallel Execution**: Run scenarios in parallel for faster test execution
- **Rich Reporting**: Detailed test reports with screenshots, stack traces, and more

## Prerequisites

Before you start, ensure you have:
- Java 17 or higher
- Maven or Gradle
- An IDE with Java support (IntelliJ IDEA, Eclipse, VS Code, etc.)

## Setting Up Dependencies

### Maven Dependencies

Add the following dependencies to your `pom.xml`:

```xml
<properties>
    <serenity.version>5.0.0</serenity.version>
    <cucumber.version>7.33.0</cucumber.version>
    <junit.version>5.10.0</junit.version>
</properties>

<dependencies>
    <!-- Serenity Cucumber Integration -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-cucumber</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Cucumber JUnit Platform Engine -->
    <dependency>
        <groupId>io.cucumber</groupId>
        <artifactId>cucumber-junit-platform-engine</artifactId>
        <version>${cucumber.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- JUnit Platform Suite -->
    <dependency>
        <groupId>org.junit.platform</groupId>
        <artifactId>junit-platform-suite</artifactId>
        <version>${junit.version}</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### Gradle Dependencies

For Gradle, add to your `build.gradle`:

```groovy
dependencies {
    testImplementation "net.serenity-bdd:serenity-cucumber:5.0.0"
    testImplementation "io.cucumber:cucumber-junit-platform-engine:7.33.0"
    testImplementation "org.junit.platform:junit-platform-suite:5.10.0"
}
```

## Creating a Basic Test Runner

The simplest way to run Cucumber scenarios with JUnit 5 is to create a test suite class:

```java
import org.junit.platform.suite.api.*;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
class CucumberTestSuite {
}
```

This minimal configuration:
- `@Suite` - Marks this as a JUnit Platform Suite
- `@IncludeEngines("cucumber")` - Tells JUnit to use the Cucumber engine
- `@SelectClasspathResource("features")` - Points to the directory containing your feature files

## Configuring the Serenity Reporter

:::warning Breaking Change in Serenity 5.0.0
The Serenity Cucumber plugin path changed in version 5.0.0 from `io.cucumber.core.plugin.*` to `net.serenitybdd.cucumber.core.plugin.*`
:::

To generate Serenity reports, you must configure the Serenity reporter plugin. Add this to your test suite:

```java
import org.junit.platform.suite.api.*;
import static io.cucumber.junit.platform.engine.Constants.PLUGIN_PROPERTY_NAME;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(
    key = PLUGIN_PROPERTY_NAME,
    value = "net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel"
)
class CucumberTestSuite {
}
```

The `SerenityReporterParallel` plugin is thread-safe and recommended for all scenarios, even if you're not running tests in parallel.

## Configuration Options

### Using @ConfigurationParameter Annotations

You can configure various Cucumber options using `@ConfigurationParameter` annotations. Here are the most commonly used:

#### Specifying Step Definition Packages

```java
import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;

@ConfigurationParameter(
    key = GLUE_PROPERTY_NAME,
    value = "com.example.stepdefinitions"
)
```

#### Filtering by Tags

```java
import static io.cucumber.junit.platform.engine.Constants.FILTER_TAGS_PROPERTY_NAME;

@ConfigurationParameter(
    key = FILTER_TAGS_PROPERTY_NAME,
    value = "@smoke and not @wip"
)
```

#### Specifying Feature Paths

```java
import static io.cucumber.junit.platform.engine.Constants.FEATURES_PROPERTY_NAME;

@ConfigurationParameter(
    key = FEATURES_PROPERTY_NAME,
    value = "src/test/resources/features"
)
```

#### Complete Example

```java
import org.junit.platform.suite.api.*;
import static io.cucumber.junit.platform.engine.Constants.*;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(
    key = PLUGIN_PROPERTY_NAME,
    value = "net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel"
)
@ConfigurationParameter(
    key = GLUE_PROPERTY_NAME,
    value = "com.example.stepdefinitions"
)
@ConfigurationParameter(
    key = FILTER_TAGS_PROPERTY_NAME,
    value = "@smoke"
)
class SmokeTestSuite {
}
```

### Using junit-platform.properties

Alternatively, you can configure Cucumber options in a `junit-platform.properties` file located in `src/test/resources`:

```properties
# Enable Cucumber
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel
cucumber.glue=com.example.stepdefinitions
cucumber.filter.tags=@smoke
cucumber.features=src/test/resources/features

# Scenario execution order
cucumber.execution.order=random

# Plugin output
cucumber.plugin=pretty,html:target/cucumber-reports/cucumber.html
```

:::tip When to Use Each Approach
- Use `@ConfigurationParameter` for **suite-specific** configuration (e.g., different test suites for smoke, regression, etc.)
- Use `junit-platform.properties` for **project-wide** default configuration
- Annotations override properties file settings
:::

## Organizing Feature Files

### Directory Structure

Serenity expects feature files in `src/test/resources/features` by default. Organize them hierarchically by feature area:

```
src/test/resources/features/
├── authentication/
│   ├── login.feature
│   └── logout.feature
├── shopping/
│   ├── add_to_cart.feature
│   ├── checkout.feature
│   └── payment.feature
└── search/
    ├── basic_search.feature
    └── advanced_filters.feature
```

This hierarchy will be reflected in your Serenity reports, creating a clear requirements structure.

### Feature File Example

```gherkin
@shopping @checkout
Feature: Checkout Process
  As a customer
  I want to complete my purchase
  So that I can receive my items

  Background:
    Given I have items in my cart

  @happy-path @smoke
  Scenario: Successful checkout with credit card
    When I proceed to checkout
    And I enter valid shipping information
    And I pay with a valid credit card
    Then I should see an order confirmation
    And I should receive a confirmation email

  @edge-case
  Scenario: Checkout with invalid credit card
    When I proceed to checkout
    And I enter valid shipping information
    And I pay with an invalid credit card
    Then I should see a payment error message
    And my order should not be placed
```

## Writing Step Definitions

Step definitions connect your Gherkin scenarios to Java code:

```java
package com.example.stepdefinitions;

import io.cucumber.java.en.*;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.actors.OnStage;

public class CheckoutStepDefinitions {

    @Given("{actor} has items in the cart")
    public void hasItemsInCart(Actor actor) {
        actor.attemptsTo(
            // Your implementation here
        );
    }

    @When("{actor} proceeds to checkout")
    public void proceedsToCheckout(Actor actor) {
        actor.attemptsTo(
            // Your implementation here
        );
    }

    @Then("{actor} should see an order confirmation")
    public void shouldSeeOrderConfirmation(Actor actor) {
        actor.should(
            // Your assertions here
        );
    }
}
```

### Step Definition Best Practices

1. **Keep steps reusable** - Write generic steps that can be used in multiple scenarios
2. **Use the Screenplay pattern** - For better maintainability and readability
3. **Avoid step interdependence** - Each step should be independent
4. **Use parameters** - Make steps flexible with Cucumber expressions

## Filtering Scenarios with Tags

### Tag Expressions

Cucumber supports powerful tag expressions for filtering scenarios:

```bash
# Run scenarios with @smoke tag
mvn clean verify -Dcucumber.filter.tags="@smoke"

# Run scenarios with both tags
mvn clean verify -Dcucumber.filter.tags="@smoke and @regression"

# Run scenarios with either tag
mvn clean verify -Dcucumber.filter.tags="@smoke or @regression"

# Exclude scenarios
mvn clean verify -Dcucumber.filter.tags="not @wip"

# Complex expressions
mvn clean verify -Dcucumber.filter.tags="(@smoke or @regression) and not @slow"
```

### In Code

```java
@ConfigurationParameter(
    key = FILTER_TAGS_PROPERTY_NAME,
    value = "(@smoke or @regression) and not @wip"
)
```

### In Properties File

```properties
cucumber.filter.tags=(@smoke or @regression) and not @wip
```

## Running Scenarios in Parallel

See the dedicated [Parallel Execution](parallel-execution) guide for detailed information on running Cucumber scenarios in parallel.

Quick example:

**junit-platform.properties:**
```properties
cucumber.execution.parallel.enabled=true
cucumber.execution.parallel.config.strategy=dynamic
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel
```

## Cucumber Hooks

Cucumber hooks allow you to run code before or after scenarios:

```java
package com.example.hooks;

import io.cucumber.java.*;

public class CucumberHooks {

    @Before
    public void beforeScenario(Scenario scenario) {
        System.out.println("Starting scenario: " + scenario.getName());
    }

    @After
    public void afterScenario(Scenario scenario) {
        System.out.println("Finished scenario: " + scenario.getName());
        if (scenario.isFailed()) {
            // Handle failure
        }
    }

    @BeforeStep
    public void beforeStep() {
        // Runs before each step
    }

    @AfterStep
    public void afterStep() {
        // Runs after each step
    }
}
```

### Tagged Hooks

Run hooks only for specific tags:

```java
@Before("@database")
public void setupDatabase() {
    // Only runs for scenarios tagged with @database
}

@After("@cleanup")
public void cleanup() {
    // Only runs for scenarios tagged with @cleanup
}
```

### Hook Execution Order

Control hook execution order with the `order` parameter:

```java
@Before(order = 1)
public void firstHook() {
    // Runs first
}

@Before(order = 2)
public void secondHook() {
    // Runs second
}
```

## Data Tables

Cucumber data tables allow you to pass structured data to steps:

### Feature File:
```gherkin
Scenario: Create multiple users
  Given the following users exist:
    | username | email              | role  |
    | alice    | alice@example.com  | admin |
    | bob      | bob@example.com    | user  |
    | charlie  | charlie@example.com| user  |
```

### Step Definition:
```java
@Given("the following users exist:")
public void createUsers(DataTable dataTable) {
    List<Map<String, String>> users = dataTable.asMaps();
    for (Map<String, String> user : users) {
        String username = user.get("username");
        String email = user.get("email");
        String role = user.get("role");
        // Create user
    }
}
```

## Scenario Outlines

Scenario outlines allow you to run the same scenario with different data:

```gherkin
Scenario Outline: Login with different credentials
  Given I am on the login page
  When I enter username "<username>" and password "<password>"
  Then I should see "<result>"

  Examples:
    | username | password | result          |
    | admin    | admin123 | Dashboard       |
    | user     | user123  | User Home       |
    | invalid  | wrong    | Invalid credentials |
```

## Configuration Parameters Reference

### Common Cucumber Constants

All available from `io.cucumber.junit.platform.engine.Constants`:

| Constant | Purpose | Example |
|----------|---------|---------|
| `PLUGIN_PROPERTY_NAME` | Configure plugins | `"net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel"` |
| `GLUE_PROPERTY_NAME` | Step definition packages | `"com.example.stepdefinitions"` |
| `FILTER_TAGS_PROPERTY_NAME` | Tag expression filter | `"@smoke and not @wip"` |
| `FEATURES_PROPERTY_NAME` | Feature file locations | `"src/test/resources/features"` |
| `PLUGIN_PUBLISH_QUIET_PROPERTY_NAME` | Suppress Cucumber publish messages | `"true"` |
| `ANSI_COLORS_DISABLED_PROPERTY_NAME` | Disable colored output | `"true"` |
| `EXECUTION_DRY_RUN_PROPERTY_NAME` | Check step definitions without running | `"true"` |
| `OBJECT_FACTORY_PROPERTY_NAME` | Custom object factory | `"com.example.CustomObjectFactory"` |

### Parallel Execution Properties

| Property | Purpose | Example |
|----------|---------|---------|
| `cucumber.execution.parallel.enabled` | Enable parallel execution | `true` |
| `cucumber.execution.parallel.config.strategy` | Execution strategy | `dynamic`, `fixed` |
| `cucumber.execution.parallel.config.fixed.parallelism` | Number of parallel threads (fixed) | `4` |
| `cucumber.execution.parallel.config.dynamic.factor` | Multiplier for available processors | `1.0` |

## Multiple Test Suites

You can create multiple test suites for different purposes:

```java
// Smoke tests
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(key = FILTER_TAGS_PROPERTY_NAME, value = "@smoke")
class SmokeTestSuite {}

// Regression tests
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(key = FILTER_TAGS_PROPERTY_NAME, value = "@regression")
class RegressionTestSuite {}

// Specific feature area
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features/authentication")
class AuthenticationTestSuite {}
```

## Best Practices

### 1. Feature File Organization
- Group related features in directories
- Use meaningful feature names
- Keep scenarios focused and independent
- Use Background for common setup

### 2. Tagging Strategy
- Use tags consistently across the project
- Common tags: `@smoke`, `@regression`, `@wip`, `@bug`, `@slow`
- Tag by feature area: `@authentication`, `@checkout`, `@search`
- Tag by test type: `@ui`, `@api`, `@integration`

### 3. Step Definitions
- Write reusable steps
- Use Cucumber expressions for flexibility
- Keep step implementations thin - delegate to action classes or Screenplay tasks
- Avoid duplicating step definitions

### 4. Scenario Design
- Write scenarios from the user's perspective
- Use Given-When-Then structure consistently
- Keep scenarios focused on a single behavior
- Use scenario outlines for data-driven tests

### 5. Reporting
- Always configure the Serenity reporter
- Use meaningful scenario and step names
- Add relevant tags for filtering reports
- Review reports regularly

## Troubleshooting

### Common Issues

**1. "No tests found"**
- Ensure `@Suite` and `@IncludeEngines("cucumber")` are present
- Check that feature files are in the correct location
- Verify step definitions are in the glue path

**2. "Step undefined"**
- Implement the missing step definition
- Check the glue configuration points to your step definitions package
- Ensure step regex/expressions match

**3. "Plugin not found"**
- Verify you're using the correct plugin path: `net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel`
- Check Serenity dependencies are included

**4. "Tests not running in parallel"**
- Ensure parallel configuration is in `junit-platform.properties`
- Use `SerenityReporterParallel` (not `SerenityReporter`)
- Check JUnit Platform configuration

## Next Steps

- Learn about [Parallel Execution](parallel-execution) for faster test runs
- Explore [Cucumber Configuration Reference](configuration-reference) for advanced options
- Check out the [Screenplay Pattern](/docs/screenplay/screenplay_fundamentals) for better test maintainability
- Review [Serenity Reports](/docs/reporting/the_serenity_reports) documentation

## Additional Resources

- [Cucumber Documentation](https://cucumber.io/docs/cucumber/)
- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)
- [Serenity BDD Official Site](https://serenity-bdd.info)
- [Example Project](https://github.com/serenity-bdd/serenity-cucumber-starter)
