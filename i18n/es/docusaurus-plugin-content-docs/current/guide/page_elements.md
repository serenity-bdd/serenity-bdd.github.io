---
id: page_elements
title: Elementos de Página de Serenity
sidebar_position: 7
---

# Elementos de Página de Serenity

## Introduccion
En la mayoria de los frameworks de automatizacion de pruebas basados en Selenium, los selectores CSS o XPath se usan comúnmente para localizar elementos en una página.
Serenity BDD proporciona una forma más sencilla de interactuar con componentes de UI comunes, que puede evitar la necesidad de usar expresiones XPath o CSS.

Por ejemplo, el siguiente código HTML ilustra algunas formas diferentes de representar un botón:
```html
<button type="button" class="btn btn-primary">Login</button>
<input type="submit" value="Login">
```

En Serenity, podríamos interactuar con estos usando XPath o CSS, por ejemplo:
```java
$("css:input[value='Login']").click()
```
o
```java
$("xpath://button[.='Login']").click()
```

Sin embargo, si la implementación de la UI cambiara de una a otra, la prueba fallaría.

Los Elementos de Página de Serenity proporcionan una forma más intuitiva de identificar muchos elementos de UI comunes. Usando los Elementos de Página de Serenity, podemos usar una expresión más como esta:

```java
import net.serenitybdd.screenplay.ui.Button;
.
.
.
$(Button.withText("Login")).click();
```

O para una prueba de Screenplay, podrías hacer lo siguiente:

```java
actor.attemptsTo(
    Click.on(Button.withText("Login"))
);
```

Internamente, Serenity buscará elementos `<button>`, o elementos `<input>` de tipo `submit`, que muestren el texto "Login".

Otra estrategia de localización común es usar atributos como `id` o `name`, o atributos específicos para pruebas como `data-test`.

Supongamos que tenemos el siguiente código HTML:

```html
<button type="button" class="btn btn-primary" data-test="login-button">Login</button>
```

Podríamos hacer clic en este botón con el siguiente código:

```java
$(Button.withNameOrId("login-button")).click();
```

O en Screenplay, podríamos hacer lo siguiente:
```java
actor.attemptsTo(
    Click.on(Button.withNameOrId("login-button"))
);
```

En este caso, Serenity buscará elementos `<button>`, o elementos `<input>` de tipo `submit`, con un atributo _value_, _id_, _data-test_ o _aria-label_ de "login-button".

Esto significa que, en muchos casos, puedes usar la clase `Button` directamente en tu código, sin tener que inspeccionar primero la estructura de la página.

Los Elementos de Página de Serenity se encuentran en el módulo `serenity-screenplay-webdriver`, pero pueden usarse tanto en pruebas basadas en Screenplay como en Action Class.

Hay muchos tipos diferentes de elementos de página disponibles. Todos ellos tienen el método `withNameOrId()`, pero algunos tienen otros métodos para estrategias de localización más específicas, como `withLabel()` para checkboxes.

La siguiente tabla ofrece una visión general de los diferentes tipos de PageElement disponibles:

| Tipo de Elemento  | Ejemplo     |
| ---------------- | ----------- |
| Buttons          | Button.withText("A Button")             |
| Checkboxes       | Checkbox.withValue("Ferrari")          |
| Dropdowns        | Dropdown.withLabel("---Pick Your Car---")          |
| Images           | Image.withAltText("Girl in a jacket")          |
| Input Fields     | InputField.withPlaceholder("Enter the customer name")         |
| Link             | Link.withIcon("glyphicon-cloud")       |
| PageElement      | PageElement.locatedBy(".item").containingText("Item 1")      |
| RadioButton      | RadioButton.withNameOrId("red-button")      |


Veamos cada tipo de elemento de página con más detalle.

## Buttons

El elemento de página `Button` localiza un elemento `<button>` con un texto específico, o un elemento `<input>` de tipo `submit` con un valor específico.

