---
id: annotation-requirements
title: Requisitos Basados en Anotaciones
sidebar_position: 7
---

# Definiendo Requisitos con Anotaciones

Serenity BDD organiza los resultados de las pruebas en una _jerarquía de requisitos_, que proporciona la estructura para los reportes de Documentación Viva. Por defecto, esta jerarquía se deriva de la estructura de paquetes (para pruebas JUnit) o de la estructura de directorios (para archivos de feature de Cucumber).

A partir de Serenity 5.3.0, puedes definir la jerarquía de requisitos directamente usando **anotaciones** en tus clases de prueba. Esto proporciona una forma simple, explícita y declarativa de organizar tus pruebas en una estructura significativa, sin tener que depender de convenciones de nombres de paquetes.

## La Jerarquía de Requisitos

Serenity soporta una jerarquía de requisitos de tres niveles:

```
Epic > Feature > Story
```

Cada nivel está representado por una anotación:

| Anotación | Nivel | Propósito |
|---|---|---|
| `@Epic` | Más alto | Un gran cuerpo de trabajo, que abarca múltiples features |
| `@Feature` | Intermedio | Una pieza coherente de funcionalidad que los usuarios valoran |
| `@Story` | Más bajo | Una historia de usuario específica o grupo de escenarios dentro de un feature |

Puedes usar cualquier combinación de estos niveles. No es necesario usar los tres &mdash; una estructura de dos niveles (`@Feature` > `@Story`) o incluso un solo nivel (`@Feature` solo) funciona igual de bien.

## Uso Básico

### Feature y Story

El patrón más común es anotar una clase de prueba con `@Feature` y `@Story`:

```java
import net.serenitybdd.annotations.Feature;
import net.serenitybdd.annotations.Story;

@Feature("Managing Todos")
@Story("Complete todo items")
class WhenCompletingTodosTest extends SerenityPlaywrightTest {

    @Test
    void shouldMarkTodoAsCompleted() {
        // ...
    }

    @Test
    void shouldToggleAllTodosToCompleted() {
        // ...
    }
}
```

Esto produce la siguiente jerarquía en el reporte de requisitos:

```
Managing Todos (feature)
└── Complete todo items (story)
    ├── Should mark todo as completed
    └── Should toggle all todos to completed
```

### Múltiples Stories Bajo el Mismo Feature

Varias clases de prueba pueden compartir el mismo feature mientras definen diferentes stories:

```java
@Feature("Managing Todos")
@Story("Complete todo items")
class WhenCompletingTodosTest { /* ... */ }

@Feature("Managing Todos")
@Story("Delete todo items")
class WhenDeletingTodosTest { /* ... */ }

@Feature("Managing Todos")
@Story("Filter todo items")
class WhenFilteringTodosTest { /* ... */ }
```

Esto crea un solo feature en el reporte con tres stories hijas:

```
Managing Todos (feature)
├── Complete todo items (story)
├── Delete todo items (story)
└── Filter todo items (story)
```

### Múltiples Features

Diferentes clases de prueba pueden pertenecer a diferentes features:

```java
@Feature("Creating Todos")
@Story("Add todo items")
class WhenAddingTodosTest { /* ... */ }

@Feature("Managing Todos")
@Story("Complete todo items")
class WhenCompletingTodosTest { /* ... */ }
```

Esto produce dos features separados en el reporte:

```
Creating Todos (feature)
└── Add todo items (story)

Managing Todos (feature)
└── Complete todo items (story)
```

## La Jerarquía Completa de Tres Niveles

Para proyectos más grandes, puedes usar `@Epic` para agrupar features relacionados:

```java
import net.serenitybdd.annotations.Epic;
import net.serenitybdd.annotations.Feature;
import net.serenitybdd.annotations.Story;

@Epic("E-Commerce Platform")
@Feature("Shopping Cart")
@Story("Add item to cart")
class WhenAddingItemsToCartTest { /* ... */ }

@Epic("E-Commerce Platform")
@Feature("Shopping Cart")
@Story("Remove item from cart")
class WhenRemovingItemsFromCartTest { /* ... */ }

@Epic("E-Commerce Platform")
@Feature("Checkout")
@Story("Pay with credit card")
class WhenPayingWithCreditCardTest { /* ... */ }
```

Esto produce una jerarquía de tres niveles:

```
E-Commerce Platform (epic)
├── Shopping Cart (feature)
│   ├── Add item to cart (story)
│   └── Remove item from cart (story)
└── Checkout (feature)
    └── Pay with credit card (story)
```

