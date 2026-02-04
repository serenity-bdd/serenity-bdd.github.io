---
id: page_objects
title: Interactuando con Páginas Web
sidebar_position: 5
---

# Interactuando con Páginas Web

Serenity se integra suavemente con Selenium WebDriver y gestiona detalles como la configuración del driver y el mantenimiento de la instancia del driver. También proporciona una serie de mejoras al Selenium estándar.

## Page Object

Si estás trabajando con pruebas web de WebDriver, estarás familiarizado con el concepto de Page Object. Los Page Object son una forma de aislar los detalles de implementación de una página web dentro de una clase, exponiendo solo métodos enfocados en el negocio relacionados con esa página. Son una excelente manera de hacer tus pruebas web más mantenibles.

En Serenity, los Page Object son simplemente clases ordinarias que extienden la clase `PageObject`. Serenity inyecta automáticamente una instancia de WebDriver en el Page Object a la que puedes acceder a través del método `getDriver()`, aunque raramente necesitas usar el WebDriver directamente. La clase `PageObject` de Serenity proporciona una serie de métodos convenientes que hacen que acceder y manipular elementos web sea mucho más fácil que con scripts de prueba convencionales de WebDriver.

Aquí tienes un ejemplo simple:

```java
...
import net.serenitybdd.core.pages.WebElementFacade;
import net.thucydides.core.pages.PageObject;
...

@DefaultUrl("http://localhost:9000/somepage")
public class FindAJobPage extends PageObject {

    WebElementFacade keywords;
    WebElementFacade searchButton;

    public void look_for_jobs_with_keywords(String values) {
        typeInto(keywords, values);
        searchButton.click();
    }

    public List<String> getJobTabs() {
        return findAll("//div[@id='tabs']//a").stream()
            .map(WebElementFacade::getText)
            .collect(Collectors.toList());
    }
}
```

El método `typeInto` es un atajo que simplemente limpia un campo e ingresa el texto especificado.
Si prefieres un estilo de API más fluido, también puedes hacer algo como esto:

```java
@DefaultUrl("http://localhost:9000/somepage")
public class FindAJobPage extends PageObject {
	WebElementFacade keywordsField;
	WebElementFacade searchButton;

	public FindAJobPage(WebDriver driver) {
	    super(driver);
	}

	public void look_for_jobs_with_keywords(String values) {
	    enter(values).into(keywordsField);
	    searchButton.click();
	}

	public List<String> getJobTabs() {
	     return findAll("//div[@id='tabs']//a").stream()
            .map(WebElementFacade::getText)
            .collect(Collectors.toList());
	}
}
```

Puedes usar un estilo aún más fluido para expresar los pasos de implementación usando métodos como `find`, `findBy` y `then`.

Por ejemplo, puedes usar buscadores `By` de webdriver con nombre de elemento, id, selector css o selector xpath de la siguiente manera:

```java
find(By.name("demo")).then(By.name("specialField")).getValue();

find(By.cssSelector(".foo")).getValue();

find(By.xpath("//th")).getValue();
```

El método `findBy` te permite pasar el selector css o xpath directamente a WebDriver. Por ejemplo,

```java
findBy("#demo").then("#specialField").getValue(); //selectores css

findBy("//div[@id='dataTable']").getValue(); //selector xpath
```

## Usando páginas en una biblioteca de pasos

Cuando necesitas usar un Page Object en uno de tus pasos, solo necesitas declarar una variable de tipo PageObject en tu biblioteca de pasos, por ejemplo:

```java
FindAJobPage page;
```

Si quieres asegurarte de que estás en la página correcta, puedes usar el método `currentPageAt()`. Este verificará la clase de página para cualquier anotación `@At` presente en la clase PageObject y, si está presente, verificará que la URL actual corresponda al patrón de URL especificado en la anotación. Por ejemplo, cuando lo invocas usando `currentPageAt()`, el siguiente Page Object verificará que la URL actual sea precisamente `http://www.apache.org`.

```java
@At("http://www.apache.org")
public class ApacheHomePage extends PageObject {
    ...
}
```

La anotación `@At` también soporta comodines y expresiones regulares. El siguiente Page Object coincidirá con cualquier subdominio de Apache:

```java
@At("http://.*.apache.org")
public class AnyApachePage extends PageObject {
    ...
}
```

Más generalmente, sin embargo, estás más interesado en lo que viene después del nombre del host. Puedes usar el token especial `#HOST` para coincidir con cualquier nombre de servidor. Así que el siguiente Page Object coincidirá tanto con `http://localhost:8080/app/action/login.form` como con `http://staging.acme.com/app/action/login.form`. También ignorará parámetros, así que `http://staging.acme.com/app/action/login.form?username=toto&password=oz` funcionará bien también.

```java
@At(urls={"#HOST/app/action/login.form"})
public class LoginPage extends PageObject {
   ...
}
```

## Abriendo la página

Un Page Object está normalmente diseñado para trabajar con una página web particular. Cuando se invoca el método `open()`, el navegador se abrirá en la URL por defecto para la página.

La anotación `@DefaultUrl` indica la URL que esta prueba debe usar cuando se ejecuta de forma aislada (por ejemplo, desde dentro de tu IDE).
Generalmente, sin embargo, la parte del host de la URL por defecto será sobrescrita por la propiedad `webdriver.base.url`, ya que esto te permite establecer la URL base para todas tus pruebas,
y así hace más fácil ejecutar tus pruebas en diferentes entornos simplemente cambiando este valor de propiedad.
Por ejemplo, en la clase de prueba anterior, establecer `webdriver.base.url` a 'https://staging.mycompany.com' resultaría en que la página se abra en la URL 'https://staging.mycompany.com/somepage'.

También puedes definir URLs con nombre que se pueden usar para abrir la página web, opcionalmente con parámetros. Por ejemplo, en el siguiente código, definimos una URL llamada 'open.issue', que acepta un solo parámetro:

```java
@DefaultUrl("http://jira.mycompany.org")
@NamedUrls(
  {
    @NamedUrl(name = "open.issue", url = "http://jira.mycompany.org/issues/{1}")
  }
)
public class JiraIssuePage extends PageObject {
    ...
}
```

Luego podrías abrir esta página a la URL http://jira.mycompany.org/issues/ISSUE-1 como se muestra aquí:

```java
page.open("open.issue", withParameters("ISSUE-1"));
```

También podrías prescindir completamente de la URL base en la definición de URL con nombre, y confiar en los valores por defecto:

```java
@DefaultUrl("http://jira.mycompany.org")
@NamedUrls(
  {
    @NamedUrl(name = "open.issue", url = "/issues/{1}")
  }
)
public class JiraIssuePage extends PageObject {
    ...
}
```

Y naturalmente puedes definir más de una definición:

```java
@NamedUrls(
  {
          @NamedUrl(name = "open.issue", url = "/issues/{1}"),
          @NamedUrl(name = "close.issue", url = "/issues/close/{1}")
  }
)
```

Nunca debes intentar implementar el método `open()` tú mismo. De hecho, es final. Si necesitas que tu página haga algo al cargarse, como esperar a que aparezca un elemento dinámico, puedes usar la anotación @WhenPageOpens.
Los métodos en el PageObject con esta anotación serán invocados (en un orden no especificado) después de que la URL haya sido abierta. En este ejemplo, el método `open()` no retornará hasta que
el elemento web `dataSection` sea visible:

```java
@DefaultUrl("http://localhost:8080/client/list")
    public class ClientList extends PageObject {

     @FindBy(id="data-section");
     WebElementFacade dataSection;
     ...

     @WhenPageOpens
     public void waitUntilTitleAppears() {
         element(dataSection).waitUntilVisible();
     }
}
```

## Trabajando con elementos web

### Verificando si los elementos son visibles

La clase `WebElementFacade` contiene una API fluida conveniente para tratar con elementos web, proporcionando algunas características extra comúnmente usadas que no se proporcionan de serie por la API de WebDriver.
Los `WebElementFacade` son en gran medida intercambiables con WebElements: simplemente declaras una variable de tipo `WebElementFacade` en lugar de tipo `WebElement`. Por ejemplo, puedes verificar que un elemento es visible como se muestra aquí:

```java
public class FindAJobPage extends PageObject {

    WebElementFacade searchButton;

    public boolean searchButtonIsVisible() {
        return searchButton.isVisible();
    }
    ...
}
```

Si el botón no está presente en la pantalla, la prueba esperará un corto período en caso de que aparezca debido a alguna magia Ajax. Si no quieres que la prueba haga esto, puedes usar la versión más rápida:

```java
public boolean searchButtonIsVisibleNow() {
    return searchButton.isCurrentlyVisible();
}
```

Puedes convertir esto en una aserción usando el método `shouldBeVisible()` en su lugar:

```java
public void checkThatSearchButtonIsVisible() {
    searchButton.shouldBeVisible();
}
```

Este método lanzará un error de aserción si el botón de búsqueda no es visible para el usuario final.

### Verificando si los elementos están habilitados

También puedes verificar si un elemento está habilitado o no:

```java
searchButton.isEnabled()
searchButton.shouldBeEnabled()
```

También hay métodos negativos equivalentes:

```java
searchButton.shouldNotBeVisible();
searchButton.shouldNotBeCurrentlyVisible();
searchButton.shouldNotBeEnabled()
```

También puedes verificar elementos que están presentes en la página pero no visibles, por ejemplo:

```java
searchButton.isPresent();
searchButton.isNotPresent();
searchButton.shouldBePresent();
searchButton.shouldNotBePresent();
```

### Manipulando listas desplegables

También hay métodos auxiliares disponibles para listas desplegables. Supongamos que tienes el siguiente desplegable en tu página:

```xml
<select id="color">
    <option value="red">Red</option>
    <option value="blue">Blue</option>
    <option value="green">Green</option>
</select>
```

Podrías escribir un Page Object para manipular este desplegable como se muestra aquí:

```java
public class FindAJobPage extends PageObject {

	@FindBy(id="color")
	WebElementFacade colorDropdown;

	public selectDropdownValues() {
	    colorDropdown.selectByVisibleText("Blue");
	    assertThat(colorDropdown.getSelectedVisibleTextValue(), is("Blue"));

	    colorDropdown.selectByValue("blue");
	    assertThat(colorDropdown.getSelectedValue(), is("blue"));

	    colorDropdown.selectByIndex(2);
	    assertThat(colorDropdown.getSelectedValue(), is("green"));

	}
	...
}
```

### Determinando el foco

Puedes determinar si un campo dado tiene el foco de la siguiente manera:

```java
firstName.hasFocus()
```

También puedes esperar a que los elementos aparezcan, desaparezcan, o se habiliten o deshabiliten:

```java
button.waitUntilEnabled()
button.waitUntilDisabled()
```

o

```java
field.waitUntilVisible()
button.waitUntilNotVisible()
```

### Usando selectores XPath y CSS directos

Otra forma de acceder a un elemento web es usar una expresión XPath o CSS. Puedes usar el método `$()` con una expresión XPath para hacer esto más simplemente. Por ejemplo, imagina que tu aplicación web necesita hacer clic en un elemento de lista que contiene un código postal dado. Una forma sería como se muestra aquí:

```java
WebElement selectedSuburb = getDriver().findElement(By.xpath("//li/a[contains(.,'" ` postcode ` "')]"));
selectedSuburb.click();
```

Sin embargo, una opción más simple sería hacer esto:

```java
$("//li/a[contains(.,'" ` postcode ` "')]").click();
```

## Trabajando con Páginas Asíncronas

Las páginas asíncronas son aquellas cuyos campos o datos no se muestran todos cuando la página se carga. A veces, necesitas esperar a que ciertos elementos aparezcan, o desaparezcan, antes de poder continuar con tus pruebas. Serenity proporciona algunos métodos útiles en la clase base PageObject para ayudar con estos escenarios. Están principalmente diseñados para usarse como parte de tus métodos de negocio en tus Page Object, aunque en los ejemplos los mostraremos usados como llamadas externas a una instancia de PageObject para mayor claridad.

