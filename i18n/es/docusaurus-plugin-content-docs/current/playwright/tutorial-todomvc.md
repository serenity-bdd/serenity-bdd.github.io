---
id: playwright_tutorial_todomvc
title: "Tutorial: Probando TodoMVC"
sidebar_position: 7
---

# Tutorial: Construyendo un conjunto de pruebas paso a paso

Este tutorial te guia en la construccion de un conjunto de pruebas de Serenity Playwright para la [aplicacion TodoMVC](https://todomvc.com/examples/react/dist/). En lugar de mostrarte el codigo terminado desde el principio, lo construiremos iterativamente - comenzando con una sola prueba y agregando solo lo que necesitamos a medida que avanzamos.

Esto refleja como realmente desarrollarias pruebas en la practica: escribe una prueba, construye la infraestructura minima para soportarla, luego expande.

## Que estamos probando

TodoMVC es una aplicacion simple de lista de tareas donde los usuarios pueden agregar, completar, editar y eliminar elementos. Comenzaremos con la funcionalidad mas basica y construiremos a partir de ahi.

## Configuracion del proyecto

Primero, crea un proyecto Maven con estas dependencias en `pom.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>serenity-playwright-todomvc</artifactId>
    <version>1.0.0-SNAPSHOT</version>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <serenity.version>5.1.0</serenity.version>
        <playwright.version>1.57.0</playwright.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-playwright</artifactId>
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
        <dependency>
            <groupId>org.assertj</groupId>
            <artifactId>assertj-core</artifactId>
            <version>3.27.0</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-failsafe-plugin</artifactId>
                <version>3.5.0</version>
                <configuration>
                    <includes>
                        <include>**/*Test.java</include>
                    </includes>
                </configuration>
                <executions>
                    <execution>
                        <goals>
                            <goal>integration-test</goal>
                            <goal>verify</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
            <plugin>
                <groupId>net.serenity-bdd.maven.plugins</groupId>
                <artifactId>serenity-maven-plugin</artifactId>
                <version>${serenity.version}</version>
                <executions>
                    <execution>
                        <id>serenity-reports</id>
                        <phase>post-integration-test</phase>
                        <goals>
                            <goal>aggregate</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

## Iteracion 1: Nuestra primera prueba

Comencemos con la prueba mas simple posible: agregar un solo elemento todo.

### Escribe la prueba primero

Crea `src/test/java/todomvc/tests/WhenAddingTodosTest.java`:

```java
package todomvc.tests;

import com.microsoft.playwright.*;
import net.serenitybdd.annotations.Steps;
import net.serenitybdd.junit5.SerenityJUnit5Extension;
import net.serenitybdd.playwright.PlaywrightSerenity;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import todomvc.steps.TodoSteps;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("When adding todos")
class WhenAddingTodosTest {

    private Playwright playwright;
    private Browser browser;
    private Page page;

    @Steps
    TodoSteps todo;

    @BeforeEach
    void setUp() {
        playwright = Playwright.create();
        browser = playwright.chromium().launch(
            new BrowserType.LaunchOptions().setHeadless(true)
        );
        page = browser.newPage();
        PlaywrightSerenity.registerPage(page);
        todo.setPage(page);
    }

    @AfterEach
    void tearDown() {
        PlaywrightSerenity.unregisterPage(page);
        if (page != null) page.close();
        if (browser != null) browser.close();
        if (playwright != null) playwright.close();
    }

    @Test
    @DisplayName("should add a single todo item")
    void shouldAddSingleTodoItem() {
        todo.openApplication();
        todo.addTodo("Buy milk");

        assertThat(todo.visibleTodoCount()).isEqualTo(1);
    }
}
```

Esta prueba no compilara todavia - necesitamos crear la Step Library y el Page Object. Pero nota que hemos definido exactamente lo que necesitamos:
- `openApplication()` - navegar a la app
- `addTodo(String)` - agregar un elemento
- `visibleTodoCount()` - devolver cuantos elementos son visibles

### Crea la Step Library

Crea `src/test/java/todomvc/steps/TodoSteps.java` con solo los metodos que necesitamos:

```java
package todomvc.steps;

import com.microsoft.playwright.Page;
import net.serenitybdd.annotations.Step;
import todomvc.pages.TodoMvcPage;

public class TodoSteps {

    private TodoMvcPage todoMvcPage;

    public void setPage(Page page) {
        this.todoMvcPage = new TodoMvcPage(page);
    }

    @Step("Open the TodoMVC application")
    public void openApplication() {
        todoMvcPage.open();
    }

    @Step("Add a todo: '{0}'")
    public void addTodo(String todoText) {
        todoMvcPage.addTodo(todoText);
    }

    @Step("Get the number of visible todos")
    public int visibleTodoCount() {
        return todoMvcPage.getVisibleTodoCount();
    }
}
```

:::tip Los pasos devuelven datos, las pruebas hacen aserciones
Observa que `visibleTodoCount()` devuelve un `int`. La prueba hace la asercion, no la Step Library. Esto mantiene los pasos reutilizables - el mismo paso puede usarse en diferentes pruebas con diferentes valores esperados.
:::

### Crea el Page Object

Crea `src/test/java/todomvc/pages/TodoMvcPage.java` con solo lo que necesitamos:

```java
package todomvc.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;

public class TodoMvcPage {

    private final Page page;
    private static final String URL = "https://todomvc.com/examples/react/dist/";

    public TodoMvcPage(Page page) {
        this.page = page;
    }

    // Localizadores - mantener privados
    private Locator newTodoInput() {
        return page.getByPlaceholder("What needs to be done?");
    }

    private Locator todoItems() {
        return page.locator(".todo-list li");
    }

    // Acciones
    public void open() {
        page.navigate(URL);
        page.waitForLoadState();
    }

    public void addTodo(String todoText) {
        newTodoInput().fill(todoText);
        newTodoInput().press("Enter");
    }

    // Consultas
    public int getVisibleTodoCount() {
        return todoItems().count();
    }
}
```

### Ejecutalo

```bash
mvn clean verify
```

La prueba deberia pasar. Ahora tenemos un conjunto de pruebas minimo funcionando.

## Iteracion 2: Agregando mas aserciones

Mejoremos nuestra prueba para verificar que el texto del todo aparezca correctamente.

### Actualiza la prueba

```java
@Test
@DisplayName("should add a single todo item")
void shouldAddSingleTodoItem() {
    todo.openApplication();
    todo.addTodo("Buy milk");

    assertThat(todo.visibleTodoCount()).isEqualTo(1);
    assertThat(todo.todoExists("Buy milk")).isTrue();  // Nueva asercion
}
```

### Agrega a la Step Library

```java
@Step("Check if todo '{0}' exists")
public boolean todoExists(String todoText) {
    return todoMvcPage.hasTodo(todoText);
}
```

### Agrega al Page Object

```java
private Locator todoItemByText(String text) {
    return page.locator(".todo-list li").filter(
        new Locator.FilterOptions().setHasText(text)
    );
}

public boolean hasTodo(String todoText) {
    return todoItemByText(todoText).count() > 0;
}
```

Agregamos un nuevo metodo localizador `todoItemByText()` porque necesitabamos encontrar un elemento especifico. Este localizador se reutilizara para otras operaciones mas adelante.

## Iteracion 3: Probando multiples todos

### Agrega una nueva prueba

```java
@Test
@DisplayName("should add multiple todo items")
void shouldAddMultipleTodoItems() {
    todo.openApplication();
    todo.addTodos("Buy milk", "Walk the dog", "Do laundry");

    assertThat(todo.visibleTodoCount()).isEqualTo(3);
    assertThat(todo.visibleTodos())
        .containsExactly("Buy milk", "Walk the dog", "Do laundry");
}
```

### Agrega a la Step Library

```java
@Step("Add todos: {0}")
public void addTodos(String... todoTexts) {
    todoMvcPage.addTodos(todoTexts);
}

@Step("Get the visible todo items")
public List<String> visibleTodos() {
    return todoMvcPage.getVisibleTodoTexts();
}
```

### Agrega al Page Object

```java
public void addTodos(String... todoTexts) {
    for (String text : todoTexts) {
        addTodo(text);
    }
}

public List<String> getVisibleTodoTexts() {
    return todoItems().locator("label").allTextContents();
}
```

## Iteracion 4: Extraer una clase base de prueba

Estamos a punto de crear mas clases de prueba, y todas necesitaran la misma configuracion de Playwright. Extraigamos eso a una clase base.

### Crea la clase base

Crea `src/test/java/todomvc/tests/SerenityPlaywrightTest.java`:

```java
package todomvc.tests;

import com.microsoft.playwright.*;
import net.serenitybdd.playwright.PlaywrightSerenity;
import org.junit.jupiter.api.*;

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

### Simplifica la clase de prueba

```java
@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("When adding todos")
class WhenAddingTodosTest extends SerenityPlaywrightTest {

    @Steps
    TodoSteps todo;

    @BeforeEach
    void setUp() {
        todo.setPage(page);
    }

    @Test
    @DisplayName("should add a single todo item")
    void shouldAddSingleTodoItem() {
        todo.openApplication();
        todo.addTodo("Buy milk");

        assertThat(todo.visibleTodoCount()).isEqualTo(1);
        assertThat(todo.todoExists("Buy milk")).isTrue();
    }

    // ... otras pruebas
}
```

Mucho mas limpio! Cada clase de prueba ahora se enfoca puramente en la logica de prueba.

## Iteracion 5: Probando completar tareas

Ahora creemos una nueva clase de prueba para completar todos.

### Crea la clase de prueba

Crea `src/test/java/todomvc/tests/WhenCompletingTodosTest.java`:

```java
@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("When completing todos")
class WhenCompletingTodosTest extends SerenityPlaywrightTest {

    @Steps
    TodoSteps todo;

    @BeforeEach
    void setUp() {
        todo.setPage(page);
    }

    @Test
    @DisplayName("should mark a todo as completed")
    void shouldMarkTodoAsCompleted() {
        todo.openApplication();
        todo.addTodo("Buy milk");
        todo.completeTodo("Buy milk");

        assertThat(todo.todoIsCompleted("Buy milk")).isTrue();
    }
}
```

### Agrega a la Step Library

```java
@Step("Complete the todo: '{0}'")
public void completeTodo(String todoText) {
    todoMvcPage.completeTodo(todoText);
}

@Step("Check if todo '{0}' is completed")
public boolean todoIsCompleted(String todoText) {
    return todoMvcPage.isCompleted(todoText);
}
```

### Agrega al Page Object

```java
private Locator todoCheckbox(String text) {
    return todoItemByText(text).locator(".toggle");
}

public void completeTodo(String todoText) {
    todoCheckbox(todoText).click();
}

public boolean isCompleted(String todoText) {
    String classAttr = todoItemByText(todoText).getAttribute("class");
    return classAttr != null && classAttr.contains("completed");
}
```

Observa como reutilizamos `todoItemByText()` que creamos antes. El Page Object crece organicamente a medida que necesitamos mas funcionalidad.

## Iteracion 6: Probando el contador de elementos restantes

### Agrega otra prueba

```java
@Test
@DisplayName("should decrease remaining count when completing")
void shouldDecreaseRemainingCountWhenCompleting() {
    todo.openApplication();
    todo.addTodos("Task 1", "Task 2", "Task 3");

    assertThat(todo.remainingCount()).isEqualTo(3);

    todo.completeTodo("Task 2");

    assertThat(todo.remainingCount()).isEqualTo(2);
}
```

### Agrega a la Step Library

```java
@Step("Get the remaining items count")
public int remainingCount() {
    return todoMvcPage.getRemainingCount();
}
```

### Agrega al Page Object

```java
private Locator todoCount() {
    return page.locator(".todo-count");
}

public int getRemainingCount() {
    String text = todoCount().textContent();
    return Integer.parseInt(text.replaceAll("[^0-9]", ""));
}
```

## El patron

A estas alturas, puedes ver el patron:

1. **Escribe una prueba** que describa lo que quieres verificar
2. **Agrega metodos a la Step Library** que la prueba necesita
3. **Agrega metodos al Page Object** que los pasos necesitan
4. **Agrega localizadores** solo cuando un metodo los requiera

Este enfoque asegura:
- Nunca escribes codigo que no necesitas
- Cada adicion esta impulsada por un requisito concreto
- El Page Object crece naturalmente para coincidir con tu cobertura de pruebas

## Continua construyendo

Siguiendo este patron, puedes agregar pruebas para:
- Editar todos (doble clic, escribir, presionar Enter)
- Eliminar todos (hover, clic en boton destroy)
- Filtrado (All, Active, Completed)
- Marcar todos como completados
- Limpiar completados

Cada nueva prueba puede requerir nuevos metodos de paso, metodos de Page Object y localizadores - agregalos segun los necesites.

## Estructura final del proyecto

Despues de varias iteraciones, tu proyecto se vera asi:

```
src/test/java/todomvc/
├── pages/
│   └── TodoMvcPage.java         # Crece con cada iteracion
├── steps/
│   └── TodoSteps.java           # Crece con cada iteracion
└── tests/
    ├── SerenityPlaywrightTest.java  # Extraido en iteracion 4
    ├── WhenAddingTodosTest.java
    ├── WhenCompletingTodosTest.java
    ├── WhenEditingTodosTest.java    # Agregado despues
    ├── WhenDeletingTodosTest.java   # Agregado despues
    └── WhenFilteringTodosTest.java  # Agregado despues
```

## Conclusiones clave

| Principio | Por que importa |
|-----------|-----------------|
| **Comienza con una prueba** | Las pruebas impulsan que codigo escribes |
| **Agrega solo lo que necesitas** | Sin codigo especulativo que puede nunca usarse |
| **Extrae cuando emergen patrones** | La clase base llego despues de ver duplicacion |
| **Los pasos devuelven datos** | Las pruebas hacen aserciones, manteniendo los pasos reutilizables |
| **Localizadores privados** | La encapsulacion hace los cambios mas faciles |

## Codigo fuente completo

El codigo fuente completo para este tutorial esta disponible en:
[github.com/serenity-bdd/serenity-playwright-todomvc-demo](https://github.com/serenity-bdd/serenity-playwright-todomvc-demo)
