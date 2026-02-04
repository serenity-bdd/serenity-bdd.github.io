---
id: saucelabs
title: SauceLabs
sidebar_position: 4
---
# Integração do Serenity BDD com SauceLabs

O plugin `serenity-saucelabs` fornece integração perfeita com a plataforma de automação de testes online [SauceLabs](https://saucelabs.com/).

## Adicionando o plugin SauceLabs

Para adicionar o suporte integrado ao SauceLabs em seu projeto, você precisará adicionar a dependência `serenity-saucelabs` às dependências do seu projeto. Para Maven, você adicionaria o seguinte:
```xml
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-saucelabs</artifactId>
        <version>${serenity.version}</version>
    </dependency>
```

E para Gradle:
```groovy
    testImplementation "net.serenity-bdd:serenity-saucelabs:${serenityVersion}"
```

## Especificando suas credenciais e URL do grid SauceLabs
Em seguida, você precisará de uma [conta SauceLabs](https://saucelabs.com/pricing).

Depois você precisará configurar suas credenciais SauceLabs (se você estiver logado no Dashboard do Saucelabs [você pode encontrá-las nesta página]. A maneira mais simples de fazer isso é definir as seguintes propriedades de sistema:
* `SAUCE_USERNAME` - Nome de usuário do SauceLabs
* `SAUCE_ACCESS_KEY` - Chave de acesso do SauceLabs

Alternativamente, você pode definir seu nome de usuário e chave de acesso usando as propriedades `sauce.username` e `sauce.key` respectivamente no seu arquivo `serenity.conf`:

```hocon
sauce.username=myuser
sauce.key=XXXXXXXX
```

## Configurando o driver SauceLabs

O Serenity interage com o SauceLabs através do driver `RemoteDriver`. Você precisará especificar a URL remota para a região geográfica que deseja usar na propriedade `webdriver.remote.url`, assim:
```hocon
webdriver {
  driver = remote
  remote.url = "https://ondemand.us-west-1.saucelabs.com/wd/hub"
}
```

## Ativando o plugin SauceLabs

O plugin Serenity SauceLabs será invocado se o Serenity encontrar uma seção `"sauce:options"` no seu arquivo `serenity.conf`, ou se você especificar uma `remote.webdriver.url` que aponte para um servidor SauceLabs. Se você não tiver capabilities específicas do Saucelabs, simplesmente defina a propriedade `sauce.active` como true assim:

```hocon
sauce {
  active = true
}
```

## Definindo Capabilities do Saucelabs

Você pode especificar o sistema operacional e o navegador nos quais deseja executar seus testes personalizando as [Selenium Capabilities](https://docs.saucelabs.com/dev/test-configuration-options/#desktop-and-mobile-capabilities-sauce-specific--optional) no seu arquivo `serenity.conf`. Faça isso na seção `"sauce:options"` do arquivo `serenity.conf`, por exemplo:

```hocon
    webdriver {
      driver = "remote"
      capabilities {
        browserName = "chrome"
        version = "104.0"
        platform = "Windows 10"
        "sauce:options" {
          tags = ["smoketest","billing"]
          recordVideo = true
          recordLogs = false
        }
      }
    }
```
