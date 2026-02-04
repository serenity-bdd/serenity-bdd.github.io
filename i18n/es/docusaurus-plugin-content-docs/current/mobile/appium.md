---
id: appium
title: Ejecutando pruebas de Serenity en Appium
sidebar_position: 4
---

# Ejecutando pruebas en Appium
Serenity soporta la ejecucion de pruebas en dispositivos moviles/emuladores de forma nativa con [Appium](http://appium.io).

Primero, necesitaras instalar Appium:
```
(sudo) npm install -g appium --chromedriver_version="102.0"
```

Despues, Appium estara disponible como comando y puede iniciarse invocando el siguiente comando:

```
appium
```

Luego adapta `serenity.properties` para ejecutar en un dispositivo Android:

```
webdriver.driver= appium
webdriver.base.url = http://www.google.com/
appium.hub = http://127.0.0.1:4723/wd/hub
appium.platformName = Android
appium.platformVersion = 5.1.1
appium.deviceName = e2f5c460
appium.browserName = Chrome
```

Aqui hay un ejemplo para iOS:

```
webdriver.driver= appium
webdriver.base.url = http://www.google.com/
appium.hub = http://127.0.0.1:4723/wd/hub
appium.platformName = iOS
appium.platformVersion = 8.1
appium.deviceName = iPhone 5
appium.browserName = Safari
```

Nota: Todas las propiedades que comienzan con `appium` en serenity.properties seran enviadas al driver de Appium.

Por ejemplo, configurar `appium.automationName = XCUITest` en serenity.properties tendra como efecto final establecer la propiedad `automationName = XCUITest` en las capacidades del driver de Appium.

Ademas del archivo de propiedades, tambien puedes usar parametros de linea de comandos:

```
mvn test -Dappium.hub=http://127.0.0.1:4723/wd/hub -Dwebdriver.driver=appium -Dappium.platformName=iOS -Dappium.browserName=Safari -Dappium.deviceName="iPhone 5"
```

Todas las propiedades que comienzan con appium.* seran enviadas al driver de Appium como capacidades deseadas de Appium.

Por ejemplo, establecer la propiedad `appium.automationName=myAutomationName` tendra como efecto establecer la capacidad `automationName` en el driver de Appium a `myAutomationName`.

Las siguientes anotaciones estan soportadas para un elemento de Page Object:

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

A veces puede ser necesario en un Page Object usar metodos especificos del driver subyacente:
```java
AndroidDriver<AndroidElement> androidDriver() {
    return (AndroidDriver<AndroidElement>)
            ((WebDriverFacade) getDriver()).getProxiedDriver();
}
...
androidDriver().hideKeyboard();
```

Tambien puedes agregar Appium a un grid existente. Consulta la [documentacion de Appium](https://appium.io/docs/en/advanced-concepts/grid/) para mas detalles sobre la opcion node-config.
