---
id: screenplay_playwright
sidebar_position: 3
---
# Pruebas Web con Serenity Screenplay y Playwright

## Introduccion

Playwright es una biblioteca moderna de automatizacion de navegadores que proporciona capacidades de pruebas cross-browser con excelente soporte para aplicaciones web modernas. El modulo `serenity-screenplay-playwright` trae el poder de Playwright al Screenplay Pattern de Serenity BDD, ofreciendo una alternativa a la integracion tradicional con WebDriver.

Playwright ofrece varias ventajas sobre WebDriver:
- **Auto-waiting**: Espera automaticamente a que los elementos sean accionables antes de realizar acciones
- **Cross-browser**: Soporte nativo para Chromium, Firefox y WebKit
- **Interceptacion de red**: Soporte integrado para mockear e interceptar peticiones de red
- **Tracing**: Registra trazas detalladas para depurar fallos de pruebas
- **Emulacion de dispositivos**: Facil emulacion de dispositivos moviles y tablets
- **Arquitectura moderna**: Diseno basado en eventos con mejor confiabilidad

## Primeros Pasos

### Dependencia Maven

Agrega la siguiente dependencia a tu proyecto:

```xml
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-screenplay-playwright</artifactId>
    <version>${serenity.version}</version>
</dependency>
```

### La Ability BrowseTheWebWithPlaywright

Para usar Playwright con Screenplay, los Actor necesitan la Ability `BrowseTheWebWithPlaywright`:

```java
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import com.microsoft.playwright.*;

Playwright playwright = Playwright.create();
Browser browser = playwright.chromium().launch();

Actor alice = Actor.named("Alice");
alice.can(BrowseTheWebWithPlaywright.using(browser));
```

### Configuracion

Puedes configurar el comportamiento de Playwright usando variables de entorno o programaticamente:

```java
// Iniciar con opciones
BrowserType.LaunchOptions options = new BrowserType.LaunchOptions()
    .setHeadless(false)
    .setSlowMo(100);

Browser browser = playwright.chromium().launch(options);
```

## Abriendo una URL

### Abriendo una URL directamente

En Screenplay, abres una nueva pagina usando la clase de Interaction `Navigate`:

```java
alice.attemptsTo(Navigate.to("https://todomvc.com/examples/react/"));
```

### Abriendo la URL base

Si has configurado una URL base, puedes navegar a ella:

```java
alice.attemptsTo(Navigate.toTheBaseUrl());
```

## Localizando Elementos en una Pagina

### La Clase Target

La clase `Target` en la integracion con Playwright usa el potente motor de selectores de Playwright. A diferencia de WebDriver, Playwright proporciona multiples estrategias de selectores integradas.

```java
Target SUBMIT_BUTTON = Target.the("Submit button").locatedBy("#submit-btn");

alice.attemptsTo(Click.on(SUBMIT_BUTTON));
```

### Selectores de Playwright

Playwright soporta un rico conjunto de selectores:

```java
// Selector CSS
Target.the("Login button").locatedBy("#login-btn")

// Selector de texto
Target.the("Submit button").locatedBy("text=Submit")

// Selector de rol (ARIA)
Target.the("Submit button").locatedBy("role=button[name='Submit']")

// Selector XPath
Target.the("Email field").locatedBy("xpath=//input[@type='email']")

// Combinando selectores
Target.the("Form submit").locatedBy("form >> button[type='submit']")
```

### Target Dinamicos

Puedes usar Target parametrizados para localizacion dinamica de elementos:

```java
Target MENU_ITEM = Target.the("{0} menu item").locatedBy("text={0}");

alice.attemptsTo(Click.on(MENU_ITEM.of("Settings")));
```

## Factorias de Elementos UI

Serenity Playwright proporciona clases de factoria convenientes para localizar elementos UI comunes usando la poderosa sintaxis de selectores de Playwright.

### Button

Localiza botones usando varias estrategias:

```java
import net.serenitybdd.screenplay.playwright.ui.Button;

// Por texto visible (no distingue mayusculas/minusculas, usa selector de rol)
alice.attemptsTo(Click.on(Button.withText("Submit")));

// Por atributo name o ID
alice.attemptsTo(Click.on(Button.withNameOrId("submit-btn")));

// Por aria-label
alice.attemptsTo(Click.on(Button.withAriaLabel("Close dialog")));

// Conteniendo texto especifico
alice.attemptsTo(Click.on(Button.containingText("Add to")));

// Localizador personalizado
alice.attemptsTo(Click.on(Button.locatedBy("[data-testid='primary-action']")));
```

### InputField

Localiza campos de entrada:

```java
import net.serenitybdd.screenplay.playwright.ui.InputField;

// Por name o ID
alice.attemptsTo(Enter.theValue("john@example.com").into(InputField.withNameOrId("email")));

// Por texto de placeholder
alice.attemptsTo(Enter.theValue("Search...").into(InputField.withPlaceholder("Search products")));

// Por texto de etiqueta asociada
alice.attemptsTo(Enter.theValue("password123").into(InputField.withLabel("Password")));

// Por aria-label
alice.attemptsTo(Enter.theValue("John").into(InputField.withAriaLabel("First name")));
```

### Link

Localiza elementos anchor:

```java
import net.serenitybdd.screenplay.playwright.ui.Link;

// Por texto exacto
alice.attemptsTo(Click.on(Link.withText("Learn more")));

// Conteniendo texto
alice.attemptsTo(Click.on(Link.containingText("documentation")));

// Por atributo title
alice.attemptsTo(Click.on(Link.withTitle("View user profile")));
```

### Checkbox

Localiza inputs de tipo checkbox:

```java
import net.serenitybdd.screenplay.playwright.ui.Checkbox;

// Por texto de etiqueta
alice.attemptsTo(Click.on(Checkbox.withLabel("Accept terms")));

// Por name o ID
alice.attemptsTo(Click.on(Checkbox.withNameOrId("newsletter")));

// Por atributo value
alice.attemptsTo(Click.on(Checkbox.withValue("premium")));
```

### RadioButton

Localiza inputs de tipo radio button:

```java
import net.serenitybdd.screenplay.playwright.ui.RadioButton;

// Por texto de etiqueta
alice.attemptsTo(Click.on(RadioButton.withLabel("Express shipping")));

// Por atributo value
alice.attemptsTo(Click.on(RadioButton.withValue("express")));
```

### Dropdown

Localiza elementos select:

```java
import net.serenitybdd.screenplay.playwright.ui.Dropdown;

// Por texto de etiqueta
alice.attemptsTo(
    SelectFromOptions.byVisibleText("Canada").from(Dropdown.withLabel("Country"))
);

// Por name o ID
alice.attemptsTo(
    SelectFromOptions.byValue("us").from(Dropdown.withNameOrId("country"))
);
```

### Label

Localiza elementos label:

```java
import net.serenitybdd.screenplay.playwright.ui.Label;

// Por contenido de texto
String labelText = alice.asksFor(Text.of(Label.withText("Email")));

// Para un ID de campo especifico
Target emailLabel = Label.forFieldId("email-input");
```

### Image

Localiza elementos imagen:

```java
import net.serenitybdd.screenplay.playwright.ui.Image;

// Por texto alt
alice.attemptsTo(Click.on(Image.withAltText("Product thumbnail")));

// Por URL de origen
alice.attemptsTo(Click.on(Image.withSrc("/images/logo.png")));

// Por URL de origen parcial
alice.attemptsTo(Click.on(Image.withSrcContaining("product-123")));
```

## Interactuando con Elementos

### Interaction Principales

Las siguientes clases de Interaction estan disponibles en el paquete `net.serenitybdd.screenplay.playwright.interactions`:

| Interaction | Proposito | Ejemplo |
|-------------|---------|---------|
| Click | Hacer clic en un elemento | `actor.attemptsTo(Click.on("#button"))` |
| DoubleClick | Doble clic en un elemento | `actor.attemptsTo(DoubleClick.on("#item"))` |
| RightClick | Clic derecho (menu contextual) | `actor.attemptsTo(RightClick.on("#menu"))` |
| Enter | Escribir en un campo de entrada | `actor.attemptsTo(Enter.theValue("text").into("#field"))` |
| Clear | Limpiar un campo de entrada | `actor.attemptsTo(Clear.field("#field"))` |
| Hover | Pasar el mouse sobre un elemento | `actor.attemptsTo(Hover.over("#menu"))` |
| Press | Presionar teclas del teclado | `actor.attemptsTo(Press.key("Enter"))` |
| Check | Marcar un checkbox | `actor.attemptsTo(Check.checkbox("#agree"))` |
| Uncheck | Desmarcar un checkbox | `actor.attemptsTo(Uncheck.checkbox("#agree"))` |
| Focus | Enfocar un elemento | `actor.attemptsTo(Focus.on("#input"))` |
| Navigate | Navegar a una URL | `actor.attemptsTo(Navigate.to("https://..."))` |
| Upload | Subir un archivo | `actor.attemptsTo(Upload.file(path).to("#upload"))` |

### Click

Hacer clic en un elemento. Playwright automaticamente espera a que el elemento sea accionable:

