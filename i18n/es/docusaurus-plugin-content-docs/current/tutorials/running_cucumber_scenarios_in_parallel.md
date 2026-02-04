---
sidebar_position: 6
---

# Cómo ejecutar pruebas en paralelo con Cucumber y Serenity

Cucumber 7 ha introducido soporte nativo para ejecución en paralelo tanto a nivel de Feature como de Scenario. Esta ejecución paralela puede proporcionar mejoras significativas de rendimiento en las ejecuciones de pruebas. Si quieres aprovechar estas mejoras de rendimiento y ejecutar tus Feature y Scenario de Serenity BDD en paralelo, necesitarás actualizar a JUnit 5.

## Prerrequisitos

- **Cucumber 7.x**
- **Serenity BDD 3.9.8 o 4.0.x**
- **Maven 3.x** para compilar el proyecto

Ahora, comencemos con la guía detallada paso a paso.

## Paso 1: Actualizar Serenity BDD a una versión reciente

Antes de continuar, asegúrate de tener una versión reciente de Serenity BDD. Se recomiendan las versiones 3.9.8 o 4.0.x para mejores resultados.

Puedes verificar tu versión actual en tu archivo `pom.xml` o actualizarla a la última versión.

## Paso 2: Actualizar a JUnit 5 en tu proyecto Maven

JUnit 5 proporciona la base para ejecutar pruebas en paralelo con Cucumber y Serenity. Así es como puedes actualizar a JUnit 5 en tu archivo `pom.xml`:

1. Abre el archivo `pom.xml` en tu proyecto Maven.
2. Agrega las siguientes dependencias para JUnit 5 y Cucumber 7.

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
        <!-- Dependencias de JUNIT 5 -->
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

Puedes encontrar más detalles sobre JUnit 5 y Maven en la [Guía de usuario de JUnit 5](https://junit.org/junit5/docs/current/user-guide/#running-tests-build-maven).

## Paso 3: Crear un archivo `junit-platform.properties`

Crea un nuevo archivo llamado `junit-platform.properties` en tu carpeta `src/test/resources`. Este archivo habilita y configura la ejecución en paralelo.

Agrega el siguiente contenido al archivo:

```properties
cucumber.execution.parallel.enabled=true
cucumber.execution.parallel.config.strategy=dynamic
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel
```

:::note Cambio importante en Serenity 5.0.0
La ruta del plugin de Cucumber cambió de `io.cucumber.core.plugin.*` a `net.serenitybdd.cucumber.core.plugin.*` en Serenity 5.0.0. Asegúrate de usar la ruta actualizada mostrada arriba.
:::

Estas propiedades habilitan la ejecución en paralelo y la configuran para usar una estrategia dinámica, junto con el reportero de Serenity para ejecución paralela.

## Paso 4: Crear un archivo `cucumber.properties`

Crea un nuevo archivo llamado `cucumber.properties` en tu carpeta `src/test/resources`. Este archivo contendrá las opciones de Cucumber para tus pruebas de Cucumber.

Agrega el siguiente contenido al archivo:

```properties
cucumber.execution.order = random
cucumber.plugin=pretty,json:target/cucumber.json,timeline:target/test-results/timeline
cucumber.snippet-type=camelcase
```

Puedes encontrar más detalles sobre las opciones de configuración de Cucumber en la [documentación de Cucumber](https://cucumber.io/docs/cucumber/api/?lang=java#list-configuration-options).

## Paso 5: Actualizar tu clase Runner de Cucumber

Deberías tener una única clase runner para toda tu suite de pruebas. Actualízala de la siguiente manera:

```java
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("/features")
public class AcceptanceTestSuite {}
```

Esta clase runner incluirá todas las Feature en el directorio `/features` y las ejecutará usando el motor de Cucumber.

## Conclusión

Eso es todo. Siguiendo estos pasos, puedes aprovechar el poder de la ejecución en paralelo con Cucumber y Serenity BDD. Esto reducirá significativamente el tiempo de ejecución de tu suite de pruebas, llevando a retroalimentación más rápida y ciclos de desarrollo más eficientes.
