---
id: advanced-patterns
title: Padroes Avancados do Cucumber
sidebar_position: 3
---

# Padroes Avancados do Cucumber com Serenity BDD

Este guia cobre padrões e técnicas avançadas para escrever testes Cucumber manteniveis e escaláveis com o Serenity BDD. Você aprenderá padrões usados por engenheiros de automação de testes experientes para construir suites de teste robustas.

## Pre-requisitos

Este guia assume que você está familiarizado com:
- Conceitos básicos do Cucumber (Feature, Scenario, Step Definition)
- Fundamentos do Serenity BDD
- O Screenplay Pattern ou Page Object

Se você é novo no Cucumber com Serenity, comece com [Executando Cenarios Cucumber com JUnit 5](cucumber-junit5).

## Padroes Avancados de Hooks

Os Cucumber Hooks permitem que você execute código em pontos específicos do ciclo de vida do teste. Entender padrões avançados de hooks é essencial para configuração e limpeza adequadas dos testes.

### Tipos de Hooks e Ordem de Execucao

O Cucumber fornece vários tipos de hooks que executam em diferentes pontos:

```java
package com.example.hooks;

import io.cucumber.java.*;

public class LifecycleHooks {

    // Executa uma vez antes de TODOS os cenarios (Cucumber 7+)
    @BeforeAll
    public static void beforeAllScenarios() {
        System.out.println("Iniciando suite de testes");
        // Inicializar recursos compartilhados, iniciar test containers, etc.
    }

    // Executa antes de CADA cenario
    @Before
    public void beforeScenario(Scenario scenario) {
        System.out.println("Iniciando: " + scenario.getName());
    }

    // Executa antes de CADA passo
    @BeforeStep
    public void beforeStep() {
        // Util para logging ou medicao de tempo
    }

    // Executa apos CADA passo
    @AfterStep
    public void afterStep() {
        // Util para capturas de tela ou verificacao de estado
    }

    // Executa apos CADA cenario
    @After
    public void afterScenario(Scenario scenario) {
        System.out.println("Finalizado: " + scenario.getName());
        if (scenario.isFailed()) {
            // Tratamento personalizado de falha
        }
    }

    // Executa uma vez apos TODOS os cenarios (Cucumber 7+)
    @AfterAll
    public static void afterAllScenarios() {
        System.out.println("Suite de testes completa");
        // Limpar recursos compartilhados
    }
}
```

**Ordem de execucao para um cenario:**
```
@BeforeAll (uma vez por execucao de teste)
  └─> @Before
        └─> @BeforeStep → Passo 1 → @AfterStep
        └─> @BeforeStep → Passo 2 → @AfterStep
        └─> @BeforeStep → Passo 3 → @AfterStep
      @After
@AfterAll (uma vez por execucao de teste)
```

### Tagged Hooks

Execute hooks apenas para cenários com tags específicas:

```java
public class TaggedHooks {

    @Before("@database")
    public void setupDatabase() {
        // Executa apenas para cenarios com tag @database
        DatabaseTestUtils.resetDatabase();
        DatabaseTestUtils.loadFixtures("test-data.sql");
    }

    @After("@database")
    public void cleanupDatabase() {
        DatabaseTestUtils.truncateAllTables();
    }

    @Before("@authenticated")
    public void ensureAuthenticated() {
        // Configurar sessao autenticada antes de cenarios que precisam
    }

    @Before("@slow")
    public void increaseTimeouts() {
        // Aumentar timeouts para cenarios de execucao lenta
    }
}
```

### Expressoes de Tags em Hooks

Use expressões de tags complexas para direcionar cenários específicos:

```java
public class ConditionalHooks {

    @Before("@ui and not @headless")
    public void setupBrowserWithUI() {
        // Apenas para testes de UI que precisam de navegador visivel
    }

    @Before("@api or @integration")
    public void setupApiClient() {
        // Para testes de API ou integracao
    }

    @Before("(@smoke or @regression) and not @wip")
    public void setupForRealTests() {
        // Para smoke ou regressao, mas pula work-in-progress
    }
}
```

### Ordenacao de Hooks

Controle a ordem de execução dos hooks quando você tem múltiplos hooks do mesmo tipo:

```java
public class OrderedHooks {

    // Valores de order menores executam primeiro para hooks @Before
    @Before(order = 1)
    public void firstSetup() {
        System.out.println("1. Inicializar ambiente de teste");
    }

    @Before(order = 2)
    public void secondSetup() {
        System.out.println("2. Configurar dados de teste");
    }

    @Before(order = 3)
    public void thirdSetup() {
        System.out.println("3. Navegar para aplicacao");
    }

    // Valores de order maiores executam primeiro para hooks @After (ordem reversa)
    @After(order = 3)
    public void firstCleanup() {
        System.out.println("1. Capturar estado final");
    }

    @After(order = 2)
    public void secondCleanup() {
        System.out.println("2. Limpar dados de teste");
    }

    @After(order = 1)
    public void thirdCleanup() {
        System.out.println("3. Fechar recursos");
    }
}
```

:::tip Dica de Memoria para Ordem de Hooks
- **@Before**: Números menores executam primeiro (1, 2, 3...)
- **@After**: Números maiores executam primeiro (...3, 2, 1)

Pense como um empilhamento: setup constrói, teardown desfaz na ordem reversa.
:::

### Hooks Especificos do Screenplay

Ao usar o Screenplay Pattern, configure os Actor em hooks:

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

Para testes baseados em Playwright:

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

## Tipos de Parametros Personalizados

As expressões Cucumber suportam tipos de parâmetros personalizados que transformam argumentos de passos em objetos de domínio.

### Definindo Tipos de Parametros Personalizados

```java
package com.example.parameters;

import io.cucumber.java.ParameterType;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class CustomParameters {

    // Transforma "today", "tomorrow", "yesterday" em LocalDate
    @ParameterType("today|tomorrow|yesterday|\\d{4}-\\d{2}-\\d{2}")
    public LocalDate date(String value) {
        return switch (value) {
            case "today" -> LocalDate.now();
            case "tomorrow" -> LocalDate.now().plusDays(1);
            case "yesterday" -> LocalDate.now().minusDays(1);
            default -> LocalDate.parse(value);
        };
    }

    // Transforma valores monetarios como "$100.50" ou "€50"
    @ParameterType("\\$[\\d,]+\\.?\\d*|€[\\d,]+\\.?\\d*|£[\\d,]+\\.?\\d*")
    public Money money(String value) {
        String currency = value.substring(0, 1);
        double amount = Double.parseDouble(value.substring(1).replace(",", ""));
        return new Money(amount, currency);
    }

    // Transforma papeis de usuario
    @ParameterType("admin|manager|user|guest")
    public UserRole role(String value) {
        return UserRole.valueOf(value.toUpperCase());
    }
}
```

### Usando Parametros Personalizados em Passos

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
        // orderDate ja e um objeto LocalDate
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
        // total e um objeto Money com valor e moeda
        theActorInTheSpotlight().attemptsTo(
            CreateOrder.withTotal(total)
        );
    }

    @When("a {role} applies a {int}% discount")
    public void applyDiscount(UserRole role, int percentage) {
        // role e um enum UserRole
        theActorInTheSpotlight().attemptsTo(
            ApplyDiscount.of(percentage).asA(role)
        );
    }
}
```

### Tipo de Parametro Actor

O Serenity BDD fornece um tipo de parâmetro `{actor}` integrado:

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

## Padroes Complexos de Data Table

Data Tables são poderosas para passar dados estruturados para os passos.

### Transformacoes Basicas de Data Table

```gherkin
Scenario: Create multiple products
  Given the following products exist:
    | name        | price  | category    | inStock |
    | Laptop      | 999.99 | Electronics | true    |
    | Headphones  | 149.99 | Electronics | true    |
    | Desk Chair  | 299.99 | Furniture   | false   |
```

**Usando DataTable diretamente:**

```java
@Given("the following products exist:")
public void createProducts(DataTable dataTable) {
    List<Map<String, String>> rows = dataTable.asMaps();
    for (Map<String, String> row : rows) {
        String name = row.get("name");
        double price = Double.parseDouble(row.get("price"));
        String category = row.get("category");
        boolean inStock = Boolean.parseBoolean(row.get("inStock"));
        // Criar produto...
    }
}
```

**Transformacao automatica para POJOs:**

```java
public class Product {
    private String name;
    private double price;
    private String category;
    private boolean inStock;

    // Getters e setters...
}