```java
alice.attemptsTo(Click.on("#submit-button"));
alice.attemptsTo(Click.on(SUBMIT_BUTTON));
```

### Double-Click

Doble clic en un elemento:

```java
alice.attemptsTo(DoubleClick.on("#item"));
```

### Right-Click

Clic derecho para abrir menus contextuales:

```java
alice.attemptsTo(RightClick.on("#file-item"));
```

### Enter Text

Escribir valores en campos de entrada:

```java
alice.attemptsTo(Enter.theValue("john@example.com").into("#email"));
```

Tambien puedes limpiar el campo primero:

```java
alice.attemptsTo(
    Clear.field("#email"),
    Enter.theValue("new-email@example.com").into("#email")
);
```

### Interaction de Teclado

Presionar teclas del teclado:

```java
// Tecla individual
alice.attemptsTo(Press.key("Enter"));

// Combinaciones de teclas
alice.attemptsTo(Press.key("Control+a"));

// Multiples teclas
alice.attemptsTo(Press.keys("Tab", "Tab", "Enter"));
```

### Hover

Pasar el mouse sobre elementos para activar estados hover:

```java
alice.attemptsTo(Hover.over("#dropdown-menu"));
```

### Check y Uncheck

Trabajar con checkbox:

```java
alice.attemptsTo(Check.checkbox("#newsletter"));
alice.attemptsTo(Uncheck.checkbox("#marketing-emails"));
```

### Focus

Enfocar un elemento:

```java
alice.attemptsTo(Focus.on("#search-input"));
```

### Seleccionando de Dropdown

Seleccionar opciones de menus desplegables:

```java
// Por texto visible
alice.attemptsTo(SelectFromOptions.byVisibleText("Red").from("#color"));

// Por atributo value
alice.attemptsTo(SelectFromOptions.byValue("red").from("#color"));

// Por indice
alice.attemptsTo(SelectFromOptions.byIndex(2).from("#color"));

// Multiples valores (para multi-select)
alice.attemptsTo(SelectFromOptions.byValue("red", "blue", "green").from("#colors"));
```

### Deseleccionando de Dropdown

Para dropdown multi-select, puedes deseleccionar opciones:

```java
import net.serenitybdd.screenplay.playwright.interactions.DeselectFromOptions;

// Deseleccionar por valor
alice.attemptsTo(DeselectFromOptions.byValue("red").from("#colors"));

// Deseleccionar por texto visible
alice.attemptsTo(DeselectFromOptions.byVisibleText("Red").from("#colors"));

// Deseleccionar por indice
alice.attemptsTo(DeselectFromOptions.byIndex(0).from("#colors"));

// Deseleccionar todo
alice.attemptsTo(DeselectFromOptions.all().from("#colors"));
```

### Desplazamiento (Scrolling)

Capacidades completas de desplazamiento:

```java
import net.serenitybdd.screenplay.playwright.interactions.Scroll;

// Desplazar hasta un elemento
alice.attemptsTo(Scroll.to("#terms-and-conditions"));

// Desplazar con alineacion
alice.attemptsTo(Scroll.to("#section").andAlignToTop());
alice.attemptsTo(Scroll.to("#section").andAlignToCenter());
alice.attemptsTo(Scroll.to("#section").andAlignToBottom());

// Desplazamiento a nivel de pagina
alice.attemptsTo(Scroll.toTop());
alice.attemptsTo(Scroll.toBottom());

// Desplazar una cantidad especifica (deltaX, deltaY)
alice.attemptsTo(Scroll.by(0, 500));

// Desplazar a posicion especifica
alice.attemptsTo(Scroll.toPosition(0, 1000));
```

### Arrastrar y Soltar (Drag and Drop)

Arrastrar elementos de una ubicacion a otra:

```java
import net.serenitybdd.screenplay.playwright.interactions.Drag;

// Arrastrar y soltar basico
alice.attemptsTo(Drag.from("#source").to("#target"));

// Sintaxis fluida alternativa
alice.attemptsTo(Drag.the("#draggable").onto("#droppable"));

// Con Target
alice.attemptsTo(Drag.from(SOURCE_ELEMENT).to(TARGET_LOCATION));
```

### Subida de Archivos

Subir archivos:

```java
Path fileToUpload = Paths.get("path/to/file.pdf");
alice.attemptsTo(Upload.file(fileToUpload).to("#file-input"));
```

### Ejecucion de JavaScript

Ejecutar JavaScript en el contexto de la pagina:

```java
alice.attemptsTo(
    Evaluate.javascript("window.scrollTo(0, document.body.scrollHeight)")
);

// Con valor de retorno
Object result = alice.asksFor(
    Evaluate.javascript("return document.title")
);
```

### Esperando

Esperar por elementos o condiciones:

```java
// Esperar a que el elemento sea visible
alice.attemptsTo(WaitUntil.the("#loading").isNotVisible());

// Esperar a que el elemento este oculto
alice.attemptsTo(WaitUntil.the("#spinner").isHidden());

// Esperar con timeout
alice.attemptsTo(
    WaitUntil.the("#content").isVisible()
        .forNoMoreThan(Duration.ofSeconds(10))
);
```

## Consultando la Pagina Web

### Question Incluidas

Serenity Playwright proporciona clases Question para consultar el estado de la pagina:

| Question | Proposito | Ejemplo |
|----------|---------|---------|
| Text | Obtener texto del elemento | `actor.asksFor(Text.of("#title"))` |
| Value | Obtener valor de input | `actor.asksFor(Value.of("#email"))` |
| Attribute | Obtener valor de atributo | `actor.asksFor(Attribute.of("#link").named("href"))` |
| Presence | Verificar si el elemento existe | `actor.asksFor(Presence.of("#modal"))` |
| Absence | Verificar si el elemento esta ausente | `actor.asksFor(Absence.of("#error"))` |
| Visibility | Verificar si el elemento es visible | `actor.asksFor(Visibility.of("#popup"))` |
| Enabled | Verificar si el elemento esta habilitado | `actor.asksFor(Enabled.of("#submit"))` |
| SelectedStatus | Verificar si el checkbox esta seleccionado | `actor.asksFor(SelectedStatus.of("#agree"))` |
| CSSValue | Obtener propiedad CSS | `actor.asksFor(CSSValue.of("#box").named("color"))` |
| CurrentUrl | Obtener URL de la pagina actual | `actor.asksFor(CurrentUrl.ofThePage())` |
| PageTitle | Obtener titulo de la pagina | `actor.asksFor(PageTitle.ofThePage())` |

### Text

Obtener el contenido de texto de un elemento:

```java
String heading = alice.asksFor(Text.of("#main-heading"));

// Multiples elementos
List<String> items = alice.asksFor(Text.ofEach(".list-item"));
```

### Presence y Absence

Verificar si los elementos existen en la pagina:

```java
// Verificar si esta presente
boolean isPresent = alice.asksFor(Presence.of("#modal"));

// Verificar si esta ausente
boolean isAbsent = alice.asksFor(Absence.of("#error-message"));
```

### Attributes

Obtener valores de atributos:

```java
String href = alice.asksFor(Attribute.of("#link").named("href"));
String placeholder = alice.asksFor(Attribute.of("#input").named("placeholder"));
```

### Informacion de la Pagina Actual

Consultar informacion a nivel de pagina:

```java
String url = alice.asksFor(CurrentUrl.ofThePage());
String title = alice.asksFor(PageTitle.ofThePage());
```

## Interceptacion y Mockeo de Red

Playwright proporciona capacidades poderosas de interceptacion de red para pruebas.

### Interceptando Peticiones

```java
import net.serenitybdd.screenplay.playwright.network.InterceptNetwork;

// Interceptar y responder con respuesta mock
alice.attemptsTo(
    InterceptNetwork.requestsTo("**/api/users")
        .andRespondWith(
            new Route.FulfillOptions()
                .setStatus(200)
                .setBody("{\"users\": []}")
                .setContentType("application/json")
        )
);

// Interceptar y responder con JSON
alice.attemptsTo(
    InterceptNetwork.requestsTo("**/api/user/123")
        .andRespondWithJson(200, Map.of(
            "id", 123,
            "name", "John Doe",
            "email", "john@example.com"
        ))
);
```

### Manejadores de Peticiones Personalizados

Para mayor control, usa manejadores personalizados:

```java
alice.attemptsTo(
    InterceptNetwork.requestsTo("**/api/**")
        .andHandle(route -> {
            if (route.request().method().equals("DELETE")) {
                route.fulfill(new Route.FulfillOptions()
                    .setStatus(403)
                    .setBody("{\"error\": \"Forbidden\"}"));
            } else {
                route.resume();
            }
        })
);
```

### Abortando Peticiones

Bloquear peticiones especificas (util para probar manejo de errores):

```java
alice.attemptsTo(
    InterceptNetwork.requestsTo("**/analytics/**").andAbort()
);
```

### Eliminando Rutas

Eliminar manejadores de rutas previamente registrados:

