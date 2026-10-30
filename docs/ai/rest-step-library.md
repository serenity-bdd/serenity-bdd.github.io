---
id: ai_rest_step_library
title: "REST with SerenityRest and a Step Library"
sidebar_position: 3
description: "Packages, the step-library pattern, and the number-matching and report pitfalls for REST API tests that use SerenityRest and @Steps; every claim was run."
---

# REST with SerenityRest and a Step Library

Verified against Serenity **5.4.1**. The example at the end of this page compiles and its tests pass; each claim was run.

This is one of several valid ways to test a REST API with Serenity. The other is Screenplay with `CallAnApi` (see `screenplay.md` and `sp-rest/`). Use the one the user asked for or the project already uses; don't mix them.

## What you need

Artifact `serenity-rest-assured` (it brings REST-assured and Hamcrest), plus `serenity-core` and `serenity-junit5` as in `project-setup.md`. Do not pin REST-assured or Groovy versions (see `troubleshooting.md`).

## Where things live

| Class | Package |
|---|---|
| `SerenityRest` (`given()`, `then()`, `lastResponse()`, `reset()`) | `net.serenitybdd.rest` |
| `@Step` | `net.serenitybdd.annotations` |
| `@Steps` | `net.serenitybdd.annotations` |
| `SerenityJUnit5Extension` | `net.serenitybdd.junit5` |
| `ScenarioSteps` (optional base class, not needed) | `net.thucydides.core.steps` |

## The pattern

1. **A step library**: a plain class whose methods are annotated `@Step("business wording")`. The REST calls go inside the methods, using `SerenityRest.given()...when().get(..)`. Use `SerenityRest`, not `io.restassured.RestAssured`: it is the same API, but Serenity records every request and response in the report.
2. **The test** declares `@Steps BookshopApi bookshop;` (Serenity creates the library) and reads like a story: `bookshop.listTheBooks(); bookshop.responseShouldHaveStatus(200);`.
3. **Checks go in `@Step` methods too**, using `SerenityRest.then().statusCode(..)` and `.body("path", matcher)`, so the report shows "The response should have status 200".

`SerenityRest.then()` checks the last response of the current thread. The base URI is not remembered between calls unless you keep it in the step library (as the example does) or set `SerenityRest`/`RestAssured.baseURI`.

## Mistakes models make

| Wrong | Right |
|---|---|
| `import net.thucydides.core.annotations.Step` or `...annotations.Steps` (compile error: cannot find symbol) | `net.serenitybdd.annotations.Step`, `net.serenitybdd.annotations.Steps` |
| `import io.restassured.RestAssured.given` for calls that should appear in the report | `net.serenitybdd.rest.SerenityRest.given` |
| Creating the library with `new BookshopApi()` in the test | `@Steps BookshopApi bookshop;`. With `new`, the business steps vanish from the report and only raw `GET http://...` lines remain. |
| `@Step` missing on a method | The method still runs but the report shows only the raw `GET http://...` line instead of your wording. |
| `body("total", equalTo(90.0))` or `closeTo(90.0, 0.001)` | JSON numbers with a decimal point come back as `Float`, so a `Double` matcher fails (`Expected: <90.0>`, `Expected: a numeric value within <0.001> of <90.0>`). Use `equalTo(90.0f)`, or read the value as a double: `SerenityRest.lastResponse().jsonPath().getDouble("total")` and assert on that (AssertJ). |
| Extending `ScenarioSteps` because old guides did | Not needed. A plain class works. If you do extend it, the package is `net.thucydides.core.steps.ScenarioSteps`. |

## Wording for the living documentation

Name steps for what a person does or sees, not for the HTTP call: "Look up book number 2", "The response should show the title Clean Code", not "GET /api/books/2" or "Check JSON path title". Give each `@Test` a `@DisplayName` that states the business outcome, and the class a `@DisplayName` naming the feature (see `living-documentation.md`).

## Examples

| Style | Files |
|---|---|
| REST + step library + JUnit 5 | `rest-steps/api/*` |

## Examples

These files compile against Serenity 5.4.1 (Playwright examples: 5.3.11).

### `rest-steps/api/BookshopApi.java`

