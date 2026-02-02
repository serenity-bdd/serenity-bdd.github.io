---
id: screenplay_playwright
sidebar_position: 3
---
# Web Testing with Serenity Screenplay and Playwright

## Introduction

Playwright is a modern browser automation library that provides cross-browser testing capabilities with excellent support for modern web applications. The `serenity-screenplay-playwright` module brings the power of Playwright to Serenity BDD's Screenplay pattern, offering an alternative to the traditional WebDriver integration.

Playwright offers several advantages over WebDriver:
- **Auto-waiting**: Automatically waits for elements to be actionable before performing actions
- **Cross-browser**: Native support for Chromium, Firefox, and WebKit
- **Network interception**: Built-in support for mocking and intercepting network requests
- **Tracing**: Record detailed traces for debugging test failures
- **Device emulation**: Easy mobile and tablet device emulation
- **Modern architecture**: Event-driven design with better reliability

## Getting Started

### Maven Dependency

Add the following dependency to your project:

```xml
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-screenplay-playwright</artifactId>
    <version>${serenity.version}</version>
</dependency>
```

### The BrowseTheWebWithPlaywright Ability

To use Playwright with Screenplay, actors need the `BrowseTheWebWithPlaywright` ability:

```java
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import com.microsoft.playwright.*;

Playwright playwright = Playwright.create();
Browser browser = playwright.chromium().launch();

Actor alice = Actor.named("Alice");
alice.can(BrowseTheWebWithPlaywright.using(browser));
```

### Configuration

You can configure Playwright behavior using environment variables or programmatically:

```java
// Launch with options
BrowserType.LaunchOptions options = new BrowserType.LaunchOptions()
    .setHeadless(false)
    .setSlowMo(100);

Browser browser = playwright.chromium().launch(options);
```

## Opening a URL

### Opening a URL directly

In Screenplay, you open a new page using the `Navigate` interaction class:

```java
alice.attemptsTo(Navigate.to("https://todomvc.com/examples/react/"));
```

### Opening the base URL

If you have configured a base URL, you can navigate to it:

```java
alice.attemptsTo(Navigate.toTheBaseUrl());
```

## Locating Elements on a Page

### The Target Class

The `Target` class in Playwright integration uses Playwright's powerful selector engine. Unlike WebDriver, Playwright provides multiple built-in selector strategies.

```java
Target SUBMIT_BUTTON = Target.the("Submit button").locatedBy("#submit-btn");

alice.attemptsTo(Click.on(SUBMIT_BUTTON));
```

### Playwright Selectors

Playwright supports a rich set of selectors:

```java
// CSS selector
Target.the("Login button").locatedBy("#login-btn")

// Text selector
Target.the("Submit button").locatedBy("text=Submit")

// Role selector (ARIA)
Target.the("Submit button").locatedBy("role=button[name='Submit']")

// XPath selector
Target.the("Email field").locatedBy("xpath=//input[@type='email']")

// Combining selectors
Target.the("Form submit").locatedBy("form >> button[type='submit']")
```

### Dynamic Targets

You can use parameterized targets for dynamic element location:

```java
Target MENU_ITEM = Target.the("{0} menu item").locatedBy("text={0}");

alice.attemptsTo(Click.on(MENU_ITEM.of("Settings")));
```

## UI Element Factories

Serenity Playwright provides convenient factory classes for locating common UI elements using Playwright's powerful selector syntax.

### Button

Locate buttons using various strategies:

```java
import net.serenitybdd.screenplay.playwright.ui.Button;

// By visible text (case-insensitive, uses role selector)
alice.attemptsTo(Click.on(Button.withText("Submit")));

// By name or ID attribute
alice.attemptsTo(Click.on(Button.withNameOrId("submit-btn")));

// By aria-label
alice.attemptsTo(Click.on(Button.withAriaLabel("Close dialog")));

// Containing specific text
alice.attemptsTo(Click.on(Button.containingText("Add to")));

// Custom locator
alice.attemptsTo(Click.on(Button.locatedBy("[data-testid='primary-action']")));
```

### InputField

Locate input fields:

```java
import net.serenitybdd.screenplay.playwright.ui.InputField;

// By name or ID
alice.attemptsTo(Enter.theValue("john@example.com").into(InputField.withNameOrId("email")));

// By placeholder text
alice.attemptsTo(Enter.theValue("Search...").into(InputField.withPlaceholder("Search products")));

// By associated label text
alice.attemptsTo(Enter.theValue("password123").into(InputField.withLabel("Password")));

// By aria-label
alice.attemptsTo(Enter.theValue("John").into(InputField.withAriaLabel("First name")));
```

### Link

Locate anchor elements:

```java
import net.serenitybdd.screenplay.playwright.ui.Link;

// By exact text
alice.attemptsTo(Click.on(Link.withText("Learn more")));

// Containing text
alice.attemptsTo(Click.on(Link.containingText("documentation")));

// By title attribute
alice.attemptsTo(Click.on(Link.withTitle("View user profile")));
```

### Checkbox

Locate checkbox inputs:

```java
import net.serenitybdd.screenplay.playwright.ui.Checkbox;

// By label text
alice.attemptsTo(Click.on(Checkbox.withLabel("Accept terms")));

// By name or ID
alice.attemptsTo(Click.on(Checkbox.withNameOrId("newsletter")));

// By value attribute
alice.attemptsTo(Click.on(Checkbox.withValue("premium")));
```

### RadioButton

Locate radio button inputs:

```java
import net.serenitybdd.screenplay.playwright.ui.RadioButton;

// By label text
alice.attemptsTo(Click.on(RadioButton.withLabel("Express shipping")));

// By value attribute
alice.attemptsTo(Click.on(RadioButton.withValue("express")));
```

### Dropdown

Locate select elements:

```java
import net.serenitybdd.screenplay.playwright.ui.Dropdown;

// By label text
alice.attemptsTo(
    SelectFromOptions.byVisibleText("Canada").from(Dropdown.withLabel("Country"))
);

// By name or ID
alice.attemptsTo(
    SelectFromOptions.byValue("us").from(Dropdown.withNameOrId("country"))
);
```

