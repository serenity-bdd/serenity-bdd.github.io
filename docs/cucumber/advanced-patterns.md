---
id: advanced-patterns
title: Advanced Cucumber Patterns
sidebar_position: 3
---

# Advanced Cucumber Patterns with Serenity BDD

This guide covers advanced patterns and techniques for writing maintainable, scalable Cucumber tests with Serenity BDD. You'll learn patterns used by experienced test automation engineers to build robust test suites.

## Prerequisites

This guide assumes you're familiar with:
- Basic Cucumber concepts (features, scenarios, step definitions)
- Serenity BDD fundamentals
- Either the Screenplay pattern or Page Objects

If you're new to Cucumber with Serenity, start with [Running Cucumber Scenarios with JUnit 5](cucumber-junit5).

## Advanced Hook Patterns

Cucumber hooks allow you to run code at specific points in the test lifecycle. Understanding advanced hook patterns is essential for proper test setup and cleanup.

### Hook Types and Execution Order

Cucumber provides several hook types that execute at different points:

```java
package com.example.hooks;

import io.cucumber.java.*;

public class LifecycleHooks {

    // Runs once before ALL scenarios (Cucumber 7+)
    @BeforeAll
    public static void beforeAllScenarios() {
        System.out.println("Starting test suite");
        // Initialize shared resources, start test containers, etc.
    }

    // Runs before EACH scenario
    @Before
    public void beforeScenario(Scenario scenario) {
        System.out.println("Starting: " + scenario.getName());
    }

    // Runs before EACH step
    @BeforeStep
    public void beforeStep() {
        // Useful for logging or timing
    }

    // Runs after EACH step
    @AfterStep
    public void afterStep() {
        // Useful for screenshots or state verification
    }

    // Runs after EACH scenario
    @After
    public void afterScenario(Scenario scenario) {
        System.out.println("Finished: " + scenario.getName());
        if (scenario.isFailed()) {
            // Custom failure handling
        }
    }

    // Runs once after ALL scenarios (Cucumber 7+)
    @AfterAll
    public static void afterAllScenarios() {
        System.out.println("Test suite complete");
        // Cleanup shared resources
    }
}
```

**Execution order for a single scenario:**
```
@BeforeAll (once per test run)
  └─> @Before
        └─> @BeforeStep → Step 1 → @AfterStep
        └─> @BeforeStep → Step 2 → @AfterStep
        └─> @BeforeStep → Step 3 → @AfterStep
      @After
@AfterAll (once per test run)
```

### Tagged Hooks

Run hooks only for scenarios with specific tags:

```java
public class TaggedHooks {

    @Before("@database")
    public void setupDatabase() {
        // Only runs for scenarios tagged @database
        DatabaseTestUtils.resetDatabase();
        DatabaseTestUtils.loadFixtures("test-data.sql");
    }

    @After("@database")
    public void cleanupDatabase() {
        DatabaseTestUtils.truncateAllTables();
    }

    @Before("@authenticated")
    public void ensureAuthenticated() {
        // Setup authenticated session before scenarios that need it
    }

    @Before("@slow")
    public void increaseTimeouts() {
        // Increase timeouts for slow-running scenarios
    }
}
```

### Tag Expressions in Hooks

Use complex tag expressions to target specific scenarios:

```java
public class ConditionalHooks {

    @Before("@ui and not @headless")
    public void setupBrowserWithUI() {
        // Only for UI tests that need a visible browser
    }

    @Before("@api or @integration")
    public void setupApiClient() {
        // For API or integration tests
    }

    @Before("(@smoke or @regression) and not @wip")
    public void setupForRealTests() {
        // For smoke or regression, but skip work-in-progress
    }
}
```

### Hook Ordering

Control the order of hook execution when you have multiple hooks of the same type:

```java
public class OrderedHooks {

    // Lower order values run first for @Before hooks
    @Before(order = 1)
    public void firstSetup() {
        System.out.println("1. Initialize test environment");
    }

    @Before(order = 2)
    public void secondSetup() {
        System.out.println("2. Setup test data");
    }

    @Before(order = 3)
    public void thirdSetup() {
        System.out.println("3. Navigate to application");
    }

    // Higher order values run first for @After hooks (reverse order)
    @After(order = 3)
    public void firstCleanup() {
        System.out.println("1. Capture final state");
    }

    @After(order = 2)
    public void secondCleanup() {
        System.out.println("2. Cleanup test data");
    }

    @After(order = 1)
    public void thirdCleanup() {
        System.out.println("3. Close resources");
    }
}
```

:::tip Hook Order Memory Aid
- **@Before**: Lower numbers run first (1, 2, 3...)
- **@After**: Higher numbers run first (...3, 2, 1)

Think of it as wrapping: setup builds up, teardown unwinds in reverse.
:::

### Screenplay-Specific Hooks

When using the Screenplay pattern, set up actors in hooks:

```java
package com.example.hooks;

import io.cucumber.java.*;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;
import net.serenitybdd.screenplay.abilities.BrowseTheWeb;

public class ScreenplayHooks {

    @Before
    public void setTheStage() {
        OnStage.setTheStage(new OnlineCast());
    }

    @After
    public void drawTheCurtain() {
        OnStage.drawTheCurtain();
    }
}
```

For Playwright-based tests:

```java
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;

public class PlaywrightHooks {

    @Before
    public void setTheStage() {
        OnStage.setTheStage(Cast.whereEveryoneCan(
            BrowseTheWebWithPlaywright.usingTheDefaultConfiguration()
        ));
    }
}
```

## Custom Parameter Types

Cucumber expressions support custom parameter types that transform step arguments into domain objects.

### Defining Custom Parameter Types

```java
package com.example.parameters;

import io.cucumber.java.ParameterType;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class CustomParameters {

    // Transform "today", "tomorrow", "yesterday" into LocalDate
    @ParameterType("today|tomorrow|yesterday|\\d{4}-\\d{2}-\\d{2}")
    public LocalDate date(String value) {
        return switch (value) {
            case "today" -> LocalDate.now();
            case "tomorrow" -> LocalDate.now().plusDays(1);
            case "yesterday" -> LocalDate.now().minusDays(1);
            default -> LocalDate.parse(value);
        };
    }

    // Transform currency amounts like "$100.50" or "€50"
    @ParameterType("\\$[\\d,]+\\.?\\d*|€[\\d,]+\\.?\\d*|£[\\d,]+\\.?\\d*")
    public Money money(String value) {
        String currency = value.substring(0, 1);
        double amount = Double.parseDouble(value.substring(1).replace(",", ""));
        return new Money(amount, currency);
    }

    // Transform user roles
    @ParameterType("admin|manager|user|guest")
    public UserRole role(String value) {
        return UserRole.valueOf(value.toUpperCase());
    }
}
```

### Using Custom Parameters in Steps

```gherkin
Feature: Order Management

  Scenario: Schedule order for delivery
    Given an order placed on 2024-01-15
    When I schedule delivery for tomorrow
    Then the delivery date should be after today

  Scenario: Apply discount to order
    Given an order totaling $150.00
    When a manager applies a 10% discount
    Then the new total should be $135.00
```

```java
public class OrderSteps {

    @Given("an order placed on {date}")
    public void anOrderPlacedOn(LocalDate orderDate) {
        // orderDate is already a LocalDate object
        theActorInTheSpotlight().remember("orderDate", orderDate);
    }

    @When("I schedule delivery for {date}")
    public void scheduleDeliveryFor(LocalDate deliveryDate) {
        theActorInTheSpotlight().attemptsTo(
            ScheduleDelivery.forDate(deliveryDate)
        );
    }

    @Given("an order totaling {money}")
    public void anOrderTotaling(Money total) {
        // total is a Money object with amount and currency
        theActorInTheSpotlight().attemptsTo(
            CreateOrder.withTotal(total)
        );
    }

    @When("a {role} applies a {int}% discount")
    public void applyDiscount(UserRole role, int percentage) {
        // role is a UserRole enum
        theActorInTheSpotlight().attemptsTo(
            ApplyDiscount.of(percentage).asA(role)
        );
    }
}
```

