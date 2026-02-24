---
id: annotation-requirements
title: Requisitos Baseados em Anotações
sidebar_position: 7
---

# Definindo Requisitos com Anotações

O Serenity BDD organiza os resultados dos testes em uma _hierarquia de requisitos_, que fornece a estrutura para os relatórios de Documentação Viva. Por padrão, essa hierarquia é derivada da estrutura de pacotes (para testes JUnit) ou da estrutura de diretórios (para arquivos de feature do Cucumber).

A partir do Serenity 5.3.0, você pode definir a hierarquia de requisitos diretamente usando **anotações** nas suas classes de teste. Isso fornece uma forma simples, explícita e declarativa de organizar seus testes em uma estrutura significativa, sem precisar depender de convenções de nomenclatura de pacotes.

## A Hierarquia de Requisitos

O Serenity suporta uma hierarquia de requisitos com três níveis:

```
Epic > Feature > Story
```

Cada nível é representado por uma anotação:

| Anotação | Nível | Finalidade |
|---|---|---|
| `@Epic` | Mais alto | Um grande corpo de trabalho, abrangendo múltiplas features |
| `@Feature` | Intermediário | Uma funcionalidade coerente que os usuários valorizam |
| `@Story` | Mais baixo | Uma história de usuário específica ou grupo de cenários dentro de uma feature |

Você pode usar qualquer combinação desses níveis. Não é necessário usar todos os três &mdash; uma estrutura de dois níveis (`@Feature` > `@Story`) ou até mesmo um único nível (`@Feature` sozinha) funciona igualmente bem.

## Uso Básico

### Feature e Story

O padrão mais comum é anotar uma classe de teste com `@Feature` e `@Story`:

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

Isso produz a seguinte hierarquia no relatório de requisitos:

```
Managing Todos (feature)
└── Complete todo items (story)
    ├── Should mark todo as completed
    └── Should toggle all todos to completed
```

### Múltiplas Stories Sob a Mesma Feature

Várias classes de teste podem compartilhar a mesma feature enquanto definem stories diferentes:

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

Isso cria uma única feature no relatório com três stories filhas:

```
Managing Todos (feature)
├── Complete todo items (story)
├── Delete todo items (story)
└── Filter todo items (story)
```

### Múltiplas Features

Classes de teste diferentes podem pertencer a features diferentes:

```java
@Feature("Creating Todos")
@Story("Add todo items")
class WhenAddingTodosTest { /* ... */ }

@Feature("Managing Todos")
@Story("Complete todo items")
class WhenCompletingTodosTest { /* ... */ }
```

Isso produz duas features separadas no relatório:

```
Creating Todos (feature)
└── Add todo items (story)

Managing Todos (feature)
└── Complete todo items (story)
```

## A Hierarquia Completa de Três Níveis

Para projetos maiores, você pode usar `@Epic` para agrupar features relacionadas:

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

Isso produz uma hierarquia de três níveis:

```
E-Commerce Platform (epic)
├── Shopping Cart (feature)
│   ├── Add item to cart (story)
│   └── Remove item from cart (story)
└── Checkout (feature)
    └── Pay with credit card (story)
```

## Usando @DisplayName como Nome da Story

Quando uma classe de teste possui `@Feature` (ou `@Epic`), mas não possui a anotação `@Story`, o Serenity utiliza o valor de `@DisplayName` do JUnit 5 como o nome da story. Isso é conveniente quando você deseja que o nome de exibição no JUnit e o nome da story no Serenity sejam os mesmos:

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

Isso produz a mesma hierarquia que se você tivesse escrito `@Story("Complete todo items")`:

```
Managing Todos (feature)
└── Complete todo items (story)
    └── should mark a todo as completed
```

Quando ambas `@Story` e `@DisplayName` estão presentes, `@Story` tem precedência para a hierarquia de requisitos, e `@DisplayName` é usado apenas para a exibição no runner de testes do JUnit:

```java
@Feature("Managing Todos")
@Story("Complete todo items")
@DisplayName("When completing todos")
class WhenCompletingTodosTest { /* ... */ }
```

Aqui, o nome da story no relatório é "Complete todo items" (de `@Story`), e não "When completing todos" (de `@DisplayName`).

:::tip Quando usar @Story vs @DisplayName

Use `@Story` quando você quiser que o nome na hierarquia de requisitos seja diferente do nome de exibição do JUnit. Por exemplo, você pode querer um nome orientado ao negócio no relatório ("Complete todo items") enquanto usa um nome no estilo BDD no runner de testes ("When completing todos").

Use `@DisplayName` sozinha (sem `@Story`) quando o mesmo nome funcionar para ambos os propósitos.
:::

## Usando @Feature Sem @Story ou @DisplayName

Se uma classe de teste possui apenas `@Feature`, sem `@Story` e sem `@DisplayName`, a classe de teste é colocada diretamente sob a feature. O nome humanizado da classe é usado como nome da story:

```java
@Feature("Managing Todos")
class WhenCompletingTodos {
    // Nome da story no relatório: "When completing todos" (a partir do nome da classe)
}
```

## Hierarquias Parciais

Você não precisa usar todos os três níveis. Qualquer subconjunto funciona:

### Apenas Feature

