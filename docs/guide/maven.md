---
id: maven
title: Using Maven with Serenity
sidebar_position: 3
---
# Integrating Serenity BDD into a Maven project

Maven is the recommended build tool for Serenity BDD.

You can add Serenity BDD to an existing Maven project by adding the corresponding dependencies to your `pom.xml` file.

## Using the Serenity BDD BOM (Recommended)

The simplest way to manage Serenity BDD dependencies is to use the **Bill of Materials (BOM)**. The BOM ensures that all Serenity modules use the same version, so you don't need to specify version numbers on each individual dependency.

Add the BOM to your `<dependencyManagement>` section:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-bom</artifactId>
            <version>5.3.7</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

Then declare your Serenity dependencies **without version tags**:

```xml
<dependencies>
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-core</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-junit5</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-screenplay-webdriver</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-ensure</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

:::tip Upgrading
When a new version of Serenity BDD is released, you only need to update the single version number in the BOM import. All module versions will be updated automatically.
:::

## Managing Versions Manually

If you prefer not to use the BOM, you can manage versions manually by defining them in your properties section:

```xml
<properties>
    <serenity.version>5.3.7</serenity.version>
    <junit5.version>6.0.3</junit5.version>
    <cucumber.version>7.34.2</cucumber.version>
</properties>
```

## Core Dependencies

All Serenity BDD projects need the following core dependency:

```
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-core</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
```

You will also need a test runner, which will usually be either JUnit 5 (recommended) or Cucumber. Note that JUnit 4 is deprecated as of Serenity 5.0.0.

## Serenity JUnit 5 Dependencies (Recommended)
To use JUnit 5 you will need the following dependency:

```
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-junit5</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
```

You will also need the JUnit 5 dependencies, e.g.
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

## Serenity JUnit 4 Dependencies (Deprecated)

:::warning JUnit 4 Deprecated
JUnit 4 support is deprecated as of Serenity 5.0.0 and will be removed in Serenity 6.0.0. Please migrate to JUnit 5 (see above).
:::

If you're still using JUnit 4, you will need the following dependency:

```
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-junit</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
```

## Serenity Cucumber Dependencies

For Cucumber you will need the following dependency:

```
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-cucumber</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
```

Since Serenity relies on a specific version of the Cucumber APIs, we recommend using the same version of the Cucumber libraries.

Cucumber requires a test runner, preferably JUnit 5 (JUnit 4 is deprecated).

## Cucumber with JUnit 5 Dependencies (Recommended)
To use JUnit 5 you will need the following dependency:

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

See cucumber-junit-platform-engine documentation on using junit-platform-suite to pilot cucumber: https://github.com/cucumber/cucumber-jvm/tree/main/junit-platform-engine#suites-with-different-configurations, and https://github.com/serenity-bdd/serenity-cucumber-starter for a running example.

## Cucumber with JUnit 4 Dependencies (Deprecated)

:::warning JUnit 4 Deprecated
JUnit 4 Cucumber runners are deprecated as of Serenity 5.0.0 and will be removed in Serenity 6.0.0. Please migrate to JUnit 5 (see above).
:::

If you're still using JUnit 4 with Cucumber, you will need the following dependency:

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
If you are using the Screenplay pattern, you will also need the Screenplay dependencies:
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

## Running Tests with Maven Failsafe

Serenity tests are integration tests and should be run using the Maven Failsafe plugin. The basic configuration is straightforward:

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

### Running JUnit 5 and Cucumber Tests Together

If your project contains both JUnit 5 tests and Cucumber tests, you may encounter a problem where only Cucumber tests are discovered and run. This happens because when Cucumber uses the `cucumber.features` property (either via `@ConfigurationParameter` or `junit-platform.properties`), it causes other JUnit Platform discovery selectors to be ignored.

You'll see a warning like this:

```
WARNING: TestEngine with ID 'cucumber' encountered a non-critical issue during test discovery:
Discovering tests using the cucumber.features property. Other discovery selectors are ignored!
```

**The solution** is to configure separate Failsafe executions for JUnit 5 and Cucumber tests:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-failsafe-plugin</artifactId>
    <version>3.5.2</version>
    <executions>
        <!-- Execution for JUnit Jupiter tests (excludes Cucumber) -->
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
        <!-- Execution for Cucumber tests -->
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
        <!-- Verify phase (runs once after all tests) -->
        <execution>
            <id>verify</id>
            <goals>
                <goal>verify</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

This configuration:
- Runs JUnit Jupiter tests first (all `*Test.java` files except the Cucumber suite)
- Runs Cucumber tests separately via the `CucumberTestSuite` class
- Runs the verify goal once at the end to check for failures

:::tip Naming Convention
Adjust the `<include>` and `<exclude>` patterns to match your test class naming conventions. For example, if your Cucumber suite is named `CucumberIT.java`, update the patterns accordingly.
:::

## The Serenity Maven Plugin

If you want to generate the Serenity reports whenever you run `mvn verify`, you can use the `serenity-maven-plugin` to do that:
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

By default, the `aggregate` goal will NOT fail the build if there are test failures - it will simply generate the reports. This way you can aggregate multiple report sets and then check for failures at the end using `mvn serenity:check`.

## Checking Gherkin feature files

Some errors in Gherkin feature files can cause the Serenity reports to behave unpredictably. For this reason, the following rules should be followed when working with Cucumber and Serenity:
  - Scenario names should be unique within a feature file
  - Scenario, Rule and Feature names should not be blank
  - Feature names should be unique wherever possible. In particular features with the same name, inside directories with identical names, will not appear correctly in the Serenity reports.

  You can check these rules before you run the full test by calling the `check-gherkin` goal, e.g.

```
mvn serenity:check-gherkin  
```

You can ensure that your feature files are correctly configured before kicking off your tests by binding the `check-gherkin` goal to the `process-test-resources` lifecycle phase, as shown here:

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

## Complete Example: JUnit 5 with BOM

Here is a complete `pom.xml` for a Serenity BDD project using JUnit 5, the Screenplay pattern, and the BOM:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>my-serenity-project</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <serenity.version>5.3.7</serenity.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>net.serenity-bdd</groupId>
                <artifactId>serenity-bom</artifactId>
                <version>${serenity.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <!-- Serenity core and JUnit 5 runner -->
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-core</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-junit5</artifactId>
            <scope>test</scope>
        </dependency>

        <!-- Screenplay pattern -->
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-screenplay</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-screenplay-webdriver</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-ensure</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
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
            <plugin>
                <groupId>net.serenity-bdd.maven.plugins</groupId>
                <artifactId>serenity-maven-plugin</artifactId>
                <version>${serenity.version}</version>
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
        </plugins>
    </build>
</project>
```

