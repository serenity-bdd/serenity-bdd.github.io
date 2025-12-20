---
id: parallel-execution
title: Running JUnit 5 Tests in Parallel
sidebar_position: 2
---

# Running JUnit 5 Serenity Tests in Parallel

Running JUnit 5 tests in parallel can significantly reduce test execution time. This guide explains how to configure and optimize parallel execution for Serenity BDD tests using JUnit 5.

## Overview

JUnit 5 (Jupiter) has built-in support for parallel test execution. When combined with Serenity BDD, you can run test methods and test classes concurrently, taking advantage of multi-core processors.

:::tip Parallel Execution Benefits
On a machine with 8 cores, parallel execution can reduce test time from 30 minutes to 5-8 minutes or less.
:::

## Prerequisites

- JUnit 5 (Jupiter)
- Serenity BDD 3.6.0 or higher
- Thread-safe test code
- Sufficient system resources (CPU, RAM)

## Basic Configuration

### Step 1: Enable Parallel Execution

Create or update `junit-platform.properties` in `src/test/resources`:

```properties
# Enable parallel execution
junit.jupiter.execution.parallel.enabled=true
```

### Step 2: Configure Execution Mode

```properties
# Run test classes in parallel
junit.jupiter.execution.parallel.mode.default=concurrent

# Run test classes in parallel
junit.jupiter.execution.parallel.mode.classes.default=concurrent
```

### Step 3: Configure Execution Strategy

```properties
# Use dynamic strategy (recommended)
junit.jupiter.execution.parallel.config.strategy=dynamic
junit.jupiter.execution.parallel.config.dynamic.factor=1.0
```

## Execution Modes

### Concurrent Mode

Tests run in parallel:

```properties
junit.jupiter.execution.parallel.mode.default=concurrent
junit.jupiter.execution.parallel.mode.classes.default=concurrent
```

### Same Thread Mode

Tests run sequentially:

```properties
junit.jupiter.execution.parallel.mode.default=same_thread
junit.jupiter.execution.parallel.mode.classes.default=same_thread
```

### Mixed Mode

Run classes in parallel but methods within a class sequentially:

```properties
# Classes in parallel
junit.jupiter.execution.parallel.mode.classes.default=concurrent

# Methods in same class run sequentially
junit.jupiter.execution.parallel.mode.default=same_thread
```

## Execution Strategies

### Dynamic Strategy (Recommended)

Automatically determines thread count based on available processors:

```properties
junit.jupiter.execution.parallel.config.strategy=dynamic
junit.jupiter.execution.parallel.config.dynamic.factor=1.0
```

**Factor calculation:** `threads = processors × factor`

**Examples** (on an 8-core machine):
- Factor `1.0` = 8 threads (recommended)
- Factor `0.5` = 4 threads
- Factor `2.0` = 16 threads

### Fixed Strategy

Uses a specified number of threads:

```properties
junit.jupiter.execution.parallel.config.strategy=fixed
junit.jupiter.execution.parallel.config.fixed.parallelism=4
```

**Use when:**
- You need consistent thread counts
- Running on shared CI/CD infrastructure
- Debugging parallel execution issues

### Custom Strategy

Implement your own strategy:

```properties
junit.jupiter.execution.parallel.config.strategy=custom
junit.jupiter.execution.parallel.config.custom.class=com.example.MyParallelStrategy
```

## Controlling Parallelism at Class/Method Level

### Per-Class Configuration

Use `@Execution` annotation to control parallelism:

```java
import org.junit.jupiter.api.parallel.Execution;
import org.junit.jupiter.api.parallel.ExecutionMode;

@ExtendWith(SerenityJUnit5Extension.class)
@Execution(ExecutionMode.CONCURRENT)  // Run this class's methods in parallel
class FastTests {

    @Test
    void test1() { }

    @Test
    void test2() { }

    @Test
    void test3() { }
}
```

### Force Sequential Execution

```java
@ExtendWith(SerenityJUnit5Extension.class)
@Execution(ExecutionMode.SAME_THREAD)  // Run sequentially
class DatabaseMigrationTests {

    @Test
    void migration1() { }

    @Test
    void migration2() { }  // Must run after migration1
}
```

