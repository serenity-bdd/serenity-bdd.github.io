---
id: parallel-execution
title: Executando Testes JUnit 5 em Paralelo
sidebar_position: 2
---

# Executando Testes Serenity JUnit 5 em Paralelo

Executar testes JUnit 5 em paralelo pode reduzir significativamente o tempo de execução dos testes. Este guia explica como configurar e otimizar a execução paralela para testes Serenity BDD usando JUnit 5.

## Visão Geral

JUnit 5 (Jupiter) tem suporte nativo para execução paralela de testes. Quando combinado com Serenity BDD, você pode executar métodos de teste e classes de teste simultaneamente, aproveitando processadores multi-core.

:::tip Benefícios da Execução Paralela
Em uma máquina com 8 núcleos, a execução paralela pode reduzir o tempo de teste de 30 minutos para 5-8 minutos ou menos.
:::

## Pré-requisitos

- JUnit 5 (Jupiter)
- Serenity BDD 3.6.0 ou superior
- Código de teste thread-safe
- Recursos de sistema suficientes (CPU, RAM)

## Configuração Básica

### Passo 1: Habilitar Execução Paralela

Crie ou atualize `junit-platform.properties` em `src/test/resources`:

```properties
# Habilitar execução paralela
junit.jupiter.execution.parallel.enabled=true
```

### Passo 2: Configurar Modo de Execução

```properties
# Executar classes de teste em paralelo
junit.jupiter.execution.parallel.mode.default=concurrent

# Executar classes de teste em paralelo
junit.jupiter.execution.parallel.mode.classes.default=concurrent
```

### Passo 3: Configurar Estratégia de Execução

```properties
# Usar estratégia dinâmica (recomendado)
junit.jupiter.execution.parallel.config.strategy=dynamic
junit.jupiter.execution.parallel.config.dynamic.factor=1.0
```

## Modos de Execução

### Modo Concurrent

Testes executam em paralelo:

```properties
junit.jupiter.execution.parallel.mode.default=concurrent
junit.jupiter.execution.parallel.mode.classes.default=concurrent
```

### Modo Same Thread

Testes executam sequencialmente:

```properties
junit.jupiter.execution.parallel.mode.default=same_thread
junit.jupiter.execution.parallel.mode.classes.default=same_thread
```

### Modo Misto

Execute classes em paralelo mas métodos dentro de uma classe sequencialmente:

```properties
# Classes em paralelo
junit.jupiter.execution.parallel.mode.classes.default=concurrent

# Métodos na mesma classe executam sequencialmente
junit.jupiter.execution.parallel.mode.default=same_thread
```

## Estratégias de Execução

### Estratégia Dinâmica (Recomendada)

Determina automaticamente a contagem de threads com base nos processadores disponíveis:

```properties
junit.jupiter.execution.parallel.config.strategy=dynamic
junit.jupiter.execution.parallel.config.dynamic.factor=1.0
```

**Cálculo do fator:** `threads = processadores × fator`

**Exemplos** (em uma máquina de 8 núcleos):
- Fator `1.0` = 8 threads (recomendado)
- Fator `0.5` = 4 threads
- Fator `2.0` = 16 threads

### Estratégia Fixa

Usa um número específico de threads:

```properties
junit.jupiter.execution.parallel.config.strategy=fixed
junit.jupiter.execution.parallel.config.fixed.parallelism=4
```

**Use quando:**
- Você precisa de contagens de threads consistentes
- Executando em infraestrutura de CI/CD compartilhada
- Depurando problemas de execução paralela

### Estratégia Personalizada

Implemente sua própria estratégia:

```properties
junit.jupiter.execution.parallel.config.strategy=custom
junit.jupiter.execution.parallel.config.custom.class=com.example.MyParallelStrategy
```

## Controlando Paralelismo em Nível de Classe/Método

### Configuração Por Classe

Use a anotação `@Execution` para controlar o paralelismo:

```java
import org.junit.jupiter.api.parallel.Execution;
import org.junit.jupiter.api.parallel.ExecutionMode;

@ExtendWith(SerenityJUnit5Extension.class)
@Execution(ExecutionMode.CONCURRENT)  // Executa os métodos desta classe em paralelo
class FastTests {

    @Test
    void test1() { }

    @Test
    void test2() { }

    @Test
    void test3() { }
}
```

