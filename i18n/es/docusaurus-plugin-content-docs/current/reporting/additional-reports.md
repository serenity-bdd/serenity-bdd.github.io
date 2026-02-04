---
id: additional_reports
title: Reportes Adicionales
sidebar_position: 4
---
Además de los reportes HTML estándar, Serenity proporciona reportes adicionales para usos más específicos. Estos incluyen

  * Reportes HTML enviables por email
  * Reporte HTML como aplicación React de una sola página

## Reportes enviables por email de Serenity

Serenity BDD produce reportes ricos que actúan tanto como reportes de pruebas como documentación viva.
Pero a menudo es útil poder enviar un breve resumen de los resultados de las pruebas por email.

Serenity te permite generar un reporte de resumen HTML de una sola página y autocontenido, que contiene
una vista general de los resultados de las pruebas, y un desglose configurable del estado de diferentes áreas de la aplicación. Puedes ver una muestra de tal reporte aquí:

![Un reporte de resumen generado por Serenity](img/test-summary-report.png)


## Configurar Maven

Estos reportes se configuran en el plugin de Maven de Serenity, donde necesitas hacer dos cosas. Primero, necesitas agregar una dependencia para el módulo `serenity-emailer` en la configuración del plugin. Luego, necesitas decirle a Serenity que genere el reporte `email` cuando realice la tarea de agregación.

La configuración completa se ve algo así:

```xml
<plugin>
    <groupId>net.serenity-bdd.maven.plugins</groupId>
    <artifactId>serenity-maven-plugin</artifactId>
    <version>${serenity.version}</version>
    <dependencies>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-single-page-report</artifactId>
            <version>${serenity.version}</version>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-navigator-report</artifactId>
            <version>${serenity.version}</version>
        </dependency>
    </dependencies>
    <configuration>
        <tags>${tags}</tags>
        <reports>single-page-html,navigator</reports>
    </configuration>
    <executions>
        <execution>
            <id>serenity-reports</id>
            <phase>post-integration-test</phase>
            <goals>
                <goal>aggregate</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```
En el fragmento anterior,
1. Las etiquetas `<dependency>` arriba listan las dependencias en diferentes módulos de reporte.
2. La etiqueta `<reports>` en la `<configuration>` especifica la lista de reportes a generar.

Si estás usando Maven, también puedes generar estos reportes directamente usando el goal `reports` y pasando la propiedad del sistema `serenity.reports`:

```bash
mvn serenity:reports -Dserenity.reports=single-page-html
```

## Configurar Gradle

Si estás usando Gradle, puedes usar la tarea `reports` para generar cualquier reporte extendido configurado. Primero que todo, necesitas agregar las dependencias a los reportes extendidos que quieres ejecutar en la sección `buildscript` de tu archivo `build.gradle`, por ejemplo:

```gradle
buildscript {
    repositories {
        mavenLocal()
        jcenter()
    }
    dependencies {
        classpath "net.serenity-bdd:serenity-gradle-plugin:2.1.4"
        classpath "net.serenity-bdd:serenity-single-page-report:2.1.4"
    }
}
```

Luego, necesitas configurar el reporte que quieres generar en tu archivo `build.gradle` usando la sección `serenity`, como se muestra aquí:

```gradle
serenity {
    reports = ["single-page-html"]
}
```

Ahora puedes generar estos reportes invocando la tarea `reports`:

```bash
gradle reports

> Task :reports
Generating Serenity Reports for bdd-bank to directory /Users/john/Projects/SerenityDojo/bdd-bank/target/site/serenity
PROCESSING EXTENDED REPORTS: [email]

BUILD SUCCESSFUL in 2s
1 actionable task: 1 executed
```

## Reportes de Cobertura Funcional

La sección de _Cobertura Funcional_ te permite destacar áreas clave de tu aplicación.
Por defecto, esta sección listará los resultados de pruebas para cada _Feature_. Pero puedes configurar el reporte para agrupar resultados por otras etiquetas también.

Puedes especificar qué categorías deben aparecer en esta página usando la propiedad del sistema `report.tagtypes`. Por ejemplo, si quieres listar capacidades además de features, agregarías la siguiente línea a tu archivo `serenity.properties`:

```
report.tagtypes=capability,feature
```

Ahora tanto las capacidades como los features aparecerían en la sección de Cobertura Funcional del reporte:

![Personalizar las categorías para aparecer en la sección de Cobertura Funcional](img/custom-reports-capabilities-and-features.png)

### Cobertura funcional por etiqueta
También puedes configurar la cobertura funcional para reportar cobertura por etiquetas, en lugar de por jerarquía de requisitos. Supón que estás usando una etiqueta `@department` para definir los stakeholders clave para cada feature. Podrías marcar features para pertenecer a diferentes departamentos usando etiquetas como `@department:Trading`, `department:Sales` o `department:Marketing`.

```gherkin
@department:Trading
Feature: Buying and selling shares

  In order to make my investments grow
  As a trader
  I want to be able to buy and sell shares to make a profit
  ...
```

Podrías decirle a Serenity que produzca cobertura para estas etiquetas incluyendo la siguiente línea en tu archivo `serenity.properties`:

```
report.tagtypes=department
```

Cuando generes el reporte de resumen, los resultados se agregarán por cada valor de etiqueta (Marketing, Sales y Trading), como se muestra aquí:

![La cobertura funcional puede configurarse por etiquetas](img/custom-reports-alternative-functional-coverage.png)

### Enlaces profundos

Puedes incluir un enlace de vuelta a tu reporte de Serenity, y enlaces a los resultados de escenarios individuales,
configurando la propiedad `serenity.report.url`. Puedes hacer esto en el archivo `serenity.properties` (si es fijo),
o pasarlo desde la línea de comandos (si estás apuntando a los reportes para un build específico, por ejemplo):

```
serenity.report.url=http://my.jenkins.server:8080/job/my-project/serenity-reports/
```
