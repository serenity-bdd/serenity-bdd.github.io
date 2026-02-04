---
id: selenoid
title: Selenoid
sidebar_position: 1
---
# Introdução

[Selenoid](https://aerokube.com/selenoid/latest/) é uma poderosa implementação em Golang do código original do hub Selenium. Ele usa Docker para iniciar navegadores. Consulte o repositório GitHub se você precisar do código fonte.

A maneira mais simples de configurar o driver que você deseja usar é no arquivo `serenity.conf` do seu projeto (que você encontrará na pasta `src/test/resources`).
Consulte [Configuração do Driver](https://serenity-bdd.github.io/docs/guide/driver_config)

Você pode configurar seus testes para executar neste servidor definindo duas propriedades:

 - Defina a propriedade `webdriver.driver` como `remote`
 - Defina a propriedade `webdriver.remote.url` como o endereço da sua instância Selenoid (http://localhost:4444/wd/hub por padrão)

```conf
webdriver {
  driver = remote
  remote.url = "http://localhost:4444/wd/hub"
  }
 }
```

Você também pode fornecer propriedades adicionais sobre o navegador ou ambiente de destino, incluindo:
- `browserName`: propriedade com o nome do driver que você deseja executar (por exemplo, "chrome")
- `browserVersion`: Qual versão do navegador remoto usar (por exemplo, "93")

``` conf

webdriver {
  driver = remote
  remote.url = "http://localhost:4444/wd/hub"
  capabilities {
    browserName = "chrome"
    browserVersion = "93"
  }
}

```

Se você usar serenity.properties:
```properties

webdriver.driver = remote
webdriver.remote.url = http://localhost:4444/wd/hub
webdriver.capabilities.browserVersion=93.0
webdriver.capabilities.browserName=chrome

```

Exemplo com múltiplos ambientes para Selenoid e navegador local:
``` conf
serenity {
  project.name = "Projeto com navegadores Remoto(selenoid) e Local"
  console.colors = true
  logging = VERBOSE
  take.screenshots = AFTER_EACH_STEP
}

environment = selenoid

environments {
  selenoid {
    webdriver {
      driver = remote
      remote.url = "http://localhost:4444/wd/hub"
      capabilities {
        browserName = "chrome"
        browserVersion = "118.0"
        "selenoid:options" {
            enableVNC = true
            enableVideo = false
            sessionTimeout = 10m
            timeZone = America/Los_Angeles
          }
        "goog:chromeOptions" {
            args = ["--remote-allow-origins=*", "disable-gpu", "disable-setuid-sandbox", "disable-dev-shm-usage"]
            prefs {
              profile.profile_default_content_settings.popups = 0
              profile.default_content_setting_values.notifications = 1
             }
          }
        timeouts {
           #script = 30000
           #pageLoad = 300000
           implicit = 5000
         }
      }
    }
  }
  local {
    webdriver {
      driver = chrome
      capabilities {
        "goog:chromeOptions" {
            args = ["--remote-allow-origins=*", "disable-gpu", "disable-setuid-sandbox", "disable-dev-shm-usage"]
            prefs {
              profile.profile_default_content_settings.popups = 0
              profile.default_content_setting_values.notifications = 1
             }
          }
        timeouts {
           #script = 30000
           #pageLoad = 300000
           implicit = 5000
         }
      }
    }
  }
}

```

Você pode executar testes em um ambiente específico via linha de comando.
`mvn clean verify -Denvironment=selenoid`
