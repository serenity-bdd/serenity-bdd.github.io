---
id: playwright_tutorial_todomvc
title: "Tutorial: Testing TodoMVC"
sidebar_position: 7
---

# Tutorial: Building a Test Suite Step by Step

This tutorial walks through building a Serenity Playwright test suite for the [TodoMVC application](https://todomvc.com/examples/react/dist/). Rather than showing you the finished code upfront, we'll build it iteratively—starting with a single test and adding only what we need as we go.

This reflects how you'd actually develop tests in practice: write a test, build the minimum infrastructure to support it, then expand.

## What We're Testing

TodoMVC is a simple todo list application where users can add, complete, edit, and delete items. We'll start with the most basic functionality and build up from there.

## Project Setup

First, create a Maven project with these dependencies in `pom.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>serenity-playwright-todomvc</artifactId>
    <version>1.0.0-SNAPSHOT</version>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <serenity.version>5.3.3</serenity.version>
        <playwright.version>1.58.0</playwright.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-playwright</artifactId>
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
        <dependency>
            <groupId>org.assertj</groupId>
            <artifactId>assertj-core</artifactId>
            <version>3.27.0</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-failsafe-plugin</artifactId>
                <version>3.5.0</version>
                <configuration>
                    <includes>
                        <include>**/*Test.java</include>
                    </includes>
                </configuration>
                <executions>
                    <execution>
                        <goals>
                            <goal>integration-test</goal>
                            <goal>verify</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
            <plugin>
                <groupId>net.serenity-bdd.maven.plugins</groupId>
                <artifactId>serenity-maven-plugin</artifactId>
                <version>${serenity.version}</version>
                <executions>
                    <execution>
                        <id>serenity-reports</id>
                        <phase>post-integration-test</phase>
                        <goals>
                            <goal>aggregate</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

## Iteration 1: Our First Test

Let's start with the simplest possible test: adding a single todo item.

### Write the Test First

Create `src/test/java/todomvc/tests/WhenAddingTodosTest.java`:

```java
package todomvc.tests;

import com.microsoft.playwright.Page;
import net.serenitybdd.annotations.Steps;
import net.serenitybdd.junit5.SerenityJUnit5Extension;
import net.serenitybdd.playwright.junit5.SerenityPlaywrightExtension;
import com.microsoft.playwright.junit.UsePlaywright;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import todomvc.steps.TodoSteps;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SerenityJUnit5Extension.class)
@ExtendWith(SerenityPlaywrightExtension.class)
@UsePlaywright
@DisplayName("When adding todos")
class WhenAddingTodosTest {

    @Steps
    TodoSteps todo;

    @BeforeEach
    void setUp(Page page) {
        todo.setPage(page);
    }

    @Test
    @DisplayName("should add a single todo item")
    void shouldAddSingleTodoItem() {
        todo.openApplication();
        todo.addTodo("Buy milk");

        assertThat(todo.visibleTodoCount()).isEqualTo(1);
    }
}
```

Three annotations work together here:

| Annotation | Purpose |
|-----------|---------|
| `@ExtendWith(SerenityJUnit5Extension.class)` | Integrates Serenity BDD reporting and step injection |
| `@ExtendWith(SerenityPlaywrightExtension.class)` | Registers Playwright pages with Serenity for automatic screenshots |
| `@UsePlaywright` | Manages the full Playwright lifecycle (Playwright, Browser, BrowserContext, Page) |

With `@UsePlaywright`, you don't need to create or close `Playwright`, `Browser`, or `Page` yourself. JUnit 5 injects a fresh `Page` into your `@BeforeEach` and `@Test` methods automatically, and cleans everything up when the test finishes.

This test won't compile yet—we need to create the step library and page object. But notice we've defined exactly what we need:
- `openApplication()` - navigate to the app
- `addTodo(String)` - add an item
- `visibleTodoCount()` - return how many items are visible

### Create the Step Library

Create `src/test/java/todomvc/steps/TodoSteps.java` with only the methods we need:

```java
package todomvc.steps;

import com.microsoft.playwright.Page;
import net.serenitybdd.annotations.Step;
import todomvc.pages.TodoMvcPage;

public class TodoSteps {

    private TodoMvcPage todoMvcPage;

    public void setPage(Page page) {
        this.todoMvcPage = new TodoMvcPage(page);
    }

    @Step("Open the TodoMVC application")
    public void openApplication() {
        todoMvcPage.open();
    }

    @Step("Add a todo: '{0}'")
    public void addTodo(String todoText) {
        todoMvcPage.addTodo(todoText);
    }

    @Step("Get the number of visible todos")
    public int visibleTodoCount() {
        return todoMvcPage.getVisibleTodoCount();
    }
}
```

:::tip Steps Return Data, Tests Assert
Notice that `visibleTodoCount()` returns an `int`. The test makes the assertion, not the step library. This keeps steps reusable—the same step can be used in different tests with different expected values.
:::

### Create the Page Object

Create `src/test/java/todomvc/pages/TodoMvcPage.java` with only what we need:

```java
package todomvc.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;