@Given("the following products exist:")
public void createProducts(List<Product> products) {
    // Cucumber automaticamente transforma linhas em objetos Product
    for (Product product : products) {
        theActorInTheSpotlight().attemptsTo(
            CreateProduct.withDetails(product)
        );
    }
}
```

### DataTableType para Transformacoes Personalizadas

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

        // Tratar campos opcionais
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

### Data Tables Verticais

Para dados de entidade única, use tabelas verticais:

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

### Estruturas de Dados Aninhadas

Para dados complexos, combine tabelas com Scenario Outline:

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

## Doc Strings para Conteudo Extenso

Use doc strings para conteúdo de texto com múltiplas linhas:

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

### Doc Strings com Tipos de Conteudo

Especifique o tipo de conteúdo para dados estruturados:

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

## Compartilhando Estado Entre Passos

Gerenciar estado entre passos é crucial para testes manteniveis.

### Usando Memoria do Actor (Screenplay Pattern)

A abordagem recomendada com Screenplay:

```java
public class OrderSteps {

    @Given("a customer creates an order")
    public void createOrder() {
        String orderId = UUID.randomUUID().toString();

        theActorInTheSpotlight().attemptsTo(
            CreateOrder.withId(orderId)
        );

        // Armazenar para passos posteriores
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

### Memoria Tipada com Generics

Crie chaves de memória type-safe:

```java
public class MemoryKeys {
    public static final String ORDER_ID = "orderId";
    public static final String CUSTOMER = "customer";
    public static final String CART_ITEMS = "cartItems";
}

// Uso
actor.remember(MemoryKeys.ORDER_ID, orderId);
String id = actor.recall(MemoryKeys.ORDER_ID);
```

### Usando World Objects (Injecao de Dependencia)

Para gerenciamento de estado complexo, use a injeção de dependência do Cucumber:

**Com PicoContainer (padrao):**

```java
// Classe de estado compartilhado
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

// Step Definitions recebem TestContext via injecao no construtor
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

**Adicione a dependencia do PicoContainer:**

```xml
<dependency>
    <groupId>io.cucumber</groupId>
    <artifactId>cucumber-picocontainer</artifactId>
    <version>${cucumber.version}</version>
    <scope>test</scope>
</dependency>
```

## Padroes de Tratamento de Erros

Trate erros com elegância nas Step Definition.

### Padrao de Erros Esperados

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
            // Armazenar que nenhum erro ocorreu
            theActorInTheSpotlight().remember("checkoutError", null);
        } catch (CheckoutException e) {
            // Armazenar o erro para verificacao
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

### Usando Question para Estados de Erro

Uma abordagem mais limpa com Screenplay:

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

// Nos passos
@Then("they should see an error: {string}")
public void shouldSeeError(String expectedError) {
    theActorInTheSpotlight().should(
        seeThat(ErrorMessage.displayed(), equalTo(expectedError))
    );
}
```

### Soft Assertions para Multiplas Verificacoes

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

## Organizacao de Step Definitions

### Uma Classe Por Area de Funcionalidade

Organize Step Definition por área de domínio:

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

### Passos Enxutos, Task Ricas

Mantenha as Step Definition enxutas delegando para Task do Screenplay:

```java
// Ruim: Logica na step definition
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

// Bom: Delegar para Task
@When("the customer adds {string} to their cart")
public void addToCart(String productName) {
    theActorInTheSpotlight().attemptsTo(
        AddToCart.theProduct(productName)
    );
}
```

### Padroes de Passos Reutilizaveis

Crie passos genéricos que funcionem em várias Feature:

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

## Boas Praticas para Background

### Mantenha os Background Simples

```gherkin
# Bom: Configuracao simples e essencial
Background:
  Given the user is logged in as "admin"

# Ruim: Muito detalhe no background
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

### Use Tags para Compartilhar Background

```gherkin
@authenticated
Feature: Shopping Cart

  # Esta feature assume que o usuario esta logado
  # O hook @authenticated trata o login

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

## Padroes de Scenario Outline

### Examples Dinamicos com Tags

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

### Tabelas de Examples de Fontes Externas

Carregue examples de arquivos ou bancos de dados:

```java
public class DynamicExamples {

    @ParameterType(".*\\.csv")
    public List<Map<String, String>> csvFile(String filename) {
        return CsvReader.read("src/test/resources/data/" + filename);
    }
}
```

## Integracao: Screenplay vs Page Object

Você pode usar qualquer padrão com Cucumber, ou até mesmo misturá-los.

### Abordagem Pura com Screenplay

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

### Abordagem com Page Object

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

### Abordagem Hibrida

Use Page Object para páginas simples, Screenplay para fluxos complexos:

```java
public class HybridSteps {

    @Steps
    LoginPage loginPage;  // Pagina simples, use Page Object

    @When("the user logs in with valid credentials")
    public void login() {
        loginPage.loginAs("user@example.com", "password");
    }

    @When("{actor} completes the multi-step registration")
    public void completeRegistration(Actor actor) {
        // Fluxo complexo, use Screenplay
        actor.attemptsTo(
            CompleteRegistration.withDefaults()
        );
    }
}
```

## Otimizacao de Performance

### Execucao Paralela com Estado Isolado

Certifique-se de que seus hooks e gerenciamento de estado são thread-safe:

```java
public class ThreadSafeHooks {

    // ThreadLocal para execucao paralela
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

### Inicializacao Lazy

Não inicialize recursos até que sejam necessários:

```java
public class LazyDriverHooks {

    @Before("@ui")
    public void initializeDriver() {
        // Criar navegador apenas para testes de UI
        OnStage.setTheStage(new OnlineCast());
    }

    @Before("@api")
    public void initializeApiClient() {
        // Criar cliente de API apenas para testes de API
        OnStage.setTheStage(Cast.whereEveryoneCan(
            CallAnApi.at(baseUrl)
        ));
    }
}
```

## Dicas de Depuracao

### Logging Verboso em Hooks

```java
@BeforeStep
public void logStepStart() {
    System.out.println(">>> Iniciando passo em " + LocalDateTime.now());
}

@AfterStep
public void logStepEnd(Scenario scenario) {
    System.out.println("<<< Passo completado, status do cenario: " + scenario.getStatus());
}
```

### Capturar Estado em Falha

```java
@After
public void captureOnFailure(Scenario scenario) {
    if (scenario.isFailed()) {
        // Capturar screenshot
        byte[] screenshot = theActorInTheSpotlight()
            .usingAbilityTo(BrowseTheWeb.class)
            .takeScreenshot();
        scenario.attach(screenshot, "image/png", "failure-screenshot");

        // Capturar codigo fonte da pagina
        String pageSource = theActorInTheSpotlight()
            .asksFor(ThePageSource.current());
        scenario.attach(pageSource, "text/html", "page-source");

        // Capturar console do navegador
        List<String> consoleLogs = theActorInTheSpotlight()
            .asksFor(ConsoleMessages.all());
        scenario.attach(String.join("\n", consoleLogs), "text/plain", "console-logs");
    }
}
```

## Resumo

Estes padrões avançados ajudam você a construir suites de teste Cucumber manteniveis e escaláveis:

| Padrão | Quando Usar |
|---------|-------------|
| Tagged Hooks | Setup/teardown condicional baseado em tags do cenário |
| Ordered Hooks | Controlar ordem de execução de múltiplos hooks |
| Custom Parameters | Transformar argumentos de passos em objetos de domínio |
| Data Table Types | Transformação automática de linhas de tabela |
| Actor Memory | Compartilhar estado entre passos (Screenplay) |
| World Objects | Estado complexo com injeção de dependência |
| Thin Steps | Manter passos mínimos, delegar para Task |
| Soft Assertions | Verificar múltiplas condições antes de falhar |

## Proximos Passos

- Explore [Execucao Paralela](parallel-execution) para execuções de teste mais rápidas
- Aprenda sobre [Configuracao do Cucumber](configuration-reference)
- Domine o [Screenplay Pattern](/docs/screenplay/screenplay_fundamentals)
- Revise [Relatorios do Serenity](/docs/reporting/the_serenity_reports) para documentação rica

## Recursos Adicionais

- [Documentacao de Expressoes Cucumber](https://cucumber.io/docs/cucumber/cucumber-expressions/)
- [Referencia de Cucumber Hooks](https://cucumber.io/docs/cucumber/api/#hooks)
- [Guia do Screenplay do Serenity BDD](/docs/screenplay/screenplay_fundamentals)