### Label

Locate label elements:

```java
import net.serenitybdd.screenplay.playwright.ui.Label;

// By text content
String labelText = alice.asksFor(Text.of(Label.withText("Email")));

// For a specific field ID
Target emailLabel = Label.forFieldId("email-input");
```

### Image

Locate image elements:

```java
import net.serenitybdd.screenplay.playwright.ui.Image;

// By alt text
alice.attemptsTo(Click.on(Image.withAltText("Product thumbnail")));

// By source URL
alice.attemptsTo(Click.on(Image.withSrc("/images/logo.png")));

// By partial source URL
alice.attemptsTo(Click.on(Image.withSrcContaining("product-123")));
```

## Interacting with Elements

### Core Interactions

The following interaction classes are available in the `net.serenitybdd.screenplay.playwright.interactions` package:

| Interaction | Purpose | Example |
|-------------|---------|---------|
| Click | Click on an element | `actor.attemptsTo(Click.on("#button"))` |
| DoubleClick | Double-click on an element | `actor.attemptsTo(DoubleClick.on("#item"))` |
| RightClick | Right-click (context menu) | `actor.attemptsTo(RightClick.on("#menu"))` |
| Enter | Type into an input field | `actor.attemptsTo(Enter.theValue("text").into("#field"))` |
| Clear | Clear an input field | `actor.attemptsTo(Clear.field("#field"))` |
| Hover | Hover over an element | `actor.attemptsTo(Hover.over("#menu"))` |
| Press | Press keyboard keys | `actor.attemptsTo(Press.key("Enter"))` |
| Check | Check a checkbox | `actor.attemptsTo(Check.checkbox("#agree"))` |
| Uncheck | Uncheck a checkbox | `actor.attemptsTo(Uncheck.checkbox("#agree"))` |
| Focus | Focus on an element | `actor.attemptsTo(Focus.on("#input"))` |
| Navigate | Navigate to a URL | `actor.attemptsTo(Navigate.to("https://..."))` |
| Upload | Upload a file | `actor.attemptsTo(Upload.file(path).to("#upload"))` |

### Click

Click on an element. Playwright automatically waits for the element to be actionable:

```java
alice.attemptsTo(Click.on("#submit-button"));
alice.attemptsTo(Click.on(SUBMIT_BUTTON));
```

### Double-Click

Double-click on an element:

```java
alice.attemptsTo(DoubleClick.on("#item"));
```

### Right-Click

Right-click to open context menus:

```java
alice.attemptsTo(RightClick.on("#file-item"));
```

### Enter Text

Type values into input fields:

```java
alice.attemptsTo(Enter.theValue("john@example.com").into("#email"));
```

You can also clear the field first:

```java
alice.attemptsTo(
    Clear.field("#email"),
    Enter.theValue("new-email@example.com").into("#email")
);
```

### Keyboard Interactions

Press keyboard keys:

```java
// Single key
alice.attemptsTo(Press.key("Enter"));

// Key combinations
alice.attemptsTo(Press.key("Control+a"));

// Multiple keys
alice.attemptsTo(Press.keys("Tab", "Tab", "Enter"));
```

### Hover

Hover over elements to trigger hover states:

```java
alice.attemptsTo(Hover.over("#dropdown-menu"));
```

### Check and Uncheck

Work with checkboxes:

```java
alice.attemptsTo(Check.checkbox("#newsletter"));
alice.attemptsTo(Uncheck.checkbox("#marketing-emails"));
```

### Focus

Focus on an element:

```java
alice.attemptsTo(Focus.on("#search-input"));
```

### Selecting from Dropdowns

Select options from dropdown menus:

```java
// By visible text
alice.attemptsTo(SelectFromOptions.byVisibleText("Red").from("#color"));

// By value attribute
alice.attemptsTo(SelectFromOptions.byValue("red").from("#color"));

// By index
alice.attemptsTo(SelectFromOptions.byIndex(2).from("#color"));

// Multiple values (for multi-select)
alice.attemptsTo(SelectFromOptions.byValue("red", "blue", "green").from("#colors"));
```

### Deselecting from Dropdowns

For multi-select dropdowns, you can deselect options:

```java
import net.serenitybdd.screenplay.playwright.interactions.DeselectFromOptions;

// Deselect by value
alice.attemptsTo(DeselectFromOptions.byValue("red").from("#colors"));

// Deselect by visible text
alice.attemptsTo(DeselectFromOptions.byVisibleText("Red").from("#colors"));

// Deselect by index
alice.attemptsTo(DeselectFromOptions.byIndex(0).from("#colors"));

// Deselect all
alice.attemptsTo(DeselectFromOptions.all().from("#colors"));
```

### Scrolling

Comprehensive scrolling capabilities:

```java
import net.serenitybdd.screenplay.playwright.interactions.Scroll;

// Scroll to an element
alice.attemptsTo(Scroll.to("#terms-and-conditions"));

// Scroll with alignment
alice.attemptsTo(Scroll.to("#section").andAlignToTop());
alice.attemptsTo(Scroll.to("#section").andAlignToCenter());
alice.attemptsTo(Scroll.to("#section").andAlignToBottom());

// Page-level scrolling
alice.attemptsTo(Scroll.toTop());
alice.attemptsTo(Scroll.toBottom());

// Scroll by specific amount (deltaX, deltaY)
alice.attemptsTo(Scroll.by(0, 500));

// Scroll to specific position
alice.attemptsTo(Scroll.toPosition(0, 1000));
```

### Drag and Drop

Drag elements from one location to another:

```java
import net.serenitybdd.screenplay.playwright.interactions.Drag;

// Basic drag and drop
alice.attemptsTo(Drag.from("#source").to("#target"));

// Alternative fluent syntax
alice.attemptsTo(Drag.the("#draggable").onto("#droppable"));

// With Targets
alice.attemptsTo(Drag.from(SOURCE_ELEMENT).to(TARGET_LOCATION));
```

