---
id: parallel-execution
title: Running Cucumber Tests in Parallel
sidebar_position: 2
---

# Running Cucumber Scenarios in Parallel

Running Cucumber scenarios in parallel can dramatically reduce test execution time. This guide explains how to configure and optimize parallel execution with Serenity BDD and JUnit 5.

## Overview

Parallel execution in Cucumber with JUnit 5 is powered by the Cucumber JUnit Platform Engine, which integrates with JUnit 5's parallel test execution capabilities. When properly configured, multiple scenarios can run simultaneously, taking advantage of multi-core processors.

## Prerequisites

- Serenity BDD 3.6.0 or higher
- JUnit 5
- Cucumber JUnit Platform Engine
- Thread-safe test code

## Basic Configuration

### Step 1: Add Required Dependencies

Ensure you have the Cucumber JUnit Platform Engine dependency:

```xml
<dependency>
    <groupId>io.cucumber</groupId>
    <artifactId>cucumber-junit-platform-engine</artifactId>
    <version>7.33.0</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.junit.platform</groupId>
    <artifactId>junit-platform-suite</artifactId>
    <version>5.10.0</version>
    <scope>test</scope>
</dependency>
```

### Step 2: Use the Parallel Reporter

:::warning Important
You **must** use `SerenityReporterParallel` for parallel execution, not `SerenityReporter`.
:::

Update your test suite to use the parallel-safe reporter:

```java
import org.junit.platform.suite.api.*;
import static io.cucumber.junit.platform.engine.Constants.PLUGIN_PROPERTY_NAME;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(
    key = PLUGIN_PROPERTY_NAME,
    value = "net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel"
)
class CucumberTestSuite {
}
```

### Step 3: Configure Parallel Execution

Create or update `junit-platform.properties` in `src/test/resources`:

```properties
# Enable parallel execution
cucumber.execution.parallel.enabled=true

# Use dynamic strategy (recommended)
cucumber.execution.parallel.config.strategy=dynamic

# Configure the Serenity reporter
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel
```

## Execution Strategies

### Dynamic Strategy (Recommended)

The dynamic strategy automatically determines the number of threads based on available processors:

```properties
cucumber.execution.parallel.config.strategy=dynamic
cucumber.execution.parallel.config.dynamic.factor=1.0
```

The `factor` is a multiplier for the number of available processors:
- `1.0` = same number of threads as processors (recommended)
- `0.5` = half the number of processors
- `2.0` = double the number of processors

**Example:** On a machine with 8 cores:
- Factor `1.0` = 8 threads
- Factor `0.5` = 4 threads
- Factor `2.0` = 16 threads

### Fixed Strategy

The fixed strategy uses a specified number of threads:

```properties
cucumber.execution.parallel.config.strategy=fixed
cucumber.execution.parallel.config.fixed.parallelism=4
cucumber.execution.parallel.config.fixed.max-pool-size=4
```

- `parallelism` - Number of concurrent threads
- `max-pool-size` - Maximum size of the thread pool

**Use when:**
- You need consistent, predictable thread counts
- Running on shared CI/CD infrastructure
- Debugging parallel execution issues

### Custom Strategy

For advanced use cases, you can implement a custom strategy:

```properties
cucumber.execution.parallel.config.strategy=custom
cucumber.execution.parallel.config.custom.class=com.example.MyParallelStrategy
```

## Complete Configuration Example

**junit-platform.properties:**
```properties
# Parallel execution
cucumber.execution.parallel.enabled=true
cucumber.execution.parallel.config.strategy=dynamic
cucumber.execution.parallel.config.dynamic.factor=1.0

# Serenity reporter
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel

# Optional: Control execution order
cucumber.execution.order=random

# Optional: Fail fast
cucumber.execution.fail-fast=false
```

## Thread Safety Considerations

### WebDriver Management

Serenity's `@Managed` WebDriver is automatically thread-safe when using parallel execution:

```java
@ExtendWith(SerenityJUnit5Extension.class)
class WebDriverSteps {

    @Managed
    WebDriver driver;  // Thread-safe - each thread gets its own instance

    @Given("I am on the home page")
    public void navigateToHomePage() {
        driver.get("https://example.com");
    }
}
```

Each thread will have its own isolated WebDriver instance.

### Step Definition Thread Safety

