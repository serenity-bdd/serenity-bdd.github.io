---
id: rest-api-testing
title: Testes Completos de API REST
sidebar_position: 4
---

# Testes Completos de API REST com Serenity BDD

Este tutorial fornece um guia completo para testar APIs REST com Serenity BDD, cobrindo desde requisicoes basicas ate padroes avancados como autenticacao, tratamento de erros, validacao de schema e testes hibridos UI+API.

Todos os exemplos usam APIs de teste reais e publicamente disponiveis que voce pode usar para praticar.

## APIs de Teste Usadas

| API | URL | Proposito |
|-----|-----|---------|
| JSONPlaceholder | https://jsonplaceholder.typicode.com | API fake gratuita para CRUD basico |
| ReqRes | https://reqres.in | Gerenciamento de usuarios com exemplos de autenticacao |
| Restful-Booker | https://restful-booker.herokuapp.com | Reservas de hotel com autenticacao por token |

## Configuracao do Projeto

### Dependencias Maven

```xml
<properties>
    <serenity.version>5.2.2</serenity.version>
</properties>

<dependencies>
    <!-- Core Serenity -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-core</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Integracao Serenity REST Assured -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-rest-assured</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Serenity Screenplay REST (para o Screenplay Pattern) -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-screenplay-rest</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- JUnit 5 -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-junit5</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Validacao de JSON Schema -->
    <dependency>
        <groupId>io.rest-assured</groupId>
        <artifactId>json-schema-validator</artifactId>
        <version>5.3.2</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### Dependencias Gradle

```groovy
dependencies {
    testImplementation "net.serenity-bdd:serenity-core:5.2.2"
    testImplementation "net.serenity-bdd:serenity-rest-assured:5.2.2"
    testImplementation "net.serenity-bdd:serenity-screenplay-rest:5.2.2"
    testImplementation "net.serenity-bdd:serenity-junit5:5.2.2"
    testImplementation "io.rest-assured:json-schema-validator:5.3.2"
}
```

### Configuracao (serenity.conf)

```hocon
# URLs base para diferentes ambientes
restapi {
    jsonplaceholder = "https://jsonplaceholder.typicode.com"
    reqres = "https://reqres.in/api"
    booker = "https://restful-booker.herokuapp.com"
}

# Logging de requisicoes
serenity {
    logging = VERBOSE
}

# Configuracoes do REST Assured
restassured {
    # Logar todas as requisicoes e respostas
    log.all = true
}
```

---

## Parte 1: Operacoes REST Basicas

### Requisicao GET Simples

Vamos comecar com o teste de API mais simples possivel - buscar um recurso:

```java
package com.example.api;

import net.serenitybdd.junit5.SerenityJUnit5Extension;
import net.serenitybdd.rest.SerenityRest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import static net.serenitybdd.rest.SerenityRest.given;
import static org.hamcrest.Matchers.*;

@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("Basic REST Operations")
class BasicRestTest {

    private static final String BASE_URL = "https://jsonplaceholder.typicode.com";

    @Test
    @DisplayName("Should fetch a single user")
    void shouldFetchSingleUser() {
        given()
            .baseUri(BASE_URL)
        .when()
            .get("/users/1")
        .then()
            .statusCode(200)
            .body("id", equalTo(1))
            .body("name", equalTo("Leanne Graham"))
            .body("email", equalTo("Sincere@april.biz"));
    }

    @Test
    @DisplayName("Should fetch all users")
    void shouldFetchAllUsers() {
        given()
            .baseUri(BASE_URL)
        .when()
            .get("/users")
        .then()
            .statusCode(200)
            .body("size()", equalTo(10))
            .body("name", hasItems("Leanne Graham", "Ervin Howell"));
    }
}
```

### Requisicao POST - Criando Recursos

```java
@Test
@DisplayName("Should create a new post")
void shouldCreateNewPost() {
    String requestBody = """
        {
            "title": "My New Post",
            "body": "This is the content of my post",
            "userId": 1
        }
        """;

    given()
        .baseUri(BASE_URL)
        .contentType("application/json")
        .body(requestBody)
    .when()
        .post("/posts")
    .then()
        .statusCode(201)
        .body("title", equalTo("My New Post"))
        .body("id", notNullValue());
}
```

### Usando POJOs para Request/Response

Crie classes de modelo para codigo mais limpo:

```java
// Post.java
public class Post {
    private Integer id;
    private String title;
    private String body;
    private Integer userId;

    // Construtor padrao para desserializacao JSON
    public Post() {}

