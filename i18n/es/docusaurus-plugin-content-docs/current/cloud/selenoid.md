---
id: selenoid
title: Selenoid
sidebar_position: 1
---
# Introducción

[Selenoid](https://aerokube.com/selenoid/latest/) es una potente implementación en Golang del código original del hub de Selenium. Utiliza Docker para lanzar navegadores. Consulta el repositorio de GitHub si necesitas el código fuente.

La forma más sencilla de configurar el driver que deseas usar es en el archivo `serenity.conf` de tu proyecto (que encontrarás en la carpeta `src/test/resources`).
Consulta [Configuración del Driver](https://serenity-bdd.github.io/docs/guide/driver_config)

Puedes configurar tus pruebas para ejecutarse contra este servidor estableciendo dos propiedades:

 - Establece la propiedad `webdriver.driver` en `remote`
 - Establece la propiedad `webdriver.remote.url` en la dirección de tu instancia de Selenoid (http://localhost:4444/wd/hub por defecto)

```conf
webdriver {
  driver = remote
  remote.url = "http://localhost:4444/wd/hub"
  }
 }
```

También puedes proporcionar propiedades adicionales sobre el navegador o entorno de destino, incluyendo:
- `browserName`: propiedad con el nombre del driver que deseas ejecutar (por ejemplo, "chrome")
- `browserVersion`: Qué versión del navegador remoto usar (por ejemplo, "93")

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

Si usas serenity.properties:
```properties

webdriver.driver = remote
webdriver.remote.url = http://localhost:4444/wd/hub
webdriver.capabilities.browserVersion=93.0
webdriver.capabilities.browserName=chrome

```

Ejemplo con múltiples entornos para Selenoid y navegador local:
``` conf
serenity {
  project.name = "Proyecto con navegadores Remoto(selenoid) y Local"
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

Puedes ejecutar pruebas en un entorno específico mediante la línea de comandos.
`mvn clean verify -Denvironment=selenoid`
