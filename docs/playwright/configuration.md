---
id: playwright_configuration
title: Configuration
sidebar_position: 5
---

# Configuration Options

Serenity Playwright can be configured through various means to customize browser behavior, screenshot capture, and reporting.

## Serenity Configuration

### serenity.conf

Create a `serenity.conf` file in `src/test/resources`:

```hocon
serenity {
  # Project name shown in reports
  project.name = "My Playwright Tests"

  # Screenshot capture strategy
  # Options: FOR_EACH_ACTION, BEFORE_AND_AFTER_EACH_STEP, FOR_FAILURES, DISABLED
  take.screenshots = FOR_EACH_ACTION

  # Output directory for reports
  outputDirectory = target/site/serenity

  # Report title
  report.title = "Test Results"
}

# Environment-specific settings
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

### Screenshot Strategies

| Strategy | Description |
|----------|-------------|
| `FOR_EACH_ACTION` | Screenshot after every step (default) |
| `BEFORE_AND_AFTER_EACH_STEP` | Screenshot before and after each step |
| `FOR_FAILURES` | Screenshot only when a step fails |
| `DISABLED` | No automatic screenshots |

### Using Environment Properties

Access environment-specific configuration in your tests:

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

Run with a specific environment:

```bash
mvn verify -Denvironment=staging
```

## Playwright Configuration with @UsePlaywright

The recommended way to configure Playwright is with the `@UsePlaywright` annotation and an `OptionsFactory` class. This approach lets Playwright manage the full browser lifecycle while you declaratively specify the configuration.

### OptionsFactory

Create an `OptionsFactory` implementation to configure browser options:

```java
public class ChromeHeadlessOptions implements OptionsFactory {
    @Override
    public Options getOptions() {
        return new Options()
            .setHeadless(true)
            .setLaunchOptions(
                new BrowserType.LaunchOptions()
                    .setArgs(Arrays.asList("--no-sandbox", "--disable-extensions", "--disable-gpu"))
            )
            .setTestIdAttribute("data-test");
    }
}
```

Then use it in your test class:

```java
@ExtendWith(SerenityJUnit5Extension.class)
@ExtendWith(SerenityPlaywrightExtension.class)
@UsePlaywright(ChromeHeadlessOptions.class)
class MyTest {
    // Page is injected automatically
    @Test
    void myTest(Page page) { ... }
}
```

### Available Options

The `Options` class provides a fluent API for all Playwright configuration:

| Option | Type | Description |
|--------|------|-------------|
| `headless` | `Boolean` | Whether to run the browser in headless mode |
| `browserName` | `String` | `"chromium"`, `"firefox"`, or `"webkit"` |
| `channel` | `String` | Browser channel (e.g. `"chrome"`, `"msedge"`) |
| `baseUrl` | `String` | Base URL for `page.navigate()` with relative paths |
| `deviceName` | `String` | Device emulation name (e.g. `"iPhone 13"`) |
| `testIdAttribute` | `String` | Custom test ID attribute (default: `"data-testid"`) |
| `ignoreHTTPSErrors` | `Boolean` | Whether to ignore HTTPS errors |
| `launchOptions` | `BrowserType.LaunchOptions` | Full launch options (args, timeout, slowMo, etc.) |
| `contextOptions` | `Browser.NewContextOptions` | Context options (viewport, locale, geolocation, etc.) |
| `trace` | `Options.Trace` | Tracing: `OFF`, `ON`, or `RETAIN_ON_FAILURE` |
| `outputDir` | `Path` | Directory for test artifacts |

### Common OptionsFactory Examples

#### Chrome with Custom Viewport

```java
public class ChromeDesktopOptions implements OptionsFactory {
    @Override
    public Options getOptions() {
        return new Options()
            .setHeadless(true)
            .setChannel("chrome")
            .setContextOptions(
                new Browser.NewContextOptions()
                    .setViewportSize(1920, 1080)
                    .setLocale("en-US")
                    .setTimezoneId("America/New_York")
            );
    }
}
```

#### Firefox

```java
public class FirefoxOptions implements OptionsFactory {
    @Override
    public Options getOptions() {
        return new Options()
            .setBrowserName("firefox")
            .setHeadless(true);
    }
}
```

#### Mobile Device Emulation

```java
public class MobileOptions implements OptionsFactory {
    @Override
    public Options getOptions() {
        return new Options()
            .setDeviceName("iPhone 13")
            .setHeadless(true);
    }
}
```

#### With Tracing Enabled

```java
public class TracingOptions implements OptionsFactory {
    @Override
    public Options getOptions() {
        return new Options()
            .setHeadless(true)
            .setTrace(Options.Trace.RETAIN_ON_FAILURE);
    }
}
```

### Lifecycle with @UsePlaywright

When using `@UsePlaywright`, Playwright manages the following lifecycle automatically:

| Resource | Scope | Details |
|----------|-------|---------|
| `Playwright` | Per thread | Created once, shared across tests in the same thread |
| `Browser` | Per test class | Created once per class, closed after all tests in the class |
| `BrowserContext` | Per test method | Fresh context for each test, providing isolation |
| `Page` | Per test method | Fresh page for each test |

The `Page`, `BrowserContext`, `Browser`, and `Playwright` objects can all be injected as method parameters in `@BeforeEach` and `@Test` methods.

## Manual Playwright Configuration

If you need full control over the browser lifecycle (e.g. for custom context management or multi-tab testing), you can manage Playwright directly.

### Browser Options

Configure browser launch options in your test setup:

```java
@BeforeAll
static void setupBrowser() {
    playwright = Playwright.create();

    BrowserType.LaunchOptions options = new BrowserType.LaunchOptions()
        .setHeadless(true)           // Run headless
        .setSlowMo(100)              // Slow down actions by 100ms
        .setTimeout(30000)           // Browser launch timeout
        .setDevtools(false);         // Don't open DevTools

    browser = playwright.chromium().launch(options);
}
```

### Headless vs Headed Mode

Control headless mode via system property:

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

Run with visible browser:

```bash
mvn verify -Dplaywright.headless=false
```

### Browser Context Options

Configure browser context for each test:

```java
@BeforeEach
void setupPage() {
    Browser.NewContextOptions contextOptions = new Browser.NewContextOptions()
        .setViewportSize(1920, 1080)        // Browser window size
        .setLocale("en-US")                  // Locale
        .setTimezoneId("America/New_York")   // Timezone
        .setGeolocation(40.7128, -74.0060)   // Geolocation
        .setPermissions(Arrays.asList("geolocation")); // Permissions

    BrowserContext context = browser.newContext(contextOptions);
    page = context.newPage();
    PlaywrightSerenity.registerPage(page);
}
```

### Device Emulation

Test on mobile devices:

```java
@BeforeEach
void setupMobilePage() {
    // Use Playwright's device descriptors
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

### Network Configuration

#### Request Interception

```java
@BeforeEach
void setupWithMocking() {
    page = browser.newPage();

    // Mock API responses
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

#### Timeout Configuration

```java
// Global timeout for all actions
page.setDefaultTimeout(30000);  // 30 seconds

// Timeout for navigation
page.setDefaultNavigationTimeout(60000);  // 60 seconds

// Per-action timeout
page.locator("#slow-element").click(
    new Locator.ClickOptions().setTimeout(10000)
);
```

## Multi-Browser Testing

### Running on Different Browsers

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

    // Run test...

    PlaywrightSerenity.unregisterPage(page);
    page.close();
    browser.close();
}
```

### Browser Selection via Property

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

Run with specific browser:

```bash
mvn verify -Dbrowser=firefox
```

## Parallel Execution

### JUnit 5 Parallel Configuration

Create `junit-platform.properties` in `src/test/resources`:

```properties
junit.jupiter.execution.parallel.enabled = true
junit.jupiter.execution.parallel.mode.default = concurrent
junit.jupiter.execution.parallel.mode.classes.default = concurrent
junit.jupiter.execution.parallel.config.strategy = fixed
junit.jupiter.execution.parallel.config.fixed.parallelism = 4
```

### Thread-Safe Browser Management

When using `@UsePlaywright`, parallel execution is handled automatically — Playwright stores all resources in `ThreadLocal` variables, so each thread gets its own isolated Playwright, Browser, BrowserContext, and Page:

```java
@ExtendWith(SerenityJUnit5Extension.class)
@ExtendWith(SerenityPlaywrightExtension.class)
@UsePlaywright(ChromeHeadlessOptions.class)
class ParallelTest {

    @Steps MySteps steps;

    @Test
    void testOne(Page page) {
        // Each test gets its own isolated BrowserContext and Page
        steps.doSomething(page);
    }

    @Test
    void testTwo(Page page) {
        // Safe to run in parallel - no shared state
        steps.doSomethingElse(page);
    }
}
```

If managing the lifecycle manually, use `ThreadLocal` for thread safety:

```java
@ExtendWith(SerenityJUnit5Extension.class)
class ParallelTest {

    // Use ThreadLocal for thread safety
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
        // Cleanup happens per thread
    }
}
```

## Logging Configuration

### Logback Configuration

Create `logback-test.xml` in `src/test/resources`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- Serenity logging -->
    <logger name="net.serenitybdd" level="INFO"/>
    <logger name="net.thucydides" level="INFO"/>

    <!-- Playwright logging -->
    <logger name="com.microsoft.playwright" level="WARN"/>

    <!-- Your test logging -->
    <logger name="com.example.tests" level="DEBUG"/>

    <root level="INFO">
        <appender-ref ref="STDOUT"/>
    </root>
</configuration>
```

### Debug Logging

Enable verbose logging for troubleshooting:

```bash
mvn verify -Dlogback.configurationFile=logback-debug.xml
```

With `logback-debug.xml`:

```xml
<logger name="net.serenitybdd" level="DEBUG"/>
<logger name="com.microsoft.playwright" level="DEBUG"/>
```
