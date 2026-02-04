---
id: selenium-grid
title: Selenium Grid
sidebar_position: 1
---
# Introdução

[Selenium Grid](https://www.selenium.dev/documentation/grid/) permite a execução de scripts WebDriver em máquinas remotas (virtuais ou reais) roteando comandos enviados pelo cliente para instâncias de navegador remotas. Seu objetivo é fornecer uma maneira fácil de executar testes em paralelo em múltiplas máquinas.

O Selenium Grid 4 aproveita várias novas tecnologias para facilitar o escalonamento enquanto permite execução local.

Você também pode usar o Serenity para executar seus testes WebDriver em uma máquina remota, como um Selenium Grid ou um serviço remoto como o fornecido pelo [BrowserStack](https://www.browserstack.com/automate?utm_source=serenity&utm_medium=partnered) ou [LambdaTest](https://www.lambdatest.com?utm_source=serenity_bdd&utm_medium=website). Isso permite que você execute seus testes web em uma variedade de navegadores e sistemas operacionais diferentes, além de se beneficiar de uma execução de testes mais rápida ao executar os testes em paralelo. Veremos como fazer isso em detalhes mais adiante no capítulo.

## Executando o Selenium Grid localmente
A maneira mais simples de começar com o Selenium Grid é executar uma instância standalone em sua máquina local. Isso permite que você verifique se sua configuração do Serenity foi corretamente configurada para usar o Selenium Grid.

Para experimentar, baixe o arquivo jar `selenium-server` mais recente do [site do Selenium](https://www.selenium.dev/downloads/). Em seguida, inicie o servidor com o seguinte comando:

```
java -jar selenium-server-<version>.jar standalone
```

Isso iniciará a instância local do servidor Selenium Grid. Você pode verificar o dashboard em [http://localhost:4444/ui](http://localhost:4444/ui).

Você pode configurar seus testes para executar neste servidor definindo três propriedades:
 - Defina a propriedade `webdriver.driver` como `remote`
 - Defina a propriedade `webdriver.remote.url` como o endereço da sua instância do Selenium Grid (http://localhost:4444 por padrão)
 - Defina a propriedade `webdriver.remote.driver` como o nome do driver que você deseja executar (por exemplo, "chrome")

```conf
webdriver {
  driver = remote
  remote {
    url="http://localhost:4444"
    driver=chrome
  }
 }
```

Você também pode fornecer propriedades adicionais sobre o navegador ou ambiente de destino, incluindo:
- `webdriver.remote.browser.version`: Qual versão do navegador remoto usar
- `webdriver.remote.os`: Em qual sistema operacional os testes devem ser executados.

Por exemplo, se você estivesse executando um Selenium Hub localmente na porta 4444 (o padrão) em uma máquina Windows, você poderia executar o seguinte comando:

```
mvn verify -Dwebdriver.remote.url=http://localhost:4444/wd/hub -Dwebdriver.remote.driver=chrome -Dwebdriver.remote.os=WINDOWS
```

Você também pode passar as capabilities específicas do driver usual para o navegador remoto, por exemplo:
```
mvn verify -Dwebdriver.remote.url=http://localhost:4444/wd/hub -Dwebdriver.remote.driver=chrome -Dwebdriver.remote.os=WINDOWS -Dchrome.switches="--no-sandbox,--ignore-certificate-errors,--homepage=about:blank,--no-first-run"
```
