---
id: junit5-tests
title: JUnit 5 with Serenity BDD
sidebar_position: 1
---

# Running Serenity BDD Tests with JUnit 5

This guide covers everything you need to know to write and run Serenity BDD tests using JUnit 5 (Jupiter), without Cucumber.

## Overview

JUnit 5 is the latest version of the popular Java testing framework. Combined with Serenity BDD, you get:

- **Modern Test Features**: Parameterized tests, nested tests, dynamic tests, and more
- **Powerful Assertions**: Built-in and third-party assertion libraries
- **Rich Reporting**: Serenity's detailed reports with screenshots and step-by-step execution details
- **Parallel Execution**: Run tests concurrently for faster feedback
- **Flexible Organization**: Tags, nested classes, and display names for better test organization

:::tip JUnit 5 Recommended
JUnit 4 is deprecated as of Serenity 5.0.0 and will be removed in Serenity 6.0.0. All new projects should use JUnit 5.
:::

## Prerequisites

- Java 17 or higher
- Maven or Gradle
- An IDE with Java support (IntelliJ IDEA, Eclipse, VS Code, etc.)

## Setting Up Dependencies

### Maven Dependencies

Add the following to your `pom.xml`:

```xml
<properties>
    <serenity.version>5.2.2</serenity.version>
    <junit.version>6.0.1</junit.version>
</properties>

<dependencies>
    <!-- Serenity JUnit 5 Integration -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-junit5</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Serenity Screenplay (optional, but recommended) -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-screenplay</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Serenity WebDriver integration (for web tests) -->
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

    <!-- AssertJ (recommended for fluent assertions) -->
    <dependency>
        <groupId>org.assertj</groupId>
        <artifactId>assertj-core</artifactId>
        <version>3.24.2</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### Gradle Dependencies

For Gradle, add to your `build.gradle`:

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

## Writing Your First Test

### Basic Test Structure

Every Serenity JUnit 5 test must be annotated with `@ExtendWith(SerenityJUnit5Extension.class)`:

```java
import net.serenitybdd.junit5.SerenityJUnit5Extension;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(SerenityJUnit5Extension.class)
class WhenSearchingForProducts {

    @Test
    void shouldFindProductByName() {
        // Your test code here
    }

    @Test
    void shouldFilterProductsByCategory() {
        // Your test code here
    }
}
```

### Web Test Example

Here's a complete example of a web test:

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

### Using Step Libraries

For better organization, use Serenity step libraries:

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

## Test Lifecycle

### Method-Level Lifecycle

Use JUnit 5 lifecycle annotations:

```java
import org.junit.jupiter.api.*;

@ExtendWith(SerenityJUnit5Extension.class)
class ProductTests {

    @BeforeEach
    void setUp() {
        // Runs before each test method
        System.out.println("Setting up test");
    }

    @AfterEach
    void tearDown() {
        // Runs after each test method
        System.out.println("Cleaning up test");
    }

    @BeforeAll
    static void setUpClass() {
        // Runs once before all tests in this class
        System.out.println("Setting up test class");
    }

    @AfterAll
    static void tearDownClass() {
        // Runs once after all tests in this class
        System.out.println("Cleaning up test class");
    }

    @Test
    void test1() {
        // Test code
    }

    @Test
    void test2() {
        // Test code
    }
}
```

### Execution Order

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

## Display Names and Organization

### Custom Display Names

Make test names more readable in reports:

```java
import org.junit.jupiter.api.DisplayName;

@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("Shopping Cart Management")
class ShoppingCartTests {

    @Test
    @DisplayName("Should add product to empty cart")
    void addToEmptyCart() {
        // Test code
    }

    @Test
    @DisplayName("Should update quantity of existing product")
    void updateQuantity() {
        // Test code
    }

    @Test
    @DisplayName("Should remove product from cart")
    void removeProduct() {
        // Test code
    }
}
```

### Nested Tests

Organize related tests with `@Nested`:

```java
import org.junit.jupiter.api.Nested;

@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("User Authentication")
class AuthenticationTests {

    @Nested
    @DisplayName("When logging in")
    class Login {

        @Test
        @DisplayName("Should succeed with valid credentials")
        void validCredentials() {
            // Test code
        }

        @Test
        @DisplayName("Should fail with invalid password")
        void invalidPassword() {
            // Test code
        }

        @Test
        @DisplayName("Should fail with non-existent user")
        void nonExistentUser() {
            // Test code
        }
    }