```java
import net.serenitybdd.screenplay.playwright.network.RemoveRoutes;

// Eliminar todos los manejadores de rutas
alice.attemptsTo(RemoveRoutes.all());

// Eliminar rutas para un patron especifico
alice.attemptsTo(RemoveRoutes.forUrl("**/api/**"));
```

## Integracion de Pruebas de API

:::info Nuevo en 5.2.2
La integracion de pruebas de API fue agregada en Serenity BDD 5.2.2.
:::

Realiza peticiones de API que comparten el contexto de sesion del navegador (cookies, autenticacion). Esto habilita escenarios de pruebas hibridas UI + API donde puedes configurar datos via API, realizar acciones de UI, y verificar estado a traves de llamadas API.

### Peticiones de API Basicas

```java
import net.serenitybdd.screenplay.playwright.interactions.api.APIRequest;
import net.serenitybdd.screenplay.playwright.questions.api.LastAPIResponse;

// Inicializar contexto del navegador primero (requerido para peticiones de API)
alice.attemptsTo(Open.url("about:blank"));

// Peticion GET
alice.attemptsTo(
    APIRequest.get("https://api.example.com/users/1")
);

// Peticion POST con cuerpo JSON
alice.attemptsTo(
    APIRequest.post("https://api.example.com/users")
        .withJsonBody(Map.of(
            "name", "John Doe",
            "email", "john@example.com"
        ))
);

// Peticion PUT
alice.attemptsTo(
    APIRequest.put("https://api.example.com/users/1")
        .withJsonBody(Map.of("name", "Jane Doe"))
);

// Peticion PATCH
alice.attemptsTo(
    APIRequest.patch("https://api.example.com/users/1")
        .withJsonBody(Map.of("status", "active"))
);

// Peticion DELETE
alice.attemptsTo(
    APIRequest.delete("https://api.example.com/users/1")
);

// Peticion HEAD
alice.attemptsTo(
    APIRequest.head("https://api.example.com/users/1")
);
```

### Configuracion de Peticiones

```java
// Agregar headers personalizados
alice.attemptsTo(
    APIRequest.get("https://api.example.com/data")
        .withHeader("Authorization", "Bearer token123")
        .withHeader("X-Custom-Header", "value")
);

// Agregar parametros de consulta
alice.attemptsTo(
    APIRequest.get("https://api.example.com/search")
        .withQueryParam("q", "test")
        .withQueryParam("limit", "10")
);

// Establecer tipo de contenido
alice.attemptsTo(
    APIRequest.post("https://api.example.com/data")
        .withBody("<xml>data</xml>")
        .withContentType("application/xml")
);

// Establecer timeout
alice.attemptsTo(
    APIRequest.get("https://api.example.com/slow")
        .withTimeout(30000)  // 30 segundos
);

// Fallar en codigos de estado no-2xx
alice.attemptsTo(
    APIRequest.get("https://api.example.com/data")
        .failOnStatusCode(true)
);
```

### Consultando Respuestas

```java
// Obtener codigo de estado
int status = alice.asksFor(LastAPIResponse.statusCode());

// Verificar si la respuesta es OK (2xx)
boolean isOk = alice.asksFor(LastAPIResponse.ok());

// Obtener cuerpo de respuesta como string
String body = alice.asksFor(LastAPIResponse.body());

// Parsear respuesta JSON como Map
Map<String, Object> json = alice.asksFor(LastAPIResponse.jsonBody());

// Parsear respuesta de array JSON como List
List<Map<String, Object>> items = alice.asksFor(LastAPIResponse.jsonBodyAsList());

// Obtener headers de respuesta
Map<String, String> headers = alice.asksFor(LastAPIResponse.headers());
String contentType = alice.asksFor(LastAPIResponse.header("Content-Type"));

// Obtener URL final (despues de redirecciones)
String url = alice.asksFor(LastAPIResponse.url());
```

### Pruebas Hibridas UI + API

Las peticiones de API automaticamente comparten cookies con el contexto del navegador:

```java
@Test
void shouldUseAuthenticatedSession() {
    // Login via UI
    alice.attemptsTo(
        Navigate.to("https://myapp.com/login"),
        Enter.theValue("user@example.com").into("#email"),
        Enter.theValue("password").into("#password"),
        Click.on(Button.withText("Login"))
    );

    // Las llamadas API ahora incluyen cookies de autenticacion
    alice.attemptsTo(
        APIRequest.get("https://myapp.com/api/profile")
    );

    // Verificar respuesta de API autenticada
    Map<String, Object> profile = alice.asksFor(LastAPIResponse.jsonBody());
    assertThat(profile.get("email")).isEqualTo("user@example.com");
}
```

### Llamadas API en Reportes de Serenity

Las peticiones de API realizadas via `APIRequest` se registran automaticamente en los reportes de Serenity, similar a RestAssured. Los reportes muestran:
- Metodo HTTP y URL
- Headers y cuerpo de la peticion
- Codigo de estado de la respuesta
- Headers y cuerpo de la respuesta

Esto proporciona visibilidad completa de las interacciones de API durante la ejecucion de pruebas.

### Ejemplo Completo

```java
@Test
void shouldCreateAndVerifyUser() {
    alice.attemptsTo(Open.url("about:blank"));

    // Crear usuario via API
    alice.attemptsTo(
        APIRequest.post("https://jsonplaceholder.typicode.com/users")
            .withJsonBody(Map.of(
                "name", "Test User",
                "email", "test@example.com",
                "username", "testuser"
            ))
    );

    // Verificar creacion
    assertThat(alice.asksFor(LastAPIResponse.statusCode())).isEqualTo(201);

    Map<String, Object> createdUser = alice.asksFor(LastAPIResponse.jsonBody());
    assertThat(createdUser.get("name")).isEqualTo("Test User");
    assertThat(createdUser.get("id")).isNotNull();

    // Obtener el usuario creado
    String userId = String.valueOf(((Double) createdUser.get("id")).intValue());
    alice.attemptsTo(
        APIRequest.get("https://jsonplaceholder.typicode.com/users/" + userId)
    );

    assertThat(alice.asksFor(LastAPIResponse.statusCode())).isEqualTo(200);
}
```

## Manejando Descargas

Esperar y manejar descargas de archivos:

```java
import net.serenitybdd.screenplay.playwright.interactions.WaitForDownload;
import net.serenitybdd.screenplay.playwright.questions.DownloadedFile;

// Esperar descarga activada al hacer clic
alice.attemptsTo(
    WaitForDownload.whilePerforming(Click.on("#download-btn"))
);

// Consultar informacion de descarga
String filename = alice.asksFor(DownloadedFile.suggestedFilename());
String url = alice.asksFor(DownloadedFile.url());
Path path = alice.asksFor(DownloadedFile.path());

// Verificar fallos
String error = alice.asksFor(DownloadedFile.failure());
if (error == null) {
    // Descarga exitosa
}

// Guardar en ubicacion especifica
alice.attemptsTo(
    WaitForDownload.whilePerforming(Click.on("#export-btn"))
        .andSaveTo(Paths.get("/downloads/report.pdf"))
);
```

## Captura de Mensajes de Consola

Capturar y consultar mensajes de la consola del navegador para depuracion:

```java
import net.serenitybdd.screenplay.playwright.interactions.CaptureConsoleMessages;
import net.serenitybdd.screenplay.playwright.questions.ConsoleMessages;

// Comenzar a capturar mensajes de consola
alice.attemptsTo(CaptureConsoleMessages.duringTest());

// ... realizar acciones que pueden escribir en consola ...

// Consultar mensajes capturados
List<String> allMessages = alice.asksFor(ConsoleMessages.all());
List<String> errors = alice.asksFor(ConsoleMessages.errors());
List<String> warnings = alice.asksFor(ConsoleMessages.warnings());
List<String> logs = alice.asksFor(ConsoleMessages.logs());

// Filtrar por contenido
List<String> apiErrors = alice.asksFor(ConsoleMessages.containing("API error"));

// Obtener conteos de mensajes
int totalCount = alice.asksFor(ConsoleMessages.count());
int errorCount = alice.asksFor(ConsoleMessages.errorCount());

// Limpiar mensajes capturados entre fases de prueba
alice.attemptsTo(CaptureConsoleMessages.clear());
```

### Verificando Errores de Consola

:::info Nuevo en 5.2.2
`CheckConsole` fue agregado en Serenity BDD 5.2.2.
:::

Usa `CheckConsole` para fallar automaticamente las pruebas cuando ocurren errores o advertencias de JavaScript. Esta es la forma recomendada de asegurar que tu aplicacion no tiene errores de consola durante los flujos de usuario:

```java
import net.serenitybdd.screenplay.playwright.interactions.CheckConsole;

// Comenzar captura, luego verificar errores al final del flujo
alice.attemptsTo(
    CaptureConsoleMessages.duringTest(),

    // Realizar acciones de usuario
    Navigate.to("https://myapp.com/checkout"),
    Enter.theValue("4111111111111111").into("#card-number"),
    Click.on(Button.withText("Pay")),

    // Fallar el test si ocurrieron errores de JavaScript
    CheckConsole.forErrors()
);
```

#### Opciones de CheckConsole

