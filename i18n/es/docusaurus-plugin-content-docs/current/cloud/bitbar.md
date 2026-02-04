---
id: bitbar
title: BitBar
sidebar_position: 5
---
# Integración de Serenity BDD con BitBar

BitBar es la nube para todas tus necesidades de pruebas. Con BitBar, los usuarios de Serenity tienen acceso instantáneo para escalar sus pruebas entre navegadores a dispositivos iOS y Android reales, así como a los navegadores más recientes y populares en macOS, Windows y Linux.

El plugin `serenity-bitbar` garantiza una integración perfecta con la plataforma de automatización de pruebas en línea [BitBar](https://BitBar.com/).

## Agregar el plugin de BitBar

Para agregar el soporte integrado de BitBar a tu proyecto, agrega la dependencia `serenity-bitbar` a las dependencias de tu proyecto de la siguiente manera:

* para Maven
```xml
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-bitbar</artifactId>
    <version>${serenity.version}</version>
</dependency>
```

* para Gradle:
```groovy
testImplementation "net.serenity-bdd:serenity-bitbar:${serenityVersion}"
```

## Especificar tus credenciales de BitBar y la URL del grid
A continuación, necesitas una [cuenta de BitBar](https://smartbear.com/product/bitbar/free-trial/).

Puedes agregar tus [credenciales de BitBar](https://cloud.bitbar.com/#user/security-center) de dos maneras:

* Define la siguiente propiedad del sistema

`BITBAR_API_KEY` - Clave API de BitBar

* Define tu clave API usando la propiedad `bitbar.apiKey` en tu archivo `serenity.conf`

```hocon
bitbar.apiKey=XXXXXXXX
```

## Configurar el driver de BitBar

Serenity interactúa con BitBar a través del driver `RemoteDriver`. Debes especificar la URL remota para la región geográfica que deseas utilizar en la propiedad `webdriver.remote.url` de la siguiente manera:
```hocon
webdriver {
  driver = remote
  remote.url = "https://eu-mobile-hub.bitbar.com/wd/hub"
}
```
Alternativamente, puedes definir un hub y la `remote.url` se establecerá automáticamente:

```hocon
bitbar.hub = "eu-desktop-hub"
```

## Activar el plugin de BitBar

El plugin de Serenity BitBar se invoca si Serenity encuentra una sección `bitbar:options` en tu archivo `serenity.conf`, o si especificas una `remote.webdriver.url` que apunte a un servidor de BitBar. Si no tienes capacidades específicas de BitBar, simplemente establece la propiedad `bitbar.active` en true de la siguiente manera:

```hocon
bitbar {
  active = true
}
```

## Definir capacidades de BitBar

Puedes especificar el sistema operativo y el navegador en el que deseas ejecutar tus pruebas personalizando las capacidades en tu archivo `serenity.conf`. Haz esto en la sección `bitbar:options` del archivo `serenity.conf`, por ejemplo:

```hocon
webdriver {
  driver = "remote"
  capabilities {
    browserName = "chrome"
    version = "latest"
    platform = "Windows"
    "bitbar:options" {
      osVersion = "10"
      screenResolution = "1920x1200"
    }
  }
}
```
