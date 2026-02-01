---
id: playwright_screenplay
title: Screenplay Pattern with Playwright
sidebar_position: 4
---

# Screenplay Pattern with Playwright

The Screenplay Pattern is a modern, actor-centric approach to writing automated tests. When combined with Playwright, it provides a powerful, expressive way to write browser automation tests that read like living documentation.

The `serenity-screenplay-playwright` module brings together:
- **Screenplay's expressiveness** - Actor-centric, task-based test design
- **Playwright's reliability** - Modern browser automation with auto-waiting
- **Serenity's rich reporting** - Step-by-step documentation with screenshots

## Why Screenplay with Playwright?

The Screenplay Pattern offers several advantages over traditional Page Object approaches:

| Page Objects | Screenplay |
|-------------|------------|
| Tests call page methods directly | Actors perform tasks and ask questions |
| Procedural code style | Declarative, behavior-focused style |
| Tests tied to UI structure | Tests express business intent |
| Harder to compose actions | Tasks easily compose into workflows |

With Playwright, you also get:
- **Auto-waiting** built into all interactions
- **Built-in assertions** with automatic retry
- **Network interception** for mocking APIs
- **Multiple browser support** (Chromium, Firefox, WebKit)

## Project Setup

### Maven Dependencies

Add these dependencies to your `pom.xml`:

```xml
<properties>
    <serenity.version>5.1.1</serenity.version>
    <playwright.version>1.58.0</playwright.version>
</properties>

<dependencies>
    <!-- Serenity Screenplay with Playwright -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-screenplay-playwright</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Serenity Screenplay Core -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-screenplay</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Serenity Ensure (for fluent assertions) -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-ensure</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Serenity JUnit 5 -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-junit5</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Playwright -->
    <dependency>
        <groupId>com.microsoft.playwright</groupId>
        <artifactId>playwright</artifactId>
        <version>${playwright.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- JUnit 5 -->
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>6.0.1</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## Core Concepts

### Actors and Abilities

In Screenplay, tests are written from the perspective of **Actors** who have **Abilities**. For Playwright tests, actors need the `BrowseTheWebWithPlaywright` ability:

```java
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;

Actor toby = Actor.named("Toby");
toby.can(BrowseTheWebWithPlaywright.usingTheDefaultConfiguration());
```

The ability manages the Playwright browser lifecycle automatically:
- Creates the browser, context, and page on demand
- **Automatically cleans up** when the test completes (no explicit teardown needed)
- Subscribes to Serenity's test lifecycle events for seamless resource management

### Tasks

**Tasks** represent high-level actions that an actor performs. They express _what_ the actor does in business terms:

```java
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.playwright.interactions.Open;
import net.serenitybdd.annotations.Step;

public class OpenTodoMvcApp implements Task {

    @Override
    @Step("{0} opens the TodoMVC application")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Open.url("https://todomvc.com/examples/react/dist/")
        );
    }

    public static OpenTodoMvcApp onTheHomePage() {
        return new OpenTodoMvcApp();
    }
}
```

Tasks can be composed from other tasks and interactions:

```java
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

### Questions

**Questions** allow actors to query the state of the application:

```java
import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;

public class TheVisibleTodos {

    public static Question<Collection<String>> displayed() {
        return Question.about("the visible todos").answeredBy(
            actor -> BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(".todo-list li label")
                .allTextContents()
        );
    }

    public static Question<Integer> count() {
        return Question.about("visible todo count").answeredBy(
            actor -> BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(".todo-list li")
                .count()
        );
    }
}
```

### Targets

**Targets** define UI elements using Playwright selectors:

```java
import net.serenitybdd.screenplay.playwright.Target;

public class TodoList {

    public static final Target NEW_TODO_INPUT =
        Target.the("new todo input")
              .locatedBy("[placeholder='What needs to be done?']");

    public static final Target TODO_ITEMS =
        Target.the("todo items")
              .locatedBy(".todo-list li");

    public static Target todoItemCalled(String todoText) {
        return Target.the("todo item '" + todoText + "'")
                     .locatedBy(".todo-list li:has-text('" + todoText + "')");
    }

    public static Target checkboxFor(String todoText) {
        return Target.the("checkbox for '" + todoText + "'")
                     .locatedBy(".todo-list li:has-text('" + todoText + "') .toggle");
    }
}
```

