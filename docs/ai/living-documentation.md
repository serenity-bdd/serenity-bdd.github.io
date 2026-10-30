---
id: ai_living_documentation
title: "Living Documentation: Intent, Wording and Structure"
sidebar_position: 2
description: "How scenario titles, step wording, packages, annotations and readme files become the Serenity report, and how to write tests that read as living documentation; the behaviour was run."
---

# Living Documentation: Intent, Wording and Structure

Verified against Serenity **5.4.1**. The behaviour described here was run against the example at the end of the page.

## The idea

A Serenity report is read by people who will never open the code: product owners, analysts, new team members, auditors. Its Requirements tab is a description of what the application does, built from the tests. So every scenario has two jobs: check the application, and tell a reader **what the business expects and why it matters**. A test that only passes is half done.

Write for that reader:

- The **scenario title** says the business rule or outcome, as a sentence a user would recognise.
- The **steps** read as a story in business language: who does what, in what situation, and what they should see.
- The **tests are grouped by what the application does** (ordering, searching, signing in), so the report is a navigable table of contents.

## 1. Scenario titles: the rule, not the mechanics

| Poor | Good |
|---|---|
| `testCheckout1` | `A reader sees an order number after paying` |
| `loginTest` | `Signing in with a wrong password is refused with a clear message` |
| `shouldReturn201` | `Placing an order confirms it with an order number` |
| `searchTest` | `Searching by title finds only matching books` |

- **JUnit 5:** use `@DisplayName("...")` on the method; the report title is exactly that (verified). Without it, Serenity turns the method name into words (`shouldKeepEveryBookAddedToTheBasket` becomes "Should keep every book added to the basket"), so a method name written as a sentence is also fine. A `test` prefix or a number is not.
- **Cucumber:** the `Scenario:` name is the title; write it as a sentence. Say the rule being shown, not the clicks.
- Name what the user gets or what the rule is. Avoid HTTP codes, element ids, class names and the word "test" in titles.

## 2. Steps: business language, one level above the mechanics

The report lists the steps of each scenario. Make them read like the scenario narrated.

- **Screenplay:** give every `Task` a sentence with `{0}` for the actor, and put the important data in it (verified):

  ```java
  Task.where("{0} adds '" + title + "' to the basket", ...)
  // report: Ada adds 'Refactoring' to the basket
  ```

  Tasks are business actions (`SignIn.withCredentials`, `Checkout.as`). Interactions (`Click`, `Enter`) stay inside tasks, so the report shows the business level first. Questions and `seeThat` checks read as expectations: `seeThat("the order confirmation", TheConfirmation.text(), containsString("ORD-"))`.
- **Page Objects:** annotate step-library methods with `@Step("Search the catalog for '{0}'")` (verified; `{0}` is the first parameter). Put the business verb in the step method (`shopper.searchesFor(term)`), not in the test (`driver.findElement(..)`).
- **Cucumber:** the Gherkin is the documentation. Use Given/When/Then for context, action, outcome. Keep each step about the business ("When Ada places the order"), not the UI ("When I click the button with id place-order"). Use a `Background` for context shared by all scenarios, and a `Scenario Outline` with an `Examples` table for the same rule over several values, with a meaningful column per input.
- Do not put CSS selectors, XPath, URLs, element ids, sleeps or HTTP status codes in step text. They belong inside the page object, task or step definition.
- Serenity writes the lines under a task itself: `Open.url(..)` shows as "opens the browser at http://..." and `Enter`/`Click` show the element names. You can't remove them, so keep URLs in one place and give `Target`s business names (`Target.the("email field")`). The task line above them is what the reader reads first.
- The last step of a scenario states the business expectation ("the confirmation shows an order number"), not a technical detail.

## 3. Organise by function

The report's Requirements tab is a tree. Serenity builds it from how you organise the tests:

| Style | How the tree is built | Verified result |
|---|---|---|
| JUnit 5 (any style), no annotations | the **package** path of the test class | `shop.ordering.WhenAReaderBuildsABasketTest` gives `Shop (capability)` > `Ordering (feature)` > `When a reader builds a basket test (feature)` |
| JUnit 5, annotations (recent releases; see the "Annotation-Based Requirements" docs page) | `@Epic` > `@Feature` > `@Story` on the test class | `@Epic("Buying books") @Feature("Paying for an order") @Story("Pay by card")` gives `Buying books (capability)` > `Paying for an order (feature)` > `Pay by card (story)` |
| Cucumber | the **folders** under `src/test/resources/features`, and the feature file | `features/shopping/basket.feature` gives `Shopping (capability)` > `Shopping basket (feature)` |

