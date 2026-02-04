---
id: driver_config
title: Configurando Selenium WebDriver
sidebar_position: 8
---

Selenium WebDriver te permite ejecutar tus pruebas en una variedad de navegadores, cada uno con diversas opciones de configuración. En esta sección veremos cómo configurar tu driver de WebDriver en Serenity.

La forma más sencilla de configurar el driver que deseas usar es en el archivo `serenity.conf` de tu proyecto (que encontrarás en la carpeta `src/test/resources`).

Las opciones de configuración básicas van en la sección `webdriver`. Por ejemplo, para ejecutar tus pruebas con Chrome, establece la propiedad `webdriver.driver` a "chrome":

```hocon
webdriver {
    driver = "chrome"
}
```

Todos los navegadores estándar de WebDriver están soportados:

| Navegador         | Valor       | Ejemplo                       |
| -----------       | ----------- | ----------------------------  |
| Chrome            | chrome      | webdriver.driver = "chrome"   |
| Firefox           | firefox     | webdriver.driver = "firefox"  |
| Microsoft Edge    | edge        | webdriver.driver = "edge"     |
| Internet Explorer | IE          | webdriver.driver = "IE"       |
| Safari            | safari      | webdriver.driver = "safari"   |

## Configurando los drivers de WebDriver

Cuando ejecutas una prueba de WebDriver contra casi cualquier driver, necesitas un archivo binario específico del sistema operativo para actuar como intermediario entre tu prueba y el navegador que deseas manipular. Los principales drivers, y de dónde puedes descargarlos, se listan a continuación:

| Navegador | Driver | Ubicación | Propiedad del Sistema |
| ------- | ------ | -------- | --------------- |
| Chrome | chromedriver | http://chromedriver.chromium.org | webdriver.chrome.driver |
| Firefox | geckodriver | https://github.com/mozilla/geckodriver/releases | webdriver.gecko.driver |
| Microsoft Edge | msedgedriver | https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/ | webdriver.edge.driver |
| Internet Explorer | IEDriverServer | https://github.com/SeleniumHQ/selenium/wiki/InternetExplorerDriver | webdriver.ie.driver |


### Descargas automáticas de drivers

Por defecto, Selenium descarga e instala automáticamente los binarios de driver apropiados para el driver especificado.

### Configurando binarios de drivers manualmente

Si no puedes o no deseas descargar los binarios de WebDriver automáticamente usando WebDriverManager (por ejemplo, si estás en una red corporativa que no tiene acceso a los binarios de WebDriverManager), puedes descargar los binarios y configurarlos directamente en el archivo `serenity.conf`.

En este caso necesitas tener el binario del driver correcto en la ruta de tu sistema, o proporcionar la ruta al binario usando la propiedad del sistema mostrada en la tabla anterior. Por ejemplo, tu archivo serenity.conf podría contener lo siguiente:

```hocon
webdriver.gecko.driver=/path/to/my/geckodriver
```

Sin embargo, añadir una ruta del sistema a tu archivo serenity.properties es una mala práctica, ya que significa que tus pruebas solo se ejecutarán si el directorio y binario especificados existen, y que estás ejecutando las pruebas en el sistema operativo correcto. Esto obviamente tiene poco sentido si estás ejecutando tus pruebas tanto localmente como en un entorno de CI.

Un enfoque más robusto es tener tus drivers en tu código fuente, pero tener diferentes drivers por sistema operativo. Serenity te permite pasar propiedades específicas del driver a un driver, siempre que estén prefijadas con drivers._os_. Por ejemplo, la siguiente línea configurará webdriver.chrome.driver si estás ejecutando tus pruebas en Windows.

```hocon
drivers {
  windows {
    webdriver.chrome.driver = src/test/resources/webdriver/windows/chromedriver.exe
  }
```

Puedes configurar fácilmente diferentes binarios para diferentes sistemas operativos de esta manera:

```hocon
drivers {
  windows {
    webdriver.chrome.driver = src/test/resources/webdriver/windows/chromedriver.exe
  }
  mac {
    webdriver.chrome.driver = src/test/resources/webdriver/mac/chromedriver
  }
  linux {
    webdriver.chrome.driver = src/test/resources/webdriver/linux/chromedriver
  }
}
```

Este enfoque también funciona cuando tienes más de un driver que configurar. Supongamos que necesitas ejecutar pruebas en tres entornos, usando Firefox o Windows. Un enfoque conveniente es almacenar tus drivers en una estructura de directorios bajo src/test/resources similar a la siguiente:

