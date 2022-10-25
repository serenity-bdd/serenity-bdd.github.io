---
id: bitbar
title: BitBar
sidebar_position: 5
---
# Serenity BDD BitBar Integration

The `serenity-bitbar` plugin ensures seamless integration with the [BitBar](https://BitBar.com/) online test automation platform.

## Adding the BitBar plugin

To add the integrated support for BitBar to your project, add the `serenity-bitbar` dependency to your project dependencies as follows:

* for Maven
```xml
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-bitbar</artifactId>
    <version>${serenity.version}</version>
</dependency>
```

* for Gradle:
```groovy
testImplementation "net.serenity-bdd:serenity-bitbar:${serenityVersion}"
```

## Specifying your BitBar credentials and grid URL
Next, you need a [BitBar account](https://smartbear.com/product/bitbar/free-trial/).

You can add your [BitBar credentials](https://cloud.bitbar.com/#user/security-center) in two ways:

* Define the following system property

`BITBAR_API_KEY` - BitBar API Key

* Define your API Key using the `bitbar.apiKey` property in your `serenity.conf` file

```hocon
bitbar.apiKey=XXXXXXXX
```

## Configuring the BitBar driver

Serenity interacts with BitBar via the `RemoteDriver` driver. You need to specify the remote URL for the geographical region you want to use in the `webdriver.remote.url` property as follows:
```hocon
webdriver {
  driver = remote
  remote.url = "https://eu-mobile-hub.bitbar.com/wd/hub"
}
```
Alternatively, you can define a hub and the `remote.url` will be set automatically:

```hocon
bitbar.hub = "eu-desktop-hub"
```

## Activating the BitBar plugin

The Serenity BitBar plugin is invoked if Serenity finds a `bitbar:options` section in your `serenity.conf` file, or if you specify a `remote.webdriver.url` that points to a BitBar server. If you have no BitBar-specific capabilities, simply set the `bitbar.active` property to true as follows:

```hocon
bitbar {
  active = true
}
```

## Defining BitBar Capabilities

You can specify the operating system and browser on which you want to run your tests by customizing the capabilities in your `serenity.conf` file. Do this in the `bitbar:options` section of the `serenity.conf` file, for example:

```hocon
webdriver {
  driver = "remote"
  capabilities {
    browserName = "chrome"
    version = "latest"
    platform = "Windows"
    "bitbar:options" {
      osVersion = "10"
      screenResolution = "1920x1200"
    }
  }
}
```
