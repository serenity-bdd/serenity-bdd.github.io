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

## Playwright Configuration

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

For parallel tests, each test needs its own browser context:

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