### File Uploads

Upload files:

```java
Path fileToUpload = Paths.get("path/to/file.pdf");
alice.attemptsTo(Upload.file(fileToUpload).to("#file-input"));
```

### JavaScript Execution

Execute JavaScript in the page context:

```java
alice.attemptsTo(
    Evaluate.javascript("window.scrollTo(0, document.body.scrollHeight)")
);

// With return value
Object result = alice.asksFor(
    Evaluate.javascript("return document.title")
);
```

### Waiting

Wait for elements or conditions:

```java
// Wait for element to be visible
alice.attemptsTo(WaitUntil.the("#loading").isNotVisible());

// Wait for element to be hidden
alice.attemptsTo(WaitUntil.the("#spinner").isHidden());

// Wait with timeout
alice.attemptsTo(
    WaitUntil.the("#content").isVisible()
        .forNoMoreThan(Duration.ofSeconds(10))
);
```

## Querying the Web Page

### Bundled Questions

Serenity Playwright provides Question classes for querying page state:

| Question | Purpose | Example |
|----------|---------|---------|
| Text | Get element text | `actor.asksFor(Text.of("#title"))` |
| Value | Get input value | `actor.asksFor(Value.of("#email"))` |
| Attribute | Get attribute value | `actor.asksFor(Attribute.of("#link").named("href"))` |
| Presence | Check if element exists | `actor.asksFor(Presence.of("#modal"))` |
| Absence | Check if element is absent | `actor.asksFor(Absence.of("#error"))` |
| Visibility | Check if element is visible | `actor.asksFor(Visibility.of("#popup"))` |
| Enabled | Check if element is enabled | `actor.asksFor(Enabled.of("#submit"))` |
| SelectedStatus | Check if checkbox is selected | `actor.asksFor(SelectedStatus.of("#agree"))` |
| CSSValue | Get CSS property | `actor.asksFor(CSSValue.of("#box").named("color"))` |
| CurrentUrl | Get current page URL | `actor.asksFor(CurrentUrl.ofThePage())` |
| PageTitle | Get page title | `actor.asksFor(PageTitle.ofThePage())` |

### Text

Get the text content of an element:

```java
String heading = alice.asksFor(Text.of("#main-heading"));

// Multiple elements
List<String> items = alice.asksFor(Text.ofEach(".list-item"));
```

### Presence and Absence

Check whether elements exist on the page:

```java
// Check if present
boolean isPresent = alice.asksFor(Presence.of("#modal"));

// Check if absent
boolean isAbsent = alice.asksFor(Absence.of("#error-message"));
```

### Attributes

Get attribute values:

```java
String href = alice.asksFor(Attribute.of("#link").named("href"));
String placeholder = alice.asksFor(Attribute.of("#input").named("placeholder"));
```

### Current Page Information

Query page-level information:

```java
String url = alice.asksFor(CurrentUrl.ofThePage());
String title = alice.asksFor(PageTitle.ofThePage());
```

## Network Interception and Mocking

Playwright provides powerful network interception capabilities for testing.

### Intercepting Requests

```java
import net.serenitybdd.screenplay.playwright.network.InterceptNetwork;

// Intercept and fulfill with mock response
alice.attemptsTo(
    InterceptNetwork.requestsTo("**/api/users")
        .andRespondWith(
            new Route.FulfillOptions()
                .setStatus(200)
                .setBody("{\"users\": []}")
                .setContentType("application/json")
        )
);

// Intercept and respond with JSON
alice.attemptsTo(
    InterceptNetwork.requestsTo("**/api/user/123")
        .andRespondWithJson(200, Map.of(
            "id", 123,
            "name", "John Doe",
            "email", "john@example.com"
        ))
);
```

### Custom Request Handlers

For more control, use custom handlers:

```java
alice.attemptsTo(
    InterceptNetwork.requestsTo("**/api/**")
        .andHandle(route -> {
            if (route.request().method().equals("DELETE")) {
                route.fulfill(new Route.FulfillOptions()
                    .setStatus(403)
                    .setBody("{\"error\": \"Forbidden\"}"));
            } else {
                route.resume();
            }
        })
);
```

### Aborting Requests

Block specific requests (useful for testing error handling):

```java
alice.attemptsTo(
    InterceptNetwork.requestsTo("**/analytics/**").andAbort()
);
```

### Removing Routes

Remove previously registered route handlers:

```java
import net.serenitybdd.screenplay.playwright.network.RemoveRoutes;

// Remove all route handlers
alice.attemptsTo(RemoveRoutes.all());

// Remove routes for specific pattern
alice.attemptsTo(RemoveRoutes.forUrl("**/api/**"));
```

## Handling Downloads

Wait for and handle file downloads:

```java
import net.serenitybdd.screenplay.playwright.interactions.WaitForDownload;
import net.serenitybdd.screenplay.playwright.questions.DownloadedFile;

// Wait for download triggered by clicking
alice.attemptsTo(
    WaitForDownload.whilePerforming(Click.on("#download-btn"))
);

// Query download information
String filename = alice.asksFor(DownloadedFile.suggestedFilename());
String url = alice.asksFor(DownloadedFile.url());
Path path = alice.asksFor(DownloadedFile.path());

// Check for failures
String error = alice.asksFor(DownloadedFile.failure());
if (error == null) {
    // Download succeeded
}

// Save to specific location
alice.attemptsTo(
    WaitForDownload.whilePerforming(Click.on("#export-btn"))
        .andSaveTo(Paths.get("/downloads/report.pdf"))
);
```

## Console Message Capture

Capture and query browser console messages for debugging:

