---
id: rest
sidebar_position: 3
---
# Tu Primera Prueba de API

En el tutorial anterior vimos cómo escribir una prueba web simple con Serenity BDD. Pero Serenity no es solo para pruebas web: Serenity BDD también proporciona una integración estrecha con [Rest Assured](https://rest-assured.io/), una popular biblioteca de código abierto para probar APIs REST.

## Prerrequisitos

Para ejecutar este tutorial, necesitarás tener instalado en tu máquina:
* **Java**: Serenity BDD es una biblioteca de Java, así que necesitarás un JDK reciente instalado. JDK 17 o superior debería funcionar bien.
* **Maven**: Necesitarás Maven 3 o superior instalado en tu computadora. Este actúa como una herramienta de construcción que también descarga las dependencias durante la compilación.
* **Un IDE de Java**: También necesitarás un Entorno de Desarrollo de Java como IntelliJ o Eclipse (y conocimiento práctico de Java).
* **Git**: Usaremos un proyecto inicial de GitHub, y el código de ejemplo para este proyecto también está en GitHub, así que asumiré que tienes un conocimiento básico de Git.

## Creando tu proyecto

Usaremos la plantilla de proyecto **[Serenity BDD Junit Starter](https://github.com/serenity-bdd/serenity-junit-starter)** para tener un proyecto simple funcionando rápidamente.

Este proyecto viene con una prueba de ejemplo basada en Junit 5 ya implementada para nuestra referencia. Por ahora, vamos a ignorarla y comenzar a escribir una nueva prueba desde cero.

Ve a la [página de la plantilla del proyecto en GitHub](https://github.com/serenity-bdd/serenity-junit-starter) y haz clic en [Use This Template](https://github.com/serenity-bdd/serenity-junit-starter/generate).

## Eliminando los archivos innecesarios

Solo para asegurarnos de que los archivos de ejemplo de la plantilla inicial no interfieran con nuestra experiencia en este tutorial, **elimina** el directorio `src/test/java/starter/wikipedia`.

## Agregando la Dependencia de Serenity RestAssured

Abre el archivo `pom.xml` en el directorio raíz y agrega las siguientes líneas en la sección `<dependencies>`, similar a las que ya están en el archivo.

```xml
 <dependency>
      <groupId>net.serenity-bdd</groupId>
      <artifactId>serenity-rest-assured</artifactId>
      <version>${serenity.version}</version>
      <scope>test</scope>
  </dependency>
```

## Habilitando Reportes HTML Detallados

Cuando usamos la configuración predeterminada de la plantilla, obtenemos solo un reporte HTML de una sola página. Queremos generar un reporte HTML detallado en este tutorial. Así que, **elimina** la siguiente línea del archivo `pom.xml`:

```xml
  <reports>single-page-html</reports>
  <!-- ELIMINA la línea de arriba. ¡Sí, elimínala! -->
```

Puedes encontrar esto en la sección de configuración del plugin `serenity-maven-plugin`.

## La estructura de directorios del proyecto

Usaremos algunas convenciones simples para organizar nuestros archivos Feature y las clases Java de soporte, basadas en la estructura estándar de proyectos Maven descrita a continuación:

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

Aquí hay algunos puntos a tener en cuenta sobre la estructura de directorios:
1. Como probaremos la [API de Pet Store](https://petstore.swagger.io/) disponible públicamente, no tendremos código en el directorio `src/main`.
2. Reutilizaremos (de la plantilla) los contenidos que ya están en el directorio `src/test/resources/`.
3. Crearemos un nuevo directorio `petstore` bajo el directorio `src/test/java/starter` para almacenar nuestra clase de prueba y sus auxiliares.

## Escribiendo una prueba de API

Comencemos escribiendo nuestra prueba de API. En esta prueba, probaremos la API [`GET /pet/{petId}`](https://petstore.swagger.io/#/pet/getPetById). Esta API retornará una mascota cuando le des su `id` en la URL.

Sin embargo, no podemos llamar a esta API directamente sin ningún `id`. Por lo tanto, nuestra prueba necesita primero crear una mascota y obtener su `id` antes de llamar al endpoint de API `GET /pet/{petId}`.

En otras palabras, podríamos escribir nuestra prueba en el formato `Given-When-Then` (Dado-Cuando-Entonces) de la siguiente manera:

```Gherkin
Given Kitty is available in the pet store
When I ask for a pet using Kitty's ID
Then I get Kitty as result
```

### Estructura básica de la prueba

Ahora creamos una nueva clase de prueba (llamémosla `WhenFetchingAlreadyAvailablePet`), y un caso de prueba vacío (podemos llamarlo `fetchAlreadyAvailablePet`).

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
Hay algunas cosas a tener en cuenta aquí:
- La anotación `@ExtendWith` le dice a JUnit que esta prueba usa Serenity - no olvides esta anotación o tu prueba no será reconocida como una prueba de Serenity
- La anotación `@Test` usa la clase `org.junit.jupiter.api.Test`, de JUnit 5. Ten cuidado de no confundirla con la anotación de JUnit 4 del mismo nombre (`org.junit.Test`), de lo contrario tu prueba no se ejecutará.
- Nota que el nombre de la clase de prueba comienza con `When`. Esta es una de las formas de asegurar que sea reconocida como una prueba a ejecutar en el proceso de compilación de Maven. Consulta la sección `configuration` del `maven-failsafe-plugin` en el archivo `pom.xml` para más detalles.

:::

### Creando Action Classes

Podríamos simplemente comenzar a escribir todo el código de la prueba dentro de nuestro método `fetchAlreadyAvailablePet()`. Eso funcionaría bien. Pero mantener el código de prueba bien organizado y bien estructurado es esencial para mantener bajos los costos de mantenimiento. Y Serenity BDD nos da varias formas de hacer esto.

Una de las formas más simples de hacerlo se llama _Action Classes_. Las Action Classes son clases pequeñas y reutilizables con métodos que encapsulan acciones clave del usuario. Usaremos estas clases para llamar a las APIs HTTP.

Por ejemplo, podríamos dividir nuestra prueba `fetchAlreadyAvailablePet()` en tres pasos:
1. **Preparar (Given):** Preparar el escenario para llamar a la API GET pre-cargando la mascota llamada 'Kitty' usando una llamada HTTP POST documentada [aquí](https://petstore.swagger.io/#/pet/addPet).
2. **Actuar (When):** Llamar a la API bajo prueba usando el ID de 'Kitty'
3. **Verificar (Then):** Comprobar que la API retorna una mascota con nombre 'Kitty'

Creemos una Action Class llamada `PetApiActions` con el siguiente código esqueleto, en el mismo paquete `petstore` donde vive la prueba.

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

**Puntos a tener en cuenta**
1. Como queremos usar el ID generado por la API en nuestro siguiente paso, retornamos el ID como un valor de retorno Long.
2. Extendemos la clase `UIInteractions` que viene con Serenity BDD para ayudarnos a interactuar con APIs.

:::

Comencemos implementando la primera acción: Preparar el escenario pre-creando una mascota con nombre `"Kitty"` llamando a la API POST.

Como necesitamos crear un objeto Java para almacenar la `Pet`, podemos crear una clase `Pet.java` bajo el paquete `starter.petstore` con el siguiente código:

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

Ahora que tenemos una forma de representar una mascota en nuestro código, escribamos nuestra primera acción en la función `givenKittyIsAvailableInPetStore()` de la clase `PetApiActions`.

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

A continuación, escribamos la implementación para la función `whenIAskForAPetWithId`. Esto incluirá simplemente llamar a la API GET que necesita ser probada.

```java
    @When("I ask for a pet using Kitty's ID: {0}")
    public void whenIAskForAPetWithId(Long id) {
        when().get("/" + id);
    }
```

:::caution

**Puntos a tener en cuenta**
1. En la llamada al método `get` anterior, se reutilizan el `baseUri` y `basePath` de la sección `given()`. Por eso no tuviste que repetir esos detalles en este método.
2. Como estamos usando el `id` como parámetro de entrada, usamos `{0}` en la descripción para que pueda aparecer en nuestros reportes.

:::

A continuación, escribamos la implementación para el método `thenISeeKittyAsResult` de la siguiente manera:

```java
    @Then("I get Kitty as result")
    public void thenISeeKittyAsResult() {
        then().body("name", Matchers.equalTo("Kitty"));
    }

```

Juntando todo, el archivo `PetApiActions.java` se ve así:

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

### Completando nuestro caso de prueba

Ahora que nuestra clase Actions está lista, terminemos de escribir nuestro caso de prueba en la clase `WhenFetchingAlreadyAvailablePet`.

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

Intentemos ejecutar la compilación de Maven para ver el resultado. Si la API funciona como se espera, esperamos que la prueba pase y se genere un reporte HTML detallado.

Ejecuta el siguiente comando en una terminal o línea de comandos:

```bash
mvn clean verify
```

Una vez que el comando termine, verás una salida similar a la siguiente:

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

¡Sí, la prueba pasó y la compilación fue exitosa! Hemos logrado probar nuestra API exitosamente 🎉

## Reportes y Documentación Viva

Si observas cuidadosamente, la salida del comando `mvn clean verify` nos informó que se creó un reporte en `target/site/serenity/index.html`

Cuando abres este archivo en un navegador web, ves un hermoso reporte como este:

![Página Principal del Reporte](img/rest-report-home.png)

También puedes encontrar los resultados por prueba detallando los pasos en la pestaña `Stories`, detallando las llamadas a la API REST.

![Reporte](img/rest-report-stories.jpg)

Si quieres ver los detalles exactos usados en las solicitudes HTTP, puedes hacer clic en el enlace marcado en la captura de pantalla anterior. Esto te mostrará los detalles como se muestra a continuación:

![Reporte con solicitudes HTTP](img/rest-report-http-requests.png)

Siéntete libre de navegar los enlaces en este reporte y explorar.

## Conclusión

En este tutorial, creaste tus propios casos de prueba de API y los ejecutaste usando Serenity BDD para generar un hermoso reporte.
