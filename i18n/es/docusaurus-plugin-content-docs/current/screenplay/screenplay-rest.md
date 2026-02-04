---
id: screenplay_rest
sidebar_position: 3
---
# Trabajando con APIs REST usando Serenity Screenplay

El Screenplay Pattern es un enfoque para escribir pruebas de aceptacion automatizadas que nos ayuda a escribir codigo de automatizacion mas limpio, mantenible y escalable. Un test Screenplay habla primero y principalmente sobre los Task que un usuario realiza, en lenguaje de negocio, en lugar de sumergirse en los detalles sobre botones, clics y campos de entrada. Enfocarse en los Task de negocio hace que nuestros tests sean mas legibles, mas mantenibles y mas faciles de escalar.

Screenplay a menudo se asocia con pruebas de UI. Curiosamente, el nombre del patron en realidad no esta relacionado con pantallas o interfaces de usuario; proviene de una metafora teatral, donde los actores interpretan roles en un escenario siguiendo un guion predefinido (el "screenplay"), y fue acunado por Antony Marcano y Andy Palmer alrededor de 2015. El patron en si se remonta mas atras, y ha existido en varias formas desde que fue propuesto por primera vez por Antony Marcano en 2007.

Pero Screenplay tambien es una excelente opcion para pruebas de API o servicios web. En particular, Screenplay es ideal cuando queremos incluir actividades de API y UI en el mismo test. Por ejemplo, podriamos tener un Task de API para configurar algunos datos de prueba, un Task de UI para ilustrar como un usuario interactua con estos datos, y luego otro Task de API para verificar el nuevo estado de la base de datos.

Puedes tener una idea de como se ven las Interaction de API REST usando Serenity Screenplay aqui:

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

