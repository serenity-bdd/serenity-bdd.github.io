---
id: screenplay_rest
sidebar_position: 3
---
# Working with REST APIs using Serenity Screenplay

The Screenplay pattern is an approach to writing automated acceptance tests that helps us write cleaner, more maintainable, more scalable automation code. A Screenplay test talks first and foremost about the tasks a user performs, in business language, rather than diving into the details about buttons, clicks and input fields. Focusing on the business tasks makes our tests more readable, more maintainable, and easier to scale.

Screenplay is often associated with UI testing. Interestingly, the name of the pattern is actually unrelated to screens or user interfaces; it comes from a theatre metaphor, where actors play roles on a stage following a predefined script (the "screenplay"), and was coined by Antony Marcano and Andy Palmer around 2015. The pattern itself goes back further than that, and has been around in various forms since it was first proposed by Antony Marcano in 2007.

But Screenplay is also a great fit for API or web service tests. In particular, Screenplay is ideal when we want to include API and UI activities in the same test. For example, we might have an API task to set up some test data, a UI task to illustrate how a user interacts with this data, then another API task to check the new state of the database.

You can get a taste of what REST API interactions using Serenity Screenplay look like here:

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

Serenity Screenplay uses http://rest-assured.io[Rest-Assured] to interact with rest endpoints, and to query the responses. Rest-Assured provides us with a simple but extremely powerful Java DSL that allows us to test and virtually any kind of REST end point. Its highly readable code is also an ideal fit for Screenplay.

## Setting up your project

To test REST API services with Screenplay, you need to add the `serenity-screenplay-rest` dependency to your project. In Maven, add the following to the dependencies in your `pom.xml` file:

```xml
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-screenplay-rest</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
```

And for Gradle, you can add the same dependency to your `build.gradle` file:

```groovy
testCompile "net.serenity-bdd:serenity-screenplay-rest:${serenityVersion}"
```

## Defining a base URI

When you test a REST API, it is convenient to be able to use the same tests against different environments. You may want to run your tests against a server running on your local machine, against a QA server, or even against a production box. And you don't want to have to change your tests whenever you test against a different environment.

For example, in this chapter, we will be demonstrating the features of `serenity-screenplay-rest` using the https://reqres.in[ResReq] application (see below). If you have a reliable internet connection, you can run your tests against the live ResReq server at https://reqres.in/api/. Or if you are running the ResReq server locally, you would access endpoints at http://localhost:5000/api.

---
**The ResReq test application**

The https://reqres.in[ResReq] application is an open source application written by http://benhowdle.im/[Ben Howdle] that makes it easy to experiment with REST APIs. It is hosted on Digital Ocean, where you can access it online at https://reqres.in/api/. Alternatively, you can also download the application from the project's https://github.com/benhowdle89/reqres[repository on Github], and run it locally. When you run the application on your own machine, the REST API will be available at http://localhost:5000/api.

---

=== Reading from the Serenity config file

In Serenity BDD, you can define the base URL for your REST API directly in the `serenity.properties` or `serenity.conf` file for your project.
Here is an example from a `serenity.conf` file:

```json
restapi {
      baseurl = "https://reqres.in/api"
}
```

Any test can read values from the Serenity configuration files simply by creating a field of type `EnvironmentVariables` in the test.
You can then fetch the property, and provide a default value to use if the property hasn't been defined, as shown below:

```java
theRestApiBaseUrl = environmentVariables.optionalProperty("restapi.baseurl")
                                        .orElse("https://reqres.in/api");
```

=== Setting the API Url from the command line

You can override the default URL defined this way simply by providing a system property on the command line, like this:

```
mvn verify -Drestapi.baseurl=http://localhost:5000/api
```

### Configuring the base API URL in Maven

If you are using Maven, a more convenient approach may be to use http://maven.apache.org/guides/introduction/introduction-to-profiles.html[Maven Profiles].
In your `pom.xml` file, you define up different Maven profiles for each environment, and set the `restapi.baseurl` property accordingly:

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

