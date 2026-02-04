---
id: selenium-grid
title: Selenium Grid
sidebar_position: 1
---
# Introducción

[Selenium Grid](https://www.selenium.dev/documentation/grid/) permite la ejecución de scripts de WebDriver en máquinas remotas (virtuales o reales) mediante el enrutamiento de comandos enviados por el cliente a instancias de navegador remotas. Su objetivo es proporcionar una forma fácil de ejecutar pruebas en paralelo en múltiples máquinas.

Selenium Grid 4 aprovecha una serie de nuevas tecnologías para facilitar el escalado mientras permite la ejecución local.

También puedes usar Serenity para ejecutar tus pruebas de WebDriver en una máquina remota, como un Selenium Grid o un servicio remoto como el proporcionado por [BrowserStack](https://www.browserstack.com/automate?utm_source=serenity&utm_medium=partnered) o [LambdaTest](https://www.lambdatest.com?utm_source=serenity_bdd&utm_medium=website). Esto te permite ejecutar tus pruebas web contra una variedad de diferentes navegadores y sistemas operativos, y también beneficiarte de una ejecución de pruebas más rápida al ejecutar las pruebas en paralelo. Veremos cómo hacer esto en detalle más adelante en el capítulo.

## Ejecutar Selenium Grid localmente
La forma más sencilla de comenzar con Selenium Grid es ejecutar una instancia standalone en tu máquina local. Esto te permite asegurarte de que tu configuración de Serenity se ha establecido correctamente para usar el Selenium Grid.

Para probarlo, descarga el archivo jar `selenium-server` más reciente desde [el sitio web de Selenium](https://www.selenium.dev/downloads/). Luego inicia el servidor con el siguiente comando:

```
java -jar selenium-server-<version>.jar standalone
```

Esto iniciará la instancia local del servidor Selenium Grid. Puedes ver el panel de control en [http://localhost:4444/ui](http://localhost:4444/ui).

Puedes configurar tus pruebas para ejecutarse contra este servidor estableciendo tres propiedades:
 - Establece la propiedad `webdriver.driver` en `remote`
 - Establece la propiedad `webdriver.remote.url` en la dirección de tu instancia de Selenium Grid (http://localhost:4444 por defecto)
 - Establece la propiedad `webdriver.remote.driver` con el nombre del driver que deseas ejecutar (por ejemplo, "chrome")

```conf
webdriver {
  driver = remote
  remote {
    url="http://localhost:4444"
    driver=chrome
  }
 }
```

También puedes proporcionar propiedades adicionales sobre el navegador o entorno de destino, incluyendo:
- `webdriver.remote.browser.version`: Qué versión del navegador remoto usar
- `webdriver.remote.os`: En qué sistema operativo deben ejecutarse las pruebas.

Por ejemplo, si estuvieras ejecutando un Selenium Hub localmente en el puerto 4444 (el predeterminado) en una máquina Windows, podrías ejecutar el siguiente comando:

```
mvn verify -Dwebdriver.remote.url=http://localhost:4444/wd/hub -Dwebdriver.remote.driver=chrome -Dwebdriver.remote.os=WINDOWS
```

También puedes pasar las capacidades específicas del driver habituales al navegador remoto, por ejemplo:
```
mvn verify -Dwebdriver.remote.url=http://localhost:4444/wd/hub -Dwebdriver.remote.driver=chrome -Dwebdriver.remote.os=WINDOWS -Dchrome.switches="--no-sandbox,--ignore-certificate-errors,--homepage=about:blank,--no-first-run"
```
