---
id: playwright_step_libraries
title: Step Library
sidebar_position: 4
---

# Step Library con Playwright

Las Step Library (bibliotecas de pasos) son el puente entre tus pruebas y los Page Object. Proporcionan las capacidades de reportes enriquecidos de Serenity a traves de anotaciones `@Step` mientras mantienen tus pruebas limpias y legibles.

## La arquitectura de tres capas

```
Clase de prueba
    │  Usa @Steps para inyectar Step Library
    │  Se enfoca en escenarios de negocio
    ▼
Step Library
    │  Los metodos @Step aparecen en reportes
    │  Orquesta acciones del Page Object
    ▼
Page Object
       Encapsula localizadores
       Maneja interacciones de pagina
```

## Creacion de Step Library

### Estructura basica

```java
public class ShoppingCartSteps {

    private ShoppingCartPage cartPage;

    // Inicializar Page Object cuando sea necesario
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

### Uso de Step Library en pruebas

Inyecta las Step Library usando la anotacion `@Steps`:

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

## La anotacion @Step

### Descripciones de paso

Usa marcadores de posicion de parametros en las descripciones de pasos:

```java
@Step("Search for '{1}'")
public void searchFor(Page page, String term) { ... }

@Step("Add {1} units of '{2}' to cart")
public void addToCart(Page page, int quantity, String product) { ... }

@Step("Verify total is ${1}")
public void verifyTotal(Page page, BigDecimal expectedTotal) { ... }
```

Los indices de parametros comienzan en cero: `{0}` es el primer parametro, `{1}` es el segundo, etc.

### Pasos anidados

Los pasos pueden llamar a otros pasos para reportes jerarquicos:

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

## Pasos conscientes de la pagina

Para firmas de paso mas limpias, usa `PlaywrightSerenity.getCurrentPage()`:

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

Uso en pruebas:

```java
@Test
void shouldNavigateBetweenPages() {
    // No es necesario pasar el parametro page
    navigation.navigateTo("https://example.com");
    navigation.refreshPage();
    navigation.goBack();
}
```

:::caution
Cuando uses `getCurrentPage()`, asegurate de haber registrado la pagina con `PlaywrightSerenity.registerPage(page)` antes de llamar a cualquier paso.
:::

## Captura de pantallas

### Capturas automaticas

Las capturas de pantalla se capturan automaticamente despues de que cada metodo `@Step` se completa. Esto es manejado por el `PlaywrightStepListener`.

### Capturas manuales

Dispara capturas de pantalla adicionales en puntos especificos:

```java
@Step("Capture current state")
public void captureCurrentState(Page page) {
    // Realizar algunas acciones
    performComplexAction(page);

    // Capturar una pantalla manualmente
    PlaywrightSerenity.takeScreenshot();

    // Continuar con mas acciones
    performAnotherAction(page);
}
```

## Organizacion de Step Library

### Por area de funcionalidad

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

### Por recorrido del usuario

```
steps/
├── BuyerSteps.java      // Todos los pasos para el perfil comprador
├── SellerSteps.java     // Todos los pasos para el perfil vendedor
└── AdminSteps.java      // Todos los pasos para un administrador
```

## Mejores practicas

### 1. Mantener los pasos enfocados

Cada paso debe representar una accion logica del usuario:

```java
// ❌ Mal: Demasiadas cosas en un paso
@Step("Login and add product to cart")
public void loginAndAddToCart(Page page, User user, String product) {
    // Demasiado sucediendo aqui
}

// ✅ Bien: Pasos enfocados y de proposito unico
@Step("Login as {1}")
public void login(Page page, User user) { ... }

@Step("Add '{1}' to cart")
public void addToCart(Page page, String product) { ... }
```

### 2. Usar lenguaje de negocio

Los pasos deben leerse como lenguaje natural:

```java
// ❌ Mal: Lenguaje tecnico
@Step("Click submit button")
@Step("Fill input field with value")

// ✅ Bien: Lenguaje de negocio
@Step("Submit the order")
@Step("Enter shipping address")
```

### 3. Manejar el estado cuidadosamente

Se consciente del estado entre llamadas a pasos:

```java
public class AccountSteps {
    private AccountPage accountPage;
    private User currentUser;  // Rastrear estado cuando sea necesario

    @Step("Login as {1}")
    public void loginAs(Page page, User user) {
        // Guardar para pasos posteriores
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

### 4. Hacer aserciones claras

Incluye aserciones descriptivas en pasos de verificacion:

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

### 5. Componer pasos de nivel superior

Construye flujos de trabajo complejos a partir de pasos mas simples:

```java
@Step("Complete guest checkout")
public void completeGuestCheckout(Page page, Address address, CreditCard card) {
    enterShippingAddress(page, address);
    selectShippingMethod(page, "Standard");
    enterPaymentDetails(page, card);
    confirmOrder(page);
}
```

Esto crea un reporte jerarquico que muestra tanto el paso de alto nivel como sus partes constituyentes.
