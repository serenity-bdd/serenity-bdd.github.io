---
id: configuration-reference
title: Referencia de Configuracao do Cucumber
sidebar_position: 3
---

# Referencia de Configuracao do Cucumber

Esta página fornece uma referência abrangente de todas as opções de configuração para executar Cucumber com Serenity BDD e JUnit 5.

## Metodos de Configuracao

Existem três maneiras de configurar o Cucumber com JUnit 5:

1. **Anotacoes @ConfigurationParameter** (em classes de test suite)
2. **Arquivo junit-platform.properties** (em src/test/resources)
3. **Propriedades do sistema** (linha de comando ou ferramenta de build)

Ordem de prioridade: Anotações > Propriedades do Sistema > Arquivo de Propriedades

## Configuracao Essencial do Serenity

### Plugin Reporter do Serenity

**Necessario para relatorios do Serenity**

```java
@ConfigurationParameter(
    key = PLUGIN_PROPERTY_NAME,
    value = "net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel"
)
```

Ou em `junit-platform.properties`:
```properties
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel
```

:::warning Mudanca Importante no Serenity 5.0.0
O caminho do plugin mudou de `io.cucumber.core.plugin.*` para `net.serenitybdd.cucumber.core.plugin.*`
:::

**Reporters disponiveis:**
- `SerenityReporterParallel` - Thread-safe, recomendado para todos os cenários
- `SerenityReporter` - Legado, não thread-safe

## Configuracao Principal do Cucumber

### Localizacao de Arquivos de Feature

Especifique onde encontrar arquivos de Feature:

```java
// Abordagem com anotacao
@SelectClasspathResource("features")

// Ou usando parametro de configuracao
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

Especifique pacotes contendo Step Definition:

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

**Multiplos pacotes:** Separe com vírgulas

### Filtragem por Tags

Filtre cenários por tags:

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

**Sintaxe de expressao de tags:**
- `@tag1 and @tag2` - Ambas as tags necessárias
- `@tag1 or @tag2` - Qualquer uma das tags necessária
- `not @tag` - Excluir tag
- `(@tag1 or @tag2) and not @tag3` - Expressões complexas

**Linha de comando:**
```bash
mvn verify -Dcucumber.filter.tags="@smoke"
```

## Configuracao de Execucao Paralela

### Habilitar Execucao Paralela

```properties
cucumber.execution.parallel.enabled=true
```

### Estrategia de Execucao

**Dinamica (recomendada):**
```properties
cucumber.execution.parallel.config.strategy=dynamic
cucumber.execution.parallel.config.dynamic.factor=1.0
```

Cálculo do fator: `threads = processadores x fator`

**Fixa:**
```properties
cucumber.execution.parallel.config.strategy=fixed
cucumber.execution.parallel.config.fixed.parallelism=4
cucumber.execution.parallel.config.fixed.max-pool-size=4
```

**Personalizada:**
```properties
cucumber.execution.parallel.config.strategy=custom
cucumber.execution.parallel.config.custom.class=com.example.MyStrategy
```

### Modo de Execucao Paralela

```properties
# Cenarios paralelos (padrao)
cucumber.execution.parallel.mode.default=concurrent

# Feature paralelas
cucumber.execution.parallel.mode.features.default=concurrent
```

## Comportamento de Execucao

### Ordem de Execucao

Controle a ordem de execução dos cenários:

```properties
# Ordem aleatoria (bom para encontrar dependencias de teste)
cucumber.execution.order=random

# Ordem alfabetica
cucumber.execution.order=lexicographical

# Alfabetica reversa
cucumber.execution.order=reverse
```

### Dry Run

Verifique passos indefinidos sem executar:

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

Execute apenas cenários com tag @wip:

```properties
cucumber.execution.wip=true
```

### Modo Strict

Trate passos indefinidos e pendentes como erros:

```properties
cucumber.execution.strict=true
```

## Configuracao de Plugins

### Multiplos Plugins

Configure múltiplos plugins:

```properties
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel,\
  pretty,\
  html:target/cucumber-reports/cucumber.html,\
  json:target/cucumber-reports/cucumber.json,\
  junit:target/cucumber-reports/cucumber.xml
