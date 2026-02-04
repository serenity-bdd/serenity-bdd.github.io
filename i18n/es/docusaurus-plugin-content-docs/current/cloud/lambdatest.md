---
id: lambdatest
title: LambdaTest
sidebar_position: 2
---
# Integración de Serenity BDD con LambdaTest

LambdaTest es una plataforma en la nube para ejecución y orquestación de pruebas. Con LambdaTest, los usuarios de Serenity pueden ampliar la cobertura de pruebas de automatización de sus aplicaciones web y móviles en más de 3000 dispositivos reales, navegadores y sistemas operativos.

El plugin `serenity-lambdatest` proporciona una integración perfecta con la plataforma de automatización de pruebas en línea [LambdaTest](https://www.lambdatest.com?utm_source=serenity_bdd&utm_medium=website).

## Agregar el plugin de LambdaTest

Para agregar el soporte integrado de LambdaTest a tu proyecto, necesitarás agregar la dependencia `serenity-lambdatest` a las dependencias de tu proyecto. Para Maven, agregarías lo siguiente:
```xml
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-lambdatest</artifactId>
        <version>${serenity.version}</version>
    </dependency>
```

Y para Gradle:
```groovy
    testImplementation "net.serenity-bdd:serenity-lambdatest:${serenityVersion}"
```

## Especificar tus credenciales de LambdaTest y la URL del grid
A continuación, necesitarás una [cuenta de LambdaTest](https://accounts.lambdatest.com/register?utm_source=serenity_bdd&utm_medium=sponsor&utm_campaign=serenity_bdd&utm_term=sk&utm_content=homepage) (si aún no tienes una, puedes configurar una cuenta gratuita de por vida para experimentar).

Puedes agregar tus [credenciales de LambdaTest](https://www.lambdatest.com/support/docs/using-environment-variables-for-authentication-credentials?utm_source=serenity_bdd&utm_medium=sponsor&utm_campaign=serenity_bdd&utm_term=sk&utm_content=homepage) de dos maneras. La más sencilla es definir las siguientes propiedades del sistema:
* `LT_USERNAME` - Nombre de usuario de LambdaTest
* `LT_ACCESS_KEY` - Clave de acceso de LambdaTest

Alternativamente, puedes definir tu nombre de usuario y clave de acceso usando las propiedades `lt.user` y `lt.key` respectivamente en tu archivo `serenity.conf`:

```hocon
lt.user=myuser
lt.key=XXXXXXXX
```

Por defecto, se usará la URL estándar del grid de LambdaTest ("hub.lambdatest.com") para conectarse a los servidores de LambdaTest, pero puedes anular esto configurando la propiedad `lt.grid`:

```hocon
lt.grid = "mycustomhub.lambdatest.com"
```

## Configurar el driver de LambdaTest

Serenity interactúa con LambdaTest a través del driver `RemoteDriver`. Puedes especificar la URL remota explícitamente, o dejar que la biblioteca `serenity-lambdatest` lo haga por ti. Por ejemplo, para configurar la URL explícitamente podrías usar una configuración de `serenity.conf` como esta:
```hocon
webdriver {
  driver = remote
  remote.url = "https://"${LT_USERNAME}":"${LT_ACCESS_KEY}"@hub.lambdatest.com/wd/hub"
}
```

Si la propiedad `webdriver.remote.url` no está definida, Serenity usará estos valores para construir una URL por ti si el plugin de LambdaTest está activo (ver más abajo).

## Activar el plugin de LambdaTest

El plugin de Serenity LambdaTest se invocará si Serenity puede encontrar una sección `"LT:Options"` en tu archivo `serenity.conf`, o si especificas una `remote.webdriver.url` que apunte a un servidor de LambdaTest. Si no tienes capacidades específicas de LambdaTest, simplemente establece la propiedad `lambdatest.active` en true así:

```hocon
lambdatest {
  active = true
}
```

## Definir capacidades de LambdaTest

Puedes especificar el sistema operativo y el navegador en el que deseas ejecutar tus pruebas personalizando las [Selenium Capabilities](https://www.lambdatest.com/support/docs/selenium-automation-capabilities?utm_source=serenity_bdd&utm_medium=sponsor&utm_campaign=serenity_bdd&utm_term=sk&utm_content=homepage) en tu archivo `serenity.conf`. Haz esto en la sección `"LT:Options"` del archivo `serenity.conf`, por ejemplo:

```hocon
    webdriver {
      driver = "remote"
      capabilities {
        browserName = "chrome"
        version = "104.0"
        platform = "Windows 10"
        #
        # Cualquier opción específica de LambdaTest va en la sección 'LT:Options'
        #
        "LT:Options" {
          resolution", "1280x800"
          network = true // Para habilitar los logs de red
          visual = true // Para habilitar capturas de pantalla paso a paso
          video = true // Para habilitar la grabación de video
          console = true // Para capturar los logs de consola
        }
      }
    }
```

Ten en cuenta que la opción `w3c` se establecerá en `true` por defecto, ya que este es el protocolo predeterminado para la versión de Selenium integrada con Serenity.

El nombre de la prueba de LambdaTest se asignará automáticamente. También puedes establecer el nombre del _build_ asignando la propiedad `lambdatest.build`.
Por ejemplo, el siguiente ejemplo muestra cómo crear un nombre de build a partir de las variables de entorno del nombre del job y número de build de Jenkins:

```hocon
lambdatest {
  build = "${JOB_NAME} - build ${BUILD_NUMBER}"
}
```

Estas propiedades se colocarán en la capacidad `LT:Options`.

:::tip

LambdaTest proporciona un conveniente [Generador de Capacidades](https://www.lambdatest.com/capabilities-generator?utm_source=serenity_bdd&utm_medium=sponsor&utm_campaign=serenity_bdd&utm_term=sk&utm_content=homepage) que da una idea de qué opciones están disponibles.

:::


