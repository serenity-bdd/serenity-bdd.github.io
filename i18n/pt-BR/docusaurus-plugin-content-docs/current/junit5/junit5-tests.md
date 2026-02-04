---
id: junit5-tests
title: JUnit 5 com Serenity BDD
sidebar_position: 1
---

# Executando Testes Serenity BDD com JUnit 5

Este guia cobre tudo o que você precisa saber para escrever e executar testes Serenity BDD usando JUnit 5 (Jupiter), sem Cucumber.

## Visão Geral

JUnit 5 é a versão mais recente do popular framework de testes Java. Combinado com Serenity BDD, você obtém:

- **Recursos Modernos de Teste**: Testes parametrizados, testes aninhados, testes dinâmicos e muito mais
- **Asserções Poderosas**: Bibliotecas de asserção nativas e de terceiros
- **Relatórios Detalhados**: Relatórios detalhados do Serenity com capturas de tela e detalhes de execução passo a passo
- **Execução Paralela**: Execute testes simultaneamente para obter feedback mais rápido
- **Organização Flexível**: Tags, classes aninhadas e nomes de exibição para melhor organização dos testes

:::tip JUnit 5 Recomendado
JUnit 4 está obsoleto a partir do Serenity 5.0.0 e será removido no Serenity 6.0.0. Todos os novos projetos devem usar JUnit 5.
:::

## Pré-requisitos

- Java 17 ou superior
- Maven ou Gradle
- Uma IDE com suporte a Java (IntelliJ IDEA, Eclipse, VS Code, etc.)

## Configurando Dependências

### Dependências Maven

Adicione o seguinte ao seu `pom.xml`:

```xml
<properties>
    <serenity.version>5.2.2</serenity.version>
    <junit.version>6.0.1</junit.version>
</properties>

<dependencies>
    <!-- Integração Serenity JUnit 5 -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-junit5</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Serenity Screenplay (opcional, mas recomendado) -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-screenplay</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Integração Serenity WebDriver (para testes web) -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-screenplay-webdriver</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- JUnit 5 (Jupiter) -->
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter-api</artifactId>
        <version>${junit.version}</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter-engine</artifactId>
        <version>${junit.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- AssertJ (recomendado para asserções fluentes) -->
    <dependency>
        <groupId>org.assertj</groupId>
        <artifactId>assertj-core</artifactId>
        <version>3.24.2</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### Dependências Gradle

Para Gradle, adicione ao seu `build.gradle`:

```groovy
dependencies {
    testImplementation "net.serenity-bdd:serenity-junit5:5.2.2"
    testImplementation "net.serenity-bdd:serenity-screenplay:5.2.2"
    testImplementation "net.serenity-bdd:serenity-screenplay-webdriver:5.2.2"

    testImplementation "org.junit.jupiter:junit-jupiter-api:6.0.1"
    testRuntimeOnly "org.junit.jupiter:junit-jupiter-engine:6.0.1"

    testImplementation "org.assertj:assertj-core:3.24.2"
}

test {
    useJUnitPlatform()
}
```

## Escrevendo Seu Primeiro Teste

### Estrutura Básica do Teste

Todo teste Serenity JUnit 5 deve ser anotado com `@ExtendWith(SerenityJUnit5Extension.class)`:

```java
import net.serenitybdd.junit5.SerenityJUnit5Extension;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(SerenityJUnit5Extension.class)
class WhenSearchingForProducts {

    @Test
    void shouldFindProductByName() {
        // Seu código de teste aqui
    }

    @Test
    void shouldFilterProductsByCategory() {
        // Seu código de teste aqui
    }
}
```

### Exemplo de Teste Web

Aqui está um exemplo completo de um teste web:

```java
import net.serenitybdd.annotations.Managed;
import net.serenitybdd.junit5.SerenityJUnit5Extension;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.openqa.selenium.WebDriver;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SerenityJUnit5Extension.class)
class WhenBrowsingProducts {

    @Managed(driver = "chrome", options = "headless")
    WebDriver driver;

    @Test
    void shouldDisplayProductDetails() {
        driver.get("https://example.com/products/123");

        String productTitle = driver.findElement(By.id("product-title")).getText();

        assertThat(productTitle).isEqualTo("Product Name");
    }
}
```

### Usando Bibliotecas de Passos

Para melhor organização, use as bibliotecas de passos do Serenity:

```java
import net.serenitybdd.annotations.Steps;
import net.serenitybdd.junit5.SerenityJUnit5Extension;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(SerenityJUnit5Extension.class)
class WhenManagingShoppingCart {

    @Steps
    NavigationSteps navigation;

    @Steps
    ProductSteps products;

    @Steps
    CartSteps cart;

