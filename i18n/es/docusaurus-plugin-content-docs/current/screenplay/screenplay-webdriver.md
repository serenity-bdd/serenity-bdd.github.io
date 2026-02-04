---
id: screenplay_webdriver
sidebar_position: 2
---
# Pruebas Web con Serenity Screenplay
## Introduccion
Las pruebas web son un caso de uso comun para los Scenario de Screenplay, donde tratamos de modelar el comportamiento e interacciones del usuario con el sistema. En esta seccion, aprenderemos como interactuar con una aplicacion web usando la integracion de Screenplay con WebDriver.

## Abriendo una URL

### Abriendo una URL directamente
En Screenplay, abres una nueva pagina usando la clase de Interaction `Open`. Esto puede funcionar con una URL, por ejemplo:

```java
toby.attemptsTo(Open.url("https://todomvc.com/examples/angularjs/#/"));
```

### Abriendo la URL de un Page Object
Si has definido un Page Object con una url por defecto, puedes abrir un Page Object refiriendote a la clase del Page Object. Supongamos que hemos definido el siguiente Page Object de Serenity, y establecimos el valor `@DefaultUrl` a la URL de la aplicacion TodoMVC:

```java
@DefaultUrl("https://todomvc.com/examples/angularjs/#/")
public class TodoMvcPage extends PageObject {}
```

Ahora podemos abrir esta pagina usando el metodo `Open.browserOn()`, asi:

```java
toby.attemptsTo(Open.browserOn().the(TodoMvcPage.class));
```

### Usando paginas con nombre

A veces puede ser conveniente almacenar las URLs para diferentes entornos o servidores en el archivo `serenity.conf`, y referirse a ellas por el nombre de la propiedad en nuestro codigo de test.

Por ejemplo, imagina que quieremos ejecutar nuestros tests contra las implementaciones de Angular, React y Polymer de la aplicacion TodoMVC. Cada aplicacion tiene una URL diferente, que podriamos almacenar en el archivo `serenity.conf` asi:

```json
pages {
    angular = "https://todomvc.com/examples/angularjs/#/"
    react = "https://todomvc.com/examples/react/#/"
    polymer = "https://todomvc.com/examples/polymer/index.html"
}
```

A continuacion, podemos referirnos a estas propiedades en nuestro codigo usando el metodo `thePageNamed()`, asi:

```java
toby.attemptsTo(Open.browserOn().thePageNamed("pages.react"));
```

## Localizando elementos en una pagina

En Screenplay, puedes usar varias estrategias diferentes para localizar los elementos con los que necesitas interactuar.

### CSS y XPath

La forma mas simple de localizar un elemento es usar una expresion CSS o XPath, como se muestra aqui:

```java
toby.attemptsTo(
    Click.on("#login-button")
);
```

O

```java
toby.attemptsTo(
    Click.on("//input[@id='login-button']")
);
```

Serenity interpretara la cadena para determinar si es una expresion XPath o CSS. En algunos casos puede haber alguna ambiguedad, y Serenity usara XPath por defecto. Si esto no es lo esperado, puedes usar los prefijos "xpath:" o "css:" para especificar que tipo de localizador quieres:

```java
toby.attemptsTo(
    Click.on("css:input[name=login-button]")
);
```


### Usando localizadores de Selenium
Tambien puedes usar cualquiera de las clases localizadoras estandar de Selenium (`org.openqa.selenium.By`), como se muestra aqui:

```java
toby.attemptsTo(
    Click.on(By.id("login-button"))
);
```

### Usando la clase Target

Usar localizadores de texto o `By` tiene la ventaja de ser conciso, pero puede llevar a reportes de prueba poco legibles, especialmente cuando se usan localizadores XPath o CSS complejos o sin significado. En Screenplay, la clase `Target` nos permite dar un nombre mas significativo a una estrategia de localizacion. Por ejemplo, considera el siguiente codigo:

```java
toby.attemptsTo(Click.on("//button[.='Add']"));
```

En los reportes de Serenity, este paso se reportara como "Toby clicks on //button[.='Add']", lo cual no es muy legible.

Si representamos este boton usando la clase `Target`, podemos asociar una etiqueta como "Add to cart button", asi:

```java
Target ADD_TO_CART = Target.the("Add to cart button").located(By.cssSelector("//button[.='Add']"));

toby.attemptsTo(Click.on(ADD_TO_CART));
```

En los reportes, este paso ahora aparecera como "Toby clicks on Add to cart button".

### Usando Target dinamicos

