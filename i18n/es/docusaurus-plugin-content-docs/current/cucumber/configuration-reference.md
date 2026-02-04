---
id: configuration-reference
title: Referencia de Configuración de Cucumber
sidebar_position: 3
---

# Referencia de Configuración de Cucumber

Esta página proporciona una referencia completa de todas las opciones de configuración para ejecutar Cucumber con Serenity BDD y JUnit 5.

## Métodos de Configuración

Hay tres formas de configurar Cucumber con JUnit 5:

1. **Anotaciones @ConfigurationParameter** (en clases de suite de pruebas)
2. **Archivo junit-platform.properties** (en src/test/resources)
3. **Propiedades del sistema** (línea de comandos o herramienta de compilación)

Orden de prioridad: Anotaciones > Propiedades del Sistema > Archivo de Propiedades

## Configuración Esencial de Serenity

### Plugin Reporter de Serenity

**Requerido para reportes de Serenity**

```java
@ConfigurationParameter(
    key = PLUGIN_PROPERTY_NAME,
    value = "net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel"
)
```

O en `junit-platform.properties`:
```properties
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel
```

:::warning Cambio Importante en Serenity 5.0.0
La ruta del plugin cambió de `io.cucumber.core.plugin.*` a `net.serenitybdd.cucumber.core.plugin.*`
:::

**Reporter disponibles:**
- `SerenityReporterParallel` - Seguro para hilos, recomendado para todos los escenarios
- `SerenityReporter` - Legacy, no seguro para hilos

## Configuración Principal de Cucumber

### Ubicación de Archivos Feature

Especifica dónde encontrar los archivos Feature:

```java
// Enfoque con anotación
@SelectClasspathResource("features")

// O usando parámetro de configuración
@ConfigurationParameter(
    key = FEATURES_PROPERTY_NAME,
    value = "src/test/resources/features"
)
```

**junit-platform.properties:**
```properties
cucumber.features=src/test/resources/features
```

### Step Definition (Glue)

Especifica los paquetes que contienen los Step Definition:

```java
@ConfigurationParameter(
    key = GLUE_PROPERTY_NAME,
    value = "com.example.stepdefinitions,com.example.hooks"
)
```

**junit-platform.properties:**
```properties
cucumber.glue=com.example.stepdefinitions,com.example.hooks
```

**Múltiples paquetes:** Sepáralos con comas

### Filtrado por Etiquetas

Filtra escenarios por etiquetas:

```java
@ConfigurationParameter(
    key = FILTER_TAGS_PROPERTY_NAME,
    value = "@smoke and not @wip"
)
```

**junit-platform.properties:**
```properties
cucumber.filter.tags=@smoke and not @wip
```

**Sintaxis de expresiones de etiquetas:**
- `@tag1 and @tag2` - Ambas etiquetas requeridas
- `@tag1 or @tag2` - Cualquiera de las etiquetas requerida
- `not @tag` - Excluir etiqueta
- `(@tag1 or @tag2) and not @tag3` - Expresiones complejas

**Línea de comandos:**
```bash
mvn verify -Dcucumber.filter.tags="@smoke"
```

## Configuración de Ejecución Paralela

### Habilitar Ejecución Paralela

```properties
cucumber.execution.parallel.enabled=true
```

### Estrategia de Ejecución

**Dinámica (recomendada):**
```properties
cucumber.execution.parallel.config.strategy=dynamic
cucumber.execution.parallel.config.dynamic.factor=1.0
```

Cálculo del factor: `hilos = procesadores x factor`

**Fija:**
```properties
cucumber.execution.parallel.config.strategy=fixed
cucumber.execution.parallel.config.fixed.parallelism=4
cucumber.execution.parallel.config.fixed.max-pool-size=4
```

**Personalizada:**
```properties
cucumber.execution.parallel.config.strategy=custom
cucumber.execution.parallel.config.custom.class=com.example.MyStrategy
```

### Modo de Ejecución Paralela

```properties
# Escenarios en paralelo (por defecto)
cucumber.execution.parallel.mode.default=concurrent

# Feature en paralelo
cucumber.execution.parallel.mode.features.default=concurrent
```

## Comportamiento de Ejecución

### Orden de Ejecución

Controla el orden de ejecución de escenarios:

```properties
# Orden aleatorio (bueno para encontrar dependencias entre pruebas)
cucumber.execution.order=random

# Orden alfabético
cucumber.execution.order=lexicographical

# Alfabético inverso
cucumber.execution.order=reverse
```

