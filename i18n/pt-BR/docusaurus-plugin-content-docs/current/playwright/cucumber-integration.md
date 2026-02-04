---
id: playwright_cucumber
title: Integração com Cucumber
sidebar_position: 9
---

# Integração do Cucumber com Playwright Screenplay

O Cucumber fornece uma sintaxe de linguagem natural para escrever testes orientados a comportamento. Quando combinado com a implementação Screenplay do Serenity Playwright, você obtém cenários BDD expressivos que direcionam automação de navegador confiável.

Este guia mostra como integrar o Cucumber com o Serenity Playwright usando o Screenplay Pattern.

## Configuração do Projeto

### Dependências Maven

Adicione as seguintes dependências ao seu `pom.xml`:

```xml
<properties>
    <serenity.version>5.1.1</serenity.version>
    <playwright.version>1.58.0</playwright.version>
    <cucumber.version>7.34.2</cucumber.version>
    <junit.version>5.11.4</junit.version>
</properties>

<dependencyManagement>
    <dependencies>
        <!-- Use BOMs para gerenciamento de versões -->
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
    <!-- Serenity Screenplay com Playwright -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-screenplay-playwright</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Integração Serenity Cucumber -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-cucumber</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Cucumber (versões gerenciadas pelo cucumber-bom) -->
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

    <!-- Serenity Ensure para asserções -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-ensure</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### Instalar os Navegadores do Playwright

Antes de executar os testes, instale os navegadores do Playwright:

```bash
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install"
```

## Estrutura do Projeto

Uma estrutura típica de projeto se parece com isso:

```
src/test/
├── java/
│   └── yourpackage/
│       ├── cucumber/
│       │   ├── CucumberTestSuite.java      # Test runner
│       │   ├── PlaywrightHooks.java        # Hooks do Cucumber
│       │   └── StepDefinitions.java        # Step Definition
│       └── screenplay/
│           ├── tasks/                       # Task reutilizáveis
│           │   ├── OpenTheApplication.java
│           │   └── AddATodoItem.java
│           ├── questions/                   # Question reutilizáveis
│           │   └── TheVisibleTodos.java
│           └── ui/                          # Definições de Target
│               └── TodoList.java
└── resources/
    ├── features/
    │   └── managing_todos.feature          # Arquivos Feature
    └── serenity.properties                  # Configuração
```

## Passo 1: Crie o Test Runner

O test runner configura o Cucumber para funcionar com o Serenity:

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

:::important Configuração do Glue Path
Sempre inclua `net.serenitybdd.cucumber.actors` no seu glue path. Isso registra o `StageDirector` do Serenity que automaticamente chama `OnStage.drawTheCurtain()` após cada cenário para limpar os recursos do navegador.
:::

## Passo 2: Crie os Hooks do Playwright

A classe de hooks configura o stage do Playwright antes de cada cenário:

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
     * Configura o stage do Playwright antes de cada cenário.
     * Order 0 garante que isso execute primeiro entre todos os hooks @Before.
     */
    @Before(order = 0)
    public void setTheStage(Scenario scenario) {
        OnStage.setTheStage(new PlaywrightCast());
    }

    /**
     * Define o tipo de parâmetro {actor} para os passos do Cucumber.
     * Isso permite passos como "Given Toby is on the application"
     * para automaticamente resolver "Toby" para uma instância de Actor.
     */
    @ParameterType(".*")
    public Actor actor(String actorName) {
        return OnStage.theActorCalled(actorName);
    }
}
```

### Entendendo os Hooks

**`@Before(order = 0)`**: O `order = 0` garante que o stage seja configurado antes de quaisquer outros hooks executarem. Isso é importante se você tiver outros hooks `@Before` que dependem dos actor.

**`@ParameterType(".*")`**: Isso cria um tipo de parâmetro personalizado que converte nomes de actor nos arquivos feature para instâncias de `Actor`. O padrão `.*` corresponde a qualquer string.

**Limpeza Automática**: Você não precisa de um hook `@After` para limpeza. O `StageDirector` (incluído via glue path) automaticamente gerencia a limpeza chamando `OnStage.drawTheCurtain()`.

## Passo 3: Escreva Arquivos Feature

Arquivos feature descrevem comportamento na sintaxe Gherkin:

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