```

### Plugins Comuns

| Plugin | Propósito | Exemplo |
|--------|---------|---------|
| `pretty` | Saída no console com cores | `pretty` |
| `html` | Relatório HTML | `html:target/cucumber.html` |
| `json` | Relatório JSON | `json:target/cucumber.json` |
| `junit` | Relatório XML JUnit | `junit:target/cucumber.xml` |
| `timeline` | Relatório de timeline | `timeline:target/timeline` |
| `usage` | Relatório de uso de passos | `usage:target/usage.json` |
| `rerun` | Arquivo de cenários com falha | `rerun:target/rerun.txt` |

### Suprimir Mensagens do Cucumber

Suprima a mensagem "Share your results":

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

## Formatacao de Saida

### Cores ANSI

Desabilite saída colorida no console:

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

### Saida Monocromatica

```properties
cucumber.plugin=pretty,monochrome
```

### Tipo de Snippet

Configure o estilo de snippet gerado:

```properties
# Camelcase (recomendado para Java)
cucumber.snippet-type=camelcase

# Underscore
cucumber.snippet-type=underscore
```

## Object Factory

### Object Factory Personalizada

Para injeção de dependência:

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

**Factories comuns:**
- PicoFactory (padrão)
- Spring
- Guice
- OpenEJB
- Weld

## Integracao com JUnit Platform

### Descoberta de Testes

```properties
# Incluir/excluir classes de teste
junit.jupiter.testclass.include.classname.pattern=.*IT
junit.jupiter.testclass.exclude.classname.pattern=.*IntegrationTest

# Incluir/excluir metodos de teste
junit.jupiter.testmethod.include.pattern=test.*
junit.jupiter.testmethod.exclude.pattern=.*Slow
```

### Execucao Paralela (Nivel JUnit)

```properties
junit.jupiter.execution.parallel.enabled=true
junit.jupiter.execution.parallel.mode.default=concurrent
junit.jupiter.execution.parallel.mode.classes.default=concurrent
junit.jupiter.execution.parallel.config.strategy=dynamic
junit.jupiter.execution.parallel.config.dynamic.factor=1.0
```

## Exemplo Completo de Configuracao

### junit-platform.properties Abrangente

```properties
# ==========================================
# Configuracao do Serenity BDD
# ==========================================
cucumber.plugin=net.serenitybdd.cucumber.core.plugin.SerenityReporterParallel

# ==========================================
# Arquivos de Feature e Step Definitions
# ==========================================
cucumber.features=src/test/resources/features
cucumber.glue=com.example.stepdefinitions,com.example.hooks

# ==========================================
# Filtragem
# ==========================================
cucumber.filter.tags=not @wip
cucumber.filter.name=.*checkout.*

# ==========================================
# Execucao Paralela
# ==========================================
cucumber.execution.parallel.enabled=true
cucumber.execution.parallel.config.strategy=dynamic
cucumber.execution.parallel.config.dynamic.factor=1.0

# ==========================================
# Comportamento de Execucao
# ==========================================
cucumber.execution.order=random
cucumber.execution.dry-run=false
cucumber.execution.strict=true

# ==========================================
# Plugins e Relatorios
# ==========================================
cucumber.plugin=pretty,\
  html:target/cucumber-reports/cucumber.html,\
  json:target/cucumber-reports/cucumber.json,\
  junit:target/cucumber-reports/cucumber.xml
cucumber.publish.quiet=true

# ==========================================
# Formatacao de Saida
# ==========================================
cucumber.ansi-colors.disabled=false
cucumber.snippet-type=camelcase

# ==========================================
# JUnit Platform
# ==========================================
junit.jupiter.execution.parallel.enabled=false
junit.jupiter.testinstance.lifecycle.default=per_method
```

### Exemplo Completo de Test Suite

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

## Configuracao Especifica por Ambiente

### Usando Profiles

Crie múltiplos arquivos de propriedades:

```
src/test/resources/
├── junit-platform.properties (padrao)
├── junit-platform-ci.properties (ambiente de CI)
└── junit-platform-dev.properties (desenvolvimento)
```

Ative via Maven:
```bash
mvn verify -Dprofile=ci
```

### Variaveis de Ambiente

Sobrescreva propriedades usando variáveis de ambiente:

```bash
export CUCUMBER_FILTER_TAGS="@smoke"
export CUCUMBER_EXECUTION_PARALLEL_ENABLED=true
mvn verify
```

## Referencia de Constantes

Todas as constantes de `io.cucumber.junit.platform.engine.Constants`:

| Constante | Chave da Propriedade |
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

## Proximos Passos

- Retorne ao guia principal [Cucumber com JUnit 5](cucumber-junit5)
- Aprenda sobre [Execucao Paralela](parallel-execution)
- Revise [Boas Praticas](cucumber-junit5#best-practices)

## Recursos Adicionais

- [Documentacao de Configuracao do Cucumber](https://github.com/cucumber/cucumber-jvm/tree/main/cucumber-junit-platform-engine#configuration-options)
- [Configuracao da JUnit Platform](https://junit.org/junit5/docs/current/user-guide/#running-tests-config-params)