### Actor Parameter Type

Serenity BDD provides a built-in `{actor}` parameter type:

```gherkin
Scenario: Multiple users interact
  Given Alice has items in her cart
  And Bob is browsing the catalog
  When Alice proceeds to checkout
  And Bob adds a laptop to his cart
  Then Alice should see the payment page
  And Bob should have 1 item in his cart
```

```java
public class MultiActorSteps {

    @Given("{actor} has items in her/his cart")
    public void hasItemsInCart(Actor actor) {
        actor.attemptsTo(
            AddToCart.item("Sample Product")
        );
    }

    @When("{actor} proceeds to checkout")
    public void proceedsToCheckout(Actor actor) {
        actor.attemptsTo(
            NavigateTo.theCheckoutPage()
        );
    }

    @Then("{actor} should have {int} item(s) in her/his cart")
    public void shouldHaveItemsInCart(Actor actor, int count) {
        actor.should(
            seeThat(TheCart.itemCount(), equalTo(count))
        );
    }
}
```

## Complex Data Table Patterns

Data tables are powerful for passing structured data to steps.

### Basic Data Table Transformations

```gherkin
Scenario: Create multiple products
  Given the following products exist:
    | name        | price  | category    | inStock |
    | Laptop      | 999.99 | Electronics | true    |
    | Headphones  | 149.99 | Electronics | true    |
    | Desk Chair  | 299.99 | Furniture   | false   |
```

**Using DataTable directly:**

```java
@Given("the following products exist:")
public void createProducts(DataTable dataTable) {
    List<Map<String, String>> rows = dataTable.asMaps();
    for (Map<String, String> row : rows) {
        String name = row.get("name");
        double price = Double.parseDouble(row.get("price"));
        String category = row.get("category");
        boolean inStock = Boolean.parseBoolean(row.get("inStock"));
        // Create product...
    }
}
```

**Automatic transformation to POJOs:**

```java
public class Product {
    private String name;
    private double price;
    private String category;
    private boolean inStock;

    // Getters and setters...
}

@Given("the following products exist:")
public void createProducts(List<Product> products) {
    // Cucumber automatically transforms rows to Product objects
    for (Product product : products) {
        theActorInTheSpotlight().attemptsTo(
            CreateProduct.withDetails(product)
        );
    }
}
```

### DataTableType for Custom Transformations

```java
package com.example.parameters;

import io.cucumber.java.DataTableType;
import java.util.Map;

public class DataTableTypes {

    @DataTableType
    public Product productEntry(Map<String, String> entry) {
        Product product = new Product();
        product.setName(entry.get("name"));
        product.setPrice(parsePrice(entry.get("price")));
        product.setCategory(entry.get("category"));
        product.setInStock("yes".equalsIgnoreCase(entry.get("available")));

        // Handle optional fields
        if (entry.containsKey("sku")) {
            product.setSku(entry.get("sku"));
        }

        return product;
    }

    @DataTableType
    public Address addressEntry(Map<String, String> entry) {
        return Address.builder()
            .street(entry.get("street"))
            .city(entry.get("city"))
            .state(entry.get("state"))
            .zipCode(entry.get("zip"))
            .country(entry.getOrDefault("country", "USA"))
            .build();
    }

    private double parsePrice(String price) {
        return Double.parseDouble(price.replace("$", "").replace(",", ""));
    }
}
```

### Vertical Data Tables

For single-entity data, use vertical tables:

```gherkin
Scenario: Create a detailed user profile
  Given a user with the following details:
    | First Name    | John              |
    | Last Name     | Smith             |
    | Email         | john@example.com  |
    | Phone         | +1-555-123-4567   |
    | Date of Birth | 1990-05-15        |
    | Role          | Premium Member    |
```

```java
@Given("a user with the following details:")
public void createUser(DataTable dataTable) {
    Map<String, String> userData = dataTable.asMap();

    UserProfile profile = UserProfile.builder()
        .firstName(userData.get("First Name"))
        .lastName(userData.get("Last Name"))
        .email(userData.get("Email"))
        .phone(userData.get("Phone"))
        .dateOfBirth(LocalDate.parse(userData.get("Date of Birth")))
        .role(userData.get("Role"))
        .build();

    theActorInTheSpotlight().attemptsTo(
        CreateUserProfile.with(profile)
    );
}
```