    public Post(String title, String body, Integer userId) {
        this.title = title;
        this.body = body;
        this.userId = userId;
    }

    // Getters e setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
}
```

```java
@Test
@DisplayName("Should create post using POJO")
void shouldCreatePostUsingPojo() {
    Post newPost = new Post("POJO Title", "Content from POJO", 1);

    Post createdPost = given()
        .baseUri(BASE_URL)
        .contentType("application/json")
        .body(newPost)
    .when()
        .post("/posts")
    .then()
        .statusCode(201)
        .extract()
        .as(Post.class);

    assertThat(createdPost.getTitle()).isEqualTo("POJO Title");
    assertThat(createdPost.getId()).isNotNull();
}
```

### Requisicoes PUT e PATCH

```java
@Test
@DisplayName("Should update entire post with PUT")
void shouldUpdatePostWithPut() {
    Post updatedPost = new Post("Updated Title", "Updated Body", 1);

    given()
        .baseUri(BASE_URL)
        .contentType("application/json")
        .body(updatedPost)
    .when()
        .put("/posts/1")
    .then()
        .statusCode(200)
        .body("title", equalTo("Updated Title"));
}

@Test
@DisplayName("Should partially update post with PATCH")
void shouldPartiallyUpdateWithPatch() {
    given()
        .baseUri(BASE_URL)
        .contentType("application/json")
        .body("{\"title\": \"Patched Title\"}")
    .when()
        .patch("/posts/1")
    .then()
        .statusCode(200)
        .body("title", equalTo("Patched Title"))
        .body("body", notNullValue()); // Body original preservado
}
```

### Requisicao DELETE

```java
@Test
@DisplayName("Should delete a post")
void shouldDeletePost() {
    given()
        .baseUri(BASE_URL)
    .when()
        .delete("/posts/1")
    .then()
        .statusCode(200);
}
```

---

## Parte 2: Screenplay Pattern para Testes de API

O Screenplay Pattern fornece uma abordagem mais sustentavel e centrada no ator:

### Configurando Actor com Ability de API

```java
package com.example.api.screenplay;

import net.serenitybdd.junit5.SerenityJUnit5Extension;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.rest.abilities.CallAnApi;
import net.serenitybdd.screenplay.rest.interactions.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;

import static net.serenitybdd.screenplay.rest.questions.ResponseConsequence.seeThatResponse;
import static org.hamcrest.Matchers.*;

@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("Screenplay REST API Tests")
class ScreenplayRestTest {

    private static final String BASE_URL = "https://jsonplaceholder.typicode.com";

    Actor alex;

    @BeforeEach
    void setUp() {
        alex = Actor.named("Alex the API tester")
                    .whoCan(CallAnApi.at(BASE_URL));
    }

    @Test
    @DisplayName("Should fetch user with Screenplay")
    void shouldFetchUserWithScreenplay() {
        alex.attemptsTo(
            Get.resource("/users/1")
        );

        alex.should(
            seeThatResponse("User details are correct",
                response -> response
                    .statusCode(200)
                    .body("name", equalTo("Leanne Graham"))
            )
        );
    }

    @Test
    @DisplayName("Should create post with Screenplay")
    void shouldCreatePostWithScreenplay() {
        alex.attemptsTo(
            Post.to("/posts")
                .with(request -> request
                    .contentType("application/json")
                    .body(new Post("Screenplay Post", "Content", 1))
                )
        );

        alex.should(
            seeThatResponse("Post was created",
                response -> response
                    .statusCode(201)
                    .body("title", equalTo("Screenplay Post"))
            )
        );
    }
}
```

### Criando Task Reutilizaveis

Encapsule operacoes de API em Task reutilizaveis:

```java
// tasks/CreatePost.java
package com.example.api.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.rest.interactions.Post;
import net.thucydides.core.annotations.Step;
import com.example.api.model.Post;

import static net.serenitybdd.screenplay.Tasks.instrumented;

public class CreatePost implements Task {

    private final Post post;

    public CreatePost(Post post) {
        this.post = post;
    }

    public static CreatePost withDetails(String title, String body, int userId) {
        return instrumented(CreatePost.class, new Post(title, body, userId));
    }

    public static CreatePost withTitle(String title) {
        return instrumented(CreatePost.class, new Post(title, "Default body", 1));
    }

    @Override
    @Step("{0} creates a new post titled '#post.title'")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Post.to("/posts")
                .with(request -> request
                    .contentType("application/json")
                    .body(post)
                )
        );
    }
}
```

```java
// tasks/FetchUser.java
package com.example.api.tasks;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.rest.interactions.Get;
import net.thucydides.core.annotations.Step;

