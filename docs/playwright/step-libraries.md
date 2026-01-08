---
id: playwright_step_libraries
title: Step Libraries
sidebar_position: 4
---

# Step Libraries with Playwright

Step Libraries are the bridge between your tests and Page Objects. They provide Serenity's rich reporting capabilities through `@Step` annotations while keeping your tests clean and readable.

## The Three-Layer Architecture

```
Test Class
    │  Uses @Steps to inject step libraries
    │  Focuses on business scenarios
    ▼
Step Library
    │  @Step methods appear in reports
    │  Orchestrates Page Object actions
    ▼
Page Object
       Encapsulates locators
       Handles page interactions
```

## Creating Step Libraries

### Basic Structure

```java
public class ShoppingCartSteps {

    private ShoppingCartPage cartPage;

    // Initialize Page Object when needed
    private void ensurePageObject(Page page) {
        if (cartPage == null) {
            cartPage = new ShoppingCartPage(page);
        }
    }

    @Step("Add product '{1}' to cart")
    public void addProductToCart(Page page, String productName) {
        ensurePageObject(page);
        cartPage.addProduct(productName);
    }

    @Step("Verify cart contains {1} items")
    public void verifyCartItemCount(Page page, int expectedCount) {
        ensurePageObject(page);
        assertThat(cartPage.getItemCount())
            .as("Cart item count")
            .isEqualTo(expectedCount);
    }

    @Step("Proceed to checkout")
    public void proceedToCheckout(Page page) {
        ensurePageObject(page);
        cartPage.clickCheckout();
    }
}
```

### Using Step Libraries in Tests

Inject step libraries using the `@Steps` annotation:

```java
@ExtendWith(SerenityJUnit5Extension.class)
class ShoppingTest {

    @Steps
    ShoppingCartSteps cart;

    @Steps
    ProductSteps products;

    @Steps
    CheckoutSteps checkout;

    private Page page;

    @Test
    void shouldCompleteAPurchase() {
        products.browseCategory(page, "Electronics");
        products.selectProduct(page, "Laptop Pro");
        cart.addProductToCart(page, "Laptop Pro");
        cart.verifyCartItemCount(page, 1);
        cart.proceedToCheckout(page);
        checkout.completeOrder(page);
    }
}
```

## The @Step Annotation

### Step Descriptions

Use parameter placeholders in step descriptions:

```java
@Step("Search for '{1}'")
public void searchFor(Page page, String term) { ... }

@Step("Add {1} units of '{2}' to cart")
public void addToCart(Page page, int quantity, String product) { ... }

@Step("Verify total is ${1}")
public void verifyTotal(Page page, BigDecimal expectedTotal) { ... }
```

Parameter indices are zero-based: `{0}` is the first parameter, `{1}` is the second, etc.

### Nested Steps

Steps can call other steps for hierarchical reporting:

```java
@Step("Complete checkout with credit card")
public void completeCheckoutWithCreditCard(Page page, CreditCard card) {
    enterBillingAddress(page, card.getBillingAddress());
    enterCardDetails(page, card);
    submitPayment(page);
}

@Step("Enter billing address")
public void enterBillingAddress(Page page, Address address) {
    checkoutPage.enterAddress(address);
}

@Step("Enter card details")
public void enterCardDetails(Page page, CreditCard card) {
    checkoutPage.enterCardNumber(card.getNumber());
    checkoutPage.enterExpiry(card.getExpiry());
    checkoutPage.enterCvv(card.getCvv());
}

@Step("Submit payment")
public void submitPayment(Page page) {
    checkoutPage.clickPay();
}
```

## Page-Aware Steps

For cleaner step signatures, use `PlaywrightSerenity.getCurrentPage()`:

```java
public class NavigationSteps {

    @Step("Navigate to {0}")
    public void navigateTo(String url) {
        Page page = PlaywrightSerenity.getCurrentPage();
        page.navigate(url);
    }

    @Step("Refresh the page")
    public void refreshPage() {
        PlaywrightSerenity.getCurrentPage().reload();
    }

    @Step("Go back")
    public void goBack() {
        PlaywrightSerenity.getCurrentPage().goBack();
    }
}
```

