---
id: screenplay_webdriver
sidebar_position: 2
---
# Testes Web com Serenity Screenplay
## Introducao
Testes web sao um caso de uso comum para Scenario Screenplay, onde tentamos modelar o comportamento e as interacoes do usuario com o sistema. Nesta secao, aprenderemos como interagir com uma aplicacao web usando a integracao Screenplay WebDriver.

## Abrindo uma URL

### Abrindo uma URL diretamente
No Screenplay, voce abre uma nova pagina usando a classe de Interaction `Open`. Isso pode funcionar com uma URL, por exemplo:

```java
toby.attemptsTo(Open.url("https://todomvc.com/examples/angularjs/#/"));
```

### Abrindo a URL de um Page Object
Se voce definiu um Page Object com uma URL padrao, pode abrir um Page Object referenciando a classe do Page Object. Suponha que definimos o seguinte Page Object do Serenity e configuramos o valor `@DefaultUrl` para a URL da aplicacao TodoMVC:

```java
@DefaultUrl("https://todomvc.com/examples/angularjs/#/")
public class TodoMvcPage extends PageObject {}
```

Agora podemos abrir esta pagina usando o metodo `Open.browserOn()`, assim:

```java
toby.attemptsTo(Open.browserOn().the(TodoMvcPage.class));
```

### Usando paginas nomeadas

As vezes pode ser conveniente armazenar as URLs para diferentes ambientes ou servidores no arquivo `serenity.conf` e referencia-las pelo nome da propriedade no nosso codigo de teste.

Por exemplo, imagine que queremos executar nossos testes contra as implementacoes Angular, React e Polymer da aplicacao TodoMVC. Cada aplicacao tem uma URL diferente, que poderiamos armazenar no arquivo `serenity.conf` assim:

```json
pages {
    angular = "https://todomvc.com/examples/angularjs/#/"
    react = "https://todomvc.com/examples/react/#/"
    polymer = "https://todomvc.com/examples/polymer/index.html"
}
```

Em seguida, podemos nos referir a essas propriedades no nosso codigo usando o metodo `thePageNamed()`, assim:

```java
toby.attemptsTo(Open.browserOn().thePageNamed("pages.react"));
```

## Localizando elementos em uma pagina

No Screenplay, voce pode usar varias estrategias diferentes para localizar os elementos com os quais precisa interagir.

### CSS e XPath

A forma mais simples de localizar um elemento e usar uma expressao CSS ou XPath, como mostrado aqui:

```java
toby.attemptsTo(
    Click.on("#login-button")
);
```

Ou

```java
toby.attemptsTo(
    Click.on("//input[@id='login-button']")
);
```

O Serenity interpretara a string para determinar se e uma expressao XPath ou CSS. Em alguns casos pode haver alguma ambiguidade, e o Serenity usara XPath como padrao. Se isso nao for intencional, voce pode usar os prefixos "xpath:" ou "css:" para especificar qual tipo de localizador voce quer dizer:

```java
toby.attemptsTo(
    Click.on("css:input[name=login-button]")
);
```


### Usando localizadores Selenium
Voce tambem pode usar qualquer uma das classes de localizador padrao do Selenium (`org.openqa.selenium.By`), como mostrado aqui:

```java
toby.attemptsTo(
    Click.on(By.id("login-button"))
);
```

### Usando a classe Target

Usar localizadores de texto ou `By` tem a vantagem de ser conciso, mas pode levar a relatorios de teste pouco legiveis, especialmente quando localizadores XPath ou CSS complexos ou sem significado sao usados. No Screenplay, a classe `Target` nos permite dar a uma estrategia de localizacao um nome mais significativo. Por exemplo, considere o seguinte codigo:

```java
toby.attemptsTo(Click.on("//button[.='Add']"));
```

Nos relatorios do Serenity, este passo sera reportado como "Toby clicks on //button[.='Add']", o que nao e muito legivel.

Se representarmos este botao usando a classe `Target`, podemos associar um rotulo como "Add to cart button", assim:

```java
Target ADD_TO_CART = Target.the("Add to cart button").located(By.cssSelector("//button[.='Add']"));

toby.attemptsTo(Click.on(ADD_TO_CART));
```

Nos relatorios, este passo agora aparecera como "Toby clicks on Add to cart button".

### Usando Target dinamicos

