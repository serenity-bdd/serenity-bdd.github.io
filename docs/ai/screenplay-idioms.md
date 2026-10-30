---
id: ai_screenplay_idioms
title: "Screenplay: Imports and Idioms"
sidebar_position: 2
description: "Exact packages, common mistakes and compiling examples for Screenplay with Selenium, Playwright and REST, and for Cucumber with Screenplay."
---

# Screenplay: Imports and Idioms

Verified against Serenity **5.4.1** (Playwright modules: **5.3.11**, the latest published). The examples at the end of this page compile and their tests pass.

Screenplay works with Selenium, Playwright and REST, with JUnit 5 or Cucumber. All of these are valid. Pick the one the user asked for or the project already uses, and don't mix them in one project.

## 1. Where things live

The packages are not guessable. Guessing them is the most common cause of compile errors.

### Core (all Screenplay projects), artifact `serenity-screenplay`
| Class | Package |
|---|---|
| `Actor`, `Task`, `Performable`, `Question`, `Interaction`, `Ability`, `Consequence`, `Tasks`, `RememberThat` | `net.serenitybdd.screenplay` |
| `GivenWhenThen` (`seeThat`) | `net.serenitybdd.screenplay` (use as a static import) |
| `OnStage`, `OnlineCast`, `Cast`, `Stage` | `net.serenitybdd.screenplay.actors` |
| `CastMember` | `net.serenitybdd.screenplay.annotations` |
| `Check` (conditional tasks) | `net.serenitybdd.screenplay.conditions` |
| `Wait`, `WaitUntil` | `net.serenitybdd.screenplay.waits` |

### Selenium, artifact `serenity-screenplay-webdriver`
| Class | Package |
|---|---|
| `BrowseTheWeb` | `net.serenitybdd.screenplay.abilities` |
| `Open`, `Click`, `Enter`, `Hit`, `Clear`, `Hover`, `Scroll`, `SelectFromOptions` | `net.serenitybdd.screenplay.actions` |
| `Target` | `net.serenitybdd.screenplay.targets`. `Target.the("name").locatedBy("..")` takes a **String**. Serenity treats the string as XPath if it compiles as an XPath expression, otherwise as CSS. So `.new-todo`, `#id`, `[data-test=x]` and `li label` are CSS, but a tag-prefixed selector such as `input.new-todo`, `button` or `h1` is read as XPath and finds nothing. For those use `Target.the("name").located(By.cssSelector("input.new-todo"))` (or a leading `.`/`#`, or an explicit `//input[...]`). |
| `Text`, `TextContent`, `Value`, `Attribute`, `Visibility`, `Presence`, `Enabled`, `Disabled`, `SelectedValue`, `CurrentVisibility`, `WebElementQuestion` | `net.serenitybdd.screenplay.questions` |

`Ensure` for web is in artifact `serenity-ensure`: **`net.serenitybdd.screenplay.ensure.Ensure`**.

### Playwright, artifact `serenity-screenplay-playwright`
Everything lives under `net.serenitybdd.screenplay.playwright`:

| Class | Package |
|---|---|
| `BrowseTheWebWithPlaywright` | `...playwright.abilities` |
| `PlaywrightCast` (use instead of `OnlineCast`) | `...playwright.actors` |
| `Open`, `Click`, `Enter`, `Press`, `Navigate`, `Check`, `Hover`, `WaitFor` ... | `...playwright.interactions` |
| `Text`, `Visibility`, `Count`, `Attribute` ... | `...playwright.questions` |
| `Ensure` | `...playwright.assertions` |
| `Target` | `...playwright.Target` |

Playwright locators are plain Playwright selector strings (`".new-todo"`, `"text='Delete'"`) or a Playwright `Target`.

Playwright classes that exist (all take a selector string or a `Target`):

| Kind | Classes and entry points |
|---|---|
| Interactions (`...playwright.interactions`) | `Open.url(..)`, `Navigate`, `Click.on(..)`, `DoubleClick`, `RightClick`, `Hover.over(..)`, `Enter.theValue(..).into(..)`, `Press.keys("Enter")`, `Clear`, `Focus`, `Check.the(..)`, `Uncheck.checkbox(..)`, `SelectFromOptions.byVisibleText(..)` / `.byValue(..)` / `.byIndex(..)` then `.from(selector)`, `Upload`, `Drag`, `ScrollIntoView`, `WaitFor.selector(..)` |
| Questions (`...playwright.questions`) | `Text.of(..)`, `Text.ofEach(..)` (`List<String>`), `Value.of(..)`, `SelectedOptionText.of(..)`, `Checked.of(..)`, `Visibility.of(..)`, `Presence`, `Absence`, `Count.of(..)`, `Attribute`, `Enabled`, `Disabled`, `AllOptionTexts` |
| Assertions (`...playwright.assertions.Ensure`) | `Ensure.that(selector).isVisible() / isHidden() / hasText(..) / containsText(..) / hasValue(..) / isChecked() / hasCount(n) / hasAttribute(n, v)` |

