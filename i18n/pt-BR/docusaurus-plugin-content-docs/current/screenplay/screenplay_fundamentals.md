---
id: screenplay_fundamentals
sidebar_position: 1
---
# Fundamentos do Screenplay

O Screenplay Pattern e um padrao de design moderno para automacao de testes, criado para facilitar a escrita de codigo de teste escalavel e de facil manutencao. Voce pode obter uma visao geral rapida de um teste Screenplay simples [aqui](../../docs/tutorials/screenplay).

Nesta secao, veremos em detalhes como escrever automacao de testes de alta qualidade usando o Screenplay Pattern. Inicialmente, focaremos na interacao com uma aplicacao web usando Selenium - nas secoes seguintes, veremos como interagir com APIs e bancos de dados usando o modelo Screenplay.

No Screenplay, modelamos _Actor_ (atores) que interagem com uma aplicacao de varias formas para executar _Task_ (tarefas) que os ajudam a alcancar seus objetivos. Os Actor possuem _Ability_ (habilidades), como a habilidade de interagir com um navegador web ou consultar um banco de dados, que os ajudam a executar essas tarefas. Os Actor tambem podem responder _Question_ (perguntas) sobre o estado do sistema, para que possamos verificar se uma funcionalidade esta se comportando da forma esperada.

![](img/screenplay-model.svg)

## Configurando um teste Screenplay
Testes Screenplay do Serenity BDD podem ser escritos usando qualquer framework que funcione com o Serenity BDD. Comecaremos discutindo como configurar um caso de teste Screenplay simples usando bibliotecas comuns como JUnit 4, JUnit 5 e Cucumber.

### Screenplay e JUnit 4

Executar um teste Screenplay no JUnit 4 e JUnit 5 nao e diferente de qualquer outro teste do Serenity BDD. Para JUnit 4, adicione a dependencia `serenity-junit` ao seu projeto se ela ainda nao estiver la:
```xml
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-junit</artifactId>
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
            <artifactId>serenity-screenplay-webdriver</artifactId>
            <version>${serenity.version}</version>
            <scope>test</scope>
        </dependency>
```

### Screenplay e JUnit 5 (Recomendado)

Para JUnit 5, adicione a seguinte dependencia ao seu projeto:
```xml
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-junit5</artifactId>
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
            <artifactId>serenity-screenplay-webdriver</artifactId>
            <version>${serenity.version}</version>
            <scope>test</scope>
        </dependency>
```
Em seguida, voce precisa usar a classe `SerenityJUnit5Extension`, assim:
```java
import net.serenitybdd.junit.runners.SerenityJUnit5Extension;
import org.junit.jupiter.api.Test;

@ExtendWith(SerenityJUnit5Extension.class)
class AddNewTodos {

    @Test
    @DisplayName("Add a todo item to an empty list")
    void addToEmptyList() {...}
}
```

### Screenplay e JUnit 4 (Descontinuado)

:::warning JUnit 4 Descontinuado
O suporte ao JUnit 4 esta descontinuado a partir do Serenity 5.0.0 e sera removido no Serenity 6.0.0. Por favor, migre para o JUnit 5 (veja acima).
:::

Se voce ainda esta usando JUnit 4, use a classe `SerenityRunner` na sua classe de teste, assim:

```java
import net.serenitybdd.junit.runners.SerenityRunner;
import org.junit.Test;

@RunWith(SerenityRunner.class)
public class AddNewTodos {

    @Test
    public void addToEmptyList() {...}
}
```

### Screenplay e Cucumber

Para executar um Scenario Screenplay com Cucumber e Serenity, voce precisa apenas das dependencias padrao do Screenplay junto com a dependencia `serenity-cucumber`, como mostrado abaixo:
```xml
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-cucumber</artifactId>
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
            <artifactId>serenity-screenplay-webdriver</artifactId>
            <version>${serenity.version}</version>
            <scope>test</scope>
        </dependency>
```