## Passo 4: Crie Step Definition

Step Definition conectam arquivos feature às Task do Screenplay:

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

### Padrões Principais nas Step Definition

**Parâmetro Actor**: O parâmetro `{actor}` automaticamente resolve para uma instância de Actor graças à definição `@ParameterType` nos hooks.

**Passos de Background**: Passos como `actorHasAddedTheFollowingTodoItems` compõem múltiplas ações, permitindo que passos `Given` configurem pré-condições complexas.

**The Actor in the Spotlight**: Para passos `Then` que não recebem um parâmetro actor, use `OnStage.theActorInTheSpotlight()` para obter o último actor que executou uma ação.

**Tabelas de Dados**: Tabelas de dados do Cucumber mapeiam diretamente para `List<String>` para tabelas de coluna única.

## Passo 5: Crie Task do Screenplay

Task encapsulam ações de nível de negócio:

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

        // Limpa o localStorage para garantir um estado limpo
        // (TodoMVC persiste tarefas no localStorage)
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

## Passo 6: Crie Question do Screenplay

Question consultam o estado da aplicação:

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

## Passo 7: Defina os Target de UI

Target definem como localizar elementos:

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

## Executando os Testes

### Executar Todos os Testes Cucumber

```bash
mvn clean verify
```

### Executar Testes com Tags Específicas

```bash
mvn clean verify -Dcucumber.filter.tags="@playwright"
```

### Executar um Único Cenário

```bash
mvn clean verify -Dcucumber.filter.name="Adding a single todo item"
```

### Ver Relatórios

Após executar os testes, abra o relatório Serenity:

```
target/site/serenity/index.html
```

## Configuração

### serenity.properties

```properties
# Configurações do navegador
playwright.browsertype=chromium
playwright.headless=true

# Configurações de captura de tela
serenity.take.screenshots=FOR_FAILURES

# Configurações do relatório
serenity.project.name=My TodoMVC Tests
```

### cucumber.properties

```properties
# Configurações do Cucumber
cucumber.publish.quiet=true
```

## Configuração Avançada

### Configuração Personalizada do Navegador

Configure `PlaywrightCast` com opções personalizadas:

```java
@Before(order = 0)
public void setTheStage(Scenario scenario) {
    BrowserType.LaunchOptions options = new BrowserType.LaunchOptions()
        .setHeadless(false)
        .setSlowMo(100);  // Desacelera para depuração

    OnStage.setTheStage(
        new PlaywrightCast()
            .withLaunchOptions(options)
            .withBrowserType("firefox")
    );
}
```

### Múltiplos Actor

Cenários podem envolver múltiplos actor:

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

Cada actor obtém sua própria instância de navegador automaticamente através do `PlaywrightCast`.

## Solução de Problemas

### Vazamento de Estado Entre Cenários

Se os testes interferirem uns com os outros:

1. Verifique se `net.serenitybdd.cucumber.actors` está no seu glue path
2. Limpe o estado da aplicação (como localStorage) na sua Task de navegação
3. Garanta que `@Before(order = 0)` está definido no seu hook de configuração do stage

### Elemento Não Encontrado

Se elementos não estão sendo encontrados:

1. Use a espera automática integrada do Playwright (está habilitada por padrão)
2. Verifique seus seletores usando as DevTools do navegador
3. Considere usar seletores mais robustos do Playwright como `text=`, `role=`, etc.

### Capturas de Tela Não Capturadas

Configure o modo de captura de tela no `serenity.properties`:

```properties
serenity.take.screenshots=FOR_EACH_ACTION
```

## Repositório de Exemplo

Um exemplo funcional completo está disponível no repositório [serenity-playwright-todomvc-demo](https://github.com/serenity-bdd/serenity-playwright-todomvc-demo).

## Veja Também

- [Screenplay Pattern com Playwright](playwright_screenplay) - Conceitos principais do Screenplay
- [Tutorial: Screenplay com TodoMVC](playwright_screenplay_tutorial) - Construindo uma suíte de testes do zero
- [Referência de Configuração do Cucumber](/docs/cucumber/configuration-reference) - Todas as opções do Cucumber
- [Execução Paralela](/docs/cucumber/parallel-execution) - Executando testes em paralelo
