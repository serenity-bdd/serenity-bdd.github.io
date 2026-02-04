---
id: cucumber-junit5
title: Cucumber com JUnit 5
sidebar_position: 1
---

# Executando Cenarios Cucumber com Serenity BDD e JUnit 5

O Serenity BDD oferece integração perfeita com o Cucumber, permitindo que você escreva especificações executáveis em Gherkin e as execute usando JUnit 5. Este guia cobre tudo o que você precisa saber para usar o Cucumber com Serenity BDD e JUnit 5 de forma eficaz.

## Visao Geral

O Cucumber é uma ferramenta popular de BDD (Behavior-Driven Development, ou Desenvolvimento Orientado por Comportamento) que permite escrever cenários de teste em linguagem simples usando a sintaxe Gherkin. Quando combinado com o Serenity BDD e JUnit 5, você obtém:

- **Documentacao Viva**: O Serenity gera relatórios ricos e narrativos a partir dos seus cenários Cucumber
- **Execucao de Testes Moderna**: A poderosa plataforma do JUnit 5 para executar testes
- **Execucao Paralela**: Execute cenários em paralelo para uma execução de testes mais rápida
- **Relatorios Detalhados**: Relatórios de teste detalhados com capturas de tela, stack traces e mais

## Pre-requisitos

Antes de começar, certifique-se de ter:
- Java 17 ou superior
- Maven ou Gradle
- Uma IDE com suporte a Java (IntelliJ IDEA, Eclipse, VS Code, etc.)

## Configurando as Dependencias

### Dependencias Maven

Adicione as seguintes dependências ao seu `pom.xml`:

```xml
<properties>
    <serenity.version>5.2.2</serenity.version>
    <cucumber.version>7.33.0</cucumber.version>
    <junit.version>6.0.1</junit.version>
</properties>

<dependencies>
    <!-- Integracao Serenity Cucumber -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-cucumber</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Cucumber JUnit Platform Engine -->
    <dependency>
        <groupId>io.cucumber</groupId>
        <artifactId>cucumber-junit-platform-engine</artifactId>
        <version>${cucumber.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- JUnit Platform Suite -->
    <dependency>
        <groupId>org.junit.platform</groupId>
        <artifactId>junit-platform-suite</artifactId>
        <version>${junit.version}</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### Dependencias Gradle

Para Gradle, adicione ao seu `build.gradle`:

```groovy
dependencies {
    testImplementation "net.serenity-bdd:serenity-cucumber:5.2.2"
    testImplementation "io.cucumber:cucumber-junit-platform-engine:7.33.0"
    testImplementation "org.junit.platform:junit-platform-suite:6.0.1"
}
```

## Criando um Test Runner Basico

A maneira mais simples de executar cenários Cucumber com JUnit 5 é criar uma classe de test suite:

```java
import org.junit.platform.suite.api.*;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
class CucumberTestSuite {
}
```

Esta configuração mínima:
- `@Suite` - Marca esta classe como uma JUnit Platform Suite
- `@IncludeEngines("cucumber")` - Diz ao JUnit para usar o engine do Cucumber
- `@SelectClasspathResource("features")` - Aponta para o diretório contendo seus arquivos de Feature

## Configurando o Reporter do Serenity

:::warning Mudanca Importante no Serenity 5.0.0
O caminho do plugin do Serenity Cucumber mudou na versão 5.0.0 de `io.cucumber.core.plugin.*` para `net.serenitybdd.cucumber.core.plugin.*`
:::

Para gerar relatórios do Serenity, você deve configurar o plugin reporter do Serenity. Adicione isso à sua test suite:

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
class CucumberTestSuite {
}
```

O plugin `SerenityReporterParallel` é thread-safe e recomendado para todos os cenários, mesmo que você não esteja executando testes em paralelo.

## Opcoes de Configuracao

### Usando Anotacoes @ConfigurationParameter

Você pode configurar várias opções do Cucumber usando anotações `@ConfigurationParameter`. Aqui estão as mais comumente usadas:

#### Especificando Pacotes de Step Definition

```java
import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;

@ConfigurationParameter(
    key = GLUE_PROPERTY_NAME,
    value = "com.example.stepdefinitions"
)
```

#### Filtrando por Tags

```java
import static io.cucumber.junit.platform.engine.Constants.FILTER_TAGS_PROPERTY_NAME;

@ConfigurationParameter(
    key = FILTER_TAGS_PROPERTY_NAME,
    value = "@smoke and not @wip"
)
```

#### Especificando Caminhos de Feature

