# Ejecutar escenarios de Cucumber con Serenity

:::tip Guía completa de Cucumber disponible
Para una guía completa y detallada sobre cómo usar Cucumber con Serenity BDD y JUnit 5, incluyendo opciones de configuración, mejores prácticas y solución de problemas, consulta la sección dedicada [Cucumber con JUnit 5](/docs/cucumber/cucumber-junit5).
:::

Para ejecutar escenarios de Cucumber con Serenity, necesitas crear una clase de test runner de JUnit 5 como esta:

```java
   import org.junit.platform.suite.api.IncludeEngines;
   import org.junit.platform.suite.api.SelectClasspathResource;
   import org.junit.platform.suite.api.Suite;

   @Suite
   @IncludeEngines("cucumber")
   @SelectClasspathResource("/features")
   public class CucumberTestSuite {}
```

Ten en cuenta que necesitas especificar al menos el atributo `features`, para definir el directorio que contiene tus archivos de Feature.

# Jerarquías de Feature

Serenity espera encontrar archivos de Feature en la carpeta `src/test/resources/features` por defecto. Puedes organizar tus archivos de Feature en una jerarquía de carpetas debajo de esta, como se muestra aquí:

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

La estructura de directorios se usará para construir la jerarquía de requisitos de Serenity, como la que se muestra aquí:

![](img/cucumber-requirements-hierarchy.png)


# Filtrar la ejecución de pruebas en Cucumber

La forma más sencilla de controlar qué escenarios quieres ejecutar es usar etiquetas y la opción de línea de comandos `cucumber.filter.tags`. Por ejemplo, para ejecutar solo escenarios o Feature anotados con `@smoke`, ejecutarías el siguiente comando:
```
mvn clean verify -Dcucumber.filter.tags="@smoke"
```

Puedes usar [Expresiones de Etiquetas de Cucumber](https://cucumber.io/docs/cucumber/api/#tag-expressions) para determinar qué escenarios ejecutar. Por ejemplo, para ejecutar solo Feature con las etiquetas `@authentication` y `@smoke`, ejecutarías lo siguiente:
```
 mvn clean verify -Dcucumber.filter.tags="@authentication and @smoke"
 ```

Para ejecutar escenarios con la etiqueta `@cart` o `@catalog`, podrías ejecutar lo siguiente:
```
 mvn clean verify -Dcucumber.filter.tags="@cart or @catalog"
 ```
# Ejecutar escenarios de Cucumber con Serenity en paralelo

A partir de la versión 3.6.0, es posible ejecutar los escenarios de Cucumber en paralelo.

Los siguientes pasos son necesarios para activar la ejecución en paralelo:

1. Añade las siguientes dependencias en el pom.xml de tu aplicación:
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
2. Crea un archivo llamado `junit-platform.properties` en `test/resources`
```
cucumber.execution.parallel.enabled=true
cucumber.execution.parallel.config.strategy=fixed
cucumber.execution.parallel.config.fixed.parallelism=4
cucumber.execution.parallel.config.fixed.max-pool-size=4
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel
```

:::note Cambio importante en Serenity 5.0.0
La ruta del plugin de Cucumber cambió de `io.cucumber.core.plugin.*` a `net.serenitybdd.cucumber.core.plugin.*` en Serenity 5.0.0. Asegúrate de actualizar tus archivos de configuración.
:::
Puedes encontrar más información sobre el significado de las propiedades en la [Documentación de Cucumber JUnit Platform Engine](https://github.com/cucumber/cucumber-jvm/tree/main/cucumber-junit-platform-engine)

3. Configura la ubicación del classpath de los escenarios a ejecutar en una clase Java ubicada en un paquete dentro de `test/java`
```java
   import org.junit.platform.suite.api.IncludeEngines;
   import org.junit.platform.suite.api.SelectClasspathResource;
   import org.junit.platform.suite.api.Suite;

   @Suite
   @IncludeEngines("cucumber")
   @SelectClasspathResource("/features")
   public class CucumberTestSuite {}
```
