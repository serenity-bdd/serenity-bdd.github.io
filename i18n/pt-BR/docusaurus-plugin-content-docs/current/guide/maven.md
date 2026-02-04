---
id: maven
title: Usando Maven com Serenity
sidebar_position: 3
---
# Integrando o Serenity BDD em um projeto Maven

Maven é a ferramenta de build recomendada para o Serenity BDD.

Você pode adicionar o Serenity BDD a um projeto Maven existente adicionando as dependências correspondentes ao seu arquivo `pom.xml`.

## Versões Recomendadas

Primeiro, defina as versões recomendadas na seção de propriedades:

```xml
<properties>
    <serenity.version>5.2.2</serenity.version>
    <junit5.version>6.0.1</junit5.version>
    <cucumber.version>7.33.0</cucumber.version>
</properties>
```

## Dependências Principais

Todos os projetos Serenity BDD precisam da seguinte dependência principal:

```
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-core</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
```

Você também precisará de um executor de testes, que normalmente será JUnit 5 (recomendado) ou Cucumber. Observe que o JUnit 4 está obsoleto a partir do Serenity 5.0.0.

## Dependências do Serenity JUnit 5 (Recomendado)
Para usar o JUnit 5 você precisará da seguinte dependência:

```
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-junit5</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
```

Você também precisará das dependências do JUnit 5, por exemplo:
```
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-api</artifactId>
    <version>${junit5.version}</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-engine</artifactId>
    <version>${junit5.version}</version>
    <scope>test</scope>
</dependency>
```

## Dependências do Serenity JUnit 4 (Obsoleto)

:::warning JUnit 4 Obsoleto
O suporte ao JUnit 4 está obsoleto a partir do Serenity 5.0.0 e será removido no Serenity 6.0.0. Por favor, migre para o JUnit 5 (veja acima).
:::

Se você ainda está usando o JUnit 4, precisará da seguinte dependência:

```
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-junit</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
```

## Dependências do Serenity Cucumber

Para o Cucumber você precisará da seguinte dependência:

```
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-cucumber</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
```

Como o Serenity depende de uma versão específica das APIs do Cucumber, recomendamos usar a mesma versão das bibliotecas do Cucumber.

O Cucumber requer um executor de testes, preferencialmente JUnit 5 (JUnit 4 está obsoleto).

## Dependências do Cucumber com JUnit 5 (Recomendado)
Para usar o JUnit 5 você precisará da seguinte dependência:

```
<dependency>
    <groupId>io.cucumber</groupId>
    <artifactId>cucumber-junit-platform-engine</artifactId>
    <version>${cucumber.version}</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.junit.platform</groupId>
    <artifactId>junit-platform-suite</artifactId>
    <version>${junit-platform.version}</version>
    <scope>test</scope>
</dependency>
```

Veja a documentação do cucumber-junit-platform-engine sobre como usar junit-platform-suite para pilotar o cucumber: https://github.com/cucumber/cucumber-jvm/tree/main/junit-platform-engine#suites-with-different-configurations, e https://github.com/serenity-bdd/serenity-cucumber-starter para um exemplo funcional.

## Dependências do Cucumber com JUnit 4 (Obsoleto)

:::warning JUnit 4 Obsoleto
Os executores Cucumber do JUnit 4 estão obsoletos a partir do Serenity 5.0.0 e serão removidos no Serenity 6.0.0. Por favor, migre para o JUnit 5 (veja acima).
:::

Se você ainda está usando o JUnit 4 com Cucumber, precisará da seguinte dependência:

```
<dependency>
    <groupId>io.cucumber</groupId>
    <artifactId>cucumber-junit</artifactId>
    <version>${cucumber.version}</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.junit.platform</groupId>
    <artifactId>junit-vintage-engine</artifactId>
    <version>${junit5.version}</version>
    <scope>test</scope>
</dependency>
```

## Screenplay
Se você está usando o Screenplay Pattern, também precisará das dependências do Screenplay:
```
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-screenplay</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-rest-assured</artifactId>
    <version>${serenity.version}</version>
</dependency>
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-ensure</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-screenplay-webdriver</artifactId>
    <version>${serenity.version}</version>
    <scope>test</scope>
</dependency>
```

## Executando Testes com Maven Failsafe

