---
id: page_objects
title: Interagindo com Páginas Web
sidebar_position: 5
---

# Interagindo com Páginas Web

O Serenity integra-se suavemente com o Selenium WebDriver e gerencia detalhes como a configuração do driver e a manutenção da instância do driver. Ele também fornece uma série de melhorias em relação ao Selenium padrão.

## Page Object

Se você está trabalhando com testes web WebDriver, você estará familiarizado com o conceito de Page Object. Page Object são uma forma de isolar os detalhes de implementação de uma página web dentro de uma classe, expondo apenas métodos focados no negócio relacionados a essa página. Eles são uma excelente maneira de tornar seus testes web mais fáceis de manter.

No Serenity, Page Object são apenas classes comuns que estendem a classe `PageObject`. O Serenity injeta automaticamente uma instância do WebDriver no Page Object que você pode acessar através do método `getDriver()`, embora você raramente precise usar o WebDriver diretamente. A classe `PageObject` do Serenity fornece vários métodos convenientes que tornam o acesso e a manipulação de elementos web muito mais fácil do que com scripts de teste WebDriver convencionais.

Aqui está um exemplo simples:

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

O método `typeInto` é um atalho que simplesmente limpa um campo e insere o texto especificado.
Se você preferir um estilo de API mais fluente, também pode fazer algo assim:

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

Você pode usar um estilo ainda mais fluente para expressar os passos de implementação usando métodos como `find`, `findBy` e `then`.

Por exemplo, você pode usar localizadores `By` do WebDriver com nome de elemento, id, seletor CSS ou seletor XPath da seguinte forma:

```java
find(By.name("demo")).then(By.name("specialField")).getValue();

find(By.cssSelector(".foo")).getValue();

find(By.xpath("//th")).getValue();
```

O método `findBy` permite que você passe o seletor CSS ou XPath diretamente para o WebDriver. Por exemplo,

```java
findBy("#demo").then("#specialField").getValue(); // seletores CSS

findBy("//div[@id='dataTable']").getValue(); // seletor XPath
```

## Usando páginas em uma biblioteca de passos

Quando você precisa usar um Page Object em um de seus passos, você só precisa declarar uma variável do tipo PageObject em sua biblioteca de passos, por exemplo:

```java
FindAJobPage page;
```

Se você quiser ter certeza de que está na página correta, pode usar o método `currentPageAt()`. Isso verificará a classe da página para quaisquer anotações `@At` presentes na classe PageObject e, se presentes, verificará se a URL atual corresponde ao padrão de URL especificado na anotação. Por exemplo, quando você invoca usando `currentPageAt()`, o seguinte Page Object verificará se a URL atual é precisamente `http://www.apache.org`.

```java
@At("http://www.apache.org")
public class ApacheHomePage extends PageObject {
    ...
}
```

A anotação `@At` também suporta curingas e expressões regulares. O seguinte Page Object corresponderá a qualquer subdomínio Apache:

```java
@At("http://.*.apache.org")
public class AnyApachePage extends PageObject {
    ...
}
```

Mais geralmente, no entanto, você está mais interessado no que vem depois do nome do host. Você pode usar o token especial `#HOST` para corresponder a qualquer nome de servidor. Então o seguinte Page Object corresponderá tanto a `http://localhost:8080/app/action/login.form` quanto a `http://staging.acme.com/app/action/login.form`. Ele também ignorará parâmetros, então `http://staging.acme.com/app/action/login.form?username=toto&password=oz` funcionará bem também.

```java
@At(urls={"#HOST/app/action/login.form"})
public class LoginPage extends PageObject {
   ...
}
```

## Abrindo a página

Um Page Object é geralmente projetado para trabalhar com uma página web específica. Quando o método `open()` é invocado, o navegador será aberto na URL padrão da página.

A anotação `@DefaultUrl` indica a URL que este teste deve usar quando executado isoladamente (por exemplo, de dentro do seu IDE).
Geralmente, no entanto, a parte do host da URL padrão será sobrescrita pela propriedade `webdriver.base.url`, pois isso permite definir a URL base de forma geral para todos os seus testes,
e assim torna mais fácil executar seus testes em diferentes ambientes simplesmente alterando este valor de propriedade.
Por exemplo, na classe de teste acima, definir o `webdriver.base.url` para 'https://staging.mycompany.com' resultaria na página sendo aberta na URL 'https://staging.mycompany.com/somepage'.

Você também pode definir URLs nomeadas que podem ser usadas para abrir a página web, opcionalmente com parâmetros. Por exemplo, no código a seguir, definimos uma URL chamada 'open.issue', que aceita um único parâmetro:

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

Você poderia então abrir esta página na URL http://jira.mycompany.org/issues/ISSUE-1 como mostrado aqui:

```java
page.open("open.issue", withParameters("ISSUE-1"));
```

Você também poderia dispensar totalmente a URL base na definição da URL nomeada e confiar nos valores padrão:

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

E naturalmente você pode definir mais de uma definição:

```java
@NamedUrls(
  {
          @NamedUrl(name = "open.issue", url = "/issues/{1}"),
          @NamedUrl(name = "close.issue", url = "/issues/close/{1}")
  }
)
```

Você nunca deve tentar implementar o método `open()` você mesmo. Na verdade, ele é final. Se você precisa que sua página faça algo ao carregar, como esperar por um elemento dinâmico aparecer, você pode usar a anotação @WhenPageOpens.
Métodos no PageObject com esta anotação serão invocados (em uma ordem não especificada) após a URL ter sido aberta. Neste exemplo, o método `open()` não retornará até que
o elemento web `dataSection` esteja visível:

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

## Trabalhando com elementos web

### Verificando se elementos estão visíveis

A classe `WebElementFacade` contém uma API fluente conveniente para lidar com elementos web, fornecendo alguns recursos extras comumente usados que não são fornecidos de forma nativa pela API do WebDriver.
`WebElementFacades` são amplamente intercambiáveis com WebElements: você apenas declara uma variável do tipo `WebElementFacade` em vez do tipo `WebElement`. Por exemplo, você pode verificar se um elemento está visível como mostrado aqui:

```java
public class FindAJobPage extends PageObject {

    WebElementFacade searchButton;

    public boolean searchButtonIsVisible() {
        return searchButton.isVisible();
    }
    ...
}
```

Se o botão não estiver presente na tela, o teste esperará por um curto período caso ele apareça devido a alguma mágica Ajax. Se você não quiser que o teste faça isso, você pode usar a versão mais rápida:

```java
public boolean searchButtonIsVisibleNow() {
    return searchButton.isCurrentlyVisible();
}
```

Você pode transformar isso em uma asserção usando o método `shouldBeVisible()` em vez disso:

```java
public void checkThatSearchButtonIsVisible() {
    searchButton.shouldBeVisible();
}
```

Este método lançará um erro de asserção se o botão de busca não estiver visível para o usuário final.

### Verificando se elementos estão habilitados

Você também pode verificar se um elemento está habilitado ou não:

```java
searchButton.isEnabled()
searchButton.shouldBeEnabled()
```

Também existem métodos negativos equivalentes:

```java
searchButton.shouldNotBeVisible();
searchButton.shouldNotBeCurrentlyVisible();
searchButton.shouldNotBeEnabled()
```

Você também pode verificar elementos que estão presentes na página mas não visíveis, por exemplo:

```java
searchButton.isPresent();
searchButton.isNotPresent();
searchButton.shouldBePresent();
searchButton.shouldNotBePresent();
```

### Manipulando listas de seleção

Também existem métodos auxiliares disponíveis para listas dropdown. Suponha que você tenha o seguinte dropdown na sua página:

```xml
<select id="color">
    <option value="red">Red</option>
    <option value="blue">Blue</option>
    <option value="green">Green</option>
</select>
```

Você poderia escrever um Page Object para manipular este dropdown como mostrado aqui:

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

### Determinando o foco

Você pode determinar se um campo específico tem o foco da seguinte forma:

```java
firstName.hasFocus()
```

Você também pode esperar que elementos apareçam, desapareçam ou se tornem habilitados ou desabilitados:

```java
button.waitUntilEnabled()
button.waitUntilDisabled()
```

ou

```java
field.waitUntilVisible()
button.waitUntilNotVisible()
```

### Usando seletores XPath e CSS diretos

Outra maneira de acessar um elemento web é usar uma expressão XPath ou CSS. Você pode usar o método `$()` com uma expressão XPath para fazer isso de forma mais simples. Por exemplo, imagine que sua aplicação web precisa clicar em um item de lista contendo um determinado código postal. Uma maneira seria como mostrado aqui:

```java
WebElement selectedSuburb = getDriver().findElement(By.xpath("//li/a[contains(.,'" ` postcode ` "')]"));
selectedSuburb.click();
```

No entanto, uma opção mais simples seria fazer isso:

```java
$("//li/a[contains(.,'" ` postcode ` "')]").click();
```

## Trabalhando com Páginas Assíncronas

Páginas assíncronas são aquelas cujos campos ou dados não são todos exibidos quando a página é carregada. Às vezes, você precisa esperar que certos elementos apareçam ou desapareçam antes de poder prosseguir com seus testes. O Serenity fornece alguns métodos úteis na classe base PageObject para ajudar com esses cenários. Eles são projetados principalmente para serem usados como parte de seus métodos de negócio em seus Page Object, embora nos exemplos os mostraremos sendo usados como chamadas externas em uma instância PageObject para clareza.

### Verificando se um elemento está visível

Em termos de WebDriver, há uma distinção entre quando um elemento está presente na tela (ou seja, no código-fonte HTML), e quando ele é renderizado (ou seja, visível para o usuário). Você também pode precisar verificar se um elemento está visível na tela. Você pode fazer isso de duas maneiras. Sua primeira opção é usar o método isElementVisible, que retorna um valor booleano com base em se o elemento é renderizado (visível para o usuário) ou não:

```java
isElementVisible(By.xpath("//h2[.='A visible title']"))
```

Sua segunda opção é assertar ativamente que o elemento deve estar visível:

```java
shouldBeVisible(By.xpath("//h2[.='An invisible title']"));
```

Se o elemento não aparecer imediatamente, você pode esperar que ele apareça:

```java
waitForRenderedElements(By.xpath("//h2[.='A title that is not immediately visible']"));
```

Uma alternativa à sintaxe acima é usar o método mais fluido `waitFor` que recebe um seletor CSS ou XPath como argumento:

```java
waitFor("#popup"); // seletor CSS

waitFor("//h2[.='A title that is not immediately visible']"); // seletor XPath
```

Se você apenas quiser verificar se o elemento está presente, embora não necessariamente visível, você pode usar `waitForRenderedElementsToBePresent`:

```java
waitForRenderedElementsToBePresent(By.xpath("//h2[.='A title that is not immediately visible']"));
```

ou sua versão mais expressiva, `waitForPresenceOf` que recebe um seletor CSS ou XPath como argumento.

```java
waitForPresenceOf("#popup"); // CSS

waitForPresenceOf("//h2[.='A title that is not immediately visible']"); // XPath
```

Você também pode esperar que um elemento desapareça usando `waitForRenderedElementsToDisappear` ou `waitForAbsenceOf`:

```java
waitForRenderedElementsToDisappear(By.xpath("//h2[.='A title that will soon disappear']"));

waitForAbsenceOf("#popup");

waitForAbsenceOf("//h2[.='A title that will soon disappear']");
```

Para simplicidade, você também pode usar os métodos `waitForTextToAppear` e `waitForTextToDisappear`:

```java
waitForTextToDisappear("A visible bit of text");
```

Se vários textos possíveis podem aparecer, você pode usar `waitForAnyTextToAppear` ou `waitForAllTextToAppear`:

```java
waitForAnyTextToAppear("this might appear","or this", "or even this");
```

Se você precisa esperar por um de vários elementos possíveis aparecerem, você também pode usar o método `waitForAnyRenderedElementOf`:

```java
waitForAnyRenderedElementOf(By.id("color"), By.id("taste"), By.id("sound"));
```

### Trabalhando com elementos Shadow DOM

O Selenium 4 introduziu suporte para elementos Shadow DOM, e o Serenity BDD adiciona suporte aprimorado para esses elementos. Suponha que temos a seguinte estrutura HTML contendo elementos Shadow DOM.

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

Para encontrar o primeiro elemento input dentro de um Shadow DOM de nível único, você precisa fornecer o localizador para o elemento aninhado e o localizador para o elemento host shadow:

```java
 ByShadow.cssSelector("#shadowedInput","#shadow-host")
```

Para encontrar o elemento input dentro do Shadow DOM aninhado, você precisa fornecer o localizador para o elemento sombreado, bem como a lista de localizadores de shadow dom pai, de cima para baixo:

```java
ByShadow.cssSelector("#nestedShadowedInput","#shadow-host", "#nested-shadow-host")
```

## Trabalhando com timeouts

Aplicações web modernas baseadas em AJAX adicionam uma grande complexidade aos testes web. O problema básico é que, quando você acessa um elemento web em uma página, ele pode não estar disponível ainda. Então você precisa esperar um pouco. De fato, muitos testes contêm pausas codificadas espalhadas pelo código para atender a esse tipo de situação.

Mas esperas codificadas são ruins. Elas tornam sua suíte de testes mais lenta e fazem com que falhem aleatoriamente se não forem longas o suficiente. Em vez disso, você precisa esperar por um estado ou evento específico. O Selenium fornece grande suporte para isso, e o Serenity constrói sobre esse suporte para torná-lo mais fácil de usar.

### Esperas Implícitas

A primeira maneira de gerenciar como o WebDriver lida com campos tardios é usar a propriedade `webdriver.timeouts.implicitlywait`. Isso determina quanto tempo, em milissegundos, o WebDriver esperará se um elemento que ele tenta acessar não estiver presente na página. Para citar a documentação do WebDriver:

"Uma espera implícita é dizer ao WebDriver para pesquisar o DOM por uma certa quantidade de tempo ao tentar encontrar um elemento ou elementos se eles não estiverem imediatamente disponíveis."

O valor padrão no Serenity para esta propriedade é atualmente 2 segundos. Isso é diferente do WebDriver padrão, onde o padrão é zero.

Vamos ver um exemplo. Suponha que temos um PageObject com um campo definido assim:

```java
@FindBy(id="slow-loader")
public WebElementFacade slowLoadingField;
```

Este campo demora um pouco para carregar, então não estará pronto imediatamente na página.

Agora suponha que definimos o valor `webdriver.timeouts.implicitlywait` para 5000, e que nosso teste usa o slowLoadingField:

```java
boolean loadingFinished = slowLoadingField.isDisplayed()
```

