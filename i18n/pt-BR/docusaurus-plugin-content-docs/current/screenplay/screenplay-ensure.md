---
id: screenplay_ensure
sidebar_position: 4
---
# Fazendo Asserções Screenplay com Serenity Ensure
## Introducao
Testes web sao um caso de uso comum para Scenario Screenplay, onde tentamos modelar o comportamento e as interacoes do usuario com o sistema. Nesta secao, aprenderemos como interagir com uma aplicacao web usando a integracao Screenplay WebDriver.

Vimos como fazer asserções usando o metodo `should()` com
Target ou Question combinados com matchers Hamcrest, assim:

```java
sam.attemptsTo(
  Enter.theValue("40").into(AGE_FIELD).thenHit(Keys.ENTER)
);

sam.should(
    seeThat(the(AGE_FIELD), hasValue("40"))
);
```

No codigo mostrado aqui, o metodo `the()` e um import estatico da
classe `WebElementQuestion`, e o `hasValue()` e um import estatico da
classe `WebElementStateMatchers`. Isso e bastante flexivel, pois voce pode
adicionar matchers customizados facilmente. Porem, significa que voce precisa saber
quais matchers existem e quais podem ser usados em diferentes
circunstancias.

## Apresentando o Serenity Ensure
Serenity Screenplay tambem fornece uma abordagem alternativa, que muitos desenvolvedores acham mais facil de usar e mais rapida de escrever. Esta abordagem usa a classe `Ensure`. A classe `Ensure` produz um `Performable`, entao voce pode integra-los diretamente no metodo `attemptsTo()`. Ela tambem tem uma DSL muito legivel e permite usar autocompletar para descobrir as asserções que voce pode usar para diferentes valores, tornando a escrita de asserções mais facil e rapida. Um exemplo de codigo equivalente ao acima pode ser visto aqui:

```java
sam.attemptsTo(
    Enter.theValue("40").into(AGE_FIELD).thenHit(Keys.ENTER),
    Ensure.that(AGE).text().isEqualTo("40")
);
```

Nesta secao, voce aprendera como usar o _Serenity Ensure_ para escrever asserções fluentes para seus proprios projetos.

## Adicionando Serenity Ensure ao seu projeto

Serenity Ensure precisa de uma dependencia extra no seu script de build. Para
Maven, adicione a dependencia `serenity-ensure` ao seu arquivo `pom.xml`:

```xml
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-ensure</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
```

E no Gradle, voce precisa adicionar a seguinte dependencia:

```groovy
testCompile "net.serenity-bdd:serenity-screenplay-webdriver:${serenity.version}"
```

## Seu primeiro teste Ensure

Um teste `Ensure` muito simples pode ser visto aqui:

```java
Actor aster = Actor.named("Aster");

int age = 20;

aster.attemptsTo(
    Ensure.that(age).isEqualTo(20)
);
```

Quase todas as asserções `Ensure` comecam com o metodo `Ensure.that()`. Este metodo recebe o valor sendo testado como parametro (neste
caso um inteiro). Em seguida vem o metodo de asserção propriamente dito.

## Asserções sobre numeros

Voce pode usar autocompletar na sua IDE para ver a gama de asserções
disponiveis. Para inteiros, longs e numeros de ponto flutuante, as
asserções incluem:

| Asserção          | Exemplo     |
| -----------        | ----------- |
| isEqualTo          | `Ensure.that(age).isEqualTo(18)`                |
| isNotEqualTo       | `Ensure.that(age).isNotEqualTo(65)`             |
| isGreaterThan      | `Ensure.that(age).isGreaterThan(18)`            |
| isGreaterThanOrEqualTo | `Ensure.that(age).isGreaterThanOrEqualTo(20)` |
| isLessThan         | `Ensure.that(age).isLessThan(100)`              |
| isBetween          | `Ensure.that(age).isBetween(18,25)`             |
| isStrictlyBetween  | `Ensure.that(age).isStrictlyBetween(20,25)`     |

Para doubles e floats, voce tambem pode usar a asserção `isCloseTo()`:

```java
float creditScore = 9.8F;

aster.attemptsTo(
    Ensure.that(creditScore).isCloseTo(9.81F, 0.01F)
);
```