### Verificando si un elemento es visible

En términos de WebDriver, hay una distinción entre cuando un elemento está presente en la pantalla (es decir, en el código fuente HTML), y cuando está renderizado (es decir, visible para el usuario). También puedes necesitar verificar si un elemento es visible en la pantalla. Puedes hacer esto de dos maneras. Tu primera opción es usar el método isElementVisible, que devuelve un valor booleano basado en si el elemento está renderizado (visible para el usuario) o no:

```java
isElementVisible(By.xpath("//h2[.='A visible title']"))
```

Tu segunda opción es afirmar activamente que el elemento debe ser visible:

```java
shouldBeVisible(By.xpath("//h2[.='An invisible title']"));
```

Si el elemento no aparece inmediatamente, puedes esperar a que aparezca:

```java
waitForRenderedElements(By.xpath("//h2[.='A title that is not immediately visible']"));
```

Una alternativa a la sintaxis anterior es usar el método más fluido `waitFor` que toma un selector css o xpath como argumento:

```java
waitFor("#popup"); //selector css

waitFor("//h2[.='A title that is not immediately visible']"); //selector xpath
```

Si solo quieres verificar si el elemento está presente aunque no necesariamente visible, puedes usar `waitForRenderedElementsToBePresent`:

```java
waitForRenderedElementsToBePresent(By.xpath("//h2[.='A title that is not immediately visible']"));
```

o su versión más expresiva, `waitForPresenceOf` que toma un selector css o xpath como argumento.

```java
waitForPresenceOf("#popup"); //css

waitForPresenceOf("//h2[.='A title that is not immediately visible']"); //xpath
```

También puedes esperar a que un elemento desaparezca usando `waitForRenderedElementsToDisappear` o `waitForAbsenceOf`:

```java
waitForRenderedElementsToDisappear(By.xpath("//h2[.='A title that will soon disappear']"));

waitForAbsenceOf("#popup");

waitForAbsenceOf("//h2[.='A title that will soon disappear']");
```

Para simplificar, también puedes usar los métodos `waitForTextToAppear` y `waitForTextToDisappear`:

```java
waitForTextToDisappear("A visible bit of text");
```

Si varios textos posibles pueden aparecer, puedes usar `waitForAnyTextToAppear` o `waitForAllTextToAppear+:

```java
waitForAnyTextToAppear("this might appear","or this", "or even this");
```

Si necesitas esperar a que aparezca uno de varios elementos posibles, también puedes usar el método `waitForAnyRenderedElementOf`:

```java
waitForAnyRenderedElementOf(By.id("color"), By.id("taste"), By.id("sound"));
```

### Trabajando con elementos Shadow DOM

Selenium 4 introdujo soporte para elementos Shadow DOM, y Serenity BDD añade soporte mejorado para estos elementos. Supongamos que tenemos la siguiente estructura HTML que contiene elementos shadow DOM.

```html
<pre>
    <div id="shadow-host">
      #shadow-root
      <input id="shadowedInput"/>

      <div id="nested-shadow-host">
          #shadow-root
          <input id="nestedShadowedInput"/>
      </div>
    </div>
```

Para encontrar el primer elemento input dentro de un shadow DOM de un solo nivel, necesitas proporcionar el localizador para el elemento anidado y el localizador para el elemento host del shadow:

```java
 ByShadow.cssSelector("#shadowedInput","#shadow-host")
