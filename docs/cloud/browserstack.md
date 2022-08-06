---
id: browserstack
title: BrowserStack
sidebar_position: 3
---
# Introduction

[Browserstack](https://www.browserstack.com/) is an online platform that allows you to run cross-browser tests in parallel at scale. In this section, we will see how it integrates with Serenity.

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

Alternatively, you can define your username and accesskey using the `lt.user` and `lt.key` properties respectively in your `serenity.conf` file:

```hocon
browserstack.user=myuser
browserstack.key=XXXXXXXX
```

## Configuring the BrowserStack driver

Serenity interacts with LambdaTest via the `RemoteDriver` driver. You can specify the remote URL explicitly, or let the `serenity-browserstack` library do it for you. For example, to configure the URL explicitly you could use a `serenity.conf` configuration like this:
```hocon
webdriver {
  driver = remote
  remote.url =
  "https://"${BROWSERSTACK_USER}":"${BROWSERSTACK_KEY}"@hub.browserstack.com/wd/hub"
}
```

If the `webdriver.remote.url` property is not defined, Serenity will use these values to build one for you if the BrowserStack plugin is active (see below).

## Activating the BrowserStack plugin

The Serenity BrowserStack plugin will be invoked if Serenity can find a `"bstack:options"` section in your `serenity.conf` file, or if you specify a `remote.webdriver.url` that points to a LambdaTest server. If you have no LambdaTest-specific capabilities, simply set the `browserstack.active` property to true like this:

```hocon
browserstack {
  active = true
}
```

## Defining BrowserStack Capabilities

You can specify the operating system and browser you want to run your tests on by customising the [Selenium Capabilities](https://www.browserstack.com/automate/capabilities) in your `serenity.conf` file. You do this in the `"bstack:options"` section of the `serenity.conf` file, e.g.

```hocon
    webdriver {
      driver = "remote"
      capabilities {
        browserName = "Chrome"
        browserVersion = "latest"
        "bstack:options" {
          os = "Windows"
          osVersion = "11"
          resolution = "1920x1200"
          seleniumVersion = "4.1.2"
          video = true
        }
      }
    }
```

The LambdaTest test name will be assigned automatically. You can also set the _build_ name by assigning the `lambdatest.build` property.
For example the following example shows how to create a build name from the Jenkins job name and build number environment variables:

```hocon
lambdatest {
  build = "${JOB_NAME} - build ${BUILD_NUMBER}"
}
```

These properties will be placed in the `bstack:options` capability.



