---
id: bitbar
title: BitBar
sidebar_position: 5
---
# Integração do Serenity BDD com BitBar

BitBar é a nuvem para todas as suas necessidades de testes. Com BitBar, usuários do Serenity têm acesso instantâneo para escalar seus testes cross-browser em dispositivos iOS e Android reais, além dos navegadores mais recentes e populares em macOS, Windows e Linux.

O plugin `serenity-bitbar` garante integração perfeita com a plataforma de automação de testes online [BitBar](https://BitBar.com/).

## Adicionando o plugin BitBar

Para adicionar o suporte integrado ao BitBar em seu projeto, adicione a dependência `serenity-bitbar` às dependências do seu projeto da seguinte forma:

* para Maven
```xml
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-bitbar</artifactId>
    <version>${serenity.version}</version>
</dependency>
```

* para Gradle:
```groovy
testImplementation "net.serenity-bdd:serenity-bitbar:${serenityVersion}"
```

## Especificando suas credenciais e URL do grid BitBar
Em seguida, você precisa de uma [conta BitBar](https://smartbear.com/product/bitbar/free-trial/).

Você pode adicionar suas [credenciais BitBar](https://cloud.bitbar.com/#user/security-center) de duas maneiras:

* Defina a seguinte propriedade de sistema

`BITBAR_API_KEY` - Chave de API do BitBar

* Defina sua chave de API usando a propriedade `bitbar.apiKey` no seu arquivo `serenity.conf`

```hocon
bitbar.apiKey=XXXXXXXX
```

## Configurando o driver BitBar

O Serenity interage com o BitBar através do driver `RemoteDriver`. Você precisa especificar a URL remota para a região geográfica que deseja usar na propriedade `webdriver.remote.url` da seguinte forma:
```hocon
webdriver {
  driver = remote
  remote.url = "https://eu-mobile-hub.bitbar.com/wd/hub"
}
```
Alternativamente, você pode definir um hub e a `remote.url` será configurada automaticamente:

```hocon
bitbar.hub = "eu-desktop-hub"
```

## Ativando o plugin BitBar

O plugin Serenity BitBar é invocado se o Serenity encontrar uma seção `bitbar:options` no seu arquivo `serenity.conf`, ou se você especificar uma `remote.webdriver.url` que aponte para um servidor BitBar. Se você não tiver capabilities específicas do BitBar, simplesmente defina a propriedade `bitbar.active` como true da seguinte forma:

```hocon
bitbar {
  active = true
}
```

## Definindo Capabilities do BitBar

Você pode especificar o sistema operacional e o navegador nos quais deseja executar seus testes personalizando as capabilities no seu arquivo `serenity.conf`. Faça isso na seção `bitbar:options` do arquivo `serenity.conf`, por exemplo:

```hocon
webdriver {
  driver = "remote"
  capabilities {
    browserName = "chrome"
    version = "latest"
    platform = "Windows"
    "bitbar:options" {
      osVersion = "10"
      screenResolution = "1920x1200"
    }
  }
}
```
