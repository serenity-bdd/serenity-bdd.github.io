---
id: serenity-properties
title: Propriedades de Sistema e Configuração do Serenity
sidebar_position: 1
---

## Executando testes Serenity pela linha de comando

Você tipicamente executa o Serenity como parte do processo de build (localmente ou em um servidor de CI). Além da opção `webdriver.driver` discutida [aqui](/docs/guide/driver_config), você também pode passar vários parâmetros como propriedades de sistema para personalizar a forma como os testes são executados. Você também pode colocar esses valores em um arquivo de propriedades chamado `serenity.properties`, no diretório raiz do seu projeto.

A lista completa é mostrada aqui:

### properties
Caminho absoluto do arquivo de propriedades onde os valores padrão das propriedades de sistema do Serenity são definidos. O padrão é `~/serenity.properties`

### webdriver.driver
Em qual navegador você quer que seus testes executem, por exemplo firefox, chrome, phantomjs ou iexplorer. Você também pode usar a propriedade *driver* como um atalho.

### webdriver.autodownload
Defina como `false` se você não quer que o Serenity baixe automaticamente binários de drivers para execuções locais.

### webdriver.provided_type
Se estiver usando um driver fornecido, qual é o tipo. A classe de implementação precisa ser definida na propriedade de sistema `webdriver.provided.{type}`.

### webdriver.base.url
A URL inicial padrão para a aplicação, e URL base para caminhos relativos.

### webdriver.remote.url
A URL a ser usada para drivers remotos (incluindo um hub de selenium grid ou URL do SauceLabs)

