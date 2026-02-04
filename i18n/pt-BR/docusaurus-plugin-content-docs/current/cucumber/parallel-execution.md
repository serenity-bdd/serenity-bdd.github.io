---
id: parallel-execution
title: Executando Testes Cucumber em Paralelo
sidebar_position: 2
---

# Executando Cenarios Cucumber em Paralelo

Executar cenários Cucumber em paralelo pode reduzir drasticamente o tempo de execução dos testes. Este guia explica como configurar e otimizar a execução paralela com Serenity BDD e JUnit 5.

## Visao Geral

A execução paralela no Cucumber com JUnit 5 é alimentada pelo Cucumber JUnit Platform Engine, que se integra às capacidades de execução de testes paralelos do JUnit 5. Quando configurado corretamente, múltiplos cenários podem ser executados simultaneamente, aproveitando processadores multi-core.

## Pre-requisitos

- Serenity BDD 3.6.0 ou superior
- JUnit 5
- Cucumber JUnit Platform Engine
- Código de teste thread-safe

## Configuracao Basica

### Passo 1: Adicionar Dependencias Necessarias

Certifique-se de ter a dependência do Cucumber JUnit Platform Engine:

```xml
<dependency>
    <groupId>io.cucumber</groupId>
    <artifactId>cucumber-junit-platform-engine</artifactId>
    <version>7.33.0</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.junit.platform</groupId>
    <artifactId>junit-platform-suite</artifactId>
    <version>5.10.0</version>
    <scope>test</scope>
</dependency>
```

### Passo 2: Usar o Reporter Paralelo

:::warning Importante
Você **deve** usar `SerenityReporterParallel` para execução paralela, não `SerenityReporter`.
:::

Atualize sua test suite para usar o reporter thread-safe:

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

### Passo 3: Configurar Execucao Paralela

Crie ou atualize `junit-platform.properties` em `src/test/resources`:

```properties
# Habilitar execucao paralela
cucumber.execution.parallel.enabled=true

# Usar estrategia dinamica (recomendado)
cucumber.execution.parallel.config.strategy=dynamic

# Configurar o reporter do Serenity
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel
```

## Estrategias de Execucao

### Estrategia Dinamica (Recomendada)

A estratégia dinâmica determina automaticamente o número de threads baseado nos processadores disponíveis:

```properties
cucumber.execution.parallel.config.strategy=dynamic
cucumber.execution.parallel.config.dynamic.factor=1.0
```

O `factor` é um multiplicador para o número de processadores disponíveis:
- `1.0` = mesmo número de threads que processadores (recomendado)
- `0.5` = metade do número de processadores
- `2.0` = dobro do número de processadores

**Exemplo:** Em uma máquina com 8 cores:
- Fator `1.0` = 8 threads
- Fator `0.5` = 4 threads
- Fator `2.0` = 16 threads

### Estrategia Fixa

A estratégia fixa usa um número especificado de threads:

```properties
cucumber.execution.parallel.config.strategy=fixed
cucumber.execution.parallel.config.fixed.parallelism=4
cucumber.execution.parallel.config.fixed.max-pool-size=4
```

- `parallelism` - Número de threads concorrentes
- `max-pool-size` - Tamanho máximo do pool de threads

**Use quando:**
- Você precisa de contagens de threads consistentes e previsíveis
- Executando em infraestrutura de CI/CD compartilhada
- Depurando problemas de execução paralela

### Estrategia Personalizada

Para casos de uso avançados, você pode implementar uma estratégia personalizada:

```properties
cucumber.execution.parallel.config.strategy=custom
cucumber.execution.parallel.config.custom.class=com.example.MyParallelStrategy
```

## Exemplo Completo de Configuracao

**junit-platform.properties:**
```properties
# Execucao paralela
cucumber.execution.parallel.enabled=true
cucumber.execution.parallel.config.strategy=dynamic
cucumber.execution.parallel.config.dynamic.factor=1.0

# Reporter do Serenity
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel

# Opcional: Controlar ordem de execucao
cucumber.execution.order=random

# Opcional: Falhar rapido
cucumber.execution.fail-fast=false
```

## Consideracoes sobre Thread Safety

### Gerenciamento de WebDriver

O WebDriver `@Managed` do Serenity é automaticamente thread-safe ao usar execução paralela:

```java
@ExtendWith(SerenityJUnit5Extension.class)
class WebDriverSteps {

    @Managed
    WebDriver driver;  // Thread-safe - cada thread recebe sua propria instancia

    @Given("I am on the home page")
    public void navigateToHomePage() {
        driver.get("https://example.com");
    }
}
```

Cada thread terá sua própria instância isolada de WebDriver.

### Thread Safety em Step Definition

Classes de Step Definition devem ser thread-safe:

**Thread-Safe (Recomendado):**
```java
public class LoginSteps {

    @Given("{actor} is on the login page")
    public void navigateToLoginPage(Actor actor) {
        actor.attemptsTo(
            Navigate.to("/login")
        );
    }
}
```

**NAO Thread-Safe:**
```java
public class LoginSteps {

    private String username;  // Estado compartilhado - NAO thread-safe!

    @Given("user enters username {string}")
    public void enterUsername(String user) {
        this.username = user;  // Condicao de corrida!
    }
}
```

### Usando Contexto de Cenario

Para compartilhar dados dentro de um cenário, use o contexto de cenário do Cucumber:

```java
public class CheckoutSteps {

    private final ScenarioContext context;

    public CheckoutSteps(ScenarioContext context) {
        this.context = context;  // Injetado por cenario
    }

    @When("I add item to cart")
    public void addItem() {
        context.put("cartTotal", calculateTotal());
    }

    @Then("cart total should be correct")
    public void verifyTotal() {
        Double total = context.get("cartTotal", Double.class);
        // Verificar total
    }
}
```

## Controlando o Paralelismo

### Paralelismo em Diferentes Niveis

Você pode controlar o que executa em paralelo:

#### Paralelismo em Nivel de Cenario (Padrao)
```properties
# Cada cenario executa em sua propria thread
cucumber.execution.parallel.enabled=true
```

#### Paralelismo em Nivel de Feature
Para executar Feature em paralelo, mas cenários dentro de uma Feature sequencialmente, você precisa configurar a JUnit Platform:

**junit-platform.properties:**
```properties
junit.jupiter.execution.parallel.enabled=true
junit.jupiter.execution.parallel.mode.default=concurrent
junit.jupiter.execution.parallel.mode.classes.default=concurrent
```

### Limitando Cenarios Concorrentes

Controle o número máximo de cenários concorrentes:

```properties
cucumber.execution.parallel.config.strategy=fixed
cucumber.execution.parallel.config.fixed.parallelism=4
```

## Execucao Paralela com Tags

Você pode executar tags específicas em paralelo:

```java
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(
    key = PLUGIN_PROPERTY_NAME,
    value = "net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel"
)
@ConfigurationParameter(
    key = FILTER_TAGS_PROPERTY_NAME,
    value = "@parallel"
)
class ParallelTestSuite {
}
```

Ou exclua cenários da execução paralela:

```properties
cucumber.filter.tags=not @serial
```

## Configuracao Maven/Gradle

### Plugin Maven Surefire