```

Para encontrar el elemento input dentro del shadow DOM anidado, necesitas proporcionar el localizador para el elemento sombreado, así como la lista de localizadores de shadow dom padre, de arriba hacia abajo:

```java
ByShadow.cssSelector("#nestedShadowedInput","#shadow-host", "#nested-shadow-host")
```

## Trabajando con timeouts

Las aplicaciones web modernas basadas en AJAX añaden una gran cantidad de complejidad a las pruebas web. El problema básico es que, cuando accedes a un elemento web en una página, puede que aún no esté disponible. Así que necesitas esperar un poco. De hecho, muchas pruebas contienen pausas codificadas de forma fija dispersas por el código para manejar este tipo de cosas.

Pero las esperas codificadas de forma fija son malas. Ralentizan tu suite de pruebas, y las hacen fallar aleatoriamente si no son lo suficientemente largas. En cambio, necesitas esperar por un estado o evento particular. Selenium proporciona un gran soporte para esto, y Serenity construye sobre este soporte para hacerlo más fácil de usar.

### Esperas Implícitas

La primera forma en que puedes gestionar cómo WebDriver maneja campos tardíos es usar la propiedad `webdriver.timeouts.implicitlywait`. Esto determina cuánto tiempo, en milisegundos, WebDriver esperará si un elemento al que intenta acceder no está presente en la página. Para citar la documentación de WebDriver:

"Una espera implícita es decirle a WebDriver que sondee el DOM durante cierto tiempo cuando intente encontrar un elemento o elementos si no están inmediatamente disponibles."

El valor por defecto en Serenity para esta propiedad es actualmente 2 segundos. Esto es diferente del WebDriver estándar, donde el valor por defecto es cero.

Veamos un ejemplo. Supongamos que tenemos un PageObject con un campo definido así:

```java
@FindBy(id="slow-loader")
public WebElementFacade slowLoadingField;
```

Este campo tarda un poco en cargarse, así que no estará listo inmediatamente en la página.

Ahora supongamos que establecemos el valor de `webdriver.timeouts.implicitlywait` a 5000, y que nuestra prueba usa el slowLoadingField:

```java
boolean loadingFinished = slowLoadingField.isDisplayed()
```

Cuando accedemos a este campo, pueden ocurrir dos cosas. Si el campo tarda menos de 5 segundos en cargarse, todo estará bien. Pero si tarda más de 5 segundos, se lanzará una NoSuchElementException (o algo similar).

Ten en cuenta que este timeout también se aplica a las listas. Supongamos que hemos definido un campo así, que tarda algo de tiempo en cargarse dinámicamente:

```java
@FindBy(css="#elements option")
public List<WebElementFacade> elementItems;
```

Ahora supongamos que contamos los valores del elemento así:

```java
int itemCount = elementItems.size()
```

El número de elementos devueltos dependerá del valor de espera implícita. Si establecemos el valor de `webdriver.timeouts.implicitlywait` a un valor muy pequeño, WebDriver puede cargar solo algunos de los valores. Pero si le damos a la lista suficiente tiempo para cargarse completamente, obtendremos la lista completa.

El valor de espera implícita se establece globalmente para cada instancia de WebDriver, pero puedes sobrescribir el valor tú mismo. La forma más simple de hacer esto desde dentro de un PageObject de Serenity es usar el método setImplicitTimeout():

```java
setImplicitTimeout(5, SECONDS)
```

Pero recuerda que esta es una configuración global, así que también afectará a otros Page Object. Así que una vez que hayas terminado, siempre debes restablecer el timeout implícito a su valor anterior. Serenity te da un método práctico para hacer esto:

```java
resetImplicitTimeout()
```

Consulta http://docs.seleniumhq.org/docs/04_webdriver_advanced.jsp#implicit-waits[Documentación de Selenium] para más detalles sobre cómo funcionan las esperas implícitas de WebDriver.

### Usando fábricas de localizadores personalizadas

Internamente, Selenium usa el concepto de Fábricas de Localizadores (Locator Factories).
Normalmente, Serenity usa `SmartElementLocatorFactory`, una extensión del `AjaxElementLocatorFactory` de WebDriver, cuando instancia Page Object. Entre otras cosas, esto ayuda a asegurar que los elementos web estén disponibles y utilizables antes de usarlos, permite timeouts por campo, y evita esperas innecesarias largas en elementos web después de que un paso ha fallado.

El `SmartElementLocatorFactory` usa la espera implícita por defecto, o el atributo `timeoutInSeconds` de la anotación `@FindBy` si este valor se ha especificado (ver abajo), o el valor de espera implícita por defecto especificado por la propiedad `webdriver.timeouts.implicitlywait`.

En casos raros, puedes necesitar personalizar este comportamiento. Para hacer esto, puedes usar la propiedad `serenity.locator.factory` para usar una de las siguientes fábricas de localizadores alternativas:

- `AjaxElementLocatorFactory`: Una fábrica de localizadores de WebDriver más adecuada para aplicaciones Ajax. Según la documentación de WebDriver, esta fábrica de localizadores devolverá _un localizador de elementos que esperará el número especificado de segundos para que un elemento aparezca, en lugar de fallar instantáneamente si no está presente. Esto funciona sondeando la UI de forma regular. El elemento devuelto estará presente en el DOM, pero puede que no sea realmente visible._

- `DefaultElementLocatorFactory`: la fábrica de localizadores por defecto de WebDriver

Si usas `AjaxElementLocatorFactory`, puedes usar el parámetro `webdriver.timeouts.implicitlywait` para especificar el número de segundos a esperar. Si no se especifica ningún valor, la espera por defecto será de 5 segundos.

### Timeouts Explícitos

También puedes esperar programáticamente hasta que un elemento esté en un estado particular. Esto es más flexible y útil cuando necesitas esperar tiempo extra en una situación específica. Por ejemplo, podríamos esperar hasta que un campo se vuelva visible:

```java
slowLoadingField.waitUntilVisible()
```

También puedes esperar condiciones más arbitrarias, por ejemplo:

```java
waitFor(ExpectedConditions.alertIsPresent())
```

El tiempo por defecto que Serenity esperará está determinado por la propiedad `webdriver.wait.for.timeout`. El valor por defecto para esta propiedad es 5 segundos.

A veces quieres darle a WebDriver más tiempo para una operación específica. Desde dentro de un PageObject, puedes sobrescribir o extender el timeout explícito usando el método withTimeoutOf(). Por ejemplo, podrías esperar a que la lista #elements se cargue hasta 5 segundos así:

```java
withTimeoutOf(5, SECONDS).waitForPresenceOf(By.cssSelector("#elements option"))
```

También puedes especificar el timeout para un campo. Por ejemplo, si quisieras esperar hasta 5 segundos para que un botón se vuelva clicable antes de hacer clic en él, podrías hacer lo siguiente:

```java
someButton.withTimeoutOf(5, SECONDS).waitUntilClickable().click()
```

También puedes usar este enfoque para recuperar elementos:

```java
elements = withTimeoutOf(5, SECONDS).findAll("#elements option")
```

Finalmente, si un elemento específico en un PageObject necesita tener un poco más de tiempo para cargarse, puedes usar el atributo timeoutInSeconds en la anotación @FindBy de Serenity, por ejemplo:

```java
import net.serenitybdd.core.annotations.findby.FindBy;
...
@FindBy(name = "country", timeoutInSeconds="10")
public WebElementFacade country;
```

También puedes esperar a que un elemento esté en un estado particular, y luego realizar una acción en el elemento. Aquí esperamos a que un elemento sea clicable antes de hacer clic en el elemento:

```java
addToCartButton.withTimeoutOf(5, SECONDS).waitUntilClickable().click()
```

O puedes esperar directamente en un elemento web:

```java
@FindBy(id="share1-fb-like")
WebElementFacade facebookIcon;
  ...
public WebElementState facebookIcon() {
    return withTimeoutOf(5, TimeUnit.SECONDS).waitFor(facebookIcon);
}
```

O incluso:

```java
List<WebElementFacade> currencies = withTimeoutOf(5, TimeUnit.SECONDS)
                              .waitFor(currencyTab)
                              .thenFindAll(".currency-code");
