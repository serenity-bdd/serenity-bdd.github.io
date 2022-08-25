---
id: driver_config
title: Configuring Selenium WebDriver
sidebar_position: 8
---

Selenium WebDriver lets you run your tests in a variety of browsers, each with a variety of configuration options. In this section we will look at how to configure your WebDriver driver in Serenity.

The simplest way to configure the driver you want to use is in your project's `serenity.conf` file (which you will find in `src/test/resources` folder).

Basic configuration options go in the `webdriver` section. For example, to run your tests with Chrome, you set the `webdriver.driver` property to "chrome":

```hocon
webdriver {
    driver = "chrome"
}
```

All of the standard WebDriver browsers are supported:

| Browser           | Value       | Example                       |
| -----------       | ----------- | ----------------------------  |
| Chrome            | chrome      | webdriver.driver = "chrome"   |
| Firefox           | firefox     | webdriver.driver = "firefox"  |
| Microsoft Edge    | edge        | webdriver.driver = "edge"     |
| Internet Explorer | IE          | webdriver.driver = "IE"       |
| Safari            | safari      | webdriver.driver = "safari"   |

## Configuring the WebDriver drivers

When you run a WebDriver test against almost any driver, you need an OS-specific binary file to act as an intermediary between your test and the browser you want to manipulate. The main drivers, and where you can download them from, are listed below:

| Browser | Driver | Location | System Property |
| ------- | ------ | -------- | --------------- |
| Chrome | chromedriver | http://chromedriver.chromium.org | webdriver.chrome.driver |
| Firefox | geckodriver | https://github.com/mozilla/geckodriver/releases | webdriver.gecko.driver |
| Microsoft Edge | msedgedriver | https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/ | webdriver.ie.driver |
| Internet Explorer | IEDriverServer | https://github.com/SeleniumHQ/selenium/wiki/InternetExplorerDriver | webdriver.ie.driver |


### Automatic driver downloads