Os testes do Serenity são testes de integração e devem ser executados usando o plugin Maven Failsafe. A configuração básica é direta:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-failsafe-plugin</artifactId>
    <version>3.5.2</version>
    <configuration>
        <includes>
            <include>**/*Test.java</include>
        </includes>
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
```

### Executando Testes JUnit 5 e Cucumber Juntos

Se seu projeto contém tanto testes JUnit 5 quanto testes Cucumber, você pode encontrar um problema onde apenas os testes Cucumber são descobertos e executados. Isso acontece porque quando o Cucumber usa a propriedade `cucumber.features` (seja via `@ConfigurationParameter` ou `junit-platform.properties`), isso faz com que outros seletores de descoberta da JUnit Platform sejam ignorados.

Você verá um aviso como este:

```
WARNING: TestEngine with ID 'cucumber' encountered a non-critical issue during test discovery:
Discovering tests using the cucumber.features property. Other discovery selectors are ignored!
```

**A solução** é configurar execuções separadas do Failsafe para testes JUnit 5 e Cucumber:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-failsafe-plugin</artifactId>
    <version>3.5.2</version>
    <executions>
        <!-- Execução para testes JUnit Jupiter (exclui Cucumber) -->
        <execution>
            <id>junit-tests</id>
            <goals>
                <goal>integration-test</goal>
            </goals>
            <configuration>
                <includes>
                    <include>**/*Test.java</include>
                </includes>
                <excludes>
                    <exclude>**/CucumberTestSuite.java</exclude>
                </excludes>
            </configuration>
        </execution>
        <!-- Execução para testes Cucumber -->
        <execution>
            <id>cucumber-tests</id>
            <goals>
                <goal>integration-test</goal>
            </goals>
            <configuration>
                <includes>
                    <include>**/CucumberTestSuite.java</include>
                </includes>
            </configuration>
        </execution>
        <!-- Fase de verificação (executa uma vez após todos os testes) -->
        <execution>
            <id>verify</id>
            <goals>
                <goal>verify</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

Esta configuração:
- Executa os testes JUnit Jupiter primeiro (todos os arquivos `*Test.java` exceto a suíte Cucumber)
- Executa os testes Cucumber separadamente via a classe `CucumberTestSuite`
- Executa o goal verify uma vez no final para verificar falhas

:::tip Convenção de Nomenclatura
Ajuste os padrões `<include>` e `<exclude>` para corresponder às convenções de nomenclatura das suas classes de teste. Por exemplo, se sua suíte Cucumber é chamada `CucumberIT.java`, atualize os padrões de acordo.
:::

## O Plugin Maven do Serenity

Se você deseja gerar os relatórios do Serenity sempre que executar `mvn verify`, você pode usar o `serenity-maven-plugin` para isso:
```
<plugin>
    <groupId>net.serenity-bdd.maven.plugins</groupId>
    <artifactId>serenity-maven-plugin</artifactId>
    <version>${serenity.version}</version>
    <configuration>
      <tags>${tags}</tags>
    </configuration>
    <executions>
        <execution>
            <id>serenity-reports</id>
            <phase>post-integration-test</phase>
            <goals>
                <goal>aggregate</goal>
                <goal>check</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

Por padrão, o goal `aggregate` NÃO falhará o build se houver falhas de teste - ele simplesmente gerará os relatórios. Desta forma você pode agregar múltiplos conjuntos de relatórios e então verificar falhas no final usando `mvn serenity:check`.

## Verificando arquivos de feature Gherkin

Alguns erros em arquivos de feature Gherkin podem causar comportamento imprevisível nos relatórios do Serenity. Por esta razão, as seguintes regras devem ser seguidas ao trabalhar com Cucumber e Serenity:
  - Os nomes dos Scenario devem ser únicos dentro de um arquivo de feature
  - Os nomes de Scenario, Rule e Feature não devem estar em branco
  - Os nomes das Feature devem ser únicos sempre que possível. Em particular, features com o mesmo nome, dentro de diretórios com nomes idênticos, não aparecerão corretamente nos relatórios do Serenity.

  Você pode verificar essas regras antes de executar o teste completo chamando o goal `check-gherkin`, por exemplo:

```
mvn serenity:check-gherkin
```

Você pode garantir que seus arquivos de feature estejam configurados corretamente antes de iniciar seus testes vinculando o goal `check-gherkin` à fase de ciclo de vida `process-test-resources`, como mostrado aqui:

```
<plugin>
    <groupId>net.serenity-bdd.maven.plugins</groupId>
    <artifactId>serenity-maven-plugin</artifactId>
    <version>${serenity.version}</version>
    <configuration>
      <tags>${tags}</tags>
    </configuration>
    <executions>
        <execution>
            <id>check-feature-files</id>
            <phase>process-test-resources</phase>
            <goals>
                <goal>check-gherkin</goal>
            </goals>
        </execution>
        <execution>
            <id>serenity-reports</id>
            <phase>post-integration-test</phase>
            <goals>
                <goal>aggregate</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```
