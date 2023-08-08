---
sidebar_position: 6
---

# How to Do Parallel Test Execution in Cucumber with Serenity

Cucumber 7 has introduced native support for parallel execution at both the feature and scenario levels. This parallel execution can provide significant performance improvements in test runs. If you want to harness these performance improvements and run your Serenity BDD features and scenarios in parallel, you will need to upgrade to JUnit 5.

## Pre-requisites

- **Cucumber 7.x**
- **Serenity BDD 3.9.8 or 4.0.x**
- **Maven 3.x** for building the project

Now, let's get started with the detailed step-by-step guide.

## Step 1: Update Serenity BDD to a Recent Version

Before proceeding, make sure that you have a recent version of Serenity BDD. Versions 3.9.8 or 4.0.x are recommended for best results.

You can check your current version in your `pom.xml` file or update it to the latest version.

## Step 2: Update to JUnit 5 in Your Maven Project

JUnit 5 provides the foundation for running tests in parallel with Cucumber and Serenity. Here's how you can update to JUnit 5 in your `pom.xml` file:

1. Open the `pom.xml` file in your Maven project.
2. Add the following dependencies for JUnit 5 and Cucumber 7.

    ```xml
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.junit</groupId>
                <artifactId>junit-bom</artifactId>
                <version>5.10.0</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
    <dependencies>
        ...
        <!-- JUNIT 5 Dependencies -->
        <dependency>
            <groupId>org.junit.platform</groupId>
            <artifactId>junit-platform-launcher</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.junit.platform</groupId>
            <artifactId>junit-platform-suite</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-engine</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>io.cucumber</groupId>
            <artifactId>cucumber-junit-platform-engine</artifactId>
            <version>7.2.3</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
    ```

More details on JUnit 5 and Maven can be found in the [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/#running-tests-build-maven).

## Step 3: Create a `junit-platform.properties` File

Create a new file named `junit-platform.properties` in your `src/test/resources` folder. This file enables and configures parallel execution.

Add the following content to the file:

```properties
cucumber.execution.parallel.enabled=true
cucumber.execution.parallel.config.strategy=dynamic
cucumber.plugin=io.cucumber.core.plugin.SerenityReporterParallel
```

These properties enable parallel execution and configure it to use a dynamic strategy, along with the Serenity reporter for parallel execution.

## Step 4: Create a `cucumber.properties` File

Create a new file named `cucumber.properties` in your `src/test/resources` folder. This file will contain the Cucumber options for your Cucumber tests.

Add the following content to the file:

```properties
cucumber.execution.order = random
cucumber.plugin=pretty,json:target/cucumber.json,timeline:target/test-results/timeline
cucumber.snippet-type=camelcase
```

You can find more details on Cucumber configuration options in the [Cucumber documentation](https://cucumber.io/docs/cucumber/api/?lang=java#list-configuration-options).

## Step 5: Update Your Cucumber Runner Class

You should have a single runner class for your whole test suite. Update it as follows:

```java
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("/features")
public class AcceptanceTestSuite {}
```

This runner class will include all the features in the `/features` directory and run them using the Cucumber engine.

## Conclusion

That's it! By following these steps, you can leverage the power of parallel execution with Cucumber and Serenity BDD. This will significantly reduce the execution time of your test suite, leading to faster feedback and more efficient development cycles.

Happy testing! 🚀