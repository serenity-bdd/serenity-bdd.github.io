---
id: appium
title: Executando Testes Serenity no Appium
sidebar_position: 4
---

# Executando testes no Appium
Serenity suporta a execução de testes em dispositivos móveis/emuladores nativamente com [Appium](http://appium.io).

Primeiro, você precisará instalar o Appium:
```
(sudo) npm install -g appium --chromedriver_version="102.0"
```

Depois, o Appium estará disponível como comando e pode ser iniciado invocando o seguinte comando:

```
appium
```

Em seguida, adapte o `serenity.properties` para executar em um dispositivo Android:

```
webdriver.driver= appium
webdriver.base.url = http://www.google.com/
appium.hub = http://127.0.0.1:4723/wd/hub
appium.platformName = Android
appium.platformVersion = 5.1.1
appium.deviceName = e2f5c460
appium.browserName = Chrome
```

Aqui está um exemplo para iOS:

```
webdriver.driver= appium
webdriver.base.url = http://www.google.com/
appium.hub = http://127.0.0.1:4723/wd/hub
appium.platformName = iOS
appium.platformVersion = 8.1
appium.deviceName = iPhone 5
appium.browserName = Safari
```

Nota: Todas as propriedades que começam com `appium` no serenity.properties serão encaminhadas para o driver appium.

Por exemplo, definir `appium.automationName = XCUITest` no serenity.properties terá como efeito final definir a propriedade `automationName = XCUITest` nas capabilities do driver appium.

Além do arquivo de propriedades, você também pode usar opções de linha de comando:

```
mvn test -Dappium.hub=http://127.0.0.1:4723/wd/hub -Dwebdriver.driver=appium -Dappium.platformName=iOS -Dappium.browserName=Safari -Dappium.deviceName="iPhone 5"
```

Todas as propriedades que começam com appium.* serão encaminhadas para o driver appium como capabilities desejadas do appium.

Por exemplo, definir a propriedade `appium.automationName=myAutomationName` terá como efeito definir a capability `automationName` no driver appium para `myAutomationName`.

As seguintes anotações são suportadas para um elemento Page Object:

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

Às vezes pode ser necessário em um Page Object usar métodos específicos do driver subjacente:
```java
AndroidDriver<AndroidElement> androidDriver() {
    return (AndroidDriver<AndroidElement>)
            ((WebDriverFacade) getDriver()).getProxiedDriver();
}
...
androidDriver().hideKeyboard();
```

Você também pode adicionar o Appium a um grid existente. Veja a [documentação do Appium](https://appium.io/docs/en/advanced-concepts/grid/) para mais detalhes sobre a opção node-config.