Configure o Maven para suportar execução paralela:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>3.0.0</version>
            <configuration>
                <skip>true</skip>
            </configuration>
        </plugin>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-failsafe-plugin</artifactId>
            <version>3.0.0</version>
            <configuration>
                <includes>
                    <include>**/*TestSuite.java</include>
                </includes>
                <systemPropertyVariables>
                    <webdriver.driver>${webdriver.driver}</webdriver.driver>
                </systemPropertyVariables>
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
    </plugins>
</build>
```

### Configuracao Gradle

Para Gradle:

```groovy
test {
    useJUnitPlatform()
    maxParallelForks = Runtime.runtime.availableProcessors()

    systemProperty 'cucumber.execution.parallel.enabled', 'true'
    systemProperty 'cucumber.execution.parallel.config.strategy', 'dynamic'
}
```

## Otimizacao de Performance

### 1. Escolha a Estrategia Certa

- **Suites de teste pequenas** (&lt;50 cenários): Estratégia fixa com 2-4 threads
- **Suites de teste médias** (50-200 cenários): Estratégia dinâmica com fator 1.0
- **Suites de teste grandes** (&gt;200 cenários): Estratégia dinâmica com fator 0.75-1.0

### 2. Otimize o Design dos Cenarios

- **Mantenha cenarios independentes** - Sem estado compartilhado entre cenários
- **Minimize tempo de setup** - Use Before hooks eficientes
- **Evite sleeps** - Use esperas explícitas em vez disso
- **Limpe recursos** - Use After hooks adequadamente

### 3. Gerenciamento de Recursos

```properties
# Controle o tamanho do pool de threads para evitar esgotamento de recursos
cucumber.execution.parallel.config.fixed.max-pool-size=8

# Evite muitos navegadores concorrentes
webdriver.pool.max=10
```

### 4. Monitore o Uso de Recursos

Observe:
- Utilização de CPU (deve estar próxima de 100% para performance ideal)
- Consumo de memória (cada instância de navegador usa RAM)
- Largura de banda de rede (para WebDriver remoto)
- Conexões de banco de dados (se aplicável)

## Depurando Testes Paralelos

### Desabilitar Execucao Paralela Temporariamente

```properties
cucumber.execution.parallel.enabled=false
```

Ou via linha de comando:
```bash
mvn clean verify -Dcucumber.execution.parallel.enabled=false
```

### Executar com Menos Threads

```properties
cucumber.execution.parallel.config.strategy=fixed
cucumber.execution.parallel.config.fixed.parallelism=1
```

### Logging Verboso

Habilite logging detalhado para diagnosticar problemas:

```properties
# Localizacao do arquivo de log
cucumber.plugin=pretty,html:target/cucumber-reports.html,json:target/cucumber.json

# Logging do Serenity
serenity.verbose=true
serenity.logging=VERBOSE
```

## Problemas Comuns e Solucoes

### Problema 1: Testes Intermitentes (Flaky Tests)

**Sintomas:** Testes passam quando executados individualmente, mas falham quando executados em paralelo

**Solucoes:**
- Verifique estado compartilhado nas Step Definition
- Certifique-se de que as instâncias de WebDriver estão propriamente isoladas
- Revise os dados de teste - evite dados de teste compartilhados
- Adicione sincronização/esperas adequadas

### Problema 2: Esgotamento de Recursos

**Sintomas:** Testes ficam lentos ou travam após algum tempo

**Solucoes:**
- Reduza o paralelismo: diminua a contagem de threads
- Aumente o heap size: `-Xmx4g`
- Verifique vazamentos de recursos (conexões não fechadas, instâncias de navegador)
- Monitore os recursos do sistema

### Problema 3: Problemas na Geracao de Relatorios

**Sintomas:** Relatórios do Serenity estão incompletos ou corrompidos

**Solucoes:**
- Certifique-se de que está usando `SerenityReporterParallel`
- Verifique a versão do Serenity (3.6.0+)
- Verifique se o maven-failsafe-plugin está configurado corretamente
- Verifique condições de corrida no sistema de arquivos

### Problema 4: Falhas no Pipeline de CI/CD

**Sintomas:** Testes falham apenas no CI, mas passam localmente

**Solucoes:**
- Ajuste a contagem de threads para as capacidades do ambiente de CI
- Use estratégia fixa para comportamento consistente
- Aumente timeouts para ambientes de CI mais lentos
- Verifique limites de recursos do CI

## Boas Praticas

### 1. Comece Pequeno
Comece com 2-4 threads e aumente gradualmente:

```properties
cucumber.execution.parallel.config.strategy=fixed
cucumber.execution.parallel.config.fixed.parallelism=2
```

### 2. Use Tags Estrategicamente

Marque cenários que não podem executar em paralelo:

```gherkin
@serial @database-migration
Scenario: Migrate database schema
  # Este cenario deve executar sozinho
```

Então exclua-os:
```properties
cucumber.filter.tags=not @serial
```

### 3. Isole Dados de Teste

Cada cenário deve criar e limpar seus próprios dados de teste:

```java
@Before
public void setupTestData() {
    // Crie dados de teste unicos para este cenario
    String uniqueId = UUID.randomUUID().toString();
    context.put("testUserId", "user_" + uniqueId);
}

@After
public void cleanupTestData() {
    // Limpe os dados de teste deste cenario
    String userId = context.get("testUserId", String.class);
    deleteUser(userId);
}
```

### 4. Monitore e Ajuste

- Monitore tempos de execução de testes
- Acompanhe taxas de testes intermitentes
- Ajuste o paralelismo baseado em métricas
- Revise a utilização de recursos

### 5. Documente Thread Safety

Adicione comentários para cenários não thread-safe:

```gherkin
# @serial - Modifica estado global da aplicacao
@serial @admin
Scenario: Update application settings
  Given I am logged in as admin
  When I change the default language to Spanish
  Then all users should see Spanish interface
```

## Medindo Melhorias de Performance

### Antes da Execucao Paralela
```
Total de cenarios: 100
Tempo de execucao: 50 minutos
```

### Apos Execucao Paralela (8 threads)
```
Total de cenarios: 100
Tempo de execucao: 8 minutos
Speedup: 6.25x
Eficiencia: 78%
```

Calcule seu speedup:
```
Speedup = Tempo Sequencial / Tempo Paralelo
Eficiencia = Speedup / Numero de Threads
```

## Proximos Passos

- Revise o guia principal [Cucumber com JUnit 5](cucumber-junit5)
- Consulte a [Referencia de Configuracao](configuration-reference) para todas as opções disponíveis
- Veja [Boas Praticas](cucumber-junit5#best-practices) para escrever testes manteniveis
- Explore a documentação de [Relatorios do Serenity](/docs/reporting/the_serenity_reports)

## Recursos Adicionais

- [Documentacao de Execucao Paralela do Cucumber](https://github.com/cucumber/cucumber-jvm/tree/main/cucumber-junit-platform-engine#parallel-execution)
- [Execucao Paralela do JUnit 5](https://junit.org/junit5/docs/current/user-guide/#writing-tests-parallel-execution)
- [Dicas de Performance do Serenity BDD](https://serenity-bdd.info)
