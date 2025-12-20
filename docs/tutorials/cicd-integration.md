---
id: cicd-integration
title: CI/CD Integration with Serenity BDD
sidebar_position: 6
---

# CI/CD Integration with Serenity BDD

This guide shows you how to integrate Serenity BDD tests into popular CI/CD platforms, including GitHub Actions, Jenkins, and GitLab CI. Learn how to run tests automatically, publish reports, and get fast feedback on your code changes.

## Prerequisites

- Serenity BDD project configured with Maven or Gradle
- Version control repository (Git)
- Access to a CI/CD platform

## Quick Start Checklist

Before setting up CI/CD, ensure your project:
- ✅ Runs successfully locally with `mvn clean verify` or `gradle clean test`
- ✅ Has all dependencies properly configured
- ✅ Uses headless browser mode for web tests
- ✅ Has reasonable test execution timeouts
- ✅ Generates Serenity reports in `target/site/serenity` (Maven) or `build/reports/serenity` (Gradle)

## GitHub Actions

GitHub Actions is the easiest way to set up CI/CD for projects hosted on GitHub.

### Basic Setup

Create `.github/workflows/serenity-tests.yml` in your repository:

```yaml
name: Serenity BDD Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: 'maven'

    - name: Run Serenity tests
      run: mvn clean verify

    - name: Publish Serenity Report
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: serenity-report
        path: target/site/serenity
        retention-days: 30
```

### Gradle Version

For Gradle projects:

```yaml
name: Serenity BDD Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: 'gradle'

    - name: Run Serenity tests
      run: ./gradlew clean test aggregate

    - name: Publish Serenity Report
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: serenity-report
        path: build/reports/serenity
        retention-days: 30
```

### Publishing Reports to GitHub Pages

Automatically publish Serenity reports as a website:

```yaml
name: Serenity Tests with GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: write
  pages: write
  id-token: write

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: 'maven'

    - name: Run Serenity tests
      run: mvn clean verify

    - name: Deploy to GitHub Pages
      if: always()
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./target/site/serenity
        destination_dir: reports/${{ github.run_number }}
```

**Access your reports at:** `https://<username>.github.io/<repository>/reports/<run-number>`

### Parallel Execution in GitHub Actions

Run tests in parallel using a matrix strategy:

```yaml
name: Serenity Parallel Tests

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chrome, firefox, edge]
        test-suite: [smoke, regression]
      fail-fast: false

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: 'maven'

    - name: Run tests
      run: mvn verify -Dwebdriver.driver=${{ matrix.browser }} -Dtags=${{ matrix.test-suite }}

    - name: Upload Report
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: report-${{ matrix.browser }}-${{ matrix.test-suite }}
        path: target/site/serenity
```

### Advanced Configuration with Environment Variables

```yaml
name: Serenity Tests - All Environments

on:
  push:
    branches: [ main ]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to test'
        required: true
        type: choice
        options:
          - dev
          - staging
          - production

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: 'maven'

    - name: Run tests
      env:
        BASE_URL: ${{ secrets[format('{0}_BASE_URL', github.event.inputs.environment || 'dev')] }}
        API_KEY: ${{ secrets[format('{0}_API_KEY', github.event.inputs.environment || 'dev')] }}
        TEST_USER: ${{ secrets.TEST_USER }}
        TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
      run: |
        mvn clean verify \
          -Dwebdriver.base.url=$BASE_URL \
          -Dapi.key=$API_KEY \
          -Dtest.user=$TEST_USER \
          -Dtest.password=$TEST_PASSWORD

    - name: Upload Report
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: serenity-report-${{ github.event.inputs.environment || 'dev' }}
        path: target/site/serenity
```

### Notifications

Send Slack notifications on test results:

```yaml
    - name: Notify Slack on Success
      if: success()
      uses: slackapi/slack-github-action@v1
      with:
        webhook-url: ${{ secrets.SLACK_WEBHOOK }}
        payload: |
          {
            "text": "✅ Serenity Tests Passed - Build #${{ github.run_number }}"
          }

    - name: Notify Slack on Failure
      if: failure()
      uses: slackapi/slack-github-action@v1
      with:
        webhook-url: ${{ secrets.SLACK_WEBHOOK }}
        payload: |
          {
            "text": "❌ Serenity Tests Failed - Build #${{ github.run_number }}\nView: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
          }
```

## Jenkins

Jenkins is a popular self-hosted CI/CD platform with extensive plugin support.

### Declarative Pipeline

Create a `Jenkinsfile` in your repository root:

```groovy
pipeline {
    agent any

    tools {
        maven 'Maven-3.9'
        jdk 'JDK-17'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build and Test') {
            steps {
                sh 'mvn clean verify'
            }
        }

        stage('Publish Reports') {
            steps {
                publishHTML([
                    reportDir: 'target/site/serenity',
                    reportFiles: 'index.html',
                    reportName: 'Serenity Report',
                    keepAll: true,
                    alwaysLinkToLastBuild: true,
                    allowMissing: false
                ])
            }
        }
    }

    post {
        always {
            junit '**/target/failsafe-reports/*.xml'
            archiveArtifacts artifacts: 'target/site/serenity/**/*', allowEmptyArchive: true
        }
        failure {
            emailext(
                subject: "Failed: ${currentBuild.fullDisplayName}",
                body: "Test execution failed. Check console output at ${env.BUILD_URL}",
                to: 'team@example.com'
            )
        }
    }
}
```

### Gradle Pipeline

```groovy
pipeline {
    agent any

    tools {
        gradle 'Gradle-8'
        jdk 'JDK-17'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build and Test') {
            steps {
                sh './gradlew clean test aggregate'
            }
        }

        stage('Publish Reports') {
            steps {
                publishHTML([
                    reportDir: 'build/reports/serenity',
                    reportFiles: 'index.html',
                    reportName: 'Serenity Report',
                    keepAll: true,
                    alwaysLinkToLastBuild: true
                ])
            }
        }
    }

    post {
        always {
            junit '**/build/test-results/test/*.xml'
        }
    }
}
```

### Parallel Execution in Jenkins

Run tests in parallel across multiple nodes:

```groovy
pipeline {
    agent none

    stages {
        stage('Parallel Tests') {
            parallel {
                stage('Chrome Tests') {
                    agent { label 'chrome' }
                    steps {
                        sh 'mvn verify -Dwebdriver.driver=chrome'
                    }
                }
                stage('Firefox Tests') {
                    agent { label 'firefox' }
                    steps {
                        sh 'mvn verify -Dwebdriver.driver=firefox'
                    }
                }
                stage('Edge Tests') {
                    agent { label 'edge' }
                    steps {
                        sh 'mvn verify -Dwebdriver.driver=edge'
                    }
                }
            }
        }

        stage('Aggregate Reports') {
            agent any
            steps {
                publishHTML([
                    reportDir: 'target/site/serenity',
                    reportFiles: 'index.html',
                    reportName: 'Consolidated Serenity Report'
                ])
            }
        }
    }
}
```

### Jenkins Configuration with Parameters

```groovy
pipeline {
    agent any

    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'staging', 'production'],
            description: 'Environment to test'
        )
        choice(
            name: 'BROWSER',
            choices: ['chrome', 'firefox', 'edge'],
            description: 'Browser to use'
        )
        string(
            name: 'TAGS',
            defaultValue: '',
            description: 'Tags to filter tests (e.g., @smoke, @regression)'
        )
    }

    stages {
        stage('Test') {
            steps {
                script {
                    def baseUrl = ""
                    switch(params.ENVIRONMENT) {
                        case 'dev':
                            baseUrl = 'https://dev.example.com'
                            break
                        case 'staging':
                            baseUrl = 'https://staging.example.com'
                            break
                        case 'production':
                            baseUrl = 'https://www.example.com'
                            break
                    }

                    sh """
                        mvn clean verify \
                        -Dwebdriver.driver=${params.BROWSER} \
                        -Dwebdriver.base.url=${baseUrl} \
                        -Dcucumber.filter.tags='${params.TAGS}'
                    """
                }
            }
        }
    }
}
```

### Installing Jenkins Plugins

Required plugins:
```bash
# Install via Jenkins CLI or UI
- HTML Publisher Plugin
- JUnit Plugin
- Pipeline Plugin
- Git Plugin
- Email Extension Plugin
```

## GitLab CI

GitLab CI is integrated directly into GitLab repositories.

### Basic Configuration

Create `.gitlab-ci.yml` in your repository root:

```yaml
image: maven:3.9-eclipse-temurin-17

stages:
  - test
  - report

variables:
  MAVEN_OPTS: "-Dmaven.repo.local=$CI_PROJECT_DIR/.m2/repository"

cache:
  paths:
    - .m2/repository

test:
  stage: test
  script:
    - mvn clean verify
  artifacts:
    when: always
    paths:
      - target/site/serenity
    expire_in: 30 days
    reports:
      junit:
        - target/failsafe-reports/TEST-*.xml

pages:
  stage: report
  script:
    - mkdir -p public
    - cp -r target/site/serenity/* public/
  artifacts:
    paths:
      - public
  only:
    - main
```