**Don't use `Ensure.thatTheCurrentUrl()` or `Ensure.thatThePageTitle()`: they return package-private classes, and any call on them fails to compile** ("UrlEnsure.contains(java.lang.String) is defined in an inaccessible class or interface"; run in the verification script in the serenity-core repository (`docs/ai/skill`)). To check the URL, assert on the page: `assertThat(BrowseTheWebWithPlaywright.as(actor).getCurrentPage().url()).contains("/catalog")` (after `attemptsTo(..)`, in the test body), or better, check something the user sees on the new page (`Ensure.that("h1").hasText("Catalog")`).

**A selector must match exactly one element** for `WaitFor.selector`, `Click.on`, `Enter`, `Ensure.that(..).hasText(..)` and `Text.of(..)` (Playwright's strict mode). A selector that matches a list (`"#books .book"` with five rows) fails at run time with `strict mode violation: ... resolved to 5 elements`. For a list: wait on the first row (`"#books .book >> nth=0"`), count with `Ensure.that("#books .book").hasCount(5)`, read all texts with `Text.ofEach(..)`, pick one with `">> nth=0"` or `">> nth=-1"` (last), or narrow with `has-text`/`text-is` (`"tr.book:has(td.title:text-is('Refactoring'))"`). `sp-playwright/todo/ListTest.java` runs these.

**Don't build a Playwright text pattern with `Pattern.quote(..)`.** Playwright sends the pattern to the browser's JavaScript engine, which doesn't understand Java's `\Q..\E`, so `setHasText(Pattern.compile("^\\s*" + Pattern.quote(title) + "\\s*$"))` matches nothing and the step times out after 30 seconds (two Opus runs). Use the plain string (`setHasText(title)` matches by substring, ignoring case; `text-is('..')` / `has-text('..')` in a selector string match exactly or by substring), or write the pattern by hand (`Pattern.compile("^\\s*Clean Code\\s*$")`). Run in the verification script in the serenity-core repository (`docs/ai/skill`).

In a Playwright selector string a role needs the prefix: `"role=heading[name=\"Sign in\"]"`; without `role=` it throws `InvalidSelectorError` (run in the verification script in the serenity-core repository (`docs/ai/skill`)).

Playwright has no `net.serenitybdd.screenplay.ensure.Ensure` and no `Target` from `net.serenitybdd.screenplay.targets`: use the Playwright ones. See `sp-playwright/todo/FormTest.java`.

### REST, artifact `serenity-screenplay-rest`
| Class | Package |
|---|---|
| `CallAnApi` | `net.serenitybdd.screenplay.rest.abilities` |
| `Get`, `Post`, `Delete`, `Ensure` ... | `net.serenitybdd.screenplay.rest.interactions` |
| `LastResponse`, `TheResponse` | `net.serenitybdd.screenplay.rest.questions` |

### Shared across all styles
| Class | Package |
|---|---|
| `@Managed`, `@Step`, `@Steps`, `@DefaultUrl`, `@WithTag` ... | `net.serenitybdd.annotations` (never `net.thucydides.core.annotations`) |
| `SerenityJUnit5Extension` | `net.serenitybdd.junit5` |
| `ScenarioSteps` (Page Objects) | `net.thucydides.core.steps` (**this one is correct** under `net.thucydides`) |

## 2. Common mistakes

| Wrong | Right |
|---|---|
| `import net.serenitybdd.rest.abilities.*` or `net.serenitybdd.rest.questions.*` for Screenplay REST (those packages don't exist) | `net.serenitybdd.screenplay.rest.abilities.CallAnApi`, `...rest.questions.LastResponse` |
| `Target.the("x").locatedBy(By.id("x"))` | `locatedBy("#x")`, a String; for a `By` use `located(By.id("x"))` |
| `locatedBy("input.new-todo")` (tag-prefixed CSS; read as XPath, element not found at run time) | `located(By.cssSelector("input.new-todo"))` or `locatedBy(".new-todo")` | run-time failure, 5 of 66 unguided agentic runs |
| Two `public` classes in one file, or a class name different from its file name | One public class per file, and the file name equals the class name |
| `import net.serenitybdd.screenplay.webdriver.BrowseTheWeb` (package doesn't exist) | `net.serenitybdd.screenplay.abilities.BrowseTheWeb` |
| `Question<List<String>>` returned from `Text.ofEach(target)` (Selenium) | `Question<Collection<String>>`. Playwright's `Text.ofEach` returns `List<String>` |
| `.viewedBy(actor)` on `Text`/`Value`/`Visibility`... | `actor.asksFor(Text.of(target))` or `Text.of(target).answeredBy(actor)`. `.viewedBy` is the old API |
| `net.thucydides.core.annotations.DefaultUrl` (and `Step`, `Managed`) | `net.serenitybdd.annotations.*` |
| JUnit 4 `@RunWith(SerenityRunner.class)` in a JUnit 5 project | `@ExtendWith(SerenityJUnit5Extension.class)` |
| Moving `ScenarioSteps` to `net.serenitybdd...` | `net.thucydides.core.steps.ScenarioSteps` |
| `OnlineCast` in the wrong package | `net.serenitybdd.screenplay.actors.OnlineCast` |
| `@Page` annotation | Doesn't exist. In Page Object tests use `@Steps` for step libraries and extend `PageObject` for pages |
| `Instrumented` as a class | `Tasks.instrumented(MyTask.class, args)` (static method), or prefer `Task.where(..)` |
| `Ensure.thatTheCurrentUrl().contains(..)` or `Ensure.thatThePageTitle()` (Playwright) | Doesn't compile (package-private return types). Assert on `BrowseTheWebWithPlaywright.as(actor).getCurrentPage().url()` or on visible page content | 6 of the 8 guided Playwright compile failures inspected |
| `WaitFor.selector("#books .book")` or `Ensure.that("#books .book").hasText(..)` where the selector matches several rows | `"#books .book >> nth=0"`, or `hasCount(n)`, or `Text.ofEach(..)` | strict mode violation at run time, 2 guided runs |
| `Navigate` from a Selenium package | Selenium: `Open.url(..)`. `Navigate` exists only in Playwright |

## 3. Minimal working patterns

The source files are under `` and are compile-checked. Names are the same across styles so you can compare them.

| Style | Files | Key points |
|---|---|---|
| Screenplay + Selenium + JUnit 5 | `sp-selenium/todo/*` | `@ExtendWith(SerenityJUnit5Extension.class)`, `@Managed(driver="chrome") WebDriver`, `OnStage.setTheStage(new OnlineCast())`, `OnStage.theActorCalled("Toby")`, `Task.where(..)`, `Target.the(..).locatedBy(..)`, `seeThat(question, matcher)` or `Ensure.that(..)` |
| Screenplay + Playwright + JUnit 5 | `sp-playwright/todo/*` (todo list, form with select and checkbox) | `new PlaywrightCast()`, string selectors, `Press.keys("Enter")`, `Ensure.that(selector).hasText(..)` |
| Screenplay + REST + JUnit 5 | `sp-rest/api/*` | `Actor.named(..).whoCan(CallAnApi.at(baseUrl))`, `Get.resource(..)`, `Post.to(..).with(request -> ...)`, `LastResponse.received()` |
| Cucumber + Screenplay | `cuke-sp/*` | `@Suite` + `@IncludeEngines("cucumber")` + `@SelectClasspathResource("features")`, plugin `net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel`, a `{actor}` `@ParameterType`, `@Before` that sets the stage |

### Rules of thumb
- Use `Task.where("{0} does something", step1, step2)` for tasks. Use a class with `performAs` only when the task needs real logic.
- `actor.attemptsTo(..)` for actions. `actor.should(seeThat(..))` or `Ensure` for checks.
- Keep locators in a `Target` holder class (Selenium) or constants (Playwright).
- Build tasks and questions with a static factory (`AddATodo.called("Buy milk")`) so the test reads like a sentence.

## 4. Not yet verified
- `Ensure` for web has several overloads. Only `that(Target).hasText(..)` is compile-tested.
- Page Objects (Selenium and Playwright) are covered in `page-objects.md`, not here.
- The examples were run once against the live sample sites with Serenity 5.4.1 (Playwright modules 5.3.11). Other sites and larger suites may behave differently.
- `serenity-screenplay-playwright` is documented at 5.3.11, not 5.4.x.

## Examples

These files compile against Serenity 5.4.1 (Playwright examples: 5.3.11).

### `sp-selenium/todo/AddATodo.java`

```java
package todo;

import net.serenitybdd.screenplay.Performable;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import org.openqa.selenium.Keys;

public class AddATodo {
    public static Performable called(String item) {
        return Task.where("{0} adds a todo called " + item,
                Enter.theValue(item).into(TodoList.NEW_TODO).thenHit(Keys.ENTER));
    }
}
```

### `sp-selenium/todo/AddTodoTest.java`

```java
package todo;

import net.serenitybdd.annotations.Managed;
import net.serenitybdd.junit5.SerenityJUnit5Extension;
import net.serenitybdd.screenplay.actions.Open;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;
import net.serenitybdd.screenplay.ensure.Ensure;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.openqa.selenium.WebDriver;

import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;
import static org.hamcrest.Matchers.hasItem;

@ExtendWith(SerenityJUnit5Extension.class)
class AddTodoTest {

    @Managed(driver = "chrome")
    WebDriver browser;

    @BeforeEach
    void setTheStage() {
        OnStage.setTheStage(new OnlineCast());
    }

    @Test
    void shouldShowTheNewTodo() {
        var toby = OnStage.theActorCalled("Toby");
        toby.attemptsTo(
                Open.url("https://todo-app.serenity-js.org"),
                AddATodo.called("Buy milk"));
        toby.should(seeThat(TheTodos.displayed(), hasItem("Buy milk")));
    }

    @Test
    void shouldShowTheNewTodoUsingEnsure() {
        var toby = OnStage.theActorCalled("Toby");
        toby.attemptsTo(
                Open.url("https://todo-app.serenity-js.org"),
                AddATodo.called("Buy milk"),
                Ensure.that(TodoList.ITEMS).hasText("Buy milk"));
    }
}
```

### `sp-selenium/todo/TheTodos.java`

```java
package todo;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.questions.Text;

import java.util.Collection;

public class TheTodos {
    // Text.ofEach(..) is a Question<Collection<String>> - not List<String>
    public static Question<Collection<String>> displayed() {
        return Text.ofEach(TodoList.ITEMS);
    }
}
```

### `sp-selenium/todo/TodoList.java`

```java
package todo;

import net.serenitybdd.screenplay.targets.Target;
import org.openqa.selenium.By;

public class TodoList {
    // locatedBy(String) treats a string as XPath whenever it compiles as one, so a CSS selector such as
    // "input.new-todo" (a valid XPath name) is NOT found. Use located(By.cssSelector(..)) for those.
    public static final Target NEW_TODO = Target.the("new todo field").located(By.cssSelector("input.new-todo"));
    public static final Target ITEMS = Target.the("todo items").locatedBy(".todo-list li label");
}
```

### `sp-playwright/todo/AddTodoTest.java`

```java
package todo;

import net.serenitybdd.junit5.SerenityJUnit5Extension;
import net.serenitybdd.screenplay.Performable;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.playwright.actors.PlaywrightCast;
import net.serenitybdd.screenplay.playwright.assertions.Ensure;
import net.serenitybdd.screenplay.playwright.interactions.Enter;
import net.serenitybdd.screenplay.playwright.interactions.Open;
import net.serenitybdd.screenplay.playwright.interactions.Press;
import net.serenitybdd.screenplay.playwright.questions.Text;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;
import static org.hamcrest.Matchers.hasItem;

@ExtendWith(SerenityJUnit5Extension.class)
class AddTodoTest {

    static final String NEW_TODO = ".new-todo";
    static final String ITEMS = ".todo-list li label";

    static Performable addATodo(String item) {
        return Task.where("{0} adds a todo called " + item,
                Enter.theValue(item).into(NEW_TODO),
                Press.keys("Enter"));
    }

    @BeforeEach
    void setTheStage() {
        OnStage.setTheStage(new PlaywrightCast());
    }

    @Test
    void shouldShowTheNewTodo() {
        var toby = OnStage.theActorCalled("Toby");
        toby.attemptsTo(
                Open.url("https://todo-app.serenity-js.org"),
                addATodo("Buy milk"),
                Ensure.that(ITEMS).hasText("Buy milk"));
        // Playwright's Text.ofEach(..) is a Question<List<String>> (Selenium's is Collection<String>)
        toby.should(seeThat(Text.ofEach(ITEMS), hasItem("Buy milk")));
    }
}
```

### `sp-playwright/todo/FormTest.java`

```java
package todo;

import net.serenitybdd.junit5.SerenityJUnit5Extension;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.playwright.actors.PlaywrightCast;
import net.serenitybdd.screenplay.playwright.assertions.Ensure;
import net.serenitybdd.screenplay.playwright.interactions.Check;
import net.serenitybdd.screenplay.playwright.interactions.Click;
import net.serenitybdd.screenplay.playwright.interactions.Open;
import net.serenitybdd.screenplay.playwright.interactions.SelectFromOptions;
import net.serenitybdd.screenplay.playwright.interactions.WaitFor;
import net.serenitybdd.screenplay.playwright.questions.Checked;
import net.serenitybdd.screenplay.playwright.questions.SelectedOptionText;
import net.serenitybdd.screenplay.playwright.questions.Value;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;
import static org.hamcrest.Matchers.equalTo;

/** Playwright interactions and questions for forms. Selectors are Playwright selector strings. */
@ExtendWith(SerenityJUnit5Extension.class)
class FormTest {

    // A self-contained page, so the example runs without a network or a site
    static final String FORM_PAGE = "data:text/html,"
            + "<select id='country'><option value='us'>United States</option><option value='ca'>Canada</option></select>"
            + "<input type='checkbox' id='terms'><button id='submit'>Send</button>";

    @BeforeEach
    void setTheStage() {
        OnStage.setTheStage(new PlaywrightCast());
    }

    @Test
    void shouldFillInAForm() {
        var ana = OnStage.theActorCalled("Ana");
        ana.attemptsTo(
                Open.url(FORM_PAGE),
                SelectFromOptions.byVisibleText("Canada").from("#country"),   // also byValue(..), byIndex(..)
                Check.the("#terms"),                                          // Uncheck.checkbox(..) to clear
                WaitFor.selector("#submit"),
                Click.on("#submit"),
                Ensure.that("#country").hasValue("ca"),
                Ensure.that("#terms").isChecked());
        ana.should(
                seeThat(SelectedOptionText.of("#country"), equalTo("Canada")),
                seeThat(Value.of("#country"), equalTo("ca")),
                seeThat(Checked.of("#terms")));
    }
}
```

### `sp-playwright/todo/ListTest.java`

```java
package todo;

import net.serenitybdd.junit5.SerenityJUnit5Extension;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.playwright.actors.PlaywrightCast;
import net.serenitybdd.screenplay.playwright.assertions.Ensure;
import net.serenitybdd.screenplay.playwright.interactions.Open;
import net.serenitybdd.screenplay.playwright.interactions.WaitFor;
import net.serenitybdd.screenplay.playwright.questions.Text;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.List;

import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;
import static org.hamcrest.Matchers.contains;

/**
 * A selector used by WaitFor, Click, Ensure.hasText and Text.of must match exactly ONE element (Playwright's strict mode).
 * For a list, wait on the first row, count with hasCount, read all texts with Text.ofEach, or pick one with ">> nth=N".
 */
@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("Reading a list on a page")
class ListTest {

    static final String LIST_PAGE = "data:text/html,<table><tbody id='rows'>"
            + "<tr class='row'><td class='title'>Fluent Python</td></tr>"
            + "<tr class='row'><td class='title'>Clean Code</td></tr>"
            + "<tr class='row'><td class='title'>Refactoring</td></tr></tbody></table>";

    @BeforeEach
    void setTheStage() {
        OnStage.setTheStage(new PlaywrightCast());
    }

    @Test
    @DisplayName("The rows of a list can be counted, read and picked by position")
    void rowsCanBeCountedReadAndPickedByPosition() {
        var ana = OnStage.theActorCalled("Ana");
        ana.attemptsTo(
                Open.url(LIST_PAGE),
                WaitFor.selector("#rows .row >> nth=0"),            // not "#rows .row": that matches 3 elements and fails
                Ensure.that("#rows .row").hasCount(3),              // hasCount is the check for "how many"
                Ensure.that("#rows .row >> nth=0 >> .title").hasText("Fluent Python"),
                Ensure.that("#rows .row >> nth=-1 >> .title").hasText("Refactoring"));
        ana.should(seeThat(Text.ofEach("#rows .title"), contains("Fluent Python", "Clean Code", "Refactoring")));
    }
}
```

### `sp-rest/api/UsersApi.java`

```java
package api;

import net.serenitybdd.screenplay.Performable;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.rest.interactions.Get;
import net.serenitybdd.screenplay.rest.interactions.Post;

public class UsersApi {
    public static Performable fetchUser(int id) {
        return Task.where("{0} fetches user " + id, Get.resource("/users/" + id));
    }

    public static Performable createPost(String title) {
        return Task.where("{0} creates a post titled " + title,
                Post.to("/posts").with(request -> request
                        .header("Content-Type", "application/json")
                        .body("{\"title\":\"" + title + "\",\"body\":\"text\",\"userId\":1}")));
    }
}
```

### `sp-rest/api/UsersApiTest.java`

```java
package api;

import net.serenitybdd.junit5.SerenityJUnit5Extension;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.rest.abilities.CallAnApi;
import net.serenitybdd.screenplay.rest.questions.LastResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;
import static org.hamcrest.Matchers.equalTo;

@ExtendWith(SerenityJUnit5Extension.class)
class UsersApiTest {

    Actor alice;

    @BeforeEach
    void setUp() {
        alice = Actor.named("Alice").whoCan(CallAnApi.at("https://jsonplaceholder.typicode.com"));
    }

    @Test
    void shouldFindUserOne() {
        alice.attemptsTo(UsersApi.fetchUser(1));
        alice.should(
                seeThat("the status code", actor -> LastResponse.received().answeredBy(actor).statusCode(), equalTo(200)),
                seeThat("the user name", actor -> LastResponse.received().answeredBy(actor).path("name"), equalTo("Leanne Graham")));
    }

    @Test
    void shouldCreateAPost() {
        alice.attemptsTo(UsersApi.createPost("Hello"));
        alice.should(seeThat("the status code", actor -> LastResponse.received().answeredBy(actor).statusCode(), equalTo(201)));
    }
}
```

### `cuke-sp/features/add_todo.feature`

```gherkin
Feature: Todo list

  Scenario: Adding a todo
    Given Toby has opened the todo app
    When Toby adds "Buy milk" to the list
    Then Toby should see "Buy milk" in the list
```

### `cuke-sp/todo/AddATodo.java`

```java
package todo;

import net.serenitybdd.screenplay.Performable;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import org.openqa.selenium.Keys;

public class AddATodo {
    public static Performable called(String item) {
        return Task.where("{0} adds a todo called " + item,
                Enter.theValue(item).into(TodoList.NEW_TODO).thenHit(Keys.ENTER));
    }
}
```

### `cuke-sp/todo/RunCucumberTests.java`

```java
package todo;

import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.PLUGIN_PROPERTY_NAME;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "todo")
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME, value = "net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel,pretty")
public class RunCucumberTests {
}
```

### `cuke-sp/todo/TheTodos.java`

```java
package todo;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.questions.Text;

import java.util.Collection;

public class TheTodos {
    // Text.ofEach(..) is a Question<Collection<String>> - not List<String>
    public static Question<Collection<String>> displayed() {
        return Text.ofEach(TodoList.ITEMS);
    }
}
```

### `cuke-sp/todo/TodoList.java`

```java
package todo;

import net.serenitybdd.screenplay.targets.Target;

public class TodoList {
    public static final Target NEW_TODO = Target.the("new todo field").locatedBy(".new-todo");
    public static final Target ITEMS = Target.the("todo items").locatedBy(".todo-list li label");
}
```

### `cuke-sp/todo/TodoStepDefinitions.java`

```java
package todo;

import io.cucumber.java.Before;
import io.cucumber.java.ParameterType;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.actions.Open;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;

import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;
import static org.hamcrest.Matchers.hasItem;

public class TodoStepDefinitions {

    @Before
    public void setTheStage() {
        OnStage.setTheStage(new OnlineCast());
    }

    @ParameterType(".*")
    public Actor actor(String name) {
        return OnStage.theActorCalled(name);
    }

    @Given("{actor} has opened the todo app")
    public void opensTheApp(Actor actor) {
        actor.attemptsTo(Open.url("https://todo-app.serenity-js.org"));
    }

    @When("{actor} adds {string} to the list")
    public void addsATodo(Actor actor, String item) {
        actor.attemptsTo(AddATodo.called(item));
    }

    @Then("{actor} should see {string} in the list")
    public void seesTheTodo(Actor actor, String item) {
        actor.should(seeThat(TheTodos.displayed(), hasItem(item)));
    }
}
```
