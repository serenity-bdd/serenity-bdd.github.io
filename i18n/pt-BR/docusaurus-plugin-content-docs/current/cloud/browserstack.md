---
id: browserstack
title: BrowserStack
sidebar_position: 3
---
# Introdução

[Browserstack](https://www.browserstack.com/automate?utm_source=serenity&utm_medium=partnered) é uma plataforma online que permite executar testes cross-browser em paralelo e em escala. Nesta seção, veremos como ela se integra com o Serenity.

## Adicionando o plugin Browserstack ao seu projeto

O Serenity vem com um plugin dedicado para BrowserStack que facilita muito a execução dos seus testes nesta plataforma. Para usá-lo, primeiro adicione a dependência `serenity-browserstack` ao seu projeto. No Maven, ficaria assim:
```xml
        <dependency>
            <groupId>net.serenity-bdd</groupId>
            <artifactId>serenity-browserstack</artifactId>
            <version>${serenity.version}</version>
        </dependency>
```

Ou no Gradle:
```groovy
    testImplementation "net.serenity-bdd:serenity-browserstack:${serenityVersion}"
```

## Especificando suas credenciais e URL do grid BrowserStack
Em seguida, você precisará de uma [conta BrowserStack](https://www.browserstack.com/pricing).

Você pode adicionar suas [credenciais BrowserStack](https://www.browserstack.com/accounts/settings) de duas maneiras. A mais simples é definir as seguintes propriedades de sistema:
* `BROWSERSTACK_USER` - Nome de usuário do BrowserStack
* `BROWSERSTACK_KEY` - Chave de acesso do BrowserStack

Alternativamente, você pode definir seu nome de usuário e chave de acesso usando as propriedades `browserstack.user` e `browserstack.key` respectivamente no seu arquivo `serenity.conf`:

```hocon
browserstack.user=myuser
browserstack.key=XXXXXXXX
```

## Configurando o driver BrowserStack
O Serenity interage com o BrowserStack através do driver `RemoteDriver`. Você pode especificar a URL remota explicitamente, ou deixar a biblioteca `serenity-browserstack` fazer isso por você. Por exemplo, para configurar a URL explicitamente você poderia usar uma configuração `serenity.conf` assim:
```hocon
webdriver {
  driver = remote
  remote.url =
  "https://"${BROWSERSTACK_USER}":"${BROWSERSTACK_KEY}"@hub.browserstack.com/wd/hub"
}
```

Se a propriedade `webdriver.remote.url` não estiver definida, o Serenity usará esses valores para construir uma para você se o plugin BrowserStack estiver ativo (veja abaixo).

## Definindo Capabilities do BrowserStack
Você pode especificar o sistema operacional e o navegador nos quais deseja executar seus testes personalizando as [Selenium Capabilities](https://www.browserstack.com/automate/capabilities) no seu arquivo `serenity.conf`. Faça isso na seção `"bstack:options"` do arquivo `serenity.conf`, por exemplo:

```hocon
webdriver {
  driver = "remote"
  capabilities {
    browserName = "Chrome"
    #
    # Quaisquer opções específicas do BrowserStack vão na seção 'bstack:options'
    #
    "bstack:options" {
      os = "Windows"
      osVersion = "11"
      browserVersion = "latest"
      local = false
      resolution = "1920x1200"
      seleniumVersion = "4.6.0"
      video = true
      idleTimeout = 300 // Certifique-se de definir um valor alto se estiver executando testes em paralelo
    }
  }
}
```

Se você estiver executando os testes em paralelo, certifique-se de definir o valor de idleTimeout para um número alto (maior que a duração total dos seus testes). Isso evitará que a conexão com o BrowserStack expire antes de ser atualizada com os resultados dos testes.