Usage in tests:

```java
@Test
void shouldNavigateBetweenPages() {
    // No need to pass page parameter
    navigation.navigateTo("https://example.com");
    navigation.refreshPage();
    navigation.goBack();
}
```

:::caution
When using `getCurrentPage()`, ensure you've registered the page with `PlaywrightSerenity.registerPage(page)` before calling any steps.
:::

## Screenshot Capture

### Automatic Screenshots

Screenshots are captured automatically after each `@Step` method completes. This is handled by the `PlaywrightStepListener`.

### Manual Screenshots

Trigger additional screenshots at specific points:

```java
@Step("Capture current state")
public void captureCurrentState(Page page) {
    // Do some actions
    performComplexAction(page);

    // Capture a screenshot manually
    PlaywrightSerenity.takeScreenshot();

    // Continue with more actions
    performAnotherAction(page);
}
```

## Organizing Step Libraries

### By Feature Area

```
steps/
├── authentication/
│   ├── LoginSteps.java
│   └── RegistrationSteps.java
├── shopping/
│   ├── ProductSteps.java
│   ├── CartSteps.java
│   └── CheckoutSteps.java
└── account/
    ├── ProfileSteps.java
    └── OrderHistorySteps.java
```

### By User Journey

```
steps/
├── BuyerSteps.java      // All steps for a buyer persona
├── SellerSteps.java     // All steps for a seller persona
└── AdminSteps.java      // All steps for an admin
```

## Best Practices

### 1. Keep Steps Focused

Each step should represent one logical user action:

```java
// ❌ Bad: Too many things in one step
@Step("Login and add product to cart")
public void loginAndAddToCart(Page page, User user, String product) {
    // Too much happening here
}

// ✅ Good: Focused, single-purpose steps
@Step("Login as {1}")
public void login(Page page, User user) { ... }

@Step("Add '{1}' to cart")
public void addToCart(Page page, String product) { ... }
```

### 2. Use Business Language

Steps should read like natural language:

```java
// ❌ Bad: Technical language
@Step("Click submit button")
@Step("Fill input field with value")

// ✅ Good: Business language
@Step("Submit the order")
@Step("Enter shipping address")
```

### 3. Handle State Carefully

Be mindful of state between step calls:

```java
public class AccountSteps {
    private AccountPage accountPage;
    private User currentUser;  // Track state when needed

    @Step("Login as {1}")
    public void loginAs(Page page, User user) {
        // Store for later steps
        this.currentUser = user;
        loginPage.loginAs(user.getEmail(), user.getPassword());
    }

    @Step("Verify welcome message shows user's name")
    public void verifyWelcomeMessage(Page page) {
        assertThat(accountPage.getWelcomeMessage())
            .contains(currentUser.getFirstName());
    }
}
```

### 4. Make Assertions Clear

Include descriptive assertions in verification steps:

```java
@Step("Verify order total is ${1}")
public void verifyOrderTotal(Page page, BigDecimal expectedTotal) {
    BigDecimal actualTotal = checkoutPage.getOrderTotal();
    assertThat(actualTotal)
        .as("Order total")
        .isEqualByComparingTo(expectedTotal);
}

@Step("Verify error message is displayed")
public void verifyErrorMessageDisplayed(Page page, String expectedMessage) {
    assertThat(errorPage.getMessage())
        .as("Error message")
        .containsIgnoringCase(expectedMessage);
}
```

### 5. Compose Higher-Level Steps

Build complex workflows from simpler steps:

```java
@Step("Complete guest checkout")
public void completeGuestCheckout(Page page, Address address, CreditCard card) {
    enterShippingAddress(page, address);
    selectShippingMethod(page, "Standard");
    enterPaymentDetails(page, card);
    confirmOrder(page);
}
```

This creates a hierarchical report showing both the high-level step and its constituent parts.
