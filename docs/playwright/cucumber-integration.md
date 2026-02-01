---
id: playwright_cucumber
title: Cucumber Integration
sidebar_position: 9
---

# Cucumber Integration with Playwright Screenplay

Cucumber provides a natural language syntax for writing behavior-driven tests. When combined with Serenity Playwright's Screenplay implementation, you get expressive BDD scenarios that drive reliable browser automation.

This guide shows you how to integrate Cucumber with Serenity Playwright using the Screenplay pattern.

## Project Setup

### Maven Dependencies

Add the following dependencies to your `pom.xml`:

```xml
<properties>
    <serenity.version>5.1.1</serenity.version>
    <playwright.version>1.58.0</playwright.version>
    <cucumber.version>7.34.2</cucumber.version>
    <junit.version>5.11.4</junit.version>
</properties>

<dependencyManagement>
    <dependencies>
        <!-- Use BOMs for version management -->
        <dependency>
            <groupId>org.junit</groupId>
            <artifactId>junit-bom</artifactId>
            <version>${junit.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>io.cucumber</groupId>
            <artifactId>cucumber-bom</artifactId>
            <version>${cucumber.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <!-- Serenity Screenplay with Playwright -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-screenplay-playwright</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Serenity Cucumber Integration -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-cucumber</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Cucumber (versions managed by cucumber-bom) -->
    <dependency>
        <groupId>io.cucumber</groupId>
        <artifactId>cucumber-java</artifactId>
        <scope>test</scope>
    </dependency>

    <dependency>
        <groupId>io.cucumber</groupId>
        <artifactId>cucumber-junit-platform-engine</artifactId>
        <scope>test</scope>
    </dependency>

    <!-- JUnit Platform Suite -->
    <dependency>
        <groupId>org.junit.platform</groupId>
        <artifactId>junit-platform-suite</artifactId>
        <scope>test</scope>
    </dependency>

    <!-- Serenity Ensure for assertions -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-ensure</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### Install Playwright Browsers

Before running tests, install the Playwright browsers:

```bash
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install"
```

## Project Structure

A typical project structure looks like this:

```
src/test/
├── java/
│   └── yourpackage/
│       ├── cucumber/
│       │   ├── CucumberTestSuite.java      # Test runner
│       │   ├── PlaywrightHooks.java        # Cucumber hooks
│       │   └── StepDefinitions.java        # Step definitions
│       └── screenplay/
│           ├── tasks/                       # Reusable tasks
│           │   ├── OpenTheApplication.java
│           │   └── AddATodoItem.java
│           ├── questions/                   # Reusable questions
│           │   └── TheVisibleTodos.java
│           └── ui/                          # Target definitions
│               └── TodoList.java
└── resources/
    ├── features/
    │   └── managing_todos.feature          # Feature files
    └── serenity.properties                  # Configuration
```

## Step 1: Create the Test Runner

The test runner configures Cucumber to work with Serenity:

```java
package yourpackage.cucumber;

import org.junit.platform.suite.api.*;
import static io.cucumber.junit.platform.engine.Constants.*;

@Suite
@IncludeEngines("cucumber")
@SelectPackages("yourpackage.cucumber")
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME,
    value = "net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel,pretty")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME,
    value = "yourpackage.cucumber,net.serenitybdd.cucumber.actors")
@ConfigurationParameter(key = FEATURES_PROPERTY_NAME,
    value = "src/test/resources/features")
public class CucumberTestSuite {
}
```

:::important Glue Path Configuration
Always include `net.serenitybdd.cucumber.actors` in your glue path. This registers Serenity's `StageDirector` which automatically calls `OnStage.drawTheCurtain()` after each scenario to clean up browser resources.
:::

## Step 2: Create Playwright Hooks

The hooks class sets up the Playwright stage before each scenario:

```java
package yourpackage.cucumber;

import io.cucumber.java.Before;
import io.cucumber.java.ParameterType;
import io.cucumber.java.Scenario;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.playwright.actors.PlaywrightCast;

public class PlaywrightHooks {