Step definition classes must be thread-safe:

**✅ Thread-Safe (Recommended):**
```java
public class LoginSteps {

    @Given("{actor} is on the login page")
    public void navigateToLoginPage(Actor actor) {
        actor.attemptsTo(
            Navigate.to("/login")
        );
    }
}
```

**❌ Not Thread-Safe:**
```java
public class LoginSteps {

    private String username;  // Shared state - NOT thread-safe!

    @Given("user enters username {string}")
    public void enterUsername(String user) {
        this.username = user;  // Race condition!
    }
}
```

### Using Scenario Context

For sharing data within a scenario, use Cucumber's scenario context:

```java
public class CheckoutSteps {

    private final ScenarioContext context;

    public CheckoutSteps(ScenarioContext context) {
        this.context = context;  // Injected per scenario
    }

    @When("I add item to cart")
    public void addItem() {
        context.put("cartTotal", calculateTotal());
    }

    @Then("cart total should be correct")
    public void verifyTotal() {
        Double total = context.get("cartTotal", Double.class);
        // Verify total
    }
}
```

## Controlling Parallelism

### Parallel at Different Levels

You can control what runs in parallel:

#### Scenario-Level Parallelism (Default)
```properties
# Each scenario runs in its own thread
cucumber.execution.parallel.enabled=true
```

#### Feature-Level Parallelism
To run features in parallel but scenarios within a feature sequentially, you need to configure JUnit Platform:

**junit-platform.properties:**
```properties
junit.jupiter.execution.parallel.enabled=true
junit.jupiter.execution.parallel.mode.default=concurrent
junit.jupiter.execution.parallel.mode.classes.default=concurrent
```

### Limiting Concurrent Scenarios

Control the maximum number of concurrent scenarios:

```properties
cucumber.execution.parallel.config.strategy=fixed
cucumber.execution.parallel.config.fixed.parallelism=4
```

## Parallel Execution with Tags

You can run specific tags in parallel:

```java
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(
    key = PLUGIN_PROPERTY_NAME,
    value = "net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel"
)
@ConfigurationParameter(
    key = FILTER_TAGS_PROPERTY_NAME,
    value = "@parallel"
)
class ParallelTestSuite {
}
```

Or exclude scenarios from parallel execution:

```properties
cucumber.filter.tags=not @serial
```

## Maven/Gradle Configuration

### Maven Surefire Plugin

