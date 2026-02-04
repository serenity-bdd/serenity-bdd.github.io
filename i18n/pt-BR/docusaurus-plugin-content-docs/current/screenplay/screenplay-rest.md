---
id: screenplay_rest
sidebar_position: 3
---
# Trabalhando com APIs REST usando Serenity Screenplay

O Screenplay Pattern e uma abordagem para escrever testes de aceitacao automatizados que nos ajuda a escrever codigo de automacao mais limpo, mais facil de manter e mais escalavel. Um teste Screenplay fala primeiro e principalmente sobre as Task que um usuario executa, em linguagem de negocios, em vez de mergulhar nos detalhes sobre botoes, cliques e campos de entrada. Focar nas Task de negocios torna nossos testes mais legiveis, mais faceis de manter e mais faceis de escalar.

Screenplay e frequentemente associado a testes de UI. Curiosamente, o nome do padrao na verdade nao esta relacionado a telas ou interfaces de usuario; ele vem de uma metafora do teatro, onde Actor desempenham papeis em um palco seguindo um roteiro predefinido (o "screenplay"), e foi cunhado por Antony Marcano e Andy Palmer por volta de 2015. O padrao em si remonta a mais tempo do que isso, e existe em varias formas desde que foi proposto pela primeira vez por Antony Marcano em 2007.

Mas Screenplay tambem e uma otima opcao para testes de API ou servicos web. Em particular, Screenplay e ideal quando queremos incluir atividades de API e UI no mesmo teste. Por exemplo, poderiamos ter uma Task de API para configurar alguns dados de teste, uma Task de UI para ilustrar como um usuario interage com esses dados, e depois outra Task de API para verificar o novo estado do banco de dados.

Voce pode ter uma ideia de como sao as interacoes de API REST usando Serenity Screenplay aqui:

```java
@Test
public void list_all_users() {

    Actor sam = Actor.named("Sam the supervisor")
                     .whoCan(CallAnApi.at(theRestApiBaseUrl));

    sam.attemptsTo(
            Get.resource("/users")
    );

    sam.should(
            seeThatResponse("all the expected users should be returned",
                    response -> response.statusCode(200)
                                        .body("data.first_name", hasItems("George", "Janet", "Emma")))
    );
}
```

