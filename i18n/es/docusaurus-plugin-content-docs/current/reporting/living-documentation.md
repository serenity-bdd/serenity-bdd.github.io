---
id: living_documentation
title: Documentación Viva
sidebar_position: 2
---
## ¿Qué es la Documentación Viva?

Serenity BDD es más que una biblioteca que genera reportes de pruebas. Es decir, aunque puedes usar Serenity BDD para producir excelentes reportes de pruebas sin problema, el verdadero objetivo de Serenity BDD es producir _documentación viva_ para tu producto.

Pero, ¿qué queremos decir con "documentación viva"? La Documentación Viva es un concepto que proviene del mundo del Desarrollo Guiado por Comportamiento (BDD). Está estrechamente relacionada con la idea de Especificaciones Ejecutables. La documentación viva es, como su nombre sugiere, tanto _documentación_ como _viva_.

* Es _documentación_, porque describe cómo funciona una aplicación y qué reglas de negocio aplica, de una manera que los usuarios normales pueden entender. Una documentación viva bien escrita puede ser utilizada por nuevos miembros del equipo para comprender qué hace un producto y cómo funciona. Puede entregarse a un equipo de mantenimiento cuando la aplicación entra en producción, o puede usarse como evidencia para auditores para demostrar que la aplicación respeta las reglas y regulaciones relevantes.
* Es _viva_, porque es generada por la suite de pruebas automatizadas, y por lo tanto, por definición, siempre está actualizada.

En un reporte de Serenity BDD, puedes encontrar la Documentación Viva en la pestaña `Requirements`.

#### Pestaña de Requisitos {#fig-requirements-tab}

![Un reporte de pruebas generado por Serenity](img/requirements-tab.png)

## Documentación Viva y Reportes de Pruebas

La Documentación Viva no debe confundirse con los reportes de pruebas convencionales. Hay varias diferencias importantes, y entender estas diferencias facilita escribir documentación viva de buena calidad.

### Momento

Los reportes de pruebas convencionales se diseñan y generan bastante tarde en el proceso de desarrollo, típicamente una vez que las funcionalidades han sido entregadas y las pruebas automatizadas escritas. Los testers a menudo comenzarán el trabajo preparatorio en los casos de prueba una vez que las especificaciones o historias de usuario estén finalizadas, pero los reportes de pruebas siguen siendo una actividad que ocurre más tarde que temprano en el proceso de desarrollo.

Para un equipo que practica BDD, por otro lado, el trabajo en la Documentación Viva comienza mucho antes. Los equipos que practican BDD trabajarán junto con los product owners para definir los criterios de aceptación de las historias a desarrollar, y estos criterios de aceptación formarán la base para las pruebas de aceptación automatizadas _y_ para la documentación viva que se genera con cada build.

### Autores

Los Reportes de Pruebas son responsabilidad de QA; los testers son usualmente quienes diseñan la estructura del reporte (si se hace algún diseño) y generan los reportes de pruebas.

La Documentación Viva, por otro lado, es escrita colaborativamente por muchos actores diferentes: BAs, desarrolladores, testers y product owners juegan roles clave en el proceso de descubrimiento de requisitos de BDD, y ayudan, juntos, a expresar las necesidades del negocio en una forma que puede ejecutarse como pruebas de aceptación automatizadas.

### Audiencia y Lenguaje

Los testers también son los principales consumidores de los reportes de pruebas. En muchos proyectos, otros miembros del equipo solo verán resúmenes o vistas generales de los reportes de pruebas.

La Documentación Viva es para todo el equipo, incluyendo product owners, stakeholders y usuarios involucrados en el proyecto. Describe lo que la aplicación debería hacer antes de que una funcionalidad sea implementada (en forma de escenarios pendientes), y demuestra (y proporciona evidencia de) que la funcionalidad implementada se comporta como se espera (en forma de escenarios que pasan). Por esta razón, los escenarios de documentación viva necesitan ser escritos en términos de negocio, de una manera que sea fácilmente comprensible por personas que no son testers.

### Propósito y alcance
Producido por testers y para testers, un reporte de pruebas naturalmente tiene un enfoque muy fuerte en testing. El énfasis está principalmente en saber si una prueba pasa o falla, y, a un nivel superior, saber qué proporción de pruebas pasan o fallan.

La Documentación Viva es más como un manual de usuario ilustrado muy detallado. El enfoque está en describir qué hace la aplicación, en términos de negocio.

