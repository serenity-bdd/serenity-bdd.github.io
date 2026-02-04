---
id: playwright_screenplay_tutorial
title: "Tutorial: Screenplay con TodoMVC"
sidebar_position: 8
---

# Tutorial: Construyendo un conjunto de pruebas con Screenplay

Este tutorial te guia en la construccion de un conjunto de pruebas de Serenity Playwright usando el Screenplay Pattern para la [aplicacion TodoMVC](https://todomvc.com/examples/react/dist/). Lo construiremos iterativamente, comenzando con los fundamentos y agregando progresivamente patrones mas sofisticados.

## Lo que vamos a construir

Al final de este tutorial, tendras un conjunto de pruebas completo con:
- **Target** para todos los elementos de UI
- **Task** para acciones del usuario (agregar, completar, eliminar, filtrar todos)
- **Question** para consultar el estado de la aplicacion
- **Pruebas** usando aserciones `Ensure.that()`

## Configuracion del proyecto

Crea un proyecto Maven con estas dependencias:

```xml
<properties>
    <serenity.version>5.1.1</serenity.version>
    <playwright.version>1.58.0</playwright.version>
</properties>

<dependencies>
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-screenplay-playwright</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-screenplay</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-ensure</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-junit5</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>com.microsoft.playwright</groupId>
        <artifactId>playwright</artifactId>
        <version>${playwright.version}</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>6.0.1</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## Parte 1: Nuestra primera prueba

Comencemos con la prueba mas simple posible - agregar un solo elemento todo.

### Paso 1: Crear la clase base de prueba

Primero, crea una clase base que configure nuestro Actor con Ability de Playwright:

```java
package todomvc.screenplay;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import org.junit.jupiter.api.BeforeEach;

public abstract class ScreenplayPlaywrightTest {

    protected Actor toby;

    @BeforeEach
    void setUpPlaywright() {
        toby = Actor.named("Toby");
        toby.can(BrowseTheWebWithPlaywright.usingTheDefaultConfiguration());
    }

    // No se necesita @AfterEach - BrowseTheWebWithPlaywright automaticamente
    // limpia los recursos del navegador cuando la prueba termina
}
```

:::tip Limpieza automatica
La Ability `BrowseTheWebWithPlaywright` se suscribe a los eventos del ciclo de vida de Serenity y automaticamente cierra el navegador, contexto y pagina cuando cada prueba se completa. No necesitas escribir ningún codigo de limpieza!
:::

### Paso 2: Definir Target de UI

Crea una clase para contener todos los localizadores de elementos de UI:

```java
package todomvc.screenplay.ui;

import net.serenitybdd.screenplay.playwright.Target;

public class TodoList {

    public static final Target NEW_TODO_INPUT =
        Target.the("new todo input")
              .locatedBy("[placeholder='What needs to be done?']");

    public static final Target TODO_ITEMS =
        Target.the("todo items")
              .locatedBy(".todo-list li");

    public static final Target TODO_ITEM_LABELS =
        Target.the("todo item labels")
              .locatedBy(".todo-list li label");
}
```

### Paso 3: Crear el primer Task

Crea un Task para abrir la aplicacion TodoMVC:

```java
package todomvc.screenplay.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.playwright.interactions.Open;
import net.serenitybdd.annotations.Step;

public class OpenTodoMvcApp implements Task {

    private static final String URL = "https://todomvc.com/examples/react/dist/";

    @Override
    @Step("{0} opens the TodoMVC application")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(Open.url(URL));
    }

    public static OpenTodoMvcApp onTheHomePage() {
        return new OpenTodoMvcApp();
    }
}
```

### Paso 4: Crear el Task para agregar todo

```java
package todomvc.screenplay.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.playwright.interactions.Enter;
import net.serenitybdd.screenplay.playwright.interactions.Press;
import net.serenitybdd.annotations.Step;
import todomvc.screenplay.ui.TodoList;

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

### Paso 5: Crear una Question

Crea una Question para contar los todos visibles:

```java
package todomvc.screenplay.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import todomvc.screenplay.ui.TodoList;

public class TheVisibleTodos {

    public static Question<Integer> count() {
        return Question.about("visible todo count").answeredBy(
            actor -> BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(TodoList.TODO_ITEMS.asSelector())
                .count()
        );
    }
}
```

### Paso 6: Escribir la prueba

