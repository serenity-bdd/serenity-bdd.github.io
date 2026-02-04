---
id: maven
title: Usando Maven con Serenity
sidebar_position: 3
---
# Integrando Serenity BDD en un proyecto Maven

Maven es la herramienta de compilación recomendada para Serenity BDD.

Puedes añadir Serenity BDD a un proyecto Maven existente agregando las dependencias correspondientes a tu archivo `pom.xml`.

## Versiones Recomendadas

Primero, define las versiones recomendadas en tu sección de propiedades:

```xml
<properties>
    <serenity.version>5.2.2</serenity.version>
    <junit5.version>6.0.1</junit5.version>
    <cucumber.version>7.33.0</cucumber.version>
</properties>
```

## Dependencias Principales

Todos los proyectos de Serenity BDD necesitan la siguiente dependencia principal:

```
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-core</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
```

También necesitarás un ejecutor de pruebas, que normalmente será JUnit 5 (recomendado) o Cucumber. Ten en cuenta que JUnit 4 está obsoleto a partir de Serenity 5.0.0.

## Dependencias de Serenity JUnit 5 (Recomendado)
Para usar JUnit 5 necesitarás la siguiente dependencia:

```
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-junit5</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
```

También necesitarás las dependencias de JUnit 5, por ejemplo:
```
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-api</artifactId>
    <version>${junit5.version}</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-engine</artifactId>
    <version>${junit5.version}</version>
    <scope>test</scope>
</dependency>
```

## Dependencias de Serenity JUnit 4 (Obsoleto)

:::warning JUnit 4 Obsoleto
El soporte de JUnit 4 está obsoleto a partir de Serenity 5.0.0 y será eliminado en Serenity 6.0.0. Por favor migra a JUnit 5 (ver arriba).
:::

Si aún estás usando JUnit 4, necesitarás la siguiente dependencia:

```
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-junit</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
```

## Dependencias de Serenity Cucumber

Para Cucumber necesitarás la siguiente dependencia:

```
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-cucumber</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
```

Dado que Serenity depende de una versión específica de las APIs de Cucumber, recomendamos usar la misma versión de las bibliotecas de Cucumber.

Cucumber requiere un ejecutor de pruebas, preferiblemente JUnit 5 (JUnit 4 está obsoleto).

## Dependencias de Cucumber con JUnit 5 (Recomendado)
Para usar JUnit 5 necesitarás la siguiente dependencia:

```
<dependency>
    <groupId>io.cucumber</groupId>
    <artifactId>cucumber-junit-platform-engine</artifactId>
    <version>${cucumber.version}</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.junit.platform</groupId>
    <artifactId>junit-platform-suite</artifactId>
    <version>${junit-platform.version}</version>
    <scope>test</scope>
</dependency>
```

Consulta la documentación de cucumber-junit-platform-engine sobre cómo usar junit-platform-suite para controlar cucumber: https://github.com/cucumber/cucumber-jvm/tree/main/junit-platform-engine#suites-with-different-configurations, y https://github.com/serenity-bdd/serenity-cucumber-starter para un ejemplo funcional.

## Dependencias de Cucumber con JUnit 4 (Obsoleto)

:::warning JUnit 4 Obsoleto
Los ejecutores de Cucumber con JUnit 4 están obsoletos a partir de Serenity 5.0.0 y serán eliminados en Serenity 6.0.0. Por favor migra a JUnit 5 (ver arriba).
:::

Si aún estás usando JUnit 4 con Cucumber, necesitarás la siguiente dependencia:

```
<dependency>
    <groupId>io.cucumber</groupId>
    <artifactId>cucumber-junit</artifactId>
    <version>${cucumber.version}</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.junit.platform</groupId>
    <artifactId>junit-vintage-engine</artifactId>
    <version>${junit5.version}</version>
    <scope>test</scope>
</dependency>
```

## Screenplay
Si estás usando el Screenplay Pattern, también necesitarás las dependencias de Screenplay:
```
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-screenplay</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-rest-assured</artifactId>
    <version>${serenity.version}</version>
</dependency>
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-ensure</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-screenplay-webdriver</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
```

## Ejecutando Pruebas con Maven Failsafe