Voce tambem pode incluir variaveis em um localizador `Target`, para tornar seus localizadores dinamicos. Voce pode incluir parametros numerados usando "{0}", "{1}", etc., e entao usar o metodo `of()` para instanciar o `Target` com o valor que voce esta interessado. Por exemplo, poderiamos criar um localizador generico para um botao contendo um texto especifico assim:

```java
Target BUTTON_WITH_LABEL = Target.the("{0} button").located(By.cssSelector("//button[.='{0}']"));

toby.attemptsTo(Click.on(BUTTON_WITH_LABEL.of('Add')));
```

Poderiamos ate usar este Target dinamico para definir outros Target com valores especificos, assim:

```java
Target BUTTON_WITH_LABEL = Target.the("{0} button").located(By.cssSelector("//button[.='{0}']"));
Target ADD_BUTTON = BUTTON_WITH_LABEL.of('Add');

toby.attemptsTo(Click.on(ADD_BUTTON));
```

### Usando Page Elements

Os [Page Elements](../../docs/guide/page_elements) do Serenity fornecem uma forma mais intuitiva e legivel de localizar elementos em uma pagina, frequentemente sem precisar usar XPath ou CSS. Com Page Elements, voce pode identificar elementos usando expressoes como as seguintes:
  - `Click.on(Button.withText("Add to cart"))`
  - `Enter.theValue(").into(InputField.withPlaceholder("Enter the customer name"))`
  - `Click.on(PageElement.locatedBy(".item").containingText("Bananas"))`

Voce pode aprender mais sobre Page Elements [aqui](../../docs/guide/page_elements).

## Interagindo com elementos

Nesta secao veremos como interagir com elementos em uma pagina web usando Selenium WebDriver com Serenity Screenplay.

### Classes de Interaction do Screenplay
Voce pode encontrar as classes de Interaction padrao do Serenity no pacote `net.serenitybdd.screenplay.actions`.

| Interaction                    | Proposito              | Exemplo     |
| -----------                    | --------             | ----------- |
| Clear                          | Limpar um campo de entrada | `actor.attemptsTo(Clear.field("#firstname"))`           |
| Click                          | Clicar em um elemento  | `actor.attemptsTo(Click.on("#add-to-cart"))`           |
| DoubleClick | Clicar duas vezes em um elemento usando uma Selenium Action | `actor.attemptsTo(DoubleClick.on("#add-to-cart"))`           |
| Enter                          | Digitar um valor em um campo de entrada  | `actor.attemptsTo(Enter.theValue("scott").into("#username"))`           |
| Evaluate                       | Avaliar uma expressao Javascript  | `actor.attemptsTo(Evaluate.javascript("window.localStorage.clear();")`           |
| Hit                            | Pressionar uma tecla  | `actor.attemptsTo(Hit.the(Keys.ENTER).into("#searchterms"))`           |
| JavaScriptClick                | Clicar em um elemento usando Javascript em vez de Selenium | `actor.attemptsTo(JavaScriptClick.on("#add-to-cart"))`           |
| MoveMouse                      | Mover o mouse sobre um elemento especificado | `actor.attemptsTo(MoveMouse.to("#main-menu"))`           |
| Open | Abrir uma URL ou pagina especifica | `actor.attemptsTo(Open.url("https://www.google.com"))`|
| PerformOn | Executar uma ou mais acoes em varios elementos | Veja abaixo |
| RightClick | Clicar com o botao direito em um determinado elemento | `actor.attemptsTo(RightClick.on("#menu"))` |
| Scroll | Rolar ate um elemento usando Javascript | `actor.attemptsTo(Scroll.to("#terms-and-conditions"))` |
| SelectFromOptions | Selecionar um valor em um dropdown HTML | `actor.attemptsTo(SelectFromOptions.byVisibleText("Red").from("#color"))` |
| SendKeys | Inserir um valor em um campo usando o metodo sendKeys() do Selenium |`actor.attemptsTo(SendKeys.of("scott").into("#username"))`           |
| SetCheckbox                  | Marcar um campo checkbox | `actor.attemptsTo(SetCheckbox.of("#subscribe-to-newsletter").toTrue())`           |
| Switch   | Alternar para outra janela ou aba | `actor.attemptsTo(Switch.toNewWindow())`           |
| Upload    | Fazer upload de um arquivo usando um campo de upload HTML |  `actor.attemptsTo(Upload.theFile(pathToFile)).to("#uploaded-file"))`           |
| WithDevTools | Executar uma acao com o Chrome DevTools | Veja abaixo |