| Metodo | Descripcion |
|--------|-------------|
| `CheckConsole.forErrors()` | Falla si se encuentran errores de consola |
| `CheckConsole.forWarnings()` | Falla si se encuentran advertencias de consola |
| `CheckConsole.forErrorsAndWarnings()` | Falla si se encuentran errores O advertencias |

#### Modo Solo-Reporte

A veces quieres documentar problemas de consola sin fallar el test (por ejemplo, para problemas conocidos o cuando monitoreas tendencias de errores):

```java
// Reportar errores a Serenity pero no fallar el test
alice.attemptsTo(
    CheckConsole.forErrors().andReportOnly()
);
```

Cuando se encuentran errores, se adjuntan automaticamente al reporte de Serenity como evidencia, ya sea que el test falle o no.

### Reportando Mensajes de Consola

:::info Nuevo en 5.2.2
`ReportConsoleMessages` fue agregado en Serenity BDD 5.2.2.
:::

Usa `ReportConsoleMessages` para agregar explicitamente mensajes de consola capturados al reporte de Serenity:

```java
import net.serenitybdd.screenplay.playwright.interactions.ReportConsoleMessages;

alice.attemptsTo(
    CaptureConsoleMessages.duringTest(),

    // ... realizar acciones ...

    // Reportar errores y advertencias a Serenity
    ReportConsoleMessages.errorsAndWarnings()
);
```

#### Opciones de ReportConsoleMessages

| Metodo | Descripcion |
|--------|-------------|
| `ReportConsoleMessages.all()` | Reportar todos los mensajes de consola |
| `ReportConsoleMessages.errors()` | Reportar solo errores |
| `ReportConsoleMessages.warnings()` | Reportar solo advertencias |
| `ReportConsoleMessages.errorsAndWarnings()` | Reportar errores y advertencias |

### Ejemplo: Verificacion Completa de Errores de Consola

Aqui hay un patron tipico para asegurar que no ocurran errores de JavaScript durante un flujo critico de usuario:

```java
@Test
void checkoutFlowShouldHaveNoJavaScriptErrors() {
    alice.attemptsTo(
        // Comenzar captura al inicio
        CaptureConsoleMessages.duringTest(),

        // Completar el flujo de checkout
        Navigate.to("https://myapp.com/cart"),
        Click.on(Button.withText("Checkout")),
        Enter.theValue("john@example.com").into(InputField.withLabel("Email")),
        Enter.theValue("4111111111111111").into(InputField.withLabel("Card Number")),
        Click.on(Button.withText("Place Order")),

        // Verificar confirmacion de orden
        WaitFor.theElement(".order-confirmation").toBeVisible(),

        // Fallar el test si ocurrieron errores de JavaScript durante el flujo
        CheckConsole.forErrors()
    );
}
```

## Captura de Peticiones de Red

:::info Nuevo en 5.2.2
La captura de peticiones de red fue agregada en Serenity BDD 5.2.2.
:::

Captura y analiza todas las peticiones de red realizadas durante las pruebas. Esto es util para depuracion, verificar llamadas API realizadas por el frontend, y detectar peticiones fallidas.

```java
import net.serenitybdd.screenplay.playwright.interactions.CaptureNetworkRequests;
import net.serenitybdd.screenplay.playwright.interactions.CaptureNetworkRequests.CapturedRequest;
import net.serenitybdd.screenplay.playwright.questions.NetworkRequests;

// Comenzar a capturar peticiones de red
alice.attemptsTo(CaptureNetworkRequests.duringTest());

// Realizar acciones que activan peticiones de red
alice.attemptsTo(Navigate.to("https://example.com"));

// Consultar todas las peticiones capturadas
List<CapturedRequest> allRequests = alice.asksFor(NetworkRequests.all());
int requestCount = alice.asksFor(NetworkRequests.count());

// Filtrar por metodo HTTP
List<CapturedRequest> getRequests = alice.asksFor(NetworkRequests.withMethod("GET"));
List<CapturedRequest> postRequests = alice.asksFor(NetworkRequests.withMethod("POST"));

// Filtrar por URL
List<CapturedRequest> apiRequests = alice.asksFor(
    NetworkRequests.toUrlContaining("/api/")
);

// Filtrar por patron glob
List<CapturedRequest> cssRequests = alice.asksFor(
    NetworkRequests.matching("**/*.css")
);

// Encontrar peticiones fallidas (4xx, 5xx, o errores de red)
List<CapturedRequest> failedRequests = alice.asksFor(NetworkRequests.failed());
int failedCount = alice.asksFor(NetworkRequests.failedCount());

// Encontrar errores de cliente (4xx)
List<CapturedRequest> clientErrors = alice.asksFor(NetworkRequests.clientErrors());

// Encontrar errores de servidor (5xx)
List<CapturedRequest> serverErrors = alice.asksFor(NetworkRequests.serverErrors());

// Limpiar peticiones capturadas entre fases de prueba
alice.attemptsTo(CaptureNetworkRequests.clear());
```

### Propiedades de CapturedRequest

Cada `CapturedRequest` contiene:

| Propiedad | Descripcion |
|----------|-------------|
| `getUrl()` | La URL de la peticion |
| `getMethod()` | Metodo HTTP (GET, POST, etc.) |
| `getResourceType()` | Tipo de recurso (document, xhr, fetch, stylesheet, etc.) |
| `getRequestHeaders()` | Map de headers de peticion |
| `getStatus()` | Codigo de estado de respuesta (o null si pendiente/fallido) |
| `getStatusText()` | Texto de estado de respuesta |
| `getFailureText()` | Razon del fallo para errores de red |
| `isFailed()` | True si la peticion fallo (4xx, 5xx, o error de red) |
| `isClientError()` | True si estado 4xx |
| `isServerError()` | True si estado 5xx |

### Ejemplo: Verificando Llamadas API

```java
@Test
void shouldMakeCorrectApiCalls() {
    alice.attemptsTo(
        CaptureNetworkRequests.duringTest(),
        Navigate.to("https://myapp.com"),
        Click.on(Button.withText("Load Data"))
    );

    // Verificar que la llamada API esperada fue realizada
    List<CapturedRequest> apiCalls = alice.asksFor(
        NetworkRequests.toUrlContaining("/api/data")
    );

    assertThat(apiCalls).hasSize(1);
    assertThat(apiCalls.get(0).getMethod()).isEqualTo("GET");
    assertThat(apiCalls.get(0).getStatus()).isEqualTo(200);
}
```

## Captura de Evidencia de Fallos

:::info Nuevo en 5.2.2
La captura automatica de evidencia de fallos fue agregada en Serenity BDD 5.2.2.
:::

Cuando un test falla, Serenity Playwright automaticamente captura informacion de diagnostico y la adjunta al reporte. Esto hace que depurar fallos de pruebas sea mucho mas facil.

### Recoleccion Automatica de Evidencia

Cuando la captura de mensajes de consola o peticiones de red esta habilitada, la siguiente evidencia se recolecta automaticamente en fallos de test:

- **Informacion de Pagina**: URL actual y titulo de pagina
- **Errores de Consola**: Todos los mensajes `console.error()` y `console.warn()`
- **Peticiones de Red Fallidas**: Peticiones que devolvieron estado 4xx/5xx o errores de red

Esta evidencia se adjunta al reporte de Serenity como "Playwright Failure Evidence".

### Habilitando Captura de Evidencia

Simplemente habilita la captura de consola y/o red al inicio de tus pruebas:

```java
@BeforeEach
void setup() {
    alice = Actor.named("Alice")
        .whoCan(BrowseTheWebWithPlaywright.usingTheDefaultConfiguration());

    // Habilitar captura para evidencia de fallos
    alice.attemptsTo(
        CaptureConsoleMessages.duringTest(),
        CaptureNetworkRequests.duringTest()
    );
}
```

### Acceso Programatico a Evidencia

Tambien puedes consultar evidencia programaticamente para aserciones o reportes personalizados:

```java
import net.serenitybdd.screenplay.playwright.evidence.PlaywrightFailureEvidence;

// Obtener errores de consola
List<String> consoleErrors = PlaywrightFailureEvidence.getConsoleErrors(alice);

// Obtener peticiones de red fallidas
List<String> failedRequests = PlaywrightFailureEvidence.getFailedRequests(alice);

// Usar en aserciones
assertThat(consoleErrors).isEmpty();
assertThat(failedRequests).isEmpty();
```

### Ejemplo: Detectando Errores de JavaScript

```java
@Test
void pageShouldNotHaveJavaScriptErrors() {
    alice.attemptsTo(
        CaptureConsoleMessages.duringTest(),
        Navigate.to("https://myapp.com"),
        Click.on(Button.withText("Submit"))
    );

    // Verificar que no ocurrieron errores de JavaScript
    List<String> errors = alice.asksFor(ConsoleMessages.errors());
    assertThat(errors)
        .describedAs("JavaScript errors on page")
        .isEmpty();
}
```

### Ejemplo: Detectando Llamadas API Fallidas

