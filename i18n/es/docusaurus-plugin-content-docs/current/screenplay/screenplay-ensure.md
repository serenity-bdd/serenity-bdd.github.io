---
id: screenplay_ensure
sidebar_position: 4
---
# Haciendo Aserciones en Screenplay con Serenity Ensure
## Introduccion
Las pruebas web son un caso de uso comun para los Scenario de Screenplay, donde tratamos de modelar el comportamiento e interacciones del usuario con el sistema. En esta seccion, aprenderemos como interactuar con una aplicacion web usando la integracion de Screenplay con WebDriver.

Hemos visto como hacer aserciones usando el metodo `should()` con
Target o Question combinados con Matcher de Hamcrest, asi:

```java
sam.attemptsTo(
  Enter.theValue("40").into(AGE_FIELD).thenHit(Keys.ENTER)
);

sam.should(
    seeThat(the(AGE_FIELD), hasValue("40"))
);
```

En el codigo mostrado aqui, el metodo `the()` es un import estatico de la
clase `WebElementQuestion`, y `hasValue()` es un import estatico de
la clase `WebElementStateMatchers`. Esto es bastante flexible, ya que puedes
agregar Matcher personalizados facilmente. Sin embargo, significa que necesitas saber
que Matcher existen, y cuales pueden usarse en diferentes
circunstancias.

## Introduciendo Serenity Ensure
Serenity Screenplay tambien proporciona un enfoque alternativo, que muchos desarrolladores encuentran mas facil de usar y mas rapido de escribir. Este enfoque usa la clase `Ensure`. La clase `Ensure` produce un `Performable`, asi que puedes integrarlos directamente en el metodo `attemptsTo()`. Tambien tiene un DSL muy legible y te permite usar autocompletado para descubrir las aserciones que puedes usar para diferentes valores, haciendo que escribir aserciones sea mas facil y rapido. Un ejemplo de codigo equivalente al anterior puede verse aqui:

```java
sam.attemptsTo(
    Enter.theValue("40").into(AGE_FIELD).thenHit(Keys.ENTER),
    Ensure.that(AGE).text().isEqualTo("40")
);
```

En esta seccion, aprenderas como usar _Serenity Ensure_ para escribir aserciones fluidas para tus propios proyectos.

## Agregando Serenity Ensure a tu proyecto

Serenity Ensure necesita una dependencia extra en tu script de compilacion. Para
Maven, agrega la dependencia `serenity-ensure` a tu archivo `pom.xml`:

```xml
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-ensure</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
```

Y en Gradle, necesitas agregar la siguiente dependencia:

```groovy
testCompile "net.serenity-bdd:serenity-screenplay-webdriver:${serenity.version}"
```

## Tu primer test con Ensure

Un test `Ensure` muy simple puede verse aqui:

```java
Actor aster = Actor.named("Aster");

int age = 20;

aster.attemptsTo(
    Ensure.that(age).isEqualTo(20)
);
```

Casi todas las aserciones `Ensure` comienzan con el metodo `Ensure.that()`. Este metodo toma el valor siendo probado como parametro (en este
caso un entero). A continuacion viene el metodo de asercion real.

## Aserciones sobre numeros

Puedes usar autocompletado en tu IDE para ver el rango de aserciones
disponibles. Para enteros, longs y numeros de punto flotante, las
aserciones incluyen:

| Asercion          | Ejemplo     |
| -----------        | ----------- |
| isEqualTo          | `Ensure.that(age).isEqualTo(18)`                |
| isNotEqualTo       | `Ensure.that(age).isNotEqualTo(65)`             |
| isGreaterThan      | `Ensure.that(age).isGreaterThan(18)`            |
| isGreaterThanOrEqualTo | `Ensure.that(age).isGreaterThanOrEqualTo(20)` |
| isLessThan         | `Ensure.that(age).isLessThan(100)`              |
| isBetween          | `Ensure.that(age).isBetween(18,25)`             |
| isStrictlyBetween  | `Ensure.that(age).isStrictlyBetween(20,25)`     |

Para doubles y floats, tambien puedes usar la asercion `isCloseTo()`:

```java
float creditScore = 9.8F;

aster.attemptsTo(
    Ensure.that(creditScore).isCloseTo(9.81F, 0.01F)
);
```

## Aserciones sobre Strings

Otro requisito comun es hacer aserciones sobre Strings. Un
ejemplo se muestra aqui:

```java
String name = "Bill";
aster.attemptsTo(
    Ensure.that(name).isEqualToIgnoringCase("BILL")
);
```

Otras aserciones basicas de comparacion sobre Strings incluyen las siguientes:

| Asercion          | Ejemplo     |
| -----------        | ----------- |
| isEqualTo          | `Ensure.that(name).isEqualTo("Bill")`           |
| isNotEqualTo       | `Ensure.that(name).isNotEqualTo("Joe")`         |
| isGreaterThan      | `Ensure.that(name).isGreaterThan("Alfred")`     |
| isGreaterThanOrEqualTo | `Ensure.that(name).isGreaterThanOrEqualTo("Al")` |
| isLessThan         | `Ensure.that(name).isLessThan("Carrie")`        |
| isBetween          | `Ensure.that(name).isBetween("Bill","Carrie")`  |
| isStrictlyBetween  | `Ensure.that(name).isStrictlyBetween("Al",25)`  |

### Contenido de String

La clase `Ensure` tambien tiene varias aserciones relacionadas con el contenido
de strings. Por ejemplo:

```java
String colors = "Red Green Blue";
aster.attemptsTo(
    Ensure.that(colors).contains("Green")
);
```

| Asercion          | Ejemplo     |
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

### Tamano de String
Tambien hay algunas aserciones para verificar la longitud del
string. Por ejemplo:

```java
String colors = "Red Green Blue";
aster.attemptsTo(
    Ensure.that(colors).hasSizeGreaterThan(3)
);
```

| Asercion          | Ejemplo     |
| -----------        | ----------- |
| hasSize            | `Ensure.that("red").hasSize(3)`                 |
| hasSizeGreaterThan | `Ensure.that("red").hasSizeGreaterThan(2)`      |
| hasSizeGreaterThanOrEqualTo | `Ensure.that("red").hasSizeGreaterThanOrEqualTo(3)` |
| hasSizeLessThan    | `Ensure.that("red").hasSizeLessThan(4)`         |
| hasSizeLessThanOrEqualTo | `Ensure.that("red").hasSizeLessThanOrEqualTo(3)` |
| hasSizeBetween     | `Ensure.that("red").hasSizeBetween(1,5)`        |
| hasLineCount       | `Ensure.that(colors).hasLineCount(1)`           |

## Aserciones usando expresiones Lambda

Otro truco util es usar una expresion Lambda de Java 8 para hacer la
verificacion. Puedes usar el constructo `Ensure.that(...).matches(...)` para pasar
un predicado lambda que determinara si la declaracion `Ensure`
debe pasar o fallar.

Por ejemplo:

```java
String actualColor = "green";

aster.attemptsTo(
    Ensure.that(actualColor).matches("is an RGB color",
                              color -> color.equals("red")
                                       || color.equals("blue")
                                       || color.equals("green"))
);
```

## Aserciones negativas

Puedes negar una declaracion `Ensure.that()` simplemente incluyendo el
metodo `not()`. Por ejemplo:

```java
String colors = "Red Green Blue";
aster.attemptsTo(
    Ensure.that(colors).not().contains("Cyan")
);
```

## Trabajando con fechas y horas

La clase `Ensure` proporciona algunos metodos especiales para fechas y horas.
Para variables `LocalTime`, podemos usar `Ensure.that(...).isBefore()` y
`Ensure.that(...).isAfter()` para comparar dos horas, como podemos ver aqui:

```java
LocalTime tenInTheMorning = LocalTime.of(10,0);
LocalTime twoInTheAfternoon = LocalTime.of(14,0);

aster.attemptsTo(
    Ensure.that(tenInTheMorning).isBefore(twoInTheAfternoon)
);
```

Para variables `LocalDate`, tenemos `isBefore()` e `isAfter()`, asi como
varios otros, como el metodo `isDayOfWeek()` ilustrado
aqui:

```java
LocalDate firstOfJanuary = LocalDate.of(2000,1,1);

aster.attemptsTo(
    Ensure.that(firstOfJanuary).isDayOfWeek(DayOfWeek.SATURDAY)
);
```

Otras aserciones relacionadas con fechas incluyen:

| Asercion          | Ejemplo     |
| -----------        | ----------- |
| isDayOfWeek        | `Ensure.that(firstOfJanuary).isDayOfWeek(SATURDAY)` |
| isDayOfMonth       | `Ensure.that(firstOfJanuary).isDayOfMonth(1)`   |
| isInTheMonthOf     | `Ensure.that(firstOfJanuary).isInTheMonthOf(JANUARY)` |
| isTheYear          | `Ensure.that(firstOfJanuary).isTheYear(2000)`   |

## Trabajando con colecciones

La clase `Ensure` te da un rango de metodos para hacer aserciones sobre
colecciones. Esto puede ser tan simple como verificar si un elemento
aparece en una coleccion: podemos hacer esto usando el
constructo `Ensure.that(...).isIn(...)`:

```java
List<String> colors = Arrays.asList("red", "green", "blue");

aster.attemptsTo(
    Ensure.that("red").isIn(colors)
);
```

Supongamos que tenemos las siguientes listas:

```java
List<String> sameColors = Arrays.asList("red", "green", "blue");
List<String> differentColors = Arrays.asList("red", "green", "cyan");
List<String> allColors = Arrays.asList("red", "green", "blue","yellow","cyan");
List<String> lastColors = Arrays.asList("yellow","cyan");
List<String> redAndPink = Arrays.asList("red", "pink");
List<String> noColors = Arrays.asList();
```

Aqui hay algunos ejemplos de otros metodos de asercion usando estas
colecciones:

## Aserciones sobre igualdad y tamano de listas

Las siguientes aserciones son utiles si necesitas verificar el tamano de una
coleccion, o si es equivalente a otra coleccion.

| Asercion          | Ejemplo     |
| -----------        | ----------- |
| isEqualTo          | `Ensure.that(colors).isEqualTo(sameColors)`     |
| isEmpty            | `Ensure.that(noColors).isEmpty()`               |
| isNotEmpty         | `Ensure.that(colors).isNotEmpty()`              |
| hasSize            | `Ensure.that(colors).hasSize(3)`                |
| hasSizeGreaterThan | `Ensure.that(colors).hasSizeGreaterThan(2)`     |
| hasSizeLessThan    | `Ensure.that(colors).hasSizeLessThan(4)`        |
| hasSizeBetween     | `Ensure.that(colors).hasSizeBetween(2,4)`       |
| hasSameSizeAs      | `Ensure.that(colors).hasSameSize(differentColors)`  |

# Aserciones sobre contenido de listas

A menudo necesitamos verificar el contenido de una coleccion. Podemos hacer esto
usando un rango de aserciones *contains*, como se ilustra aqui:

```java
List<String> colors = Arrays.asList("red", "green", "blue");

aster.attemptsTo(
    Ensure.that(contains).contains("red")
);
```

Algunas de las otras aserciones *contains* se listan en la tabla de abajo:

| Asercion          | Ejemplo     |
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

## Comparando elementos de lista con Lambdas de Java 8

Las expresiones lambda proporcionan una forma poderosa de hacer aserciones arbitrarias
sobre el contenido de una coleccion. Podemos usar
`Ensure.that(...).allMatch()`, `Ensure.that(...).anyMatch()` y
`Ensure.that(...).noneMatch()` para hacer esto. Por ejemplo, el siguiente
codigo aserta que cada elemento en una coleccion tiene 4 caracteres de largo:

```java
List<String> colors = ImmutableList.of("blue", "cyan", "pink");

aster.attemptsTo(
    Ensure.that(colors).allMatch("4 characters long",
                                 it -> it.length() == 4)
);
```

Ten en cuenta que cuando usamos una expresion Lambda, necesitamos incluir una
descripcion de la expectativa antes de proporcionar la expresion lambda
misma. Esta descripcion se usara en los reportes en caso de que la
asercion falle.

