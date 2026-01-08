---
id: playwright_getting_started
title: Getting Started
sidebar_position: 2
---

# Getting Started with Serenity Playwright

This guide will help you set up a new Serenity Playwright project from scratch.

## Prerequisites

Before you begin, ensure you have:

- **Java 17** or higher
- **Maven 3.8+** or Gradle
- An IDE (IntelliJ IDEA recommended)

## Project Setup

### Maven Configuration

Add the following dependencies to your `pom.xml`:

```xml
<properties>
    <serenity.version>5.1.0</serenity.version>
    <playwright.version>1.57.0</playwright.version>
    <junit.version>6.0.1</junit.version>
</properties>

<dependencies>
    <!-- Serenity Playwright Integration -->
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

    <!-- AssertJ (recommended for assertions) -->
    <dependency>
        <groupId>org.assertj</groupId>
        <artifactId>assertj-core</artifactId>
        <version>3.27.0</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### Maven Plugins

Configure the Failsafe plugin and Serenity Maven plugin:

```xml
<build>
    <plugins>
        <!-- Run tests with Failsafe -->
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

        <!-- Generate Serenity reports -->
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

## Installing Playwright Browsers

Playwright needs to download browser binaries on first use. Run this command:

```bash
mvn exec:java -e -Dexec.mainClass=com.microsoft.playwright.CLI -Dexec.args="install"
```

Or let Playwright install them automatically on first test run.

## Your First Test

### Step 1: Create a Page Object

Create a Page Object to encapsulate page interactions:

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

    // Locators are private - encapsulated
    private Locator searchBox() {
        return page.getByRole(AriaRole.SEARCHBOX,
            new Page.GetByRoleOptions().setName("Search Wikipedia"));
    }

    // Actions are public
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

### Step 2: Create a Step Library

Create a step library with `@Step` annotations for reporting:

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

### Step 3: Write the Test

Create a test class:

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
        PlaywrightSerenity.registerPage(page);  // Enable screenshot capture
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

## Running the Tests

Run your tests and generate reports:

```bash
mvn clean verify
```

## Viewing Reports

After the tests complete, open the Serenity report:

```bash
open target/site/serenity/index.html
```

You'll see a rich HTML report with:
- Test results summary
- Step-by-step execution details
- Screenshots captured at each step
- Page source snapshots for debugging

## Next Steps

- Follow the [TodoMVC Tutorial](playwright_tutorial_todomvc) for a complete worked example
- Learn about [Page Objects](playwright_page_objects) for maintainable test architecture
- Explore [Step Libraries](playwright_step_libraries) for better reporting
- Review [Configuration Options](playwright_configuration) for customization
- Check out [Best Practices](playwright_best_practices) for production-ready tests
