---
id: playwright_screenplay
title: Screenplay Pattern com Playwright
sidebar_position: 4
---

# Screenplay Pattern com Playwright

O Screenplay Pattern é uma abordagem moderna e centrada no ator para escrever testes automatizados. Quando combinado com o Playwright, fornece uma forma poderosa e expressiva de escrever testes de automação de navegador que leem como documentação viva.

O módulo `serenity-screenplay-playwright` une:
- **Expressividade do Screenplay** - Design de teste centrado no ator e baseado em tarefas
- **Confiabilidade do Playwright** - Automação de navegador moderna com espera automática
- **Relatórios ricos do Serenity** - Documentação passo a passo com capturas de tela

## Por que Screenplay com Playwright?

O Screenplay Pattern oferece várias vantagens sobre abordagens tradicionais de Page Object:

| Page Object | Screenplay |
|-------------|------------|
| Testes chamam métodos da página diretamente | Actor executam Task e fazem Question |
| Estilo de código procedural | Estilo declarativo, focado em comportamento |
| Testes acoplados à estrutura da UI | Testes expressam intenção de negócio |
| Difícil compor ações | Task facilmente compostas em workflows |

Com Playwright, você também obtém:
- **Espera automática** incorporada em todas as interações
- **Asserções integradas** com retry automático
- **Interceptação de rede** para mock de APIs
- **Suporte a múltiplos navegadores** (Chromium, Firefox, WebKit)

## Configuração do Projeto

### Dependências Maven

Adicione estas dependências ao seu `pom.xml`:

```xml
<properties>
    <serenity.version>5.1.1</serenity.version>
    <playwright.version>1.58.0</playwright.version>
</properties>

<dependencies>
    <!-- Serenity Screenplay com Playwright -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-screenplay-playwright</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Serenity Screenplay Core -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-screenplay</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Serenity Ensure (para asserções fluentes) -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-ensure</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Serenity JUnit 5 -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-junit5</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Playwright -->
    <dependency>
        <groupId>com.microsoft.playwright</groupId>
        <artifactId>playwright</artifactId>
        <version>${playwright.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- JUnit 5 -->
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>6.0.1</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## Conceitos Principais

### Actor e Ability

No Screenplay, os testes são escritos da perspectiva de **Actor** que possuem **Ability**. Para testes Playwright, os actor precisam da Ability `BrowseTheWebWithPlaywright`:

```java
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;

Actor toby = Actor.named("Toby");
toby.can(BrowseTheWebWithPlaywright.usingTheDefaultConfiguration());
```

A Ability gerencia o ciclo de vida do navegador Playwright automaticamente:
- Cria o navegador, contexto e página sob demanda
- **Limpa automaticamente** quando o teste termina (não é necessário teardown explícito)
- Se inscreve nos eventos de ciclo de vida de teste do Serenity para gerenciamento de recursos sem fricção

### Task

**Task** representam ações de alto nível que um ator executa. Elas expressam _o que_ o ator faz em termos de negócio:

```java
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.playwright.interactions.Open;
import net.serenitybdd.annotations.Step;

public class OpenTodoMvcApp implements Task {

    @Override
    @Step("{0} opens the TodoMVC application")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Open.url("https://todomvc.com/examples/react/dist/")
        );
    }

    public static OpenTodoMvcApp onTheHomePage() {
        return new OpenTodoMvcApp();
    }
}
```

Task podem ser compostas de outras Task e Interaction:

```java
public class AddATodoItem implements Task {
    private final String todoItem;

    public AddATodoItem(String todoItem) {
        this.todoItem = todoItem;
    }

    @Override
    @Step("{0} adds a todo item called '#todoItem'")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Enter.theValue(todoItem).into(TodoList.NEW_TODO_INPUT),
            Press.keys("Enter")
        );
    }

    public static AddATodoItem called(String todoItem) {
        return new AddATodoItem(todoItem);
    }
}
```

### Question

**Question** permitem que os actor consultem o estado da aplicação:

```java
import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;

public class TheVisibleTodos {