import static net.serenitybdd.screenplay.Tasks.instrumented;

public class FetchUser implements Task {

    private final int userId;

    public FetchUser(int userId) {
        this.userId = userId;
    }

    public static FetchUser withId(int userId) {
        return instrumented(FetchUser.class, userId);
    }

    @Override
    @Step("{0} fetches user with ID #userId")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Get.resource("/users/{id}")
               .with(request -> request.pathParam("id", userId))
        );
    }
}
```

Usando as Task:

```java
@Test
@DisplayName("Should use custom tasks for API operations")
void shouldUseCustomTasks() {
    alex.attemptsTo(
        CreatePost.withDetails("Task-based Post", "Content from task", 1)
    );

    alex.should(
        seeThatResponse("Post was created successfully",
            response -> response.statusCode(201)
        )
    );

    alex.attemptsTo(
        FetchUser.withId(1)
    );

    alex.should(
        seeThatResponse("User was retrieved",
            response -> response
                .statusCode(200)
                .body("name", notNullValue())
        )
    );
}
```

### Criando Question Reutilizaveis

```java
// questions/TheUser.java
package com.example.api.questions;

import net.serenitybdd.rest.SerenityRest;
import net.serenitybdd.screenplay.Question;
import com.example.api.model.User;

public class TheUser {

    public static Question<User> details() {
        return actor -> SerenityRest.lastResponse()
                                    .jsonPath()
                                    .getObject("", User.class);
    }

    public static Question<String> name() {
        return actor -> SerenityRest.lastResponse()
                                    .jsonPath()
                                    .getString("name");
    }

    public static Question<String> email() {
        return actor -> SerenityRest.lastResponse()
                                    .jsonPath()
                                    .getString("email");
    }
}
```

```java
@Test
@DisplayName("Should use questions to query responses")
void shouldUseQuestionsToQueryResponses() {
    alex.attemptsTo(
        FetchUser.withId(1)
    );

    String userName = alex.asksFor(TheUser.name());
    assertThat(userName).isEqualTo("Leanne Graham");

    User user = alex.asksFor(TheUser.details());
    assertThat(user.getEmail()).isEqualTo("Sincere@april.biz");
}
```

---

## Parte 3: Padroes de Autenticacao

### Autenticacao Basica

```java
@Test
@DisplayName("Should authenticate with Basic Auth")
void shouldAuthenticateWithBasicAuth() {
    given()
        .baseUri("https://httpbin.org")
        .auth().basic("user", "passwd")
    .when()
        .get("/basic-auth/user/passwd")
    .then()
        .statusCode(200)
        .body("authenticated", equalTo(true));
}
```

### Autenticacao com Bearer Token

Usando a API Restful-Booker para autenticacao baseada em token:

```java
@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("Token Authentication Tests")
class TokenAuthTest {

    private static final String BOOKER_URL = "https://restful-booker.herokuapp.com";
    private String authToken;

    @BeforeEach
    void authenticate() {
        // Obter token de autenticacao
        authToken = given()
            .baseUri(BOOKER_URL)
            .contentType("application/json")
            .body("""
                {
                    "username": "admin",
                    "password": "password123"
                }
                """)
        .when()
            .post("/auth")
        .then()
            .statusCode(200)
            .extract()
            .path("token");

        assertThat(authToken).isNotNull();
    }

    @Test
    @DisplayName("Should use token for authenticated requests")
    void shouldUseTokenForAuthenticatedRequests() {
        // Criar uma reserva
        String bookingBody = """
            {
                "firstname": "John",
                "lastname": "Doe",
                "totalprice": 150,
                "depositpaid": true,
                "bookingdates": {
                    "checkin": "2024-01-01",
                    "checkout": "2024-01-05"
                },
                "additionalneeds": "Breakfast"
            }
            """;

        int bookingId = given()
            .baseUri(BOOKER_URL)
            .contentType("application/json")
            .body(bookingBody)
        .when()
            .post("/booking")
        .then()
            .statusCode(200)
            .extract()
            .path("bookingid");

        // Atualizar reserva usando token
        given()
            .baseUri(BOOKER_URL)
            .contentType("application/json")
            .cookie("token", authToken)  // Token no cookie
            .body("""
                {
                    "firstname": "Jane",
                    "lastname": "Doe",
                    "totalprice": 200,
                    "depositpaid": true,
                    "bookingdates": {
                        "checkin": "2024-01-01",
                        "checkout": "2024-01-05"
                    },
                    "additionalneeds": "Dinner"
                }
                """)
        .when()
            .put("/booking/" + bookingId)
        .then()
            .statusCode(200)
            .body("firstname", equalTo("Jane"));
    }

