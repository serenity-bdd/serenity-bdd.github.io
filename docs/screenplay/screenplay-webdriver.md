---
id: screenplay_webdriver
sidebar_position: 2
---
# Web Testing with Serenity Screenplay
## Introduction
Web tests are a common use case for Screenplay scenarios, where we try to model user behaviour and interactions with the system. In this section, we will learn how to interact with a web application using the Screenplay WebDriver integration.

## Opening a URL

### Opening a URL directly
In Screenplay, you open a new page using the `Open` interaction class. This can work with a URL, e.g:

```java
toby.attemptsTo(Open.url("https://todomvc.com/examples/angularjs/#/"));
```

### Opening the URL of a Page Object
If you have defined a Page Object with a default url, you can open a page object by referring to the page object class. Suppose we have defined the following Serenity Page Object, and set the `@DefaultUrl` value to the TodoMVC application URL:

```java
@DefaultUrl("https://todomvc.com/examples/angularjs/#/")
public class TodoMvcPage extends PageObject {}
```

We can now open this page using the `Open.browserOn()` method, like this:

```java
toby.attemptsTo(Open.browserOn().the(TodoMvcPage.class));
```

### Using named pages

Sometimes it can be convenient to store the URLs for different environments or servers in the `serenity.conf` file, and refer to them by the name of the property in our test code. 

For example, imagine we wanted to run our tests against the Angular, React and Polymer implementations of the TodoMVC app. Each application has a different URL, that we could store in the `serenity.conf` file like this:

```json
pages {
    angular = "https://todomvc.com/examples/angularjs/#/"
    react = "https://todomvc.com/examples/react/#/"
    polymer = "https://todomvc.com/examples/polymer/index.html"
}
```

Next, we can refer to these properties in our code using the `thePageNamed()` method, like this:

```java
toby.attemptsTo(Open.browserOn().thePageNamed("pages.react"));
```

## Locating elements on a page

In Screenplay, you can use several different strategies to locate the elements you need to interact with. 

### CSS and XPath

The simplest way to locate an element is to use a CSS or XPath expression, as shown here:

```java
toby.attemptsTo(
    Click.on("#login-button")
);
```

Or

```java
toby.attemptsTo(
    Click.on("//input[@id='login-button']")
);
```

Serenity will interpret the string to determine whether it is an XPath or CSS expression. In some cases there may be some ambiguity, and Serenity will default to XPath. If this is not intended, you can use the "xpath:" or "css:" prefixes to specify which type of locator you mean:

```java
toby.attemptsTo(
    Click.on("css:input[name=login-button]")
);
```


### Using Selenium locators
You can also use any of the standard Selenium locator (`org.openqa.selenium.By`) classes, as shown here:

```java
toby.attemptsTo(
    Click.on(By.id("login-button"))
);
```

### Using the Target class

Using text or `By` locators has the advantage of being concise, but it can lead to poorly readable test reports, especially when complex or non-meaningful XPath or CSS locators are used. In Screenplay, the `Target` class allows us to give a locator strategy a more meaningful name. For example, consider the following code:

```java
toby.attemptsTo(Click.on("//button[.='Add']"));
```

In the Serenity reports, this step will be reported as "Toby clicks on //button[.='Add']", which is not very readable. 

If we represent this button using the `Target` class, we can associate a label such as "Add to cart button", like this:

```java
Target ADD_TO_CART = Target.the("Add to cart button").located(By.cssSelector("//button[.='Add']"));

toby.attemptsTo(Click.on(ADD_TO_CART));
```

In the reports, this step will now appear as "Toby clicks on Add to cart button".

### Using dynamic targets

You can also include variables into a `Target` locator, to make your locators dynamic. You can include numbered paramaters using "{0}", "{1}", etc, and then use the `of()` method to instantiate the `Target with the value you are interested in. For example, we could create a generic locator for a button containing a given text like this:

```java
Target BUTTON_WITH_LABEL = Target.the("{0} button").located(By.cssSelector("//button[.='{0}']"));

toby.attemptsTo(Click.on(BUTTON_WITH_LABEL.of('Add')));
```

We could even use this dynamic target to define other targets with specific values, like this:

```java
Target BUTTON_WITH_LABEL = Target.the("{0} button").located(By.cssSelector("//button[.='{0}']"));
Target ADD_BUTTON = BUTTON_WITH_LABEL.of('Add');

