---
id: integration_testing_spring
title: Integration Testing in Spring
sidebar_position: 1
---


Spring projects are well suited for running your acceptance tests against different layers of your application.

With Serenity, you can ensure correct behavior using a browser or the REST API or work with the service layer of your application directly.

Occasionally it can also be useful to access the service layers directly in your browser-based end-to-end tests.

For example, you may have a scenario where a user action must, as a side effect, record an audit log in a table in the database.

To keep your test focused and simple, you may want to call the service layer directly to check the audit logs, rather than using the browser to log in as an administrator and navigate to the audit logs screen.

Integration tests must use the `SerenityRunner`.
To be able to inject (e.g. `@Autowired`) dependencies and use the usual annotations (like `@DirtiesContext`), you just need to include the Serenity `SpringIntegrationMethodRule` in your test class.

```java
@RunWith(SerenityRunner.class)
@SpringBootTest
public class WhenInjectingSpringDependencies {

    @Managed
    WebDriver driver;

    @ManagedPages(defaultUrl = "http://www.google.com")
    public Pages pages;

    @Rule
    public SpringIntegrationMethodRule springIntegrationMethodRule =
      new SpringIntegrationMethodRule();

    @Autowired
    public GizmoService gizmoService;

    @Test
    public void shouldInstantiateGizmoService() {
        assertThat(gizmoService, is(not(nullValue())));
    }

    @Test
    public void shouldInstantiateNestedServices() {
        assertThat(gizmoService.getWidgetService(), is(not(nullValue())));
    }
}
```

### In Spring Boot <1.3

use the `@ContextConfiguration` annotation to define the configuration file or files to use. Then you can inject dependencies as you would with an ordinary Spring integration test, using the usual Spring annotations such as `@Autowired` or `@Resource`. For example, suppose we are using the following Spring configuration file, called ‘config.xml’:

```xml
<beans>
    <bean id="widgetService" class="net.serenity.junit.spring.WidgetService">
        <property name="name"><value>Widgets</value></property>
        <property name="quota"><value>1</value></property>
    </bean>
    <bean id="gizmoService" class="net.serenity.junit.spring.GizmoService">
        <property name="name"><value>Gizmos</value></property>
        <property name="widgetService"><ref bean="widgetService" /></property>
    </bean>
</beans>
```

We can use this configuration file to inject dependencies as shown here:

```java
@RunWith(SerenityRunner.class)
@ContextConfiguration(locations = "/config.xml")
public class WhenInjectingSpringDependencies {

    @Managed
    WebDriver driver;

    @ManagedPages(defaultUrl = "http://www.google.com")
    public Pages pages;

    @Rule
    public SpringIntegrationMethodRule springIntegrationMethodRule = new SpringIntegrationMethodRule();

    @Autowired
    public GizmoService gizmoService;

    @Test
    public void shouldInstantiateGizmoService() {
        assertThat(gizmoService, is(not(nullValue())));
    }

    @Test
    public void shouldInstantiateNestedServices() {
        assertThat(gizmoService.getWidgetService(), is(not(nullValue())));
    }
}
```

Other context-related annotations such as `@DirtiesContext` will also work as they would in a traditional Spring Integration test. Spring will create a new ApplicationContext for each test, but it will use a single ApplicationContext for all of the methods in your test. If one of your tests modifies an object in the ApplicationContext, you may want to tell Spring so that it can reset the context for the next test. You do this using the `@DirtiesContext` annotation. In the following test case, for example, the tests will fail without the `@DirtiesContext` annotation:

```java
@RunWith(SerenityRunner.class)
@ContextConfiguration(locations = "/spring/config.xml")
public class WhenWorkingWithDirtyContexts {

    @Managed
    WebDriver driver;

    @ManagedPages(defaultUrl = "http://www.google.com")
    public Pages pages;

    @Rule
    public SpringIntegration springIntegration = new SpringIntegration();

    @Autowired
    public GizmoService gizmoService;

    @Test
    @DirtiesContext
    public void shouldNotBeAffectedByTheOtherTest() {
        assertThat(gizmoService.getName(), is("Gizmos"));
        gizmoService.setName("New Gizmos");
    }

    @Test
    @DirtiesContext
    public void shouldNotBeAffectedByTheOtherTestEither() {
        assertThat(gizmoService.getName(), is("Gizmos"));
        gizmoService.setName("New Gizmos");
    }

}
```

You can also inject Spring dependencies directly into your Step libraries, for JUnit, Cucumber and JBehave, as shown in this example:

```java
@ContextConfiguration(locations = "/spring/config.xml")
public class NestedSpringEnabledSteps {

    @Autowired
    public WidgetService widgetService;

    private String widgetName;

    @Steps
    private NestedSteps nestedSteps;

    @Given("I have a nested autowired Spring bean")
    public void givenIHaveAnAutowiredSpringBean() {
        assertThat(nestedSteps.widgetService, notNullValue());
    }

    @When("I use the nested bean")
    public void whenIUseTheBean() {
        widgetName = nestedSteps.widgetService.getName();
    }

    @Then("the nested bean should be instantiated")
    public void thenItShouldBeInstantiated() {
        assertThat(widgetName, is("Widgets"));
    }

}
```