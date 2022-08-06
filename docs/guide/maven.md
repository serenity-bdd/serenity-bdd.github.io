---
id: maven
title: Using Maven with Serenity
sidebar_position: 3
---
# Integrating Serenity BDD into a Maven project

Maven is the recommended build tool for Serenity BDD.

You can add Serenity BDD to an existing Maven project by adding the corresponding dependencies to your `pom.xml` file. All Serenity BDD projects need the following core dependency:

```
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-core</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
```

You will also need a test runner, which will usually be either JUnit 4, JUnit 5 or Cucumber.

## Serenity JUnit 4 Dependencies
To use JUnit 4 you will need the following dependency:

```
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-junit</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
```

## Serenity JUnit 5 Dependencies
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

Cucumber requires a test runner, either JUnit 4 or JUnit 5.

## Cucumber with JUnit 4 Dependencies
To use JUnit 4 you will need the following dependency:

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

## Cucumber with JUnit 5 Dependencies
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
            </goals>
        </execution>
    </executions>
</plugin>
```