#### Com JUnit 5 (Recomendado)

Para JUnit 5, use a anotacao `@Suite` com o Cucumber JUnit Platform Engine:

```java
import org.junit.platform.suite.api.*;

import static io.cucumber.junit.platform.engine.Constants.PLUGIN_PROPERTY_NAME;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(
    key = PLUGIN_PROPERTY_NAME,
    value = "net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel"
)
class TestSuite {}
```

#### Com JUnit 4 (Descontinuado)

:::warning JUnit 4 Descontinuado
Os runners do Cucumber para JUnit 4 estao descontinuados a partir do Serenity 5.0.0 e serao removidos no Serenity 6.0.0. Por favor, migre para o JUnit 5 (veja acima).
:::

Para JUnit 4, voce usaria:

```java
import io.cucumber.junit.CucumberOptions;
import net.serenitybdd.cucumber.CucumberWithSerenity;
import org.junit.runner.RunWith;

@RunWith(CucumberWithSerenity.class)
@CucumberOptions(
        features = "classpath:features"
)
public class TestSuite {}
```

## Definindo os Actor

Todo teste Screenplay precisa de pelo menos um Actor (e alguns tem varios). Existem varias formas de definir um Actor, que variam ligeiramente dependendo do framework de teste que voce esta usando.

### Actor no JUnit

Uma forma de criar um novo Actor e usar o metodo `Actor.named()`. Por exemplo, para criar um Actor chamado Toby, podemos escrever o seguinte:

```java
Actor toby = Actor.named("Toby");
```

Porem, esse Actor nao sera capaz de fazer muita coisa ate que lhe demos a habilidade de interagir com nossa aplicacao. E ai que as _Ability_ entram em cena.

A Ability mais comumente necessaria e a habilidade de navegar na web usando uma biblioteca de automacao web como Selenium ou Playwright. Em um teste JUnit do Serenity, podemos usar a anotacao `@Managed` para gerenciar o ciclo de vida do WebDriver. Uma vez que temos um driver disponivel, podemos atribui-lo a um Actor usando a classe `BrowseTheWeb` assim:

```java
@ExtendWith(SerenityJUnit5Extension.class)
class AddNewTodosWithAManagedDriver {

    @Managed
    WebDriver driver;

    @Test
    @DisplayName("Add a todo item to an empty list")
    void addToEmptyList() {
        Actor toby = Actor.named("Toby")
                          .whoCan(BrowseTheWeb.with(driver));
    ...
    }
}
```

### Definindo Actor usando a anotacao CastMember

Para muitos Scenario, podemos simplificar o codigo mostrado acima. Se precisamos apenas usar um Actor que pode interagir com um site usando Selenium, podemos usar a anotacao `@CastMember`. Esta anotacao configura um Actor com uma instancia do WebDriver e gerencia o ciclo de vida do navegador para nos (entao nao ha necessidade da anotacao `@Managed` ou da variavel `WebDriver`). Voce pode ver um exemplo desta anotacao em acao aqui:

```java
@ExtendWith(SerenityJUnit5Extension.class)
class AddNewTodosWithACastMember {

    @CastMember
    Actor toby;

    @Test
    @DisplayName("Add a todo item to an empty list")
    void addToEmptyList() {

        toby.attemptsTo(
                Open.browserOn().the(TodoMvcPage.class),
                Enter.theValue("Buy some milk").into(".new-todo").thenHit(Keys.RETURN)
        );
        Collection<String> items = toby.asksFor(Text.ofEach(".todo-list label"));
        assertThat(items).containsExactly("Buy some milk");

        String title = toby.asksFor(Text.of(By.tagName("h1")));
        assertThat(title).isEqualTo("todos");
    }
}
```

O nome do Actor sera derivado do nome da variavel. Se voce precisar de um nome mais descritivo, pode usar o atributo `name` para fornecer um valor de texto livre, que sera usado nos relatorios:

```java
    @CastMember(name = "Tim the Enchanter")
    Actor tim;
```

### Actor no Cucumber

Configurar Actor no Cucumber e um pouco mais complicado do que no JUnit, porque geralmente nos referimos a eles pelo nome nos Scenario do Cucumber. Suponha, por exemplo, que queremos automatizar o seguinte Scenario:

```gherkin
  Scenario: Add items to an empty list
    Given Toby starts with an empty list
    When he adds "Buy some milk" to his list
    Then the todo list should contain the following items:
      | Buy some milk |
```

#### Usando um driver gerenciado com Cucumber
Podemos usar a mesma abordagem que usamos para JUnit em nossos arquivos de Step Definition do Cucumber, declarando uma instancia do WebDriver usando a anotacao `@Managed` e atribuindo-a ao nosso Actor usando a classe de Ability `BrowseTheWeb`:

```java
public class TodoStepDefinitions {

    @Managed
    WebDriver driver;

    Actor toby = Actor.named("Toby");

    @Before
    public void setupActor() {
        toby.can(BrowseTheWeb.with(driver));
    }

    @Given("Toby starts with an empty list")
    public void stats_with_an_empty_list() {
        toby.attemptsTo(
                Open.url("https://todomvc.com/examples/angularjs/#/")
        );
    }
```

Porem, o nome do Actor ("Toby") faz parte dos passos do Scenario. Podemos querer ter outros Scenario com outros Actor, ou ter um Scenario envolvendo mais de um Actor.

#### Cast e Stage
Podemos tornar nossas Step Definition do Cucumber mais flexiveis introduzindo o conceito de um _Cast_ (elenco) de Actor, e um _stage_ (palco) onde eles atuam.

Um _Cast_ e uma classe cuja funcao e fornecer Actor com um conjunto especifico de Ability, quando precisamos que eles desempenhem um papel em nossos testes. Por exemplo, podemos usar a classe `OnlineCast` para fornecer Actor que estao equipados com suas proprias instancias do WebDriver. Dessa forma, nao precisamos declarar o driver `@Managed`, e cada Actor pode ter seu proprio navegador se tivermos um Scenario com mais de um Actor.

Um _stage_ e onde nossos Actor desempenham seus papeis. Um Scenario tem um unico stage, que podemos usar para identificar um Actor pelo nome ou encontrar o Actor atualmente ativo.

Precisamos atribuir um cast ao stage no inicio de cada Scenario; podemos fazer isso chamando o metodo `OnStage.setTheStage()` e passando um cast especifico, assim:

```java
OnStage.setTheStage(new OnlineCast());
```

Uma vez que configuramos o stage, podemos obter um Actor com um determinado nome usando o metodo `OnStage.theActorCalled()`, assim:
```java
Actor toby = OnStage.theActorCalled("Toby");
```

Usando esta abordagem, poderiamos implementar o primeiro passo do nosso Scenario de uma forma que funcionara independentemente de qual Actor esteja envolvido, assim:
```java
    @Given("{word} starts with an empty list")
    public void stats_with_an_empty_list(String actorName) {
        Actor actor = OnStage.theActorCalled(actorName);
        actor.attemptsTo(
                Open.url("https://todomvc.com/examples/angularjs/#/")
        );
    }
```

E frequentemente util definir uma expressao customizada do Cucumber para que nao precisemos chamar o metodo `OnStage.theActorCalled()` toda vez:
```java
    @ParameterType(".*")
    public Actor actor(String actorName) {
        return OnStage.theActorCalled(actorName);
    }

    @Given("{actor} starts with an empty list")
    public void stats_with_an_empty_list(Actor actor) {
        actor.attemptsTo(
                Open.url("https://todomvc.com/examples/angularjs/#/")
        );
    }
```

Dessa forma, nosso proximo passo pode simplesmente usar um parametro do tipo `Actor`, assim:
```java
    @When("{actor} adds {string} to his list")
    public void he_adds_to_his_list(Actor actor, String item) {
        actor.attemptsTo(
                Enter.theValue(item).into(".new-todo").thenHit(Keys.RETURN)
        );
    }
```

