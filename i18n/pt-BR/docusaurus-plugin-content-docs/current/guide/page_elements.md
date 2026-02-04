---
id: page_elements
title: Elementos de Página do Serenity
sidebar_position: 7
---

# Elementos de Página do Serenity

## Introdução
Na maioria dos frameworks de automação de testes baseados em Selenium, seletores CSS ou XPath são comumente usados para localizar elementos em uma página.
O Serenity BDD fornece uma maneira mais simples de interagir com componentes de UI comuns, que pode evitar a necessidade de usar expressões XPath ou CSS.

Por exemplo, o seguinte código HTML ilustra algumas maneiras diferentes de representar um botão:
```html
<button type="button" class="btn btn-primary">Login</button>
<input type="submit" value="Login">
```

No Serenity, poderíamos interagir com estes usando XPath ou CSS, por exemplo:
```java
$("css:input[value='Login']").click()
```
ou
```java
$("xpath://button[.='Login']").click()
```

No entanto, se a implementação da UI mudasse de uma para outra, o teste quebraria.

Os Elementos de Página do Serenity fornecem uma maneira mais intuitiva de identificar muitos elementos de UI comuns. Usando Elementos de Página do Serenity, podemos usar uma expressão mais como esta:

```java
import net.serenitybdd.screenplay.ui.Button;
.
.
.
$(Button.withText("Login")).click();
```

Ou para um teste Screenplay, você poderia fazer o seguinte:

```java
actor.attemptsTo(
    Click.on(Button.withText("Login"))
);
```

Por baixo dos panos, o Serenity procurará por elementos `<button>`, ou elementos `<input>` do tipo `submit`, que exibem o texto "Login".

Outra estratégia de localização comum é usar atributos como `id` ou `name`, ou atributos específicos de teste como `data-test`.

Suponha que temos o seguinte código HTML:

```html
<button type="button" class="btn btn-primary" data-test="login-button">Login</button>
```

Poderíamos clicar neste botão com o seguinte código:

```java
$(Button.withNameOrId("login-button")).click();
```

Ou no Screenplay, poderíamos fazer o seguinte:
```java
actor.attemptsTo(
    Click.on(Button.withNameOrId("login-button"))
);
```

Neste caso, o Serenity procurará por elementos `<button>`, ou elementos `<input>` do tipo `submit`, com um atributo _value_, _id_, _data-test_ ou _aria-label_ de "login-button".

Isso significa que, em muitos casos, você pode usar a classe `Button` diretamente no seu código, sem precisar inspecionar a estrutura da página primeiro.

Os Elementos de Página do Serenity são encontrados no módulo `serenity-screenplay-webdriver`, mas podem ser usados tanto em testes Screenplay quanto em testes baseados em Action Class.

Existem muitos tipos diferentes de elementos de página disponíveis. Todos eles têm o método `withNameOrId()`, mas alguns têm outros métodos para estratégias de localização mais específicas, como `withLabel()` para checkboxes.

A tabela a seguir fornece uma visão geral dos diferentes tipos de PageElement disponíveis:

| Tipo de Elemento | Exemplo     |
| ---------------- | ----------- |
| Buttons          | Button.withText("A Button")             |
| Checkboxes       | Checkbox.withValue("Ferrari")          |
| Dropdowns        | Dropdown.withLabel("---Pick Your Car---")          |
| Images           | Image.withAltText("Girl in a jacket")          |
| Input Fields     | InputField.withPlaceholder("Enter the customer name")         |
| Link             | Link.withIcon("glyphicon-cloud")       |
| PageElement      | PageElement.locatedBy(".item").containingText("Item 1")      |
| RadioButton      | RadioButton.withNameOrId("red-button")      |


Vamos analisar cada tipo de elemento de página em mais detalhes.

## Buttons

O elemento de página `Button` localiza um elemento `<button>` com um texto específico, ou um elemento `<input>` do tipo `submit` com um valor específico.

Suponha que temos o seguinte código HTML:
```
<button type="button">A Button</button>
<input type="submit" value="Submit Me!" name="submit-button" data-test="submit-the-button">
<input type="button" value="Press Here">
<button type="button"><i class="glyphicon glyphicon-home"></i>Home</button>
```


Poderíamos usar as seguintes expressões para identificar estes elementos:

| Estratégia    | Exemplo     |
| ----------- | ----------- |
| Por texto     | Button.withText("A Button")             |
| Por valor    | Button.withText("Press Here")           |
| Por nome     | Button.withNameOrId("submit-button")                           |
| Por atributo data-test     | Button.withNameOrId("submit-the-button")        |
| Por ícone     | Button.withIcon("glyphicon-home")        |

:::tip
O método `withNameOrId()` corresponderá ao atributo `id`, `name`, `data-test` ou `aria-label` para qualquer tipo de Elemento de Página, então não vamos repeti-los em todos os lugares nas seções seguintes.
:::

## Checkbox
Este elemento corresponderá a um elemento `<input>` do tipo "checkbox", com um valor especificado de _value_,
_data-test_ ou atributo _class_.

Suponha que temos o seguinte HTML:
```html
<input type="checkbox" id="vehicle1" value="Bike" class="vehicule-option">
<label for="vehicle1"> I have a bike</label><br>
<input type="checkbox" id="vehicle2" value="Car" class="vehicule-option">
<label for="vehicle2"> I have a car</label><br>
<input type="checkbox" id="vehicle3" value="Boat" class="vehicule-option" checked>
<label for="vehicle3"> I have a boat</label><br>
```

