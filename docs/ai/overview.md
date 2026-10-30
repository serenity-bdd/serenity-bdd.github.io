---
id: ai_idioms_overview
title: Current Idioms and Imports
sidebar_position: 1
description: Exact packages, working examples and common mistakes for each way of writing tests with Serenity BDD.
---

# Current Idioms and Imports

These pages list the exact packages, dependencies and idioms for each supported way of writing tests with Serenity BDD, with compiling examples. They are written for people and for AI coding assistants, which most often go wrong by guessing a package name.

Serenity supports several styles. All of them are current and valid:

| Approach | Drivers | Page |
|---|---|---|
| Page Objects with a step library | Selenium, Playwright | [Page Objects: Imports and Idioms](ai_page_object_idioms) |
| Screenplay | Selenium, Playwright, REST | [Screenplay: Imports and Idioms](ai_screenplay_idioms) |
| Cucumber with Screenplay | Selenium | [Screenplay: Imports and Idioms](ai_screenplay_idioms) |
| Cucumber with page objects and a step library | Selenium | [Cucumber](ai_cucumber) |
| REST with a step library (no Screenplay) | REST-assured via SerenityRest | [REST with SerenityRest and a Step Library](ai_rest_step_library) |

Use JUnit 5 as the runner for all of them. Dependencies, the report plugin and `serenity.conf` are on [Project Setup](ai_project_setup).

## Choosing a style

Pick the style the project already uses, and stay in it: one approach, one driver and one runner per project, and don't mix Page Objects and Screenplay in one test. To see which a project uses, look at `pom.xml` (`serenity-screenplay*`, `serenity-playwright`, `serenity-cucumber`) and the existing tests. For a new project, choose by what suits the team. None of the styles is deprecated.

## If you use an AI coding assistant

See [Using Serenity BDD with AI Coding Assistants](ai_using_assistants) for the `AGENTS.md` files, the agent skill and `llms.txt`. In short: tell it which style, driver and runner you want, or point it at these pages (or at [llms.txt](https://serenity-bdd.github.io/llms.txt)). Ask it to compile its output (`mvn test-compile`) before running it. Many `net.thucydides` packages are current core packages, so that prefix on its own is not a sign of outdated code: judge each class against these pages.