### Forçar Execução Sequencial

```java
@ExtendWith(SerenityJUnit5Extension.class)
@Execution(ExecutionMode.SAME_THREAD)  // Executa sequencialmente
class DatabaseMigrationTests {

    @Test
    void migration1() { }

    @Test
    void migration2() { }  // Deve executar após migration1
}
```

### Controle em Nível de Método

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

## Bloqueios de Recursos

Previna acesso concorrente a recursos compartilhados:

```java
import org.junit.jupiter.api.parallel.ResourceLock;

@ExtendWith(SerenityJUnit5Extension.class)
class SharedResourceTests {

    @Test
    @ResourceLock("database")
    void accessDatabase1() {
        // Acesso exclusivo ao banco de dados
    }

    @Test
    @ResourceLock("database")
    void accessDatabase2() {
        // Vai aguardar accessDatabase1 completar
    }

    @Test
    @ResourceLock(value = "database", mode = READ)
    void readFromDatabase() {
        // Acesso somente leitura - pode executar simultaneamente com outras leituras
    }
}
```

### Bloqueios de Recursos Comuns

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

## Thread Safety com Serenity

### Gerenciamento do WebDriver

O `@Managed` WebDriver do Serenity é automaticamente thread-safe:

```java
@ExtendWith(SerenityJUnit5Extension.class)
@Execution(ExecutionMode.CONCURRENT)
class WebTests {

    @Managed(driver = "chrome", options = "headless")
    WebDriver driver;  // Cada thread recebe sua própria instância

    @Test
    void test1() {
        driver.get("https://example.com");
        // Thread-safe
    }

    @Test
    void test2() {
        driver.get("https://example.com/other");
        // Instância de WebDriver independente
    }
}
```

### Bibliotecas de Passos

As bibliotecas de passos são thread-safe quando usadas corretamente:

```java
@ExtendWith(SerenityJUnit5Extension.class)
@Execution(ExecutionMode.CONCURRENT)
class CheckoutTests {

    @Steps
    CartSteps cart;  // Thread-safe - instância por thread

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

### Evite Estado Mutável Compartilhado

```java
// ❌ RUIM - Não é thread-safe
@ExtendWith(SerenityJUnit5Extension.class)
@Execution(ExecutionMode.CONCURRENT)
class BadTests {

    private String sharedData;  // Estado mutável compartilhado!

    @Test
    void test1() {
        sharedData = "test1";  // Condição de corrida!
    }

    @Test
    void test2() {
        sharedData = "test2";  // Condição de corrida!
    }
}

// ✅ BOM - Thread-safe
@ExtendWith(SerenityJUnit5Extension.class)
@Execution(ExecutionMode.CONCURRENT)
class GoodTests {

    @Test
    void test1() {
        String localData = "test1";  // Variável local - thread-safe
        // Usa localData
    }

    @Test
    void test2() {
        String localData = "test2";  // Independente
        // Usa localData
    }
}
```

## Exemplo de Configuração Completa

### junit-platform.properties Abrangente

```properties
# ==========================================
# Execução Paralela
# ==========================================
junit.jupiter.execution.parallel.enabled=true
junit.jupiter.execution.parallel.mode.default=concurrent
junit.jupiter.execution.parallel.mode.classes.default=concurrent

# ==========================================
# Estratégia de Execução
# ==========================================
junit.jupiter.execution.parallel.config.strategy=dynamic
junit.jupiter.execution.parallel.config.dynamic.factor=1.0

# Alternativa: Estratégia fixa
# junit.jupiter.execution.parallel.config.strategy=fixed
# junit.jupiter.execution.parallel.config.fixed.parallelism=4
# junit.jupiter.execution.parallel.config.fixed.max-pool-size=8

# ==========================================
# Ciclo de Vida da Instância de Teste
# ==========================================
junit.jupiter.testinstance.lifecycle.default=per_method

# ==========================================
# Descoberta de Testes
# ==========================================
junit.jupiter.testclass.order.default=org.junit.jupiter.api.ClassOrderer$Random