```java
import net.serenitybdd.screenplay.playwright.interactions.CaptureConsoleMessages;
import net.serenitybdd.screenplay.playwright.questions.ConsoleMessages;

// Start capturing console messages
alice.attemptsTo(CaptureConsoleMessages.duringTest());

// ... perform actions that may log to console ...

// Query captured messages
List<String> allMessages = alice.asksFor(ConsoleMessages.all());
List<String> errors = alice.asksFor(ConsoleMessages.errors());
List<String> warnings = alice.asksFor(ConsoleMessages.warnings());
List<String> logs = alice.asksFor(ConsoleMessages.logs());

// Filter by content
List<String> apiErrors = alice.asksFor(ConsoleMessages.containing("API error"));

// Get message counts
int totalCount = alice.asksFor(ConsoleMessages.count());
int errorCount = alice.asksFor(ConsoleMessages.errorCount());
```

## Accessibility Testing

Test accessibility compliance using ARIA snapshots:

```java
import net.serenitybdd.screenplay.playwright.questions.AccessibilitySnapshot;
import com.microsoft.playwright.options.AriaRole;

// Get accessibility snapshot of the entire page
String pageSnapshot = alice.asksFor(AccessibilitySnapshot.ofThePage());

// Get accessibility snapshot of a specific element
String navSnapshot = alice.asksFor(AccessibilitySnapshot.of("#main-nav"));
String formSnapshot = alice.asksFor(AccessibilitySnapshot.of(LOGIN_FORM));

// Get all elements with a specific ARIA role
List<String> buttons = alice.asksFor(AccessibilitySnapshot.allWithRole(AriaRole.BUTTON));
List<String> links = alice.asksFor(AccessibilitySnapshot.allWithRole(AriaRole.LINK));
List<String> headings = alice.asksFor(AccessibilitySnapshot.allWithRole(AriaRole.HEADING));
```

## Visual Regression Testing

Compare screenshots against baseline images:

```java
import net.serenitybdd.screenplay.playwright.assertions.visual.CompareScreenshot;

// Full page comparison
alice.attemptsTo(
    CompareScreenshot.ofPage()
        .againstBaseline("homepage-baseline.png")
        .withThreshold(0.01)  // 1% difference allowed
);

// Element comparison
alice.attemptsTo(
    CompareScreenshot.of("#product-card")
        .againstBaseline("product-card-baseline.png")
);

// With mask for dynamic content
alice.attemptsTo(
    CompareScreenshot.ofPage()
        .againstBaseline("dashboard.png")
        .withMask("#timestamp", "#user-avatar")
);
```

## Device Emulation

Test responsive designs with device emulation:

```java
import net.serenitybdd.screenplay.playwright.interactions.EmulateDevice;

// Emulate specific device
alice.attemptsTo(EmulateDevice.device("iPhone 14"));
alice.attemptsTo(EmulateDevice.device("Pixel 7"));
alice.attemptsTo(EmulateDevice.device("iPad Pro 11"));

// Custom viewport
alice.attemptsTo(EmulateDevice.withViewport(375, 812));

// With device scale factor
alice.attemptsTo(
    EmulateDevice.withViewport(375, 812).andDeviceScaleFactor(2)
);

// With mobile user agent
alice.attemptsTo(
    EmulateDevice.withViewport(375, 812).asMobile()
);
```

## Geolocation

Test location-based features:

```java
import net.serenitybdd.screenplay.playwright.interactions.SetGeolocation;
import net.serenitybdd.screenplay.playwright.interactions.GrantPermissions;

// First grant geolocation permission
alice.attemptsTo(GrantPermissions.for_("geolocation"));

// Set specific coordinates
alice.attemptsTo(SetGeolocation.to(51.5074, -0.1278));  // London

// Use predefined locations
alice.attemptsTo(SetGeolocation.toNewYork());
alice.attemptsTo(SetGeolocation.toLondon());
alice.attemptsTo(SetGeolocation.toTokyo());
alice.attemptsTo(SetGeolocation.toSanFrancisco());
alice.attemptsTo(SetGeolocation.toSydney());
alice.attemptsTo(SetGeolocation.toParis());

// With accuracy
alice.attemptsTo(
    SetGeolocation.to(40.7128, -74.0060).withAccuracy(100)
);

// Clear geolocation
alice.attemptsTo(SetGeolocation.clear());
```

## Permission Management

Grant or clear browser permissions:

```java
import net.serenitybdd.screenplay.playwright.interactions.GrantPermissions;
import net.serenitybdd.screenplay.playwright.interactions.ClearPermissions;

// Grant specific permissions
alice.attemptsTo(GrantPermissions.for_("geolocation"));
alice.attemptsTo(GrantPermissions.for_("notifications", "camera", "microphone"));

// Clear all permissions
alice.attemptsTo(ClearPermissions.all());
```

## Clock Control

Test time-dependent functionality:

```java
import net.serenitybdd.screenplay.playwright.interactions.ControlClock;
import java.time.Instant;

// Install fake clock
alice.attemptsTo(ControlClock.install());

// Set to specific time
alice.attemptsTo(
    ControlClock.setTo(Instant.parse("2024-01-15T10:30:00Z"))
);

// Advance time
alice.attemptsTo(ControlClock.advanceBy(Duration.ofHours(2)));
alice.attemptsTo(ControlClock.advanceBy(Duration.ofMinutes(30)));

// Resume normal time flow
alice.attemptsTo(ControlClock.resume());
```

## Tracing

Record detailed traces for debugging:

```java
import net.serenitybdd.screenplay.playwright.interactions.tracing.StartTracing;
import net.serenitybdd.screenplay.playwright.interactions.tracing.StopTracing;

// Start tracing with options
alice.attemptsTo(
    StartTracing.withScreenshots()
        .andSnapshots()
        .named("login-flow")
);

// ... perform test actions ...

// Stop and save trace
alice.attemptsTo(
    StopTracing.andSaveTo(Paths.get("traces/login-flow.zip"))
);

// View trace: npx playwright show-trace traces/login-flow.zip
```

Trace options:
- `withScreenshots()` - Include screenshots in trace
- `andSnapshots()` - Include DOM snapshots
- `andSources()` - Include source files
- `named(String)` - Set trace name

## PDF Generation