```java
@Test
void allApiCallsShouldSucceed() {
    alice.attemptsTo(
        CaptureNetworkRequests.duringTest(),
        Navigate.to("https://myapp.com/dashboard")
    );

    // Verificar que ninguna llamada API fallo
    List<CapturedRequest> failedRequests = alice.asksFor(NetworkRequests.failed());
    assertThat(failedRequests)
        .describedAs("Failed network requests")
        .isEmpty();
}
```

## Pruebas de Accesibilidad

Probar cumplimiento de accesibilidad usando snapshots ARIA:

```java
import net.serenitybdd.screenplay.playwright.questions.AccessibilitySnapshot;
import com.microsoft.playwright.options.AriaRole;

// Obtener snapshot de accesibilidad de toda la pagina
String pageSnapshot = alice.asksFor(AccessibilitySnapshot.ofThePage());

// Obtener snapshot de accesibilidad de un elemento especifico
String navSnapshot = alice.asksFor(AccessibilitySnapshot.of("#main-nav"));
String formSnapshot = alice.asksFor(AccessibilitySnapshot.of(LOGIN_FORM));

// Obtener todos los elementos con un rol ARIA especifico
List<String> buttons = alice.asksFor(AccessibilitySnapshot.allWithRole(AriaRole.BUTTON));
List<String> links = alice.asksFor(AccessibilitySnapshot.allWithRole(AriaRole.LINK));
List<String> headings = alice.asksFor(AccessibilitySnapshot.allWithRole(AriaRole.HEADING));
```

## Pruebas de Regresion Visual

Comparar capturas de pantalla contra imagenes de linea base:

```java
import net.serenitybdd.screenplay.playwright.assertions.visual.CompareScreenshot;

// Comparacion de pagina completa
alice.attemptsTo(
    CompareScreenshot.ofPage()
        .againstBaseline("homepage-baseline.png")
        .withThreshold(0.01)  // 1% de diferencia permitida
);

// Comparacion de elemento
alice.attemptsTo(
    CompareScreenshot.of("#product-card")
        .againstBaseline("product-card-baseline.png")
);

// Con mascara para contenido dinamico
alice.attemptsTo(
    CompareScreenshot.ofPage()
        .againstBaseline("dashboard.png")
        .withMask("#timestamp", "#user-avatar")
);
```

## Emulacion de Dispositivos

Probar disenos responsivos con emulacion de dispositivos:

```java
import net.serenitybdd.screenplay.playwright.interactions.EmulateDevice;

// Emular dispositivo especifico
alice.attemptsTo(EmulateDevice.device("iPhone 14"));
alice.attemptsTo(EmulateDevice.device("Pixel 7"));
alice.attemptsTo(EmulateDevice.device("iPad Pro 11"));

// Viewport personalizado
alice.attemptsTo(EmulateDevice.withViewport(375, 812));

// Con factor de escala del dispositivo
alice.attemptsTo(
    EmulateDevice.withViewport(375, 812).andDeviceScaleFactor(2)
);

// Con user agent movil
alice.attemptsTo(
    EmulateDevice.withViewport(375, 812).asMobile()
);
```

## Geolocalizacion

Probar funcionalidades basadas en ubicacion:

```java
import net.serenitybdd.screenplay.playwright.interactions.SetGeolocation;
import net.serenitybdd.screenplay.playwright.interactions.GrantPermissions;

// Primero otorgar permiso de geolocalizacion
alice.attemptsTo(GrantPermissions.for_("geolocation"));

// Establecer coordenadas especificas
alice.attemptsTo(SetGeolocation.to(51.5074, -0.1278));  // Londres

// Usar ubicaciones predefinidas
alice.attemptsTo(SetGeolocation.toNewYork());
alice.attemptsTo(SetGeolocation.toLondon());
alice.attemptsTo(SetGeolocation.toTokyo());
alice.attemptsTo(SetGeolocation.toSanFrancisco());
alice.attemptsTo(SetGeolocation.toSydney());
alice.attemptsTo(SetGeolocation.toParis());

// Con precision
alice.attemptsTo(
    SetGeolocation.to(40.7128, -74.0060).withAccuracy(100)
);

// Limpiar geolocalizacion
alice.attemptsTo(SetGeolocation.clear());
```

## Gestion de Permisos

Otorgar o limpiar permisos del navegador:

```java
import net.serenitybdd.screenplay.playwright.interactions.GrantPermissions;
import net.serenitybdd.screenplay.playwright.interactions.ClearPermissions;

// Otorgar permisos especificos
alice.attemptsTo(GrantPermissions.for_("geolocation"));
alice.attemptsTo(GrantPermissions.for_("notifications", "camera", "microphone"));

// Limpiar todos los permisos
alice.attemptsTo(ClearPermissions.all());
```

## Control del Reloj

Probar funcionalidad dependiente del tiempo:

```java
import net.serenitybdd.screenplay.playwright.interactions.ControlClock;
import java.time.Instant;

// Instalar reloj falso
alice.attemptsTo(ControlClock.install());

// Establecer a tiempo especifico
alice.attemptsTo(
    ControlClock.setTo(Instant.parse("2024-01-15T10:30:00Z"))
);

// Avanzar el tiempo
alice.attemptsTo(ControlClock.advanceBy(Duration.ofHours(2)));
alice.attemptsTo(ControlClock.advanceBy(Duration.ofMinutes(30)));

// Reanudar flujo de tiempo normal
alice.attemptsTo(ControlClock.resume());
```

## Tracing

Registrar trazas detalladas para depuracion:

```java
import net.serenitybdd.screenplay.playwright.interactions.tracing.StartTracing;
import net.serenitybdd.screenplay.playwright.interactions.tracing.StopTracing;

// Comenzar tracing con opciones
alice.attemptsTo(
    StartTracing.withScreenshots()
        .andSnapshots()
        .named("login-flow")
);

// ... realizar acciones de prueba ...

// Detener y guardar traza
alice.attemptsTo(
    StopTracing.andSaveTo(Paths.get("traces/login-flow.zip"))
);

// Ver traza: npx playwright show-trace traces/login-flow.zip
```

Opciones de traza:
- `withScreenshots()` - Incluir capturas de pantalla en la traza
- `andSnapshots()` - Incluir snapshots del DOM
- `andSources()` - Incluir archivos fuente
- `named(String)` - Establecer nombre de la traza

## Persistencia de Estado de Sesion

:::info Nuevo en 5.2.2
La persistencia de estado de sesion fue agregada en Serenity BDD 5.2.2.
:::

Guardar y restaurar estado de sesion del navegador (cookies, localStorage, sessionStorage) para acelerar pruebas y compartir sesiones autenticadas.

### Guardando Estado de Sesion

```java
import net.serenitybdd.screenplay.playwright.interactions.SaveSessionState;

// Guardar en una ruta especifica
Path sessionPath = Paths.get("target/sessions/authenticated.json");
alice.attemptsTo(
    SaveSessionState.toPath(sessionPath)
);

// Guardar en ubicacion por defecto con un nombre
// Guarda en: target/playwright/session-state/{name}.json
alice.attemptsTo(
    SaveSessionState.toFile("admin-session")
);
```

### Restaurando Estado de Sesion

```java
import net.serenitybdd.screenplay.playwright.interactions.RestoreSessionState;

// Restaurar desde una ruta especifica
alice.attemptsTo(
    RestoreSessionState.fromPath(Paths.get("target/sessions/authenticated.json"))
);

// Restaurar desde ubicacion por defecto
alice.attemptsTo(
    RestoreSessionState.fromFile("admin-session")
);
```

### Caso de Uso: Reutilizando Sesiones Autenticadas

Un patron comun es iniciar sesion una vez y reutilizar la sesion a traves de multiples pruebas:

```java
public class AuthenticationSetup {

    private static final Path SESSION_FILE = Paths.get("target/sessions/logged-in.json");

    @BeforeAll
    static void setupAuthenticatedSession() {
        Actor setup = Actor.named("Setup")
            .whoCan(BrowseTheWebWithPlaywright.usingTheDefaultConfiguration());

        setup.attemptsTo(
            Navigate.to("https://myapp.com/login"),
            Enter.theValue("admin@example.com").into("#email"),
            Enter.theValue("password123").into("#password"),
            Click.on(Button.withText("Login")),

            // Guardar la sesion autenticada
            SaveSessionState.toPath(SESSION_FILE)
        );

        setup.wrapUp();
    }
}

// En tus pruebas
@Test
void shouldAccessDashboard() {
    alice.attemptsTo(
        // Restaurar la sesion pre-autenticada
        RestoreSessionState.fromPath(SESSION_FILE),

        // Navegar directamente a pagina protegida
        Navigate.to("https://myapp.com/dashboard")
    );

    // El usuario ya esta logueado!
    assertThat(alice.asksFor(Text.of("h1"))).isEqualTo("Dashboard");
}
```

### Contenido del Estado de Sesion

El estado de sesion guardado es un archivo JSON que contiene:
- **Cookies**: Todas las cookies para el contexto del navegador
- **Origins**: Datos de localStorage y sessionStorage para cada origen

Esto te permite:
- Omitir pasos de login en pruebas (ejecucion mas rapida)
- Compartir autenticacion entre clases de prueba
- Crear fixtures de sesion para diferentes roles de usuario
- Probar escenarios de expiracion y renovacion de sesion

