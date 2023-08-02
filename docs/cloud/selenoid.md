---
id: selenoid
title: selenoid
sidebar_position: 1
---
# Introduction

[Selenoid](https://aerokube.com/selenoid/latest/) Selenoid is a powerful Golang implementation of original Selenium hub code. It is using Docker to launch browsers. Please refer to GitHub repository if you need source code.


You can configure your tests to run against this server by setting two properties:

 - Set the `webdriver.driver` property to `remote` 
 - Set the `webdriver.remote.url` property to the address of your selenoid instance (http://localhost:4444/wd/hub by default)

```conf
webdriver {
  driver = remote
  remote {
    url="http://localhost:4444/wd/hub"
  }
 }
```

You can also provide additional properties about the target browser or environment, including:
- `selenoid.browserName`:  property to the name of the driver you want to run (e.g. "chrome")
- `selenoid.browserVersion`: What version of the remote browser to use (e.g. "93")

``` conf

selenoid {
  browserName = "chrome"
  browserVersion = "93"
}

```

Must set above four configurations to use selenoid, For example:
``` conf
webdriver {
  driver = remote
  remote {
    url="http://localhost:4444/wd/hub"
  }
 }

selenoid {
  browserName = "chrome"
  browserVersion = "93"
}
```
If you use serenity.properties:
```properties

webdriver.driver = remote
webdriver.remote.url = http://localhost:4444/wd/hub
selenoid.browserVersion=93.0
selenoid.browserName=chrome

```


you can also provide additional properties about the selenoid options.
For example:

``` conf

selenoid {
  browserName = "chrome"
  browserVersion = "93"
  platformName = linux
  "selenoid:options" {
    enableVNC = true
    enableVideo = true
    enableLog = true
    videoDatePrefixFormat = yyyy-MM-dd-HH-mm-ss
    screenResolution=1280x1000x24
    args = ["test-type", "no-sandbox", "ignore-certificate-errors", "--window-size=1000,800",
      "incognito", "disable-infobars", "disable-gpu", "disable-default-apps", "disable-popup-blocking"]
  }
}
```

If you use serenity.properties:

```properties
selenoid.browserVersion=93.0
selenoid.browserName=chrome
selenoid.platformName=linux

selenoid.options.enableVNC=true
selenoid.options.enableVideo=true
selenoid.options.enableLog=true
selenoid.options.videoDatePrefixFormat=yyyy-MM-dd-HH-mm-ss

selenoid.options.screenResolution=1280x1000x24
```

If you save vide to AWS s3 and you want to link the video to report you can use 

```conf
selenoid {
  "selenoid:options" {
    videoLinkPrefix="https://s3.amazonaws.com/my-bucket"
  }
}

```

If you use serenity.properties:
```properties

selenoid.options.videoDatePrefixFormat=https://s3.amazonaws.com/my-bucket

```