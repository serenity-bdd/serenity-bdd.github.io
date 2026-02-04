---
id: cucumber-junit5
title: Cucumber con JUnit 5
sidebar_position: 1
---

# Ejecutando Escenarios Cucumber con Serenity BDD y JUnit 5

Serenity BDD proporciona una integración perfecta con Cucumber, permitiéndote escribir especificaciones ejecutables en Gherkin y ejecutarlas usando JUnit 5. Esta guía cubre todo lo que necesitas saber para usar Cucumber con Serenity BDD y JUnit 5 de manera efectiva.

## Descripción General

Cucumber es una herramienta popular de BDD (Desarrollo Guiado por Comportamiento) que te permite escribir escenarios de prueba en lenguaje natural usando la sintaxis Gherkin. Cuando se combina con Serenity BDD y JUnit 5, obtienes:

- **Documentación Viva**: Serenity genera reportes narrativos detallados a partir de tus escenarios Cucumber
- **Ejecución de Pruebas Moderna**: La potente plataforma de JUnit 5 para ejecutar pruebas
- **Ejecución Paralela**: Ejecuta escenarios en paralelo para una ejecución más rápida
- **Reportes Detallados**: Reportes de prueba detallados con capturas de pantalla, trazas de error y más

## Prerrequisitos

Antes de comenzar, asegúrate de tener:
- Java 17 o superior
- Maven o Gradle
- Un IDE con soporte para Java (IntelliJ IDEA, Eclipse, VS Code, etc.)

## Configuración de Dependencias

### Dependencias Maven

Agrega las siguientes dependencias a tu `pom.xml`:

```xml
<properties>
    <serenity.version>5.2.2</serenity.version>
    <cucumber.version>7.33.0</cucumber.version>
    <junit.version>6.0.1</junit.version>
</properties>

<dependencies>
    <!-- Integración Serenity Cucumber -->
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

Para Gradle, agrega a tu `build.gradle`:

```groovy
dependencies {
    testImplementation "net.serenity-bdd:serenity-cucumber:5.2.2"
    testImplementation "io.cucumber:cucumber-junit-platform-engine:7.33.0"
    testImplementation "org.junit.platform:junit-platform-suite:6.0.1"
}
```

## Creando un Test Runner Básico

La forma más simple de ejecutar escenarios Cucumber con JUnit 5 es crear una clase de suite de pruebas:

```java
import org.junit.platform.suite.api.*;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
class CucumberTestSuite {
}
```

Esta configuración mínima:
- `@Suite` - Marca esto como una Suite de JUnit Platform
- `@IncludeEngines("cucumber")` - Indica a JUnit que use el motor de Cucumber
- `@SelectClasspathResource("features")` - Apunta al directorio que contiene tus archivos Feature

## Configurando el Reporter de Serenity

:::warning Cambio Importante en Serenity 5.0.0
La ruta del plugin de Serenity Cucumber cambió en la versión 5.0.0 de `io.cucumber.core.plugin.*` a `net.serenitybdd.cucumber.core.plugin.*`
:::

Para generar reportes de Serenity, debes configurar el plugin reporter de Serenity. Agrega esto a tu suite de pruebas:

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

El plugin `SerenityReporterParallel` es seguro para hilos y se recomienda para todos los escenarios, incluso si no estás ejecutando pruebas en paralelo.

## Opciones de Configuración

### Usando Anotaciones @ConfigurationParameter

Puedes configurar varias opciones de Cucumber usando anotaciones `@ConfigurationParameter`. Aquí están las más comúnmente usadas:

#### Especificando Paquetes de Step Definition

```java
import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;

@ConfigurationParameter(
    key = GLUE_PROPERTY_NAME,
    value = "com.example.stepdefinitions"
)
```

#### Filtrando por Etiquetas

```java
import static io.cucumber.junit.platform.engine.Constants.FILTER_TAGS_PROPERTY_NAME;

@ConfigurationParameter(
    key = FILTER_TAGS_PROPERTY_NAME,
    value = "@smoke and not @wip"
)
```

#### Especificando Rutas de Feature

```java
import static io.cucumber.junit.platform.engine.Constants.FEATURES_PROPERTY_NAME;