    @Test
    void shouldAddProductToCart() {
        navigation.openHomePage();
        products.searchFor("laptop");
        products.selectFirstProduct();
        cart.addToCart();

        cart.shouldContain(1, "items");
    }
}
```

## Ciclo de Vida do Teste

### Ciclo de Vida em Nível de Método

Use as anotações de ciclo de vida do JUnit 5:

```java
import org.junit.jupiter.api.*;

@ExtendWith(SerenityJUnit5Extension.class)
class ProductTests {

    @BeforeEach
    void setUp() {
        // Executa antes de cada método de teste
        System.out.println("Configurando teste");
    }

    @AfterEach
    void tearDown() {
        // Executa após cada método de teste
        System.out.println("Limpando teste");
    }

    @BeforeAll
    static void setUpClass() {
        // Executa uma vez antes de todos os testes nesta classe
        System.out.println("Configurando classe de teste");
    }

    @AfterAll
    static void tearDownClass() {
        // Executa uma vez após todos os testes nesta classe
        System.out.println("Limpando classe de teste");
    }

    @Test
    void test1() {
        // Código do teste
    }

    @Test
    void test2() {
        // Código do teste
    }
}
```

### Ordem de Execução

```
setUpClass()
  setUp()
    test1()
  tearDown()
  setUp()
    test2()
  tearDown()
tearDownClass()
```

## Nomes de Exibição e Organização

### Nomes de Exibição Personalizados

Torne os nomes dos testes mais legíveis nos relatórios:

```java
import org.junit.jupiter.api.DisplayName;

@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("Gerenciamento do Carrinho de Compras")
class ShoppingCartTests {

    @Test
    @DisplayName("Deve adicionar produto ao carrinho vazio")
    void addToEmptyCart() {
        // Código do teste
    }

    @Test
    @DisplayName("Deve atualizar quantidade do produto existente")
    void updateQuantity() {
        // Código do teste
    }

    @Test
    @DisplayName("Deve remover produto do carrinho")
    void removeProduct() {
        // Código do teste
    }
}
```

### Testes Aninhados

Organize testes relacionados com `@Nested`:

```java
import org.junit.jupiter.api.Nested;

@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("Autenticação de Usuário")
class AuthenticationTests {

    @Nested
    @DisplayName("Ao fazer login")
    class Login {

        @Test
        @DisplayName("Deve ter sucesso com credenciais válidas")
        void validCredentials() {
            // Código do teste
        }

        @Test
        @DisplayName("Deve falhar com senha inválida")
        void invalidPassword() {
            // Código do teste
        }

        @Test
        @DisplayName("Deve falhar com usuário inexistente")
        void nonExistentUser() {
            // Código do teste
        }
    }

    @Nested
    @DisplayName("Ao fazer logout")
    class Logout {

        @Test
        @DisplayName("Deve limpar a sessão")
        void clearSession() {
            // Código do teste
        }

        @Test
        @DisplayName("Deve redirecionar para a página de login")
        void redirectToLogin() {
            // Código do teste
        }
    }
}
```

## Testes Parametrizados

### Testes Parametrizados Simples

```java
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

@ExtendWith(SerenityJUnit5Extension.class)
class SearchTests {

    @Steps
    SearchSteps search;

    @ParameterizedTest
    @ValueSource(strings = {"laptop", "phone", "tablet"})
    @DisplayName("Deve encontrar produtos para o termo de busca: {0}")
    void shouldFindProducts(String searchTerm) {
        search.searchFor(searchTerm);
        search.shouldSeeResults();
    }
}
```

### CSV Source

```java
import org.junit.jupiter.params.provider.CsvSource;

@ParameterizedTest
@CsvSource({
    "admin,     admin123,  Dashboard",
    "user,      user123,   User Home",
    "guest,     guest123,  Guest Portal"
})
@DisplayName("Deve fazer login como {0} e ver {2}")
void shouldLoginSuccessfully(String username, String password, String expectedPage) {
    login.as(username, password);
    navigation.shouldBeOn(expectedPage);
}
```

### Method Source

```java
import org.junit.jupiter.params.provider.MethodSource;
import java.util.stream.Stream;

@ParameterizedTest
@MethodSource("provideTestData")
@DisplayName("Deve processar pedido para {0}")
void shouldProcessOrder(Order order) {
    checkout.process(order);
    checkout.shouldShowConfirmation();
}

static Stream<Order> provideTestData() {
    return Stream.of(
        new Order("Product1", 2, 29.99),
        new Order("Product2", 1, 49.99),
        new Order("Product3", 5, 9.99)
    );
}
```

## Tags e Filtros

### Marcando Testes com Tags

Use `@Tag` para categorizar testes:

```java
import org.junit.jupiter.api.Tag;

@ExtendWith(SerenityJUnit5Extension.class)
class ProductTests {

    @Test
    @Tag("smoke")
    @Tag("fast")
    void quickSanityCheck() {
        // Teste de fumaça rápido
    }