Tambien puedes incluir variables en un localizador `Target`, para hacer tus localizadores dinamicos. Puedes incluir parametros numerados usando "{0}", "{1}", etc., y luego usar el metodo `of()` para instanciar el `Target` con el valor que te interesa. Por ejemplo, podriamos crear un localizador generico para un boton que contiene un texto dado asi:

```java
Target BUTTON_WITH_LABEL = Target.the("{0} button").located(By.cssSelector("//button[.='{0}']"));

toby.attemptsTo(Click.on(BUTTON_WITH_LABEL.of('Add')));
```

Incluso podriamos usar este Target dinamico para definir otros Target con valores especificos, asi:

```java
Target BUTTON_WITH_LABEL = Target.the("{0} button").located(By.cssSelector("//button[.='{0}']"));
Target ADD_BUTTON = BUTTON_WITH_LABEL.of('Add');

toby.attemptsTo(Click.on(ADD_BUTTON));
```

### Usando Page Element

Los [Page Element](../../docs/guide/page_elements) de Serenity proporcionan una forma mas intuitiva y legible de localizar elementos en una pagina, a menudo sin necesidad de usar XPath o CSS. Con Page Element, puedes identificar elementos usando expresiones como las siguientes
  - `Click.on(Button.withText("Add to cart"))`
  - `Enter.theValue(").into(InputField.withPlaceholder("Enter the customer name"))`
  - `Click.on(PageElement.locatedBy(".item").containingText("Bananas"))`

Puedes aprender mas sobre Page Element [aqui](../../docs/guide/page_elements).

## Interactuando con elementos

En esta seccion veremos como interactuar con elementos en una pagina web usando Selenium WebDriver con Serenity Screenplay.

### Clases de Interaction de Screenplay
Puedes encontrar las clases de Interaction estandar de Serenity en el paquete `net.serenitybdd.screenplay.actions`.

| Interaction                    | Proposito              | Ejemplo     |
| -----------                    | --------             | ----------- |
| Clear                          | Limpiar un campo de entrada | `actor.attemptsTo(Clear.field("#firstname"))`           |
| Click                          | Hacer clic en un elemento  | `actor.attemptsTo(Click.on("#add-to-cart"))`           |
| DoubleClick | Doble clic en un elemento usando una Action de Selenium | `actor.attemptsTo(DoubleClick.on("#add-to-cart"))`           |
| Enter                          | Escribir un valor en un campo de entrada  | `actor.attemptsTo(Enter.theValue("scott").into("#username"))`           |
| Evaluate                       | Evaluar una expresion Javascript  | `actor.attemptsTo(Evaluate.javascript("window.localStorage.clear();")`           |
| Hit                            | Presionar una tecla  | `actor.attemptsTo(Hit.the(Keys.ENTER).into("#searchterms"))`           |
| JavaScriptClick                | Hacer clic en un elemento usando Javascript en lugar de Selenium | `actor.attemptsTo(JavaScriptClick.on("#add-to-cart"))`           |
| MoveMouse                      | Mover el mouse sobre un elemento especificado | `actor.attemptsTo(MoveMouse.to("#main-menu"))`           |
| Open | Abrir una URL o pagina especifica | `actor.attemptsTo(Open.url("https://www.google.com"))`|
| PerformOn | Realizar una o mas acciones en varios elementos | Ver abajo |
| RightClick | Clic derecho en un elemento dado | `actor.attemptsTo(RightClick.on("#menu"))` |
| Scroll | Desplazar hasta un elemento usando Javascript | `actor.attemptsTo(Scroll.to("#terms-and-conditions"))` |
| SelectFromOptions | Seleccionar un valor en un dropdown HTML | `actor.attemptsTo(SelectFromOptions.byVisibleText("Red").from("#color"))` |
| SendKeys | Introducir un valor en un campo usando el metodo sendKeys() de Selenium |`actor.attemptsTo(SendKeys.of("scott").into("#username"))`           |
| SetCheckbox                  | Marcar un campo checkbox | `actor.attemptsTo(SetCheckbox.of("#subscribe-to-newsletter").toTrue())`           |
| Switch   | Cambiar a otra ventana o pestana | `actor.attemptsTo(Switch.toNewWindow())`           |
| Upload    | Subir un archivo usando un campo de carga HTML |  `actor.attemptsTo(Upload.theFile(pathToFile)).to("#uploaded-file"))`           |
| WithDevTools | Realizar una accion con Chrome DevTools | Ver abajo |

