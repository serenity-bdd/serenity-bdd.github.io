---
id: parallel-execution
title: Ejecutando Pruebas Cucumber en Paralelo
sidebar_position: 2
---

# Ejecutando Escenarios Cucumber en Paralelo

Ejecutar escenarios Cucumber en paralelo puede reducir drásticamente el tiempo de ejecución de las pruebas. Esta guía explica cómo configurar y optimizar la ejecución paralela con Serenity BDD y JUnit 5.

## Descripción General

La ejecución paralela en Cucumber con JUnit 5 está impulsada por el Cucumber JUnit Platform Engine, que se integra con las capacidades de ejecución de pruebas paralelas de JUnit 5. Cuando se configura correctamente, múltiples escenarios pueden ejecutarse simultáneamente, aprovechando los procesadores de múltiples núcleos.

## Prerrequisitos

- Serenity BDD 3.6.0 o superior
- JUnit 5
- Cucumber JUnit Platform Engine
- Código de prueba seguro para hilos

## Configuración Básica

### Paso 1: Agregar Dependencias Requeridas

Asegúrate de tener la dependencia del Cucumber JUnit Platform Engine:

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

### Paso 2: Usar el Reporter Paralelo

:::warning Importante
**Debes** usar `SerenityReporterParallel` para la ejecución paralela, no `SerenityReporter`.
:::

Actualiza tu suite de pruebas para usar el reporter seguro para paralelo:

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

### Paso 3: Configurar la Ejecución Paralela

Crea o actualiza `junit-platform.properties` en `src/test/resources`:

```properties
# Habilitar ejecución paralela
cucumber.execution.parallel.enabled=true

# Usar estrategia dinámica (recomendado)
cucumber.execution.parallel.config.strategy=dynamic

# Configurar el reporter de Serenity
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel
```

## Estrategias de Ejecución

### Estrategia Dinámica (Recomendada)

La estrategia dinámica determina automáticamente el número de hilos basándose en los procesadores disponibles:

```properties
cucumber.execution.parallel.config.strategy=dynamic
cucumber.execution.parallel.config.dynamic.factor=1.0
```

El `factor` es un multiplicador para el número de procesadores disponibles:
- `1.0` = mismo número de hilos que procesadores (recomendado)
- `0.5` = la mitad del número de procesadores
- `2.0` = el doble del número de procesadores

**Ejemplo:** En una máquina con 8 núcleos:
- Factor `1.0` = 8 hilos
- Factor `0.5` = 4 hilos
- Factor `2.0` = 16 hilos

### Estrategia Fija

La estrategia fija usa un número especificado de hilos:

```properties
cucumber.execution.parallel.config.strategy=fixed
cucumber.execution.parallel.config.fixed.parallelism=4
cucumber.execution.parallel.config.fixed.max-pool-size=4
```

- `parallelism` - Número de hilos concurrentes
- `max-pool-size` - Tamaño máximo del pool de hilos

**Usar cuando:**
- Necesitas conteos de hilos consistentes y predecibles
- Ejecutas en infraestructura CI/CD compartida
- Depuras problemas de ejecución paralela

### Estrategia Personalizada

Para casos de uso avanzados, puedes implementar una estrategia personalizada:

```properties
cucumber.execution.parallel.config.strategy=custom
cucumber.execution.parallel.config.custom.class=com.example.MyParallelStrategy
```

## Ejemplo de Configuración Completa

**junit-platform.properties:**
```properties
# Ejecución paralela
cucumber.execution.parallel.enabled=true
cucumber.execution.parallel.config.strategy=dynamic
cucumber.execution.parallel.config.dynamic.factor=1.0

# Reporter de Serenity
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel

# Opcional: Controlar orden de ejecución
cucumber.execution.order=random

# Opcional: Fallar rápido
cucumber.execution.fail-fast=false
```

## Consideraciones de Seguridad de Hilos

### Gestión de WebDriver

El WebDriver `@Managed` de Serenity es automáticamente seguro para hilos cuando se usa ejecución paralela:

```java
@ExtendWith(SerenityJUnit5Extension.class)
class WebDriverSteps {

    @Managed
    WebDriver driver;  // Seguro para hilos - cada hilo obtiene su propia instancia

    @Given("I am on the home page")
    public void navigateToHomePage() {
        driver.get("https://example.com");
    }
}
```

Cada hilo tendrá su propia instancia de WebDriver aislada.

### Seguridad de Hilos en Step Definition

Las clases de Step Definition deben ser seguras para hilos:

