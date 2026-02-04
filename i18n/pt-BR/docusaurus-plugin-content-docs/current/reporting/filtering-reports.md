---
id: filtering_reports
title: Filtrando Execução e Relatórios com Tags
sidebar_position: 3
---

O Serenity BDD facilita obter tanto uma visão geral ampla dos seus resultados de teste quanto da cobertura funcional.
Mas ao trabalhar com grandes conjuntos de testes, muitas vezes é útil poder se concentrar em áreas funcionais específicas da aplicação ao reportar resultados.
Por exemplo, você pode querer visualizar apenas os resultados dos testes relacionados ao release atual, ou a uma área funcional específica.

No Serenity BDD, você pode usar tags para gerar esse tipo de relatório focado.

Isso funciona de forma muito natural com cenários de teste Cucumber. Por exemplo, no seguinte arquivo de feature, usamos a tag `@sprint-2` para indicar que o cenário está programado para o Sprint 2.

```gherkin
@sprint-2
Scenario: Comprador pede um café
  Given Cathy tem uma conta Caffeinate-Me
  When ela pede um cappuccino grande
  Then Cathy deve receber o pedido
```

A marcação com tags também funciona com testes JUnit 5, como ilustrado aqui:

```java
@ExtendWith(SerenityJUnit5Extension.class)
class WhenAddingNumbers {

    @Steps
    MathWizSteps michael;

    @Test
    @WithTag("release:sprint-2")
    void addingSums() {
        // Given
        michael.startsWith(1);

        // When
        michael.adds(2);

        // Then
        michael.shouldHave(3);
    }

    @Test
    @WithTagsValuesOf({"Reporting", "release:sprint-3"})
    void testWithMultipleTags() {
    }
}
```

:::note JUnit 4 Obsoleto
Se você estiver usando JUnit 4 com `@RunWith(SerenityRunner.class)`, observe que o suporte ao JUnit 4 está obsoleto a partir do Serenity 5.0.0 e será removido no Serenity 6.0.0. Por favor, migre para o JUnit 5.
:::

## Executando Cenários por tags

Tags também são uma ótima maneira de ajudar a organizar a execução de testes.
Por exemplo, você pode querer marcar todos os testes de web services, ou marcar certos testes para executar apenas no navegador Internet Explorer.
Com testes JUnit, isso pode ser alcançado fornecendo uma única tag ou uma lista de tags separadas por "or" na linha de comando.
Se fornecido, apenas classes e/ou métodos com tags nesta lista serão executados.

```bash
mvn clean verify -Dtags="feature:Reporting or release:sprint-2"
mvn clean verify -Dtags="feature:Reporting or release:sprint-2"
```

Ao usar Cucumber, precisamos usar a propriedade `cucumber.options` para indicar quais cenários devem ser executados. Por exemplo, o seguinte comando executa todos os cenários Cucumber com a tag `@sprint-2`:

```bash
mvn clean verify -Dcucumber.options="--tags=@sprint-2"
```

## Excluindo Requisitos Não Relacionados

Por padrão, quando você usa a opção `tags`, o Serenity filtrará seus requisitos da melhor forma possível para reportar apenas os requisitos que são relevantes para a tag especificada.

A filtragem de requisitos só acontece se você especificar a opção `tags`. Então isso produzirá um conjunto completo de requisitos na página *Requirements*.

```bash
mvn clean verify -Dcucumber.options="--tags @sprint-2"
```

Mas isso reportará apenas os requisitos que estão relacionados aos testes executados.

```bash
mvn clean verify -Dcucumber.options="--tags @sprint-2" -Dtags=sprint-2
```

Se você já executou o conjunto completo de testes, também pode produzir um relatório agregado filtrado, caso em que não precisa fornecer a propriedade `cucumber.options`:

```bash
mvn serenity:aggregate -Dtags=sprint-2
```

## Usando tags com Cucumber e JUnit 5

Ao executar testes Cucumber com JUnit 5, você pode usar a propriedade de configuração `FILTER_TAGS_PROPERTY_NAME` para gerenciar as tags para um executor de teste específico:

```java
@ConfigurationParameter(key = FILTER_TAGS_PROPERTY_NAME, value = "@smoke-test and @filtering")
public class CucumberTestSuite {
}
```

Alternativamente, a partir da linha de comando, você pode usar a propriedade de linha de comando `tags` como mostrado aqui (observe que com Cucumber 7, você não precisa do símbolo '@' para as tags ao especificar tags na linha de comando):

```
mvn clean verify -Dtags="smoke-test or filtering"
```