    public static Question<Collection<String>> displayed() {
        return Question.about("the visible todos").answeredBy(
            actor -> BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(".todo-list li label")
                .allTextContents()
        );
    }

    public static Question<Integer> count() {
        return Question.about("visible todo count").answeredBy(
            actor -> BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(".todo-list li")
                .count()
        );
    }
}
```

### Target

**Target** definem elementos de UI usando seletores do Playwright:

```java
import net.serenitybdd.screenplay.playwright.Target;

public class TodoList {

    public static final Target NEW_TODO_INPUT =
        Target.the("new todo input")
              .locatedBy("[placeholder='What needs to be done?']");

    public static final Target TODO_ITEMS =
        Target.the("todo items")
              .locatedBy(".todo-list li");

    public static Target todoItemCalled(String todoText) {
        return Target.the("todo item '" + todoText + "'")
                     .locatedBy(".todo-list li:has-text('" + todoText + "')");
    }

    public static Target checkboxFor(String todoText) {
        return Target.the("checkbox for '" + todoText + "'")
                     .locatedBy(".todo-list li:has-text('" + todoText + "') .toggle");
    }
}
```

Target suportam:
- **Seletores parametrizados**: `Target.the("item {0}").locatedBy("[data-id='{0}']").of("123")`
- **Target aninhados**: `button.inside(form)`
- **Suporte a frame**: `Target.the("editor").inFrame("#iframe").locatedBy("#content")`

## Escrevendo Testes

### Estrutura Básica de Teste

Aqui está um exemplo completo de um teste Screenplay com Playwright:

```java
import net.serenitybdd.junit5.SerenityJUnit5Extension;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.ensure.Ensure;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("When adding todos")
class WhenAddingTodosTest {

    Actor toby;

    @BeforeEach
    void setUp() {
        toby = Actor.named("Toby");
        toby.can(BrowseTheWebWithPlaywright.usingTheDefaultConfiguration());
    }

    // Não é necessário @AfterEach - a limpeza acontece automaticamente!

    @Test
    @DisplayName("should add a single todo item")
    void shouldAddSingleTodoItem() {
        toby.attemptsTo(
            OpenTodoMvcApp.onTheHomePage(),
            AddATodoItem.called("Buy milk"),
            Ensure.that(TheVisibleTodos.count()).isEqualTo(1),
            Ensure.that(TheTodoItem.called("Buy milk").exists()).isTrue()
        );
    }

    @Test
    @DisplayName("should add multiple todo items")
    void shouldAddMultipleTodoItems() {
        toby.attemptsTo(
            OpenTodoMvcApp.onTheHomePage(),
            AddATodoItem.called("Buy milk"),
            AddATodoItem.called("Walk the dog"),
            AddATodoItem.called("Do laundry"),
            Ensure.that(TheVisibleTodos.displayed())
                .containsExactly("Buy milk", "Walk the dog", "Do laundry")
        );
    }
}
```

### Usando Ensure para Asserções

A classe `Ensure` fornece asserções fluentes que se integram com o modelo baseado em tarefas do Screenplay:

```java
toby.attemptsTo(
    // Comparações numéricas
    Ensure.that(TheRemainingCount.value()).isEqualTo(3),
    Ensure.that(TheVisibleTodos.count()).isGreaterThan(0),

    // Verificações booleanas
    Ensure.that(TheTodoItem.called("Buy milk").isCompleted()).isTrue(),
    Ensure.that(TheClearCompletedButton.isVisible()).isFalse(),

    // Comparações de string
    Ensure.that(TheCurrentFilter.selected()).isEqualTo("All"),

    // Asserções de coleção
    Ensure.that(TheVisibleTodos.displayed())
        .containsExactly("Buy milk", "Walk the dog"),
    Ensure.that(TheVisibleTodos.displayed())
        .contains("Buy milk")
);
```

## Interaction Integradas

O módulo `serenity-screenplay-playwright` fornece muitas Interaction integradas:

### Navegação

```java
// Abrir uma URL
actor.attemptsTo(Open.url("https://example.com"));

