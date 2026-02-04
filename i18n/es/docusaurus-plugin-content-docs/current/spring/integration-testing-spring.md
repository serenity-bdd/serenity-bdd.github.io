---
id: integration_testing_spring
title: Pruebas de integracion con Spring
sidebar_position: 1
---


Los proyectos Spring son muy adecuados para ejecutar pruebas de aceptacion contra diferentes capas de tu aplicacion.

Con Serenity, puedes asegurar el comportamiento correcto usando un navegador o la API REST, o trabajar directamente con la capa de servicios de tu aplicacion.

Ocasionalmente tambien puede ser util acceder a las capas de servicio directamente en tus pruebas end-to-end basadas en navegador.

Por ejemplo, puedes tener un escenario donde una accion del usuario debe, como efecto secundario, registrar un log de auditoria en una tabla de la base de datos.

Para mantener tu prueba enfocada y simple, puedes querer llamar directamente a la capa de servicios para verificar los logs de auditoria, en lugar de usar el navegador para iniciar sesion como administrador y navegar a la pantalla de logs de auditoria.

Las pruebas de integracion deben usar el `SerenityRunner`.
Para poder inyectar (por ejemplo, `@Autowired`) dependencias y usar las anotaciones habituales (como `@DirtiesContext`), solo necesitas incluir la regla de Serenity `SpringIntegrationMethodRule` en tu clase de prueba.

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

### En Spring Boot &lt;1.3

Usa la anotacion `@ContextConfiguration` para definir el archivo o archivos de configuracion a usar. Luego puedes inyectar dependencias como lo harias con una prueba de integracion Spring ordinaria, usando las anotaciones habituales de Spring como `@Autowired` o `@Resource`. Por ejemplo, supongamos que estamos usando el siguiente archivo de configuracion Spring, llamado 'config.xml':

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

Podemos usar este archivo de configuracion para inyectar dependencias como se muestra aqui:

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

Otras anotaciones relacionadas con el contexto como `@DirtiesContext` tambien funcionaran como lo harian en una prueba de integracion Spring tradicional. Spring creara un nuevo ApplicationContext para cada prueba, pero usara un unico ApplicationContext para todos los metodos en tu prueba. Si una de tus pruebas modifica un objeto en el ApplicationContext, puedes querer indicarselo a Spring para que pueda reiniciar el contexto para la siguiente prueba. Haces esto usando la anotacion `@DirtiesContext`. En el siguiente caso de prueba, por ejemplo, las pruebas fallaran sin la anotacion `@DirtiesContext`:

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

Tambien puedes inyectar dependencias de Spring directamente en tus bibliotecas de pasos, para JUnit, Cucumber y JBehave, como se muestra en este ejemplo:

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