```
src/test/resources
└── webdriver
    ├── linux
    │   ├── chromedriver
    │   └── geckodriver
    ├── mac
    │   ├── chromedriver
    │   └── geckkodriver
    └── windows
        ├── chromedriver.exe
        └── geckodriver.exe
```

Esto significa que tus pruebas no necesitarán que los binarios de webdriver estén instalados en cada máquina.

La configuración correspondiente de `serenity.conf` para ambos navegadores y cada sistema operativo se vería así:

```hocon
drivers {
  windows {
    webdriver.chrome.driver = src/test/resources/webdriver/windows/chromedriver.exe
    webdriver.gecko.driver = src/test/resources/webdriver/windows/geckodriver.exe
  }
  mac {
    webdriver.chrome.driver = src/test/resources/webdriver/mac/chromedriver
    webdriver.gecko.driver = src/test/resources/webdriver/mac/geckodriver
  }
  linux {
    webdriver.chrome.driver = src/test/resources/webdriver/linux/chromedriver
    webdriver.gecko.driver = src/test/resources/webdriver/linux/geckodriver
  }
}
```

## Especificando propiedades W3C

Las [capacidades W3C](https://www.w3.org/TR/webdriver/#capabilities) son un conjunto estándar de características del driver que toda implementación de driver debe soportar. Puedes configurar las capacidades W3C en la sección `wenbdriver.capabilities` de tu archivo `serenity.conf`, como se muestra aquí:

```hocon
webdriver {
  capabilities {
    browserName = "Chrome"
    browserVersion = "103.0"
    platformName = "Windows 11"
    acceptInsecureCerts = true
  }
}
```

Puedes definir timeouts en una subsección dedicada de esta manera:

```hocon
webdriver {
  capabilities {
    browserName = "Chrome"
    browserVersion = "103.0"
    platformName = "Windows 11"
    timeouts {
      script = 30000
      pageLoad = 300000
      implicit = 2000
    }
  }
}
```

También puedes definir detalles de configuración de proxy en la sección `proxy`:
```hocon
webdriver {
  capabilities {
    browserName = "Chrome"
    browserVersion = "103.0"
    platformName = "Windows 11"
    proxy {
      proxyType = "30000"
      httpProxy = "myproxy.myorgcom:3128"
    }
  }
}
```

## Configurando Chrome

# Configurando Selenium WebDriver

[Contenido anterior sin cambios hasta la sección de configuración de Chrome...]

## Configurando Chrome

Puedes usar la capacidad especial `"goog:chromeOptions"` para definir cualquiera de las [opciones de ChromeDriver](https://chromedriver.chromium.org/capabilities)
```hocon
webdriver {
  capabilities {
    browserName = "Chrome"
    browserVersion = "103.0"
    platformName = "Windows 11"
    screenResolution = "1280x1024"

    "goog:chromeOptions" {
      args = [ "window-size=1000,800", "headless" ]
      binary = ${HOME}/path/to/chromedriver
      detach = true
      localState = {
        cart-contents = [1,2,3]
      }
    }
  }
}
```

### Configurando argumentos de Chromedriver

### Configurando ajustes de proxy

Chrome soporta varias configuraciones de proxy que pueden especificarse en tu archivo `serenity.conf`. Puedes configurar proxies en la sección general de capacidades o dentro de las opciones específicas de Chrome:

#### Configuración básica de proxy
```hocon
webdriver {
  capabilities {
    "goog:chromeOptions" {
      proxy {
        proxyType = "MANUAL"
        httpProxy = "proxy.example.com:8080"
        sslProxy = "proxy.example.com:8443"
        noProxy = "localhost,127.0.0.1,.example.com"
      }
    }
  }
}
```

#### Tipos de proxy
Serenity soporta varios tipos de proxy:

1. Configuración manual de proxy
```hocon
"goog:chromeOptions" {
  proxy {
    proxyType = "MANUAL"
    httpProxy = "proxy.example.com:8080"    # Proxy HTTP
    sslProxy = "proxy.example.com:8443"     # Proxy HTTPS
    socksProxy = "socks.example.com:1080"   # Proxy SOCKS
    socksVersion = 5                        # Versión SOCKS (4 o 5)
    noProxy = "localhost,127.0.0.1"         # Evitar proxy para estas direcciones
  }
}
```

2. PAC (Configuración Automática de Proxy)
```hocon
"goog:chromeOptions" {
  proxy {
    proxyType = "PAC"
    proxyAutoconfigUrl = "http://proxy.example.com/proxy.pac"
  }
}
```

3. Proxy del sistema
```hocon
"goog:chromeOptions" {
  proxy {
    proxyType = "SYSTEM"  # Usar configuración de proxy del sistema
  }
}
```

4. Conexión directa
```hocon
"goog:chromeOptions" {
  proxy {
    proxyType = "DIRECT"  # Sin proxy (conexión directa)
  }
}
```

5. Auto-detección
```hocon
"goog:chromeOptions" {
  proxy {
    proxyType = "AUTODETECT"  # Auto-detectar configuración de proxy
  }
}
```

#### Autenticación de proxy
Para proxies que requieren autenticación, incluye las credenciales en la URL del proxy:
```hocon
"goog:chromeOptions" {
  proxy {
    proxyType = "MANUAL"
    httpProxy = "username:password@proxy.example.com:8080"
  }
}
```

#### Configuración de proxy específica por entorno
Puedes configurar diferentes ajustes de proxy para diferentes entornos:
```hocon
environments {
  dev {
    webdriver.capabilities {
      "goog:chromeOptions" {
        proxy {
          proxyType = "DIRECT"
        }
      }
    }
  }
  qa {
    webdriver.capabilities {
      "goog:chromeOptions" {
        proxy {
          proxyType = "MANUAL"
          httpProxy = "proxy.qa.example.com:8080"
          sslProxy = "proxy.qa.example.com:8443"
          noProxy = "*.qa.example.com,localhost"
        }
      }
    }
  }
}
```

## Configurando Microsoft Edge

Microsoft Edge es un driver basado en Chromium, por lo que la configuración es muy similar a Chrome. La principal diferencia es el uso de `"ms:edgeOptions'"` en lugar de `"goog:chromeOptions"`. Una configuración típica se muestra a continuación:

```hocon
webdriver {
  capabilities {
    browserName = "MicrosoftEdge"
    "ms:edgeOptions" {
      args = ["test-type", "ignore-certificate-errors", "headless",
        "incognito", "disable-infobars", "disable-gpu", "disable-default-apps", "disable-popup-blocking"]
    }
  }
}

```

## Configurando Firefox

Firefox usa la capacidad `"moz:firefoxOptions"` para definir opciones específicas del navegador. Una configuración de ejemplo se muestra a continuación:

```hocon
webdriver {
  capabilities {
    browserName = "firefox"

    timeouts {
      implicit = 1000
      script = 1000
      pageLoad = 1000
    }
    pageLoadStrategy = "normal"
    acceptInsecureCerts = true
    unhandledPromptBehavior = "dismiss"
    strictFileInteractability = true

    "moz:firefoxOptions" {
      args = ["-headless"],
      prefs {
        "javascript.options.showInConsole": false
      },
      log {"level": "info"},
    }
  }
}
```

# Configurando múltiples entornos

Puedes configurar múltiples configuraciones de driver usando la sección `environments`, como se muestra a continuación. Luego simplemente establece la propiedad del sistema `environment` al entorno correspondiente para usar estos ajustes, por ejemplo:

```
mvn clean verify -Denvironment=chrome
```

Una sección de entornos de ejemplo se muestra aquí:

```
environments {
  chrome {
    webdriver {
      driver = chrome
      autodownload = true
      capabilities {
        browserName = "chrome"
        acceptInsecureCerts = true
        "goog:chromeOptions" {
          args = ["test-type", "ignore-certificate-errors", "headless", "--window-size=1000,800"
            "incognito", "disable-infobars", "disable-gpu", "disable-default-apps", "disable-popup-blocking"]
        }
      }
    }
  }
  edge {
    webdriver {
      capabilities {
        browserName = "MicrosoftEdge"
        "ms:edgeOptions" {
          args = ["test-type", "ignore-certificate-errors", "headless",
            "incognito", "disable-infobars", "disable-gpu", "disable-default-apps", "disable-popup-blocking"]
        }
      }
    }
  }
  firefox {
    webdriver {
      capabilities {
        browserName = "firefox"
        pageLoadStrategy = "normal"
        acceptInsecureCerts = true
        unhandledPromptBehavior = "dismiss"
        strictFileInteractability = true

        "moz:firefoxOptions" {
          args = ["-headless"],
          prefs {
            "javascript.options.showInConsole": false
          },
          log {"level": "info"},
        }
      }
    }
  }
}
```