El metodo *anyMatch* verifica que existe al menos un elemento en una
coleccion que coincide con un predicado especificado. Un ejemplo se muestra aqui:

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

El metodo *noneMatch* verifica que no existen elementos en una coleccion
que coincidan con cierta condicion.

```java
List<String> colors = ImmutableList.of("orange", "cyan", "pink");

aster.attemptsTo(
    Ensure.that(colors).noneMatch("is a primary color",
                                  it ->  isAPrimaryColor(it))
);
```

Tambien puedes verificar numeros especificos de elementos, usando `atLeast`,
`noMoreThan`, y `exactly`. Por ejemplo:

```java
List<String> colors = ImmutableList.of("blue", "cyan", "red","pink");

aster.attemptsTo(
    Ensure.that(colors).atLeast(2, "is a primary color",
                                it ->  isAPrimaryColor(it))
);
```

## Usando Expectativas con Nombre

Si tienes predicados comunmente usados en tu codigo de test, puedes usar
`NamedExpectation` para hacer tu codigo mas conciso. Por ejemplo, aqui
definimos una `NamedExpectation` que coincide con colores primarios:

```java
private static final  NamedExpectation<String> IS_A_PRIMARY_COLOR
        = new NamedExpectation<>("is a primary color",
                               color -> (color.equals("red"))
                                        || (color.equals("green"))
                                        || (color.equals("blue")));
```

Podriamos usar esto en el metodo `Ensure.that()` asi:

```java
aster.attemptsTo(
    Ensure.that(colors).anyMatch(IS_A_PRIMARY_COLOR)
);
```

## Trabajando con elementos web

Al escribir pruebas de UI, necesitamos hacer aserciones sobre el estado de
elementos en una pagina web. La clase `Ensure` hace que esto sea una tarea facil.

Podemos hacer aserciones sobre elementos `Target` directamente usando el
metodo `Ensure.that()`.

```java
Target FIRST_NAME = Target.the("First name field").locatedBy("#firstName")

aster.attemptsTo(
    Ensure.that(FIRST_NAME).value().isEqualTo("Joe"),
);
```

Un enfoque mas flexible es usar la clase `ElementLocated` para
identificar un elemento. Tambien podemos localizar elementos usando localizadores `By` o
strings CSS/XPath. El siguiente codigo usa los metodos `Ensure.that()` y
`ElementLocated.by()` para verificar si el elemento localizado por
el selector CSS \"#firstName\" esta mostrado:

```java
aster.attemptsTo(
    Ensure.that(ElementLocated.by("#firstName")).isDisplayed(),
);
```

El `ElementLocated.by()` funcionara con localizadores `By`, strings
XPath/CSS o elementos `Target`, lo que significa que puedes desacoplar facilmente
tu estrategia de localizacion de tus aserciones.

### Aserciones simples de elementos web

Las aserciones mas simples sobre elementos web son verificaciones booleanas sobre
el estado del elemento. Las aserciones `Ensure.that(...).is...` te permiten
hacer aserciones sobre si un elemento esta mostrado o deshabilitado.

| Asercion          | Ejemplo     |
| -----------        | ----------- |
| isDisplayed        | `Ensure.that(FIRST_NAME).isDisplayed()`         |
| isDisabled         | `Ensure.that(FIRST_NAME).isDisabled()`          |
| isEnabled          | `Ensure.that(FIRST_NAME).isEnabled()`           |


# Verificando contenido de texto y valores de campos

Verificar valores de campos y contenido de texto es el pan de cada dia de muchos
tests web. Puedes usar `Ensure.that(...).value()` para leer el atributo value
de un campo, como se muestra aqui:

```java
aster.attemptsTo(
    Ensure.that(FIRST_NAME).value().startsWith("Joe"),
);
```

El metodo `Ensure.that(...).text()` te permite leer el texto del
elemento:

```java
aster.attemptsTo(
    Ensure.that(SEARCH_RESULTS_SUMMARY)
          .text()
          .endsWith("results for 'Serenity'"),
);
```

