---
id: playwright_page_objects
title: Page Objects
sidebar_position: 3
---

# Page Object com Playwright

Page Object é um padrão de design que encapsula a estrutura e o comportamento de uma página web. Com Playwright e Serenity, os Page Object fornecem uma separação clara entre sua lógica de teste e os detalhes de implementação da página.

## Por que Page Object?

Sem Page Object, os testes se tornam frágeis e difíceis de manter:

```java
// ❌ Ruim: Locators espalhados pelos testes
@Test
void searchTest() {
    page.locator("input[name='q']").fill("search term");
    page.locator("button.search-btn").click();
    assertThat(page.locator(".results-count").textContent()).contains("10");
}
```

Com Page Object, os testes são limpos e fáceis de manter:

```java
// ✅ Bom: Locators encapsulados no Page Object
@Test
void searchTest() {
    searchPage.searchFor("search term");
    assertThat(searchPage.getResultCount()).isEqualTo(10);
}
```

## Estrutura do Page Object

Um Page Object bem projetado tem três seções:

```java
public class ProductPage {
    private final Page page;

    public ProductPage(Page page) {
        this.page = page;
    }

    // ========== LOCATORS (privados) ==========
    // Encapsulam como os elementos são encontrados

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

    // ========== AÇÕES (públicas) ==========
    // Representam interações do usuário

    public void addToCart() {
        addToCartButton().click();
    }

    public void setQuantity(int quantity) {
        quantityInput().fill(String.valueOf(quantity));
    }

    // ========== CONSULTAS (públicas) ==========
    // Retornam informações sobre o estado da página

    public String getProductTitle() {
        return productTitle().textContent();
    }

    public boolean isAddToCartEnabled() {
        return addToCartButton().isEnabled();
    }
}
```

### Princípios Fundamentais

1. **Locators são privados** - Apenas o Page Object sabe como encontrar elementos
2. **Ações são públicas** - Expõem interações significativas do usuário
3. **Consultas são públicas** - Expõem formas de verificar o estado da página
4. **Sem asserções nos Page Object** - Deixe o chamador decidir o que verificar

## Estratégias de Locator do Playwright

O Playwright oferece várias formas de localizar elementos. Use a estratégia mais resiliente para cada caso:

### Locators Baseados em Role (Recomendado)

Estes são os mais resilientes pois usam semântica de acessibilidade:

```java
// Encontrar por ARIA role e nome acessível
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

### Locators Baseados em Texto

Bons para encontrar elementos por texto visível:

```java
private Locator submitButton() {
    return page.getByText("Submit Order");
}

private Locator welcomeMessage() {
    return page.getByText("Welcome back", new Page.GetByTextOptions().setExact(false));
}
```

### Locators Baseados em Label

Encontre campos de formulário por seus labels associados:

```java
private Locator usernameField() {
    return page.getByLabel("Username");
}

private Locator rememberMeCheckbox() {
    return page.getByLabel("Remember me");
}
```

### Locators por Test ID

Use atributos data-testid para elementos sem bons identificadores semânticos:

```java
private Locator shoppingCart() {
    return page.getByTestId("shopping-cart");
}

private Locator productCard(String productId) {
    return page.getByTestId("product-" + productId);
}
```

### CSS e XPath (Último Recurso)

Use apenas quando outras estratégias não estiverem disponíveis:

```java
private Locator legacyWidget() {
    return page.locator("div.legacy-widget > span.value");
}

private Locator complexElement() {
    return page.locator("xpath=//div[@class='container']//span[contains(text(),'Total')]");
}
```

## Padrões de Page Object

### Métodos de Navegação

Inclua métodos para navegar até a página:

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

### Transições de Página

Retorne novos Page Object quando ações navegam para páginas diferentes:

```java
public class LoginPage {
    public DashboardPage loginAs(String username, String password) {
        usernameField().fill(username);
        passwordField().fill(password);
        loginButton().click();
        return new DashboardPage(page);
    }
}

// Uso:
DashboardPage dashboard = loginPage.loginAs("user", "pass");
assertThat(dashboard.getWelcomeMessage()).contains("Welcome");
```

### Page Component

Reutilize componentes de UI comuns entre páginas:

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

// Use nos Page Object:
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

### Estratégias de Espera

O Playwright espera automaticamente, mas às vezes você precisa de esperas explícitas:

```java
public class SearchResultsPage {
    public void waitForResults() {
        // Espera os resultados carregarem
        resultsContainer().waitFor();
    }

    public void waitForMinimumResults(int count) {
        // Espera até ter resultados suficientes
        page.waitForCondition(() -> getResultCount() >= count);
    }

    public void waitForLoadingToComplete() {
        // Espera o spinner de carregamento desaparecer
        loadingSpinner().waitFor(new Locator.WaitForOptions()
            .setState(WaitForSelectorState.HIDDEN));
    }
}
```

## Integração com Step Library

Page Object funcionam junto com Step Library. A Step Library cuida dos relatórios do Serenity enquanto o Page Object cuida das interações com a página:

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

## Boas Práticas

### 1. Um Page Object por Página/View

Não tente representar múltiplas páginas em uma classe:

```java
// ❌ Ruim
public class AllPages { /* muitas responsabilidades */ }

// ✅ Bom
public class LoginPage { /* apenas login */ }
public class DashboardPage { /* apenas dashboard */ }
```

### 2. Use Nomes de Métodos Descritivos

Os nomes dos métodos devem descrever a intenção do usuário:

```java
// ❌ Ruim
public void click1() { ... }
public void fillForm() { ... }

// ✅ Bom
public void addToWishlist() { ... }
public void submitContactForm(String name, String email, String message) { ... }
```

### 3. Evite Expor Locators

Nunca retorne objetos Locator brutos:

```java
// ❌ Ruim - expõe implementação
public Locator getSubmitButton() {
    return page.locator("#submit");
}

// ✅ Bom - expõe comportamento
public void submitForm() {
    submitButton().click();
}

public boolean isSubmitEnabled() {
    return submitButton().isEnabled();
}
```

### 4. Lide com Conteúdo Dinâmico

Use locators parametrizados para elementos dinâmicos:

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
