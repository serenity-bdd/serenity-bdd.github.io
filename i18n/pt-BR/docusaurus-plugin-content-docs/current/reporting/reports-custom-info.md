---
id: reports_custom_info
title: Campos Personalizados em Relatórios
sidebar_position: 5
---
## Relatórios com Campos Personalizados

Campos personalizados podem ser incluídos nos relatórios, usando valores que são obtidos das variáveis de ambiente ou passados para o build via propriedades do sistema. Isso pode ser útil se você quiser incluir a versão do produto ou do build, o ambiente em que os testes foram executados, ou a data da execução do teste.

Você pode adicionar campos personalizados ao seu relatório definindo propriedades do sistema com o prefixo especial `report.customfields`. Estas podem ir no seu arquivo `serenity.properties` no diretório raiz do seu projeto, ou você pode passá-las como opções de linha de comando.

Por exemplo, você poderia adicionar as seguintes propriedades ao seu arquivo `serenity.properties`.
```
report.customfields.environment = Integration
report.customfields.ApplicationVersion = 1.2.3
```

Isso produziria um relatório contendo esses valores, como mostrado aqui:

![Campos personalizados aparecendo no relatório de resumo HTML](img/custom-report-fields.png)

### Acessando variáveis do sistema
Também podemos acessar quaisquer variáveis do sistema às quais o Java tem acesso. Por exemplo, poderíamos incluir o nome do usuário que executou o teste com a variável do sistema `${USER}`:

```
report.customfields.user = ${USER}
```

Esta propriedade resultaria em um relatório como o seguinte:

![Campos personalizados também podem incluir variáveis do sistema](img/custom-reports-including-a-system-variable.png)

Nem todas as propriedades do sistema estão disponíveis para o Java. Por exemplo, em sistemas Linux, a variável `$HOST` fornece o nome da máquina local. Poderíamos incluir isso no nosso relatório adicionando a seguinte propriedade:

```
report.customfields.host = ${HOST}
```

No entanto, como esta variável não está disponível para o Java, precisaríamos passá-la para o Serenity pela linha de comando, assim:

```bash
mvn serenity:aggregate -DHOST=$HOST
```

### Sobrescrevendo valores de propriedades

[[custom-report-fields-with-provided-values]]
.Você pode passar propriedades do sistema pela linha de comando
image::custom-reports-with-provided-property.png[]

Você pode, é claro, passar outras propriedades, para sobrescrever as do seu arquivo `serenity.properties`. Aqui sobrescrevemos a versão da aplicação:

```bash
mvn serenity:aggregate -DHOST=$HOST -Dreport.customfields.ApplicationVersion=1.2.4
```
Mas uma solução mais elegante, se você sabe que sempre estará passando uma variável, é usar uma variável mais curta no seu arquivo `serenity.properties` e então passá-la. Por exemplo, aqui usamos a propriedade `environment` para exibir o ambiente atual nas propriedades personalizadas:

```
report.customfields.environment = ${environment}
```

Podemos definir este valor pela linha de comando como mostrado aqui:

```bash
mvn serenity:aggregate -DHOST=$HOST -Denvironment=INT5
```

#### Usando valores padrão
Se uma variável de ambiente não existir, você pode especificar um valor de fallback.

```
report.customfields.user = ${USER:-Unknown}
report.customfields.host = ${HOST:-} # Em branco em vez dos caracteres literais "${HOST}"
```
O mecanismo por trás da substituição: [Apache Commons `StringSubstitutor`](https://commons.apache.org/proper/commons-text/apidocs/org/apache/commons/text/StringSubstitutor.html)

### Ordenando as propriedades personalizadas

Por padrão, os campos aparecerão em uma ordem arbitrária. Você pode forçar os campos a aparecerem em uma ordem pré-determinada usando o campo `report.customfields.order`:

```
report.customfields.order=ApplicationVersion,environment,user,host
```

### Um exemplo completo
Um exemplo completo dessas propriedades e seus vários usos é mostrado aqui:

```
report.customfields.ApplicationVersion = 1.2.3
report.customfields.environment = ${environment}
report.customfields.user = ${USER}
report.customfields.host = ${HOST}
report.customfields.order=ApplicationVersion,environment,user,host
```

## Informações de Build Personalizadas

Você também pode adicionar seus próprios campos na tela de Informações do Build, usando as propriedades `sysinfo.*`.
As propriedades `sysinfo.*` permitem definir campos e valores que aparecerão na página de Informações do Build. Para combinações simples de campo-valor, o campo aparece ao lado dos outros valores na tela de Informações do Build:

```
sysinfo.lead = Daisy
```

Você pode usar expressões Groovy para acessar propriedades do sistema (que você pode passar pela linha de comando). A propriedade `env` dá acesso às variáveis de ambiente atuais. Por exemplo, para exibir o número do build atual do Jenkins, você poderia incluir a seguinte linha:

```
sysinfo.build = "${env.BUILD_NUMBER}"
```

Você também pode agrupar propriedades personalizadas em seções com subtítulos. Um exemplo de tal configuração no arquivo `serenity.conf` é mostrado abaixo:

```
sysinfo {
  lead = Daisy
  build = "${env.BUILD_NUMBER}"
  Test Run {
    Run By = "${env.USER}"
    Java Version = "${java.version}"
  }
}
```

A tela correspondente de Informações do Build é mostrada abaixo:

![Detalhes personalizados de Informações do Build](img/build-info.png)

## Definindo informações do build programaticamente

Você também pode usar a classe `BuildInfo` para adicionar informações à página de Informações do Build programaticamente. Simplesmente defina a seção, e adicione quantos pares de nome/valor de propriedade você quiser. Você pode ver um exemplo aqui:

```java
BuildInfo.section("Toggles").setProperty("toggle-custom-ads-v2", "on");
BuildInfo.section("Toggles").setProperty("toggle-user-feedback", "on");

BuildInfo.section("Versions").setProperty("game-history-service", "1.2.3");
BuildInfo.section("Versions").setProperty("player-service", "3.4.5");
BuildInfo.section("Versions").setProperty("related-products-service", "2.3.4");
```

![Detalhes personalizados de Informações do Build](img/custom-build-info.png)
