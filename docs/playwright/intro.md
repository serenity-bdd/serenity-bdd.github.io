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

## Architecture Overview

The recommended architecture for Serenity Playwright tests follows a three-layer pattern:

```
Test Class (business scenarios)
    └── Step Library (@Step methods for Serenity reporting)
          └── Page Object (encapsulates locators and page interactions)
```

This separation ensures:
- **Tests** read like business requirements with no technical details
- **Step Libraries** provide Serenity's rich reporting with `@Step` annotations
- **Page Objects** encapsulate all locator strategies and page-specific logic

## Quick Example

Here's a taste of what Serenity Playwright tests look like:

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

Notice how the test reads like a specification - no CSS selectors, no low-level Playwright API calls, just clear business language.

## Getting Started

Ready to start? Head to the [Getting Started](playwright_getting_started) guide to set up your first Serenity Playwright project.

For a complete worked example, check out the [TodoMVC Tutorial](playwright_tutorial_todomvc) which walks through building a full test suite step by step.