Rules that follow:

1. **Group by capability, then feature.** For example `ordering`, `browsing`, `accounts` as packages (or folders), with one test class (or feature file) per feature inside, each holding the scenarios of that feature. Not one class called `ShopTest` with everything in it, and not one package per technical layer.
2. **Prefer one way for the whole project.** If package-based and annotated classes are mixed, the Requirements page shows both as separate top-level trees side by side (verified), and each class is found in only one of them, so the project reads as two organisations. Follow what is already there.
3. **Class names end up in the tree.** With packages, the class name becomes the feature name, `Test` suffix included (`WhenSearchingTheCatalogTest` is shown as "When searching the catalog test", seen in a real report). Put `@DisplayName("Searching the catalog")` on the class: the feature then shows that text (verified). With annotations, the `@Feature` and `@Story` text is what the reader sees. Write these as business phrases.
4. **Cucumber:** one feature file per feature, in a folder per capability; the text under `Feature:` (a paragraph of business context before the first scenario) is shown on the feature page (verified).

## 4. Descriptions of the areas

- **Cucumber:** a `readme.md` in a features folder is the description of that capability. Its first line should be the name (`## Shopping`). Verified: it appears in the report.
- **JUnit 5:** put `readme.md` files under `src/test/resources/stories/<package path>/` (for the example `src/test/resources/stories/shop/ordering/readme.md`); the text appears in the report. The same file in `src/test/resources/shop/ordering/` was **ignored** (verified).
- **`@Narrative(text = {...})` did not appear in the JUnit 5 report** in 5.4.1 (verified, both on the class and in `package-info.java`). Don't rely on it; use the `readme.md` files.

Keep a description to a few sentences: what the area is for, and the rules that matter.

## 5. What a good scenario looks like

The shape only: `SignIn`, `Checkout`, `shopper` and the rest are the project's own classes.

Page Objects + step library:

```java
@Test
@DisplayName("Searching by title finds only matching books")
void searchingByTitle() {
    shopper.searchesFor("Refactoring");
    shopper.shouldSeeOnlyBooksCalled("Refactoring");
}
```

Screenplay:

```java
@Test
@DisplayName("A reader sees an order number after paying")
void orderNumber() {
    ada.attemptsTo(
        SignIn.withCredentials(reader),
        AddToBasket.theBook("The Pragmatic Programmer"),
        Checkout.as("Ada Lovelace").inCountry("Germany"));
    ada.should(seeThat("the order confirmation", TheConfirmation.text(), matchesPattern("Thank you! Order ORD-\\d+")));
}
```

Cucumber:

```gherkin
Feature: Placing an order

  Readers pay for the books in their basket and get an order number back.

  Scenario: A reader sees an order number after paying
    Given Ada has "The Pragmatic Programmer" in her basket
    When she checks out and accepts the terms
    Then she sees an order number like ORD-1001
```

## 6. Checking it

After the tests run, the report is what the reader sees. Run `scripts/outline.py <project>/target/site/serenity` (from the skill directory): it prints the requirements tree, the scenario titles and the steps of each scenario, and flags the mechanical problems (titles that look like method names, selectors or ids in step text, ungrouped tests). Read its output as the reader would: could someone who has never seen the code say what the application does? The `serenity-test-reviewer` agent does this check and the judgement part (`review-checklist.md`).

## 7. Not covered

Pending and manual scenarios, tags and `@WithTag`, Serenity's custom requirement types (`serenity.requirement.types`), the Jira requirements provider, `@Title`, and the exact look of the HTML report.

## Examples

These files compile against Serenity 5.4.1 (Playwright examples: 5.3.11).

### `scripts/outline.py`