## Complete Example: Cucumber with BOM

Here is a complete `pom.xml` for a Serenity BDD project using Cucumber, JUnit 5, and the BOM:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>my-serenity-cucumber-project</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <serenity.version>5.3.7</serenity.version>
        <cucumber.version>7.34.2</cucumber.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>net.serenity-bdd</groupId>
                <artifactId>serenity-bom</artifactId>
                <version>${serenity.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <!-- Serenity core and Cucumber integration -->
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-core</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-cucumber</artifactId>
            <scope>test</scope>
        </dependency>

        <!-- Screenplay pattern -->
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-screenplay</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-screenplay-webdriver</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-ensure</artifactId>
            <scope>test</scope>
        </dependency>

        <!-- Cucumber JUnit 5 runner -->
        <dependency>
            <groupId>io.cucumber</groupId>
            <artifactId>cucumber-junit-platform-engine</artifactId>
            <version>${cucumber.version}</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.junit.platform</groupId>
            <artifactId>junit-platform-suite</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-failsafe-plugin</artifactId>
                <version>3.5.2</version>
                <configuration>
                    <includes>
                        <include>**/CucumberTestSuite.java</include>
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
            <plugin>
                <groupId>net.serenity-bdd.maven.plugins</groupId>
                <artifactId>serenity-maven-plugin</artifactId>
                <version>${serenity.version}</version>
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
        </plugins>
    </build>
</project>
```

## Available BOM Modules

The `serenity-bom` includes version-managed entries for all published Serenity BDD modules:

| Category | Modules |
| -------- | ------- |
| **Core** | `serenity-core`, `serenity-model`, `serenity-report-resources` |
| **Test Runners** | `serenity-junit5`, `serenity-junit` (deprecated), `serenity-cucumber` |
| **Screenplay** | `serenity-screenplay`, `serenity-screenplay-webdriver`, `serenity-screenplay-rest`, `serenity-screenplay-playwright` |
| **Assertions** | `serenity-ensure`, `serenity-assertions` |
| **REST** | `serenity-rest-assured` |
| **Reporting** | `serenity-reports`, `serenity-single-page-report`, `serenity-json-summary-report`, `serenity-navigator-report` |
| **Integrations** | `serenity-spring`, `serenity-playwright` |
| **Cloud Providers** | `serenity-browserstack`, `serenity-saucelabs`, `serenity-lambdatest`, `serenity-selenoid`, `serenity-bitbar`, `serenity-zalenium`, `serenity-crossbrowsertesting` |
| **Tools** | `serenity-browsermob-plugin`, `serenity-shutterbug`, `serenity-cli`, `serenity-ant-task` |
| **JIRA** | `serenity-jira-plugin`, `serenity-jira-requirements-provider` |