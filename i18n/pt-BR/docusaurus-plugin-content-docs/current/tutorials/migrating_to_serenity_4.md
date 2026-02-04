---
sidebar_position: 5
---

# Migrando do Serenity BDD 3.x para o Serenity BDD 4.x

## Introducao
O Serenity BDD 4.0.0 e uma atualizacao significativa que se alinha com bibliotecas de teste modernas ao suportar JDK 17. Esta versao principal inclui mudancas nas estruturas de pacotes, refletindo ajustes na estrutura de modulos para JDK 17. Se voce esta migrando do Serenity 3.x para o Serenity 4.x, este tutorial ira guia-lo atraves dos passos necessarios para tornar seu projeto compativel com a versao mais recente.

## Passo 1: Garantir Compatibilidade com JDK 17
Certifique-se de que seu projeto e compativel com JDK 17, pois o Serenity BDD 4.x o exige como versao minima. Se voce esta usando Maven, atualize o arquivo `pom.xml` do seu projeto para incluir o `maven-compiler-plugin` configurado para JDK 17. Aqui esta um exemplo:

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-compiler-plugin</artifactId>
  <version>3.8.1</version>
  <configuration>
    <source>11</source>
    <target>11</target>
  </configuration>
</plugin>
```

Se seu projeto usa Gradle, voce precisara especificar a versao do Java em seu arquivo `build.gradle` para garantir compatibilidade com JDK 17. Aqui esta um exemplo:

```groovy
plugins {
  id 'java'
}

sourceCompatibility = '11'
targetCompatibility = '11'
```

## Passo 2: Atualizar Dependencias do Serenity
Atualize as dependencias do Serenity BDD no arquivo de build do seu projeto para a versao 4.x mais recente, por exemplo:

```xml
    <properties>
        <serenity.version>4.0.0</serenity.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-core</artifactId>
            <version>${serenity.version}</version>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-junit</artifactId>
            <version>${serenity.version}</version>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-screenplay</artifactId>
            <version>${serenity.version}</version>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-screenplay-webdriver</artifactId>
            <version>${serenity.version}</version>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-ensure</artifactId>
            <version>${serenity.version}</version>
        </dependency>
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-cucumber</artifactId>
            <version>${serenity.version}</version>
        </dependency>
    </dependencies>

```

## Passo 3: Modificar Anotacoes
Devido as restricoes de modulos do Java 9, alguns dos pacotes mudaram de lugar na nova versao. Mais importante, todas as anotacoes principais do Serenity agora podem ser encontradas no pacote `net.serenitybdd.annotations`.

Em seu projeto, substitua as anotacoes principais do Serenity, como `@Step`, para o novo pacote `net.serenitybdd.annotations` do pacote antigo `net.thucydides.core.annotations`. Se seu projeto e grande, voce pode atualizar todas as suas anotacoes de uma vez assim:

![](img/replace-serenity-annotations.png)

## Passo 4: Atualizar Referencias de Pacotes
Se voce esta usando classes internas do Serenity, pode ser necessario modificar as referencias de pacotes relevantes em seu codigo com base na seguinte tabela:

| Modulo                        | Pacotes Antigos                              | Pacotes Novos |
| --------                      | ------------                                 | ------------ |
| serenity-screenplay-webdriver | net.serenity.screenplay.*                    | net.serenity.screenplay.webdriver.* |
|                               | net.serenitybdd.screenplay.webtest.actions.* | net.serenitybdd.screenplay.webdriver.actions.* |
| serenity-model                | net.serenitybdd.core.*                       | net.serenitybdd.model.* |
|                               | net.thucydides.core.annotations.*            | net.serenitybdd.annotations.* |
|                               | Outros net.thucydides.core.*                 | net.thucydides.model.*  |

Por exemplo, voce pode precisar substituir `net.thucydides.core.util.EnvironmentVariables` por `net.thucydides.model.util.EnvironmentVariables`


## Passo 5: Testar Suas Alteracoes
Depois de fazer essas alteracoes, execute sua suite de testes para verificar se tudo esta funcionando corretamente com a nova versao do Serenity BDD. Preste atencao especial ao seguinte:
- **Hierarquia de Requisitos:** Certifique-se de que a hierarquia de requisitos esta sendo exibida corretamente em seus relatorios.
- **Execucao de Testes:** Confirme que todos os seus testes estao sendo executados conforme esperado, sem nenhum teste faltando ou falhando que anteriormente passou.

## Conclusao
Migrar para o Serenity BDD 4.x envolve atualizar referencias de pacotes para se alinhar com a nova estrutura de modulos do JDK 17. Siga os passos acima e consulte a documentacao oficial do Serenity BDD para informacoes adicionais ou suporte.

Lembre-se de testar completamente seu projeto atualizado, com foco especial na hierarquia de requisitos e execucao de testes, para garantir que a migracao foi bem-sucedida.
