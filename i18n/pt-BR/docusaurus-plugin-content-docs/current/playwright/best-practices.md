---
id: playwright_best_practices
title: Boas Práticas
sidebar_position: 6
---

# Boas Práticas

Este guia aborda as melhores práticas para escrever testes Serenity Playwright fáceis de manter, confiáveis e eficientes.

## Arquitetura de Testes

### Siga o Padrão de Três Camadas

Sempre estruture seu código em três camadas:

```
Testes (cenários de negócio)
    └── Step Library (relatórios com @Step)
          └── Page Object (locators e ações)
```

Essa separação proporciona:
- **Manutenibilidade** - Mudanças na UI afetam apenas Page Object
- **Legibilidade** - Testes leem como especificações
- **Reusabilidade** - Passos e Page Object podem ser compartilhados

### Mantenha os Testes Focados

Cada teste deve verificar um comportamento específico:

```java
// ❌ Ruim: Testando muitas coisas
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

// ✅ Bom: Testes focados
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

## Gerenciamento do Navegador

### Compartilhe o Navegador, Isole as Páginas

Crie o navegador uma vez por classe de teste, mas crie uma página nova para cada teste:

```java
@ExtendWith(SerenityJUnit5Extension.class)
class ProductTests {

    private static Playwright playwright;
    private static Browser browser;
    private Page page;

    @BeforeAll
    static void setupBrowser() {
        // Cria navegador uma vez - operação cara
        playwright = Playwright.create();
        browser = playwright.chromium().launch(
            new BrowserType.LaunchOptions().setHeadless(true)
        );
    }

    @AfterAll
    static void closeBrowser() {
        // Fecha navegador após todos os testes
        if (browser != null) browser.close();
        if (playwright != null) playwright.close();
    }

    @BeforeEach
    void setupPage() {
        // Página nova para cada teste - isolamento de teste
        page = browser.newPage();
        PlaywrightSerenity.registerPage(page);
    }

    @AfterEach
    void closePage() {
        // Limpa após cada teste
        PlaywrightSerenity.unregisterPage(page);
        if (page != null) page.close();
    }
}
```

### Use Contextos de Navegador para Isolamento

Para isolamento completo de teste, use contextos de navegador:

```java
@BeforeEach
void setup() {
    // Cada contexto é completamente isolado
    BrowserContext context = browser.newContext();
    page = context.newPage();
    PlaywrightSerenity.registerPage(page);
}

@AfterEach
void cleanup() {
    PlaywrightSerenity.unregisterPage(page);
    BrowserContext context = page.context();
    page.close();
    context.close();  // Fecha todas as páginas e limpa cookies/storage
}
```

### Extraia a Configuração Comum para uma Classe Base

Para reduzir código repetitivo entre classes de teste, crie uma classe base que gerencia o ciclo de vida do Playwright:

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

As classes de teste então estendem esta base e apenas conectam suas step library:

```java
@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("When adding todos")
class WhenAddingTodosTest extends SerenityPlaywrightTest {

    @Steps
    TodoSteps todo;

    @BeforeEach
    void setUp() {
        todo.setPage(page);  // Conecta step library à página
    }

    @Test
    void shouldAddTodoItem() {
        todo.openApplication();
        todo.addTodo("Buy milk");

        assertThat(todo.visibleTodoCount()).isEqualTo(1);
    }
}
```

Este padrão:
- **Centraliza o gerenciamento do ciclo de vida** - Mudanças na configuração do navegador acontecem em um só lugar
- **Garante limpeza adequada** - A classe base garante que os recursos são liberados
- **Reduz código repetitivo nas classes de teste** - Cada classe de teste foca na lógica do teste
- **Torna a `page` acessível** - O campo protegido está disponível para todas as subclasses

## Estratégias de Locator

### Prefira Locators Resilientes

Use locators nesta ordem de preferência:

1. **Baseado em role** - Mais resiliente, usa semântica de acessibilidade
2. **Baseado em texto** - Bom para texto visível ao usuário
3. **Baseado em label** - Bom para campos de formulário
4. **Test ID** - Bom para elementos sem significado semântico
5. **CSS/XPath** - Último recurso

```java
// 1. Baseado em role (melhor)
page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Submit"));

// 2. Baseado em texto
page.getByText("Add to Cart");

// 3. Baseado em label
page.getByLabel("Email address");

// 4. Test ID
page.getByTestId("checkout-button");

// 5. CSS (evite se possível)
page.locator("button.submit-btn");
```

### Evite Locators Frágeis

```java
// ❌ Locators frágeis
page.locator("div:nth-child(3) > button");
page.locator(".btn-primary");
page.locator("//div[@class='container']/form/button[2]");

