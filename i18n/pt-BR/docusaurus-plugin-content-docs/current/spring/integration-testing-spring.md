---
id: integration_testing_spring
title: Testes de Integração com Spring
sidebar_position: 1
---


Projetos Spring são bem adequados para executar seus testes de aceitação contra diferentes camadas da sua aplicação.

Com Serenity, você pode garantir o comportamento correto usando um navegador ou a API REST ou trabalhar diretamente com a camada de serviços da sua aplicação.

Ocasionalmente, também pode ser útil acessar as camadas de serviço diretamente em seus testes end-to-end baseados em navegador.

Por exemplo, você pode ter um cenário onde uma ação do usuário deve, como efeito colateral, registrar um log de auditoria em uma tabela no banco de dados.

Para manter seu teste focado e simples, você pode querer chamar a camada de serviço diretamente para verificar os logs de auditoria, em vez de usar o navegador para fazer login como administrador e navegar até a tela de logs de auditoria.

Testes de integração devem usar o `SerenityRunner`.
Para poder injetar (por exemplo, `@Autowired`) dependências e usar as anotações usuais (como `@DirtiesContext`), você só precisa incluir a `SpringIntegrationMethodRule` do Serenity na sua classe de teste.

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

### No Spring Boot &lt;1.3

use a anotação `@ContextConfiguration` para definir o arquivo ou arquivos de configuração a usar. Então você pode injetar dependências como faria em um teste de integração Spring comum, usando as anotações Spring usuais como `@Autowired` ou `@Resource`. Por exemplo, suponha que estamos usando o seguinte arquivo de configuração Spring, chamado 'config.xml':

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

Podemos usar este arquivo de configuração para injetar dependências como mostrado aqui:

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

Outras anotações relacionadas a contexto como `@DirtiesContext` também funcionarão como funcionariam em um teste de integração Spring tradicional. O Spring criará um novo ApplicationContext para cada teste, mas usará um único ApplicationContext para todos os métodos no seu teste. Se um dos seus testes modificar um objeto no ApplicationContext, você pode querer informar o Spring para que ele possa resetar o contexto para o próximo teste. Você faz isso usando a anotação `@DirtiesContext`. No seguinte caso de teste, por exemplo, os testes falharão sem a anotação `@DirtiesContext`:

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

Você também pode injetar dependências Spring diretamente nas suas bibliotecas de passos, para JUnit, Cucumber e JBehave, como mostrado neste exemplo:

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
