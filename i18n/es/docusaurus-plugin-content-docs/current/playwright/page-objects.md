---
id: playwright_page_objects
title: Page Object
sidebar_position: 3
---

# Page Object con Playwright

Los Page Object son un patron de diseno que encapsula la estructura y el comportamiento de una pagina web. Con Playwright y Serenity, los Page Object proporcionan una separacion limpia entre la logica de tus pruebas y los detalles de implementacion de la pagina.

## Por que usar Page Object?

Sin Page Object, las pruebas se vuelven fragiles y dificiles de mantener:

```java
// ❌ Mal: Localizadores dispersos por las pruebas
@Test
void searchTest() {
    page.locator("input[name='q']").fill("search term");
    page.locator("button.search-btn").click();
    assertThat(page.locator(".results-count").textContent()).contains("10");
}
```

Con Page Object, las pruebas son limpias y mantenibles:

```java
// ✅ Bien: Localizadores encapsulados en Page Object
@Test
void searchTest() {
    searchPage.searchFor("search term");
    assertThat(searchPage.getResultCount()).isEqualTo(10);
}
```

## Estructura de un Page Object

Un Page Object bien disenado tiene tres secciones:

```java
public class ProductPage {
    private final Page page;

    public ProductPage(Page page) {
        this.page = page;
    }

    // ========== LOCALIZADORES (privados) ==========
    // Encapsulan como se encuentran los elementos

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

    // ========== ACCIONES (publicas) ==========
    // Representan interacciones del usuario

    public void addToCart() {
        addToCartButton().click();
    }

    public void setQuantity(int quantity) {
        quantityInput().fill(String.valueOf(quantity));
    }

    // ========== CONSULTAS (publicas) ==========
    // Devuelven informacion sobre el estado de la pagina

    public String getProductTitle() {
        return productTitle().textContent();
    }

    public boolean isAddToCartEnabled() {
        return addToCartButton().isEnabled();
    }
}
```

### Principios clave

1. **Los localizadores son privados** - Solo el Page Object sabe como encontrar elementos
2. **Las acciones son publicas** - Exponen interacciones significativas del usuario
3. **Las consultas son publicas** - Exponen formas de verificar el estado de la pagina
4. **Sin aserciones en Page Object** - Deja que quien llama decida que verificar

## Estrategias de localizacion en Playwright

Playwright ofrece varias formas de localizar elementos. Usa la estrategia mas resistente para cada caso:

### Localizadores basados en roles (Recomendado)

Son los mas resistentes ya que usan semantica de accesibilidad:

```java
// Buscar por rol ARIA y nombre accesible
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

### Localizadores basados en texto

Buenos para encontrar elementos por texto visible:

```java
private Locator submitButton() {
    return page.getByText("Submit Order");
}

private Locator welcomeMessage() {
    return page.getByText("Welcome back", new Page.GetByTextOptions().setExact(false));
}
```

### Localizadores basados en etiquetas

Encuentran campos de formulario por sus etiquetas asociadas:

```java
private Locator usernameField() {
    return page.getByLabel("Username");
}

private Locator rememberMeCheckbox() {
    return page.getByLabel("Remember me");
}
```

### Localizadores con Test ID

Usa atributos data-testid para elementos sin buenos identificadores semanticos:

```java
private Locator shoppingCart() {
    return page.getByTestId("shopping-cart");
}

private Locator productCard(String productId) {
    return page.getByTestId("product-" + productId);
}
```

### CSS y XPath (Ultimo recurso)

Usa solo cuando otras estrategias no esten disponibles:

```java
private Locator legacyWidget() {
    return page.locator("div.legacy-widget > span.value");
}

private Locator complexElement() {
    return page.locator("xpath=//div[@class='container']//span[contains(text(),'Total')]");
}
```

## Patrones de Page Object

### Metodos de navegacion

Incluye metodos para navegar a la pagina:

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

### Transiciones de pagina

Devuelve nuevos Page Object cuando las acciones navegan a diferentes paginas:

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

### Objetos de componente

Reutiliza componentes de UI comunes entre paginas:

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

// Usar en Page Object:
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

### Estrategias de espera

Playwright espera automaticamente, pero a veces necesitas esperas explicitas:

```java
public class SearchResultsPage {
    public void waitForResults() {
        // Esperar a que los resultados carguen
        resultsContainer().waitFor();
    }

    public void waitForMinimumResults(int count) {
        // Esperar hasta tener suficientes resultados
        page.waitForCondition(() -> getResultCount() >= count);
    }

    public void waitForLoadingToComplete() {
        // Esperar a que el spinner de carga desaparezca
        loadingSpinner().waitFor(new Locator.WaitForOptions()
            .setState(WaitForSelectorState.HIDDEN));
    }
}
```

## Integracion con Step Library

Los Page Object funcionan junto con las Step Library. La Step Library maneja los reportes de Serenity mientras que el Page Object maneja las interacciones con la pagina:

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

## Mejores practicas

### 1. Un Page Object por pagina/vista

No intentes representar multiples paginas en una clase:

```java
// ❌ Mal
public class AllPages { /* demasiadas responsabilidades */ }

// ✅ Bien
public class LoginPage { /* solo login */ }
public class DashboardPage { /* solo dashboard */ }
```

### 2. Usa nombres de metodos descriptivos

Los nombres de los metodos deben describir la intencion del usuario:

```java
// ❌ Mal
public void click1() { ... }
public void fillForm() { ... }

// ✅ Bien
public void addToWishlist() { ... }
public void submitContactForm(String name, String email, String message) { ... }
```

### 3. Evita exponer localizadores

Nunca devuelvas objetos Locator crudos:

```java
// ❌ Mal - expone implementacion
public Locator getSubmitButton() {
    return page.locator("#submit");
}

// ✅ Bien - expone comportamiento
public void submitForm() {
    submitButton().click();
}

public boolean isSubmitEnabled() {
    return submitButton().isEnabled();
}
```

### 4. Maneja contenido dinamico

Usa localizadores parametrizados para elementos dinamicos:

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
