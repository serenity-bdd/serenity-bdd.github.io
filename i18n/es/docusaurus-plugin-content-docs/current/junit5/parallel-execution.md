---
id: parallel-execution
title: Ejecutando pruebas de JUnit 5 en paralelo
sidebar_position: 2
---

# Ejecutando pruebas de Serenity con JUnit 5 en paralelo

Ejecutar pruebas de JUnit 5 en paralelo puede reducir significativamente el tiempo de ejecucion de las pruebas. Esta guia explica como configurar y optimizar la ejecucion paralela para pruebas de Serenity BDD usando JUnit 5.

## Descripcion general

JUnit 5 (Jupiter) tiene soporte integrado para la ejecucion paralela de pruebas. Cuando se combina con Serenity BDD, puedes ejecutar metodos y clases de prueba concurrentemente, aprovechando los procesadores multinucleo.

:::tip Beneficios de la ejecucion paralela
En una maquina con 8 nucleos, la ejecucion paralela puede reducir el tiempo de prueba de 30 minutos a 5-8 minutos o menos.
:::

## Prerrequisitos

- JUnit 5 (Jupiter)
- Serenity BDD 3.6.0 o superior
- Codigo de prueba seguro para hilos (thread-safe)
- Recursos de sistema suficientes (CPU, RAM)

## Configuracion basica

### Paso 1: Habilitar la ejecucion paralela

Crea o actualiza `junit-platform.properties` en `src/test/resources`:

```properties
# Habilitar ejecucion paralela
junit.jupiter.execution.parallel.enabled=true
```

### Paso 2: Configurar el modo de ejecucion

```properties
# Ejecutar clases de prueba en paralelo
junit.jupiter.execution.parallel.mode.default=concurrent

# Ejecutar clases de prueba en paralelo
junit.jupiter.execution.parallel.mode.classes.default=concurrent
```

### Paso 3: Configurar la estrategia de ejecucion

```properties
# Usar estrategia dinamica (recomendado)
junit.jupiter.execution.parallel.config.strategy=dynamic
junit.jupiter.execution.parallel.config.dynamic.factor=1.0
```

## Modos de ejecucion

### Modo concurrente

Las pruebas se ejecutan en paralelo:

```properties
junit.jupiter.execution.parallel.mode.default=concurrent
junit.jupiter.execution.parallel.mode.classes.default=concurrent
```

### Modo mismo hilo

Las pruebas se ejecutan secuencialmente:

```properties
junit.jupiter.execution.parallel.mode.default=same_thread
junit.jupiter.execution.parallel.mode.classes.default=same_thread
```

### Modo mixto

Ejecuta clases en paralelo pero los metodos dentro de una clase secuencialmente:

```properties
# Clases en paralelo
junit.jupiter.execution.parallel.mode.classes.default=concurrent

# Metodos en la misma clase se ejecutan secuencialmente
junit.jupiter.execution.parallel.mode.default=same_thread
```

## Estrategias de ejecucion

### Estrategia dinamica (Recomendada)

Determina automaticamente el numero de hilos basandose en los procesadores disponibles:

```properties
junit.jupiter.execution.parallel.config.strategy=dynamic
junit.jupiter.execution.parallel.config.dynamic.factor=1.0
```

**Calculo del factor:** `hilos = procesadores x factor`

**Ejemplos** (en una maquina de 8 nucleos):
- Factor `1.0` = 8 hilos (recomendado)
- Factor `0.5` = 4 hilos
- Factor `2.0` = 16 hilos

### Estrategia fija

Usa un numero especificado de hilos:

```properties
junit.jupiter.execution.parallel.config.strategy=fixed
junit.jupiter.execution.parallel.config.fixed.parallelism=4
```

**Usar cuando:**
- Necesitas conteos de hilos consistentes
- Ejecutas en infraestructura CI/CD compartida
- Depuras problemas de ejecucion paralela

### Estrategia personalizada

Implementa tu propia estrategia:

```properties
junit.jupiter.execution.parallel.config.strategy=custom
junit.jupiter.execution.parallel.config.custom.class=com.example.MyParallelStrategy
```

## Controlando el paralelismo a nivel de clase/metodo

### Configuracion por clase

Usa la anotacion `@Execution` para controlar el paralelismo:

```java
import org.junit.jupiter.api.parallel.Execution;
import org.junit.jupiter.api.parallel.ExecutionMode;

@ExtendWith(SerenityJUnit5Extension.class)
@Execution(ExecutionMode.CONCURRENT)  // Ejecutar los metodos de esta clase en paralelo
class FastTests {

    @Test
    void test1() { }

    @Test
    void test2() { }

    @Test
    void test3() { }
}
```

### Forzar ejecucion secuencial