    @Test
    @DisplayName("Should use Authorization header for token")
    void shouldUseAuthorizationHeader() {
        given()
            .baseUri(BOOKER_URL)
            .header("Authorization", "Bearer " + authToken)
        .when()
            .get("/booking")
        .then()
            .statusCode(200);
    }
}
```

### Autenticacao com API Key

```java
@Test
@DisplayName("Should authenticate with API key in header")
void shouldAuthenticateWithApiKey() {
    given()
        .baseUri("https://api.example.com")
        .header("X-API-Key", "your-api-key-here")
    .when()
        .get("/protected-resource")
    .then()
        .statusCode(200);
}

@Test
@DisplayName("Should authenticate with API key in query parameter")
void shouldAuthenticateWithApiKeyInQuery() {
    given()
        .baseUri("https://api.example.com")
        .queryParam("api_key", "your-api-key-here")
    .when()
        .get("/protected-resource")
    .then()
        .statusCode(200);
}
```

### Task de Autenticacao com Screenplay

```java
// tasks/Authenticate.java
package com.example.api.tasks;

import net.serenitybdd.rest.SerenityRest;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.rest.interactions.Post;
import net.thucydides.core.annotations.Step;

import static net.serenitybdd.screenplay.Tasks.instrumented;

public class Authenticate implements Task {

    private final String username;
    private final String password;

    public Authenticate(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public static Authenticate withCredentials(String username, String password) {
        return instrumented(Authenticate.class, username, password);
    }

    public static Authenticate asAdmin() {
        return instrumented(Authenticate.class, "admin", "password123");
    }

    @Override
    @Step("{0} authenticates as #username")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            Post.to("/auth")
                .with(request -> request
                    .contentType("application/json")
                    .body(String.format("""
                        {"username": "%s", "password": "%s"}
                        """, username, password))
                )
        );

        String token = SerenityRest.lastResponse().path("token");
        actor.remember("authToken", token);
    }
}
```

Usando a Task de autenticacao:

```java
@Test
@DisplayName("Should authenticate and use token in subsequent requests")
void shouldAuthenticateAndUseToken() {
    Actor admin = Actor.named("Admin")
                       .whoCan(CallAnApi.at(BOOKER_URL));

    admin.attemptsTo(
        Authenticate.asAdmin()
    );

    String token = admin.recall("authToken");
    assertThat(token).isNotNull();

    // Usar token na requisicao subsequente
    admin.attemptsTo(
        Get.resource("/booking")
           .with(request -> request.cookie("token", token))
    );

    admin.should(
        seeThatResponse(response -> response.statusCode(200))
    );
}
```

---

## Parte 4: Tratamento de Erros e Validacao

### Testando Respostas de Erro

```java
@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("Error Handling Tests")
class ErrorHandlingTest {

    private static final String BASE_URL = "https://jsonplaceholder.typicode.com";

    @Test
    @DisplayName("Should handle 404 Not Found")
    void shouldHandle404NotFound() {
        given()
            .baseUri(BASE_URL)
        .when()
            .get("/users/99999")
        .then()
            .statusCode(404);
    }

    @Test
    @DisplayName("Should handle invalid request body")
    void shouldHandleInvalidRequestBody() {
        given()
            .baseUri("https://reqres.in/api")
            .contentType("application/json")
            .body("{invalid json}")
        .when()
            .post("/users")
        .then()
            .statusCode(anyOf(equalTo(400), equalTo(500)));
    }

    @Test
    @DisplayName("Should verify error message content")
    void shouldVerifyErrorMessageContent() {
        given()
            .baseUri("https://reqres.in/api")
        .when()
            .post("/login")  // Campos obrigatorios ausentes
        .then()
            .statusCode(400)
            .body("error", equalTo("Missing email or username"));
    }
}
```

### Testando Multiplos Status Codes

```java
@ParameterizedTest
@CsvSource({
    "1, 200",
    "2, 200",
    "99999, 404"
})
@DisplayName("Should return correct status for user ID")
void shouldReturnCorrectStatusForUserId(int userId, int expectedStatus) {
    given()
        .baseUri("https://reqres.in/api")
    .when()
        .get("/users/" + userId)
    .then()
        .statusCode(expectedStatus);
}
```

### Validacao de JSON Schema

Crie um arquivo de schema em `src/test/resources/schemas/user-schema.json`:

```json
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["data"],
    "properties": {
        "data": {
            "type": "object",
            "required": ["id", "email", "first_name", "last_name", "avatar"],
            "properties": {
                "id": {
                    "type": "integer"
                },
                "email": {
                    "type": "string",
                    "format": "email"
                },
                "first_name": {
                    "type": "string",
                    "minLength": 1
                },
                "last_name": {
                    "type": "string",
                    "minLength": 1
                },
                "avatar": {
                    "type": "string",
                    "format": "uri"
                }
            }
        }
    }
}
```

```java
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;

