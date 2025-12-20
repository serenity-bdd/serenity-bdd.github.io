---
id: data-driven-testing
title: Data-Driven Testing with Serenity BDD
sidebar_position: 5
---

# Data-Driven Testing with Serenity BDD

Data-driven testing allows you to run the same test logic with multiple sets of input data, making your tests more comprehensive and maintainable. This guide covers data-driven testing approaches with both JUnit 5 and Cucumber.

## Prerequisites

- Java 17 or higher
- Serenity BDD 5.0.2 or higher
- JUnit 5 6.0.1 or higher (for JUnit examples)
- Cucumber 7.33.0 or higher (for Cucumber examples)

## Why Data-Driven Testing?

Data-driven testing helps you:
- **Test multiple scenarios** with minimal code duplication
- **Improve test coverage** by testing edge cases and boundary values
- **Separate test logic from test data** for better maintainability
- **Make tests more readable** by clearly showing what varies between test cases

## JUnit 5 Parameterized Tests

JUnit 5 provides powerful parameterized testing capabilities through `@ParameterizedTest`.

### Basic Setup

First, add the JUnit Jupiter parameters dependency:

```xml
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-params</artifactId>
    <version>6.0.1</version>
    <scope>test</scope>
</dependency>
```

### Simple Value Sources

Use `@ValueSource` for simple data types:

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
        // Navigate to search page
        driver.get("https://duckduckgo.com");

        // Perform search with each term
        SearchPage searchPage = new SearchPage(driver);
        searchPage.searchFor(searchTerm);

        // Verify results
        assertThat(searchPage.getResults()).isNotEmpty();
    }
}
```

**Supported types for @ValueSource:**
- `strings` - String values
- `ints` - Integer values
- `longs` - Long values
- `doubles` - Double values
- `booleans` - Boolean values

### CSV Source - Inline Data

Use `@CsvSource` for multiple parameters per test case:

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

**Tips for @CsvSource:**
- Values are comma-separated by default
- Use single quotes for strings containing commas: `'value, with, commas'`
- Empty values are treated as null
- Whitespace is trimmed by default

### CSV Source with Custom Delimiter

```java
@ParameterizedTest
@CsvSource(delimiter = '|', value = {
    "Alice | alice@example.com | Premium",
    "Bob   | bob@example.com   | Standard",
    "Carol | carol@example.com | Basic"
})
void shouldHandleDifferentUserTypes(String name, String email, String accountType) {
    // Test implementation
}
```

### CSV File Source - External Data

Store test data in external CSV files for better maintainability:

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

**@CsvFileSource options:**
- `resources` - Path to CSV file (relative to src/test/resources)
- `numLinesToSkip` - Skip header row (typically 1)
- `delimiter` - Custom delimiter (default is comma)
- `encoding` - File encoding (default is UTF-8)

### Method Source - Complex Objects

Use `@MethodSource` for complex test data or when you need more control:

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

### Method Source from External Class

Organize test data in separate classes:

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
        // Test implementation
    }
}
```

### Enum Source

Test with enum values:

```java
enum UserRole {
    ADMIN, MANAGER, USER, GUEST
}

@ExtendWith(SerenityJUnit5Extension.class)
class RoleBasedTests {

    @ParameterizedTest
    @EnumSource(UserRole.class)
    void shouldHandleAllUserRoles(UserRole role) {
        // Test each role
    }

    @ParameterizedTest
    @EnumSource(value = UserRole.class, names = {"ADMIN", "MANAGER"})
    void shouldAllowAdminActions(UserRole role) {
        // Test only admin and manager roles
    }
}
```

### Custom Display Names

Make test reports more readable:

```java
@ParameterizedTest(name = "Search for ''{0}'' should return at least {1} results")
@CsvSource({
    "Selenium, 10",
    "Cucumber, 5",
    "JUnit,    8"
})
void searchTests(String term, int minimumResults) {
    // Test implementation
}
```

The `{0}`, `{1}` placeholders correspond to parameter positions.

## Cucumber Scenario Outlines

Cucumber provides Scenario Outlines for data-driven BDD tests.

### Basic Scenario Outline

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