```java
@ExtendWith(SerenityJUnit5Extension.class)
@Execution(ExecutionMode.SAME_THREAD)  // Ejecutar secuencialmente
class DatabaseMigrationTests {

    @Test
    void migration1() { }

    @Test
    void migration2() { }  // Debe ejecutarse despues de migration1
}
```

### Control a nivel de metodo

```java
@ExtendWith(SerenityJUnit5Extension.class)
class MixedTests {

    @Test
    @Execution(ExecutionMode.CONCURRENT)
    void canRunInParallel() { }

    @Test
    @Execution(ExecutionMode.SAME_THREAD)
    void mustRunSequentially() { }
}
```

## Bloqueos de recursos

Previene el acceso concurrente a recursos compartidos:

```java
import org.junit.jupiter.api.parallel.ResourceLock;

@ExtendWith(SerenityJUnit5Extension.class)
class SharedResourceTests {

    @Test
    @ResourceLock("database")
    void accessDatabase1() {
        // Acceso exclusivo a la base de datos
    }

    @Test
    @ResourceLock("database")
    void accessDatabase2() {
        // Esperara a que accessDatabase1 complete
    }

    @Test
    @ResourceLock(value = "database", mode = READ)
    void readFromDatabase() {
        // Acceso de solo lectura - puede ejecutarse concurrentemente con otras lecturas
    }
}
```

### Bloqueos de recursos comunes

```java
import static org.junit.jupiter.api.parallel.Resources.*;

@Test
@ResourceLock(SYSTEM_PROPERTIES)
void modifiesSystemProperties() { }

@Test
@ResourceLock(SYSTEM_OUT)
void writesToSystemOut() { }

@Test
@ResourceLock("my-custom-resource")
void accessesCustomResource() { }
```

## Seguridad de hilos con Serenity

### Gestion de WebDriver

El WebDriver `@Managed` de Serenity es automaticamente seguro para hilos:

```java
@ExtendWith(SerenityJUnit5Extension.class)
@Execution(ExecutionMode.CONCURRENT)
class WebTests {

    @Managed(driver = "chrome", options = "headless")
    WebDriver driver;  // Cada hilo obtiene su propia instancia

    @Test
    void test1() {
        driver.get("https://example.com");
        // Seguro para hilos
    }

    @Test
    void test2() {
        driver.get("https://example.com/other");
        // Instancia de WebDriver independiente
    }
}
```

### Bibliotecas de pasos

Las bibliotecas de pasos son seguras para hilos cuando se usan correctamente:

```java
@ExtendWith(SerenityJUnit5Extension.class)
@Execution(ExecutionMode.CONCURRENT)
class CheckoutTests {

    @Steps
    CartSteps cart;  // Seguro para hilos - instancia por hilo

    @Test
    void addToCart() {
        cart.addProduct("Product1");
    }

    @Test
    void removeFromCart() {
        cart.addProduct("Product2");
        cart.removeProduct("Product2");
    }
}
```

### Evitar estado mutable compartido

```java
// MAL - No es seguro para hilos
@ExtendWith(SerenityJUnit5Extension.class)
@Execution(ExecutionMode.CONCURRENT)
class BadTests {

    private String sharedData;  // Estado mutable compartido!

    @Test
    void test1() {
        sharedData = "test1";  // Condicion de carrera!
    }

    @Test
    void test2() {
        sharedData = "test2";  // Condicion de carrera!
    }
}

// BIEN - Seguro para hilos
@ExtendWith(SerenityJUnit5Extension.class)
@Execution(ExecutionMode.CONCURRENT)
class GoodTests {

    @Test
    void test1() {
        String localData = "test1";  // Variable local - segura para hilos
        // Usar localData
    }

    @Test
    void test2() {
        String localData = "test2";  // Independiente
        // Usar localData
    }
}
```

## Ejemplo de configuracion completa

### junit-platform.properties completo

```properties
# ==========================================
# Ejecucion paralela
# ==========================================
junit.jupiter.execution.parallel.enabled=true
junit.jupiter.execution.parallel.mode.default=concurrent
junit.jupiter.execution.parallel.mode.classes.default=concurrent

# ==========================================
# Estrategia de ejecucion
# ==========================================
junit.jupiter.execution.parallel.config.strategy=dynamic
junit.jupiter.execution.parallel.config.dynamic.factor=1.0

# Alternativa: Estrategia fija
# junit.jupiter.execution.parallel.config.strategy=fixed
# junit.jupiter.execution.parallel.config.fixed.parallelism=4
# junit.jupiter.execution.parallel.config.fixed.max-pool-size=8

# ==========================================
# Ciclo de vida de instancia de prueba
# ==========================================
junit.jupiter.testinstance.lifecycle.default=per_method

# ==========================================
# Descubrimiento de pruebas
# ==========================================
junit.jupiter.testclass.order.default=org.junit.jupiter.api.ClassOrderer$Random

# ==========================================
# Nombres de visualizacion
# ==========================================
junit.jupiter.displayname.generator.default=org.junit.jupiter.api.DisplayNameGenerator$ReplaceUnderscores
```

