---
id: playwright_getting_started
title: Primeros pasos
sidebar_position: 2
---

# Primeros pasos con Serenity Playwright

Esta guia te ayudara a configurar un nuevo proyecto de Serenity Playwright desde cero.

## Prerrequisitos

Antes de comenzar, asegurate de tener:

- **Java 17** o superior
- **Maven 3.8+** o Gradle
- Un IDE (se recomienda IntelliJ IDEA)

## Configuracion del proyecto

### Configuracion de Maven

Agrega las siguientes dependencias a tu `pom.xml`:

```xml
<properties>
    <serenity.version>5.1.0</serenity.version>
    <playwright.version>1.57.0</playwright.version>
    <junit.version>6.0.1</junit.version>
</properties>

<dependencies>
    <!-- Integracion Serenity Playwright -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-playwright</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Serenity JUnit 5 -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-junit5</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Playwright -->
    <dependency>
        <groupId>com.microsoft.playwright</groupId>
        <artifactId>playwright</artifactId>
        <version>${playwright.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- JUnit 5 -->
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>${junit.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- AssertJ (recomendado para aserciones) -->
    <dependency>
        <groupId>org.assertj</groupId>
        <artifactId>assertj-core</artifactId>
        <version>3.27.0</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### Plugins de Maven

Configura el plugin Failsafe y el plugin Maven de Serenity:

```xml
<build>
    <plugins>
        <!-- Ejecutar pruebas con Failsafe -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-failsafe-plugin</artifactId>
            <version>3.5.0</version>
            <configuration>
                <includes>
                    <include>**/*Test.java</include>
                </includes>
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

        <!-- Generar reportes de Serenity -->
        <plugin>
            <groupId>net.serenity-bdd.maven.plugins</groupId>
            <artifactId>serenity-maven-plugin</artifactId>
            <version>${serenity.version}</version>
            <executions>
                <execution>
                    <id>serenity-reports</id>
                    <phase>post-integration-test</phase>
                    <goals>
                        <goal>aggregate</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

## Instalacion de navegadores de Playwright

Playwright necesita descargar los binarios de los navegadores en el primer uso. Ejecuta este comando:

```bash
mvn exec:java -e -Dexec.mainClass=com.microsoft.playwright.CLI -Dexec.args="install"
```

O deja que Playwright los instale automaticamente en la primera ejecucion de pruebas.

## Tu primera prueba

### Paso 1: Crear un Page Object

Crea un Page Object para encapsular las interacciones con la pagina:

```java
package com.example.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

public class WikipediaHomePage {
    private final Page page;
    private static final String URL = "https://en.wikipedia.org";

    public WikipediaHomePage(Page page) {
        this.page = page;
    }

    // Los localizadores son privados - encapsulados
    private Locator searchBox() {
        return page.getByRole(AriaRole.SEARCHBOX,
            new Page.GetByRoleOptions().setName("Search Wikipedia"));
    }

    // Las acciones son publicas
    public void open() {
        page.navigate(URL);
    }

    public void searchFor(String term) {
        searchBox().fill(term);
        searchBox().press("Enter");
    }

    public String getTitle() {
        return page.title();
    }
}
```

### Paso 2: Crear una Step Library

Crea una Step Library con anotaciones `@Step` para los reportes:

```java
package com.example.steps;

import com.example.pages.WikipediaHomePage;
import com.microsoft.playwright.Page;
import net.serenitybdd.annotations.Step;

import static org.assertj.core.api.Assertions.assertThat;

public class WikipediaSteps {
    private WikipediaHomePage homePage;

    private void ensurePageObject(Page page) {
        if (homePage == null) {
            homePage = new WikipediaHomePage(page);
        }
    }

    @Step("Open Wikipedia")
    public void openWikipedia(Page page) {
        ensurePageObject(page);
        homePage.open();
    }

    @Step("Search for '{1}'")
    public void searchFor(Page page, String term) {
        ensurePageObject(page);
        homePage.searchFor(term);
    }

    @Step("Verify page title contains '{1}'")
    public void verifyTitleContains(Page page, String expected) {
        ensurePageObject(page);
        assertThat(homePage.getTitle())
            .containsIgnoringCase(expected);
    }
}
```

### Paso 3: Escribir la prueba

Crea una clase de prueba:

```java
package com.example;

import com.example.steps.WikipediaSteps;
import com.microsoft.playwright.*;
import net.serenitybdd.annotations.Steps;
import net.serenitybdd.junit5.SerenityJUnit5Extension;
import net.serenitybdd.playwright.PlaywrightSerenity;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(SerenityJUnit5Extension.class)
class WikipediaSearchTest {

    @Steps
    WikipediaSteps wikipedia;

    private static Playwright playwright;
    private static Browser browser;
    private Page page;

    @BeforeAll
    static void setupBrowser() {
        playwright = Playwright.create();
        browser = playwright.chromium().launch(
            new BrowserType.LaunchOptions().setHeadless(true)
        );
    }

    @AfterAll
    static void closeBrowser() {
        if (browser != null) browser.close();
        if (playwright != null) playwright.close();
    }

    @BeforeEach
    void setupPage() {
        page = browser.newPage();
        PlaywrightSerenity.registerPage(page);  // Habilitar captura de pantallas
    }

    @AfterEach
    void closePage() {
        PlaywrightSerenity.unregisterPage(page);
        if (page != null) page.close();
    }

    @Test
    @DisplayName("Should search Wikipedia successfully")
    void shouldSearchWikipedia() {
        wikipedia.openWikipedia(page);
        wikipedia.searchFor(page, "Playwright");
        wikipedia.verifyTitleContains(page, "Playwright");
    }
}
```

## Ejecutar las pruebas

Ejecuta tus pruebas y genera los reportes:

```bash
mvn clean verify
```

## Ver los reportes

Despues de que las pruebas se completen, abre el reporte de Serenity:

```bash
open target/site/serenity/index.html
```

Veras un reporte HTML completo con:
- Resumen de resultados de pruebas
- Detalles de ejecucion paso a paso
- Capturas de pantalla capturadas en cada paso
- Snapshots del codigo fuente de la pagina para depuracion

## Siguientes pasos

- Sigue el [Tutorial de TodoMVC](playwright_tutorial_todomvc) para un ejemplo completo paso a paso
- Aprende sobre [Page Object](playwright_page_objects) para una arquitectura de pruebas mantenible
- Explora las [Step Library](playwright_step_libraries) para mejores reportes
- Revisa las [Opciones de configuracion](playwright_configuration) para personalizacion
- Consulta las [Mejores practicas](playwright_best_practices) para pruebas listas para produccion
