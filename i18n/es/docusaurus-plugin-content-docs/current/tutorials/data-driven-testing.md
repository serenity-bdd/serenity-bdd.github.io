---
id: data-driven-testing
title: Pruebas basadas en datos con Serenity BDD
sidebar_position: 5
---

# Pruebas basadas en datos con Serenity BDD

Las pruebas basadas en datos te permiten ejecutar la misma lógica de prueba con múltiples conjuntos de datos de entrada, haciendo tus pruebas más completas y mantenibles. Esta guía cubre enfoques de pruebas basadas en datos tanto con JUnit 5 como con Cucumber.

## Prerrequisitos

- Java 17 o superior
- Serenity BDD 5.2.2 o superior
- JUnit 5 6.0.1 o superior (para ejemplos de JUnit)
- Cucumber 7.33.0 o superior (para ejemplos de Cucumber)

## ¿Por qué pruebas basadas en datos?

Las pruebas basadas en datos te ayudan a:
- **Probar múltiples escenarios** con mínima duplicación de código
- **Mejorar la cobertura de pruebas** probando casos límite y valores frontera
- **Separar la lógica de prueba de los datos de prueba** para mejor mantenibilidad
- **Hacer las pruebas más legibles** mostrando claramente qué varía entre casos de prueba

## Pruebas parametrizadas con JUnit 5

JUnit 5 proporciona potentes capacidades de pruebas parametrizadas a través de `@ParameterizedTest`.

### Configuración básica

Primero, agrega la dependencia de parámetros de JUnit Jupiter:

```xml
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-params</artifactId>
    <version>6.0.1</version>
    <scope>test</scope>
</dependency>
```

### Fuentes de valores simples

Usa `@ValueSource` para tipos de datos simples:

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
        // Navegar a la página de búsqueda
        driver.get("https://duckduckgo.com");

        // Realizar búsqueda con cada término
        SearchPage searchPage = new SearchPage(driver);
        searchPage.searchFor(searchTerm);

        // Verificar resultados
        assertThat(searchPage.getResults()).isNotEmpty();
    }
}
```

**Tipos soportados para @ValueSource:**
- `strings` - Valores String
- `ints` - Valores Integer
- `longs` - Valores Long
- `doubles` - Valores Double
- `booleans` - Valores Boolean

### CSV Source - Datos en línea

Usa `@CsvSource` para múltiples parámetros por caso de prueba:

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

**Consejos para @CsvSource:**
- Los valores están separados por comas por defecto
- Usa comillas simples para cadenas que contengan comas: `'valor, con, comas'`
- Los valores vacíos se tratan como null
- Los espacios en blanco se eliminan por defecto

### CSV Source con delimitador personalizado

```java
@ParameterizedTest
@CsvSource(delimiter = '|', value = {
    "Alice | alice@example.com | Premium",
    "Bob   | bob@example.com   | Standard",
    "Carol | carol@example.com | Basic"
})
void shouldHandleDifferentUserTypes(String name, String email, String accountType) {
    // Implementación del test
}
```

### CSV File Source - Datos externos

Almacena datos de prueba en archivos CSV externos para mejor mantenibilidad:

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

**Opciones de @CsvFileSource:**
- `resources` - Ruta al archivo CSV (relativa a src/test/resources)
- `numLinesToSkip` - Omitir fila de encabezado (típicamente 1)
- `delimiter` - Delimitador personalizado (por defecto es coma)
- `encoding` - Codificación del archivo (por defecto es UTF-8)

### Method Source - Objetos complejos

Usa `@MethodSource` para datos de prueba complejos o cuando necesites más control:

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

### Method Source desde clase externa

Organiza los datos de prueba en clases separadas:

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
        // Implementación del test
    }
}
```

### Enum Source

Prueba con valores de enum:

```java
enum UserRole {
    ADMIN, MANAGER, USER, GUEST
}

@ExtendWith(SerenityJUnit5Extension.class)
class RoleBasedTests {

    @ParameterizedTest
    @EnumSource(UserRole.class)
    void shouldHandleAllUserRoles(UserRole role) {
        // Probar cada rol
    }

    @ParameterizedTest
    @EnumSource(value = UserRole.class, names = {"ADMIN", "MANAGER"})
    void shouldAllowAdminActions(UserRole role) {
        // Probar solo roles admin y manager
    }
}
```

### Nombres de visualización personalizados

Haz los reportes de pruebas más legibles:

```java
@ParameterizedTest(name = "Buscar ''{0}'' debería retornar al menos {1} resultados")
@CsvSource({
    "Selenium, 10",
    "Cucumber, 5",
    "JUnit,    8"
})
void searchTests(String term, int minimumResults) {
    // Implementación del test
}
```

Los marcadores `{0}`, `{1}` corresponden a las posiciones de los parámetros.

## Scenario Outline de Cucumber

Cucumber proporciona Scenario Outline para pruebas BDD basadas en datos.

### Scenario Outline básico

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