@Test
@DisplayName("Should match JSON schema")
void shouldMatchJsonSchema() {
    given()
        .baseUri("https://reqres.in/api")
    .when()
        .get("/users/1")
    .then()
        .statusCode(200)
        .body(matchesJsonSchemaInClasspath("schemas/user-schema.json"));
}
```

### Validacao de Tempo de Resposta

```java
import static java.util.concurrent.TimeUnit.SECONDS;
import static java.util.concurrent.TimeUnit.MILLISECONDS;

@Test
@DisplayName("Should respond within acceptable time")
void shouldRespondWithinAcceptableTime() {
    given()
        .baseUri(BASE_URL)
    .when()
        .get("/users")
    .then()
        .statusCode(200)
        .time(lessThan(5L), SECONDS);
}

@Test
@DisplayName("Should track response time")
void shouldTrackResponseTime() {
    long responseTime = given()
        .baseUri(BASE_URL)
    .when()
        .get("/users")
    .then()
        .extract()
        .time();

    System.out.println("Response time: " + responseTime + "ms");
    assertThat(responseTime).isLessThan(5000);
}
```

---

## Parte 5: Chamadas de API Encadeadas

Frequentemente voce precisa usar dados de uma chamada de API em chamadas subsequentes:

```java
@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("Chained API Calls")
class ChainedApiTest {

    private static final String BASE_URL = "https://jsonplaceholder.typicode.com";

    @Test
    @DisplayName("Should create post and then fetch it")
    void shouldCreatePostAndThenFetchIt() {
        // Passo 1: Criar um novo post
        Post newPost = new Post("Chained Test", "Testing chained calls", 1);

        Integer postId = given()
            .baseUri(BASE_URL)
            .contentType("application/json")
            .body(newPost)
        .when()
            .post("/posts")
        .then()
            .statusCode(201)
            .extract()
            .path("id");

        // Passo 2: Buscar o post criado
        given()
            .baseUri(BASE_URL)
        .when()
            .get("/posts/" + postId)
        .then()
            .statusCode(200)
            .body("title", equalTo("Chained Test"));
    }

    @Test
    @DisplayName("Should fetch user and then their posts")
    void shouldFetchUserAndTheirPosts() {
        // Passo 1: Obter usuario
        int userId = given()
            .baseUri(BASE_URL)
        .when()
            .get("/users/1")
        .then()
            .statusCode(200)
            .extract()
            .path("id");

        // Passo 2: Obter posts desse usuario
        given()
            .baseUri(BASE_URL)
            .queryParam("userId", userId)
        .when()
            .get("/posts")
        .then()
            .statusCode(200)
            .body("size()", greaterThan(0))
            .body("userId", everyItem(equalTo(userId)));
    }

    @Test
    @DisplayName("Should perform CRUD lifecycle")
    void shouldPerformCrudLifecycle() {
        // CREATE
        Integer postId = given()
            .baseUri(BASE_URL)
            .contentType("application/json")
            .body(new Post("CRUD Test", "Initial content", 1))
        .when()
            .post("/posts")
        .then()
            .statusCode(201)
            .extract()
            .path("id");

        System.out.println("Created post with ID: " + postId);

        // READ
        given()
            .baseUri(BASE_URL)
        .when()
            .get("/posts/" + postId)
        .then()
            .statusCode(200)
            .body("title", equalTo("CRUD Test"));

        // UPDATE
        given()
            .baseUri(BASE_URL)
            .contentType("application/json")
            .body(new Post("Updated CRUD Test", "Updated content", 1))
        .when()
            .put("/posts/" + postId)
        .then()
            .statusCode(200)
            .body("title", equalTo("Updated CRUD Test"));

        // DELETE
        given()
            .baseUri(BASE_URL)
        .when()
            .delete("/posts/" + postId)
        .then()
            .statusCode(200);
    }
}
```

### Chamadas Encadeadas com Screenplay

```java
@Test
@DisplayName("Should chain API calls with Screenplay")
void shouldChainApiCallsWithScreenplay() {
    Actor tester = Actor.named("API Tester")
                        .whoCan(CallAnApi.at(BASE_URL));

    // Criar post e lembrar o ID
    tester.attemptsTo(
        Post.to("/posts")
            .with(request -> request
                .contentType("application/json")
                .body(new Post("Screenplay Chain", "Content", 1))
            )
    );

    Integer postId = SerenityRest.lastResponse().path("id");
    tester.remember("postId", postId);

    // Buscar o post usando o ID lembrado
    tester.attemptsTo(
        Get.resource("/posts/{id}")
           .with(request -> request.pathParam("id", tester.recall("postId")))
    );

    tester.should(
        seeThatResponse(response -> response
            .statusCode(200)
            .body("title", equalTo("Screenplay Chain"))
        )
    );
}
```

---

## Parte 6: Testes de API Orientados a Dados

### Testes Parametrizados

```java
@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("Data-Driven API Tests")
class DataDrivenApiTest {