Esses metodos sao definidos por padrao no template Serenity Cucumber Starter no Github, entao voce nao precisa adiciona-los se estiver usando este template.

A classe `OnStage` tambem reconhece pronomes - quando uma expressao como "he adds 'Walk the dog' to the todo list" ou "her shopping cart should be empty", o metodo `theActorCalled()` reconhecera o pronome e buscara o ultimo Actor ativo com o metodo `theActorInTheSpotlight()`. Por padrao, os pronomes sao:
    - he
    - she
    - they
    - it
    - his
    - her
    - their
    - its
Voce pode definir sua propria lista de pronomes usando a propriedade `screenplay.pronouns` do Serenity no arquivo `serenity.conf`, por exemplo:

```conf
screenplay.pronouns=il,elle,ils,elles,son,sa,leur,leurs
```

#### Cast e Ability

No codigo anterior, usamos a classe `OnlineCast` para definir o cast de Actor:

```java
OnStage.setTheStage(new OnlineCast());
```

Os Cast sao muito flexiveis, e podemos configura-los para produzir Actor com Ability adicionais se precisarmos.

Por exemplo, imagine que queremos dar aos nossos Actor a habilidade de entregar cafe. Para fazer isso, podemos criar uma classe de Ability `Deliver`. Para entregar um cafe, chamaremos o metodo `deliverItem()`, que (para nossos propositos) simplesmente retornara uma string com um item com um numero unico (como "Coffee #1").

A classe Ability poderia ficar assim:

```java
    public class Deliver implements Ability {
        final String item;
        private int counter = 1;

        private Deliver(String item) {
            this.item = item;
        }

        public static some(String item) {
            return new Deliver(item)
        }

        public String deliverItem() {
            return item + " #" + counter++;
        }
    }
```

Agora podemos atribuir esta Ability aos nossos Actor no `Cast` usando o metodo `Cast.whereEveryoneCan()`:

```java
OnStage.setTheStage(
    Cast.whereEveryoneCan(Fetch.some("Coffee"))
);
```

Se precisarmos de uma configuracao mais complexa, tambem podemos usar uma expressao Lambda para fornecer o codigo que precisamos executar para melhorar um novo Actor com Ability adicionais, assim:

```java
Consumer<Actor> fetchTheCoffee = { actor -> actor.whoCan(Fetch.some("Coffee")) }

OnStage.setTheStage(
    Cast.whereEveryoneCan(fetchTheCoffee)
);
```


#### O Actor em destaque

As vezes um passo nao se refere a um Actor pelo nome, mas implicitamente se refere ao ultimo Actor que fez qualquer coisa no Scenario. Por exemplo, o terceiro passo, "Then the todo list should contain the following items..." nao tem um Actor explicito.

Nessas situacoes, podemos usar o metodo `OnStage.theActorInTheSpotlight()` para nos referir ao ultimo Actor ativo conhecido. Por exemplo, poderiamos implementar o terceiro passo do nosso Scenario assim:

```java
    @Then("the todo list should contain the following items:")
    public void the_todo_list_should_contain(List<String> expectedItems) {
        Actor currentActor = OnStage.theActorInTheSpotlight();
        var todos = currentActor.asksFor(Text.ofEach(".todo-list li"));
        assertThat(todos).containsExactlyElementsOf(expectedItems);
    }
```

## Agrupando Interaction em Task

O Screenplay visa facilitar a escrita de codigo de automacao de facil manutencao e escalavel. E uma forma importante de fazer isso e agrupando Interaction em sequencias reutilizaveis que representam conceitos de dominio de nivel mais alto.

Por exemplo, o teste a seguir mostra como fazer login no site de teste https://www.saucedemo.com/:

```java
        toby.attemptsTo(
                Open.url("https://www.saucedemo.com/"),
                Enter.theValue("standard_user").into("#user-name"),
                Enter.theValue("secret_sauce").into("#password"),
                Click.on("#login-button")
        );
```

Essas quatro linhas envolvem todo o processo de login no site. Porem, e dificil ver isso a primeira vista ao ler o codigo. Poderiamos tornar este codigo muito mais legivel agrupando essas Interaction em uma unica Task.

### Agrupando Interaction usando a classe Task
Uma abordagem melhor seria agrupar essas Interaction relacionadas em uma unica `Task`.

A forma mais simples de fazer isso e usar o metodo `Task.where()`. Este metodo nos permite retornar uma Task (ou mais precisamente, uma implementacao da interface `Performable`) que combina varias outras Task ou Interaction.

A Task que permite que um Actor faca login como um usuario padrao poderia ficar assim:

```java
public class Login {
    public static Task asAStandardUser() {
        return Task.where(
                Open.url("https://www.saucedemo.com/"),
                Enter.theValue("standard_user").into("#user-name"),
                Enter.theValue("secret_sauce").into("#password"),
                Click.on("#login-button")
        );
    }
}
```

Podemos querer tornar nossa Task mais configuravel, adicionando alguns parametros a assinatura do metodo. Neste caso, e util tornar nossa Task mais descritiva adicionando uma descricao de texto antes da lista de _Performable_, como mostrado abaixo. Esta descricao aparecera nos relatorios sempre que a Task for executada. O `{0}` na descricao sera substituido pelo nome do Actor (entao "Toby" em nosso teste).

```java
public class Login {
    public static Performable as(String username, String password) {
        return Task.where(
                "{0} logs in as " + username,
                Open.url("https://www.saucedemo.com/"),
                Enter.theValue(username).into("#user-name"),
                Enter.theValue(password).into("#password"),
                Click.on("#login-button")
        );
    }
}
```

Agora podemos refatorar nosso teste original usando este metodo:

```java
        toby.attemptsTo(Login.asAStandardUser());
```

ou

```java
        toby.attemptsTo(Login.as("standard_user","secret_sauce"));
```

### Usando expressoes lambda para criar Task customizadas

Ate agora vimos como criar uma _Task_ a partir de uma lista de outras Task ou Interaction. Mas as vezes precisamos ter mais controle sobre a logica da nossa Task. Podemos fazer isso muito facilmente usando expressoes lambda, que nos dao controle total sobre como nossa Task deve funcionar.

Por exemplo, imagine que refatoramos nosso exemplo TodoMVC acima para usar a seguinte classe Task para abrir a aplicacao TodoMVC com uma lista vazia:

```java

public class Start {
    public static Performable withAnEmptyTodoList() {
        return Task.where("{0} starts with an empty todo list",
                Open.url("https://todomvc.com/examples/angularjs/#/")
        );
    }
```

Tambem poderiamos criar uma Task para adicionar um item de todo a lista:

```java
public class AddATodoItem {
    public static Performable called(String thingToDo) {
        return Task.where("{0} adds a todo item called " + thingToDo,
                Enter.theValue(item).into(".new-todo").thenHit(Keys.RETURN)
        );
    }
}
```

Agora suponha que queremos permitir que Toby comece com alguns elementos ja em sua lista. Poderiamos imaginar um novo metodo `Start.withAListContainingTheItems(...)` assim:

```java
        toby.attemptsTo(
                Start.withAListContaingTheItems("Feed the cat","Buy some bread")
        );
```

Porem, para implementar este metodo, precisamos iterar sobre a lista de itens fornecida e chamar a Task `AddATodoItem` para cada um deles. Podemos fazer isso usando uma expressao Lambda em vez de uma lista de _Performable_. A expressao Lambda recebe um Actor como parametro e nos permite escrever blocos de codigo arbitrarios para implementar nossa Task. Por exemplo, o metodo `withAListContaingTheItems()` poderia ficar assim:

```java
    public static Performable withAListContainingTheItems(String... items) {
        return Task.where("{0} starts with a list containing " + Arrays.asList(items),
                actor -> {
                    actor.attemptsTo(Start.withAnEmptyTodoList());
                    for (String item : items) {
                        actor.attemptsTo(AddATodoItem.called(item));
                    }
                }
        );
```

A classe `Start` completa ficaria assim:

```java
public class Start {
    public static Performable withAnEmptyTodoList() {
        return Task.where("{0} starts with an empty todo list",
                Open.url("https://todomvc.com/examples/angularjs/#/")
        );
    }

    public static Performable withAListContainingTheItems(String... items) {
        return Task.where("{0} starts with a list containing " + Arrays.asList(items),
                actor -> {
                    actor.attemptsTo(Start.withAnEmptyTodoList());
                    for (String item : items) {
                        actor.attemptsTo(AddATodoItem.called(item));
                    }
                }
        );
    }
}

```

### Escrevendo classes Performable customizadas

As vezes precisamos de mais controle sobre a criacao de uma Task. Podemos fazer isso criando uma classe que implementa a interface `Performable`.

A interface `Performable` tem um unico metodo que voce precisa implementar: `performAs()`. Este metodo recebe um `Actor` como parametro. Uma Task customizada muito simples poderia ficar assim:

```java
public class AddItem implements Performable {
    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
                Enter.theValue("Buy some milk")
                        .into(".new-todo")
                        .thenHit(Keys.RETURN)
        );
    }
}
```

Agora podemos usar esta classe diretamente em nossos testes:

```java
    AddItem addANewItem = new AddItem();
    toby.attemptsTo(addANewItem);
```

Por padrao, o Serenity registrara esta acao nos relatorios usando o nome do Actor e o nome da classe, entao neste caso, o relatorio incluiria algo como "Toby add item". Se quisermos um texto mais descritivo, podemos adicionar a anotacao `@Step` ao metodo `performAs()`, como mostrado aqui (o placeholder "{0}" sera substituido pelo nome do Actor):

```java
public class AddItem implements Performable {
    @Override
    @Step("{0} adds an item to the list")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
                Enter.theValue("Buy some milk")
                        .into(".new-todo")
                        .thenHit(Keys.RETURN)
        );
    }
}
```

Nesta classe, so podemos adicionar o item "Buy some milk" a nossa lista. Poderiamos tornar nossa classe mais flexivel registrando o nome da tarefa como um parametro. Para fazer isso, precisamos adicionar uma variavel membro ao nosso `Performable` para representar este valor e passa-lo no construtor:

```java
public class AddItem implements Performable {
    private String name;

    public AddItem(String name) {
        this.name = name;
    }

    @Override
    @Step("{0} adds an item to the list")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
                Enter.theValue(name)
                        .into(".new-todo")
                        .thenHit(Keys.RETURN)
        );
    }

    public static AddItem called(String name) {
        return new AddItem(name);
    }
}
```

Agora podemos tornar nosso codigo de teste mais legivel, como mostrado aqui:
```java
    toby.attemptsTo(AddItem.named("Walk the dog"));
```

Porem, ha mais uma coisa que precisamos fazer para que isso funcione corretamente. O codigo mostrado aqui nao sera reportado corretamente nos relatorios do Serenity. Por razoes tecnicas, toda implementacao de `Performable` deve ter um construtor padrao, mesmo que voce nao o use diretamente no seu codigo. Entao a implementacao completa ficaria assim:

```java
public class AddItem implements Performable {
    private String name;

    public AddItem() {}

    public AddItem(String name) {
        this.name = name;
    }

    @Override
    @Step("{0} adds an item to the list")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
                Enter.theValue(name)
                        .into(".new-todo")
                        .thenHit(Keys.RETURN)
        );
    }

    public static AddItem called(String name) {
        return new AddItem(name);
    }
}
```