Las Interaction mas importantes se describen con mas detalle en las siguientes secciones.

### Clear

La Interaction `Clear` restablece el valor de un elemento de formulario HTML.

```java
        dina.attemptsTo(Clear.field(By.id("first-name")));
```

### Click

Hacer clic en un boton o elemento.

```java
        dina.attemptsTo(Click.on("#some-button"));
```

A veces un elemento no esta en un estado interactuable cuando intentamos hacer clic en el por primera vez. Por ejemplo, puede estar deshabilitado, o aun no visible en la pagina. En estos casos, podemos pedir a Serenity que espere a que el elemento este habilitado usando el metodo `afterWaitingUntilEnabled()`:

```java
        dina.attemptsTo(Click.on("#some-button").afterWaitingUntilEnabled());
```

Si el elemento aun no se ha renderizado, podemos usar el metodo `afterWaitingUntilPresent()`:

```java
        dina.attemptsTo(Click.on("#some-button").afterWaitingUntilPresent());
```

En ambos casos, Serenity esperara hasta 5 segundos por defecto para que el elemento este presente o disponible. Puedes configurar este tiempo de espera usando la propiedad del sistema `webdriver.wait.for.timeout` (definida en milisegundos).

### DoubleClick

Doble clic en un boton o elemento, usando Selenium Actions.

```java
        dina.attemptsTo(DoubleClick.on("#some-button"));
```

### Enter y SendKeys

Hay dos formas de introducir un valor en un campo.

`Enter` introducira un valor en un campo, primero esperando hasta que el campo este habilitado, y luego limpiando el campo de cualquier valor actual, antes de introducir el valor especificado.

```java
        dina.attemptsTo(Enter.theValue("Sarah-Jane").into("#firstName"));
```

`SendKeys` realizara el equivalente del `sendKeys()` de Selenium, puedes usar `Enter.keyValue()` en lugar de `Enter.theValue()`

```java
        dina.attemptsTo(SendKeys.of("Sarah-Jane").into("#firstName"));
```

### Evaluar una expresion Javascript

El Task `Evaluate` ejecuta un comando JavaScript en el contexto del frame o ventana actualmente seleccionada. Por ejemplo, el siguiente codigo limpiara el almacenamiento local en el navegador de Dina:

```java
dina.attemptsTo(Evaluate.javascript("window.localStorage.clear()"));
```

Si el script tiene un valor de retorno (es decir, si el script contiene una declaracion return), tambien puedes recuperar el valor devuelto por una expresion Javascript. Puedes hacer esto de dos formas. La primera es usar el metodo `result()` para convertir la accion `Evaluate` en una Question. Puedes ver un ejemplo aqui:

```java
        Long result = (Long) dina.asksFor(Evaluate.javascript("return 1 + 1").result());
        assertThat(result).isEqualTo(2);
```

El tipo de objeto devuelto por WebDriver es el siguiente:
 * Para un elemento HTML, este metodo devuelve un `WebElement`
 * Para un decimal, se devuelve un `Double`
 * Para un numero no decimal, se devuelve un `Long`
 * Para un booleano, se devuelve un `Boolean`
 * Para todos los demas casos, se devuelve un `String`.
 * Para un array, devuelve una `List<Object>` con cada objeto siguiendo las reglas anteriores. Soportamos listas anidadas.
 * Para un map, devuelve un `Map<String, Object>` con valores siguiendo las reglas anteriores.

### Presionar una tecla particular

Puedes introducir cualquier tecla o combinacion de teclas de Selenium usando el Task `Enter`. Tambien puedes querer usar el Task `Hit` para mayor legibilidad. La clase de Interaction `Hit` es similar a la clase `Enter`, pero toma una lista de uno o mas valores `Keys`:

```java
        dina.attemptsTo(Enter.theValue("Sarah-Jane").into(By.id("firstName")));
        dina.attemptsTo(Hit.the(Keys.TAB).into(By.id("firstName")));
```

### Trabajando con checkbox

Puedes marcar o desmarcar un elemento checkbox haciendo clic en el usando la Interaction `Click`. Si quieres estar seguro de que el elemento esta marcado o desmarcado, tambien puedes usar la clase `SetCheckbox`, para marcar o desmarcar el campo.

Por ejemplo, para marcar el checkbox de Terminos y Condiciones en un formulario, podrias usar lo siguiente:

```java
        dina.attemptsTo(SetCheckbox.of("#terms-and-conditions").toTrue());
```