@ConfigurationParameter(
    key = FEATURES_PROPERTY_NAME,
    value = "src/test/resources/features"
)
```

#### Ejemplo Completo

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

Alternativamente, puedes configurar las opciones de Cucumber en un archivo `junit-platform.properties` ubicado en `src/test/resources`:

```properties
# Habilitar Cucumber
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel
cucumber.glue=com.example.stepdefinitions
cucumber.filter.tags=@smoke
cucumber.features=src/test/resources/features

# Orden de ejecución de escenarios
cucumber.execution.order=random

# Salida del plugin
cucumber.plugin=pretty,html:target/cucumber-reports/cucumber.html
```

:::tip Cuándo Usar Cada Enfoque
- Usa `@ConfigurationParameter` para configuración **específica de suite** (ej., diferentes suites de prueba para smoke, regresión, etc.)
- Usa `junit-platform.properties` para configuración **predeterminada del proyecto**
- Las anotaciones sobrescriben la configuración del archivo de propiedades
:::

## Organizando Archivos Feature

### Estructura de Directorios

Serenity espera archivos Feature en `src/test/resources/features` por defecto. Organízalos jerárquicamente por área de funcionalidad:

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

Esta jerarquía se reflejará en tus reportes de Serenity, creando una estructura clara de requisitos.

### Ejemplo de Archivo Feature

```gherkin
@shopping @checkout
Feature: Proceso de Checkout
  Como cliente
  Quiero completar mi compra
  Para poder recibir mis artículos

  Background:
    Given I have items in my cart

  @happy-path @smoke
  Scenario: Checkout exitoso con tarjeta de crédito
    When I proceed to checkout
    And I enter valid shipping information
    And I pay with a valid credit card
    Then I should see an order confirmation
    And I should receive a confirmation email

  @edge-case
  Scenario: Checkout con tarjeta de crédito inválida
    When I proceed to checkout
    And I enter valid shipping information
    And I pay with an invalid credit card
    Then I should see a payment error message
    And my order should not be placed
```

## Escribiendo Step Definition

Los Step Definition conectan tus escenarios Gherkin con código Java:

```java
package com.example.stepdefinitions;

import io.cucumber.java.en.*;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.actors.OnStage;

public class CheckoutStepDefinitions {

    @Given("{actor} has items in the cart")
    public void hasItemsInCart(Actor actor) {
        actor.attemptsTo(
            // Tu implementación aquí
        );
    }

    @When("{actor} proceeds to checkout")
    public void proceedsToCheckout(Actor actor) {
        actor.attemptsTo(
            // Tu implementación aquí
        );
    }

    @Then("{actor} should see an order confirmation")
    public void shouldSeeOrderConfirmation(Actor actor) {
        actor.should(
            // Tus aserciones aquí
        );
    }
}
```

### Mejores Prácticas para Step Definition

1. **Mantén los pasos reutilizables** - Escribe pasos genéricos que puedan usarse en múltiples escenarios
2. **Usa el Screenplay Pattern** - Para mejor mantenibilidad y legibilidad
3. **Evita la interdependencia de pasos** - Cada paso debe ser independiente
4. **Usa parámetros** - Haz los pasos flexibles con expresiones Cucumber

## Filtrando Escenarios con Etiquetas

### Expresiones de Etiquetas

Cucumber soporta expresiones de etiquetas potentes para filtrar escenarios:

```bash
# Ejecutar escenarios con etiqueta @smoke
mvn clean verify -Dcucumber.filter.tags="@smoke"

# Ejecutar escenarios con ambas etiquetas
mvn clean verify -Dcucumber.filter.tags="@smoke and @regression"

# Ejecutar escenarios con cualquiera de las etiquetas
mvn clean verify -Dcucumber.filter.tags="@smoke or @regression"

# Excluir escenarios
mvn clean verify -Dcucumber.filter.tags="not @wip"

# Expresiones complejas
mvn clean verify -Dcucumber.filter.tags="(@smoke or @regression) and not @slow"
```

### En Código

```java
@ConfigurationParameter(
    key = FILTER_TAGS_PROPERTY_NAME,
    value = "(@smoke or @regression) and not @wip"
)
```

### En Archivo de Propiedades

```properties
cucumber.filter.tags=(@smoke or @regression) and not @wip
```

## Ejecutando Escenarios en Paralelo

Consulta la guía dedicada de [Ejecución Paralela](parallel-execution) para información detallada sobre cómo ejecutar escenarios Cucumber en paralelo.

Ejemplo rápido:

**junit-platform.properties:**
```properties
cucumber.execution.parallel.enabled=true
cucumber.execution.parallel.config.strategy=dynamic
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel
```

## Hooks de Cucumber

Los hooks de Cucumber te permiten ejecutar código antes o después de los escenarios:

```java
package com.example.hooks;