### Ejemplo: Multiples Roles de Usuario

```java
public class SessionFixtures {

    public static void createAdminSession() {
        // Login como admin y guardar sesion
        Actor admin = createActor();
        admin.attemptsTo(
            Navigate.to("https://myapp.com/login"),
            Enter.theValue("admin@example.com").into("#email"),
            Enter.theValue("adminpass").into("#password"),
            Click.on(Button.withText("Login")),
            SaveSessionState.toFile("admin-session")
        );
        admin.wrapUp();
    }

    public static void createUserSession() {
        // Login como usuario regular y guardar sesion
        Actor user = createActor();
        user.attemptsTo(
            Navigate.to("https://myapp.com/login"),
            Enter.theValue("user@example.com").into("#email"),
            Enter.theValue("userpass").into("#password"),
            Click.on(Button.withText("Login")),
            SaveSessionState.toFile("user-session")
        );
        user.wrapUp();
    }
}

// En pruebas de admin
@Test
void adminShouldSeeAdminPanel() {
    alice.attemptsTo(
        RestoreSessionState.fromFile("admin-session"),
        Navigate.to("https://myapp.com/admin")
    );
    assertThat(alice.asksFor(Presence.of("#admin-panel"))).isTrue();
}

// En pruebas de usuario
@Test
void userShouldNotSeeAdminPanel() {
    alice.attemptsTo(
        RestoreSessionState.fromFile("user-session"),
        Navigate.to("https://myapp.com/admin")
    );
    assertThat(alice.asksFor(Text.of("h1"))).isEqualTo("Access Denied");
}
```

## Generacion de PDF

Generar PDFs desde paginas (solo Chromium, modo headless):

```java
import net.serenitybdd.screenplay.playwright.interactions.GeneratePDF;

// Generacion basica de PDF
alice.attemptsTo(
    GeneratePDF.ofCurrentPage()
        .andSaveTo(Paths.get("output/report.pdf"))
);

// Con opciones
alice.attemptsTo(
    GeneratePDF.ofCurrentPage()
        .withFormat("A4")
        .inLandscape()
        .withMargins("1cm", "1cm", "1cm", "1cm")
        .withHeaderTemplate("<div>Header</div>")
        .withFooterTemplate("<div>Page <span class='pageNumber'></span></div>")
        .displayHeaderAndFooter()
        .printBackground()
        .andSaveTo(Paths.get("output/report.pdf"))
);
```

## Cambiando Contextos

### Frames

Trabajar con iframes:

```java
// Cambiar a frame por nombre o ID
alice.attemptsTo(Switch.toFrame("payment-iframe"));

// Cambiar a frame por Target
alice.attemptsTo(Switch.toFrame(Target.the("payment").locatedBy("#payment-frame")));

// Volver al frame principal
alice.attemptsTo(Switch.toMainFrame());
```

### Ventanas y Pestanas

Manejar multiples ventanas y pestanas:

```java
// Cambiar a nueva ventana/pestana
alice.attemptsTo(Switch.toNewWindow());

// Cerrar ventana actual
alice.attemptsTo(CloseCurrentWindow.now());
```

## Mejores Practicas

### Usar Constantes Target

Define Target como constantes para reusabilidad y mantenibilidad:

```java
public class LoginPage {
    public static Target EMAIL_FIELD = Target.the("email field")
        .locatedBy("#email");
    public static Target PASSWORD_FIELD = Target.the("password field")
        .locatedBy("#password");
    public static Target LOGIN_BUTTON = Target.the("login button")
        .locatedBy("role=button[name='Log in']");
}
```

### Preferir Selectores de Rol

Usa selectores de rol ARIA para pruebas mas resilientes:

```java
// En lugar de CSS
Target.the("Submit").locatedBy("button.primary-btn")

// Preferir selector de rol
Target.the("Submit").locatedBy("role=button[name='Submit']")
```

### Usar Factorias de Elementos UI

Para elementos comunes, usa las factorias de elementos UI:

```java
// En lugar de
Click.on(Target.the("Add button").locatedBy("role=button[name='Add to Cart']"))

// Usar
Click.on(Button.withText("Add to Cart"))
```

### Mockeo de Red para Aislamiento

Mockea respuestas de API para aislar pruebas de UI:

```java
@BeforeEach
void setupMocks() {
    actor.attemptsTo(
        InterceptNetwork.requestsTo("**/api/products")
            .andRespondWithJson(200, mockProducts)
    );
}
```

### Usar Tracing para Depuracion

Habilita tracing cuando depures fallos de pruebas:

```java
alice.attemptsTo(
    StartTracing.withScreenshots().andSnapshots()
);

// Ejecuta tu prueba...

alice.attemptsTo(
    StopTracing.andSaveTo(Paths.get("trace.zip"))
);
// Ver con: npx playwright show-trace trace.zip
```

## Tablas de Referencia Rapida

### Todas las Interaction

Las siguientes tablas proporcionan una referencia completa de todas las Interaction de Screenplay Playwright disponibles.

#### Interaction de Elementos

| Interaction | Descripcion | Ejemplo |
|-------------|-------------|---------|
| `Click.on(target)` | Clic en un elemento | `Click.on("#submit")` |
| `DoubleClick.on(target)` | Doble clic en un elemento | `DoubleClick.on("#item")` |
| `RightClick.on(target)` | Clic derecho (menu contextual) en un elemento | `RightClick.on("#file")` |
| `Hover.over(target)` | Mover mouse sobre un elemento | `Hover.over("#menu")` |
| `Focus.on(target)` | Establecer foco en un elemento | `Focus.on("#search")` |

#### Interaction de Entrada de Texto

| Interaction | Descripcion | Ejemplo |
|-------------|-------------|---------|
| `Enter.theValue(text).into(target)` | Escribir texto en un campo | `Enter.theValue("john@test.com").into("#email")` |
| `Clear.field(target)` | Limpiar un campo de entrada | `Clear.field("#search")` |
| `Press.key(key)` | Presionar una tecla del teclado | `Press.key("Enter")` |
| `Press.key(combo)` | Presionar una combinacion de teclas | `Press.key("Control+a")` |
| `Press.keys(keys...)` | Presionar multiples teclas en secuencia | `Press.keys("Tab", "Tab", "Enter")` |

#### Interaction de Checkbox y Radio

| Interaction | Descripcion | Ejemplo |
|-------------|-------------|---------|
| `Check.checkbox(target)` | Marcar un checkbox | `Check.checkbox("#agree")` |
| `Uncheck.checkbox(target)` | Desmarcar un checkbox | `Uncheck.checkbox("#newsletter")` |

#### Interaction de Dropdown

| Interaction | Descripcion | Ejemplo |
|-------------|-------------|---------|
| `SelectFromOptions.byVisibleText(text).from(target)` | Seleccionar por texto visible | `SelectFromOptions.byVisibleText("Red").from("#color")` |
| `SelectFromOptions.byValue(value).from(target)` | Seleccionar por atributo value | `SelectFromOptions.byValue("red").from("#color")` |
| `SelectFromOptions.byIndex(index).from(target)` | Seleccionar por indice (base 0) | `SelectFromOptions.byIndex(2).from("#color")` |
| `DeselectFromOptions.byValue(value).from(target)` | Deseleccionar por valor | `DeselectFromOptions.byValue("red").from("#colors")` |
| `DeselectFromOptions.byVisibleText(text).from(target)` | Deseleccionar por texto visible | `DeselectFromOptions.byVisibleText("Red").from("#colors")` |
| `DeselectFromOptions.byIndex(index).from(target)` | Deseleccionar por indice | `DeselectFromOptions.byIndex(0).from("#colors")` |
| `DeselectFromOptions.all().from(target)` | Deseleccionar todas las opciones | `DeselectFromOptions.all().from("#colors")` |

#### Interaction de Desplazamiento

| Interaction | Descripcion | Ejemplo |
|-------------|-------------|---------|
| `Scroll.to(target)` | Desplazar elemento a la vista | `Scroll.to("#footer")` |
| `Scroll.to(target).andAlignToTop()` | Desplazar con alineacion superior | `Scroll.to("#section").andAlignToTop()` |
| `Scroll.to(target).andAlignToCenter()` | Desplazar con alineacion central | `Scroll.to("#section").andAlignToCenter()` |
| `Scroll.to(target).andAlignToBottom()` | Desplazar con alineacion inferior | `Scroll.to("#section").andAlignToBottom()` |
| `Scroll.toTop()` | Desplazar al inicio de la pagina | `Scroll.toTop()` |
| `Scroll.toBottom()` | Desplazar al final de la pagina | `Scroll.toBottom()` |
| `Scroll.by(deltaX, deltaY)` | Desplazar por cantidad de pixeles | `Scroll.by(0, 500)` |
| `Scroll.toPosition(x, y)` | Desplazar a posicion absoluta | `Scroll.toPosition(0, 1000)` |

#### Interaction de Arrastrar y Soltar