## Asserções sobre Strings

Outro requisito comum e fazer asserções sobre Strings. Um
exemplo e mostrado aqui:

```java
String name = "Bill";
aster.attemptsTo(
    Ensure.that(name).isEqualToIgnoringCase("BILL")
);
```

Outras asserções basicas de comparacao sobre Strings incluem as seguintes:

| Asserção          | Exemplo     |
| -----------        | ----------- |
| isEqualTo          | `Ensure.that(name).isEqualTo("Bill")`           |
| isNotEqualTo       | `Ensure.that(name).isNotEqualTo("Joe")`         |
| isGreaterThan      | `Ensure.that(name).isGreaterThan("Alfred")`     |
| isGreaterThanOrEqualTo | `Ensure.that(name).isGreaterThanOrEqualTo("Al")` |
| isLessThan         | `Ensure.that(name).isLessThan("Carrie")`        |
| isBetween          | `Ensure.that(name).isBetween("Bill","Carrie")`  |
| isStrictlyBetween  | `Ensure.that(name).isStrictlyBetween("Al",25)`  |

### Conteudo de Strings

A classe `Ensure` tambem tem varias asserções relacionadas ao conteudo de
strings. Por exemplo:

```java
String colors = "Red Green Blue";
aster.attemptsTo(
    Ensure.that(colors).contains("Green")
);
```

| Asserção          | Exemplo     |
| -----------        | ----------- |
| containsIgnoringCase | `Ensure.that(colors).containsIgnoringCase("RED")` |
| containsOnlyDigits | `Ensure.that("123").containsOnlyDigits()`       |
| containsOnlyLettersOrDigits | `Ensure.that("abc123").containsOnlyLettersOrDigits()` |
| containsOnlyLetters | `Ensure.that("abc").containsOnlyLetters()`      |
| containsWhitespaces | `Ensure.that("Red Green").containsWhitespaces() |
| containsOnlyWhitespaces | `Ensure.that("   ").containsOnlyWhitespaces()`  |
| startsWith         | `Ensure.that(colors).startsWith("Red")`         |
| endsWith           | `Ensure.that(colors).endsWith("Blue")`          |
| matches            | `Ensure.that(colors).matches("Red (.*) Blue")`  |
| doesNotContain     | `Ensure.that(colors).doesNotContain("cyan")`    |
| isBlank()          | `Ensure.that("  ").isBlank()`                   |
| isNotBlank()       | `Ensure.that(colors).isNotBlank()`              |
| isEmpty()          | `Ensure.that("").isEmpty()`                     |
| isNotEmpty()       | `Ensure.that(colors).isNotEmpty()`              |
| isInLowerCase()    | `Ensure.that("red").isInLowerCase()`            |
| isInUpperCase()    | `Ensure.that("RED").isInUpperCase()`            |
| isSubstringOf      | `Ensure.that("Green").isSubstringOf(colors)`    |

### Tamanho de String
Tambem existem algumas asserções para verificar o comprimento da
string. Por exemplo:

```java
String colors = "Red Green Blue";
aster.attemptsTo(
    Ensure.that(colors).hasSizeGreaterThan(3)
);
```

| Asserção          | Exemplo     |
| -----------        | ----------- |
| hasSize            | `Ensure.that("red").hasSize(3)`                 |
| hasSizeGreaterThan | `Ensure.that("red").hasSizeGreaterThan(2)`      |
| hasSizeGreaterThanOrEqualTo | `Ensure.that("red").hasSizeGreaterThanOrEqualTo(3)` |
| hasSizeLessThan    | `Ensure.that("red").hasSizeLessThan(4)`         |
| hasSizeLessThanOrEqualTo | `Ensure.that("red").hasSizeLessThanOrEqualTo(3)` |
| hasSizeBetween     | `Ensure.that("red").hasSizeBetween(1,5)`        |
| hasLineCount       | `Ensure.that(colors).hasLineCount(1)`           |

## Asserções usando expressoes Lambda

Outro truque util e usar uma expressao Lambda do Java 8 para fazer a
verificacao. Voce pode usar a construcao `Ensure.that(...).matches(...)` para passar
um predicado lambda que determinara se a instrucao `Ensure`
deve passar ou falhar.

Por exemplo:

```java
String actualColor = "green";