```java
package todomvc.screenplay;

import net.serenitybdd.junit5.SerenityJUnit5Extension;
import net.serenitybdd.screenplay.ensure.Ensure;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import todomvc.screenplay.questions.TheVisibleTodos;
import todomvc.screenplay.tasks.AddATodoItem;
import todomvc.screenplay.tasks.OpenTodoMvcApp;

@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("When adding todos")
class WhenAddingTodosTest extends ScreenplayPlaywrightTest {

    @Test
    @DisplayName("should add a single todo item")
    void shouldAddSingleTodoItem() {
        toby.attemptsTo(
            OpenTodoMvcApp.onTheHomePage(),
            AddATodoItem.called("Buy milk"),
            Ensure.that(TheVisibleTodos.count()).isEqualTo(1)
        );
    }
}
```

Ejecutalo con `mvn clean verify` - deberias ver una prueba pasando con un reporte de Serenity.

## Parte 2: Expandiendo nuestro conjunto de pruebas

Ahora agreguemos mas capacidades.

### Agregando mas Target

Expande la clase `TodoList` con mas localizadores:

```java
public class TodoList {

    // Elementos de entrada
    public static final Target NEW_TODO_INPUT =
        Target.the("new todo input")
              .locatedBy("[placeholder='What needs to be done?']");

    // Elementos todo
    public static final Target TODO_ITEMS =
        Target.the("todo items")
              .locatedBy(".todo-list li");

    public static final Target TODO_ITEM_LABELS =
        Target.the("todo item labels")
              .locatedBy(".todo-list li label");

    // Target dinamicos para elementos especificos
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

    // Elementos del pie de pagina
    public static final Target TODO_COUNT =
        Target.the("todo count")
              .locatedBy(".todo-count");

    public static final Target CLEAR_COMPLETED_BUTTON =
        Target.the("clear completed button")
              .locatedBy(".clear-completed");

    // Filtros
    public static final Target ALL_FILTER =
        Target.the("All filter")
              .locatedBy(".filters a:has-text('All')");

    public static final Target ACTIVE_FILTER =
        Target.the("Active filter")
              .locatedBy(".filters a:has-text('Active')");

    public static final Target COMPLETED_FILTER =
        Target.the("Completed filter")
              .locatedBy(".filters a:has-text('Completed')");

    public static final Target SELECTED_FILTER =
        Target.the("selected filter")
              .locatedBy(".filters a.selected");
}
```

### Task Complete

```java
package todomvc.screenplay.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.playwright.interactions.Click;
import net.serenitybdd.annotations.Step;
import todomvc.screenplay.ui.TodoList;

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

    public static Complete todoItem(String todoItem) {
        return new Complete(todoItem);
    }
}
```

### Task Delete

```java
package todomvc.screenplay.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.playwright.interactions.Click;
import net.serenitybdd.screenplay.playwright.interactions.Hover;
import net.serenitybdd.annotations.Step;
import todomvc.screenplay.ui.TodoList;

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

    public static Delete theTodoItem(String todoItem) {
        return new Delete(todoItem);
    }
}
```

### Task de filtrado

```java
package todomvc.screenplay.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.playwright.interactions.Click;
import todomvc.screenplay.ui.TodoList;

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

### Mas Question

```java
// TheVisibleTodos.java - expandido
package todomvc.screenplay.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import todomvc.screenplay.ui.TodoList;

import java.util.Collection;

public class TheVisibleTodos {

    public static Question<Collection<String>> displayed() {
        return Question.about("the visible todos").answeredBy(
            actor -> BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(TodoList.TODO_ITEM_LABELS.asSelector())
                .allTextContents()
        );
    }

    public static Question<Integer> count() {
        return Question.about("visible todo count").answeredBy(
            actor -> BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(TodoList.TODO_ITEMS.asSelector())
                .count()
        );
    }
}
```

```java
// TheRemainingCount.java
package todomvc.screenplay.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import todomvc.screenplay.ui.TodoList;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class TheRemainingCount {

    private static final Pattern COUNT_PATTERN = Pattern.compile("(\\d+)");

    public static Question<Integer> value() {
        return Question.about("the remaining count").answeredBy(actor -> {
            String text = BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(TodoList.TODO_COUNT.asSelector())
                .textContent();

            Matcher matcher = COUNT_PATTERN.matcher(text);
            return matcher.find() ? Integer.parseInt(matcher.group(1)) : 0;
        });
    }
}
```

```java
// TheCurrentFilter.java
package todomvc.screenplay.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import todomvc.screenplay.ui.TodoList;