public class TodoMvcPage {

    private final Page page;
    private static final String URL = "https://todomvc.com/examples/react/dist/";

    public TodoMvcPage(Page page) {
        this.page = page;
    }

    // Locators - keep private
    private Locator newTodoInput() {
        return page.getByPlaceholder("What needs to be done?");
    }

    private Locator todoItems() {
        return page.locator(".todo-list li");
    }

    // Actions
    public void open() {
        page.navigate(URL);
        page.waitForLoadState();
    }

    public void addTodo(String todoText) {
        newTodoInput().fill(todoText);
        newTodoInput().press("Enter");
    }

    // Queries
    public int getVisibleTodoCount() {
        return todoItems().count();
    }
}
```

### Run It

```bash
mvn clean verify
```

The test should pass. We now have a minimal working test suite.

## Iteration 2: Adding More Assertions

Let's enhance our test to verify the todo text appears correctly.

### Update the Test

```java
@Test
@DisplayName("should add a single todo item")
void shouldAddSingleTodoItem() {
    todo.openApplication();
    todo.addTodo("Buy milk");

    assertThat(todo.visibleTodoCount()).isEqualTo(1);
    assertThat(todo.todoExists("Buy milk")).isTrue();  // New assertion
}
```

### Add to Step Library

```java
@Step("Check if todo '{0}' exists")
public boolean todoExists(String todoText) {
    return todoMvcPage.hasTodo(todoText);
}
```

### Add to Page Object

```java
private Locator todoItemByText(String text) {
    return page.locator(".todo-list li").filter(
        new Locator.FilterOptions().setHasText(text)
    );
}

public boolean hasTodo(String todoText) {
    return todoItemByText(todoText).count() > 0;
}
```

We added a new locator method `todoItemByText()` because we needed to find a specific item. This locator will be reused for other operations later.

## Iteration 3: Testing Multiple Todos

### Add a New Test

```java
@Test
@DisplayName("should add multiple todo items")
void shouldAddMultipleTodoItems() {
    todo.openApplication();
    todo.addTodos("Buy milk", "Walk the dog", "Do laundry");

    assertThat(todo.visibleTodoCount()).isEqualTo(3);
    assertThat(todo.visibleTodos())
        .containsExactly("Buy milk", "Walk the dog", "Do laundry");
}
```

### Add to Step Library

```java
@Step("Add todos: {0}")
public void addTodos(String... todoTexts) {
    todoMvcPage.addTodos(todoTexts);
}

@Step("Get the visible todo items")
public List<String> visibleTodos() {
    return todoMvcPage.getVisibleTodoTexts();
}
```

### Add to Page Object

```java
public void addTodos(String... todoTexts) {
    for (String text : todoTexts) {
        addTodo(text);
    }
}

public List<String> getVisibleTodoTexts() {
    return todoItems().locator("label").allTextContents();
}
```

## Iteration 4: Extract a Base Test Class

We're about to create more test classes, and they'll all need the same annotations. Let's extract them into a base class. While we're at it, we'll configure the browser to run in headless mode using an `OptionsFactory`.

### Create the Base Class

Create `src/test/java/todomvc/tests/SerenityPlaywrightTest.java`:

```java
package todomvc.tests;

import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.junit.Options;
import com.microsoft.playwright.junit.OptionsFactory;
import com.microsoft.playwright.junit.UsePlaywright;
import net.serenitybdd.junit5.SerenityJUnit5Extension;
import net.serenitybdd.playwright.junit5.SerenityPlaywrightExtension;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.Arrays;

@ExtendWith(SerenityJUnit5Extension.class)
@ExtendWith(SerenityPlaywrightExtension.class)
@UsePlaywright(SerenityPlaywrightTest.ChromeHeadlessOptions.class)
public abstract class SerenityPlaywrightTest {

    public static class ChromeHeadlessOptions implements OptionsFactory {
        @Override
        public Options getOptions() {
            return new Options()
                    .setHeadless(true)
                    .setLaunchOptions(
                            new BrowserType.LaunchOptions()
                                    .setArgs(Arrays.asList(
                                        "--no-sandbox",
                                        "--disable-extensions",
                                        "--disable-gpu"))
                    );
        }
    }
}
```

The `@UsePlaywright` annotation accepts an `OptionsFactory` class to configure browser options. By passing `ChromeHeadlessOptions.class`, every test that extends this base class will run in headless Chromium with the specified launch arguments. Since `@UsePlaywright` is `@Inherited`, all three annotations are inherited by subclasses.

### Simplify the Test Class

```java
@DisplayName("When adding todos")
class WhenAddingTodosTest extends SerenityPlaywrightTest {

    @Steps
    TodoSteps todo;

    @BeforeEach
    void setUp(Page page) {
        todo.setPage(page);
    }

