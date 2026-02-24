---
id: annotation-requirements
title: Annotation-Based Requirements
sidebar_position: 7
---

# Defining Requirements with Annotations

Serenity BDD organises test results into a _requirements hierarchy_, which provides the structure for the Living Documentation reports. By default, this hierarchy is derived from the package structure (for JUnit tests) or from the directory structure (for Cucumber feature files).

Starting with Serenity 5.2.5, you can define the requirements hierarchy directly using **annotations** on your test classes. This provides a simple, explicit, and declarative way to organise your tests into a meaningful structure, without having to rely on package naming conventions.

## The Requirements Hierarchy

Serenity supports a three-level requirements hierarchy:

```
Epic > Feature > Story
```

Each level is represented by an annotation:

| Annotation | Level | Purpose |
|---|---|---|
| `@Epic` | Highest | A large body of work, spanning multiple features |
| `@Feature` | Middle | A coherent piece of functionality that users value |
| `@Story` | Lowest | A specific user story or scenario group within a feature |

You can use any combination of these levels. Not all three are required &mdash; a two-level structure (`@Feature` > `@Story`) or even a single level (`@Feature` alone) works just as well.

## Basic Usage

### Feature and Story

The most common pattern is to annotate a test class with `@Feature` and `@Story`:

```java
import net.serenitybdd.annotations.Feature;
import net.serenitybdd.annotations.Story;

@Feature("Managing Todos")
@Story("Complete todo items")
class WhenCompletingTodosTest extends SerenityPlaywrightTest {

    @Test
    void shouldMarkTodoAsCompleted() {
        // ...
    }

    @Test
    void shouldToggleAllTodosToCompleted() {
        // ...
    }
}
```

This produces the following hierarchy in the requirements report:

```
Managing Todos (feature)
└── Complete todo items (story)
    ├── Should mark todo as completed
    └── Should toggle all todos to completed
```

### Multiple Stories Under the Same Feature

Several test classes can share the same feature while defining different stories:

```java
@Feature("Managing Todos")
@Story("Complete todo items")
class WhenCompletingTodosTest { /* ... */ }

@Feature("Managing Todos")
@Story("Delete todo items")
class WhenDeletingTodosTest { /* ... */ }

@Feature("Managing Todos")
@Story("Filter todo items")
class WhenFilteringTodosTest { /* ... */ }
```

This creates a single feature in the report with three child stories:

```
Managing Todos (feature)
├── Complete todo items (story)
├── Delete todo items (story)
└── Filter todo items (story)
```

### Multiple Features

Different test classes can belong to different features:

```java
@Feature("Creating Todos")
@Story("Add todo items")
class WhenAddingTodosTest { /* ... */ }

@Feature("Managing Todos")
@Story("Complete todo items")
class WhenCompletingTodosTest { /* ... */ }
```

This produces two separate features in the report:

```
Creating Todos (feature)
└── Add todo items (story)

Managing Todos (feature)
└── Complete todo items (story)
```

## The Full Three-Level Hierarchy

For larger projects, you can use `@Epic` to group related features:

```java
import net.serenitybdd.annotations.Epic;
import net.serenitybdd.annotations.Feature;
import net.serenitybdd.annotations.Story;

@Epic("E-Commerce Platform")
@Feature("Shopping Cart")
@Story("Add item to cart")
class WhenAddingItemsToCartTest { /* ... */ }

@Epic("E-Commerce Platform")
@Feature("Shopping Cart")
@Story("Remove item from cart")
class WhenRemovingItemsFromCartTest { /* ... */ }

@Epic("E-Commerce Platform")
@Feature("Checkout")
@Story("Pay with credit card")
class WhenPayingWithCreditCardTest { /* ... */ }
```

This produces a three-level hierarchy:

```
E-Commerce Platform (epic)
├── Shopping Cart (feature)
│   ├── Add item to cart (story)
│   └── Remove item from cart (story)
└── Checkout (feature)
    └── Pay with credit card (story)
```

## Using @DisplayName as the Story Name

When a test class has `@Feature` (or `@Epic`) but no `@Story` annotation, Serenity uses the JUnit 5 `@DisplayName` value as the story name. This is convenient when you want the display name in JUnit and the story name in Serenity to be the same:

```java
@Feature("Managing Todos")
@DisplayName("Complete todo items")
class WhenCompletingTodosTest {

    @Test
    @DisplayName("should mark a todo as completed")
    void shouldMarkTodoAsCompleted() {
        // ...
    }
}
```

This produces the same hierarchy as if you had written `@Story("Complete todo items")`:

```
Managing Todos (feature)
└── Complete todo items (story)
    └── should mark a todo as completed
```

When both `@Story` and `@DisplayName` are present, `@Story` takes precedence for the requirements hierarchy, and `@DisplayName` is used only for the JUnit test runner display:

```java
@Feature("Managing Todos")
@Story("Complete todo items")
@DisplayName("When completing todos")
class WhenCompletingTodosTest { /* ... */ }
```

Here, the story name in the report is "Complete todo items" (from `@Story`), not "When completing todos" (from `@DisplayName`).

:::tip When to use @Story vs @DisplayName

Use `@Story` when you want the requirements hierarchy name to differ from the JUnit display name. For example, you might want a business-oriented name in the report ("Complete todo items") while using a BDD-style name in the test runner ("When completing todos").

Use `@DisplayName` alone (without `@Story`) when the same name works for both purposes.
:::

## Using @Feature Without @Story or @DisplayName

If a test class has only `@Feature` with no `@Story` and no `@DisplayName`, the test class is placed directly under the feature. The humanised class name is used as the story name:

```java
@Feature("Managing Todos")
class WhenCompletingTodos {
    // Story name in report: "When completing todos" (from class name)
}
```

