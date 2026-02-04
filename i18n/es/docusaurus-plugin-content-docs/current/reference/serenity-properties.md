---
id: serenity-properties
title: Propiedades del sistema y configuracion de Serenity
sidebar_position: 1
---

## Ejecutando pruebas de Serenity desde la linea de comandos

Tipicamente ejecutas Serenity como parte del proceso de compilacion (ya sea localmente o en un servidor CI). Ademas de la opcion `webdriver.driver` discutida [aqui](/docs/guide/driver_config), tambien puedes pasar varios parametros como propiedades del sistema para personalizar la forma en que se ejecutan las pruebas. Tambien puedes colocar estos archivos en un archivo de propiedades llamado `serenity.properties`, en el directorio raiz de tu proyecto.

La lista completa se muestra aqui:

### properties
Ruta absoluta del archivo de propiedades donde se definen los valores predeterminados de las propiedades del sistema de Serenity. Por defecto es `~/serenity.properties`

### webdriver.driver
En que navegador quieres que se ejecuten tus pruebas, por ejemplo firefox, chrome, phantomjs o iexplorer. Tambien puedes usar la propiedad *driver* como atajo.

### webdriver.autodownload
Establecer a `false` si no quieres que Serenity descargue automaticamente los binarios del driver para ejecuciones locales.

### webdriver.provided_type
Si usas un driver proporcionado, de que tipo es. La clase de implementacion necesita estar definida en la propiedad del sistema `webdriver.provided.{type}`.

### webdriver.base.url
La URL inicial predeterminada para la aplicacion, y URL base para rutas relativas.

### webdriver.remote.url
La URL a usar para drivers remotos (incluyendo un hub de selenium grid o URL de SauceLabs)

