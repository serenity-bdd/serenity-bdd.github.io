---
id: selenium-grid
title: Selenium Grid
sidebar_position: 1
---
# Introduction

[Selenium Grid](https://www.selenium.dev/documentation/grid/) allows the execution of WebDriver scripts on remote machines (virtual or real) by routing commands sent by the client to remote browser instances. It aims to provide an easy way to run tests in parallel on multiple machines. 

Selenium Grid 4 takes advantage of a number of new technologies in order to facilitate scaling up while allowing local execution.

You can also use Serenity to run your WebDriver tests on a remote machine, such as a Selenium Grid or a remote service such as provided by [BrowserStack](https://www.browserstack.com) or [LambdaTest](https://www.lambdatest.com/). This allows you to run your web tests against a variety of different browsers and operating systems, and also benefit from faster test execution when running the tests in parallel. We will look at how to do this in detail later on in the chapter.

## Running Selenium Grid locally
The simplest way to start with Selenium Grid is to run a standalone instance on your local machine. This allows you to make sure your Serenity configuration has been correctly set up to use the Selenim grid. 

To try this own, download the latest `selenium-server` jar file from [the Selenium website](https://www.selenium.dev/downloads/). Then start up the server with the following command:

```
java -jar selenium-server-<version>.jar standalone
```

This will start up the local instance of the Selenium Grid server. You can check out the dashboard on [http://localhost:4444/ui](http://localhost:4444/ui).

You can cofigure your tests to run against this server by setting three properties:
 - Set the `webdriver.driver` property to `remote` 
 - Set the `webdriver.remote.url` property to the address of your Selenium Grid instance (http://localhost:4444 by default)
 - Set the `webdriver.remote.driver` property to the name of the driver you want to run (e.g. "chrome")

```conf
webdriver {
  driver = remote
  remote {
    url="http://localhost:4444"
    driver=chrome
  }
 }
```

You can also provide additional properties about the target brower or environment, including:
- `webdriver.remote.browser.version`: What version of the remote browser to use
- `webdriver.remote.os`: What operating system the tests should be run on.

For example, if you were running a Selenium Hub locally on port 4444 (the default) on a Windows machine, you could run the following command:

```
mvn verify -Dwebdriver.remote.url=http://localhost:4444/wd/hub -Dwebdriver.remote.driver=chrome -Dwebdriver.remote.os=WINDOWS
```

You can also pass the usual driver-specific capabilities to the remote browser, e.g.
```
mvn verify -Dwebdriver.remote.url=http://localhost:4444/wd/hub -Dwebdriver.remote.driver=chrome -Dwebdriver.remote.os=WINDOWS -Dchrome.switches="--no-sandbox,--ignore-certificate-errors,--homepage=about:blank,--no-first-run"
```