## Partial Hierarchies

You don't need to use all three levels. Any subset works:

### Feature Only

```java
@Feature("User Authentication")
@Story("Login with valid credentials")
class WhenLoggingInTest { /* ... */ }
```

```
User Authentication (feature)
└── Login with valid credentials (story)
```

### Epic and Feature (No Story)

```java
@Epic("Security")
@Feature("User Authentication")
@DisplayName("Login with valid credentials")
class WhenLoggingInTest { /* ... */ }
```

```
Security (epic)
└── User Authentication (feature)
    └── Login with valid credentials (story)
```

### Epic Only

```java
@Epic("Security")
@DisplayName("Login with valid credentials")
class WhenLoggingInTest { /* ... */ }
```

```
Security (epic)
└── Login with valid credentials (story)
```

## Inheriting Annotations from Superclasses

Annotations are inherited from parent classes. This is useful when you have a common base class for a group of tests:

```java
@Epic("TodoMVC Application")
@Feature("Managing Todos")
abstract class TodoManagementTest extends SerenityPlaywrightTest {
    // Common setup and utilities
}

@Story("Complete todo items")
class WhenCompletingTodosTest extends TodoManagementTest {
    // Inherits @Epic and @Feature from parent
}

@Story("Delete todo items")
class WhenDeletingTodosTest extends TodoManagementTest {
    // Inherits @Epic and @Feature from parent
}
```

The most specific annotation wins. If a subclass redefines an annotation that is already present on the parent, the subclass annotation takes precedence:

```java
@Feature("General Feature")
abstract class BaseTest { }

@Feature("Specific Feature")  // Overrides parent's @Feature
@Story("My Story")
class SpecificTest extends BaseTest { }
```

## Annotations vs Package-Based Requirements

Annotation-based requirements **override** the default package-based hierarchy for the annotated test class. This means you can mix both approaches in the same project:

- Test classes with `@Feature`, `@Story`, or `@Epic` annotations use the annotation-based hierarchy
- Test classes without these annotations fall back to the package-based hierarchy

:::info

When annotation-based and package-based hierarchies coexist in the same project, they appear as separate branches in the requirements tree. There is no merging between the two.

:::

## Annotations and Cucumber

If you use both JUnit tests and Cucumber feature files in the same project, each group will have its own place in the requirements hierarchy:

- **JUnit tests** with `@Feature`/`@Story` annotations create requirements based on the annotation values
- **Cucumber features** create requirements based on the directory structure and feature file names

To avoid confusion, use distinct names for annotation-based features and Cucumber features, or organise them into separate sections of your requirements hierarchy using `@Epic`.

## Working with the Screenplay Pattern

The annotations work the same way with Screenplay-based tests:

```java
import net.serenitybdd.annotations.Feature;
import net.serenitybdd.annotations.Story;
import net.serenitybdd.screenplay.ensure.Ensure;

@Feature("Managing Todos")
@Story("Filter todo items")
@DisplayName("When filtering todos (Screenplay)")
class WhenFilteringTodosScreenplayTest extends ScreenplayPlaywrightTest {

    @Test
    @DisplayName("should filter to show only active todos")
    void shouldFilterToShowOnlyActiveTodos() {
        toby.attemptsTo(
            FilterTodos.toShowActive(),
            Ensure.that(TheCurrentFilter.selected()).isEqualTo("Active"),
            Ensure.that(TheVisibleTodos.displayed())
                .containsExactly("Buy milk", "Do laundry")
        );
    }
}
```

## Tags

In addition to organising the requirements hierarchy, the `@Epic`, `@Feature`, and `@Story` annotations also generate tags in the Serenity reports. A test annotated with:

```java
@Epic("E-Commerce Platform")
@Feature("Shopping Cart")
@Story("Add item to cart")
```

will have the following tags in the report:
- `epic:E-Commerce Platform`
- `feature:Shopping Cart`
- `story:Add item to cart`

These tags can be used for filtering test results in the Serenity reports.

## Summary of Annotation Behaviour

| Annotations Present | Story Name in Report | Requirements Path |
|---|---|---|
| `@Feature` + `@Story` | `@Story` value | Feature / Story |
| `@Feature` + `@DisplayName` (no `@Story`) | `@DisplayName` value | Feature / DisplayName |
| `@Feature` only | Humanised class name | Feature / class name |
| `@Epic` + `@Feature` + `@Story` | `@Story` value | Epic / Feature / Story |
| `@Epic` + `@Feature` + `@DisplayName` | `@DisplayName` value | Epic / Feature / DisplayName |
| `@Epic` + `@Story` | `@Story` value | Epic / Story |
| `@Epic` + `@DisplayName` | `@DisplayName` value | Epic / DisplayName |
| `@Story` only | `@Story` value | Story |
| No annotations + `@DisplayName` | `@DisplayName` value | Package-based path |

## Migration from Class-Based Annotations

In earlier versions of Serenity, the `@Story` annotation required a class reference to define the requirements hierarchy:

```java
// Legacy approach (still supported)
public class MyApp {
    @Feature
    public class ShoppingCart {
        public class AddItem {}
    }
}

@Story(storyClass = MyApp.ShoppingCart.AddItem.class)
class WhenAddingItemsTest { /* ... */ }
```

This approach required creating boilerplate marker classes and only supported a two-level hierarchy (Feature > Story).

The new string-based annotations replace this with a simpler, more flexible approach:

```java
// New approach
@Feature("Shopping Cart")
@Story("Add item to cart")
class WhenAddingItemsTest { /* ... */ }
```

The legacy `@Story(storyClass = ...)` syntax is still supported for backwards compatibility.
