---
id: configuration-reference
title: Cucumber Configuration Reference
sidebar_position: 3
---

# Cucumber Configuration Reference

This page provides a comprehensive reference of all configuration options for running Cucumber with Serenity BDD and JUnit 5.

## Configuration Methods

There are three ways to configure Cucumber with JUnit 5:

1. **@ConfigurationParameter annotations** (in test suite classes)
2. **junit-platform.properties** file (in src/test/resources)
3. **System properties** (command line or build tool)

Priority order: Annotations > System Properties > Properties File

## Essential Serenity Configuration

### Serenity Reporter Plugin

**Required for Serenity reports**

```java
@ConfigurationParameter(
    key = PLUGIN_PROPERTY_NAME,
    value = "net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel"
)
```

Or in `junit-platform.properties`:
```properties
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel
```

:::warning Breaking Change in Serenity 5.0.0
The plugin path changed from `io.cucumber.core.plugin.*` to `net.serenitybdd.cucumber.core.plugin.*`
:::

**Available reporters:**
- `SerenityReporterParallel` - Thread-safe, recommended for all scenarios
- `SerenityReporter` - Legacy, not thread-safe

## Core Cucumber Configuration

### Feature File Location

Specify where to find feature files:

```java
// Annotation approach
@SelectClasspathResource("features")

// Or using configuration parameter
@ConfigurationParameter(
    key = FEATURES_PROPERTY_NAME,
    value = "src/test/resources/features"
)
```

**junit-platform.properties:**
```properties
cucumber.features=src/test/resources/features
```

### Step Definitions (Glue)

Specify packages containing step definitions:

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

**Multiple packages:** Separate with commas

### Tag Filtering

Filter scenarios by tags:

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

**Tag expression syntax:**
- `@tag1 and @tag2` - Both tags required
- `@tag1 or @tag2` - Either tag required
- `not @tag` - Exclude tag
- `(@tag1 or @tag2) and not @tag3` - Complex expressions

**Command line:**
```bash
mvn verify -Dcucumber.filter.tags="@smoke"
```

## Parallel Execution Configuration

### Enable Parallel Execution

```properties
cucumber.execution.parallel.enabled=true
```

### Execution Strategy

**Dynamic (recommended):**
```properties
cucumber.execution.parallel.config.strategy=dynamic
cucumber.execution.parallel.config.dynamic.factor=1.0
```

Factor calculation: `threads = processors × factor`

**Fixed:**
```properties
cucumber.execution.parallel.config.strategy=fixed
cucumber.execution.parallel.config.fixed.parallelism=4
cucumber.execution.parallel.config.fixed.max-pool-size=4
```

**Custom:**
```properties
cucumber.execution.parallel.config.strategy=custom
cucumber.execution.parallel.config.custom.class=com.example.MyStrategy
```

### Parallel Execution Mode

```properties
# Parallel scenarios (default)
cucumber.execution.parallel.mode.default=concurrent

# Parallel features
cucumber.execution.parallel.mode.features.default=concurrent
```

## Execution Behavior

### Execution Order

Control scenario execution order:

```properties
# Random order (good for finding test dependencies)
cucumber.execution.order=random

# Alphabetical order
cucumber.execution.order=lexicographical

# Reverse alphabetical
cucumber.execution.order=reverse
```

### Dry Run

Check for undefined steps without executing:

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

Run only scenarios tagged with @wip:

```properties
cucumber.execution.wip=true
```

### Strict Mode

Treat undefined and pending steps as errors:

```properties
cucumber.execution.strict=true
```

## Plugin Configuration

### Multiple Plugins

Configure multiple plugins:

```properties
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel,\
  pretty,\
  html:target/cucumber-reports/cucumber.html,\
  json:target/cucumber-reports/cucumber.json,\
  junit:target/cucumber-reports/cucumber.xml
```

### Common Plugins

| Plugin | Purpose | Example |
|--------|---------|---------|
| `pretty` | Console output with colors | `pretty` |
| `html` | HTML report | `html:target/cucumber.html` |
| `json` | JSON report | `json:target/cucumber.json` |
| `junit` | JUnit XML report | `junit:target/cucumber.xml` |
| `timeline` | Timeline report | `timeline:target/timeline` |
| `usage` | Step usage report | `usage:target/usage.json` |
| `rerun` | Failed scenarios file | `rerun:target/rerun.txt` |