aster.attemptsTo(
    Ensure.that(actualColor).matches("is an RGB color",
                              color -> color.equals("red")
                                       || color.equals("blue")
                                       || color.equals("green"))
);
```

## Asserções negativas

Voce pode negar uma instrucao `Ensure.that()` simplesmente incluindo o
metodo `not()`. Por exemplo:

```java
String colors = "Red Green Blue";
aster.attemptsTo(
    Ensure.that(colors).not().contains("Cyan")
);
```

## Trabalhando com datas e horas

A classe `Ensure` fornece alguns metodos especiais para datas e horas.
Para variaveis `LocalTime`, podemos usar `Ensure.that(...).isBefore()` e
`Ensure.that(...).isAfter()` para comparar duas horas, como podemos ver aqui:

```java
LocalTime tenInTheMorning = LocalTime.of(10,0);
LocalTime twoInTheAfternoon = LocalTime.of(14,0);

aster.attemptsTo(
    Ensure.that(tenInTheMorning).isBefore(twoInTheAfternoon)
);
```

Para variaveis `LocalDate`, temos `isBefore()` e `isAfter()`, assim como
varios outros, como o metodo `isDayOfWeek()` ilustrado
aqui:

```java
LocalDate firstOfJanuary = LocalDate.of(2000,1,1);

aster.attemptsTo(
    Ensure.that(firstOfJanuary).isDayOfWeek(DayOfWeek.SATURDAY)
);
```

Outras asserções relacionadas a datas incluem:

| Asserção          | Exemplo     |
| -----------        | ----------- |
| isDayOfWeek        | `Ensure.that(firstOfJanuary).isDayOfWeek(SATURDAY)` |
| isDayOfMonth       | `Ensure.that(firstOfJanuary).isDayOfMonth(1)`   |
| isInTheMonthOf     | `Ensure.that(firstOfJanuary).isInTheMonthOf(JANUARY)` |
| isTheYear          | `Ensure.that(firstOfJanuary).isTheYear(2000)`   |

## Trabalhando com colecoes

A classe `Ensure` oferece uma gama de metodos para fazer asserções sobre
colecoes. Isso pode ser tao simples quanto verificar se um elemento
aparece em uma colecao: podemos fazer isso usando a
construcao `Ensure.that(...).isIn(...)`:

```java
List<String> colors = Arrays.asList("red", "green", "blue");

aster.attemptsTo(
    Ensure.that("red").isIn(colors)
);
```

Suponha que tivessemos as seguintes listas:

```java
List<String> sameColors = Arrays.asList("red", "green", "blue");
List<String> differentColors = Arrays.asList("red", "green", "cyan");
List<String> allColors = Arrays.asList("red", "green", "blue","yellow","cyan");
List<String> lastColors = Arrays.asList("yellow","cyan");
List<String> redAndPink = Arrays.asList("red", "pink");
List<String> noColors = Arrays.asList();
```

Aqui estao alguns exemplos de outros metodos de asserção usando essas
colecoes:

## Asserções sobre igualdade e tamanho de listas

As seguintes asserções sao uteis se voce precisa verificar o tamanho de uma
colecao, ou se ela e equivalente a outra colecao.

| Asserção          | Exemplo     |
| -----------        | ----------- |
| isEqualTo          | `Ensure.that(colors).isEqualTo(sameColors)`     |
| isEmpty            | `Ensure.that(noColors).isEmpty()`               |
| isNotEmpty         | `Ensure.that(colors).isNotEmpty()`              |
| hasSize            | `Ensure.that(colors).hasSize(3)`                |
| hasSizeGreaterThan | `Ensure.that(colors).hasSizeGreaterThan(2)`     |
| hasSizeLessThan    | `Ensure.that(colors).hasSizeLessThan(4)`        |
| hasSizeBetween     | `Ensure.that(colors).hasSizeBetween(2,4)`       |
| hasSameSizeAs      | `Ensure.that(colors).hasSameSize(differentColors)`  |

# Asserções sobre conteudo de listas

Frequentemente precisamos verificar o conteudo de uma colecao. Podemos fazer isso
usando uma gama de asserções *contains*, como ilustrado aqui:

```java
List<String> colors = Arrays.asList("red", "green", "blue");

