---
id: data-driven-testing
title: Testes Orientados a Dados com Serenity BDD
sidebar_position: 5
---

# Testes Orientados a Dados com Serenity BDD

Testes orientados a dados permitem que voce execute a mesma logica de teste com multiplos conjuntos de dados de entrada, tornando seus testes mais abrangentes e faceis de manter. Este guia cobre abordagens de testes orientados a dados com JUnit 5 e Cucumber.

## Pre-requisitos

- Java 17 ou superior
- Serenity BDD 5.2.2 ou superior
- JUnit 5 6.0.1 ou superior (para exemplos JUnit)
- Cucumber 7.33.0 ou superior (para exemplos Cucumber)

## Por que Testes Orientados a Dados?

Testes orientados a dados ajudam voce a:
- **Testar multiplos cenarios** com duplicacao minima de codigo
- **Melhorar a cobertura de testes** testando casos extremos e valores de limite
- **Separar a logica de teste dos dados de teste** para melhor manutencao
- **Tornar os testes mais legiveis** mostrando claramente o que varia entre os casos de teste

## Testes Parametrizados com JUnit 5

O JUnit 5 fornece capacidades poderosas de testes parametrizados atraves de `@ParameterizedTest`.

### Configuracao Basica

Primeiro, adicione a dependencia de parametros do JUnit Jupiter:

```xml
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-params</artifactId>
    <version>6.0.1</version>
    <scope>test</scope>
</dependency>
```

### Fontes de Valores Simples

Use `@ValueSource` para tipos de dados simples:

```java
import net.serenitybdd.annotations.Managed;
import net.serenitybdd.junit5.SerenityJUnit5Extension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.openqa.selenium.WebDriver;

@ExtendWith(SerenityJUnit5Extension.class)
class SearchTests {

    @Managed(driver = "chrome", options = "headless")
    WebDriver driver;

    @ParameterizedTest
    @ValueSource(strings = {"Selenium", "Cucumber", "JUnit 5"})
    void shouldFindSearchResults(String searchTerm) {
        // Navegar para a pagina de busca
        driver.get("https://duckduckgo.com");

        // Realizar busca com cada termo
        SearchPage searchPage = new SearchPage(driver);
        searchPage.searchFor(searchTerm);

        // Verificar resultados
        assertThat(searchPage.getResults()).isNotEmpty();
    }
}
```

**Tipos suportados para @ValueSource:**
- `strings` - Valores String
- `ints` - Valores Integer
- `longs` - Valores Long
- `doubles` - Valores Double
- `booleans` - Valores Boolean

### CSV Source - Dados Inline

Use `@CsvSource` para multiplos parametros por caso de teste:

```java
@ExtendWith(SerenityJUnit5Extension.class)
class LoginTests {

    @Managed(driver = "chrome", options = "headless")
    WebDriver driver;

    @Steps
    LoginActions loginActions;

    @ParameterizedTest
    @CsvSource({
        "standard_user,     secret_sauce,  true",
        "locked_out_user,  secret_sauce,  false",
        "problem_user,     secret_sauce,  true",
        "invalid_user,     wrong_password, false"
    })
    void shouldHandleLoginScenarios(String username, String password, boolean shouldSucceed) {
        loginActions.navigateToLoginPage();
        loginActions.loginWith(username, password);

        if (shouldSucceed) {
            loginActions.shouldSeeProductsPage();
        } else {
            loginActions.shouldSeeErrorMessage();
        }
    }
}
```

**Dicas para @CsvSource:**
- Valores sao separados por virgula por padrao
- Use aspas simples para strings contendo virgulas: `'value, with, commas'`
- Valores vazios sao tratados como null
- Espacos em branco sao removidos por padrao

### CSV Source com Delimitador Personalizado

```java
@ParameterizedTest
@CsvSource(delimiter = '|', value = {
    "Alice | alice@example.com | Premium",
    "Bob   | bob@example.com   | Standard",
    "Carol | carol@example.com | Basic"
})
void shouldHandleDifferentUserTypes(String name, String email, String accountType) {
    // Implementacao do teste
}
```

### CSV File Source - Dados Externos

Armazene dados de teste em arquivos CSV externos para melhor manutencao:

**src/test/resources/test-data/users.csv:**
```csv
username,password,email,expectedRole
admin,admin123,admin@example.com,ADMIN
user1,password1,user1@example.com,USER
user2,password2,user2@example.com,USER
guest,guest123,guest@example.com,GUEST
```