```java
import static io.cucumber.junit.platform.engine.Constants.FEATURES_PROPERTY_NAME;

@ConfigurationParameter(
    key = FEATURES_PROPERTY_NAME,
    value = "src/test/resources/features"
)
```

#### Exemplo Completo

```java
import org.junit.platform.suite.api.*;
import static io.cucumber.junit.platform.engine.Constants.*;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(
    key = PLUGIN_PROPERTY_NAME,
    value = "net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel"
)
@ConfigurationParameter(
    key = GLUE_PROPERTY_NAME,
    value = "com.example.stepdefinitions"
)
@ConfigurationParameter(
    key = FILTER_TAGS_PROPERTY_NAME,
    value = "@smoke"
)
class SmokeTestSuite {
}
```

### Usando junit-platform.properties

Alternativamente, você pode configurar as opções do Cucumber em um arquivo `junit-platform.properties` localizado em `src/test/resources`:

```properties
# Habilitar Cucumber
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel
cucumber.glue=com.example.stepdefinitions
cucumber.filter.tags=@smoke
cucumber.features=src/test/resources/features

# Ordem de execucao de cenarios
cucumber.execution.order=random

# Saida de plugins
cucumber.plugin=pretty,html:target/cucumber-reports/cucumber.html
```

:::tip Quando Usar Cada Abordagem
- Use `@ConfigurationParameter` para configuração **específica da suite** (por exemplo, diferentes test suites para smoke, regressão, etc.)
- Use `junit-platform.properties` para configuração **padrão do projeto**
- Anotações sobrescrevem as configurações do arquivo de propriedades
:::

## Organizando Arquivos de Feature

### Estrutura de Diretorios

O Serenity espera arquivos de Feature em `src/test/resources/features` por padrão. Organize-os hierarquicamente por área de funcionalidade:

```
src/test/resources/features/
├── authentication/
│   ├── login.feature
│   └── logout.feature
├── shopping/
│   ├── add_to_cart.feature
│   ├── checkout.feature
│   └── payment.feature
└── search/
    ├── basic_search.feature
    └── advanced_filters.feature
```

Esta hierarquia será refletida nos seus relatórios do Serenity, criando uma estrutura de requisitos clara.

### Exemplo de Arquivo de Feature

```gherkin
@shopping @checkout
Feature: Checkout Process
  As a customer
  I want to complete my purchase
  So that I can receive my items

  Background:
    Given I have items in my cart

  @happy-path @smoke
  Scenario: Successful checkout with credit card
    When I proceed to checkout
    And I enter valid shipping information
    And I pay with a valid credit card
    Then I should see an order confirmation
    And I should receive a confirmation email

  @edge-case
  Scenario: Checkout with invalid credit card
    When I proceed to checkout
    And I enter valid shipping information
    And I pay with an invalid credit card
    Then I should see a payment error message
    And my order should not be placed
```

## Escrevendo Step Definitions

Step Definitions conectam seus cenários Gherkin ao código Java:

```java
package com.example.stepdefinitions;

import io.cucumber.java.en.*;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.actors.OnStage;

public class CheckoutStepDefinitions {

    @Given("{actor} has items in the cart")
    public void hasItemsInCart(Actor actor) {
        actor.attemptsTo(
            // Sua implementacao aqui
        );
    }

    @When("{actor} proceeds to checkout")
    public void proceedsToCheckout(Actor actor) {
        actor.attemptsTo(
            // Sua implementacao aqui
        );
    }

    @Then("{actor} should see an order confirmation")
    public void shouldSeeOrderConfirmation(Actor actor) {
        actor.should(
            // Suas assercoes aqui
        );
    }
}
```

### Boas Praticas para Step Definition

1. **Mantenha os passos reutilizaveis** - Escreva passos genéricos que possam ser usados em múltiplos cenários
2. **Use o Screenplay Pattern** - Para melhor manutenibilidade e legibilidade
3. **Evite interdependencia de passos** - Cada passo deve ser independente
4. **Use parametros** - Torne os passos flexíveis com expressões Cucumber

## Filtrando Cenarios com Tags

### Expressoes de Tags

O Cucumber suporta expressões de tags poderosas para filtrar cenários:

```bash
# Executar cenarios com tag @smoke
mvn clean verify -Dcucumber.filter.tags="@smoke"

# Executar cenarios com ambas as tags
mvn clean verify -Dcucumber.filter.tags="@smoke and @regression"

# Executar cenarios com qualquer uma das tags
mvn clean verify -Dcucumber.filter.tags="@smoke or @regression"

# Excluir cenarios
mvn clean verify -Dcucumber.filter.tags="not @wip"

# Expressoes complexas
mvn clean verify -Dcucumber.filter.tags="(@smoke or @regression) and not @slow"
```

