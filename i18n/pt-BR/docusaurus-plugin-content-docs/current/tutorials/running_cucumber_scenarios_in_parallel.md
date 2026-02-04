---
sidebar_position: 6
---

# Como Fazer Execucao Paralela de Testes no Cucumber com Serenity

O Cucumber 7 introduziu suporte nativo para execucao paralela tanto no nivel de Feature quanto de Scenario. Esta execucao paralela pode fornecer melhorias significativas de desempenho nas execucoes de teste. Se voce deseja aproveitar essas melhorias de desempenho e executar suas Feature e Scenario do Serenity BDD em paralelo, voce precisara atualizar para o JUnit 5.

## Pre-requisitos

- **Cucumber 7.x**
- **Serenity BDD 3.9.8 ou 4.0.x**
- **Maven 3.x** para compilar o projeto

Agora, vamos comecar com o guia passo a passo detalhado.

## Passo 1: Atualizar o Serenity BDD para uma Versao Recente

Antes de prosseguir, certifique-se de ter uma versao recente do Serenity BDD. As versoes 3.9.8 ou 4.0.x sao recomendadas para melhores resultados.

Voce pode verificar sua versao atual no arquivo `pom.xml` ou atualiza-la para a versao mais recente.

## Passo 2: Atualizar para JUnit 5 no Seu Projeto Maven

O JUnit 5 fornece a base para executar testes em paralelo com Cucumber e Serenity. Veja como voce pode atualizar para o JUnit 5 no seu arquivo `pom.xml`:

1. Abra o arquivo `pom.xml` no seu projeto Maven.
2. Adicione as seguintes dependencias para JUnit 5 e Cucumber 7.

    ```xml
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.junit</groupId>
                <artifactId>junit-bom</artifactId>
                <version>5.10.0</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
    <dependencies>
        ...
        <!-- Dependencias do JUNIT 5 -->
        <dependency>
            <groupId>org.junit.platform</groupId>
            <artifactId>junit-platform-launcher</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.junit.platform</groupId>
            <artifactId>junit-platform-suite</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-engine</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>io.cucumber</groupId>
            <artifactId>cucumber-junit-platform-engine</artifactId>
            <version>7.2.3</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
    ```

Mais detalhes sobre JUnit 5 e Maven podem ser encontrados no [Guia do Usuario do JUnit 5](https://junit.org/junit5/docs/current/user-guide/#running-tests-build-maven).

## Passo 3: Criar um Arquivo `junit-platform.properties`

Crie um novo arquivo chamado `junit-platform.properties` na sua pasta `src/test/resources`. Este arquivo habilita e configura a execucao paralela.

Adicione o seguinte conteudo ao arquivo:

```properties
cucumber.execution.parallel.enabled=true
cucumber.execution.parallel.config.strategy=dynamic
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel
```

:::note Mudanca Significativa no Serenity 5.0.0
O caminho do plugin Cucumber mudou de `io.cucumber.core.plugin.*` para `net.serenitybdd.cucumber.core.plugin.*` no Serenity 5.0.0. Certifique-se de usar o caminho atualizado mostrado acima.
:::

Essas propriedades habilitam a execucao paralela e a configuram para usar uma estrategia dinamica, junto com o reporter Serenity para execucao paralela.

## Passo 4: Criar um Arquivo `cucumber.properties`

Crie um novo arquivo chamado `cucumber.properties` na sua pasta `src/test/resources`. Este arquivo contera as opcoes do Cucumber para seus testes Cucumber.

Adicione o seguinte conteudo ao arquivo:

```properties
cucumber.execution.order = random
cucumber.plugin=pretty,json:target/cucumber.json,timeline:target/test-results/timeline
cucumber.snippet-type=camelcase
```

Voce pode encontrar mais detalhes sobre opcoes de configuracao do Cucumber na [documentacao do Cucumber](https://cucumber.io/docs/cucumber/api/?lang=java#list-configuration-options).

## Passo 5: Atualizar Sua Classe Runner do Cucumber

Voce deve ter uma unica classe runner para toda sua suite de testes. Atualize-a da seguinte forma:

```java
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("/features")
public class AcceptanceTestSuite {}
```

Esta classe runner incluira todas as Feature no diretorio `/features` e as executara usando o engine do Cucumber.

## Conclusao

E isso! Seguindo esses passos, voce pode aproveitar o poder da execucao paralela com Cucumber e Serenity BDD. Isso reduzira significativamente o tempo de execucao da sua suite de testes, levando a feedback mais rapido e ciclos de desenvolvimento mais eficientes.

Bons testes!