Generate PDFs from pages (Chromium only, headless mode):

```java
import net.serenitybdd.screenplay.playwright.interactions.GeneratePDF;

// Basic PDF generation
alice.attemptsTo(
    GeneratePDF.ofCurrentPage()
        .andSaveTo(Paths.get("output/report.pdf"))
);

// With options
alice.attemptsTo(
    GeneratePDF.ofCurrentPage()
        .withFormat("A4")
        .inLandscape()
        .withMargins("1cm", "1cm", "1cm", "1cm")
        .withHeaderTemplate("<div>Header</div>")
        .withFooterTemplate("<div>Page <span class='pageNumber'></span></div>")
        .displayHeaderAndFooter()
        .printBackground()
        .andSaveTo(Paths.get("output/report.pdf"))
);
```

## Switching Contexts

### Frames

Work with iframes:

```java
// Switch to frame by name or ID
alice.attemptsTo(Switch.toFrame("payment-iframe"));

// Switch to frame by Target
alice.attemptsTo(Switch.toFrame(Target.the("payment").locatedBy("#payment-frame")));

// Switch back to main frame
alice.attemptsTo(Switch.toMainFrame());
```

### Windows and Tabs

Handle multiple windows and tabs:

```java
// Switch to new window/tab
alice.attemptsTo(Switch.toNewWindow());

// Close current window
alice.attemptsTo(CloseCurrentWindow.now());
```

## Best Practices

### Use Target Constants

Define targets as constants for reusability and maintainability:

```java
public class LoginPage {
    public static Target EMAIL_FIELD = Target.the("email field")
        .locatedBy("#email");
    public static Target PASSWORD_FIELD = Target.the("password field")
        .locatedBy("#password");
    public static Target LOGIN_BUTTON = Target.the("login button")
        .locatedBy("role=button[name='Log in']");
}
```

### Prefer Role Selectors

Use ARIA role selectors for more resilient tests:

```java
// Instead of CSS
Target.the("Submit").locatedBy("button.primary-btn")

// Prefer role selector
Target.the("Submit").locatedBy("role=button[name='Submit']")
```

### Use UI Element Factories

For common elements, use the UI element factories:

```java
// Instead of
Click.on(Target.the("Add button").locatedBy("role=button[name='Add to Cart']"))

// Use
Click.on(Button.withText("Add to Cart"))
```

### Network Mocking for Isolation

Mock API responses to isolate UI tests:

```java
@BeforeEach
void setupMocks() {
    actor.attemptsTo(
        InterceptNetwork.requestsTo("**/api/products")
            .andRespondWithJson(200, mockProducts)
    );
}
```

### Use Tracing for Debugging

Enable tracing when debugging test failures:

```java
alice.attemptsTo(
    StartTracing.withScreenshots().andSnapshots()
);

// Run your test...

alice.attemptsTo(
    StopTracing.andSaveTo(Paths.get("trace.zip"))
);
// View with: npx playwright show-trace trace.zip
```

## Quick Reference Tables

### All Interactions

The following tables provide a complete reference of all available Playwright Screenplay interactions.

#### Element Interactions

| Interaction | Description | Example |
|-------------|-------------|---------|
| `Click.on(target)` | Click on an element | `Click.on("#submit")` |
| `DoubleClick.on(target)` | Double-click on an element | `DoubleClick.on("#item")` |
| `RightClick.on(target)` | Right-click (context menu) on an element | `RightClick.on("#file")` |
| `Hover.over(target)` | Move mouse over an element | `Hover.over("#menu")` |
| `Focus.on(target)` | Set focus to an element | `Focus.on("#search")` |

#### Text Input Interactions

| Interaction | Description | Example |
|-------------|-------------|---------|
| `Enter.theValue(text).into(target)` | Type text into a field | `Enter.theValue("john@test.com").into("#email")` |
| `Clear.field(target)` | Clear an input field | `Clear.field("#search")` |
| `Press.key(key)` | Press a keyboard key | `Press.key("Enter")` |
| `Press.key(combo)` | Press a key combination | `Press.key("Control+a")` |
| `Press.keys(keys...)` | Press multiple keys in sequence | `Press.keys("Tab", "Tab", "Enter")` |

#### Checkbox & Radio Interactions

| Interaction | Description | Example |
|-------------|-------------|---------|
| `Check.checkbox(target)` | Check a checkbox | `Check.checkbox("#agree")` |
| `Uncheck.checkbox(target)` | Uncheck a checkbox | `Uncheck.checkbox("#newsletter")` |

#### Dropdown Interactions

| Interaction | Description | Example |
|-------------|-------------|---------|
| `SelectFromOptions.byVisibleText(text).from(target)` | Select by visible text | `SelectFromOptions.byVisibleText("Red").from("#color")` |
| `SelectFromOptions.byValue(value).from(target)` | Select by value attribute | `SelectFromOptions.byValue("red").from("#color")` |
| `SelectFromOptions.byIndex(index).from(target)` | Select by index (0-based) | `SelectFromOptions.byIndex(2).from("#color")` |
| `DeselectFromOptions.byValue(value).from(target)` | Deselect by value | `DeselectFromOptions.byValue("red").from("#colors")` |
| `DeselectFromOptions.byVisibleText(text).from(target)` | Deselect by visible text | `DeselectFromOptions.byVisibleText("Red").from("#colors")` |
| `DeselectFromOptions.byIndex(index).from(target)` | Deselect by index | `DeselectFromOptions.byIndex(0).from("#colors")` |
| `DeselectFromOptions.all().from(target)` | Deselect all options | `DeselectFromOptions.all().from("#colors")` |

#### Scrolling Interactions