    @Nested
    @DisplayName("When logging out")
    class Logout {

        @Test
        @DisplayName("Should clear session")
        void clearSession() {
            // Test code
        }

        @Test
        @DisplayName("Should redirect to login page")
        void redirectToLogin() {
            // Test code
        }
    }
}
```

## Parameterized Tests

### Simple Parameterized Tests

```java
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

@ExtendWith(SerenityJUnit5Extension.class)
class SearchTests {

    @Steps
    SearchSteps search;

    @ParameterizedTest
    @ValueSource(strings = {"laptop", "phone", "tablet"})
    @DisplayName("Should find products for search term: {0}")
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
@DisplayName("Should login as {0} and see {2}")
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
@DisplayName("Should process order for {0}")
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

## Tags and Filtering

### Tagging Tests

Use `@Tag` to categorize tests:

```java
import org.junit.jupiter.api.Tag;

@ExtendWith(SerenityJUnit5Extension.class)
class ProductTests {

    @Test
    @Tag("smoke")
    @Tag("fast")
    void quickSanityCheck() {
        // Fast smoke test
    }

    @Test
    @Tag("regression")
    @Tag("slow")
    void comprehensiveTest() {
        // Full regression test
    }

    @Test
    @Tag("wip")
    void workInProgress() {
        // Test under development
    }
}
```

### Running Tagged Tests

**Maven:**
```bash
# Run only smoke tests
mvn test -Dgroups=smoke

# Run smoke OR regression
mvn test -Dgroups="smoke | regression"

# Run smoke AND fast
mvn test -Dgroups="smoke & fast"

# Exclude wip tests
mvn test -DexcludedGroups=wip
```

**junit-platform.properties:**
```properties
junit.jupiter.includeTags=smoke
junit.jupiter.excludeTags=wip,slow
```

## Conditional Test Execution

### OS-Specific Tests

```java
import org.junit.jupiter.api.condition.*;

@Test
@EnabledOnOs(OS.WINDOWS)
void runOnlyOnWindows() {
    // Windows-specific test
}

@Test
@DisabledOnOs(OS.MAC)
void dontRunOnMac() {
    // Test disabled on macOS
}
```

### Java Version-Specific

```java
@Test
@EnabledOnJre(JRE.JAVA_17)
void runOnlyOnJava17() {
    // Java 17 specific test
}

@Test
@EnabledForJreRange(min = JRE.JAVA_17, max = JRE.JAVA_21)
void runOnJava17To21() {
    // Modern Java versions
}
```

### Custom Conditions

```java
@Test
@EnabledIf("isProductionEnvironment")
void runOnlyInProduction() {
    // Production-only test
}

boolean isProductionEnvironment() {
    return System.getProperty("env", "dev").equals("prod");
}
```

## Assertions

### JUnit 5 Assertions

```java
import static org.junit.jupiter.api.Assertions.*;

@Test
void demonstrateAssertions() {
    // Basic assertions
    assertEquals(expected, actual);
    assertTrue(condition);
    assertFalse(condition);
    assertNull(object);
    assertNotNull(object);

    // Array assertions
    assertArrayEquals(expectedArray, actualArray);

    // Exception assertions
    assertThrows(IllegalArgumentException.class, () -> {
        // Code that should throw exception
    });

    // Timeout assertions
    assertTimeout(Duration.ofSeconds(2), () -> {
        // Code that should complete within 2 seconds
    });

    // Grouped assertions
    assertAll("User validation",
        () -> assertEquals("John", user.getFirstName()),
        () -> assertEquals("Doe", user.getLastName()),
        () -> assertTrue(user.isActive())
    );
}
```

### AssertJ (Recommended)

```java
import static org.assertj.core.api.Assertions.*;

@Test
void demonstrateAssertJ() {
    // Fluent assertions
    assertThat(actual).isEqualTo(expected);
    assertThat(list).hasSize(3)
                    .contains("item1", "item2")
                    .doesNotContain("item3");

    // String assertions
    assertThat(text).startsWith("Hello")
                    .endsWith("World")
                    .contains("Test");

    // Exception assertions
    assertThatThrownBy(() -> methodThatThrows())
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Invalid input");

    // Soft assertions (continue even after failures)
    SoftAssertions softly = new SoftAssertions();
    softly.assertThat(user.getName()).isEqualTo("John");
    softly.assertThat(user.getAge()).isGreaterThan(18);
    softly.assertAll();
}
```

## Parallel Execution

See the dedicated [Parallel Execution Guide](parallel-execution) for comprehensive coverage.

Quick example in `junit-platform.properties`:

```properties
# Enable parallel execution
junit.jupiter.execution.parallel.enabled=true

# Run test classes in parallel
junit.jupiter.execution.parallel.mode.default=concurrent

# Run test methods in same class sequentially
junit.jupiter.execution.parallel.mode.classes.default=concurrent

# Use dynamic strategy
junit.jupiter.execution.parallel.config.strategy=dynamic
junit.jupiter.execution.parallel.config.dynamic.factor=1.0
```

## Best Practices

### 1. Test Naming

```java
// Good - Describes behavior
@Test
void shouldCalculateDiscountForRegularCustomer() { }

// Better - Even more descriptive
@Test
@DisplayName("Should apply 10% discount for customers with 5+ orders")
void regularCustomerDiscount() { }

// Bad - Unclear purpose
@Test
void test1() { }
```

### 2. Test Organization

```java
// Good - Organized by feature/behavior
@Nested
@DisplayName("When user is logged in")
class LoggedIn {

    @Nested
    @DisplayName("And viewing their profile")
    class ViewingProfile {

        @Test
        @DisplayName("Should see personal information")
        void seesPersonalInfo() { }

        @Test
        @DisplayName("Should be able to edit details")
        void canEditDetails() { }
    }
}
```

### 3. Use Step Libraries

```java
// Good - Delegating to step libraries
@Test
void shouldCompleteCheckout() {
    cart.addProduct("laptop");
    checkout.proceedToCheckout();
    payment.payWithCreditCard("4111111111111111");
    confirmation.shouldShowOrderNumber();
}

// Bad - Low-level implementation in test
@Test
void checkout() {
    driver.findElement(By.id("add-to-cart")).click();
    driver.findElement(By.id("checkout-button")).click();
    // ... many more lines
}
```

### 4. Clean Test Data

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
        // Test uses orderId
    }
}
```

### 5. Avoid Test Interdependence

```java
// Bad - Tests depend on execution order
@Test
@Order(1)
void createUser() {
    userId = userService.create("John");
}

