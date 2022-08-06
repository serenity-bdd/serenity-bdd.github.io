# Running Cucumber scenarios with Serenity

To run Cucumber scenarios with Serenity, you need to create a Junit 4 test runner class and use `@RunWith` annotation in with the `CucumberWithSerenity` class, like this:

```java
import io.cucumber.junit.CucumberOptions;
import net.serenitybdd.cucumber.CucumberWithSerenity;
import org.junit.runner.RunWith;

@RunWith(CucumberWithSerenity.class)
@CucumberOptions(
        plugin = {"pretty"},
        features = "src/test/resources/features"
)
public class AcceptanceTestSuite {}
```

Note that you need to specify at least the `features` attribute, to define the directory containing your feature files.

# Feature hierarchies

Serenity expects to find feature files in the `src/test/resources/features` folder by default. You can organise your feature files in a hierarchy of folders underneath this one, as shown here:

```
+ src
|-- test
|   |-- resources
|   |  |-- features
|   |  |   |-- authentication
|   |  |   |   |-- login.feature
|   |  |   |-- cart
|   |  |   |   |-- managing_the_cart.feature
|   |  |   |-- catalog
|   |  |   |   |-- browse_catalog.feature
|   |  |   |   |-- filtering_products.feature
|   |  |   |-- purchases
|   |  |   |   |-- completing_a_purchase.feature
|   |  |   |-- sales_tax
|   |  |   |   |-- calculating_sales_tax.feature
``` 

The directory structure will be used to build the Serenity requirements hierarchy, like the one shown here:

![](img/cucumber-requirements-hierarchy.png)


# Filtering test exeuction in Cucumber

The simplest way to control which scenarios you want to execute is to use tags and the `cucumber.filter.tags` command line option. For example, to run only scenarios or features annotated with `@smoke`, you would run the following command:
```
mvn clean verify -Dcucumber.filter.tags="@smoke"
```

You can use [Cucumber Tag Expressions](https://cucumber.io/docs/cucumber/api/#tag-expressions) to determine which scenarios to run. For example, to run only features with both the `@authentication` tag and the `@smoke` tag, you would run the following:
```
 mvn clean verify -Dcucumber.filter.tags="@authentication and @smoke"
 ```

To run scenarios with either the `@cart` or the `@catalog` tag, you could run the following:
```
 mvn clean verify -Dcucumber.filter.tags="@cart or @catalog"
 ```