| Interaction | Description | Example |
|-------------|-------------|---------|
| `Scroll.to(target)` | Scroll element into view | `Scroll.to("#footer")` |
| `Scroll.to(target).andAlignToTop()` | Scroll with top alignment | `Scroll.to("#section").andAlignToTop()` |
| `Scroll.to(target).andAlignToCenter()` | Scroll with center alignment | `Scroll.to("#section").andAlignToCenter()` |
| `Scroll.to(target).andAlignToBottom()` | Scroll with bottom alignment | `Scroll.to("#section").andAlignToBottom()` |
| `Scroll.toTop()` | Scroll to page top | `Scroll.toTop()` |
| `Scroll.toBottom()` | Scroll to page bottom | `Scroll.toBottom()` |
| `Scroll.by(deltaX, deltaY)` | Scroll by pixel amount | `Scroll.by(0, 500)` |
| `Scroll.toPosition(x, y)` | Scroll to absolute position | `Scroll.toPosition(0, 1000)` |

#### Drag and Drop Interactions

| Interaction | Description | Example |
|-------------|-------------|---------|
| `Drag.from(source).to(target)` | Drag from source to target | `Drag.from("#item").to("#dropzone")` |
| `Drag.the(source).onto(target)` | Alternative fluent syntax | `Drag.the("#card").onto("#column")` |

#### Navigation Interactions

| Interaction | Description | Example |
|-------------|-------------|---------|
| `Navigate.to(url)` | Navigate to a URL | `Navigate.to("https://example.com")` |
| `Navigate.toTheBaseUrl()` | Navigate to configured base URL | `Navigate.toTheBaseUrl()` |

#### Frame & Window Interactions

| Interaction | Description | Example |
|-------------|-------------|---------|
| `Switch.toFrame(nameOrId)` | Switch to iframe by name/ID | `Switch.toFrame("payment-iframe")` |
| `Switch.toFrame(target)` | Switch to iframe by Target | `Switch.toFrame(PAYMENT_FRAME)` |
| `Switch.toMainFrame()` | Switch back to main frame | `Switch.toMainFrame()` |
| `Switch.toNewWindow()` | Switch to new window/tab | `Switch.toNewWindow()` |
| `CloseCurrentWindow.now()` | Close current window | `CloseCurrentWindow.now()` |

#### File Interactions

| Interaction | Description | Example |
|-------------|-------------|---------|
| `Upload.file(path).to(target)` | Upload a file | `Upload.file(Paths.get("doc.pdf")).to("#upload")` |
| `WaitForDownload.whilePerforming(action)` | Wait for download during action | `WaitForDownload.whilePerforming(Click.on("#download"))` |
| `WaitForDownload...andSaveTo(path)` | Save download to path | `WaitForDownload.whilePerforming(...).andSaveTo(path)` |

#### JavaScript Interactions

| Interaction | Description | Example |
|-------------|-------------|---------|
| `Evaluate.javascript(script)` | Execute JavaScript | `Evaluate.javascript("window.scrollTo(0,0)")` |

#### Wait Interactions

| Interaction | Description | Example |
|-------------|-------------|---------|
| `WaitUntil.the(target).isVisible()` | Wait for element visibility | `WaitUntil.the("#modal").isVisible()` |
| `WaitUntil.the(target).isNotVisible()` | Wait for element to hide | `WaitUntil.the("#spinner").isNotVisible()` |
| `WaitUntil.the(target).isHidden()` | Wait for element to be hidden | `WaitUntil.the("#loading").isHidden()` |
| `WaitUntil...forNoMoreThan(duration)` | Set custom timeout | `WaitUntil.the("#data").isVisible().forNoMoreThan(Duration.ofSeconds(10))` |

#### Network Interactions

| Interaction | Description | Example |
|-------------|-------------|---------|
| `InterceptNetwork.requestsTo(pattern).andRespondWith(options)` | Mock response with options | `InterceptNetwork.requestsTo("**/api/**").andRespondWith(...)` |
| `InterceptNetwork.requestsTo(pattern).andRespondWithJson(status, data)` | Mock JSON response | `InterceptNetwork.requestsTo("**/users").andRespondWithJson(200, users)` |
| `InterceptNetwork.requestsTo(pattern).andHandle(handler)` | Custom request handler | `InterceptNetwork.requestsTo("**/api/**").andHandle(route -> ...)` |
| `InterceptNetwork.requestsTo(pattern).andAbort()` | Block requests | `InterceptNetwork.requestsTo("**/analytics/**").andAbort()` |
| `RemoveRoutes.all()` | Remove all route handlers | `RemoveRoutes.all()` |
| `RemoveRoutes.forUrl(pattern)` | Remove routes for pattern | `RemoveRoutes.forUrl("**/api/**")` |

#### Device & Environment Interactions

| Interaction | Description | Example |
|-------------|-------------|---------|
| `EmulateDevice.device(name)` | Emulate a device | `EmulateDevice.device("iPhone 14")` |
| `EmulateDevice.withViewport(width, height)` | Set custom viewport | `EmulateDevice.withViewport(375, 812)` |
| `EmulateDevice...andDeviceScaleFactor(factor)` | Set device scale | `EmulateDevice.withViewport(375, 812).andDeviceScaleFactor(2)` |
| `EmulateDevice...asMobile()` | Add mobile user agent | `EmulateDevice.withViewport(375, 812).asMobile()` |
| `SetGeolocation.to(lat, lng)` | Set geolocation | `SetGeolocation.to(51.5074, -0.1278)` |
| `SetGeolocation.to(lat, lng).withAccuracy(m)` | Set geolocation with accuracy | `SetGeolocation.to(40.7128, -74.0060).withAccuracy(100)` |
| `SetGeolocation.toNewYork()` | Set to New York | `SetGeolocation.toNewYork()` |
| `SetGeolocation.toLondon()` | Set to London | `SetGeolocation.toLondon()` |
| `SetGeolocation.toTokyo()` | Set to Tokyo | `SetGeolocation.toTokyo()` |
| `SetGeolocation.toSanFrancisco()` | Set to San Francisco | `SetGeolocation.toSanFrancisco()` |
| `SetGeolocation.toSydney()` | Set to Sydney | `SetGeolocation.toSydney()` |
| `SetGeolocation.toParis()` | Set to Paris | `SetGeolocation.toParis()` |
| `SetGeolocation.clear()` | Clear geolocation | `SetGeolocation.clear()` |
| `GrantPermissions.for_(permissions...)` | Grant browser permissions | `GrantPermissions.for_("geolocation", "camera")` |
| `ClearPermissions.all()` | Clear all permissions | `ClearPermissions.all()` |