```java
@Feature("User Authentication")
@Story("Login with valid credentials")
class WhenLoggingInTest { /* ... */ }
```

```
User Authentication (feature)
└── Login with valid credentials (story)
```

### Epic e Feature (Sem Story)

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

### Apenas Epic

```java
@Epic("Security")
@DisplayName("Login with valid credentials")
class WhenLoggingInTest { /* ... */ }
```

```
Security (epic)
└── Login with valid credentials (story)
```

## Herdando Anotações de Superclasses

As anotações são herdadas das classes pai. Isso é útil quando você tem uma classe base comum para um grupo de testes:

```java
@Epic("TodoMVC Application")
@Feature("Managing Todos")
abstract class TodoManagementTest extends SerenityPlaywrightTest {
    // Setup e utilitários comuns
}

@Story("Complete todo items")
class WhenCompletingTodosTest extends TodoManagementTest {
    // Herda @Epic e @Feature da classe pai
}

@Story("Delete todo items")
class WhenDeletingTodosTest extends TodoManagementTest {
    // Herda @Epic e @Feature da classe pai
}
```

A anotação mais específica prevalece. Se uma subclasse redefine uma anotação que já está presente na classe pai, a anotação da subclasse tem precedência:

```java
@Feature("General Feature")
abstract class BaseTest { }

@Feature("Specific Feature")  // Sobrescreve o @Feature da classe pai
@Story("My Story")
class SpecificTest extends BaseTest { }
```

## Anotações vs Requisitos Baseados em Pacotes

Os requisitos baseados em anotações **substituem** a hierarquia padrão baseada em pacotes para a classe de teste anotada. Isso significa que você pode misturar ambas as abordagens no mesmo projeto:

- Classes de teste com anotações `@Feature`, `@Story` ou `@Epic` usam a hierarquia baseada em anotações
- Classes de teste sem essas anotações utilizam a hierarquia baseada em pacotes

:::info

Quando as hierarquias baseadas em anotações e baseadas em pacotes coexistem no mesmo projeto, elas aparecem como ramos separados na árvore de requisitos. Não há mesclagem entre as duas.

:::

## Anotações e Cucumber

Se você usa tanto testes JUnit quanto arquivos de feature do Cucumber no mesmo projeto, cada grupo terá seu próprio lugar na hierarquia de requisitos:

- **Testes JUnit** com anotações `@Feature`/`@Story` criam requisitos baseados nos valores das anotações
- **Features do Cucumber** criam requisitos baseados na estrutura de diretórios e nos nomes dos arquivos de feature

Para evitar confusão, use nomes distintos para features baseadas em anotações e features do Cucumber, ou organize-as em seções separadas da sua hierarquia de requisitos usando `@Epic`.

## Trabalhando com o Screenplay Pattern

As anotações funcionam da mesma forma com testes baseados no Screenplay:

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

## Tags

Além de organizar a hierarquia de requisitos, as anotações `@Epic`, `@Feature` e `@Story` também geram tags nos relatórios do Serenity. Um teste anotado com:

```java
@Epic("E-Commerce Platform")
@Feature("Shopping Cart")
@Story("Add item to cart")
```

terá as seguintes tags no relatório:
- `epic:E-Commerce Platform`
- `feature:Shopping Cart`
- `story:Add item to cart`

Essas tags podem ser usadas para filtrar resultados de testes nos relatórios do Serenity.

## Resumo do Comportamento das Anotações

| Anotações Presentes | Nome da Story no Relatório | Caminho de Requisitos |
|---|---|---|
| `@Feature` + `@Story` | valor de `@Story` | Feature / Story |
| `@Feature` + `@DisplayName` (sem `@Story`) | valor de `@DisplayName` | Feature / DisplayName |
| `@Feature` apenas | Nome humanizado da classe | Feature / nome da classe |
| `@Epic` + `@Feature` + `@Story` | valor de `@Story` | Epic / Feature / Story |
| `@Epic` + `@Feature` + `@DisplayName` | valor de `@DisplayName` | Epic / Feature / DisplayName |
| `@Epic` + `@Story` | valor de `@Story` | Epic / Story |
| `@Epic` + `@DisplayName` | valor de `@DisplayName` | Epic / DisplayName |
| `@Story` apenas | valor de `@Story` | Story |
| Sem anotações + `@DisplayName` | valor de `@DisplayName` | Caminho baseado em pacotes |

## Migração das Anotações Baseadas em Classes

Em versões anteriores do Serenity, a anotação `@Story` exigia uma referência de classe para definir a hierarquia de requisitos:

```java
// Abordagem legada (ainda suportada)
public class MyApp {
    @Feature
    public class ShoppingCart {
        public class AddItem {}
    }
}

@Story(storyClass = MyApp.ShoppingCart.AddItem.class)
class WhenAddingItemsTest { /* ... */ }
```

Essa abordagem exigia a criação de classes marcadoras boilerplate e suportava apenas uma hierarquia de dois níveis (Feature > Story).

As novas anotações baseadas em strings substituem isso por uma abordagem mais simples e flexível:

```java
// Nova abordagem
@Feature("Shopping Cart")
@Story("Add item to cart")
class WhenAddingItemsTest { /* ... */ }
```

A sintaxe legada `@Story(storyClass = ...)` ainda é suportada para compatibilidade retroativa.