```java
@ExtendWith(SerenityJUnit5Extension.class)
class UserRegistrationTests {

    @Steps
    RegistrationActions registration;

    @ParameterizedTest
    @CsvFileSource(resources = "/test-data/users.csv", numLinesToSkip = 1)
    void shouldRegisterUsers(String username, String password, String email, String expectedRole) {
        registration.registerNewUser(username, password, email);
        registration.shouldHaveRole(expectedRole);
    }
}
```

**Opcoes do @CsvFileSource:**
- `resources` - Caminho para o arquivo CSV (relativo a src/test/resources)
- `numLinesToSkip` - Pular linha de cabecalho (tipicamente 1)
- `delimiter` - Delimitador personalizado (padrao e virgula)
- `encoding` - Codificacao do arquivo (padrao e UTF-8)

### Method Source - Objetos Complexos

Use `@MethodSource` para dados de teste complexos ou quando voce precisa de mais controle:

```java
@ExtendWith(SerenityJUnit5Extension.class)
class ProductTests {

    @Steps
    ShoppingActions shopping;

    @ParameterizedTest
    @MethodSource("productTestData")
    void shouldAddProductToCart(Product product, int quantity, double expectedTotal) {
        shopping.addToCart(product, quantity);
        shopping.shouldShowTotal(expectedTotal);
    }

    static Stream<Arguments> productTestData() {
        return Stream.of(
            Arguments.of(new Product("Laptop", 999.99), 1, 999.99),
            Arguments.of(new Product("Mouse", 29.99), 2, 59.98),
            Arguments.of(new Product("Keyboard", 79.99), 3, 239.97)
        );
    }
}
```

### Method Source de Classe Externa

Organize dados de teste em classes separadas:

```java
class TestDataProviders {

    static Stream<Arguments> loginScenarios() {
        return Stream.of(
            Arguments.of("admin", "admin123", true, "Dashboard"),
            Arguments.of("user", "user123", true, "Home"),
            Arguments.of("invalid", "wrong", false, "Login Error")
        );
    }

    static Stream<Arguments> searchQueries() {
        return Stream.of(
            Arguments.of("Selenium", 10),
            Arguments.of("Cucumber", 8),
            Arguments.of("JUnit", 15)
        );
    }
}

@ExtendWith(SerenityJUnit5Extension.class)
class LoginTests {

    @ParameterizedTest
    @MethodSource("com.example.TestDataProviders#loginScenarios")
    void shouldHandleLoginScenarios(String username, String password,
                                   boolean shouldSucceed, String expectedPage) {
        // Implementacao do teste
    }
}
```

### Enum Source

Teste com valores enum:

```java
enum UserRole {
    ADMIN, MANAGER, USER, GUEST
}

@ExtendWith(SerenityJUnit5Extension.class)
class RoleBasedTests {

    @ParameterizedTest
    @EnumSource(UserRole.class)
    void shouldHandleAllUserRoles(UserRole role) {
        // Testar cada role
    }

    @ParameterizedTest
    @EnumSource(value = UserRole.class, names = {"ADMIN", "MANAGER"})
    void shouldAllowAdminActions(UserRole role) {
        // Testar apenas roles admin e manager
    }
}
```

### Nomes de Exibicao Personalizados

Torne os relatorios de teste mais legiveis:

```java
@ParameterizedTest(name = "Search for ''{0}'' should return at least {1} results")
@CsvSource({
    "Selenium, 10",
    "Cucumber, 5",
    "JUnit,    8"
})
void searchTests(String term, int minimumResults) {
    // Implementacao do teste
}
```

Os placeholders `{0}`, `{1}` correspondem as posicoes dos parametros.

## Scenario Outline do Cucumber

O Cucumber fornece Scenario Outline para testes BDD orientados a dados.

### Scenario Outline Basico

**features/login.feature:**
```gherkin
Feature: User Login

  Scenario Outline: Login with different credentials
    Given the user is on the login page
    When the user logs in with username "<username>" and password "<password>"
    Then the login should <result>
    And the user should see the "<page>" page

    Examples:
      | username      | password     | result  | page      |
      | standard_user | secret_sauce | succeed | Products  |
      | locked_user   | secret_sauce | fail    | Login     |
      | invalid_user  | wrong_pass   | fail    | Login     |
```

### Step Definition com Screenplay