    /**
     * Set up the Playwright stage before each scenario.
     * Order 0 ensures this runs first among all @Before hooks.
     */
    @Before(order = 0)
    public void setTheStage(Scenario scenario) {
        OnStage.setTheStage(new PlaywrightCast());
    }

    /**
     * Define the {actor} parameter type for Cucumber steps.
     * This allows steps like "Given Toby is on the application"
     * to automatically resolve "Toby" to an Actor instance.
     */
    @ParameterType(".*")
    public Actor actor(String actorName) {
        return OnStage.theActorCalled(actorName);
    }
}
```

### Understanding the Hooks

**`@Before(order = 0)`**: The `order = 0` ensures the stage is set up before any other hooks run. This is important if you have other `@Before` hooks that depend on actors.

**`@ParameterType(".*")`**: This creates a custom parameter type that converts actor names in feature files to `Actor` instances. The pattern `.*` matches any string.

**Automatic Cleanup**: You don't need an `@After` hook for cleanup. The `StageDirector` (included via the glue path) automatically handles cleanup by calling `OnStage.drawTheCurtain()`.

## Step 3: Write Feature Files

Feature files describe behavior in Gherkin syntax:

```gherkin
# src/test/resources/features/managing_todos.feature
@playwright
Feature: Managing Todo Items
  As a busy person
  I want to manage my todo list
  So that I can keep track of what I need to do

  Background:
    Given Toby is on the TodoMVC application

  Scenario: Adding a single todo item
    When Toby adds a todo item called "Buy milk"
    Then the todo list should contain "Buy milk"
    And the remaining item count should be 1

  Scenario: Adding multiple todo items
    When Toby adds the following todo items:
      | Buy milk     |
      | Walk the dog |
      | Do laundry   |
    Then the todo list should contain:
      | Buy milk     |
      | Walk the dog |
      | Do laundry   |
    And the remaining item count should be 3

  Scenario: Completing a todo item
    Given Toby has added the following todo items:
      | Buy milk     |
      | Walk the dog |
    When Toby completes the todo item "Walk the dog"
    Then the remaining item count should be 1

  Scenario: Filtering to show only active todos
    Given Toby has added the following todo items:
      | Buy milk     |
      | Walk the dog |
    And Toby has completed the todo item "Walk the dog"
    When Toby filters to show "Active" todos
    Then the visible todo list should contain:
      | Buy milk |
```

## Step 4: Create Step Definitions

Step definitions bridge feature files to Screenplay tasks:

```java
package yourpackage.cucumber;

import io.cucumber.java.en.*;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.ensure.Ensure;
import yourpackage.screenplay.tasks.*;
import yourpackage.screenplay.questions.*;

import java.util.List;

public class TodoStepDefinitions {

    @Given("{actor} is on the TodoMVC application")
    public void actorIsOnTheTodoMvcApplication(Actor actor) {
        actor.attemptsTo(
            OpenTheApplication.onTheTodoMvcHomePage()
        );
    }

    @When("{actor} adds a todo item called {string}")
    public void actorAddsTodoItemCalled(Actor actor, String todoItem) {
        actor.attemptsTo(
            AddATodoItem.called(todoItem)
        );
    }

    @When("{actor} adds the following todo items:")
    public void actorAddsTheFollowingTodoItems(Actor actor, List<String> todoItems) {
        for (String item : todoItems) {
            actor.attemptsTo(
                AddATodoItem.called(item)
            );
        }
    }

    @Given("{actor} has added the following todo items:")
    public void actorHasAddedTheFollowingTodoItems(Actor actor, List<String> todoItems) {
        actorIsOnTheTodoMvcApplication(actor);
        actorAddsTheFollowingTodoItems(actor, todoItems);
    }

    @When("{actor} completes the todo item {string}")
    public void actorCompletesTheTodoItem(Actor actor, String todoItem) {
        actor.attemptsTo(
            Complete.todoItem(todoItem)
        );
    }