Supongamos que tenemos el siguiente código HTML:
```
<button type="button">A Button</button>
<input type="submit" value="Submit Me!" name="submit-button" data-test="submit-the-button">
<input type="button" value="Press Here">
<button type="button"><i class="glyphicon glyphicon-home"></i>Home</button>
```


Podríamos usar las siguientes expresiones para identificar estos elementos:

| Estrategia    | Ejemplo     |
| ----------- | ----------- |
| Por texto     | Button.withText("A Button")             |
| Por valor    | Button.withText("Press Here")           |
| Por nombre     | Button.withNameOrId("submit-button")                           |
| Por atributo data-test     | Button.withNameOrId("submit-the-button")        |
| Por icono     | Button.withIcon("glyphicon-home")        |

:::tip
El método `withNameOrId()` coincidirá con el atributo `id`, `name`, `data-test` o `aria-label` para cualquier tipo de Page Element, así que no siempre lo repetiremos en las siguientes secciones.
:::

## Checkbox
Este elemento coincidirá con un elemento `<input>` de tipo "checkbox", con un valor específico de _value_,
_data-test_, o atributo _class_.

Supongamos que tenemos el siguiente HTML:
```html
<input type="checkbox" id="vehicle1" value="Bike" class="vehicule-option">
<label for="vehicle1"> I have a bike</label><br>
<input type="checkbox" id="vehicle2" value="Car" class="vehicule-option">
<label for="vehicle2"> I have a car</label><br>
<input type="checkbox" id="vehicle3" value="Boat" class="vehicule-option" checked>
<label for="vehicle3"> I have a boat</label><br>
```

Podríamos usar las siguientes expresiones para identificar estos elementos:

| Estrategia    | Ejemplo     |
| ----------- | ----------- |
| Por id       | Checkbox.withNameOrId("vehicle1")           |
| Por valor    | Checkbox.withValue("Bike")            |
| Por etiqueta    | Checkbox.withLabel("I have a bike")   |

## Dropdown

El elemento de página `Dropdown` nos permite trabajar con una lista desplegable `<select>`. Supongamos que tenemos el siguiente HTML:
```html
<label for="cars">Choose a car:</label>
<select name="cars" id="cars">
    <option value="">---Pick Your Car---</option>
    <option value="volvo">Volvo</option>
    <option value="saab">Saab</option>
    <option value="mercedes">Mercedes</option>
    <option value="audi">Audi</option>
</select>
```

Podríamos usar las siguientes expresiones para identificar estos elementos:

| Estrategia              | Ejemplo     |
| -----------           | ----------- |
| Por nombre o id         | Dropdown.withNameOrId("cars")           |
| Por etiqueta         | Dropdown.withLabel("Choose a car:")          |
| Por opción por defecto         | Dropdown.withLabel("---Pick Your Car---")          |

## Image

El elemento de página `Image` nos permite interactuar con elementos `<img>`. Por ejemplo, supongamos que tenemos el siguiente código HTML:

```html
<img src="img_girl.jpg" alt="Girl in a jacket" width="500" height="600">
```

Podríamos usar las siguientes expresiones para identificar estos elementos:

| Estrategia        | Ejemplo     |
| -----------     | ----------- |
| Por texto alt     | Image.withAltText("Girl in a jacket")           |
| Por src          | Image.withSrc("img_girl.jpg")             |
| Por src (que comienza con) | Image.withSrcStartingWith("img_")             |
| Por src (que termina con) | Image.withSrcEndingWith("girl.jpg")             |


## InputField

El elemento de página `InputField` representa un elemento `<input>` en un formulario, con o sin un `<label>`. Por ejemplo, supongamos que tenemos el siguiente código HTML:

```html
<label for="customer_name">Customer Name</label>
<input type="text" id="customer_name" name="customername" placeholder="Enter the customer name" />
```

Podríamos usar las siguientes expresiones para identificar estos elementos:

| Estrategia        | Ejemplo     |
| -----------     | ----------- |
| Por nombre         | InputField.withNameOrId("customername")           |
| Por id           | InputField.withNameOrId("customer_name")           |
| Por placeholder  | InputField.withPlaceholder("Enter the customer name")              |
| Por etiqueta        | InputField.withLabel("Customer Name")   |