// Navegar para trás/frente
actor.attemptsTo(Navigate.back());
actor.attemptsTo(Navigate.forward());

// Recarregar a página
actor.attemptsTo(Navigate.refresh());
```

### Clique

```java
// Clique simples
actor.attemptsTo(Click.on(TodoList.SUBMIT_BUTTON));

// Duplo clique
actor.attemptsTo(DoubleClick.on(TodoList.TODO_LABEL));

// Clique direito
actor.attemptsTo(RightClick.on(TodoList.CONTEXT_MENU_TRIGGER));
```

### Interações de Formulário

```java
// Digitar texto
actor.attemptsTo(Enter.theValue("Hello").into(TodoList.INPUT_FIELD));

// Limpar um campo
actor.attemptsTo(Clear.field(TodoList.INPUT_FIELD));

// Pressionar teclas
actor.attemptsTo(Press.keys("Enter"));
actor.attemptsTo(Press.keys("Control+a"));

// Marcar/desmarcar checkboxes
actor.attemptsTo(Check.checkbox(TodoList.AGREE_CHECKBOX));
actor.attemptsTo(Uncheck.checkbox(TodoList.AGREE_CHECKBOX));

// Selecionar de dropdown
actor.attemptsTo(SelectFromOptions.byVisibleText("Option 1").from(TodoList.DROPDOWN));
actor.attemptsTo(SelectFromOptions.byValue("opt1").from(TodoList.DROPDOWN));
```

### Ações de Mouse

```java
// Passar o mouse sobre um elemento
actor.attemptsTo(Hover.over(TodoList.DELETE_BUTTON));

// Arrastar e soltar
actor.attemptsTo(Drag.from(SOURCE).to(TARGET));

// Rolar para visualização
actor.attemptsTo(ScrollIntoView.element(TodoList.FOOTER));
```

### Espera

```java
// Esperar por um elemento
actor.attemptsTo(WaitFor.the(TodoList.LOADING_SPINNER).toDisappear());
```

### Execução de JavaScript

```java
// Executar JavaScript
actor.attemptsTo(
    ExecuteJavaScript.withScript("window.scrollTo(0, document.body.scrollHeight)")
);
```

### Tratamento de Diálogos

```java
// Aceitar alerta
actor.attemptsTo(HandleDialog.byAccepting());

// Dispensar alerta
actor.attemptsTo(HandleDialog.byDismissing());

// Digitar texto em prompt
actor.attemptsTo(HandleDialog.byEntering("my response"));
```

## Asserções Específicas do Playwright

A classe `Ensure` também fornece asserções específicas do Playwright com auto-retry:

```java
import net.serenitybdd.screenplay.playwright.assertions.Ensure;

actor.attemptsTo(
    // Visibilidade de elemento
    Ensure.that(TodoList.MAIN_SECTION).isVisible(),
    Ensure.that(TodoList.LOADING_SPINNER).isHidden(),

    // Conteúdo de texto
    Ensure.that(TodoList.HEADER).hasText("todos"),
    Ensure.that(TodoList.HEADER).containsText("todo"),

    // Contagem de elementos
    Ensure.that(TodoList.TODO_ITEMS).hasCount(3),

    // Atributos e classes
    Ensure.that(TodoList.TODO_ITEM).hasClass("completed"),
    Ensure.that(TodoList.INPUT).hasAttribute("placeholder", "What needs to be done?"),

    // Estado do elemento
    Ensure.that(TodoList.SUBMIT_BUTTON).isEnabled(),
    Ensure.that(TodoList.CHECKBOX).isChecked(),

    // URL e título da página
    Ensure.thatTheCurrentUrl().contains("/dashboard"),
    Ensure.thatThePageTitle().isEqualTo("My App")
);
```

## Recursos Avançados

### Acesso Direto à API do Playwright

Para cenários avançados, você pode acessar a API do Playwright diretamente:

```java
Page page = BrowseTheWebWithPlaywright.as(actor).getCurrentPage();

// Use a API nativa do Playwright
page.locator(".my-element").click();

// Acesse o contexto do navegador
BrowserContext context = page.context();

