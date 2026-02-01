---
id: playwright_intro
title: Introduction to Serenity Playwright
sidebar_position: 1
---

# Serenity BDD with Playwright

The `serenity-playwright` module provides seamless integration between Serenity BDD's powerful reporting capabilities and [Playwright](https://playwright.dev/)'s modern browser automation. This combination gives you the best of both worlds:

- **Playwright's Speed and Reliability** - Modern, auto-waiting browser automation
- **Serenity's Rich Reporting** - Step-by-step documentation with screenshots
- **Page Object Pattern Support** - Clean, maintainable test architecture
- **Cross-Browser Testing** - Chromium, Firefox, and WebKit support

## Why Playwright with Serenity?

Playwright is a modern browser automation library developed by Microsoft that offers several advantages:

- **Auto-waiting** - Playwright automatically waits for elements to be actionable before performing actions
- **Multiple Browser Contexts** - Run tests in isolated browser contexts for true parallelization
- **Network Interception** - Mock and modify network requests easily
- **Mobile Emulation** - Test responsive designs with device emulation
- **Modern Web Support** - First-class support for Shadow DOM, iframes, and web components

Combined with Serenity BDD, you get:

- **Automatic Screenshot Capture** - Screenshots at each step completion
- **Rich HTML Reports** - Interactive reports with step-by-step documentation
- **Living Documentation** - Tests that document how your application works
- **Page Source Capture** - HTML snapshots for debugging failed tests

## Two Approaches: Page Objects or Screenplay

Serenity Playwright supports two architectural approaches:

### Page Object Pattern (Traditional)

The classic three-layer pattern familiar to most test automation engineers:

```
Test Class (business scenarios)
    └── Step Library (@Step methods for Serenity reporting)
          └── Page Object (encapsulates locators and page interactions)
```

This separation ensures:
- **Tests** read like business requirements with no technical details
- **Step Libraries** provide Serenity's rich reporting with `@Step` annotations
- **Page Objects** encapsulate all locator strategies and page-specific logic

### Screenplay Pattern (Modern)

The Screenplay Pattern is a more modern, actor-centric approach:

```
Test Class (business scenarios)
    └── Actor performs Tasks and asks Questions
          └── Tasks use Targets to interact with the UI
```

With Screenplay:
- **Actors** represent users with abilities (like browsing the web)
- **Tasks** express high-level actions in business language
- **Questions** query the state of the application
- **Targets** define UI elements using Playwright selectors

Both approaches integrate seamlessly with Serenity's reporting.

## Quick Examples

### Page Object Approach

Here's what a Page Object-based Serenity Playwright test looks like:

```java
@ExtendWith(SerenityJUnit5Extension.class)
class SearchTest {

    @Steps
    WikipediaSteps wikipedia;

    private Page page;

    @BeforeEach
    void setup() {
        page = browser.newPage();
        PlaywrightSerenity.registerPage(page);
    }

    @Test
    void shouldSearchForATerm() {
        wikipedia.openWikipedia(page);
        wikipedia.searchFor(page, "Playwright");
        wikipedia.verifyTitleContains(page, "Playwright");
    }
}
```

### Screenplay Approach

Here's the same test using the Screenplay Pattern:

```java
@ExtendWith(SerenityJUnit5Extension.class)
class SearchTest {

    Actor researcher;

    @BeforeEach
    void setup() {
        researcher = Actor.named("Researcher");
        researcher.can(BrowseTheWebWithPlaywright.usingTheDefaultConfiguration());
    }

    @Test
    void shouldSearchForATerm() {
        researcher.attemptsTo(
            Open.url("https://en.wikipedia.org"),
            SearchFor.term("Playwright"),
            Ensure.that(ThePageTitle.displayed()).contains("Playwright")
        );
    }
}
```

Both approaches read like specifications - no CSS selectors or low-level Playwright API calls, just clear business language.

## Getting Started

Ready to start? Head to the [Getting Started](playwright_getting_started) guide to set up your first Serenity Playwright project.

For a complete worked example:
- **Page Object approach**: Check out the [TodoMVC Tutorial](playwright_tutorial_todomvc) which walks through building a full test suite step by step
- **Screenplay approach**: See the [Screenplay with Playwright](playwright_screenplay) guide for the actor-centric pattern with comprehensive examples
