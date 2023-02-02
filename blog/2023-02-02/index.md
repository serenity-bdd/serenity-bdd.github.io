# How To Configure Chrome In Serenity BDD

These days Selenium is moving at a neck-breaking pace, and there are quite a few small changes coming through in the driver configuration options. And since Serenity BDD has many shortcuts to handle these options, it's worth knowing what has changed, what won't work any more, and what you need to update.

So here's the rundown (with a focus on Chrome, the most widely used driver):

## No more downloading drivers

In previous versions of Serenity BDD, you could use the `webdriver.driver.autodownload` property to make Serenity (using WebDriverManager) automatically download the right driver for your platform. 
The latest versions of Serenity BDD integrate with Selenium 4.8.0, which has this feature built-in, so you can now safely set the `webdriver.driver.autodownload` property to false in your `serenity.conf` file, or remove it entirely.

## Headless mode

Headless mode is going away! Well, not quite - but the convenience method provided in the ChromeOptions class to set the headless mode (`setHeadless()`) is being deprecated, and will be disabled in a future version. For this reason, the Serenity BDD `headless.mode` property is now deprecated - you'll need to configure headless execution in the W3C configuration 

## W3C configuration for Chrome

In the latest versions of Serenity, all the chrome options can be configured using the "goog:chromeOptions" section inside the `webdriver.capabilities` section of your `serenity.conf` file. (Other W3C capabilites, such as browserName and timeouts, also go in the `webdriver.capabilities` section).

Let's have a look at a few of the more useful "goog:chromeOptions" arguments.

### Headless mode

To activate headless mode in newer version, you will need to use the ` - headless` argument. According to the Chrome docs, you should use use ' - headless=chrome' for browsers v94-108 and ' - headless=new' for browsers v109+. (The Serenity `headless.mode` property uses the latter option, and is maintained for backward compatibility reasons).

```json
webdriver {
    capabilities {
        "goog:chromeOptions" {
            args = ["headless=chrome"]
        }
    }
}

```

### Arguments

You can define the command-line you want to pass into chrome using the `args`,
The args option in the ChromeDriver Java implementation is a list of command-line options to use when starting the Chrome browser. These options can be used to customize the behavior of the browser and to control how the test is run. For example, you can use the `headless=chrome` argument discussed earlier to run the browser in headless mode, or the `disable-gpu` argument to disable GPU acceleration. 

```json
webdriver {
    capabilities {
        "goog:chromeOptions" {
            args = ["headless=chrome","disable-gpu"]
        }
    }
}

```

Some of the options include the following:
 - disable-extensions: Disables all installed extensions.
 - disable-popup-blocking: Allows popups to appear.
 - disable-translate: Disables the translate feature.
 - disable-plugins: Disables all plugins.
 - disable-background-networking: Disables background networking, such as background updates.
 - disable-web-security: Disables the same-origin policy, which can be useful for testing purposes.
 - disable-notifications: Disables notifications.
 - disable-infobars: Disables infobars (information bars that appear at the top of a page).
 - disable-sync: Disables synchronization.
 - disable-offer-store-unmasked-wallet-cards: Disables the offering of unmasked credit card information when shopping.
 - start-maximized: Starts the browser maximized.
 - incognito: Opens the browser in an incognito mode.
 - disable-gpu: Disables the use of GPU acceleration.
 - disable-background-timer-throttling: Disables timer throttling in background pages.
 - disable-renderer-backgrounding: Disables backgrounding of renderer processes.


### Excluded Switches

The `excludeSwitches` parameter lets you to exclude certain command-line options from being passed to the Chrome browser when it is launched. These options can control various aspects of the browser behavior, such as starting it in incognito mode, disabling plugins, or turning off the UI. By excluding these switches, you can ensure that the browser behaves in a consistent and expected manner, which can be useful for testing purposes. 

You can pass a list of switch names to the `excludeSwitches` parameter, which goes inside the "goog:chromeOptions" section in your `serenity.conf` file. 

For example, you can use " - disable-extensions" to prevent extensions from being loaded, or " - incognito" to start the browser in incognito mode. 

Note that the `useAutomationExtension` option is deprecated and no longer used by Chrome - if you want to do the equivalent of `useAutomationExtension = false`, add "enable-automation" to the excludedSwitches parameter, e.g.

```json
webdriver {
    capabilities {
        "goog:chromeOptions" {
            excludeSwitches = ["enable-automation","load-extension"],
        }
    }
}

```

Here is a more complete example of a `serenity.conf` file using the W3C options:

```json
  webdriver {
    driver = chrome

    capabilities {
      browserName = "chrome"
      acceptInsecureCerts = true,

      "goog:chromeOptions" {
        args = ["start-maximized", "no-sandbox", "ignore-certificate-errors", "disable-popup-blocking",
                "disable-default-apps", "disable-extensions-file-access-check", "disable-infobars", "disable-gpu","headless=chrome"]

        prefs {
          default_content_settings.popups = 0,
          default_content_settings.geolocation = 2,
          credentials_enable_service = false,
          password_manager_enabled = false
        }
        excludeSwitches = ["enable-automation","load-extension"],
      }

      timeouts {
        implicit = 15000
        pageLoad = 300000
      }
    }
    wait.for.timeout = 20000
  }

```