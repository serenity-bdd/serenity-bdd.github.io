---
id: playwright_screenplay_tutorial
title: "Tutorial: Screenplay with TodoMVC"
sidebar_position: 8
---

# Tutorial: Building a Screenplay Test Suite

This tutorial walks through building a Serenity Playwright test suite using the Screenplay Pattern for the [TodoMVC application](https://todomvc.com/examples/react/dist/). We'll build it iteratively, starting with the fundamentals and progressively adding more sophisticated patterns.

## What We're Building

By the end of this tutorial, you'll have a complete test suite with:
- **Targets** for all UI elements
- **Tasks** for user actions (add, complete, delete, filter todos)
- **Questions** to query application state
- **Tests** using `Ensure.that()` assertions

## Project Setup

Create a Maven project with these dependencies:

```xml
<properties>
    <serenity.version>5.1.1</serenity.version>
    <playwright.version>1.58.0</playwright.version>
</properties>

<dependencies>
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-screenplay-playwright</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-screenplay</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-ensure</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-junit5</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>com.microsoft.playwright</groupId>
        <artifactId>playwright</artifactId>
        <version>${playwright.version}</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>6.0.1</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## Part 1: Our First Test

Let's start with the simplest possible test - adding a single todo item.

### Step 1: Create the Base Test Class

First, create a base class that sets up our actor with Playwright abilities:

```java
package todomvc.screenplay;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;

public abstract class ScreenplayPlaywrightTest {

    protected Actor toby;

    @BeforeEach
    void setUpPlaywright() {
        toby = Actor.named("Toby");
        toby.can(BrowseTheWebWithPlaywright.usingTheDefaultConfiguration());
    }

    @AfterEach
    void tearDownPlaywright() {
        BrowseTheWebWithPlaywright.as(toby).tearDown();
    }
}
```

### Step 2: Define UI Targets

Create a class to hold all UI element locators:

```java
package todomvc.screenplay.ui;

import net.serenitybdd.screenplay.playwright.Target;

public class TodoList {

    public static final Target NEW_TODO_INPUT =
        Target.the("new todo input")
              .locatedBy("[placeholder='What needs to be done?']");

    public static final Target TODO_ITEMS =
        Target.the("todo items")
              .locatedBy(".todo-list li");

    public static final Target TODO_ITEM_LABELS =
        Target.the("todo item labels")
              .locatedBy(".todo-list li label");
}
```

### Step 3: Create the First Task

Create a task to open the TodoMVC application:

```java
package todomvc.screenplay.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.playwright.interactions.Open;
import net.serenitybdd.annotations.Step;

public class OpenTodoMvcApp implements Task {

    private static final String URL = "https://todomvc.com/examples/react/dist/";

    @Override
    @Step("{0} opens the TodoMVC application")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(Open.url(URL));
    }

    public static OpenTodoMvcApp onTheHomePage() {
        return new OpenTodoMvcApp();
    }
}
```

### Step 4: Create the Add Todo Task

```java
package todomvc.screenplay.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.playwright.interactions.Enter;
import net.serenitybdd.screenplay.playwright.interactions.Press;
import net.serenitybdd.annotations.Step;
import todomvc.screenplay.ui.TodoList;

public class AddATodoItem implements Task {

    private final String todoItem;

    public AddATodoItem(String todoItem) {
        this.todoItem = todoItem;
    }

    @Override
    @Step("{0} adds a todo item called '#todoItem'")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Enter.theValue(todoItem).into(TodoList.NEW_TODO_INPUT),
            Press.keys("Enter")
        );
    }

    public static AddATodoItem called(String todoItem) {
        return new AddATodoItem(todoItem);
    }
}
```

### Step 5: Create a Question

Create a question to count visible todos:

```java
package todomvc.screenplay.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import todomvc.screenplay.ui.TodoList;

public class TheVisibleTodos {

