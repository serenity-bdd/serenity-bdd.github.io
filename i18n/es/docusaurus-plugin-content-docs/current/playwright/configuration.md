---
id: playwright_configuration
title: Configuracion
sidebar_position: 5
---

# Opciones de configuracion

Serenity Playwright puede configurarse a traves de varios medios para personalizar el comportamiento del navegador, la captura de pantallas y los reportes.

## Configuracion de Serenity

### serenity.conf

Crea un archivo `serenity.conf` en `src/test/resources`:

```hocon
serenity {
  # Nombre del proyecto mostrado en reportes
  project.name = "My Playwright Tests"

  # Estrategia de captura de pantallas
  # Opciones: FOR_EACH_ACTION, BEFORE_AND_AFTER_EACH_STEP, FOR_FAILURES, DISABLED
  take.screenshots = FOR_EACH_ACTION

  # Directorio de salida para reportes
  outputDirectory = target/site/serenity

  # Titulo del reporte
  report.title = "Test Results"
}

# Configuraciones especificas por entorno
environments {
  default {
    base.url = "https://www.example.com"
  }
  staging {
    base.url = "https://staging.example.com"
  }
  production {
    base.url = "https://www.example.com"
  }
}
```

### Estrategias de captura de pantallas

| Estrategia | Descripcion |
|----------|-------------|
| `FOR_EACH_ACTION` | Captura despues de cada paso (por defecto) |
| `BEFORE_AND_AFTER_EACH_STEP` | Captura antes y despues de cada paso |
| `FOR_FAILURES` | Captura solo cuando un paso falla |
| `DISABLED` | Sin capturas automaticas |

### Uso de propiedades de entorno

Accede a la configuracion especifica del entorno en tus pruebas:

```java
import net.thucydides.model.environment.SystemEnvironmentVariables;

public class ConfiguredSteps {
    private final String baseUrl;

    public ConfiguredSteps() {
        EnvironmentVariables env = SystemEnvironmentVariables.currentEnvironmentVariables();
        this.baseUrl = env.getProperty("environments.default.base.url");
    }

    @Step("Open the application")
    public void openApplication(Page page) {
        page.navigate(baseUrl);
    }
}
```

Ejecuta con un entorno especifico:

```bash
mvn verify -Denvironment=staging
```

## Configuracion de Playwright

### Opciones de navegador

Configura las opciones de lanzamiento del navegador en la configuracion de tu prueba:

```java
@BeforeAll
static void setupBrowser() {
    playwright = Playwright.create();

    BrowserType.LaunchOptions options = new BrowserType.LaunchOptions()
        .setHeadless(true)           // Ejecutar sin interfaz grafica
        .setSlowMo(100)              // Ralentizar acciones en 100ms
        .setTimeout(30000)           // Tiempo de espera para lanzar navegador
        .setDevtools(false);         // No abrir DevTools

    browser = playwright.chromium().launch(options);
}
```

### Modo headless vs con interfaz grafica

Controla el modo headless via propiedad del sistema:

```java
@BeforeAll
static void setupBrowser() {
    boolean headless = Boolean.parseBoolean(
        System.getProperty("playwright.headless", "true")
    );

    browser = playwright.chromium().launch(
        new BrowserType.LaunchOptions().setHeadless(headless)
    );
}
```

Ejecuta con navegador visible:

```bash
mvn verify -Dplaywright.headless=false
```

### Opciones de contexto de navegador

Configura el contexto de navegador para cada prueba:

```java
@BeforeEach
void setupPage() {
    Browser.NewContextOptions contextOptions = new Browser.NewContextOptions()
        .setViewportSize(1920, 1080)        // Tamano de ventana del navegador
        .setLocale("en-US")                  // Idioma
        .setTimezoneId("America/New_York")   // Zona horaria
        .setGeolocation(40.7128, -74.0060)   // Geolocalizacion
        .setPermissions(Arrays.asList("geolocation")); // Permisos

    BrowserContext context = browser.newContext(contextOptions);
    page = context.newPage();
    PlaywrightSerenity.registerPage(page);
}
```

### Emulacion de dispositivos

Prueba en dispositivos moviles:

```java
@BeforeEach
void setupMobilePage() {
    // Usa los descriptores de dispositivos de Playwright
    BrowserContext context = browser.newContext(
        new Browser.NewContextOptions()
            .setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)...")
            .setViewportSize(375, 812)
            .setDeviceScaleFactor(3)
            .setIsMobile(true)
            .setHasTouch(true)
    );

    page = context.newPage();
    PlaywrightSerenity.registerPage(page);
}
```

