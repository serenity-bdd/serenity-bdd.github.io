---
id: junit5-tests
title: JUnit 5 con Serenity BDD
sidebar_position: 1
---

# Ejecutando pruebas de Serenity BDD con JUnit 5

Esta guia cubre todo lo que necesitas saber para escribir y ejecutar pruebas de Serenity BDD usando JUnit 5 (Jupiter), sin Cucumber.

## Descripcion general

JUnit 5 es la version mas reciente del popular framework de pruebas de Java. Combinado con Serenity BDD, obtienes:

- **Caracteristicas de pruebas modernas**: Pruebas parametrizadas, pruebas anidadas, pruebas dinamicas y mas
- **Aserciones potentes**: Bibliotecas de aserciones integradas y de terceros
- **Reportes detallados**: Los reportes detallados de Serenity con capturas de pantalla y detalles de ejecucion paso a paso
- **Ejecucion paralela**: Ejecuta pruebas concurrentemente para obtener retroalimentacion mas rapida
- **Organizacion flexible**: Etiquetas, clases anidadas y nombres de visualizacion para una mejor organizacion de pruebas

:::tip JUnit 5 Recomendado
JUnit 4 esta obsoleto a partir de Serenity 5.0.0 y sera eliminado en Serenity 6.0.0. Todos los proyectos nuevos deben usar JUnit 5.
:::

## Prerrequisitos

- Java 17 o superior
- Maven o Gradle
- Un IDE con soporte para Java (IntelliJ IDEA, Eclipse, VS Code, etc.)

## Configurando las dependencias

### Dependencias de Maven

Agrega lo siguiente a tu `pom.xml`:

```xml
<properties>
    <serenity.version>5.2.2</serenity.version>
    <junit.version>6.0.1</junit.version>
</properties>

<dependencies>
    <!-- Integracion de Serenity con JUnit 5 -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-junit5</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Serenity Screenplay (opcional, pero recomendado) -->
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-screenplay</artifactId>
        <version>${serenity.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Integracion de Serenity con WebDriver (para pruebas web) -->
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

    <!-- AssertJ (recomendado para aserciones fluidas) -->
    <dependency>
        <groupId>org.assertj</groupId>
        <artifactId>assertj-core</artifactId>
        <version>3.24.2</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### Dependencias de Gradle

Para Gradle, agrega a tu `build.gradle`:

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

## Escribiendo tu primera prueba

### Estructura basica de una prueba

Cada prueba de Serenity con JUnit 5 debe estar anotada con `@ExtendWith(SerenityJUnit5Extension.class)`:

```java
import net.serenitybdd.junit5.SerenityJUnit5Extension;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(SerenityJUnit5Extension.class)
class WhenSearchingForProducts {

    @Test
    void shouldFindProductByName() {
        // Tu codigo de prueba aqui
    }

    @Test
    void shouldFilterProductsByCategory() {
        // Tu codigo de prueba aqui
    }
}
```

### Ejemplo de prueba web

Aqui hay un ejemplo completo de una prueba web:

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

### Usando bibliotecas de pasos

Para una mejor organizacion, usa las bibliotecas de pasos de Serenity:

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

## Ciclo de vida de las pruebas

### Ciclo de vida a nivel de metodo

Usa las anotaciones de ciclo de vida de JUnit 5:

```java
import org.junit.jupiter.api.*;

@ExtendWith(SerenityJUnit5Extension.class)
class ProductTests {

    @BeforeEach
    void setUp() {
        // Se ejecuta antes de cada metodo de prueba
        System.out.println("Setting up test");
    }

    @AfterEach
    void tearDown() {
        // Se ejecuta despues de cada metodo de prueba
        System.out.println("Cleaning up test");
    }

    @BeforeAll
    static void setUpClass() {
        // Se ejecuta una vez antes de todas las pruebas en esta clase
        System.out.println("Setting up test class");
    }

    @AfterAll
    static void tearDownClass() {
        // Se ejecuta una vez despues de todas las pruebas en esta clase
        System.out.println("Cleaning up test class");
    }

    @Test
    void test1() {
        // Codigo de prueba
    }

    @Test
    void test2() {
        // Codigo de prueba
    }
}
```

### Orden de ejecucion

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

## Nombres de visualizacion y organizacion

### Nombres de visualizacion personalizados

Haz que los nombres de las pruebas sean mas legibles en los reportes:

```java
import org.junit.jupiter.api.DisplayName;

@ExtendWith(SerenityJUnit5Extension.class)
@DisplayName("Shopping Cart Management")
class ShoppingCartTests {

    @Test
    @DisplayName("Should add product to empty cart")
    void addToEmptyCart() {
        // Codigo de prueba
    }

    @Test
    @DisplayName("Should update quantity of existing product")
    void updateQuantity() {
        // Codigo de prueba
    }

