---
id: integrating_with_jira
title: Integrando com o JIRA
sidebar_position: 5
---
# Integrando com o JIRA

Com o Serenity BDD é possível criar uma integração bidirecional estreita com o JIRA.

### Integração unidirecional com o JIRA

O [JIRA](https://www.atlassian.com/software/jira) é um sistema popular de rastreamento de issues que também é frequentemente usado para projetos Ágeis e gerenciamento de requisitos. Muitas equipes usando JIRA armazenam seus requisitos eletronicamente na forma de cartões de história e epics no JIRA.

Suponha que estamos implementando uma aplicação de Frequent Flyer para uma companhia aérea. A ideia é que os viajantes ganharão pontos quando voarem com nossa companhia aérea, com base na distância que voarem. Os viajantes começam com um status "Bronze", e podem ganhar um status melhor voando mais frequentemente. Viajantes com um status de frequent flyer mais alto se beneficiam de vantagens como acesso a lounges, embarque prioritário, e assim por diante. Um dos cartões de história para esta funcionalidade pode parecer com o seguinte:

![](img/frequent-flyer-story-card.png)

Este cartão de história contém uma descrição seguindo um dos formatos frequentemente usados para descrições de histórias de usuário ("como um..eu quero..para que"). Ele também contém um campo personalizado "Acceptance Criteria", onde podemos escrever um breve esboço da "definição de pronto" para esta história.

Essas histórias podem ser agrupadas em epics, e colocadas em sprints para planejamento do projeto, como ilustrado no board Agile do JIRA mostrado aqui:

![](img/jira-agile-board.png)

Como ilustrado no cartão de história, cada uma dessas histórias tem um conjunto de critérios de aceitação, que podemos construir em cenários mais detalhados, baseados em exemplos concretos. Podemos então automatizar esses cenários usando uma ferramenta BDD como JBehave.

A história no cartão de história do frequent flyer descreve quantos pontos os membros precisam ganhar para receber cada nível de status. Um cenário JBehave para o cartão de história ilustrado anteriormente pode parecer assim:

```
Frequent Flyer status is calculated based on points

Meta:
@issue #FH-17

Scenario: New members should start out as Bronze members
Given Jill Smith is not a Frequent Flyer member
When she registers on the Frequent Flyer program
Then she should have a status of Bronze

Scenario: Members should get status updates based on status points earned
Given a member has a status of <initialStatus>
And he has <initialStatusPoints> status points
When he earns <extraPoints> extra status points
Then he should have a status of <finalStatus>

Examples:
| initialStatus | initialStatusPoints | extraPoints | finalStatus | notes                    |
| Bronze        | 0                   | 300         | Silver      | 300 points for Silver    |
| Silver        | 0                   | 700         | Gold        | 700 points for Gold      |
| Gold          | 0                   | 1500        | Platinum    | 1500 points for Platinum |
```

O Serenity permite que você associe histórias JBehave ou testes JUnit com um cartão JIRA usando a meta tag @issue (ilustrada acima), ou a anotação equivalente @Issue no JUnit. No nível mais básico, isso gerará links de volta para os cartões JIRA correspondentes nos seus relatórios de teste, como ilustrado aqui:

![jira-serenity-report](img/jira-serenity-report.png)

Para que isso funcione, o Serenity precisa saber onde está seu servidor JIRA. A maneira mais simples de fazer isso é definir as seguintes propriedades em um arquivo chamado serenity.properties no diretório raiz do seu projeto:

```
jira.url=https://myserver.atlassian.net
jira.project=FH
jira.username=jirauser
jira.password=t0psecret
```

Você também pode configurar essas propriedades no seu arquivo pom.xml do Maven ou passá-las como propriedades do sistema.

#### Cobertura de Funcionalidades
Mas os resultados dos testes relatam apenas parte do quadro. Se você está usando JIRA para armazenar suas histórias e epics, pode usá-los para acompanhar o progresso. Mas como você sabe quais testes de aceitação automatizados foram implementados para suas histórias e epics, e, igualmente importante, como você sabe quais histórias ou epics não têm testes de aceitação automatizados? Em termos ágeis, uma história não pode ser declarada "pronta" até que os testes de aceitação automatizados passem. Além disso, precisamos ter confiança não apenas de que os testes existem, mas que eles testam os requisitos corretos, e que os testam suficientemente bem.

Chamamos essa ideia de medir o número (e qualidade) dos testes de aceitação para cada uma das funcionalidades que queremos construir de "cobertura de funcionalidades". O Serenity pode fornecer relatórios de cobertura de funcionalidades além dos resultados de teste mais convencionais. Se você está usando JIRA, precisará adicionar serenity-jira-requirements-provider à seção de dependências do seu arquivo pom.xml:
```
<dependencies>
    ...
    <dependency>
        <groupId>net.serenity.plugins.jira</groupId>
        <artifactId>serenity-jira-requirements-provider</artifactId>
        <version>xxx</version>
    </dependency>
</dependencies>
```
O número da versão real pode ser diferente para você - sempre dê uma olhada no [Maven Central](http://search.maven.org/#search%7Cga%7C1%7Cthucydides) para saber qual é a versão mais recente.

Você também precisará adicionar esta dependência à configuração do plugin de relatórios do Serenity:

```
<build>
    ...
    <plugins>
        ...
        <plugin>
            <groupId>net.serenity.maven.plugins</groupId>
            <artifactId>maven-serenity-plugin</artifactId>
            <version>xxx</version>
            <executions>
                <execution>
                    <id>serenity-reports</id>
                    <phase>post-integration-test</phase>
                    <goals>
                        <goal>aggregate</goal>
                    </goals>
                </execution>
            </executions>
            <dependencies>
                <dependency>
                    <groupId>net.serenity.plugins.jira</groupId>
                    <artifactId>serenity-jira-requirements-provider</artifactId>
                    <version>xxx</version>
                </dependency>
            </dependencies>
        </plugin>
    </plugins>
</build>
```

Agora, quando você executar os testes, o Serenity consultará o JIRA para determinar os epics e histórias que você definiu e listá-los na página de Requisitos. Esta página fornece uma visão geral de quantos requisitos (epics e histórias) têm testes passando (verde), quantos têm testes falhando (vermelho) ou quebrados (laranja), e quantos não têm testes (azul):

![serenity-jira-requirements-view](img/serenity-jira-requirements-view.png)

Se você clicar em um epic, pode ver as histórias definidas para o epic, incluindo um indicador (na coluna "Coverage") de quão bem cada história foi testada.

![serenity-jira-report-epic-details](img/serenity-jira-report-epic-details.png "Detalhes do Epic no relatório do Serenity")

A partir daqui, você pode querer aprofundar nos detalhes sobre uma determinada história, incluindo quais testes de aceitação foram definidos para esta história, e se eles foram executados com sucesso:

![serenity-jira-story-report](img/serenity-jira-story-report.png)
Tanto o JIRA quanto a integração JIRA-Serenity são bastante flexíveis. Vimos anteriormente que configuramos um campo personalizado "Acceptance Criteria" nas nossas histórias JIRA. Exibimos este campo personalizado no relatório mostrado acima incluindo-o no arquivo serenity.properties, assim:

```
jira.custom.field.1=Acceptance Criteria
```

O Serenity lê o texto narrativo que aparece neste relatório ("As a frequent flyer...") do campo Description do cartão JIRA correspondente. Podemos substituir este comportamento e fazer com que o Serenity leia este valor de um campo personalizado diferente usando a propriedade `jira.custom.narrative.field`. Por exemplo, algumas equipes usam um campo personalizado chamado "User Story" para armazenar o texto narrativo, em vez do campo Description. Poderíamos fazer com que o Serenity usasse este campo da seguinte forma:

```
jira.custom.narrative.field=User Story
```

### Integração bidirecional com o JIRA

#### Links do JIRA para o Serenity
A forma mais simples de integração bidirecional entre o Serenity e o JIRA é fazer com que o Serenity insira um comentário contendo links para os relatórios de teste do Serenity para cada cartão de issue relacionado. Para que isso funcione, você precisa informar ao Serenity onde os relatórios estão. Uma forma de fazer isso é adicionar uma propriedade chamada serenity.public.url ao seu arquivo serenity.properties com o endereço dos relatórios do serenity.

```
serenity.public.url=http://buildserver.myorg.com/latest/serenity/report
```

Isso informará ao Serenity que você não apenas quer links dos relatórios do Serenity para o JIRA, mas também quer incluir links nos cartões JIRA de volta para os relatórios do Serenity correspondentes. Quando esta propriedade é definida, o Serenity adicionará um comentário como o seguinte a quaisquer issues associadas aos testes executados:

![jira-serenity-comment](img/jira-serenity-comment.png)

O `serenity.public.url` normalmente apontará para um servidor web local onde você implanta seus relatórios, ou para um caminho dentro do seu servidor de CI. Por exemplo, você poderia publicar os relatórios do Serenity no Jenkins usando o [Jenkins HTML Publisher Plugin](https://wiki.jenkins-ci.org/display/JENKINS/HTML+Publisher+Plugin), e então adicionar uma linha como a seguinte ao seu arquivo serenity.properties:

```
serenity.public.url=http://jenkins.myorg.com/job/myproject-acceptance-tests/Serenity_Report/
```

Se você não quiser que o Serenity atualize as issues do JIRA para uma execução específica (por exemplo, ao executar seus testes localmente), você também pode definir `serenity.skip.jira.updates` como true, por exemplo:

```
serenity.skip.jira.updates=true
```

Isso simplesmente escreverá os números de issue relevantes no log em vez de tentar conectar ao JIRA.

#### Atualizando estados de issues do JIRA

Você também pode configurar o plugin para atualizar o status das issues do JIRA. Isso é desativado por padrão: para usar esta opção, você precisa definir a opção `serenity.jira.workflow.active` como true, por exemplo:

```
serenity.jira.workflow.active=true
```

A configuração padrão funcionará com o workflow padrão do JIRA: issues abertas ou em progresso associadas a testes bem-sucedidos serão resolvidas, e issues fechadas ou resolvidas associadas a testes falhando serão reabertas. Se você está usando um workflow personalizado, ou quer modificar a forma como as transições funcionam, pode escrever sua própria configuração de workflow. A configuração de workflow usa uma DSL Groovy simples. O seguinte é um exemplo do arquivo de configuração usado para o workflow padrão:

```
when 'Open', {
    'success' should: 'Resolve Issue'
}

when 'Reopened', {
    'success' should: 'Resolve Issue'
}

when 'Resolved', {
    'failure' should: 'Reopen Issue'
}

when 'In Progress', {
    'success' should: ['Stop Progress','Resolve Issue']
}

when 'Closed', {
    'failure' should: 'Reopen Issue'
}
```

Você pode escrever seu próprio arquivo de configuração e colocá-lo no classpath do seu projeto de teste (por exemplo, no diretório do serenity). Então você pode substituir a configuração padrão usando a propriedade `serenity.jira.workflow`, por exemplo:

```
serenity.jira.workflow=my-workflow.groovy
```

Alternativamente, você pode simplesmente criar um arquivo chamado jira-workflow.groovy e colocá-lo em algum lugar no seu classpath (por exemplo, no diretório src/test/resources). O Serenity então usará este workflow. Em ambos os casos, você não precisa definir explicitamente a propriedade `serenity.jira.workflow.active`.

#### Gerenciamento de releases

No JIRA, você pode organizar os releases do seu projeto em versões, como ilustrado aqui:

![jira-versions](img/jira-versions.png)

Você pode e atribuir cartões a uma ou mais versões usando o campo `Fix Version/s`:

![jira-fix-versions](img/jira-fix-versions.png)

Por padrão, o Serenity lerá os detalhes da versão dos Releases no JIRA. Os resultados dos testes serão associados a uma versão específica usando o campo "Fixed versions". A aba *Releases* fornece um resumo das diferentes versões planejadas, e quão bem elas foram testadas até agora:

![releases-tab](img/releases-tab.png)

O JIRA usa uma estrutura de versão plana - você não pode ter, por exemplo, releases que são compostos por vários sprints. O Serenity permite que você organize estes em uma estrutura hierárquica baseada em uma convenção de nomenclatura simples. Por padrão, o Serenity usa "release" como o nível mais alto de release, e "iteration" ou "sprint" como o segundo nível. Por exemplo, suponha que você tenha a seguinte lista de versões no JIRA - Release 1 - Iteration 1.1 - Iteration 1.2 - Release 2 - Release 3

Isso produzirá relatórios de Release para Release 1, Release 2 e Release 3, com Iteration 1.2 e Iteration 1.2 aparecendo abaixo de Release 1. Os relatórios conterão a lista de requisitos e resultados de teste associados a cada release. Você pode aprofundar em qualquer um dos releases para ver detalhes sobre aquele release específico.

![serenity-jira-releases](img/serenity-jira-releases.png)

Você também pode personalizar os nomes dos tipos de releases usando a propriedade serenity.release.types, por exemplo:

```
serenity.release.types=milestone, release, version
```
