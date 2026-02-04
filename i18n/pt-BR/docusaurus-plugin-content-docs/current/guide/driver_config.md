---
id: driver_config
title: Configurando o Selenium WebDriver
sidebar_position: 8
---

O Selenium WebDriver permite que você execute seus testes em uma variedade de navegadores, cada um com uma variedade de opções de configuração. Nesta seção, veremos como configurar seu driver WebDriver no Serenity.

A maneira mais simples de configurar o driver que você deseja usar é no arquivo `serenity.conf` do seu projeto (que você encontrará na pasta `src/test/resources`).

As opções básicas de configuração vão na seção `webdriver`. Por exemplo, para executar seus testes com o Chrome, você define a propriedade `webdriver.driver` como "chrome":

```hocon
webdriver {
    driver = "chrome"
}
```

Todos os navegadores padrão do WebDriver são suportados:

| Navegador         | Valor       | Exemplo                       |
| -----------       | ----------- | ----------------------------  |
| Chrome            | chrome      | webdriver.driver = "chrome"   |
| Firefox           | firefox     | webdriver.driver = "firefox"  |
| Microsoft Edge    | edge        | webdriver.driver = "edge"     |
| Internet Explorer | IE          | webdriver.driver = "IE"       |
| Safari            | safari      | webdriver.driver = "safari"   |

## Configurando os drivers do WebDriver

Quando você executa um teste WebDriver contra quase qualquer driver, você precisa de um arquivo binário específico do sistema operacional para atuar como intermediário entre seu teste e o navegador que você deseja manipular. Os principais drivers, e onde você pode baixá-los, estão listados abaixo:

| Navegador | Driver | Localização | Propriedade do Sistema |
| ------- | ------ | -------- | --------------- |
| Chrome | chromedriver | http://chromedriver.chromium.org | webdriver.chrome.driver |
| Firefox | geckodriver | https://github.com/mozilla/geckodriver/releases | webdriver.gecko.driver |
| Microsoft Edge | msedgedriver | https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/ | webdriver.edge.driver |
| Internet Explorer | IEDriverServer | https://github.com/SeleniumHQ/selenium/wiki/InternetExplorerDriver | webdriver.ie.driver |


### Downloads automáticos de drivers

Por padrão, o Selenium baixa e instala automaticamente os binários de driver apropriados para o driver especificado.

### Configurando binários de driver manualmente

Se você não pode ou não deseja baixar os binários do WebDriver automaticamente usando o WebDriverManager (por exemplo, se você está em uma rede corporativa que não tem acesso aos binários do WebDriverManager), você pode baixar os binários e configurá-los diretamente no arquivo `serenity.conf`.

Neste caso, você precisa ter o binário de driver correto no caminho do sistema, ou fornecer o caminho para o binário usando a propriedade do sistema mostrada na tabela acima. Por exemplo, seu arquivo serenity.conf pode conter o seguinte:

```hocon
webdriver.gecko.driver=/path/to/my/geckodriver
```

No entanto, adicionar um caminho do sistema ao seu arquivo serenity.properties é uma prática ruim, pois significa que seus testes só funcionarão se o diretório e binário especificados existirem, e que você esteja executando os testes no sistema operacional correto. Isso obviamente faz pouco sentido se você está executando seus testes tanto localmente quanto em um ambiente de CI.

Uma abordagem mais robusta é ter seus drivers em seu código-fonte, mas ter drivers diferentes por sistema operacional. O Serenity permite que você passe propriedades específicas do driver para um driver, desde que sejam prefixadas com drivers._os_. Por exemplo, a seguinte linha configurará o webdriver.chrome.driver se você estiver executando seus testes no Windows.

```hocon
drivers {
  windows {
    webdriver.chrome.driver = src/test/resources/webdriver/windows/chromedriver.exe
  }
```

Você pode facilmente configurar diferentes binários para diferentes sistemas operacionais assim:

```hocon
drivers {
  windows {
    webdriver.chrome.driver = src/test/resources/webdriver/windows/chromedriver.exe
  }
  mac {
    webdriver.chrome.driver = src/test/resources/webdriver/mac/chromedriver
  }
  linux {
    webdriver.chrome.driver = src/test/resources/webdriver/linux/chromedriver
  }
}
```

Esta abordagem também funciona quando você tem mais de um driver para configurar. Suponha que você precise executar testes em três ambientes, usando Firefox ou Windows. Uma abordagem conveniente é armazenar seus drivers em uma estrutura de diretórios em src/test/resources semelhante à seguinte:

```
src/test/resources
└── webdriver
    ├── linux
    │   ├── chromedriver
    │   └── geckodriver
    ├── mac
    │   ├── chromedriver
    │   └── geckkodriver
    └── windows
        ├── chromedriver.exe
        └── geckodriver.exe
```

Isso significa que seus testes não precisarão dos binários do webdriver instalados em cada máquina.

A configuração correspondente no `serenity.conf` para ambos os navegadores e cada sistema operacional ficaria assim:

```hocon
drivers {
  windows {
    webdriver.chrome.driver = src/test/resources/webdriver/windows/chromedriver.exe
    webdriver.gecko.driver = src/test/resources/webdriver/windows/geckodriver.exe
  }
  mac {
    webdriver.chrome.driver = src/test/resources/webdriver/mac/chromedriver
    webdriver.gecko.driver = src/test/resources/webdriver/mac/geckodriver
  }
  linux {
    webdriver.chrome.driver = src/test/resources/webdriver/linux/chromedriver
    webdriver.gecko.driver = src/test/resources/webdriver/linux/geckodriver
  }
}
```

## Especificando propriedades W3C

[Capacidades W3C](https://www.w3.org/TR/webdriver/#capabilities) são um conjunto padrão de recursos de driver que toda implementação de driver deve suportar. Você pode configurar capacidades W3C na seção `webdriver.capabilities` do seu arquivo `serenity.conf`, como mostrado aqui:

```hocon
webdriver {
  capabilities {
    browserName = "Chrome"
    browserVersion = "103.0"
    platformName = "Windows 11"
    acceptInsecureCerts = true
  }
}
```

Você pode definir timeouts em uma subseção dedicada assim:

```hocon
webdriver {
  capabilities {
    browserName = "Chrome"
    browserVersion = "103.0"
    platformName = "Windows 11"
    timeouts {
      script = 30000
      pageLoad = 300000
      implicit = 2000
    }
  }
}
```

Você também pode definir detalhes de configuração de proxy na seção `proxy`:
```hocon
webdriver {
  capabilities {
    browserName = "Chrome"
    browserVersion = "103.0"
    platformName = "Windows 11"
    proxy {
      proxyType = "30000"
      httpProxy = "myproxy.myorgcom:3128"
    }
  }
}
```

## Configurando o Chrome

# Configurando o Selenium WebDriver

[Conteúdo anterior inalterado até a seção de configuração do Chrome...]

## Configurando o Chrome

Você pode usar a capacidade especial `"goog:chromeOptions"` para definir qualquer uma das [opções do ChromeDriver](https://chromedriver.chromium.org/capabilities)
```hocon
webdriver {
  capabilities {
    browserName = "Chrome"
    browserVersion = "103.0"
    platformName = "Windows 11"
    screenResolution = "1280x1024"

    "goog:chromeOptions" {
      args = [ "window-size=1000,800", "headless" ]
      binary = ${HOME}/path/to/chromedriver
      detach = true
      localState = {
        cart-contents = [1,2,3]
      }
    }
  }
}
```

### Configurando argumentos do Chromedriver

### Configurando definições de proxy

O Chrome suporta várias configurações de proxy que podem ser especificadas no seu arquivo `serenity.conf`. Você pode configurar proxies na seção geral de capacidades ou dentro das opções específicas do Chrome:

#### Configuração Básica de Proxy
```hocon
webdriver {
  capabilities {
    "goog:chromeOptions" {
      proxy {
        proxyType = "MANUAL"
        httpProxy = "proxy.example.com:8080"
        sslProxy = "proxy.example.com:8443"
        noProxy = "localhost,127.0.0.1,.example.com"
      }
    }
  }
}
```

#### Tipos de Proxy
O Serenity suporta vários tipos de proxy:

1. Configuração Manual de Proxy
```hocon
"goog:chromeOptions" {
  proxy {
    proxyType = "MANUAL"
    httpProxy = "proxy.example.com:8080"    # Proxy HTTP
    sslProxy = "proxy.example.com:8443"     # Proxy HTTPS
    socksProxy = "socks.example.com:1080"   # Proxy SOCKS
    socksVersion = 5                        # Versão SOCKS (4 ou 5)
    noProxy = "localhost,127.0.0.1"         # Ignorar proxy para estes endereços
  }
}
```

2. PAC (Proxy Auto-Configuration)
```hocon
"goog:chromeOptions" {
  proxy {
    proxyType = "PAC"
    proxyAutoconfigUrl = "http://proxy.example.com/proxy.pac"
  }
}
```

3. Proxy do Sistema
```hocon
"goog:chromeOptions" {
  proxy {
    proxyType = "SYSTEM"  # Usar configurações de proxy do sistema
  }
}
```

4. Conexão Direta
```hocon
"goog:chromeOptions" {
  proxy {
    proxyType = "DIRECT"  # Sem proxy (conexão direta)
  }
}
```

5. Auto-detectar
```hocon
"goog:chromeOptions" {
  proxy {
    proxyType = "AUTODETECT"  # Auto-detectar configurações de proxy
  }
}
```

#### Autenticação de Proxy
Para proxies que exigem autenticação, inclua as credenciais na URL do proxy:
```hocon
"goog:chromeOptions" {
  proxy {
    proxyType = "MANUAL"
    httpProxy = "username:password@proxy.example.com:8080"
  }
}
```

#### Configuração de Proxy Específica por Ambiente
Você pode configurar diferentes definições de proxy para diferentes ambientes:
```hocon
environments {
  dev {
    webdriver.capabilities {
      "goog:chromeOptions" {
        proxy {
          proxyType = "DIRECT"
        }
      }
    }
  }
  qa {
    webdriver.capabilities {
      "goog:chromeOptions" {
        proxy {
          proxyType = "MANUAL"
          httpProxy = "proxy.qa.example.com:8080"
          sslProxy = "proxy.qa.example.com:8443"
          noProxy = "*.qa.example.com,localhost"
        }
      }
    }
  }
}
```

## Configurando o Microsoft Edge

O Microsoft Edge é um driver baseado no Chromium, então a configuração é muito semelhante ao Chrome. A principal diferença é o uso de `"ms:edgeOptions'"` em vez de `"goog:chromeOptions"`. Uma configuração típica é mostrada abaixo:

```hocon
webdriver {
  capabilities {
    browserName = "MicrosoftEdge"
    "ms:edgeOptions" {
      args = ["test-type", "ignore-certificate-errors", "headless",
        "incognito", "disable-infobars", "disable-gpu", "disable-default-apps", "disable-popup-blocking"]
    }
  }
}

```

## Configurando o Firefox

O Firefox usa a capacidade `"moz:firefoxOptions"` para definir opções específicas do navegador. Uma configuração de exemplo é mostrada abaixo:

```hocon
webdriver {
  capabilities {
    browserName = "firefox"

    timeouts {
      implicit = 1000
      script = 1000
      pageLoad = 1000
    }
    pageLoadStrategy = "normal"
    acceptInsecureCerts = true
    unhandledPromptBehavior = "dismiss"
    strictFileInteractability = true

    "moz:firefoxOptions" {
      args = ["-headless"],
      prefs {
        "javascript.options.showInConsole": false
      },
      log {"level": "info"},
    }
  }
}
```

# Configurando múltiplos ambientes

Você pode configurar múltiplas configurações de driver usando a seção `environments`, como mostrado abaixo. Então simplesmente defina a propriedade de sistema `environment` para o ambiente correspondente para usar essas configurações, por exemplo:

```
mvn clean verify -Denvironment=chrome
```

Uma seção de ambientes de exemplo é mostrada aqui:

```
environments {
  chrome {
    webdriver {
      driver = chrome
      autodownload = true
      capabilities {
        browserName = "chrome"
        acceptInsecureCerts = true
        "goog:chromeOptions" {
          args = ["test-type", "ignore-certificate-errors", "headless", "--window-size=1000,800"
            "incognito", "disable-infobars", "disable-gpu", "disable-default-apps", "disable-popup-blocking"]
        }
      }
    }
  }
  edge {
    webdriver {
      capabilities {
        browserName = "MicrosoftEdge"
        "ms:edgeOptions" {
          args = ["test-type", "ignore-certificate-errors", "headless",
            "incognito", "disable-infobars", "disable-gpu", "disable-default-apps", "disable-popup-blocking"]
        }
      }
    }
  }
  firefox {
    webdriver {
      capabilities {
        browserName = "firefox"
        pageLoadStrategy = "normal"
        acceptInsecureCerts = true
        unhandledPromptBehavior = "dismiss"
        strictFileInteractability = true

        "moz:firefoxOptions" {
          args = ["-headless"],
          prefs {
            "javascript.options.showInConsole": false
          },
          log {"level": "info"},
        }
      }
    }
  }
}
```