**Reports will be available at:** `https://<username>.gitlab.io/<project>/`

### Gradle Version

```yaml
image: gradle:8-jdk17

stages:
  - test
  - report

variables:
  GRADLE_OPTS: "-Dorg.gradle.daemon=false"

cache:
  paths:
    - .gradle

test:
  stage: test
  script:
    - gradle clean test aggregate
  artifacts:
    when: always
    paths:
      - build/reports/serenity
    expire_in: 30 days
    reports:
      junit:
        - build/test-results/test/TEST-*.xml

pages:
  stage: report
  script:
    - mkdir -p public
    - cp -r build/reports/serenity/* public/
  artifacts:
    paths:
      - public
  only:
    - main
```

### Multiple Environments

```yaml
stages:
  - test

.test_template:
  image: maven:3.9-eclipse-temurin-17
  script:
    - mvn clean verify -Dwebdriver.base.url=$BASE_URL
  artifacts:
    when: always
    paths:
      - target/site/serenity
    expire_in: 7 days

test:dev:
  extends: .test_template
  variables:
    BASE_URL: "https://dev.example.com"
  only:
    - develop

test:staging:
  extends: .test_template
  variables:
    BASE_URL: "https://staging.example.com"
  only:
    - staging

test:production:
  extends: .test_template
  variables:
    BASE_URL: "https://www.example.com"
  only:
    - main
  when: manual
```

### Parallel Jobs

```yaml
test:
  stage: test
  parallel:
    matrix:
      - BROWSER: [chrome, firefox]
        SUITE: [smoke, regression]
  script:
    - mvn verify -Dwebdriver.driver=$BROWSER -Dtags=@$SUITE
  artifacts:
    when: always
    paths:
      - target/site/serenity
    reports:
      junit:
        - target/failsafe-reports/TEST-*.xml
```

## Azure Pipelines

For projects hosted on Azure DevOps:

Create `azure-pipelines.yml`:

```yaml
trigger:
  - main
  - develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  MAVEN_CACHE_FOLDER: $(Pipeline.Workspace)/.m2/repository
  MAVEN_OPTS: '-Dmaven.repo.local=$(MAVEN_CACHE_FOLDER)'

steps:
- task: JavaToolInstaller@0
  inputs:
    versionSpec: '17'
    jdkArchitectureOption: 'x64'
    jdkSourceOption: 'PreInstalled'

- task: Cache@2
  inputs:
    key: 'maven | "$(Agent.OS)" | **/pom.xml'
    path: $(MAVEN_CACHE_FOLDER)
  displayName: Cache Maven packages

- task: Maven@3
  inputs:
    mavenPomFile: 'pom.xml'
    goals: 'clean verify'
    options: '-B'
  displayName: 'Run Serenity Tests'

- task: PublishTestResults@2
  condition: always()
  inputs:
    testResultsFormat: 'JUnit'
    testResultsFiles: '**/target/failsafe-reports/TEST-*.xml'
    testRunTitle: 'Serenity Test Results'

- task: PublishBuildArtifacts@1
  condition: always()
  inputs:
    PathtoPublish: 'target/site/serenity'
    ArtifactName: 'serenity-report'
  displayName: 'Publish Serenity Report'
```

## Docker Integration

Run tests in Docker containers for consistency.

### Dockerfile for Tests

```dockerfile
FROM maven:3.9-eclipse-temurin-17

# Install Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src

CMD ["mvn", "clean", "verify"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  serenity-tests:
    build: .
    volumes:
      - ./target:/app/target
    environment:
      - WEBDRIVER_DRIVER=chrome
      - WEBDRIVER_BASE_URL=https://example.com
```

### GitHub Actions with Docker

```yaml
- name: Build and run tests in Docker
  run: |
    docker build -t serenity-tests .
    docker run --rm -v $PWD/target:/app/target serenity-tests
```

## Best Practices

### 1. Use Headless Browsers

Configure headless mode for CI environments:

**serenity.conf:**
```hocon
webdriver {
  driver = chrome
  capabilities {
    browserName = "chrome"
    "goog:chromeOptions" {
      args = ["--headless", "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"]
    }
  }
}
```

### 2. Optimize Build Times

**Cache dependencies:**
```yaml
# GitHub Actions
- uses: actions/cache@v3
  with:
    path: ~/.m2/repository
    key: ${{ runner.os }}-maven-${{ hashFiles('**/pom.xml') }}

# GitLab CI
cache:
  paths:
    - .m2/repository
```