```java
import io.cucumber.java.en.*;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.abilities.BrowseTheWeb;
import net.serenitybdd.screenplay.actions.Open;
import static net.serenitybdd.screenplay.GivenWhenThen.*;

public class LoginStepDefinitions {

    @Given("{actor} is on the login page")
    public void userIsOnLoginPage(Actor actor) {
        actor.attemptsTo(
            Open.url("https://www.saucedemo.com")
        );
    }

    @When("{actor} logs in with username {string} and password {string}")
    public void userLogsIn(Actor actor, String username, String password) {
        actor.attemptsTo(
            Login.withCredentials(username, password)
        );
    }

    @Then("the login should {word}")
    public void verifyLoginResult(String result) {
        // Verificacao baseada no resultado
    }

    @Then("{actor} should see the {string} page")
    public void verifiesPage(Actor actor, String expectedPage) {
        actor.should(
            seeThat(TheCurrentPage.title(), containsString(expectedPage))
        );
    }
}
```

### Multiplas Tabelas de Examples

Use multiplas tabelas de Examples para organizar diferentes cenarios de teste:

```gherkin
Feature: Shopping Cart

  Scenario Outline: Add products to cart
    Given the user is logged in
    When the user adds "<product>" with quantity <quantity>
    Then the cart total should be <total>

    Examples: Single items
      | product  | quantity | total   |
      | Laptop   | 1        | 999.99  |
      | Mouse    | 1        | 29.99   |
      | Keyboard | 1        | 79.99   |

    Examples: Multiple quantities
      | product  | quantity | total   |
      | Mouse    | 3        | 89.97   |
      | Keyboard | 2        | 159.98  |
```

### Data Tables

Para estruturas de dados mais complexas, use Data Tables:

```gherkin
Feature: Bulk User Registration

  Scenario: Register multiple users
    Given the admin is logged in
    When the admin registers the following users:
      | username | email              | role    |
      | alice    | alice@example.com  | Admin   |
      | bob      | bob@example.com    | User    |
      | charlie  | charlie@example.com| Manager |
    Then all users should be created successfully
```

Step Definition:

```java
@When("the admin registers the following users:")
public void registerUsers(DataTable dataTable) {
    List<Map<String, String>> users = dataTable.asMaps();

    for (Map<String, String> user : users) {
        String username = user.get("username");
        String email = user.get("email");
        String role = user.get("role");

        actor.attemptsTo(
            RegisterUser.withDetails(username, email, role)
        );
    }
}
```

### Arquivos de Dados Externos com Cucumber

Carregue dados de arquivos externos:

```gherkin
Scenario: Register users from CSV
  Given the admin is logged in
  When the admin imports users from "test-data/users.csv"
  Then all users should be registered
```

```java
@When("the admin imports users from {string}")
public void importUsersFromFile(String filePath) {
    List<User> users = UserDataLoader.fromCsv(filePath);

    users.forEach(user ->
        actor.attemptsTo(RegisterUser.with(user))
    );
}
```

## Fontes de Dados Externas

### Lendo de Arquivos CSV

Crie um leitor de CSV reutilizavel:

```java
public class CsvDataReader {

    public static List<Map<String, String>> readCsv(String filePath) {
        List<Map<String, String>> data = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new FileReader(filePath))) {

            String headerLine = reader.readLine();
            String[] headers = headerLine.split(",");

            String line;
            while ((line = reader.readLine()) != null) {
                String[] values = line.split(",");
                Map<String, String> row = new HashMap<>();

                for (int i = 0; i < headers.length; i++) {
                    row.put(headers[i].trim(), values[i].trim());
                }
                data.add(row);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to read CSV file: " + filePath, e);
        }

        return data;
    }
}
```

### Lendo de Arquivos JSON

Use Jackson ou Gson para ler dados de teste JSON:

**src/test/resources/test-data/products.json:**
```json
[
  {
    "name": "Laptop",
    "price": 999.99,
    "category": "Electronics",
    "inStock": true
  },
  {
    "name": "Mouse",
    "price": 29.99,
    "category": "Accessories",
    "inStock": true
  }
]
```

```java
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

public class JsonDataReader {

    private static final ObjectMapper mapper = new ObjectMapper();

    public static <T> List<T> readJson(String filePath, Class<T> type) {
        try {
            InputStream stream = JsonDataReader.class
                .getResourceAsStream(filePath);
            return mapper.readValue(stream,
                mapper.getTypeFactory().constructCollectionType(List.class, type));
        } catch (IOException e) {
            throw new RuntimeException("Failed to read JSON file: " + filePath, e);
        }
    }
}

// Uso
@MethodSource("productData")
static Stream<Product> productData() {
    List<Product> products = JsonDataReader.readJson(
        "/test-data/products.json",
        Product.class
    );
    return products.stream();
}
```