As Interaction mais importantes sao descritas com mais detalhes nas secoes a seguir.

### Clear

A Interaction `Clear` redefine o valor de um elemento de formulario HTML.

```java
        dina.attemptsTo(Clear.field(By.id("first-name")));
```

### Click

Clicar em um botao ou elemento.

```java
        dina.attemptsTo(Click.on("#some-button"));
```

As vezes um elemento nao esta em um estado interativo quando tentamos clicar nele pela primeira vez. Por exemplo, ele pode estar desabilitado ou ainda nao visivel na pagina. Nesses casos, podemos pedir ao Serenity para esperar ate que o elemento esteja habilitado usando o metodo `afterWaitingUntilEnabled()`:

```java
        dina.attemptsTo(Click.on("#some-button").afterWaitingUntilEnabled());
```

Se o elemento ainda nao foi renderizado, podemos usar o metodo `afterWaitingUntilPresent()`:

```java
        dina.attemptsTo(Click.on("#some-button").afterWaitingUntilPresent());
```

Em ambos os casos, o Serenity esperara ate 5 segundos por padrao para que o elemento esteja presente ou disponivel. Voce pode configurar este timeout usando a propriedade de sistema `webdriver.wait.for.timeout` (definida em milissegundos).

### DoubleClick

Clicar duas vezes em um botao ou elemento, usando Selenium Actions.

```java
        dina.attemptsTo(DoubleClick.on("#some-button"));
```

### Enter e SendKeys

Existem duas formas de inserir um valor em um campo.

`Enter` inserira um valor em um campo, primeiro esperando ate que o campo esteja habilitado e depois limpando o campo de quaisquer valores atuais, antes de inserir o valor especificado.

```java
        dina.attemptsTo(Enter.theValue("Sarah-Jane").into("#firstName"));
```

`SendKeys` executara o equivalente ao `sendKeys()` do Selenium, voce pode usar `Enter.keyValue()` em vez de `Enter.theValue()`

```java
        dina.attemptsTo(SendKeys.of("Sarah-Jane").into("#firstName"));
```

### Avaliar uma expressao Javascript

A Task `Evaluate` executa um comando JavaScript no contexto do frame ou janela atualmente selecionado. Por exemplo, o seguinte codigo limpara o armazenamento local no navegador da Dina:

```java
dina.attemptsTo(Evaluate.javascript("window.localStorage.clear()"));
```

Se o script tiver um valor de retorno (ou seja, se o script contem uma instrucao return), voce tambem pode recuperar o valor retornado por uma expressao Javascript. Voce pode fazer isso de duas formas. A primeira e usar o metodo `result()` para transformar a acao `Evaluate` em uma Question. Voce pode ver um exemplo aqui:

```java
        Long result = (Long) dina.asksFor(Evaluate.javascript("return 1 + 1").result());
        assertThat(result).isEqualTo(2);
```

O tipo do objeto retornado pelo WebDriver e o seguinte:
 * Para um elemento HTML, este metodo retorna um `WebElement`
 * Para um decimal, um `Double` e retornado
 * Para um numero nao-decimal, um `Long` e retornado
 * Para um booleano, um `Boolean` e retornado
 * Para todos os outros casos, uma `String` e retornada.
 * Para um array, retorna uma `List<Object>` com cada objeto seguindo as regras acima. Suportamos listas aninhadas.
 * Para um mapa, retorna um `Map<String, Object>` com valores seguindo as regras acima.

### Pressionar uma tecla especifica

Voce pode inserir qualquer tecla ou combinacao de teclas do Selenium usando a Task `Enter`. Voce tambem pode querer usar a Task `Hit` para maior legibilidade. A classe de Interaction `Hit` e semelhante a classe `Enter`, mas recebe uma lista de um ou mais valores `Keys`:

```java
        dina.attemptsTo(Enter.theValue("Sarah-Jane").into(By.id("firstName")));
        dina.attemptsTo(Hit.the(Keys.TAB).into(By.id("firstName")));
```

### Trabalhando com checkboxes

Voce pode marcar ou desmarcar um elemento checkbox clicando nele usando a Interaction `Click`. Se quiser ter certeza de que o elemento esta marcado ou desmarcado, voce tambem pode usar a classe `SetCheckbox`, para marcar ou desmarcar o campo.

