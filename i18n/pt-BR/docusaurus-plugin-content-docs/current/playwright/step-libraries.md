---
id: playwright_step_libraries
title: Step Libraries
sidebar_position: 4
---

# Step Library com Playwright

Step Library são a ponte entre seus testes e Page Object. Elas fornecem as capacidades de relatórios ricos do Serenity através de anotações `@Step` enquanto mantêm seus testes limpos e legíveis.

## A Arquitetura de Três Camadas

```
Classe de Teste
    │  Usa @Steps para injetar step libraries
    │  Foca em cenários de negócio
    ▼
Step Library
    │  Métodos @Step aparecem nos relatórios
    │  Orquestra ações do Page Object
    ▼
Page Object
       Encapsula locators
       Lida com interações da página
```

## Criando Step Library

### Estrutura Básica

```java
public class ShoppingCartSteps {

    private ShoppingCartPage cartPage;

    // Inicializa o Page Object quando necessário
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

### Usando Step Library nos Testes

Injete step library usando a anotação `@Steps`:

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

## A Anotação @Step

### Descrições de Passos

Use placeholders de parâmetros nas descrições dos passos:

```java
@Step("Search for '{1}'")
public void searchFor(Page page, String term) { ... }

@Step("Add {1} units of '{2}' to cart")
public void addToCart(Page page, int quantity, String product) { ... }

@Step("Verify total is ${1}")
public void verifyTotal(Page page, BigDecimal expectedTotal) { ... }
```

Os índices dos parâmetros são baseados em zero: `{0}` é o primeiro parâmetro, `{1}` é o segundo, etc.

### Passos Aninhados

Passos podem chamar outros passos para relatórios hierárquicos:

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

## Passos Cientes da Página

Para assinaturas de passo mais limpas, use `PlaywrightSerenity.getCurrentPage()`:

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

Uso nos testes:

```java
@Test
void shouldNavigateBetweenPages() {
    // Não precisa passar o parâmetro page
    navigation.navigateTo("https://example.com");
    navigation.refreshPage();
    navigation.goBack();
}
```

:::caution
Ao usar `getCurrentPage()`, certifique-se de ter registrado a página com `PlaywrightSerenity.registerPage(page)` antes de chamar qualquer passo.
:::

## Captura de Tela

### Capturas de Tela Automáticas

Capturas de tela são capturadas automaticamente após cada método `@Step` ser concluído. Isso é gerenciado pelo `PlaywrightStepListener`.

### Capturas de Tela Manuais

Dispare capturas de tela adicionais em pontos específicos:

```java
@Step("Capture current state")
public void captureCurrentState(Page page) {
    // Faz algumas ações
    performComplexAction(page);

    // Captura uma tela manualmente
    PlaywrightSerenity.takeScreenshot();

    // Continua com mais ações
    performAnotherAction(page);
}
```

## Organizando Step Library

### Por Área Funcional

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

### Por Jornada do Usuário

```
steps/
├── BuyerSteps.java      // Todos os passos para uma persona de comprador
├── SellerSteps.java     // Todos os passos para uma persona de vendedor
└── AdminSteps.java      // Todos os passos para um admin
```

## Boas Práticas

### 1. Mantenha os Passos Focados

Cada passo deve representar uma ação lógica do usuário:

```java
// ❌ Ruim: Muitas coisas em um passo
@Step("Login and add product to cart")
public void loginAndAddToCart(Page page, User user, String product) {
    // Muita coisa acontecendo aqui
}

// ✅ Bom: Passos focados com propósito único
@Step("Login as {1}")
public void login(Page page, User user) { ... }

@Step("Add '{1}' to cart")
public void addToCart(Page page, String product) { ... }
```

### 2. Use Linguagem de Negócio

Os passos devem ler como linguagem natural:

```java
// ❌ Ruim: Linguagem técnica
@Step("Click submit button")
@Step("Fill input field with value")

// ✅ Bom: Linguagem de negócio
@Step("Submit the order")
@Step("Enter shipping address")
```

### 3. Gerencie o Estado com Cuidado

Esteja atento ao estado entre chamadas de passos:

```java
public class AccountSteps {
    private AccountPage accountPage;
    private User currentUser;  // Rastreia o estado quando necessário

    @Step("Login as {1}")
    public void loginAs(Page page, User user) {
        // Armazena para passos posteriores
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

### 4. Faça Asserções Claras

Inclua asserções descritivas nos passos de verificação:

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

### 5. Componha Passos de Nível Superior

Construa workflows complexos a partir de passos mais simples:

```java
@Step("Complete guest checkout")
public void completeGuestCheckout(Page page, Address address, CreditCard card) {
    enterShippingAddress(page, address);
    selectShippingMethod(page, "Standard");
    enterPaymentDetails(page, card);
    confirmOrder(page);
}
```

Isso cria um relatório hierárquico mostrando tanto o passo de alto nível quanto suas partes constituintes.