    public static Question<Integer> count() {
        return Question.about("visible todo count").answeredBy(
            actor -> BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(TodoList.TODO_ITEMS.asSelector())
                .count()
        );
    }
}
```

### Step 6: Write the Test

```java
package todomvc.screenplay;

import net.serenitybdd.junit5.SerenityJUnit5Extension;
import net.serenitybdd.screenplay.ensure.Ensure;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import todomvc.screenplay.questions.TheVisibleTodos;
import todomvc.screenplay.tasks.AddATodoItem;
import todomvc.screenplay.tasks.OpenTodoMvcApp;

@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("When adding todos")
class WhenAddingTodosTest extends ScreenplayPlaywrightTest {

    @Test
    @DisplayName("should add a single todo item")
    void shouldAddSingleTodoItem() {
        toby.attemptsTo(
            OpenTodoMvcApp.onTheHomePage(),
            AddATodoItem.called("Buy milk"),
            Ensure.that(TheVisibleTodos.count()).isEqualTo(1)
        );
    }
}
```

Run it with `mvn clean verify` - you should see a passing test with a Serenity report.

## Part 2: Expanding Our Test Suite

Now let's add more capabilities.

### Adding More Targets

Expand the `TodoList` class with more locators:

```java
public class TodoList {

    // Input elements
    public static final Target NEW_TODO_INPUT =
        Target.the("new todo input")
              .locatedBy("[placeholder='What needs to be done?']");

    // Todo items
    public static final Target TODO_ITEMS =
        Target.the("todo items")
              .locatedBy(".todo-list li");

    public static final Target TODO_ITEM_LABELS =
        Target.the("todo item labels")
              .locatedBy(".todo-list li label");

    // Dynamic targets for specific items
    public static Target todoItemCalled(String text) {
        return Target.the("todo '" + text + "'")
                     .locatedBy(".todo-list li:has-text('" + text + "')");
    }

    public static Target checkboxFor(String text) {
        return Target.the("checkbox for '" + text + "'")
                     .locatedBy(".todo-list li:has-text('" + text + "') .toggle");
    }

    public static Target deleteButtonFor(String text) {
        return Target.the("delete button for '" + text + "'")
                     .locatedBy(".todo-list li:has-text('" + text + "') .destroy");
    }

    // Footer elements
    public static final Target TODO_COUNT =
        Target.the("todo count")
              .locatedBy(".todo-count");

    public static final Target CLEAR_COMPLETED_BUTTON =
        Target.the("clear completed button")
              .locatedBy(".clear-completed");

    // Filters
    public static final Target ALL_FILTER =
        Target.the("All filter")
              .locatedBy(".filters a:has-text('All')");

    public static final Target ACTIVE_FILTER =
        Target.the("Active filter")
              .locatedBy(".filters a:has-text('Active')");

    public static final Target COMPLETED_FILTER =
        Target.the("Completed filter")
              .locatedBy(".filters a:has-text('Completed')");

    public static final Target SELECTED_FILTER =
        Target.the("selected filter")
              .locatedBy(".filters a.selected");
}
```

### Complete Task

```java
package todomvc.screenplay.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.playwright.interactions.Click;
import net.serenitybdd.annotations.Step;
import todomvc.screenplay.ui.TodoList;

public class Complete implements Task {

    private final String todoItem;

    public Complete(String todoItem) {
        this.todoItem = todoItem;
    }

    @Override
    @Step("{0} completes the todo item '#todoItem'")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Click.on(TodoList.checkboxFor(todoItem))
        );
    }

    public static Complete todoItem(String todoItem) {
        return new Complete(todoItem);
    }
}
```

### Delete Task

```java
package todomvc.screenplay.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.playwright.interactions.Click;
import net.serenitybdd.screenplay.playwright.interactions.Hover;
import net.serenitybdd.annotations.Step;
import todomvc.screenplay.ui.TodoList;

public class Delete implements Task {

    private final String todoItem;

    public Delete(String todoItem) {
        this.todoItem = todoItem;
    }

