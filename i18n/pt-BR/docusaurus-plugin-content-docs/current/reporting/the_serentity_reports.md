---
id: the_serenity_reports
title: Os Relatórios do Serenity
sidebar_position: 1
---

Os relatórios do Serenity são um recurso particularmente poderoso do Serenity BDD. Eles visam não apenas _reportar_ resultados de testes, mas também _documentar_ como as funcionalidades são testadas e o que a aplicação faz.

## Uma visão geral dos resultados dos testes

Um relatório típico do Serenity é mostrado abaixo:

![Visão Geral da Cobertura Funcional](img/reports-overview.png)

Isso mostra um gráfico de pizza simples exibindo a distribuição dos resultados dos testes, e gráficos de barras indicando os resultados dos testes ordenados por resultado e por duração do teste.

As linhas onduladas nas barras laranjas (indicando testes quebrados) são para acessibilidade. Para ativá-las, você precisará da seguinte configuração no seu arquivo `serenity.conf`:

```hocon
serenity {
    report {
       accessibility = true
    }
}
```

## Cobertura de Testes Funcionais

Mais abaixo na tela, você encontrará a seção de Cobertura de Testes Funcionais:
![Uma página inicial típica de relatório do Serenity](img/functional-coverage-overview.png)

Esta seção fornece um detalhamento por capacidade (ou por como você decidiu agrupar suas funcionalidades). Você pode definir os tipos de requisitos usados no seu projeto usando a propriedade `serenity.requirement.types`, por exemplo:

```hocon
serenity {
  requirement {
    types = "epic, feature"
  }
}
```
Observe que para o Cucumber, o nível mais baixo sempre será definido como _Feature_.

A seção _Estatísticas Principais_ mostra tempos de execução e o número total de cenários de teste e casos de teste. Você pode definir os intervalos de valores de duração que aparecem no relatório usando a propriedade `serenity.report.durations`:

```hocon
serenity{
  report {
    durations = "1,2,4,8,15,30,60"
  }
}
```

O Serenity distingue entre _Cenários de Teste_ mais gerais e _Casos de Teste_ mais específicos.

Um cenário simples ou teste JUnit conta como um cenário com um único caso de teste. Por exemplo, considere o seguinte cenário:

```gherkin
Scenario: Colin faz login com credenciais válidas de Colin
    Given Colin está na página de login
    When Colin faz login com credenciais válidas
    Then ele deve ver o catálogo de produtos
```

Isso conta como 1 cenário com 1 caso de teste.

| Cenários | Casos de Teste |
|----------|----------------|
| 1        | 1              |

Um Scenario Outline, por outro lado, é um único cenário com muitos casos de teste. Então, se você tivesse o seguinte Scenario Outline:

```gherkin
    Scenario Outline: Login com credenciais inválidas para <username>
      Given Colin está na página de login
      When Colin tenta fazer login com as seguintes credenciais:
        | username   | password   |
        | <username> | <password> |
      Then ele deve ver a mensagem de erro <message>
      Examples:
        | username        | password       | message                                                     |
        | standard_user   | wrong_password | Username and password do not match any user in this service |
        | unknown_user    | secret_sauce   | Username and password do not match any user in this service |
        | unknown_user    | wrong_password | Username and password do not match any user in this service |
        | locked_out_user | secret_sauce   | Sorry, this user has been locked out                        |
```

Então o relatório de teste incluiria 1 cenário mas 4 casos de teste:

| Cenários | Casos de Teste |
|----------|----------------|
| 1        | 4              |

Portanto, um conjunto de testes que contém ambos os cenários incluiria 2 cenários compostos por 5 casos de teste:

| Cenários | Casos de Teste |
|----------|----------------|
| 2        | 5              |

## Detalhes da Cobertura Funcional

Mais abaixo, os resultados da cobertura funcional são exibidos em mais detalhes:

![Detalhes da Cobertura Funcional](img/functional-coverage-details.png)

Isso lista os requisitos por categoria. Por padrão, os resultados do Cucumber organizados em pastas sob `src/test/resources/features` serão organizados por Capacidades e Features. Como mencionado acima, você pode personalizar essas categorias usando a propriedade `serenity.requirement.types`.


## Resultados dos Testes

A aba Resultados dos Testes lista os resultados reais dos testes:

![Resultados dos Testes](img/test-results.png)

Para testes orientados a dados e Scenario Outline, cada linha de dados é reportada como um resultado de teste separado, e marcada com um ícone de tabela para indicar que é um resultado de teste orientado a dados.

## Erros e Tags

A última seção do relatório lista as causas mais frequentes de falhas nos testes:

![Erros e tags](img/tags.png)

Esta seção também menciona quais funcionalidades contêm mais testes falhando. Você pode ver quais testes falham por um determinado motivo clicando na tag de _erro_ correspondente logo abaixo desta seção.

Ela também lista as tags que aparecem nas funcionalidades. Você pode excluir tags que não deseja que apareçam nesta seção (por exemplo, tags técnicas) usando a propriedade `serenity.report.exclude.tags`, por exemplo:
```
serenity {
    report {
        exclude.tags = "resetappstate,singlebrowser,manual"
    }
}
```