// ✅ Locators resilientes
page.getByRole(AriaRole.BUTTON, opts -> opts.setName("Place Order"));
page.getByTestId("place-order-button");
```

### Use Locators Encadeados para Contexto

Quando o mesmo tipo de elemento aparece múltiplas vezes:

```java
// Encontra o botão "Add" dentro do primeiro card de produto
page.locator("[data-testid='product-card']").first()
    .getByRole(AriaRole.BUTTON, new GetByRoleOptions().setName("Add"));

// Encontra o campo email na seção de envio
page.locator("#shipping-section")
    .getByLabel("Email");
```

## Estratégias de Espera

### Confie na Espera Automática do Playwright

O Playwright espera automaticamente que os elementos estejam prontos para ação. Não adicione esperas desnecessárias:

```java
// ❌ Desnecessário - Playwright já espera
Thread.sleep(2000);
page.locator("#button").waitFor();
page.locator("#button").click();

// ✅ Apenas clique - Playwright espera automaticamente
page.locator("#button").click();
```

### Use Esperas Explícitas Quando Necessário

Para condições específicas, use esperas explícitas:

```java
// Espera a navegação completar
page.waitForURL("**/checkout");

// Espera requisições de rede finalizarem
page.waitForLoadState(LoadState.NETWORKIDLE);

// Espera uma condição específica
page.waitForCondition(() -> getItemCount() >= 5);

// Espera elemento ficar oculto
loadingSpinner().waitFor(new WaitForOptions()
    .setState(WaitForSelectorState.HIDDEN));
```

## Tratamento de Erros

### Forneça Asserções Claras

Use mensagens de asserção descritivas:

```java
@Step("Verify cart total is ${1}")
public void verifyCartTotal(Page page, BigDecimal expected) {
    BigDecimal actual = cartPage.getTotal();
    assertThat(actual)
        .as("Cart total should be $%s but was $%s", expected, actual)
        .isEqualByComparingTo(expected);
}
```

### Trate Falhas Esperadas com Elegância

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

## Dicas de Performance

### Use Modo Headless no CI

```java
boolean isCI = System.getenv("CI") != null;
browser = playwright.chromium().launch(
    new BrowserType.LaunchOptions().setHeadless(isCI)
);
```

### Minimize Inicializações de Navegador

Inicializações de navegador são caras. Compartilhe navegadores entre testes:

```java
// Um navegador por classe de teste
@BeforeAll
static void launchBrowser() { ... }

// NÃO: Um navegador por teste
@BeforeEach
void launchBrowser() { ... }  // ❌ Lento!
```

### Use Mock de Rede para Velocidade

Simule chamadas de API lentas nos testes:

```java
@BeforeEach
void setupMocks() {
    // Simula endpoint de API lento
    page.route("**/api/recommendations", route -> {
        route.fulfill(new FulfillOptions()
            .setStatus(200)
            .setBody("[]"));
    });
}
```

## Organizando Testes

### Use Nomes de Teste Descritivos

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

### Agrupe Testes Relacionados

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

## Integração CI/CD

### Configure para Ambientes CI

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

### Gere Relatórios no CI

```yaml
# Exemplo GitHub Actions
- name: Run Tests
  run: mvn verify

- name: Upload Serenity Reports
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: serenity-reports
    path: target/site/serenity/
```

## Armadilhas Comuns

### Evite Interdependências de Teste

```java
// ❌ Ruim: Testes dependem um do outro
@Test
@Order(1)
void createUser() {
    createdUserId = userService.create(user);
}

@Test
@Order(2)
void verifyUser() {
    userService.get(createdUserId);  // Falha se o primeiro teste falhar
}

// ✅ Bom: Cada teste é independente
@Test
void shouldCreateAndVerifyUser() {
    String userId = userService.create(user);
    User retrieved = userService.get(userId);
    assertThat(retrieved).isEqualTo(user);
}
```

### Não Ignore Testes Instáveis

Resolva testes instáveis imediatamente:

```java
// ❌ Não faça isso
@Disabled("Flaky - investigate later")
@Test
void sometimesFailingTest() { ... }

// ✅ Corrija a causa raiz
@Test
void fixedTest() {
    // Espera condição específica em vez de sleep arbitrário
    page.waitForLoadState(LoadState.NETWORKIDLE);
    // Agora executa a asserção
}
```

### Limpe Dados de Teste

```java
@AfterEach
void cleanup() {
    // Limpa quaisquer dados de teste criados
    if (createdOrderId != null) {
        orderService.delete(createdOrderId);
    }
}
```