#### Clock Control Interactions

| Interaction | Description | Example |
|-------------|-------------|---------|
| `ControlClock.install()` | Install fake clock | `ControlClock.install()` |
| `ControlClock.setTo(instant)` | Set clock to specific time | `ControlClock.setTo(Instant.parse("2024-01-15T10:30:00Z"))` |
| `ControlClock.advanceBy(duration)` | Advance clock | `ControlClock.advanceBy(Duration.ofHours(2))` |
| `ControlClock.resume()` | Resume normal time flow | `ControlClock.resume()` |

#### Debugging & Tracing Interactions

| Interaction | Description | Example |
|-------------|-------------|---------|
| `StartTracing.withScreenshots()` | Start trace with screenshots | `StartTracing.withScreenshots()` |
| `StartTracing...andSnapshots()` | Include DOM snapshots | `StartTracing.withScreenshots().andSnapshots()` |
| `StartTracing...andSources()` | Include source files | `StartTracing.withScreenshots().andSources()` |
| `StartTracing...named(name)` | Set trace name | `StartTracing.withScreenshots().named("login-test")` |
| `StopTracing.andSaveTo(path)` | Stop and save trace | `StopTracing.andSaveTo(Paths.get("trace.zip"))` |
| `CaptureConsoleMessages.duringTest()` | Start capturing console | `CaptureConsoleMessages.duringTest()` |

#### PDF Generation Interactions

| Interaction | Description | Example |
|-------------|-------------|---------|
| `GeneratePDF.ofCurrentPage().andSaveTo(path)` | Generate PDF | `GeneratePDF.ofCurrentPage().andSaveTo(Paths.get("page.pdf"))` |
| `GeneratePDF...withFormat(format)` | Set paper format | `GeneratePDF.ofCurrentPage().withFormat("A4")` |
| `GeneratePDF...inLandscape()` | Use landscape orientation | `GeneratePDF.ofCurrentPage().inLandscape()` |
| `GeneratePDF...withMargins(t, r, b, l)` | Set margins | `GeneratePDF.ofCurrentPage().withMargins("1cm", "1cm", "1cm", "1cm")` |
| `GeneratePDF...printBackground()` | Include background graphics | `GeneratePDF.ofCurrentPage().printBackground()` |
| `GeneratePDF...displayHeaderAndFooter()` | Show header/footer | `GeneratePDF.ofCurrentPage().displayHeaderAndFooter()` |

#### Visual Testing Interactions

| Interaction | Description | Example |
|-------------|-------------|---------|
| `CompareScreenshot.ofPage().againstBaseline(name)` | Compare full page | `CompareScreenshot.ofPage().againstBaseline("home.png")` |
| `CompareScreenshot.of(target).againstBaseline(name)` | Compare element | `CompareScreenshot.of("#card").againstBaseline("card.png")` |
| `CompareScreenshot...withThreshold(threshold)` | Set diff threshold | `CompareScreenshot.ofPage().againstBaseline("x.png").withThreshold(0.01)` |
| `CompareScreenshot...withMask(targets...)` | Mask dynamic elements | `CompareScreenshot.ofPage().againstBaseline("x.png").withMask("#time")` |

---

### All Questions

The following tables provide a complete reference of all available Playwright Screenplay questions.

#### Element State Questions

| Question | Return Type | Description | Example |
|----------|-------------|-------------|---------|
| `Presence.of(target)` | `Boolean` | Element exists in DOM | `actor.asksFor(Presence.of("#modal"))` |
| `Absence.of(target)` | `Boolean` | Element not present | `actor.asksFor(Absence.of("#error"))` |
| `Visibility.of(target)` | `Boolean` | Element is visible | `actor.asksFor(Visibility.of("#popup"))` |
| `Enabled.of(target)` | `Boolean` | Element is enabled | `actor.asksFor(Enabled.of("#submit"))` |
| `SelectedStatus.of(target)` | `Boolean` | Checkbox/radio is selected | `actor.asksFor(SelectedStatus.of("#agree"))` |

#### Element Content Questions

| Question | Return Type | Description | Example |
|----------|-------------|-------------|---------|
| `Text.of(target)` | `String` | Get element text content | `actor.asksFor(Text.of("#title"))` |
| `Text.ofEach(target)` | `List<String>` | Get text of all matching elements | `actor.asksFor(Text.ofEach(".item"))` |
| `Value.of(target)` | `String` | Get input field value | `actor.asksFor(Value.of("#email"))` |
| `Attribute.of(target).named(attr)` | `String` | Get attribute value | `actor.asksFor(Attribute.of("#link").named("href"))` |
| `CSSValue.of(target).named(prop)` | `String` | Get CSS property value | `actor.asksFor(CSSValue.of("#box").named("color"))` |

#### Page Information Questions

| Question | Return Type | Description | Example |
|----------|-------------|-------------|---------|
| `CurrentUrl.ofThePage()` | `String` | Get current page URL | `actor.asksFor(CurrentUrl.ofThePage())` |
| `PageTitle.ofThePage()` | `String` | Get page title | `actor.asksFor(PageTitle.ofThePage())` |

#### Download Questions

| Question | Return Type | Description | Example |
|----------|-------------|-------------|---------|
| `DownloadedFile.suggestedFilename()` | `String` | Get suggested filename | `actor.asksFor(DownloadedFile.suggestedFilename())` |
| `DownloadedFile.url()` | `String` | Get download URL | `actor.asksFor(DownloadedFile.url())` |
| `DownloadedFile.path()` | `Path` | Get download file path | `actor.asksFor(DownloadedFile.path())` |
| `DownloadedFile.failure()` | `String` | Get failure reason (null if success) | `actor.asksFor(DownloadedFile.failure())` |
| `DownloadedFile.download()` | `Download` | Get Playwright Download object | `actor.asksFor(DownloadedFile.download())` |