public class TheCurrentFilter {

    public static Question<String> selected() {
        return Question.about("the current filter").answeredBy(
            actor -> BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(TodoList.SELECTED_FILTER.asSelector())
                .textContent()
        );
    }
}
```

```java
// TheTodoItem.java - constructor fluido de Question
package todomvc.screenplay.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import todomvc.screenplay.ui.TodoList;

public class TheTodoItem {

    private final String todoItem;

    public TheTodoItem(String todoItem) {
        this.todoItem = todoItem;
    }

    public static TheTodoItem called(String todoItem) {
        return new TheTodoItem(todoItem);
    }

    public Question<Boolean> exists() {
        String item = todoItem;
        return Question.about("whether '" + item + "' exists").answeredBy(
            actor -> BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(TodoList.todoItemCalled(item).asSelector())
                .count() > 0
        );
    }

    public Question<Boolean> isCompleted() {
        String item = todoItem;
        return Question.about("whether '" + item + "' is completed").answeredBy(
            actor -> BrowseTheWebWithPlaywright.as(actor)
                .getCurrentPage()
                .locator(TodoList.todoItemCalled(item).asSelector())
                .getAttribute("class")
                .contains("completed")
        );
    }
}
```

## Parte 3: Conjunto de pruebas completo

Ahora tenemos todo para escribir un conjunto de pruebas completo:

### Pruebas de agregar todos

```java
@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("When adding todos (Screenplay)")
class WhenAddingTodosScreenplayTest extends ScreenplayPlaywrightTest {

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

    @Test
    @DisplayName("should update remaining count when adding todos")
    void shouldUpdateRemainingCountWhenAddingTodos() {
        toby.attemptsTo(
            OpenTodoMvcApp.onTheHomePage(),
            AddATodoItem.called("Task 1"),
            Ensure.that(TheRemainingCount.value()).isEqualTo(1),

            AddATodoItem.called("Task 2"),
            Ensure.that(TheRemainingCount.value()).isEqualTo(2),

            AddATodoItem.called("Task 3"),
            Ensure.that(TheRemainingCount.value()).isEqualTo(3)
        );
    }
}
```

### Pruebas de completar todos

```java
@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("When completing todos (Screenplay)")
class WhenCompletingTodosScreenplayTest extends ScreenplayPlaywrightTest {

    @BeforeEach
    void setupTodos() {
        toby.attemptsTo(
            OpenTodoMvcApp.onTheHomePage(),
            AddATodoItem.called("Buy milk"),
            AddATodoItem.called("Walk the dog"),
            AddATodoItem.called("Do laundry")
        );
    }

    @Test
    @DisplayName("should mark a todo as completed")
    void shouldMarkTodoAsCompleted() {
        toby.attemptsTo(
            Complete.todoItem("Buy milk"),
            Ensure.that(TheTodoItem.called("Buy milk").isCompleted()).isTrue(),
            Ensure.that(TheRemainingCount.value()).isEqualTo(2)
        );
    }

    @Test
    @DisplayName("should clear completed todos")
    void shouldClearCompletedTodos() {
        toby.attemptsTo(
            Complete.todoItem("Buy milk"),
            Complete.todoItem("Walk the dog"),
            Click.on(TodoList.CLEAR_COMPLETED_BUTTON),
            Ensure.that(TheVisibleTodos.displayed()).containsExactly("Do laundry"),
            Ensure.that(TheVisibleTodos.count()).isEqualTo(1)
        );
    }
}
```

### Pruebas de filtrado

```java
@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("When filtering todos (Screenplay)")
class WhenFilteringTodosScreenplayTest extends ScreenplayPlaywrightTest {

    @BeforeEach
    void setupTodos() {
        toby.attemptsTo(
            OpenTodoMvcApp.onTheHomePage(),
            AddATodoItem.called("Buy milk"),
            AddATodoItem.called("Walk the dog"),
            AddATodoItem.called("Do laundry"),
            Complete.todoItem("Walk the dog")
        );
    }

    @Test
    @DisplayName("should show all todos by default")
    void shouldShowAllTodosByDefault() {
        toby.attemptsTo(
            Ensure.that(TheCurrentFilter.selected()).isEqualTo("All"),
            Ensure.that(TheVisibleTodos.displayed())
                .containsExactly("Buy milk", "Walk the dog", "Do laundry")
        );
    }