## Configuracion de Maven

### Plugin Failsafe

Configura el plugin Maven Failsafe para la ejecucion paralela:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-failsafe-plugin</artifactId>
    <version>3.0.0</version>
    <configuration>
        <!-- Habilitar JUnit 5 -->
        <includes>
            <include>**/*Test.java</include>
            <include>**/*Tests.java</include>
        </includes>

        <!-- Propiedades del sistema -->
        <systemPropertyVariables>
            <webdriver.driver>${webdriver.driver}</webdriver.driver>
            <environment>${environment}</environment>
        </systemPropertyVariables>

        <!-- Incrementar memoria para ejecucion paralela -->
        <argLine>-Xmx2g</argLine>
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
```

### Ejecutar desde la linea de comandos

```bash
# Ejecutar todas las pruebas en paralelo
mvn clean verify

# Sobrescribir paralelismo
mvn clean verify -Djunit.jupiter.execution.parallel.config.fixed.parallelism=8

# Deshabilitar ejecucion paralela
mvn clean verify -Djunit.jupiter.execution.parallel.enabled=false
```

## Configuracion de Gradle

```groovy
test {
    useJUnitPlatform()

    // Habilitar ejecucion paralela
    maxParallelForks = Runtime.runtime.availableProcessors()

    // Incrementar memoria
    minHeapSize = "512m"
    maxHeapSize = "2g"

    // Propiedades del sistema
    systemProperty 'junit.jupiter.execution.parallel.enabled', 'true'
    systemProperty 'junit.jupiter.execution.parallel.config.strategy', 'dynamic'
    systemProperty 'junit.jupiter.execution.parallel.config.dynamic.factor', '1.0'
}
```

## Optimizacion del rendimiento

### 1. Elegir la estrategia correcta

**Suites de pruebas pequenas** (&lt;30 pruebas):
```properties
junit.jupiter.execution.parallel.config.strategy=fixed
junit.jupiter.execution.parallel.config.fixed.parallelism=2
```

**Suites de pruebas medianas** (30-100 pruebas):
```properties
junit.jupiter.execution.parallel.config.strategy=dynamic
junit.jupiter.execution.parallel.config.dynamic.factor=1.0
```

**Suites de pruebas grandes** (&gt;100 pruebas):
```properties
junit.jupiter.execution.parallel.config.strategy=dynamic
junit.jupiter.execution.parallel.config.dynamic.factor=0.75
```

### 2. Monitorear el uso de recursos

```bash
# Monitorear mientras se ejecutan las pruebas
top
htop
jconsole
```

Observa:
- **CPU**: Deberia estar cerca del 100% de utilizacion
- **Memoria**: Cada instancia del navegador usa ~200-500MB de RAM
- **Hilos**: Deberian coincidir con tu configuracion de paralelismo

### 3. Optimizar el diseno de pruebas

```java
// BIEN - Pruebas rapidas y enfocadas
@Test
void shouldCalculateTotal() {
    // Sin dependencias externas, se ejecuta rapidamente
    assertThat(calculator.add(2, 3)).isEqualTo(5);
}

// LENTO - Considerar optimizacion
@Test
void shouldProcessLargeDataset() {
    // Procesa 10000 registros - considerar usar un conjunto de datos mas pequeno
}
```

### 4. Balancear el numero de hilos

Muy pocos hilos:
```properties
# Subutilizando CPU
junit.jupiter.execution.parallel.config.dynamic.factor=0.25
```

Demasiados hilos:
```properties
# Puede causar agotamiento de recursos
junit.jupiter.execution.parallel.config.dynamic.factor=4.0
```

Optimo:
```properties
# Coincide con los nucleos de CPU
junit.jupiter.execution.parallel.config.dynamic.factor=1.0
```

## Depurando pruebas paralelas

### Deshabilitar temporalmente el paralelismo

```properties
junit.jupiter.execution.parallel.enabled=false
```

O via linea de comandos:
```bash
mvn verify -Djunit.jupiter.execution.parallel.enabled=false
```

### Ejecutar una sola clase de prueba

```bash
mvn test -Dtest=MyTestClass
```

### Habilitar registro detallado

Agregar a `junit-platform.properties`:
```properties
# Mostrar que hilo ejecuta cada prueba
junit.platform.output.capture.stdout=true
junit.platform.output.capture.stderr=true
```

En tu prueba:
```java
@BeforeEach
void logThread() {
    System.out.println("Running on: " + Thread.currentThread().getName());
}
```

## Problemas comunes y soluciones

### Problema 1: Pruebas inestables (flaky)

**Sintomas:** Las pruebas pasan individualmente pero fallan en paralelo

**Soluciones:**
- Verifica si hay estado mutable compartido
- Verifica el aislamiento de datos de prueba
- Revisa los bloqueos de recursos
- Agrega sincronizacion adecuada

```java
// Problema: Estado compartido
private static int counter = 0;  // No es seguro para hilos

