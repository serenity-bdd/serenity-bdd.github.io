---
id: cicd-integration
title: Integración de CI/CD con Serenity BDD
sidebar_position: 6
---

# Integración de CI/CD con Serenity BDD

Esta guía te muestra cómo integrar pruebas de Serenity BDD en plataformas populares de CI/CD, incluyendo GitHub Actions, Jenkins y GitLab CI. Aprende a ejecutar pruebas automáticamente, publicar reportes y obtener retroalimentación rápida sobre los cambios en tu código.

## Prerrequisitos

- Proyecto de Serenity BDD configurado con Maven o Gradle
- Repositorio con control de versiones (Git)
- Acceso a una plataforma de CI/CD

## Lista de verificación para inicio rápido

Antes de configurar CI/CD, asegúrate de que tu proyecto:
- Ejecuta correctamente de forma local con `mvn clean verify` o `gradle clean test`
- Tiene todas las dependencias correctamente configuradas
- Usa el modo headless del navegador para pruebas web
- Tiene tiempos de espera razonables para la ejecución de pruebas
- Genera reportes de Serenity en `target/site/serenity` (Maven) o `build/reports/serenity` (Gradle)

## GitHub Actions

GitHub Actions es la forma más fácil de configurar CI/CD para proyectos alojados en GitHub.

### Configuración básica

Crea `.github/workflows/serenity-tests.yml` en tu repositorio:

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

### Versión para Gradle

Para proyectos con Gradle:

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

### Publicación de reportes en GitHub Pages

Publica automáticamente los reportes de Serenity como un sitio web:

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

**Accede a tus reportes en:** `https://<username>.github.io/<repository>/reports/<run-number>`

### Ejecución paralela en GitHub Actions

Ejecuta pruebas en paralelo usando una estrategia de matriz:

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

### Configuración avanzada con variables de entorno

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

### Notificaciones

Envía notificaciones a Slack sobre los resultados de las pruebas:

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

Jenkins es una plataforma de CI/CD autoalojada muy popular con amplio soporte de plugins.

### Pipeline declarativo

Crea un `Jenkinsfile` en la raíz de tu repositorio:

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

### Pipeline para Gradle

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

### Ejecución paralela en Jenkins

Ejecuta pruebas en paralelo a través de múltiples nodos:

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

### Configuración de Jenkins con parámetros

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

### Instalación de plugins de Jenkins

Plugins requeridos:
```bash
# Instala mediante CLI de Jenkins o la interfaz de usuario
- HTML Publisher Plugin
- JUnit Plugin
- Pipeline Plugin
- Git Plugin
- Email Extension Plugin
```

## GitLab CI

GitLab CI está integrado directamente en los repositorios de GitLab.

### Configuración básica

Crea `.gitlab-ci.yml` en la raíz de tu repositorio:

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

**Los reportes estarán disponibles en:** `https://<username>.gitlab.io/<project>/`

### Versión para Gradle

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

### Múltiples entornos

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

### Jobs paralelos

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

Para proyectos alojados en Azure DevOps:

Crea `azure-pipelines.yml`:

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

## Integración con Docker

Ejecuta pruebas en contenedores Docker para mayor consistencia.

### Dockerfile para pruebas

```dockerfile
FROM maven:3.9-eclipse-temurin-17

# Instalar Chrome
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

### GitHub Actions con Docker

```yaml
- name: Build and run tests in Docker
  run: |
    docker build -t serenity-tests .
    docker run --rm -v $PWD/target:/app/target serenity-tests
```

## Mejores prácticas

### 1. Usa navegadores en modo headless

Configura el modo headless para entornos CI:

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

### 2. Optimiza los tiempos de compilación

**Almacena dependencias en caché:**
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

**Omite fases innecesarias:**
```bash
mvn verify -DskipTests  # Omitir ejecución de pruebas
mvn verify -Dmaven.test.skip=true  # Omitir compilación de pruebas
```

### 3. Falla rápido

Configura las compilaciones para fallar rápidamente ante errores críticos:

```yaml
strategy:
  fail-fast: true  # Detener todos los jobs si uno falla
```

### 4. Ejecución basada en etiquetas

Ejecuta diferentes suites de pruebas en diferentes pipelines:

```bash
# Pruebas de humo en cada commit
mvn verify -Dcucumber.filter.tags="@smoke"

# Regresión completa en la rama main
mvn verify -Dcucumber.filter.tags="@regression"
```

### 5. Separa las etapas de pruebas

```yaml
stages:
  - unit-tests
  - integration-tests
  - smoke-tests
  - regression-tests
```

### 6. Gestiona los secretos de forma segura

Nunca hagas commit de credenciales:
```yaml
# GitHub Actions
env:
  API_KEY: ${{ secrets.API_KEY }}

# GitLab CI
variables:
  API_KEY: ${{ secrets.API_KEY }}
```

### 7. Reintenta pruebas inestables

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

### 8. Genera insignias de estado del build

Agrega insignias de estado a tu README:

**GitHub Actions:**
```markdown
![Tests](https://github.com/username/repo/actions/workflows/serenity-tests.yml/badge.svg)
```

**GitLab CI:**
```markdown
![pipeline status](https://gitlab.com/username/project/badges/main/pipeline.svg)
```

## Solución de problemas

### Problema: Las pruebas fallan solo en CI

**Causas comunes:**
- Navegador no instalado o versión incompatible
- Servidor de pantalla ausente (X11)
- Memoria insuficiente
- Problemas de red/firewall

**Soluciones:**
```yaml
# Agregar servidor de pantalla para Linux
before_script:
  - export DISPLAY=:99
  - Xvfb :99 -screen 0 1920x1080x24 &

# Aumentar memoria
env:
  MAVEN_OPTS: "-Xmx2g"
```

### Problema: Los reportes no se publican

**Verifica:**
- Ruta correcta al directorio de reportes
- La condición `if: always()` está configurada
- Permisos suficientes

### Problema: Compilaciones lentas

**Soluciones:**
- Almacena dependencias en caché
- Usa ejecución paralela
- Ejecuta un subconjunto de pruebas (primero las pruebas de humo)
- Usa caché de capas de Docker

## Ejemplo completo: GitHub Actions con todas las funcionalidades

```yaml
name: Serenity BDD - Production Ready

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * *'  # Diariamente a las 2 AM
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

## Siguientes pasos

- Aprende sobre [Ejecución Paralela](/docs/junit5/parallel-execution) para acelerar las compilaciones de CI
- Explora [Pruebas basadas en datos](/docs/tutorials/data-driven-testing) para una cobertura de pruebas integral
- Consulta [Configuración de Serenity](/docs/reference/serenity-properties) para optimizar el rendimiento en CI

## Recursos adicionales

- [Documentación de GitHub Actions](https://docs.github.com/en/actions)
- [Documentación de Jenkins Pipeline](https://www.jenkins.io/doc/book/pipeline/)
- [Documentación de GitLab CI/CD](https://docs.gitlab.com/ee/ci/)
- [Serenity BDD en Docker Hub](https://hub.docker.com/r/serenity)
