---
sidebar_position: 5
---

# Migración de Serenity BDD 3.x a Serenity BDD 4.x

## Introducción
Serenity BDD 4.0.0 es una actualización significativa que se alinea con las bibliotecas de testing modernas al soportar JDK 17. Esta versión mayor incluye cambios en las estructuras de paquetes, reflejando ajustes en la estructura de módulos para JDK 17. Si estás migrando de Serenity 3.x a Serenity 4.x, este tutorial te guiará a través de los pasos necesarios para hacer tu proyecto compatible con la última versión.

## Paso 1: Asegurar compatibilidad con JDK 17
Asegúrate de que tu proyecto sea compatible con JDK 17, ya que Serenity BDD 4.x lo requiere como versión mínima. Si estás usando Maven, actualiza el archivo `pom.xml` de tu proyecto para incluir el `maven-compiler-plugin` configurado para JDK 17. Aquí hay un ejemplo:

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-compiler-plugin</artifactId>
  <version>3.8.1</version>
  <configuration>
    <source>11</source>
    <target>11</target>
  </configuration>
</plugin>
```

Si tu proyecto usa Gradle, necesitarás especificar la versión de Java en tu archivo `build.gradle` para asegurar compatibilidad con JDK 17. Aquí hay un ejemplo:

```groovy
plugins {
  id 'java'
}

sourceCompatibility = '11'
targetCompatibility = '11'
```

## Paso 2: Actualizar dependencias de Serenity
Actualiza las dependencias de Serenity BDD en el archivo de compilación de tu proyecto a la última versión 4.x, por ejemplo:

```xml
    <properties>
        <serenity.version>4.0.0</serenity.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-core</artifactId>
            <version>${serenity.version}</version>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-junit</artifactId>
            <version>${serenity.version}</version>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-screenplay</artifactId>
            <version>${serenity.version}</version>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-screenplay-webdriver</artifactId>
            <version>${serenity.version}</version>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-ensure</artifactId>
            <version>${serenity.version}</version>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-cucumber</artifactId>
            <version>${serenity.version}</version>
        </dependency>
    </dependencies>

```

## Paso 3: Modificar anotaciones
Debido a las restricciones de módulos de Java 9, algunos de los paquetes han cambiado de lugar en la nueva versión. Lo más importante es que todas las anotaciones principales de Serenity ahora se pueden encontrar en el paquete `net.serenitybdd.annotations`.

En tu proyecto, reemplaza las anotaciones principales de Serenity, como `@Step`, al nuevo paquete `net.serenitybdd.annotations` desde el antiguo paquete `net.thucydides.core.annotations`. Si tu proyecto es grande, puedes actualizar todas tus anotaciones de una sola vez así:

![](img/replace-serenity-annotations.png)

## Paso 4: Actualizar referencias de paquetes
Si estás usando clases internas de Serenity, puede que necesites modificar las referencias de paquetes relevantes en tu código basándote en la siguiente tabla:

| Módulo                        | Paquetes antiguos                            | Paquetes nuevos |
| --------                      | ------------                                 | ------------ |
| serenity-screenplay-webdriver | net.serenity.screenplay.*                    | net.serenity.screenplay.webdriver.* |
|                               | net.serenitybdd.screenplay.webtest.actions.* | net.serenitybdd.screenplay.webdriver.actions.* |
| serenity-model                | net.serenitybdd.core.*                       | net.serenitybdd.model.* |
|                               | net.thucydides.core.annotations.*            | net.serenitybdd.annotations.* |
|                               | Otros net.thucydides.core.*                  | net.thucydides.model.*  |

Por ejemplo, puede que necesites reemplazar `net.thucydides.core.util.EnvironmentVariables` con `net.thucydides.model.util.EnvironmentVariables`


## Paso 5: Probar tus cambios
Después de hacer estos cambios, ejecuta tu suite de pruebas para verificar que todo funcione correctamente con la nueva versión de Serenity BDD. Presta especial atención a lo siguiente:
- **Jerarquía de requisitos:** Asegúrate de que la jerarquía de requisitos se muestre correctamente en tus reportes.
- **Ejecución de pruebas:** Confirma que todas tus pruebas se ejecuten como se espera, sin pruebas faltantes o fallidas que anteriormente pasaban.

## Conclusión
Migrar a Serenity BDD 4.x implica actualizar referencias de paquetes para alinearse con la nueva estructura de módulos de JDK 17. Sigue los pasos anteriores y consulta la documentación oficial de Serenity BDD para información adicional o soporte.

Recuerda probar exhaustivamente tu proyecto actualizado, enfocándote particularmente en la jerarquía de requisitos y la ejecución de pruebas, para asegurar que la migración haya sido exitosa.