@Test
@Order(2)
void updateUser() {
    userService.update(userId, "Jane"); // Depends on test 1
}

// Good - Each test is independent
@Test
void createUser() {
    String userId = userService.create("John");
    assertThat(userId).isNotNull();
}

@Test
void updateUser() {
    String userId = userService.create("John"); // Create own data
    userService.update(userId, "Jane");
    assertThat(userService.get(userId).getName()).isEqualTo("Jane");
}
```

## Configuration

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

### Serenity Properties

Create `serenity.properties` in `src/test/resources`:

```properties
# WebDriver configuration
webdriver.driver=chrome
webdriver.chrome.driver=path/to/chromedriver

# Timeouts
webdriver.timeouts.implicitlywait=2000
webdriver.wait.for.timeout=10000

# Reporting
serenity.project.name=My Project
serenity.test.root=net.example

# Screenshots
serenity.take.screenshots=FOR_FAILURES
serenity.take.screenshots.for.tasks=BEFORE_AND_AFTER_EACH_STEP
```

## Troubleshooting

### Common Issues

**1. "No tests found"**
- Ensure test class has `@ExtendWith(SerenityJUnit5Extension.class)`
- Check test methods have `@Test` from `org.junit.jupiter.api`
- Verify Maven/Gradle is configured to run JUnit 5 tests

**2. "Multiple WebDriver instances"**
- Use `@Managed` WebDriver - Serenity manages lifecycle
- Don't create WebDriver instances manually
- Ensure proper cleanup in `@AfterEach` if needed

**3. "Tests fail in parallel but pass individually"**
- Check for shared state between tests
- Ensure test data is isolated
- Review WebDriver management

## Next Steps

- Explore [Parallel Execution](parallel-execution) for faster test runs
- Learn about [Screenplay Pattern](/docs/screenplay/screenplay_fundamentals) for better test design
- Review [Serenity Reports](/docs/reporting/the_serenity_reports) documentation
- Check out [WebDriver Integration](/docs/guide/driver_config) for web testing

## Additional Resources

- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)
- [Serenity BDD Official Site](https://serenity-bdd.info)
- [AssertJ Documentation](https://assertj.github.io/doc/)
- [Example Project](https://github.com/serenity-bdd/serenity-junit-screenplay-starter)
