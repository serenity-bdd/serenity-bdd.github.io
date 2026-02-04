---
id: playwright_cucumber
title: Integracion con Cucumber
sidebar_position: 9
---

# Integracion de Cucumber con Playwright Screenplay

Cucumber proporciona una sintaxis de lenguaje natural para escribir pruebas basadas en comportamiento. Cuando se combina con la implementacion de Screenplay de Serenity Playwright, obtienes escenarios BDD expresivos que impulsan automatizacion de navegadores confiable.

Esta guia te muestra como integrar Cucumber con Serenity Playwright usando el Screenplay Pattern.

## Configuracion del proyecto

### Dependencias de Maven

Agrega las siguientes dependencias a tu `pom.xml`:

```xml
<properties>
    <serenity.version>5.1.1</serenity.version>
    <playwright.version>1.58.0</playwright.version>
    <cucumber.version>7.34.2</cucumber.version>
    <junit.version>5.11.4</junit.version>
</properties>

<dependencyManagement>
    <dependencies>
        <!-- Usa BOMs para gestion de versiones -->
        <dependency>
            <groupId>org.junit</groupId>
            <artifactId>junit-bom</artifactId>
            <version>${junit.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>io.cucumber</groupId>
            <artifactId>cucumber-bom</artifactId>
            <version>${cucumber.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <!-- Serenity Screenplay con Playwright -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-screenplay-playwright</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Integracion Serenity Cucumber -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-cucumber</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Cucumber (versiones gestionadas por cucumber-bom) -->
    <dependency>
        <groupId>io.cucumber</groupId>
        <artifactId>cucumber-java</artifactId>
        <scope>test</scope>
    </dependency>

    <dependency>
        <groupId>io.cucumber</groupId>
        <artifactId>cucumber-junit-platform-engine</artifactId>
        <scope>test</scope>
    </dependency>

    <!-- JUnit Platform Suite -->
    <dependency>
        <groupId>org.junit.platform</groupId>
        <artifactId>junit-platform-suite</artifactId>
        <scope>test</scope>
    </dependency>

    <!-- Serenity Ensure para aserciones -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-ensure</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### Instalar navegadores de Playwright

Antes de ejecutar pruebas, instala los navegadores de Playwright:

```bash
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install"
```

## Estructura del proyecto

Una estructura de proyecto tipica se ve asi:

```
src/test/
├── java/
│   └── yourpackage/
│       ├── cucumber/
│       │   ├── CucumberTestSuite.java      # Ejecutor de pruebas
│       │   ├── PlaywrightHooks.java        # Hooks de Cucumber
│       │   └── StepDefinitions.java        # Step Definition
│       └── screenplay/
│           ├── tasks/                       # Task reutilizables
│           │   ├── OpenTheApplication.java
│           │   └── AddATodoItem.java
│           ├── questions/                   # Question reutilizables
│           │   └── TheVisibleTodos.java
│           └── ui/                          # Definiciones de Target
│               └── TodoList.java
└── resources/
    ├── features/
    │   └── managing_todos.feature          # Archivos Feature
    └── serenity.properties                  # Configuracion
```

## Paso 1: Crear el ejecutor de pruebas

El ejecutor de pruebas configura Cucumber para trabajar con Serenity:

```java
package yourpackage.cucumber;

import org.junit.platform.suite.api.*;
import static io.cucumber.junit.platform.engine.Constants.*;

@Suite
@IncludeEngines("cucumber")
@SelectPackages("yourpackage.cucumber")
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME,
    value = "net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel,pretty")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME,
    value = "yourpackage.cucumber,net.serenitybdd.cucumber.actors")
@ConfigurationParameter(key = FEATURES_PROPERTY_NAME,
    value = "src/test/resources/features")
public class CucumberTestSuite {
}
```

:::important Configuracion del Glue Path
Siempre incluye `net.serenitybdd.cucumber.actors` en tu glue path. Esto registra el `StageDirector` de Serenity que automaticamente llama a `OnStage.drawTheCurtain()` despues de cada Scenario para limpiar los recursos del navegador.
:::

## Paso 2: Crear hooks de Playwright

La clase de hooks configura el escenario de Playwright antes de cada Scenario:

```java
package yourpackage.cucumber;

import io.cucumber.java.Before;
import io.cucumber.java.ParameterType;
import io.cucumber.java.Scenario;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.playwright.actors.PlaywrightCast;