    @Test
    @DisplayName("Should remove product from cart")
    void removeProduct() {
        // Codigo de prueba
    }
}
```

### Pruebas anidadas

Organiza pruebas relacionadas con `@Nested`:

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
            // Codigo de prueba
        }

        @Test
        @DisplayName("Should fail with invalid password")
        void invalidPassword() {
            // Codigo de prueba
        }

        @Test
        @DisplayName("Should fail with non-existent user")
        void nonExistentUser() {
            // Codigo de prueba
        }
    }

    @Nested
    @DisplayName("When logging out")
    class Logout {

        @Test
        @DisplayName("Should clear session")
        void clearSession() {
            // Codigo de prueba
        }

        @Test
        @DisplayName("Should redirect to login page")
        void redirectToLogin() {
            // Codigo de prueba
        }
    }
}
```

## Pruebas parametrizadas

### Pruebas parametrizadas simples

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

### Fuente CSV

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

### Fuente de metodo

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

## Etiquetas y filtrado

### Etiquetando pruebas

Usa `@Tag` para categorizar pruebas:

```java
import org.junit.jupiter.api.Tag;

@ExtendWith(SerenityJUnit5Extension.class)
class ProductTests {

    @Test
    @Tag("smoke")
    @Tag("fast")
    void quickSanityCheck() {
        // Prueba de humo rapida
    }

    @Test
    @Tag("regression")
    @Tag("slow")
    void comprehensiveTest() {
        // Prueba de regresion completa
    }

    @Test
    @Tag("wip")
    void workInProgress() {
        // Prueba en desarrollo
    }
}
```

### Ejecutando pruebas etiquetadas

**Maven:**
```bash
# Ejecutar solo pruebas de humo
mvn test -Dgroups=smoke

# Ejecutar smoke O regression
mvn test -Dgroups="smoke | regression"

# Ejecutar smoke Y fast
mvn test -Dgroups="smoke & fast"

# Excluir pruebas wip
mvn test -DexcludedGroups=wip
```

**junit-platform.properties:**
```properties
junit.jupiter.includeTags=smoke
junit.jupiter.excludeTags=wip,slow
```

## Ejecucion condicional de pruebas

### Pruebas especificas por sistema operativo

```java
import org.junit.jupiter.api.condition.*;

@Test
@EnabledOnOs(OS.WINDOWS)
void runOnlyOnWindows() {
    // Prueba especifica para Windows
}

@Test
@DisabledOnOs(OS.MAC)
void dontRunOnMac() {
    // Prueba deshabilitada en macOS
}
```

### Especificas por version de Java

```java
@Test
@EnabledOnJre(JRE.JAVA_17)
void runOnlyOnJava17() {
    // Prueba especifica para Java 17
}

@Test
@EnabledForJreRange(min = JRE.JAVA_17, max = JRE.JAVA_21)
void runOnJava17To21() {
    // Versiones modernas de Java
}
```

### Condiciones personalizadas

```java
@Test
@EnabledIf("isProductionEnvironment")
void runOnlyInProduction() {
    // Prueba solo para produccion
}

boolean isProductionEnvironment() {
    return System.getProperty("env", "dev").equals("prod");
}
```

## Aserciones

### Aserciones de JUnit 5

```java
import static org.junit.jupiter.api.Assertions.*;

@Test
void demonstrateAssertions() {
    // Aserciones basicas
    assertEquals(expected, actual);
    assertTrue(condition);
    assertFalse(condition);
    assertNull(object);
    assertNotNull(object);

    // Aserciones de arreglos
    assertArrayEquals(expectedArray, actualArray);

    // Aserciones de excepciones
    assertThrows(IllegalArgumentException.class, () -> {
        // Codigo que deberia lanzar una excepcion
    });

    // Aserciones de tiempo de espera
    assertTimeout(Duration.ofSeconds(2), () -> {
        // Codigo que deberia completarse en 2 segundos
    });

    // Aserciones agrupadas
    assertAll("User validation",
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
    // Aserciones fluidas
    assertThat(actual).isEqualTo(expected);
    assertThat(list).hasSize(3)
                    .contains("item1", "item2")
                    .doesNotContain("item3");

    // Aserciones de cadenas
    assertThat(text).startsWith("Hello")
                    .endsWith("World")
                    .contains("Test");

    // Aserciones de excepciones
    assertThatThrownBy(() -> methodThatThrows())
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Invalid input");

    // Aserciones suaves (continuan incluso despues de fallos)
    SoftAssertions softly = new SoftAssertions();
    softly.assertThat(user.getName()).isEqualTo("John");
    softly.assertThat(user.getAge()).isGreaterThan(18);
    softly.assertAll();
}
```

## Ejecucion paralela

Consulta la guia dedicada de [Ejecucion Paralela](parallel-execution) para una cobertura completa.