Por ejemplo, un escenario en un reporte de pruebas podría estar interesado en verificar si todos los países aparecen en una lista desplegable de países en una página de registro de usuario. Un escenario que aparece en un reporte de documentación viva estaría más interesado en describir el proceso de registro de usuario como un todo, y demostrar cómo funciona para diferentes tipos de usuarios, y qué restricciones o limitaciones de negocio aplican a la elección de países.

Estas diferencias pueden resumirse en la siguiente tabla:

**Reportes de Pruebas** | **Documentación Viva**
---|---
Producidos después de que el desarrollo está hecho | Escritos antes de que el desarrollo comience
Escritos por testers | Escritos colaborativamente por todo el equipo
Escritos mayormente para testers | Para todo el equipo y más allá
Reportan pruebas que pasan y fallan | Describen ejemplos trabajados de funcionalidad

### Documentación Viva y otros tipos de pruebas

La Documentación Viva está diseñada para trabajar junto con pruebas unitarias e de integración de nivel inferior para proporcionar un alto grado de confianza en la calidad de la aplicación. La documentación viva generalmente se enfocará en ejemplos clave de caminos positivos y negativos a través de la aplicación, y dejará las pruebas más exhaustivas a las capas de pruebas unitarias.

En entornos altamente regulados, por otro lado, la documentación viva a menudo será más exhaustiva y detallada, ya que puede usarse para auditorías o reportes regulatorios.

En Serenity, la documentación viva puede "estratificarse", de modo que los detalles más importantes se presenten primero, y los escenarios más exhaustivos se presenten más abajo.

En el corazón de este reporte está la pestaña _Requirements_. Veamos qué encontrarás allí.

# La vista de Requisitos

La vista de requisitos de Serenity es una parte central del enfoque de reportes de Serenity, y entender cómo funciona es clave para producir excelente documentación viva. La documentación viva de Serenity va mucho más allá de los reportes de pruebas tradicionales: en equipos BDD maduros que trabajan en grandes organizaciones, los stakeholders regularmente usan la documentación viva producida por Serenity no solo para validar y documentar nuevos releases, sino también para explicar y documentar cómo funciona el sistema.

Veamos las varias partes de este reporte, para entender mejor cómo podrías configurarlas en tus propios proyectos.

## La Jerarquía de Requisitos

