---
id: playwright_best_practices
title: Mejores practicas
sidebar_position: 6
---

# Mejores practicas

Esta guia cubre las mejores practicas para escribir pruebas de Serenity Playwright mantenibles, confiables y eficientes.

## Arquitectura de pruebas

### Sigue el patron de tres capas

Siempre estructura tu codigo en tres capas:

```
Pruebas (escenarios de negocio)
    └── Step Library (reportes con @Step)
          └── Page Object (localizadores y acciones)
```

Esta separacion proporciona:
- **Mantenibilidad** - Los cambios en la UI solo afectan a los Page Object
- **Legibilidad** - Las pruebas se leen como especificaciones
- **Reusabilidad** - Los pasos y Page Object se pueden compartir

### Manten las pruebas enfocadas

Cada prueba debe verificar un comportamiento especifico:

```java
// ❌ Mal: Probando demasiadas cosas
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

// ✅ Bien: Pruebas enfocadas
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

## Gestion de navegadores

### Comparte el navegador, aisla las paginas

Crea el navegador una vez por clase de prueba, pero crea una pagina nueva para cada prueba:

```java
@ExtendWith(SerenityJUnit5Extension.class)
class ProductTests {

    private static Playwright playwright;
    private static Browser browser;
    private Page page;

    @BeforeAll
    static void setupBrowser() {
        // Crear navegador una vez - operacion costosa
        playwright = Playwright.create();
        browser = playwright.chromium().launch(
            new BrowserType.LaunchOptions().setHeadless(true)
        );
    }

    @AfterAll
    static void closeBrowser() {
        // Cerrar navegador despues de todas las pruebas
        if (browser != null) browser.close();
        if (playwright != null) playwright.close();
    }

    @BeforeEach
    void setupPage() {
        // Pagina nueva para cada prueba - aislamiento de pruebas
        page = browser.newPage();
        PlaywrightSerenity.registerPage(page);
    }

    @AfterEach
    void closePage() {
        // Limpiar despues de cada prueba
        PlaywrightSerenity.unregisterPage(page);
        if (page != null) page.close();
    }
}
```

### Usa contextos de navegador para aislamiento

Para aislamiento completo de pruebas, usa contextos de navegador:

```java
@BeforeEach
void setup() {
    // Cada contexto esta completamente aislado
    BrowserContext context = browser.newContext();
    page = context.newPage();
    PlaywrightSerenity.registerPage(page);
}

@AfterEach
void cleanup() {
    PlaywrightSerenity.unregisterPage(page);
    BrowserContext context = page.context();
    page.close();
    context.close();  // Cierra todas las paginas y limpia cookies/storage
}
```

### Extrae la configuracion comun a una clase base

Para reducir codigo repetitivo entre clases de prueba, crea una clase base que maneje el ciclo de vida de Playwright:

```java
public abstract class SerenityPlaywrightTest {

    protected Playwright playwright;
    protected Browser browser;
    protected Page page;

    @BeforeEach
    void setUpPlaywright() {
        playwright = Playwright.create();
        browser = playwright.chromium().launch(
                new BrowserType.LaunchOptions().setHeadless(true)
        );
        page = browser.newPage();
        PlaywrightSerenity.registerPage(page);
    }

    @AfterEach
    void tearDownPlaywright() {
        PlaywrightSerenity.unregisterPage(page);
        if (page != null) page.close();
        if (browser != null) browser.close();
        if (playwright != null) playwright.close();
    }
}
```

Las clases de prueba entonces extienden esta base y solo conectan sus Step Library:

```java
@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("When adding todos")
class WhenAddingTodosTest extends SerenityPlaywrightTest {

    @Steps
    TodoSteps todo;

    @BeforeEach
    void setUp() {
        todo.setPage(page);  // Conectar Step Library a la pagina
    }

    @Test
    void shouldAddTodoItem() {
        todo.openApplication();
        todo.addTodo("Buy milk");

        assertThat(todo.visibleTodoCount()).isEqualTo(1);
    }
}
```

Este patron:
- **Centraliza la gestion del ciclo de vida** - Los cambios en la configuracion del navegador solo necesitan hacerse en un lugar
- **Asegura limpieza apropiada** - La clase base garantiza que los recursos se liberen
- **Reduce codigo repetitivo en clases de prueba** - Cada clase de prueba se enfoca en la logica de prueba
- **Hace la `page` accesible** - El campo protegido esta disponible para todas las subclases

## Estrategias de localizacion

### Prefiere localizadores resistentes

Usa localizadores en este orden de preferencia:

1. **Basados en rol** - Mas resistentes, usan semantica de accesibilidad
2. **Basados en texto** - Buenos para texto visible al usuario
3. **Basados en etiqueta** - Buenos para campos de formulario
4. **Test ID** - Buenos para elementos sin significado semantico
5. **CSS/XPath** - Ultimo recurso

```java
// 1. Basado en rol (mejor)
page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Submit"));

// 2. Basado en texto
page.getByText("Add to Cart");

