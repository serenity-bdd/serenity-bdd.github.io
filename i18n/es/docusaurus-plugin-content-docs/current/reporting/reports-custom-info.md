---
id: reports_custom_info
title: Campos Personalizados en Reportes
sidebar_position: 5
---
## Reportes de Campos Personalizados

Los campos personalizados pueden incluirse en los reportes, usando valores que se toman de las variables de entorno o se pasan al build mediante propiedades del sistema. Esto puede ser útil si quieres incluir la versión del producto o del build, el entorno donde se ejecutaron las pruebas, o la fecha de ejecución de las pruebas.

Puedes agregar campos personalizados a tu reporte configurando propiedades del sistema con el prefijo especial `report.customfields`. Estas pueden ir en tu archivo `serenity.properties` en el directorio raíz de tu proyecto, o puedes pasarlas como opciones de línea de comandos.

Por ejemplo, podrías agregar las siguientes propiedades a tu archivo `serenity.properties`.
```
report.customfields.environment = Integration
report.customfields.ApplicationVersion = 1.2.3
```

Esto produciría un reporte conteniendo estos valores, como se muestra aquí:

![Campos personalizados apareciendo en el reporte de resumen HTML](img/custom-report-fields.png)

### Acceder a variables del sistema
También podemos acceder a cualquier variable del sistema a la que Java tiene acceso. Por ejemplo, podríamos incluir el nombre del usuario que ejecutó las pruebas con la variable del sistema `${USER}`:

```
report.customfields.user = ${USER}
```

Esta propiedad resultaría en un reporte como el siguiente:

![Los campos personalizados también pueden incluir variables del sistema](img/custom-reports-including-a-system-variable.png)

No todas las propiedades del sistema están disponibles para Java. Por ejemplo, en sistemas Linux, la variable `$HOST` da el nombre de la máquina local. Podríamos incluir esto en nuestro reporte agregando la siguiente propiedad:

```
report.customfields.host = ${HOST}
```

Sin embargo, dado que esta variable no está disponible para Java, necesitaríamos pasarla a Serenity desde la línea de comandos, así:

```bash
mvn serenity:aggregate -DHOST=$HOST
```

### Sobrescribir valores de propiedades

[[custom-report-fields-with-provided-values]]
.Puedes pasar propiedades del sistema desde la línea de comandos
image::custom-reports-with-provided-property.png[]

Por supuesto puedes pasar otras propiedades, para sobrescribir las que están en tu archivo `serenity.properties`. Aquí sobrescribimos la versión de la aplicación:

```bash
mvn serenity:aggregate -DHOST=$HOST -Dreport.customfields.ApplicationVersion=1.2.4
```
Pero una solución más elegante, si sabes que siempre estarás pasando una variable, es usar una variable más corta en tu archivo `serenity.properties` y luego pasar esta. Por ejemplo, aquí usamos la propiedad `environment` para mostrar el entorno actual en las propiedades personalizadas:

```
report.customfields.environment = ${environment}
```

Podemos establecer este valor desde la línea de comandos como se muestra aquí:

```bash
mvn serenity:aggregate -DHOST=$HOST -Denvironment=INT5
```

#### Usar valores predeterminados
Si una variable de entorno no existe, puedes especificar un valor de respaldo.

```
report.customfields.user = ${USER:-Unknown}
report.customfields.host = ${HOST:-} # En blanco en lugar de los caracteres literales "${HOST}"
```
El mecanismo detrás de la sustitución: [Apache Commons `StringSubstitutor`](https://commons.apache.org/proper/commons-text/apidocs/org/apache/commons/text/StringSubstitutor.html)

### Ordenar las propiedades personalizadas

Por defecto, los campos aparecerán en un orden arbitrario. Puedes forzar que los campos aparezcan en un orden predeterminado usando el campo `report.customfields.order`:

```
report.customfields.order=ApplicationVersion,environment,user,host
```

### Un ejemplo completo
Un ejemplo completo de estas propiedades y sus varios usos se muestra aquí:

```
report.customfields.ApplicationVersion = 1.2.3
report.customfields.environment = ${environment}
report.customfields.user = ${USER}
report.customfields.host = ${HOST}
report.customfields.order=ApplicationVersion,environment,user,host
```

## Información de Build Personalizada

También puedes agregar tus propios campos a la pantalla de Información de Build, usando las propiedades `sysinfo.*`.
Las propiedades `sysinfo.*` te permiten definir campos y valores que aparecerán en la página de Información de Build. Para combinaciones simples de campo-valor, el campo aparece junto a los otros valores en la pantalla de Información de Build:

```
sysinfo.lead = Daisy
```

Puedes usar expresiones Groovy para acceder a propiedades del sistema (que puedes pasar desde la línea de comandos). La propiedad `env` te da acceso a las variables de entorno actuales. Por ejemplo, para mostrar el número de build actual de Jenkins, podrías incluir la siguiente línea:

```
sysinfo.build = "${env.BUILD_NUMBER}"
```

También puedes agrupar propiedades personalizadas en secciones con subtítulos. Un ejemplo de tal configuración en el archivo `serenity.conf` se muestra a continuación:

```
sysinfo {
  lead = Daisy
  build = "${env.BUILD_NUMBER}"
  Test Run {
    Run By = "${env.USER}"
    Java Version = "${java.version}"
  }
}
```

La pantalla de Información de Build correspondiente se muestra a continuación:

![Detalles personalizados de Información de Build](img/build-info.png)

## Definir información de build programáticamente

También puedes usar la clase `BuildInfo` para agregar información a la página de Información de Build programáticamente. Simplemente define la sección, y agrega tantos pares de nombre/valor de propiedad como quieras. Puedes ver un ejemplo aquí:

```java
BuildInfo.section("Toggles").setProperty("toggle-custom-ads-v2", "on");
BuildInfo.section("Toggles").setProperty("toggle-user-feedback", "on");

BuildInfo.section("Versions").setProperty("game-history-service", "1.2.3");
BuildInfo.section("Versions").setProperty("player-service", "3.4.5");
BuildInfo.section("Versions").setProperty("related-products-service", "2.3.4");
```

![Detalles personalizados de Información de Build](img/custom-build-info.png)
