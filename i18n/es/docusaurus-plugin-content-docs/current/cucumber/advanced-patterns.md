---
id: advanced-patterns
title: Patrones Avanzados de Cucumber
sidebar_position: 3
---

# Patrones Avanzados de Cucumber con Serenity BDD

Esta guía cubre patrones y técnicas avanzadas para escribir pruebas Cucumber mantenibles y escalables con Serenity BDD. Aprenderás patrones utilizados por ingenieros de automatización de pruebas experimentados para construir suites de prueba robustas.

## Prerrequisitos

Esta guía asume que estás familiarizado con:
- Conceptos básicos de Cucumber (Feature, Scenario, Step Definition)
- Fundamentos de Serenity BDD
- El Screenplay Pattern o Page Object

Si eres nuevo en Cucumber con Serenity, comienza con [Ejecutando Escenarios Cucumber con JUnit 5](cucumber-junit5).

## Patrones Avanzados de Hooks

Los hooks de Cucumber te permiten ejecutar código en puntos específicos del ciclo de vida de las pruebas. Entender los patrones avanzados de hooks es esencial para una configuración y limpieza adecuada de las pruebas.

### Tipos de Hooks y Orden de Ejecución

Cucumber proporciona varios tipos de hooks que se ejecutan en diferentes momentos:

```java
package com.example.hooks;

import io.cucumber.java.*;

public class LifecycleHooks {

    // Se ejecuta una vez ANTES de TODOS los escenarios (Cucumber 7+)
    @BeforeAll
    public static void beforeAllScenarios() {
        System.out.println("Iniciando suite de pruebas");
        // Inicializar recursos compartidos, iniciar test containers, etc.
    }

    // Se ejecuta antes de CADA escenario
    @Before
    public void beforeScenario(Scenario scenario) {
        System.out.println("Iniciando: " + scenario.getName());
    }

    // Se ejecuta antes de CADA paso
    @BeforeStep
    public void beforeStep() {
        // Útil para registro o medición de tiempos
    }

    // Se ejecuta después de CADA paso
    @AfterStep
    public void afterStep() {
        // Útil para capturas de pantalla o verificación de estado
    }

    // Se ejecuta después de CADA escenario
    @After
    public void afterScenario(Scenario scenario) {
        System.out.println("Finalizado: " + scenario.getName());
        if (scenario.isFailed()) {
            // Manejo personalizado de fallos
        }
    }

    // Se ejecuta una vez después de TODOS los escenarios (Cucumber 7+)
    @AfterAll
    public static void afterAllScenarios() {
        System.out.println("Suite de pruebas completada");
        // Limpiar recursos compartidos
    }
}
```

**Orden de ejecución para un solo escenario:**
```
@BeforeAll (una vez por ejecución de pruebas)
  └─> @Before
        └─> @BeforeStep → Paso 1 → @AfterStep
        └─> @BeforeStep → Paso 2 → @AfterStep
        └─> @BeforeStep → Paso 3 → @AfterStep
      @After
@AfterAll (una vez por ejecución de pruebas)
```

### Hooks con Etiquetas

Ejecuta hooks solo para escenarios con etiquetas específicas:

```java
public class TaggedHooks {

    @Before("@database")
    public void setupDatabase() {
        // Solo se ejecuta para escenarios etiquetados @database
        DatabaseTestUtils.resetDatabase();
        DatabaseTestUtils.loadFixtures("test-data.sql");
    }

    @After("@database")
    public void cleanupDatabase() {
        DatabaseTestUtils.truncateAllTables();
    }

    @Before("@authenticated")
    public void ensureAuthenticated() {
        // Configurar sesión autenticada antes de escenarios que lo necesiten
    }

    @Before("@slow")
    public void increaseTimeouts() {
        // Aumentar timeouts para escenarios de ejecución lenta
    }
}
```

### Expresiones de Etiquetas en Hooks

Usa expresiones de etiquetas complejas para dirigirte a escenarios específicos:

```java
public class ConditionalHooks {

    @Before("@ui and not @headless")
    public void setupBrowserWithUI() {
        // Solo para pruebas de UI que necesitan un navegador visible
    }

    @Before("@api or @integration")
    public void setupApiClient() {
        // Para pruebas de API o integración
    }

    @Before("(@smoke or @regression) and not @wip")
    public void setupForRealTests() {
        // Para smoke o regresión, pero omitir trabajo en progreso
    }
}
```

### Ordenamiento de Hooks

Controla el orden de ejecución de hooks cuando tienes múltiples hooks del mismo tipo:

```java
public class OrderedHooks {

    // Valores de orden menores se ejecutan primero para hooks @Before
    @Before(order = 1)
    public void firstSetup() {
        System.out.println("1. Inicializar entorno de pruebas");
    }

    @Before(order = 2)
    public void secondSetup() {
        System.out.println("2. Configurar datos de prueba");
    }

    @Before(order = 3)
    public void thirdSetup() {
        System.out.println("3. Navegar a la aplicación");
    }

    // Valores de orden mayores se ejecutan primero para hooks @After (orden inverso)
    @After(order = 3)
    public void firstCleanup() {
        System.out.println("1. Capturar estado final");
    }

    @After(order = 2)
    public void secondCleanup() {
        System.out.println("2. Limpiar datos de prueba");
    }

    @After(order = 1)
    public void thirdCleanup() {
        System.out.println("3. Cerrar recursos");
    }
}
```

:::tip Ayuda Memoria para Orden de Hooks
- **@Before**: Números menores se ejecutan primero (1, 2, 3...)
- **@After**: Números mayores se ejecutan primero (...3, 2, 1)

Piénsalo como envolver: la configuración construye hacia arriba, la limpieza deshace en reversa.
:::

### Hooks Específicos de Screenplay

Cuando uses el Screenplay Pattern, configura los Actor en los hooks:

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

Para pruebas basadas en Playwright:

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

## Tipos de Parámetros Personalizados

Las expresiones de Cucumber soportan tipos de parámetros personalizados que transforman argumentos de pasos en objetos de dominio.

### Definiendo Tipos de Parámetros Personalizados

```java
package com.example.parameters;

import io.cucumber.java.ParameterType;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class CustomParameters {

    // Transforma "today", "tomorrow", "yesterday" en LocalDate
    @ParameterType("today|tomorrow|yesterday|\\d{4}-\\d{2}-\\d{2}")
    public LocalDate date(String value) {
        return switch (value) {
            case "today" -> LocalDate.now();
            case "tomorrow" -> LocalDate.now().plusDays(1);
            case "yesterday" -> LocalDate.now().minusDays(1);
            default -> LocalDate.parse(value);
        };
    }

    // Transforma cantidades monetarias como "$100.50" o "€50"
    @ParameterType("\\$[\\d,]+\\.?\\d*|€[\\d,]+\\.?\\d*|£[\\d,]+\\.?\\d*")
    public Money money(String value) {
        String currency = value.substring(0, 1);
        double amount = Double.parseDouble(value.substring(1).replace(",", ""));
        return new Money(amount, currency);
    }

    // Transforma roles de usuario
    @ParameterType("admin|manager|user|guest")
    public UserRole role(String value) {
        return UserRole.valueOf(value.toUpperCase());
    }
}
```

### Usando Parámetros Personalizados en Pasos

```gherkin
Feature: Gestión de Pedidos

  Scenario: Programar pedido para entrega
    Given an order placed on 2024-01-15
    When I schedule delivery for tomorrow
    Then the delivery date should be after today

  Scenario: Aplicar descuento a pedido
    Given an order totaling $150.00
    When a manager applies a 10% discount
    Then the new total should be $135.00
```

```java
public class OrderSteps {

    @Given("an order placed on {date}")
    public void anOrderPlacedOn(LocalDate orderDate) {
        // orderDate ya es un objeto LocalDate
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
        // total es un objeto Money con cantidad y moneda
        theActorInTheSpotlight().attemptsTo(
            CreateOrder.withTotal(total)
        );
    }

    @When("a {role} applies a {int}% discount")
    public void applyDiscount(UserRole role, int percentage) {
        // role es un enum UserRole
        theActorInTheSpotlight().attemptsTo(
            ApplyDiscount.of(percentage).asA(role)
        );
    }
}
```

### Tipo de Parámetro Actor

Serenity BDD proporciona un tipo de parámetro `{actor}` integrado:

```gherkin
Scenario: Múltiples usuarios interactúan
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

## Patrones Complejos de Tablas de Datos

Las tablas de datos son poderosas para pasar datos estructurados a los pasos.

### Transformaciones Básicas de Tablas de Datos

```gherkin
Scenario: Crear múltiples productos
  Given the following products exist:
    | name        | price  | category    | inStock |
    | Laptop      | 999.99 | Electronics | true    |
    | Headphones  | 149.99 | Electronics | true    |
    | Desk Chair  | 299.99 | Furniture   | false   |
```

**Usando DataTable directamente:**

```java
@Given("the following products exist:")
public void createProducts(DataTable dataTable) {
    List<Map<String, String>> rows = dataTable.asMaps();
    for (Map<String, String> row : rows) {
        String name = row.get("name");
        double price = Double.parseDouble(row.get("price"));
        String category = row.get("category");
        boolean inStock = Boolean.parseBoolean(row.get("inStock"));
        // Crear producto...
    }
}
```

**Transformación automática a POJO:**

```java
public class Product {
    private String name;
    private double price;
    private String category;
    private boolean inStock;