```python
#!/usr/bin/env python3
"""Print the living documentation of a Serenity run the way a reader sees it, and flag mechanical problems.

usage: outline.py <serenity report dir> [--json]
  (the directory is normally <project>/target/site/serenity; only the *.json outcome files are read)

Prints: the requirements path of each test, its title, and its steps. Then a list of FLAGS for things a reader
would trip on. The flags are objective checks; whether the wording is good is for the reviewer to judge.
"""
import glob, json, os, re, sys

SELECTOR = re.compile(r"(#[\w-]+|\.[a-z][\w-]+\b.*[>\[]|//\w|\[@|By\.\w+|css=|xpath|data-testid|getByRole|\bid=)", re.I)
URL = re.compile(r"https?://|localhost|:\d{4}\b")
HTTP = re.compile(r"\b(?:status(?: code)?|HTTP)\s*[:=]?\s*[1-5]\d\d\b|\b(?:200|201|204|400|401|403|404|422|500)\b")
PLUMBING = re.compile(r"\b(sleep|wait(?:s)? \d|findElement|executeScript|sendKeys|driver\.|click(?:s)? (?:on )?(?:the )?(?:element|button with|link with)|locator)\b", re.I)


def load(d):
    rows = []
    for f in sorted(glob.glob(os.path.join(d, "*.json"))):
        try:
            j = json.load(open(f))
        except ValueError:
            continue
        if not isinstance(j, dict) or "userStory" not in j:
            continue
        steps = []

        def walk(nodes, depth):
            for s in nodes or []:
                steps.append((depth, s.get("description", "")))
                walk(s.get("children"), depth + 1)
        walk(j.get("testSteps"), 0)
        us = j.get("userStory", {})
        rows.append(dict(path=us.get("path", ""), story=us.get("storyName", ""), title=j.get("title") or j.get("name", ""),
                         result=j.get("result", ""), steps=steps, description=j.get("description") or ""))
    return rows


def flags(rows):
    out = []
    if not rows:
        return ["no outcome files found: run the tests first"]
    paths = {r["path"] for r in rows}
    stories = {r["story"] for r in rows}
    if len(rows) >= 4 and len(stories) == 1:
        out.append("all %d scenarios are in one group (%s): split them by feature" % (len(rows), next(iter(stories))))
    depths = {len(re.split(r"[/.]", p)) for p in paths if p}
    if len(rows) >= 6 and max(depths or {0}) < 2:
        out.append("no functional hierarchy: use packages/folders or @Epic/@Feature/@Story to group the scenarios")
    seen = {}
    for r in rows:
        seen.setdefault(r["title"].lower(), []).append(r["path"])
    for t, ps in seen.items():
        if len(ps) > 1:
            out.append("duplicate scenario title '%s' (%d times)" % (t, len(ps)))
    for st in sorted(stories):
        if re.search(r"[a-z]Test$|Tests$|^Test[A-Z]", st or ""):
            out.append("feature '%s' shows with its class name (\"%s\"): put @DisplayName with a business phrase on the class" % (st, re.sub(r"(?<!^)(?=[A-Z])", " ", st).lower()))
    for r in rows:
        t = r["title"]
        where = "%s: " % t
        if re.search(r"\d$", t) or re.match(r"test\b", t, re.I) or t.endswith("()") or "_" in t or " " not in t.strip():
            out.append(where + "title looks like a method name")
        if len(t.split()) < 3:
            out.append(where + "title is too short to state a rule or outcome")
        if SELECTOR.search(t) or HTTP.search(t) or URL.search(t):
            out.append(where + "title contains technical detail (selector, URL or status code)")
        if not r["steps"]:
            out.append(where + "no steps recorded (nothing for a reader to follow)")
        for _, d in r["steps"]:
            if SELECTOR.search(d):
                out.append(where + "step shows a selector or element id: '%s'" % d[:80])
            elif URL.search(d):
                out.append(where + "step shows a URL: '%s'" % d[:80])
            elif PLUMBING.search(d):
                out.append(where + "step is plumbing, not business language: '%s'" % d[:80])
            elif HTTP.search(d) and not re.search(r"\border\b|\bORD-", d, re.I):
                out.append(where + "step mentions an HTTP status: '%s'" % d[:80])
            elif re.match(r"^(click|type|enter|select|open|navigate)\w* ", d, re.I) and not re.search(r"\{|\b(she|he|they|\w+ (?:clicks|types|enters|opens))\b", d, re.I):
                out.append(where + "step is a bare UI action without an actor: '%s'" % d[:80])
    return sorted(set(out))


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    rows = load(sys.argv[1])
    fl = flags(rows)
    if "--json" in sys.argv:
        print(json.dumps(dict(scenarios=rows, flags=fl), indent=1))
        return
    tree = {}
    for r in sorted(rows, key=lambda r: (r["path"], r["title"])):
        tree.setdefault(r["path"], []).append(r)
    for path, rs in tree.items():
        print(path.replace("/", " > ") or "(no group)")
        for r in rs:
            print("  - %s  [%s]" % (r["title"], r["result"]))
            for depth, d in r["steps"]:
                print("      %s%s" % ("  " * depth, d))
    print("\nFLAGS (%d)" % len(fl))
    for f in fl:
        print("  ! " + f)
    sys.exit(1 if fl else 0)


if __name__ == "__main__":
    main()
```

