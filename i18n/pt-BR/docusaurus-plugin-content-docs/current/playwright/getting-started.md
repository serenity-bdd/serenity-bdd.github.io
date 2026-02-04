---
id: playwright_getting_started
title: Primeiros Passos
sidebar_position: 2
---

# Primeiros Passos com Serenity Playwright

Este guia ajudará você a configurar um novo projeto Serenity Playwright do zero.

## Pré-requisitos

Antes de começar, certifique-se de ter:

- **Java 17** ou superior
- **Maven 3.8+** ou Gradle
- Uma IDE (IntelliJ IDEA recomendado)

## Configuração do Projeto

### Configuração do Maven

Adicione as seguintes dependências ao seu `pom.xml`:

```xml
<properties>
    <serenity.version>5.1.0</serenity.version>
    <playwright.version>1.57.0</playwright.version>
    <junit.version>6.0.1</junit.version>
</properties>

<dependencies>
    <!-- Integração Serenity Playwright -->
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

    <!-- AssertJ (recomendado para asserções) -->
    <dependency>
        <groupId>org.assertj</groupId>
        <artifactId>assertj-core</artifactId>
        <version>3.27.0</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### Plugins Maven

Configure o plugin Failsafe e o plugin Maven do Serenity:

```xml
<build>
    <plugins>
        <!-- Executar testes com Failsafe -->
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

        <!-- Gerar relatórios Serenity -->
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

## Instalando os Navegadores do Playwright

O Playwright precisa baixar os binários dos navegadores no primeiro uso. Execute este comando:

```bash
mvn exec:java -e -Dexec.mainClass=com.microsoft.playwright.CLI -Dexec.args="install"
```

Ou deixe o Playwright instalá-los automaticamente na primeira execução de teste.

## Seu Primeiro Teste

### Passo 1: Criar um Page Object

Crie um Page Object para encapsular as interações com a página:

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

    // Locators são privados - encapsulados
    private Locator searchBox() {
        return page.getByRole(AriaRole.SEARCHBOX,
            new Page.GetByRoleOptions().setName("Search Wikipedia"));
    }

    // Ações são públicas
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

### Passo 2: Criar uma Step Library

Crie uma step library com anotações `@Step` para relatórios:

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

### Passo 3: Escrever o Teste

Crie uma classe de teste:

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
        PlaywrightSerenity.registerPage(page);  // Habilitar captura de tela
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

## Executando os Testes

Execute seus testes e gere relatórios:

```bash
mvn clean verify
```

## Visualizando Relatórios

Após a conclusão dos testes, abra o relatório Serenity:

```bash
open target/site/serenity/index.html
```

Você verá um relatório HTML rico com:
- Resumo dos resultados dos testes
- Detalhes de execução passo a passo
- Capturas de tela capturadas em cada passo
- Snapshots do código-fonte da página para depuração

## Próximos Passos

- Siga o [Tutorial TodoMVC](playwright_tutorial_todomvc) para um exemplo completo
- Aprenda sobre [Page Object](playwright_page_objects) para arquitetura de testes fácil de manter
- Explore [Step Library](playwright_step_libraries) para melhores relatórios
- Revise as [Opções de Configuração](playwright_configuration) para personalização
- Confira as [Boas Práticas](playwright_best_practices) para testes prontos para produção
