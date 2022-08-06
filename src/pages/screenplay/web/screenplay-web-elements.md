# Advanced Screenplay Web Elements

In addition to the `Target` class, Screenplay gives us a number of convenient classes that we can use to locate various kinds of common web elements. While they may not work in all circumstances (depending on the UI libraries used to create the page, sometimes what appears to be a button on the page may actually be some other kind of HTML element), they can come in very handy.

All of these classes can be found in the `net.serenitybdd.screenplay.webtests.ui` package. All of these classes can be used anywhere a `Target` can be used.

## Page Elements
Any HTML element can identified using the `byNameOrId()` method. This method with check the following attributes, ignoring case:
  - id
  - name
  - data-test
  - aria-label

## Forms
### Buttons

An HTML button can be represented either by the `<button>` tag, or by an `<input>` tag with a `value` of "submit". For `<button>` tags, the text content of the element will be used. For `<input>` tags, the `value` will be used. In both cases, the comparison is case insensitive.

The `Button` class is quite flexible. Consider the following HTML representations of a button element:
* `<button type='button'/>Login</button>`
* `<input type='submit' value='login'/>`
* `<input type='submit' data-test='login'/>`

All of these would work with the following code:

```java
wendy.attemptsTo(Click.on(Button.withText("Login")));
```

### Input Fields

An HTML text field represented by an `<input>` tag.

Input fields can be referred to by `name`, `id` or `test-data` using the `called()` method, e.g:

```java
wendy.attemptsTo(
  Enter.theValue("standard_user").into(InputField.called("username"))
);
```

Input fields can also be referred to by their placeholder text, e.g.

```java
wendy.attemptsTo(
  Enter.theValue("Walk the dog", Keys.ENTER)
       .into(InputField.withPlaceholder("What needs to be done?"))
);
```

Another useful option is to identiy fields by their label. A `label` field uses the `for` attribute to reference the `id` attribte of the actual field,

```html
<form>
    <label for="name">Customer Name</label>
    <input type="text" id="name" />
</form>
```

You can use the `InputField.withLabel()` to identify the field referred to by a label field like this:

```java
wendy.attemptsTo(
  Type.theValue("Some value").into(InputField.withLabel("Customer Name"))
);
```

### Text Areas

Text areas (`<textarea>`) are handed using the `InputField` class, and work in the same way.

### Radio Buttons

You can select radio button values using the `RadioButton` class. Radio buttons can be selected by ID, value or label. For example, suppose you have the following HTML code:

```html
<input type="radio" id="html" name="fav_language" value="HTML">
<label for="html">Choose HTML</label><br>
<input type="radio" id="css" name="fav_language" value="CSS">
<label for="css">Choose CSS</label><br>
<input type="radio" id="javascript" name="fav_language" value="JavaScript">
<label for="javascript">Choose JavaScript</label>
```

All of the following would be valid ways to select the various radio buttons in this form:

```java
wendy.attemptsTo(
  Click.on(RadioButton.called("html");
);

wendy.attemptsTo(
  Click.on(RadioButton.withLabel("Choose CSS");
);

wendy.attemptsTo(
  Click.on(RadioButton.withValue("JavaScript");
);
```

### Checkboxes

Checkboxes are simple affairs; we simply click on them. We can identify them in a similar way to radio buttons, using the `Checkbox` class. Suppose we had the following checkbox fields.

```html
<input type="checkbox" id="vehicle1" value="Bike">
<label for="vehicle1"> I have a bike</label><br>
<input type="checkbox" id="vehicle2" value="Car">
<label for="vehicle2"> I have a car</label><br>
<input type="checkbox" id="vehicle3" value="Boat" checked>
<label for="vehicle3"> I have a boat</label>
```

We could interact with these fields using code like the following:
```java
wendy.attemptsTo(
  Click.on(Checkbox.called("vehicle2");
);

wendy.attemptsTo(
  Click.on(Checkbox.withLabel("I have a car");
);

wendy.attemptsTo(
  Click.on(Checkbox.withValue("Car");
);
```

### Dropdowns

Dropdown lists represented by `<SELECT>` element, as illustrated in the following example:

```HTML
<label for="cars">Choose a car:</label>
<select name="cars" id="cars">
    <option value="">---Pick Your Car---</option>
    <option value="volvo">Volvo</option>
    <option value="saab">Saab</option>
    <option value="mercedes">Mercedes</option>
    <option value="audi">Audi</option>
</select>
```

There are many ways we can interact with a dropdown list like this using Screenplay UI elements.

#### Locating the dropdown