public class PlaywrightHooks {

    /**
     * Configura el escenario de Playwright antes de cada Scenario.
     * Order 0 asegura que esto se ejecute primero entre todos los hooks @Before.
     */
    @Before(order = 0)
    public void setTheStage(Scenario scenario) {
        OnStage.setTheStage(new PlaywrightCast());
    }

    /**
     * Define el tipo de parametro {actor} para los pasos de Cucumber.
     * Esto permite que pasos como "Given Toby is on the application"
     * resuelvan automaticamente "Toby" a una instancia de Actor.
     */
    @ParameterType(".*")
    public Actor actor(String actorName) {
        return OnStage.theActorCalled(actorName);
    }
}
```

### Entendiendo los hooks

**`@Before(order = 0)`**: El `order = 0` asegura que el escenario se configure antes de que cualquier otro hook se ejecute. Esto es importante si tienes otros hooks `@Before` que dependen de los Actor.

**`@ParameterType(".*")`**: Esto crea un tipo de parametro personalizado que convierte nombres de Actor en archivos Feature a instancias de `Actor`. El patron `.*` coincide con cualquier cadena.

**Limpieza automatica**: No necesitas un hook `@After` para limpieza. El `StageDirector` (incluido via el glue path) maneja automaticamente la limpieza llamando a `OnStage.drawTheCurtain()`.

## Paso 3: Escribir archivos Feature

Los archivos Feature describen comportamiento en sintaxis Gherkin:

```gherkin
# src/test/resources/features/managing_todos.feature
@playwright
Feature: Managing Todo Items
  As a busy person
  I want to manage my todo list
  So that I can keep track of what I need to do

  Background:
    Given Toby is on the TodoMVC application

  Scenario: Adding a single todo item
    When Toby adds a todo item called "Buy milk"
    Then the todo list should contain "Buy milk"
    And the remaining item count should be 1

  Scenario: Adding multiple todo items
    When Toby adds the following todo items:
      | Buy milk     |
      | Walk the dog |
      | Do laundry   |
    Then the todo list should contain:
      | Buy milk     |
      | Walk the dog |
      | Do laundry   |
    And the remaining item count should be 3

  Scenario: Completing a todo item
    Given Toby has added the following todo items:
      | Buy milk     |
      | Walk the dog |
    When Toby completes the todo item "Walk the dog"
    Then the remaining item count should be 1

  Scenario: Filtering to show only active todos
    Given Toby has added the following todo items:
      | Buy milk     |
      | Walk the dog |
    And Toby has completed the todo item "Walk the dog"
    When Toby filters to show "Active" todos
    Then the visible todo list should contain:
      | Buy milk |
```

## Paso 4: Crear Step Definition

Las Step Definition conectan los archivos Feature con los Task de Screenplay:

```java
package yourpackage.cucumber;

import io.cucumber.java.en.*;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.ensure.Ensure;
import yourpackage.screenplay.tasks.*;
import yourpackage.screenplay.questions.*;

import java.util.List;

public class TodoStepDefinitions {

    @Given("{actor} is on the TodoMVC application")
    public void actorIsOnTheTodoMvcApplication(Actor actor) {
        actor.attemptsTo(
            OpenTheApplication.onTheTodoMvcHomePage()
        );
    }

    @When("{actor} adds a todo item called {string}")
    public void actorAddsTodoItemCalled(Actor actor, String todoItem) {
        actor.attemptsTo(
            AddATodoItem.called(todoItem)
        );
    }

    @When("{actor} adds the following todo items:")
    public void actorAddsTheFollowingTodoItems(Actor actor, List<String> todoItems) {
        for (String item : todoItems) {
            actor.attemptsTo(
                AddATodoItem.called(item)
            );
        }
    }

    @Given("{actor} has added the following todo items:")
    public void actorHasAddedTheFollowingTodoItems(Actor actor, List<String> todoItems) {
        actorIsOnTheTodoMvcApplication(actor);
        actorAddsTheFollowingTodoItems(actor, todoItems);
    }

    @When("{actor} completes the todo item {string}")
    public void actorCompletesTheTodoItem(Actor actor, String todoItem) {
        actor.attemptsTo(
            Complete.todoItem(todoItem)
        );
    }

    @Given("{actor} has completed the todo item {string}")
    public void actorHasCompletedTheTodoItem(Actor actor, String todoItem) {
        actorCompletesTheTodoItem(actor, todoItem);
    }