Targets support:
- **Parameterized selectors**: `Target.the("item {0}").locatedBy("[data-id='{0}']").of("123")`
- **Nested targets**: `button.inside(form)`
- **Frame support**: `Target.the("editor").inFrame("#iframe").locatedBy("#content")`

## Writing Tests

### Basic Test Structure

Here's a complete example of a Screenplay test with Playwright:

```java
import net.serenitybdd.junit5.SerenityJUnit5Extension;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.ensure.Ensure;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("When adding todos")
class WhenAddingTodosTest {

    Actor toby;

    @BeforeEach
    void setUp() {
        toby = Actor.named("Toby");
        toby.can(BrowseTheWebWithPlaywright.usingTheDefaultConfiguration());
    }

    // No @AfterEach needed - cleanup happens automatically!

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
}
```

### Using Ensure for Assertions

The `Ensure` class provides fluent assertions that integrate with Screenplay's task-based model:

```java
toby.attemptsTo(
    // Numeric comparisons
    Ensure.that(TheRemainingCount.value()).isEqualTo(3),
    Ensure.that(TheVisibleTodos.count()).isGreaterThan(0),

    // Boolean checks
    Ensure.that(TheTodoItem.called("Buy milk").isCompleted()).isTrue(),
    Ensure.that(TheClearCompletedButton.isVisible()).isFalse(),

    // String comparisons
    Ensure.that(TheCurrentFilter.selected()).isEqualTo("All"),

    // Collection assertions
    Ensure.that(TheVisibleTodos.displayed())
        .containsExactly("Buy milk", "Walk the dog"),
    Ensure.that(TheVisibleTodos.displayed())
        .contains("Buy milk")
);
```

## Built-in Interactions

The `serenity-screenplay-playwright` module provides many built-in interactions:

### Navigation

```java
// Open a URL
actor.attemptsTo(Open.url("https://example.com"));

// Navigate back/forward
actor.attemptsTo(Navigate.back());
actor.attemptsTo(Navigate.forward());

// Refresh the page
actor.attemptsTo(Navigate.refresh());
```

### Clicking

```java
// Simple click
actor.attemptsTo(Click.on(TodoList.SUBMIT_BUTTON));

// Double-click
actor.attemptsTo(DoubleClick.on(TodoList.TODO_LABEL));

// Right-click
actor.attemptsTo(RightClick.on(TodoList.CONTEXT_MENU_TRIGGER));
```

### Form Interactions

```java
// Enter text
actor.attemptsTo(Enter.theValue("Hello").into(TodoList.INPUT_FIELD));

// Clear a field
actor.attemptsTo(Clear.field(TodoList.INPUT_FIELD));

// Press keys
actor.attemptsTo(Press.keys("Enter"));
actor.attemptsTo(Press.keys("Control+a"));

// Check/uncheck checkboxes
actor.attemptsTo(Check.checkbox(TodoList.AGREE_CHECKBOX));
actor.attemptsTo(Uncheck.checkbox(TodoList.AGREE_CHECKBOX));

// Select from dropdown
actor.attemptsTo(SelectFromOptions.byVisibleText("Option 1").from(TodoList.DROPDOWN));
actor.attemptsTo(SelectFromOptions.byValue("opt1").from(TodoList.DROPDOWN));
```

### Mouse Actions

```java
// Hover over an element
actor.attemptsTo(Hover.over(TodoList.DELETE_BUTTON));

// Drag and drop
actor.attemptsTo(Drag.from(SOURCE).to(TARGET));

// Scroll into view
actor.attemptsTo(ScrollIntoView.element(TodoList.FOOTER));
```

### Waiting

```java
// Wait for an element
actor.attemptsTo(WaitFor.the(TodoList.LOADING_SPINNER).toDisappear());
```

