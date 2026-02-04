---
id: playwright_configuration
title: Configuração
sidebar_position: 5
---

# Opções de Configuração

O Serenity Playwright pode ser configurado de várias formas para personalizar o comportamento do navegador, captura de tela e relatórios.

## Configuração do Serenity

### serenity.conf

Crie um arquivo `serenity.conf` em `src/test/resources`:

```hocon
serenity {
  # Nome do projeto mostrado nos relatórios
  project.name = "My Playwright Tests"

  # Estratégia de captura de tela
  # Opções: FOR_EACH_ACTION, BEFORE_AND_AFTER_EACH_STEP, FOR_FAILURES, DISABLED
  take.screenshots = FOR_EACH_ACTION

  # Diretório de saída para relatórios
  outputDirectory = target/site/serenity

  # Título do relatório
  report.title = "Test Results"
}

# Configurações específicas de ambiente
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

### Estratégias de Captura de Tela

| Estratégia | Descrição |
|----------|-------------|
| `FOR_EACH_ACTION` | Captura de tela após cada passo (padrão) |
| `BEFORE_AND_AFTER_EACH_STEP` | Captura de tela antes e depois de cada passo |
| `FOR_FAILURES` | Captura de tela apenas quando um passo falha |
| `DISABLED` | Sem capturas de tela automáticas |

### Usando Propriedades de Ambiente

Acesse configuração específica do ambiente em seus testes:

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

Execute com um ambiente específico:

```bash
mvn verify -Denvironment=staging
```

## Configuração do Playwright

### Opções do Navegador

Configure as opções de inicialização do navegador na configuração do seu teste:

```java
@BeforeAll
static void setupBrowser() {
    playwright = Playwright.create();

    BrowserType.LaunchOptions options = new BrowserType.LaunchOptions()
        .setHeadless(true)           // Executa headless
        .setSlowMo(100)              // Desacelera ações em 100ms
        .setTimeout(30000)           // Timeout de inicialização do navegador
        .setDevtools(false);         // Não abre DevTools

    browser = playwright.chromium().launch(options);
}
```

### Modo Headless vs Headed

Controle o modo headless via propriedade do sistema:

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

Execute com navegador visível:

```bash
mvn verify -Dplaywright.headless=false
```

### Opções de Contexto do Navegador

Configure o contexto do navegador para cada teste:

```java
@BeforeEach
void setupPage() {
    Browser.NewContextOptions contextOptions = new Browser.NewContextOptions()
        .setViewportSize(1920, 1080)        // Tamanho da janela do navegador
        .setLocale("en-US")                  // Localidade
        .setTimezoneId("America/New_York")   // Fuso horário
        .setGeolocation(40.7128, -74.0060)   // Geolocalização
        .setPermissions(Arrays.asList("geolocation")); // Permissões

    BrowserContext context = browser.newContext(contextOptions);
    page = context.newPage();
    PlaywrightSerenity.registerPage(page);
}
```

### Emulação de Dispositivos

Teste em dispositivos móveis:

```java
@BeforeEach
void setupMobilePage() {
    // Use os descritores de dispositivo do Playwright
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

### Configuração de Rede

#### Interceptação de Requisições

```java
@BeforeEach
void setupWithMocking() {
    page = browser.newPage();

    // Simula respostas de API
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

#### Configuração de Timeout

```java
// Timeout global para todas as ações
page.setDefaultTimeout(30000);  // 30 segundos

// Timeout para navegação
page.setDefaultNavigationTimeout(60000);  // 60 segundos

// Timeout por ação
page.locator("#slow-element").click(
    new Locator.ClickOptions().setTimeout(10000)
);
```

## Testes Multi-Navegador

### Executando em Diferentes Navegadores

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

    // Executa teste...

    PlaywrightSerenity.unregisterPage(page);
    page.close();
    browser.close();
}
```

### Seleção de Navegador via Propriedade

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

Execute com navegador específico:

```bash
mvn verify -Dbrowser=firefox
```

## Execução Paralela

### Configuração Paralela do JUnit 5

Crie `junit-platform.properties` em `src/test/resources`:

```properties
junit.jupiter.execution.parallel.enabled = true
junit.jupiter.execution.parallel.mode.default = concurrent
junit.jupiter.execution.parallel.mode.classes.default = concurrent
junit.jupiter.execution.parallel.config.strategy = fixed
junit.jupiter.execution.parallel.config.fixed.parallelism = 4
```

### Gerenciamento de Navegador Thread-Safe

Para testes paralelos, cada teste precisa de seu próprio contexto de navegador:

```java
@ExtendWith(SerenityJUnit5Extension.class)
class ParallelTest {

    // Use ThreadLocal para thread safety
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
        // Cleanup acontece por thread
    }
}
```

## Configuração de Logging

### Configuração do Logback

Crie `logback-test.xml` em `src/test/resources`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- Logging do Serenity -->
    <logger name="net.serenitybdd" level="INFO"/>
    <logger name="net.thucydides" level="INFO"/>

    <!-- Logging do Playwright -->
    <logger name="com.microsoft.playwright" level="WARN"/>

    <!-- Logging dos seus testes -->
    <logger name="com.example.tests" level="DEBUG"/>

    <root level="INFO">
        <appender-ref ref="STDOUT"/>
    </root>
</configuration>
```

### Logging de Debug

Habilite logging verboso para solução de problemas:

```bash
mvn verify -Dlogback.configurationFile=logback-debug.xml
```

Com `logback-debug.xml`:

```xml
<logger name="net.serenitybdd" level="DEBUG"/>
<logger name="com.microsoft.playwright" level="DEBUG"/>
```
