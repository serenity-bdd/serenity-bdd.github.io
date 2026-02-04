---
id: playwright_intro
title: Introduccion a Serenity Playwright
sidebar_position: 1
---

# Serenity BDD con Playwright

El modulo `serenity-playwright` proporciona una integracion fluida entre las potentes capacidades de reportes de Serenity BDD y la automatizacion de navegadores moderna de [Playwright](https://playwright.dev/). Esta combinacion te ofrece lo mejor de ambos mundos:

- **Velocidad y confiabilidad de Playwright** - Automatizacion de navegadores moderna con espera automatica
- **Reportes enriquecidos de Serenity** - Documentacion paso a paso con capturas de pantalla
- **Soporte para Page Object** - Arquitectura de pruebas limpia y mantenible
- **Pruebas en multiples navegadores** - Soporte para Chromium, Firefox y WebKit

## Por que Playwright con Serenity?

Playwright es una biblioteca moderna de automatizacion de navegadores desarrollada por Microsoft que ofrece varias ventajas:

- **Espera automatica** - Playwright espera automaticamente a que los elementos sean accionables antes de realizar acciones
- **Multiples contextos de navegador** - Ejecuta pruebas en contextos de navegador aislados para una verdadera paralelizacion
- **Intercepcion de red** - Simula y modifica peticiones de red facilmente
- **Emulacion movil** - Prueba disenos responsivos con emulacion de dispositivos
- **Soporte para web moderna** - Soporte de primera clase para Shadow DOM, iframes y componentes web

Combinado con Serenity BDD, obtienes:

- **Captura automatica de pantallas** - Capturas de pantalla en cada paso completado
- **Reportes HTML enriquecidos** - Reportes interactivos con documentacion paso a paso
- **Documentacion viva** - Pruebas que documentan como funciona tu aplicacion
- **Captura de codigo fuente de pagina** - Snapshots HTML para depurar pruebas fallidas

## Dos enfoques: Page Object o Screenplay

Serenity Playwright soporta dos enfoques arquitectonicos:

### Page Object (Tradicional)

El clasico patron de tres capas familiar para la mayoria de los ingenieros de automatizacion de pruebas:

```
Clase de prueba (escenarios de negocio)
    └── Step Library (metodos @Step para reportes de Serenity)
          └── Page Object (encapsula localizadores e interacciones de pagina)
```

Esta separacion asegura:
- **Pruebas** que se leen como requisitos de negocio sin detalles tecnicos
- **Step Library** que proporciona los reportes enriquecidos de Serenity con anotaciones `@Step`
- **Page Object** que encapsula todas las estrategias de localizacion y logica especifica de pagina

### Screenplay Pattern (Moderno)

El Screenplay Pattern es un enfoque mas moderno, centrado en el Actor:

```
Clase de prueba (escenarios de negocio)
    └── El Actor realiza Task y hace Question
          └── Los Task usan Target para interactuar con la UI
```

Con Screenplay:
- Los **Actor** representan usuarios con Ability (como navegar por la web)
- Los **Task** expresan acciones de alto nivel en lenguaje de negocio
- Las **Question** consultan el estado de la aplicacion
- Los **Target** definen elementos de UI usando selectores de Playwright

Ambos enfoques se integran perfectamente con los reportes de Serenity.

## Ejemplos rapidos

### Enfoque con Page Object

Asi se ve una prueba de Serenity Playwright basada en Page Object:

```java
@ExtendWith(SerenityJUnit5Extension.class)
class SearchTest {

    @Steps
    WikipediaSteps wikipedia;

    private Page page;

    @BeforeEach
    void setup() {
        page = browser.newPage();
        PlaywrightSerenity.registerPage(page);
    }

    @Test
    void shouldSearchForATerm() {
        wikipedia.openWikipedia(page);
        wikipedia.searchFor(page, "Playwright");
        wikipedia.verifyTitleContains(page, "Playwright");
    }
}
```

### Enfoque con Screenplay

Aqui esta la misma prueba usando el Screenplay Pattern:

```java
@ExtendWith(SerenityJUnit5Extension.class)
class SearchTest {

    Actor researcher;

    @BeforeEach
    void setup() {
        researcher = Actor.named("Researcher");
        researcher.can(BrowseTheWebWithPlaywright.usingTheDefaultConfiguration());
    }

    @Test
    void shouldSearchForATerm() {
        researcher.attemptsTo(
            Open.url("https://en.wikipedia.org"),
            SearchFor.term("Playwright"),
            Ensure.that(ThePageTitle.displayed()).contains("Playwright")
        );
    }
}
```

Ambos enfoques se leen como especificaciones - sin selectores CSS ni llamadas a la API de bajo nivel de Playwright, solo lenguaje de negocio claro.

## Comenzando

Listo para empezar? Dirígete a la guia [Primeros pasos](playwright_getting_started) para configurar tu primer proyecto de Serenity Playwright.

Para un ejemplo completo y funcional:
- **Enfoque con Page Object**: Revisa el [Tutorial de TodoMVC](playwright_tutorial_todomvc) que te guia paso a paso en la construccion de un conjunto completo de pruebas
- **Enfoque con Screenplay**: Consulta la guia [Screenplay con Playwright](playwright_screenplay) para el patron centrado en el Actor con ejemplos completos
