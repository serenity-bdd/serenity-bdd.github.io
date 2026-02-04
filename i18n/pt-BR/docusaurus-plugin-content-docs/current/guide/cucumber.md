# Executando cenários Cucumber com Serenity

:::tip Guia Completo de Cucumber Disponível
Para um guia completo e aprofundado sobre como usar o Cucumber com Serenity BDD e JUnit 5, incluindo opções de configuração, melhores práticas e solução de problemas, consulte a seção dedicada [Cucumber com JUnit 5](/docs/cucumber/cucumber-junit5).
:::

Para executar cenários Cucumber com o Serenity, você precisa criar uma classe de execução de teste JUnit 5 como esta:

```java
   import org.junit.platform.suite.api.IncludeEngines;
   import org.junit.platform.suite.api.SelectClasspathResource;
   import org.junit.platform.suite.api.Suite;

   @Suite
   @IncludeEngines("cucumber")
   @SelectClasspathResource("/features")
   public class CucumberTestSuite {}
```

Observe que você precisa especificar pelo menos o atributo `features`, para definir o diretório que contém seus arquivos de feature.

# Hierarquias de Feature

O Serenity espera encontrar arquivos de feature na pasta `src/test/resources/features` por padrão. Você pode organizar seus arquivos de feature em uma hierarquia de pastas abaixo desta, como mostrado aqui:

```
+ src
|-- test
|   |-- resources
|   |  |-- features
|   |  |   |-- authentication
|   |  |   |   |-- login.feature
|   |  |   |-- cart
|   |  |   |   |-- managing_the_cart.feature
|   |  |   |-- catalog
|   |  |   |   |-- browse_catalog.feature
|   |  |   |   |-- filtering_products.feature
|   |  |   |-- purchases
|   |  |   |   |-- completing_a_purchase.feature
|   |  |   |-- sales_tax
|   |  |   |   |-- calculating_sales_tax.feature
```

A estrutura de diretórios será usada para construir a hierarquia de requisitos do Serenity, como a mostrada aqui:

![](img/cucumber-requirements-hierarchy.png)


# Filtrando a execução de testes no Cucumber

A maneira mais simples de controlar quais cenários você deseja executar é usar tags e a opção de linha de comando `cucumber.filter.tags`. Por exemplo, para executar apenas cenários ou features anotados com `@smoke`, você executaria o seguinte comando:
```
mvn clean verify -Dcucumber.filter.tags="@smoke"
```

Você pode usar [Expressões de Tag do Cucumber](https://cucumber.io/docs/cucumber/api/#tag-expressions) para determinar quais cenários executar. Por exemplo, para executar apenas features com as tags `@authentication` e `@smoke`, você executaria o seguinte:
```
 mvn clean verify -Dcucumber.filter.tags="@authentication and @smoke"
 ```

Para executar cenários com a tag `@cart` ou a tag `@catalog`, você poderia executar o seguinte:
```
 mvn clean verify -Dcucumber.filter.tags="@cart or @catalog"
 ```
# Executando cenários Cucumber com Serenity em paralelo

A partir da versão 3.6.0, é possível executar os cenários Cucumber em paralelo.

Os seguintes passos são necessários para ativar a execução paralela:

1. Adicione as seguintes dependências no pom.xml da sua aplicação:
```xml
    <dependency>
        <groupId>io.cucumber</groupId>
        <artifactId>cucumber-junit-platform-engine</artifactId>
        <version>7.11.0</version>
        <scope>test</scope>
    </dependency>

    <dependency>
        <groupId>org.junit.platform</groupId>
        <artifactId>junit-platform-suite</artifactId>
        <version>1.9.2</version>
        <scope>test</scope>
    </dependency>
```
2. Crie um arquivo chamado `junit-platform.properties` em `test/resources`
```
cucumber.execution.parallel.enabled=true
cucumber.execution.parallel.config.strategy=fixed
cucumber.execution.parallel.config.fixed.parallelism=4
cucumber.execution.parallel.config.fixed.max-pool-size=4
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel
```

:::note Alteração Importante no Serenity 5.0.0
O caminho do plugin Cucumber mudou de `io.cucumber.core.plugin.*` para `net.serenitybdd.cucumber.core.plugin.*` no Serenity 5.0.0. Certifique-se de atualizar seus arquivos de configuração.
:::
Mais informações sobre o significado das propriedades podem ser encontradas na [Documentação do Cucumber JUnit Platform Engine](https://github.com/cucumber/cucumber-jvm/tree/main/cucumber-junit-platform-engine)

3. Configure a localização no classpath dos cenários a serem executados em uma classe Java colocada em um pacote sob `test/java`
```java
   import org.junit.platform.suite.api.IncludeEngines;
   import org.junit.platform.suite.api.SelectClasspathResource;
   import org.junit.platform.suite.api.Suite;

   @Suite
   @IncludeEngines("cucumber")
   @SelectClasspathResource("/features")
   public class CucumberTestSuite {}
```