    @Override
    @Step("{0} deletes the todo item '#todoItem'")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Hover.over(TodoList.todoItemCalled(todoItem)),
            Click.on(TodoList.deleteButtonFor(todoItem))
        );
    }

    public static Delete theTodoItem(String todoItem) {
        return new Delete(todoItem);
    }
}
```

### Filter Tasks

```java
package todomvc.screenplay.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.playwright.interactions.Click;
import todomvc.screenplay.ui.TodoList;

public class FilterTodos {

    public static Task toShowAll() {
        return Task.where("{0} filters to show all todos",
            Click.on(TodoList.ALL_FILTER)
        );
    }

    public static Task toShowActive() {
        return Task.where("{0} filters to show active todos",
            Click.on(TodoList.ACTIVE_FILTER)
        );
    }

    public static Task toShowCompleted() {
        return Task.where("{0} filters to show completed todos",
            Click.on(TodoList.COMPLETED_FILTER)
        );
    }
}
```

### More Questions

```java
// TheVisibleTodos.java - expanded
package todomvc.screenplay.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import todomvc.screenplay.ui.TodoList;

import java.util.Collection;

public class TheVisibleTodos {

    public static Question<Collection<String>> displayed() {
        return Question.about("the visible todos").answeredBy(
            actor -> BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(TodoList.TODO_ITEM_LABELS.asSelector())
                .allTextContents()
        );
    }

    public static Question<Integer> count() {
        return Question.about("visible todo count").answeredBy(
            actor -> BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(TodoList.TODO_ITEMS.asSelector())
                .count()
        );
    }
}
```

```java
// TheRemainingCount.java
package todomvc.screenplay.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import todomvc.screenplay.ui.TodoList;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class TheRemainingCount {

    private static final Pattern COUNT_PATTERN = Pattern.compile("(\\d+)");

    public static Question<Integer> value() {
        return Question.about("the remaining count").answeredBy(actor -> {
            String text = BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(TodoList.TODO_COUNT.asSelector())
                .textContent();

            Matcher matcher = COUNT_PATTERN.matcher(text);
            return matcher.find() ? Integer.parseInt(matcher.group(1)) : 0;
        });
    }
}
```

```java
// TheCurrentFilter.java
package todomvc.screenplay.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import todomvc.screenplay.ui.TodoList;

public class TheCurrentFilter {

    public static Question<String> selected() {
        return Question.about("the current filter").answeredBy(
            actor -> BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(TodoList.SELECTED_FILTER.asSelector())
                .textContent()
        );
    }
}
```

```java
// TheTodoItem.java - fluent question builder
package todomvc.screenplay.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import todomvc.screenplay.ui.TodoList;

public class TheTodoItem {

    private final String todoItem;

    public TheTodoItem(String todoItem) {
        this.todoItem = todoItem;
    }

    public static TheTodoItem called(String todoItem) {
        return new TheTodoItem(todoItem);
    }

    public Question<Boolean> exists() {
        String item = todoItem;
        return Question.about("whether '" + item + "' exists").answeredBy(
            actor -> BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(TodoList.todoItemCalled(item).asSelector())
                .count() > 0
        );
    }

    public Question<Boolean> isCompleted() {
        String item = todoItem;
        return Question.about("whether '" + item + "' is completed").answeredBy(
            actor -> BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(TodoList.todoItemCalled(item).asSelector())
                .getAttribute("class")
                .contains("completed")
        );
    }
}
```

## Part 3: Complete Test Suite

Now we have everything to write a comprehensive test suite:

### Adding Todos Tests

```java
@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("When adding todos (Screenplay)")
class WhenAddingTodosScreenplayTest extends ScreenplayPlaywrightTest {