### JavaScript Execution

```java
// Execute JavaScript
actor.attemptsTo(
    ExecuteJavaScript.withScript("window.scrollTo(0, document.body.scrollHeight)")
);
```

### Dialog Handling

```java
// Accept alert
actor.attemptsTo(HandleDialog.byAccepting());

// Dismiss alert
actor.attemptsTo(HandleDialog.byDismissing());

// Enter text in prompt
actor.attemptsTo(HandleDialog.byEntering("my response"));
```

## Playwright-Specific Assertions

The `Ensure` class also provides Playwright-specific assertions with auto-retry:

```java
import net.serenitybdd.screenplay.playwright.assertions.Ensure;

actor.attemptsTo(
    // Element visibility
    Ensure.that(TodoList.MAIN_SECTION).isVisible(),
    Ensure.that(TodoList.LOADING_SPINNER).isHidden(),

    // Text content
    Ensure.that(TodoList.HEADER).hasText("todos"),
    Ensure.that(TodoList.HEADER).containsText("todo"),

    // Element count
    Ensure.that(TodoList.TODO_ITEMS).hasCount(3),

    // Attributes and classes
    Ensure.that(TodoList.TODO_ITEM).hasClass("completed"),
    Ensure.that(TodoList.INPUT).hasAttribute("placeholder", "What needs to be done?"),

    // Element state
    Ensure.that(TodoList.SUBMIT_BUTTON).isEnabled(),
    Ensure.that(TodoList.CHECKBOX).isChecked(),

    // Page URL and title
    Ensure.thatTheCurrentUrl().contains("/dashboard"),
    Ensure.thatThePageTitle().isEqualTo("My App")
);
```

## Advanced Features

### Direct Playwright API Access

For advanced scenarios, you can access the Playwright API directly:

```java
Page page = BrowseTheWebWithPlaywright.as(actor).getCurrentPage();

// Use Playwright's native API
page.locator(".my-element").click();

// Access browser context
BrowserContext context = page.context();

// Network interception
page.route("**/api/**", route -> {
    route.fulfill(new Route.FulfillOptions()
        .setBody("{\"mocked\": true}")
        .setContentType("application/json"));
});
```

### Custom Tasks

Create domain-specific tasks for your application:

```java
public class CompleteCheckout implements Task {

    private final PaymentDetails paymentDetails;

    public CompleteCheckout(PaymentDetails paymentDetails) {
        this.paymentDetails = paymentDetails;
    }

    @Override
    @Step("{0} completes checkout with #paymentDetails")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            EnterShippingAddress.forCurrentUser(),
            EnterPaymentDetails.using(paymentDetails),
            Click.on(CheckoutPage.PLACE_ORDER_BUTTON),
            WaitFor.the(CheckoutPage.CONFIRMATION_MESSAGE).toAppear()
        );
    }

    public static CompleteCheckout using(PaymentDetails details) {
        return new CompleteCheckout(details);
    }
}
```

### Custom Questions

Create reusable questions for your domain:

```java
public class TheOrderTotal {

    public static Question<BigDecimal> displayed() {
        return Question.about("the order total").answeredBy(actor -> {
            String totalText = BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(".order-total")
                .textContent();
            return new BigDecimal(totalText.replace("$", ""));
        });
    }
}

// Usage
actor.attemptsTo(
    Ensure.that(TheOrderTotal.displayed()).isGreaterThan(new BigDecimal("100.00"))
);
```

### Multiple Pages/Tabs

Handle multiple browser tabs:

```java
// Open a new page
BrowseTheWebWithPlaywright.as(actor).openNewPage();

// Switch between pages
BrowseTheWebWithPlaywright.as(actor).switchToPage(0);
BrowseTheWebWithPlaywright.as(actor).switchToPageWithTitle("Dashboard");

// Close current page
BrowseTheWebWithPlaywright.as(actor).closeCurrentPage();
```

### Cookie Management

Manage browser cookies:

```java
// Get all cookies
List<Cookie> cookies = BrowseTheWebWithPlaywright.as(actor).getCookies();

// Add a cookie
Cookie cookie = new Cookie("session", "abc123")
    .setDomain("example.com")
    .setPath("/");
BrowseTheWebWithPlaywright.as(actor).addCookie(cookie);

// Clear cookies
BrowseTheWebWithPlaywright.as(actor).clearCookies();
```

### Frame Handling

Interact with elements inside iframes:

```java
// Define a target inside a frame
Target EDITOR_CONTENT = Target.the("editor content")
    .inFrame("#editor-iframe")
    .locatedBy("#content");

// Interact with it normally
actor.attemptsTo(
    Enter.theValue("Hello World").into(EDITOR_CONTENT)
);
```

### Screenshots

Take screenshots explicitly:

```java
// The notifyScreenChange() method captures a screenshot
BrowseTheWebWithPlaywright.as(actor).notifyScreenChange();

// Or take a screenshot explicitly
ScreenshotAndHtmlSource screenshot = BrowseTheWebWithPlaywright.as(actor).takeScreenShot();
```

## Configuration

### Browser Options

Configure Playwright browser options via system properties or programmatically:

```properties
# serenity.properties
playwright.browsertype=chromium
playwright.headless=true
playwright.slowMo=100
```

Or programmatically:

```java
actor.can(
    BrowseTheWebWithPlaywright
        .withOptions(new BrowserType.LaunchOptions().setHeadless(false))
        .withBrowserType("firefox")
);
```

### Screenshot Configuration

Control screenshot capture:

```properties
# serenity.conf
serenity {
    take.screenshots = FOR_EACH_ACTION  # or FOR_FAILURES, DISABLED
}
```

## Complete Example: TodoMVC Test Suite

Here's a comprehensive example showing all the concepts together:

### UI Targets

```java
public class TodoList {

    public static final Target NEW_TODO_INPUT =
        Target.the("new todo input")
              .locatedBy("[placeholder='What needs to be done?']");

    public static final Target TODO_ITEMS =
        Target.the("todo items")
              .locatedBy(".todo-list li");

    public static final Target TODO_COUNT =
        Target.the("todo count")
              .locatedBy(".todo-count");

    public static final Target CLEAR_COMPLETED_BUTTON =
        Target.the("clear completed button")
              .locatedBy(".clear-completed");

    public static final Target ALL_FILTER =
        Target.the("All filter")
              .locatedBy(".filters a:has-text('All')");

    public static final Target ACTIVE_FILTER =
        Target.the("Active filter")
              .locatedBy(".filters a:has-text('Active')");

    public static final Target COMPLETED_FILTER =
        Target.the("Completed filter")
              .locatedBy(".filters a:has-text('Completed')");

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
}
```

### Tasks

```java
// AddATodoItem.java
public class AddATodoItem implements Task {
    private final List<String> items;

    public AddATodoItem(List<String> items) {
        this.items = items;
    }

    @Override
    @Step("{0} adds todo items: #items")
    public <T extends Actor> void performAs(T actor) {
        for (String item : items) {
            actor.attemptsTo(
                Enter.theValue(item).into(TodoList.NEW_TODO_INPUT),
                Press.keys("Enter")
            );
        }
    }

    public static AddATodoItem called(String item) {
        return new AddATodoItem(List.of(item));
    }

    public static AddATodoItem withItems(String... items) {
        return new AddATodoItem(Arrays.asList(items));
    }
}

// Complete.java
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

    public static Complete todoItem(String item) {
        return new Complete(item);
    }
}

// Delete.java
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

    public static Delete theTodoItem(String item) {
        return new Delete(item);
    }
}

// FilterTodos.java
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

### Questions

```java
// TheVisibleTodos.java
public class TheVisibleTodos {

    public static Question<Collection<String>> displayed() {
        return Question.about("the visible todos").answeredBy(
            actor -> BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(".todo-list li label")
                .allTextContents()
        );
    }

    public static Question<Integer> count() {
        return Question.about("visible todo count").answeredBy(
            actor -> BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(".todo-list li")
                .count()
        );
    }
}