| Interaction | Descripcion | Ejemplo |
|-------------|-------------|---------|
| `Drag.from(source).to(target)` | Arrastrar de origen a destino | `Drag.from("#item").to("#dropzone")` |
| `Drag.the(source).onto(target)` | Sintaxis fluida alternativa | `Drag.the("#card").onto("#column")` |

#### Interaction de Navegacion

| Interaction | Descripcion | Ejemplo |
|-------------|-------------|---------|
| `Navigate.to(url)` | Navegar a una URL | `Navigate.to("https://example.com")` |
| `Navigate.toTheBaseUrl()` | Navegar a URL base configurada | `Navigate.toTheBaseUrl()` |

#### Interaction de Frame y Ventana

| Interaction | Descripcion | Ejemplo |
|-------------|-------------|---------|
| `Switch.toFrame(nameOrId)` | Cambiar a iframe por nombre/ID | `Switch.toFrame("payment-iframe")` |
| `Switch.toFrame(target)` | Cambiar a iframe por Target | `Switch.toFrame(PAYMENT_FRAME)` |
| `Switch.toMainFrame()` | Volver al frame principal | `Switch.toMainFrame()` |
| `Switch.toNewWindow()` | Cambiar a nueva ventana/pestana | `Switch.toNewWindow()` |
| `CloseCurrentWindow.now()` | Cerrar ventana actual | `CloseCurrentWindow.now()` |

#### Interaction de Archivos

| Interaction | Descripcion | Ejemplo |
|-------------|-------------|---------|
| `Upload.file(path).to(target)` | Subir un archivo | `Upload.file(Paths.get("doc.pdf")).to("#upload")` |
| `WaitForDownload.whilePerforming(action)` | Esperar descarga durante accion | `WaitForDownload.whilePerforming(Click.on("#download"))` |
| `WaitForDownload...andSaveTo(path)` | Guardar descarga en ruta | `WaitForDownload.whilePerforming(...).andSaveTo(path)` |

#### Interaction de JavaScript

| Interaction | Descripcion | Ejemplo |
|-------------|-------------|---------|
| `Evaluate.javascript(script)` | Ejecutar JavaScript | `Evaluate.javascript("window.scrollTo(0,0)")` |

#### Interaction de Espera

| Interaction | Descripcion | Ejemplo |
|-------------|-------------|---------|
| `WaitUntil.the(target).isVisible()` | Esperar visibilidad del elemento | `WaitUntil.the("#modal").isVisible()` |
| `WaitUntil.the(target).isNotVisible()` | Esperar a que el elemento se oculte | `WaitUntil.the("#spinner").isNotVisible()` |
| `WaitUntil.the(target).isHidden()` | Esperar a que el elemento este oculto | `WaitUntil.the("#loading").isHidden()` |
| `WaitUntil...forNoMoreThan(duration)` | Establecer timeout personalizado | `WaitUntil.the("#data").isVisible().forNoMoreThan(Duration.ofSeconds(10))` |

#### Interaction de Red

| Interaction | Descripcion | Ejemplo |
|-------------|-------------|---------|
| `InterceptNetwork.requestsTo(pattern).andRespondWith(options)` | Mockear respuesta con opciones | `InterceptNetwork.requestsTo("**/api/**").andRespondWith(...)` |
| `InterceptNetwork.requestsTo(pattern).andRespondWithJson(status, data)` | Mockear respuesta JSON | `InterceptNetwork.requestsTo("**/users").andRespondWithJson(200, users)` |
| `InterceptNetwork.requestsTo(pattern).andHandle(handler)` | Manejador de peticion personalizado | `InterceptNetwork.requestsTo("**/api/**").andHandle(route -> ...)` |
| `InterceptNetwork.requestsTo(pattern).andAbort()` | Bloquear peticiones | `InterceptNetwork.requestsTo("**/analytics/**").andAbort()` |
| `RemoveRoutes.all()` | Eliminar todos los manejadores de rutas | `RemoveRoutes.all()` |
| `RemoveRoutes.forUrl(pattern)` | Eliminar rutas para un patron | `RemoveRoutes.forUrl("**/api/**")` |

#### Interaction de Dispositivo y Entorno

| Interaction | Descripcion | Ejemplo |
|-------------|-------------|---------|
| `EmulateDevice.device(name)` | Emular un dispositivo | `EmulateDevice.device("iPhone 14")` |
| `EmulateDevice.withViewport(width, height)` | Establecer viewport personalizado | `EmulateDevice.withViewport(375, 812)` |
| `SetGeolocation.to(lat, lng)` | Establecer geolocalizacion | `SetGeolocation.to(51.5074, -0.1278)` |
| `GrantPermissions.for_(permissions...)` | Otorgar permisos del navegador | `GrantPermissions.for_("geolocation", "camera")` |
| `ClearPermissions.all()` | Limpiar todos los permisos | `ClearPermissions.all()` |

#### Interaction de Control de Reloj

| Interaction | Descripcion | Ejemplo |
|-------------|-------------|---------|
| `ControlClock.install()` | Instalar reloj falso | `ControlClock.install()` |
| `ControlClock.setTo(instant)` | Establecer reloj a tiempo especifico | `ControlClock.setTo(Instant.parse("2024-01-15T10:30:00Z"))` |
| `ControlClock.advanceBy(duration)` | Avanzar reloj | `ControlClock.advanceBy(Duration.ofHours(2))` |
| `ControlClock.resume()` | Reanudar flujo de tiempo normal | `ControlClock.resume()` |

#### Interaction de Depuracion y Tracing

| Interaction | Descripcion | Ejemplo |
|-------------|-------------|---------|
| `StartTracing.withScreenshots()` | Iniciar traza con capturas de pantalla | `StartTracing.withScreenshots()` |
| `StopTracing.andSaveTo(path)` | Detener y guardar traza | `StopTracing.andSaveTo(Paths.get("trace.zip"))` |
| `CaptureConsoleMessages.duringTest()` | Comenzar a capturar consola | `CaptureConsoleMessages.duringTest()` |
| `CaptureConsoleMessages.clear()` | Limpiar mensajes capturados | `CaptureConsoleMessages.clear()` |
| `CheckConsole.forErrors()` | Fallar si se encuentran errores de consola | `CheckConsole.forErrors()` |
| `CaptureNetworkRequests.duringTest()` | Comenzar a capturar red | `CaptureNetworkRequests.duringTest()` |
| `CaptureNetworkRequests.clear()` | Limpiar peticiones capturadas | `CaptureNetworkRequests.clear()` |

#### Interaction de Estado de Sesion

| Interaction | Descripcion | Ejemplo |
|-------------|-------------|---------|
| `SaveSessionState.toPath(path)` | Guardar sesion en ruta especifica | `SaveSessionState.toPath(Paths.get("session.json"))` |
| `SaveSessionState.toFile(name)` | Guardar sesion en ubicacion por defecto | `SaveSessionState.toFile("admin-session")` |
| `RestoreSessionState.fromPath(path)` | Restaurar sesion desde ruta | `RestoreSessionState.fromPath(Paths.get("session.json"))` |
| `RestoreSessionState.fromFile(name)` | Restaurar sesion desde ubicacion por defecto | `RestoreSessionState.fromFile("admin-session")` |

#### Interaction de Peticiones API

| Interaction | Descripcion | Ejemplo |
|-------------|-------------|---------|
| `APIRequest.get(url)` | Realizar peticion GET | `APIRequest.get("https://api.example.com/users")` |
| `APIRequest.post(url)` | Realizar peticion POST | `APIRequest.post("https://api.example.com/users")` |
| `APIRequest.put(url)` | Realizar peticion PUT | `APIRequest.put("https://api.example.com/users/1")` |
| `APIRequest.patch(url)` | Realizar peticion PATCH | `APIRequest.patch("https://api.example.com/users/1")` |
| `APIRequest.delete(url)` | Realizar peticion DELETE | `APIRequest.delete("https://api.example.com/users/1")` |

#### Interaction de Generacion de PDF

| Interaction | Descripcion | Ejemplo |
|-------------|-------------|---------|
| `GeneratePDF.ofCurrentPage().andSaveTo(path)` | Generar PDF | `GeneratePDF.ofCurrentPage().andSaveTo(Paths.get("page.pdf"))` |
| `GeneratePDF...withFormat(format)` | Establecer formato de papel | `GeneratePDF.ofCurrentPage().withFormat("A4")` |
| `GeneratePDF...inLandscape()` | Usar orientacion horizontal | `GeneratePDF.ofCurrentPage().inLandscape()` |

#### Interaction de Pruebas Visuales

| Interaction | Descripcion | Ejemplo |
|-------------|-------------|---------|
| `CompareScreenshot.ofPage().againstBaseline(name)` | Comparar pagina completa | `CompareScreenshot.ofPage().againstBaseline("home.png")` |
| `CompareScreenshot.of(target).againstBaseline(name)` | Comparar elemento | `CompareScreenshot.of("#card").againstBaseline("card.png")` |

---

### Todas las Question

Las siguientes tablas proporcionan una referencia completa de todas las Question de Screenplay Playwright disponibles.

#### Question de Estado de Elementos