    @Test
    @DisplayName("should add a single todo item")
    void shouldAddSingleTodoItem() {
        toby.attemptsTo(
            OpenTodoMvcApp.onTheHomePage(),
            AddATodoItem.called("Buy milk"),
            Ensure.that(TheVisibleTodos.count()).isEqualTo(1),
            Ensure.that(TheTodoItem.called("Buy milk").exists()).isTrue()
        );
    }

    @Test
    @DisplayName("should add multiple todo items")
    void shouldAddMultipleTodoItems() {
        toby.attemptsTo(
            OpenTodoMvcApp.onTheHomePage(),
            AddATodoItem.called("Buy milk"),
            AddATodoItem.called("Walk the dog"),
            AddATodoItem.called("Do laundry"),
            Ensure.that(TheVisibleTodos.displayed())
                .containsExactly("Buy milk", "Walk the dog", "Do laundry")
        );
    }

    @Test
    @DisplayName("should update remaining count when adding todos")
    void shouldUpdateRemainingCountWhenAddingTodos() {
        toby.attemptsTo(
            OpenTodoMvcApp.onTheHomePage(),
            AddATodoItem.called("Task 1"),
            Ensure.that(TheRemainingCount.value()).isEqualTo(1),

            AddATodoItem.called("Task 2"),
            Ensure.that(TheRemainingCount.value()).isEqualTo(2),

            AddATodoItem.called("Task 3"),
            Ensure.that(TheRemainingCount.value()).isEqualTo(3)
        );
    }
}
```

### Completing Todos Tests

```java
@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("When completing todos (Screenplay)")
class WhenCompletingTodosScreenplayTest extends ScreenplayPlaywrightTest {

    @BeforeEach
    void setupTodos() {
        toby.attemptsTo(
            OpenTodoMvcApp.onTheHomePage(),
            AddATodoItem.called("Buy milk"),
            AddATodoItem.called("Walk the dog"),
            AddATodoItem.called("Do laundry")
        );
    }

    @Test
    @DisplayName("should mark a todo as completed")
    void shouldMarkTodoAsCompleted() {
        toby.attemptsTo(
            Complete.todoItem("Buy milk"),
            Ensure.that(TheTodoItem.called("Buy milk").isCompleted()).isTrue(),
            Ensure.that(TheRemainingCount.value()).isEqualTo(2)
        );
    }

    @Test
    @DisplayName("should clear completed todos")
    void shouldClearCompletedTodos() {
        toby.attemptsTo(
            Complete.todoItem("Buy milk"),
            Complete.todoItem("Walk the dog"),
            Click.on(TodoList.CLEAR_COMPLETED_BUTTON),
            Ensure.that(TheVisibleTodos.displayed()).containsExactly("Do laundry"),
            Ensure.that(TheVisibleTodos.count()).isEqualTo(1)
        );
    }
}
```

### Filtering Tests

```java
@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("When filtering todos (Screenplay)")
class WhenFilteringTodosScreenplayTest extends ScreenplayPlaywrightTest {

    @BeforeEach
    void setupTodos() {
        toby.attemptsTo(
            OpenTodoMvcApp.onTheHomePage(),
            AddATodoItem.called("Buy milk"),
            AddATodoItem.called("Walk the dog"),
            AddATodoItem.called("Do laundry"),
            Complete.todoItem("Walk the dog")
        );
    }

    @Test
    @DisplayName("should show all todos by default")
    void shouldShowAllTodosByDefault() {
        toby.attemptsTo(
            Ensure.that(TheCurrentFilter.selected()).isEqualTo("All"),
            Ensure.that(TheVisibleTodos.displayed())
                .containsExactly("Buy milk", "Walk the dog", "Do laundry")
        );
    }

    @Test
    @DisplayName("should filter to show only active todos")
    void shouldFilterToShowOnlyActiveTodos() {
        toby.attemptsTo(
            FilterTodos.toShowActive(),
            Ensure.that(TheCurrentFilter.selected()).isEqualTo("Active"),
            Ensure.that(TheVisibleTodos.displayed())
                .containsExactly("Buy milk", "Do laundry")
        );
    }