Y para desmarcarlo, podrias hacer esto:

```java
        dina.attemptsTo(SetCheckbox.of("#terms-and-conditions").toFalse());
```

Dado que habilitar y deshabilitar checkbox implica hacer clic, tambien podemos usar los metodos `afterWaitingUntilEnabled()` y `afterWaitingUntilPresent()` disponibles con la clase de Interaction `Click`, por ejemplo:

```java
        dina.attemptsTo(
            SetCheckbox.of("#terms-and-conditions").toFalse()
                                                   .afterWaitingUntilEnabled());
```

### JavaScriptClick

A veces es util poder saltarse Selenium y realizar un click() directamente con JavaScript. Podemos hacer esto con la clase `JavaScriptClick`. La clase tiene la misma API que la clase `Click`, por ejemplo:

```java
        dina.attemptsTo(JavaScriptClick.on("#button"));
```

### Moviendo el mouse

Podemos mover el mouse a un elemento en la pagina usando `MoveMouse`, por ejemplo:

```java
        dina.attemptsTo(MoveMouse.to("#button"));
```

Si necesitamos realizar una o mas acciones en el elemento una vez que hemos movido el cursor sobre el, podemos hacerlo usando el metodo `andThen()` con una expresion Lambda, a la que se le pasa el objeto Actions. Por ejemplo, para hacer clic en el boton despues de mover el cursor hacia el, podriamos hacer lo siguiente:

```java
        dina.attemptsTo(MoveMouse.to(BUTTON).andThen(actions -> actions.click()));
```

### Realizando acciones en colecciones de elementos

Tambien podemos realizar acciones en una coleccion de elementos. Supongamos que tenemos una pagina HTML que contiene una lista de checkbox como esta:

```html
    <div>
        <label>Condiments:</label>
        Salt <input type="checkbox" id="salt" class="condiment" name="salt">
        Pepper <input type="checkbox" id="pepper" class="condiment" name="pepper">
        Sauce <input type="checkbox" id="sause" class="condiment" name="sauce">
    </div>
```

Podriamos marcar cada uno de estos checkbox de una vez usando el metodo `PerformOn.eachMatching()`. Este toma dos parametros:
 - Un localizador (un Target, localizador `By`, o expresion CSS o XPath)
 - Una expresion lambda que acepta un `WebElementFacade`

Si quisieramos hacer clic en cada uno de estos checkbox, podriamos hacer lo siguiente:

```java
         dina.attemptsTo(
            PerformOn.eachMatching(".condiment", WebElementFacade::click)
        );
```

Tambien puedes usar Performable de Screenplay, como se muestra en este ejemplo:
```java
        dina.attemptsTo(
            PerformOn.eachMatching(".condiment",
                checkbox -> dina.attemptsTo(SetCheckbox.of(checkbox).toTrue()))
        );
```

### RightClick

Puedes hacer clic derecho en un elemento usando la clase `RightClick`. Esto usara el metodo de accion `contextClick()` de Selenium:

```java
        dina.attemptsTo(RightClick.on("#button"));
```

### Desplazando elementos a la vista

A veces puede ser util desplazarse hasta un elemento especifico en la pagina. Puedes hacer esto con la clase `Scroll`, asi, que usa Javascript para desplazar el elemento a la vista.

```java
        dina.attemptsTo(Scroll.to(By.id("#button")));
```

Esta clase usa el metodo Javascript `scrollIntoView()`, que por defecto desplazara la pantalla para que la parte superior del elemento este alineada con la parte superior del area visible del ancestro desplazable. Tambien puedes alinear la parte inferior del elemento con la parte inferior del area visible del ancestro desplazable, usando el metodo `andAlignToBottom()`, por ejemplo:

```java
        dina.attemptsTo(Scroll.to(By.id("#button")).andAlignToBottom());
```

### Seleccionando de dropdowns

Podemos seleccionar un valor de un dropdown usando la clase `SelectFromOptions`. Supongamos que tenemos el siguiente codigo HTML:

```html
        <select id="color">
            <option value="red">Red</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
        </select>
```

Podemos seleccionar la segunda de estas opciones de cualquiera de las siguientes formas:
```java
    dina.attemptsTo(SelectFromOptions.byVisibleText("Green").from("#color"));
    dina.attemptsTo(SelectFromOptions.byValue("green").from("#color"));
    dina.attemptsTo(SelectFromOptions.byIndex(1).from("#color"));
```

Podemos recuperar el valor actual de una lista desplegable usando la clase Question `SelectedValue`, por ejemplo:

```java
    String selectedValue = dina.asksFor(SelectedValue.of(COLOR_"#color")));
```

### Cambiando a otra ventana o frame

Podemos cambiar a una nueva ventana o pestana usando la clase `Switch`. Por ejemplo, el siguiente codigo abre un enlace en una nueva pestana y cambia el control a esta pestana:

```java
        dina.attemptsTo(
                Click.on("#link-that-opens-a-new-tab"),
                Switch.toNewWindow()
        );
```

Si solo hay dos ventanas o pestanas abiertas, podemos volver a la ventana original usando el metodo `Switch.toTheOtherWindow()`:

```java
        dina.attemptsTo(
                Switch.toTheOtherWindow()
        );
```

Otra opcion es usar el nombre o handle de la ventana a la que quieres cambiar, usando `Switch.toWindow()`:

```java
        dina.attemptsTo(
                Switch.toWindow(originalWindowHandle)
        );
```

Alternativamente, si conoces el titulo de la ventana o pestana, puedes usar el metodo `Switch.toWindowTitled()`:

```java
        dina.attemptsTo(
                Switch.toWindowTitled("The other window")
        );
```

Aunque los frames HTML se consideran obsoletos para aplicaciones modernas, todavia existen en algunas aplicaciones antiguas. Puedes interactuar con frames usando los siguientes metodos:

Otras funciones de switch de Selenium se manejan con los siguientes metodos:

| Interaction                    | Proposito              | Equivalente en Selenium     |
| -----------                    | --------             | -----------             |
| Switch.toFrame(index)          | Seleccionar un frame por su indice (basado en cero). Seleccionar un frame por indice es equivalente a la expresion JS window.frames[index] donde "window" es la ventana DOM representada por el contexto actual. Una vez que el frame ha sido seleccionado, todas las llamadas subsiguientes a la interfaz WebDriver se hacen a ese frame. | `driver.switch().toFrame(index)` |
| Switch.toFrame(nameOrId)       | Seleccionar un frame por su nombre o ID. Los frames localizados por atributos de nombre coincidentes siempre tienen prioridad sobre los que coinciden por ID. | `driver.switch().toFrame(nameOrId)` |
| Switch.toParentFrame()         | Cambiar el foco al contexto padre. Si el contexto actual es el contexto de navegacion de nivel superior, el contexto permanece sin cambios. | `driver.switchTo().parentFrame()` |
| Switch.toDefaultContext()      |  Selecciona el primer frame en la pagina, o el documento principal cuando una pagina contiene iframes. | `driver.switch().toDefaultContext()` |

Otras funciones de switch de Selenium se manejan con los siguientes metodos:

| Interaction                    | Proposito              | Equivalente en Selenium     |
| -----------                    | --------             | -----------             |
| Switch.toActiveElement()       | Cambia al elemento que actualmente tiene el foco dentro del documento actualmente "switched to", o al elemento body si esto no puede detectarse. Esto coincide con la semantica de llamar "document.activeElement" en Javascript. | `driver.switchTo().activeElement()`           |


### Tratando con dialogos de Alerta

Podemos trabajar con dialogos de Alerta HTML usando el metodo `Switch.toAlert()`. Por ejemplo, el siguiente codigo cambiara la ventana actual al dialogo de alerta actual:
```java
        dina.attemptsTo(
                Switch.toAlert()
        );
```

Podemos consultar el texto de la alerta usando la clase Question `HtmlAlert.text()`:

```java
        dina.attemptsTo(
                Switch.toAlert()
        );
        assertThat(dina.asksFor(HtmlAlert.text())).isEqualTo("Are you sure?");
```

Tambien podemos aceptar o descartar el mensaje de alerta usando los metodos `Switch.toAlert().andAccept()` y `Switch.toAlert().andDismiss()` respectivamente:

```java
        dina.attemptsTo(
                Switch.toAlert().andAccept()
        );
```

### Upload

La forma mas simple de subir un archivo a un campo de carga HTML (uno que tiene un tipo de 'file') es usar el Task `Upload`. Supongamos que tenemos el siguiente campo de formulario HTML:

```html
        <input type="file" id="upload-file" name="filename">
```

Podemos subir un archivo a este campo como se muestra aqui:

```java
    Path fileToUpload = ...
    dina.attemptsTo(Upload.theFile(fileToUpload).to("#upload-file"));
```