@Test
void incrementCounter() {
    counter++;  // Condicion de carrera
}

// Solucion: Usar tipos atomicos o variables locales
private static AtomicInteger counter = new AtomicInteger(0);  // Seguro para hilos

@Test
void incrementCounter() {
    counter.incrementAndGet();
}
```

### Problema 2: Agotamiento de recursos

**Sintomas:** Las pruebas se ralentizan o fallan despues de algun tiempo

**Soluciones:**
- Reducir el numero de hilos
- Incrementar el tamano del heap de la JVM
- Verificar fugas de recursos
- Monitorear los recursos del sistema

```xml
<!-- Incrementar tamano del heap -->
<argLine>-Xmx4g</argLine>
```

### Problema 3: Problemas con WebDriver

**Sintomas:** Las instancias del navegador se multiplican o no se cierran

**Soluciones:**
- Usar WebDriver `@Managed` (Serenity gestiona el ciclo de vida)
- Asegurar limpieza adecuada en `@AfterEach`
- Limitar las instancias concurrentes del navegador

```java
// Serenity gestiona el ciclo de vida
@Managed
WebDriver driver;

// No gestionar manualmente en pruebas paralelas
WebDriver driver = new ChromeDriver();  // Riesgo de fuga de memoria
```

### Problema 4: Bloqueos de base de datos

**Sintomas:** Las pruebas agotan el tiempo de espera esperando la base de datos

**Soluciones:**
- Usar bloqueos de recursos
- Aislar los datos de prueba
- Usar base de datos en memoria para pruebas

```java
@Test
@ResourceLock("database")
void modifiesDatabase() {
    // Acceso exclusivo a la base de datos
}
```

## Mejores practicas

### 1. Empezar pequeno

Comienza con 2-4 hilos e incrementa gradualmente:

```properties
junit.jupiter.execution.parallel.config.strategy=fixed
junit.jupiter.execution.parallel.config.fixed.parallelism=2
```

### 2. Aislar datos de prueba

```java
@ExtendWith(SerenityJUnit5Extension.class)
class UserTests {

    @Test
    void createUser() {
        String uniqueId = UUID.randomUUID().toString();
        User user = createTestUser("user_" + uniqueId);
        // Prueba con usuario unico
    }
}
```

### 3. Usar etiquetas para paralelismo selectivo

```java
@Test
@Tag("parallel")
void canRunInParallel() { }

@Test
@Tag("serial")
@Execution(ExecutionMode.SAME_THREAD)
void mustRunSequentially() { }
```

```properties
# Ejecutar solo pruebas paralelas
junit.jupiter.includeTags=parallel
```

### 4. Limpiar recursos

```java
@AfterEach
void cleanup() {
    // Limpiar datos de prueba
    testDataService.deleteTestData(testId);
}
```

### 5. Documentar la seguridad de hilos

```java
/**
 * Las pruebas en esta clase modifican el estado global de la aplicacion
 * y deben ejecutarse secuencialmente.
 */
@Execution(ExecutionMode.SAME_THREAD)
class GlobalStateTests {
    // ...
}
```

## Midiendo el rendimiento

### Antes de la ejecucion paralela
```
Total de pruebas: 150
Tiempo de ejecucion: 25 minutos
```

### Despues de la ejecucion paralela (8 hilos)
```
Total de pruebas: 150
Tiempo de ejecucion: 4 minutos
Aceleracion: 6.25x
Eficiencia: 78%
```

**Calcular metricas:**
```
Aceleracion = Tiempo secuencial / Tiempo paralelo
Eficiencia = Aceleracion / Numero de hilos x 100%
```

## Proximos pasos

- Regresa a la guia principal de [JUnit 5](junit5-tests)
- Aprende sobre [Organizacion de pruebas](junit5-tests#nombres-de-visualizacion-y-organizacion)
- Revisa las [Mejores practicas](junit5-tests#mejores-practicas)
- Explora los [Reportes de Serenity](/docs/reporting/the_serenity_reports)

## Recursos adicionales

- [Documentacion de ejecucion paralela de JUnit 5](https://junit.org/junit5/docs/current/user-guide/#writing-tests-parallel-execution)
- [Consejos de rendimiento de Serenity BDD](https://serenity-bdd.info)
- [Java Concurrency in Practice](https://jcip.net/)