Por exemplo, para marcar o checkbox Terms & Conditions em um formulario, voce pode usar o seguinte:

```java
        dina.attemptsTo(SetCheckbox.of("#terms-and-conditions").toTrue());
```

E para desmarcar, voce poderia fazer isso:

```java
        dina.attemptsTo(SetCheckbox.of("#terms-and-conditions").toFalse());
```

Como habilitar e desabilitar checkboxes envolve clicar, tambem podemos usar os metodos `afterWaitingUntilEnabled()` e `afterWaitingUntilPresent()` disponiveis com a classe de Interaction `Click`, por exemplo:

```java
        dina.attemptsTo(
            SetCheckbox.of("#terms-and-conditions").toFalse()
                                                   .afterWaitingUntilEnabled());
```

### JavaScriptClick

As vezes e util poder ignorar o Selenium e executar um click() diretamente com JavaScript. Podemos fazer isso com a classe `JavaScriptClick`. A classe tem a mesma API que a classe `Click`, por exemplo:

```java
        dina.attemptsTo(JavaScriptClick.on("#button"));
```

### Movendo o mouse

Podemos mover o mouse para um elemento na pagina usando `MoveMouse`, por exemplo:

```java
        dina.attemptsTo(MoveMouse.to("#button"));
```

Se precisarmos executar uma ou mais acoes no elemento depois de movermos o cursor sobre ele, podemos fazer isso usando o metodo `andThen()` com uma expressao Lambda, que recebe o objeto Actions. Por exemplo, para clicar no botao apos mover o cursor para ele, poderiamos fazer o seguinte:

```java
        dina.attemptsTo(MoveMouse.to(BUTTON).andThen(actions -> actions.click()));
```

### Executando acoes em colecoes de elementos

Tambem podemos executar acoes em uma colecao de elementos. Suponha que temos uma pagina HTML contendo uma lista de checkboxes assim:

```html
    <div>
        <label>Condiments:</label>
        Salt <input type="checkbox" id="salt" class="condiment" name="salt">
        Pepper <input type="checkbox" id="pepper" class="condiment" name="pepper">
        Sauce <input type="checkbox" id="sause" class="condiment" name="sauce">
    </div>
```

Poderiamos marcar cada um desses checkboxes de uma so vez usando o metodo `PerformOn.eachMatching()`. Este recebe dois parametros:
 - Um localizador (um Target, localizador `By`, ou expressao CSS ou XPath)
 - Uma expressao lambda que aceita um `WebElementFacade`

Se quisessemos clicar em cada um desses checkboxes, poderiamos fazer o seguinte:

```java
         dina.attemptsTo(
            PerformOn.eachMatching(".condiment", WebElementFacade::click)
        );
```

Voce tambem pode usar Performable do Screenplay, como mostrado neste exemplo:
```java
        dina.attemptsTo(
            PerformOn.eachMatching(".condiment",
                checkbox -> dina.attemptsTo(SetCheckbox.of(checkbox).toTrue()))
        );
```

### RightClick

Voce pode clicar com o botao direito em um elemento usando a classe `RightClick`. Isso usara o metodo de acao `contextClick()` do Selenium:

```java
        dina.attemptsTo(RightClick.on("#button"));
```

### Rolando elementos para a visualizacao

As vezes pode ser util rolar ate um elemento especifico na pagina. Voce pode fazer isso com a classe `Scroll`, assim, que usa Javascript para rolar o elemento para a visualizacao.

```java
        dina.attemptsTo(Scroll.to(By.id("#button")));
```

Esta classe usa o metodo Javascript `scrollIntoView()`, que por padrao rolara a tela para que o topo do elemento seja alinhado ao topo da area visivel do ancestral rolavel. Voce tambem pode alinhar a parte inferior do elemento a parte inferior da area visivel do ancestral rolavel, usando o metodo `andAlignToBottom()`, por exemplo:

```java
        dina.attemptsTo(Scroll.to(By.id("#button")).andAlignToBottom());
```

### Selecionando de dropdowns

Podemos selecionar um valor de um dropdown usando a classe `SelectFromOptions`. Suponha que temos o seguinte codigo HTML:

```html
        <select id="color">
            <option value="red">Red</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
        </select>
```