toby.attemptsTo(Click.on(ADD_BUTTON));
```

### Using Page Elements

Serenity [Page Elements](../../docs/guide/page_elements) provide a more intuitive and readable way to locate elements on a page, often without needing to use XPath or CSS. With Page Elements, you can identify elements using expressions such as the following
  - `Click.on(Button.withText("Add to cart"))`
  - `Enter.theValue(").into(InputField.withPlaceholder("Enter the customer name"))`
  - `Click.on(PageElement.locatedBy(".item").containingText("Bananas"))`

You can learn more about Page Elements [here](../../docs/guide/page_elements).

## Interacting with elements

In this section we will see how to interact with elements on a web page using Selenium WebDriver with Serenity Screenplay.

### Screenplay Interaction classes
You can find the standard Serenity interaction classes in the `net.serenitybdd.screenplay.actions` package.
 
| Interaction                    | Purpose              | Example     |
| -----------                    | --------             | ----------- |
| Clear                          | Clear an input field | `actor.attemptsTo(Clear.field("#firstname"))`           |
| Click                          | Click on an element  | `actor.attemptsTo(Click.on("#add-to-cart"))`           |
| DoubleClick | Double-click on an element using a Selenium Action | `actor.attemptsTo(DoubleClick.on("#add-to-cart"))`           |
| Enter                          | Type a value into an input field  | `actor.attemptsTo(Enter.theValue("scott").into("#username"))`           |
| Evaluate                       | Evaluate a Javascript expression  | `actor.attemptsTo(Evaluate.javascript("window.localStorage.clear();")`           |
| Hit                            | Press a key  | `actor.attemptsTo(Hit.the(Keys.ENTER).into("#searchterms"))`           |
| JavaScriptClick                | Click on an element using Javascript rather than Selenium | `actor.attemptsTo(JavaScriptClick.on("#add-to-cart"))`           |
| MoveMouse                      | Move the mouse over a specified element | `actor.attemptsTo(MoveMouse.to("#main-menu"))`           |
| Open | Open a specific URL or page | `actor.attemptsTo(Open.url("https://www.google.com"))`|
| PerformOn | Perform one or more actions on several elements | See below |
| RightClick | Right-click on a given element | `actor.attemptsTo(RightClick.on("#menu"))` |
| Scroll | Scroll to an element using Javascript | `actor.attemptsTo(Scroll.to("#terms-and-conditions"))` |
| SelectFromOptions | Select a value in an HTML dropdown | `actor.attemptsTo(SelectFromOptions.byVisibleText("Red").from("#color"))` |
| SendKeys | Enter a value into a field using the Selenium sendKeys() method |`actor.attemptsTo(SendKeys.of("scott").into("#username"))`           | 
| SetCheckbox                  | Check a checkbox field | `actor.attemptsTo(SetCheckbox.of("#subscribe-to-newsletter").toTrue())`           |
| Switch   | Switch to another window or tab | `actor.attemptsTo(Switch.toNewWindow())`           |
| Upload    | Upload a file using an HTML upload field |  `actor.attemptsTo(Upload.theFile(pathToFile)).to("#uploaded-file"))`           |
| WithDevTools | Perform an action with the Chrome DevTools | See below |

The more important interactions are described in more detail in the following sections.

### Clear

The `Clear` interaction resets the value of an HTML form element.

```java
        dina.attemptsTo(Clear.field(By.id("first-name")));
```

### Click

Click on a button or element.

```java
        dina.attemptsTo(Click.on("#some-button"));
```

Sometimes an element is not in an interactable state when we first attempt to click on it. For example, it may be disabled, or not yet visible on the page. In these cases, we can ask Serenity to wait for the element to be enabled using the `afterWaitingUntilEnabled()` method:

```java
        dina.attemptsTo(Click.on("#some-button").afterWaitingUntilEnabled());
```

If the element is not yet rendered, we can use the `afterWaitingUntilPresent()` method:

```java
        dina.attemptsTo(Click.on("#some-button").afterWaitingUntilPresent());
```

In both these cases, Serenity will wait for up to 5 seconds by default for the element to be present or available. You can configure this timeout using the `webdriver.wait.for.timeout` system property (defined in milliseconds).

### DoubleClick

Double-click on a button or element, using Selenium Actions.

```java
        dina.attemptsTo(DoubleClick.on("#some-button"));
```

### Enter and SendKeys

There are two ways to enter a value into a field. 

`Enter` will enter a value into a field, first waiting until the field is enabled, and then clearing the field of any current values, before entering the specified value.

```java
        dina.attemptsTo(Enter.theValue("Sarah-Jane").into("#firstName"));
```

`SendKeys` will perform the equivalent of Selenium `sendKeys()`, you can use `Enter.keyValue()` instead of `Enter.theValue()`

```java
        dina.attemptsTo(SendKeys.of("Sarah-Jane").into("#firstName"));
```

### Evaluate a Javascript expression

The `Evaluate` task executes a JavaScript command in the context of the currently selected frame or window. For example, the following code will clear the local storage in Dina's browser:

```java
dina.attemptsTo(Evaluate.javascript("window.localStorage.clear()"));
```

If the script has a return value (i.e. if the script contains a return statement), you can also retrieve the value returned by a Javascript expression. You can do this in two ways. The first is to use the `result()` method to turn the `Evaluate` action into a question. You can see an example here:

```java
        Long result = (Long) dina.asksFor(Evaluate.javascript("return 1 + 1").result());
        assertThat(result).isEqualTo(2);
```

The type of the object returned by WebDriver is as follows: 
 * For an HTML element, this method returns a `WebElement`
 * For a decimal, a `Double` is returned
 * For a non-decimal number, a `Long` is returned
 * For a boolean, a `Boolean` is returned
 * For all other cases, a `String` is returned.
 * For an array, return a `List<Object>` with each object following the rules above. We support nested lists.
 * For a map, return a `Map<String, Object>` with values following the rules above.

### Hit a particular key

You can enter any Selenium key or key-combination using the `Enter` task. You may also want to use the `Hit` task for more readability. The `Hit` interaction class is similar to the `Enter` class, but takes a list of one or more `Keys` values:

```java
        dina.attemptsTo(Enter.theValue("Sarah-Jane").into(By.id("firstName")));
        dina.attemptsTo(Hit.the(Keys.TAB).into(By.id("firstName")));
```

### Working with checkboxes

You can check or uncheck a checkbox element by clicking on it using the `Click` interaction. If you want to be sure that that the element is checked or unchecked, you can also use the `SetCheckbox` class, to either check or uncheck the field.

For example, to check the Terms & Conditions checkbox on a form, you might use the following:

```java
        dina.attemptsTo(SetCheckbox.of("#terms-and-conditions").toTrue());
```

And to uncheck it, you could do this:

```java
        dina.attemptsTo(SetCheckbox.of("#terms-and-conditions").toFalse());
```

Since enabling and disabling checkboxes involves clicking, we can also use the `afterWaitingUntilEnabled()` and `afterWaitingUntilPresent()` methods available with the `Click` interaction class, e.g.

```java
        dina.attemptsTo(
            SetCheckbox.of("#terms-and-conditions").toFalse()
                                                   .afterWaitingUntilEnabled());
```

### JavaScriptClick

Sometimes it is useful to be able to bypass Selenium and perform a click() directly with JavaScript. We can do this with the `JavaScriptClick` class. The class has the same API as the `Click` class, e.g.

```java
        dina.attemptsTo(JavaScriptClick.on("#button"));
```

### Moving the mouse

We can move the mouse to an element on the page using `MoveMouse`, e.g.

```java
        dina.attemptsTo(MoveMouse.to("#button"));
```

If we need to perform one or more actions on the element once we have moved the cursor over it, we can do that using the `andThen()` method with a Lambda expression, which is passed the Actions object. For example, to click on the button after moving the cursor to it, we could do the following:

```java
        dina.attemptsTo(MoveMouse.to(BUTTON).andThen(actions -> actions.click()));
```

### Performing actions on collections of elements

We can also perform actions on a collection of elements. Suppose we have an HTML page containing a list of checkboxes like this:

```html
    <div>
        <label>Condiments:</label>
        Salt <input type="checkbox" id="salt" class="condiment" name="salt">
        Pepper <input type="checkbox" id="pepper" class="condiment" name="pepper">
        Sauce <input type="checkbox" id="sause" class="condiment" name="sauce">
    </div>
```

We could check each of these checkboxes in one go by using the `PerformOn.eachMatching()` method. This takes two parameters:
 - A locator (a Target, `By` locator, or CSS or XPath expression)
 - A lambda expression that accepts a `WebElementFacade`

If we wanted to click on each of these checkboxes, we could do the following:

```java
         dina.attemptsTo(
            PerformOn.eachMatching(".condiment", WebElementFacade::click)
        );
```

You can also use Screenplay performables, as shown in this example:
```java
        dina.attemptsTo(
            PerformOn.eachMatching(".condiment", 
                checkbox -> dina.attemptsTo(SetCheckbox.of(checkbox).toTrue()))
        );
```

### RightClick

You can right-click on an element using the `RightClick` class. This will use the Selenium `contextClick()` action method:

```java
        dina.attemptsTo(RightClick.on("#button"));
```

### Scrolling elements into view

Sometimes it can be useful to scroll to a specific element on the page. You can do this with the `Scroll` class, like this, which uses Javascript to scroll the element into view.

```java
        dina.attemptsTo(Scroll.to(By.id("#button")));
```

This class uses the Javascript `scrollIntoView()` method, which by default will scroll the screen so that the top of the element will be aligned to the top of the visible area of the scrollable ancestor. You can also align the bottom of the element to the bottom of the visible area of the scrollable ancestor, using the `andAlignToBottom()` method, e.g.

```java
        dina.attemptsTo(Scroll.to(By.id("#button")).andAlignToBottom());
```

### Selecting from dropdowns

We can select a value from a dropdown using the `SelectFromOptions` class. Suppose we have the following HTML code:

```html
        <select id="color">
            <option value="red">Red</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
        </select>
```

We can select the second of these options in any of the following ways:
```java
    dina.attemptsTo(SelectFromOptions.byVisibleText("Green").from("#color"));
    dina.attemptsTo(SelectFromOptions.byValue("green").from("#color"));
    dina.attemptsTo(SelectFromOptions.byIndex(1).from("#color"));
```

We can retrieve the current value of a dropdown list using the `SelectedValue` Question class, e.g.

```java
    String selectedValue = dina.asksFor(SelectedValue.of(COLOR_"#color")));
```

### Switching to another window or frame

We can switch to a new window or tab using the `Switch` class. For example, the following code opens a link in a new tab and switches control to this tab:

```java
        dina.attemptsTo(
                Click.on("#link-that-opens-a-new-tab"),
                Switch.toNewWindow()
        );
```

If there are only two windows or tabs open, we can switch back to the original window by using the `Switch.toTheOtherWindow()` method:

```java
        dina.attemptsTo(
                Switch.toTheOtherWindow()
        );
```

Another option is to use the name or handle of the window you want to switch to, using `Switch.toWindow()`:

```java
        dina.attemptsTo(
                Switch.toWindow(originalWindowHandle)
        );
```

Alternatively, if you know the title of the window or tab, you can use the `Switch.toWindowTitled()` method:

```java
        dina.attemptsTo(
                Switch.toWindowTitled("The other window")
        );
```

Although HTML frames are considered obsolete for modern applications, they are still around in some older applications. You can interact with frames using the following methods:

Other Selenium switch functions are handled by the following methods:

| Interaction                    | Purpose              | Selenium equivalent     |
| -----------                    | --------             | -----------             |
| Switch.toFrame(index)          | Select a frame by its (zero-based) index. Selecting a frame by index is equivalent to the JS expression window.frames[index] where "window" is the DOM window represented by the current context. Once the frame has been selected, all subsequent calls on the WebDriver interface are made to that frame. | `driver.switch().toFrame(index)` |
| Switch.toFrame(nameOrId)       | Select a frame by its name or ID. Frames located by matching name attributes are always given precedence over those matched by ID. | `driver.switch().toFrame(nameOrId)` |
| Switch.toParentFrame()         | Change focus to the parent context. If the current context is the top level browsing context, the context remains unchanged. | `driver.switchTo().parentFrame()` |
| Switch.toDefaultContext()      |  Selects either the first frame on the page, or the main document when a page contains iframes. | `driver.switch().toDefaultContext()` |

Other Selenium switch functions are handled by the following methods:

| Interaction                    | Purpose              | Selenium equivalent     |
| -----------                    | --------             | -----------             |
| Switch.toActiveElement()       | Switches to the element that currently has focus within the document currently "switched to", or the body element if this cannot be detected. This matches the semantics of calling "document.activeElement" in Javascript. | `driver.switchTo().activeElement()`           |


### Dealing with Alert dialogs

We can work with HTML Alert dialogs using the `Switch.toAlert()` method. For example, the following code will switch the current window to the current alert dialog:
```java
        dina.attemptsTo(
                Switch.toAlert()
        );
```

We can query the text of the alert using the `HtmlAlert.text()` Question class:

```java
        dina.attemptsTo(
                Switch.toAlert()
        );
        assertThat(dina.asksFor(HtmlAlert.text())).isEqualTo("Are you sure?");
```

We can also accept or dismiss the alert message using the `Switch.toAlert().andAccept()` and `Switch.toAlert().andDismiss()` methods respectively:

```java
        dina.attemptsTo(
                Switch.toAlert().andAccept()
        );
```

### Upload

The simplest way to upload a file to an HTML upload field (one that has a type of 'file') is to use the `Upload` task. Suppose we have the following HTML form field:

```html
        <input type="file" id="upload-file" name="filename">
```

We can upload a file to this field as shown here:

```java
    Path fileToUpload = ...
    dina.attemptsTo(Upload.theFile(fileToUpload).to("#upload-file"));
```

If you are running the tests on a remote machine, you can use the Selenium Local File Detector. The Local File Detector allows the transfer of files from the client machine to the remote server. For example, if a test needs to upload a file to a web application, a remote WebDriver can automatically transfer the file from the local machine to the remote web server during runtime. This allows the file to be uploaded from the remote machine running the test.

```java
    Path fileToUpload = ...
    dina.attemptsTo(Upload.theFile(fileToUpload).to("#upload-file").usingLocalFileDetector());
```

You can also upload a file on the classpath resources using the `Upload.theClasspathResource()` method, as shown here:

```java
    Path fileToUpload = ...
    dina.attemptsTo(Upload.theClasspathResource("some/resource/path.txt").to("#upload-file"));
```

## Working with Chrome DevTools 

Many browsers provide "DevTools" – a set of tools that are integrated with the browser that developers can use to debug web apps and explore the performance of their pages. Google Chrome’s DevTools make use of a protocol called the Chrome DevTools Protocol (or “CDP” for short). As the name suggests, this is not designed for testing, nor to have a stable API, so functionality is highly dependent on the version of the browser.

In Serenity Screenplay, we can access the Selenium 4 DevTools library using the `WithDevTools.perform()` method. For example:

```java
        final List<Metric> metricList = new ArrayList<>();

        dina.attemptsTo(
                WithDevTools.perform(
                        devTools -> {
                            devTools.createSession();
                            devTools.send(Performance.enable(Optional.empty()));
                            metricList.addAll(devTools.send(Performance.getMetrics()));
                        }
                )
        );
```

If we want to use DevTools to retrieve a specific value, we can use the `DevToolsQuery` class:
```java
        List<Metric> metrics = dina.asksFor(
                DevToolsQuery.ask().about(devTools -> {
                    devTools.createSession();
                    devTools.send(Performance.enable(Optional.empty()));
                    return devTools.send(Performance.getMetrics());
                })
        );
```

## Querying the web page

Serenity Screenplay also gives you a large number of options when it comes to querying a web UI. Most involve special types of Question class.

In Screenplay web tests, you can simply implement a question which returns the object type you are interested, and then query the UI in a conventional Webdriver way. For example, suppose we want to read the user name on a page, which can be located with the ".user-name" CSS selector.

Screenplay assertion to check the user name might look like this:

```java
    sam.should(seeThat(TheUserName.value(), equalTo("sam")));
```

We could create a TheUserName question class to query this field as follows:

```java
@Subject("the displayed username")
public class TheUserName implements Question<String> {
    @Override
    public String answeredBy(Actor actor) {
        return BrowseTheWeb.as(actor).findBy(".user-name").getText();
    }

    public static Question<String> value() { return new TheUserName(); }
}
```
Here we use BrowseTheWeb.as(actor) to get the Serenity WebDriver API for the actor’s webdriver instance, which gives access to the full range of Serenity Page Object methods.

We could also use a Target to locate the user name, which we could store in a separate Page Component class:

```java
public static Target USER_NAME = Target.the("User name").locatedBy(".user-name");
```

We can then use the resolveFor() method to find the element matching that target in the actor’s browser:

```java
@Subject("the displayed username")
public class TheUserName implements Question<String> {

    @Override
    public String answeredBy(Actor actor) {
        return USER_NAME.resolveFor(actor).getText();
    }

    public static Question<String> value() { return new TheUserName(); }
}
```

Alternatively, we could write this class as a factory, and use a lambda expression instead of a fully blown Question class:

```java
public class TheUserName {

    public static Question<String> value() {
        return actor -> USER_NAME.resolveFor(actor).getText();
    }
}
```

In this case, the `@Subject` annotation will have no effect, so we need to pass in the name of the object we are checking in the Screenplay assertion:

```java
sam.should(seeThat("the displayed username", TheUserName.value(), equalTo("sam")));
```

So far you have seen how Screenplay questions work in detail. This will help you implement your own if you need to. However Serenity also provides a number of shortcuts related to querying web pages, which you will find in the net.serenitybdd.screenplay.questions package, which allow you to write much more concise automation code. 

## Bundled WebDriver Questions

Serenity provides many bundled Question classes in the `net.serenitybdd.screenplay.questions` package that a short-hand way of querying a web page. For example, the `Text` class lets us retrieve the text content of an element, like this:

```java
String name = sam.asksFor(Text.of("#name"));
```

If there are many matching entries, we can retrieve them all using the `ofEach()` method:

```java
Collection<String> names = sam.asksFor(Text.ofEach(".name"));
```

The full list of Web Question classes is provided here.

### Absence

Determine whether an element is _not_ present or visible on the page. A field that is present in the dom but is not rendered will be considered absent.

```java
boolean isNotPresent = sam.asksFor(Absence.of("#no-such-field"));
```

### Attribute

Check the value of an HTML attribute of a specified element.

```java
String placeholderText = sam.asksFor(Attribute.of(".new-todo").named("placeholder"));
```

### CheckboxValue

Determine whether a checkbox has been checked or not.

```java
boolean termsAndConditionsApproved = sam.asksFor(CheckboxValue.of("#tnc"));
```

### CSSValue

Retrieve the value of a specific CSS attribute of an element.

```java
String font = sam.asksFor(CSSValue.of(target).named("font"));
```

### CurrentlyEnabled

Check whether an element is currently enabled, without waiting.

```java
boolean isCurrentlyEnabled = sam.asksFor(CurrentlyEnabled.of("#some-button"));
```

### CurrentVisibility

Check whether an element is currently visible, without waiting.

```java
boolean isCurrentlyVisible = sam.asksFor(CurrentVisibility.of("#some-button"));
```

### Disabled

Check whether an element is disabled.

```java
boolean isDisabled = sam.asksFor(Disabled.of("#a-disabled-button"));
```

### Displayed

Check whether an element is displayed. If the element is not currently displayed, the test will wait for a short delay to give it time to be displayed.

```java
boolean isDisplayed = sam.asksFor(Displayed.of("#some-button"));
```

### Enabled

Check whether an element is enabled. If the element is not currently enabled, the test will wait for a short delay to give it time to be enabled.

```java
boolean isEnabled = sam.asksFor(Enabled.of("#some-button"));
```

### Presence

Check whether an element is present in the DOM. An invisible or hidden element can still be present in the DOM.

### SelectedStatus

Alternative to `CheckboxValue`

```java
boolean termsAndConditionsApproved = sam.asksFor(SelectedStatus.of("#tnc"));
```

# Text

To fetch the text value of an element, we can use the `Text` class:

```java
String introductionText = sam.asksFor(Text.of("#introduction"));
```

### TextContent

In some cases, we may need to read the `textContent` HTML property to get the text we need. To do this, we can use the `TextContent` class rather than `Text`. This returns the text content of the specified element, and all its descendants.

### TheCoordinates

Return the coordinates of a specified element.

### TheLocation

Return where on the page is the top left-hand corner of the rendered element.

### TheSize

What is the width and height of the rendered element?

### Value

Return the HTML `value` attribute of a specified element.

### Visibility

Determine whether this web element present and visible on the screen

### Working with Dropdowns

We can query the current selected value or values of an HTML `<SELECT>` element using the `SelectedValue`, `SelectedValues`, `SelectedVisibleTextValue` and `SelectedVisibleTextValue` Question classes.

For example, to find the current selected value of an HTML dropdown list, we could use the following code:

```java
String selectedColorValue = dina.asksFor(SelectedValue.of("#color-dropdown"));
```

To get the visible text of the selected item, we would use `SelectedVisibleTextValue`:

```java
String selectedColor = dina.asksFor(SelectedVisibleTextValue.of("#color-dropdown"));
```

For multi-selects, we can use `SelectedValues` and `SelectedVisibleTextValues`:

```java
List<String> selectedColors = dina.asksFor(SelectedValues.of("#color-dropdown"));
```

We can retrieve the current list of options using `SelectOptions`, which returns the list of visible texts for each option:

```java
List<String> selectedColors = dina.asksFor(SelectOptions.of("#color-dropdown"));
```

If we need the `value` attribute of each dropdown option, we can use `SelectOptionValues`, e.g.:

```java
List<String> selectedColors = dina.asksFor(SelectOptionValues.of("#color-dropdown"));
```



## Handling Waits

### Using the WaitUntil class
If you need to wait for an element to appear with Serenity Screenplay, there are a few options available. By default, Serenity will wait for a short delay if you try to interact with an element that is not on the page. However, you can ensure that this wait is sufficient by using the `WaitUntil` class, as shown here: 

```java
private final static Target DELAYED_BUTTON = PageElement.locatedBy("#delayed-button");

dina.attemptsTo(
    WaitUntil.the(DELAYED_BUTTON, WebElementStateMatchers.isVisible()),
    Click.on(DELAYED_BUTTON)
);
```

This code will wait until the element is visible before proceeding to the Click action. The timeout can be configured (in milliseconds) using the `webdriver.timeouts.implicitlywait` property, which is 5 seconds by default.

If you need to have a finer control over the timeout duration for specific situations, you can specify this by adding the `forNoMoreThan()` method, which lets you specify an explicit timeout:

```java
dina.attemptsTo(
    WaitUntil.the(DELAYED_BUTTON, isVisible()).forNoMoreThan(10).seconds()
);
 ```

You can also wait for other conditions. For example, to wait until an element dissapears, you can use the `isNotVisible()` matcher:

```java
dina.attemptsTo(
    WaitUntil.the(DISAPPEARING_BUTTON, isNotVisible())
);
```

The following matchers are available in the `WebElementStateMatchers` class. Note that all of the following methods also have a negative equivalent (`isNotVisible()`, `isNotEmpty()` etc.).

| Matcher                    | Purpose                              |
| -----------                | --------                             |
| containsText(...)          | Check that an element contains a specific text value |
| containsOnlyText(...)      | Check that an element contains exactly a specific text value |
| containsSelectOption(...)  | Check that a dropdown element contains a specific text value as an option|
| isClickable                | Check that an element is visible and enabled |
| isEmpty                    | Check that an element is not visible or contains an empty string |
| isEnabled                  | Check that an element is enabled |
| isPresent                  | Check that an element is present on the page |
| isSelected                 | Check that an element is selected     | 
| isVisible                  | Check that an element is visible     | 

### Waiting for a WebDriver condition

Another option is to wait for a WebDriver condition (which can be found in the `org.openqa.selenium.support.ui.ExpectedConditions` class), e.g.

```java
dina.attemptsTo(
        WaitUntil.the(
                invisibilityOfElementLocated(By.id("disappearing-button")))
);
```

### Waiting for Targets

You can also place a specific wait condition on a `Target` object. You can do this either when you define the `Target` variable (if it should be applied any time you interact with this element), or only when you interact with the element, as shown below:

```java
private final static Target INVISIBLE_BUTTON 
    = PageElement.locatedBy("#invisible-button");

dina.attemptsTo(
    Click.on(INVISIBLE_BUTTON.waitingForNoMoreThan(Duration.ofSeconds(3)))
);
```