---
id: playwright_tutorial_todomvc
title: "Tutorial: Testando TodoMVC"
sidebar_position: 7
---

# Tutorial: Construindo uma Suíte de Testes Passo a Passo

Este tutorial mostra como construir uma suíte de testes Serenity Playwright para a [aplicação TodoMVC](https://todomvc.com/examples/react/dist/). Em vez de mostrar o código final de uma vez, vamos construí-lo iterativamente—começando com um único teste e adicionando apenas o que precisamos conforme avançamos.

Isso reflete como você realmente desenvolveria testes na prática: escreva um teste, construa a infraestrutura mínima para suportá-lo, depois expanda.

## O Que Estamos Testando

TodoMVC é uma aplicação simples de lista de tarefas onde usuários podem adicionar, completar, editar e excluir itens. Começaremos com a funcionalidade mais básica e evoluiremos a partir daí.

## Configuração do Projeto

Primeiro, crie um projeto Maven com estas dependências no `pom.xml`:

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

## Iteração 1: Nosso Primeiro Teste

Vamos começar com o teste mais simples possível: adicionar um único item de tarefa.

### Escreva o Teste Primeiro

Crie `src/test/java/todomvc/tests/WhenAddingTodosTest.java`:

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

Este teste ainda não vai compilar—precisamos criar a step library e o page object. Mas observe que definimos exatamente o que precisamos:
- `openApplication()` - navegar até a aplicação
- `addTodo(String)` - adicionar um item
- `visibleTodoCount()` - retornar quantos itens estão visíveis

### Crie a Step Library

Crie `src/test/java/todomvc/steps/TodoSteps.java` com apenas os métodos que precisamos:

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

:::tip Passos Retornam Dados, Testes Fazem Asserções
Observe que `visibleTodoCount()` retorna um `int`. O teste faz a asserção, não a step library. Isso mantém os passos reutilizáveis—o mesmo passo pode ser usado em diferentes testes com diferentes valores esperados.
:::

### Crie o Page Object

Crie `src/test/java/todomvc/pages/TodoMvcPage.java` com apenas o que precisamos:

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

    // Locators - mantenha privados
    private Locator newTodoInput() {
        return page.getByPlaceholder("What needs to be done?");
    }

    private Locator todoItems() {
        return page.locator(".todo-list li");
    }

    // Ações
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

### Execute

```bash
mvn clean verify
```

O teste deve passar. Agora temos uma suíte de testes funcional mínima.

## Iteração 2: Adicionando Mais Asserções

Vamos melhorar nosso teste para verificar se o texto da tarefa aparece corretamente.

### Atualize o Teste

```java
@Test
@DisplayName("should add a single todo item")
void shouldAddSingleTodoItem() {
    todo.openApplication();
    todo.addTodo("Buy milk");

    assertThat(todo.visibleTodoCount()).isEqualTo(1);
    assertThat(todo.todoExists("Buy milk")).isTrue();  // Nova asserção
}
```

### Adicione à Step Library

```java
@Step("Check if todo '{0}' exists")
public boolean todoExists(String todoText) {
    return todoMvcPage.hasTodo(todoText);
}
```

### Adicione ao Page Object

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

Adicionamos um novo método de locator `todoItemByText()` porque precisávamos encontrar um item específico. Este locator será reutilizado para outras operações depois.

## Iteração 3: Testando Múltiplas Tarefas

### Adicione um Novo Teste

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

### Adicione à Step Library

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

### Adicione ao Page Object

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

## Iteração 4: Extrair uma Classe Base de Teste

Estamos prestes a criar mais classes de teste, e todas precisarão da mesma configuração do Playwright. Vamos extrair isso para uma classe base.

### Crie a Classe Base

Crie `src/test/java/todomvc/tests/SerenityPlaywrightTest.java`:

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

### Simplifique a Classe de Teste

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

    // ... outros testes
}
```

Muito mais limpo! Cada classe de teste agora foca puramente na lógica do teste.

## Iteração 5: Testando Conclusão

Agora vamos criar uma nova classe de teste para completar tarefas.

### Crie a Classe de Teste

Crie `src/test/java/todomvc/tests/WhenCompletingTodosTest.java`:

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

### Adicione à Step Library

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

### Adicione ao Page Object

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

Observe como reutilizamos `todoItemByText()` que criamos antes. O page object cresce organicamente conforme precisamos de mais funcionalidade.

## Iteração 6: Testando a Contagem Restante

### Adicione Outro Teste

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

### Adicione à Step Library

```java
@Step("Get the remaining items count")
public int remainingCount() {
    return todoMvcPage.getRemainingCount();
}
```

### Adicione ao Page Object

```java
private Locator todoCount() {
    return page.locator(".todo-count");
}

public int getRemainingCount() {
    String text = todoCount().textContent();
    return Integer.parseInt(text.replaceAll("[^0-9]", ""));
}
```

## O Padrão

Agora você pode ver o padrão:

1. **Escreva um teste** que descreve o que você quer verificar
2. **Adicione métodos à step library** que o teste precisa
3. **Adicione métodos ao page object** que os passos precisam
4. **Adicione locators** apenas quando um método requer

Esta abordagem garante:
- Você nunca escreve código que não precisa
- Cada adição é orientada por um requisito concreto
- O page object cresce naturalmente para corresponder à cobertura de testes

## Continue Construindo

Seguindo este padrão, você pode adicionar testes para:
- Editar tarefas (duplo clique, digitar, pressionar Enter)
- Excluir tarefas (hover, clicar no botão de destruir)
- Filtrar (Todas, Ativas, Completadas)
- Alternar todas
- Limpar completadas

Cada novo teste pode requerer novos métodos de passos, métodos do page object e locators—adicione conforme necessário.

## Estrutura Final do Projeto

Após várias iterações, seu projeto ficará assim:

```
src/test/java/todomvc/
├── pages/
│   └── TodoMvcPage.java         # Cresce a cada iteração
├── steps/
│   └── TodoSteps.java           # Cresce a cada iteração
└── tests/
    ├── SerenityPlaywrightTest.java  # Extraída na iteração 4
    ├── WhenAddingTodosTest.java
    ├── WhenCompletingTodosTest.java
    ├── WhenEditingTodosTest.java    # Adicionada depois
    ├── WhenDeletingTodosTest.java   # Adicionada depois
    └── WhenFilteringTodosTest.java  # Adicionada depois
```

## Principais Lições

| Princípio | Por Que Importa |
|-----------|----------------|
| **Comece com um teste** | Testes direcionam qual código você escreve |
| **Adicione apenas o necessário** | Sem código especulativo que pode nunca ser usado |
| **Extraia quando padrões emergirem** | Classe base surgiu depois de vermos duplicação |
| **Passos retornam dados** | Testes fazem asserções, mantendo passos reutilizáveis |
| **Locators privados** | Encapsulamento facilita mudanças |

## Código-Fonte Completo

O código-fonte completo deste tutorial está disponível em:
[github.com/serenity-bdd/serenity-playwright-todomvc-demo](https://github.com/serenity-bdd/serenity-playwright-todomvc-demo)