## Usando @DisplayName como Nombre del Story

Cuando una clase de prueba tiene `@Feature` (o `@Epic`) pero no tiene la anotación `@Story`, Serenity usa el valor de `@DisplayName` de JUnit 5 como nombre del story. Esto es conveniente cuando quieres que el nombre de visualización en JUnit y el nombre del story en Serenity sean el mismo:

```java
@Feature("Managing Todos")
@DisplayName("Complete todo items")
class WhenCompletingTodosTest {

    @Test
    @DisplayName("should mark a todo as completed")
    void shouldMarkTodoAsCompleted() {
        // ...
    }
}
```

Esto produce la misma jerarquía que si hubieras escrito `@Story("Complete todo items")`:

```
Managing Todos (feature)
└── Complete todo items (story)
    └── should mark a todo as completed
```

Cuando tanto `@Story` como `@DisplayName` están presentes, `@Story` tiene prioridad para la jerarquía de requisitos, y `@DisplayName` se usa solo para la visualización en el ejecutor de pruebas de JUnit:

```java
@Feature("Managing Todos")
@Story("Complete todo items")
@DisplayName("When completing todos")
class WhenCompletingTodosTest { /* ... */ }
```

Aquí, el nombre del story en el reporte es "Complete todo items" (de `@Story`), no "When completing todos" (de `@DisplayName`).

:::tip Cuándo usar @Story vs @DisplayName

Usa `@Story` cuando quieras que el nombre en la jerarquía de requisitos sea diferente del nombre de visualización de JUnit. Por ejemplo, podrías querer un nombre orientado al negocio en el reporte ("Complete todo items") mientras usas un nombre estilo BDD en el ejecutor de pruebas ("When completing todos").

Usa `@DisplayName` solo (sin `@Story`) cuando el mismo nombre funcione para ambos propósitos.
:::

## Usando @Feature Sin @Story ni @DisplayName

Si una clase de prueba solo tiene `@Feature` sin `@Story` ni `@DisplayName`, la clase de prueba se coloca directamente bajo el feature. El nombre humanizado de la clase se usa como nombre del story:

```java
@Feature("Managing Todos")
class WhenCompletingTodos {
    // Nombre del story en el reporte: "When completing todos" (del nombre de la clase)
}
```

## Jerarquías Parciales

No necesitas usar los tres niveles. Cualquier subconjunto funciona:

### Solo Feature

```java
@Feature("User Authentication")
@Story("Login with valid credentials")
class WhenLoggingInTest { /* ... */ }
```

```
User Authentication (feature)
└── Login with valid credentials (story)
```

### Epic y Feature (Sin Story)

```java
@Epic("Security")
@Feature("User Authentication")
@DisplayName("Login with valid credentials")
class WhenLoggingInTest { /* ... */ }
```

```
Security (epic)
└── User Authentication (feature)
    └── Login with valid credentials (story)
```

### Solo Epic

```java
@Epic("Security")
@DisplayName("Login with valid credentials")
class WhenLoggingInTest { /* ... */ }
```

```
Security (epic)
└── Login with valid credentials (story)
```

## Heredando Anotaciones de Superclases

Las anotaciones se heredan de las clases padre. Esto es útil cuando tienes una clase base común para un grupo de pruebas:

```java
@Epic("TodoMVC Application")
@Feature("Managing Todos")
abstract class TodoManagementTest extends SerenityPlaywrightTest {
    // Configuración y utilidades comunes
}

@Story("Complete todo items")
class WhenCompletingTodosTest extends TodoManagementTest {
    // Hereda @Epic y @Feature del padre
}

@Story("Delete todo items")
class WhenDeletingTodosTest extends TodoManagementTest {
    // Hereda @Epic y @Feature del padre
}
```

La anotación más específica prevalece. Si una subclase redefine una anotación que ya está presente en el padre, la anotación de la subclase tiene prioridad:

```java
@Feature("General Feature")
abstract class BaseTest { }

@Feature("Specific Feature")  // Sobrescribe el @Feature del padre
@Story("My Story")
class SpecificTest extends BaseTest { }
```

## Anotaciones vs Requisitos Basados en Paquetes

Los requisitos basados en anotaciones **sobrescriben** la jerarquía basada en paquetes por defecto para la clase de prueba anotada. Esto significa que puedes mezclar ambos enfoques en el mismo proyecto:

- Las clases de prueba con anotaciones `@Feature`, `@Story` o `@Epic` usan la jerarquía basada en anotaciones
- Las clases de prueba sin estas anotaciones recurren a la jerarquía basada en paquetes

:::info

Cuando las jerarquías basadas en anotaciones y basadas en paquetes coexisten en el mismo proyecto, aparecen como ramas separadas en el árbol de requisitos. No hay fusión entre ambas.

:::

## Anotaciones y Cucumber

Si usas tanto pruebas JUnit como archivos de feature de Cucumber en el mismo proyecto, cada grupo tendrá su propio lugar en la jerarquía de requisitos:

- Las **pruebas JUnit** con anotaciones `@Feature`/`@Story` crean requisitos basados en los valores de las anotaciones
- Los **features de Cucumber** crean requisitos basados en la estructura de directorios y los nombres de los archivos de feature

Para evitar confusión, usa nombres distintos para los features basados en anotaciones y los features de Cucumber, u organízalos en secciones separadas de tu jerarquía de requisitos usando `@Epic`.

## Trabajando con el Screenplay Pattern

Las anotaciones funcionan de la misma manera con pruebas basadas en Screenplay:

```java
import net.serenitybdd.annotations.Feature;
import net.serenitybdd.annotations.Story;
import net.serenitybdd.screenplay.ensure.Ensure;

@Feature("Managing Todos")
@Story("Filter todo items")
@DisplayName("When filtering todos (Screenplay)")
class WhenFilteringTodosScreenplayTest extends ScreenplayPlaywrightTest {

    @Test
    @DisplayName("should filter to show only active todos")
    void shouldFilterToShowOnlyActiveTodos() {
        toby.attemptsTo(
            FilterTodos.toShowActive(),
            Ensure.that(TheCurrentFilter.selected()).isEqualTo("Active"),
            Ensure.that(TheVisibleTodos.displayed())
                .containsExactly("Buy milk", "Do laundry")
        );
    }
}
```

## Etiquetas

Además de organizar la jerarquía de requisitos, las anotaciones `@Epic`, `@Feature` y `@Story` también generan etiquetas en los reportes de Serenity. Una prueba anotada con:

```java
@Epic("E-Commerce Platform")
@Feature("Shopping Cart")
@Story("Add item to cart")
```

tendrá las siguientes etiquetas en el reporte:
- `epic:E-Commerce Platform`
- `feature:Shopping Cart`
- `story:Add item to cart`

Estas etiquetas pueden usarse para filtrar resultados de pruebas en los reportes de Serenity.

## Resumen del Comportamiento de las Anotaciones

| Anotaciones Presentes | Nombre del Story en el Reporte | Ruta de Requisitos |
|---|---|---|
| `@Feature` + `@Story` | Valor de `@Story` | Feature / Story |
| `@Feature` + `@DisplayName` (sin `@Story`) | Valor de `@DisplayName` | Feature / DisplayName |
| Solo `@Feature` | Nombre humanizado de la clase | Feature / nombre de clase |
| `@Epic` + `@Feature` + `@Story` | Valor de `@Story` | Epic / Feature / Story |
| `@Epic` + `@Feature` + `@DisplayName` | Valor de `@DisplayName` | Epic / Feature / DisplayName |
| `@Epic` + `@Story` | Valor de `@Story` | Epic / Story |
| `@Epic` + `@DisplayName` | Valor de `@DisplayName` | Epic / DisplayName |
| Solo `@Story` | Valor de `@Story` | Story |
| Sin anotaciones + `@DisplayName` | Valor de `@DisplayName` | Ruta basada en paquetes |

## Migración desde Anotaciones Basadas en Clases

En versiones anteriores de Serenity, la anotación `@Story` requería una referencia a una clase para definir la jerarquía de requisitos:

```java
// Enfoque legacy (aún soportado)
public class MyApp {
    @Feature
    public class ShoppingCart {
        public class AddItem {}
    }
}

@Story(storyClass = MyApp.ShoppingCart.AddItem.class)
class WhenAddingItemsTest { /* ... */ }
```

Este enfoque requería crear clases marcadoras repetitivas y solo soportaba una jerarquía de dos niveles (Feature > Story).

Las nuevas anotaciones basadas en cadenas de texto reemplazan esto con un enfoque más simple y flexible:

```java
// Nuevo enfoque
@Feature("Shopping Cart")
@Story("Add item to cart")
class WhenAddingItemsTest { /* ... */ }
```

La sintaxis legacy `@Story(storyClass = ...)` aún es soportada por compatibilidad con versiones anteriores.