**Seguro para Hilos (Recomendado):**
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

**NO Seguro para Hilos:**
```java
public class LoginSteps {

    private String username;  // Estado compartido - NO seguro para hilos!

    @Given("user enters username {string}")
    public void enterUsername(String user) {
        this.username = user;  // Condición de carrera!
    }
}
```

### Usando Contexto de Escenario

Para compartir datos dentro de un escenario, usa el contexto de escenario de Cucumber:

```java
public class CheckoutSteps {

    private final ScenarioContext context;

    public CheckoutSteps(ScenarioContext context) {
        this.context = context;  // Inyectado por escenario
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

## Controlando el Paralelismo

### Paralelo en Diferentes Niveles

Puedes controlar qué se ejecuta en paralelo:

#### Paralelismo a Nivel de Escenario (Por Defecto)
```properties
# Cada escenario se ejecuta en su propio hilo
cucumber.execution.parallel.enabled=true
```

#### Paralelismo a Nivel de Feature
Para ejecutar Feature en paralelo pero escenarios dentro de una Feature secuencialmente, necesitas configurar JUnit Platform:

**junit-platform.properties:**
```properties
junit.jupiter.execution.parallel.enabled=true
junit.jupiter.execution.parallel.mode.default=concurrent
junit.jupiter.execution.parallel.mode.classes.default=concurrent
```

### Limitando Escenarios Concurrentes

Controla el número máximo de escenarios concurrentes:

```properties
cucumber.execution.parallel.config.strategy=fixed
cucumber.execution.parallel.config.fixed.parallelism=4
```

## Ejecución Paralela con Etiquetas

Puedes ejecutar etiquetas específicas en paralelo:

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

O excluir escenarios de la ejecución paralela:

```properties
cucumber.filter.tags=not @serial
```

## Configuración de Maven/Gradle

### Plugin Maven Surefire

Configura Maven para soportar ejecución paralela:

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

### Configuración de Gradle

Para Gradle:

```groovy
test {
    useJUnitPlatform()
    maxParallelForks = Runtime.runtime.availableProcessors()

    systemProperty 'cucumber.execution.parallel.enabled', 'true'
    systemProperty 'cucumber.execution.parallel.config.strategy', 'dynamic'
}
```

## Optimización de Rendimiento

### 1. Elegir la Estrategia Correcta

- **Suites de prueba pequeñas** (&lt;50 escenarios): Estrategia fija con 2-4 hilos
- **Suites de prueba medianas** (50-200 escenarios): Estrategia dinámica con factor 1.0
- **Suites de prueba grandes** (&gt;200 escenarios): Estrategia dinámica con factor 0.75-1.0

### 2. Optimizar el Diseño de Escenarios

- **Mantén los escenarios independientes** - Sin estado compartido entre escenarios
- **Minimiza el tiempo de configuración** - Usa hooks Before eficientes
- **Evita los sleeps** - Usa esperas explícitas en su lugar
- **Limpia los recursos** - Usa hooks After correctamente

### 3. Gestión de Recursos

```properties
# Controla el tamaño del pool de hilos para evitar agotamiento de recursos
cucumber.execution.parallel.config.fixed.max-pool-size=8

# Evita demasiados navegadores concurrentes
webdriver.pool.max=10
```

### 4. Monitorear el Uso de Recursos

Vigila:
- Utilización de CPU (debería estar cerca del 100% para rendimiento óptimo)
- Consumo de memoria (cada instancia de navegador usa RAM)
- Ancho de banda de red (para WebDriver remoto)
- Conexiones a base de datos (si aplica)

## Depurando Pruebas Paralelas

### Deshabilitar la Ejecución Paralela Temporalmente

```properties
cucumber.execution.parallel.enabled=false
```

O vía línea de comandos:
```bash
mvn clean verify -Dcucumber.execution.parallel.enabled=false
```

### Ejecutar con Menos Hilos

```properties
cucumber.execution.parallel.config.strategy=fixed
cucumber.execution.parallel.config.fixed.parallelism=1
```

### Registro Detallado

Habilita registro detallado para diagnosticar problemas:

```properties
# Ubicación del archivo de log
cucumber.plugin=pretty,html:target/cucumber-reports.html,json:target/cucumber.json