**Skip unnecessary phases:**
```bash
mvn verify -DskipTests  # Skip test execution
mvn verify -Dmaven.test.skip=true  # Skip test compilation
```

### 3. Fail Fast

Configure builds to fail fast on critical errors:

```yaml
strategy:
  fail-fast: true  # Stop all jobs if one fails
```

### 4. Tag-Based Execution

Run different test suites in different pipelines:

```bash
# Smoke tests on every commit
mvn verify -Dcucumber.filter.tags="@smoke"

# Full regression on main branch
mvn verify -Dcucumber.filter.tags="@regression"
```

### 5. Separate Test Stages

```yaml
stages:
  - unit-tests
  - integration-tests
  - smoke-tests
  - regression-tests
```

### 6. Manage Secrets Securely

Never commit credentials:
```yaml
# GitHub Actions
env:
  API_KEY: ${{ secrets.API_KEY }}

# GitLab CI
variables:
  API_KEY: ${{ secrets.API_KEY }}
```

### 7. Retry Flaky Tests

```groovy
// Jenkins
retry(3) {
    sh 'mvn verify'
}
```

```yaml
# GitLab CI
test:
  retry:
    max: 2
    when: runner_system_failure
```

### 8. Generate Build Badges

Add status badges to your README:

**GitHub Actions:**
```markdown
![Tests](https://github.com/username/repo/actions/workflows/serenity-tests.yml/badge.svg)
```

**GitLab CI:**
```markdown
![pipeline status](https://gitlab.com/username/project/badges/main/pipeline.svg)
```

## Troubleshooting

### Issue: Tests fail only in CI

**Common causes:**
- Browser not installed or incompatible version
- Missing display server (X11)
- Insufficient memory
- Network/firewall issues

**Solutions:**
```yaml
# Add display server for Linux
before_script:
  - export DISPLAY=:99
  - Xvfb :99 -screen 0 1920x1080x24 &

# Increase memory
env:
  MAVEN_OPTS: "-Xmx2g"
```

### Issue: Reports not publishing

**Check:**
- Correct path to report directory
- `if: always()` condition is set
- Sufficient permissions

### Issue: Slow builds

**Solutions:**
- Cache dependencies
- Use parallel execution
- Run subset of tests (smoke tests first)
- Use Docker layer caching

## Complete Example: GitHub Actions with All Features

```yaml
name: Serenity BDD - Production Ready

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:

env:
  JAVA_VERSION: '17'
  MAVEN_OPTS: '-Xmx2g'

jobs:
  smoke-tests:
    name: Smoke Tests
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Set up JDK
      uses: actions/setup-java@v4
      with:
        java-version: ${{ env.JAVA_VERSION }}
        distribution: 'temurin'
        cache: 'maven'

    - name: Run smoke tests
      run: mvn verify -Dcucumber.filter.tags="@smoke"

    - name: Upload smoke test report
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: smoke-test-report
        path: target/site/serenity

  regression-tests:
    name: Regression Tests
    runs-on: ubuntu-latest
    needs: smoke-tests
    if: github.ref == 'refs/heads/main'

    strategy:
      matrix:
        browser: [chrome, firefox]
      fail-fast: false

    steps:
    - uses: actions/checkout@v4

    - name: Set up JDK
      uses: actions/setup-java@v4
      with:
        java-version: ${{ env.JAVA_VERSION }}
        distribution: 'temurin'
        cache: 'maven'

    - name: Run regression tests
      run: mvn verify -Dwebdriver.driver=${{ matrix.browser }}

    - name: Upload report
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: report-${{ matrix.browser }}
        path: target/site/serenity

  publish-report:
    name: Publish Report to GitHub Pages
    runs-on: ubuntu-latest
    needs: [smoke-tests, regression-tests]
    if: always() && github.ref == 'refs/heads/main'

    permissions:
      contents: write
      pages: write

    steps:
    - uses: actions/download-artifact@v4
      with:
        name: smoke-test-report
        path: reports/smoke

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./reports
```

## Next Steps

- Learn about [Parallel Execution](/docs/junit5/parallel-execution) to speed up CI builds
- Explore [Data-Driven Testing](/docs/tutorials/data-driven-testing) for comprehensive test coverage
- Check [Serenity Configuration](/docs/reference/serenity-properties) for optimizing CI performance

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Serenity BDD on Docker Hub](https://hub.docker.com/r/serenity)