### Lendo de Arquivos Excel

Use Apache POI para arquivos Excel:

```xml
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.3</version>
    <scope>test</scope>
</dependency>
```

```java
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

public class ExcelDataReader {

    public static List<Map<String, String>> readExcel(String filePath, String sheetName) {
        List<Map<String, String>> data = new ArrayList<>();

        try (FileInputStream fis = new FileInputStream(filePath);
             Workbook workbook = new XSSFWorkbook(fis)) {

            Sheet sheet = workbook.getSheet(sheetName);
            Row headerRow = sheet.getRow(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                Map<String, String> rowData = new HashMap<>();

                for (int j = 0; j < headerRow.getLastCellNum(); j++) {
                    String header = headerRow.getCell(j).getStringCellValue();
                    String value = getCellValueAsString(row.getCell(j));
                    rowData.put(header, value);
                }
                data.add(rowData);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to read Excel file", e);
        }

        return data;
    }

    private static String getCellValueAsString(Cell cell) {
        if (cell == null) return "";

        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue();
            case NUMERIC: return String.valueOf(cell.getNumericCellValue());
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue());
            default: return "";
        }
    }
}
```

## Builders de Dados de Teste

Use o padrao Builder para dados de teste complexos:

```java
public class UserBuilder {
    private String username;
    private String email;
    private String password;
    private String role = "USER";
    private boolean active = true;

    public static UserBuilder aUser() {
        return new UserBuilder();
    }

    public UserBuilder withUsername(String username) {
        this.username = username;
        return this;
    }

    public UserBuilder withEmail(String email) {
        this.email = email;
        return this;
    }

    public UserBuilder withPassword(String password) {
        this.password = password;
        return this;
    }

    public UserBuilder withRole(String role) {
        this.role = role;
        return this;
    }

    public UserBuilder inactive() {
        this.active = false;
        return this;
    }

    public User build() {
        return new User(username, email, password, role, active);
    }
}

// Uso
@MethodSource("userTestData")
static Stream<User> userTestData() {
    return Stream.of(
        aUser().withUsername("admin").withRole("ADMIN").build(),
        aUser().withUsername("user1").withEmail("user1@example.com").build(),
        aUser().withUsername("inactive").inactive().build()
    );
}
```

## Usando Faker para Dados Aleatorios

Gere dados de teste aleatorios realistas:

```xml
<dependency>
    <groupId>com.github.javafaker</groupId>
    <artifactId>javafaker</artifactId>
    <version>1.0.2</version>
    <scope>test</scope>
</dependency>
```

```java
import com.github.javafaker.Faker;

public class TestDataGenerator {
    private static final Faker faker = new Faker();

    public static User randomUser() {
        return aUser()
            .withUsername(faker.name().username())
            .withEmail(faker.internet().emailAddress())
            .withPassword(faker.internet().password(8, 16))
            .build();
    }

    public static Product randomProduct() {
        return new Product(
            faker.commerce().productName(),
            Double.parseDouble(faker.commerce().price()),
            faker.commerce().department()
        );
    }
}

// Uso em testes
@ParameterizedTest
@MethodSource("randomUsers")
void shouldRegisterRandomUsers(User user) {
    registration.registerUser(user);
    registration.shouldSucceed();
}

static Stream<User> randomUsers() {
    return Stream.generate(TestDataGenerator::randomUser).limit(10);
}
```

## Melhores Praticas

### 1. Mantenha os Dados de Teste Proximos aos Testes

```
src/test/resources/
├── test-data/
│   ├── users/
│   │   ├── valid-users.csv
│   │   └── invalid-users.csv
│   ├── products/
│   │   └── products.json
│   └── shared/
│       └── countries.csv
```

### 2. Use Nomes de Teste Significativos

```java
@ParameterizedTest(name = "User ''{0}'' with role ''{1}'' should access ''{2}''")
@CsvSource({
    "admin, ADMIN, dashboard",
    "user,  USER,  homepage"
})
void accessControlTests(String username, String role, String page) {
    // Implementacao do teste
}
```

### 3. Valide os Dados de Teste

```java
@MethodSource("userData")
static Stream<User> userData() {
    return loadUsersFromCsv("/test-data/users.csv")
        .stream()
        .peek(user -> {
            assertThat(user.getEmail()).contains("@");
            assertThat(user.getPassword()).hasSizeGreaterThan(8);
        });
}
```