Podemos selecionar a segunda dessas opcoes de qualquer uma das seguintes formas:
```java
    dina.attemptsTo(SelectFromOptions.byVisibleText("Green").from("#color"));
    dina.attemptsTo(SelectFromOptions.byValue("green").from("#color"));
    dina.attemptsTo(SelectFromOptions.byIndex(1).from("#color"));
```

Podemos recuperar o valor atual de uma lista dropdown usando a classe Question `SelectedValue`, por exemplo:

```java
    String selectedValue = dina.asksFor(SelectedValue.of(COLOR_"#color")));
```

### Alternando para outra janela ou frame

Podemos alternar para uma nova janela ou aba usando a classe `Switch`. Por exemplo, o seguinte codigo abre um link em uma nova aba e alterna o controle para esta aba:

```java
        dina.attemptsTo(
                Click.on("#link-that-opens-a-new-tab"),
                Switch.toNewWindow()
        );
```

Se houver apenas duas janelas ou abas abertas, podemos voltar para a janela original usando o metodo `Switch.toTheOtherWindow()`:

```java
        dina.attemptsTo(
                Switch.toTheOtherWindow()
        );
```

Outra opcao e usar o nome ou handle da janela para a qual voce quer alternar, usando `Switch.toWindow()`:

```java
        dina.attemptsTo(
                Switch.toWindow(originalWindowHandle)
        );
```

Alternativamente, se voce sabe o titulo da janela ou aba, pode usar o metodo `Switch.toWindowTitled()`:

```java
        dina.attemptsTo(
                Switch.toWindowTitled("The other window")
        );
```

Embora frames HTML sejam considerados obsoletos para aplicacoes modernas, eles ainda existem em algumas aplicacoes mais antigas. Voce pode interagir com frames usando os seguintes metodos:

Outras funcoes de switch do Selenium sao tratadas pelos seguintes metodos:

| Interaction                    | Proposito              | Equivalente Selenium     |
| -----------                    | --------             | -----------             |
| Switch.toFrame(index)          | Seleciona um frame pelo seu indice (baseado em zero). Selecionar um frame pelo indice e equivalente a expressao JS window.frames[index] onde "window" e a janela DOM representada pelo contexto atual. Uma vez que o frame foi selecionado, todas as chamadas subsequentes na interface WebDriver sao feitas nesse frame. | `driver.switch().toFrame(index)` |
| Switch.toFrame(nameOrId)       | Seleciona um frame pelo seu nome ou ID. Frames localizados por atributos de nome correspondentes sempre tem precedencia sobre aqueles correspondidos por ID. | `driver.switch().toFrame(nameOrId)` |
| Switch.toParentFrame()         | Muda o foco para o contexto pai. Se o contexto atual e o contexto de navegacao de nivel superior, o contexto permanece inalterado. | `driver.switchTo().parentFrame()` |
| Switch.toDefaultContext()      | Seleciona o primeiro frame na pagina, ou o documento principal quando uma pagina contem iframes. | `driver.switch().toDefaultContext()` |

Outras funcoes de switch do Selenium sao tratadas pelos seguintes metodos:

| Interaction                    | Proposito              | Equivalente Selenium     |
| -----------                    | --------             | -----------             |
| Switch.toActiveElement()       | Alterna para o elemento que atualmente tem foco dentro do documento atualmente "alternado", ou o elemento body se isso nao puder ser detectado. Isso corresponde a semantica de chamar "document.activeElement" em Javascript. | `driver.switchTo().activeElement()`           |


### Lidando com dialogos Alert

Podemos trabalhar com dialogos HTML Alert usando o metodo `Switch.toAlert()`. Por exemplo, o seguinte codigo alternara a janela atual para o dialogo de alerta atual:
```java
        dina.attemptsTo(
                Switch.toAlert()
        );
```

Podemos consultar o texto do alerta usando a classe Question `HtmlAlert.text()`:

```java
        dina.attemptsTo(
                Switch.toAlert()
        );
        assertThat(dina.asksFor(HtmlAlert.text())).isEqualTo("Are you sure?");
```

Tambem podemos aceitar ou dispensar a mensagem de alerta usando os metodos `Switch.toAlert().andAccept()` e `Switch.toAlert().andDismiss()` respectivamente:

```java
        dina.attemptsTo(
                Switch.toAlert().andAccept()
        );
```

### Upload