### Method-Level Control

```java
@ExtendWith(SerenityJUnit5Extension.class)
class MixedTests {

    @Test
    @Execution(ExecutionMode.CONCURRENT)
    void canRunInParallel() { }

    @Test
    @Execution(ExecutionMode.SAME_THREAD)
    void mustRunSequentially() { }
}
```

## Resource Locks

Prevent concurrent access to shared resources:

```java
import org.junit.jupiter.api.parallel.ResourceLock;

@ExtendWith(SerenityJUnit5Extension.class)
class SharedResourceTests {

    @Test
    @ResourceLock("database")
    void accessDatabase1() {
        // Exclusive access to database
    }

    @Test
    @ResourceLock("database")
    void accessDatabase2() {
        // Will wait for accessDatabase1 to complete
    }

    @Test
    @ResourceLock(value = "database", mode = READ)
    void readFromDatabase() {
        // Read-only access - can run concurrently with other reads
    }
}
```

### Common Resource Locks

```java
import static org.junit.jupiter.api.parallel.Resources.*;

@Test
@ResourceLock(SYSTEM_PROPERTIES)
void modifiesSystemProperties() { }

@Test
@ResourceLock(SYSTEM_OUT)
void writesToSystemOut() { }

@Test
@ResourceLock("my-custom-resource")
void accessesCustomResource() { }
```

## Thread Safety with Serenity

### WebDriver Management

Serenity's `@Managed` WebDriver is automatically thread-safe:

```java
@ExtendWith(SerenityJUnit5Extension.class)
@Execution(ExecutionMode.CONCURRENT)
class WebTests {

    @Managed(driver = "chrome", options = "headless")
    WebDriver driver;  // Each thread gets its own instance

    @Test
    void test1() {
        driver.get("https://example.com");
        // Thread-safe
    }

    @Test
    void test2() {
        driver.get("https://example.com/other");
        // Independent WebDriver instance
    }
}
```

### Step Libraries

Step libraries are thread-safe when properly used:

```java
@ExtendWith(SerenityJUnit5Extension.class)
@Execution(ExecutionMode.CONCURRENT)
class CheckoutTests {

    @Steps
    CartSteps cart;  // Thread-safe - instance per thread

    @Test
    void addToCart() {
        cart.addProduct("Product1");
    }

    @Test
    void removeFromCart() {
        cart.addProduct("Product2");
        cart.removeProduct("Product2");
    }
}
```

### Avoid Shared Mutable State

```java
// ❌ BAD - Not thread-safe
@ExtendWith(SerenityJUnit5Extension.class)
@Execution(ExecutionMode.CONCURRENT)
class BadTests {

    private String sharedData;  // Shared mutable state!

    @Test
    void test1() {
        sharedData = "test1";  // Race condition!
    }

    @Test
    void test2() {
        sharedData = "test2";  // Race condition!
    }
}

// ✅ GOOD - Thread-safe
@ExtendWith(SerenityJUnit5Extension.class)
@Execution(ExecutionMode.CONCURRENT)
class GoodTests {

    @Test
    void test1() {
        String localData = "test1";  // Local variable - thread-safe
        // Use localData
    }

    @Test
    void test2() {
        String localData = "test2";  // Independent
        // Use localData
    }
}
```

## Complete Configuration Example

### Comprehensive junit-platform.properties

```properties
# ==========================================
# Parallel Execution
# ==========================================
junit.jupiter.execution.parallel.enabled=true
junit.jupiter.execution.parallel.mode.default=concurrent
junit.jupiter.execution.parallel.mode.classes.default=concurrent

# ==========================================
# Execution Strategy
# ==========================================
junit.jupiter.execution.parallel.config.strategy=dynamic
junit.jupiter.execution.parallel.config.dynamic.factor=1.0

# Alternative: Fixed strategy
# junit.jupiter.execution.parallel.config.strategy=fixed
# junit.jupiter.execution.parallel.config.fixed.parallelism=4
# junit.jupiter.execution.parallel.config.fixed.max-pool-size=8

# ==========================================
# Test Instance Lifecycle
# ==========================================
junit.jupiter.testinstance.lifecycle.default=per_method

# ==========================================
# Test Discovery
# ==========================================
junit.jupiter.testclass.order.default=org.junit.jupiter.api.ClassOrderer$Random

# ==========================================
# Display Names
# ==========================================
junit.jupiter.displayname.generator.default=org.junit.jupiter.api.DisplayNameGenerator$ReplaceUnderscores
```