    @Given("{actor} has completed the todo item {string}")
    public void actorHasCompletedTheTodoItem(Actor actor, String todoItem) {
        actorCompletesTheTodoItem(actor, todoItem);
    }

    @When("{actor} filters to show {string} todos")
    public void actorFiltersToShow(Actor actor, String filterType) {
        actor.attemptsTo(
            FilterTodos.toShow(filterType)
        );
    }

    @Then("the todo list should contain {string}")
    public void theTodoListShouldContain(String expectedItem) {
        Actor actor = OnStage.theActorInTheSpotlight();
        actor.attemptsTo(
            Ensure.that(TheVisibleTodos.displayed()).contains(expectedItem)
        );
    }

    @Then("the todo list should contain:")
    public void theTodoListShouldContainItems(List<String> expectedItems) {
        Actor actor = OnStage.theActorInTheSpotlight();
        actor.attemptsTo(
            Ensure.that(TheVisibleTodos.displayed())
                  .containsExactlyElementsFrom(expectedItems)
        );
    }

    @Then("the visible todo list should contain:")
    public void theVisibleTodoListShouldContain(List<String> expectedItems) {
        Actor actor = OnStage.theActorInTheSpotlight();
        actor.attemptsTo(
            Ensure.that(TheVisibleTodos.displayed())
                  .containsExactlyElementsFrom(expectedItems)
        );
    }

    @Then("the remaining item count should be {int}")
    public void theRemainingItemCountShouldBe(int expectedCount) {
        Actor actor = OnStage.theActorInTheSpotlight();
        actor.attemptsTo(
            Ensure.that(TheRemainingCount.value()).isEqualTo(expectedCount)
        );
    }
}
```

### Key Patterns in Step Definitions

**Actor Parameter**: The `{actor}` parameter automatically resolves to an Actor instance thanks to the `@ParameterType` definition in the hooks.

**Background Steps**: Steps like `actorHasAddedTheFollowingTodoItems` compose multiple actions, allowing `Given` steps to set up complex preconditions.

**The Actor in the Spotlight**: For `Then` steps that don't receive an actor parameter, use `OnStage.theActorInTheSpotlight()` to get the last actor who performed an action.

**Data Tables**: Cucumber data tables map directly to `List<String>` for single-column tables.

## Step 5: Create Screenplay Tasks

Tasks encapsulate business-level actions:

```java
package yourpackage.screenplay.tasks;

import net.serenitybdd.annotations.Step;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import net.serenitybdd.screenplay.playwright.interactions.Open;

public class OpenTheApplication implements Task {

    private static final String TODO_MVC_URL = "https://todomvc.com/examples/react/dist/";

    @Override
    @Step("{0} opens the TodoMVC application")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Open.url(TODO_MVC_URL)
        );

        // Clear localStorage to ensure a clean slate
        // (TodoMVC persists todos in localStorage)
        var page = BrowseTheWebWithPlaywright.as(actor).getCurrentPage();
        page.evaluate("() => localStorage.clear()");
        page.reload();
    }

    public static OpenTheApplication onTheTodoMvcHomePage() {
        return new OpenTheApplication();
    }
}
```

```java
package yourpackage.screenplay.tasks;

import net.serenitybdd.annotations.Step;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.playwright.interactions.*;
import yourpackage.screenplay.ui.TodoList;

public class AddATodoItem implements Task {

    private final String itemName;

    public AddATodoItem(String itemName) {
        this.itemName = itemName;
    }

    @Override
    @Step("{0} adds a todo item called '#itemName'")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Enter.theValue(itemName).into(TodoList.NEW_TODO_INPUT),
            Press.keys("Enter")
        );
    }

    public static AddATodoItem called(String itemName) {
        return new AddATodoItem(itemName);
    }
}
```

## Step 6: Create Screenplay Questions

Questions query the application state:

```java
package yourpackage.screenplay.questions;

import net.serenitybdd.annotations.Step;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import yourpackage.screenplay.ui.TodoList;

import java.util.Collection;

public class TheVisibleTodos implements Question<Collection<String>> {

