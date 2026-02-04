---
id: step_libraries
title: Bibliotecas de Passos
sidebar_position: 4
---

# Bibliotecas de Passos do Serenity
No Serenity, os testes são divididos em passos reutilizáveis. Um princípio importante por trás do Serenity é a ideia de que é mais fácil manter um teste que usa várias camadas de abstração para esconder a complexidade por trás de diferentes partes de um teste.

Em um teste de aceitação automatizado, os passos de teste representam o nível de abstração entre o código que interage com sua aplicação (por exemplo, Page Component Objects em um teste web automatizado, que modelam partes da interface do usuário, ou endpoints de API para serviços web com os quais você precisa interagir) e histórias de nível superior (sequências de ações mais focadas no negócio que ilustram como uma determinada história de usuário foi implementada). Se seu teste automatizado não é orientado a UI (por exemplo, se ele chama um serviço web), os passos orquestram outros componentes mais técnicos, como clientes REST. Passos podem conter outros passos e são incluídos nos relatórios do Serenity. Sempre que um passo de UI é executado, uma captura de tela é armazenada e exibida no relatório.

## Dividindo testes em passos
Suponha que estamos testando um programa de Passageiro Frequente e precisamos ilustrar as seguintes regras de negócio:

- Membros devem começar com status Bronze
- Membros devem ganhar status Silver após voar 10.000 km.

Cada uma dessas pode ser dividida ainda mais em tarefas de negócio e verificações. Por exemplo, a primeira regra pode ser dividida em dois passos:
- Criar um novo membro Passageiro Frequente
- Verificar que o membro tem status Bronze

E a segunda pode ser dividida em três passos:
- Criar um novo membro Passageiro Frequente
- Fazer o membro voar 10000 km
- Verificar que o membro tem status Silver

Poderíamos expressar esses testes usando Serenity no JUnit 5 da seguinte forma:

```java
package flyer;

import net.serenitybdd.junit5.SerenityJUnit5Extension;
import net.thucydides.core.annotations.Steps;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import flyer.steps.TravellerEarningStatusPoints;

import static flyer.Status.Bronze;
import static flyer.Status.Silver;

@ExtendWith(SerenityJUnit5Extension.class)
class WhenEarningFrequentFlyerPoints {

    @Steps
    TravellerEarningStatusPoints tracy;

    @Test
    void members_should_start_with_Bronze_status() {
        // DADO
        tracy.joins_the_frequent_flyer_program();

        // ENTÃO
        tracy.should_have_a_status_of(Bronze);
    }

    @Test
    void earn_silver_after_10000_kilometers() {
        // DADO
        tracy.joins_the_frequent_flyer_program();

        // QUANDO
        tracy.flies(10000);

        // ENTÃO
        tracy.should_have_a_status_of(Silver);
    }
}
```

:::note JUnit 4 Obsoleto
Se você ainda está usando JUnit 4 com `@RunWith(SerenityRunner.class)`, observe que o suporte ao JUnit 4 está obsoleto a partir do Serenity 5.0.0 e será removido no Serenity 6.0.0. Por favor, migre para o JUnit 5 usando `@ExtendWith(SerenityJUnit5Extension.class)` como mostrado acima.
:::

Observe como o segundo teste reutiliza métodos de passo usados no primeiro para realizar um teste ligeiramente diferente. Este é um exemplo típico da forma como reutilizamos passos em testes semelhantes, a fim de evitar código duplicado e tornar o código mais fácil de manter.

## Implementando Bibliotecas de Passos Simples
A classe `TravellerEarningStatusPoints` é o que chamamos de biblioteca de passos. Usamos a classe `@Steps` como mostrado acima para indicar uma biblioteca de passos em nosso código de teste: esta anotação diz ao Serenity para instanciar e instrumentar este campo, para que os métodos que você chamar nesta biblioteca também apareçam nos relatórios de teste.

Bibliotecas de passos contêm as tarefas de negócio ou ações que um usuário realiza durante um teste. Existem muitas maneiras de organizar suas bibliotecas de passos, mas uma maneira conveniente é agrupar métodos em fatias de comportamento de negócio para um determinado tipo de usuário. Neste caso, um viajante que está ganhando pontos de status.