### Suppress Cucumber Messages

Suppress "Share your results" message:

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

## Output Formatting

### ANSI Colors

Disable colored console output:

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

### Monochrome Output

```properties
cucumber.plugin=pretty,monochrome
```

### Snippet Type

Configure generated snippet style:

```properties
# Camelcase (recommended for Java)
cucumber.snippet-type=camelcase

# Underscore
cucumber.snippet-type=underscore
```

## Object Factory

### Custom Object Factory

For dependency injection:

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

**Common factories:**
- PicoFactory (default)
- Spring
- Guice
- OpenEJB
- Weld

## JUnit Platform Integration

### Test Discovery

```properties
# Include/exclude test classes
junit.jupiter.testclass.include.classname.pattern=.*IT
junit.jupiter.testclass.exclude.classname.pattern=.*IntegrationTest

# Include/exclude test methods
junit.jupiter.testmethod.include.pattern=test.*
junit.jupiter.testmethod.exclude.pattern=.*Slow
```

### Parallel Execution (JUnit Level)

```properties
junit.jupiter.execution.parallel.enabled=true
junit.jupiter.execution.parallel.mode.default=concurrent
junit.jupiter.execution.parallel.mode.classes.default=concurrent
junit.jupiter.execution.parallel.config.strategy=dynamic
junit.jupiter.execution.parallel.config.dynamic.factor=1.0
```

## Complete Configuration Example

### Comprehensive junit-platform.properties

```properties
# ==========================================
# Serenity BDD Configuration
# ==========================================
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel

# ==========================================
# Feature Files and Step Definitions
# ==========================================
cucumber.features=src/test/resources/features
cucumber.glue=com.example.stepdefinitions,com.example.hooks

# ==========================================
# Filtering
# ==========================================
cucumber.filter.tags=not @wip
cucumber.filter.name=.*checkout.*

# ==========================================
# Parallel Execution
# ==========================================
cucumber.execution.parallel.enabled=true
cucumber.execution.parallel.config.strategy=dynamic
cucumber.execution.parallel.config.dynamic.factor=1.0

# ==========================================
# Execution Behavior
# ==========================================
cucumber.execution.order=random
cucumber.execution.dry-run=false
cucumber.execution.strict=true

# ==========================================
# Plugins and Reporting
# ==========================================
cucumber.plugin=pretty,\
  html:target/cucumber-reports/cucumber.html,\
  json:target/cucumber-reports/cucumber.json,\
  junit:target/cucumber-reports/cucumber.xml
cucumber.publish.quiet=true

# ==========================================
# Output Formatting
# ==========================================
cucumber.ansi-colors.disabled=false
cucumber.snippet-type=camelcase

# ==========================================
# JUnit Platform
# ==========================================
junit.jupiter.execution.parallel.enabled=false
junit.jupiter.testinstance.lifecycle.default=per_method
```

### Complete Test Suite Example

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

## Environment-Specific Configuration

### Using Profiles

Create multiple properties files:

```
src/test/resources/
├── junit-platform.properties (default)
├── junit-platform-ci.properties (CI environment)
└── junit-platform-dev.properties (development)
```

Activate via Maven:
```bash
mvn verify -Dprofile=ci
```

### Environment Variables

Override properties using environment variables:

```bash
export CUCUMBER_FILTER_TAGS="@smoke"
export CUCUMBER_EXECUTION_PARALLEL_ENABLED=true
mvn verify
```

## Constants Reference

All constants from `io.cucumber.junit.platform.engine.Constants`:

| Constant | Property Key |
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

## Next Steps

- Return to the main [Cucumber with JUnit 5](cucumber-junit5) guide
- Learn about [Parallel Execution](parallel-execution)
- Review [Best Practices](cucumber-junit5#best-practices)

## Additional Resources

- [Cucumber Configuration Docs](https://github.com/cucumber/cucumber-jvm/tree/main/cucumber-junit-platform-engine#configuration-options)
- [JUnit Platform Configuration](https://junit.org/junit5/docs/current/user-guide/#running-tests-config-params)