## Maven Configuration

### Failsafe Plugin

Configure Maven Failsafe plugin for parallel execution:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-failsafe-plugin</artifactId>
    <version>3.0.0</version>
    <configuration>
        <!-- Enable JUnit 5 -->
        <includes>
            <include>**/*Test.java</include>
            <include>**/*Tests.java</include>
        </includes>

        <!-- System properties -->
        <systemPropertyVariables>
            <webdriver.driver>${webdriver.driver}</webdriver.driver>
            <environment>${environment}</environment>
        </systemPropertyVariables>

        <!-- Increase memory for parallel execution -->
        <argLine>-Xmx2g</argLine>
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

### Running from Command Line

```bash
# Run all tests in parallel
mvn clean verify

# Override parallelism
mvn clean verify -Djunit.jupiter.execution.parallel.config.fixed.parallelism=8

# Disable parallel execution
mvn clean verify -Djunit.jupiter.execution.parallel.enabled=false
```

## Gradle Configuration

```groovy
test {
    useJUnitPlatform()

    // Enable parallel execution
    maxParallelForks = Runtime.runtime.availableProcessors()

    // Increase memory
    minHeapSize = "512m"
    maxHeapSize = "2g"

    // System properties
    systemProperty 'junit.jupiter.execution.parallel.enabled', 'true'
    systemProperty 'junit.jupiter.execution.parallel.config.strategy', 'dynamic'
    systemProperty 'junit.jupiter.execution.parallel.config.dynamic.factor', '1.0'
}
```

## Performance Optimization

### 1. Choose the Right Strategy

**Small test suites** (&lt;30 tests):
```properties
junit.jupiter.execution.parallel.config.strategy=fixed
junit.jupiter.execution.parallel.config.fixed.parallelism=2
```

**Medium test suites** (30-100 tests):
```properties
junit.jupiter.execution.parallel.config.strategy=dynamic
junit.jupiter.execution.parallel.config.dynamic.factor=1.0
```

**Large test suites** (&gt;100 tests):
```properties
junit.jupiter.execution.parallel.config.strategy=dynamic
junit.jupiter.execution.parallel.config.dynamic.factor=0.75
```

### 2. Monitor Resource Usage

```bash
# Monitor while tests run
top
htop
jconsole
```

Watch for:
- **CPU**: Should be near 100% utilization
- **Memory**: Each browser instance uses ~200-500MB RAM
- **Threads**: Should match your parallelism setting

### 3. Optimize Test Design

```java
// ✅ GOOD - Fast, focused tests
@Test
void shouldCalculateTotal() {
    // No external dependencies, runs quickly
    assertThat(calculator.add(2, 3)).isEqualTo(5);
}

// ⚠️ SLOW - Consider optimization
@Test
void shouldProcessLargeDataset() {
    // Process 10000 records - consider using smaller dataset
}
```

### 4. Balance Thread Count

Too few threads:
```properties
# Underutilizing CPU
junit.jupiter.execution.parallel.config.dynamic.factor=0.25
```

Too many threads:
```properties
# May cause resource exhaustion
junit.jupiter.execution.parallel.config.dynamic.factor=4.0
```

Optimal:
```properties
# Matches CPU cores
junit.jupiter.execution.parallel.config.dynamic.factor=1.0
```

## Debugging Parallel Tests

### Temporarily Disable Parallelism

```properties
junit.jupiter.execution.parallel.enabled=false
```

Or via command line:
```bash
mvn verify -Djunit.jupiter.execution.parallel.enabled=false
```

### Run Single Test Class

```bash
mvn test -Dtest=MyTestClass
```

### Enable Verbose Logging

Add to `junit-platform.properties`:
```properties
# Show which thread runs which test
junit.platform.output.capture.stdout=true
junit.platform.output.capture.stderr=true
```