Las pruebas de Serenity son pruebas de integración y deben ejecutarse usando el plugin Maven Failsafe. La configuración básica es sencilla:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-failsafe-plugin</artifactId>
    <version>3.5.2</version>
    <configuration>
        <includes>
            <include>**/*Test.java</include>
        </includes>
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
```

### Ejecutando Pruebas de JUnit 5 y Cucumber Juntas

Si tu proyecto contiene tanto pruebas de JUnit 5 como pruebas de Cucumber, puedes encontrar un problema donde solo se descubren y ejecutan las pruebas de Cucumber. Esto sucede porque cuando Cucumber usa la propiedad `cucumber.features` (ya sea a través de `@ConfigurationParameter` o `junit-platform.properties`), causa que otros selectores de descubrimiento de JUnit Platform sean ignorados.

Verás una advertencia como esta:

```
WARNING: TestEngine with ID 'cucumber' encountered a non-critical issue during test discovery:
Discovering tests using the cucumber.features property. Other discovery selectors are ignored!
```

**La solución** es configurar ejecuciones separadas de Failsafe para las pruebas de JUnit 5 y Cucumber:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-failsafe-plugin</artifactId>
    <version>3.5.2</version>
    <executions>
        <!-- Ejecución para pruebas de JUnit Jupiter (excluye Cucumber) -->
        <execution>
            <id>junit-tests</id>
            <goals>
                <goal>integration-test</goal>
            </goals>
            <configuration>
                <includes>
                    <include>**/*Test.java</include>
                </includes>
                <excludes>
                    <exclude>**/CucumberTestSuite.java</exclude>
                </excludes>
            </configuration>
        </execution>
        <!-- Ejecución para pruebas de Cucumber -->
        <execution>
            <id>cucumber-tests</id>
            <goals>
                <goal>integration-test</goal>
            </goals>
            <configuration>
                <includes>
                    <include>**/CucumberTestSuite.java</include>
                </includes>
            </configuration>
        </execution>
        <!-- Fase verify (se ejecuta una vez después de todas las pruebas) -->
        <execution>
            <id>verify</id>
            <goals>
                <goal>verify</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

Esta configuración:
- Ejecuta primero las pruebas de JUnit Jupiter (todos los archivos `*Test.java` excepto la suite de Cucumber)
- Ejecuta las pruebas de Cucumber por separado a través de la clase `CucumberTestSuite`
- Ejecuta el goal verify una vez al final para verificar fallos

:::tip Convención de Nombres
Ajusta los patrones de `<include>` y `<exclude>` para que coincidan con las convenciones de nombres de tus clases de prueba. Por ejemplo, si tu suite de Cucumber se llama `CucumberIT.java`, actualiza los patrones en consecuencia.
:::

## El Plugin Maven de Serenity

Si deseas generar los reportes de Serenity cada vez que ejecutas `mvn verify`, puedes usar el `serenity-maven-plugin` para eso:
```
<plugin>
    <groupId>net.serenity-bdd.maven.plugins</groupId>
    <artifactId>serenity-maven-plugin</artifactId>
    <version>${serenity.version}</version>
    <configuration>
      <tags>${tags}</tags>
    </configuration>
    <executions>
        <execution>
            <id>serenity-reports</id>
            <phase>post-integration-test</phase>
            <goals>
                <goal>aggregate</goal>
                <goal>check</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

Por defecto, el goal `aggregate` NO hará fallar la compilación si hay fallos en las pruebas - simplemente generará los reportes. De esta manera puedes agregar múltiples conjuntos de reportes y luego verificar los fallos al final usando `mvn serenity:check`.

## Verificando archivos de Feature de Gherkin

Algunos errores en los archivos de Feature de Gherkin pueden causar que los reportes de Serenity se comporten de manera impredecible. Por esta razón, las siguientes reglas deben seguirse cuando se trabaja con Cucumber y Serenity:
  - Los nombres de Scenario deben ser únicos dentro de un archivo de Feature
  - Los nombres de Scenario, Rule y Feature no deben estar vacíos
  - Los nombres de Feature deben ser únicos siempre que sea posible. En particular, las Feature con el mismo nombre, dentro de directorios con nombres idénticos, no aparecerán correctamente en los reportes de Serenity.

  Puedes verificar estas reglas antes de ejecutar la prueba completa llamando al goal `check-gherkin`, por ejemplo:

```
mvn serenity:check-gherkin
```

Puedes asegurarte de que tus archivos de Feature estén correctamente configurados antes de iniciar tus pruebas vinculando el goal `check-gherkin` a la fase del ciclo de vida `process-test-resources`, como se muestra aquí:

```
<plugin>
    <groupId>net.serenity-bdd.maven.plugins</groupId>
    <artifactId>serenity-maven-plugin</artifactId>
    <version>${serenity.version}</version>
    <configuration>
      <tags>${tags}</tags>
    </configuration>
    <executions>
        <execution>
            <id>check-feature-files</id>
            <phase>process-test-resources</phase>
            <goals>
                <goal>check-gherkin</goal>
            </goals>
        </execution>
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