### Configuracion de red

#### Intercepcion de peticiones

```java
@BeforeEach
void setupWithMocking() {
    page = browser.newPage();

    // Simular respuestas de API
    page.route("**/api/products", route -> {
        route.fulfill(new Route.FulfillOptions()
            .setStatus(200)
            .setContentType("application/json")
            .setBody("[{\"id\": 1, \"name\": \"Test Product\"}]")
        );
    });

    PlaywrightSerenity.registerPage(page);
}
```

#### Configuracion de tiempos de espera

```java
// Tiempo de espera global para todas las acciones
page.setDefaultTimeout(30000);  // 30 segundos

// Tiempo de espera para navegacion
page.setDefaultNavigationTimeout(60000);  // 60 segundos

// Tiempo de espera por accion
page.locator("#slow-element").click(
    new Locator.ClickOptions().setTimeout(10000)
);
```

## Pruebas en multiples navegadores

### Ejecucion en diferentes navegadores

```java
@ParameterizedTest
@ValueSource(strings = {"chromium", "firefox", "webkit"})
void shouldWorkOnAllBrowsers(String browserType) {
    Browser browser = switch (browserType) {
        case "chromium" -> playwright.chromium().launch();
        case "firefox" -> playwright.firefox().launch();
        case "webkit" -> playwright.webkit().launch();
        default -> throw new IllegalArgumentException("Unknown browser: " + browserType);
    };

    Page page = browser.newPage();
    PlaywrightSerenity.registerPage(page);

    // Ejecutar prueba...

    PlaywrightSerenity.unregisterPage(page);
    page.close();
    browser.close();
}
```

### Seleccion de navegador via propiedad

```java
@BeforeAll
static void setupBrowser() {
    String browserName = System.getProperty("browser", "chromium");

    browser = switch (browserName.toLowerCase()) {
        case "firefox" -> playwright.firefox().launch(launchOptions);
        case "webkit" -> playwright.webkit().launch(launchOptions);
        default -> playwright.chromium().launch(launchOptions);
    };
}
```

Ejecuta con un navegador especifico:

```bash
mvn verify -Dbrowser=firefox
```

## Ejecucion en paralelo

### Configuracion de JUnit 5 para ejecucion en paralelo

Crea `junit-platform.properties` en `src/test/resources`:

```properties
junit.jupiter.execution.parallel.enabled = true
junit.jupiter.execution.parallel.mode.default = concurrent
junit.jupiter.execution.parallel.mode.classes.default = concurrent
junit.jupiter.execution.parallel.config.strategy = fixed
junit.jupiter.execution.parallel.config.fixed.parallelism = 4
```

### Gestion de navegador thread-safe

Para pruebas en paralelo, cada prueba necesita su propio contexto de navegador:

```java
@ExtendWith(SerenityJUnit5Extension.class)
class ParallelTest {

    // Usa ThreadLocal para seguridad entre hilos
    private static final ThreadLocal<Playwright> playwrightHolder = new ThreadLocal<>();
    private static final ThreadLocal<Browser> browserHolder = new ThreadLocal<>();

    private Page page;

    @BeforeEach
    void setup() {
        if (playwrightHolder.get() == null) {
            playwrightHolder.set(Playwright.create());
            browserHolder.set(playwrightHolder.get().chromium().launch());
        }

        page = browserHolder.get().newPage();
        PlaywrightSerenity.registerPage(page);
    }

    @AfterEach
    void cleanup() {
        PlaywrightSerenity.unregisterPage(page);
        if (page != null) page.close();
    }

    @AfterAll
    static void teardown() {
        // La limpieza ocurre por hilo
    }
}
```

## Configuracion de logs

### Configuracion de Logback

Crea `logback-test.xml` en `src/test/resources`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- Logging de Serenity -->
    <logger name="net.serenitybdd" level="INFO"/>
    <logger name="net.thucydides" level="INFO"/>

    <!-- Logging de Playwright -->
    <logger name="com.microsoft.playwright" level="WARN"/>

    <!-- Logging de tus pruebas -->
    <logger name="com.example.tests" level="DEBUG"/>

    <root level="INFO">
        <appender-ref ref="STDOUT"/>
    </root>
</configuration>
```

### Logging de depuracion

Habilita logging detallado para diagnostico:

```bash
mvn verify -Dlogback.configurationFile=logback-debug.xml
```

Con `logback-debug.xml`:

```xml
<logger name="net.serenitybdd" level="DEBUG"/>
<logger name="com.microsoft.playwright" level="DEBUG"/>
```