// Interceptação de rede
page.route("**/api/**", route -> {
    route.fulfill(new Route.FulfillOptions()
        .setBody("{\"mocked\": true}")
        .setContentType("application/json"));
});
```

### Task Personalizadas

Crie Task específicas do domínio para sua aplicação:

```java
public class CompleteCheckout implements Task {

    private final PaymentDetails paymentDetails;

    public CompleteCheckout(PaymentDetails paymentDetails) {
        this.paymentDetails = paymentDetails;
    }

    @Override
    @Step("{0} completes checkout with #paymentDetails")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            EnterShippingAddress.forCurrentUser(),
            EnterPaymentDetails.using(paymentDetails),
            Click.on(CheckoutPage.PLACE_ORDER_BUTTON),
            WaitFor.the(CheckoutPage.CONFIRMATION_MESSAGE).toAppear()
        );
    }

    public static CompleteCheckout using(PaymentDetails details) {
        return new CompleteCheckout(details);
    }
}
```

### Question Personalizadas

Crie Question reutilizáveis para seu domínio:

```java
public class TheOrderTotal {

    public static Question<BigDecimal> displayed() {
        return Question.about("the order total").answeredBy(actor -> {
            String totalText = BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(".order-total")
                .textContent();
            return new BigDecimal(totalText.replace("$", ""));
        });
    }
}

// Uso
actor.attemptsTo(
    Ensure.that(TheOrderTotal.displayed()).isGreaterThan(new BigDecimal("100.00"))
);
```

### Múltiplas Páginas/Abas

Lide com múltiplas abas do navegador:

```java
// Abrir uma nova página
BrowseTheWebWithPlaywright.as(actor).openNewPage();

// Alternar entre páginas
BrowseTheWebWithPlaywright.as(actor).switchToPage(0);
BrowseTheWebWithPlaywright.as(actor).switchToPageWithTitle("Dashboard");

// Fechar página atual
BrowseTheWebWithPlaywright.as(actor).closeCurrentPage();
```

### Gerenciamento de Cookies

Gerencie cookies do navegador:

```java
// Obter todos os cookies
List<Cookie> cookies = BrowseTheWebWithPlaywright.as(actor).getCookies();

// Adicionar um cookie
Cookie cookie = new Cookie("session", "abc123")
    .setDomain("example.com")
    .setPath("/");
BrowseTheWebWithPlaywright.as(actor).addCookie(cookie);

// Limpar cookies
BrowseTheWebWithPlaywright.as(actor).clearCookies();
```

### Tratamento de Frames

Interaja com elementos dentro de iframes:

```java
// Defina um target dentro de um frame
Target EDITOR_CONTENT = Target.the("editor content")
    .inFrame("#editor-iframe")
    .locatedBy("#content");

// Interaja com ele normalmente
actor.attemptsTo(
    Enter.theValue("Hello World").into(EDITOR_CONTENT)
);
```

### Capturas de Tela

Faça capturas de tela explicitamente:

```java
// O método notifyScreenChange() captura uma tela
BrowseTheWebWithPlaywright.as(actor).notifyScreenChange();

// Ou faça uma captura de tela explicitamente
ScreenshotAndHtmlSource screenshot = BrowseTheWebWithPlaywright.as(actor).takeScreenShot();
```

## Configuração

### Opções do Navegador

Configure opções do navegador Playwright via propriedades do sistema ou programaticamente:

```properties
# serenity.properties
playwright.browsertype=chromium
playwright.headless=true
playwright.slowMo=100
```

Ou programaticamente:

```java
actor.can(
    BrowseTheWebWithPlaywright
        .withOptions(new BrowserType.LaunchOptions().setHeadless(false))
        .withBrowserType("firefox")
);
```

### Configuração de Captura de Tela

Controle a captura de telas:

```properties
# serenity.conf
serenity {
    take.screenshots = FOR_EACH_ACTION  # ou FOR_FAILURES, DISABLED
}
```

## Exemplo Completo: Suíte de Testes TodoMVC

Aqui está um exemplo abrangente mostrando todos os conceitos juntos:

### Target de UI

```java
public class TodoList {

