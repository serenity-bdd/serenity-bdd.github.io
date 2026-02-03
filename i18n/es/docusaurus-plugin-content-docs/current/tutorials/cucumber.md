---
id: cucumber-screenplay
sidebar_position: 4
---

# Comenzando con Cucumber usando Serenity BDD y Screenplay

:::tip Guía Completa de Cucumber Disponible
Este tutorial se enfoca en comenzar con Cucumber y Screenplay. Para una cobertura completa de la configuración de Cucumber, integración con JUnit 5, ejecución en paralelo y temas avanzados, consulta la sección [Cucumber con JUnit 5](/docs/cucumber/cucumber-junit5).
:::

## Objetivos

Al final de este tutorial, habrás completado las siguientes actividades:
1. Escribir tu primera **especificación por ejemplo** usando el lenguaje [Gherkin](https://cucumber.io/docs/gherkin/reference/) en un archivo `.feature` para el conocido proyecto [TodoMVC](http://todomvc.com)
2. Hacer la especificación (el archivo `.feature` del Paso 1) ejecutable usando Serenity BDD y Cucumber con el Screenplay Pattern
3. Crear una **documentación viva** que también sirve como reporte de pruebas y reporte de progreso

## Prerrequisitos

Para ejecutar este tutorial, necesitarás tener instalado en tu máquina:
* **Java**: Serenity BDD es una biblioteca de Java, así que necesitarás un JDK reciente instalado. JDK 17 o superior debería funcionar bien.
* **Maven**: Necesitarás Maven 3 o superior instalado en tu computadora. Este actúa como una herramienta de construcción que también descarga las dependencias durante la compilación.
* **Un IDE de Java**: También necesitarás un Entorno de Desarrollo de Java como IntelliJ o Eclipse (y conocimiento práctico de Java).
* **Git**: Usaremos un proyecto inicial de GitHub, y el código de ejemplo para este proyecto también está en GitHub, así que asumiré que tienes un conocimiento básico de Git.

## Creando tu proyecto

La forma más rápida de iniciar un nuevo proyecto de Serenity BDD con [Cucumber](https://cucumber.io/) es clonar el proyecto inicial. Para este tutorial, usaremos la plantilla de proyecto **[Serenity BDD con Cucumber y Screenplay](https://github.com/serenity-bdd/serenity-cucumber-starter)**, que usa Serenity BDD y Cucumber 6.x.

Este proyecto viene con un archivo Feature de ejemplo ya implementado para nuestra referencia. Por ahora, vamos a ignorarlo y comenzar a escribir un nuevo archivo Feature desde cero.

:::info

Solo para asegurarnos de que los archivos de ejemplo de la plantilla inicial no interfieran con nuestra experiencia en este tutorial, **elimina** los siguientes archivos/directorios:

1. Directorio - `src/test/resources/features/search`
2. Directorio - `src/test/java/starter/navigation`
3. Directorio - `src/test/java/starter/search`
4. Archivo - `src/test/java/starter/stepdefinitions/SearchStepDefinitions.java`

:::

## La estructura de directorios del proyecto

Usaremos algunas convenciones simples para organizar nuestros archivos Feature y las clases Java de soporte, basadas en la estructura estándar de proyectos Maven descrita a continuación:

```
src
├───main
│   └───java
│       └───starter
└───test
    ├───java
    │   └───starter
    │       └───helpers
    │       └───stepdefinitions
    └───resources
        └───features
```

Aquí hay algunos puntos a tener en cuenta sobre la estructura de directorios:
1. Como probaremos la aplicación web [TodoMVC](http://todomvc.com) disponible públicamente, no tendremos código en el directorio `src/main`.
2. Usaremos el directorio `src/test/resources/features` para almacenar nuestros archivos `.feature`, que son especificaciones que definen los requisitos.
3. Usaremos el directorio `src/test/java/starter/stepdefinitions` para almacenar el código que implementa los pasos mencionados en nuestros archivos `.feature`. Este código se llama código Glue o Step Definition.
4. Usaremos el directorio `src/test/java/starter/helpers` para almacenar el código de cualquier clase auxiliar que necesiten nuestras Step Definition.

## Escribiendo el primer archivo Feature

Ahora, comencemos escribiendo un archivo Feature para describir cómo agregar un nuevo elemento a la lista de tareas.

Crea un nuevo archivo con el nombre `add_new_todo.feature` en el directorio `src/test/resources/features` con el siguiente contenido:

```gherkin
Feature: Add new item to TODO list

Scenario: Add buying milk to the list
Given Rama is looking at his TODO list
When he adds "Buy some milk" to the list
Then he sees "Buy some milk" as an item in the TODO list
```

## Escribiendo el esqueleto de las Step Definition

Para traducir los pasos en `add_new_todo.feature` en acciones ejecutables, escribimos clases Java llamadas **Step Definition**.

Creemos un nuevo archivo llamado `AddItemStepDefinitions.java` en el directorio `src/test/java/starter/stepdefinitions` con el siguiente contenido esqueleto. Ten en cuenta que esto es solo un esqueleto. Agregaremos el contenido real a esta clase más adelante.

```java
package starter.stepdefinitions;

import io.cucumber.java.PendingException;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import net.serenitybdd.screenplay.Actor;

public class AddItemStepDefinitions {

    @Given("{actor} is looking at his TODO list")
    public void actor_is_looking_at_his_todo_list(Actor actor) {
        // Escribe código aquí que convierta la frase anterior en acciones concretas
        throw new PendingException("Implement me");
    }
    @When("{actor} adds {string} to the list")
    public void he_adds_to_the_list(Actor actor, String itemName) {
        // Escribe código aquí que convierta la frase anterior en acciones concretas
        throw new PendingException("Implement me");
    }
    @Then("{actor} sees {string} as an item in the TODO list")
    public void he_sees_as_an_item_in_the_todo_list(Actor actor, String expectedItemName) {
        // Escribe código aquí que convierta la frase anterior en acciones concretas
        throw new PendingException("Implement me");
    }

}
```

El archivo anterior simplemente lanza excepciones cada vez que Cucumber intenta ejecutar los pasos y los marca como Pendientes.

Intentemos ejecutar la compilación de Maven para ver el resultado en esta etapa. Esperamos que la compilación falle indicando que los escenarios están pendientes de implementación.

Ejecuta el siguiente comando en una terminal o línea de comandos:

```bash
mvn clean verify
```

Una vez que el comando termine, verás una salida similar a la siguiente:

```
[ERROR] Tests run: 1, Failures: 0, Errors: 1, Skipped: 0, Time elapsed: 7.255 s <<< FAILURE! - in starter.CucumberTestSuite
[ERROR] Add new item to TODO list.Add buying milk to the list  Time elapsed: 0.713 s  <<< ERROR!
io.cucumber.java.PendingException: TODO: implement me

[INFO]
[INFO] Results:
[INFO]
[ERROR] Errors:
[ERROR]   TODO: implement me
[INFO]
[ERROR] Tests run: 1, Failures: 0, Errors: 1, Skipped: 0

...
...
...

[INFO] -----------------------------------------
[INFO]  SERENITY TESTS: PENDING
[INFO] -----------------------------------------
[INFO] | Test cases executed    | 1
[INFO] | Tests executed         | 1
[INFO] | Tests passed           | 0
[INFO] | Tests failed           | 0
[INFO] | Tests with errors      | 0
[INFO] | Tests compromised      | 0
[INFO] | Tests aborted          | 0
[INFO] | Tests pending          | 1
[INFO] | Tests ignored/skipped  | 0
[INFO] ------------------------ | --------------
[INFO] | Total Duration         | 365ms
[INFO] | Fastest test took      | 365ms
[INFO] | Slowest test took      | 365ms
[INFO] -----------------------------------------

...
...
...

[INFO]
[INFO] --- maven-failsafe-plugin:3.0.0-M5:verify (default) @ cucumber-starter ---
[INFO] ------------------------------------------------------------------------
[INFO] BUILD FAILURE
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  30.465 s
[INFO] Finished at: 2022-08-12T14:52:57+05:30
[INFO] ------------------------------------------------------------------------

```

La salida anterior es lo que esperábamos. La compilación está fallando con una `PendingException` y las pruebas están marcadas como pendientes.

## Creando Clases Auxiliares para las Step Definition

Hasta ahora, solo tenemos Step Definition ficticias. Implementemos pruebas reales ahora. Para implementar las pruebas reales, creemos algunas clases auxiliares.

#### Page Object

Primero creemos un archivo `TodoListPage.java` en el directorio `src/test/java/starter/helpers` con el siguiente contenido:

```java
package starter.helpers;

import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.screenplay.targets.Target;
import net.serenitybdd.annotations.DefaultUrl;


@DefaultUrl("https://todomvc.com/examples/angularjs/#/")
public class TodoListPage extends PageObject {
    public static Target ITEM_NAME_FIELD = Target.the("item name field").locatedBy(".new-todo");

    public static Target ITEMS_LIST = Target.the(" item list").locatedBy(".todo-list li");
}
```

Esta clase es lo que llamamos un `PageObject`. Contiene toda la información que necesitaremos para usar una página web particular, la aplicación TODO, en este caso.

La anotación `@DefaultUrl` especifica la URL que necesita escribirse en la barra de direcciones del navegador para acceder a esta página.

Hay dos campos estáticos `ITEM_NAME_FIELD` e `ITEMS_LIST` que ayudan a identificar elementos HTML específicos en la página, que usaremos más adelante en nuestros archivos de Step Definition.

#### Auxiliar de Navegación

Creemos un archivo `NavigateTo.java` en el directorio `src/test/java/starter/helpers` con el siguiente contenido:

```java
package starter.helpers;

import net.serenitybdd.screenplay.Performable;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Open;

public class NavigateTo {
     public static Performable theTodoListPage() {
        return Task.where("{0} opens the Todo list page",
                Open.browserOn().the(TodoListPage.class));
    }
}
```

La clase anterior usa el [Screenplay Pattern](/docs/screenplay/screenplay_fundamentals) de Serenity BDD para describir el comportamiento de manera clara. Esta clase nos ayuda a abrir el navegador con la URL correcta.

#### Definición de Acción

A continuación, creemos un archivo `AddAnItem.java` en el directorio `src/test/java/starter/helpers` con el siguiente contenido:

```java
package starter.helpers;

import net.serenitybdd.screenplay.Performable;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Enter;
import org.openqa.selenium.Keys;

public class AddAnItem {

    public static Performable withName(String itemName){
        return Task.where("{0} adds an item with name "+itemName,
                Enter.theValue(itemName)
                        .into(TodoListPage.ITEM_NAME_FIELD)
                        .thenHit(Keys.ENTER)
        );
    }
}
```

El código anterior explica los pasos necesarios para agregar un elemento a la lista, es decir, escribir el nombre del elemento en el cuadro de texto y presionar la tecla ENTER.

## Agregando Detalles a las Step Definition

Ahora que nuestras clases auxiliares están listas, podemos agregar detalles reales a las Step Definition presentes en `AddItemStepDefinitions.java`

Abre el archivo `AddItemStepDefinitions.java` (ya creamos este archivo) y edítalo para que tenga el siguiente contenido:

```java
package starter.stepdefinitions;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.ensure.Ensure;
import starter.helpers.AddAnItem;
import starter.helpers.NavigateTo;
import starter.helpers.TodoListPage;

public class AddItemStepDefinitions {
    @Given("{actor} is looking at his TODO list")
    public void actor_is_looking_at_his_todo_list(Actor actor) {
        actor.wasAbleTo(NavigateTo.theTodoListPage());
    }
    @When("{actor} adds {string} to the list")
    public void he_adds_to_the_list(Actor actor, String itemName) {
       actor.attemptsTo(AddAnItem.withName(itemName));
    }
    @Then("{actor} sees {string} as an item in the TODO list")
    public void he_sees_as_an_item_in_the_todo_list(Actor actor, String expectedItemName) {
        actor.attemptsTo(Ensure.that(TodoListPage.ITEMS_LIST).hasText(expectedItemName));
    }

}
```

Observa cómo el código se lee como inglés hablado. Este es uno de los agradables efectos secundarios de usar el Screenplay Pattern en tus Step Definition de Cucumber.

## Ejecutando la compilación nuevamente

Ahora, ejecutemos la compilación nuevamente emitiendo el siguiente comando desde la terminal o línea de comandos:

```bash
mvn clean verify
```

Ahora, verás la siguiente salida:

```
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 28.42 s - in starter.CucumberTestSuite
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
[INFO] | Total Duration         | 20s 001ms
[INFO] | Fastest test took      | 20s 001ms
[INFO] | Slowest test took      | 20s 001ms
[INFO] -----------------------------------------
[INFO]
[INFO] SERENITY REPORTS
[INFO]   - Full Report: file:///C:/Users/calib/source-codes/temp/serenity-cucumber-starter/target/site/serenity/index.html
[INFO]
[INFO] --- maven-failsafe-plugin:3.0.0-M5:verify (default) @ cucumber-starter ---
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  49.894 s
[INFO] Finished at: 2022-08-12T15:28:52+05:30
[INFO] ------------------------------------------------------------------------

```

¡Sí, las pruebas pasaron y la compilación fue exitosa! Hemos logrado probar nuestra funcionalidad exitosamente 🎉

## Reportes y Documentación Viva

Si observas cuidadosamente, la salida del comando `mvn clean verify` nos informó que se creó un reporte en `target/site/serenity/index.html`

Cuando abres este archivo en un navegador web, ves un hermoso reporte como este:

![Página Principal del Reporte](img/cucumber-test-report-home.png)

También puedes encontrar los resultados por Feature detallando los Scenario en la pestaña `Features`.

![Reporte de Features](img/cucumber-report-features.png)

Siéntete libre de navegar los enlaces en este reporte y explorar.

Esto también se llama **Documentación Viva** del producto porque se genera ejecutando realmente las especificaciones, en lugar de simplemente escribirlo como una wiki o un documento almacenado en la nube. A medida que el producto evoluciona, los escenarios se irán agregando y este reporte es la única fuente de verdad sobre qué funciona y qué está pendiente de implementar en el producto.

En algunos casos, los equipos usan este documento para incorporar nuevos miembros al equipo. Si te sientes aventurero, este documento también puede usarse como guía de usuario.

## Próximos Pasos

En este tutorial, solo tocamos la superficie de usar Serenity BDD con Cucumber. Hay múltiples formas de personalizar el reporte, organizar los archivos Feature, implementar las Step Definition y más. Consulta los enlaces en el manual de usuario para conocer más posibilidades.