Quando acessamos este campo, duas coisas podem acontecer. Se o campo levar menos de 5 segundos para carregar, tudo estará bem. Mas se levar mais de 5 segundos, uma NoSuchElementException (ou algo similar) será lançada.

Esse timeout também se aplica a listas. Suponha que definimos um campo assim, que leva algum tempo para carregar dinamicamente:

```java
@FindBy(css="#elements option")
public List<WebElementFacade> elementItems;
```

Agora suponha que contamos os valores do elemento assim:

```java
int itemCount = elementItems.size()
```

O número de itens retornados dependerá do valor de espera implícita. Se definirmos o valor `webdriver.timeouts.implicitlywait` para um valor muito pequeno, o WebDriver pode carregar apenas alguns dos valores. Mas se dermos à lista tempo suficiente para carregar completamente, obteremos a lista completa.

O valor de espera implícita é definido globalmente para cada instância do WebDriver, mas você pode sobrescrever o valor você mesmo. A maneira mais simples de fazer isso de dentro de um PageObject do Serenity é usar o método setImplicitTimeout():

```java
setImplicitTimeout(5, SECONDS)
```

Mas lembre-se de que esta é uma configuração global, então também afetará outros Page Object. Portanto, assim que terminar, você deve sempre redefinir o timeout implícito para seu valor anterior. O Serenity fornece um método útil para fazer isso:

```java
resetImplicitTimeout()
```

Veja http://docs.seleniumhq.org/docs/04_webdriver_advanced.jsp#implicit-waits[Documentação do Selenium] para mais detalhes sobre como as esperas implícitas do WebDriver funcionam.

### Usando fábricas de localizador personalizadas

Internamente, o Selenium usa o conceito de Locator Factories
Normalmente, o Serenity usa `SmartElementLocatorFactory`, uma extensão do `AjaxElementLocatorFactory` do WebDriver, ao instanciar Page Object. Entre outras coisas, isso ajuda a garantir que os elementos web estejam disponíveis e utilizáveis antes de serem usados, permite timeouts campo-por-campo e evita longas esperas desnecessárias em elementos web após um passo ter falhado.

O `SmartElementLocatorFactory` usa a espera implícita padrão, ou o atributo `timeoutInSeconds` da anotação `@FindBy` se este valor foi especificado (veja abaixo), ou o valor de espera implícita padrão especificado pela propriedade `webdriver.timeouts.implicitlywait`.

Em casos raros, você pode precisar personalizar este comportamento. Para fazer isso, você pode usar a propriedade `serenity.locator.factory` para usar uma das seguintes fábricas de localizador alternativas:

- `AjaxElementLocatorFactory`: Uma fábrica de localizador do WebDriver mais adequada para aplicações Ajax. De acordo com a documentação do WebDriver, esta fábrica de localizador retornará _um localizador de elemento que esperará pelo número especificado de segundos para que um elemento apareça, em vez de falhar instantaneamente se não estiver presente. Isso funciona pesquisando a UI regularmente. O elemento retornado estará presente no DOM, mas pode não estar realmente visível._

- `DefaultElementLocatorFactory`: a fábrica de localizador padrão do WebDriver

Se você usar o `AjaxElementLocatorFactory`, você pode usar o parâmetro `webdriver.timeouts.implicitlywait` para especificar o número de segundos a esperar. Se nenhum valor for especificado, a espera padrão será de 5 segundos.

### Timeouts Explícitos

Você também pode esperar programaticamente até que um elemento esteja em um estado específico. Isso é mais flexível e útil quando você precisa esperar tempo extra em uma situação específica. Por exemplo, poderíamos esperar até que um campo se torne visível:

```java
slowLoadingField.waitUntilVisible()
```

Você também pode esperar por condições mais arbitrárias, por exemplo:

```java
waitFor(ExpectedConditions.alertIsPresent())
```

O tempo padrão que o Serenity esperará é determinado pela propriedade `webdriver.wait.for.timeout`. O valor padrão para esta propriedade é 5 segundos.

Às vezes você quer dar ao WebDriver mais tempo para uma operação específica. De dentro de um PageObject, você pode sobrescrever ou estender o timeout explícito usando o método withTimeoutOf(). Por exemplo, você poderia esperar que a lista #elements carregue por até 5 segundos assim:

```java
withTimeoutOf(5, SECONDS).waitForPresenceOf(By.cssSelector("#elements option"))
```

Você também pode especificar o timeout para um campo. Por exemplo, se você quisesse esperar até 5 segundos para um botão se tornar clicável antes de clicar nele, você poderia fazer o seguinte:

```java
someButton.withTimeoutOf(5, SECONDS).waitUntilClickable().click()
```

Você também pode usar esta abordagem para recuperar elementos:

```java
elements = withTimeoutOf(5, SECONDS).findAll("#elements option")
```

Finalmente, se um elemento específico em um PageObject precisa de um pouco mais de tempo para carregar, você pode usar o atributo timeoutInSeconds na anotação @FindBy do Serenity, por exemplo:

```java
import net.serenitybdd.core.annotations.findby.FindBy;
...
@FindBy(name = "country", timeoutInSeconds="10")
public WebElementFacade country;
```

Você também pode esperar que um elemento esteja em um estado específico e então realizar uma ação no elemento. Aqui esperamos que um elemento seja clicável antes de clicar no elemento:

```java
addToCartButton.withTimeoutOf(5, SECONDS).waitUntilClickable().click()
```

Ou, você pode esperar diretamente em um elemento web:

```java
@FindBy(id="share1-fb-like")
WebElementFacade facebookIcon;
  ...
public WebElementState facebookIcon() {
    return withTimeoutOf(5, TimeUnit.SECONDS).waitFor(facebookIcon);
}
```

Ou até:

```java
List<WebElementFacade> currencies = withTimeoutOf(5, TimeUnit.SECONDS)
                              .waitFor(currencyTab)
                              .thenFindAll(".currency-code");
```

## Executando Javascript

Há momentos em que você pode achar útil executar um pouco de Javascript diretamente dentro do navegador para realizar o trabalho. Você pode usar o método `evaluateJavascript()` da classe `PageObject` para fazer isso. Por exemplo, você pode precisar avaliar uma expressão e usar o resultado em seus testes. O seguinte comando avaliará o título do documento e o retornará ao código Java que chama:

```java
String result = (String) evaluateJavascript("return document.title");
```

Alternativamente, você pode simplesmente querer executar um comando Javascript localmente no navegador. No código a seguir, por exemplo, definimos o foco para o campo de entrada 'firstname':

```java
	evaluateJavascript("document.getElementById('firstname').focus()");
```

E, se você estiver familiarizado com JQuery, você também pode invocar expressões JQuery:

```java
	evaluateJavascript("$('#firstname').focus()");
```

Esta é frequentemente uma estratégia útil se você precisar disparar eventos como mouse-overs que não são atualmente suportados pela API do WebDriver.

## Fazendo upload de arquivos

Fazer upload de arquivos é fácil. Arquivos para upload podem ser colocados em um local codificado (ruim) ou armazenados no classpath (melhor). Aqui está um exemplo simples:

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

## Usando expressões Fluent Matcher

Ao escrever testes de aceitação, você frequentemente se encontra expressando expectativas sobre objetos de domínio individuais ou coleções de objetos de domínio. Por exemplo, se você está testando um recurso de busca multi-critério, você vai querer saber se a aplicação encontra os registros que você esperava. Você pode ser capaz de fazer isso de maneira muito precisa (por exemplo, sabendo exatamente quais valores de campo você espera), ou você pode querer tornar seus testes mais flexíveis expressando os intervalos de valores que seriam aceitáveis. O Serenity fornece alguns recursos que facilitam a escrita de testes de aceitação para esse tipo de caso.

No restante desta seção, estudaremos alguns exemplos baseados em testes para o site de busca Maven Central. Este site permite que você pesquise no repositório Maven por artefatos Maven e veja os detalhes de um artefato específico.

Usaremos alguns testes de regressão imaginários para este site para ilustrar como os matchers do Serenity podem ser usados para escrever testes mais expressivos. O primeiro cenário que consideraremos é simplesmente pesquisar um artefato pelo nome e garantir que apenas artefatos correspondentes a este nome apareçam na lista de resultados. Poderíamos expressar este critério de aceitação informalmente da seguinte maneira:

- Dado que o desenvolvedor está na página de busca,
- E o desenvolvedor pesquisa por artefatos chamados 'Serenity'
- Então o desenvolvedor deve ver pelo menos 16 artefatos Serenity, cada um com um Artifact Id único

No JUnit 5, um teste Serenity para este cenário poderia parecer com este:

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
Se você ainda está usando JUnit 4 com `@RunWith(SerenityRunner.class)`, observe que o suporte ao JUnit 4 está obsoleto a partir do Serenity 5.0.0 e será removido no Serenity 6.0.0. Por favor, migre para o JUnit 5 usando `@ExtendWith(SerenityJUnit5Extension.class)`.
:::

Vamos ver como o teste nesta classe é implementado. O teste `should_find_the_right_number_of_artifacts()` poderia ser expresso da seguinte forma:

. Quando abrimos a página de busca

. E pesquisamos por artefatos contendo a palavra 'Serenity'

. Então devemos ver uma lista de artefatos onde cada Group ID começa com "net.Serenity", cada Artifact ID é único, e que há pelo menos 16 dessas entradas exibidas.

A implementação desses passos é ilustrada aqui:

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

Os primeiros dois passos são implementados por métodos relativamente simples. No entanto, o terceiro passo é mais interessante. Vamos olhá-lo mais de perto:

```java
    @Step
    public void should_see_artifacts_where(BeanMatcher... matchers) {
        shouldMatch(onSearchResultsPage().getSearchResults(), matchers);
    }
```