    @Test
    @Tag("regression")
    @Tag("slow")
    void comprehensiveTest() {
        // Teste de regressão completo
    }

    @Test
    @Tag("wip")
    void workInProgress() {
        // Teste em desenvolvimento
    }
}
```

### Executando Testes com Tags

**Maven:**
```bash
# Executar apenas testes de fumaça
mvn test -Dgroups=smoke

# Executar smoke OU regression
mvn test -Dgroups="smoke | regression"

# Executar smoke E fast
mvn test -Dgroups="smoke & fast"

# Excluir testes wip
mvn test -DexcludedGroups=wip
```

**junit-platform.properties:**
```properties
junit.jupiter.includeTags=smoke
junit.jupiter.excludeTags=wip,slow
```

## Execução Condicional de Testes

### Testes Específicos por Sistema Operacional

```java
import org.junit.jupiter.api.condition.*;

@Test
@EnabledOnOs(OS.WINDOWS)
void runOnlyOnWindows() {
    // Teste específico para Windows
}

@Test
@DisabledOnOs(OS.MAC)
void dontRunOnMac() {
    // Teste desabilitado no macOS
}
```

### Específicos por Versão do Java

```java
@Test
@EnabledOnJre(JRE.JAVA_17)
void runOnlyOnJava17() {
    // Teste específico para Java 17
}

@Test
@EnabledForJreRange(min = JRE.JAVA_17, max = JRE.JAVA_21)
void runOnJava17To21() {
    // Versões modernas do Java
}
```

### Condições Personalizadas

```java
@Test
@EnabledIf("isProductionEnvironment")
void runOnlyInProduction() {
    // Teste apenas em produção
}

boolean isProductionEnvironment() {
    return System.getProperty("env", "dev").equals("prod");
}
```

## Asserções

### Asserções JUnit 5

```java
import static org.junit.jupiter.api.Assertions.*;

@Test
void demonstrateAssertions() {
    // Asserções básicas
    assertEquals(expected, actual);
    assertTrue(condition);
    assertFalse(condition);
    assertNull(object);
    assertNotNull(object);

    // Asserções de array
    assertArrayEquals(expectedArray, actualArray);

    // Asserções de exceção
    assertThrows(IllegalArgumentException.class, () -> {
        // Código que deve lançar exceção
    });

    // Asserções de timeout
    assertTimeout(Duration.ofSeconds(2), () -> {
        // Código que deve completar em 2 segundos
    });

    // Asserções agrupadas
    assertAll("Validação de usuário",
        () -> assertEquals("John", user.getFirstName()),
        () -> assertEquals("Doe", user.getLastName()),
        () -> assertTrue(user.isActive())
    );
}
```

### AssertJ (Recomendado)

```java
import static org.assertj.core.api.Assertions.*;

@Test
void demonstrateAssertJ() {
    // Asserções fluentes
    assertThat(actual).isEqualTo(expected);
    assertThat(list).hasSize(3)
                    .contains("item1", "item2")
                    .doesNotContain("item3");

    // Asserções de string
    assertThat(text).startsWith("Hello")
                    .endsWith("World")
                    .contains("Test");

    // Asserções de exceção
    assertThatThrownBy(() -> methodThatThrows())
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Invalid input");

    // Soft assertions (continua mesmo após falhas)
    SoftAssertions softly = new SoftAssertions();
    softly.assertThat(user.getName()).isEqualTo("John");
    softly.assertThat(user.getAge()).isGreaterThan(18);
    softly.assertAll();
}
```

## Execução Paralela

Veja o guia dedicado [Execução Paralela](parallel-execution) para uma cobertura completa.

Exemplo rápido em `junit-platform.properties`:

```properties
# Habilitar execução paralela
junit.jupiter.execution.parallel.enabled=true

# Executar classes de teste em paralelo
junit.jupiter.execution.parallel.mode.default=concurrent

# Executar métodos de teste na mesma classe sequencialmente
junit.jupiter.execution.parallel.mode.classes.default=concurrent

# Usar estratégia dinâmica
junit.jupiter.execution.parallel.config.strategy=dynamic
junit.jupiter.execution.parallel.config.dynamic.factor=1.0
```

## Boas Práticas

### 1. Nomenclatura de Testes

```java
// Bom - Descreve o comportamento
@Test
void shouldCalculateDiscountForRegularCustomer() { }

// Melhor - Ainda mais descritivo
@Test
@DisplayName("Deve aplicar 10% de desconto para clientes com 5+ pedidos")
void regularCustomerDiscount() { }

// Ruim - Propósito não claro
@Test
void test1() { }
```

### 2. Organização de Testes

```java
// Bom - Organizado por funcionalidade/comportamento
@Nested
@DisplayName("Quando o usuário está logado")
class LoggedIn {