### No Codigo

```java
@ConfigurationParameter(
    key = FILTER_TAGS_PROPERTY_NAME,
    value = "(@smoke or @regression) and not @wip"
)
```

### No Arquivo de Propriedades

```properties
cucumber.filter.tags=(@smoke or @regression) and not @wip
```

## Executando Cenarios em Paralelo

Consulte o guia dedicado [Execucao Paralela](parallel-execution) para informações detalhadas sobre a execução de cenários Cucumber em paralelo.

Exemplo rápido:

**junit-platform.properties:**
```properties
cucumber.execution.parallel.enabled=true
cucumber.execution.parallel.config.strategy=dynamic
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel
```

## Cucumber Hooks

Os Cucumber Hooks permitem que você execute código antes ou depois dos cenários:

```java
package com.example.hooks;

import io.cucumber.java.*;

public class CucumberHooks {

    @Before
    public void beforeScenario(Scenario scenario) {
        System.out.println("Iniciando cenario: " + scenario.getName());
    }

    @After
    public void afterScenario(Scenario scenario) {
        System.out.println("Finalizando cenario: " + scenario.getName());
        if (scenario.isFailed()) {
            // Tratar falha
        }
    }

    @BeforeStep
    public void beforeStep() {
        // Executa antes de cada passo
    }

    @AfterStep
    public void afterStep() {
        // Executa depois de cada passo
    }
}
```

### Tagged Hooks

Execute hooks apenas para tags específicas:

```java
@Before("@database")
public void setupDatabase() {
    // Executa apenas para cenarios com tag @database
}

@After("@cleanup")
public void cleanup() {
    // Executa apenas para cenarios com tag @cleanup
}
```

### Ordem de Execucao de Hooks

Controle a ordem de execução dos hooks com o parâmetro `order`:

```java
@Before(order = 1)
public void firstHook() {
    // Executa primeiro
}

@Before(order = 2)
public void secondHook() {
    // Executa segundo
}
```

## Data Tables

As Data Tables do Cucumber permitem que você passe dados estruturados para os passos:

### Arquivo de Feature:
```gherkin
Scenario: Create multiple users
  Given the following users exist:
    | username | email              | role  |
    | alice    | alice@example.com  | admin |
    | bob      | bob@example.com    | user  |
    | charlie  | charlie@example.com| user  |
```

### Step Definition:
```java
@Given("the following users exist:")
public void createUsers(DataTable dataTable) {
    List<Map<String, String>> users = dataTable.asMaps();
    for (Map<String, String> user : users) {
        String username = user.get("username");
        String email = user.get("email");
        String role = user.get("role");
        // Criar usuario
    }
}
```

## Scenario Outlines

Scenario Outline permite executar o mesmo cenário com dados diferentes:

```gherkin
Scenario Outline: Login with different credentials
  Given I am on the login page
  When I enter username "<username>" and password "<password>"
  Then I should see "<result>"

  Examples:
    | username | password | result          |
    | admin    | admin123 | Dashboard       |
    | user     | user123  | User Home       |
    | invalid  | wrong    | Invalid credentials |
```

## Referencia de Parametros de Configuracao

### Constantes Comuns do Cucumber

Todas disponíveis em `io.cucumber.junit.platform.engine.Constants`:

| Constante | Propósito | Exemplo |
|----------|---------|---------|
| `PLUGIN_PROPERTY_NAME` | Configurar plugins | `"net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel"` |
| `GLUE_PROPERTY_NAME` | Pacotes de Step Definition | `"com.example.stepdefinitions"` |
| `FILTER_TAGS_PROPERTY_NAME` | Filtro de expressão de tags | `"@smoke and not @wip"` |
| `FEATURES_PROPERTY_NAME` | Localizações de arquivos de Feature | `"src/test/resources/features"` |
| `PLUGIN_PUBLISH_QUIET_PROPERTY_NAME` | Suprimir mensagens de publicação do Cucumber | `"true"` |
| `ANSI_COLORS_DISABLED_PROPERTY_NAME` | Desabilitar saída colorida | `"true"` |
| `EXECUTION_DRY_RUN_PROPERTY_NAME` | Verificar Step Definition sem executar | `"true"` |
| `OBJECT_FACTORY_PROPERTY_NAME` | Object factory personalizada | `"com.example.CustomObjectFactory"` |

### Propriedades de Execucao Paralela