    @When("{actor} filters to show {string} todos")
    public void actorFiltersToShow(Actor actor, String filterType) {
        actor.attemptsTo(
            FilterTodos.toShow(filterType)
        );
    }

    @Then("the todo list should contain {string}")
    public void theTodoListShouldContain(String expectedItem) {
        Actor actor = OnStage.theActorInTheSpotlight();
        actor.attemptsTo(
            Ensure.that(TheVisibleTodos.displayed()).contains(expectedItem)
        );
    }

    @Then("the todo list should contain:")
    public void theTodoListShouldContainItems(List<String> expectedItems) {
        Actor actor = OnStage.theActorInTheSpotlight();
        actor.attemptsTo(
            Ensure.that(TheVisibleTodos.displayed())
                  .containsExactlyElementsFrom(expectedItems)
        );
    }

    @Then("the visible todo list should contain:")
    public void theVisibleTodoListShouldContain(List<String> expectedItems) {
        Actor actor = OnStage.theActorInTheSpotlight();
        actor.attemptsTo(
            Ensure.that(TheVisibleTodos.displayed())
                  .containsExactlyElementsFrom(expectedItems)
        );
    }

    @Then("the remaining item count should be {int}")
    public void theRemainingItemCountShouldBe(int expectedCount) {
        Actor actor = OnStage.theActorInTheSpotlight();
        actor.attemptsTo(
            Ensure.that(TheRemainingCount.value()).isEqualTo(expectedCount)
        );
    }
}
```

### Patrones clave en Step Definition

**Parametro Actor**: El parametro `{actor}` se resuelve automaticamente a una instancia de Actor gracias a la definicion `@ParameterType` en los hooks.

**Pasos Background**: Pasos como `actorHasAddedTheFollowingTodoItems` componen multiples acciones, permitiendo que los pasos `Given` configuren precondiciones complejas.

**El Actor en el centro de atencion**: Para pasos `Then` que no reciben un parametro de Actor, usa `OnStage.theActorInTheSpotlight()` para obtener el ultimo Actor que realizo una accion.

**Tablas de datos**: Las tablas de datos de Cucumber se mapean directamente a `List<String>` para tablas de una sola columna.

## Paso 5: Crear Task de Screenplay

Los Task encapsulan acciones a nivel de negocio:

```java
package yourpackage.screenplay.tasks;

import net.serenitybdd.annotations.Step;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import net.serenitybdd.screenplay.playwright.interactions.Open;

public class OpenTheApplication implements Task {

    private static final String TODO_MVC_URL = "https://todomvc.com/examples/react/dist/";

    @Override
    @Step("{0} opens the TodoMVC application")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Open.url(TODO_MVC_URL)
        );

        // Limpiar localStorage para asegurar un estado limpio
        // (TodoMVC persiste los todos en localStorage)
        var page = BrowseTheWebWithPlaywright.as(actor).getCurrentPage();
        page.evaluate("() => localStorage.clear()");
        page.reload();
    }

    public static OpenTheApplication onTheTodoMvcHomePage() {
        return new OpenTheApplication();
    }
}
```

```java
package yourpackage.screenplay.tasks;

import net.serenitybdd.annotations.Step;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.playwright.interactions.*;
import yourpackage.screenplay.ui.TodoList;

public class AddATodoItem implements Task {

    private final String itemName;

    public AddATodoItem(String itemName) {
        this.itemName = itemName;
    }

    @Override
    @Step("{0} adds a todo item called '#itemName'")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Enter.theValue(itemName).into(TodoList.NEW_TODO_INPUT),
            Press.keys("Enter")
        );
    }

    public static AddATodoItem called(String itemName) {
        return new AddATodoItem(itemName);
    }
}
```

## Paso 6: Crear Question de Screenplay

Las Question consultan el estado de la aplicacion:

```java
package yourpackage.screenplay.questions;

import net.serenitybdd.annotations.Step;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import yourpackage.screenplay.ui.TodoList;

import java.util.Collection;

public class TheVisibleTodos implements Question<Collection<String>> {

    @Override
    @Step("{0} checks the visible todo items")
    public Collection<String> answeredBy(Actor actor) {
        var page = BrowseTheWebWithPlaywright.as(actor).getCurrentPage();
        return page.locator(TodoList.TODO_ITEMS.asSelector())
                   .allTextContents();
    }

