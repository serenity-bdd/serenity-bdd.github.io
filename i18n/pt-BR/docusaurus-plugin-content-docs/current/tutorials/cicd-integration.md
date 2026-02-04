---
id: cicd-integration
title: Integracao CI/CD com Serenity BDD
sidebar_position: 6
---

# Integracao CI/CD com Serenity BDD

Este guia mostra como integrar testes Serenity BDD em plataformas populares de CI/CD, incluindo GitHub Actions, Jenkins e GitLab CI. Aprenda como executar testes automaticamente, publicar relatorios e obter feedback rapido sobre suas alteracoes de codigo.

## Pre-requisitos

- Projeto Serenity BDD configurado com Maven ou Gradle
- Repositorio de controle de versao (Git)
- Acesso a uma plataforma de CI/CD

## Lista de Verificacao Rapida

Antes de configurar o CI/CD, certifique-se de que seu projeto:
- Executa com sucesso localmente com `mvn clean verify` ou `gradle clean test`
- Tem todas as dependencias configuradas corretamente
- Usa modo headless do navegador para testes web
- Tem timeouts de execucao de teste razoaveis
- Gera relatorios Serenity em `target/site/serenity` (Maven) ou `build/reports/serenity` (Gradle)

## GitHub Actions

O GitHub Actions e a maneira mais facil de configurar CI/CD para projetos hospedados no GitHub.

### Configuracao Basica

Crie `.github/workflows/serenity-tests.yml` em seu repositorio:

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

### Versao Gradle

Para projetos Gradle:

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

### Publicando Relatorios no GitHub Pages

Publique automaticamente relatorios Serenity como um website:

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

**Acesse seus relatorios em:** `https://<username>.github.io/<repository>/reports/<run-number>`

### Execucao Paralela no GitHub Actions

Execute testes em paralelo usando uma estrategia de matriz:

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

### Configuracao Avancada com Variaveis de Ambiente

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

### Notificacoes

Envie notificacoes Slack sobre resultados de teste:

```yaml
    - name: Notify Slack on Success
      if: success()
      uses: slackapi/slack-github-action@v1
      with:
        webhook-url: ${{ secrets.SLACK_WEBHOOK }}
        payload: |
          {
            "text": "Serenity Tests Passed - Build #${{ github.run_number }}"
          }

    - name: Notify Slack on Failure
      if: failure()
      uses: slackapi/slack-github-action@v1
      with:
        webhook-url: ${{ secrets.SLACK_WEBHOOK }}
        payload: |
          {
            "text": "Serenity Tests Failed - Build #${{ github.run_number }}\nView: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
          }
```

## Jenkins

O Jenkins e uma plataforma popular de CI/CD auto-hospedada com amplo suporte a plugins.

### Pipeline Declarativo

Crie um `Jenkinsfile` na raiz do seu repositorio:

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

### Pipeline Gradle

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

### Execucao Paralela no Jenkins

Execute testes em paralelo em multiplos nodes:

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

### Configuracao do Jenkins com Parametros

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

### Instalando Plugins do Jenkins

Plugins necessarios:
```bash
# Instale via Jenkins CLI ou UI
- HTML Publisher Plugin
- JUnit Plugin
- Pipeline Plugin
- Git Plugin
- Email Extension Plugin
```

## GitLab CI

O GitLab CI e integrado diretamente nos repositorios GitLab.

### Configuracao Basica

Crie `.gitlab-ci.yml` na raiz do seu repositorio:

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

**Os relatorios estarao disponiveis em:** `https://<username>.gitlab.io/<project>/`

### Versao Gradle

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

### Multiplos Ambientes

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

### Jobs Paralelos

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

Para projetos hospedados no Azure DevOps:

Crie `azure-pipelines.yml`:

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

## Integracao com Docker

Execute testes em containers Docker para consistencia.

### Dockerfile para Testes

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

### GitHub Actions com Docker

```yaml
- name: Build and run tests in Docker
  run: |
    docker build -t serenity-tests .
    docker run --rm -v $PWD/target:/app/target serenity-tests
```

## Melhores Praticas

### 1. Use Navegadores Headless

Configure o modo headless para ambientes CI:

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

### 2. Otimize os Tempos de Build

**Cache de dependencias:**
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

**Pule fases desnecessarias:**
```bash
mvn verify -DskipTests  # Pular execucao de testes
mvn verify -Dmaven.test.skip=true  # Pular compilacao de testes
```

### 3. Falhe Rapido

Configure builds para falhar rapidamente em erros criticos:

```yaml
strategy:
  fail-fast: true  # Parar todos os jobs se um falhar
```

### 4. Execucao Baseada em Tags

Execute diferentes suites de teste em diferentes pipelines:

```bash
# Testes smoke em cada commit
mvn verify -Dcucumber.filter.tags="@smoke"

# Regressao completa na branch main
mvn verify -Dcucumber.filter.tags="@regression"
```

### 5. Separe os Estagios de Teste

```yaml
stages:
  - unit-tests
  - integration-tests
  - smoke-tests
  - regression-tests
```

### 6. Gerencie Secrets com Seguranca

Nunca commite credenciais:
```yaml
# GitHub Actions
env:
  API_KEY: ${{ secrets.API_KEY }}

# GitLab CI
variables:
  API_KEY: ${{ secrets.API_KEY }}
```

### 7. Reexecute Testes Flakey

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

### 8. Gere Badges de Build

Adicione badges de status ao seu README:

**GitHub Actions:**
```markdown
![Tests](https://github.com/username/repo/actions/workflows/serenity-tests.yml/badge.svg)
```

**GitLab CI:**
```markdown
![pipeline status](https://gitlab.com/username/project/badges/main/pipeline.svg)
```

## Solucao de Problemas

### Problema: Testes falham apenas no CI

**Causas comuns:**
- Navegador nao instalado ou versao incompativel
- Servidor de display ausente (X11)
- Memoria insuficiente
- Problemas de rede/firewall

**Solucoes:**
```yaml
# Adicionar servidor de display para Linux
before_script:
  - export DISPLAY=:99
  - Xvfb :99 -screen 0 1920x1080x24 &

# Aumentar memoria
env:
  MAVEN_OPTS: "-Xmx2g"
```

### Problema: Relatorios nao publicando

**Verifique:**
- Caminho correto para o diretorio do relatorio
- Condicao `if: always()` esta definida
- Permissoes suficientes

### Problema: Builds lentos

**Solucoes:**
- Cache de dependencias
- Use execucao paralela
- Execute subconjunto de testes (testes smoke primeiro)
- Use cache de camadas Docker

## Exemplo Completo: GitHub Actions com Todas as Funcionalidades

```yaml
name: Serenity BDD - Production Ready

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * *'  # Diariamente as 2 AM
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

## Proximos Passos

- Aprenda sobre [Execucao Paralela](/docs/junit5/parallel-execution) para acelerar builds de CI
- Explore [Testes Orientados a Dados](/docs/tutorials/data-driven-testing) para cobertura de teste abrangente
- Confira [Configuracao do Serenity](/docs/reference/serenity-properties) para otimizar o desempenho do CI

## Recursos Adicionais

- [Documentacao do GitHub Actions](https://docs.github.com/en/actions)
- [Documentacao do Jenkins Pipeline](https://www.jenkins.io/doc/book/pipeline/)
- [Documentacao do GitLab CI/CD](https://docs.gitlab.com/ee/ci/)
- [Serenity BDD no Docker Hub](https://hub.docker.com/r/serenity)