# ==========================================
# Nomes de Exibição
# ==========================================
junit.jupiter.displayname.generator.default=org.junit.jupiter.api.DisplayNameGenerator$ReplaceUnderscores
```

## Configuração Maven

### Plugin Failsafe

Configure o plugin Maven Failsafe para execução paralela:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-failsafe-plugin</artifactId>
    <version>3.0.0</version>
    <configuration>
        <!-- Habilitar JUnit 5 -->
        <includes>
            <include>**/*Test.java</include>
            <include>**/*Tests.java</include>
        </includes>

        <!-- Propriedades do sistema -->
        <systemPropertyVariables>
            <webdriver.driver>${webdriver.driver}</webdriver.driver>
            <environment>${environment}</environment>
        </systemPropertyVariables>

        <!-- Aumentar memória para execução paralela -->
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

### Executando pela Linha de Comando

```bash
# Executar todos os testes em paralelo
mvn clean verify

# Sobrescrever paralelismo
mvn clean verify -Djunit.jupiter.execution.parallel.config.fixed.parallelism=8

# Desabilitar execução paralela
mvn clean verify -Djunit.jupiter.execution.parallel.enabled=false
```

## Configuração Gradle

```groovy
test {
    useJUnitPlatform()

    // Habilitar execução paralela
    maxParallelForks = Runtime.runtime.availableProcessors()

    // Aumentar memória
    minHeapSize = "512m"
    maxHeapSize = "2g"

    // Propriedades do sistema
    systemProperty 'junit.jupiter.execution.parallel.enabled', 'true'
    systemProperty 'junit.jupiter.execution.parallel.config.strategy', 'dynamic'
    systemProperty 'junit.jupiter.execution.parallel.config.dynamic.factor', '1.0'
}
```

## Otimização de Performance

### 1. Escolha a Estratégia Certa

**Suítes de teste pequenas** (&lt;30 testes):
```properties
junit.jupiter.execution.parallel.config.strategy=fixed
junit.jupiter.execution.parallel.config.fixed.parallelism=2
```

**Suítes de teste médias** (30-100 testes):
```properties
junit.jupiter.execution.parallel.config.strategy=dynamic
junit.jupiter.execution.parallel.config.dynamic.factor=1.0
```

**Suítes de teste grandes** (&gt;100 testes):
```properties
junit.jupiter.execution.parallel.config.strategy=dynamic
junit.jupiter.execution.parallel.config.dynamic.factor=0.75
```

### 2. Monitore o Uso de Recursos

```bash
# Monitorar enquanto os testes executam
top
htop
jconsole
```

Observe:
- **CPU**: Deve estar próximo de 100% de utilização
- **Memória**: Cada instância de navegador usa ~200-500MB de RAM
- **Threads**: Deve corresponder à sua configuração de paralelismo

### 3. Otimize o Design dos Testes

```java
// ✅ BOM - Testes rápidos e focados
@Test
void shouldCalculateTotal() {
    // Sem dependências externas, executa rapidamente
    assertThat(calculator.add(2, 3)).isEqualTo(5);
}

// ⚠️ LENTO - Considere otimização
@Test
void shouldProcessLargeDataset() {
    // Processa 10000 registros - considere usar dataset menor
}
```

### 4. Equilibre a Contagem de Threads

Poucas threads:
```properties
# Subutilizando CPU
junit.jupiter.execution.parallel.config.dynamic.factor=0.25
```

Muitas threads:
```properties
# Pode causar esgotamento de recursos
junit.jupiter.execution.parallel.config.dynamic.factor=4.0
```

Ótimo:
```properties
# Corresponde aos núcleos da CPU
junit.jupiter.execution.parallel.config.dynamic.factor=1.0
```

## Depurando Testes Paralelos

### Desabilitar Paralelismo Temporariamente

```properties
junit.jupiter.execution.parallel.enabled=false
```

Ou via linha de comando:
```bash
mvn verify -Djunit.jupiter.execution.parallel.enabled=false
```

### Executar Classe de Teste Única

```bash
mvn test -Dtest=MyTestClass
```

### Habilitar Log Detalhado

Adicione ao `junit-platform.properties`:
```properties
# Mostrar qual thread executa qual teste
junit.platform.output.capture.stdout=true
junit.platform.output.capture.stderr=true
```

No seu teste:
```java
@BeforeEach
void logThread() {
    System.out.println("Executando em: " + Thread.currentThread().getName());
}
```

## Problemas Comuns e Soluções

### Problema 1: Testes Instáveis

**Sintomas:** Testes passam individualmente mas falham em paralelo

**Soluções:**
- Verifique estado mutável compartilhado
- Verifique isolamento de dados de teste
- Revise bloqueios de recursos
- Adicione sincronização adequada

```java
// Problema: Estado compartilhado
private static int counter = 0;  // ❌ Não é thread-safe