| Question | Tipo de Retorno | Descripcion | Ejemplo |
|----------|-------------|-------------|---------|
| `Presence.of(target)` | `Boolean` | Elemento existe en DOM | `actor.asksFor(Presence.of("#modal"))` |
| `Absence.of(target)` | `Boolean` | Elemento no presente | `actor.asksFor(Absence.of("#error"))` |
| `Visibility.of(target)` | `Boolean` | Elemento es visible | `actor.asksFor(Visibility.of("#popup"))` |
| `Enabled.of(target)` | `Boolean` | Elemento esta habilitado | `actor.asksFor(Enabled.of("#submit"))` |
| `SelectedStatus.of(target)` | `Boolean` | Checkbox/radio esta seleccionado | `actor.asksFor(SelectedStatus.of("#agree"))` |

#### Question de Contenido de Elementos

| Question | Tipo de Retorno | Descripcion | Ejemplo |
|----------|-------------|-------------|---------|
| `Text.of(target)` | `String` | Obtener contenido de texto del elemento | `actor.asksFor(Text.of("#title"))` |
| `Text.ofEach(target)` | `List<String>` | Obtener texto de todos los elementos coincidentes | `actor.asksFor(Text.ofEach(".item"))` |
| `Value.of(target)` | `String` | Obtener valor del campo de entrada | `actor.asksFor(Value.of("#email"))` |
| `Attribute.of(target).named(attr)` | `String` | Obtener valor de atributo | `actor.asksFor(Attribute.of("#link").named("href"))` |
| `CSSValue.of(target).named(prop)` | `String` | Obtener valor de propiedad CSS | `actor.asksFor(CSSValue.of("#box").named("color"))` |

#### Question de Informacion de Pagina

| Question | Tipo de Retorno | Descripcion | Ejemplo |
|----------|-------------|-------------|---------|
| `CurrentUrl.ofThePage()` | `String` | Obtener URL de pagina actual | `actor.asksFor(CurrentUrl.ofThePage())` |
| `PageTitle.ofThePage()` | `String` | Obtener titulo de pagina | `actor.asksFor(PageTitle.ofThePage())` |

#### Question de Descarga

| Question | Tipo de Retorno | Descripcion | Ejemplo |
|----------|-------------|-------------|---------|
| `DownloadedFile.suggestedFilename()` | `String` | Obtener nombre de archivo sugerido | `actor.asksFor(DownloadedFile.suggestedFilename())` |
| `DownloadedFile.url()` | `String` | Obtener URL de descarga | `actor.asksFor(DownloadedFile.url())` |
| `DownloadedFile.path()` | `Path` | Obtener ruta del archivo descargado | `actor.asksFor(DownloadedFile.path())` |
| `DownloadedFile.failure()` | `String` | Obtener razon del fallo (null si exitoso) | `actor.asksFor(DownloadedFile.failure())` |

#### Question de Mensajes de Consola

| Question | Tipo de Retorno | Descripcion | Ejemplo |
|----------|-------------|-------------|---------|
| `ConsoleMessages.all()` | `List<String>` | Obtener todos los mensajes de consola | `actor.asksFor(ConsoleMessages.all())` |
| `ConsoleMessages.errors()` | `List<String>` | Obtener errores de consola | `actor.asksFor(ConsoleMessages.errors())` |
| `ConsoleMessages.warnings()` | `List<String>` | Obtener advertencias de consola | `actor.asksFor(ConsoleMessages.warnings())` |
| `ConsoleMessages.count()` | `Integer` | Obtener conteo total de mensajes | `actor.asksFor(ConsoleMessages.count())` |

#### Question de Peticiones de Red

| Question | Tipo de Retorno | Descripcion | Ejemplo |
|----------|-------------|-------------|---------|
| `NetworkRequests.all()` | `List<CapturedRequest>` | Obtener todas las peticiones capturadas | `actor.asksFor(NetworkRequests.all())` |
| `NetworkRequests.count()` | `Integer` | Obtener conteo total de peticiones | `actor.asksFor(NetworkRequests.count())` |
| `NetworkRequests.withMethod(method)` | `List<CapturedRequest>` | Filtrar por metodo HTTP | `actor.asksFor(NetworkRequests.withMethod("POST"))` |
| `NetworkRequests.failed()` | `List<CapturedRequest>` | Obtener peticiones fallidas | `actor.asksFor(NetworkRequests.failed())` |

#### Question de Respuesta API

| Question | Tipo de Retorno | Descripcion | Ejemplo |
|----------|-------------|-------------|---------|
| `LastAPIResponse.statusCode()` | `Integer` | Obtener codigo de estado de respuesta | `actor.asksFor(LastAPIResponse.statusCode())` |
| `LastAPIResponse.ok()` | `Boolean` | Verificar si estado es 2xx | `actor.asksFor(LastAPIResponse.ok())` |
| `LastAPIResponse.body()` | `String` | Obtener cuerpo de respuesta como string | `actor.asksFor(LastAPIResponse.body())` |
| `LastAPIResponse.jsonBody()` | `Map<String, Object>` | Parsear respuesta JSON como Map | `actor.asksFor(LastAPIResponse.jsonBody())` |

---

### Factorias de Elementos UI

Clases de factoria para localizar elementos UI comunes.

| Factoria | Metodos | Ejemplo |
|---------|---------|---------|
| `Button` | `withText(text)`, `withNameOrId(id)`, `withAriaLabel(label)`, `containingText(text)`, `locatedBy(selector)` | `Button.withText("Submit")` |
| `InputField` | `withNameOrId(id)`, `withPlaceholder(text)`, `withLabel(label)`, `withAriaLabel(label)`, `locatedBy(selector)` | `InputField.withPlaceholder("Email")` |
| `Link` | `withText(text)`, `containingText(text)`, `withTitle(title)`, `locatedBy(selector)` | `Link.withText("Learn more")` |
| `Checkbox` | `withLabel(label)`, `withNameOrId(id)`, `withValue(value)`, `locatedBy(selector)` | `Checkbox.withLabel("I agree")` |
| `RadioButton` | `withLabel(label)`, `withNameOrId(id)`, `withValue(value)`, `locatedBy(selector)` | `RadioButton.withValue("express")` |
| `Dropdown` | `withLabel(label)`, `withNameOrId(id)`, `locatedBy(selector)` | `Dropdown.withLabel("Country")` |
| `Label` | `withText(text)`, `withExactText(text)`, `forFieldId(id)`, `locatedBy(selector)` | `Label.forFieldId("email")` |
| `Image` | `withAltText(alt)`, `withSrc(src)`, `withSrcContaining(text)`, `locatedBy(selector)` | `Image.withAltText("Logo")` |

---

## Migracion desde WebDriver

Al migrar desde `serenity-screenplay-webdriver`:

1. **Cambio de Ability**:
   - Reemplaza `BrowseTheWeb` con `BrowseTheWebWithPlaywright`

2. **Sintaxis de Selectores**:
   - CSS y XPath funcionan de manera similar
   - Agrega selectores de rol para pruebas mas robustas
   - Usa `>>` para encadenar selectores en lugar de anidar

3. **Esperas**:
   - Playwright auto-espera; las esperas explicitas son menos necesarias
   - Elimina la mayoria de llamadas `WaitUntil`

4. **Metodos de Localizacion**:
   - `By.id("x")` se convierte en `"#x"`
   - `By.cssSelector("x")` se convierte en `"x"`
   - `By.xpath("x")` se convierte en `"xpath=x"`

5. **Nuevas Capacidades**:
   - Usa interceptacion de red para mockear APIs
   - Usa tracing para depuracion
   - Usa emulacion de dispositivos para pruebas responsivas

## Ejemplo Completo

```java
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import net.serenitybdd.screenplay.playwright.interactions.*;
import net.serenitybdd.screenplay.playwright.questions.*;
import net.serenitybdd.screenplay.playwright.ui.*;
import static org.assertj.core.api.Assertions.assertThat;

public class ShoppingCartTest {

    Actor alice = Actor.named("Alice");

    @BeforeEach
    void setup() {
        Playwright playwright = Playwright.create();
        Browser browser = playwright.chromium().launch();
        alice.can(BrowseTheWebWithPlaywright.using(browser));
    }

    @Test
    void shouldAddItemToCart() {
        alice.attemptsTo(
            Navigate.to("https://shop.example.com"),
            Click.on(Button.withText("Electronics")),
            Click.on(Link.containingText("Laptop")),
            SelectFromOptions.byVisibleText("16GB").from(Dropdown.withLabel("Memory")),
            Click.on(Button.withText("Add to Cart"))
        );

        String cartCount = alice.asksFor(Text.of("#cart-count"));
        assertThat(cartCount).isEqualTo("1");

        List<String> cartItems = alice.asksFor(Text.ofEach(".cart-item-name"));
        assertThat(cartItems).contains("Laptop");
    }
}
```

## Lectura Adicional

- [Documentacion de Playwright Java](https://playwright.dev/java/docs/intro)
- [Screenplay Pattern de Serenity](screenplay_fundamentals)
- [Pruebas Web con WebDriver](screenplay_webdriver)