For this to work properly, you also need to ensure that the `restapi.baseurl` is passed correctly to your tests.
You do this by using the `systemPropertyVariables` tag in the `maven-failsafe-plugin' configuration, as shown here:

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

You can then run the tests with Maven using the `-P` option:

```
$ mvn verify -Pdev
```

## Configuring the actor - the CallAnApi ability

In Screenplay, tests describe behaviour in terms of _actors_, who achieve their business goals by performing _tasks_.
These tasks usually involve _interacting_ with the application in some way.
And to perform these tasks, we give the actors various _abilities_.

The `CallAnApi` ability gives actors the ability to interact with a REST web service using http://rest-assured.io[Rest-Assured].
This includes both invoking REST end-points and querying the results.

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

The `CallAnApi` ability allows the actor to perform the bundled Serenity REST interaction classes. This include:

* Get.resource()
* Post.to()
* Put.to()
* Delete.from()

The simplest of these is `Get`.

## GET Interactions

In a REST API, GET requests are used to query a REST resource.
Let's see how we can do this using Serenity Screenplay.

### Simple GET requests

In our demo application, the `/users` resource represents application users.
We can retrieve the details of a particular user by appending the user ID, like this: `/users/1`.
The structure of a user record is shown below:

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

Suppose we need to write a scenario that retrieves a particular user, and checks some of the user's details, such as first_name and last_name.
Such a test might look like this:

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

As you can see, this code is fairly self-explanatory.
Like any other Screenplay test, we use the actor's `attemptsTo()` method to perform the action we want to test.
In this case, we use the `Get` interaction class, which comes bundled with `serenity-screenplay-rest`.

Next we check the response using the `seeThatResponse` method.
This method takes a Lambda expression and allows us to access the full RestAssured API.
In particular, we can use http://static.javadoc.io/io.restassured/json-path/3.1.0/io/restassured/path/json/JsonPath.html[jsonPath] expressions to query the JSON structure we receive.


### Retrieving objects

Sometimes we need to fetch a value from a REST response, and keep it for use later on. RestAssured makes it relatively easy to convert a JSON structure to a Java object, which you can use later on in your tests.

For example, suppose we have a class like the one below, which corresponds to the user details returned by our endpoint:

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

We could retrieve the user as an instance of this class by calling the `jsonPath().getObject()` method on the received response. This method will convert the JSON data on a given path to a corresponding Java structure:

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

### Retrieving lists

Oftentimes we need to retrieve not a single item, but a list of items.
Retrieving a list is little different to retrieving a single item:

```java
sam.attemptsTo(
        Get.resource("/users") 
);

sam.should(
        seeThatResponse("all the expected users should be returned",
                response -> response.body("data.first_name", hasItems("George", "Janet", "Emma"))) 
);
```

The difference happens when we query the results.
In this case, we use a jsonPath expression (`data.first_name`) that will return _all_ of the first_name field values.
The Hamcrest matcher `hasItems` will compare the collection of first names that the jsonPath query returns, and check that it contains (at least) the names "George", "Janet" and "Emma".

But what if we want to capture the data we retrieve, rather than simply make an assertion about the contents?
We can do that using the `SerenityRest.lastResponse()` method, like this:

```java
List<String> userSurnames = SerenityRest.lastResponse().path("data.last_name"); 
assertThat(userSurnames).contains("Bluth", "Weaver", "Wong");
```

We can also retrieve lists of objects, just as we retrieved a single `User` instance in the previous section.
Simply use the `jsonPath.getList()` method as shown below:

```java
sam.attemptsTo(
        Get.resource("/users") 
);

sam.should(
        seeThatResponse("all the expected users should be returned",
                response -> response.body("data.first_name", hasItems("George", "Janet", "Emma"))) 
);
```

### Using Path Parameters

In the previous example, we hard-coded the path element in the request.
For a more flexible approach, we can supply the path parameter when we submit the query:

```java
sam.attemptsTo(
        Get.resource("/users/{id}").with( request -> request.pathParam("id", 1)) 
);
```

Here we are using the `Get.resource(...).with(...)` structure to pass the RestAssured `RequestSpecification` object into a lambda expression.
Once again, this gives us access to all the richness of the RestAssert library

### Using Query Parameters

Some REST APIs take query parameters as well as path parameters. Query parameters are commonly used to filter results or implement pagination. For example, we could get the second page of users from our `/users` API by using the `page` query parameter like this:

```
/users?page=2
```

In our test code, we use the `queryParam()` method to provide a value for the `page` parameter:

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

## Post queries

We can send POST requests to a REST end-point using the `Post` interaction class. Here is a simple example:

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

Alternatively, we can post an object, letting RestAssured convert the object fields into JSON for us:

```java
User newUser = new User("Sarah-Jane", "Smith");

sam.attemptsTo(
        Post.to("/users")
                .with(request -> request.header("Content-Type", "application/json")
                                        .body(newUser) 
                )
);
```

## Other types of queries

Other query types are similar to `GET` and `POST` queries.
For example, `PUT` requests are often used to update resources.
In the following example, we use a `PUT` request to update a user's details:

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

Or you can delete a user using the `DELETE` query as shown here:

```java
sam.attemptsTo(
        Delete.from("/users/1")
);

sam.should(
        seeThatResponse(response -> response.statusCode(204))
);
```

## Higher level tasks

The interactions we have seen so far are readable but still quite low level.
Screenplay allows us to build higher level tasks that represent the business intent behind these interactions.

For example, you could define a task that encapsulates listing all users like this:

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

We can then use a static import to refactor our first test as follows:

```java
sam.attemptsTo(
        listAllUsers()
);
```

For a bit more flexibility, we can also write a custom `Task` class. For example, we could write a `FindAUser` task to find a user by ID:

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

Using this class, we could refactor our original class to read like this:

```java
sam.attemptsTo(
        FindAUser.withId(1)
);
```

Using tasks to encapsulate REST interactions results in a clear, layered reporting structure, that first describes what the user is doing, and they how they go about it. The test report for the previous scenario is shown here:

![](img/find-a-user-by-id.png)
