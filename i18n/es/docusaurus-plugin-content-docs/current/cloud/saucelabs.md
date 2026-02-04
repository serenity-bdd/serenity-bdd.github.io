---
id: saucelabs
title: SauceLabs
sidebar_position: 4
---
# Integración de Serenity BDD con SauceLabs

El plugin `serenity-saucelabs` proporciona una integración perfecta con la plataforma de automatización de pruebas en línea [SauceLabs](https://saucelabs.com/).

## Agregar el plugin de SauceLabs

Para agregar el soporte integrado de SauceLabs a tu proyecto, necesitarás agregar la dependencia `serenity-saucelabs` a las dependencias de tu proyecto. Para Maven, agregarías lo siguiente:
```xml
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-saucelabs</artifactId>
        <version>${serenity.version}</version>
    </dependency>
```

Y para Gradle:
```groovy
    testImplementation "net.serenity-bdd:serenity-saucelabs:${serenityVersion}"
```

## Especificar tus credenciales de SauceLabs y la URL del grid
A continuación, necesitarás una [cuenta de SauceLabs](https://saucelabs.com/pricing).

Después necesitarás configurar tus credenciales de SauceLabs (si has iniciado sesión en el Panel de SauceLabs [puedes encontrarlas en esta página]. La forma más sencilla de hacer esto es definir las siguientes propiedades del sistema:
* `SAUCE_USERNAME` - Nombre de usuario de SauceLabs
* `SAUCE_ACCESS_KEY` - Clave de acceso de SauceLabs

Alternativamente, puedes definir tu nombre de usuario y clave de acceso usando las propiedades `sauce.username` y `sauce.key` respectivamente en tu archivo `serenity.conf`:

```hocon
sauce.username=myuser
sauce.key=XXXXXXXX
```

## Configurar el driver de SauceLabs

Serenity interactúa con SauceLabs a través del driver `RemoteDriver`. Necesitarás especificar la URL remota para la región geográfica que deseas utilizar en la propiedad `webdriver.remote.url`, así:
```hocon
webdriver {
  driver = remote
  remote.url = "https://ondemand.us-west-1.saucelabs.com/wd/hub"
}
```

## Activar el plugin de SauceLabs

El plugin de Serenity SauceLabs se invocará si Serenity puede encontrar una sección `"sauce:options"` en tu archivo `serenity.conf`, o si especificas una `remote.webdriver.url` que apunte a un servidor de SauceLabs. Si no tienes capacidades específicas de SauceLabs, simplemente establece la propiedad `sauce.active` en true así:

```hocon
sauce {
  active = true
}
```

## Definir capacidades de SauceLabs

Puedes especificar el sistema operativo y el navegador en el que deseas ejecutar tus pruebas personalizando las [Selenium Capabilities](https://docs.saucelabs.com/dev/test-configuration-options/#desktop-and-mobile-capabilities-sauce-specific--optional) en tu archivo `serenity.conf`. Haz esto en la sección `"sauce:options"` del archivo `serenity.conf`, por ejemplo:

```hocon
    webdriver {
      driver = "remote"
      capabilities {
        browserName = "chrome"
        version = "104.0"
        platform = "Windows 10"
        "sauce:options" {
          tags = ["smoketest","billing"]
          recordVideo = true
          recordLogs = false
        }
      }
    }
```
