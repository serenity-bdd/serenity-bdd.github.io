---
id: playwright_page_objects
title: Page Objects
sidebar_position: 3
---

# Page Objects with Playwright

Page Objects are a design pattern that encapsulates the structure and behavior of a web page. With Playwright and Serenity, Page Objects provide a clean separation between your test logic and page implementation details.

## Why Page Objects?

Without Page Objects, tests become brittle and hard to maintain:

```java
// ❌ Bad: Locators scattered throughout tests
@Test
void searchTest() {
    page.locator("input[name='q']").fill("search term");
    page.locator("button.search-btn").click();
    assertThat(page.locator(".results-count").textContent()).contains("10");
}
```

With Page Objects, tests are clean and maintainable:

```java
// ✅ Good: Locators encapsulated in Page Object
@Test
void searchTest() {
    searchPage.searchFor("search term");
    assertThat(searchPage.getResultCount()).isEqualTo(10);
}
```

## Page Object Structure

A well-designed Page Object has three sections:

```java
public class ProductPage {
    private final Page page;

    public ProductPage(Page page) {
        this.page = page;
    }

    // ========== LOCATORS (private) ==========
    // Encapsulate how elements are found

    private Locator productTitle() {
        return page.locator("h1.product-title");
    }

    private Locator addToCartButton() {
        return page.getByRole(AriaRole.BUTTON,
            new Page.GetByRoleOptions().setName("Add to Cart"));
    }

    private Locator quantityInput() {
        return page.locator("#quantity");
    }

    // ========== ACTIONS (public) ==========
    // Represent user interactions

    public void addToCart() {
        addToCartButton().click();
    }

    public void setQuantity(int quantity) {
        quantityInput().fill(String.valueOf(quantity));
    }

    // ========== QUERIES (public) ==========
    // Return information about page state

    public String getProductTitle() {
        return productTitle().textContent();
    }

    public boolean isAddToCartEnabled() {
        return addToCartButton().isEnabled();
    }
}
```

### Key Principles

1. **Locators are private** - Only the Page Object knows how to find elements
2. **Actions are public** - Expose meaningful user interactions
3. **Queries are public** - Expose ways to check page state
4. **No assertions in Page Objects** - Let the caller decide what to verify

## Playwright Locator Strategies

Playwright offers several ways to locate elements. Use the most resilient strategy for each case:

### Role-Based Locators (Recommended)

These are the most resilient as they use accessibility semantics:

```java
// Find by ARIA role and accessible name
private Locator searchButton() {
    return page.getByRole(AriaRole.BUTTON,
        new Page.GetByRoleOptions().setName("Search"));
}

private Locator emailField() {
    return page.getByRole(AriaRole.TEXTBOX,
        new Page.GetByRoleOptions().setName("Email"));
}

private Locator mainNavigation() {
    return page.getByRole(AriaRole.NAVIGATION);
}
```

### Text-Based Locators

Good for finding elements by visible text:

```java
private Locator submitButton() {
    return page.getByText("Submit Order");
}

private Locator welcomeMessage() {
    return page.getByText("Welcome back", new Page.GetByTextOptions().setExact(false));
}
```

### Label-Based Locators

Find form fields by their associated labels:

```java
private Locator usernameField() {
    return page.getByLabel("Username");
}

private Locator rememberMeCheckbox() {
    return page.getByLabel("Remember me");
}
```

### Test ID Locators

Use data-testid attributes for elements without good semantic identifiers:

```java
private Locator shoppingCart() {
    return page.getByTestId("shopping-cart");
}

private Locator productCard(String productId) {
    return page.getByTestId("product-" + productId);
}
```

### CSS and XPath (Last Resort)

Use only when other strategies aren't available:

```java
private Locator legacyWidget() {
    return page.locator("div.legacy-widget > span.value");
}

private Locator complexElement() {
    return page.locator("xpath=//div[@class='container']//span[contains(text(),'Total')]");
}
```

## Page Object Patterns

### Navigation Methods

Include methods to navigate to the page:

```java
public class LoginPage {
    private final Page page;
    private static final String URL = "/login";

    public void open() {
        page.navigate(URL);
    }

    public void openWithRedirect(String returnUrl) {
        page.navigate(URL + "?redirect=" + returnUrl);
    }
}
```

### Page Transitions

Return new Page Objects when actions navigate to different pages:

```java
public class LoginPage {
    public DashboardPage loginAs(String username, String password) {
        usernameField().fill(username);
        passwordField().fill(password);
        loginButton().click();
        return new DashboardPage(page);
    }
}

// Usage:
DashboardPage dashboard = loginPage.loginAs("user", "pass");
assertThat(dashboard.getWelcomeMessage()).contains("Welcome");
```

### Component Objects

Reuse common UI components across pages:

```java
public class HeaderComponent {
    private final Page page;

    public HeaderComponent(Page page) {
        this.page = page;
    }

    private Locator searchBox() {
        return page.locator("header input[type='search']");
    }

    private Locator cartIcon() {
        return page.locator("header .cart-icon");
    }

    public void search(String term) {
        searchBox().fill(term);
        searchBox().press("Enter");
    }

    public int getCartItemCount() {
        String text = cartIcon().textContent();
        return Integer.parseInt(text);
    }
}

// Use in Page Objects:
public class ProductPage {
    private final Page page;
    private final HeaderComponent header;

    public ProductPage(Page page) {
        this.page = page;
        this.header = new HeaderComponent(page);
    }

    public HeaderComponent header() {
        return header;
    }
}
```

### Waiting Strategies

Playwright auto-waits, but sometimes you need explicit waits:

```java
public class SearchResultsPage {
    public void waitForResults() {
        // Wait for results to load
        resultsContainer().waitFor();
    }

    public void waitForMinimumResults(int count) {
        // Wait until we have enough results
        page.waitForCondition(() -> getResultCount() >= count);
    }

    public void waitForLoadingToComplete() {
        // Wait for loading spinner to disappear
        loadingSpinner().waitFor(new Locator.WaitForOptions()
            .setState(WaitForSelectorState.HIDDEN));
    }
}
```

## Integrating with Step Libraries

Page Objects work alongside Step Libraries. The Step Library handles Serenity reporting while the Page Object handles page interactions:

```java
public class CheckoutSteps {
    private CheckoutPage checkoutPage;
    private OrderConfirmationPage confirmationPage;

    @Step("Enter shipping address")
    public void enterShippingAddress(Address address) {
        checkoutPage.enterAddress(address);
    }

    @Step("Complete the order")
    public void completeOrder() {
        confirmationPage = checkoutPage.submitOrder();
    }

    @Step("Verify order confirmation number is displayed")
    public void verifyOrderConfirmationDisplayed() {
        assertThat(confirmationPage.getOrderNumber())
            .isNotEmpty();
    }
}
```

## Best Practices

### 1. One Page Object Per Page/View

Don't try to represent multiple pages in one class:

```java
// ❌ Bad
public class AllPages { /* too many responsibilities */ }

// ✅ Good
public class LoginPage { /* login only */ }
public class DashboardPage { /* dashboard only */ }
```

### 2. Use Descriptive Method Names

Method names should describe the user intent:

```java
// ❌ Bad
public void click1() { ... }
public void fillForm() { ... }

// ✅ Good
public void addToWishlist() { ... }
public void submitContactForm(String name, String email, String message) { ... }
```

### 3. Avoid Exposing Locators

Never return raw Locator objects:

```java
// ❌ Bad - exposes implementation
public Locator getSubmitButton() {
    return page.locator("#submit");
}

// ✅ Good - exposes behavior
public void submitForm() {
    submitButton().click();
}

public boolean isSubmitEnabled() {
    return submitButton().isEnabled();
}
```

### 4. Handle Dynamic Content

Use parameterized locators for dynamic elements:

```java
public class ProductListPage {
    public void selectProduct(String productName) {
        page.getByRole(AriaRole.LINK,
            new Page.GetByRoleOptions().setName(productName)).click();
    }

    public String getPriceFor(String productName) {
        return page.locator(String.format(
            "[data-product='%s'] .price", productName)).textContent();
    }
}
```