    public static TheVisibleTodos displayed() {
        return new TheVisibleTodos();
    }
}
```

## Paso 7: Definir Target de UI

Los Target definen como localizar elementos:

```java
package yourpackage.screenplay.ui;

import net.serenitybdd.screenplay.playwright.Target;

public class TodoList {
    public static final Target NEW_TODO_INPUT =
        Target.the("new todo input").locatedBy(".new-todo");

    public static final Target TODO_ITEMS =
        Target.the("todo items").locatedBy(".todo-list li label");

    public static final Target TODO_COUNT =
        Target.the("todo count").locatedBy(".todo-count");

    public static final Target TOGGLE_ALL =
        Target.the("toggle all checkbox").locatedBy(".toggle-all");
}
```

## Ejecutando las pruebas

### Ejecutar todas las pruebas de Cucumber

```bash
mvn clean verify
```

### Ejecutar pruebas con etiquetas especificas

```bash
mvn clean verify -Dcucumber.filter.tags="@playwright"
```

### Ejecutar un solo Scenario

```bash
mvn clean verify -Dcucumber.filter.name="Adding a single todo item"
```

### Ver reportes

Despues de ejecutar las pruebas, abre el reporte de Serenity:

```
target/site/serenity/index.html
```

## Configuracion

### serenity.properties

```properties
# Configuracion del navegador
playwright.browsertype=chromium
playwright.headless=true

# Configuracion de capturas de pantalla
serenity.take.screenshots=FOR_FAILURES

# Configuracion del reporte
serenity.project.name=My TodoMVC Tests
```

### cucumber.properties

```properties
# Configuracion de Cucumber
cucumber.publish.quiet=true
```

## Configuracion avanzada

### Configuracion de navegador personalizada

Configura `PlaywrightCast` con opciones personalizadas:

```java
@Before(order = 0)
public void setTheStage(Scenario scenario) {
    BrowserType.LaunchOptions options = new BrowserType.LaunchOptions()
        .setHeadless(false)
        .setSlowMo(100);  // Ralentizar para depuracion

    OnStage.setTheStage(
        new PlaywrightCast()
            .withLaunchOptions(options)
            .withBrowserType("firefox")
    );
}
```

### Multiples Actor

Los Scenario pueden involucrar multiples Actor:

```gherkin
Scenario: Collaborative editing
  Given Alice has added a todo item called "Shared task"
  When Bob views the todo list
  Then Bob should see "Shared task" in the list
```

```java
@When("{actor} views the todo list")
public void actorViewsTheTodoList(Actor actor) {
    actor.attemptsTo(
        OpenTheApplication.onTheTodoMvcHomePage()
    );
}
```

Cada Actor obtiene su propia instancia de navegador automaticamente a traves de `PlaywrightCast`.

## Solucion de problemas

### Filtracion de estado entre Scenario

Si las pruebas interfieren entre si:

1. Verifica que `net.serenitybdd.cucumber.actors` este en tu glue path
2. Limpia el estado de la aplicacion (como localStorage) en tu Task de navegacion
3. Asegurate de que `@Before(order = 0)` este configurado en tu hook de configuracion del escenario

### Elemento no encontrado

Si los elementos no se encuentran:

1. Usa la espera automatica integrada de Playwright (esta habilitada por defecto)
2. Verifica tus selectores usando DevTools del navegador
3. Considera usar los selectores mas robustos de Playwright como `text=`, `role=`, etc.

### Capturas de pantalla no capturadas

Configura el modo de captura en `serenity.properties`:

```properties
serenity.take.screenshots=FOR_EACH_ACTION
```

## Repositorio de ejemplo

Un ejemplo completo y funcional esta disponible en el repositorio [serenity-playwright-todomvc-demo](https://github.com/serenity-bdd/serenity-playwright-todomvc-demo).

## Ver tambien

- [Screenplay Pattern con Playwright](playwright_screenplay) - Conceptos principales de Screenplay
- [Tutorial: Screenplay con TodoMVC](playwright_screenplay_tutorial) - Construyendo un conjunto de pruebas desde cero
- [Referencia de configuracion de Cucumber](/docs/cucumber/configuration-reference) - Todas las opciones de Cucumber
- [Ejecucion en paralelo](/docs/cucumber/parallel-execution) - Ejecutando pruebas en paralelo