```

## Ejecutando Javascript

Hay momentos en que puede resultarte útil ejecutar un poco de Javascript directamente dentro del navegador para hacer el trabajo. Puedes usar el método `evaluateJavascript()` de la clase `PageObject` para hacer esto. Por ejemplo, podrías necesitar evaluar una expresión y usar el resultado en tus pruebas. El siguiente comando evaluará el título del documento y lo devolverá al código Java que lo llama:

```java
String result = (String) evaluateJavascript("return document.title");
```

Alternativamente, podrías simplemente querer ejecutar un comando Javascript localmente en el navegador. En el siguiente código, por ejemplo, establecemos el foco en el campo de entrada 'firstname':

```java
	evaluateJavascript("document.getElementById('firstname').focus()");
```

Y, si estás familiarizado con JQuery, también puedes invocar expresiones JQuery:

```java
	evaluateJavascript("$('#firstname').focus()");
```

Esta es a menudo una estrategia útil si necesitas disparar eventos como mouse-overs que no están actualmente soportados por la API de WebDriver.

## Subiendo archivos

Subir archivos es fácil. Los archivos a subir pueden colocarse en una ubicación codificada de forma fija (malo) o almacenarse en el classpath (mejor). Aquí tienes un ejemplo simple:

```java
public class NewCompanyPage extends PageObject {
    ...
    @FindBy(id="object_logo")
    WebElementFacade logoField;

    public NewCompanyPage(WebDriver driver) {
        super(driver);
    }

    public void loadLogoFrom(String filename) {
        upload(filename).to(logoField);
    }
}
```

## Usando expresiones Fluent Matcher

Cuando escribes pruebas de aceptación, a menudo te encuentras expresando expectativas sobre objetos de dominio individuales o colecciones de objetos de dominio. Por ejemplo, si estás probando una función de búsqueda con múltiples criterios, querrás saber que la aplicación encuentra los registros que esperabas. Podrías ser capaz de hacer esto de una manera muy precisa (por ejemplo, sabiendo exactamente qué valores de campo esperas), o podrías querer hacer tus pruebas más flexibles expresando los rangos de valores que serían aceptables. Serenity proporciona algunas características que facilitan escribir pruebas de aceptación para este tipo de casos.

En el resto de esta sección, estudiaremos algunos ejemplos basados en pruebas para el sitio de búsqueda Maven Central. Este sitio te permite buscar el repositorio Maven para artefactos Maven, y ver los detalles de un artefacto particular.

Usaremos algunas pruebas de regresión imaginarias para este sitio para ilustrar cómo los matchers de Serenity pueden usarse para escribir pruebas más expresivas. El primer escenario que consideraremos es simplemente buscar un artefacto por nombre, y asegurarnos de que solo los artefactos que coinciden con este nombre aparezcan en la lista de resultados. Podríamos expresar estos criterios de aceptación informalmente de la siguiente manera:

- Dado que el desarrollador está en la página de búsqueda,
- Y el desarrollador busca artefactos llamados 'Serenity'
- Entonces el desarrollador debería ver al menos 16 artefactos de Serenity, cada uno con un Id de artefacto único

En JUnit 5, una prueba de Serenity para este escenario podría verse así:

```java
...
import static net.thucydides.core.matchers.BeanMatchers.the_count;
import static net.thucydides.core.matchers.BeanMatchers.each;
import static net.thucydides.core.matchers.BeanMatchers.the;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.startsWith;

@ExtendWith(SerenityJUnit5Extension.class)
class WhenSearchingForArtifacts {

    @Managed
    WebDriver driver;

    @Steps
    DeveloperSteps developer;

    @Test
    void should_find_the_right_number_of_artifacts() {
        developer.opens_the_search_page();
        developer.searches_for("Serenity");
        developer.should_see_artifacts_where(the("GroupId", startsWith("net.thucydides")),
                                             each("ArtifactId").isDifferent(),
                                             the_count(is(greaterThanOrEqualTo(16))));

    }
}
```

:::note JUnit 4 Obsoleto
Si aún estás usando JUnit 4 con `@RunWith(SerenityRunner.class)`, ten en cuenta que el soporte de JUnit 4 está obsoleto a partir de Serenity 5.0.0 y será eliminado en Serenity 6.0.0. Por favor migra a JUnit 5 usando `@ExtendWith(SerenityJUnit5Extension.class)`.
:::

Veamos cómo se implementa la prueba en esta clase. La prueba `should_find_the_right_number_of_artifacts()` podría expresarse como sigue:

. Cuando abrimos la página de búsqueda

. Y buscamos artefactos que contengan la palabra 'Serenity'

. Entonces deberíamos ver una lista de artefactos donde cada Group ID comienza con "net.Serenity", cada Artifact ID es único, y que hay al menos 16 entradas mostradas.

La implementación de estos pasos se ilustra aquí:

```java
...
import static net.thucydides.core.matchers.BeanMatcherAsserts.shouldMatch;

public class DeveloperSteps {

    @Step
    public void opens_the_search_page() {
        onSearchPage().open();
    }

    @Step
    public void searches_for(String search_terms) {
        onSearchPage().enter_search_terms(search_terms);
        onSearchPage().starts_search();
    }

    @Step
    public void should_see_artifacts_where(BeanMatcher... matchers) {
        shouldMatch(onSearchResultsPage().getSearchResults(), matchers);
    }

    private SearchPage onSearchPage() {
        return getPages().get(SearchPage.class);
    }

    private SearchResultsPage onSearchResultsPage() {
        return getPages().get(SearchResultsPage.class);
    }
}
```

Los dos primeros pasos se implementan con métodos relativamente simples. Sin embargo, el tercer paso es más interesante. Veámoslo más de cerca:

```java
    @Step
    public void should_see_artifacts_where(BeanMatcher... matchers) {
        shouldMatch(onSearchResultsPage().getSearchResults(), matchers);
    }
```

Aquí, estamos pasando un número arbitrario de expresiones al método. Estas expresiones son en realidad 'matchers', instancias de la clase BeanMatcher. No es que normalmente tengas que preocuparte por ese nivel de detalle - creas estas expresiones matcher usando un conjunto de métodos estáticos proporcionados en la clase BeanMatchers. Así que típicamente pasarías expresiones bastante legibles como `the("GroupId", startsWith("net.Serenity"))` o `each("ArtifactId").isDifferent()+.