#### Console Message Questions

| Question | Return Type | Description | Example |
|----------|-------------|-------------|---------|
| `ConsoleMessages.all()` | `List<String>` | Get all console messages | `actor.asksFor(ConsoleMessages.all())` |
| `ConsoleMessages.errors()` | `List<String>` | Get console errors | `actor.asksFor(ConsoleMessages.errors())` |
| `ConsoleMessages.warnings()` | `List<String>` | Get console warnings | `actor.asksFor(ConsoleMessages.warnings())` |
| `ConsoleMessages.logs()` | `List<String>` | Get console logs | `actor.asksFor(ConsoleMessages.logs())` |
| `ConsoleMessages.info()` | `List<String>` | Get console info messages | `actor.asksFor(ConsoleMessages.info())` |
| `ConsoleMessages.containing(text)` | `List<String>` | Get messages containing text | `actor.asksFor(ConsoleMessages.containing("error"))` |
| `ConsoleMessages.count()` | `Integer` | Get total message count | `actor.asksFor(ConsoleMessages.count())` |
| `ConsoleMessages.errorCount()` | `Integer` | Get error count | `actor.asksFor(ConsoleMessages.errorCount())` |
| `ConsoleMessages.allCaptured()` | `List<CapturedConsoleMessage>` | Get full message objects | `actor.asksFor(ConsoleMessages.allCaptured())` |

#### Accessibility Questions

| Question | Return Type | Description | Example |
|----------|-------------|-------------|---------|
| `AccessibilitySnapshot.ofThePage()` | `String` | Get page accessibility tree | `actor.asksFor(AccessibilitySnapshot.ofThePage())` |
| `AccessibilitySnapshot.of(target)` | `String` | Get element accessibility tree | `actor.asksFor(AccessibilitySnapshot.of("#nav"))` |
| `AccessibilitySnapshot.allWithRole(role)` | `List<String>` | Get elements by ARIA role | `actor.asksFor(AccessibilitySnapshot.allWithRole(AriaRole.BUTTON))` |

---

### UI Element Factories

Factory classes for locating common UI elements.

| Factory | Methods | Example |
|---------|---------|---------|
| `Button` | `withText(text)`, `withNameOrId(id)`, `withAriaLabel(label)`, `containingText(text)`, `locatedBy(selector)` | `Button.withText("Submit")` |
| `InputField` | `withNameOrId(id)`, `withPlaceholder(text)`, `withLabel(label)`, `withAriaLabel(label)`, `locatedBy(selector)` | `InputField.withPlaceholder("Email")` |
| `Link` | `withText(text)`, `containingText(text)`, `withTitle(title)`, `locatedBy(selector)` | `Link.withText("Learn more")` |
| `Checkbox` | `withLabel(label)`, `withNameOrId(id)`, `withValue(value)`, `locatedBy(selector)` | `Checkbox.withLabel("I agree")` |
| `RadioButton` | `withLabel(label)`, `withNameOrId(id)`, `withValue(value)`, `locatedBy(selector)` | `RadioButton.withValue("express")` |
| `Dropdown` | `withLabel(label)`, `withNameOrId(id)`, `locatedBy(selector)` | `Dropdown.withLabel("Country")` |
| `Label` | `withText(text)`, `withExactText(text)`, `forFieldId(id)`, `locatedBy(selector)` | `Label.forFieldId("email")` |
| `Image` | `withAltText(alt)`, `withSrc(src)`, `withSrcContaining(text)`, `locatedBy(selector)` | `Image.withAltText("Logo")` |

---

## Migration from WebDriver

When migrating from `serenity-screenplay-webdriver`:

1. **Ability Change**:
   - Replace `BrowseTheWeb` with `BrowseTheWebWithPlaywright`

2. **Selector Syntax**:
   - CSS and XPath work similarly
   - Add role selectors for more robust tests
   - Use `>>` for chaining selectors instead of nesting

3. **Waiting**:
   - Playwright auto-waits; explicit waits are less necessary
   - Remove most `WaitUntil` calls

4. **Locator Methods**:
   - `By.id("x")` becomes `"#x"`
   - `By.cssSelector("x")` becomes `"x"`
   - `By.xpath("x")` becomes `"xpath=x"`

5. **New Capabilities**:
   - Use network interception for mocking APIs
   - Use tracing for debugging
   - Use device emulation for responsive testing

## Complete Example

```java
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import net.serenitybdd.screenplay.playwright.interactions.*;
import net.serenitybdd.screenplay.playwright.questions.*;
import net.serenitybdd.screenplay.playwright.ui.*;
import static org.assertj.core.api.Assertions.assertThat;

public class ShoppingCartTest {

    Actor alice = Actor.named("Alice");

    @BeforeEach
    void setup() {
        Playwright playwright = Playwright.create();
        Browser browser = playwright.chromium().launch();
        alice.can(BrowseTheWebWithPlaywright.using(browser));
    }

    @Test
    void shouldAddItemToCart() {
        alice.attemptsTo(
            Navigate.to("https://shop.example.com"),
            Click.on(Button.withText("Electronics")),
            Click.on(Link.containingText("Laptop")),
            SelectFromOptions.byVisibleText("16GB").from(Dropdown.withLabel("Memory")),
            Click.on(Button.withText("Add to Cart"))
        );

        String cartCount = alice.asksFor(Text.of("#cart-count"));
        assertThat(cartCount).isEqualTo("1");

        List<String> cartItems = alice.asksFor(Text.ofEach(".cart-item-name"));
        assertThat(cartItems).contains("Laptop");
    }
}
```

## Further Reading

- [Playwright Java Documentation](https://playwright.dev/java/docs/intro)
- [Serenity Screenplay Pattern](screenplay_fundamentals)
- [Web Testing with WebDriver](screenplay_webdriver)