Aqui, estamos passando um número arbitrário de expressões para o método. Essas expressões são na verdade 'matchers', instâncias da classe BeanMatcher. Não que você normalmente precise se preocupar com esse nível de detalhe - você cria essas expressões matcher usando um conjunto de métodos estáticos fornecidos na classe BeanMatchers. Então você normalmente passaria expressões razoavelmente legíveis como `the("GroupId", startsWith("net.Serenity"))` ou `each("ArtifactId").isDifferent()`.

O método `shouldMatch()` da classe BeanMatcherAsserts recebe um único objeto Java, ou uma coleção de objetos Java, e verifica se pelo menos alguns dos objetos correspondem às restrições especificadas pelos matchers. No contexto de testes web, esses objetos são tipicamente POJOs fornecidos pelo Page Object para representar o objeto ou objetos de domínio exibidos em uma tela.

Existem várias expressões matcher diferentes para escolher. O matcher mais comumente usado apenas verifica o valor de um campo em um objeto. Por exemplo, suponha que você está usando o objeto de domínio mostrado aqui:

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

Você poderia escrever um teste para garantir que uma lista de Persons contenha pelo menos uma pessoa chamada "Bill" usando o método estático "the", como mostrado aqui:

```java
    List<Person> persons = Arrays.asList(new Person("Bill", "Oddie"), new Person("Tim", "Brooke-Taylor"));

    shouldMatch(persons, the("firstName", is("Bill"))
```

O segundo parâmetro no método the() é um matcher Hamcrest, o que lhe dá uma grande flexibilidade com suas expressões. Por exemplo, você também poderia escrever o seguinte:

```java
    List<Person> persons = Arrays.asList(new Person("Bill", "Oddie"), new Person("Tim", "Brooke-Taylor"));

    shouldMatch(persons, the("firstName", is(not("Tim"))));
    shouldMatch(persons, the("firstName", startsWith("B")));
```

Você também pode passar múltiplas condições:

```java
    List<Person> persons = Arrays.asList(new Person("Bill", "Oddie"), new Person("Tim", "Brooke-Taylor"));

    shouldMatch(persons, the("firstName", is("Bill"), the("lastName", is("Oddie"));
```

O Serenity também fornece a classe DateMatchers, que permite aplicar matches Hamcrest a Dates Java padrão e DateTimes do `JodaTime`. Os seguintes exemplos de código ilustram como estes podem ser usados:

```java
    DateTime january1st2010 = new DateTime(2010,01,01,12,0).toDate();
    DateTime may31st2010 = new DateTime(2010,05,31,12,0).toDate();

    the("purchaseDate", isBefore(january1st2010))
    the("purchaseDate", isAfter(january1st2010))
    the("purchaseDate", isSameAs(january1st2010))
    the("purchaseDate", isBetween(january1st2010, may31st2010))
```

Você às vezes também precisa verificar restrições que se aplicam a todos os elementos em consideração. A mais simples delas é verificar se todos os valores de campo para um campo específico são únicos. Você pode fazer isso usando o método `each()`:

```java
    shouldMatch(persons, each("lastName").isDifferent())
```

Você também pode verificar se o número de elementos correspondentes corresponde ao que você está esperando. Por exemplo, para verificar que há apenas uma pessoa chamada Bill, você poderia fazer isso:

```java
     shouldMatch(persons, the("firstName", is("Bill"), the_count(is(1)));
```

Você também pode verificar os valores mínimo e máximo usando os métodos max() e min(). Por exemplo, se a classe Person tivesse um método `getAge()`, poderíamos garantir que toda pessoa tenha mais de 21 e menos de 65 anos fazendo o seguinte:

```java
     shouldMatch(persons, min("age", greaterThanOrEqualTo(21)),
                          max("age", lessThanOrEqualTo(65)));
```

Esses métodos funcionam com objetos Java normais, mas também com Maps. Então o seguinte código também funcionará:

```java
    Map<String, String> person = new HashMap<String, String>();
    person.put("firstName", "Bill");
    person.put("lastName", "Oddie");

    List<Map<String,String>> persons = Arrays.asList(person);
    shouldMatch(persons, the("firstName", is("Bill"))
```

A outra coisa boa sobre esta abordagem é que os matchers funcionam bem com os relatórios do Serenity. Então, quando você usa a classe BeanMatcher como um parâmetro em seus passos de teste, as condições expressas no passo serão exibidas no relatório de teste.

Existem dois padrões de uso comuns ao construir Page Object e passos que usam este tipo de matcher. O primeiro é escrever um método de Page Object que retorna a lista de objetos de domínio (por exemplo, Persons) exibidos na tabela. Por exemplo, o método getSearchResults() usado no passo should_see_artifacts_where() poderia ser implementado da seguinte forma:

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

O segundo é acessar o conteúdo da tabela HTML diretamente, sem modelar explicitamente os dados contidos na tabela. Esta abordagem é mais rápida e mais eficaz se você não espera reutilizar o objeto de domínio em outras páginas. Veremos como fazer isso a seguir.

