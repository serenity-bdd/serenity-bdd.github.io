---
id: maven
title: Using Maven with Serenity
sidebar_position: 3
---
# Integrating Serenity BDD into a Maven project

Maven is the recommended build tool for Serenity BDD.

You can add Serenity BDD to an existing Maven project by adding the corresponding dependencies to your `pom.xml` file.

## Recommended Versions

First, define the recommended versions in your properties section:

```xml
<properties>
    <serenity.version>5.0.2</serenity.version>
    <junit5.version>6.0.1</junit5.version>
    <cucumber.version>7.33.0</cucumber.version>
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