Serenity Screenplay usa [Rest-Assured](https://rest-assured.io) para interagir com endpoints REST e consultar as respostas. Rest-Assured nos fornece uma DSL Java simples mas extremamente poderosa que nos permite testar praticamente qualquer tipo de endpoint REST. Seu codigo altamente legivel tambem e uma combinacao ideal para Screenplay.

## Configurando seu projeto

Para testar servicos de API REST com Screenplay, voce precisa adicionar a dependencia `serenity-screenplay-rest` ao seu projeto. No Maven, adicione o seguinte as dependencias no seu arquivo `pom.xml`:

```xml
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-screenplay-rest</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
```

E para Gradle, voce pode adicionar a mesma dependencia ao seu arquivo `build.gradle`:

```groovy
testCompile "net.serenity-bdd:serenity-screenplay-rest:${serenityVersion}"
```

## Definindo uma URI base

Quando voce testa uma API REST, e conveniente poder usar os mesmos testes contra diferentes ambientes. Voce pode querer executar seus testes contra um servidor rodando na sua maquina local, contra um servidor de QA, ou ate mesmo contra uma maquina de producao. E voce nao quer ter que mudar seus testes sempre que testar contra um ambiente diferente.

Por exemplo, neste capitulo, estaremos demonstrando os recursos do `serenity-screenplay-rest` usando a aplicacao [ResReq](https://reqres.in) (veja abaixo). Se voce tiver uma conexao de internet confiavel, pode executar seus testes contra o servidor ResReq ao vivo em https://reqres.in/api/. Ou se voce estiver executando o servidor ResReq localmente, acessaria os endpoints em http://localhost:5000/api.


**A aplicacao de teste ResReq**

A aplicacao [ResReq](https://reqres.in) e uma aplicacao de codigo aberto escrita por [Ben Howdle](http://benhowdle.im/) que facilita experimentar com APIs REST. Ela esta hospedada na Digital Ocean, onde voce pode acessa-la online em https://reqres.in/api/. Alternativamente, voce tambem pode baixar a aplicacao do [repositorio do projeto no Github](https://github.com/benhowdle89/reqres) e executa-la localmente. Quando voce executa a aplicacao na sua propria maquina, a API REST estara disponivel em http://localhost:5000/api.



### Lendo do arquivo de configuracao do Serenity

No Serenity BDD, voce pode definir a URL base para sua API REST diretamente no arquivo `serenity.properties` ou `serenity.conf` do seu projeto.
Aqui esta um exemplo de um arquivo `serenity.conf`:

```json
restapi {
      baseurl = "https://reqres.in/api"
}
```

Qualquer teste pode ler valores dos arquivos de configuracao do Serenity simplesmente criando um campo do tipo `EnvironmentVariables` no teste.
Voce pode entao buscar a propriedade e fornecer um valor padrao para usar se a propriedade nao foi definida, como mostrado abaixo:

```java
theRestApiBaseUrl = environmentVariables.optionalProperty("restapi.baseurl")
                                        .orElse("https://reqres.in/api");
```

### Definindo a URL da API pela linha de comando

Voce pode sobrescrever a URL padrao definida desta forma simplesmente fornecendo uma propriedade de sistema na linha de comando, assim:

```
mvn verify -Drestapi.baseurl=http://localhost:5000/api
```

### Configurando a URL base da API no Maven

Se voce esta usando Maven, uma abordagem mais conveniente pode ser usar [Maven Profiles](http://maven.apache.org/guides/introduction/introduction-to-profiles.html).
No seu arquivo `pom.xml`, voce define diferentes perfis Maven para cada ambiente e configura a propriedade `restapi.baseurl` de acordo:

```xml
<profiles>
    <profile>
        <id>dev</id>
        <properties>
            <restapi.baseurl>http://localhost:5000/api</restapi.baseurl>
        </properties>
    </profile>
    <profile>
        <id>prod</id>
        <properties>
            <restapi.baseurl>https://reqres.in/api</restapi.baseurl>
        </properties>
    </profile>
</profiles>
```

Para que isso funcione corretamente, voce tambem precisa garantir que o `restapi.baseurl` seja passado corretamente para seus testes.
Voce faz isso usando a tag `systemPropertyVariables` na configuracao do `maven-failsafe-plugin`, como mostrado aqui:

```xml
<build>
    <plugins>
        <plugin>
            <artifactId>maven-failsafe-plugin</artifactId>
            <version>2.20</version>
            <configuration>
                <includes>
                    <include>**/When*.java</include>
                    <include>**/*Feature.java</include>
                </includes>
                <systemPropertyVariables>
                    <restapi.baseurl>${restapi.baseurl}</restapi.baseurl>
                </systemPropertyVariables>
            </configuration>
            <executions>
                <execution>
                    <goals>
                        <goal>integration-test</goal>
                        <goal>verify</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
        ...
```

Voce pode entao executar os testes com Maven usando a opcao `-P`:

```
$ mvn verify -Pdev
```

## Configurando o Actor - a Ability CallAnApi

No Screenplay, testes descrevem comportamento em termos de _Actor_, que alcancam seus objetivos de negocios executando _Task_.
Essas Task geralmente envolvem _interagir_ com a aplicacao de alguma forma.
E para executar essas Task, damos aos Actor varias _Ability_.

A Ability `CallAnApi` da aos Actor a habilidade de interagir com um servico web REST usando [Rest-Assured](https://rest-assured.io).
Isso inclui tanto invocar endpoints REST quanto consultar os resultados.

```java
private String theRestApiBaseUrl;
private EnvironmentVariables environmentVariables;
private Actor sam;

@Before
public void configureBaseUrl() {
    theRestApiBaseUrl = environmentVariables.optionalProperty("restapi.baseurl")
                                                   .orElse("https://reqres.in/api");

    sam = Actor.named("Sam the supervisor").whoCan(CallAnApi.at(theRestApiBaseUrl));
}
```

A Ability `CallAnApi` permite que o Actor execute as classes de Interaction REST incluidas no Serenity. Estas incluem:

* Get.resource()
* Post.to()
* Put.to()
* Delete.from()

A mais simples delas e `Get`.

## Interaction GET

Em uma API REST, requisicoes GET sao usadas para consultar um recurso REST.
Vamos ver como podemos fazer isso usando Serenity Screenplay.

### Requisicoes GET simples

Em nossa aplicacao de demonstracao, o recurso `/users` representa usuarios da aplicacao.
Podemos recuperar os detalhes de um usuario especifico anexando o ID do usuario, assim: `/users/1`.
A estrutura de um registro de usuario e mostrada abaixo:

```json
{
  "data": {
    "id": 1,
    "first_name": "George",
    "last_name": "Bluth",
    "avatar": "https://s3.amazonaws.com/uifaces/faces/twitter/calebogden/128.jpg"
  }
}
```

Suponha que precisamos escrever um Scenario que recupera um usuario especifico e verifica alguns dos detalhes do usuario, como first_name e last_name.
Tal teste poderia ficar assim:

```java
@Test
public void find_an_individual_user() {

    sam.attemptsTo(
            Get.resource("/users/1")
    );

    sam.should(
            seeThatResponse( "User details should be correct",
                    response -> response.statusCode(200)
                                        .body("data.first_name", equalTo("George"))
                                        .body("data.last_name", equalTo("Bluth"))
            )
    );
}
```

Como voce pode ver, este codigo e bastante autoexplicativo.
Como qualquer outro teste Screenplay, usamos o metodo `attemptsTo()` do Actor para executar a acao que queremos testar.
Neste caso, usamos a classe de Interaction `Get`, que vem incluida com `serenity-screenplay-rest`.

Em seguida, verificamos a resposta usando o metodo `seeThatResponse`.
Este metodo recebe uma expressao Lambda e nos permite acessar a API completa do RestAssured.
Em particular, podemos usar expressoes [jsonPath](http://static.javadoc.io/io.restassured/json-path/3.1.0/io/restassured/path/json/JsonPath.html) para consultar a estrutura JSON que recebemos.


### Recuperando objetos

As vezes precisamos buscar um valor de uma resposta REST e guarda-lo para uso posterior. RestAssured torna relativamente facil converter uma estrutura JSON em um objeto Java, que voce pode usar mais tarde em seus testes.

Por exemplo, suponha que temos uma classe como a abaixo, que corresponde aos detalhes do usuario retornados pelo nosso endpoint:

```java
package examples.screenplay.rest.model;

public class User {
    private String id;
    private String first_name;
    private String last_name;


    public User(String first_name, String last_name) {
        this.first_name = first_name;
        this.last_name = last_name;
    }

    public String getId() {
        return id;
    }

    public String getFirstName() {
        return first_name;
    }

    public String getLastName() {
        return last_name;
    }
}
```

Poderiamos recuperar o usuario como uma instancia desta classe chamando o metodo `jsonPath().getObject()` na resposta recebida. Este metodo convertera os dados JSON em um caminho especificado para uma estrutura Java correspondente:

```java
@Test
public void retrieve_an_element_from_the_json_structure() {

    sam.attemptsTo(
            Get.resource("/users/1")
    );

    User user = SerenityRest.lastResponse()
                            .jsonPath()
                            .getObject("data", User.class);

    assertThat(user.getFirstName()).isEqualTo("George");
    assertThat(user.getLastName()).isEqualTo("Bluth");

}
```

### Recuperando listas

Frequentemente precisamos recuperar nao um unico item, mas uma lista de itens.
Recuperar uma lista e pouco diferente de recuperar um unico item:

```java
sam.attemptsTo(
        Get.resource("/users")
);

sam.should(
        seeThatResponse("all the expected users should be returned",
                response -> response.body("data.first_name", hasItems("George", "Janet", "Emma")))
);
```

A diferenca acontece quando consultamos os resultados.
Neste caso, usamos uma expressao jsonPath (`data.first_name`) que retornara _todos_ os valores do campo first_name.
O matcher Hamcrest `hasItems` comparara a colecao de primeiros nomes que a consulta jsonPath retorna e verificara se contem (pelo menos) os nomes "George", "Janet" e "Emma".

Mas e se quisermos capturar os dados que recuperamos, em vez de simplesmente fazer uma asserção sobre o conteudo?
Podemos fazer isso usando o metodo `SerenityRest.lastResponse()`, assim:

```java
List<String> userSurnames = SerenityRest.lastResponse().path("data.last_name");
assertThat(userSurnames).contains("Bluth", "Weaver", "Wong");
```

Tambem podemos recuperar listas de objetos, assim como recuperamos uma unica instancia de `User` na secao anterior.
Simplesmente use o metodo `jsonPath.getList()` como mostrado abaixo:

```java
sam.attemptsTo(
        Get.resource("/users")
);

sam.should(
        seeThatResponse("all the expected users should be returned",
                response -> response.body("data.first_name", hasItems("George", "Janet", "Emma")))
);
```

### Usando Parametros de Caminho

No exemplo anterior, codificamos o elemento de caminho na requisicao.
Para uma abordagem mais flexivel, podemos fornecer o parametro de caminho quando submetemos a consulta:

```java
sam.attemptsTo(
        Get.resource("/users/{id}").with( request -> request.pathParam("id", 1))
);
```

Aqui estamos usando a estrutura `Get.resource(...).with(...)` para passar o objeto `RequestSpecification` do RestAssured para uma expressao lambda.
Mais uma vez, isso nos da acesso a toda a riqueza da biblioteca RestAssured.

### Usando Parametros de Consulta

Algumas APIs REST recebem parametros de consulta alem de parametros de caminho. Parametros de consulta sao comumente usados para filtrar resultados ou implementar paginacao. Por exemplo, poderiamos obter a segunda pagina de usuarios da nossa API `/users` usando o parametro de consulta `page` assim:

```
/users?page=2
```

Em nosso codigo de teste, usamos o metodo `queryParam()` para fornecer um valor para o parametro `page`:

```java
sam.attemptsTo(
        Get.resource("/users").with( request -> request.queryParam("page", 2))
);

sam.should(
        seeThatResponse("All users on page 2 should be returned",
                response -> response.body("data.first_name",
                                     hasItems("Eve", "Charles", "Tracey")))
);
```

## Consultas Post

Podemos enviar requisicoes POST para um endpoint REST usando a classe de Interaction `Post`. Aqui esta um exemplo simples:

```java
sam.attemptsTo(
        Post.to("/users")
                .with(request -> request.header("Content-Type", "application/json")
                                        .body("{\"firstName\": \"Sarah-Jane\",\"lastName\": \"Smith\"}")
                )
);

sam.should(
        seeThatResponse("The user should have been successfully added",
                        response -> response.statusCode(201))
);
```

Alternativamente, podemos postar um objeto, deixando o RestAssured converter os campos do objeto em JSON para nos:

```java
User newUser = new User("Sarah-Jane", "Smith");

sam.attemptsTo(
        Post.to("/users")
                .with(request -> request.header("Content-Type", "application/json")
                                        .body(newUser)
                )
);
```

## Outros tipos de consultas

Outros tipos de consulta sao semelhantes as consultas `GET` e `POST`.
Por exemplo, requisicoes `PUT` sao frequentemente usadas para atualizar recursos.
No exemplo a seguir, usamos uma requisicao `PUT` para atualizar os detalhes de um usuario:

```java
sam.attemptsTo(
        Put.to("/users")
                .with(request -> request.header("Content-Type", "application/json")
                        .body("{\"firstName\": \"jack\",\"lastName\": \"smith\"}")
                )
);

sam.should(
        seeThatResponse(response -> response.statusCode(200)
                                            .body("updatedAt", not(isEmptyString())))
);
```

Ou voce pode excluir um usuario usando a consulta `DELETE` como mostrado aqui:

```java
sam.attemptsTo(
        Delete.from("/users/1")
);

sam.should(
        seeThatResponse(response -> response.statusCode(204))
);
```

## Task de nivel superior

As Interaction que vimos ate agora sao legiveis, mas ainda sao de nivel bastante baixo.
Screenplay nos permite construir Task de nivel superior que representam a intencao de negocios por tras dessas Interaction.

Por exemplo, voce poderia definir uma Task que encapsula listar todos os usuarios assim:

```java
package examples.screenplay.rest.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.rest.interactions.Get;

public class UserTasks {
    public static Task listAllUsers() {
        return Task.where("{0} lists all users",
                Get.resource("/users")
        );
    }
}
```

Podemos entao usar um import estatico para refatorar nosso primeiro teste da seguinte forma:

```java
sam.attemptsTo(
        listAllUsers()
);
```

Para um pouco mais de flexibilidade, tambem podemos escrever uma classe `Task` customizada. Por exemplo, poderiamos escrever uma Task `FindAUser` para encontrar um usuario por ID:

```java
package examples.screenplay.rest.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.rest.interactions.Get;
import net.thucydides.core.annotations.Step;

import static net.serenitybdd.screenplay.Tasks.instrumented;

public class FindAUser implements Task{
    private final int id;

    public FindAUser(int id) {
        this.id = id;
    }

    public static FindAUser withId(int id) {
        return instrumented(FindAUser.class, id);
    }

    @Override
    @Step("{0} fetches the user with id #id")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
                Get.resource("/users/{id}")
                   .with(request -> request.pathParam("id", id))
        );
    }
}
```

Usando esta classe, poderiamos refatorar nossa classe original para ler assim:

```java
sam.attemptsTo(
        FindAUser.withId(1)
);
```

Usar Task para encapsular Interaction REST resulta em uma estrutura de relatorio clara e em camadas, que primeiro descreve o que o usuario esta fazendo e depois como ele faz isso. O relatorio de teste para o Scenario anterior e mostrado aqui:

![](img/find-a-user-by-id.png)