A forma mais simples de fazer upload de um arquivo para um campo de upload HTML (um que tem tipo 'file') e usar a Task `Upload`. Suponha que temos o seguinte campo de formulario HTML:

```html
        <input type="file" id="upload-file" name="filename">
```

Podemos fazer upload de um arquivo para este campo como mostrado aqui:

```java
    Path fileToUpload = ...
    dina.attemptsTo(Upload.theFile(fileToUpload).to("#upload-file"));
```

Se voce esta executando os testes em uma maquina remota, pode usar o Selenium Local File Detector. O Local File Detector permite a transferencia de arquivos da maquina cliente para o servidor remoto. Por exemplo, se um teste precisa fazer upload de um arquivo para uma aplicacao web, um WebDriver remoto pode transferir automaticamente o arquivo da maquina local para o servidor web remoto durante a execucao. Isso permite que o arquivo seja carregado da maquina remota executando o teste.

```java
    Path fileToUpload = ...
    dina.attemptsTo(Upload.theFile(fileToUpload).to("#upload-file").usingLocalFileDetector());
```

Voce tambem pode fazer upload de um arquivo nos recursos do classpath usando o metodo `Upload.theClasspathResource()`, como mostrado aqui:

```java
    Path fileToUpload = ...
    dina.attemptsTo(Upload.theClasspathResource("some/resource/path.txt").to("#upload-file"));
```

## Trabalhando com Chrome DevTools

Muitos navegadores fornecem "DevTools" - um conjunto de ferramentas integradas ao navegador que os desenvolvedores podem usar para depurar aplicacoes web e explorar o desempenho de suas paginas. O DevTools do Google Chrome usa um protocolo chamado Chrome DevTools Protocol (ou "CDP" para abreviar). Como o nome sugere, este nao foi projetado para testes, nem para ter uma API estavel, entao a funcionalidade e altamente dependente da versao do navegador.

No Serenity Screenplay, podemos acessar a biblioteca DevTools do Selenium 4 usando o metodo `WithDevTools.perform()`. Por exemplo:

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

Se quisermos usar DevTools para recuperar um valor especifico, podemos usar a classe `DevToolsQuery`:
```java
        List<Metric> metrics = dina.asksFor(
                DevToolsQuery.ask().about(devTools -> {
                    devTools.createSession();
                    devTools.send(Performance.enable(Optional.empty()));
                    return devTools.send(Performance.getMetrics());
                })
        );
```

## Consultando a pagina web

Serenity Screenplay tambem oferece um grande numero de opcoes quando se trata de consultar uma UI web. A maioria envolve tipos especiais de classe Question.

Em testes web Screenplay, voce pode simplesmente implementar uma Question que retorna o tipo de objeto que voce esta interessado e entao consultar a UI de uma forma convencional do WebDriver. Por exemplo, suponha que queremos ler o nome do usuario em uma pagina, que pode ser localizado com o seletor CSS ".user-name".

Uma asserção Screenplay para verificar o nome do usuario poderia ficar assim:

```java
    sam.should(seeThat(TheUserName.value(), equalTo("sam")));
```

Poderiamos criar uma classe Question TheUserName para consultar este campo da seguinte forma:

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
Aqui usamos BrowseTheWeb.as(actor) para obter a API WebDriver do Serenity para a instancia do WebDriver do Actor, o que da acesso a toda a gama de metodos do Page Object do Serenity.

Tambem poderiamos usar um Target para localizar o nome do usuario, que poderiamos armazenar em uma classe Page Component separada:

```java
public static Target USER_NAME = Target.the("User name").locatedBy(".user-name");
```

Podemos entao usar o metodo resolveFor() para encontrar o elemento correspondente a esse Target no navegador do Actor:

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

Alternativamente, poderiamos escrever esta classe como uma fabrica e usar uma expressao lambda em vez de uma classe Question completa:

```java
public class TheUserName {

    public static Question<String> value() {
        return actor -> USER_NAME.resolveFor(actor).getText();
    }
}
```

Neste caso, a anotacao `@Subject` nao tera efeito, entao precisamos passar o nome do objeto que estamos verificando na asserção Screenplay:

```java
sam.should(seeThat("the displayed username", TheUserName.value(), equalTo("sam")));
```