Observe que não foi necessário instanciar explicitamente a classe Steps `TravellerEarningStatusPoints`. Quando você anota uma variável membro desta classe com a anotação `@Steps`, o Serenity BDD automaticamente a instanciará para você.

Você nunca deve criar instâncias de bibliotecas de passos usando a palavra-chave `new`, pois o Serenity não será capaz de instrumentar a biblioteca de passos corretamente, e os métodos chamados não aparecerão nos relatórios.

Por exemplo, suponha que queremos testar uma UI de calculadora simples. Nesta classe, usamos a biblioteca de passos `CalculatorSteps`, que anotamos com a anotação `@Steps`:

```java
@ExtendWith(SerenityJUnit5Extension.class)
class WhenDoingSums {

    @Steps
    CalculatorSteps calulate;

    @Nested
    class ABasicCalculator {

        @BeforeEach
        void openTheCalculator() {
            calulate.openTheCalculatorApp();
        }

        @Test
        void shouldCalculateAdditions() {
            int result = calulate.theAnswerTo("1","+","2");
            assertThat(result).isEqualTo(3);
        }

        @Test
        void shouldCalculateSubtractions() {
            int result = calulate.theAnswerTo("7","-","3");
            assertThat(result).isEqualTo(4);
        }

        @Test
        void shouldCalculateMultiplications() {
            int result = calulate.theAnswerTo("3","*","2");
            assertThat(result).isEqualTo(6);
        }

        @Test
        void shouldCalculateDivisions() {
            int result = calulate.theAnswerTo("10","/","2");
            assertThat(result).isEqualTo(5);
        }
    }
}
```

A classe `CalculatorSteps` define os passos que um usuário precisa realizar - neste caso, realizar um cálculo no aplicativo de calculadora:

```java
public class CalculatorSteps {

    @Step("Calculate the answer to {0} {1} {2}")
    public int theAnswerTo(String a, String operator, String b) {
        // Interagir com a calculadora para realizar o cálculo
    }
}
```

Métodos de passo são anotados com a anotação `@Step`, que diz ao Serenity para incluir este método nos relatórios de teste do Serenity. O valor que incluímos na anotação `@Step` é o texto que aparecerá nos relatórios do Serenity quando este passo for executado. Os números entre chaves (`{0}`,`{1}` e `{2}`) representam placeholders para os parâmetros do método, se quisermos que eles apareçam nos relatórios.

Quando executamos este caso de teste, o Serenity documentará os passos que são executados durante cada teste, produzindo uma documentação viva da execução do teste:

![](img/calculator-steps.png)

### Classes de Interação com UI

Suponha que nosso teste de calculadora precise interagir com uma UI web, como a em https://juliemr.github.io/protractor-demo/ mostrada aqui:

![](img/calculator-app.png)

Podemos acessar a poderosa integração Selenium do Serenity BDD em nossas bibliotecas de passos estendendo a classe `net.serenitybdd.core.steps.UIInteractions`. Uma implementação muito simples poderia parecer assim:

```java
public class CalculatorSteps extends UIInteractions {

     @Step
    public void openTheCalculatorApp() {
        openUrl("https://juliemr.github.io/protractor-demo/");
    }

   @Step("Calculate the answer to {0} {1} {2}")
    public int theAnswerTo(String firstValue, String operator, String secondValue) {

        $("[ng-model=first]").sendKeys(firstValue);
        $("[ng-model=operator]").selectByVisibleText(operator);
        $("[ng-model=second]").sendKeys(secondValue);
        $("#gobutton").click();
        waitForAngularRequestsToFinish();

        return Integer.parseInt($("css:h2").getText());
    }
}
```

Uma implementação mais legível e refatorada poderia parecer assim:

```java
public class CalculatorSteps extends UIInteractions {

    private static final By FIRST_VALUE_FIELD = By.cssSelector("[ng-model=first]");
    private static final By SECOND_VALUE_FIELD = By.cssSelector("[ng-model=second]");
    private static final By OPERATOR_DROPDOWN = By.cssSelector("[ng-model=operator]");
    private static final By GO_BUTTON = By.id("gobutton");
    private static final By RESULT_FIELD = By.tagName("h2");
    private static final Pattern A_VALID_NUMBER = Pattern.compile("-?\\d\\.?d*");

    @Step
    public void openTheCalculatorApp() {
        openUrl("https://juliemr.github.io/protractor-demo/");
    }

    @Step("Calculate the answer to {0} {1} {2}")
    public int theAnswerTo(String firstValue, String operator, String secondValue) {

        $(FIRST_VALUE_FIELD).sendKeys(firstValue);
        $(OPERATOR_DROPDOWN).selectByVisibleText(operator);
        $(SECOND_VALUE_FIELD).sendKeys(secondValue);
        $(GO_BUTTON).click();
        waitFor(ExpectedConditions.textMatches(RESULT_FIELD,A_VALID_NUMBER));

        return Integer.parseInt($(RESULT_FIELD).getText());
    }
}
```

Os testes agora interagirão com a interface do usuário, relatarão tanto os passos executados quanto (se configurado para fazer isso) registrarão capturas de tela para cada passo:

![](img/calculator-step-screenshots.png)


### Bibliotecas de Passos de Persona

Outra abordagem para modelar bibliotecas de passos gira em torno de atores e papéis. Vamos voltar ao nosso exemplo original: Tracy, a viajante, que ganha pontos quando viaja.

```java
public class TravellerEarningStatusPoints {

    private String actor;

    private FrequentFlyer frequentFlyer;

    @Step("#actor joins the frequent flyer program")
    public void joins_the_frequent_flyer_program() {
        frequentFlyer = FrequentFlyer.withInitialBalanceOf(0);
    }

    @Step("#actor flies {0} km")
    public void flies(int distance) {
        frequentFlyer.recordFlightDistanceInKilometers(distance);
    }

    @Step("#actor should have a status of {0}")
    public void should_have_a_status_of(Status expectedStatus) {
        assertThat(frequentFlyer.getStatus()).isEqualTo(expectedStatus);
    }

    @Step("#actor transfers {0} points to {1}")
    public void transfers_points(int points, TravellerEarningStatusPoints otherFrequentFlier) {
        // Deixado como exercício
    }

    @Override
    public String toString() {
        return actor;
    }

    @Step("#actor should have {0} points")
    public void should_have_points(int expectedPoints) {
        // Deixado como exercício
    }
}
```

Esta abordagem usa o conceito de bibliotecas de passos de _persona_, onde uma biblioteca de passos representa as ações de um usuário específico realizando uma tarefa específica (Tracy a viajante que está ganhando pontos). Neste caso, o Serenity automaticamente instanciará o campo _actor_ com o nome da variável da biblioteca de passos (`tracy`), permitindo que apareça nos relatórios de teste para torná-los mais legíveis:

![](img/persona-steps.png)


## Instâncias Compartilhadas de Bibliotecas de Passos
Existem alguns casos em que queremos reutilizar a mesma instância de biblioteca de passos em diferentes lugares ao longo de um teste. Por exemplo, suponha que temos uma biblioteca de passos que interage com uma API de backend, e que mantém algum estado interno e cache para melhorar o desempenho. Podemos querer reutilizar uma única instância desta biblioteca de passos, em vez de ter uma instância separada para cada variável.

Podemos fazer isso declarando a biblioteca de passos como compartilhada, assim:

```java
@Steps(shared = true)
CustomerAPIStepLibrary customerAPI;
```

Agora, quaisquer outras bibliotecas de passos do tipo `CustomerAPIStepLibrary`, que tenham o atributo shared definido como true, se referirão à mesma instância.

Em versões anteriores do Serenity, compartilhar instâncias era o comportamento padrão, e você usava o atributo uniqueInstance para indicar que uma biblioteca de passos não deveria ser compartilhada. Se você precisar forçar este comportamento para suítes de teste legadas, defina a propriedade step.creation.strategy como legacy no seu arquivo serenity.properties:

```javascript
step.creation.strategy = legacy
```