### Step Definition con Screenplay

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
        // Verificación basada en el resultado
    }

    @Then("{actor} should see the {string} page")
    public void verifiesPage(Actor actor, String expectedPage) {
        actor.should(
            seeThat(TheCurrentPage.title(), containsString(expectedPage))
        );
    }
}
```

### Múltiples tablas de Examples

Usa múltiples tablas de Examples para organizar diferentes escenarios de prueba:

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

### Tablas de datos

Para estructuras de datos más complejas, usa Data Tables:

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

### Archivos de datos externos con Cucumber

Carga datos desde archivos externos:

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

## Fuentes de datos externos

### Lectura desde archivos CSV

Crea un lector de CSV reutilizable:

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

### Lectura desde archivos JSON

Usa Jackson o Gson para leer datos de prueba en JSON:

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

### Lectura desde archivos Excel

Usa Apache POI para archivos Excel:

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

## Constructores de datos de prueba

Usa el patrón Builder para datos de prueba complejos:

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

## Uso de Faker para datos aleatorios

Genera datos de prueba aleatorios realistas:

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

// Uso en pruebas
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

## Mejores prácticas

### 1. Mantén los datos de prueba cerca de las pruebas

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

### 2. Usa nombres de prueba significativos

```java
@ParameterizedTest(name = "Usuario ''{0}'' con rol ''{1}'' debería acceder a ''{2}''")
@CsvSource({
    "admin, ADMIN, dashboard",
    "user,  USER,  homepage"
})
void accessControlTests(String username, String role, String page) {
    // Implementación del test
}
```

### 3. Valida los datos de prueba

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

### 4. Aísla los datos de prueba

Asegúrate de que cada prueba tenga sus propios datos independientes:

```java
@BeforeEach
void setUp() {
    // Limpiar cualquier dato de prueba existente
    testDataCleanup.deleteTestUsers();
}

@ParameterizedTest
@MethodSource("userTestData")
void userTests(User user) {
    // Cada prueba obtiene datos frescos
    String uniqueUsername = user.getUsername() + "_" + UUID.randomUUID();
    User isolatedUser = user.withUsername(uniqueUsername);
    // Probar con datos aislados
}
```

### 5. Documenta los requisitos de datos

```java
/**
 * Prueba el registro de usuarios con varias entradas válidas.
 *
 * Requisitos de datos de prueba:
 * - Username: 3-20 caracteres, alfanumérico
 * - Email: Formato de email válido
 * - Password: Mínimo 8 caracteres
 * - Role: Uno de [USER, ADMIN, MANAGER]
 */
@ParameterizedTest
@CsvFileSource(resources = "/test-data/valid-users.csv")
void shouldRegisterValidUsers(String username, String email,
                              String password, String role) {
    // Implementación del test
}
```

### 6. Separa datos válidos e inválidos

```java
// Pruebas con datos válidos
@ParameterizedTest
@CsvFileSource(resources = "/test-data/valid-users.csv")
void shouldAcceptValidUsers(User user) {
    // Esperar éxito
}

// Pruebas con datos inválidos
@ParameterizedTest
@CsvFileSource(resources = "/test-data/invalid-users.csv")
void shouldRejectInvalidUsers(User user, String expectedError) {
    // Esperar error específico
}
```

## Ejemplo completo: Pruebas de comercio electrónico

Aquí hay un ejemplo completo combinando múltiples técnicas:

**Product.java:**
```java
public class Product {
    private final String name;
    private final double price;
    private final String category;
    private final boolean inStock;

    // Constructor, getters, builder...
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

    @ParameterizedTest(name = "Agregar {0} (${1}) debería {4}")
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

## Solución de problemas

### Problema: Las pruebas parametrizadas no se ejecutan

**Solución:** Asegúrate de tener la dependencia junit-jupiter-params y usa `@ParameterizedTest` en lugar de `@Test`.

### Problema: Los datos CSV no se cargan

**Solución:**
- Verifica que la ruta del archivo sea relativa a `src/test/resources`
- Verifica que `numLinesToSkip` esté configurado correctamente
- Comprueba el formato correcto del CSV

### Problema: Los datos aparecen en orden incorrecto

**Solución:** JUnit no garantiza el orden de ejecución. Usa `@TestMethodOrder` si es necesario:

```java
@TestMethodOrder(OrderAnnotation.class)
class OrderedTests {
    @ParameterizedTest
    @Order(1)
    @ValueSource(strings = {"first"})
    void test1(String value) { }
}
```

## Siguientes pasos

- Explora el [Screenplay Pattern](/docs/screenplay/screenplay_fundamentals) para mejor organización de pruebas
- Aprende sobre [Ejecución Paralela](/docs/junit5/parallel-execution) para acelerar pruebas basadas en datos
- Consulta los [Reportes de Serenity](/docs/reporting/the_serenity_reports) para ver cómo aparecen las pruebas parametrizadas en los reportes

## Recursos adicionales

- [Guía de pruebas parametrizadas de JUnit 5](https://junit.org/junit5/docs/current/user-guide/#writing-tests-parameterized-tests)
- [Scenario Outline de Cucumber](https://cucumber.io/docs/gherkin/reference/#scenario-outline)
- [Documentación de JavaFaker](https://github.com/DiUS/java-faker)