Ate agora voce viu como as Question do Screenplay funcionam em detalhes. Isso ajudara voce a implementar as suas proprias se precisar. Porem, o Serenity tambem fornece uma serie de atalhos relacionados a consultar paginas web, que voce encontrara no pacote net.serenitybdd.screenplay.questions, que permitem escrever codigo de automacao muito mais conciso.

## Question WebDriver incluidas

O Serenity fornece muitas classes Question incluidas no pacote `net.serenitybdd.screenplay.questions` que sao uma forma abreviada de consultar uma pagina web. Por exemplo, a classe `Text` nos permite recuperar o conteudo de texto de um elemento, assim:

```java
String name = sam.asksFor(Text.of("#name"));
```

Se houver muitas entradas correspondentes, podemos recuperar todas usando o metodo `ofEach()`:

```java
Collection<String> names = sam.asksFor(Text.ofEach(".name"));
```

A lista completa de classes Question Web e fornecida aqui.

### Absence

Determina se um elemento _nao_ esta presente ou visivel na pagina. Um campo que esta presente no DOM mas nao e renderizado sera considerado ausente.

```java
boolean isNotPresent = sam.asksFor(Absence.of("#no-such-field"));
```

### Attribute

Verifica o valor de um atributo HTML de um elemento especificado.

```java
String placeholderText = sam.asksFor(Attribute.of(".new-todo").named("placeholder"));
```

### CheckboxValue

Determina se um checkbox foi marcado ou nao.

```java
boolean termsAndConditionsApproved = sam.asksFor(CheckboxValue.of("#tnc"));
```

### CSSValue

Recupera o valor de um atributo CSS especifico de um elemento.

```java
String font = sam.asksFor(CSSValue.of(target).named("font"));
```

### CurrentlyEnabled

Verifica se um elemento esta atualmente habilitado, sem esperar.

```java
boolean isCurrentlyEnabled = sam.asksFor(CurrentlyEnabled.of("#some-button"));
```

### CurrentVisibility

Verifica se um elemento esta atualmente visivel, sem esperar.

```java
boolean isCurrentlyVisible = sam.asksFor(CurrentVisibility.of("#some-button"));
```

### Disabled

Verifica se um elemento esta desabilitado.

```java
boolean isDisabled = sam.asksFor(Disabled.of("#a-disabled-button"));
```

### Displayed

Verifica se um elemento esta exibido. Se o elemento nao estiver atualmente exibido, o teste esperara por um curto atraso para dar tempo para ser exibido.

```java
boolean isDisplayed = sam.asksFor(Displayed.of("#some-button"));
```

### Enabled

Verifica se um elemento esta habilitado. Se o elemento nao estiver atualmente habilitado, o teste esperara por um curto atraso para dar tempo para ser habilitado.

```java
boolean isEnabled = sam.asksFor(Enabled.of("#some-button"));
```

### Presence

Verifica se um elemento esta presente no DOM. Um elemento invisivel ou oculto ainda pode estar presente no DOM.

### SelectedStatus

Alternativa ao `CheckboxValue`

```java
boolean termsAndConditionsApproved = sam.asksFor(SelectedStatus.of("#tnc"));
```

# Text

Para buscar o valor de texto de um elemento, podemos usar a classe `Text`:

```java
String introductionText = sam.asksFor(Text.of("#introduction"));
```

### TextContent

Em alguns casos, podemos precisar ler a propriedade HTML `textContent` para obter o texto que precisamos. Para fazer isso, podemos usar a classe `TextContent` em vez de `Text`. Isso retorna o conteudo de texto do elemento especificado e todos os seus descendentes.

### TheCoordinates

Retorna as coordenadas de um elemento especificado.

### TheLocation

Retorna onde na pagina esta o canto superior esquerdo do elemento renderizado.

### TheSize

Qual e a largura e altura do elemento renderizado?

### Value

Retorna o atributo HTML `value` de um elemento especificado.

### Visibility

Determina se este elemento web esta presente e visivel na tela

### Trabalhando com Dropdowns

Podemos consultar o valor ou valores atualmente selecionados de um elemento HTML `<SELECT>` usando as classes Question `SelectedValue`, `SelectedValues`, `SelectedVisibleTextValue` e `SelectedVisibleTextValue`.

Por exemplo, para encontrar o valor atualmente selecionado de uma lista dropdown HTML, poderiamos usar o seguinte codigo:

```java
String selectedColorValue = dina.asksFor(SelectedValue.of("#color-dropdown"));
```

