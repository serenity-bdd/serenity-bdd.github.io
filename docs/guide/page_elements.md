---
id: page_elements
title: Serenity Page Elements
sidebar_position: 7
---

# Serenity Page Elements

## Introduction
In most Selenium-based test automation frameworks, CSS or XPath selectors are commonly used to locate elements on a page.
Serenity BDD provides a simpler way of interacting with common UI components, which can avoid needing to use XPath or CSS expressions.

For example, the following HTML code illustrates a few different ways to represent a button:
```html
<button type="button" class="btn btn-primary">Login</button>
<input type="submit" value="Login">
```

In Serenity, we could interact with these using XPath or CSS, e.g.
```java
$("css:input[value='Login']").click()
```
or
```java
$("xpath://button[.='Login']").click()
```

However, if the UI implementation switched from one to another, the test would break.

Serenity Page Elements provide a more intuitive way to identify many common UI elements. Using Serenity Page Elements, we can use a more expression like this:

```java
import net.serenitybdd.screenplay.ui.Button;
.
.
.
$(Button.withText("Login")).click();
```

Or for a Screenplay test, you could do the following:

```java
actor.attemptsTo(
    Click.on(Button.withText("Login"))
);
```

Under the hood, Serenity will look for either `<button>` elements, or `<input>` elements of type `submit`, that display the "Login" text. 

Another common location strategy is to use attributes like `id` or `name`, or test-specific attributes like `data-test`. 

Suppose we have the following HTML code:

```html
<button type="button" class="btn btn-primary" data-test="login-button">Login</button>
```

We could click on this button with the following code:

```java
$(Button.withNameOrId("login-button")).click();
```

Or in Screenplay, we could do the following:
```java
actor.attemptsTo(
    Click.on(Button.withNameOrId("login-button"))
);
```

In this case, Serenity will look for `<button>` elements, or `<input>` elements of type `submit`, with a _value_, _id_, _data-test_ or _aria-label_ attribute of "login-button".

This means that, in many cases, you can use the `Button` class directly in your code, without having to inspect the page structure first.

Serenity Page Elements are found in the `serenity-screenplay-webdriver` module, but they can be used in both Screenplay and Action Class-based tests.

There are many different types of page elements available. All of them have the `withNameOrId()` method, but some have other methods for more specific locator strategies, such as `withLabel()` for checkboxes. 

The following table gives an overview of the different types of PageElement available:

| Element type     | Example     |
| ---------------- | ----------- |
| Buttons          | Button.withText("A Button")             |
| Checkboxes       | Checkbox.withValue("Ferrari")          |
| Dropdowns        | Dropdown.withLabel("---Pick Your Car---")          |
| Images           | Image.withAltText("Girl in a jacket")          |
| Input Fields     | InputField.withPlaceholder("Enter the customer name")         |
| Link             | Link.withIcon("glyphicon-cloud")       |
| PageElement      | PageElement.locatedBy(".item").containingText("Item 1")      |
| RadioButton      | RadioButton.withNameOrId("red-button")      |


Let's look at each type of page element in more detail.

## Buttons

The `Button` page element locates a `<button>` element with a specific tect, or an `<input>` element of type `submit` with a specific value.

Suppose we have the following HTML code:
```
<button type="button">A Button</button>
<input type="submit" value="Submit Me!" name="submit-button" data-test="submit-the-button">
<input type="button" value="Press Here">
<button type="button"><i class="glyphicon glyphicon-home"></i>Home</button>
```


We could use the following expressions to identify these elements:

| Strategy    | Example     |
| ----------- | ----------- |
| By text     | Button.withText("A Button")             |
| By value    | Button.withText("Press Here")           |
| By name     | Button.withNameOrId("submit-button")                           |
| By data-test attribute     | Button.withNameOrId("submit-the-button")        |
| By icon     | Button.withIcon("glyphicon-home")        |

:::tip
The `withNameOrId()` method will match the `id`, `name`, `data-test` or `aria-label` attribute for any kind of Page Element, so we won't always repeat them everywhere in the following sections.
:::

## Checkbox
This element will match an `<input>` element of type "checkbox", with a specified _value_,
_data-test_, or _class_ attribute value.

Suppose we have the following HTML:
```html
<input type="checkbox" id="vehicle1" value="Bike" class="vehicule-option">
<label for="vehicle1"> I have a bike</label><br>
<input type="checkbox" id="vehicle2" value="Car" class="vehicule-option">
<label for="vehicle2"> I have a car</label><br>
<input type="checkbox" id="vehicle3" value="Boat" class="vehicule-option" checked>
<label for="vehicle3"> I have a boat</label><br>
```

We could use the following expressions to identify these elements:

| Strategy    | Example     |
| ----------- | ----------- |
| By id       | Checkbox.withNameOrId("vehicle1")           |
| By value    | Checkbox.withValue("Bike")            |
| By label    | Checkbox.withLabel("I have a bike")   |

## Dropdown

The `Dropdown` page element lets us work with a `<select>` dropdown list. Suppose we had the following HTML:
```html
<label for="cars">Choose a car:</label>
<select name="cars" id="cars">
    <option value="">---Pick Your Car---</option>
    <option value="volvo">Volvo</option>
    <option value="saab">Saab</option>
    <option value="mercedes">Mercedes</option>
    <option value="audi">Audi</option>
</select>
```