In your test:
```java
@BeforeEach
void logThread() {
    System.out.println("Running on: " + Thread.currentThread().getName());
}
```

## Common Issues and Solutions

### Issue 1: Flaky Tests

**Symptoms:** Tests pass individually but fail in parallel

**Solutions:**
- Check for shared mutable state
- Verify test data isolation
- Review resource locking
- Add proper synchronization

```java
// Problem: Shared state
private static int counter = 0;  // ❌ Not thread-safe

@Test
void incrementCounter() {
    counter++;  // Race condition
}

// Solution: Use atomic types or local variables
private static AtomicInteger counter = new AtomicInteger(0);  // ✅ Thread-safe

@Test
void incrementCounter() {
    counter.incrementAndGet();
}
```

### Issue 2: Resource Exhaustion

**Symptoms:** Tests slow down or fail after some time

**Solutions:**
- Reduce thread count
- Increase JVM heap size
- Check for resource leaks
- Monitor system resources

```xml
<!-- Increase heap size -->
<argLine>-Xmx4g</argLine>
```

### Issue 3: WebDriver Issues

**Symptoms:** Browser instances multiply or don't close

**Solutions:**
- Use `@Managed` WebDriver (Serenity handles lifecycle)
- Ensure proper cleanup in `@AfterEach`
- Limit concurrent browser instances

```java
// ✅ Serenity manages lifecycle
@Managed
WebDriver driver;

// ❌ Don't manage manually in parallel tests
WebDriver driver = new ChromeDriver();  // Memory leak risk
```

### Issue 4: Database Locks

**Symptoms:** Tests timeout waiting for database

**Solutions:**
- Use resource locks
- Isolate test data
- Use in-memory database for tests

```java
@Test
@ResourceLock("database")
void modifiesDatabase() {
    // Exclusive database access
}
```

## Best Practices

### 1. Start Small

Begin with 2-4 threads and gradually increase:

```properties
junit.jupiter.execution.parallel.config.strategy=fixed
junit.jupiter.execution.parallel.config.fixed.parallelism=2
```

### 2. Isolate Test Data

```java
@ExtendWith(SerenityJUnit5Extension.class)
class UserTests {

    @Test
    void createUser() {
        String uniqueId = UUID.randomUUID().toString();
        User user = createTestUser("user_" + uniqueId);
        // Test with unique user
    }
}
```

### 3. Use Tags for Selective Parallelism

```java
@Test
@Tag("parallel")
void canRunInParallel() { }

@Test
@Tag("serial")
@Execution(ExecutionMode.SAME_THREAD)
void mustRunSequentially() { }
```

```properties
# Run only parallel tests
junit.jupiter.includeTags=parallel
```

### 4. Clean Up Resources

```java
@AfterEach
void cleanup() {
    // Clean up test data
    testDataService.deleteTestData(testId);
}
```

### 5. Document Thread Safety

```java
/**
 * Tests in this class modify global application state
 * and must run sequentially.
 */
@Execution(ExecutionMode.SAME_THREAD)
class GlobalStateTests {
    // ...
}
```

## Measuring Performance

### Before Parallel Execution
```
Total tests: 150
Execution time: 25 minutes
```

### After Parallel Execution (8 threads)
```
Total tests: 150
Execution time: 4 minutes
Speedup: 6.25x
Efficiency: 78%
```

**Calculate metrics:**
```
Speedup = Sequential Time / Parallel Time
Efficiency = Speedup / Number of Threads × 100%
```

## Next Steps

- Return to the main [JUnit 5 Guide](junit5-tests)
- Learn about [Test Organization](junit5-tests#display-names-and-organization)
- Review [Best Practices](junit5-tests#best-practices)
- Explore [Serenity Reports](/docs/reporting/the_serenity_reports)

## Additional Resources

- [JUnit 5 Parallel Execution Docs](https://junit.org/junit5/docs/current/user-guide/#writing-tests-parallel-execution)
- [Serenity BDD Performance Tips](https://serenity-bdd.info)
- [Java Concurrency in Practice](https://jcip.net/)