    @Override
    @Step("{0} checks the visible todo items")
    public Collection<String> answeredBy(Actor actor) {
        var page = BrowseTheWebWithPlaywright.as(actor).getCurrentPage();
        return page.locator(TodoList.TODO_ITEMS.asSelector())
                   .allTextContents();
    }

    public static TheVisibleTodos displayed() {
        return new TheVisibleTodos();
    }
}
```

## Step 7: Define UI Targets

Targets define how to locate elements:

```java
package yourpackage.screenplay.ui;

import net.serenitybdd.screenplay.playwright.Target;

public class TodoList {
    public static final Target NEW_TODO_INPUT =
        Target.the("new todo input").locatedBy(".new-todo");

    public static final Target TODO_ITEMS =
        Target.the("todo items").locatedBy(".todo-list li label");

    public static final Target TODO_COUNT =
        Target.the("todo count").locatedBy(".todo-count");

    public static final Target TOGGLE_ALL =
        Target.the("toggle all checkbox").locatedBy(".toggle-all");
}
```

## Running the Tests

### Run All Cucumber Tests

```bash
mvn clean verify
```

### Run Tests with Specific Tags

```bash
mvn clean verify -Dcucumber.filter.tags="@playwright"
```

### Run a Single Scenario

```bash
mvn clean verify -Dcucumber.filter.name="Adding a single todo item"
```

### View Reports

After running tests, open the Serenity report:

```
target/site/serenity/index.html
```

## Configuration

### serenity.properties

```properties
# Browser settings
playwright.browsertype=chromium
playwright.headless=true

# Screenshot settings
serenity.take.screenshots=FOR_FAILURES

# Report settings
serenity.project.name=My TodoMVC Tests
```

### cucumber.properties

```properties
# Cucumber settings
cucumber.publish.quiet=true
```

## Advanced Configuration

### Custom Browser Configuration

Configure `PlaywrightCast` with custom options:

```java
@Before(order = 0)
public void setTheStage(Scenario scenario) {
    BrowserType.LaunchOptions options = new BrowserType.LaunchOptions()
        .setHeadless(false)
        .setSlowMo(100);  // Slow down for debugging

    OnStage.setTheStage(
        new PlaywrightCast()
            .withLaunchOptions(options)
            .withBrowserType("firefox")
    );
}
```

### Multiple Actors

Scenarios can involve multiple actors:

```gherkin
Scenario: Collaborative editing
  Given Alice has added a todo item called "Shared task"
  When Bob views the todo list
  Then Bob should see "Shared task" in the list
```

```java
@When("{actor} views the todo list")
public void actorViewsTheTodoList(Actor actor) {
    actor.attemptsTo(
        OpenTheApplication.onTheTodoMvcHomePage()
    );
}
```

Each actor gets their own browser instance automatically through `PlaywrightCast`.

## Troubleshooting

### State Leakage Between Scenarios

If tests interfere with each other:

1. Verify `net.serenitybdd.cucumber.actors` is in your glue path
2. Clear application state (like localStorage) in your navigation task
3. Ensure `@Before(order = 0)` is set on your stage setup hook

### Element Not Found

If elements aren't being found:

1. Use Playwright's built-in auto-waiting (it's enabled by default)
2. Check your selectors using browser DevTools
3. Consider using Playwright's more robust selectors like `text=`, `role=`, etc.

### Screenshots Not Captured

Set screenshot mode in `serenity.properties`:

```properties
serenity.take.screenshots=FOR_EACH_ACTION
```

## Example Repository

A complete working example is available in the [serenity-playwright-todomvc-demo](https://github.com/serenity-bdd/serenity-playwright-todomvc-demo) repository.

## See Also

- [Screenplay Pattern with Playwright](./screenplay) - Core Screenplay concepts
- [Tutorial: Screenplay with TodoMVC](./screenplay-tutorial) - Building a test suite from scratch
- [Cucumber Configuration Reference](/docs/cucumber/configuration-reference) - All Cucumber options
- [Parallel Execution](/docs/cucumber/parallel-execution) - Running tests in parallel