### 4. Isole os Dados de Teste

Garanta que cada teste tenha seus proprios dados independentes:

```java
@BeforeEach
void setUp() {
    // Limpar quaisquer dados de teste existentes
    testDataCleanup.deleteTestUsers();
}

@ParameterizedTest
@MethodSource("userTestData")
void userTests(User user) {
    // Cada teste recebe dados novos
    String uniqueUsername = user.getUsername() + "_" + UUID.randomUUID();
    User isolatedUser = user.withUsername(uniqueUsername);
    // Testar com dados isolados
}
```

### 5. Documente os Requisitos de Dados

```java
/**
 * Testa o registro de usuarios com varias entradas validas.
 *
 * Requisitos de dados de teste:
 * - Username: 3-20 caracteres, alfanumerico
 * - Email: Formato de email valido
 * - Password: Minimo 8 caracteres
 * - Role: Um de [USER, ADMIN, MANAGER]
 */
@ParameterizedTest
@CsvFileSource(resources = "/test-data/valid-users.csv")
void shouldRegisterValidUsers(String username, String email,
                              String password, String role) {
    // Implementacao do teste
}
```

### 6. Separe Dados Validos e Invalidos

```java
// Testes de dados validos
@ParameterizedTest
@CsvFileSource(resources = "/test-data/valid-users.csv")
void shouldAcceptValidUsers(User user) {
    // Espera sucesso
}

// Testes de dados invalidos
@ParameterizedTest
@CsvFileSource(resources = "/test-data/invalid-users.csv")
void shouldRejectInvalidUsers(User user, String expectedError) {
    // Espera erro especifico
}
```

## Exemplo Completo: Teste de E-Commerce

Aqui esta um exemplo completo combinando multiplas tecnicas:

**Product.java:**
```java
public class Product {
    private final String name;
    private final double price;
    private final String category;
    private final boolean inStock;

    // Construtor, getters, builder...
}
```

**test-data/products.csv:**
```csv
name,price,category,inStock,expectedInCart
Laptop,999.99,Electronics,true,true
Headphones,79.99,Audio,true,true
Out of Stock Item,49.99,Misc,false,false
```

**ShoppingTests.java:**
```java
@ExtendWith(SerenityJUnit5Extension.class)
class ShoppingTests {

    @Steps
    ShoppingActions shopping;

    @ParameterizedTest(name = "Adding {0} (${1}) should {4}")
    @CsvFileSource(resources = "/test-data/products.csv", numLinesToSkip = 1)
    void shouldHandleProductAddition(String name, double price, String category,
                                     boolean inStock, boolean expectedInCart) {
        Product product = new Product(name, price, category, inStock);

        shopping.addProductToCart(product);

        if (expectedInCart) {
            shopping.shouldSeeProductInCart(product);
            shopping.cartTotalShouldBe(price);
        } else {
            shopping.shouldSeeOutOfStockMessage();
        }
    }
}
```

## Solucao de Problemas

### Problema: Testes parametrizados nao executando

**Solucao:** Certifique-se de ter a dependencia junit-jupiter-params e usar `@ParameterizedTest` e nao `@Test`.

### Problema: Dados CSV nao carregando

**Solucao:**
- Verifique se o caminho do arquivo e relativo a `src/test/resources`
- Verifique se `numLinesToSkip` esta definido corretamente
- Verifique a formatacao correta do CSV

### Problema: Dados aparecendo em ordem errada

**Solucao:** O JUnit nao garante a ordem de execucao. Use `@TestMethodOrder` se necessario:

```java
@TestMethodOrder(OrderAnnotation.class)
class OrderedTests {
    @ParameterizedTest
    @Order(1)
    @ValueSource(strings = {"first"})
    void test1(String value) { }
}
```

## Proximos Passos

- Explore o [Screenplay Pattern](/docs/screenplay/screenplay_fundamentals) para melhor organizacao de testes
- Aprenda sobre [Execucao Paralela](/docs/junit5/parallel-execution) para acelerar testes orientados a dados
- Confira [Relatorios Serenity](/docs/reporting/the_serenity_reports) para ver como testes parametrizados aparecem nos relatorios

## Recursos Adicionais

- [Guia de Testes Parametrizados JUnit 5](https://junit.org/junit5/docs/current/user-guide/#writing-tests-parameterized-tests)
- [Scenario Outline do Cucumber](https://cucumber.io/docs/gherkin/reference/#scenario-outline)
- [Documentacao do JavaFaker](https://github.com/DiUS/java-faker)
