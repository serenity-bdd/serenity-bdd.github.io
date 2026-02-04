---
id: additional_reports
title: Relatórios Adicionais
sidebar_position: 4
---
Além dos relatórios HTML padrão, o Serenity fornece relatórios adicionais para usos mais específicos. Estes incluem

  * Relatórios HTML enviáveis por email
  * Relatório HTML como aplicação React de página única

## Relatórios enviáveis por email do Serenity

O Serenity BDD produz relatórios ricos que atuam tanto como relatórios de teste quanto como documentação viva.
Mas frequentemente é útil poder enviar um breve resumo dos resultados dos testes por email.

O Serenity permite que você gere um relatório de resumo HTML de página única e autocontido, contendo
uma visão geral dos resultados dos testes, e um detalhamento configurável do status de diferentes áreas da aplicação. Você pode ver um exemplo de tal relatório aqui:

![Um relatório de resumo gerado pelo Serenity](img/test-summary-report.png)


## Configurando o Maven

Esses relatórios são configurados no plugin Maven do Serenity, onde você precisa fazer duas coisas. Primeiro, você precisa adicionar uma dependência para o módulo `serenity-emailer` na configuração do plugin. Em seguida, você precisa informar ao Serenity para gerar o relatório `email` quando ele executar a tarefa de agregação.

A configuração completa se parece com algo assim:

```xml
<plugin>
    <groupId>net.serenity-bdd.maven.plugins</groupId>
    <artifactId>serenity-maven-plugin</artifactId>
    <version>${serenity.version}</version>
    <dependencies>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-single-page-report</artifactId>
            <version>${serenity.version}</version>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-navigator-report</artifactId>
            <version>${serenity.version}</version>
        </dependency>
    </dependencies>
    <configuration>
        <tags>${tags}</tags>
        <reports>single-page-html,navigator</reports>
    </configuration>
    <executions>
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
No trecho acima,
1. As tags `<dependency>` acima listam as dependências dos diferentes módulos de relatório.
2. A tag `<reports>` na `<configuration>` especifica a lista de relatórios a serem gerados.

Se você estiver usando Maven, também pode gerar esses relatórios diretamente usando o goal `reports` e passando a propriedade do sistema `serenity.reports`:

```bash
mvn serenity:reports -Dserenity.reports=single-page-html
```

## Configurando o Gradle

Se você estiver usando Gradle, pode usar a tarefa `reports` para gerar quaisquer relatórios estendidos configurados. Primeiro de tudo, você precisa adicionar as dependências aos relatórios estendidos que deseja executar na seção `buildscript` do seu arquivo `build.gradle`, por exemplo:

```gradle
buildscript {
    repositories {
        mavenLocal()
        jcenter()
    }
    dependencies {
        classpath "net.serenity-bdd:serenity-gradle-plugin:2.1.4"
        classpath "net.serenity-bdd:serenity-single-page-report:2.1.4"
    }
}
```

Em seguida, você precisa configurar o relatório que deseja gerar no seu arquivo `build.gradle` usando a seção `serenity`, como mostrado aqui:

```gradle
serenity {
    reports = ["single-page-html"]
}
```

Agora você pode gerar esses relatórios invocando a tarefa `reports`:

```bash
gradle reports

> Task :reports
Generating Serenity Reports for bdd-bank to directory /Users/john/Projects/SerenityDojo/bdd-bank/target/site/serenity
PROCESSING EXTENDED REPORTS: [email]

BUILD SUCCESSFUL in 2s
1 actionable task: 1 executed
```

## Relatórios de Cobertura Funcional

A seção _Cobertura Funcional_ permite destacar áreas-chave da sua aplicação.
Por padrão, esta seção listará os resultados dos testes para cada _Feature_. Mas você pode configurar o relatório para agrupar resultados por outras tags também.

Você pode especificar quais categorias devem aparecer nesta página usando a propriedade do sistema `report.tagtypes`. Por exemplo, se você quiser listar capacidades além de features, adicionaria a seguinte linha ao seu arquivo `serenity.properties`:

```
report.tagtypes=capability,feature
```

Agora tanto capacidades quanto features apareceriam na seção de Cobertura Funcional do relatório:

![Personalizando as categorias para aparecer na seção de Cobertura Funcional](img/custom-reports-capabilities-and-features.png)

### Cobertura funcional por tag
Você também pode configurar a cobertura funcional para reportar cobertura por tags, em vez de por hierarquia de requisitos. Suponha que você esteja usando uma tag `@department` para definir os principais stakeholders para cada funcionalidade. Você poderia marcar funcionalidades para pertencer a diferentes departamentos usando tags como `@department:Trading`, `department:Sales` ou `department:Marketing`.

```gherkin
@department:Trading
Feature: Comprando e vendendo ações

  Para fazer meus investimentos crescerem
  Como um trader
  Quero poder comprar e vender ações para obter lucro
  ...
```

Você poderia informar ao Serenity para produzir cobertura para essas tags incluindo a seguinte linha no seu arquivo `serenity.properties`:

```
report.tagtypes=department
```

Quando você gerar o relatório de resumo, os resultados serão agregados por cada valor de tag (Marketing, Sales e Trading), como mostrado aqui:

![A cobertura funcional pode ser configurada por tags](img/custom-reports-alternative-functional-coverage.png)

### Links diretos

Você pode incluir um link de volta para seu relatório do Serenity, e links para os resultados individuais dos cenários,
definindo a propriedade `serenity.report.url`. Você pode fazer isso no arquivo `serenity.properties` (se for fixo),
ou passá-lo pela linha de comando (se você estiver apontando para os relatórios de um build específico, por exemplo):

```
serenity.report.url=http://my.jenkins.server:8080/job/my-project/serenity-reports/
```