Tambien puedes leer el contenido de texto de un elemento usando
`Ensure.that(...).textContent()`. El contenido de texto es el valor del
atributo CSS `textContent`.

Este valor esta disponible incluso cuando un elemento no es visible, haciendolo
util en casos donde necesitas leer un conjunto completo de valores, incluso aquellos
actualmente no visibles en la pagina.

Los metodos `Ensure.that(...)` mas importantes para elementos web incluyen
los siguientes:

| Asercion          | Ejemplo     |
| -----------        | ----------- |
| value              | `Ensure.that(FIRST_NAME).value().isEqualTo("Joe")`                                             |
| text               | `Ensure.that(DESCRIPTION).text().isNotEmpty()`  |
| textContent        | `Ensure.that(DESCRIPTION).textContent().isNotEmpty()`  |
| attribute          | `Ensure.that(FIRST_NAME).attribute("title").isEqualTo("First name")`|
| selectedValue      | `Ensure.that(COLORS).selectedValue().isEqualTo("green")`   |
| selectedVisibleText | `Ensure.that(COLORS).selectedVisibleText().isEqualTo("Green")`   |
| hasCssClass        | `Ensure.that(COLORS).hasCssClass("color-list")` |
| containsElements   | `Ensure.that(RESULT_LIST).containsElements(".result-details")`|


Todos estos metodos te permiten hacer todas las aserciones de String que
vimos anteriormente.

# Convirtiendo valores a diferentes tipos

A veces es util poder hacer aserciones sobre tipos no-String.
Por ejemplo:

```java
aster.attemptsTo(
    Ensure.that(ElementLocated.by("#itemCount"))
          .value()
          .asAnInteger()
          .isGreaterThanOrEqualTo(2)
);
```

Los principales metodos de conversion incluyen:

| Asercion          | Ejemplo     |
| -----------        | ----------- |
| asAnInteger        | `Ensure.that(ITEM_COUNT).value().asAnInteger().isEqualTo(2)`   |
| asADouble          | `Ensure.that(TOTAL_COST).value().asADouble().isEqualTo(99.99d)` |
| asAFloat           | `Ensure.that(TOTAL_COST).value().asAFloat().isCloseTo(99.99f,0.01f)`|
| asABigDecimal      | `Ensure.that(TOTAL_COST).value().asABigDecimal().isEqualTo(new BigDecimal("99.99"))` |
| asADate            | `Ensure.that(CURRENT_DATE).value().asADate().isEqualTo(expectedLocalDate)`  |
| asATime            | `Ensure.that(CURRENT_TIME).value().asATime().isEqualTo(expectedLocalTime)` |
| asABoolean         | `Ensure.that(SOME_FLAG).value().asABoolean().is True()`   |


Si un valor de fecha u hora usa un formato no estandar, podemos pasar una
cadena de formato a los metodos `asADate()` o `asATime()`:

```java
aster.attemptsTo(
    Ensure.that(ElementLocated.by("#currentDate"))
          .value()
          .asADate("dd-MM-yyyy")
          .isBefore(dateLimit)
);
```

# Haciendo aserciones sobre colecciones de elementos web

Puedes hacer aserciones sobre multiples valores, por ejemplo, todos los
titulos de una lista de resultados de busqueda.

Una forma de hacer esto es usar el metodo `Ensure.thatTheSetOf()` (o su
sinonimo, `Ensure.thatAmongst()`). Este metodo toma un `Target` o un
localizador, y te permite aplicar

```java
aster.attemptsTo(
        Ensure.thatTheSetOf(ElementsLocated.by(".train-line"))
              .hasSizeGreaterThan(5)
);
```

Tambien podemos usar metodos estaticos definidos en `TheMatchingElement` para
realizar verificaciones comunmente usadas en elementos web, por ejemplo:

```java
aster.attemptsTo(
        Ensure.thatTheSetOf(ElementsLocated.by(".train-line"))
              .allMatch(TheMatchingElement.containsText("Line"))
);
```

Los principales metodos definidos en la clase `TheMatchingElement` incluyen:

| Asercion          | Ejemplo     |
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


Tambien podemos hacer aserciones sobre colecciones de valores coincidentes o el
contenido de texto de elementos coincidentes. Podemos hacer esto usando
`Ensure.that(...).values()`, `Ensure.that(...).textValues()` y
`Ensure.that(...).textContentValues()`. Por ejemplo:

```java
aster.attemptsTo(
    Ensure.that(ElementLocated.by("#colors option"))
          .values()
          .contains("red","blue","green")
);
```

### Esperando elementos y definiendo timeouts

Al trabajar con aplicaciones web asincronas, un elemento puede no estar
inmediatamente listo cuando un test interactua con el. Por defecto, Serenity
esperara 5 segundos para que un elemento este presente. Usando la clase `Ensure`,
podemos ajustar la cantidad de tiempo que necesitamos esperar para que un
elemento este disponible. Por ejemplo:

```java
Target SLOW_FIELD = Target.the("Slow field")
                          .locatedBy("#slow")

aster.attemptsTo(
        Ensure.that(SLOW_FIELD.waitingForNoMoreThan(Duration.ofSeconds(10)))
              .value()
              .isEqualTo("Marseille")
);
```

Tambien podemos incorporar un retraso en un campo `Target`, si el mismo retraso
debe aplicarse en todas partes donde se use el elemento:

```java
Target SLOW_FIELD = Target.the("Slow field")
                      .locatedBy("#slow")
                      .waitingForNoMoreThan(Duration.ofSeconds(5))
```

### Haciendo aserciones sobre la pagina actual

Tambien hay algunos metodos `Ensure` que nos permiten hacer aserciones
basicas sobre la pagina misma. Por ejemplo, puedes verificar el titulo de la pagina
asi:

```java
aster.attemptsTo(
        Ensure.thatTheCurrentPage().title().isEqualTo("Some Title")
);
```

Las aserciones a nivel de pagina tambien incluyen `currentUrl()`, `pageSource()` y
`windowHandle()`.

## Trabajando con Question de Screenplay

Hasta ahora hemos estado usando los metodos `Ensure.that*` con localizadores
de paginas web y con valores de campos. Tambien podemos usar metodos `Ensure.that*`
con Question de Screenplay arbitrarias. Esto puede usarse para escribir clases
o metodos `Question` personalizados que consultan el estado de la aplicacion
sin usar la UI, o que hacen consultas mas adaptadas de la UI.

Por ejemplo,

```java
public Question<Integer> countOf(String todoItem) {
    return Question.about("todo status").answeredBy(
            actor -> // return some value related to a particular todo item
    );
}
```

Luego podriamos usar el metodo `Ensure.thatTheAnswerTo()` para verificar el
resultado de esta Question:

```java
aster.attemptsTo(
        Ensure.thatTheAnswerTo("the count",
                               countOf("some-todo-item"))
              .isEqualTo(1)
);
```

Tambien podemos trabajar con clases `Question` que devuelven colecciones, usando
el metodo `Ensure.thatTheAnswersTo()`. Supongamos que tenemos una Question que
devuelve una lista de Strings:

```java
Question<Collection<String>> colors() {
    return Question.about("colors").answeredBy(
            actor -> // returns "red","green","blue"
    );
}
```

Luego podriamos usar el metodo `Ensure.thatTheAnswersTo()` para hacer una
asercion sobre esta Question:

```java
aster.attemptsTo(
        Ensure.thatTheAnswersTo(colors()).contains("red")
);
```

## Reportando y ocultando pasos Ensure

Cada Performable `Ensure` sera reportado en el reporte de Serenity como un
paso separado, incluyendo una breve descripcion de la expectativa.
A veces, sin embargo, queremos usar la declaracion `Ensure` como una forma de
asegurarnos de que la aplicacion esta lista para continuar los tests. En estos
casos, podemos preferir dejar la declaracion `Ensure` fuera de los reportes.

Podemos hacer esto usando el metodo `silently()`:

```java
aster.attemptsTo(
    Ensure.that(ElementLocated.by("#firstName"))
          .silently()
          .isDisplayed()
);
```