    @Test
    @DisplayName("should filter to show only completed todos")
    void shouldFilterToShowOnlyCompletedTodos() {
        toby.attemptsTo(
            FilterTodos.toShowCompleted(),
            Ensure.that(TheCurrentFilter.selected()).isEqualTo("Completed"),
            Ensure.that(TheVisibleTodos.displayed()).containsExactly("Walk the dog")
        );
    }

    @Test
    @DisplayName("should switch between filters")
    void shouldSwitchBetweenFilters() {
        toby.attemptsTo(
            FilterTodos.toShowActive(),
            Ensure.that(TheVisibleTodos.count()).isEqualTo(2),

            FilterTodos.toShowCompleted(),
            Ensure.that(TheVisibleTodos.count()).isEqualTo(1),

            FilterTodos.toShowAll(),
            Ensure.that(TheVisibleTodos.count()).isEqualTo(3)
        );
    }
}
```

### Deleting Tests

```java
@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("When deleting todos (Screenplay)")
class WhenDeletingTodosScreenplayTest extends ScreenplayPlaywrightTest {

    @BeforeEach
    void setupTodos() {
        toby.attemptsTo(
            OpenTodoMvcApp.onTheHomePage(),
            AddATodoItem.called("Buy milk"),
            AddATodoItem.called("Walk the dog"),
            AddATodoItem.called("Do laundry")
        );
    }

    @Test
    @DisplayName("should delete a todo item")
    void shouldDeleteTodoItem() {
        toby.attemptsTo(
            Delete.theTodoItem("Walk the dog"),
            Ensure.that(TheTodoItem.called("Walk the dog").exists()).isFalse(),
            Ensure.that(TheVisibleTodos.displayed())
                .containsExactly("Buy milk", "Do laundry")
        );
    }

    @Test
    @DisplayName("should update the remaining count after deleting")
    void shouldUpdateRemainingCountAfterDeleting() {
        toby.attemptsTo(
            Ensure.that(TheRemainingCount.value()).isEqualTo(3),
            Delete.theTodoItem("Buy milk"),
            Ensure.that(TheRemainingCount.value()).isEqualTo(2)
        );
    }
}
```

## Key Takeaways

### The Screenplay Pattern Benefits

1. **Readability**: Tests read like specifications
   ```java
   toby.attemptsTo(
       OpenTodoMvcApp.onTheHomePage(),
       AddATodoItem.called("Buy milk"),
       Complete.todoItem("Buy milk"),
       Ensure.that(TheRemainingCount.value()).isEqualTo(0)
   );
   ```

2. **Reusability**: Tasks and Questions can be composed and reused
3. **Maintainability**: Changes to UI are isolated to Target definitions
4. **Expressiveness**: Business intent is clear in every test

### Project Structure

```
src/test/java/
├── todomvc/screenplay/
│   ├── ScreenplayPlaywrightTest.java    # Base test class
│   ├── WhenAddingTodosTest.java         # Test class
│   ├── WhenCompletingTodosTest.java     # Test class
│   ├── WhenFilteringTodosTest.java      # Test class
│   ├── WhenDeletingTodosTest.java       # Test class
│   ├── ui/
│   │   └── TodoList.java                # UI Targets
│   ├── tasks/
│   │   ├── OpenTodoMvcApp.java
│   │   ├── AddATodoItem.java
│   │   ├── Complete.java
│   │   ├── Delete.java
│   │   └── FilterTodos.java
│   └── questions/
│       ├── TheVisibleTodos.java
│       ├── TheRemainingCount.java
│       ├── TheCurrentFilter.java
│       └── TheTodoItem.java
```

## Next Steps

- Learn about [advanced Screenplay features](playwright_screenplay) including network interception and multiple tabs
- Explore [Playwright-specific assertions](playwright_screenplay#playwright-specific-assertions) with auto-retry
- See [Best Practices](playwright_best_practices) for production-ready tests