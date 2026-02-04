---
id: playwright_screenplay
title: Screenplay Pattern con Playwright
sidebar_position: 4
---

# Screenplay Pattern con Playwright

El Screenplay Pattern es un enfoque moderno y centrado en el Actor para escribir pruebas automatizadas. Cuando se combina con Playwright, proporciona una forma poderosa y expresiva de escribir pruebas de automatizacion de navegadores que se leen como documentacion viva.

El modulo `serenity-screenplay-playwright` une:
- **Expresividad de Screenplay** - Diseno de pruebas centrado en el Actor y basado en Task
- **Confiabilidad de Playwright** - Automatizacion de navegadores moderna con espera automatica
- **Reportes enriquecidos de Serenity** - Documentacion paso a paso con capturas de pantalla

## Por que Screenplay con Playwright?

El Screenplay Pattern ofrece varias ventajas sobre los enfoques tradicionales con Page Object:

| Page Object | Screenplay |
|-------------|------------|
| Las pruebas llaman metodos de pagina directamente | Los Actor realizan Task y hacen Question |
| Estilo de codigo procedural | Estilo declarativo enfocado en comportamiento |
| Pruebas atadas a estructura de UI | Pruebas expresan intencion de negocio |
| Mas dificil componer acciones | Los Task se componen facilmente en flujos de trabajo |

Con Playwright, tambien obtienes:
- **Espera automatica** integrada en todas las Interaction
- **Aserciones integradas** con reintento automatico
- **Intercepcion de red** para simular API
- **Soporte para multiples navegadores** (Chromium, Firefox, WebKit)

## Configuracion del proyecto

### Dependencias de Maven

Agrega estas dependencias a tu `pom.xml`:

```xml
<properties>
    <serenity.version>5.1.1</serenity.version>
    <playwright.version>1.58.0</playwright.version>
</properties>

<dependencies>
    <!-- Serenity Screenplay con Playwright -->
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

    <!-- Serenity Ensure (para aserciones fluidas) -->
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

## Conceptos principales

### Actor y Ability

En Screenplay, las pruebas se escriben desde la perspectiva de **Actor** que tienen **Ability**. Para pruebas de Playwright, los Actor necesitan la Ability `BrowseTheWebWithPlaywright`:

```java
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;

Actor toby = Actor.named("Toby");
toby.can(BrowseTheWebWithPlaywright.usingTheDefaultConfiguration());
```

La Ability gestiona el ciclo de vida del navegador Playwright automaticamente:
- Crea el navegador, contexto y pagina bajo demanda
- **Limpia automaticamente** cuando la prueba termina (no se necesita limpieza explicita)
- Se suscribe a los eventos del ciclo de vida de pruebas de Serenity para gestion de recursos fluida

### Task

Los **Task** representan acciones de alto nivel que un Actor realiza. Expresan _que_ hace el Actor en terminos de negocio:

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

Los Task pueden componerse de otros Task e Interaction:

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

Las **Question** permiten a los Actor consultar el estado de la aplicacion:

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

Los **Target** definen elementos de UI usando selectores de Playwright:

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

Los Target soportan:
- **Selectores parametrizados**: `Target.the("item {0}").locatedBy("[data-id='{0}']").of("123")`
- **Target anidados**: `button.inside(form)`
- **Soporte para frames**: `Target.the("editor").inFrame("#iframe").locatedBy("#content")`

## Escribiendo pruebas

### Estructura basica de prueba

Aqui hay un ejemplo completo de una prueba Screenplay con Playwright:

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

    // No se necesita @AfterEach - la limpieza ocurre automaticamente!

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

### Usando Ensure para aserciones

La clase `Ensure` proporciona aserciones fluidas que se integran con el modelo basado en Task de Screenplay:

```java
toby.attemptsTo(
    // Comparaciones numericas
    Ensure.that(TheRemainingCount.value()).isEqualTo(3),
    Ensure.that(TheVisibleTodos.count()).isGreaterThan(0),

    // Verificaciones booleanas
    Ensure.that(TheTodoItem.called("Buy milk").isCompleted()).isTrue(),
    Ensure.that(TheClearCompletedButton.isVisible()).isFalse(),

    // Comparaciones de cadenas
    Ensure.that(TheCurrentFilter.selected()).isEqualTo("All"),

    // Aserciones de colecciones
    Ensure.that(TheVisibleTodos.displayed())
        .containsExactly("Buy milk", "Walk the dog"),
    Ensure.that(TheVisibleTodos.displayed())
        .contains("Buy milk")
);
```

## Interaction integradas

El modulo `serenity-screenplay-playwright` proporciona muchas Interaction integradas:

### Navegacion

```java
// Abrir una URL
actor.attemptsTo(Open.url("https://example.com"));