    // Getters y setters...
}

@Given("the following products exist:")
public void createProducts(List<Product> products) {
    // Cucumber transforma automáticamente las filas a objetos Product
    for (Product product : products) {
        theActorInTheSpotlight().attemptsTo(
            CreateProduct.withDetails(product)
        );
    }
}
```

### DataTableType para Transformaciones Personalizadas

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

        // Manejar campos opcionales
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

### Tablas de Datos Verticales

Para datos de una sola entidad, usa tablas verticales:

```gherkin
Scenario: Crear un perfil de usuario detallado
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

### Estructuras de Datos Anidadas

Para datos complejos, combina tablas con Scenario Outline:

```gherkin
Scenario Outline: Validar pedido con múltiples artículos
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

## Doc Strings para Contenido de Formato Largo

Usa doc strings para contenido de texto multilínea:

```gherkin
Scenario: Enviar un ticket de soporte
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

### Doc Strings con Tipos de Contenido

Especifica el tipo de contenido para datos estructurados:

```gherkin
Scenario: Crear producto vía API
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

## Compartiendo Estado Entre Pasos

Gestionar el estado entre pasos es crucial para pruebas mantenibles.

### Usando la Memoria del Actor (Screenplay Pattern)

El enfoque recomendado con Screenplay:

```java
public class OrderSteps {