    @Test
    @DisplayName("should add a single todo item")
    void shouldAddSingleTodoItem() {
        todo.openApplication();
        todo.addTodo("Buy milk");

        assertThat(todo.visibleTodoCount()).isEqualTo(1);
        assertThat(todo.todoExists("Buy milk")).isTrue();
    }

    // ... other tests
}
```

Much cleaner! The base class handles all annotations and browser configuration. Each test class focuses purely on test logic—no lifecycle boilerplate, no manual cleanup.

## Iteration 5: Testing Completion

Now let's create a new test class for completing todos.

### Create the Test Class

Create `src/test/java/todomvc/tests/WhenCompletingTodosTest.java`:

```java
@DisplayName("When completing todos")
class WhenCompletingTodosTest extends SerenityPlaywrightTest {

    @Steps
    TodoSteps todo;

    @BeforeEach
    void setUp(Page page) {
        todo.setPage(page);
    }

    @Test
    @DisplayName("should mark a todo as completed")
    void shouldMarkTodoAsCompleted() {
        todo.openApplication();
        todo.addTodo("Buy milk");
        todo.completeTodo("Buy milk");

        assertThat(todo.todoIsCompleted("Buy milk")).isTrue();
    }
}
```

### Add to Step Library

```java
@Step("Complete the todo: '{0}'")
public void completeTodo(String todoText) {
    todoMvcPage.completeTodo(todoText);
}

@Step("Check if todo '{0}' is completed")
public boolean todoIsCompleted(String todoText) {
    return todoMvcPage.isCompleted(todoText);
}
```

### Add to Page Object

```java
private Locator todoCheckbox(String text) {
    return todoItemByText(text).locator(".toggle");
}

public void completeTodo(String todoText) {
    todoCheckbox(todoText).click();
}

public boolean isCompleted(String todoText) {
    String classAttr = todoItemByText(todoText).getAttribute("class");
    return classAttr != null && classAttr.contains("completed");
}
```

Notice how we reuse `todoItemByText()` that we created earlier. The page object grows organically as we need more functionality.

## Iteration 6: Testing the Remaining Count

### Add Another Test

```java
@Test
@DisplayName("should decrease remaining count when completing")
void shouldDecreaseRemainingCountWhenCompleting() {
    todo.openApplication();
    todo.addTodos("Task 1", "Task 2", "Task 3");

    assertThat(todo.remainingCount()).isEqualTo(3);

    todo.completeTodo("Task 2");

    assertThat(todo.remainingCount()).isEqualTo(2);
}
```

### Add to Step Library

```java
@Step("Get the remaining items count")
public int remainingCount() {
    return todoMvcPage.getRemainingCount();
}
```

### Add to Page Object

```java
private Locator todoCount() {
    return page.locator(".todo-count");
}

public int getRemainingCount() {
    String text = todoCount().textContent();
    return Integer.parseInt(text.replaceAll("[^0-9]", ""));
}
```

## The Pattern

By now, you can see the pattern:

1. **Write a test** that describes what you want to verify
2. **Add step library methods** that the test needs
3. **Add page object methods** that the steps need
4. **Add locators** only when a method requires them

This approach ensures:
- You never write code you don't need
- Each addition is driven by a concrete requirement
- The page object grows naturally to match your test coverage

## Continue Building

Following this pattern, you can add tests for:
- Editing todos (double-click, type, press Enter)
- Deleting todos (hover, click destroy button)
- Filtering (All, Active, Completed)
- Toggle all
- Clear completed

Each new test may require new step methods, page object methods, and locators—add them as needed.

## Final Project Structure

After several iterations, your project will look like:

```
src/test/java/todomvc/
├── pages/
│   └── TodoMvcPage.java            # Grows with each iteration
├── steps/
│   └── TodoSteps.java              # Grows with each iteration
└── tests/
    ├── SerenityPlaywrightTest.java  # Base class with @UsePlaywright
    ├── WhenAddingTodosTest.java
    ├── WhenCompletingTodosTest.java
    ├── WhenEditingTodosTest.java    # Added later
    ├── WhenDeletingTodosTest.java   # Added later
    └── WhenFilteringTodosTest.java  # Added later
```

## Key Takeaways

| Principle | Why It Matters |
|-----------|----------------|
| **Start with a test** | Tests drive what code you write |
| **Add only what you need** | No speculative code that may never be used |
| **Extract when patterns emerge** | Base class came after we saw duplication |
| **Let `@UsePlaywright` manage the lifecycle** | No manual Playwright/Browser/Page setup or teardown |
| **Steps return data** | Tests make assertions, keeping steps reusable |
| **Private locators** | Encapsulation makes changes easier |

## Complete Source Code

The complete source code for this tutorial is available at:
[github.com/serenity-bdd/serenity-playwright-todomvc-demo](https://github.com/serenity-bdd/serenity-playwright-todomvc-demo)