El método `shouldMatch()` de la clase BeanMatcherAsserts toma ya sea un solo objeto Java, o una colección de objetos Java, y verifica que al menos algunos de los objetos coincidan con las restricciones especificadas por los matchers. En el contexto de pruebas web, estos objetos son típicamente POJOs proporcionados por el Page Object para representar el objeto u objetos de dominio mostrados en una pantalla.

Hay varios tipos diferentes de expresiones matcher para elegir. El matcher más comúnmente usado simplemente verifica el valor de un campo en un objeto. Por ejemplo, supongamos que estás usando el objeto de dominio mostrado aquí:

```java
     public class Person {
        private final String firstName;
        private final String lastName;

        Person(String firstName, String lastName) {
            this.firstName = firstName;
            this.lastName = lastName;
        }

        public String getFirstName() {...}

        public String getLastName() {...}
    }
```

Podrías escribir una prueba para asegurar que una lista de Personas contiene al menos una persona llamada "Bill" usando el método estático "the", como se muestra aquí:

```java
    List<Person> persons = Arrays.asList(new Person("Bill", "Oddie"), new Person("Tim", "Brooke-Taylor"));

    shouldMatch(persons, the("firstName", is("Bill"))
```

El segundo parámetro en el método the() es un matcher de Hamcrest, que te da una gran flexibilidad con tus expresiones. Por ejemplo, también podrías escribir lo siguiente:

```java
    List<Person> persons = Arrays.asList(new Person("Bill", "Oddie"), new Person("Tim", "Brooke-Taylor"));

    shouldMatch(persons, the("firstName", is(not("Tim"))));
    shouldMatch(persons, the("firstName", startsWith("B")));
```

También puedes pasar múltiples condiciones:

```java
    List<Person> persons = Arrays.asList(new Person("Bill", "Oddie"), new Person("Tim", "Brooke-Taylor"));

    shouldMatch(persons, the("firstName", is("Bill"), the("lastName", is("Oddie"));
```

Serenity también proporciona la clase DateMatchers, que te permite aplicar matches de Hamcrest a Dates de Java estándar y DateTimes de `JodaTime`. Los siguientes ejemplos de código ilustran cómo podrían usarse:

```java
    DateTime january1st2010 = new DateTime(2010,01,01,12,0).toDate();
    DateTime may31st2010 = new DateTime(2010,05,31,12,0).toDate();

    the("purchaseDate", isBefore(january1st2010))
    the("purchaseDate", isAfter(january1st2010))
    the("purchaseDate", isSameAs(january1st2010))
    the("purchaseDate", isBetween(january1st2010, may31st2010))
```

A veces también necesitas verificar restricciones que se aplican a todos los elementos bajo consideración. La más simple de estas es verificar que todos los valores de campo para un campo particular son únicos. Puedes hacer esto usando el método `each()`:

```java
    shouldMatch(persons, each("lastName").isDifferent())
```

También puedes verificar que el número de elementos coincidentes corresponde a lo que esperas. Por ejemplo, para verificar que solo hay una persona llamada Bill, podrías hacer esto:

```java
     shouldMatch(persons, the("firstName", is("Bill"), the_count(is(1)));
```

También puedes verificar los valores máximo y mínimo usando los métodos max() y min(). Por ejemplo, si la clase Person tuviera un método `getAge()`, podríamos asegurar que cada persona es mayor de 21 y menor de 65 haciendo lo siguiente:

```java
     shouldMatch(persons, min("age", greaterThanOrEqualTo(21)),
                          max("age", lessThanOrEqualTo(65)));
```

Estos métodos funcionan con objetos Java normales, pero también con Maps. Así que el siguiente código también funcionará:

```java
    Map<String, String> person = new HashMap<String, String>();
    person.put("firstName", "Bill");
    person.put("lastName", "Oddie");

    List<Map<String,String>> persons = Arrays.asList(person);
    shouldMatch(persons, the("firstName", is("Bill"))
```

La otra cosa buena de este enfoque es que los matchers se integran bien con los reportes de Serenity. Así que cuando usas la clase BeanMatcher como parámetro en tus pasos de prueba, las condiciones expresadas en el paso se mostrarán en el reporte de prueba.

Hay dos patrones de uso comunes cuando se construyen Page Objects y pasos que usan este tipo de matcher. El primero es escribir un método del Page Object que devuelva la lista de objetos de dominio (por ejemplo, Personas) mostrados en la tabla. Por ejemplo, el método getSearchResults() usado en el paso should_see_artifacts_where() podría implementarse así:

```java
    public List<Artifact> getSearchResults() {
        List<WebElement> rows = resultTable.findElements(By.xpath(".//tr[td]"));
        List<Artifact> artifacts = new ArrayList<Artifact>();
        for (WebElement row : rows) {
            List<WebElement> cells = row.findElements(By.tagName("td"));
            artifacts.add(new Artifact(cells.get(0).getText(),
                                       cells.get(1).getText(),
                                       cells.get(2).getText()));

        }
        return artifacts;
    }
```

El segundo es acceder al contenido de la tabla HTML directamente, sin modelar explícitamente los datos contenidos en la tabla. Este enfoque es más rápido y más efectivo si no esperas reutilizar el objeto de dominio en otras páginas. Veremos cómo hacer esto a continuación.

### Trabajando con Tablas HTML

Dado que las tablas HTML todavía se usan ampliamente para representar conjuntos de datos en aplicaciones web, Serenity viene con la clase HtmlTable, que proporciona varios métodos útiles que facilitan escribir Page Objects que contienen tablas. Por ejemplo, el método rowsFrom devuelve el contenido de una tabla HTML como una lista de Maps, donde cada map contiene los valores de celda para una fila indexados por el encabezado correspondiente, como se muestra aquí:

```java
...
import static net.thucydides.core.pages.components.HtmlTable.rowsFrom;

public class SearchResultsPage extends PageObject {

    WebElement resultTable;

    public SearchResultsPage(WebDriver driver) {
        super(driver);
    }

    public List<Map<String, String>> getSearchResults() {
        return rowsFrom(resultTable);
    }

}
```