    public static final Target NEW_TODO_INPUT =
        Target.the("new todo input")
              .locatedBy("[placeholder='What needs to be done?']");

    public static final Target TODO_ITEMS =
        Target.the("todo items")
              .locatedBy(".todo-list li");

    public static final Target TODO_COUNT =
        Target.the("todo count")
              .locatedBy(".todo-count");

    public static final Target CLEAR_COMPLETED_BUTTON =
        Target.the("clear completed button")
              .locatedBy(".clear-completed");

    public static final Target ALL_FILTER =
        Target.the("All filter")
              .locatedBy(".filters a:has-text('All')");

    public static final Target ACTIVE_FILTER =
        Target.the("Active filter")
              .locatedBy(".filters a:has-text('Active')");

    public static final Target COMPLETED_FILTER =
        Target.the("Completed filter")
              .locatedBy(".filters a:has-text('Completed')");

    public static Target todoItemCalled(String text) {
        return Target.the("todo '" + text + "'")
                     .locatedBy(".todo-list li:has-text('" + text + "')");
    }

    public static Target checkboxFor(String text) {
        return Target.the("checkbox for '" + text + "'")
                     .locatedBy(".todo-list li:has-text('" + text + "') .toggle");
    }

    public static Target deleteButtonFor(String text) {
        return Target.the("delete button for '" + text + "'")
                     .locatedBy(".todo-list li:has-text('" + text + "') .destroy");
    }
}
```

### Task

```java
// AddATodoItem.java
public class AddATodoItem implements Task {
    private final List<String> items;

    public AddATodoItem(List<String> items) {
        this.items = items;
    }

    @Override
    @Step("{0} adds todo items: #items")
    public <T extends Actor> void performAs(T actor) {
        for (String item : items) {
            actor.attemptsTo(
                Enter.theValue(item).into(TodoList.NEW_TODO_INPUT),
                Press.keys("Enter")
            );
        }
    }

    public static AddATodoItem called(String item) {
        return new AddATodoItem(List.of(item));
    }

    public static AddATodoItem withItems(String... items) {
        return new AddATodoItem(Arrays.asList(items));
    }
}

// Complete.java
public class Complete implements Task {
    private final String todoItem;

    public Complete(String todoItem) {
        this.todoItem = todoItem;
    }

    @Override
    @Step("{0} completes the todo item '#todoItem'")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Click.on(TodoList.checkboxFor(todoItem))
        );
    }

    public static Complete todoItem(String item) {
        return new Complete(item);
    }
}

// Delete.java
public class Delete implements Task {
    private final String todoItem;

    public Delete(String todoItem) {
        this.todoItem = todoItem;
    }

    @Override
    @Step("{0} deletes the todo item '#todoItem'")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Hover.over(TodoList.todoItemCalled(todoItem)),
            Click.on(TodoList.deleteButtonFor(todoItem))
        );
    }

    public static Delete theTodoItem(String item) {
        return new Delete(item);
    }
}

// FilterTodos.java
public class FilterTodos {

    public static Task toShowAll() {
        return Task.where("{0} filters to show all todos",
            Click.on(TodoList.ALL_FILTER)
        );
    }

    public static Task toShowActive() {
        return Task.where("{0} filters to show active todos",
            Click.on(TodoList.ACTIVE_FILTER)
        );
    }

    public static Task toShowCompleted() {
        return Task.where("{0} filters to show completed todos",
            Click.on(TodoList.COMPLETED_FILTER)
        );
    }
}
```

### Question

```java
// TheVisibleTodos.java
public class TheVisibleTodos {

    public static Question<Collection<String>> displayed() {
        return Question.about("the visible todos").answeredBy(
            actor -> BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(".todo-list li label")
                .allTextContents()
        );
    }

    public static Question<Integer> count() {
        return Question.about("visible todo count").answeredBy(
            actor -> BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(".todo-list li")
                .count()
        );
    }
}

// TheRemainingCount.java
public class TheRemainingCount {