aster.attemptsTo(
    Ensure.that(contains).contains("red")
);
```

Algumas das outras asserções *contains* estao listadas na tabela abaixo:

| Asserção          | Exemplo     |
| -----------        | ----------- |
| contains           | `Ensure.that(colors).contains("red","blue")`    |
| containsAnyOf      | `Ensure.that(colors).anyOf("red","pink")`       |
| containsOnly       | `Ensure.that(colors).containsOnly("blue","green","red")`   |
| containsExactly    | `Ensure.that(colors).containsExactly("red","blue","green")`  |
| containsExactlyInAnyOrder | `Ensure.that(colors).containsExactly("red","blue","green")`|
| doesNotContain     | `Ensure.that(colors).doesNotContain("pink")`    |
| containsElementsFrom | `Ensure.that(allColors).containsElementsFrom(colors)`  |
| containsAnyElementsOf   | `Ensure.that(colors).containsAnyElementsOf(redAndPink)` |
| containsExactlyElementsOf | `Ensure.that(colors).containsExactlyElementsOf(sameColors)`  |
| isASubsetOf        | `Ensure.that(colors).isASubsetOf(allColors)`    |
| doesNotHaveDuplicates | `Ensure.that(colors).doesNotHaveDuplicates()`   |
| startsWith         | `Ensure.that(colors).startsWith("red", "green")` |
| startsWithElementsFrom | `Ensure.that(allColors).startsWithElementsFrom(colors)`  |
| endsWith           | `Ensure.that(colors).endsWith("green","blue")`  |
| endWithElementsFrom | `Ensure.that(allColors).endWithElementsFrom(lastColors)`  |

## Combinando elementos de lista com Lambdas Java 8

Expressoes lambda fornecem uma forma poderosa de fazer asserções arbitrarias
sobre o conteudo de uma colecao. Podemos usar o
`Ensure.that(...).allMatch()`, `Ensure.that(...).anyMatch()` e
`Ensure.that(...).noneMatch()` para fazer isso. Por exemplo, o seguinte
codigo afirma que cada elemento em uma colecao tem 4 caracteres:

```java
List<String> colors = ImmutableList.of("blue", "cyan", "pink");

aster.attemptsTo(
    Ensure.that(colors).allMatch("4 characters long",
                                 it -> it.length() == 4)
);
```

Note que quando usamos uma expressao Lambda, precisamos incluir uma
descricao da expectativa antes de fornecer a propria expressao lambda.
Esta descricao sera usada nos relatorios caso a
asserção falhe.

O metodo *anyMatch* verifica se existe pelo menos um elemento em uma
colecao que corresponde a um predicado especificado. Um exemplo e mostrado aqui:

```java
@Test
public void shouldContainAtLeastOnePrimaryColor() {
    Actor aster = Actor.named("Aster");
    List<String> colors = ImmutableList.of("blue", "cyan", "pink");

    aster.attemptsTo(
        Ensure.that(colors).anyMatch("is a primary color",
                                     it ->  isAPrimaryColor(it))
    );
}

private boolean isAPrimaryColor(String color) {
    return  (color == "red")
            || (color == "green")
            || (color == "blue");
}
```

O metodo *noneMatch* verifica se nenhum elemento existe em uma colecao
que corresponda a uma certa condicao.

```java
List<String> colors = ImmutableList.of("orange", "cyan", "pink");

aster.attemptsTo(
    Ensure.that(colors).noneMatch("is a primary color",
                                  it ->  isAPrimaryColor(it))
);
```

Voce tambem pode verificar numeros especificos de elementos, usando `atLeast`,
`noMoreThan` e `exactly`. Por exemplo:

```java
List<String> colors = ImmutableList.of("blue", "cyan", "red","pink");