Poderíamos usar as seguintes expressões para identificar estes elementos:

| Estratégia    | Exemplo     |
| ----------- | ----------- |
| Por id       | Checkbox.withNameOrId("vehicle1")           |
| Por valor    | Checkbox.withValue("Bike")            |
| Por label    | Checkbox.withLabel("I have a bike")   |

## Dropdown

O elemento de página `Dropdown` permite trabalhar com uma lista dropdown `<select>`. Suponha que tivéssemos o seguinte HTML:
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

Poderíamos usar as seguintes expressões para identificar estes elementos:

| Estratégia              | Exemplo     |
| -----------           | ----------- |
| Por nome ou id         | Dropdown.withNameOrId("cars")           |
| Por label         | Dropdown.withLabel("Choose a car:")          |
| Por opção padrão         | Dropdown.withLabel("---Pick Your Car---")          |

## Image

O elemento de página `Image` permite interagir com elementos `<img>`. Por exemplo, suponha que tivéssemos o seguinte código HTML:

```html
<img src="img_girl.jpg" alt="Girl in a jacket" width="500" height="600">
```

Poderíamos usar as seguintes expressões para identificar estes elementos:

| Estratégia        | Exemplo     |
| -----------     | ----------- |
| Por texto alt     | Image.withAltText("Girl in a jacket")           |
| Por src          | Image.withSrc("img_girl.jpg")             |
| Por src (começando com) | Image.withSrcStartingWith("img_")             |
| Por src (terminando com) | Image.withSrcEndingWith("girl.jpg")             |


## InputField

O elemento de página `InputField` representa um elemento `<input>` em um formulário, com ou sem um `<label>`. Por exemplo, suponha que tivéssemos o seguinte código HTML:

```html
<label for="customer_name">Customer Name</label>
<input type="text" id="customer_name" name="customername" placeholder="Enter the customer name" />
```

Poderíamos usar as seguintes expressões para identificar estes elementos:

| Estratégia        | Exemplo     |
| -----------     | ----------- |
| Por nome         | InputField.withNameOrId("customername")           |
| Por id           | InputField.withNameOrId("customer_name")           |
| Por placeholder  | InputField.withPlaceholder("Enter the customer name")              |
| Por label        | InputField.withLabel("Customer Name")   |

## Link

O elemento de página `Link` interage com elementos HTML `<a>`. Por exemplo, suponha que temos o seguinte código HTML:

```html
<!-- Um link simples --->
<a href="...">Link 1</a><br/>
<!-- Um link com um título -->
<a href="..." title="Link Number 2">Link 2</a><br/>
<!-- Um link com um ícone e um texto-->
<a href="#" onclick="update('Link 3')"><i class="glyphicon glyphicon-cloud"></i>Link 3</a><br/>
```

Poderíamos usar as seguintes expressões para identificar estes elementos:

| Estratégia              | Exemplo     |
| -----------           | ----------- |
| Por texto do link          | Link.withText("Link 1")           |
| Por título do link         | Link.withTitle("Link Number 2")          |
| Por texto parcial do link  | Link.containing("ink")              |
| Por texto inicial      | Link.startingWith("Link")    |
| Por ícone               | Link.withIcon("glyphicon-cloud")    |


## PageElement

O elemento de página `PageElement` representa qualquer elemento em uma página. Por exemplo, suponha que temos o seguinte código HTML:

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

Poderíamos usar as seguintes expressões para identificar elementos neste código:

| Estratégia                    | Exemplo     |
| -----------                 | ----------- |
| Por id                       | PageElement.withNameOrId("container")           |
| Por valor data-test          | PageElement.withNameOrId("the-container")           |
| Contendo um valor de texto           | PageElement.withNameOrId("item").containingText("Item 1")         |
| Contendo um valor de texto (com um localizador CSS)          | PageElement.locatedBy(".item").containingText("Item 1")         |

## RadioButton

O elemento de página `RadioButton` representa um conjunto de botões de rádio. Por exemplo, suponha que temos o seguinte código HTML:


```html
<input type="radio" id="html" name="fav_language" value="HTML" class="html-radio">
<label for="html">Choose HTML</label><br>
<input type="radio" id="css" name="fav_language" value="CSS">
<label for="css">Choose CSS</label><br>
<input type="radio" id="javascript" name="fav_language" value="JavaScript">
<label for="javascript">Choose JavaScript</label><br><br>
```

Poderíamos usar as seguintes expressões para identificar estes elementos:

| Estratégia              | Exemplo     |
| -----------           | ----------- |
| Por id          | RadioButton.withNameOrId("html")           |
| Por label         | RadioButton.withLabel("Choose CSS")         |
| Por valor  |RadioButton.withValue("JavaScript")            |


# Usando Elementos de Página em Action Class

Você também pode usar Elementos de Página em seus testes normais (não-Screenplay), simplesmente usando a expressão do Elemento de Página como um localizador. Por exemplo:

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

Elementos de Página podem ser usados com todos os métodos usuais para localizar elementos em uma classe UI Interaction, incluindo:

| Método              | Exemplo     |
| -----------         | ----------- |
| $                   | $(Button.withText("Login")).click();          |
| find                | find(Button.withText("Login")).click();       |
| $$                  | $$(Checkbox.withNameOrId("vehicle-option")).forEach(WebElementFacade::click);       |
| findAll             | findAll(Checkbox.withNameOrId("vehicle-option")).forEach(WebElementFacade::click);       |