Serenity Screenplay usa [Rest-Assured](https://rest-assured.io) para interactuar con endpoints REST, y para consultar las respuestas. Rest-Assured nos proporciona un DSL Java simple pero extremadamente poderoso que nos permite probar virtualmente cualquier tipo de endpoint REST. Su codigo altamente legible tambien es una opcion ideal para Screenplay.

## Configurando tu proyecto

Para probar servicios API REST con Screenplay, necesitas agregar la dependencia `serenity-screenplay-rest` a tu proyecto. En Maven, agrega lo siguiente a las dependencias en tu archivo `pom.xml`:

```xml
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-screenplay-rest</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
```

Y para Gradle, puedes agregar la misma dependencia a tu archivo `build.gradle`:

```groovy
testCompile "net.serenity-bdd:serenity-screenplay-rest:${serenityVersion}"
```

## Definiendo una URI base

Cuando pruebas una API REST, es conveniente poder usar los mismos tests contra diferentes entornos. Puedes querer ejecutar tus tests contra un servidor ejecutandose en tu maquina local, contra un servidor QA, o incluso contra una instancia de produccion. Y no quieres tener que cambiar tus tests cada vez que pruebas contra un entorno diferente.

Por ejemplo, en este capitulo, estaremos demostrando las caracteristicas de `serenity-screenplay-rest` usando la aplicacion [ResReq](https://reqres.in) (ver abajo). Si tienes una conexion a internet confiable, puedes ejecutar tus tests contra el servidor ResReq en vivo en https://reqres.in/api/. O si estas ejecutando el servidor ResReq localmente, accederias a los endpoints en http://localhost:5000/api.


**La aplicacion de prueba ResReq**

La aplicacion [ResReq](https://reqres.in) es una aplicacion de codigo abierto escrita por [Ben Howdle](http://benhowdle.im/) que facilita experimentar con APIs REST. Esta alojada en Digital Ocean, donde puedes acceder a ella en linea en https://reqres.in/api/. Alternativamente, tambien puedes descargar la aplicacion desde el [repositorio del proyecto en Github](https://github.com/benhowdle89/reqres), y ejecutarla localmente. Cuando ejecutas la aplicacion en tu propia maquina, la API REST estara disponible en http://localhost:5000/api.



### Leyendo desde el archivo de configuracion de Serenity

En Serenity BDD, puedes definir la URL base para tu API REST directamente en el archivo `serenity.properties` o `serenity.conf` de tu proyecto.
Aqui hay un ejemplo de un archivo `serenity.conf`:

```json
restapi {
      baseurl = "https://reqres.in/api"
}
```

Cualquier test puede leer valores de los archivos de configuracion de Serenity simplemente creando un campo de tipo `EnvironmentVariables` en el test.
Luego puedes obtener la propiedad, y proporcionar un valor por defecto para usar si la propiedad no ha sido definida, como se muestra a continuacion:

```java
theRestApiBaseUrl = environmentVariables.optionalProperty("restapi.baseurl")
                                        .orElse("https://reqres.in/api");
```

### Configurando la URL de la API desde la linea de comandos

Puedes sobrescribir la URL por defecto definida de esta manera simplemente proporcionando una propiedad del sistema en la linea de comandos, asi:

```
mvn verify -Drestapi.baseurl=http://localhost:5000/api
```

### Configurando la URL base de la API en Maven

Si estas usando Maven, un enfoque mas conveniente puede ser usar [Perfiles de Maven](http://maven.apache.org/guides/introduction/introduction-to-profiles.html).
En tu archivo `pom.xml`, defines diferentes perfiles Maven para cada entorno, y configuras la propiedad `restapi.baseurl` en consecuencia:

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

Para que esto funcione correctamente, tambien necesitas asegurar que `restapi.baseurl` se pase correctamente a tus tests.
Haces esto usando la etiqueta `systemPropertyVariables` en la configuracion del `maven-failsafe-plugin`, como se muestra aqui:

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

Luego puedes ejecutar los tests con Maven usando la opcion `-P`:

```
$ mvn verify -Pdev
```

## Configurando el Actor - la Ability CallAnApi

En Screenplay, los tests describen el comportamiento en terminos de _Actor_, que logran sus objetivos de negocio realizando _Task_.
Estos Task usualmente involucran _interactuar_ con la aplicacion de alguna manera.
Y para realizar estos Task, damos a los Actor varias _Ability_ (habilidades).

La Ability `CallAnApi` da a los Actor la habilidad de interactuar con un servicio web REST usando [Rest-Assured](https://rest-assured.io).
Esto incluye tanto invocar endpoints REST como consultar los resultados.

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

La Ability `CallAnApi` permite al Actor realizar las clases de Interaction REST incluidas en Serenity. Esto incluye:

* Get.resource()
* Post.to()
* Put.to()
* Delete.from()

La mas simple de estas es `Get`.

## Interaction GET

En una API REST, las peticiones GET se usan para consultar un recurso REST.
Veamos como podemos hacer esto usando Serenity Screenplay.

### Peticiones GET simples

En nuestra aplicacion de demostracion, el recurso `/users` representa los usuarios de la aplicacion.
Podemos recuperar los detalles de un usuario particular agregando el ID del usuario, asi: `/users/1`.
La estructura de un registro de usuario se muestra a continuacion:

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

Supongamos que necesitamos escribir un Scenario que recupera un usuario particular, y verifica algunos de los detalles del usuario, como first_name y last_name.
Tal test podria verse asi:

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

Como puedes ver, este codigo es bastante autoexplicativo.
Como cualquier otro test Screenplay, usamos el metodo `attemptsTo()` del Actor para realizar la accion que queremos probar.
En este caso, usamos la clase de Interaction `Get`, que viene incluida con `serenity-screenplay-rest`.

A continuacion verificamos la respuesta usando el metodo `seeThatResponse`.
Este metodo toma una expresion Lambda y nos permite acceder a la API completa de RestAssured.
En particular, podemos usar expresiones [jsonPath](http://static.javadoc.io/io.restassured/json-path/3.1.0/io/restassured/path/json/JsonPath.html) para consultar la estructura JSON que recibimos.


### Recuperando objetos

A veces necesitamos obtener un valor de una respuesta REST, y guardarlo para usarlo mas tarde. RestAssured hace relativamente facil convertir una estructura JSON a un objeto Java, que puedes usar mas adelante en tus tests.

Por ejemplo, supongamos que tenemos una clase como la de abajo, que corresponde a los detalles de usuario devueltos por nuestro endpoint:

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

Podriamos recuperar el usuario como una instancia de esta clase llamando al metodo `jsonPath().getObject()` en la respuesta recibida. Este metodo convertira los datos JSON en una ruta dada a una estructura Java correspondiente:

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

A menudo necesitamos recuperar no un solo elemento, sino una lista de elementos.
Recuperar una lista es poco diferente a recuperar un solo elemento:

```java
sam.attemptsTo(
        Get.resource("/users")
);

sam.should(
        seeThatResponse("all the expected users should be returned",
                response -> response.body("data.first_name", hasItems("George", "Janet", "Emma")))
);
```

La diferencia ocurre cuando consultamos los resultados.
En este caso, usamos una expresion jsonPath (`data.first_name`) que devolvera _todos_ los valores del campo first_name.
El Matcher Hamcrest `hasItems` comparara la coleccion de nombres devuelta por la consulta jsonPath, y verificara que contiene (al menos) los nombres "George", "Janet" y "Emma".

Pero, que pasa si queremos capturar los datos que recuperamos, en lugar de simplemente hacer una asercion sobre el contenido?
Podemos hacer eso usando el metodo `SerenityRest.lastResponse()`, asi:

```java
List<String> userSurnames = SerenityRest.lastResponse().path("data.last_name");
assertThat(userSurnames).contains("Bluth", "Weaver", "Wong");
```

Tambien podemos recuperar listas de objetos, tal como recuperamos una sola instancia de `User` en la seccion anterior.
Simplemente usa el metodo `jsonPath.getList()` como se muestra a continuacion:

```java
sam.attemptsTo(
        Get.resource("/users")
);

sam.should(
        seeThatResponse("all the expected users should be returned",
                response -> response.body("data.first_name", hasItems("George", "Janet", "Emma")))
);
```

### Usando Parametros de Ruta

En el ejemplo anterior, codificamos el elemento de ruta en la peticion.
Para un enfoque mas flexible, podemos proporcionar el parametro de ruta cuando enviamos la consulta:

```java
sam.attemptsTo(
        Get.resource("/users/{id}").with( request -> request.pathParam("id", 1))
);
```

Aqui estamos usando la estructura `Get.resource(...).with(...)` para pasar el objeto `RequestSpecification` de RestAssured a una expresion lambda.
Una vez mas, esto nos da acceso a toda la riqueza de la biblioteca RestAssured.

### Usando Parametros de Consulta

Algunas APIs REST toman parametros de consulta ademas de parametros de ruta. Los parametros de consulta se usan comunmente para filtrar resultados o implementar paginacion. Por ejemplo, podriamos obtener la segunda pagina de usuarios de nuestra API `/users` usando el parametro de consulta `page` asi:

```
/users?page=2
```

En nuestro codigo de test, usamos el metodo `queryParam()` para proporcionar un valor para el parametro `page`:

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

Podemos enviar peticiones POST a un endpoint REST usando la clase de Interaction `Post`. Aqui hay un ejemplo simple:

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

Alternativamente, podemos publicar un objeto, dejando que RestAssured convierta los campos del objeto a JSON por nosotros:

```java
User newUser = new User("Sarah-Jane", "Smith");

sam.attemptsTo(
        Post.to("/users")
                .with(request -> request.header("Content-Type", "application/json")
                                        .body(newUser)
                )
);
```

## Otros tipos de consultas

Otros tipos de consultas son similares a las consultas `GET` y `POST`.
Por ejemplo, las peticiones `PUT` a menudo se usan para actualizar recursos.
En el siguiente ejemplo, usamos una peticion `PUT` para actualizar los detalles de un usuario:

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

O puedes eliminar un usuario usando la consulta `DELETE` como se muestra aqui:

```java
sam.attemptsTo(
        Delete.from("/users/1")
);

sam.should(
        seeThatResponse(response -> response.statusCode(204))
);
```

## Task de nivel superior

Las Interaction que hemos visto hasta ahora son legibles pero aun bastante de bajo nivel.
Screenplay nos permite construir Task de nivel superior que representan la intencion de negocio detras de estas Interaction.

Por ejemplo, podrias definir un Task que encapsula listar todos los usuarios asi:

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

Luego podemos usar un import estatico para refactorizar nuestro primer test de la siguiente manera:

```java
sam.attemptsTo(
        listAllUsers()
);
```

Para un poco mas de flexibilidad, tambien podemos escribir una clase `Task` personalizada. Por ejemplo, podriamos escribir un Task `FindAUser` para encontrar un usuario por ID:

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

Usando esta clase, podriamos refactorizar nuestra clase original para que se lea asi:

```java
sam.attemptsTo(
        FindAUser.withId(1)
);
```

Usar Task para encapsular Interaction REST resulta en una estructura de reportes clara y en capas, que primero describe lo que el usuario esta haciendo, y luego como lo hace. El reporte de prueba para el Scenario anterior se muestra aqui:

![](img/find-a-user-by-id.png)