Esto ahorra mucho código - nuestro método `getSearchResults()` ahora se ve así:

```java
    public List<Map<String, String>> getSearchResults() {
        return rowsFrom(resultTable);
    }
```

Y dado que los matchers de Serenity funcionan tanto con objetos Java como con Maps, las expresiones matcher serán muy similares. La única diferencia es que los Maps devueltos están indexados por los valores de texto contenidos en los encabezados de la tabla, en lugar de por nombres de propiedades amigables con Java.

También puedes leer tablas sin encabezados (es decir, elementos `<th>`) especificando tus propios encabezados usando el método `withColumns`. Por ejemplo:

```java
    List<Map<Object, String>> tableRows =
                    HtmlTable.withColumns("First Name","Last Name", "Favorite Colour")
                             .readRowsFrom(page.table_with_no_headings);
```

También puedes usar la clase HtmlTable para seleccionar filas particulares dentro de una tabla para trabajar con ellas. Por ejemplo, otro escenario de prueba para la página de búsqueda de Maven implica hacer clic en un artefacto y mostrar los detalles de ese artefacto. La prueba para esto podría verse algo así:

```java
    @Test
    public void clicking_on_artifact_should_display_details_page() {
        developer.opens_the_search_page();
        developer.searches_for("Serenity");
        developer.open_artifact_where(the("ArtifactId", is("Serenity")),
                                      the("GroupId", is("net.Serenity")));

        developer.should_see_artifact_details_where(the("artifactId", is("Serenity")),
                                                    the("groupId", is("net.Serenity")));
    }
```

Ahora el método open_artifact_where() necesita hacer clic en una fila particular de la tabla. Este paso se ve así:

```java
    @Step
    public void open_artifact_where(BeanMatcher... matchers) {
        onSearchResultsPage().clickOnFirstRowMatching(matchers);
    }
```

Así que efectivamente estamos delegando al Page Object, que hace el trabajo real. El método correspondiente del Page Object se ve así:

```java
import static net.thucydides.core.pages.components.HtmlTable.filterRows;
...
    public void clickOnFirstRowMatching(BeanMatcher... matchers) {
        List<WebElement> matchingRows = filterRows(resultTable, matchers);
        WebElement targetRow = matchingRows.get(0);
        WebElement detailsLink = targetRow.findElement(By.xpath(".//a[contains(@href,'artifactdetails')]"));
        detailsLink.click();
    }
```

La parte interesante aquí es la primera línea del método, donde usamos el método filterRows(). Este método devolverá una lista de WebElements que coinciden con los matchers que has pasado. Este método hace bastante fácil seleccionar las filas en las que estás interesado para un tratamiento especial.

## Cambiando a otra página

Se proporciona un método, switchToPage() en la clase PageObject para facilitar devolver un nuevo PageObject después de la navegación desde dentro de un método de una clase PageObject. Por ejemplo,

```java
@DefaultUrl("http://mail.acme.com/login.html")
public class EmailLoginPage extends PageObject {

    ...
    public void forgotPassword() {
        ...
        forgotPassword.click();
        ForgotPasswordPage forgotPasswordPage = this.switchToPage(ForgotPasswordPage.class);
        forgotPasswordPage.open();
        ...
    }
    ...
}
```

## Estrategias de carga de colecciones de WebElement

Selenium te permite usar las anotaciones `@FindBy` y `@FindAll` para cargar colecciones de elementos web, como se ilustra aquí:

```java
@FindBy(css='#colors a')
List<WebElement> options
```

Si estás trabajando con una aplicación asíncrona, estas listas pueden tardar en cargarse, así que Selenium puede darte una lista vacía porque los elementos aún no se han cargado.

Serenity te permite ajustar este comportamiento de dos maneras. La primera es usar el DSL de espera para cargar los elementos directamente, por ejemplo:

```java
withTimeoutOf(5, SECONDS).waitForPresenceOf(By.cssSelector("#colors a"))
```

Alternativamente, puedes usar la propiedad `serenity.webdriver.collection_loading_strategy` para definir cómo Serenity carga colecciones de elementos web cuando se usan las anotaciones `@FindBy` y `@FindAll`. Hay tres opciones:

- Optimistic
- Pessimistic (por defecto)
- Paranoid

Optimistic solo esperará hasta que el campo esté definido. Este es el comportamiento nativo de Selenium.

Pessimistic esperará hasta que al menos el primer elemento se muestre. Este es actualmente el valor por defecto.

Paranoid esperará hasta que todos los elementos se muestren. Esto puede ser lento para listas largas.

## Trabajando con métodos de fixture

Cuando un paso de UI falla en una prueba de Serenity, la instancia de WebDriver se deshabilita para el resto de la prueba. Esto evita esperas innecesarias mientras la prueba pasa por los pasos subsiguientes (lo que necesita hacer para documentar los pasos de prueba). La excepción a esta regla es en el caso de métodos de fixture, como métodos anotados con la anotación `@AfterEach` en JUnit 5 (o `@After` en JUnit 4) o Cucumber.

En estos métodos, la instancia de WebDriver puede usarse normalmente. Además de las anotaciones conocidas de JUnit y Cucumber, cualquier anotación que comience con la palabra `After` será considerada un método de fixture.

Por ejemplo, supongamos que necesitas eliminar las cuentas de cliente a través de la UI al final de cada prueba. Ya tienes una biblioteca de pasos `AdminSteps` con un método `deleteAllCustomerAccounts()` que realiza esta tarea. Podrías asegurarte de que todas las cuentas de cliente se eliminen así:

```java
@Steps
AdminSteps asAdministrator;

...

@AfterEach
void deleteUserAccounts() {
    asAdministrator.deleteAllCustomerAccounts();
}
```

Esto facilita realizar operaciones de limpieza o desmontaje que usan la interfaz de usuario, potencialmente reutilizando pasos o Task que se usan en otras partes de las pruebas.

También puedes sobrescribir este comportamiento en cualquier momento llamando al método `reenableDrivers()`, como se muestra aquí:

```java
Serenity.webdriver().reenableDrivers();
```

## Extendiendo la Integración de Serenity con WebDriver

Serenity ofrece una forma simple de extender las capacidades por defecto de WebDriver y personalizar las actividades de creación y cierre del driver. Simplemente implementa las interfaces `BeforeAWebdriverScenario` y/o `AfterAWebDriverScenario` (ambas están en el paquete `net.serenitybdd.core.webdriver.enhancers`). Serenity ejecutará las clases `BeforeAWebdriverScenario` justo antes de crear una instancia de driver, permitiéndote añadir opciones personalizadas a las capacidades del driver. Cualquier `AfterAWebDriverScenario` se ejecuta al final de una prueba, justo antes de cerrar el driver.

### La interfaz BeforeAWebdriverScenario

La interfaz `BeforeAWebdriverScenario` se usa para mejorar el objeto `Capabilities` que se pasará a la instancia de WebDriver cuando se cree un nuevo driver. La llamada al método pasa el driver solicitado y el objeto `TestOutcome`, que contiene información sobre el nombre y las etiquetas usadas para esta prueba. También pasa las `EnvironmentVariables`, que te dan acceso a la configuración actual del entorno. Un ejemplo de una simple `BeforeAWebdriverScenario` se muestra a continuación:

```java
public class MyCapabilityEnhancer implements BeforeAWebdriverScenario {

    @Override
    public DesiredCapabilities apply(EnvironmentVariables environmentVariables,
                                     SupportedWebDriver driver,
                                     TestOutcome testOutcome,
                                     MutableCapabilities capabilities) {
        capabilities.setCapability("name", testOutcome.getStoryTitle() + " - " + testOutcome.getTitle());
        return capabilities;
    }
}
```

### La interfaz AfterAWebdriverScenario

La interfaz `AfterAWebdriverScenario` se llama al final de una prueba, justo antes de cerrar el driver, y una vez que el resultado de la prueba es conocido. El resultado de la prueba (y otros detalles) se pueden obtener del parámetro `TestOutcome`. Esto permite que se realicen cualquier manipulación o verificación final en el driver, antes del final de la prueba. El siguiente ejemplo verifica el resultado de la prueba que acaba de terminar, y añade una cookie con un valor dependiendo del resultado de la prueba:

```java
public class MyTestResultUpdater implements AfterAWebdriverScenario {
    void apply(EnvironmentVariables environmentVariables,
               TestOutcome testOutcome,
               WebDriver driver) {
       if ((driver == null) || (!RemoteDriver.isARemoteDriver(driver))) {
           return;
       }

       Cookie cookie = new Cookie("testPassed",
                                   testOutcome.isFailure() || testOutcome.isError() || testOutcome.isCompromised() ? "false" : "true");
       driver.manage().addCookie(cookie);
    }
}
```

### Driver Enhancers

Si necesitas realizar alguna acción en la instancia del driver antes de cada prueba, puedes implementar la clase `CustomDriverEnhancer`. Ten en cuenta que esto se llamará inmediatamente después de que el driver sea creado, y antes de que se abra ninguna página, así que el número de acciones es relativamente limitado.

### Configurando los paquetes de extensión

Lo último que necesitas hacer es decirle a Serenity qué paquete necesita buscar para tus clases de extensión. Añade el paquete, o un paquete padre a tu configuración de Serenity usando `serenity.extension.packages`.

`serenity.extension.packages=com.acme.myserenityextensions`

Puedes encontrar un ejemplo de cómo estas clases se implementan en un caso de uso del mundo real en el módulo [serenity-browserstack](https://github.com/serenity-bdd/serenity-core/tree/master/serenity-browserstack/src/main/java/net/serenitybdd/browserstack) en Github.

### Implementaciones personalizadas de WebDriver

Puedes añadir tu propio proveedor personalizado de WebDriver implementando la interfaz DriverSource. Primero, necesitas configurar las siguientes propiedades del sistema (por ejemplo, en tu archivo `serenity.properties`):

```
webdriver.driver = provided
webdriver.provided.type = mydriver
webdriver.provided.mydriver = com.acme.MyPhantomJSDriver
thucydides.driver.capabilities = mydriver
```

Tu driver personalizado debe implementar la interfaz DriverSource, como se muestra aquí:

```java
public class MyPhantomJSDriver implements DriverSource {

    @Override
    public WebDriver newDriver() {
        try {
            DesiredCapabilities capabilities = DesiredCapabilities.phantomjs();
            // Add
            return new PhantomJSDriver(ResolvingPhantomJSDriverService.createDefaultService(), capabilities);
        }
        catch (IOException e) {
            throw new Error(e);
        }
    }

	@Override
    public boolean takesScreenshots() {
        return true;
    }
}
```

Ten en cuenta que si usas drivers personalizados serás totalmente responsable de configurar e instanciar la instancia del navegador, y las opciones de configuración de Serenity relacionadas con el driver no se aplicarán. Generalmente recomendamos usar drivers personalizados solo para circunstancias muy excepcionales, y usar clases `BeforeAWebdriverScenario` para la mayoría de los requisitos de configuración personalizada.

## Usando la interfaz HasAuthentication

Selenium 4 soporta la interfaz `HasAuthentication`, que indica que un driver soporta autenticación en un sitio web de alguna manera. Los drivers de Serenity se integran perfectamente con la interfaz `HasAuthentication`, así que puedes usarla de la misma manera que lo harías en Selenium 4. Por ejemplo, para registrar un nombre de usuario y contraseña para usar en todas las páginas, podrías añadir el siguiente código antes de abrir un sitio:

```java
    getDriver().register(UsernameAndPassword.of("scott", "tiger")
```

Si la autenticación solo es requerida en ciertas páginas, también puedes usar un predicado:

```java
        Predicate<URI> onlyAuthenticateOnTheLoginPage = uri -> uri.getPath().endsWith("/login");
        getDriver().register(onlyAuthenticateOnTheLoginPage, UsernameAndPassword.of("scott", "tiger"));
```