Si estas ejecutando los tests en una maquina remota, puedes usar el Selenium Local File Detector. El Local File Detector permite la transferencia de archivos desde la maquina cliente al servidor remoto. Por ejemplo, si un test necesita subir un archivo a una aplicacion web, un WebDriver remoto puede transferir automaticamente el archivo desde la maquina local al servidor web remoto durante la ejecucion. Esto permite que el archivo sea subido desde la maquina remota que ejecuta el test.

```java
    Path fileToUpload = ...
    dina.attemptsTo(Upload.theFile(fileToUpload).to("#upload-file").usingLocalFileDetector());
```

Tambien puedes subir un archivo en los recursos del classpath usando el metodo `Upload.theClasspathResource()`, como se muestra aqui:

```java
    Path fileToUpload = ...
    dina.attemptsTo(Upload.theClasspathResource("some/resource/path.txt").to("#upload-file"));
```

## Trabajando con Chrome DevTools

Muchos navegadores proporcionan "DevTools" - un conjunto de herramientas que estan integradas con el navegador que los desarrolladores pueden usar para depurar aplicaciones web y explorar el rendimiento de sus paginas. Los DevTools de Google Chrome hacen uso de un protocolo llamado Chrome DevTools Protocol (o "CDP" para abreviar). Como sugiere el nombre, esto no esta disenado para pruebas, ni para tener una API estable, por lo que la funcionalidad depende en gran medida de la version del navegador.

En Serenity Screenplay, podemos acceder a la biblioteca DevTools de Selenium 4 usando el metodo `WithDevTools.perform()`. Por ejemplo:

```java
        final List<Metric> metricList = new ArrayList<>();

        dina.attemptsTo(
                WithDevTools.perform(
                        devTools -> {
                            devTools.createSession();
                            devTools.send(Performance.enable(Optional.empty()));
                            metricList.addAll(devTools.send(Performance.getMetrics()));
                        }
                )
        );
```

Si queremos usar DevTools para recuperar un valor especifico, podemos usar la clase `DevToolsQuery`:
```java
        List<Metric> metrics = dina.asksFor(
                DevToolsQuery.ask().about(devTools -> {
                    devTools.createSession();
                    devTools.send(Performance.enable(Optional.empty()));
                    return devTools.send(Performance.getMetrics());
                })
        );
```

## Consultando la pagina web

Serenity Screenplay tambien te da un gran numero de opciones cuando se trata de consultar una interfaz web. La mayoria involucra tipos especiales de clases Question.

En los tests web de Screenplay, simplemente puedes implementar una Question que devuelva el tipo de objeto que te interesa, y luego consultar la interfaz de usuario de manera convencional con Webdriver. Por ejemplo, supongamos que queremos leer el nombre de usuario en una pagina, que puede localizarse con el selector CSS ".user-name".

Una asercion de Screenplay para verificar el nombre de usuario podria verse asi:

```java
    sam.should(seeThat(TheUserName.value(), equalTo("sam")));
```

Podriamos crear una clase Question TheUserName para consultar este campo de la siguiente manera:

```java
@Subject("the displayed username")
public class TheUserName implements Question<String> {
    @Override
    public String answeredBy(Actor actor) {
        return BrowseTheWeb.as(actor).findBy(".user-name").getText();
    }

    public static Question<String> value() { return new TheUserName(); }
}
```
Aqui usamos BrowseTheWeb.as(actor) para obtener la API de Serenity WebDriver para la instancia de webdriver del Actor, lo que da acceso a toda la gama de metodos de Page Object de Serenity.

Tambien podriamos usar un Target para localizar el nombre de usuario, que podriamos almacenar en una clase Page Component separada:

```java
public static Target USER_NAME = Target.the("User name").locatedBy(".user-name");
```

Luego podemos usar el metodo resolveFor() para encontrar el elemento que coincide con ese Target en el navegador del Actor:

```java
@Subject("the displayed username")
public class TheUserName implements Question<String> {

    @Override
    public String answeredBy(Actor actor) {
        return USER_NAME.resolveFor(actor).getText();
    }

    public static Question<String> value() { return new TheUserName(); }
}
```

Alternativamente, podriamos escribir esta clase como una factoria, y usar una expresion lambda en lugar de una clase Question completa:

```java
public class TheUserName {

    public static Question<String> value() {
        return actor -> USER_NAME.resolveFor(actor).getText();
    }
}
```

En este caso, la anotacion `@Subject` no tendra efecto, por lo que necesitamos pasar el nombre del objeto que estamos verificando en la asercion de Screenplay:

```java
sam.should(seeThat("the displayed username", TheUserName.value(), equalTo("sam")));
```

Hasta ahora has visto como funcionan las Question de Screenplay en detalle. Esto te ayudara a implementar las tuyas propias si lo necesitas. Sin embargo, Serenity tambien proporciona una serie de atajos relacionados con la consulta de paginas web, que encontraras en el paquete net.serenitybdd.screenplay.questions, que te permiten escribir codigo de automatizacion mucho mas conciso.

## Question de WebDriver incluidas

Serenity proporciona muchas clases Question incluidas en el paquete `net.serenitybdd.screenplay.questions` que son una forma abreviada de consultar una pagina web. Por ejemplo, la clase `Text` te permite recuperar el contenido de texto de un elemento, asi:

```java
String name = sam.asksFor(Text.of("#name"));
```

Si hay muchas entradas coincidentes, podemos recuperarlas todas usando el metodo `ofEach()`:

```java
Collection<String> names = sam.asksFor(Text.ofEach(".name"));
```

La lista completa de clases Web Question se proporciona aqui.

### Absence

Determinar si un elemento _no_ esta presente o visible en la pagina. Un campo que esta presente en el DOM pero no se renderiza se considerara ausente.

```java
boolean isNotPresent = sam.asksFor(Absence.of("#no-such-field"));
```

### Attribute

Verificar el valor de un atributo HTML de un elemento especificado.

```java
String placeholderText = sam.asksFor(Attribute.of(".new-todo").named("placeholder"));
```

### CheckboxValue

Determinar si un checkbox ha sido marcado o no.

```java
boolean termsAndConditionsApproved = sam.asksFor(CheckboxValue.of("#tnc"));
```

### CSSValue

Recuperar el valor de un atributo CSS especifico de un elemento.

```java
String font = sam.asksFor(CSSValue.of(target).named("font"));
```

### CurrentlyEnabled

Verificar si un elemento esta actualmente habilitado, sin esperar.

```java
boolean isCurrentlyEnabled = sam.asksFor(CurrentlyEnabled.of("#some-button"));
```

### CurrentVisibility

Verificar si un elemento es actualmente visible, sin esperar.

```java
boolean isCurrentlyVisible = sam.asksFor(CurrentVisibility.of("#some-button"));
```

### Disabled

Verificar si un elemento esta deshabilitado.

```java
boolean isDisabled = sam.asksFor(Disabled.of("#a-disabled-button"));
```

### Displayed

Verificar si un elemento se muestra. Si el elemento no se muestra actualmente, el test esperara un breve retraso para darle tiempo a mostrarse.

```java
boolean isDisplayed = sam.asksFor(Displayed.of("#some-button"));
```

### Enabled

Verificar si un elemento esta habilitado. Si el elemento no esta actualmente habilitado, el test esperara un breve retraso para darle tiempo a habilitarse.

```java
boolean isEnabled = sam.asksFor(Enabled.of("#some-button"));
```

### Presence

Verificar si un elemento esta presente en el DOM. Un elemento invisible u oculto todavia puede estar presente en el DOM.

### SelectedStatus

Alternativa a `CheckboxValue`

```java
boolean termsAndConditionsApproved = sam.asksFor(SelectedStatus.of("#tnc"));
```

# Text

Para obtener el valor de texto de un elemento, podemos usar la clase `Text`:

```java
String introductionText = sam.asksFor(Text.of("#introduction"));
```

### TextContent

En algunos casos, podemos necesitar leer la propiedad HTML `textContent` para obtener el texto que necesitamos. Para hacer esto, podemos usar la clase `TextContent` en lugar de `Text`. Esto devuelve el contenido de texto del elemento especificado, y todos sus descendientes.

### TheCoordinates

Devolver las coordenadas de un elemento especificado.

### TheLocation

Devolver donde en la pagina esta la esquina superior izquierda del elemento renderizado.

### TheSize

Cual es el ancho y alto del elemento renderizado?

### Value

Devolver el atributo HTML `value` de un elemento especificado.

### Visibility

Determinar si este elemento web esta presente y visible en la pantalla

### Trabajando con Dropdown

Podemos consultar el valor o valores seleccionados actualmente de un elemento HTML `<SELECT>` usando las clases Question `SelectedValue`, `SelectedValues`, `SelectedVisibleTextValue` y `SelectedVisibleTextValue`.

Por ejemplo, para encontrar el valor seleccionado actual de una lista desplegable HTML, podriamos usar el siguiente codigo:

```java
String selectedColorValue = dina.asksFor(SelectedValue.of("#color-dropdown"));
```

Para obtener el texto visible del elemento seleccionado, usariamos `SelectedVisibleTextValue`:

```java
String selectedColor = dina.asksFor(SelectedVisibleTextValue.of("#color-dropdown"));
```

Para multi-selects, podemos usar `SelectedValues` y `SelectedVisibleTextValues`:

```java
List<String> selectedColors = dina.asksFor(SelectedValues.of("#color-dropdown"));
```

Podemos recuperar la lista actual de opciones usando `SelectOptions`, que devuelve la lista de textos visibles para cada opcion:

```java
List<String> selectedColors = dina.asksFor(SelectOptions.of("#color-dropdown"));
```

Si necesitamos el atributo `value` de cada opcion del dropdown, podemos usar `SelectOptionValues`, por ejemplo:

```java
List<String> selectedColors = dina.asksFor(SelectOptionValues.of("#color-dropdown"));
```



## Manejando Esperas

### Usando la clase WaitUntil
Si necesitas esperar a que un elemento aparezca con Serenity Screenplay, hay algunas opciones disponibles. Por defecto, Serenity esperara un breve retraso si intentas interactuar con un elemento que no esta en la pagina. Sin embargo, puedes asegurarte de que esta espera sea suficiente usando la clase `WaitUntil`, como se muestra aqui:

```java
private final static Target DELAYED_BUTTON = PageElement.locatedBy("#delayed-button");

dina.attemptsTo(
    WaitUntil.the(DELAYED_BUTTON, WebElementStateMatchers.isVisible()),
    Click.on(DELAYED_BUTTON)
);
```

Este codigo esperara hasta que el elemento sea visible antes de proceder a la accion Click. El tiempo de espera puede configurarse (en milisegundos) usando la propiedad `webdriver.timeouts.implicitlywait`, que es 5 segundos por defecto.

Si necesitas tener un control mas fino sobre la duracion del tiempo de espera para situaciones especificas, puedes especificarlo agregando el metodo `forNoMoreThan()`, que te permite especificar un tiempo de espera explicito:

```java
dina.attemptsTo(
    WaitUntil.the(DELAYED_BUTTON, isVisible()).forNoMoreThan(10).seconds()
);
 ```

Tambien puedes esperar otras condiciones. Por ejemplo, para esperar hasta que un elemento desaparezca, puedes usar el matcher `isNotVisible()`:

```java
dina.attemptsTo(
    WaitUntil.the(DISAPPEARING_BUTTON, isNotVisible())
);
```

Los siguientes matcher estan disponibles en la clase `WebElementStateMatchers`. Ten en cuenta que todos los siguientes metodos tambien tienen un equivalente negativo (`isNotVisible()`, `isNotEmpty()` etc.).

| Matcher                    | Proposito                              |
| -----------                | --------                             |
| containsText(...)          | Verificar que un elemento contiene un valor de texto especifico |
| containsOnlyText(...)      | Verificar que un elemento contiene exactamente un valor de texto especifico |
| containsSelectOption(...)  | Verificar que un elemento dropdown contiene un valor de texto especifico como opcion|
| isClickable                | Verificar que un elemento es visible y esta habilitado |
| isEmpty                    | Verificar que un elemento no es visible o contiene una cadena vacia |
| isEnabled                  | Verificar que un elemento esta habilitado |
| isPresent                  | Verificar que un elemento esta presente en la pagina |
| isSelected                 | Verificar que un elemento esta seleccionado     |
| isVisible                  | Verificar que un elemento es visible     |

### Esperando una condicion de WebDriver

Otra opcion es esperar una condicion de WebDriver (que puede encontrarse en la clase `org.openqa.selenium.support.ui.ExpectedConditions`), por ejemplo:

```java
dina.attemptsTo(
        WaitUntil.the(
                invisibilityOfElementLocated(By.id("disappearing-button")))
);
```

### Esperando con Target

Tambien puedes colocar una condicion de espera especifica en un objeto `Target`. Puedes hacer esto ya sea cuando defines la variable `Target` (si debe aplicarse cada vez que interactuas con este elemento), o solo cuando interactuas con el elemento, como se muestra a continuacion:

```java
private final static Target INVISIBLE_BUTTON
    = PageElement.locatedBy("#invisible-button");

dina.attemptsTo(
    Click.on(INVISIBLE_BUTTON.waitingForNoMoreThan(Duration.ofSeconds(3)))
);
```