En Serenity, los requisitos están organizados en una jerarquía. Puedes ver esta jerarquía en la estructura de árbol en la parte inferior de la pestaña Requirements mostrada en [Un reporte de pruebas generado por Serenity](#fig-requirements-tab).

Hay algunas ideas de cómo puedes organizar esta jerarquía al final de este capítulo. Puedes desglosar tus requisitos por capacidades de alto nivel hasta funcionalidades más granulares, o podría tener más sentido organizar las cosas en términos de alguna funcionalidad de negocio transversal.

En todos los casos, la jerarquía de requisitos se implementa como una estructura de directorios anidados (para Cucumber o JBehave) o como una estructura de paquetes (para JUnit).

La jerarquía de Requisitos puede tener cualquier profundidad, aunque puede ser confuso si diferentes ramas tienen diferentes profundidades. En el nivel inferior están los archivos de feature (para Cucumber), archivos de story (para JBehave) o clases de prueba (para JUnit). Los directorios que contienen estos archivos representan los requisitos de nivel superior.

Puedes tener una idea de la estructura completa de directorios (en el directorio `src/test/features`) para el proyecto mostrado en [Un reporte de pruebas generado por Serenity](#fig-requirements-tab) aquí:

```
├── customer_due_diligence
│   ├── customer_acceptance_policy
│   │   ├── business_activities.feature
│   │   ├── country_risk_ratings.feature
│   │   ├── customer_risk_profiles.feature
│   │   ├── enhanced_due_diligence.feature
│   │   ├── non-face-to-face-customers.feature
│   │   ├── pep.feature
│   │   ├── readme.md
│   │   └── standard_due_diligence.feature
│   ├── customer_identification
│   │   └── readme.md
│   ├── ongoing_monitoring
│   │   └── readme.md
│   └── readme.md
├── readme.md
└── reporting_controls
    ├── eligibility
    │   ├── cftc_eligibility.feature
    │   ├── mifid2_eligibility.feature
    │   └── readme.md
    ├── readme.md
    └── reportability
        ├── readme.md
        └── reportable_state.feature
```

Si expandes los nodos de la vista de árbol de requisitos, obtendrás una estructura similar en la pestaña Requirements (ver [Un árbol de requisitos expandido](#fig-requirements-expanded)).

### Un árbol de requisitos expandido{#fig-requirements-expanded}
![Un árbol de requisitos expandido](img/requirements-expanded.png)

La vista de árbol también te da información adicional útil. El pequeño ícono en el lado derecho de la línea de requisitos te indica el resultado general de cualquier prueba ejecutada (los requisitos sin pruebas implementadas se marcan como pendientes). El árbol también te dice cuántos sub-requisitos hay debajo de cada requisito.

## La descripción del Requisito {#fig-requirements-description}

La descripción del requisito es lo primero que ves en un reporte típico de documentación viva - puedes verla abajo en el cuadro blanco en la parte superior del reporte:

![La Descripción de Requisitos](img/reports-overview-summary.png)

Este texto es un poco como una introducción a un libro o a un capítulo en un libro - debería presentar la aplicación o funcionalidad de alto nivel que se describe en detalle en el resto del reporte.

Puedes agregar este texto introductorio en cualquier nivel de tu jerarquía de requisitos agregando un archivo `readme.md` en el nivel apropiado de tu jerarquía de requisitos. Un conjunto bien documentado de documentación viva tendrá archivos `readme.md` en cada nivel de la jerarquía, para explicar el propósito y contexto de cada área funcional en la aplicación. Puedes ver estos archivos en la estructura de directorios que vimos en la sección anterior.

Markdown (https://daringfireball.net/projects/markdown/) es un formato ligero conveniente que puedes usar para hacer tu documentación viva más legible. El markdown usado en el reporte mostrado arriba se ve así:

```markdown
## Regulatory Reporting Controls

This project illustrates Serenity's living documentation capabilities, through a set of requirements for an imaginary investment bank.
 * The _Customer Due Diligence_ requirements, which are partially implemented (a mixture of pending and passing requirements), and
 * The _Reporting controls_, which contain a variety of failing acceptance tests.
```

Para cualquier `readme.md` en un directorio de requisitos anidado (así que cualquier archivo `readme.md` que no sea el de nivel superior), la primera línea debe contener el nombre del requisito. Un ejemplo para la capacidad _Customer Due Diligence_ se muestra a continuación:

```markdown
## Customer Due Diligence

Banks are required to "have in place adequate policies, practices and procedures that promote high ethical and professional standards and prevent the bank from being used, intentionally or unintentionally, by criminal elements".

Certain key elements should be included by banks in the design of KYC programmes. Such essential elements should start from the banks' risk management and control procedures and should include

1) customer acceptance policy,
2) customer identification, and
3) on-going monitoring of high risk accounts
```

### Agregar imágenes a la descripción del requisito

También puedes incluir imágenes en los archivos `readme.md`. Por defecto, Serenity copiará cualquier archivo en el directorio `src/test/resources/assets` al directorio `target/site/serenity/assets` cuando genere los reportes.

Puedes colocar cualquier imagen que quieras incluir en tu documentación viva aquí, y luego referirte a ellas usando la sintaxis de imagen de Markdown, así:

```markdown
![Customer Due Diligence](assets/customer-due-diligence.png)
```

Esta imagen aparecería entonces en tus reportes, como se ilustra aquí:

![Una vista general de aplicación renderizada incluyendo una imagen](img/requirements-overview-image.png)

Si necesitas sobrescribir la ubicación del directorio `assets`, puedes hacerlo usando la propiedad `report.assets.directory`, como se muestra aquí:

```
report.assets.directory=src/test/resources/my-special-resources
```

Ten en cuenta que el directorio de destino en el directorio `target/site/serenity` siempre se llamará `assets`.

## La pestaña de Resultados de Pruebas

La pestaña _Test Results_ (mostrada abajo) te indica sobre las pruebas de aceptación que fueron ejecutadas para este conjunto de requisitos. Tanto las pruebas automatizadas como las manuales aparecen en el gráfico de dona de resumen y en la tabla (los resultados manuales son del mismo color que los resultados automatizados equivalentes, pero en un tono más claro).

![Los resultados de pruebas para un requisito dado](img/requirements-results.png)

También puedes encontrar la lista completa de resultados de pruebas automatizadas y manuales en la parte inferior de la pantalla.

## Cobertura Funcional

La sección de Cobertura Funcional muestra los resultados de pruebas desglosados por área funcional.

![Cobertura Funcional](img/requirements-functional-coverage-stats.png)

Por ejemplo, en la ilustración mostrada arriba, el requisito de alto nivel _Customer Due Diligence_ tiene tres requisitos hijos:

  * Customer Acceptance Policies
  * Customer Identification, y
  * Ongoing Monitoring

La vista de cobertura funcional muestra el desglose de resultados de pruebas para cada uno de estos requisitos hijos. Esta es una manera útil de obtener una idea de la estabilidad o preparación para release de diferentes partes de una aplicación.

### Resultados de Pruebas

En la parte inferior de la pestaña `Test Results`, encontrarás los resultados de pruebas reales - la lista de todas las pruebas, automatizadas y manuales, que fueron ejecutadas para este requisito.

![Los resultados de pruebas para un requisito dado](img/requirements-test-results.png)

## Vistas Generales de Feature

Los Feature son una parte importante del modelo de documentación viva de Serenity. Los Feature corresponden al contenido de un archivo feature en Cucumber, un archivo story en JBehave, o un caso de prueba en JUnit. Un Feature representa una pieza coherente de funcionalidad que los clientes valoran; como regla general, un Feature es algo que podríamos desplegar por sí mismo y los usuarios aún lo encontrarían útil.

Un Feature contiene un conjunto de criterios de aceptación, escenarios automatizados que demuestran y verifican cómo funciona el Feature. Pero a menudo los criterios de aceptación no son suficientes por sí mismos para explicar completamente lo que hace un Feature. Necesitamos información adicional, que proporcionamos en la parte superior del archivo feature o story. Por ejemplo, en el siguiente archivo feature, damos algo de contexto de negocio adicional sobre el Feature _Business Activities_ antes de entrar en los escenarios individuales:

```gherkin
Feature: Business Activities

  Some business activities are considered more risk-prone than others,
  and certain customers and entities may pose specific risks.

  Scenario Outline: The business activity risk factor for an industry

  The industry risk factor is a value from 0 to 10.

    When a customer works in <Business Category>
    Then their base business activity risk factor should be <Risk Factor>

    Examples:
      | Business Category        | Risk Factor |
      | Casino                   | 10          |
      | Precious Metals Exchange | 9           |
      | Currency Exchange        | 9           |
      | Jewellery Store          | 8           |
      | Convenience Store        | 7           |
      | Real Estate Broker       | 6           |
      | Software Development     | 3           |

  Scenario Outline: The business activity risk factor for an established business
      Established businessess have been in activity for 2 years or more

        When a customer with a business risk factor of <Risk Factor>, such as for a <Business Category> business
        And the business been operation for more than two years
        Then their business activity risk rating should be <Risk Rating>

        Examples:
          | Risk Factor | Business Category    | Risk Rating |
          | 7 or above  | Casino               | High        |
          | 5 to 7      | Jewellery Store      | Medium      |
          | Under 5     | Software Development | Low         |
    ...
```

La página de requisitos para este Feature se muestra en [La página de requisitos para un Feature](#fig-requirements-feature-overview).

Aquí vemos el texto introductorio de la parte superior del archivo feature,
la lista de escenarios (o criterios de aceptación) definidos para este Feature,
y una descripción detallada de cada escenario.
Los íconos indican si un escenario pasó o falló, y si haces clic en la barra de título de uno de los escenarios, irás a la página de resultados de pruebas para ese escenario.

#### La página de requisitos para un Feature {#fig-requirements-feature-overview}
![La página de requisitos para un Feature](img/requirements-feature-overview.png)


### Documentación de Feature Mejorada

Cuando usas Serenity con Cucumber, puedes convertir esta vista general de Feature en un documento vivo rico que mezcla reglas de negocio con ejemplos y escenarios extraídos de las pruebas de aceptación. Esto te permite diseñar una vista general de requisitos que los product owners y stakeholders pueden revisar rápida y fácilmente, mientras aún mantienen los detalles a mano si quieren saber más.

:::caution

La documentación de Feature mejorada actualmente solo está soportada para Cucumber.

:::

Por ejemplo, podríamos mejorar la vista general del Feature _Business Activities_ incrustando las tablas (pero no los textos "Given..When..Then" que esencialmente actúan como fixtures de prueba en este caso). Para hacer esto, usamos la etiqueta `{Examples}` junto con el nombre del Scenario Outline que queremos usar:

```gherkin
Feature: Business Activities

  Some business activities are considered more risk-prone than others,
  and certain customers and entities may pose specific risks.
  The business activity risk factor for an industry is determined by the potential risk they present to the bank. For example:

  {Examples} The business activity risk factor for an industry
```

Cuando se genera el reporte, Serenity incluirá la tabla de ejemplos del Scenario Outline _The business activity risk factor for an industry_ en la descripción del Feature (ver [Vista General de Feature con Tablas de Ejemplos](#fig-requirements-embedded-table)).

#### Vista General de Feature con Tablas de Ejemplos {#fig-requirements-embedded-table}
![Las tablas de ejemplos de los escenarios pueden incluirse en la vista general del Feature](img/requirements-embedded-table.png)

Si las pruebas para esta tabla han sido ejecutadas, el resultado para cada fila se indicará en la tabla.

La forma predeterminada (usando la etiqueta `{Examples}`) tomará _solo_ la tabla de ejemplos del Scenario Outline; si quieres que el título también se muestre, puedes usar la etiqueta `{Examples!WithTitle}` en su lugar.

Los escenarios generalmente son demasiado granulares para el resumen del Feature, y es mejor dejarlos para la sección detallada más abajo en la página. Sin embargo, a veces tiene sentido incluir uno o dos escenarios en el resumen. Puedes hacer esto usando la etiqueta `{Scenario}`. Esto funciona tanto para escenarios como para Scenario Outline.

## Agregar evidencia adicional

A veces los resultados de las pruebas automatizadas no son suficientes por sí solos para satisfacer a los stakeholders o auditores. Necesitamos poder agregar alguna prueba extra de que nuestra aplicación funciona como se describe.

En Serenity, puedes agregar evidencia en forma de un String o el contenido de un archivo. Por ejemplo, podrías registrar los resultados de una consulta SQL para demostrar que una base de datos contiene los resultados esperados, o registrar la versión completa de un reporte XML generado cuando solo haces aserciones en unos pocos campos clave.

Puedes hacer esto usando el método `Serenity.recordReportData()`:

```java
    sqlQueryResult = ...
    Serenity.recordReportData().withTitle("Database evidence").andContents(sqlQueryResult);
```

Este método te permite registrar datos desde un String o desde un archivo. Para obtener datos de un archivo, usa el método `fromFile()`:

```java
    Path report = ...
    Serenity.recordReportData().withTitle("Generated Report").fromFile(report);
```

En ambos casos, estos datos se registran con la prueba y aparecen en los resultados de la prueba:

![Agregar evidencia a un resultado de prueba](img/requirements-adding-evidence.png)


## Estructuras Comunes de Requisitos
La organización exacta varía de proyecto a proyecto, pero algunas estructuras comunes incluyen:

* Capacidades > Features
* Capacidades > Features > Historias
* Objetivos > Capacidades > Features
* Epics > Historias
* Temas > Epics > Historias

Una jerarquía de requisitos de dos niveles funciona bien para la mayoría de los proyectos. Un proyecto pequeño (por ejemplo, un micro-servicio) podría necesitar solo una lista corta de features. Solo proyectos muy grandes o complejos típicamente necesitarían tres o más niveles.

### Objetivos, Capacidades y Features

El objetivo de cualquier proyecto de software es ayudar a nuestros stakeholders a alcanzar sus _objetivos_ proporcionándoles _capacidades_. En BDD, una _Capacidad_ es algo que permite a los usuarios hacer algo que no podían hacer antes, o hacer algo que podían hacer antes, pero hacerlo más eficientemente. Una capacidad es agnóstica a la tecnología: no se compromete con una solución o implementación particular. Un ejemplo de una capacidad podría ser la habilidad de pagar en línea con una tarjeta de crédito.

Un _Feature_ es una solución concreta o implementación que entrega una capacidad. Algunos posibles features que entregan la capacidad que mencionamos antes podrían ser pagar vía PayPal, vía Stripe o pagar integrándose con una plataforma de banca comercial.

### Temas y Epics

En Scrum, un _Epic_ es simplemente una historia de usuario grande, una que no puede entregarse en un sprint. Un _Tema_ es solo otra manera de agrupar Historias de Usuario relacionadas, aunque muchos equipos usan Temas como grupos de epics relacionados. (Otra manera de implementar la idea original de temas en Serenity BDD es usar etiquetas).

### Historias de Usuario
Las Historias de Usuario se usan comúnmente en Agile como una manera de organizar el trabajo, pero no siempre son muy útiles cuando se trata de Documentación Viva. Esto es porque reflejan cómo una funcionalidad fue dividida cuando se construyó. Pero una vez que una funcionalidad es entregada, a nadie le importa cómo fue dividida durante la fase de desarrollo - todo lo que importa es lo que fue entregado. Es por eso que Cucumber prefiere agrupar escenarios en Feature Files (que describen un feature). Por esta razón, las Historias de Usuario generalmente se consideran no una gran manera de estructurar documentación viva. (Ten en cuenta que JBehave todavía usa la convención más antigua de "Story Files", que estaban destinados a contener los criterios de aceptación de una historia dada).

## Configurar tu estructura de requisitos en Serenity BDD

Puedes configurar la manera en que Serenity nombra los diferentes niveles en tu propia estructura de requisitos usando la propiedad `serenity.requirements.types`. Por ejemplo, si quieres describir tus requisitos en términos de temas, epics e historias, agregarías lo siguiente a tu archivo de configuración de Serenity:

```
serenity.requirements.types=theme,epic,story
```

Si no configuras este parámetro, Serenity decidirá una jerarquía predeterminada sensata. Esta jerarquía depende de si estás usando JUnit, Cucumber o JBehave, y de la profundidad de tu jerarquía de requisitos:


**Framework de Pruebas** | **Jerarquía Predeterminada**
--- | ---
 JUnit             | capability > feature > story
 Cucumber          | theme > capability > feature
 JBehave           | capability > feature > story


:::info

La configuración de requisitos aplica a los niveles de contenedor, no a los archivos feature o story en sí mismos. Si estás usando Cucumber, los archivos feature **siempre** serán representados como features. Si estás usando JBehave, los archivos story **siempre** serán representados como stories.

:::

### Jerarquías de Requisitos para Pruebas JUnit

Muchos equipos escriben pruebas de aceptación automatizadas con Serenity BDD usando JUnit. El Screenplay Pattern en particular hace fácil escribir pruebas altamente mantenibles usando un DSL legible para el negocio que produce excelente documentación viva.

Las pruebas de aceptación JUnit deben organizarse en una estructura de paquetes que refleje tu jerarquía de requisitos. Ten en cuenta que esto significa que pueden no reflejar la estructura de paquetes en tu aplicación, como se hace usualmente para pruebas unitarias y de integración.

Una jerarquía simple de dos niveles se ilustra aquí:
```
com
└── acme
    └── myapps
        └── specs
            ├── multiple_todo_lists
            ├── sharing_lists
            └── simple_todo_lists
                ├── AddingNewItems.java
                ├── DeletingItems.java
                ├── FilteringItemsByStatus.java
                └── MarkingItemsAsComplete.java
```

Necesitas decirle a Serenity dónde encontrar la jerarquía de requisitos en tu estructura de paquetes, usando la propiedad `serenity.test.root`. Para el ejemplo mostrado arriba, el paquete raíz es `com.acme.myapp.specs`:

```
serenity.test.root=com.acme.myapp.specs
```

En este caso, la documentación viva de Serenity tratará los casos de prueba JUnit ("Adding New Items", "Deleting Items", etc.) como Historias, y los paquetes directamente debajo del paquete `com.acme.myapp.specs` ("Multiple Todo Lists", "Sharing Lists", etc.) como Features.

### Jerarquías de Requisitos para Cucumber

Cuando usas Cucumber, Serenity espera que tus archivos feature estén almacenados en el directorio `src/test/resources/features`. Tu jerarquía de requisitos va directamente debajo de este directorio:

```
src
└── test
    └── resources
        └── features
            ├── multiple_todo_lists
            ├── sharing_lists
            └── simple_todo_lists
                ├── adding_new_items.feature
                ├── deleting_items.feature
                ├── filtering_items_by_status.feature
                └── marking_items_as_complete.feature
```

Cuando Cucumber se usa con la configuración predeterminada, los archivos feature siempre representan Features, y los directorios que contienen los features representan Capacidades. Un Feature típicamente es más grande que una historia de usuario, y puede contener los criterios de aceptación (escenarios) de varias historias de usuario.

### Jerarquías de Requisitos para JBehave

Cuando usas JBehave, Serenity espera que tus archivos Story estén almacenados en el directorio `src/test/resources/stories`. Tu jerarquía de requisitos va directamente debajo de este directorio:

```
src
└── test
    └── resources
        └── stories
            ├── multiple_todo_lists
            ├── sharing_lists
            └── simple_todo_lists
                ├── adding_new_items.story
                ├── deleting_items.feature
                ├── filtering_items_by_status.story
                └── marking_items_as_complete.story
```

Por defecto, los archivos Story representan historias, y los directorios sobre ellos se renderizan como Features.