    private static final String BASE_URL = "https://jsonplaceholder.typicode.com";

    @ParameterizedTest
    @ValueSource(ints = {1, 2, 3, 4, 5})
    @DisplayName("Should fetch user by ID")
    void shouldFetchUserById(int userId) {
        given()
            .baseUri(BASE_URL)
        .when()
            .get("/users/" + userId)
        .then()
            .statusCode(200)
            .body("id", equalTo(userId));
    }

    @ParameterizedTest
    @CsvSource({
        "1, Leanne Graham, Sincere@april.biz",
        "2, Ervin Howell, Shanna@melissa.tv",
        "3, Clementine Bauch, Nathan@yesenia.net"
    })
    @DisplayName("Should verify user details")
    void shouldVerifyUserDetails(int id, String name, String email) {
        given()
            .baseUri(BASE_URL)
        .when()
            .get("/users/" + id)
        .then()
            .statusCode(200)
            .body("name", equalTo(name))
            .body("email", equalTo(email));
    }

    @ParameterizedTest
    @MethodSource("postDataProvider")
    @DisplayName("Should create posts with various data")
    void shouldCreatePostsWithVariousData(Post post) {
        given()
            .baseUri(BASE_URL)
            .contentType("application/json")
            .body(post)
        .when()
            .post("/posts")
        .then()
            .statusCode(201)
            .body("title", equalTo(post.getTitle()));
    }

    static Stream<Post> postDataProvider() {
        return Stream.of(
            new Post("First Post", "Content 1", 1),
            new Post("Second Post", "Content 2", 2),
            new Post("Third Post", "Content 3", 3)
        );
    }
}
```

### Carregando Dados de Teste de Arquivos

Crie um arquivo de dados de teste `src/test/resources/testdata/users.json`:

```json
[
    {"userId": 1, "expectedName": "Leanne Graham"},
    {"userId": 2, "expectedName": "Ervin Howell"},
    {"userId": 3, "expectedName": "Clementine Bauch"}
]
```

```java
@ParameterizedTest
@MethodSource("loadUsersFromFile")
@DisplayName("Should verify users from JSON file")
void shouldVerifyUsersFromFile(int userId, String expectedName) {
    given()
        .baseUri(BASE_URL)
    .when()
        .get("/users/" + userId)
    .then()
        .statusCode(200)
        .body("name", equalTo(expectedName));
}

static Stream<Arguments> loadUsersFromFile() throws Exception {
    ObjectMapper mapper = new ObjectMapper();
    List<Map<String, Object>> users = mapper.readValue(
        new File("src/test/resources/testdata/users.json"),
        new TypeReference<List<Map<String, Object>>>() {}
    );

    return users.stream()
        .map(user -> Arguments.of(
            ((Number) user.get("userId")).intValue(),
            user.get("expectedName")
        ));
}
```

---

## Parte 7: Upload e Download de Arquivos

### Upload de Arquivo (Multipart)

```java
@Test
@DisplayName("Should upload a file")
void shouldUploadFile() {
    File testFile = new File("src/test/resources/testdata/sample.txt");

    given()
        .baseUri("https://httpbin.org")
        .multiPart("file", testFile)
    .when()
        .post("/post")
    .then()
        .statusCode(200)
        .body("files.file", notNullValue());
}