### Step Definitions with Screenplay

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
        // Verification based on result
    }

    @Then("{actor} should see the {string} page")
    public void verifiesPage(Actor actor, String expectedPage) {
        actor.should(
            seeThat(TheCurrentPage.title(), containsString(expectedPage))
        );
    }
}
```

### Multiple Examples Tables

Use multiple Examples tables to organize different test scenarios:

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

For more complex data structures, use Data Tables:

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

Step definition:

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

### External Data Files with Cucumber

Load data from external files:

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

## External Data Sources

### Reading from CSV Files

Create a reusable CSV reader:

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

### Reading from JSON Files

Use Jackson or Gson to read JSON test data:

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

// Usage
@MethodSource("productData")
static Stream<Product> productData() {
    List<Product> products = JsonDataReader.readJson(
        "/test-data/products.json",
        Product.class
    );
    return products.stream();
}
```

### Reading from Excel Files

Use Apache POI for Excel files:

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

## Test Data Builders

Use the Builder pattern for complex test data:

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

// Usage
@MethodSource("userTestData")
static Stream<User> userTestData() {
    return Stream.of(
        aUser().withUsername("admin").withRole("ADMIN").build(),
        aUser().withUsername("user1").withEmail("user1@example.com").build(),
        aUser().withUsername("inactive").inactive().build()
    );
}
```

## Using Faker for Random Data

Generate realistic random test data:

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

// Usage in tests
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

## Best Practices

### 1. Keep Test Data Close to Tests

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

### 2. Use Meaningful Test Names

```java
@ParameterizedTest(name = "User ''{0}'' with role ''{1}'' should access ''{2}''")
@CsvSource({
    "admin, ADMIN, dashboard",
    "user,  USER,  homepage"
})
void accessControlTests(String username, String role, String page) {
    // Test implementation
}
```

### 3. Validate Test Data

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

### 4. Isolate Test Data

Ensure each test has its own independent data:

```java
@BeforeEach
void setUp() {
    // Clean up any existing test data
    testDataCleanup.deleteTestUsers();
}

@ParameterizedTest
@MethodSource("userTestData")
void userTests(User user) {
    // Each test gets fresh data
    String uniqueUsername = user.getUsername() + "_" + UUID.randomUUID();
    User isolatedUser = user.withUsername(uniqueUsername);
    // Test with isolated data
}
```

### 5. Document Data Requirements

```java
/**
 * Tests user registration with various valid inputs.
 *
 * Test data requirements:
 * - Username: 3-20 characters, alphanumeric
 * - Email: Valid email format
 * - Password: Minimum 8 characters
 * - Role: One of [USER, ADMIN, MANAGER]
 */
@ParameterizedTest
@CsvFileSource(resources = "/test-data/valid-users.csv")
void shouldRegisterValidUsers(String username, String email,
                              String password, String role) {
    // Test implementation
}
```

### 6. Separate Valid and Invalid Data

```java
// Valid data tests
@ParameterizedTest
@CsvFileSource(resources = "/test-data/valid-users.csv")
void shouldAcceptValidUsers(User user) {
    // Expect success
}

// Invalid data tests
@ParameterizedTest
@CsvFileSource(resources = "/test-data/invalid-users.csv")
void shouldRejectInvalidUsers(User user, String expectedError) {
    // Expect specific error
}
```

## Complete Example: E-Commerce Testing

Here's a complete example combining multiple techniques:

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

## Troubleshooting

### Issue: Parameterized tests not running

**Solution:** Ensure you have the junit-jupiter-params dependency and use `@ParameterizedTest` not `@Test`.

### Issue: CSV data not loading

**Solution:**
- Check file path is relative to `src/test/resources`
- Verify `numLinesToSkip` is set correctly
- Check for proper CSV formatting

### Issue: Data appearing in wrong order

**Solution:** JUnit doesn't guarantee execution order. Use `@TestMethodOrder` if needed:

```java
@TestMethodOrder(OrderAnnotation.class)
class OrderedTests {
    @ParameterizedTest
    @Order(1)
    @ValueSource(strings = {"first"})
    void test1(String value) { }
}
```

## Next Steps

- Explore [Screenplay Pattern](/docs/screenplay/screenplay_fundamentals) for better test organization
- Learn about [Parallel Execution](/docs/junit5/parallel-execution) to speed up data-driven tests
- Check out [Serenity Reports](/docs/reporting/the_serenity_reports) to see how parameterized tests appear in reports

## Additional Resources

- [JUnit 5 Parameterized Tests Guide](https://junit.org/junit5/docs/current/user-guide/#writing-tests-parameterized-tests)
- [Cucumber Scenario Outlines](https://cucumber.io/docs/gherkin/reference/#scenario-outline)
- [JavaFaker Documentation](https://github.com/DiUS/java-faker)
