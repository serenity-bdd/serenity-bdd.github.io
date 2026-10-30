---
id: ai_using_assistants
title: Using Serenity BDD with AI Coding Assistants
sidebar_position: 1
description: What is available for AI coding assistants (documentation pages, llms.txt, an agent skill, AGENTS.md files), how to install each one, and what was measured.
---

# Using Serenity BDD with AI Coding Assistants

AI coding assistants write Serenity tests quickly, and they most often go wrong by guessing: a package name from an old release, a method that does not exist, or a mix of two ways of working. Everything on this page is there to stop that. All of it describes the current release (Serenity 5.4.1; the Playwright modules are published up to 5.3.11), and every claim in it was checked against the released jars or by running it.

Serenity supports several ways of writing tests, and all of them are current: Page Objects with step libraries, Screenplay, Cucumber (with Screenplay or with page objects), REST with a step library or with Screenplay, with Selenium or Playwright, with JUnit 5 or Cucumber. None is recommended over another. An assistant that has these materials asks which one you want when it cannot tell from the project, instead of choosing for you.

## What is available

| Material | What it is | Where |
|---|---|---|
| Documentation pages | Exact packages, dependencies, idioms and compiling examples for each style, plus configuration, upgrading, living documentation and troubleshooting by symptom | [Idioms and Imports by Style](ai_idioms_overview) |
| `llms.txt` and `llms-full.txt` | An index of the documentation for AI assistants (this section first), and the full text of the pages. Every page is also plain markdown at its own address with `.md` appended, for example `https://serenity-bdd.github.io/docs/ai/ai_writing_tests.md` | [llms.txt](https://serenity-bdd.github.io/llms.txt), [llms-full.txt](https://serenity-bdd.github.io/llms-full.txt) |
| `AGENTS.md` files | One per style. They record the style, driver and runner your project uses, so an assistant stays in it | [`docs/ai/agents-md/variants`](https://github.com/serenity-bdd/serenity-core/tree/main/docs/ai/agents-md/variants) in the serenity-core repository |
| An agent skill (Claude Code) | The same material as the pages, loaded when you ask for Serenity tests: it chooses the style (or asks), writes the tests, compiles them, and reviews the report | [`docs/ai/skill/serenity-bdd`](https://github.com/serenity-bdd/serenity-core/tree/main/docs/ai/skill/serenity-bdd) |
| A test-review agent (Claude Code) | A read-only agent that judges the new tests and the report they produce: intent, business wording, grouping | [`docs/ai/skill/agents`](https://github.com/serenity-bdd/serenity-core/tree/main/docs/ai/skill/agents) |

## Installing

**Tell your assistant about the pages.** The simplest step needs no installation: give it the address of [llms.txt](https://serenity-bdd.github.io/llms.txt), or the page for your style, and ask it to compile what it writes (`mvn test-compile`).

**Add an `AGENTS.md`.** Copy the file for your style from the variants folder to the root of your project and name it `AGENTS.md`. The names are:

| File | Style |
|---|---|
| `AGENTS.po-selenium.md`, `AGENTS.po-playwright.md` | Page Objects with a step library (Selenium, Playwright) |
| `AGENTS.sp-selenium.md`, `AGENTS.sp-playwright.md`, `AGENTS.sp-rest.md` | Screenplay (Selenium, Playwright, REST) |
| `AGENTS.cuke-sp.md`, `AGENTS.cuke-pages.md` | Cucumber with Screenplay, Cucumber with page objects |
| `AGENTS.rest-steps.md` | REST with a `SerenityRest` step library |

Assistants that read `AGENTS.md` pick it up automatically. Claude Code reads `CLAUDE.md`, so copy the same file to `CLAUDE.md` as well.

**Install the skill (Claude Code).** Copy the folder `docs/ai/skill/serenity-bdd` from the serenity-core repository to `.claude/skills/serenity-bdd` in your project, or to `~/.claude/skills/serenity-bdd` to have it in every project. To add the reviewer, copy `docs/ai/skill/agents/serenity-test-reviewer.md` to `.claude/agents/` (or `~/.claude/agents/`). The skill loads when you ask for Serenity tests. If your project does not show which style it uses and you did not say, it asks you before writing anything.

## What was measured

Models were given test-writing tasks against a small online bookshop with known, planted defects. A generated test counted as good only if it compiled, passed on the healthy application, and failed when the application had the defect it was meant to catch. Each figure below is for three Claude models, with and without the material.

| Test | Without | With the references |
|---|---|---|
| 14 new tasks, Page Objects and Screenplay, one-shot | 62% | 81% |
| 8 new Playwright tasks, one-shot | 67% | 96% |
| 8 new REST and Cucumber tasks (written after the guidance), one-shot | 36% | 99% |
| Same tasks with tools (the model can run Maven and fix its own errors) | at or near 100% | at or near 100%, with about half as many Maven runs |

So the main gain is in code written in one go, and in fewer retries when the model can run the build. The materials were also scored for how well the generated tests work as living documentation (clear scenario titles in business language, tests grouped by function): the score went from about 70% to about 90%.

These are results from one evaluation, run by the authors of the materials, on Claude models and Claude Code. The full method and results are in the [evaluation write-up](https://github.com/serenity-bdd/serenity-core/blob/main/docs/ai/baseline-results.md) in the serenity-core repository, including what was not tested.

## Known limits

- The pages and the skill are verified against Serenity 5.4.1. Behaviour fixed in later releases is noted where it matters.
- The skill and reviewer agent are for Claude Code. The pages, `llms.txt` and the `AGENTS.md` files are plain text and work with any assistant, but they were only measured with Claude models.
- Mobile testing, Spring and Guice object factories, and cloud grid configuration are not covered.
- If a page here is wrong, or an error message you hit is missing from [troubleshooting](ai_troubleshooting), please open an issue.