### Nested Data Structures

For complex data, combine tables with scenario outlines:

```gherkin
Scenario Outline: Validate order with multiple items
  Given a customer places an order with:
    | product   | quantity | unit price |
    | <item1>   | <qty1>   | <price1>   |
    | <item2>   | <qty2>   | <price2>   |
  When the order is processed
  Then the order total should be <total>

  Examples:
    | item1     | qty1 | price1 | item2      | qty2 | price2 | total   |
    | Laptop    | 1    | $999   | Mouse      | 2    | $25    | $1049   |
    | Monitor   | 2    | $300   | Keyboard   | 1    | $75    | $675    |
```

## Doc Strings for Long-Form Content

Use doc strings for multi-line text content:

```gherkin
Scenario: Submit a support ticket
  Given the customer has a billing issue
  When they submit a support ticket with:
    """
    Subject: Incorrect charge on my account

    Hello,

    I noticed an incorrect charge of $49.99 on my account
    dated January 15th. I did not authorize this transaction.

    Please investigate and refund the amount.

    Thank you,
    John Smith
    Account: JS-12345
    """
  Then a ticket should be created with priority "High"
```

```java
@When("they submit a support ticket with:")
public void submitTicket(String ticketContent) {
    theActorInTheSpotlight().attemptsTo(
        SubmitSupportTicket.withContent(ticketContent)
    );
}
```

### Doc Strings with Content Types

Specify the content type for structured data:

```gherkin
Scenario: Create product via API
  When I send a POST request to "/api/products" with:
    """json
    {
      "name": "Wireless Keyboard",
      "price": 79.99,
      "category": "Electronics",
      "specifications": {
        "connection": "Bluetooth 5.0",
        "battery": "AAA x 2",
        "warranty": "2 years"
      }
    }
    """
  Then the response status should be 201
```

```java
@When("I send a POST request to {string} with:")
public void sendPostRequest(String endpoint, String jsonBody) {
    theActorInTheSpotlight().attemptsTo(
        Post.to(endpoint).with(request -> request
            .contentType(ContentType.JSON)
            .body(jsonBody)
        )
    );
}
```

## Sharing State Between Steps

Managing state across steps is crucial for maintainable tests.

### Using Actor Memory (Screenplay Pattern)

The recommended approach with Screenplay:

```java
public class OrderSteps {

    @Given("a customer creates an order")
    public void createOrder() {
        String orderId = UUID.randomUUID().toString();

        theActorInTheSpotlight().attemptsTo(
            CreateOrder.withId(orderId)
        );

        // Store for later steps
        theActorInTheSpotlight().remember("orderId", orderId);
    }

    @When("the customer adds {string} to the order")
    public void addItem(String item) {
        String orderId = theActorInTheSpotlight().recall("orderId");

        theActorInTheSpotlight().attemptsTo(
            AddToOrder.item(item).forOrder(orderId)
        );
    }

    @Then("the order should contain {int} items")
    public void verifyItemCount(int expectedCount) {
        String orderId = theActorInTheSpotlight().recall("orderId");

        theActorInTheSpotlight().should(
            seeThat(TheOrder.withId(orderId).itemCount(), equalTo(expectedCount))
        );
    }
}
```

### Typed Memory with Generics

Create type-safe memory keys:

```java
public class MemoryKeys {
    public static final String ORDER_ID = "orderId";
    public static final String CUSTOMER = "customer";
    public static final String CART_ITEMS = "cartItems";
}

// Usage
actor.remember(MemoryKeys.ORDER_ID, orderId);
String id = actor.recall(MemoryKeys.ORDER_ID);
```

### Using World Objects (Dependency Injection)

For complex state management, use Cucumber's dependency injection:

**With PicoContainer (default):**