### `living-docs/shop/browsing/WhenSearchingTheCatalogTest.java`

```java
package shop.browsing;

import net.serenitybdd.annotations.Step;
import net.serenitybdd.annotations.Steps;
import net.serenitybdd.junit5.SerenityJUnit5Extension;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("Searching the catalog")
class WhenSearchingTheCatalogTest {

    @Steps
    ShopperSteps shopper;

    @Test
    void searchingByTitleFindsTheMatchingBook() {
        shopper.searchesFor("Refactoring");
        shopper.shouldSeeBooks(1);
    }

    public static class ShopperSteps {
        private int found;

        @Step("Search the catalog for '{0}'")
        public void searchesFor(String term) { found = "Refactoring".equals(term) ? 1 : 0; }

        @Step("The catalog lists {0} book(s)")
        public void shouldSeeBooks(int expected) { assertThat(found).isEqualTo(expected); }
    }
}
```

### `living-docs/shop/ordering/AddToBasket.java`

```java
package shop.ordering;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Performable;
import net.serenitybdd.screenplay.Task;

public class AddToBasket {
    public static Performable theBook(String title) {
        return Task.where("{0} adds '" + title + "' to the basket",
                actor -> actor.<Basket>recall("basket").add(title));
    }
}
```

### `living-docs/shop/ordering/Basket.java`

```java
package shop.ordering;

import java.util.ArrayList;
import java.util.List;

/** A tiny in-memory basket so the example needs no browser or server. */
public class Basket {
    private final List<String> titles = new ArrayList<>();
    public void add(String title) { titles.add(title); }
    public int size() { return titles.size(); }
    public boolean isEmpty() { return titles.isEmpty(); }
}
```

### `living-docs/shop/ordering/WhenAReaderBuildsABasketTest.java`

```java
package shop.ordering;

import net.serenitybdd.annotations.Narrative;
import net.serenitybdd.junit5.SerenityJUnit5Extension;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;
import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("Building a basket")
@Narrative(text = {"As a reader", "I want to collect books in a basket", "So that I can buy them together"})
class WhenAReaderBuildsABasketTest {

    @BeforeEach
    void setTheStage() {
        OnStage.setTheStage(new OnlineCast());
    }

    @Test
    @DisplayName("A reader can add a book to an empty basket")
    void aReaderCanAddABookToAnEmptyBasket() {
        Actor ada = OnStage.theActorCalled("Ada");
        ada.remember("basket", new Basket());

        ada.attemptsTo(AddToBasket.theBook("The Pragmatic Programmer"));

        assertThat(ada.<Basket>recall("basket").size()).isEqualTo(1);
    }

    @Test
    void shouldKeepEveryBookAddedToTheBasket() {
        Actor ada = OnStage.theActorCalled("Ada");
        ada.remember("basket", new Basket());

        ada.attemptsTo(AddToBasket.theBook("Refactoring"), AddToBasket.theBook("Fluent Python"));

        assertThat(ada.<Basket>recall("basket").size()).isEqualTo(2);
    }
}
```

### `living-docs-annotated/shop/annotated/WhenPayingForAnOrderTest.java`

```java
package shop.annotated;

import net.serenitybdd.annotations.Epic;
import net.serenitybdd.annotations.Feature;
import net.serenitybdd.annotations.Story;
import net.serenitybdd.junit5.SerenityJUnit5Extension;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(SerenityJUnit5Extension.class)
@Epic("Buying books")
@Feature("Paying for an order")
@Story("Pay by card")
class WhenPayingForAnOrderTest {
    @Test
    void aReaderCanPayByCard() { }
}
```