// TheRemainingCount.java
public class TheRemainingCount {

    public static Question<Integer> value() {
        return Question.about("the remaining count").answeredBy(actor -> {
            String text = BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(".todo-count")
                .textContent();
            Matcher matcher = Pattern.compile("(\\d+)").matcher(text);
            return matcher.find() ? Integer.parseInt(matcher.group(1)) : 0;
        });
    }
}
```

### Test Class

```java
@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("When managing todos")
class WhenManagingTodosTest {

    Actor toby;

    @BeforeEach
    void setUp() {
        toby = Actor.named("Toby");
        toby.can(BrowseTheWebWithPlaywright.usingTheDefaultConfiguration());
    }

    // No @AfterEach needed - BrowseTheWebWithPlaywright automatically
    // cleans up browser resources when the test finishes

    @Test
    @DisplayName("should add and complete todos")
    void shouldAddAndCompleteTodos() {
        toby.attemptsTo(
            Open.url("https://todomvc.com/examples/react/dist/"),
            AddATodoItem.withItems("Buy milk", "Walk the dog", "Do laundry"),

            Ensure.that(TheVisibleTodos.count()).isEqualTo(3),
            Ensure.that(TheRemainingCount.value()).isEqualTo(3),

            Complete.todoItem("Buy milk"),

            Ensure.that(TheRemainingCount.value()).isEqualTo(2),

            FilterTodos.toShowCompleted(),

            Ensure.that(TheVisibleTodos.displayed()).containsExactly("Buy milk"),

            FilterTodos.toShowActive(),

            Ensure.that(TheVisibleTodos.displayed())
                .containsExactly("Walk the dog", "Do laundry")
        );
    }

    @Test
    @DisplayName("should delete a todo item")
    void shouldDeleteTodoItem() {
        toby.attemptsTo(
            Open.url("https://todomvc.com/examples/react/dist/"),
            AddATodoItem.withItems("Item 1", "Item 2", "Item 3"),

            Delete.theTodoItem("Item 2"),

            Ensure.that(TheVisibleTodos.displayed())
                .containsExactly("Item 1", "Item 3")
        );
    }
}
```

## Best Practices

### 1. Keep Tasks Business-Focused

Tasks should express _what_ the user is trying to achieve, not _how_ they achieve it:

```java
// Good - expresses intent
actor.attemptsTo(
    AddItemToCart.called("Blue T-Shirt"),
    ProceedToCheckout.withStandardShipping()
);

// Avoid - too technical
actor.attemptsTo(
    Click.on(ProductPage.ADD_TO_CART_BUTTON),
    Click.on(Header.CART_ICON),
    Click.on(CartPage.CHECKOUT_BUTTON)
);
```

### 2. Use Meaningful Target Names

Target names appear in reports, so make them descriptive:

```java
// Good
Target SUBMIT_ORDER_BUTTON = Target.the("submit order button")
    .locatedBy("#checkout-submit");

// Avoid
Target BUTTON = Target.the("button").locatedBy("#checkout-submit");
```

### 3. Create Domain-Specific Questions

Questions should return meaningful domain objects:

```java
// Good
Question<Money> orderTotal = TheOrderTotal.displayed();
Question<List<CartItem>> cartItems = TheCartContents.items();

// Avoid
Question<String> total = Text.of(OrderPage.TOTAL);
```

### 4. Leverage Ensure for Readable Assertions

Use `Ensure.that()` for assertions that read naturally:

```java
actor.attemptsTo(
    Ensure.that(TheOrderStatus.displayed()).isEqualTo(OrderStatus.CONFIRMED),
    Ensure.that(TheDeliveryDate.shown()).isAfter(LocalDate.now())
);
```

## Next Steps

- Explore the [TodoMVC Tutorial](playwright_tutorial_todomvc) for a step-by-step walkthrough
- Learn about [Configuration Options](playwright_configuration) for customization
- Review [Best Practices](playwright_best_practices) for production-ready tests