Serenity integrates with [WebDriverManager](https://bonigarcia.dev/webdrivermanager/) to automatically download and install the appropriate driver binaries for the specified driver.

### Configuring driver binaries by hand

If you cannot or do not want to download the WebDriver binaries automatically using WebDriverManager (for example, if you are in a corporate network which does not have access to the WebDriverManager binaries), you can download the binaries and configure them directly in the `serenity.conf` file.

In this case you need to either have the correct driver binary on your system path, or provide the path to the binary using the system property shown in the table above. For example, your serenity.conf file might contain the following:

```hocon
webdriver.gecko.driver=/path/to/my/geckodriver
```

However, adding a system path to your serenity.properties file is poor practice, as it means your tests will only run if the specified directory and binary exists, and that you are running the tests on the correct operating system. This obviously makes little sense if you are running your tests both locally, and on a CI environment.

A more robust approach is to have your drivers in your source code, but have different drivers per OS. Serenity allows you to pass driver-specific properties to a driver, as long as they are prefixed with drivers._os_. For example, the following line will configure the webdriver.chrome.driver if you are running your tests under windows.

```hocon
drivers {
  windows {
    webdriver.chrome.driver = src/test/resources/webdriver/windows/chromedriver.exe
  }
```

You can easily configure different binaries for different operating systems like this:

```hocon
drivers {
  windows {
    webdriver.chrome.driver = src/test/resources/webdriver/windows/chromedriver.exe
  }
  mac {
    webdriver.chrome.driver = src/test/resources/webdriver/mac/chromedriver
  }
  linux {
    webdriver.chrome.driver = src/test/resources/webdriver/linux/chromedriver
  }
}
```

This approach also works when you have more than one driver to configure. Suppose you need to run tests on three environments, using Firefox or Windows. One convenient approach is to store your drivers in a directory structure under src/test/resources similar to the following:

```
src/test/resources
└── webdriver
    ├── linux
    │   ├── chromedriver
    │   └── geckodriver
    ├── mac
    │   ├── chromedriver
    │   └── geckkodriver
    └── windows
        ├── chromedriver.exe
        └── geckodriver.exe
```

This means that your tests will not need the webdriver binaries to be installed on every machine.

The corresponding `serenity.conf` configuration for both browsers and each operating system would look like this:

```hocon
drivers {
  windows {
    webdriver.chrome.driver = src/test/resources/webdriver/windows/chromedriver.exe
    webdriver.gecko.driver = src/test/resources/webdriver/windows/geckodriver.exe
  }
  mac {
    webdriver.chrome.driver = src/test/resources/webdriver/mac/chromedriver
    webdriver.gecko.driver = src/test/resources/webdriver/mac/geckodriver
  }
  linux {
    webdriver.chrome.driver = src/test/resources/webdriver/linux/chromedriver
    webdriver.gecko.driver = src/test/resources/webdriver/linux/geckodriver
  }
}
```

## Specifying W3C properties

[W3C capabilities](https://www.w3.org/TR/webdriver/#capabilities) are a standard set of driver features that every drive implementation must support. You can configure W3C capabilities in the `wenbdriver.capabilities` section of your `serenity.conf` file, as shown here:

```hocon
webdriver {
  capabilities {
    browserName = "Chrome"
    browserVersion = "103.0"
    platformName = "Windows 11"
    acceptInsecureCerts = true
  }
}
```

You can define timeouts in a dedicated subsection like this:

```hocon
webdriver {
  capabilities {
    browserName = "Chrome"
    browserVersion = "103.0"
    platformName = "Windows 11"
    timeouts {
      script = 30000
      pageLoad = 300000
      implicit = 2000
    }
  }
}
```

You can also define proxy configuration details in the `proxy` section:
```hocon
webdriver {
  capabilities {
    browserName = "Chrome"
    browserVersion = "103.0"
    platformName = "Windows 11"
    proxy {
      proxyType = "30000"
      httpProxy = "myproxy.myorgcom:3128"
    }
  }
}
```

## Configuring Chrome

You can use the special `"goog:chromeOptions"` capability to define any of the [ChromeDriver options](https://chromedriver.chromium.org/capabilities)
```hocon
webdriver {
  capabilities {
    browserName = "Chrome"
    browserVersion = "103.0"
    platformName = "Windows 11"
    screenResolution = "1280x1024"

    "goog:chromeOptions" {
      args = [ "window-size=1000,800", "headless" ]
      binary = ${HOME}/path/to/chromedriver
      detach = true
      localState = {
        cart-contents = [1,2,3]
      }
    }
  }
}
```

:::tip
In older versions of Serenity, we used the `chrome.switches` property to define Chrome options. This property is not supported as of version 3.3.0, so you should use the W3C standard `"goog:chromeOptions"` capability for this instead.
:::

### Configuring Chromedriver arguments

You can define ChromeDriver arguments in the `args` property to set various startup options. For example, to start Chrome in maximized mode, you can use the `start-maximized` argument. Or if you want to run Chrome in headless mode, you can use the "headless" argument:

```hocon
webdriver {
  capabilities {
    ...
    "goog:chromeOptions" {
      args = [ "start-maximized", "headless"]
    }
  }
}
```

Some of the more commonly used Chrome startup arguments include:

| Argument               | Usage |
| ---------------------- | ------|
| start-maximized        | Opens Chrome in maximize mode |
| incognito              | Opens Chrome in incognito mode |
| headless               | Opens Chrome in headless mode |
| disable-extensions     | Disables existing extensions on Chrome browser |
| disable-popup-blocking | Disables pop-ups displayed on Chrome browser |
| make-default-browser   | Makes Chrome default browser |
| version                | Prints chrome browser version |
| disable-infobars       | Prevents Chrome from displaying the notification ‘Chrome is being controlled by automated software |

### Specifying the Chromedriver binary

Serenity uses WebDriverManager, so you rarely need to specify the chromedriver binary yourself. However if you need to, you can do this in the capabilities section

```hocon
webdriver {
  capabilities {
    ...
    "goog:chromeOptions" {
      binary = /path/to/chromedriver
    }
  }
}
```

Note that you can use environment variables in TypesafeConfig to make your path more portable, e.g.

```hocon
webdriver {
  capabilities {
    ...
    "goog:chromeOptions" {
      binary = ${HOME}/path/to/chromedriver
    }
  }
}
```

### Blocking popup-windows
By default, ChromeDriver configures Chrome to allow pop-up windows. If you want to block pop-ups (i.e., restore the normal Chrome behavior when it is not controlled by ChromeDriver), you can use the `excludedSwitches` option as follows:

```hocon
webdriver {
  capabilities {
    ...
    "goog:chromeOptions" {
      excludedSwitches = ["disable-popup-blocking"]
    }
  }
}
```


### Configuring Chrome preferences

Some driver behaviour is specified in the Chrome preferences. For example, a common usage of the preferences section is to define a download directory, like this:

```hocon
webdriver {
  capabilities {
    ...
    "goog:chromeOptions" {
      prefs {
        download.default_directory = ${HOME}/some/download/dir
        download.prompt_for_download = true
      }
  }
}
```

### Configuring timeouts

You can configure driver timeouts using standard W3C capabilities like this (all values are in milliseconds):

```hocon
webdriver {
    capabilities {
        timeouts {
           script = 30000
           pageLoad = 300000
           implicit = 0
       }
   }
}
```

### Configuring ChromeDriver logging preferences

You can also configure the Chrome logging preferences using the `goog:loggingPrefs` option.

## Condiguring Microsoft Edge

Microsoft Edge is a Chromium driver, so the configuration is very similar to Chrome. The main difference is the use of `"ms:edgeOptions'"` instead of `"goog:chromeOptions"`. A typical configuration is shown below:

```hocon
webdriver {
  capabilities {
    browserName = "MicrosoftEdge"
    "ms:edgeOptions" {
      args = ["test-type", "ignore-certificate-errors", "headless",
        "incognito", "disable-infobars", "disable-gpu", "disable-default-apps", "disable-popup-blocking"]
    }
  }
}

```

## Configuring Firefox

Firefox uses the `"moz:firefoxOptions"` capability to define browser-specific option. A sample configuration is shown below:

```hocon
webdriver {
  capabilities {
    browserName = "firefox"

    timeouts {
      implicit = 1000
      script = 1000
      pageLoad = 1000
    }
    pageLoadStrategy = "normal"
    acceptInsecureCerts = true
    unhandledPromptBehavior = "dismiss"
    strictFileInteractability = true

    "moz:firefoxOptions" {
      args = ["-headless"],
      prefs {
        "javascript.options.showInConsole": false
      },
      log {"level": "info"},
    }
  }
}
```