### Trabalhando com Tabelas HTML

Como tabelas HTML ainda são amplamente usadas para representar conjuntos de dados em aplicações web, o Serenity vem com a classe HtmlTable, que fornece vários métodos úteis que facilitam a escrita de Page Object que contêm tabelas. Por exemplo, o método rowsFrom retorna o conteúdo de uma tabela HTML como uma lista de Maps, onde cada mapa contém os valores das células para uma linha indexados pelo cabeçalho correspondente, como mostrado aqui:

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

Isso economiza muita digitação - nosso método `getSearchResults()` agora fica assim:

```java
    public List<Map<String, String>> getSearchResults() {
        return rowsFrom(resultTable);
    }
```

E como os matchers do Serenity funcionam tanto com objetos Java quanto com Maps, as expressões matcher serão muito semelhantes. A única diferença é que os Maps retornados são indexados pelos valores de texto contidos nos cabeçalhos da tabela, em vez de por nomes de propriedade amigáveis ao Java.

Você também pode ler tabelas sem cabeçalhos (ou seja, elementos `<th>`) especificando seus próprios cabeçalhos usando o método `withColumns`. Por exemplo:

```java
    List<Map<Object, String>> tableRows =
                    HtmlTable.withColumns("First Name","Last Name", "Favorite Colour")
                             .readRowsFrom(page.table_with_no_headings);
```

Você também pode usar a classe HtmlTable para selecionar linhas específicas dentro de uma tabela para trabalhar. Por exemplo, outro cenário de teste para a página de Busca Maven envolve clicar em um artefato e exibir os detalhes para esse artefato. O teste para isso poderia parecer algo assim:

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

Agora o método open_artifact_where() precisa clicar em uma linha específica na tabela. Este passo fica assim:

```java
    @Step
    public void open_artifact_where(BeanMatcher... matchers) {
        onSearchResultsPage().clickOnFirstRowMatching(matchers);
    }
```

Então estamos efetivamente delegando para o Page Object, que faz o trabalho real. O método correspondente do Page Object fica assim:

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

A parte interessante aqui é a primeira linha do método, onde usamos o método filterRows(). Este método retornará uma lista de WebElements que correspondem aos matchers que você passou. Este método torna relativamente fácil selecionar as linhas que você está interessado para tratamento especial.

## Mudando para outra página

Um método, switchToPage() é fornecido na classe PageObject para tornar conveniente retornar um novo PageObject após a navegação de dentro de um método de uma classe PageObject. Por exemplo,

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

## Estratégias de carregamento de coleção de WebElement

O Selenium permite que você use as anotações `@FindBy` e `@FindAll` para carregar coleções de elementos web, como ilustrado aqui:

```java
@FindBy(css='#colors a')
List<WebElement> options
```

Se você está trabalhando com uma aplicação assíncrona, essas listas podem levar tempo para carregar, então o Selenium pode lhe dar uma lista vazia porque os elementos ainda não carregaram.

O Serenity permite que você ajuste esse comportamento de duas maneiras. A primeira é usar o DSL de espera para carregar os elementos diretamente, por exemplo:

```java
withTimeoutOf(5, SECONDS).waitForPresenceOf(By.cssSelector("#colors a"))
```

Alternativamente, você pode usar a propriedade `serenity.webdriver.collection_loading_strategy` para definir como o Serenity carrega coleções de elementos web ao usar as anotações `@FindBy` e `@FindAll`. Existem três opções:

- Optimistic
- Pessimistic (padrão)
- Paranoid

Optimistic só esperará até que o campo seja definido. Este é o comportamento nativo do Selenium.

Pessimistic esperará até que pelo menos o primeiro elemento seja exibido. Este é atualmente o padrão.

Paranoid esperará até que todos os elementos sejam exibidos. Isso pode ser lento para listas longas.

## Trabalhando com métodos de fixture

Quando um passo de UI falha em um teste Serenity, a instância do WebDriver é desabilitada para o resto do teste. Isso evita esperas desnecessárias enquanto o teste percorre os passos subsequentes (o que ele precisa fazer para documentar os passos do teste). A exceção a esta regra é no caso de métodos de fixture, como métodos anotados com a anotação `@AfterEach` no JUnit 5 (ou `@After` no JUnit 4) ou Cucumber.

Nesses métodos, a instância do WebDriver pode ser usada normalmente. Além das anotações conhecidas do JUnit e Cucumber, qualquer anotação começando com a palavra `After` será considerada um método de fixture.

Por exemplo, suponha que você precise excluir as contas de cliente via UI no final de cada teste. Você já tem uma biblioteca de passos `AdminSteps` com um método `deleteAllCustomerAccounts()` que realiza esta tarefa. Você poderia garantir que todas as contas de cliente sejam excluídas assim:

```java
@Steps
AdminSteps asAdministrator;

...

@AfterEach
void deleteUserAccounts() {
    asAdministrator.deleteAllCustomerAccounts();
}
```

