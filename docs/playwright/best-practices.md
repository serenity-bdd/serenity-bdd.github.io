---
id: playwright_best_practices
title: Best Practices
sidebar_position: 6
---

# Best Practices

This guide covers best practices for writing maintainable, reliable, and efficient Serenity Playwright tests.

## Test Architecture

### Follow the Three-Layer Pattern

Always structure your code in three layers:

```
Tests (business scenarios)
    └── Step Libraries (reporting with @Step)
          └── Page Objects (locators and actions)
```

This separation provides:
- **Maintainability** - Changes to UI only affect Page Objects
- **Readability** - Tests read like specifications
- **Reusability** - Steps and Page Objects can be shared

### Keep Tests Focused

Each test should verify one specific behavior:

```java
// ❌ Bad: Testing too many things
@Test
void testEverything() {
    login();
    searchForProduct();
    addToCart();
    checkout();
    verifyOrderConfirmation();
    logout();
    verifyLoggedOut();
}

// ✅ Good: Focused tests
@Test
void shouldAddProductToCart() {
    // Given
    products.searchFor(page, "laptop");

    // When
    cart.addFirstResultToCart(page);

    // Then
    cart.verifyCartContains(page, "laptop");
}

@Test
void shouldCompleteCheckout() {
    // Given
    cart.hasItemsInCart(page);

    // When
    checkout.completeOrder(page);

    // Then
    checkout.verifyOrderConfirmation(page);
}
```

## Browser Management

### Share Browser, Isolate Pages

Create the browser once per test class, but create a fresh page for each test:

```java
@ExtendWith(SerenityJUnit5Extension.class)
class ProductTests {

    private static Playwright playwright;
    private static Browser browser;
    private Page page;

    @BeforeAll
    static void setupBrowser() {
        // Create browser once - expensive operation
        playwright = Playwright.create();
        browser = playwright.chromium().launch(
            new BrowserType.LaunchOptions().setHeadless(true)
        );
    }

    @AfterAll
    static void closeBrowser() {
        // Close browser after all tests
        if (browser != null) browser.close();
        if (playwright != null) playwright.close();
    }

    @BeforeEach
    void setupPage() {
        // Fresh page for each test - test isolation
        page = browser.newPage();
        PlaywrightSerenity.registerPage(page);
    }

    @AfterEach
    void closePage() {
        // Clean up after each test
        PlaywrightSerenity.unregisterPage(page);
        if (page != null) page.close();
    }
}
```

### Use Browser Contexts for Isolation

For complete test isolation, use browser contexts:

```java
@BeforeEach
void setup() {
    // Each context is completely isolated
    BrowserContext context = browser.newContext();
    page = context.newPage();
    PlaywrightSerenity.registerPage(page);
}

@AfterEach
void cleanup() {
    PlaywrightSerenity.unregisterPage(page);
    BrowserContext context = page.context();
    page.close();
    context.close();  // Closes all pages and clears cookies/storage
}
```

## Locator Strategies

### Prefer Resilient Locators

Use locators in this order of preference:

1. **Role-based** - Most resilient, uses accessibility semantics
2. **Text-based** - Good for user-visible text
3. **Label-based** - Good for form fields
4. **Test IDs** - Good for elements without semantic meaning
5. **CSS/XPath** - Last resort

```java
// 1. Role-based (best)
page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Submit"));

// 2. Text-based
page.getByText("Add to Cart");

// 3. Label-based
page.getByLabel("Email address");

// 4. Test ID
page.getByTestId("checkout-button");

// 5. CSS (avoid if possible)
page.locator("button.submit-btn");
```

### Avoid Brittle Locators

```java
// ❌ Brittle locators
page.locator("div:nth-child(3) > button");
page.locator(".btn-primary");
page.locator("//div[@class='container']/form/button[2]");

// ✅ Resilient locators
page.getByRole(AriaRole.BUTTON, opts -> opts.setName("Place Order"));
page.getByTestId("place-order-button");
```

### Use Chained Locators for Context

When the same element type appears multiple times:

```java
// Find the "Add" button within the first product card
page.locator("[data-testid='product-card']").first()
    .getByRole(AriaRole.BUTTON, new GetByRoleOptions().setName("Add"));

// Find the email field in the shipping section
page.locator("#shipping-section")
    .getByLabel("Email");
```

## Waiting Strategies

### Trust Playwright's Auto-Waiting

Playwright automatically waits for elements to be actionable. Don't add unnecessary waits:

```java
// ❌ Unnecessary - Playwright already waits
Thread.sleep(2000);
page.locator("#button").waitFor();
page.locator("#button").click();

// ✅ Just click - Playwright waits automatically
page.locator("#button").click();
```

### Use Explicit Waits When Needed

For specific conditions, use explicit waits:

```java
// Wait for navigation to complete
page.waitForURL("**/checkout");

// Wait for network requests to finish
page.waitForLoadState(LoadState.NETWORKIDLE);

// Wait for a specific condition
page.waitForCondition(() -> getItemCount() >= 5);

// Wait for element to be hidden
loadingSpinner().waitFor(new WaitForOptions()
    .setState(WaitForSelectorState.HIDDEN));
```

## Error Handling

### Provide Clear Assertions

Use descriptive assertion messages:

```java
@Step("Verify cart total is ${1}")
public void verifyCartTotal(Page page, BigDecimal expected) {
    BigDecimal actual = cartPage.getTotal();
    assertThat(actual)
        .as("Cart total should be $%s but was $%s", expected, actual)
        .isEqualByComparingTo(expected);
}
```

### Handle Expected Failures Gracefully

```java
@Step("Verify error message is shown")
public void verifyErrorMessage(Page page, String expectedMessage) {
    Locator errorLocator = page.locator(".error-message");

    assertThat(errorLocator.isVisible())
        .as("Error message should be visible")
        .isTrue();

    assertThat(errorLocator.textContent())
        .as("Error message content")
        .contains(expectedMessage);
}
```

## Performance Tips

### Use Headless Mode in CI

```java
boolean isCI = System.getenv("CI") != null;
browser = playwright.chromium().launch(
    new BrowserType.LaunchOptions().setHeadless(isCI)
);
```

### Minimize Browser Launches

Browser launches are expensive. Share browsers across tests:

```java
// One browser per test class
@BeforeAll
static void launchBrowser() { ... }

// NOT: One browser per test
@BeforeEach
void launchBrowser() { ... }  // ❌ Slow!
```

### Use Network Mocking for Speed

Mock slow API calls in tests:

```java
@BeforeEach
void setupMocks() {
    // Mock slow API endpoint
    page.route("**/api/recommendations", route -> {
        route.fulfill(new FulfillOptions()
            .setStatus(200)
            .setBody("[]"));
    });
}
```

## Organizing Tests

### Use Descriptive Test Names

```java
@Test
@DisplayName("Should display error when login fails with invalid password")
void shouldDisplayErrorWhenLoginFailsWithInvalidPassword() {
    // ...
}

@Test
@DisplayName("Should redirect to dashboard after successful login")
void shouldRedirectToDashboardAfterSuccessfulLogin() {
    // ...
}
```

### Group Related Tests

```java
@Nested
@DisplayName("When user is logged in")
class WhenLoggedIn {

    @BeforeEach
    void login() {
        auth.loginAs(page, testUser);
    }

    @Test
    void shouldDisplayWelcomeMessage() { ... }

    @Test
    void shouldShowOrderHistory() { ... }
}

@Nested
@DisplayName("When user is not logged in")
class WhenNotLoggedIn {

    @Test
    void shouldShowLoginPrompt() { ... }

    @Test
    void shouldRedirectToLoginPage() { ... }
}
```

## CI/CD Integration

### Configure for CI Environments

```java
@BeforeAll
static void setup() {
    playwright = Playwright.create();

    BrowserType.LaunchOptions options = new BrowserType.LaunchOptions()
        .setHeadless(true)
        .setArgs(Arrays.asList(
            "--no-sandbox",
            "--disable-dev-shm-usage"
        ));

    browser = playwright.chromium().launch(options);
}
```

### Generate Reports in CI

```yaml
# GitHub Actions example
- name: Run Tests
  run: mvn verify

- name: Upload Serenity Reports
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: serenity-reports
    path: target/site/serenity/
```

## Common Pitfalls

### Avoid Test Interdependencies

```java
// ❌ Bad: Tests depend on each other
@Test
@Order(1)
void createUser() {
    createdUserId = userService.create(user);
}

@Test
@Order(2)
void verifyUser() {
    userService.get(createdUserId);  // Fails if first test fails
}

// ✅ Good: Each test is independent
@Test
void shouldCreateAndVerifyUser() {
    String userId = userService.create(user);
    User retrieved = userService.get(userId);
    assertThat(retrieved).isEqualTo(user);
}
```

### Don't Ignore Flaky Tests

Address flaky tests immediately:

```java
// ❌ Don't do this
@Disabled("Flaky - investigate later")
@Test
void sometimesFailingTest() { ... }

// ✅ Fix the root cause
@Test
void fixedTest() {
    // Wait for specific condition instead of arbitrary sleep
    page.waitForLoadState(LoadState.NETWORKIDLE);
    // Now perform assertion
}
```

### Clean Up Test Data

```java
@AfterEach
void cleanup() {
    // Clean up any test data created
    if (createdOrderId != null) {
        orderService.delete(createdOrderId);
    }
}
```