@Test
void incrementCounter() {
    counter++;  // Condição de corrida
}

// Solução: Use tipos atômicos ou variáveis locais
private static AtomicInteger counter = new AtomicInteger(0);  // ✅ Thread-safe

@Test
void incrementCounter() {
    counter.incrementAndGet();
}
```

### Problema 2: Esgotamento de Recursos

**Sintomas:** Testes ficam lentos ou falham após algum tempo

**Soluções:**
- Reduza a contagem de threads
- Aumente o tamanho do heap da JVM
- Verifique vazamentos de recursos
- Monitore os recursos do sistema

```xml
<!-- Aumentar tamanho do heap -->
<argLine>-Xmx4g</argLine>
```

### Problema 3: Problemas com WebDriver

**Sintomas:** Instâncias de navegador se multiplicam ou não fecham

**Soluções:**
- Use `@Managed` WebDriver (Serenity gerencia o ciclo de vida)
- Garanta limpeza adequada em `@AfterEach`
- Limite instâncias de navegador concorrentes

```java
// ✅ Serenity gerencia o ciclo de vida
@Managed
WebDriver driver;

// ❌ Não gerencie manualmente em testes paralelos
WebDriver driver = new ChromeDriver();  // Risco de vazamento de memória
```

### Problema 4: Bloqueios de Banco de Dados

**Sintomas:** Testes ficam em timeout aguardando banco de dados

**Soluções:**
- Use bloqueios de recursos
- Isole dados de teste
- Use banco de dados em memória para testes

```java
@Test
@ResourceLock("database")
void modifiesDatabase() {
    // Acesso exclusivo ao banco de dados
}
```

## Boas Práticas

### 1. Comece Pequeno

Comece com 2-4 threads e aumente gradualmente:

```properties
junit.jupiter.execution.parallel.config.strategy=fixed
junit.jupiter.execution.parallel.config.fixed.parallelism=2
```

### 2. Isole Dados de Teste

```java
@ExtendWith(SerenityJUnit5Extension.class)
class UserTests {

    @Test
    void createUser() {
        String uniqueId = UUID.randomUUID().toString();
        User user = createTestUser("user_" + uniqueId);
        // Teste com usuário único
    }
}
```

### 3. Use Tags para Paralelismo Seletivo

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
# Executar apenas testes paralelos
junit.jupiter.includeTags=parallel
```

### 4. Limpe Recursos

```java
@AfterEach
void cleanup() {
    // Limpar dados de teste
    testDataService.deleteTestData(testId);
}
```

### 5. Documente Thread Safety

```java
/**
 * Testes nesta classe modificam estado global da aplicação
 * e devem executar sequencialmente.
 */
@Execution(ExecutionMode.SAME_THREAD)
class GlobalStateTests {
    // ...
}
```

## Medindo Performance

### Antes da Execução Paralela
```
Total de testes: 150
Tempo de execução: 25 minutos
```

### Após Execução Paralela (8 threads)
```
Total de testes: 150
Tempo de execução: 4 minutos
Speedup: 6.25x
Eficiência: 78%
```

**Calcule métricas:**
```
Speedup = Tempo Sequencial / Tempo Paralelo
Eficiência = Speedup / Número de Threads × 100%
```

## Próximos Passos

- Retorne ao guia principal [JUnit 5](junit5-tests)
- Aprenda sobre [Organização de Testes](junit5-tests#display-names-and-organization)
- Revise [Boas Práticas](junit5-tests#best-practices)
- Explore [Relatórios Serenity](/docs/reporting/the_serenity_reports)

## Recursos Adicionais

- [Documentação de Execução Paralela JUnit 5](https://junit.org/junit5/docs/current/user-guide/#writing-tests-parallel-execution)
- [Dicas de Performance Serenity BDD](https://serenity-bdd.info)
- [Java Concurrency in Practice](https://jcip.net/)