### phantomjs.webdriver.port
Em qual porta executar o PhantomJS (usado em conjunto com webdriver.remote.url para registrar em um hub Selenium, por exemplo -Dphantomjs.webdriver=5555 -Dwebdriver.remote.url=http://localhost:4444/wd/hub

### webdriver.remote.driver
O driver a ser usado para drivers remotos

### serenity.driver.capabilities
Um conjunto de capabilities definidas pelo usuário para configurar o driver WebDriver. As capabilities devem ser passadas como uma lista separada por espaço ou ponto e vírgula de pares chave:valor, por exemplo "build:build-1234; max-duration:300; single-window:true; tags:[tag1,tag2,tag3]"

### webdriver.timeouts.implicitlywait
Quanto tempo o webdriver aguarda por elementos aparecerem por padrão, em milissegundos.

### webdriver.wait.for.timeout
Quanto tempo o webdriver aguarda por padrão quando você usa um método de espera fluente, em milissegundos.

### webdriver.chrome.driver
Caminho para o driver do Chrome, se não estiver no path do sistema.

### serenity.home
O diretório home para saída e arquivos de dados do Serenity - por padrão, $USER_HOME/.serenity

### serenity.outputDirectory
Onde os relatórios devem ser gerados. Se o projeto contém apenas um módulo (módulo raiz), então este caminho será relativo ao módulo raiz, se o projeto contém mais de um submódulo - então este caminho será relativo ao diretório do submódulo, também este caminho pode ser diferente para cada submódulo ou pode ser herdado da propriedade do projeto raiz.

### serenity.project.name
Qual nome deve aparecer nos relatórios

### serenity.ext.packages*
Pacotes de extensão. Esta é uma lista de pacotes que serão escaneados para implementações personalizadas de TagProvider. Para adicionar um provedor de tags personalizado, basta implementar a interface TagProvider e especificar o pacote raiz para este provedor neste parâmetro.

### serenity.verbose.screenshots
O Serenity deve tirar capturas de tela para cada botão clicado e cada link selecionado? Por padrão, uma captura de tela será armazenada no início e fim de cada passo. Se esta opção for definida como true, o Serenity gravará capturas de tela para qualquer ação executada em um WebElementFacade, ou seja, qualquer vez que você usar uma expressão como element(...).click(), findBy(...).click() e assim por diante. Isso será sobrescrito se a opção ONLY_SAVE_FAILING_SCREENSHOTS for definida como true.
@Deprecated Esta propriedade ainda é suportada, mas serenity.take.screenshots fornece controle mais refinado.

### serenity.take.screenshots
Defina esta propriedade para ter controle mais refinado sobre como as capturas de tela são tiradas, o padrão é `serenity.take.screenshots=BEFORE_AND_AFTER_EACH_STEP`. Esta propriedade pode assumir os seguintes valores:

* `FOR_EACH_ACTION`: Salva uma captura de tela em cada ação de elemento web (como click(), typeAndEnter(), type(), typeAndTab() etc.).
* `BEFORE_AND_AFTER_EACH_STEP`: Salva uma captura de tela antes e depois de cada passo.
* `AFTER_EACH_STEP`: Salva uma captura de tela depois de cada passo
* `FOR_FAILURES`: Salva capturas de tela apenas para passos que falharam.
* `DISABLED`: Não salva capturas de tela para nenhum passo.

### serenity.full.page.screenshot.strategy
Defina esta propriedade para ter suporte a capturas de tela de página inteira. Esta propriedade pode assumir os seguintes valores:

* `true`: Habilita o modo de captura de tela WHOLE_PAGE.
* `false`: Habilita o modo de captura de tela VIEWPORT_ONLY. (padrão)

### serenity.report.encoding
Codificação usada para gerar as exportações CSV

### serenity.verbose.steps
Defina esta propriedade para fornecer log mais detalhado dos passos do WebElementFacade quando os testes são executados.

### serenity.reports.show.step.details
O Serenity BDD deve exibir informações detalhadas nas tabelas de resultados de teste. Se isso for definido como true, as tabelas de resultados de teste exibirão uma divisão dos passos por resultado. Isso é false por padrão.

### serenity.report.show.manual.tests
Mostrar estatísticas para testes manuais nos relatórios de teste.

### serenity.report.show.releases
Relatar sobre releases (padrão é true).

### serenity.restart.browser.frequency
Durante testes orientados a dados, alguns navegadores (Firefox em particular) podem ficar mais lentos ao longo do tempo devido a vazamentos de memória. Para contornar isso, você pode fazer o Serenity iniciar uma nova sessão de navegador em intervalos regulares quando executa testes orientados a dados.

### serenity.step.delay
Pausa (em ms) entre cada passo de teste.

### untrusted.certificates
Útil se você está executando testes Firefox contra um servidor de teste HTTPS sem um certificado válido. Isso fará o Serenity usar um perfil com a propriedade AssumeUntrustedCertificateIssuer definida.

### refuse.untrusted.certificates
Não aceitar sites usando certificados não confiáveis. Por padrão, o Serenity BDD aceita certificados não confiáveis - use isso para mudar este comportamento.

### serenity.timeout
Quanto tempo o driver deve esperar por elementos não imediatamente visíveis, em milissegundos.

### serenity.browser.width
### serenity.browser.height
Redimensionar o navegador para as dimensões especificadas, para tirar capturas de tela maiores. Isso deve funcionar com Internet Explorer e Firefox, mas não com Chrome.

### serenity.resized.image.width
Valor em pixels. Se definido, as capturas de tela são redimensionadas para este tamanho. Útil para economizar espaço.

### serenity.keep.unscaled.screenshots
Defina como `true` se você deseja salvar as capturas de tela originais não redimensionadas.
Isso é definido como `false` por padrão.

### serenity.store.html.source
Defina esta propriedade como `true` para salvar o código fonte HTML das páginas web das capturas de tela.
Isso é definido como `false` por padrão.

### serenity.issue.tracker.url
A URL usada para gerar links para o sistema de rastreamento de issues.

### serenity.activate.firebugs
Ativar os plugins Firebugs e FireFinder para Firefox ao executar os testes WebDriver. Isso é útil para depuração, mas não é recomendado ao executar os testes em um servidor de build.

### serenity.batch.strategy
Define a estratégia de lote. Valores permitidos - DIVIDE_EQUALLY (padrão) e DIVIDE_BY_TEST_COUNT. DIVIDE_EQUALLY simplesmente dividirá os testes igualmente entre todos os lotes. Isso pode ser ineficiente se o número de testes variar muito entre classes de teste. Uma estratégia DIVIDE_BY_TEST_COUNT pode ser mais útil nesses casos pois criará lotes baseados no número de testes.

### serenity.batch.count
Se teste em lote está sendo usado, este é o tamanho dos lotes sendo executados.

### serenity.batch.number
Se teste em lote está sendo usado, este é o número do lote sendo executado nesta máquina.

### serenity.use.unique.browser
Defina como true para executar todos os testes web em um único navegador, para um teste. Pode ser usado para configurar Junit e Cucumber, valor padrão é 'false'.

### restart.browser.each.scenario
Defina como false para executar todos os testes web no mesmo arquivo de história com um navegador, pode ser usado quando JBehave é usado. Valor padrão é 'false'

### serenity.restart.browser.for.each
Indica quando um navegador deve ser reiniciado durante uma execução de teste. Pode ser um de: scenario, story, feature, never

### serenity.native.events
Ativar e desativar eventos nativos para Firefox definindo esta propriedade como `true` ou `false`.

### security.enable_java
Defina como true para habilitar suporte Java no Firefox. Por padrão, isso é definido como false pois desacelera o web driver.

### serenity.proxy.http
Configuração de URL do Proxy HTTP para Firefox e PhantomJS

### serenity.proxy.http_port
Configuração de porta do Proxy HTTP para Firefox e PhantomJS
### serenity.proxy.type
Configuração de tipo do Proxy HTTP para Firefox e PhantomJS

### serenity.proxy.user
Configuração de nome de usuário do Proxy HTTP para Firefox e PhantomJS

### serenity.proxy.password
Configuração de senha do Proxy HTTP para Firefox e PhantomJS

### serenity.logging
Propriedade para fornecer nível de ações, resultados, etc. do serenity.

* *QUIET* : Nenhum log do Serenity BDD
* *NORMAL* : Log do início e fim dos testes
* *VERBOSE* : Log do início e fim dos testes e passos de teste, valor padrão

### serenity.test.root
O pacote raiz para os testes em um determinado projeto. Se fornecido, o Serenity usará isso como o pacote raiz ao determinar as capabilities associadas a um teste. Se você está usando o provedor de requisitos do Sistema de Arquivos, o Serenity BDD esperará que esta estrutura de diretórios exista no topo da árvore de requisitos. Se você quiser excluir pacotes em uma definição de requisitos e começar em um nível mais baixo na hierarquia, use a propriedade `serenity.requirement.exclusions`.

Isso também é usado pelo `PackageAnnotationBasedTagProvider` para saber onde procurar por requisitos anotados.

### serenity.requirements.dir
Use esta propriedade se você precisar sobrescrever completamente a localização dos requisitos para o Provedor de Sistema de Arquivos.

### serenity.use.requirements.directories
Por padrão, o Serenity BDD lerá os requisitos da estrutura de diretórios que contém as histórias. Quando outros plugins de tags e requisitos são usados, como o plugin JIRA, isso pode causar tags conflitantes. Defina esta propriedade como false para desativar este recurso (é true por padrão).

### serenity.annotated.requirements.dir
Use esta propriedade se você precisar sobrescrever completamente a localização dos requisitos para o Provedor Anotado. Isso é recomendado se você usar simultaneamente o provedor de Sistema de Arquivos e o provedor Anotado. O valor padrão é stories.

### serenity.requirement.types
A hierarquia de tipos de requisitos. Esta é a lista de tipos de requisitos a ser usada ao ler requisitos do sistema de arquivos e ao organizar os relatórios. É uma lista separada por vírgula de tags. O valor padrão é: capability, feature.

### serenity.requirement.exclusions
Ao derivar tipos de requisitos de um caminho, excluir quaisquer valores desta lista separada por vírgula.

### serenity.test.requirements.basedir
O diretório base no qual os requisitos são mantidos.
Assume-se que este diretório contém subpastas src/test/resources.
Se esta propriedade for definida, os requisitos são lidos de src/test/resources sob esta pasta em vez do classpath ou diretório de trabalho.
Se você precisar definir um diretório de requisitos independente que não siga a convenção src/test/resources, use `serenity.requirements.dir` em vez disso

Esta propriedade é usada para suportar situações onde seu diretório de trabalho
é diferente do diretório base de requisitos (por exemplo ao construir um projeto multi-módulo do pom pai com requisitos armazenados dentro de um submódulo.

### serenity.release.types
Quais nomes de tags identificam os tipos de release (por exemplo, Release, Iteration, Sprint). Uma lista separada por vírgula. Por padrão, "Release, Iteration"

### serenity.locator.factory
Normalmente, o Serenity usa SmartElementLocatorFactory, uma extensão do AjaxElementLocatorFactory ao instanciar page objects.
Isso é para garantir que os elementos web estejam disponíveis e utilizáveis antes de serem usados.
Para comportamento alternativo, você pode definir este valor como `DisplayedElementLocatorFactory`, `AjaxElementLocatorFactory` ou `DefaultElementLocatorFactory`.

### chrome.switches
Argumentos a serem passados para o driver do Chrome, separados por ponto e vírgula. Exemplo: `chrome.switches = --incognito;--disable-download-notification`

// FIXME link para Serenity.useFirefoxProfile()
### webdriver.firefox.profile
O caminho para o diretório do perfil a usar ao iniciar o firefox. Por padrão, o webdriver cria um perfil anônimo. Isso é útil se você quiser executar os testes web usando seu próprio perfil Firefox. Se você não tem certeza de como encontrar o caminho para seu perfil, veja aqui: http://support.mozilla.com/en-US/kb/Profiles. Por exemplo, para executar o perfil padrão em um sistema Mac OS X, você faria algo assim:

```bash
$ mvn test -Dwebdriver.firefox.profile=/Users/johnsmart/Library/Application\ Support/Firefox/Profiles/2owb5g1d.default
```
No Windows, seria algo como:

```bat
C:\Projects\myproject>mvn test -Dwebdriver.firefox.profile=C:\Users\John Smart\AppData\Roaming\Mozilla\Firefox\Profiles\mvxjy48u.default
```
### firefox.preferences
Uma lista separada por ponto e vírgula de configurações do Firefox. Por exemplo,

```bash
-Dfirefox.preferences="browser.download.folderList=2;browser.download.manager.showWhenStarting=false;browser.download.dir=c:\downloads"
```

Valores inteiros e booleanos serão convertidos para os tipos correspondentes nas preferências do Firefox; todos os outros valores serão tratados como Strings. Você pode definir um valor booleano como true simplesmente especificando o nome da propriedade, por exemplo `-Dfirefox.preferences=app.update.silent`.

Uma referência completa às configurações do Firefox é dada [aqui](https://kb.mozillazine.org/Firefox_:_FAQs_:_About:config_Entries).

### serenity.csv.extra.columns
Adicionar colunas extras à saída CSV, obtidas de valores de tags.

### serenity.console.headings
Escrever os cabeçalhos do console usando ascii-art ("ascii", valor padrão) ou em texto normal ("normal")

### tags
lista de tags separadas por "ou". Se fornecido, apenas classes JUnit e/ou métodos com tags nesta lista serão executados. Por exemplo,

```bash
mvn verify -Dtags="iteration:I1"

mvn verify -Dtags="color:red or flavor:strawberry"
```

### output.formats
Em qual formato os resultados dos testes devem ser gerados. Por padrão, isso é "json,xml".

### narrative.format
Defina esta propriedade como 'asciidoc' para ativar o uso do formato http://www.methods.co.nz/asciidoc/[Asciidoc] em texto narrativo.

### jira.url
Se a URL base do JIRA for definida, o Serenity construirá a url do rastreador de issues usando o formato padrão do JIRA.

### jira.project
Se definido, o id do projeto JIRA será prefixado aos números das issues.

### jira.username
Se definido, o nome de usuário JIRA necessário para conectar ao JIRA.

### jira.password
Se definido, a senha JIRA necessária para conectar ao JIRA.

### show.pie.charts
Exibir os gráficos de pizza no dashboard por padrão. Se isso for definido como false, os gráficos de pizza serão inicialmente ocultos no dashboard.

### dashboard.tag.list
Se definido, isso definirá a lista de tipos de tags a aparecer nas telas do dashboard

*dashboard.excluded.tag.list*::Se definido, isso definirá a lista de tipos de tags a serem excluídos das telas do dashboard

### json.pretty.printing
Formatar os resultados de teste JSON de forma bonita. "true" ou "false", desativado por padrão.

### simplified.stack.traces
Stack traces são por padrão simplificados para legibilidade. Por exemplo, chamadas a código instrumentado ou bibliotecas de teste internas são removidas. Este comportamento pode ser desativado definindo esta propriedade como false.

### serenity.dry.run
Executar os passos sem realmente executá-los.

### feature.file,language
Em qual idioma (humano) os arquivos de feature do Cucumber estão escritos? O padrão é "en".

### serenity.maintain.session
Manter os dados de sessão do Serenity BDD entre testes. Normalmente, os dados de sessão são limpos entre testes.

### serenity.console.colors
Há um recurso para saída colorida no console durante a execução de testes serenity. Para habilitá-lo você deve fornecer a variável `serenity.console.colors = true`, por padrão está desativado. Este recurso pode causar erros se for habilitado para builds sob Jenkins.

![Saída colorida do console está desabilitada](img/console-colors-off.png)

Se esta propriedade for igual a true você encontrará saída colorida:

![Saída colorida do console está habilitada](img/console-colors-on.png)

### serenity.include.actor.name.in.consequences
Defina como true para mostrar nomes de Actor nos passos "then". Especialmente útil quando você tem múltiplos Actor em um teste

[FIXME mover perfil FF para páginas de informações estendidas de driver?]:#
## Fornecendo seu próprio perfil Firefox

Se você precisar configurar seu próprio perfil Firefox personalizado, você pode fazer isso usando o método Serenity.useFirefoxProfile() antes de iniciar seus testes. Por exemplo:

```java
@Before
public void setupProfile() {
  FirefoxProfile myProfile = new FirefoxProfile();
  myProfile.setPreference("network.proxy.socks_port",9999);
  myProfile.setAlwaysLoadNoFocusLib(true);
  myProfile.setEnableNativeEvents(true);
  Serenity.useFirefoxProfile(myProfile);
}

@Test
public void aTestUsingMyCustomProfile() {...}
```