    @Nested
    @DisplayName("E visualizando seu perfil")
    class ViewingProfile {

        @Test
        @DisplayName("Deve ver informações pessoais")
        void seesPersonalInfo() { }

        @Test
        @DisplayName("Deve poder editar detalhes")
        void canEditDetails() { }
    }
}
```

### 3. Use Bibliotecas de Passos

```java
// Bom - Delegando para bibliotecas de passos
@Test
void shouldCompleteCheckout() {
    cart.addProduct("laptop");
    checkout.proceedToCheckout();
    payment.payWithCreditCard("4111111111111111");
    confirmation.shouldShowOrderNumber();
}

// Ruim - Implementação de baixo nível no teste
@Test
void checkout() {
    driver.findElement(By.id("add-to-cart")).click();
    driver.findElement(By.id("checkout-button")).click();
    // ... muitas mais linhas
}
```

### 4. Dados de Teste Limpos

```java
@ExtendWith(SerenityJUnit5Extension.class)
class OrderTests {

    private String orderId;

    @BeforeEach
    void createTestData() {
        orderId = testDataFactory.createOrder();
    }

    @AfterEach
    void cleanupTestData() {
        testDataFactory.deleteOrder(orderId);
    }

    @Test
    void shouldProcessOrder() {
        // Teste usa orderId
    }
}
```

### 5. Evite Interdependência entre Testes

```java
// Ruim - Testes dependem da ordem de execução
@Test
@Order(1)
void createUser() {
    userId = userService.create("John");
}

@Test
@Order(2)
void updateUser() {
    userService.update(userId, "Jane"); // Depende do teste 1
}

// Bom - Cada teste é independente
@Test
void createUser() {
    String userId = userService.create("John");
    assertThat(userId).isNotNull();
}

@Test
void updateUser() {
    String userId = userService.create("John"); // Cria seus próprios dados
    userService.update(userId, "Jane");
    assertThat(userService.get(userId).getName()).isEqualTo("Jane");
}
```

## Configuração

### Maven Surefire/Failsafe

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-failsafe-plugin</artifactId>
            <version>3.0.0</version>
            <configuration>
                <includes>
                    <include>**/*Test.java</include>
                    <include>**/*Tests.java</include>
                    <include>**/*TestCase.java</include>
                </includes>
                <systemPropertyVariables>
                    <webdriver.driver>${webdriver.driver}</webdriver.driver>
                </systemPropertyVariables>
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
    </plugins>
</build>
```

### Propriedades do Serenity

Crie `serenity.properties` em `src/test/resources`:

```properties
# Configuração do WebDriver
webdriver.driver=chrome
webdriver.chrome.driver=path/to/chromedriver

# Timeouts
webdriver.timeouts.implicitlywait=2000
webdriver.wait.for.timeout=10000

# Relatórios
serenity.project.name=Meu Projeto
serenity.test.root=net.example

# Capturas de tela
serenity.take.screenshots=FOR_FAILURES
serenity.take.screenshots.for.tasks=BEFORE_AND_AFTER_EACH_STEP
```

## Solução de Problemas

### Problemas Comuns

**1. "No tests found" (Nenhum teste encontrado)**
- Certifique-se de que a classe de teste tem `@ExtendWith(SerenityJUnit5Extension.class)`
- Verifique se os métodos de teste têm `@Test` de `org.junit.jupiter.api`
- Verifique se Maven/Gradle está configurado para executar testes JUnit 5

**2. "Multiple WebDriver instances" (Múltiplas instâncias de WebDriver)**
- Use `@Managed` WebDriver - Serenity gerencia o ciclo de vida
- Não crie instâncias de WebDriver manualmente
- Garanta a limpeza adequada em `@AfterEach` se necessário

**3. "Tests fail in parallel but pass individually" (Testes falham em paralelo mas passam individualmente)**
- Verifique se há estado compartilhado entre testes
- Garanta que os dados de teste estão isolados
- Revise o gerenciamento do WebDriver

## Próximos Passos

- Explore [Execução Paralela](parallel-execution) para execuções de teste mais rápidas
- Aprenda sobre [Screenplay Pattern](/docs/screenplay/screenplay_fundamentals) para melhor design de testes
- Revise a documentação de [Relatórios Serenity](/docs/reporting/the_serenity_reports)
- Confira [Integração WebDriver](/docs/guide/driver_config) para testes web

## Recursos Adicionais

- [Guia do Usuário JUnit 5](https://junit.org/junit5/docs/current/user-guide/)
- [Site Oficial Serenity BDD](https://serenity-bdd.info)
- [Documentação AssertJ](https://assertj.github.io/doc/)
- [Projeto de Exemplo](https://github.com/serenity-bdd/serenity-junit-screenplay-starter)