Para obter o texto visivel do item selecionado, usariamos `SelectedVisibleTextValue`:

```java
String selectedColor = dina.asksFor(SelectedVisibleTextValue.of("#color-dropdown"));
```

Para multi-selects, podemos usar `SelectedValues` e `SelectedVisibleTextValues`:

```java
List<String> selectedColors = dina.asksFor(SelectedValues.of("#color-dropdown"));
```

Podemos recuperar a lista atual de opcoes usando `SelectOptions`, que retorna a lista de textos visiveis para cada opcao:

```java
List<String> selectedColors = dina.asksFor(SelectOptions.of("#color-dropdown"));
```

Se precisarmos do atributo `value` de cada opcao do dropdown, podemos usar `SelectOptionValues`, por exemplo:

```java
List<String> selectedColors = dina.asksFor(SelectOptionValues.of("#color-dropdown"));
```



## Lidando com Esperas

### Usando a classe WaitUntil
Se voce precisa esperar que um elemento apareca com Serenity Screenplay, existem algumas opcoes disponiveis. Por padrao, o Serenity esperara por um curto atraso se voce tentar interagir com um elemento que nao esta na pagina. Porem, voce pode garantir que esta espera seja suficiente usando a classe `WaitUntil`, como mostrado aqui:

```java
private final static Target DELAYED_BUTTON = PageElement.locatedBy("#delayed-button");

dina.attemptsTo(
    WaitUntil.the(DELAYED_BUTTON, WebElementStateMatchers.isVisible()),
    Click.on(DELAYED_BUTTON)
);
```

Este codigo esperara ate que o elemento esteja visivel antes de prosseguir para a acao Click. O timeout pode ser configurado (em milissegundos) usando a propriedade `webdriver.timeouts.implicitlywait`, que e de 5 segundos por padrao.

Se voce precisar ter um controle mais fino sobre a duracao do timeout para situacoes especificas, pode especificar isso adicionando o metodo `forNoMoreThan()`, que permite especificar um timeout explicito:

```java
dina.attemptsTo(
    WaitUntil.the(DELAYED_BUTTON, isVisible()).forNoMoreThan(10).seconds()
);
 ```

Voce tambem pode esperar por outras condicoes. Por exemplo, para esperar ate que um elemento desapareca, voce pode usar o matcher `isNotVisible()`:

```java
dina.attemptsTo(
    WaitUntil.the(DISAPPEARING_BUTTON, isNotVisible())
);
```

Os seguintes matchers estao disponiveis na classe `WebElementStateMatchers`. Note que todos os seguintes metodos tambem tem um equivalente negativo (`isNotVisible()`, `isNotEmpty()` etc.).

| Matcher                    | Proposito                              |
| -----------                | --------                             |
| containsText(...)          | Verifica se um elemento contem um valor de texto especifico |
| containsOnlyText(...)      | Verifica se um elemento contem exatamente um valor de texto especifico |
| containsSelectOption(...)  | Verifica se um elemento dropdown contem um valor de texto especifico como opcao|
| isClickable                | Verifica se um elemento esta visivel e habilitado |
| isEmpty                    | Verifica se um elemento nao esta visivel ou contem uma string vazia |
| isEnabled                  | Verifica se um elemento esta habilitado |
| isPresent                  | Verifica se um elemento esta presente na pagina |
| isSelected                 | Verifica se um elemento esta selecionado     |
| isVisible                  | Verifica se um elemento esta visivel     |

### Esperando por uma condicao WebDriver

Outra opcao e esperar por uma condicao WebDriver (que pode ser encontrada na classe `org.openqa.selenium.support.ui.ExpectedConditions`), por exemplo:

```java
dina.attemptsTo(
        WaitUntil.the(
                invisibilityOfElementLocated(By.id("disappearing-button")))
);
```

### Esperando por Target

Voce tambem pode colocar uma condicao de espera especifica em um objeto `Target`. Voce pode fazer isso quando define a variavel `Target` (se ela deve ser aplicada toda vez que voce interage com este elemento), ou apenas quando voce interage com o elemento, como mostrado abaixo:

```java
private final static Target INVISIBLE_BUTTON
    = PageElement.locatedBy("#invisible-button");

dina.attemptsTo(
    Click.on(INVISIBLE_BUTTON.waitingForNoMoreThan(Duration.ofSeconds(3)))
);
```