// 3. Basado en etiqueta
page.getByLabel("Email address");

// 4. Test ID
page.getByTestId("checkout-button");

// 5. CSS (evitar si es posible)
page.locator("button.submit-btn");
```

### Evita localizadores fragiles

```java
// ❌ Localizadores fragiles
page.locator("div:nth-child(3) > button");
page.locator(".btn-primary");
page.locator("//div[@class='container']/form/button[2]");

// ✅ Localizadores resistentes
page.getByRole(AriaRole.BUTTON, opts -> opts.setName("Place Order"));
page.getByTestId("place-order-button");
```

### Usa localizadores encadenados para contexto

Cuando el mismo tipo de elemento aparece multiples veces:

```java
// Encontrar el boton "Add" dentro de la primera tarjeta de producto
page.locator("[data-testid='product-card']").first()
    .getByRole(AriaRole.BUTTON, new GetByRoleOptions().setName("Add"));

// Encontrar el campo email en la seccion de envio
page.locator("#shipping-section")
    .getByLabel("Email");
```

## Estrategias de espera

### Confia en la espera automatica de Playwright

Playwright espera automaticamente a que los elementos sean accionables. No agregues esperas innecesarias:

```java
// ❌ Innecesario - Playwright ya espera
Thread.sleep(2000);
page.locator("#button").waitFor();
page.locator("#button").click();

// ✅ Solo haz clic - Playwright espera automaticamente
page.locator("#button").click();
```

### Usa esperas explicitas cuando sea necesario

Para condiciones especificas, usa esperas explicitas:

```java
// Esperar a que la navegacion se complete
page.waitForURL("**/checkout");

// Esperar a que las peticiones de red terminen
page.waitForLoadState(LoadState.NETWORKIDLE);

// Esperar una condicion especifica
page.waitForCondition(() -> getItemCount() >= 5);

// Esperar a que un elemento se oculte
loadingSpinner().waitFor(new WaitForOptions()
    .setState(WaitForSelectorState.HIDDEN));
```

## Manejo de errores

### Proporciona aserciones claras

Usa mensajes de asercion descriptivos:

```java
@Step("Verify cart total is ${1}")
public void verifyCartTotal(Page page, BigDecimal expected) {
    BigDecimal actual = cartPage.getTotal();
    assertThat(actual)
        .as("Cart total should be $%s but was $%s", expected, actual)
        .isEqualByComparingTo(expected);
}
```

### Maneja fallos esperados con elegancia

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

## Consejos de rendimiento

### Usa modo headless en CI

```java
boolean isCI = System.getenv("CI") != null;
browser = playwright.chromium().launch(
    new BrowserType.LaunchOptions().setHeadless(isCI)
);
```

### Minimiza los lanzamientos de navegador

Los lanzamientos de navegador son costosos. Comparte navegadores entre pruebas:

```java
// Un navegador por clase de prueba
@BeforeAll
static void launchBrowser() { ... }

// NO: Un navegador por prueba
@BeforeEach
void launchBrowser() { ... }  // ❌ Lento!
```

### Usa simulacion de red para velocidad

Simula llamadas API lentas en las pruebas:

```java
@BeforeEach
void setupMocks() {
    // Simular endpoint de API lento
    page.route("**/api/recommendations", route -> {
        route.fulfill(new FulfillOptions()
            .setStatus(200)
            .setBody("[]"));
    });
}
```

## Organizacion de pruebas

### Usa nombres de prueba descriptivos

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

### Agrupa pruebas relacionadas

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

## Integracion CI/CD

### Configura para entornos CI

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

### Genera reportes en CI

```yaml
# Ejemplo de GitHub Actions
- name: Run Tests
  run: mvn verify

- name: Upload Serenity Reports
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: serenity-reports
    path: target/site/serenity/
```

## Errores comunes

### Evita interdependencias entre pruebas

```java
// ❌ Mal: Las pruebas dependen unas de otras
@Test
@Order(1)
void createUser() {
    createdUserId = userService.create(user);
}

@Test
@Order(2)
void verifyUser() {
    userService.get(createdUserId);  // Falla si la primera prueba falla
}

// ✅ Bien: Cada prueba es independiente
@Test
void shouldCreateAndVerifyUser() {
    String userId = userService.create(user);
    User retrieved = userService.get(userId);
    assertThat(retrieved).isEqualTo(user);
}
```

### No ignores pruebas inestables

Aborda las pruebas inestables inmediatamente:

```java
// ❌ No hagas esto
@Disabled("Flaky - investigate later")
@Test
void sometimesFailingTest() { ... }

// ✅ Arregla la causa raiz
@Test
void fixedTest() {
    // Espera una condicion especifica en lugar de sleep arbitrario
    page.waitForLoadState(LoadState.NETWORKIDLE);
    // Ahora realiza la asercion
}
```

### Limpia los datos de prueba

```java
@AfterEach
void cleanup() {
    // Limpiar cualquier dato de prueba creado
    if (createdOrderId != null) {
        orderService.delete(createdOrderId);
    }
}
```
