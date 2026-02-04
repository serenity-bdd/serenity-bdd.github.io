---
id: browserstack
title: BrowserStack
sidebar_position: 3
---
# Introducción

[Browserstack](https://www.browserstack.com/automate?utm_source=serenity&utm_medium=partnered) es una plataforma en línea que te permite ejecutar pruebas entre navegadores en paralelo a gran escala. En esta sección, veremos cómo se integra con Serenity.

## Agregar el plugin de Browserstack a tu proyecto

Serenity incluye un plugin dedicado de BrowserStack que facilita mucho la ejecución de tus pruebas en esta plataforma. Para usarlo, primero agrega la dependencia `serenity-browserstack` a tu proyecto. En Maven, se vería así:
```xml
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-browserstack</artifactId>
            <version>${serenity.version}</version>
        </dependency>
```

O en Gradle:
```groovy
    testImplementation "net.serenity-bdd:serenity-browserstack:${serenityVersion}"
```

## Especificar tus credenciales de BrowserStack y la URL del grid
A continuación, necesitarás una [cuenta de BrowserStack](https://www.browserstack.com/pricing).

Puedes agregar tus [credenciales de BrowserStack](https://www.browserstack.com/accounts/settings) de dos maneras. La más sencilla es definir las siguientes propiedades del sistema:
* `BROWSERSTACK_USER` - Nombre de usuario de BrowserStack
* `BROWSERSTACK_KEY` - Clave de acceso de BrowserStack

Alternativamente, puedes definir tu nombre de usuario y clave de acceso usando las propiedades `browserstack.user` y `browserstack.key` respectivamente en tu archivo `serenity.conf`:

```hocon
browserstack.user=myuser
browserstack.key=XXXXXXXX
```

## Configurar el driver de BrowserStack
Serenity interactúa con BrowserStack a través del driver `RemoteDriver`. Puedes especificar la URL remota explícitamente, o dejar que la biblioteca `serenity-browserstack` lo haga por ti. Por ejemplo, para configurar la URL explícitamente podrías usar una configuración de `serenity.conf` como esta:
```hocon
webdriver {
  driver = remote
  remote.url =
  "https://"${BROWSERSTACK_USER}":"${BROWSERSTACK_KEY}"@hub.browserstack.com/wd/hub"
}
```

Si la propiedad `webdriver.remote.url` no está definida, Serenity usará estos valores para construir una URL por ti si el plugin de BrowserStack está activo (ver más abajo).

## Definir capacidades de BrowserStack
Puedes especificar el sistema operativo y el navegador en el que deseas ejecutar tus pruebas personalizando las [Selenium Capabilities](https://www.browserstack.com/automate/capabilities) en tu archivo `serenity.conf`. Haz esto en la sección `"bstack:options"` del archivo `serenity.conf`, por ejemplo:

```hocon
webdriver {
  driver = "remote"
  capabilities {
    browserName = "Chrome"
    #
    # Cualquier opción específica de BrowserStack va en la sección 'bstack:options'
    #
    "bstack:options" {
      os = "Windows"
      osVersion = "11"
      browserVersion = "latest"
      local = false
      resolution = "1920x1200"
      seleniumVersion = "4.6.0"
      video = true
      idleTimeout = 300 // Asegúrate de establecer esto en un número alto si ejecutas pruebas en paralelo
    }
  }
}
```

Si estás ejecutando las pruebas en paralelo, asegúrate de establecer el valor de idleTimeout en un número alto (mayor que la duración total de tus pruebas). Esto evitará que la conexión de BrowserStack expire antes de que se actualice con los resultados de las pruebas.
