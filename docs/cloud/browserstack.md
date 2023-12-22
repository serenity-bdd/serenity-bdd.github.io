---
id: browserstack
title: BrowserStack
sidebar_position: 3
---
# Introduction

[Browserstack](https://www.browserstack.com/automate?utm_source=serenity&utm_medium=partnered) is an online platform that allows you to run cross-browser tests in parallel at scale. In this section, we will see how it integrates with Serenity.

## Adding the Browserstack plugin to your project

Serenity comes with a dedicated BrowserStack plugin that makes it much easier to run your tests on this platform. To use it, first add the `serenity-browserstack` dependency to your project. In Maven, that would look like the following:
```xml
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-browserstack</artifactId>
            <version>${serenity.version}</version>
        </dependency>
```

Or in Gradle:
```groovy
    testImplementation "net.serenity-bdd:serenity-browserstack:${serenityVersion}"
```

## Specifying your BrowserStack credentials and grid URL
Next, you will need a [BrowserStack account](https://www.browserstack.com/pricing).

You can add your [BrowserStack credentials](https://www.browserstack.com/accounts/settings) in two ways. The simplest is to define the following system properties:
* `BROWSERSTACK_USER` - BrowserStack user name
* `BROWSERSTACK_KEY`- BrowserStack access key

Alternatively, you can define your username and accesskey using the `browserstack.user` and `browserstack.key` properties respectively in your `serenity.conf` file:

```hocon
browserstack.user=myuser
browserstack.key=XXXXXXXX
```

## Configuring the BrowserStack driver
Serenity interacts with BrowserStack via the `RemoteDriver` driver. You can specify the remote URL explicitly, or let the `serenity-browserstack` library do it for you. For example, to configure the URL explicitly you could use a `serenity.conf` configuration like this:
```hocon
webdriver {
  driver = remote
  remote.url =
  "https://"${BROWSERSTACK_USER}":"${BROWSERSTACK_KEY}"@hub.browserstack.com/wd/hub"
}
```

If the `webdriver.remote.url` property is not defined, Serenity will use these values to build one for you if the BrowserStack plugin is active (see below).

## Defining BrowserStack Capabilities
You can specify the operating system and browser you want to run your tests on by customising the [Selenium Capabilities](https://www.browserstack.com/automate/capabilities) in your `serenity.conf` file. You do this in the `"bstack:options"` section of the `serenity.conf` file, e.g.

```hocon
webdriver {
  driver = "remote"
  capabilities {
    browserName = "Chrome"
    #
    # Any BrowserStack-specific options go in the 'bstack:options' section
    #
    "bstack:options" {
      os = "Windows"
      osVersion = "11"
      browserVersion = "latest"
      local = false
      resolution = "1920x1200"
      seleniumVersion = "4.6.0"
      video = true
      idleTimeout = 300 // Make sure to set this to a high number if running tests in parallel
    }
  }
}
```

If you're running the tests in parallel, make sure to set the idleTimeout value to a high number (longer than the total duration of your tests). This will prevent the BrowserStack connection from timing out before it's updated with the test results.
