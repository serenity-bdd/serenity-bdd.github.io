---
id: integrating_with_jira
title: Integración con JIRA
sidebar_position: 5
---
# Integración con JIRA

Con Serenity BDD es posible crear una integración estrecha de una y dos vías con JIRA

### Integración de una vía con JIRA

[JIRA](https://www.atlassian.com/software/jira) es un sistema popular de seguimiento de incidencias que también se usa frecuentemente para proyectos Agile y gestión de requisitos. Muchos equipos que usan JIRA almacenan sus requisitos electrónicamente en forma de tarjetas de historias y epics en JIRA

Supongamos que estamos implementando una aplicación de Viajero Frecuente para una aerolínea. La idea es que los viajeros ganarán puntos cuando vuelen con nuestra aerolínea, basándose en la distancia que vuelen. Los viajeros comienzan con un estado "Bronce", y pueden ganar un mejor estado volando más frecuentemente. Los viajeros con un estado de viajero frecuente más alto se benefician de ventajas como acceso a salas VIP, embarque prioritario, y demás. Una de las tarjetas de historia para esta funcionalidad podría verse como la siguiente:

![](img/frequent-flyer-story-card.png)

Esta historia contiene una descripción siguiendo uno de los formatos frecuentemente usados para descripciones de historias de usuario ("como un..quiero..para que"). También contiene un campo personalizado de "Criterios de Aceptación", donde podemos escribir un breve esbozo de la "definición de terminado" para esta historia.

Estas historias pueden agruparse en epics, y colocarse en sprints para la planificación del proyecto, como se ilustra en el tablero JIRA Agile mostrado aquí:

![](img/jira-agile-board.png)

Como se ilustra en la tarjeta de historia, cada una de estas historias tiene un conjunto de criterios de aceptación, que podemos convertir en escenarios más detallados, basados en ejemplos concretos. Luego podemos automatizar estos escenarios usando una herramienta BDD como JBehave.

La historia en la tarjeta de viajero frecuente describe cuántos puntos necesitan ganar los miembros para que se les otorgue cada nivel de estado. Un escenario JBehave para la tarjeta de historia ilustrada anteriormente podría verse así:

```
Frequent Flyer status is calculated based on points

Meta:
@issue #FH-17

Scenario: New members should start out as Bronze members
Given Jill Smith is not a Frequent Flyer member
When she registers on the Frequent Flyer program
Then she should have a status of Bronze

Scenario: Members should get status updates based on status points earned
Given a member has a status of <initialStatus>
And he has <initialStatusPoints> status points
When he earns <extraPoints> extra status points
Then he should have a status of <finalStatus>

Examples:
| initialStatus | initialStatusPoints | extraPoints | finalStatus | notes                    |
| Bronze        | 0                   | 300         | Silver      | 300 points for Silver    |
| Silver        | 0                   | 700         | Gold        | 700 points for Gold      |
| Gold          | 0                   | 1500        | Platinum    | 1500 points for Platinum |
```

Serenity te permite asociar historias JBehave o pruebas JUnit con una tarjeta JIRA usando la meta etiqueta @issue (ilustrada arriba), o la anotación equivalente @Issue en JUnit. En el nivel más básico, esto generará enlaces de vuelta a las tarjetas JIRA correspondientes en tus reportes de pruebas, como se ilustra aquí:

![jira-serenity-report](img/jira-serenity-report.png)

Para que esto funcione, Serenity necesita saber dónde está tu servidor JIRA. La manera más simple de hacer esto es definir las siguientes propiedades en un archivo llamado serenity.properties en el directorio raíz de tu proyecto:

```
jira.url=https://myserver.atlassian.net
jira.project=FH
jira.username=jirauser
jira.password=t0psecret
```

También puedes configurar estas propiedades en tu archivo pom.xml de Maven o pasarlas como propiedades del sistema.

#### Cobertura de Funcionalidades
Pero los resultados de las pruebas solo reportan parte del panorama. Si estás usando JIRA para almacenar tus historias y epics, puedes usarlos para hacer seguimiento del progreso. Pero, ¿cómo sabes qué pruebas de aceptación automatizadas se han implementado para tus historias y epics, y, igualmente importante, cómo sabes cuáles historias o epics no tienen pruebas de aceptación automatizadas? En términos ágiles, una historia no puede declararse "terminada" hasta que las pruebas de aceptación automatizadas pasen. Además, necesitamos estar seguros no solo de que las pruebas existen, sino de que prueban los requisitos correctos, y de que los prueban suficientemente bien.

Llamamos a esta idea de medir el número (y la calidad) de las pruebas de aceptación para cada una de las funcionalidades que queremos construir "cobertura de funcionalidades". Serenity puede proporcionar reportes de cobertura de funcionalidades además de los resultados de pruebas más convencionales. Si estás usando JIRA, necesitarás agregar serenity-jira-requirements-provider a la sección de dependencias de tu archivo pom.xml:
```
<dependencies>
    ...
    <dependency>
        <groupId>net.serenity.plugins.jira</groupId>
        <artifactId>serenity-jira-requirements-provider</artifactId>
        <version>xxx</version>
    </dependency>
</dependencies>
```
El número de versión real podría ser diferente para ti - siempre revisa [Maven Central](http://search.maven.org/#search%7Cga%7C1%7Cthucydides) para saber cuál es la última versión.

También necesitarás agregar esta dependencia a la configuración del plugin de reportes de Serenity:

```
<build>
    ...
    <plugins>
        ...
        <plugin>
            <groupId>net.serenity.maven.plugins</groupId>
            <artifactId>maven-serenity-plugin</artifactId>
            <version>xxx</version>
            <executions>
                <execution>
                    <id>serenity-reports</id>
                    <phase>post-integration-test</phase>
                    <goals>
                        <goal>aggregate</goal>
                    </goals>
                </execution>
            </executions>
            <dependencies>
                <dependency>
                    <groupId>net.serenity.plugins.jira</groupId>
                    <artifactId>serenity-jira-requirements-provider</artifactId>
                    <version>xxx</version>
                </dependency>
            </dependencies>
        </plugin>
    </plugins>
</build>
```

Ahora, cuando ejecutes las pruebas, Serenity consultará JIRA para determinar los epics e historias que has definido y los listará en la página de Requisitos. Esta página te da una vista general de cuántos requisitos (epics e historias) tienen pruebas que pasan (verde), cuántos tienen pruebas que fallan (rojo) o con errores (naranja), y cuántos no tienen pruebas en absoluto (azul):

![serenity-jira-requirements-view](img/serenity-jira-requirements-view.png)

Si haces clic en un epic, puedes ver las historias definidas para el epic, incluyendo un indicador (en la columna "Coverage") de qué tan bien se ha probado cada historia.

![serenity-jira-report-epic-details]( img/serenity-jira-report-epic-details.png "Detalles de Epic en reporte Serenity")

Desde aquí, podrías querer profundizar en los detalles sobre una historia dada, incluyendo qué pruebas de aceptación se han definido para esta historia, y si se ejecutaron exitosamente:

![serenity-jira-story-report](img/serenity-jira-story-report.png)
Tanto JIRA como la integración JIRA-Serenity son bastante flexibles. Vimos anteriormente que habíamos configurado un campo personalizado de "Criterios de Aceptación" en nuestras historias JIRA. Hemos mostrado este campo personalizado en el reporte mostrado arriba incluyéndolo en el archivo serenity.properties, así:

```
jira.custom.field.1=Acceptance Criteria
```

Serenity lee el texto narrativo que aparece en este reporte ("As a frequent flyer...") del campo Descripción de la tarjeta JIRA correspondiente. Podemos sobrescribir este comportamiento y hacer que Serenity lea este valor de un campo personalizado diferente usando la propiedad `jira.custom.narrative.field`. Por ejemplo, algunos equipos usan un campo personalizado llamado "User Story" para almacenar el texto narrativo, en lugar del campo Descripción. Podríamos hacer que Serenity use este campo de la siguiente manera:

```
jira.custom.narrative.field=User Story
```

### Integración de dos vías con JIRA

#### Enlaces desde JIRA a Serenity
La forma más simple de integración de dos vías entre Serenity y JIRA es hacer que Serenity inserte un comentario conteniendo enlaces a los reportes de pruebas de Serenity para cada tarjeta de incidencia relacionada. Para que esto funcione, necesitas decirle a Serenity dónde viven los reportes. Una manera de hacer esto es agregar una propiedad llamada serenity.public.url a tu archivo serenity.properties con la dirección de los reportes de serenity.

```
serenity.public.url=http://buildserver.myorg.com/latest/serenity/report
```

Esto le dirá a Serenity que no solo quieres enlaces desde los reportes de Serenity a JIRA, sino que también quieres incluir enlaces en las tarjetas JIRA de vuelta a los reportes de Serenity correspondientes. Cuando esta propiedad está definida, Serenity agregará un comentario como el siguiente a cualquier incidencia asociada con las pruebas ejecutadas:

![jira-serenity-comment](img/jira-serenity-comment.png)

El `serenity.public.url` típicamente apuntará a un servidor web local donde despliegas tus reportes, o a una ruta dentro de tu servidor CI. Por ejemplo, podrías publicar los reportes de Serenity en Jenkins usando el [Plugin Jenkins HTML Publisher](https://wiki.jenkins-ci.org/display/JENKINS/HTML+Publisher+Plugin), y luego agregar una línea como la siguiente a tu archivo serenity.properties:

```
serenity.public.url=http://jenkins.myorg.com/job/myproject-acceptance-tests/Serenity_Report/
```

Si no quieres que Serenity actualice las incidencias JIRA para una ejecución particular (por ejemplo, cuando ejecutas tus pruebas localmente), también puedes establecer `serenity.skip.jira.updates` a true, por ejemplo:

```
serenity.skip.jira.updates=true
```

Esto simplemente escribirá los números de incidencia relevantes en el log en lugar de intentar conectarse a JIRA.

#### Actualizar estados de incidencias JIRA

También puedes configurar el plugin para actualizar el estado de las incidencias JIRA. Esto está desactivado por defecto: para usar esta opción, necesitas establecer la opción `serenity.jira.workflow.active` a true, por ejemplo:

```
serenity.jira.workflow.active=true
```

La configuración predeterminada funcionará con el flujo de trabajo JIRA predeterminado: las incidencias abiertas o en progreso asociadas con pruebas exitosas serán resueltas, y las incidencias cerradas o resueltas asociadas con pruebas fallidas serán reabiertas. Si estás usando un flujo de trabajo personalizado, o quieres modificar la manera en que funcionan las transiciones, puedes escribir tu propia configuración de flujo de trabajo. La configuración de flujo de trabajo usa un DSL Groovy simple. El siguiente es un ejemplo del archivo de configuración usado para el flujo de trabajo predeterminado:

```
when 'Open', {
    'success' should: 'Resolve Issue'
}

when 'Reopened', {
    'success' should: 'Resolve Issue'
}

when 'Resolved', {
    'failure' should: 'Reopen Issue'
}

when 'In Progress', {
    'success' should: ['Stop Progress','Resolve Issue']
}

when 'Closed', {
    'failure' should: 'Reopen Issue'
}
```

Puedes escribir tu propio archivo de configuración y colocarlo en el classpath de tu proyecto de prueba (por ejemplo, en el directorio de serenity). Luego puedes sobrescribir la configuración predeterminada usando la propiedad `serenity.jira.workflow`, por ejemplo:

```
serenity.jira.workflow=my-workflow.groovy
```

Alternativamente, puedes simplemente crear un archivo llamado jira-workflow.groovy y colocarlo en algún lugar de tu classpath (por ejemplo, en el directorio src/test/resources). Serenity entonces usará este flujo de trabajo. En ambos casos, no necesitas establecer explícitamente la propiedad `serenity.jira.workflow.active`.

#### Gestión de releases

En JIRA, puedes organizar los releases de tu proyecto en versiones, como se ilustra aquí:

![jira-versions](img/jira-versions.png)

Puedes asignar tarjetas a una o más versiones usando el campo `Fix Version/s`:

![jira-fix-versions](img/jira-fix-versions.png)

Por defecto, Serenity leerá los detalles de versión de los Releases en JIRA. Los resultados de pruebas se asociarán con una versión particular usando el campo "Fixed versions". La pestaña *Releases* te da un resumen de las diferentes versiones planificadas, y qué tan bien se han probado hasta ahora:

![releases-tab](img/releases-tab.png)

JIRA usa una estructura de versiones plana - no puedes tener, por ejemplo, releases que están compuestos de varios sprints. Serenity te permite organizar estos en una estructura jerárquica basada en una convención de nombres simple. Por defecto, Serenity usa "release" como el nivel más alto de release, y ya sea "iteration" o "sprint" como el segundo nivel. Por ejemplo, supón que tienes la siguiente lista de versiones en JIRA - Release 1 - Iteration 1.1 - Iteration 1.2 - Release 2 - Release 3

Esto producirá reportes de Release para Release 1, Release 2, y Release 3, con Iteration 1.2 e Iteration 1.2 apareciendo debajo de Release 1. Los reportes contendrán la lista de requisitos y resultados de pruebas asociados con cada release. Puedes profundizar en cualquiera de los releases para ver detalles sobre ese release particular.

![serenity-jira-releases](img/serenity-jira-releases.png)

También puedes personalizar los nombres de los tipos de releases usando la propiedad serenity.release.types, por ejemplo:

```
serenity.release.types=milestone, release, version
```
