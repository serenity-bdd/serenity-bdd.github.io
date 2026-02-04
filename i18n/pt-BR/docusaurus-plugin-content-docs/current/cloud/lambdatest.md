---
id: lambdatest
title: LambdaTest
sidebar_position: 2
---
# Integração do Serenity BDD com LambdaTest

LambdaTest é uma plataforma de nuvem para execução e orquestração de testes. Com LambdaTest, usuários do Serenity podem estender a cobertura de testes automatizados de suas aplicações web e móveis em mais de 3000 dispositivos reais, navegadores e sistemas operacionais.

O plugin `serenity-lambdatest` fornece integração perfeita com a plataforma de automação de testes online [LambdaTest](https://www.lambdatest.com?utm_source=serenity_bdd&utm_medium=website).

## Adicionando o plugin LambdaTest

Para adicionar o suporte integrado ao LambdaTest em seu projeto, você precisará adicionar a dependência `serenity-lambdatest` às dependências do seu projeto. Para Maven, você adicionaria o seguinte:
```xml
    <dependency>
        <groupId>net.serenity-bdd</groupId>
        <artifactId>serenity-lambdatest</artifactId>
        <version>${serenity.version}</version>
    </dependency>
```

E para Gradle:
```groovy
    testImplementation "net.serenity-bdd:serenity-lambdatest:${serenityVersion}"
```

## Especificando suas credenciais e URL do grid LambdaTest
Em seguida, você precisará de uma [conta LambdaTest](https://accounts.lambdatest.com/register?utm_source=serenity_bdd&utm_medium=sponsor&utm_campaign=serenity_bdd&utm_term=sk&utm_content=homepage) (Se você ainda não tiver uma, pode configurar uma conta gratuita vitalícia para experimentar).

Você pode adicionar suas [credenciais LambdaTest](https://www.lambdatest.com/support/docs/using-environment-variables-for-authentication-credentials?utm_source=serenity_bdd&utm_medium=sponsor&utm_campaign=serenity_bdd&utm_term=sk&utm_content=homepage) de duas maneiras. A mais simples é definir as seguintes propriedades de sistema:
* `LT_USERNAME` - Nome de usuário do LambdaTest
* `LT_ACCESS_KEY` - Chave de acesso do LambdaTest

Alternativamente, você pode definir seu nome de usuário e chave de acesso usando as propriedades `lt.user` e `lt.key` respectivamente no seu arquivo `serenity.conf`:

```hocon
lt.user=myuser
lt.key=XXXXXXXX
```

Por padrão, a URL do grid LambdaTest padrão ("hub.lambdatest.com") será usada para conectar aos servidores LambdaTest, mas você pode sobrescrever isso definindo a propriedade `lt.grid`:

```hocon
lt.grid = "mycustomhub.lambdatest.com"
```

## Configurando o driver LambdaTest

O Serenity interage com o LambdaTest através do driver `RemoteDriver`. Você pode especificar a URL remota explicitamente, ou deixar a biblioteca `serenity-lambdatest` fazer isso por você. Por exemplo, para configurar a URL explicitamente você poderia usar uma configuração `serenity.conf` assim:
```hocon
webdriver {
  driver = remote
  remote.url = "https://"${LT_USERNAME}":"${LT_ACCESS_KEY}"@hub.lambdatest.com/wd/hub"
}
```

Se a propriedade `webdriver.remote.url` não estiver definida, o Serenity usará esses valores para construir uma para você se o plugin LambdaTest estiver ativo (veja abaixo).

## Ativando o plugin LambdaTest

O plugin Serenity LambdaTest será invocado se o Serenity encontrar uma seção `"LT:Options"` no seu arquivo `serenity.conf`, ou se você especificar uma `remote.webdriver.url` que aponte para um servidor LambdaTest. Se você não tiver capabilities específicas do LambdaTest, simplesmente defina a propriedade `lambdatest.active` como true assim:

```hocon
lambdatest {
  active = true
}
```

## Definindo Capabilities do LambdaTest

Você pode especificar o sistema operacional e o navegador nos quais deseja executar seus testes personalizando as [Selenium Capabilities](https://www.lambdatest.com/support/docs/selenium-automation-capabilities?utm_source=serenity_bdd&utm_medium=sponsor&utm_campaign=serenity_bdd&utm_term=sk&utm_content=homepage) no seu arquivo `serenity.conf`. Faça isso na seção `"LT:Options"` do arquivo `serenity.conf`, por exemplo:

```hocon
    webdriver {
      driver = "remote"
      capabilities {
        browserName = "chrome"
        version = "104.0"
        platform = "Windows 10"
        #
        # Quaisquer opções específicas do LambdaTest vão na seção 'LT:Options'
        #
        "LT:Options" {
          resolution", "1280x800"
          network = true // Para habilitar logs de rede
          visual = true // Para habilitar capturas de tela passo a passo
          video = true // Para habilitar gravação de vídeo
          console = true // Para capturar logs do console
        }
      }
    }
```

Note que a opção `w3c` será definida como `true` por padrão, pois este é o protocolo padrão para a versão do Selenium integrada com o Serenity.

O nome do teste LambdaTest será atribuído automaticamente. Você também pode definir o nome do _build_ atribuindo a propriedade `lambdatest.build`.
Por exemplo, o seguinte exemplo mostra como criar um nome de build a partir das variáveis de ambiente de nome do job e número do build do Jenkins:

```hocon
lambdatest {
  build = "${JOB_NAME} - build ${BUILD_NUMBER}"
}
```

Essas propriedades serão colocadas na capability `LT:Options`.

:::tip

O LambdaTest fornece um conveniente [Gerador de Capabilities](https://www.lambdatest.com/capabilities-generator?utm_source=serenity_bdd&utm_medium=sponsor&utm_campaign=serenity_bdd&utm_term=sk&utm_content=homepage) que dá uma ideia de quais opções estão disponíveis.

:::