@Test
@DisplayName("Should upload file with additional form data")
void shouldUploadFileWithFormData() {
    File testFile = new File("src/test/resources/testdata/sample.txt");

    given()
        .baseUri("https://httpbin.org")
        .multiPart("file", testFile)
        .formParam("description", "Test file upload")
        .formParam("category", "documents")
    .when()
        .post("/post")
    .then()
        .statusCode(200);
}
```

### Download de Arquivo

```java
@Test
@DisplayName("Should download a file")
void shouldDownloadFile() {
    byte[] fileContent = given()
        .baseUri("https://httpbin.org")
    .when()
        .get("/image/png")
    .then()
        .statusCode(200)
        .contentType("image/png")
        .extract()
        .asByteArray();

    assertThat(fileContent.length).isGreaterThan(0);

    // Opcionalmente salvar em arquivo
    // Files.write(Paths.get("downloaded.png"), fileContent);
}
```

---

## Parte 8: Configuracao Avancada

### Request Specification (Configuracao Reutilizavel)

```java
@ExtendWith(SerenityJUnit5Extension.class)
class RequestSpecificationTest {

    private RequestSpecification baseSpec;

    @BeforeEach
    void setup() {
        baseSpec = new RequestSpecBuilder()
            .setBaseUri("https://jsonplaceholder.typicode.com")
            .setContentType("application/json")
            .addHeader("Accept", "application/json")
            .log(LogDetail.ALL)
            .build();
    }

    @Test
    @DisplayName("Should use request specification")
    void shouldUseRequestSpecification() {
        given()
            .spec(baseSpec)
        .when()
            .get("/users/1")
        .then()
            .statusCode(200);
    }
}
```

### Response Specification (Assercoes Reutilizaveis)

```java
@ExtendWith(SerenityJUnit5Extension.class)
class ResponseSpecificationTest {

    private ResponseSpecification successSpec;
    private ResponseSpecification errorSpec;

    @BeforeEach
    void setup() {
        successSpec = new ResponseSpecBuilder()
            .expectStatusCode(200)
            .expectContentType("application/json")
            .expectResponseTime(lessThan(5000L))
            .build();

        errorSpec = new ResponseSpecBuilder()
            .expectStatusCode(404)
            .build();
    }

    @Test
    @DisplayName("Should use success response specification")
    void shouldUseSuccessResponseSpec() {
        given()
            .baseUri("https://jsonplaceholder.typicode.com")
        .when()
            .get("/users/1")
        .then()
            .spec(successSpec)
            .body("name", notNullValue());
    }
}
```

### Timeouts e Retries

```java
import static io.restassured.config.HttpClientConfig.httpClientConfig;

@Test
@DisplayName("Should configure connection timeout")
void shouldConfigureTimeout() {
    given()
        .baseUri("https://jsonplaceholder.typicode.com")
        .config(RestAssured.config()
            .httpClient(httpClientConfig()
                .setParam("http.connection.timeout", 5000)
                .setParam("http.socket.timeout", 5000)
            )
        )
    .when()
        .get("/users")
    .then()
        .statusCode(200);
}
```

### Logging

```java
@Test
@DisplayName("Should log request and response")
void shouldLogRequestAndResponse() {
    given()
        .baseUri("https://jsonplaceholder.typicode.com")
        .log().all()  // Logar toda a requisicao
    .when()
        .get("/users/1")
    .then()
        .log().all()  // Logar toda a resposta
        .statusCode(200);
}

@Test
@DisplayName("Should log only on failure")
void shouldLogOnlyOnFailure() {
    given()
        .baseUri("https://jsonplaceholder.typicode.com")
        .log().ifValidationFails()
    .when()
        .get("/users/1")
    .then()
        .log().ifValidationFails()
        .statusCode(200);
}
```

---

## Parte 9: Testes Hibridos UI + API

Combine testes de UI e API para cenarios end-to-end poderosos:

### Usando Playwright com Chamadas de API

```java
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import net.serenitybdd.screenplay.playwright.interactions.*;
import net.serenitybdd.screenplay.rest.abilities.CallAnApi;
import net.serenitybdd.screenplay.rest.interactions.Post;

@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("Hybrid UI + API Tests")
class HybridTest {

    @Test
    @DisplayName("Should create data via API and verify in UI")
    void shouldCreateDataViaApiAndVerifyInUi() {
        // Actor com ambas as Ability
        Actor tester = Actor.named("Hybrid Tester")
            .whoCan(CallAnApi.at("https://api.example.com"))
            .whoCan(BrowseTheWebWithPlaywright.usingTheDefaultConfiguration());

        // Criar dados via API
        tester.attemptsTo(
            Post.to("/products")
                .with(request -> request
                    .contentType("application/json")
                    .body("""
                        {"name": "New Product", "price": 99.99}
                        """)
                )
        );

        // Verificar na UI
        tester.attemptsTo(
            Open.url("https://example.com/products"),
            Ensure.that(Text.of(".product-name")).contains("New Product")
        );
    }

