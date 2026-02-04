---
id: rest
sidebar_position: 3
---
# Seu Primeiro Teste de API

No tutorial anterior, vimos como escrever um teste web simples com Serenity BDD. Mas o Serenity nao e apenas para testes web: o Serenity BDD tambem fornece integracao estreita com o [Rest Assured](https://rest-assured.io/), uma biblioteca open source popular para testar APIs REST.

## Pre-requisitos
Para executar este tutorial, voce precisara de algumas coisas instaladas em sua maquina:
* **Java**: O Serenity BDD e uma biblioteca Java, entao voce precisara de um JDK recente instalado. JDK 17 ou superior deve funcionar bem.
* **Maven**: Voce precisara do Maven 3 ou superior instalado em seu computador. Ele atua como uma ferramenta de build que tambem baixa as dependencias durante a compilacao.
* **Uma IDE Java**: Voce tambem precisara de um Ambiente de Desenvolvimento Java como IntelliJ ou Eclipse (e conhecimento pratico de Java).
* **Git**: Usaremos um projeto inicial no Github, e o codigo de exemplo deste projeto tambem esta no Github, entao assumo que voce tem um entendimento basico de Git.

## Criando seu projeto

Usaremos o projeto template **[Serenity BDD Junit Starter](https://github.com/serenity-bdd/serenity-junit-starter)** para ter um projeto simples funcionando rapidamente.

Este projeto vem com um teste de exemplo baseado em JUnit 5 ja implementado para nossa referencia. Por enquanto, vamos ignora-lo e comecar a escrever um novo teste do zero.

Acesse a [pagina do template do projeto no Github](https://github.com/serenity-bdd/serenity-junit-starter) e clique em [Use This Template](https://github.com/serenity-bdd/serenity-junit-starter/generate).

## Excluindo os arquivos desnecessarios

Apenas para garantir que os arquivos de exemplo do template inicial nao interfiram em nossa experiencia neste tutorial, **exclua** o diretorio `src/test/java/starter/wikipedia`.

## Adicionando a Dependencia Serenity RestAssured

Abra o arquivo `pom.xml` no diretorio raiz e adicione as seguintes linhas na secao `<dependencies>`, similar as que ja estao no arquivo.

```xml
 <dependency>
      <groupId>net.serenity-bdd</groupId>
      <artifactId>serenity-rest-assured</artifactId>
      <version>${serenity.version}</version>
      <scope>test</scope>
  </dependency>
```

## Habilitando Relatorios HTML Detalhados
Quando usamos a configuracao padrao do template, obtemos apenas um relatorio HTML de pagina unica. Queremos gerar um relatorio HTML detalhado neste tutorial. Entao, vamos **excluir** a seguinte linha do arquivo `pom.xml`.

```xml
  <reports>single-page-html</reports>
  <!-- EXCLUA a linha acima. Sim, exclua! -->
```
Voce pode encontrar isso na secao de configuracao do plugin `serenity-maven-plugin`.

## A estrutura de diretorios do projeto
Usaremos algumas convencoes simples para organizar nossos arquivos feature e as classes Java de suporte, baseadas na estrutura padrao de projeto Maven descrita abaixo:

```
├───src
│   ├───main
│   │   └───java
│   │       └───starter
│   └───test
│       ├───java
│       │   └───starter
│       │       └───petstore
│       └───resources
```

Aqui estao alguns pontos a observar sobre a estrutura de diretorios.
1. Como testaremos a [API Pet Store](https://petstore.swagger.io/) disponivel publicamente, nao teremos nenhum codigo no diretorio `src/main`.
2. Reutilizaremos (do template) o conteudo que ja esta no diretorio `src/test/resources/`.
3. Criaremos um novo diretorio `petstore` em `src/test/java/starter` para armazenar nossa classe de teste e seus auxiliares.

## Escrevendo um teste de API
Vamos comecar escrevendo nosso teste de API. Neste teste, testaremos a API [`GET /pet/{petId}`](https://petstore.swagger.io/#/pet/getPetById). Esta API retornara um pet quando voce fornecer seu `id` na URL.

No entanto, nao podemos chamar esta API diretamente sem nenhum `id`. Portanto, nosso teste precisa primeiro criar um Pet e obter seu `id` antes de chamar o endpoint `GET /pet/{petId}`.

Em outras palavras, poderiamos escrever nosso teste no formato `Dado-Quando-Entao` (Given-When-Then) da seguinte forma.

```Gherkin
Given Kitty is available in the pet store
When I ask for a pet using Kitty's ID
Then I get Kitty as result
```

### Estrutura basica do teste

Agora criamos uma nova classe de teste (vamos chama-la de `WhenFetchingAlreadyAvailablePet`) e um caso de teste vazio (podemos chama-lo de `fetchAlreadyAvailablePet`).

```java
package starter.petstore;

import net.serenitybdd.junit5.SerenityJUnit5Extension;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;


@ExtendWith(SerenityJUnit5Extension.class)
public class WhenFetchingAlreadyAvailablePet {

  @Test
  public void fetchAlreadyAvailablePet() {

  }
}
```

:::caution
Ha algumas coisas a observar aqui:
- A anotacao `@ExtendWith` informa ao JUnit que este teste usa o Serenity - nao esqueca esta anotacao ou seu teste nao sera reconhecido como um teste Serenity
- A anotacao `@Test` usa a classe `org.junit.jupiter.api.Test`, do JUnit 5. Tenha cuidado para nao confundir com a anotacao do JUnit 4 de mesmo nome (`org.junit.Test`), caso contrario seu teste nao sera executado.
- Note que o nome da classe de teste comeca com `When`. Esta e uma das maneiras de garantir que ela seja reconhecida como um teste a ser executado no processo de build do Maven. Veja a secao `configuration` do `maven-failsafe-plugin` no arquivo `pom.xml` para mais detalhes.

:::

### Criando Action Classes

Poderiamos simplesmente comecar a escrever todo o codigo do teste dentro do nosso metodo `fetchAlreadyAvailablePet()`. Isso funcionaria bem. Mas manter o codigo de teste bem organizado e estruturado e essencial para manter os custos de manutencao baixos. E o Serenity BDD nos da varias maneiras de fazer isso.

Uma das maneiras mais simples de fazer isso e chamada de _Action Class_. As Action Class sao classes pequenas e reutilizaveis com metodos que encapsulam acoes-chave do usuario. Usaremos essas classes para chamar as APIs HTTP.

Por exemplo, poderiamos dividir nosso teste `fetchAlreadyAvailablePet()` em tres passos:
1. **Arrange (Dado):** Preparar o cenario para chamar a API GET pre-carregando o pet chamado 'Kitty' usando uma chamada HTTP POST documentada [aqui](https://petstore.swagger.io/#/pet/addPet).
2. **Act (Quando):** Chamar a API em teste usando o ID de 'Kitty'
3. **Assert (Entao):** Verificar que a API retorna um pet com nome 'Kitty'

Vamos criar uma Action Class chamada `PetApiActions` com o seguinte codigo de esqueleto, no mesmo pacote `petstore` onde o teste esta.

```java
package starter.petstore;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import net.serenitybdd.core.steps.UIInteractions;


public class PetApiActions extends UIInteractions {

    @Given("Kitty is available in the pet store")
    public Long givenKittyIsAvailableInPetStore() {

    }

    @When("I ask for a pet using Kitty's ID: {0}")
    public void whenIAskForAPetWithId(Long id) {

    }

    @Then("I get Kitty as result")
    public void thenISeeKittyAsResult() {

    }
}

```

:::caution

**Pontos a observar**
1. Como queremos usar o ID gerado pela API em nosso proximo passo, retornamos o ID como um valor de retorno Long.
2. Estendemos a classe `UIInteractions` que vem com o Serenity BDD para nos ajudar a interagir com APIs.

:::

Vamos comecar implementando a primeira acao: Preparar o cenario pre-criando um pet com nome `"Kitty"` chamando a API POST.

Como precisamos criar um objeto Java para armazenar o `Pet`, podemos criar uma classe `Pet.java` no pacote `starter.petstore` com o seguinte codigo.

```java
package starter.petstore;

public class Pet {
    private String name;
    private String status;
    private Long id;

    public Pet(String name, String status, Long id) {
        this.name = name;
        this.status = status;
        this.id = id;
    }

    public Pet(String name, String status) {
        this.name = name;
        this.status = status;
    }

    public String getName() {
        return this.name;
    }

    public String getStatus() {
        return this.status;
    }

    public Long getId() {
        return id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
```

Agora que temos uma maneira de representar um Pet em nosso codigo, vamos escrever nossa primeira acao na funcao `givenKittyIsAvailableInPetStore()` da classe `PetApiActions`.

```java
package starter.petstore;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.restassured.http.ContentType;
import io.restassured.mapper.ObjectMapperType;
import static net.serenitybdd.rest.SerenityRest.given;
import net.serenitybdd.core.steps.UIInteractions;


import static net.serenitybdd.rest.SerenityRest.*;

public class PetApiActions extends UIInteractions {

    @Given("Kitty is available in the pet store")
    public Long givenKittyIsAvailableInPetStore() {

        Pet pet = new Pet("Kitty", "available");

        Long newId = given()
                .baseUri("https://petstore.swagger.io")
                .basePath("/v2/pet")
                .body(pet, ObjectMapperType.GSON)
                .accept(ContentType.JSON)
                .contentType(ContentType.JSON).post().getBody().as(Pet.class, ObjectMapperType.GSON).getId();
        return newId;
    }

    @When("I ask for a pet using Kitty's ID: {0}")
    public void whenIAskForAPetWithId(Long id) {

    }

    @Then("I get Kitty as result")
    public void thenISeeKittyAsResult() {

    }
}

```

Em seguida, vamos escrever a implementacao para a funcao `whenIAskForAPetWithId`. Isso incluira apenas chamar a API GET que precisa ser testada.

```java
    @When("I ask for a pet using Kitty's ID: {0}")
    public void whenIAskForAPetWithId(Long id) {
        when().get("/" + id);
    }
```
:::caution

**Pontos a observar**
1. Na chamada do metodo `get` acima, o `baseUri` e `basePath` da secao `given()` sao reutilizados. E por isso que voce nao precisou repetir esses detalhes neste metodo.
2. Como estamos usando o `id` como parametro de entrada, estamos usando `{0}` na descricao para que ele possa aparecer em nossos relatorios.
:::

Em seguida, vamos escrever a implementacao para o metodo `thenISeeKittyAsResult` da seguinte forma.

```java
    @Then("I get Kitty as result")
    public void thenISeeKittyAsResult() {
        then().body("name", Matchers.equalTo("Kitty"));
    }

```

Juntando tudo, o arquivo `PetApiActions.java` fica assim.

```java
package starter.petstore;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.restassured.http.ContentType;
import io.restassured.mapper.ObjectMapperType;
import static net.serenitybdd.rest.SerenityRest.then;
import static net.serenitybdd.rest.SerenityRest.when;
import static net.serenitybdd.rest.SerenityRest.given;
import net.serenitybdd.core.steps.UIInteractions;
import org.hamcrest.Matchers;

import static net.serenitybdd.rest.SerenityRest.*;

public class PetApiActions extends UIInteractions {

    @Given("Kitty is available in the pet store")
    public Long givenKittyIsAvailableInPetStore() {

        Pet pet = new Pet("Kitty", "available");

        Long newId = given()
                .baseUri("https://petstore.swagger.io")
                .basePath("/v2/pet")
                .body(pet, ObjectMapperType.GSON)
                .accept(ContentType.JSON)
                .contentType(ContentType.JSON).post().getBody().as(Pet.class, ObjectMapperType.GSON).getId();
        return newId;
    }

    @When("I ask for a pet using Kitty's ID: {0}")
    public void whenIAskForAPetWithId(Long id) {
        when().get("/" + id);
    }

    @Then("I get Kitty as result")
    public void thenISeeKittyAsResult() {
        then().body("name", Matchers.equalTo("Kitty"));
    }

}


```

### Completando nosso caso de teste

Agora que nossa classe Actions esta pronta, vamos terminar de escrever nosso caso de teste na classe `WhenFetchingAlreadyAvailablePet`.

```java
package starter.petstore;

import net.serenitybdd.junit5.SerenityJUnit5Extension;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(SerenityJUnit5Extension.class)
public class WhenFetchingAlreadyAvailablePet {

    Long newPetId = null;
    PetApiActions petApi;

    @Test
    public void fetchAlreadyAvailablePet() {
        newPetId = petApi.givenKittyIsAvailableInPetStore();
        petApi.whenIAskForAPetWithId(newPetId);
        petApi.thenISeeKittyAsResult();
    }
}
```

Vamos tentar executar o build Maven para ver o resultado. Se a API funcionar como esperado, esperamos que o teste passe e um relatorio HTML detalhado seja gerado.

Execute o seguinte comando em um terminal ou prompt de comando.

```bash
mvn clean verify
```

Quando o comando for concluido, voce vera uma saida similar a seguinte.

```
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 10.009 s - in starter.petstore.WhenFetchingAlreadyAvailablePet
[INFO]
[INFO] Results:
[INFO]
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0

...
...
...

[INFO] -----------------------------------------
[INFO]  SERENITY TESTS: SUCCESS
[INFO] -----------------------------------------
[INFO] | Test cases executed    | 1
[INFO] | Tests executed         | 1
[INFO] | Tests passed           | 1
[INFO] | Tests failed           | 0
[INFO] | Tests with errors      | 0
[INFO] | Tests compromised      | 0
[INFO] | Tests aborted          | 0
[INFO] | Tests pending          | 0
[INFO] | Tests ignored/skipped  | 0
[INFO] ------------------------ | --------------
[INFO] | Total Duration         | 9s 212ms
[INFO] | Fastest test took      | 9s 212ms
[INFO] | Slowest test took      | 9s 212ms
[INFO] -----------------------------------------
[INFO]
[INFO] SERENITY REPORTS
[INFO]   - Full Report: file:///C:/Users/calib/source-codes/temp/serenity-junit-starter/target/site/serenity/index.html
[INFO]
[INFO] --- maven-failsafe-plugin:3.0.0-M5:verify (default) @ serenity-junit-starter ---
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  39.104 s
[INFO] Finished at: 2022-09-02T17:33:14+05:30
[INFO] ------------------------------------------------------------------------

```

Sim, o teste passou e o build foi bem-sucedido agora. Conseguimos testar nossa API com sucesso!

## Relatorios e Documentacao Viva

Se voce observar com cuidado, a saida do comando `mvn clean verify` nos informou que um relatorio foi criado em `target/site/serenity/index.html`

Quando voce abrir este arquivo em um navegador web, vera um relatorio bonito como este.

![Report Home Page](img/rest-report-home.png)

Voce tambem pode encontrar os resultados por teste detalhando os passos na aba `Stories`, detalhando as chamadas de API REST.

![Report](img/rest-report-stories.jpg)

Se voce quiser ver os detalhes exatos usados nas requisicoes HTTP, voce pode clicar no link circulado na captura de tela acima. Isso mostrara os detalhes como mostrado abaixo.

![Report with HTTP requests](img/rest-report-http-requests.png)

Sinta-se a vontade para navegar pelos links neste relatorio e explorar.

## Conclusao
Neste tutorial, voce criou seus proprios casos de teste de API e os executou usando o Serenity BDD para gerar um relatorio bonito.