```java
package api;

import net.serenitybdd.annotations.Step;
import net.serenitybdd.rest.SerenityRest;

import static net.serenitybdd.rest.SerenityRest.given;

/** A step library: each @Step method is one line in the report, and holds the REST calls for it. */
public class BookshopApi {
    private String baseUri;

    public void usingTheServerAt(String baseUri) {
        this.baseUri = baseUri;
    }

    @Step("List the books in the catalogue")
    public void listTheBooks() {
        given().baseUri(baseUri).when().get("/api/books");
    }

    @Step("Look up book number {0}")
    public void lookUpBook(int id) {
        given().baseUri(baseUri).when().get("/api/books/" + id);
    }

    @Step("Place an order for book {0} as a signed-in reader")
    public void placeAnOrderFor(int bookId) {
        given().baseUri(baseUri)
                .header("Authorization", "Bearer abc123")
                .contentType("application/json")
                .body("{\"items\":[{\"bookId\":" + bookId + ",\"qty\":2}],\"name\":\"Ada\"}")
                .when().post("/api/orders");
    }

    @Step("Place an order without signing in")
    public void placeAnOrderWithoutSigningIn() {
        given().baseUri(baseUri)
                .contentType("application/json")
                .body("{\"items\":[{\"bookId\":1,\"qty\":1}],\"name\":\"Ada\"}")
                .when().post("/api/orders");
    }

    @Step("The response should have status {0}")
    public void responseShouldHaveStatus(int status) {
        SerenityRest.then().statusCode(status);
    }

    @Step("The response should list {0} books")
    public void responseShouldListBooks(int count) {
        SerenityRest.then().body("size()", org.hamcrest.Matchers.equalTo(count));
    }

    @Step("The response should show the title {0}")
    public void responseShouldShowTitle(String title) {
        SerenityRest.then().body("title", org.hamcrest.Matchers.equalTo(title));
    }

    @Step("The response should show the error {0}")
    public void responseShouldShowError(String message) {
        SerenityRest.then().body("error", org.hamcrest.Matchers.equalTo(message));
    }

    @Step("The order total should be {0}")
    public void orderTotalShouldBe(double total) {
        SerenityRest.then().body("total", org.hamcrest.Matchers.equalTo((float) total));
    }
}
```

### `rest-steps/api/BookshopApiTest.java`

```java
package api;

import net.serenitybdd.annotations.Steps;
import net.serenitybdd.junit5.SerenityJUnit5Extension;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("Browsing the book catalogue")
class BookshopApiTest {

    static final BookshopServer server = new BookshopServer();
    static int port;

    @Steps
    BookshopApi bookshop;

    @BeforeAll
    static void startServer() throws Exception {
        port = server.start();
    }

    @AfterAll
    static void stopServer() {
        server.stop();
    }

    @BeforeEach
    void pointAtTheServer() {
        bookshop.usingTheServerAt("http://localhost:" + port);
    }

    @Test
    @DisplayName("A shopper sees the catalogue and finds Clean Code by its number")
    void shopperFindsABook() {
        bookshop.listTheBooks();
        bookshop.responseShouldHaveStatus(200);
        bookshop.responseShouldListBooks(2);

        bookshop.lookUpBook(2);
        bookshop.responseShouldShowTitle("Clean Code");
    }

    @Test
    @DisplayName("A shopper who asks for a book that does not exist is told so")
    void unknownBook() {
        bookshop.lookUpBook(99);
        bookshop.responseShouldHaveStatus(404);
        bookshop.responseShouldShowError("Book not found");
    }

    @Test
    @DisplayName("A signed-in reader can place an order, and an anonymous visitor cannot")
    void ordering() {
        bookshop.placeAnOrderFor(1);
        bookshop.responseShouldHaveStatus(201);
        bookshop.orderTotalShouldBe(90.0);

        bookshop.placeAnOrderWithoutSigningIn();
        bookshop.responseShouldHaveStatus(401);
        bookshop.responseShouldShowError("Authentication required");
    }
}
```

### `rest-steps/api/BookshopServer.java`

```java
package api;

import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

/** A tiny stand-in for the application under test, so the example runs without a network. */
public class BookshopServer {
    private HttpServer server;

    public int start() throws IOException {
        server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        server.createContext("/api/books", exchange -> {
            String path = exchange.getRequestURI().getPath();
            int status = 200;
            String body;
            if (path.equals("/api/books")) {
                body = "[{\"id\":1,\"title\":\"Fluent Python\",\"price\":45.0},{\"id\":2,\"title\":\"Clean Code\",\"price\":33.5}]";
            } else if (path.equals("/api/books/2")) {
                body = "{\"id\":2,\"title\":\"Clean Code\",\"price\":33.5}";
            } else {
                status = 404;
                body = "{\"error\":\"Book not found\"}";
            }
            byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(status, bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.close();
        });
        server.createContext("/api/orders", exchange -> {
            boolean signedIn = "Bearer abc123".equals(exchange.getRequestHeaders().getFirst("Authorization"));
            int status = signedIn ? 201 : 401;
            String body = signedIn ? "{\"id\":\"ORD-1001\",\"total\":90.0,\"status\":\"PLACED\"}" : "{\"error\":\"Authentication required\"}";
            byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(status, bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.close();
        });
        server.start();
        return server.getAddress().getPort();
    }

    public void stop() {
        server.stop(0);
    }
}
```