    @Given("a customer creates an order")
    public void createOrder() {
        String orderId = UUID.randomUUID().toString();

        theActorInTheSpotlight().attemptsTo(
            CreateOrder.withId(orderId)
        );

        // Almacenar para pasos posteriores
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

### Memoria Tipada con Genéricos

Crea claves de memoria con seguridad de tipos:

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

### Usando Objetos World (Inyección de Dependencias)

Para gestión de estado compleja, usa la inyección de dependencias de Cucumber:

**Con PicoContainer (por defecto):**

```java
// Clase de estado compartido
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

// Los Step Definition reciben TestContext vía inyección en constructor
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

**Agrega la dependencia de PicoContainer:**

```xml
<dependency>
    <groupId>io.cucumber</groupId>
    <artifactId>cucumber-picocontainer</artifactId>
    <version>${cucumber.version}</version>
    <scope>test</scope>
</dependency>
```

## Patrones de Manejo de Errores

Maneja errores de forma elegante en los Step Definition.

### Patrón de Errores Esperados

```gherkin
Scenario: Prevenir checkout con carrito vacío
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
            // Almacenar que no ocurrió error
            theActorInTheSpotlight().remember("checkoutError", null);
        } catch (CheckoutException e) {
            // Almacenar el error para verificación
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

### Usando Question para Estados de Error

Un enfoque más limpio con Screenplay:

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

// En los pasos
@Then("they should see an error: {string}")
public void shouldSeeError(String expectedError) {
    theActorInTheSpotlight().should(
        seeThat(ErrorMessage.displayed(), equalTo(expectedError))
    );
}
```

### Aserciones Suaves para Múltiples Verificaciones

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

## Organización de Step Definition

### Una Clase por Área de Funcionalidad

Organiza los Step Definition por área de dominio:

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

### Pasos Delgados, Task Ricos

Mantén los Step Definition delgados delegando a Task de Screenplay:

```java
// Malo: Lógica en el Step Definition
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

// Bueno: Delegar a Task
@When("the customer adds {string} to their cart")
public void addToCart(String productName) {
    theActorInTheSpotlight().attemptsTo(
        AddToCart.theProduct(productName)
    );
}
```

### Patrones de Pasos Reutilizables

Crea pasos genéricos que funcionen en múltiples Feature:

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

## Mejores Prácticas para Background

### Mantén los Background Simples

```gherkin
# Bueno: Configuración simple y esencial
Background:
  Given the user is logged in as "admin"

# Malo: Demasiado detalle en el Background
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

### Usa Etiquetas para Compartir Background

```gherkin
@authenticated
Feature: Carrito de Compras

  # Esta Feature asume que el usuario está logueado
  # El hook @authenticated maneja el login

  Scenario: Agregar artículo al carrito
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

## Patrones de Scenario Outline

### Examples Dinámicos con Etiquetas

```gherkin
@smoke
Scenario Outline: Validación rápida de login
  Given I am on the login page
  When I login as "<userType>"
  Then I should see the "<dashboard>" dashboard

  @admin
  Examples: Usuarios Admin
    | userType     | dashboard    |
    | super_admin  | Super Admin  |
    | site_admin   | Site Admin   |

  @regular
  Examples: Usuarios Regulares
    | userType     | dashboard    |
    | premium      | Premium      |
    | standard     | Standard     |
```

### Tablas de Examples desde Fuentes Externas

Carga examples desde archivos o bases de datos:

```java
public class DynamicExamples {

    @ParameterType(".*\\.csv")
    public List<Map<String, String>> csvFile(String filename) {
        return CsvReader.read("src/test/resources/data/" + filename);
    }
}
```

## Integración: Screenplay vs Page Object

Puedes usar cualquiera de los patrones con Cucumber, o incluso mezclarlos.

### Enfoque Puro con Screenplay

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

### Enfoque con Page Object

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

### Enfoque Híbrido

Usa Page Object para páginas simples, Screenplay para flujos complejos:

```java
public class HybridSteps {

    @Steps
    LoginPage loginPage;  // Página simple, usar Page Object

    @When("the user logs in with valid credentials")
    public void login() {
        loginPage.loginAs("user@example.com", "password");
    }

    @When("{actor} completes the multi-step registration")
    public void completeRegistration(Actor actor) {
        // Flujo complejo, usar Screenplay
        actor.attemptsTo(
            CompleteRegistration.withDefaults()
        );
    }
}
```

## Optimización de Rendimiento

### Ejecución Paralela con Estado Aislado

Asegúrate de que tus hooks y gestión de estado sean seguros para hilos:

```java
public class ThreadSafeHooks {

    // ThreadLocal para ejecución paralela
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

### Inicialización Perezosa

No inicialices recursos hasta que se necesiten:

```java
public class LazyDriverHooks {

    @Before("@ui")
    public void initializeDriver() {
        // Solo crear navegador para pruebas de UI
        OnStage.setTheStage(new OnlineCast());
    }

    @Before("@api")
    public void initializeApiClient() {
        // Solo crear cliente API para pruebas de API
        OnStage.setTheStage(Cast.whereEveryoneCan(
            CallAnApi.at(baseUrl)
        ));
    }
}
```

## Consejos de Depuración

### Registro Detallado en Hooks

```java
@BeforeStep
public void logStepStart() {
    System.out.println(">>> Iniciando paso a las " + LocalDateTime.now());
}

@AfterStep
public void logStepEnd(Scenario scenario) {
    System.out.println("<<< Paso completado, estado del escenario: " + scenario.getStatus());
}
```

### Capturar Estado en Fallo

```java
@After
public void captureOnFailure(Scenario scenario) {
    if (scenario.isFailed()) {
        // Capturar screenshot
        byte[] screenshot = theActorInTheSpotlight()
            .usingAbilityTo(BrowseTheWeb.class)
            .takeScreenshot();
        scenario.attach(screenshot, "image/png", "failure-screenshot");

        // Capturar código fuente de la página
        String pageSource = theActorInTheSpotlight()
            .asksFor(ThePageSource.current());
        scenario.attach(pageSource, "text/html", "page-source");

        // Capturar consola del navegador
        List<String> consoleLogs = theActorInTheSpotlight()
            .asksFor(ConsoleMessages.all());
        scenario.attach(String.join("\n", consoleLogs), "text/plain", "console-logs");
    }
}
```

## Resumen

Estos patrones avanzados te ayudan a construir suites de prueba Cucumber mantenibles y escalables:

| Patrón | Cuándo Usar |
|---------|-------------|
| Hooks con Etiquetas | Configuración/limpieza condicional basada en etiquetas de escenario |
| Hooks Ordenados | Controlar el orden de ejecución de múltiples hooks |
| Parámetros Personalizados | Transformar argumentos de pasos a objetos de dominio |
| Tipos de DataTable | Transformación automática de filas de tabla |
| Memoria del Actor | Compartir estado entre pasos (Screenplay) |
| Objetos World | Estado complejo con inyección de dependencias |
| Pasos Delgados | Mantener pasos mínimos, delegar a Task |
| Aserciones Suaves | Verificar múltiples condiciones antes de fallar |

## Siguientes Pasos

- Explora [Ejecución Paralela](parallel-execution) para ejecuciones de prueba más rápidas
- Aprende sobre [Configuración de Cucumber](configuration-reference)
- Domina el [Screenplay Pattern](/docs/screenplay/screenplay_fundamentals)
- Revisa [Reportes de Serenity](/docs/reporting/the_serenity_reports) para documentación detallada

## Recursos Adicionales

- [Documentación de Expresiones Cucumber](https://cucumber.io/docs/cucumber/cucumber-expressions/)
- [Referencia de Hooks de Cucumber](https://cucumber.io/docs/cucumber/api/#hooks)
- [Guía de Screenplay de Serenity BDD](/docs/screenplay/screenplay_fundamentals)