import io.cucumber.java.*;

public class CucumberHooks {

    @Before
    public void beforeScenario(Scenario scenario) {
        System.out.println("Iniciando escenario: " + scenario.getName());
    }

    @After
    public void afterScenario(Scenario scenario) {
        System.out.println("Escenario finalizado: " + scenario.getName());
        if (scenario.isFailed()) {
            // Manejar fallo
        }
    }

    @BeforeStep
    public void beforeStep() {
        // Se ejecuta antes de cada paso
    }

    @AfterStep
    public void afterStep() {
        // Se ejecuta después de cada paso
    }
}
```

### Hooks con Etiquetas

Ejecuta hooks solo para etiquetas específicas:

```java
@Before("@database")
public void setupDatabase() {
    // Solo se ejecuta para escenarios etiquetados con @database
}

@After("@cleanup")
public void cleanup() {
    // Solo se ejecuta para escenarios etiquetados con @cleanup
}
```

### Orden de Ejecución de Hooks

Controla el orden de ejecución de hooks con el parámetro `order`:

```java
@Before(order = 1)
public void firstHook() {
    // Se ejecuta primero
}

@Before(order = 2)
public void secondHook() {
    // Se ejecuta segundo
}
```

## Tablas de Datos

Las tablas de datos de Cucumber te permiten pasar datos estructurados a los pasos:

### Archivo Feature:
```gherkin
Scenario: Crear múltiples usuarios
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
        // Crear usuario
    }
}
```

## Scenario Outline

Los Scenario Outline te permiten ejecutar el mismo escenario con diferentes datos:

```gherkin
Scenario Outline: Login con diferentes credenciales
  Given I am on the login page
  When I enter username "<username>" and password "<password>"
  Then I should see "<result>"

  Examples:
    | username | password | result              |
    | admin    | admin123 | Dashboard           |
    | user     | user123  | User Home           |
    | invalid  | wrong    | Invalid credentials |
```

## Referencia de Parámetros de Configuración

### Constantes Comunes de Cucumber

Todas disponibles desde `io.cucumber.junit.platform.engine.Constants`:

| Constante | Propósito | Ejemplo |
|----------|---------|---------|
| `PLUGIN_PROPERTY_NAME` | Configurar plugins | `"net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel"` |
| `GLUE_PROPERTY_NAME` | Paquetes de Step Definition | `"com.example.stepdefinitions"` |
| `FILTER_TAGS_PROPERTY_NAME` | Filtro de expresión de etiquetas | `"@smoke and not @wip"` |
| `FEATURES_PROPERTY_NAME` | Ubicación de archivos Feature | `"src/test/resources/features"` |
| `PLUGIN_PUBLISH_QUIET_PROPERTY_NAME` | Suprimir mensajes de publicación de Cucumber | `"true"` |
| `ANSI_COLORS_DISABLED_PROPERTY_NAME` | Deshabilitar salida con colores | `"true"` |
| `EXECUTION_DRY_RUN_PROPERTY_NAME` | Verificar Step Definition sin ejecutar | `"true"` |
| `OBJECT_FACTORY_PROPERTY_NAME` | Object factory personalizado | `"com.example.CustomObjectFactory"` |

### Propiedades de Ejecución Paralela

| Propiedad | Propósito | Ejemplo |
|----------|---------|---------|
| `cucumber.execution.parallel.enabled` | Habilitar ejecución paralela | `true` |
| `cucumber.execution.parallel.config.strategy` | Estrategia de ejecución | `dynamic`, `fixed` |
| `cucumber.execution.parallel.config.fixed.parallelism` | Número de hilos paralelos (fixed) | `4` |
| `cucumber.execution.parallel.config.dynamic.factor` | Multiplicador para procesadores disponibles | `1.0` |

## Múltiples Suites de Prueba

Puedes crear múltiples suites de prueba para diferentes propósitos:

```java
// Pruebas de humo
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(key = FILTER_TAGS_PROPERTY_NAME, value = "@smoke")
class SmokeTestSuite {}

