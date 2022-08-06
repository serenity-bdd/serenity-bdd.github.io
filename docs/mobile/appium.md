---
id: appium
title: Running Serenity Tests on Appium
sidebar_position: 4
---

# Running tests on Appium
Serenity supports running tests on mobile devices/emulators out of the box with [Appium](http://appium.io).

First, you will need to install Appium:
```
(sudo) npm install -g appium --chromedriver_version="102.0"
```

Afterwards Appium is available as command and can be started by invoking the following command:

```
appium
```

Then adapt `serenity.properties` to run on an Android device:

```
webdriver.driver= appium
webdriver.base.url = http://www.google.com/
appium.hub = http://127.0.0.1:4723/wd/hub
appium.platformName = Android
appium.platformVersion = 5.1.1
appium.deviceName = e2f5c460
appium.browserName = Chrome
```

Here's an example for iOS:

```
webdriver.driver= appium
webdriver.base.url = http://www.google.com/
appium.hub = http://127.0.0.1:4723/wd/hub
appium.platformName = iOS
appium.platformVersion = 8.1
appium.deviceName = iPhone 5
appium.browserName = Safari
```

Note: All properties which are starting with `appium` in serenity.properties will be forwarded to appium driver. 

For example, setting `appium.automationName = XCUITest` in serenity.properties will have as end effect setting the property `automationName = XCUITest` in appium driver capabilities.

Besides the properties file you can also use commandline switches:

```
mvn test -Dappium.hub=http://127.0.0.1:4723/wd/hub -Dwebdriver.driver=appium -Dappium.platformName=iOS -Dappium.browserName=Safari -Dappium.deviceName="iPhone 5"
```

All properties starting with appium.* will be forwarded to the appium driver as appium desired capabilities.

For example, setting the property `appium.automationName=myAutomationName` will have as effect setting the capability `automationName` in the appium driver to `myAutomationName`.

The following annotations are supported for a PageObject element:

```java
@AndroidFindBy(id="")
private WebElement loginButton;
```

```java
@iOSFindBy(id="")
private WebElement loginButton;
```

```java
@FindBy(accessibilityId="")
private WebElement loginButton;
```

Sometimes it may be necessary in a PageObject to use specific methods of the underlying driver:
```java
AndroidDriver<AndroidElement> androidDriver() {
    return (AndroidDriver<AndroidElement>)
            ((WebDriverFacade) getDriver()).getProxiedDriver();
}
...
androidDriver().hideKeyboard();
```

You can also add Appium to an existing grid. See the [Appium documentation](https://appium.io/docs/en/advanced-concepts/grid/) for more details about the node-config option.