```java
// Shared state class
public class TestContext {
    private Order currentOrder;
    private Customer currentCustomer;
    private List<String> capturedErrors = new ArrayList<>();

    public Order getCurrentOrder() { return currentOrder; }
    public void setCurrentOrder(Order order) { this.currentOrder = order; }

    public Customer getCurrentCustomer() { return currentCustomer; }
    public void setCurrentCustomer(Customer customer) { this.currentCustomer = customer; }

    public void addError(String error) { capturedErrors.add(error); }
    public List<String> getErrors() { return capturedErrors; }
}

// Step definitions receive TestContext via constructor injection
public class OrderSteps {
    private final TestContext context;

    public OrderSteps(TestContext context) {
        this.context = context;
    }

    @Given("a customer creates an order")
    public void createOrder() {
        Order order = new Order();
        context.setCurrentOrder(order);
    }

    @When("an error occurs: {string}")
    public void captureError(String error) {
        context.addError(error);
    }
}
```

**Add PicoContainer dependency:**

```xml
<dependency>
    <groupId>io.cucumber</groupId>
    <artifactId>cucumber-picocontainer</artifactId>
    <version>${cucumber.version}</version>
    <scope>test</scope>
</dependency>
```

## Error Handling Patterns

Handle errors gracefully in step definitions.

### Expected Errors Pattern

```gherkin
Scenario: Prevent checkout with empty cart
  Given a customer with an empty cart
  When they attempt to checkout
  Then they should see an error: "Your cart is empty"
```

```java
public class ErrorSteps {

    @When("they attempt to checkout")
    public void attemptCheckout() {
        try {
            theActorInTheSpotlight().attemptsTo(
                ProceedToCheckout.now()
            );
            // Store that no error occurred
            theActorInTheSpotlight().remember("checkoutError", null);
        } catch (CheckoutException e) {
            // Store the error for verification
            theActorInTheSpotlight().remember("checkoutError", e.getMessage());
        }
    }

    @Then("they should see an error: {string}")
    public void shouldSeeError(String expectedError) {
        String actualError = theActorInTheSpotlight().recall("checkoutError");
        assertThat(actualError).isEqualTo(expectedError);
    }
}
```

### Using Questions for Error States

A cleaner approach with Screenplay:

```java
public class ErrorMessage implements Question<String> {

    public static Question<String> displayed() {
        return new ErrorMessage();
    }

    @Override
    public String answeredBy(Actor actor) {
        return Text.of(".error-message").answeredBy(actor);
    }
}

// In steps
@Then("they should see an error: {string}")
public void shouldSeeError(String expectedError) {
    theActorInTheSpotlight().should(
        seeThat(ErrorMessage.displayed(), equalTo(expectedError))
    );
}
```

### Soft Assertions for Multiple Checks

```java
@Then("the order summary should show:")
public void verifyOrderSummary(DataTable expected) {
    Actor actor = theActorInTheSpotlight();

    actor.attemptsTo(
        Ensure.that(OrderSummary.subtotal()).isEqualTo(expected.get("subtotal")),
        Ensure.that(OrderSummary.tax()).isEqualTo(expected.get("tax")),
        Ensure.that(OrderSummary.shipping()).isEqualTo(expected.get("shipping")),
        Ensure.that(OrderSummary.total()).isEqualTo(expected.get("total"))
    );
}
```

## Step Definition Organization

### One Class Per Feature Area

Organize step definitions by domain area:

```
src/test/java/com/example/stepdefinitions/
├── authentication/
│   ├── LoginSteps.java
│   ├── RegistrationSteps.java
│   └── PasswordResetSteps.java
├── shopping/
│   ├── CartSteps.java
│   ├── CheckoutSteps.java
│   └── PaymentSteps.java
├── common/
│   ├── NavigationSteps.java
│   └── VerificationSteps.java
└── hooks/
    ├── ScreenplayHooks.java
    └── DatabaseHooks.java
```

### Thin Steps, Rich Tasks

Keep step definitions thin by delegating to Screenplay tasks:

```java
// Bad: Logic in step definition
@When("the customer adds {string} to their cart")
public void addToCart(String productName) {
    WebDriver driver = getDriver();
    driver.findElement(By.cssSelector(".search-input")).sendKeys(productName);
    driver.findElement(By.cssSelector(".search-button")).click();
    WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".product-card")));
    driver.findElement(By.cssSelector(".add-to-cart-button")).click();
    wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".cart-updated")));
}

// Good: Delegate to Task
@When("the customer adds {string} to their cart")
public void addToCart(String productName) {
    theActorInTheSpotlight().attemptsTo(
        AddToCart.theProduct(productName)
    );
}
```

### Reusable Step Patterns

Create generic steps that work across features:

```java
public class CommonSteps {

    @Given("{actor} is on the {word} page")
    public void navigateToPage(Actor actor, String pageName) {
        actor.attemptsTo(
            NavigateTo.thePage(pageName)
        );
    }

    @Then("{actor} should see the message {string}")
    public void shouldSeeMessage(Actor actor, String message) {
        actor.should(
            seeThat(TheVisibleText.onPage(), containsString(message))
        );
    }

    @Then("{actor} should see {int} {word} displayed")
    public void shouldSeeCount(Actor actor, int count, String elementType) {
        actor.should(
            seeThat(TheCount.of(elementType), equalTo(count))
        );
    }
}
```

## Background Best Practices

### Keep Backgrounds Simple

```gherkin
# Good: Simple, essential setup
Background:
  Given the user is logged in as "admin"

# Bad: Too much detail in background
Background:
  Given a user with email "admin@example.com" exists
  And the user has password "SecurePass123!"
  And the user has role "administrator"
  And the user's account is active
  And the user has accepted terms of service
  When the user navigates to the login page
  And enters their credentials
  And clicks the login button
  Then they should be on the dashboard
```

### Use Tags to Share Backgrounds

```gherkin
@authenticated
Feature: Shopping Cart

  # This feature assumes user is logged in
  # The @authenticated hook handles login

  Scenario: Add item to cart
    When I search for "laptop"
    And I add the first result to my cart
    Then my cart should have 1 item
```

```java
@Before("@authenticated")
public void loginAsDefaultUser() {
    OnStage.theActorCalled("Customer").attemptsTo(
        Login.withCredentials("testuser", "password123")
    );
}
```

## Scenario Outline Patterns

### Dynamic Examples with Tags

```gherkin
@smoke
Scenario Outline: Quick login validation
  Given I am on the login page
  When I login as "<userType>"
  Then I should see the "<dashboard>" dashboard

  @admin
  Examples: Admin Users
    | userType     | dashboard    |
    | super_admin  | Super Admin  |
    | site_admin   | Site Admin   |

  @regular
  Examples: Regular Users
    | userType     | dashboard    |
    | premium      | Premium      |
    | standard     | Standard     |
```

### Example Tables from External Sources

Load examples from files or databases:

```java
public class DynamicExamples {

    @ParameterType(".*\\.csv")
    public List<Map<String, String>> csvFile(String filename) {
        return CsvReader.read("src/test/resources/data/" + filename);
    }
}
```

## Integration: Screenplay vs Page Objects

You can use either pattern with Cucumber, or even mix them.

### Pure Screenplay Approach

```java
public class CheckoutSteps {

    @When("{actor} completes checkout with card ending in {string}")
    public void completeCheckout(Actor actor, String lastFourDigits) {
        actor.attemptsTo(
            CompleteCheckout.withCard(lastFourDigits)
        );
    }

    @Then("{actor} should receive order confirmation")
    public void shouldReceiveConfirmation(Actor actor) {
        actor.should(
            seeThat(OrderConfirmation.isDisplayed(), is(true)),
            seeThat(OrderConfirmation.orderNumber(), not(emptyString()))
        );
    }
}
```

### Page Object Approach

```java
public class CheckoutSteps {

    @Steps
    CheckoutPage checkoutPage;

    @Steps
    ConfirmationPage confirmationPage;

    @When("the user completes checkout with card ending in {string}")
    public void completeCheckout(String lastFourDigits) {
        checkoutPage.enterCardEndingIn(lastFourDigits);
        checkoutPage.submitOrder();
    }

    @Then("the user should receive order confirmation")
    public void shouldReceiveConfirmation() {
        assertThat(confirmationPage.isDisplayed()).isTrue();
        assertThat(confirmationPage.getOrderNumber()).isNotEmpty();
    }
}
```