aster.attemptsTo(
    Ensure.that(colors).atLeast(2, "is a primary color",
                                it ->  isAPrimaryColor(it))
);
```

## Usando Named Expectations

Se voce tem predicados comumente usados no seu codigo de teste, pode usar o
`NamedExpectation` para tornar seu codigo mais conciso. Por exemplo, aqui
definimos um `NamedExpectation` que corresponde a cores primarias:

```java
private static final  NamedExpectation<String> IS_A_PRIMARY_COLOR
        = new NamedExpectation<>("is a primary color",
                               color -> (color.equals("red"))
                                        || (color.equals("green"))
                                        || (color.equals("blue")));
```

Poderiamos usar isso no metodo `Ensure.that()` assim:

```java
aster.attemptsTo(
    Ensure.that(colors).anyMatch(IS_A_PRIMARY_COLOR)
);
```

## Trabalhando com elementos web

Ao escrever testes de UI, precisamos fazer asserções sobre o estado de
elementos em uma pagina web. A classe `Ensure` torna isso uma tarefa facil.

Podemos fazer asserções sobre elementos `Target` diretamente usando o
metodo `Ensure.that()`.

```java
Target FIRST_NAME = Target.the("First name field").locatedBy("#firstName")

aster.attemptsTo(
    Ensure.that(FIRST_NAME).value().isEqualTo("Joe"),
);
```

Uma abordagem mais flexivel e usar a classe `ElementLocated` para
identificar um elemento. Tambem podemos localizar elementos usando localizadores `By` ou
strings CSS/XPath. O codigo a seguir usa os metodos `Ensure.that()` e
`ElementLocated.by()` para verificar se o elemento localizado pelo
seletor CSS \"#firstName\" esta exibido:

```java
aster.attemptsTo(
    Ensure.that(ElementLocated.by("#firstName")).isDisplayed(),
);
```

O `ElementLocated.by()` funcionara com localizadores `By`, strings
XPath/CSS ou elementos `Target`, o que significa que voce pode facilmente desacoplar
sua estrategia de localizacao das suas asserções.

### Asserções simples de elementos web

As asserções mais simples sobre elementos web sao verificacoes booleanas sobre
o estado do elemento. As asserções `Ensure.that(...).is...` permitem
que voce faca asserções sobre se um elemento esta exibido ou desabilitado.

| Asserção          | Exemplo     |
| -----------        | ----------- |
| isDisplayed        | `Ensure.that(FIRST_NAME).isDisplayed()`         |
| isDisabled         | `Ensure.that(FIRST_NAME).isDisabled()`          |
| isEnabled          | `Ensure.that(FIRST_NAME).isEnabled()`           |


# Verificando conteudo de texto e valores de campo

Verificar valores de campo e conteudo de texto e o basico de muitos
testes web. Voce pode usar `Ensure.that(...).value()` para ler o atributo value
de um campo, como mostrado aqui:

```java
aster.attemptsTo(
    Ensure.that(FIRST_NAME).value().startsWith("Joe"),
);
```

O metodo `Ensure.that(...).text()` permite ler o texto do
elemento:

```java
aster.attemptsTo(
    Ensure.that(SEARCH_RESULTS_SUMMARY)
          .text()
          .endsWith("results for 'Serenity'"),
);
```

Voce tambem pode ler o conteudo de texto de um elemento usando
`Ensure.that(...).textContent()`. O conteudo de texto e o valor do
atributo CSS `textContent`.

Este valor esta disponivel mesmo quando um elemento nao esta visivel, tornando-o
util em casos onde voce precisa ler um conjunto completo de valores, mesmo aqueles
nao atualmente visiveis na pagina.

Os metodos `Ensure.that(...)` mais importantes para elementos web incluem
os seguintes:

| Asserção          | Exemplo     |
| -----------        | ----------- |
| value              | `Ensure.that(FIRST_NAME).value().isEqualTo("Joe")`                                             |
| text               | `Ensure.that(DESCRIPTION).text().isNotEmpty()`  |
| textContent        | `Ensure.that(DESCRIPTION).textContent().isNotEmpty()`  |
| attribute          | `Ensure.that(FIRST_NAME).attribute("title").isEqualTo("First name")`|
| selectedValue      | `Ensure.that(COLORS).selectedValue().isEqualTo("green")`   |
| selectedVisibleText | `Ensure.that(COLORS).selectedVisibleText().isEqualTo("Green")`   |
| hasCssClass        | `Ensure.that(COLORS).hasCssClass("color-list")` |
| containsElements   | `Ensure.that(RESULT_LIST).containsElements(".result-details")`|


Todos esses metodos permitem que voce faca todas as asserções de String que
vimos anteriormente.

# Convertendo valores para diferentes tipos

As vezes e util poder fazer asserções sobre tipos nao-String.
Por exemplo:

```java
aster.attemptsTo(
    Ensure.that(ElementLocated.by("#itemCount"))
          .value()
          .asAnInteger()
          .isGreaterThanOrEqualTo(2)
);
```

Os principais metodos de conversao incluem:

| Asserção          | Exemplo     |
| -----------        | ----------- |
| asAnInteger        | `Ensure.that(ITEM_COUNT).value().asAnInteger().isEqualTo(2)`   |
| asADouble          | `Ensure.that(TOTAL_COST).value().asADouble().isEqualTo(99.99d)` |
| asAFloat           | `Ensure.that(TOTAL_COST).value().asAFloat().isCloseTo(99.99f,0.01f)`|
| asABigDecimal      | `Ensure.that(TOTAL_COST).value().asABigDecimal().isEqualTo(new BigDecimal("99.99"))` |
| asADate            | `Ensure.that(CURRENT_DATE).value().asADate().isEqualTo(expectedLocalDate)`  |
| asATime            | `Ensure.that(CURRENT_TIME).value().asATime().isEqualTo(expectedLocalTime)` |
| asABoolean         | `Ensure.that(SOME_FLAG).value().asABoolean().is True()`   |


Se um valor de data ou hora usar um formato nao-padrao, podemos passar uma
string de formato para os metodos `asADate()` ou `asATime()`:

```java
aster.attemptsTo(
    Ensure.that(ElementLocated.by("#currentDate"))
          .value()
          .asADate("dd-MM-yyyy")
          .isBefore(dateLimit)
);
```

# Fazendo asserções sobre colecoes de elementos web

Voce pode fazer asserções sobre multiplos valores, por exemplo, todos os
titulos de uma lista de resultados de busca.

Uma forma de fazer isso e usar o metodo `Ensure.thatTheSetOf()` (ou seu
sinonimo, `Ensure.thatAmongst()`). Este metodo recebe um `Target` ou um
localizador e permite aplicar o

```java
aster.attemptsTo(
        Ensure.thatTheSetOf(ElementsLocated.by(".train-line"))
              .hasSizeGreaterThan(5)
);
```

Tambem podemos usar metodos estaticos definidos em `TheMatchingElement` para
executar verificacoes comumente usadas em elementos web, por exemplo:

```java
aster.attemptsTo(
        Ensure.thatTheSetOf(ElementsLocated.by(".train-line"))
              .allMatch(TheMatchingElement.containsText("Line"))
);
```

Os principais metodos definidos na classe `TheMatchingElement` incluem:

| Asserção          | Exemplo     |
| -----------        | ----------- |
| isDisplayed        | `Ensure.thatTheSetOf(RESULTS).allMatch(isDisplayed())` |
| isNotDisplayed     | `Ensure.thatTheSetOf(RESULTS).noneMatch(isNotDisplayed())` |
| isDisabled         | `Ensure.thatTheSetOf(INPUT_FIELDS).atLeast(1, isDisabled())`    |
| isNotDisabled      | `Ensure.thatTheSetOf(INPUT_FIELDS).atLeast(1, isNotDisabled())`   |
| isEnabled          | `Ensure.thatTheSetOf(INPUT_FIELDS).atLeast(1, isEnabled())`      |
|                    |                                |
| isNotEnabled       | `Ensure.thatTheSetOf(INPUT_FIELDS).atLeast(1, isNotEnabled())`  |
| hasCssClass        | `Ensure.thatTheSetOf(RESULTS).noMoreThan(1, hasCssClass("selected"))` |
| hasValue           | `Ensure.thatTheSetOf(RESULTS).anyMatch(hasValue("red"))`   |
| containsText       | `Ensure.thatTheSetOf(RESULTS).anyMatch(containsText("Red"))`  |
| containsOnlyText   | `Ensure.thatTheSetOf(RESULTS).anyMatch(containsOnlyText("Red Car"))`    |
| containsElementsLo | `Ensure.thatTheSetOf(RESULTS).anyMatch(containsElementsLocatedBy(".model"))`  |


Tambem podemos fazer asserções sobre colecoes de valores correspondentes ou o
conteudo de texto de elementos correspondentes. Podemos fazer isso usando os
`Ensure.that(...).values()`, `Ensure.that(...).textValues()` e
`Ensure.that(...).textContentValues()`. Por exemplo:

```java
aster.attemptsTo(
    Ensure.that(ElementLocated.by("#colors option"))
          .values()
          .contains("red","blue","green")
);
```

### Esperando por elementos e definindo timeouts

Ao trabalhar com aplicacoes web assincronas, um elemento pode nao estar
imediatamente pronto quando um teste interage com ele. Por padrao, o Serenity
esperara 5 segundos para que um elemento esteja presente. Usando a classe `Ensure`,
podemos ajustar a quantidade de tempo que precisamos esperar para que um
elemento fique disponivel. Por exemplo:

```java
Target SLOW_FIELD = Target.the("Slow field")
                          .locatedBy("#slow")

