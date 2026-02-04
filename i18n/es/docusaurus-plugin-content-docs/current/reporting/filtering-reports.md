---
id: filtering_reports
title: Filtrar Ejecución y Reportes con Etiquetas
sidebar_position: 3
---

Serenity BDD facilita obtener tanto una vista general amplia de tus resultados de pruebas como la cobertura funcional.
Pero cuando trabajas con suites de pruebas grandes, a menudo es útil poder enfocarse en áreas funcionales específicas de la aplicación al reportar resultados.
Por ejemplo, podrías querer ver solo los resultados de las pruebas relacionadas con el release actual, o con un área funcional específica.

En Serenity BDD, puedes usar etiquetas para generar este tipo de reporte enfocado.

Esto funciona muy naturalmente con escenarios de prueba de Cucumber. Por ejemplo, en el siguiente archivo feature, hemos usado la etiqueta `@sprint-2` para indicar que el escenario está programado para el Sprint 2.

```gherkin
@sprint-2
Scenario: Buyer orders a coffee
  Given Cathy has a Caffeinate-Me account
  When she orders a large cappuccino
  Then Cathy should receive the order
```

El etiquetado también funciona con pruebas JUnit 5, como se ilustra aquí:

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
Si estás usando JUnit 4 con `@RunWith(SerenityRunner.class)`, ten en cuenta que el soporte para JUnit 4 está obsoleto a partir de Serenity 5.0.0 y será eliminado en Serenity 6.0.0. Por favor migra a JUnit 5.
:::

## Ejecutar Escenarios por etiquetas

Las etiquetas también son una excelente manera de ayudar a organizar la ejecución de pruebas.
Por ejemplo, podrías querer marcar todas las pruebas de servicios web, o marcar ciertas pruebas para ejecutar solo contra el navegador Internet Explorer.
Con pruebas JUnit, esto se puede lograr proporcionando una sola etiqueta o una lista de etiquetas separadas por "or" desde la línea de comandos.
Si se proporciona, solo se ejecutarán las clases y/o métodos con etiquetas en esta lista.

```bash
mvn clean verify -Dtags="feature:Reporting or release:sprint-2"
mvn clean verify -Dtags="feature:Reporting or release:sprint-2"
```

Cuando uses Cucumber, necesitas usar la propiedad `cucumber.options` para indicar qué escenarios deben ejecutarse. Por ejemplo, el siguiente comando ejecuta todos los escenarios de Cucumber con la etiqueta `@sprint-2`:

```bash
mvn clean verify -Dcucumber.options="--tags=@sprint-2"
```

## Excluir Requisitos No Relacionados

Por defecto, cuando usas la opción `tags`, Serenity filtrará tus requisitos lo mejor que pueda para reportar solo los requisitos que son relevantes para la etiqueta especificada.

El filtrado de requisitos solo ocurre si especificas la opción `tags`. Así que esto producirá un conjunto completo de requisitos en la página *Requirements*.

```bash
mvn clean verify -Dcucumber.options="--tags @sprint-2"
```

Pero esto reportará solo los requisitos que están relacionados con las pruebas ejecutadas.

```bash
mvn clean verify -Dcucumber.options="--tags @sprint-2" -Dtags=sprint-2
```

Si ya has ejecutado el conjunto completo de pruebas, también puedes producir un reporte agregado filtrado, en cuyo caso no necesitas proporcionar la propiedad `cucumber.options`:

```bash
mvn serenity:aggregate -Dtags=sprint-2
```

## Usar etiquetas con Cucumber y JUnit 5

Cuando ejecutas pruebas Cucumber con JUnit 5, puedes usar la propiedad de configuración `FILTER_TAGS_PROPERTY_NAME` para gestionar las etiquetas para un runner de pruebas específico:

```java
@ConfigurationParameter(key = FILTER_TAGS_PROPERTY_NAME, value = "@smoke-test and @filtering")
public class CucumberTestSuite {
}
```

Alternativamente, desde la línea de comandos, puedes usar la propiedad de línea de comandos `tags` como se muestra aquí (ten en cuenta que con Cucumber 7, no necesitas el símbolo '@' para las etiquetas cuando especificas etiquetas en la línea de comandos):

```
mvn clean verify -Dtags="smoke-test or filtering"
```