    @Test
    @DisplayName("Should perform UI action and verify via API")
    void shouldPerformUiActionAndVerifyViaApi() {
        Actor tester = Actor.named("Hybrid Tester")
            .whoCan(CallAnApi.at("https://api.example.com"))
            .whoCan(BrowseTheWebWithPlaywright.usingTheDefaultConfiguration());

        // Realizar acao na UI
        tester.attemptsTo(
            Open.url("https://example.com/checkout"),
            Click.on("#place-order-button")
        );

        // Verificar via API
        tester.attemptsTo(
            Get.resource("/orders/latest")
        );

        tester.should(
            seeThatResponse(response -> response
                .statusCode(200)
                .body("status", equalTo("placed"))
            )
        );
    }
}
```

---

## Parte 10: Melhores Praticas

### 1. Organize por Dominio

```
src/test/java/com/example/api/
├── model/
│   ├── User.java
│   ├── Post.java
│   └── Booking.java
├── tasks/
│   ├── CreateUser.java
│   ├── FetchUser.java
│   └── Authenticate.java
├── questions/
│   ├── TheUser.java
│   └── TheResponse.java
├── specs/
│   ├── RequestSpecs.java
│   └── ResponseSpecs.java
└── tests/
    ├── UserApiTest.java
    ├── PostApiTest.java
    └── AuthenticationTest.java
```

### 2. Use Assercoes Significativas

```java
// Ruim
response.body("data", notNullValue());

// Bom
response.body("data.id", equalTo(expectedUserId))
        .body("data.email", matchesPattern("^[\\w.-]+@[\\w.-]+\\.\\w+$"))
        .body("data.created_at", notNullValue());
```

### 3. Extraia Setup Comum

```java
public class ApiTestBase {

    protected static final String BASE_URL =
        System.getProperty("api.baseurl", "https://api.example.com");

    protected RequestSpecification baseRequest() {
        return given()
            .baseUri(BASE_URL)
            .contentType("application/json")
            .accept("application/json")
            .log().ifValidationFails();
    }
}
```

### 4. Use Tags para Categorias de Teste

```java
@Tag("smoke")
@Test
void criticalEndpointTest() { }

@Tag("regression")
@Test
void detailedValidationTest() { }

@Tag("slow")
@Test
void performanceTest() { }
```

### 5. Limpe Dados de Teste

```java
@AfterEach
void cleanup() {
    if (createdResourceId != null) {
        given()
            .baseUri(BASE_URL)
            .header("Authorization", "Bearer " + authToken)
        .when()
            .delete("/resources/" + createdResourceId)
        .then()
            .statusCode(anyOf(equalTo(200), equalTo(204), equalTo(404)));
    }
}
```

---

## Resumo

Este tutorial cobriu:

| Topico | Descricao |
|-------|-------------|
| Operacoes Basicas | Requisicoes GET, POST, PUT, PATCH, DELETE |
| Screenplay Pattern | Testes de API centrados no Actor com Task e Question |
| Autenticacao | Basic auth, bearer tokens, API keys |
| Tratamento de Erros | Testando respostas de erro, validacao de schema |
| Chamadas Encadeadas | Usando dados de uma chamada em outra |
| Testes Orientados a Dados | Testes parametrizados com varias fontes de dados |
| Operacoes de Arquivo | Upload e download de arquivos |
| Configuracao | Request/response specs, timeouts, logging |
| Testes Hibridos | Combinando testes de UI e API |

## Proximos Passos

- Explore [Screenplay REST](/docs/screenplay/screenplay_rest) para mais padroes Screenplay
- Aprenda sobre [Relatorios Serenity](/docs/reporting/the_serenity_reports) para relatorios de testes de API
- Confira [Integracao com Cucumber](/docs/cucumber/cucumber-junit5) para testes de API no estilo BDD

## Recursos

- [Documentacao do Rest-Assured](https://rest-assured.io/)
- [API JSONPlaceholder](https://jsonplaceholder.typicode.com/)
- [API ReqRes](https://reqres.in/)
- [API Restful-Booker](https://restful-booker.herokuapp.com/apidoc/)
- [JSON Schema](https://json-schema.org/)