:::tip
Sempre lembre de adicionar um construtor padrao sem parametros as suas implementacoes de `Performable`, caso contrario elas nao aparecerao corretamente nos relatorios.
:::

## Question - consultando o estado do sistema

Screenplay e um padrao centrado no Actor, e assim como os Actor interagem com o sistema executando _Task_ e _Interaction_, eles podem consultar o estado do sistema fazendo _Question_ (perguntas).

### Usando classes Question incluidas
Um Actor pode fazer uma Question usando o metodo `askFor()`. Voce pode ver um exemplo de como isso funciona aqui:

```java
   String pageTitle = toby.asksFor(Text.of(".title"));
```

`Text` e um exemplo de um _Question Factory_. Question Factory fornecem uma forma conveniente de consultar o estado da aplicacao, e existem muitos para escolher. Por exemplo, poderiamos verificar se um determinado elemento web estava visivel usando a classe `Visibility`, assim:

```java
   boolean isVisible = toby.asksFor(Visibility.of(".title"));
```

O Serenity BDD vem com muitos _Question Factory_ incluidos como esses, e veremos com mais detalhes na proxima secao. Mas voce tambem pode escrever suas proprias Question customizadas, para consultar qualquer aspecto da sua aplicacao que desejar.

### Criando Question customizadas usando expressoes Lambda
Uma forma de implementar uma _Question_ e usar uma expressao Lambda do Java 8 que recebe um _Actor_ como argumento. Por exemplo, o metodo a seguir retorna uma _Integer Question_ (uma _Question_ que retorna um inteiro).

```java
    Question<Integer> numberOfTodoItems() {
        return actor -> BrowseTheWeb.as(actor).findAll(".todo-list li").size();
    }
```

Poderiamos encontrar a resposta para esta Question usando o metodo `asksFor()`, como no exemplo anterior:
```java
   int numberOfTodos = toby.asksFor(numberOfTodoItems());
```

Uma alternativa ao metodo `asksFor()` e o proprio metodo `answeredBy()` da `Question`:

```java
   int numberOfTodos = numberOfTodoItems().answeredBy(toby);
```

Este formato pode ser mais conveniente para asserções, como ilustrado neste exemplo:

```java
   assertThat(numberOfTodoItems().answeredBy(toby)).isEqualTo(1);
```

### Tornando Question mais legiveis com o metodo `Question.about()`
Poderiamos tornar este metodo mais legivel usando o formato `Question.about` - isso produzira uma mensagem de erro mais significativa. No exemplo a seguir, usamos a classe `BrowseTheWeb` para acessar a API WebDriver do Serenity e encontrar o numero de itens da lista de todo atualmente na pagina:

```java
    Question<Integer> numberOfTodoItems() {
        return Question.about("the number of todo items")
                   .answeredBy(
                       actor -> BrowseTheWeb.as(actor).findAll(".todo-list li").size());
    }
```

### Convertendo Question

Question tambem fornecem uma forma conveniente de converter respostas em diferentes tipos. Isso e particularmente util para as classes `Question` incluidas do WebDriver, que normalmente retornam valores em formato de texto.

Por exemplo, a aplicacao TodoMVC mostra o numero de itens restantes para fazer a qualquer momento abaixo da lista:

![](img/items-left.png)

Podemos localizar a contagem de itens usando a expressao CSS _".todo-count strong"_. Poderiamos buscar este valor como uma String usando a classe `Text` que vimos anteriormente:

```java
    String itemsLeftCount = toby.asksFor(Text.of(".todo-count strong");
```

Porem, se preferirmos recuperar o valor como um inteiro, poderiamos usar o metodo `asInteger()` assim:

```java
   int itemsLeftCount = toby.asksFor(Text.of(".todo-count strong").asInteger());
```

Alguns dos metodos de conversao disponiveis incluem os seguintes:

| Tipo         | Metodo         | Exemplo     |
| ------------ | -----------    | ----------- |
| Integer      | asInteger()    | Text.of(".todo-count strong").asInteger()    |
| Long         | asLong()       | Text.of(".todo-count strong").asLong()       |
| Float        | asFloat()      | Text.of(".currency-value").asFloat()         |
| Double       | asDouble()     | Text.of(".currency-value").asDouble()        |
| BigDecimal   | asBigDecimal() | Text.of(".currency-value").asBigDecimal() |

### Convertendo valores de data
Valores de data tambem podem ser convertidos para objetos `LocalDate`. Se a data usa o formato de data ISO padrao (por exemplo, "2022-05-15"), ela pode ser convertida usando o metodo `asDate()`, assim:

```java
   LocalDate dateValue = toby.asksFor(
       Text.of("#departure-date").asDate()
    );
```

Se a data usa um formato diferente, o metodo `asDate()` aceita um padrao de data-hora que pode ser usado para analisar o valor, por exemplo:

```java
    LocalDate dateValue = toby.asksFor(
        Text.of("#departure-date").asDate("d MMM uuuu")
    );
```

### Convertendo para listas de valores

Tambem podemos usar o metodo `asListOf()` para encontrar todas as respostas para uma Question especifica e converter cada uma delas para um tipo especificado. Por exemplo, para converter uma lista de valores String correspondentes para inteiros, poderiamos usar o seguinte codigo:

```java
    List<Integer> itemQuantities = toby.asksFor(
        Text.of(".item-quantity").asListOf(Integer.class)
    );
```

### Trabalhando com colecoes

Outra forma de recuperar uma lista de valores e usar o metodo `ofEach()`.

```java
    Collection<String> itemQuantities = toby.asksFor(Text.of(".item-quantity"));
```

Assim como com o metodo `Text.of()`, podemos usar o metodo `asListOf()` para converter esta colecao em outro tipo

```java
    List<String> itemQuantities = toby.asksFor(
        Text.of(".item-quantity").asListOf(Integer.class)
    );
```

Se precisarmos realizar uma operacao mais complexa, podemos usar o metodo `mapEach()` para aplicar uma expressao Lambda arbitraria a cada elemento correspondente:

```java
   Collection<Integer> nameLengths = toby.asksFor(Text.ofEach(".name").mapEach(s -> s.length()));
```

## Dados de sessao especificos do Actor

As vezes precisamos armazenar informacoes em um passo ou Task e reutiliza-las em um subsequente. Cada Actor do Screenplay pode lembrar informacoes e recupera-las mais tarde no teste. Fazemos isso usando o metodo `remember()`:

```java
    int actualCost = 100
    actor.remember("Total Cost", total);
```

Mais tarde, podemos recuperar esta informacao usando o metodo `recall()`:
```java
    int recalledCost = dana.recall("Total Cost");
    assertThat(recalledCost).isEqualTo(100);
```

Um Actor pode lembrar informacoes de qualquer tipo, ate mesmo a resposta a uma Question. Por exemplo, o metodo `Text.of()` retorna um objeto Question do tipo `Question<String>`. Um Actor pode lembrar a resposta a esta Question usando-a como parametro para o metodo `remember()`:

```java
    actor.remember("Total Cost", Text.of("#total-cost").asInteger());
```

Podemos entao recuperar este valor da mesma forma que qualquer outro:

```java
    int totalCost = actor.recall("Total Cost");
    assertThat(totalCost).isEqualTo(100);
```

Podemos ate recuperar um mapa contendo cada valor atualmente lembrado pelo Actor. Fazemos isso usando o metodo `recallAll()`:

```java
    Map<String, Object> all = actor.recallAll();
```

Tambem podemos remover um valor lembrado usando o metodo `forget()`:

```java
    actor.forget("Total Cost");
```

## Conclusao
Agora que vimos como configurar um teste Screenplay usando diferentes frameworks, como organizar Interaction em Task e como consultar o estado do sistema, veremos como usar o Screenplay para interagir com uma aplicacao web com mais detalhes.

