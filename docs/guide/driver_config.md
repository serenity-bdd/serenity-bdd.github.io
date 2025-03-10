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
| Microsoft Edge | msedgedriver | https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/ | webdriver.edge.driver |
| Internet Explorer | IEDriverServer | https://github.com/SeleniumHQ/selenium/wiki/InternetExplorerDriver | webdriver.ie.driver |


### Automatic driver downloads

By default, Selenium automatically downloads and installs the appropriate driver binaries for the specified driver.

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

# Configuring Selenium WebDriver

[Previous content unchanged until Chrome configuration section...]

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

### Configuring Chromedriver arguments

### Configuring proxy settings

Chrome supports various proxy configurations that can be specified in your `serenity.conf` file. You can configure proxies in either the general capabilities section or within the Chrome-specific options:

#### Basic Proxy Configuration
```hocon
webdriver {
  capabilities {
    "goog:chromeOptions" {
      proxy {
        proxyType = "MANUAL"
        httpProxy = "proxy.example.com:8080"
        sslProxy = "proxy.example.com:8443"
        noProxy = "localhost,127.0.0.1,.example.com"
      }
    }
  }
}
```

#### Proxy Types
Serenity supports several proxy types:

1. Manual Proxy Configuration
```hocon
"goog:chromeOptions" {
  proxy {
    proxyType = "MANUAL"
    httpProxy = "proxy.example.com:8080"    # HTTP proxy
    sslProxy = "proxy.example.com:8443"     # HTTPS proxy
    socksProxy = "socks.example.com:1080"   # SOCKS proxy
    socksVersion = 5                        # SOCKS version (4 or 5)
    noProxy = "localhost,127.0.0.1"         # Bypass proxy for these addresses
  }
}
```

2. PAC (Proxy Auto-Configuration)
```hocon
"goog:chromeOptions" {
  proxy {
    proxyType = "PAC"
    proxyAutoconfigUrl = "http://proxy.example.com/proxy.pac"
  }
}
```

3. System Proxy
```hocon
"goog:chromeOptions" {
  proxy {
    proxyType = "SYSTEM"  # Use system's proxy settings
  }
}
```

4. Direct Connection
```hocon
"goog:chromeOptions" {
  proxy {
    proxyType = "DIRECT"  # No proxy (direct connection)
  }
}
```

5. Auto-detect
```hocon
"goog:chromeOptions" {
  proxy {
    proxyType = "AUTODETECT"  # Auto-detect proxy settings
  }
}
```

#### Proxy Authentication
For proxies requiring authentication, include the credentials in the proxy URL:
```hocon
"goog:chromeOptions" {
  proxy {
    proxyType = "MANUAL"
    httpProxy = "username:password@proxy.example.com:8080"
  }
}
```

#### Environment-Specific Proxy Configuration
You can configure different proxy settings for different environments:
```hocon
environments {
  dev {
    webdriver.capabilities {
      "goog:chromeOptions" {
        proxy {
          proxyType = "DIRECT"
        }
      }
    }
  }
  qa {
    webdriver.capabilities {
      "goog:chromeOptions" {
        proxy {
          proxyType = "MANUAL"
          httpProxy = "proxy.qa.example.com:8080"
          sslProxy = "proxy.qa.example.com:8443"
          noProxy = "*.qa.example.com,localhost"
        }
      }
    }
  }
}
```

## Configuring Microsoft Edge

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

# Configuring multiple environments

You can configure multiple driver configurations by using the `environments` section, as shown below. Then simply set the `environment` system property to the corresponding environment to use these settings, e.g.

```
mvn clean verify -Denvironment=chrome
```

A sample environments section is shown here:

```
environments {
  chrome {
    webdriver {
      driver = chrome
      autodownload = true
      capabilities {
        browserName = "chrome"
        acceptInsecureCerts = true
        "goog:chromeOptions" {
          args = ["test-type", "ignore-certificate-errors", "headless", "--window-size=1000,800"
            "incognito", "disable-infobars", "disable-gpu", "disable-default-apps", "disable-popup-blocking"]
        }
      }
    }
  }
  edge {
    webdriver {
      capabilities {
        browserName = "MicrosoftEdge"
        "ms:edgeOptions" {
          args = ["test-type", "ignore-certificate-errors", "headless",
            "incognito", "disable-infobars", "disable-gpu", "disable-default-apps", "disable-popup-blocking"]
        }
      }
    }
  }
  firefox {
    webdriver {
      capabilities {
        browserName = "firefox"
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
  }
}
```