### Dry Run

Verifica pasos no definidos sin ejecutar:

```java
@ConfigurationParameter(
    key = EXECUTION_DRY_RUN_PROPERTY_NAME,
    value = "true"
)
```

**junit-platform.properties:**
```properties
cucumber.execution.dry-run=true
```

### Wip (Work In Progress)

Ejecuta solo escenarios etiquetados con @wip:

```properties
cucumber.execution.wip=true
```

### Modo Estricto

Trata los pasos no definidos y pendientes como errores:

```properties
cucumber.execution.strict=true
```

## Configuración de Plugins

### Múltiples Plugins

Configura múltiples plugins:

```properties
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel,\
  pretty,\
  html:target/cucumber-reports/cucumber.html,\
  json:target/cucumber-reports/cucumber.json,\
  junit:target/cucumber-reports/cucumber.xml
```

### Plugins Comunes

| Plugin | Propósito | Ejemplo |
|--------|---------|---------|
| `pretty` | Salida de consola con colores | `pretty` |
| `html` | Reporte HTML | `html:target/cucumber.html` |
| `json` | Reporte JSON | `json:target/cucumber.json` |
| `junit` | Reporte JUnit XML | `junit:target/cucumber.xml` |
| `timeline` | Reporte de línea de tiempo | `timeline:target/timeline` |
| `usage` | Reporte de uso de pasos | `usage:target/usage.json` |
| `rerun` | Archivo de escenarios fallidos | `rerun:target/rerun.txt` |

### Suprimir Mensajes de Cucumber

Suprime el mensaje "Share your results":

```java
@ConfigurationParameter(
    key = PLUGIN_PUBLISH_QUIET_PROPERTY_NAME,
    value = "true"
)
```

**junit-platform.properties:**
```properties
cucumber.publish.quiet=true
```

## Formato de Salida

### Colores ANSI

Deshabilita la salida de consola con colores:

```java
@ConfigurationParameter(
    key = ANSI_COLORS_DISABLED_PROPERTY_NAME,
    value = "true"
)
```

**junit-platform.properties:**
```properties
cucumber.ansi-colors.disabled=true
```

### Salida Monocromática

```properties
cucumber.plugin=pretty,monochrome
```

### Tipo de Snippet

Configura el estilo de snippet generado:

```properties
# Camelcase (recomendado para Java)
cucumber.snippet-type=camelcase

# Underscore
cucumber.snippet-type=underscore
```

## Object Factory

### Object Factory Personalizado

Para inyección de dependencias:

```java
@ConfigurationParameter(
    key = OBJECT_FACTORY_PROPERTY_NAME,
    value = "com.example.CustomObjectFactory"
)
```

**junit-platform.properties:**
```properties
cucumber.object-factory=com.example.CustomObjectFactory
```

**Factory comunes:**
- PicoFactory (por defecto)
- Spring
- Guice
- OpenEJB
- Weld

## Integración con JUnit Platform

### Descubrimiento de Pruebas

```properties
# Incluir/excluir clases de prueba
junit.jupiter.testclass.include.classname.pattern=.*IT
junit.jupiter.testclass.exclude.classname.pattern=.*IntegrationTest

# Incluir/excluir métodos de prueba
junit.jupiter.testmethod.include.pattern=test.*
junit.jupiter.testmethod.exclude.pattern=.*Slow
```

### Ejecución Paralela (Nivel JUnit)

```properties
junit.jupiter.execution.parallel.enabled=true
junit.jupiter.execution.parallel.mode.default=concurrent
junit.jupiter.execution.parallel.mode.classes.default=concurrent
junit.jupiter.execution.parallel.config.strategy=dynamic
junit.jupiter.execution.parallel.config.dynamic.factor=1.0
```

## Ejemplo de Configuración Completa

### junit-platform.properties Completo