Configure Maven to support parallel execution:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>3.0.0</version>
            <configuration>
                <skip>true</skip>
            </configuration>
        </plugin>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-failsafe-plugin</artifactId>
            <version>3.0.0</version>
            <configuration>
                <includes>
                    <include>**/*TestSuite.java</include>
                </includes>
                <systemPropertyVariables>
                    <webdriver.driver>${webdriver.driver}</webdriver.driver>
                </systemPropertyVariables>
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
    </plugins>
</build>
```

### Gradle Configuration

For Gradle:

```groovy
test {
    useJUnitPlatform()
    maxParallelForks = Runtime.runtime.availableProcessors()

    systemProperty 'cucumber.execution.parallel.enabled', 'true'
    systemProperty 'cucumber.execution.parallel.config.strategy', 'dynamic'
}
```

## Performance Optimization

### 1. Choose the Right Strategy

- **Small test suites** (<50 scenarios): Fixed strategy with 2-4 threads
- **Medium test suites** (50-200 scenarios): Dynamic strategy with factor 1.0
- **Large test suites** (>200 scenarios): Dynamic strategy with factor 0.75-1.0

### 2. Optimize Scenario Design

- **Keep scenarios independent** - No shared state between scenarios
- **Minimize setup time** - Use efficient Before hooks
- **Avoid sleeps** - Use explicit waits instead
- **Clean up resources** - Use After hooks properly

### 3. Resource Management

```properties
# Control thread pool size to avoid resource exhaustion
cucumber.execution.parallel.config.fixed.max-pool-size=8

# Avoid too many concurrent browsers
webdriver.pool.max=10
```

### 4. Monitor Resource Usage

Watch for:
- CPU utilization (should be near 100% for optimal performance)
- Memory consumption (each browser instance uses RAM)
- Network bandwidth (for remote WebDriver)
- Database connections (if applicable)

## Debugging Parallel Tests

### Disable Parallel Execution Temporarily

```properties
cucumber.execution.parallel.enabled=false
```

Or via command line:
```bash
mvn clean verify -Dcucumber.execution.parallel.enabled=false
```

### Run with Fewer Threads

```properties
cucumber.execution.parallel.config.strategy=fixed
cucumber.execution.parallel.config.fixed.parallelism=1
```

### Verbose Logging

Enable detailed logging to diagnose issues:

```properties
# Log file location
cucumber.plugin=pretty,html:target/cucumber-reports.html,json:target/cucumber.json

# Serenity logging
serenity.verbose=true
serenity.logging=VERBOSE
```

## Common Issues and Solutions

### Issue 1: Flaky Tests

**Symptoms:** Tests pass when run individually but fail when run in parallel

**Solutions:**
- Check for shared state in step definitions
- Ensure WebDriver instances are properly isolated
- Review test data - avoid shared test data
- Add proper synchronization/waits

### Issue 2: Resource Exhaustion

**Symptoms:** Tests slow down or crash after some time

**Solutions:**
- Reduce parallelism: lower the thread count
- Increase heap size: `-Xmx4g`
- Check for resource leaks (unclosed connections, browser instances)
- Monitor system resources

### Issue 3: Report Generation Issues

**Symptoms:** Serenity reports are incomplete or corrupted

**Solutions:**
- Ensure you're using `SerenityReporterParallel`
- Check Serenity version (3.6.0+)
- Verify maven-failsafe-plugin is configured correctly
- Check for filesystem race conditions

### Issue 4: CI/CD Pipeline Failures

**Symptoms:** Tests fail only in CI but pass locally

**Solutions:**
- Match thread count to CI environment capabilities
- Use fixed strategy for consistent behavior
- Increase timeouts for slower CI environments
- Check CI resource limits

## Best Practices

### 1. Start Small
Begin with 2-4 threads and gradually increase:

```properties
cucumber.execution.parallel.config.strategy=fixed
cucumber.execution.parallel.config.fixed.parallelism=2
```

### 2. Use Tags Strategically

Mark scenarios that can't run in parallel:

```gherkin
@serial @database-migration
Scenario: Migrate database schema
  # This scenario must run alone
```

Then exclude them:
```properties
cucumber.filter.tags=not @serial
```

### 3. Isolate Test Data

Each scenario should create and clean up its own test data:

```java
@Before
public void setupTestData() {
    // Create unique test data for this scenario
    String uniqueId = UUID.randomUUID().toString();
    context.put("testUserId", "user_" + uniqueId);
}

@After
public void cleanupTestData() {
    // Clean up this scenario's test data
    String userId = context.get("testUserId", String.class);
    deleteUser(userId);
}
```

### 4. Monitor and Adjust

- Monitor test execution times
- Track flaky test rates
- Adjust parallelism based on metrics
- Review resource utilization

### 5. Document Thread Safety

Add comments for non-thread-safe scenarios:

```gherkin
# @serial - Modifies global application state
@serial @admin
Scenario: Update application settings
  Given I am logged in as admin
  When I change the default language to Spanish
  Then all users should see Spanish interface
```

## Measuring Performance Improvements

### Before Parallel Execution
```
Total scenarios: 100
Execution time: 50 minutes
```

### After Parallel Execution (8 threads)
```
Total scenarios: 100
Execution time: 8 minutes
Speedup: 6.25x
Efficiency: 78%
```

Calculate your speedup:
```
Speedup = Sequential Time / Parallel Time
Efficiency = Speedup / Number of Threads
```

## Next Steps

- Review the main [Cucumber with JUnit 5](cucumber-junit5) guide
- Check the [Configuration Reference](configuration-reference) for all available options
- See [Best Practices](cucumber-junit5#best-practices) for writing maintainable tests
- Explore [Serenity Reports](/docs/reporting/the_serenity_reports) documentation

## Additional Resources

- [Cucumber Parallel Execution Docs](https://github.com/cucumber/cucumber-jvm/tree/main/cucumber-junit-platform-engine#parallel-execution)
- [JUnit 5 Parallel Execution](https://junit.org/junit5/docs/current/user-guide/#writing-tests-parallel-execution)
- [Serenity BDD Performance Tips](https://serenity-bdd.info)