Isso torna fácil realizar operações de teardown ou limpeza que usam a interface do usuário, potencialmente reutilizando passos ou Task que são usados em outros lugares nos testes.

Você também pode sobrescrever esse comportamento a qualquer momento chamando o método `reenableDrivers()`, como mostrado aqui:

```java
Serenity.webdriver().reenableDrivers();
```

## Estendendo a Integração WebDriver do Serenity

O Serenity oferece uma maneira simples de estender as capacidades padrão do WebDriver e personalizar as atividades de criação e encerramento do driver. Simplesmente implemente as interfaces `BeforeAWebdriverScenario` e/ou `AfterAWebDriverScenario` (ambas estão no pacote `net.serenitybdd.core.webdriver.enhancers`). O Serenity executará classes `BeforeAWebdriverScenario` logo antes de uma instância de driver ser criada, permitindo que você adicione opções personalizadas às capacidades do driver. Quaisquer `AfterAWebDriverScenario` são executadas no final de um teste, logo antes do driver ser fechado.

### A interface BeforeAWebdriverScenario

O `BeforeAWebdriverScenario` é usado para aprimorar o objeto `Capabilities` que será passado para a instância do WebDriver quando um novo driver for criado. A chamada do método passa o driver solicitado e o objeto `TestOutcome`, que contém informações sobre o nome e as tags usadas para este teste. Também passa as `EnvironmentVariables`, que lhe dão acesso à configuração do ambiente atual. Um exemplo de um simples `BeforeAWebdriverScenario` é mostrado abaixo:

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

### A interface AfterAWebdriverScenario

O `AfterAWebdriverScenario` é chamado no final de um teste, logo antes do driver ser fechado, e uma vez que o resultado do teste é conhecido. O resultado do teste (e outros detalhes) pode ser obtido do parâmetro `TestOutcome`. Isso permite que quaisquer últimas manipulações ou verificações sejam realizadas no driver, antes do final do teste. O seguinte exemplo verifica o resultado do teste que acabou de terminar e adiciona um cookie com um valor dependendo do resultado do teste:

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

Se você precisa realizar alguma ação na instância do driver antes de cada teste, você pode implementar a classe `CustomDriverEnhancer`. Note que isso será chamado imediatamente após o driver ser criado, e antes de qualquer página ser aberta, então o número de ações é relativamente limitado.

### Configurando os pacotes de extensão

A última coisa que você precisa fazer é dizer ao Serenity em qual pacote ele precisa procurar suas classes de extensão. Adicione o pacote, ou um pacote pai, à sua configuração do Serenity usando o `serenity.extension.packages`.

`serenity.extension.packages=com.acme.myserenityextensions`

Você pode encontrar um exemplo de como essas classes são implementadas em um caso de uso real no módulo [serenity-browserstack](https://github.com/serenity-bdd/serenity-core/tree/master/serenity-browserstack/src/main/java/net/serenitybdd/browserstack) no Github.

### Implementações personalizadas de WebDriver

Você pode adicionar seu próprio provedor de WebDriver personalizado implementando a interface DriverSource. Primeiro, você precisa configurar as seguintes propriedades do sistema (por exemplo, no seu arquivo `serenity.properties`):

```
webdriver.driver = provided
webdriver.provided.type = mydriver
webdriver.provided.mydriver = com.acme.MyPhantomJSDriver
thucydides.driver.capabilities = mydriver
```

Seu driver personalizado deve implementar a interface DriverSource, como mostrado aqui:

```java
public class MyPhantomJSDriver implements DriverSource {

    @Override
    public WebDriver newDriver() {
        try {
            DesiredCapabilities capabilities = DesiredCapabilities.phantomjs();
            // Adicionar
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

Note que se você usar drivers personalizados você será totalmente responsável por configurar e instanciar a instância do navegador, e as opções de configuração do Serenity relacionadas ao driver não serão aplicadas. Geralmente recomendamos usar drivers personalizados apenas para circunstâncias muito excepcionais, e usar classes `BeforeAWebdriverScenario` para a maioria dos requisitos de configuração personalizada.

## Usando a interface HasAuthentication

O Selenium 4 suporta a interface `HasAuthentication`, que indica que um driver suporta autenticação em um site de alguma forma. Os drivers do Serenity integram-se perfeitamente com a interface `HasAuthentication`, então você pode usá-la da mesma forma que usaria no Selenium 4. Por exemplo, para registrar um nome de usuário e senha para usar em todas as páginas, você poderia adicionar o seguinte código antes de abrir um site:

```java
    getDriver().register(UsernameAndPassword.of("scott", "tiger")
```

Se a autenticação é necessária apenas em certas páginas, você também pode usar um predicado:

```java
        Predicate<URI> onlyAuthenticateOnTheLoginPage = uri -> uri.getPath().endsWith("/login");
        getDriver().register(onlyAuthenticateOnTheLoginPage, UsernameAndPassword.of("scott", "tiger"));
```