```properties
# ==========================================
# Configuración de Serenity BDD
# ==========================================
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel

# ==========================================
# Archivos Feature y Step Definition
# ==========================================
cucumber.features=src/test/resources/features
cucumber.glue=com.example.stepdefinitions,com.example.hooks

# ==========================================
# Filtrado
# ==========================================
cucumber.filter.tags=not @wip
cucumber.filter.name=.*checkout.*

# ==========================================
# Ejecución Paralela
# ==========================================
cucumber.execution.parallel.enabled=true
cucumber.execution.parallel.config.strategy=dynamic
cucumber.execution.parallel.config.dynamic.factor=1.0

# ==========================================
# Comportamiento de Ejecución
# ==========================================
cucumber.execution.order=random
cucumber.execution.dry-run=false
cucumber.execution.strict=true

# ==========================================
# Plugins y Reportes
# ==========================================
cucumber.plugin=pretty,\
  html:target/cucumber-reports/cucumber.html,\
  json:target/cucumber-reports/cucumber.json,\
  junit:target/cucumber-reports/cucumber.xml
cucumber.publish.quiet=true

# ==========================================
# Formato de Salida
# ==========================================
cucumber.ansi-colors.disabled=false
cucumber.snippet-type=camelcase

# ==========================================
# JUnit Platform
# ==========================================
junit.jupiter.execution.parallel.enabled=false
junit.jupiter.testinstance.lifecycle.default=per_method
```

### Ejemplo Completo de Suite de Pruebas

```java
import org.junit.platform.suite.api.*;
import static io.cucumber.junit.platform.engine.Constants.*;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(
    key = PLUGIN_PROPERTY_NAME,
    value = "net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel"
)
@ConfigurationParameter(
    key = GLUE_PROPERTY_NAME,
    value = "com.example.stepdefinitions"
)
@ConfigurationParameter(
    key = FILTER_TAGS_PROPERTY_NAME,
    value = "@smoke and not @wip"
)
@ConfigurationParameter(
    key = PLUGIN_PUBLISH_QUIET_PROPERTY_NAME,
    value = "true"
)
class CucumberTestSuite {
}
```

## Configuración Específica por Entorno

### Usando Perfiles

Crea múltiples archivos de propiedades:

```
src/test/resources/
├── junit-platform.properties (por defecto)
├── junit-platform-ci.properties (entorno CI)
└── junit-platform-dev.properties (desarrollo)
```

Activa vía Maven:
```bash
mvn verify -Dprofile=ci
```

### Variables de Entorno

Sobrescribe propiedades usando variables de entorno:

```bash
export CUCUMBER_FILTER_TAGS="@smoke"
export CUCUMBER_EXECUTION_PARALLEL_ENABLED=true
mvn verify
```

## Referencia de Constantes

Todas las constantes de `io.cucumber.junit.platform.engine.Constants`:

| Constante | Clave de Propiedad |
|----------|--------------|
| `ANSI_COLORS_DISABLED_PROPERTY_NAME` | `cucumber.ansi-colors.disabled` |
| `EXECUTION_DRY_RUN_PROPERTY_NAME` | `cucumber.execution.dry-run` |
| `EXECUTION_ORDER_PROPERTY_NAME` | `cucumber.execution.order` |
| `EXECUTION_STRICT_PROPERTY_NAME` | `cucumber.execution.strict` |
| `FEATURES_PROPERTY_NAME` | `cucumber.features` |
| `FILTER_NAME_PROPERTY_NAME` | `cucumber.filter.name` |
| `FILTER_TAGS_PROPERTY_NAME` | `cucumber.filter.tags` |
| `GLUE_PROPERTY_NAME` | `cucumber.glue` |
| `OBJECT_FACTORY_PROPERTY_NAME` | `cucumber.object-factory` |
| `PLUGIN_PROPERTY_NAME` | `cucumber.plugin` |
| `PLUGIN_PUBLISH_ENABLED_PROPERTY_NAME` | `cucumber.publish.enabled` |
| `PLUGIN_PUBLISH_QUIET_PROPERTY_NAME` | `cucumber.publish.quiet` |
| `PLUGIN_PUBLISH_TOKEN_PROPERTY_NAME` | `cucumber.publish.token` |
| `SNIPPET_TYPE_PROPERTY_NAME` | `cucumber.snippet-type` |

## Siguientes Pasos

- Regresa a la guía principal de [Cucumber con JUnit 5](cucumber-junit5)
- Aprende sobre [Ejecución Paralela](parallel-execution)
- Revisa las [Mejores Prácticas](cucumber-junit5#mejores-prácticas)

## Recursos Adicionales

- [Documentación de Configuración de Cucumber](https://github.com/cucumber/cucumber-jvm/tree/main/cucumber-junit-platform-engine#configuration-options)
- [Configuración de JUnit Platform](https://junit.org/junit5/docs/current/user-guide/#running-tests-config-params)