| Propriedade | Propósito | Exemplo |
|----------|---------|---------|
| `cucumber.execution.parallel.enabled` | Habilitar execução paralela | `true` |
| `cucumber.execution.parallel.config.strategy` | Estratégia de execução | `dynamic`, `fixed` |
| `cucumber.execution.parallel.config.fixed.parallelism` | Número de threads paralelas (fixed) | `4` |
| `cucumber.execution.parallel.config.dynamic.factor` | Multiplicador para processadores disponíveis | `1.0` |

## Multiplas Test Suites

Você pode criar múltiplas test suites para diferentes propósitos:

```java
// Testes de smoke
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(key = FILTER_TAGS_PROPERTY_NAME, value = "@smoke")
class SmokeTestSuite {}

// Testes de regressao
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(key = FILTER_TAGS_PROPERTY_NAME, value = "@regression")
class RegressionTestSuite {}

// Area de funcionalidade especifica
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features/authentication")
class AuthenticationTestSuite {}
```

## Boas Praticas

### 1. Organizacao de Arquivos de Feature
- Agrupe funcionalidades relacionadas em diretórios
- Use nomes de funcionalidade significativos
- Mantenha os cenários focados e independentes
- Use Background para configuração comum

### 2. Estrategia de Tagging
- Use tags consistentemente em todo o projeto
- Tags comuns: `@smoke`, `@regression`, `@wip`, `@bug`, `@slow`
- Tag por área de funcionalidade: `@authentication`, `@checkout`, `@search`
- Tag por tipo de teste: `@ui`, `@api`, `@integration`

### 3. Step Definitions
- Escreva passos reutilizáveis
- Use expressões Cucumber para flexibilidade
- Mantenha as implementações de passos enxutas - delegue para Action Class ou Task do Screenplay
- Evite duplicar Step Definition

### 4. Design de Cenarios
- Escreva cenários da perspectiva do usuário
- Use a estrutura Dado-Quando-Então (Given-When-Then) consistentemente
- Mantenha os cenários focados em um único comportamento
- Use Scenario Outline para testes orientados a dados

### 5. Relatorios
- Sempre configure o reporter do Serenity
- Use nomes de cenário e passo significativos
- Adicione tags relevantes para filtrar relatórios
- Revise os relatórios regularmente

## Resolucao de Problemas

### Problemas Comuns

**1. Testes JUnit 5 nao executam junto com testes Cucumber**

Se você tem testes JUnit 5 e testes Cucumber no seu projeto, mas apenas os testes Cucumber estão sendo descobertos e executados, isso provavelmente ocorre porque a propriedade `cucumber.features` do Cucumber faz com que outros seletores de descoberta sejam ignorados. Você verá um aviso como:

```
WARNING: Discovering tests using the cucumber.features property. Other discovery selectors are ignored!
```

A solução é configurar execuções separadas do Maven Failsafe para testes JUnit e Cucumber. Consulte [Executando Testes JUnit 5 e Cucumber Juntos](/docs/guide/maven#running-junit-5-and-cucumber-tests-together) para a configuração completa.

**2. "No tests found"**
- Certifique-se de que `@Suite` e `@IncludeEngines("cucumber")` estão presentes
- Verifique se os arquivos de Feature estão no local correto
- Verifique se as Step Definition estão no caminho do glue

**3. "Step undefined"**
- Implemente a Step Definition faltante
- Verifique se a configuração do glue aponta para o pacote das suas Step Definition
- Certifique-se de que a regex/expressões do passo correspondem

**4. "Plugin not found"**
- Verifique se você está usando o caminho correto do plugin: `net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel`
- Verifique se as dependências do Serenity estão incluídas

**5. "Tests not running in parallel"**
- Certifique-se de que a configuração paralela está em `junit-platform.properties`
- Use `SerenityReporterParallel` (não `SerenityReporter`)
- Verifique a configuração da JUnit Platform

## Proximos Passos

- Aprenda sobre [Execucao Paralela](parallel-execution) para execuções de teste mais rápidas
- Explore a [Referencia de Configuracao do Cucumber](configuration-reference) para opções avançadas
- Confira o [Screenplay Pattern](/docs/screenplay/screenplay_fundamentals) para melhor manutenibilidade dos testes
- Revise a documentação de [Relatorios do Serenity](/docs/reporting/the_serenity_reports)

## Recursos Adicionais

- [Documentacao do Cucumber](https://cucumber.io/docs/cucumber/)
- [Guia do Usuario JUnit 5](https://junit.org/junit5/docs/current/user-guide/)
- [Site Oficial do Serenity BDD](https://serenity-bdd.info)
- [Projeto de Exemplo](https://github.com/serenity-bdd/serenity-cucumber-starter)