// Pruebas de regresión
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(key = FILTER_TAGS_PROPERTY_NAME, value = "@regression")
class RegressionTestSuite {}

// Área de funcionalidad específica
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features/authentication")
class AuthenticationTestSuite {}
```

## Mejores Prácticas

### 1. Organización de Archivos Feature
- Agrupa features relacionadas en directorios
- Usa nombres de feature significativos
- Mantén los escenarios enfocados e independientes
- Usa Background para configuración común

### 2. Estrategia de Etiquetado
- Usa etiquetas consistentemente en todo el proyecto
- Etiquetas comunes: `@smoke`, `@regression`, `@wip`, `@bug`, `@slow`
- Etiqueta por área de funcionalidad: `@authentication`, `@checkout`, `@search`
- Etiqueta por tipo de prueba: `@ui`, `@api`, `@integration`

### 3. Step Definition
- Escribe pasos reutilizables
- Usa expresiones Cucumber para flexibilidad
- Mantén las implementaciones de pasos delgadas - delega a Action Class o Task de Screenplay
- Evita duplicar Step Definition

### 4. Diseño de Escenarios
- Escribe escenarios desde la perspectiva del usuario
- Usa la estructura Given-When-Then (Dado-Cuando-Entonces) consistentemente
- Mantén los escenarios enfocados en un solo comportamiento
- Usa Scenario Outline para pruebas basadas en datos

### 5. Reportes
- Siempre configura el reporter de Serenity
- Usa nombres significativos para escenarios y pasos
- Agrega etiquetas relevantes para filtrar reportes
- Revisa los reportes regularmente

## Solución de Problemas

### Problemas Comunes

**1. Las pruebas de JUnit 5 no se ejecutan junto con las pruebas de Cucumber**

Si tienes tanto pruebas de JUnit 5 como pruebas de Cucumber en tu proyecto, pero solo se descubren y ejecutan las pruebas de Cucumber, esto probablemente se debe a que la propiedad `cucumber.features` de Cucumber hace que se ignoren otros selectores de descubrimiento. Verás una advertencia como:

```
WARNING: Discovering tests using the cucumber.features property. Other discovery selectors are ignored!
```

La solución es configurar ejecuciones separadas de Maven Failsafe para pruebas de JUnit y Cucumber. Consulta [Ejecutando Pruebas de JUnit 5 y Cucumber Juntas](/docs/guide/maven#running-junit-5-and-cucumber-tests-together) para la configuración completa.

**2. "No tests found"**
- Asegúrate de que `@Suite` e `@IncludeEngines("cucumber")` estén presentes
- Verifica que los archivos Feature estén en la ubicación correcta
- Verifica que los Step Definition estén en la ruta glue

**3. "Step undefined"**
- Implementa el Step Definition faltante
- Verifica que la configuración glue apunte al paquete de tus Step Definition
- Asegúrate de que las expresiones regex coincidan

**4. "Plugin not found"**
- Verifica que estés usando la ruta correcta del plugin: `net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel`
- Verifica que las dependencias de Serenity estén incluidas

**5. "Tests not running in parallel"**
- Asegúrate de que la configuración paralela esté en `junit-platform.properties`
- Usa `SerenityReporterParallel` (no `SerenityReporter`)
- Verifica la configuración de JUnit Platform

## Siguientes Pasos

- Aprende sobre [Ejecución Paralela](parallel-execution) para ejecuciones de prueba más rápidas
- Explora la [Referencia de Configuración de Cucumber](configuration-reference) para opciones avanzadas
- Consulta el [Screenplay Pattern](/docs/screenplay/screenplay_fundamentals) para mejor mantenibilidad de pruebas
- Revisa la documentación de [Reportes de Serenity](/docs/reporting/the_serenity_reports)

## Recursos Adicionales

- [Documentación de Cucumber](https://cucumber.io/docs/cucumber/)
- [Guía de Usuario de JUnit 5](https://junit.org/junit5/docs/current/user-guide/)
- [Sitio Oficial de Serenity BDD](https://serenity-bdd.info)
- [Proyecto de Ejemplo](https://github.com/serenity-bdd/serenity-cucumber-starter)