    @Test
    @DisplayName("should filter to show only active todos")
    void shouldFilterToShowOnlyActiveTodos() {
        toby.attemptsTo(
            FilterTodos.toShowActive(),
            Ensure.that(TheCurrentFilter.selected()).isEqualTo("Active"),
            Ensure.that(TheVisibleTodos.displayed())
                .containsExactly("Buy milk", "Do laundry")
        );
    }

    @Test
    @DisplayName("should filter to show only completed todos")
    void shouldFilterToShowOnlyCompletedTodos() {
        toby.attemptsTo(
            FilterTodos.toShowCompleted(),
            Ensure.that(TheCurrentFilter.selected()).isEqualTo("Completed"),
            Ensure.that(TheVisibleTodos.displayed()).containsExactly("Walk the dog")
        );
    }

    @Test
    @DisplayName("should switch between filters")
    void shouldSwitchBetweenFilters() {
        toby.attemptsTo(
            FilterTodos.toShowActive(),
            Ensure.that(TheVisibleTodos.count()).isEqualTo(2),

            FilterTodos.toShowCompleted(),
            Ensure.that(TheVisibleTodos.count()).isEqualTo(1),

            FilterTodos.toShowAll(),
            Ensure.that(TheVisibleTodos.count()).isEqualTo(3)
        );
    }
}
```

### Pruebas de eliminar

```java
@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("When deleting todos (Screenplay)")
class WhenDeletingTodosScreenplayTest extends ScreenplayPlaywrightTest {

    @BeforeEach
    void setupTodos() {
        toby.attemptsTo(
            OpenTodoMvcApp.onTheHomePage(),
            AddATodoItem.called("Buy milk"),
            AddATodoItem.called("Walk the dog"),
            AddATodoItem.called("Do laundry")
        );
    }

    @Test
    @DisplayName("should delete a todo item")
    void shouldDeleteTodoItem() {
        toby.attemptsTo(
            Delete.theTodoItem("Walk the dog"),
            Ensure.that(TheTodoItem.called("Walk the dog").exists()).isFalse(),
            Ensure.that(TheVisibleTodos.displayed())
                .containsExactly("Buy milk", "Do laundry")
        );
    }

    @Test
    @DisplayName("should update the remaining count after deleting")
    void shouldUpdateRemainingCountAfterDeleting() {
        toby.attemptsTo(
            Ensure.that(TheRemainingCount.value()).isEqualTo(3),
            Delete.theTodoItem("Buy milk"),
            Ensure.that(TheRemainingCount.value()).isEqualTo(2)
        );
    }
}
```

## Conclusiones clave

### Beneficios del Screenplay Pattern

1. **Legibilidad**: Las pruebas se leen como especificaciones
   ```java
   toby.attemptsTo(
       OpenTodoMvcApp.onTheHomePage(),
       AddATodoItem.called("Buy milk"),
       Complete.todoItem("Buy milk"),
       Ensure.that(TheRemainingCount.value()).isEqualTo(0)
   );
   ```

2. **Reusabilidad**: Los Task y Question pueden componerse y reutilizarse
3. **Mantenibilidad**: Los cambios a la UI estan aislados en las definiciones de Target
4. **Expresividad**: La intencion de negocio es clara en cada prueba

### Estructura del proyecto

```
src/test/java/
├── todomvc/screenplay/
│   ├── ScreenplayPlaywrightTest.java    # Clase base de prueba
│   ├── WhenAddingTodosTest.java         # Clase de prueba
│   ├── WhenCompletingTodosTest.java     # Clase de prueba
│   ├── WhenFilteringTodosTest.java      # Clase de prueba
│   ├── WhenDeletingTodosTest.java       # Clase de prueba
│   ├── ui/
│   │   └── TodoList.java                # Target de UI
│   ├── tasks/
│   │   ├── OpenTodoMvcApp.java
│   │   ├── AddATodoItem.java
│   │   ├── Complete.java
│   │   ├── Delete.java
│   │   └── FilterTodos.java
│   └── questions/
│       ├── TheVisibleTodos.java
│       ├── TheRemainingCount.java
│       ├── TheCurrentFilter.java
│       └── TheTodoItem.java
```

## Siguientes pasos

- Aprende sobre [caracteristicas avanzadas de Screenplay](playwright_screenplay) incluyendo intercepcion de red y multiples pestanas
- Explora [aserciones especificas de Playwright](playwright_screenplay#playwright-specific-assertions) con reintento automatico
- Consulta las [Mejores practicas](playwright_best_practices) para pruebas listas para produccion