# Registro de Serenity
serenity.verbose=true
serenity.logging=VERBOSE
```

## Problemas Comunes y Soluciones

### Problema 1: Pruebas Inestables

**Síntomas:** Las pruebas pasan cuando se ejecutan individualmente pero fallan cuando se ejecutan en paralelo

**Soluciones:**
- Verifica el estado compartido en los Step Definition
- Asegúrate de que las instancias de WebDriver estén correctamente aisladas
- Revisa los datos de prueba - evita datos de prueba compartidos
- Agrega sincronización/esperas adecuadas

### Problema 2: Agotamiento de Recursos

**Síntomas:** Las pruebas se ralentizan o fallan después de un tiempo

**Soluciones:**
- Reduce el paralelismo: disminuye el conteo de hilos
- Aumenta el tamaño del heap: `-Xmx4g`
- Verifica fugas de recursos (conexiones sin cerrar, instancias de navegador)
- Monitorea los recursos del sistema

### Problema 3: Problemas de Generación de Reportes

**Síntomas:** Los reportes de Serenity están incompletos o corruptos

**Soluciones:**
- Asegúrate de estar usando `SerenityReporterParallel`
- Verifica la versión de Serenity (3.6.0+)
- Verifica que maven-failsafe-plugin esté configurado correctamente
- Verifica condiciones de carrera en el sistema de archivos

### Problema 4: Fallos en Pipeline CI/CD

**Síntomas:** Las pruebas fallan solo en CI pero pasan localmente

**Soluciones:**
- Ajusta el conteo de hilos a las capacidades del entorno CI
- Usa estrategia fija para comportamiento consistente
- Aumenta los timeouts para entornos CI más lentos
- Verifica los límites de recursos de CI

## Mejores Prácticas

### 1. Comienza Pequeño
Comienza con 2-4 hilos e incrementa gradualmente:

```properties
cucumber.execution.parallel.config.strategy=fixed
cucumber.execution.parallel.config.fixed.parallelism=2
```

### 2. Usa Etiquetas Estratégicamente

Marca escenarios que no pueden ejecutarse en paralelo:

```gherkin
@serial @database-migration
Scenario: Migrar esquema de base de datos
  # Este escenario debe ejecutarse solo
```

Luego exclúyelos:
```properties
cucumber.filter.tags=not @serial
```

### 3. Aísla los Datos de Prueba

Cada escenario debe crear y limpiar sus propios datos de prueba:

```java
@Before
public void setupTestData() {
    // Crea datos de prueba únicos para este escenario
    String uniqueId = UUID.randomUUID().toString();
    context.put("testUserId", "user_" + uniqueId);
}

@After
public void cleanupTestData() {
    // Limpia los datos de prueba de este escenario
    String userId = context.get("testUserId", String.class);
    deleteUser(userId);
}
```

### 4. Monitorea y Ajusta

- Monitorea los tiempos de ejecución de pruebas
- Rastrea las tasas de pruebas inestables
- Ajusta el paralelismo basándote en métricas
- Revisa la utilización de recursos

### 5. Documenta la Seguridad de Hilos

Agrega comentarios para escenarios no seguros para hilos:

```gherkin
# @serial - Modifica el estado global de la aplicación
@serial @admin
Scenario: Actualizar configuración de aplicación
  Given I am logged in as admin
  When I change the default language to Spanish
  Then all users should see Spanish interface
```

## Midiendo Mejoras de Rendimiento

### Antes de la Ejecución Paralela
```
Total de escenarios: 100
Tiempo de ejecución: 50 minutos
```

### Después de la Ejecución Paralela (8 hilos)
```
Total de escenarios: 100
Tiempo de ejecución: 8 minutos
Aceleración: 6.25x
Eficiencia: 78%
```

Calcula tu aceleración:
```
Aceleración = Tiempo Secuencial / Tiempo Paralelo
Eficiencia = Aceleración / Número de Hilos
```

## Siguientes Pasos

- Revisa la guía principal de [Cucumber con JUnit 5](cucumber-junit5)
- Consulta la [Referencia de Configuración](configuration-reference) para todas las opciones disponibles
- Mira las [Mejores Prácticas](cucumber-junit5#mejores-prácticas) para escribir pruebas mantenibles
- Explora la documentación de [Reportes de Serenity](/docs/reporting/the_serenity_reports)

## Recursos Adicionales

- [Documentación de Ejecución Paralela de Cucumber](https://github.com/cucumber/cucumber-jvm/tree/main/cucumber-junit-platform-engine#parallel-execution)
- [Ejecución Paralela en JUnit 5](https://junit.org/junit5/docs/current/user-guide/#writing-tests-parallel-execution)
- [Consejos de Rendimiento de Serenity BDD](https://serenity-bdd.info)