We can locate the dropdown on the page in a similar fashion to what we have already seen.

```java
wendy.attemptsTo(
  Select.option("Volvo").from(Dropdown.called("cars"))
);

wendy.attemptsTo(
  Select.option("Volvo").from(Dropdown.withLabel("Choose a car:"))
);
```

We also have the possibilty of selecting a dropdown based on the first entry in the list, e.g.
```java
wendy.attemptsTo(
  Select.option("Volvo").from(Dropdown.called("cars"))
);

wendy.attemptsTo(
  Select.option("Volvo").from(Dropdown.withDefaultOption("---Pick Your Car---"))
);
```

#### Selecting an option in a dropdown list

As with standard Selenium, we can select an option using either the `value` attribute, the visible text, or the index value:

```java
wendy.attemptsTo(
  Select.option("Volvo").from(Dropdown.called("cars"))
);

wendy.attemptsTo(
  Select.value("volvo").from(Dropdown.called("cars"))
);

wendy.attemptsTo(
  Select.optionNumber(0).from(Dropdown.called("cars"))
);
```


#### Multiselect Dropdowns

If the option is a multiselect dropdown list, we can select several values at the same time. Here are some examples:

```java
wendy.attemptsTo(
  Select.options("Spitfire","Hurricane").from(Dropdown.called("planes"))
);

wendy.attemptsTo(
  Select.values("spitfire","hurricane").from(Dropdown.called("planes"))
);

wendy.attemptsTo(
  Select.optionNumbers(0,1).from(Dropdown.called("planes"))
);
```

## Elements

In addition to HTML forms, there are many other elements we can interact with using the bundled Screenplay classes.

### Elements on a page

Sometimes we need to refer to specific elements on a page; this comes in handy when we want to locate an element in a particular context.

For example, in the following HTML code there are two submit buttons. each in different sections of the page. The only way to distinguish them is to refer to the `<h2>` header elements.

```html
<div class="section">
    <h2>Section 1</h2>
    <button value="Submit">Submit</button>
</div>
<div class="section">
    <h2>Section 2</h2>
        <button value="Submit">Submit</button>
</div>
```

We can locate an element inside another element using the `inside` method, like this:

```java
sarah.attemptsTo(
        Click.on(Button.called("Submit")
                .inside(PageElement.containingText(".section","Section 2")))
);
```

The `PageElement` class gives us a convenient way to refer to an element on the page which specific characteristics. For example, the one shown here looks for an element matching the CSS selector ".section", that also contains the text "Section 2".

If we simply wanted to find an element with a specific name, inside some other element, we could also use a CSS or XPath locator directly for that:

```java
sarah.attemptsTo(
        Click.on(Button.called("Submit").inside("#section2"))
);
```

### Images

We can also refer to image elements. Suppose we had an HTML element like this one:

```html
<img src="img_girl.jpg" alt="Girl in a jacket" width="500" height="600">
```

We could interact with this `img` element using its `alt` attribute like this:

```java
wendy.attemptsTo(
        Click.on(Image.withAltText("Girl in a jacket"))
);
```

### Links

Links are represented using anchor (`<a>`) tags in HTML. We can represent links in a number of ways using the `Link` class, including:

* By the displayed text: `Link.called()` and `Link.containing()`
* By the title attribute: `Link.withTitle()`

For example, consider the following HTML code:
```html
  <a title="Purchase Widgets">Add To Cart</a>
```

We could locate this element with any of the following:

```java
wendy.attemptsTo(Click.on(Link.called("Add To Cart"))

wendy.attemptsTo(Click.on(Link.containing("Cart"))

wendy.attemptsTo(Click.on(Link.withTitle("Purchase Widgets"))
```

All the comparisons are case-insensitive and exclude surrounding spaces.

### Nested Elements

Most elements can also be identified by their class, although this is generally only used in conjunction with filtering operations, as a class attribute is not a good guarantee of uniqueness. For example, suppose we had the following HTML:

```html
  <div class="item">
      <h2>Item 1</h2>
      <button value="add">Add to cart</button>
  </div>
  <div class="item">
      <h2>Item 2</h2>
      <button value="add">Add to cart</button>
  </div>
```

Suppose we want to click on the Add to cart button for Item 2. We could identify the `<div>` containing "Item 2" with the following `PageElement`:

```
PageElement.called("item").containingText("Item 2")
```

Then we could use the `inside()` method we saw earlier to find the "add to cart" button inside this section:

```java
actor.attemptsTo(
  Click.on(
    Button.called("Add to cart")
          .inside(PageElement.called("item").containingText("Item 2"))
  )
);
```
