---
id: selenoid
title: selenoid
sidebar_position: 1
---
# Introduction

[Selenoid](https://aerokube.com/selenoid/latest/) Selenoid is a powerful Golang implementation of original Selenium hub code. It is using Docker to launch browsers. Please refer to GitHub repository if you need source code.

The simplest way to configure the driver you want to use is in your project's `serenity.conf` file (which you will find in `src/test/resources` folder).
Refer to [Driver Config](https://serenity-bdd.github.io/docs/guide/driver_config)

You can configure your tests to run against this server by setting two properties:

 - Set the `webdriver.driver` property to `remote` 
 - Set the `webdriver.remote.url` property to the address of your selenoid instance (http://localhost:4444/wd/hub by default)

```conf
webdriver {
  driver = remote
  remote.url = "http://localhost:4444/wd/hub"
  }
 }
```

You can also provide additional properties about the target browser or environment, including:
- `browserName`:  property to the name of the driver you want to run (e.g. "chrome")
- `browserVersion`: What version of the remote browser to use (e.g. "93")

``` conf

webdriver {
  driver = remote
  remote.url = "http://localhost:4444/wd/hub"
  capabilities {
    browserName = "chrome"
    browserVersion = "93"
  }
}

```

If you use serenity.properties:
```properties

webdriver.driver = remote
webdriver.remote.url = http://localhost:4444/wd/hub
webdriver.capabilities.browserVersion=93.0
webdriver.capabilities.browserName=chrome

```

Example with multiple environments for Selenoid and Local browser:
``` conf
serenity {
  project.name = "Project with Remote(selenoid) and Local browsers"
  console.colors = true
  logging = VERBOSE
  take.screenshots = AFTER_EACH_STEP
}

environment = selenoid

environments {
  selenoid {
    webdriver {
      driver = remote
      remote.url = "http://localhost:4444/wd/hub"
      capabilities {
        browserName = "chrome"
        browserVersion = "118.0"
        "selenoid:options" {
            enableVNC = true
            enableVideo = false
            sessionTimeout = 10m
            timeZone = America/Los_Angeles
          }
        "goog:chromeOptions" {
            args = ["--remote-allow-origins=*", "disable-gpu", "disable-setuid-sandbox", "disable-dev-shm-usage"]
            prefs {
              profile.profile_default_content_settings.popups = 0
              profile.default_content_setting_values.notifications = 1
             }
          }
        timeouts {
           #script = 30000
           #pageLoad = 300000
           implicit = 5000
         }
      }
    }
  }
  local {
    webdriver {
      driver = chrome
      capabilities {
        "goog:chromeOptions" {
            args = ["--remote-allow-origins=*", "disable-gpu", "disable-setuid-sandbox", "disable-dev-shm-usage"]
            prefs {
              profile.profile_default_content_settings.popups = 0
              profile.default_content_setting_values.notifications = 1
             }
          }
        timeouts {
           #script = 30000
           #pageLoad = 300000
           implicit = 5000
         }
      }
    }
  }
}

```

You can run tests on specific environment via comman line.
`mvn clean verify -Denvironment=selenoid` 