### phantomjs.webdriver.port
En que puerto ejecutar PhantomJS (usado en conjunto con webdriver.remote.url para registrar con un hub de Selenium, por ejemplo -Dphantomjs.webdriver=5555 -Dwebdriver.remote.url=http://localhost:4444/wd/hub

### webdriver.remote.driver
El driver a usar para drivers remotos

### serenity.driver.capabilities
Un conjunto de capacidades definidas por el usuario para configurar el driver de WebDriver. Las capacidades deben pasarse como una lista de pares clave:valor separados por espacios o punto y coma, por ejemplo "build:build-1234; max-duration:300; single-window:true; tags:[tag1,tag2,tag3]"

### webdriver.timeouts.implicitlywait
Cuanto tiempo espera webdriver por elementos que aparezcan por defecto, en milisegundos.

### webdriver.wait.for.timeout
Cuanto tiempo espera webdriver por defecto cuando usas un metodo de espera fluida, en milisegundos.

### webdriver.chrome.driver
Ruta al driver de Chrome, si no esta en la ruta del sistema.

### serenity.home
El directorio home para los archivos de salida y datos de Serenity - por defecto, $USER_HOME/.serenity

### serenity.outputDirectory
Donde deben generarse los reportes. Si el proyecto contiene solo un modulo (modulo raiz), entonces esta ruta sera relativa al modulo raiz, si el proyecto contiene mas de un submodulo - entonces esta ruta sera relativa al directorio del submodulo, tambien esta ruta puede ser diferente para cada submodulo o puede heredarse de la propiedad del proyecto raiz.

### serenity.project.name
Que nombre debe aparecer en los reportes

### serenity.ext.packages*
Paquetes de extension. Esta es una lista de paquetes que seran escaneados para implementaciones personalizadas de TagProvider. Para agregar un proveedor de etiquetas personalizado, simplemente implementa la interfaz TagProvider y especifica el paquete raiz para este proveedor en este parametro.

### serenity.verbose.screenshots
Deberia Serenity tomar capturas de pantalla para cada boton clickeado y cada enlace seleccionado? Por defecto, una captura de pantalla se almacenara al inicio y al final de cada paso. Si esta opcion se establece a true, Serenity grabara capturas de pantalla para cualquier accion realizada en un WebElementFacade, es decir, cada vez que uses una expresion como element(...).click(), findBy(...).click() y asi sucesivamente. Esto sera sobrescrito si la opcion ONLY_SAVE_FAILING_SCREENSHOTS se establece a true.
@Deprecated Esta propiedad aun esta soportada, pero serenity.take.screenshots proporciona un control mas detallado.

### serenity.take.screenshots
Establece esta propiedad para tener un control mas fino sobre como se toman las capturas de pantalla, el valor predeterminado es `serenity.take.screenshots=BEFORE_AND_AFTER_EACH_STEP` Esta propiedad puede tomar los siguientes valores:

* `FOR_EACH_ACTION`: Guarda una captura de pantalla en cada accion de elemento web (como click(), typeAndEnter(), type(), typeAndTab() etc.).
* `BEFORE_AND_AFTER_EACH_STEP`: Guarda una captura de pantalla antes y despues de cada paso.
* `AFTER_EACH_STEP`: Guarda una captura de pantalla despues de cada paso
* `FOR_FAILURES`: Guarda capturas de pantalla solo para pasos que fallan.
* `DISABLED`: No guarda capturas de pantalla para ningun paso.

### serenity.full.page.screenshot.strategy
Establece esta propiedad para tener soporte de capturas de pantalla de pagina completa. Esta propiedad puede tomar los siguientes valores:

* `true`: Habilita el modo de captura WHOLE_PAGE.
* `false`: Habilita el modo de captura VIEWPORT_ONLY. (predeterminado)

### serenity.report.encoding
Codificacion usada para generar las exportaciones CSV

### serenity.verbose.steps
Establece esta propiedad para proporcionar un registro mas detallado de los pasos de WebElementFacade cuando se ejecutan las pruebas.

### serenity.reports.show.step.details
Deberia Serenity BDD mostrar informacion detallada en las tablas de resultados de pruebas. Si esto se establece a true, las tablas de resultados de pruebas mostraran un desglose de los pasos por resultado. Esto es false por defecto.

### serenity.report.show.manual.tests
Mostrar estadisticas para pruebas manuales en los reportes de pruebas.

### serenity.report.show.releases
Reportar sobre releases (predeterminado true).

### serenity.restart.browser.frequency
Durante las pruebas basadas en datos, algunos navegadores (Firefox en particular) pueden volverse lentos con el tiempo debido a fugas de memoria. Para solucionar esto, puedes hacer que Serenity inicie una nueva sesion del navegador a intervalos regulares cuando ejecuta pruebas basadas en datos.

### serenity.step.delay
Pausa (en ms) entre cada paso de prueba.

### untrusted.certificates
Util si estas ejecutando pruebas de Firefox contra un servidor de pruebas HTTPS sin un certificado valido. Esto hara que Serenity use un perfil con la propiedad AssumeUntrustedCertificateIssuer establecida.

### refuse.untrusted.certificates
No aceptar sitios usando certificados no confiables. Por defecto, Serenity BDD acepta certificados no confiables - usa esto para cambiar este comportamiento.

### serenity.timeout
Cuanto tiempo debe esperar el driver por elementos que no son inmediatamente visibles, en milisegundos.

### serenity.browser.width
### serenity.browser.height
Redimensionar el navegador a las dimensiones especificadas, para tomar capturas de pantalla mas grandes. Esto deberia funcionar con Internet Explorer y Firefox, pero no con Chrome.

### serenity.resized.image.width
Valor en pixeles. Si se establece, las capturas de pantalla se redimensionan a este tamano. Util para ahorrar espacio.

### serenity.keep.unscaled.screenshots
Establecer a `true` si deseas guardar las capturas de pantalla originales sin escalar.
Esto esta establecido a `false` por defecto.

### serenity.store.html.source
Establecer esta propiedad a `true` para guardar el codigo fuente HTML de las paginas web capturadas.
Esto esta establecido a `false` por defecto.

### serenity.issue.tracker.url
La URL usada para generar enlaces al sistema de seguimiento de incidencias.

### serenity.activate.firebugs
Activar los plugins Firebugs y FireFinder para Firefox cuando se ejecutan las pruebas de WebDriver. Esto es util para depuracion, pero no se recomienda cuando se ejecutan las pruebas en un servidor de compilacion.

### serenity.batch.strategy
Define la estrategia de lotes. Valores permitidos - DIVIDE_EQUALLY (predeterminado) y DIVIDE_BY_TEST_COUNT. DIVIDE_EQUALLY simplemente dividira las pruebas igualmente entre todos los lotes. Esto podria ser ineficiente si el numero de pruebas varia mucho entre clases de prueba. Una estrategia DIVIDE_BY_TEST_COUNT podria ser mas util en tales casos ya que creara lotes basados en el numero de pruebas.

### serenity.batch.count
Si se esta usando pruebas por lotes, este es el tamano de los lotes que se ejecutan.

### serenity.batch.number
Si se esta usando pruebas por lotes, este es el numero del lote que se esta ejecutando en esta maquina.

### serenity.use.unique.browser
Establecer esto a true para ejecutar todas las pruebas web en un solo navegador, para una prueba. Puede usarse para configurar JUnit y Cucumber, el valor predeterminado es 'false'.

### restart.browser.each.scenario
Establecer esto a false para ejecutar todas las pruebas web en el mismo archivo de historia con un navegador, puede usarse cuando se usa JBehave. El valor predeterminado es 'false'

### serenity.restart.browser.for.each
Indicar cuando un navegador debe reiniciarse durante una ejecucion de prueba. Puede ser uno de: scenario, story, feature, never

### serenity.native.events
Activar y desactivar eventos nativos para Firefox estableciendo esta propiedad a `true` o `false`.

### security.enable_java
Establecer esto a true para habilitar el soporte de Java en Firefox. Por defecto, esto esta establecido a false ya que ralentiza el driver web.

### serenity.proxy.http
Configuracion de URL del proxy HTTP para Firefox y PhantomJS

### serenity.proxy.http_port
Configuracion de puerto del proxy HTTP para Firefox y PhantomJS
### serenity.proxy.type
Configuracion del tipo de proxy HTTP para Firefox y PhantomJS

### serenity.proxy.user
Configuracion del nombre de usuario del proxy HTTP para Firefox y PhantomJS

### serenity.proxy.password
Configuracion de la contrasena del proxy HTTP para Firefox y PhantomJS

### serenity.logging
Propiedad para proporcionar el nivel de acciones, resultados, etc. de Serenity.

* *QUIET* : Sin registro de Serenity BDD en absoluto
* *NORMAL* : Registrar el inicio y fin de las pruebas
* *VERBOSE* : Registrar el inicio y fin de las pruebas y los pasos de prueba, valor predeterminado

### serenity.test.root
El paquete raiz para las pruebas en un proyecto dado. Si se proporciona, Serenity usara esto como el paquete raiz cuando determine las capacidades asociadas con una prueba. Si estas usando el proveedor de requisitos del sistema de archivos, Serenity BDD esperara que esta estructura de directorios exista en la parte superior del arbol de requisitos. Si quieres excluir paquetes en una definicion de requisitos y comenzar en un nivel inferior en la jerarquia, usa la propiedad `serenity.requirement.exclusions`.

Esto tambien es usado por el `PackageAnnotationBasedTagProvider` para saber donde buscar requisitos anotados.

### serenity.requirements.dir
Usa esta propiedad si necesitas sobrescribir completamente la ubicacion de los requisitos para el proveedor del sistema de archivos.

### serenity.use.requirements.directories
Por defecto, Serenity BDD leera los requisitos de la estructura de directorios que contiene las historias. Cuando se usan otros plugins de etiquetas y requisitos, como el plugin de JIRA, esto puede causar etiquetas conflictivas. Establece esta propiedad a false para desactivar esta caracteristica (es true por defecto).

### serenity.annotated.requirements.dir
Usa esta propiedad si necesitas sobrescribir completamente la ubicacion de los requisitos para el proveedor de anotaciones. Esto se recomienda si usas el proveedor de sistema de archivos y el proveedor de anotaciones simultaneamente. El valor predeterminado es stories.

### serenity.requirement.types
La jerarquia de tipos de requisitos. Esta es la lista de tipos de requisitos a usar cuando se leen los requisitos del sistema de archivos y cuando se organizan los reportes. Es una lista de etiquetas separadas por comas. El valor predeterminado es: capability, feature.

### serenity.requirement.exclusions
Cuando se derivan tipos de requisitos de una ruta, excluir cualquier valor de esta lista separada por comas.

### serenity.test.requirements.basedir
El directorio base en el que se guardan los requisitos.
Se asume que este directorio contiene subcarpetas src/test/resources.
Si esta propiedad se establece, los requisitos se leen de src/test/resources bajo esta carpeta en lugar del classpath o directorio de trabajo.
Si necesitas establecer un directorio de requisitos independiente que no siga la convencion src/test/resources, usa `serenity.requirements.dir` en su lugar

Esta propiedad se usa para soportar situaciones donde tu directorio de trabajo
es diferente del directorio base de requisitos (por ejemplo cuando se construye un proyecto multi-modulo desde el pom padre con los requisitos almacenados dentro de un sub-modulo).

### serenity.release.types
Que nombres de etiquetas identifican los tipos de release (por ejemplo, Release, Iteration, Sprint). Una lista separada por comas. Por defecto, "Release, Iteration"

### serenity.locator.factory
Normalmente, Serenity usa SmartElementLocatorFactory, una extension de AjaxElementLocatorFactory cuando instancia page objects.
Esto es para asegurar que los elementos web esten disponibles y usables antes de que se usen.
Para un comportamiento alternativo, puedes establecer este valor a `DisplayedElementLocatorFactory`, `AjaxElementLocatorFactory` o `DefaultElementLocatorFactory`.

### chrome.switches
Argumentos a pasar al driver de Chrome, separados por punto y coma. Ejemplo: `chrome.switches = --incognito;--disable-download-notification`

// FIXME link to Serenity.useFirefoxProfile()
### webdriver.firefox.profile
La ruta al directorio del perfil a usar cuando se inicia firefox. Por defecto webdriver crea un perfil anonimo. Esto es util si quieres ejecutar las pruebas web usando tu propio perfil de Firefox. Si no estas seguro de como encontrar la ruta a tu perfil, mira aqui: http://support.mozilla.com/en-US/kb/Profiles. Por ejemplo, para ejecutar el perfil predeterminado en un sistema Mac OS X, harias algo como esto:

```bash
$ mvn test -Dwebdriver.firefox.profile=/Users/johnsmart/Library/Application\ Support/Firefox/Profiles/2owb5g1d.default
```
En Windows, seria algo como:

```bat
C:\Projects\myproject>mvn test -Dwebdriver.firefox.profile=C:\Users\John Smart\AppData\Roaming\Mozilla\Firefox\Profiles\mvxjy48u.default
```
### firefox.preferences
Una lista separada por punto y coma de configuraciones de Firefox. Por ejemplo,

```bash
-Dfirefox.preferences="browser.download.folderList=2;browser.download.manager.showWhenStarting=false;browser.download.dir=c:\downloads"
```

Los valores enteros y booleanos seran convertidos a los tipos correspondientes en las preferencias de Firefox; todos los demas valores seran tratados como Strings. Puedes establecer un valor booleano a true simplemente especificando el nombre de la propiedad, por ejemplo `-Dfirefox.preferences=app.update.silent`.

Una referencia completa a las configuraciones de Firefox se proporciona [aqui](https://kb.mozillazine.org/Firefox_:_FAQs_:_About:config_Entries).

### serenity.csv.extra.columns
Agregar columnas extra a la salida CSV, obtenidas de valores de etiquetas.

### serenity.console.headings
Escribir los encabezados de la consola usando ascii-art ("ascii", valor predeterminado) o en texto normal ("normal")

### tags
Lista de etiquetas separadas por "or". Si se proporciona, solo se ejecutaran las clases y/o metodos de JUnit con etiquetas en esta lista. Por ejemplo,

```bash
mvn verify -Dtags="iteration:I1"

mvn verify -Dtags="color:red or flavor:strawberry"
```

### output.formats
En que formato deben generarse los resultados de las pruebas. Por defecto, esto es "json,xml".

### narrative.format
Establece esta propiedad a 'asciidoc' para activar el uso del formato http://www.methods.co.nz/asciidoc/[Asciidoc] en el texto narrativo.

### jira.url
Si se define la URL base de JIRA, Serenity construira la url del sistema de seguimiento de incidencias usando el formulario estandar de JIRA.

### jira.project
Si se define, el id del proyecto JIRA se antepondra a los numeros de incidencia.

### jira.username
Si se define, el nombre de usuario de JIRA requerido para conectar a JIRA.

### jira.password
Si se define, la contrasena de JIRA requerida para conectar a JIRA.

### show.pie.charts
Mostrar los graficos de pastel en el dashboard por defecto. Si esto se establece a false, los graficos de pastel estaran inicialmente ocultos en el dashboard.

### dashboard.tag.list
Si se establece, esto definira la lista de tipos de etiquetas a aparecer en las pantallas del dashboard

*dashboard.excluded.tag.list*::Si se establece, esto definira la lista de tipos de etiquetas a excluir de las pantallas del dashboard

### json.pretty.printing
Formatear los resultados de pruebas JSON de forma legible. "true" o "false", desactivado por defecto.

### simplified.stack.traces
Los stack traces por defecto se simplifican para legibilidad. Por ejemplo, las llamadas a codigo instrumentado o bibliotecas de pruebas internas se eliminan. Este comportamiento puede desactivarse estableciendo esta propiedad a false.

### serenity.dry.run
Recorrer los pasos sin ejecutarlos realmente.

### feature.file,language
En que idioma (humano) estan escritos los archivos de caracteristicas de Cucumber? Por defecto es "en".

### serenity.maintain.session
Mantener los datos de sesion de Serenity BDD entre pruebas. Normalmente, los datos de sesion se limpian entre pruebas.

### serenity.console.colors
Hay una caracteristica para salida de consola colorida durante la ejecucion de pruebas de Serenity. Para habilitarla debes proporcionar la variable `serenity.console.colors = true`, por defecto esta desactivada. Esta caracteristica puede causar errores si esta habilitada para builds bajo Jenkins.

![Salida de color de consola deshabilitada](img/console-colors-off.png)

Si esta propiedad es igual a true encontraras salida colorida:

![Salida de color de consola habilitada](img/console-colors-on.png)

### serenity.include.actor.name.in.consequences
Establecer a true para mostrar nombres de Actor en los pasos "then". Especialmente util cuando tienes multiples Actor en una prueba

[FIXME move FF profile to extended driver info pages?]:#
## Proporcionando tu propio perfil de Firefox

Si necesitas configurar tu propio perfil de Firefox personalizado, puedes hacer esto usando el metodo Serenity.useFirefoxProfile() antes de iniciar tus pruebas. Por ejemplo:

```java
@Before
public void setupProfile() {
  FirefoxProfile myProfile = new FirefoxProfile();
  myProfile.setPreference("network.proxy.socks_port",9999);
  myProfile.setAlwaysLoadNoFocusLib(true);
  myProfile.setEnableNativeEvents(true);
  Serenity.useFirefoxProfile(myProfile);
}

@Test
public void aTestUsingMyCustomProfile() {...}
```