// Navegar atras/adelante
actor.attemptsTo(Navigate.back());
actor.attemptsTo(Navigate.forward());

// Refrescar la pagina
actor.attemptsTo(Navigate.refresh());
```

### Clic

```java
// Clic simple
actor.attemptsTo(Click.on(TodoList.SUBMIT_BUTTON));

// Doble clic
actor.attemptsTo(DoubleClick.on(TodoList.TODO_LABEL));

// Clic derecho
actor.attemptsTo(RightClick.on(TodoList.CONTEXT_MENU_TRIGGER));
```

### Interacciones de formulario

```java
// Ingresar texto
actor.attemptsTo(Enter.theValue("Hello").into(TodoList.INPUT_FIELD));

// Limpiar un campo
actor.attemptsTo(Clear.field(TodoList.INPUT_FIELD));

// Presionar teclas
actor.attemptsTo(Press.keys("Enter"));
actor.attemptsTo(Press.keys("Control+a"));

// Marcar/desmarcar checkboxes
actor.attemptsTo(Check.checkbox(TodoList.AGREE_CHECKBOX));
actor.attemptsTo(Uncheck.checkbox(TodoList.AGREE_CHECKBOX));

// Seleccionar de dropdown
actor.attemptsTo(SelectFromOptions.byVisibleText("Option 1").from(TodoList.DROPDOWN));
actor.attemptsTo(SelectFromOptions.byValue("opt1").from(TodoList.DROPDOWN));
```

### Acciones de raton

```java
// Pasar el raton sobre un elemento
actor.attemptsTo(Hover.over(TodoList.DELETE_BUTTON));

// Arrastrar y soltar
actor.attemptsTo(Drag.from(SOURCE).to(TARGET));

// Desplazar al elemento visible
actor.attemptsTo(ScrollIntoView.element(TodoList.FOOTER));
```

### Esperas

```java
// Esperar por un elemento
actor.attemptsTo(WaitFor.the(TodoList.LOADING_SPINNER).toDisappear());
```

### Ejecucion de JavaScript

```java
// Ejecutar JavaScript
actor.attemptsTo(
    ExecuteJavaScript.withScript("window.scrollTo(0, document.body.scrollHeight)")
);
```

### Manejo de dialogos

```java
// Aceptar alerta
actor.attemptsTo(HandleDialog.byAccepting());

// Descartar alerta
actor.attemptsTo(HandleDialog.byDismissing());

// Ingresar texto en prompt
actor.attemptsTo(HandleDialog.byEntering("my response"));
```

## Aserciones especificas de Playwright

La clase `Ensure` tambien proporciona aserciones especificas de Playwright con reintento automatico:

```java
import net.serenitybdd.screenplay.playwright.assertions.Ensure;

actor.attemptsTo(
    // Visibilidad de elemento
    Ensure.that(TodoList.MAIN_SECTION).isVisible(),
    Ensure.that(TodoList.LOADING_SPINNER).isHidden(),

    // Contenido de texto
    Ensure.that(TodoList.HEADER).hasText("todos"),
    Ensure.that(TodoList.HEADER).containsText("todo"),

    // Conteo de elementos
    Ensure.that(TodoList.TODO_ITEMS).hasCount(3),

    // Atributos y clases
    Ensure.that(TodoList.TODO_ITEM).hasClass("completed"),
    Ensure.that(TodoList.INPUT).hasAttribute("placeholder", "What needs to be done?"),

    // Estado del elemento
    Ensure.that(TodoList.SUBMIT_BUTTON).isEnabled(),
    Ensure.that(TodoList.CHECKBOX).isChecked(),

    // URL y titulo de pagina
    Ensure.thatTheCurrentUrl().contains("/dashboard"),
    Ensure.thatThePageTitle().isEqualTo("My App")
);
```

## Caracteristicas avanzadas

### Acceso directo a la API de Playwright

Para escenarios avanzados, puedes acceder a la API de Playwright directamente:

```java
Page page = BrowseTheWebWithPlaywright.as(actor).getCurrentPage();

// Usar la API nativa de Playwright
page.locator(".my-element").click();

// Acceder al contexto del navegador
BrowserContext context = page.context();

// Intercepcion de red
page.route("**/api/**", route -> {
    route.fulfill(new Route.FulfillOptions()
        .setBody("{\"mocked\": true}")
        .setContentType("application/json"));
});
```

### Task personalizados

Crea Task especificos del dominio para tu aplicacion:

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

### Question personalizadas

Crea Question reutilizables para tu dominio:

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

### Multiples paginas/pestanas

Maneja multiples pestanas del navegador:

```java
// Abrir una nueva pagina
BrowseTheWebWithPlaywright.as(actor).openNewPage();