    public static Question<Integer> value() {
        return Question.about("the remaining count").answeredBy(actor -> {
            String text = BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(".todo-count")
                .textContent();
            Matcher matcher = Pattern.compile("(\\d+)").matcher(text);
            return matcher.find() ? Integer.parseInt(matcher.group(1)) : 0;
        });
    }
}
```

### Classe de Teste

```java
@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("When managing todos")
class WhenManagingTodosTest {

    Actor toby;

    @BeforeEach
    void setUp() {
        toby = Actor.named("Toby");
        toby.can(BrowseTheWebWithPlaywright.usingTheDefaultConfiguration());
    }

    // Não é necessário @AfterEach - BrowseTheWebWithPlaywright limpa
    // automaticamente os recursos do navegador quando o teste termina

    @Test
    @DisplayName("should add and complete todos")
    void shouldAddAndCompleteTodos() {
        toby.attemptsTo(
            Open.url("https://todomvc.com/examples/react/dist/"),
            AddATodoItem.withItems("Buy milk", "Walk the dog", "Do laundry"),

            Ensure.that(TheVisibleTodos.count()).isEqualTo(3),
            Ensure.that(TheRemainingCount.value()).isEqualTo(3),

            Complete.todoItem("Buy milk"),

            Ensure.that(TheRemainingCount.value()).isEqualTo(2),

            FilterTodos.toShowCompleted(),

            Ensure.that(TheVisibleTodos.displayed()).containsExactly("Buy milk"),

            FilterTodos.toShowActive(),

            Ensure.that(TheVisibleTodos.displayed())
                .containsExactly("Walk the dog", "Do laundry")
        );
    }

    @Test
    @DisplayName("should delete a todo item")
    void shouldDeleteTodoItem() {
        toby.attemptsTo(
            Open.url("https://todomvc.com/examples/react/dist/"),
            AddATodoItem.withItems("Item 1", "Item 2", "Item 3"),

            Delete.theTodoItem("Item 2"),

            Ensure.that(TheVisibleTodos.displayed())
                .containsExactly("Item 1", "Item 3")
        );
    }
}
```

## Boas Práticas

### 1. Mantenha Task Focadas em Negócio

Task devem expressar _o que_ o usuário está tentando alcançar, não _como_ eles alcançam:

```java
// Bom - expressa intenção
actor.attemptsTo(
    AddItemToCart.called("Blue T-Shirt"),
    ProceedToCheckout.withStandardShipping()
);

// Evite - muito técnico
actor.attemptsTo(
    Click.on(ProductPage.ADD_TO_CART_BUTTON),
    Click.on(Header.CART_ICON),
    Click.on(CartPage.CHECKOUT_BUTTON)
);
```

### 2. Use Nomes de Target Significativos

Os nomes dos Target aparecem nos relatórios, então seja descritivo:

```java
// Bom
Target SUBMIT_ORDER_BUTTON = Target.the("submit order button")
    .locatedBy("#checkout-submit");

// Evite
Target BUTTON = Target.the("button").locatedBy("#checkout-submit");
```

### 3. Crie Question Específicas do Domínio

Question devem retornar objetos de domínio significativos:

```java
// Bom
Question<Money> orderTotal = TheOrderTotal.displayed();
Question<List<CartItem>> cartItems = TheCartContents.items();

// Evite
Question<String> total = Text.of(OrderPage.TOTAL);
```

### 4. Aproveite Ensure para Asserções Legíveis

Use `Ensure.that()` para asserções que leem naturalmente:

```java
actor.attemptsTo(
    Ensure.that(TheOrderStatus.displayed()).isEqualTo(OrderStatus.CONFIRMED),
    Ensure.that(TheDeliveryDate.shown()).isAfter(LocalDate.now())
);
```

## Próximos Passos

- Explore o [Tutorial TodoMVC](playwright_tutorial_todomvc) para um passo a passo detalhado
- Aprenda sobre [Opções de Configuração](playwright_configuration) para personalização
- Revise as [Boas Práticas](playwright_best_practices) para testes prontos para produção