### Hybrid Approach

Use Page Objects for simple pages, Screenplay for complex flows:

```java
public class HybridSteps {

    @Steps
    LoginPage loginPage;  // Simple page, use Page Object

    @When("the user logs in with valid credentials")
    public void login() {
        loginPage.loginAs("user@example.com", "password");
    }

    @When("{actor} completes the multi-step registration")
    public void completeRegistration(Actor actor) {
        // Complex flow, use Screenplay
        actor.attemptsTo(
            CompleteRegistration.withDefaults()
        );
    }
}
```

## Performance Optimization

### Parallel Execution with Isolated State

Ensure your hooks and state management are thread-safe:

```java
public class ThreadSafeHooks {

    // ThreadLocal for parallel execution
    private static final ThreadLocal<TestContext> contextHolder = new ThreadLocal<>();

    @Before
    public void setUp() {
        contextHolder.set(new TestContext());
    }

    @After
    public void tearDown() {
        contextHolder.remove();
    }

    public static TestContext getContext() {
        return contextHolder.get();
    }
}
```

### Lazy Initialization

Don't initialize resources until needed:

```java
public class LazyDriverHooks {

    @Before("@ui")
    public void initializeDriver() {
        // Only create browser for UI tests
        OnStage.setTheStage(new OnlineCast());
    }

    @Before("@api")
    public void initializeApiClient() {
        // Only create API client for API tests
        OnStage.setTheStage(Cast.whereEveryoneCan(
            CallAnApi.at(baseUrl)
        ));
    }
}
```

## Debugging Tips

### Verbose Logging in Hooks

```java
@BeforeStep
public void logStepStart() {
    System.out.println(">>> Starting step at " + LocalDateTime.now());
}

@AfterStep
public void logStepEnd(Scenario scenario) {
    System.out.println("<<< Step completed, scenario status: " + scenario.getStatus());
}
```

### Capture State on Failure

```java
@After
public void captureOnFailure(Scenario scenario) {
    if (scenario.isFailed()) {
        // Capture screenshot
        byte[] screenshot = theActorInTheSpotlight()
            .usingAbilityTo(BrowseTheWeb.class)
            .takeScreenshot();
        scenario.attach(screenshot, "image/png", "failure-screenshot");

        // Capture page source
        String pageSource = theActorInTheSpotlight()
            .asksFor(ThePageSource.current());
        scenario.attach(pageSource, "text/html", "page-source");

        // Capture browser console
        List<String> consoleLogs = theActorInTheSpotlight()
            .asksFor(ConsoleMessages.all());
        scenario.attach(String.join("\n", consoleLogs), "text/plain", "console-logs");
    }
}
```

## Summary

These advanced patterns help you build maintainable, scalable Cucumber test suites:

| Pattern | When to Use |
|---------|-------------|
| Tagged Hooks | Conditional setup/teardown based on scenario tags |
| Ordered Hooks | Control execution order of multiple hooks |
| Custom Parameters | Transform step arguments to domain objects |
| Data Table Types | Automatic transformation of table rows |
| Actor Memory | Share state between steps (Screenplay) |
| World Objects | Complex state with dependency injection |
| Thin Steps | Keep steps minimal, delegate to tasks |
| Soft Assertions | Verify multiple conditions before failing |

## Next Steps

- Explore [Parallel Execution](parallel-execution) for faster test runs
- Learn about [Cucumber Configuration](configuration-reference) options
- Master the [Screenplay Pattern](/docs/screenplay/screenplay_fundamentals)
- Review [Serenity Reporting](/docs/reporting/the_serenity_reports) for rich documentation

## Additional Resources

- [Cucumber Expressions Documentation](https://cucumber.io/docs/cucumber/cucumber-expressions/)
- [Cucumber Hooks Reference](https://cucumber.io/docs/cucumber/api/#hooks)
- [Serenity BDD Screenplay Guide](/docs/screenplay/screenplay_fundamentals)