// Cambiar entre paginas
BrowseTheWebWithPlaywright.as(actor).switchToPage(0);
BrowseTheWebWithPlaywright.as(actor).switchToPageWithTitle("Dashboard");

// Cerrar pagina actual
BrowseTheWebWithPlaywright.as(actor).closeCurrentPage();
```

### Gestion de cookies

Gestiona cookies del navegador:

```java
// Obtener todas las cookies
List<Cookie> cookies = BrowseTheWebWithPlaywright.as(actor).getCookies();

// Agregar una cookie
Cookie cookie = new Cookie("session", "abc123")
    .setDomain("example.com")
    .setPath("/");
BrowseTheWebWithPlaywright.as(actor).addCookie(cookie);

// Limpiar cookies
BrowseTheWebWithPlaywright.as(actor).clearCookies();
```

### Manejo de frames

Interactua con elementos dentro de iframes:

```java
// Definir un Target dentro de un frame
Target EDITOR_CONTENT = Target.the("editor content")
    .inFrame("#editor-iframe")
    .locatedBy("#content");

// Interactua normalmente
actor.attemptsTo(
    Enter.theValue("Hello World").into(EDITOR_CONTENT)
);
```

### Capturas de pantalla

Toma capturas de pantalla explicitamente:

```java
// El metodo notifyScreenChange() captura una pantalla
BrowseTheWebWithPlaywright.as(actor).notifyScreenChange();

// O toma una captura explicitamente
ScreenshotAndHtmlSource screenshot = BrowseTheWebWithPlaywright.as(actor).takeScreenShot();
```

## Configuracion

### Opciones de navegador

Configura las opciones del navegador Playwright via propiedades del sistema o programaticamente:

```properties
# serenity.properties
playwright.browsertype=chromium
playwright.headless=true
playwright.slowMo=100
```

O programaticamente:

```java
actor.can(
    BrowseTheWebWithPlaywright
        .withOptions(new BrowserType.LaunchOptions().setHeadless(false))
        .withBrowserType("firefox")
);
```

### Configuracion de capturas de pantalla

Controla la captura de pantallas:

```properties
# serenity.conf
serenity {
    take.screenshots = FOR_EACH_ACTION  # o FOR_FAILURES, DISABLED
}
```

## Ejemplo completo: Conjunto de pruebas TodoMVC

Aqui hay un ejemplo completo mostrando todos los conceptos juntos:

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

### Clase de prueba

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

    // No se necesita @AfterEach - BrowseTheWebWithPlaywright automaticamente
    // limpia los recursos del navegador cuando la prueba termina

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

## Mejores practicas

### 1. Manten los Task enfocados en el negocio

Los Task deben expresar _que_ el usuario intenta lograr, no _como_ lo logra:

```java
// Bien - expresa intencion
actor.attemptsTo(
    AddItemToCart.called("Blue T-Shirt"),
    ProceedToCheckout.withStandardShipping()
);

// Evitar - demasiado tecnico
actor.attemptsTo(
    Click.on(ProductPage.ADD_TO_CART_BUTTON),
    Click.on(Header.CART_ICON),
    Click.on(CartPage.CHECKOUT_BUTTON)
);
```

### 2. Usa nombres significativos para Target

Los nombres de Target aparecen en los reportes, asi que hazlos descriptivos:

```java
// Bien
Target SUBMIT_ORDER_BUTTON = Target.the("submit order button")
    .locatedBy("#checkout-submit");

// Evitar
Target BUTTON = Target.the("button").locatedBy("#checkout-submit");
```

### 3. Crea Question especificas del dominio

Las Question deben devolver objetos de dominio significativos:

```java
// Bien
Question<Money> orderTotal = TheOrderTotal.displayed();
Question<List<CartItem>> cartItems = TheCartContents.items();

// Evitar
Question<String> total = Text.of(OrderPage.TOTAL);
```

### 4. Aprovecha Ensure para aserciones legibles

Usa `Ensure.that()` para aserciones que se lean naturalmente:

```java
actor.attemptsTo(
    Ensure.that(TheOrderStatus.displayed()).isEqualTo(OrderStatus.CONFIRMED),
    Ensure.that(TheDeliveryDate.shown()).isAfter(LocalDate.now())
);
```

## Siguientes pasos

- Explora el [Tutorial de TodoMVC](playwright_tutorial_todomvc) para una guia paso a paso
- Aprende sobre las [Opciones de configuracion](playwright_configuration) para personalizacion
- Revisa las [Mejores practicas](playwright_best_practices) para pruebas listas para produccion