## Link

El elemento de página `Link` interactúa con elementos HTML `<a>`. Por ejemplo, supongamos que tenemos el siguiente código HTML:

```html
<!-- Un enlace simple --->
<a href="...">Link 1</a><br/>
<!-- Un enlace con título -->
<a href="..." title="Link Number 2">Link 2</a><br/>
<!-- Un enlace con un icono y un texto-->
<a href="#" onclick="update('Link 3')"><i class="glyphicon glyphicon-cloud"></i>Link 3</a><br/>
```

Podríamos usar las siguientes expresiones para identificar estos elementos:

| Estrategia              | Ejemplo     |
| -----------           | ----------- |
| Por texto del enlace          | Link.withText("Link 1")           |
| Por título del enlace         | Link.withTitle("Link Number 2")          |
| Por texto parcial del enlace  | Link.containing("ink")              |
| Por texto inicial      | Link.startingWith("Link")    |
| Por icono               | Link.withIcon("glyphicon-cloud")    |


## PageElement

El elemento de página `PageElement` representa cualquier elemento en una página. Por ejemplo, supongamos que tenemos el siguiente código HTML:

```html
<div id="container" data-test="the-container" class="a-container">
    <div class="item">
        <h2>Item 1 heading</h2>
        <div>
            <span class="description">Item 1 description</span>
        </div>
    </div>
    <div class="item">
        <h2>Item 2 heading</h2>
        <div>
            <span class="description">Item 2 description</span>
        </div>
    </div>
</div>
```

Podríamos usar las siguientes expresiones para identificar elementos en este código:

| Estrategia                    | Ejemplo     |
| -----------                 | ----------- |
| Por id                       | PageElement.withNameOrId("container")           |
| Por valor data-test          | PageElement.withNameOrId("the-container")           |
| Que contiene un valor de texto           | PageElement.withNameOrId("item").containingText("Item 1")         |
| Que contiene un valor de texto (con un localizador CSS)          | PageElement.locatedBy(".item").containingText("Item 1")         |

## RadioButton

El elemento de página `RadioButton` representa un conjunto de botones de radio. Por ejemplo, supongamos que tenemos el siguiente código HTML:


```html
<input type="radio" id="html" name="fav_language" value="HTML" class="html-radio">
<label for="html">Choose HTML</label><br>
<input type="radio" id="css" name="fav_language" value="CSS">
<label for="css">Choose CSS</label><br>
<input type="radio" id="javascript" name="fav_language" value="JavaScript">
<label for="javascript">Choose JavaScript</label><br><br>
```

Podríamos usar las siguientes expresiones para identificar estos elementos:

| Estrategia              | Ejemplo     |
| -----------           | ----------- |
| Por id          | RadioButton.withNameOrId("html")           |
| Por etiqueta         | RadioButton.withLabel("Choose CSS")         |
| Por valor  |RadioButton.withValue("JavaScript")            |


# Usando Elementos de Página en Action Class

También puedes usar Elementos de Página en tus pruebas normales (no Screenplay), simplemente usando la expresión del Page Element como un localizador. Por ejemplo:

```java
public class LoginActions extends UIInteractionSteps {

    @Step("Login as a standard user")
    public void asAStandardUser() {
        $(InputField.withPlaceholder("Username")).type("standard_user");
        $(InputField.withPlaceholder("Password")).type("secret_sauce");
        $(Button.withText("Login")).click();
    }
}
```

Los Elementos de Página pueden usarse con todos los métodos habituales para localizar elementos en una clase de UI Interaction, incluyendo:

| Método              | Ejemplo     |
| -----------         | ----------- |
| $                   | $(Button.withText("Login")).click();          |
| find                | find(Button.withText("Login")).click();       |
| $$                  | $$(Checkbox.withNameOrId("vehicle-option")).forEach(WebElementFacade::click);       |
| findAll             | findAll(Checkbox.withNameOrId("vehicle-option")).forEach(WebElementFacade::click);       |