Ejemplo rapido en `junit-platform.properties`:

```properties
# Habilitar ejecucion paralela
junit.jupiter.execution.parallel.enabled=true

# Ejecutar clases de prueba en paralelo
junit.jupiter.execution.parallel.mode.default=concurrent

# Ejecutar metodos de prueba en la misma clase secuencialmente
junit.jupiter.execution.parallel.mode.classes.default=concurrent

# Usar estrategia dinamica
junit.jupiter.execution.parallel.config.strategy=dynamic
junit.jupiter.execution.parallel.config.dynamic.factor=1.0
```

## Mejores practicas

### 1. Nomenclatura de pruebas

```java
// Bueno - Describe el comportamiento
@Test
void shouldCalculateDiscountForRegularCustomer() { }

// Mejor - Aun mas descriptivo
@Test
@DisplayName("Should apply 10% discount for customers with 5+ orders")
void regularCustomerDiscount() { }

// Malo - Proposito poco claro
@Test
void test1() { }
```

### 2. Organizacion de pruebas

```java
// Bueno - Organizado por caracteristica/comportamiento
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

### 3. Usa bibliotecas de pasos

```java
// Bueno - Delegando a bibliotecas de pasos
@Test
void shouldCompleteCheckout() {
    cart.addProduct("laptop");
    checkout.proceedToCheckout();
    payment.payWithCreditCard("4111111111111111");
    confirmation.shouldShowOrderNumber();
}

// Malo - Implementacion de bajo nivel en la prueba
@Test
void checkout() {
    driver.findElement(By.id("add-to-cart")).click();
    driver.findElement(By.id("checkout-button")).click();
    // ... muchas mas lineas
}
```

### 4. Datos de prueba limpios

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
        // La prueba usa orderId
    }
}
```

### 5. Evita la interdependencia entre pruebas

```java
// Malo - Las pruebas dependen del orden de ejecucion
@Test
@Order(1)
void createUser() {
    userId = userService.create("John");
}

@Test
@Order(2)
void updateUser() {
    userService.update(userId, "Jane"); // Depende de la prueba 1
}

// Bueno - Cada prueba es independiente
@Test
void createUser() {
    String userId = userService.create("John");
    assertThat(userId).isNotNull();
}

@Test
void updateUser() {
    String userId = userService.create("John"); // Crea sus propios datos
    userService.update(userId, "Jane");
    assertThat(userService.get(userId).getName()).isEqualTo("Jane");
}
```

## Configuracion

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

### Propiedades de Serenity

Crea `serenity.properties` en `src/test/resources`:

```properties
# Configuracion de WebDriver
webdriver.driver=chrome
webdriver.chrome.driver=path/to/chromedriver

# Tiempos de espera
webdriver.timeouts.implicitlywait=2000
webdriver.wait.for.timeout=10000

# Reportes
serenity.project.name=My Project
serenity.test.root=net.example

# Capturas de pantalla
serenity.take.screenshots=FOR_FAILURES
serenity.take.screenshots.for.tasks=BEFORE_AND_AFTER_EACH_STEP
```

## Solucion de problemas

### Problemas comunes

**1. "No tests found" (No se encontraron pruebas)**
- Asegurate de que la clase de prueba tenga `@ExtendWith(SerenityJUnit5Extension.class)`
- Verifica que los metodos de prueba tengan `@Test` de `org.junit.jupiter.api`
- Verifica que Maven/Gradle este configurado para ejecutar pruebas de JUnit 5

**2. "Multiple WebDriver instances" (Multiples instancias de WebDriver)**
- Usa `@Managed` WebDriver - Serenity gestiona el ciclo de vida
- No crees instancias de WebDriver manualmente
- Asegura una limpieza adecuada en `@AfterEach` si es necesario

**3. "Tests fail in parallel but pass individually" (Las pruebas fallan en paralelo pero pasan individualmente)**
- Verifica si hay estado compartido entre pruebas
- Asegura que los datos de prueba esten aislados
- Revisa la gestion de WebDriver

## Proximos pasos

- Explora la [Ejecucion Paralela](parallel-execution) para ejecuciones de prueba mas rapidas
- Aprende sobre el [Screenplay Pattern](/docs/screenplay/screenplay_fundamentals) para un mejor diseno de pruebas
- Revisa la documentacion de [Reportes de Serenity](/docs/reporting/the_serenity_reports)
- Consulta la [Integracion con WebDriver](/docs/guide/driver_config) para pruebas web

## Recursos adicionales

- [Guia de usuario de JUnit 5](https://junit.org/junit5/docs/current/user-guide/)
- [Sitio oficial de Serenity BDD](https://serenity-bdd.info)
- [Documentacion de AssertJ](https://assertj.github.io/doc/)
- [Proyecto de ejemplo](https://github.com/serenity-bdd/serenity-junit-screenplay-starter)