aster.attemptsTo(
        Ensure.that(SLOW_FIELD.waitingForNoMoreThan(Duration.ofSeconds(10)))
              .value()
              .isEqualTo("Marseille")
);
```

Tambem podemos incorporar um atraso em um campo `Target`, se o mesmo atraso
deve ser aplicado em todos os lugares onde o elemento e usado:

```java
Target SLOW_FIELD = Target.the("Slow field")
                      .locatedBy("#slow")
                      .waitingForNoMoreThan(Duration.ofSeconds(5))
```

### Fazendo asserções sobre a pagina atual

Tambem existem alguns metodos `Ensure` que nos permitem fazer asserções basicas
sobre a propria pagina. Por exemplo, voce pode verificar o titulo da pagina
assim:

```java
aster.attemptsTo(
        Ensure.thatTheCurrentPage().title().isEqualTo("Some Title")
);
```

Asserções no nivel da pagina tambem incluem `currentUrl()`, `pageSource()` e
`windowHandle()`.

## Trabalhando com Question do Screenplay

Ate agora usamos os metodos `Ensure.that*` com localizadores de pagina web
e com valores de campo. Tambem podemos usar metodos `Ensure.that*` com
Question arbitrarias do Screenplay. Isso pode ser usado para escrever classes ou
metodos `Question` customizados que consultam o estado da aplicacao
sem usar a UI, ou que fazem consultas mais personalizadas da UI.

Por exemplo,

```java
public Question<Integer> countOf(String todoItem) {
    return Question.about("todo status").answeredBy(
            actor -> // return some value related to a particular todo item
    );
}
```

Poderiamos entao usar o metodo `Ensure.thatTheAnswerTo()` para verificar o
resultado desta Question:

```java
aster.attemptsTo(
        Ensure.thatTheAnswerTo("the count",
                               countOf("some-todo-item"))
              .isEqualTo(1)
);
```

Tambem podemos trabalhar com classes `Question` que retornam colecoes, usando
o metodo `Ensure.thatTheAnswersTo()`. Suponha que tivessemos uma Question que
retorna uma lista de Strings:

```java
Question<Collection<String>> colors() {
    return Question.about("colors").answeredBy(
            actor -> // returns "red","green","blue"
    );
}
```

Poderiamos entao usar o metodo `Ensure.thatTheAnswersTo()` para fazer uma
asserção sobre esta Question:

```java
aster.attemptsTo(
        Ensure.thatTheAnswersTo(colors()).contains("red")
);
```

## Relatorios e ocultando passos Ensure

Cada Performable `Ensure` sera relatado no relatorio do Serenity como um
passo separado, incluindo uma breve descricao da expectativa.
As vezes, porem, queremos usar a instrucao `Ensure` como uma forma de
garantir que a aplicacao esta pronta para continuar os testes. Nesses
casos, podemos preferir deixar a instrucao `Ensure` fora dos relatorios.

Podemos fazer isso usando o metodo `silently()`:

```java
aster.attemptsTo(
    Ensure.that(ElementLocated.by("#firstName"))
          .silently()
          .isDisplayed()
);
```