We could use the following expressions to identify these elements:

| Strategy              | Example     |
| -----------           | ----------- |
| By name or id         | Dropdown.withNameOrId("cars")           |
| By label         | Dropdown.withLabel("Choose a car:")          |
| By default option         | Dropdown.withLabel("---Pick Your Car---")          |

## Image

The `Image` page element lets us interact with `<img>` elements. For example, suppose we had the following HTML code:

```html
<img src="img_girl.jpg" alt="Girl in a jacket" width="500" height="600">
```

We could use the following expressions to identify these elements:

| Strategy        | Example     |
| -----------     | ----------- |
| By alt text     | Image.withAltText("Girl in a jacket")           |
| By src          | Image.withSrc("img_girl.jpg")             |
| By src (starting with) | Image.withSrcStartingWith("img_")             |
| By src (ending with) | Image.withSrcEndingWith("girl.jpg")             |


## InputField

The `InputField` page element represents an `<input>` element in a form, with or without a `<label>`. For example, suppose we had the following HTML code:

```html
<label for="customer_name">Customer Name</label>
<input type="text" id="customer_name" name="customername" placeholder="Enter the customer name" />
```

We could use the following expressions to identify these elements:

| Strategy        | Example     |
| -----------     | ----------- |
| By name         | InputField.withNameOrId("customername")           |
| By id           | InputField.withNameOrId("customer_name")           |
| By placeholder  | InputField.withPlaceholder("Enter the customer name")              |
| By label        | InputField.withLabel("Customer Name")   |

## Link

The `Link` page element interacts with HTML `<a>` elements. For example, suppose we have the following HTML code:

```html
<!-- A simple link --->
<a href="...">Link 1</a><br/>
<!-- A link with a title -->
<a href="..." title="Link Number 2">Link 2</a><br/>
<!-- A link with an icon and a text-->
<a href="#" onclick="update('Link 3')"><i class="glyphicon glyphicon-cloud"></i>Link 3</a><br/>
```

We could use the following expressions to identify these elements:

| Strategy              | Example     |
| -----------           | ----------- |
| By link text          | Link.withText("Link 1")           |
| By link title         | Link.withTitle("Link Number 2")          |
| By partial link text  | Link.containing("ink")              |
| By starting text      | Link.startingWith("Link")    |
| By icon               | Link.withIcon("glyphicon-cloud")    |


## PageElement

The `PageElement` page element represents any element on a page. For example, suppose we have the following HTML code:

```html
<div id="container" data-test="the-container" class="a-container">
    <div class="item">
        <h2>Item 1 heading</h2>
        <div>
            <span class="description">Item 1 description</span>
        </div>
    </div>
    <div class="item">
        <h2>Item 2 heading</h2>
        <div>
            <span class="description">Item 2 description</span>
        </div>
    </div>
</div>
```

We could use the following expressions to identify elements in this code:

| Strategy                    | Example     |
| -----------                 | ----------- |
| By id                       | PageElement.withNameOrId("container")           |
| By data-test value          | PageElement.withNameOrId("the-container")           |
| Containing a text value           | PageElement.withNameOrId("item").containingText("Item 1")         |
| Containing a text value (with a CSS locator)          | PageElement.locatedBy(".item").containingText("Item 1")         |

## RadioButton

The `RadioButton` page element represents a set of radio buttons. For example, suppose we have the following HTML code:


```html
<input type="radio" id="html" name="fav_language" value="HTML" class="html-radio">
<label for="html">Choose HTML</label><br>
<input type="radio" id="css" name="fav_language" value="CSS">
<label for="css">Choose CSS</label><br>
<input type="radio" id="javascript" name="fav_language" value="JavaScript">
<label for="javascript">Choose JavaScript</label><br><br>
```

We could use the following expressions to identify these elements:

| Strategy              | Example     |
| -----------           | ----------- |
| By id          | RadioButton.withNameOrId("html")           |
| By label         | RadioButton.withLabel("Choose CSS")         |
| By value  |RadioButton.withValue("JavaScript")            |


# Using Page Elements in Action Classes

You can also use Page Elements in your normal (non-Screenplay) tests, simply by using the Page Element expression as a locator. For example:

```java
public class LoginActions extends UIInteractionSteps {

    @Step("Login as a standard user")
    public void asAStandardUser() {
        $(InputField.withPlaceholder("Username")).type("standard_user");
        $(InputField.withPlaceholder("Password")).type("secret_sauce");
        $(Button.withText("Login")).click();
    }
}
```

Page Elements can be used with all of the usual methods for locating elements in a UI Interaction class, including:

| Method              | Example     |
| -----------         | ----------- |
| $                   | $(Button.withText("Login")).click();          |
| find                | find(Button.withText("Login")).click();       |
| $$                  | $$(Checkbox.withNameOrId("vehicle-option")).forEach(WebElementFacade::click);       |
| findAll             | findAll(Checkbox.withNameOrId("vehicle-option")).forEach(WebElementFacade::click);       |
