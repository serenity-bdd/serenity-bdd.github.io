---
id: screenplay_playwright
sidebar_position: 3
---
# Testes Web com Serenity Screenplay e Playwright

## Introducao

Playwright e uma biblioteca moderna de automacao de navegadores que fornece capacidades de testes cross-browser com excelente suporte para aplicacoes web modernas. O modulo `serenity-screenplay-playwright` traz o poder do Playwright para o Screenplay Pattern do Serenity BDD, oferecendo uma alternativa a integracao tradicional com WebDriver.

Playwright oferece varias vantagens sobre o WebDriver:
- **Auto-waiting**: Espera automaticamente que os elementos estejam acionaveis antes de executar acoes
- **Cross-browser**: Suporte nativo para Chromium, Firefox e WebKit
- **Interceptacao de rede**: Suporte integrado para mock e interceptacao de requisicoes de rede
- **Rastreamento**: Registra rastreamentos detalhados para depurar falhas de teste
- **Emulacao de dispositivos**: Facil emulacao de dispositivos moveis e tablets
- **Arquitetura moderna**: Design orientado a eventos com melhor confiabilidade

## Primeiros Passos

### Dependencia Maven

Adicione a seguinte dependencia ao seu projeto:

```xml
<dependency>
    <groupId>net.serenity-bdd</groupId>
    <artifactId>serenity-screenplay-playwright</artifactId>
    <version>${serenity.version}</version>
</dependency>
```

### A Ability BrowseTheWebWithPlaywright

Para usar Playwright com Screenplay, os Actor precisam da Ability `BrowseTheWebWithPlaywright`:

```java
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import com.microsoft.playwright.*;

Playwright playwright = Playwright.create();
Browser browser = playwright.chromium().launch();

Actor alice = Actor.named("Alice");
alice.can(BrowseTheWebWithPlaywright.using(browser));
```

### Configuracao

Voce pode configurar o comportamento do Playwright usando variaveis de ambiente ou programaticamente:

```java
// Iniciar com opcoes
BrowserType.LaunchOptions options = new BrowserType.LaunchOptions()
    .setHeadless(false)
    .setSlowMo(100);

Browser browser = playwright.chromium().launch(options);
```

## Abrindo uma URL

### Abrindo uma URL diretamente

No Screenplay, voce abre uma nova pagina usando a classe de Interaction `Navigate`:

```java
alice.attemptsTo(Navigate.to("https://todomvc.com/examples/react/"));
```

### Abrindo a URL base

Se voce configurou uma URL base, pode navegar ate ela:

```java
alice.attemptsTo(Navigate.toTheBaseUrl());
```

## Localizando Elementos em uma Pagina

### A Classe Target

A classe `Target` na integracao Playwright usa o poderoso motor de seletores do Playwright. Diferente do WebDriver, o Playwright fornece multiplas estrategias de seletores integradas.

```java
Target SUBMIT_BUTTON = Target.the("Submit button").locatedBy("#submit-btn");

alice.attemptsTo(Click.on(SUBMIT_BUTTON));
```

### Seletores Playwright

Playwright suporta um rico conjunto de seletores:

```java
// Seletor CSS
Target.the("Login button").locatedBy("#login-btn")

// Seletor de texto
Target.the("Submit button").locatedBy("text=Submit")

// Seletor de role (ARIA)
Target.the("Submit button").locatedBy("role=button[name='Submit']")

// Seletor XPath
Target.the("Email field").locatedBy("xpath=//input[@type='email']")

// Combinando seletores
Target.the("Form submit").locatedBy("form >> button[type='submit']")
```

### Target Dinamicos

Voce pode usar Target parametrizados para localizacao dinamica de elementos:

```java
Target MENU_ITEM = Target.the("{0} menu item").locatedBy("text={0}");

alice.attemptsTo(Click.on(MENU_ITEM.of("Settings")));
```

## Fabricas de Elementos UI

O Serenity Playwright fornece classes de fabrica convenientes para localizar elementos UI comuns usando a poderosa sintaxe de seletores do Playwright.

### Button

Localiza botoes usando varias estrategias:

```java
import net.serenitybdd.screenplay.playwright.ui.Button;

// Por texto visivel (case-insensitive, usa seletor de role)
alice.attemptsTo(Click.on(Button.withText("Submit")));

// Por atributo name ou ID
alice.attemptsTo(Click.on(Button.withNameOrId("submit-btn")));

// Por aria-label
alice.attemptsTo(Click.on(Button.withAriaLabel("Close dialog")));

// Contendo texto especifico
alice.attemptsTo(Click.on(Button.containingText("Add to")));

// Localizador customizado
alice.attemptsTo(Click.on(Button.locatedBy("[data-testid='primary-action']")));
```

### InputField

Localiza campos de entrada:

```java
import net.serenitybdd.screenplay.playwright.ui.InputField;

// Por name ou ID
alice.attemptsTo(Enter.theValue("john@example.com").into(InputField.withNameOrId("email")));

// Por texto placeholder
alice.attemptsTo(Enter.theValue("Search...").into(InputField.withPlaceholder("Search products")));

// Por texto de label associado
alice.attemptsTo(Enter.theValue("password123").into(InputField.withLabel("Password")));

// Por aria-label
alice.attemptsTo(Enter.theValue("John").into(InputField.withAriaLabel("First name")));
```

### Link

Localiza elementos anchor:

```java
import net.serenitybdd.screenplay.playwright.ui.Link;

// Por texto exato
alice.attemptsTo(Click.on(Link.withText("Learn more")));

// Contendo texto
alice.attemptsTo(Click.on(Link.containingText("documentation")));

// Por atributo title
alice.attemptsTo(Click.on(Link.withTitle("View user profile")));
```

### Checkbox

Localiza inputs checkbox:

```java
import net.serenitybdd.screenplay.playwright.ui.Checkbox;

// Por texto de label
alice.attemptsTo(Click.on(Checkbox.withLabel("Accept terms")));

// Por name ou ID
alice.attemptsTo(Click.on(Checkbox.withNameOrId("newsletter")));

// Por atributo value
alice.attemptsTo(Click.on(Checkbox.withValue("premium")));
```

### RadioButton

Localiza inputs de botao radio:

```java
import net.serenitybdd.screenplay.playwright.ui.RadioButton;

// Por texto de label
alice.attemptsTo(Click.on(RadioButton.withLabel("Express shipping")));

// Por atributo value
alice.attemptsTo(Click.on(RadioButton.withValue("express")));
```

### Dropdown

Localiza elementos select:

```java
import net.serenitybdd.screenplay.playwright.ui.Dropdown;

// Por texto de label
alice.attemptsTo(
    SelectFromOptions.byVisibleText("Canada").from(Dropdown.withLabel("Country"))
);

// Por name ou ID
alice.attemptsTo(
    SelectFromOptions.byValue("us").from(Dropdown.withNameOrId("country"))
);
```

### Label

Localiza elementos label:

```java
import net.serenitybdd.screenplay.playwright.ui.Label;

// Por conteudo de texto
String labelText = alice.asksFor(Text.of(Label.withText("Email")));

// Para um ID de campo especifico
Target emailLabel = Label.forFieldId("email-input");
```

### Image

Localiza elementos de imagem:

```java
import net.serenitybdd.screenplay.playwright.ui.Image;

// Por texto alt
alice.attemptsTo(Click.on(Image.withAltText("Product thumbnail")));

// Por URL de source
alice.attemptsTo(Click.on(Image.withSrc("/images/logo.png")));

// Por URL de source parcial
alice.attemptsTo(Click.on(Image.withSrcContaining("product-123")));
```

## Interagindo com Elementos

### Interaction Principais

As seguintes classes de Interaction estao disponiveis no pacote `net.serenitybdd.screenplay.playwright.interactions`:

| Interaction | Proposito | Exemplo |
|-------------|---------|---------|
| Click | Clicar em um elemento | `actor.attemptsTo(Click.on("#button"))` |
| DoubleClick | Clicar duas vezes em um elemento | `actor.attemptsTo(DoubleClick.on("#item"))` |
| RightClick | Clicar com botao direito (menu de contexto) | `actor.attemptsTo(RightClick.on("#menu"))` |
| Enter | Digitar em um campo de entrada | `actor.attemptsTo(Enter.theValue("text").into("#field"))` |
| Clear | Limpar um campo de entrada | `actor.attemptsTo(Clear.field("#field"))` |
| Hover | Passar o mouse sobre um elemento | `actor.attemptsTo(Hover.over("#menu"))` |
| Press | Pressionar teclas do teclado | `actor.attemptsTo(Press.key("Enter"))` |
| Check | Marcar um checkbox | `actor.attemptsTo(Check.checkbox("#agree"))` |
| Uncheck | Desmarcar um checkbox | `actor.attemptsTo(Uncheck.checkbox("#agree"))` |
| Focus | Focar em um elemento | `actor.attemptsTo(Focus.on("#input"))` |
| Navigate | Navegar para uma URL | `actor.attemptsTo(Navigate.to("https://..."))` |
| Upload | Fazer upload de um arquivo | `actor.attemptsTo(Upload.file(path).to("#upload"))` |

### Click

Clicar em um elemento. Playwright espera automaticamente que o elemento esteja acionavel:

```java
alice.attemptsTo(Click.on("#submit-button"));
alice.attemptsTo(Click.on(SUBMIT_BUTTON));
```

### Double-Click

Clicar duas vezes em um elemento:

```java
alice.attemptsTo(DoubleClick.on("#item"));
```

### Right-Click

Clicar com botao direito para abrir menus de contexto:

```java
alice.attemptsTo(RightClick.on("#file-item"));
```

### Enter Text

Digitar valores em campos de entrada:

```java
alice.attemptsTo(Enter.theValue("john@example.com").into("#email"));
```

Voce tambem pode limpar o campo primeiro:

```java
alice.attemptsTo(
    Clear.field("#email"),
    Enter.theValue("new-email@example.com").into("#email")
);
```

### Interaction de Teclado

Pressionar teclas do teclado:

```java
// Tecla unica
alice.attemptsTo(Press.key("Enter"));

// Combinacoes de teclas
alice.attemptsTo(Press.key("Control+a"));

// Multiplas teclas
alice.attemptsTo(Press.keys("Tab", "Tab", "Enter"));
```

### Hover

Passar o mouse sobre elementos para acionar estados de hover:

```java
alice.attemptsTo(Hover.over("#dropdown-menu"));
```

### Check e Uncheck

Trabalhar com checkboxes:

```java
alice.attemptsTo(Check.checkbox("#newsletter"));
alice.attemptsTo(Uncheck.checkbox("#marketing-emails"));
```

### Focus

Focar em um elemento:

```java
alice.attemptsTo(Focus.on("#search-input"));
```

### Selecionando de Dropdowns

Selecionar opcoes de menus dropdown:

```java
// Por texto visivel
alice.attemptsTo(SelectFromOptions.byVisibleText("Red").from("#color"));

// Por atributo value
alice.attemptsTo(SelectFromOptions.byValue("red").from("#color"));

// Por indice
alice.attemptsTo(SelectFromOptions.byIndex(2).from("#color"));

// Multiplos valores (para multi-select)
alice.attemptsTo(SelectFromOptions.byValue("red", "blue", "green").from("#colors"));
```

### Deselecionando de Dropdowns

Para dropdowns multi-select, voce pode desselecionar opcoes:

```java
import net.serenitybdd.screenplay.playwright.interactions.DeselectFromOptions;

// Desselecionar por value
alice.attemptsTo(DeselectFromOptions.byValue("red").from("#colors"));

// Desselecionar por texto visivel
alice.attemptsTo(DeselectFromOptions.byVisibleText("Red").from("#colors"));

// Desselecionar por indice
alice.attemptsTo(DeselectFromOptions.byIndex(0).from("#colors"));

// Desselecionar todos
alice.attemptsTo(DeselectFromOptions.all().from("#colors"));
```

### Rolagem

Capacidades abrangentes de rolagem:

```java
import net.serenitybdd.screenplay.playwright.interactions.Scroll;

// Rolar ate um elemento
alice.attemptsTo(Scroll.to("#terms-and-conditions"));

// Rolar com alinhamento
alice.attemptsTo(Scroll.to("#section").andAlignToTop());
alice.attemptsTo(Scroll.to("#section").andAlignToCenter());
alice.attemptsTo(Scroll.to("#section").andAlignToBottom());

// Rolagem no nivel da pagina
alice.attemptsTo(Scroll.toTop());
alice.attemptsTo(Scroll.toBottom());

// Rolar por quantidade especifica (deltaX, deltaY)
alice.attemptsTo(Scroll.by(0, 500));

// Rolar para posicao especifica
alice.attemptsTo(Scroll.toPosition(0, 1000));
```

### Drag and Drop

Arrastar elementos de um local para outro:

```java
import net.serenitybdd.screenplay.playwright.interactions.Drag;

// Drag and drop basico
alice.attemptsTo(Drag.from("#source").to("#target"));

// Sintaxe fluente alternativa
alice.attemptsTo(Drag.the("#draggable").onto("#droppable"));

// Com Target
alice.attemptsTo(Drag.from(SOURCE_ELEMENT).to(TARGET_LOCATION));
```

### Uploads de Arquivo

Fazer upload de arquivos:

```java
Path fileToUpload = Paths.get("path/to/file.pdf");
alice.attemptsTo(Upload.file(fileToUpload).to("#file-input"));
```

### Execucao de JavaScript

Executar JavaScript no contexto da pagina:

```java
alice.attemptsTo(
    Evaluate.javascript("window.scrollTo(0, document.body.scrollHeight)")
);

// Com valor de retorno
Object result = alice.asksFor(
    Evaluate.javascript("return document.title")
);
```

### Espera

Esperar por elementos ou condicoes:

```java
// Esperar elemento estar visivel
alice.attemptsTo(WaitUntil.the("#loading").isNotVisible());

// Esperar elemento estar oculto
alice.attemptsTo(WaitUntil.the("#spinner").isHidden());

// Esperar com timeout
alice.attemptsTo(
    WaitUntil.the("#content").isVisible()
        .forNoMoreThan(Duration.ofSeconds(10))
);
```

## Consultando a Pagina Web

### Question Incluidas

O Serenity Playwright fornece classes Question para consultar o estado da pagina:

| Question | Proposito | Exemplo |
|----------|---------|---------|
| Text | Obter texto do elemento | `actor.asksFor(Text.of("#title"))` |
| Value | Obter valor do input | `actor.asksFor(Value.of("#email"))` |
| Attribute | Obter valor do atributo | `actor.asksFor(Attribute.of("#link").named("href"))` |
| Presence | Verificar se elemento existe | `actor.asksFor(Presence.of("#modal"))` |
| Absence | Verificar se elemento esta ausente | `actor.asksFor(Absence.of("#error"))` |
| Visibility | Verificar se elemento esta visivel | `actor.asksFor(Visibility.of("#popup"))` |
| Enabled | Verificar se elemento esta habilitado | `actor.asksFor(Enabled.of("#submit"))` |
| SelectedStatus | Verificar se checkbox esta selecionado | `actor.asksFor(SelectedStatus.of("#agree"))` |
| CSSValue | Obter propriedade CSS | `actor.asksFor(CSSValue.of("#box").named("color"))` |
| CurrentUrl | Obter URL atual da pagina | `actor.asksFor(CurrentUrl.ofThePage())` |
| PageTitle | Obter titulo da pagina | `actor.asksFor(PageTitle.ofThePage())` |

### Text

Obter o conteudo de texto de um elemento:

```java
String heading = alice.asksFor(Text.of("#main-heading"));

// Multiplos elementos
List<String> items = alice.asksFor(Text.ofEach(".list-item"));
```

### Presence e Absence

Verificar se elementos existem na pagina:

```java
// Verificar se esta presente
boolean isPresent = alice.asksFor(Presence.of("#modal"));

// Verificar se esta ausente
boolean isAbsent = alice.asksFor(Absence.of("#error-message"));
```

### Atributos

Obter valores de atributos:

```java
String href = alice.asksFor(Attribute.of("#link").named("href"));
String placeholder = alice.asksFor(Attribute.of("#input").named("placeholder"));
```

### Informacoes da Pagina Atual

Consultar informacoes no nivel da pagina:

```java
String url = alice.asksFor(CurrentUrl.ofThePage());
String title = alice.asksFor(PageTitle.ofThePage());
```

## Interceptacao e Mock de Rede

O Playwright fornece poderosas capacidades de interceptacao de rede para testes.

### Interceptando Requisicoes

```java
import net.serenitybdd.screenplay.playwright.network.InterceptNetwork;

// Interceptar e completar com resposta mock
alice.attemptsTo(
    InterceptNetwork.requestsTo("**/api/users")
        .andRespondWith(
            new Route.FulfillOptions()
                .setStatus(200)
                .setBody("{\"users\": []}")
                .setContentType("application/json")
        )
);

// Interceptar e responder com JSON
alice.attemptsTo(
    InterceptNetwork.requestsTo("**/api/user/123")
        .andRespondWithJson(200, Map.of(
            "id", 123,
            "name", "John Doe",
            "email", "john@example.com"
        ))
);
```

### Handlers de Requisicao Customizados

Para mais controle, use handlers customizados:

```java
alice.attemptsTo(
    InterceptNetwork.requestsTo("**/api/**")
        .andHandle(route -> {
            if (route.request().method().equals("DELETE")) {
                route.fulfill(new Route.FulfillOptions()
                    .setStatus(403)
                    .setBody("{\"error\": \"Forbidden\"}"));
            } else {
                route.resume();
            }
        })
);
```

### Abortando Requisicoes

Bloquear requisicoes especificas (util para testar tratamento de erros):

```java
alice.attemptsTo(
    InterceptNetwork.requestsTo("**/analytics/**").andAbort()
);
```

### Removendo Rotas

Remover handlers de rotas registrados anteriormente:

```java
import net.serenitybdd.screenplay.playwright.network.RemoveRoutes;

// Remover todos os handlers de rota
alice.attemptsTo(RemoveRoutes.all());

// Remover rotas para padrao especifico
alice.attemptsTo(RemoveRoutes.forUrl("**/api/**"));
```

## Integracao de Testes de API

:::info Novo na versao 5.2.2
A integracao de testes de API foi adicionada no Serenity BDD 5.2.2.
:::

Fazer requisicoes de API que compartilham o contexto de sessao do navegador (cookies, autenticacao). Isso permite Scenario de teste hibridos UI + API onde voce pode configurar dados via API, executar acoes de UI e verificar estado atraves de chamadas de API.

### Requisicoes de API Basicas

```java
import net.serenitybdd.screenplay.playwright.interactions.api.APIRequest;
import net.serenitybdd.screenplay.playwright.questions.api.LastAPIResponse;

// Inicializar contexto do navegador primeiro (necessario para requisicoes de API)
alice.attemptsTo(Open.url("about:blank"));

// Requisicao GET
alice.attemptsTo(
    APIRequest.get("https://api.example.com/users/1")
);

// Requisicao POST com corpo JSON
alice.attemptsTo(
    APIRequest.post("https://api.example.com/users")
        .withJsonBody(Map.of(
            "name", "John Doe",
            "email", "john@example.com"
        ))
);

// Requisicao PUT
alice.attemptsTo(
    APIRequest.put("https://api.example.com/users/1")
        .withJsonBody(Map.of("name", "Jane Doe"))
);

// Requisicao PATCH
alice.attemptsTo(
    APIRequest.patch("https://api.example.com/users/1")
        .withJsonBody(Map.of("status", "active"))
);

// Requisicao DELETE
alice.attemptsTo(
    APIRequest.delete("https://api.example.com/users/1")
);

// Requisicao HEAD
alice.attemptsTo(
    APIRequest.head("https://api.example.com/users/1")
);
```

### Configuracao de Requisicao

```java
// Adicionar headers customizados
alice.attemptsTo(
    APIRequest.get("https://api.example.com/data")
        .withHeader("Authorization", "Bearer token123")
        .withHeader("X-Custom-Header", "value")
);

// Adicionar parametros de query
alice.attemptsTo(
    APIRequest.get("https://api.example.com/search")
        .withQueryParam("q", "test")
        .withQueryParam("limit", "10")
);

// Definir content type
alice.attemptsTo(
    APIRequest.post("https://api.example.com/data")
        .withBody("<xml>data</xml>")
        .withContentType("application/xml")
);

// Definir timeout
alice.attemptsTo(
    APIRequest.get("https://api.example.com/slow")
        .withTimeout(30000)  // 30 segundos
);

// Falhar em codigos de status nao-2xx
alice.attemptsTo(
    APIRequest.get("https://api.example.com/data")
        .failOnStatusCode(true)
);
```

### Consultando Respostas

```java
// Obter codigo de status
int status = alice.asksFor(LastAPIResponse.statusCode());

// Verificar se resposta esta OK (2xx)
boolean isOk = alice.asksFor(LastAPIResponse.ok());

// Obter corpo da resposta como string
String body = alice.asksFor(LastAPIResponse.body());

// Parsear resposta JSON como Map
Map<String, Object> json = alice.asksFor(LastAPIResponse.jsonBody());

// Parsear resposta de array JSON como List
List<Map<String, Object>> items = alice.asksFor(LastAPIResponse.jsonBodyAsList());

// Obter headers da resposta
Map<String, String> headers = alice.asksFor(LastAPIResponse.headers());
String contentType = alice.asksFor(LastAPIResponse.header("Content-Type"));

// Obter URL final (apos redirecionamentos)
String url = alice.asksFor(LastAPIResponse.url());
```

### Testes Hibridos UI + API

Requisicoes de API compartilham automaticamente cookies com o contexto do navegador:

```java
@Test
void shouldUseAuthenticatedSession() {
    // Login via UI
    alice.attemptsTo(
        Navigate.to("https://myapp.com/login"),
        Enter.theValue("user@example.com").into("#email"),
        Enter.theValue("password").into("#password"),
        Click.on(Button.withText("Login"))
    );

    // Chamadas de API agora incluem cookies de autenticacao
    alice.attemptsTo(
        APIRequest.get("https://myapp.com/api/profile")
    );

    // Verificar resposta de API autenticada
    Map<String, Object> profile = alice.asksFor(LastAPIResponse.jsonBody());
    assertThat(profile.get("email")).isEqualTo("user@example.com");
}
```

### Chamadas de API nos Relatorios do Serenity

Requisicoes de API feitas via `APIRequest` sao automaticamente registradas nos relatorios do Serenity, semelhante ao RestAssured. Os relatorios mostram:
- Metodo HTTP e URL
- Headers e corpo da requisicao
- Codigo de status da resposta
- Headers e corpo da resposta

Isso fornece visibilidade completa das interacoes de API durante a execucao do teste.

### Exemplo Completo

```java
@Test
void shouldCreateAndVerifyUser() {
    alice.attemptsTo(Open.url("about:blank"));

    // Criar usuario via API
    alice.attemptsTo(
        APIRequest.post("https://jsonplaceholder.typicode.com/users")
            .withJsonBody(Map.of(
                "name", "Test User",
                "email", "test@example.com",
                "username", "testuser"
            ))
    );

    // Verificar criacao
    assertThat(alice.asksFor(LastAPIResponse.statusCode())).isEqualTo(201);

    Map<String, Object> createdUser = alice.asksFor(LastAPIResponse.jsonBody());
    assertThat(createdUser.get("name")).isEqualTo("Test User");
    assertThat(createdUser.get("id")).isNotNull();

    // Buscar o usuario criado
    String userId = String.valueOf(((Double) createdUser.get("id")).intValue());
    alice.attemptsTo(
        APIRequest.get("https://jsonplaceholder.typicode.com/users/" + userId)
    );

    assertThat(alice.asksFor(LastAPIResponse.statusCode())).isEqualTo(200);
}
```

## Lidando com Downloads

Esperar e lidar com downloads de arquivos:

```java
import net.serenitybdd.screenplay.playwright.interactions.WaitForDownload;
import net.serenitybdd.screenplay.playwright.questions.DownloadedFile;

// Esperar download acionado por clique
alice.attemptsTo(
    WaitForDownload.whilePerforming(Click.on("#download-btn"))
);

// Consultar informacoes do download
String filename = alice.asksFor(DownloadedFile.suggestedFilename());
String url = alice.asksFor(DownloadedFile.url());
Path path = alice.asksFor(DownloadedFile.path());

// Verificar falhas
String error = alice.asksFor(DownloadedFile.failure());
if (error == null) {
    // Download bem-sucedido
}

// Salvar em local especifico
alice.attemptsTo(
    WaitForDownload.whilePerforming(Click.on("#export-btn"))
        .andSaveTo(Paths.get("/downloads/report.pdf"))
);
```

## Captura de Mensagens do Console

Capturar e consultar mensagens do console do navegador para depuracao:

```java
import net.serenitybdd.screenplay.playwright.interactions.CaptureConsoleMessages;
import net.serenitybdd.screenplay.playwright.questions.ConsoleMessages;

// Iniciar captura de mensagens do console
alice.attemptsTo(CaptureConsoleMessages.duringTest());

// ... executar acoes que podem logar no console ...

// Consultar mensagens capturadas
List<String> allMessages = alice.asksFor(ConsoleMessages.all());
List<String> errors = alice.asksFor(ConsoleMessages.errors());
List<String> warnings = alice.asksFor(ConsoleMessages.warnings());
List<String> logs = alice.asksFor(ConsoleMessages.logs());

// Filtrar por conteudo
List<String> apiErrors = alice.asksFor(ConsoleMessages.containing("API error"));

// Obter contagens de mensagens
int totalCount = alice.asksFor(ConsoleMessages.count());
int errorCount = alice.asksFor(ConsoleMessages.errorCount());

// Limpar mensagens capturadas entre fases do teste
alice.attemptsTo(CaptureConsoleMessages.clear());
```

### Verificando Erros do Console

:::info Novo na versao 5.2.2
`CheckConsole` foi adicionado no Serenity BDD 5.2.2.
:::

Use `CheckConsole` para falhar automaticamente testes quando erros ou avisos de JavaScript ocorrem. Esta e a forma recomendada de garantir que sua aplicacao nao tenha erros de console durante fluxos de usuario:

```java
import net.serenitybdd.screenplay.playwright.interactions.CheckConsole;

// Iniciar captura, depois verificar erros no final do fluxo
alice.attemptsTo(
    CaptureConsoleMessages.duringTest(),

    // Executar acoes do usuario
    Navigate.to("https://myapp.com/checkout"),
    Enter.theValue("4111111111111111").into("#card-number"),
    Click.on(Button.withText("Pay")),

    // Falhar o teste se ocorreram erros de JavaScript
    CheckConsole.forErrors()
);
```

#### Opcoes do CheckConsole

| Metodo | Descricao |
|--------|-------------|
| `CheckConsole.forErrors()` | Falha se erros de console forem encontrados |
| `CheckConsole.forWarnings()` | Falha se avisos de console forem encontrados |
| `CheckConsole.forErrorsAndWarnings()` | Falha se erros OU avisos forem encontrados |

#### Modo Somente Relatorio

As vezes voce quer documentar problemas do console sem falhar o teste (por exemplo, para problemas conhecidos ou ao monitorar tendencias de erros):

```java
// Relatar erros no Serenity mas nao falhar o teste
alice.attemptsTo(
    CheckConsole.forErrors().andReportOnly()
);
```

Quando erros sao encontrados, eles sao automaticamente anexados ao relatorio do Serenity como evidencia, independentemente de o teste falhar ou nao.

### Relatando Mensagens do Console

:::info Novo na versao 5.2.2
`ReportConsoleMessages` foi adicionado no Serenity BDD 5.2.2.
:::

Use `ReportConsoleMessages` para adicionar explicitamente mensagens de console capturadas ao relatorio do Serenity:

```java
import net.serenitybdd.screenplay.playwright.interactions.ReportConsoleMessages;

alice.attemptsTo(
    CaptureConsoleMessages.duringTest(),

    // ... executar acoes ...

    // Relatar erros e avisos no Serenity
    ReportConsoleMessages.errorsAndWarnings()
);
```

#### Opcoes do ReportConsoleMessages

| Metodo | Descricao |
|--------|-------------|
| `ReportConsoleMessages.all()` | Relata todas as mensagens do console |
| `ReportConsoleMessages.errors()` | Relata apenas erros |
| `ReportConsoleMessages.warnings()` | Relata apenas avisos |
| `ReportConsoleMessages.errorsAndWarnings()` | Relata erros e avisos |

### Exemplo: Verificacao Completa de Erros do Console

Aqui esta um padrao tipico para garantir que nenhum erro de JavaScript ocorra durante um fluxo critico de usuario:

```java
@Test
void checkoutFlowShouldHaveNoJavaScriptErrors() {
    alice.attemptsTo(
        // Iniciar captura no inicio
        CaptureConsoleMessages.duringTest(),

        // Completar o fluxo de checkout
        Navigate.to("https://myapp.com/cart"),
        Click.on(Button.withText("Checkout")),
        Enter.theValue("john@example.com").into(InputField.withLabel("Email")),
        Enter.theValue("4111111111111111").into(InputField.withLabel("Card Number")),
        Click.on(Button.withText("Place Order")),

        // Verificar confirmacao do pedido
        WaitFor.theElement(".order-confirmation").toBeVisible(),

        // Falhar o teste se ocorreram erros de JavaScript durante o fluxo
        CheckConsole.forErrors()
    );
}
```

## Captura de Requisicoes de Rede

:::info Novo na versao 5.2.2
A captura de requisicoes de rede foi adicionada no Serenity BDD 5.2.2.
:::

Capturar e analisar todas as requisicoes de rede feitas durante os testes. Isso e util para depuracao, verificacao de chamadas de API feitas pelo frontend e deteccao de requisicoes falhas.

```java
import net.serenitybdd.screenplay.playwright.interactions.CaptureNetworkRequests;
import net.serenitybdd.screenplay.playwright.interactions.CaptureNetworkRequests.CapturedRequest;
import net.serenitybdd.screenplay.playwright.questions.NetworkRequests;

// Iniciar captura de requisicoes de rede
alice.attemptsTo(CaptureNetworkRequests.duringTest());

// Executar acoes que disparam requisicoes de rede
alice.attemptsTo(Navigate.to("https://example.com"));

// Consultar todas as requisicoes capturadas
List<CapturedRequest> allRequests = alice.asksFor(NetworkRequests.all());
int requestCount = alice.asksFor(NetworkRequests.count());

// Filtrar por metodo HTTP
List<CapturedRequest> getRequests = alice.asksFor(NetworkRequests.withMethod("GET"));
List<CapturedRequest> postRequests = alice.asksFor(NetworkRequests.withMethod("POST"));

// Filtrar por URL
List<CapturedRequest> apiRequests = alice.asksFor(
    NetworkRequests.toUrlContaining("/api/")
);

// Filtrar por padrao glob
List<CapturedRequest> cssRequests = alice.asksFor(
    NetworkRequests.matching("**/*.css")
);

// Encontrar requisicoes falhas (4xx, 5xx, ou erros de rede)
List<CapturedRequest> failedRequests = alice.asksFor(NetworkRequests.failed());
int failedCount = alice.asksFor(NetworkRequests.failedCount());

// Encontrar erros de cliente (4xx)
List<CapturedRequest> clientErrors = alice.asksFor(NetworkRequests.clientErrors());

// Encontrar erros de servidor (5xx)
List<CapturedRequest> serverErrors = alice.asksFor(NetworkRequests.serverErrors());

// Limpar requisicoes capturadas entre fases do teste
alice.attemptsTo(CaptureNetworkRequests.clear());
```

### Propriedades do CapturedRequest

Cada `CapturedRequest` contem:

| Propriedade | Descricao |
|----------|-------------|
| `getUrl()` | A URL da requisicao |
| `getMethod()` | Metodo HTTP (GET, POST, etc.) |
| `getResourceType()` | Tipo de recurso (document, xhr, fetch, stylesheet, etc.) |
| `getRequestHeaders()` | Map de headers da requisicao |
| `getStatus()` | Codigo de status da resposta (ou null se pendente/falha) |
| `getStatusText()` | Texto de status da resposta |
| `getFailureText()` | Razao da falha para erros de rede |
| `isFailed()` | Verdadeiro se a requisicao falhou (4xx, 5xx, ou erro de rede) |
| `isClientError()` | Verdadeiro se status 4xx |
| `isServerError()` | Verdadeiro se status 5xx |

### Exemplo: Verificando Chamadas de API

```java
@Test
void shouldMakeCorrectApiCalls() {
    alice.attemptsTo(
        CaptureNetworkRequests.duringTest(),
        Navigate.to("https://myapp.com"),
        Click.on(Button.withText("Load Data"))
    );

    // Verificar que a chamada de API esperada foi feita
    List<CapturedRequest> apiCalls = alice.asksFor(
        NetworkRequests.toUrlContaining("/api/data")
    );

    assertThat(apiCalls).hasSize(1);
    assertThat(apiCalls.get(0).getMethod()).isEqualTo("GET");
    assertThat(apiCalls.get(0).getStatus()).isEqualTo(200);
}
```

## Captura de Evidencias de Falha

:::info Novo na versao 5.2.2
A captura automatica de evidencias de falha foi adicionada no Serenity BDD 5.2.2.
:::

Quando um teste falha, o Serenity Playwright captura automaticamente informacoes de diagnostico e as anexa ao relatorio. Isso torna a depuracao de falhas de teste muito mais facil.

### Coleta Automatica de Evidencias

Quando a captura de mensagens do console ou requisicoes de rede esta habilitada, as seguintes evidencias sao automaticamente coletadas na falha do teste:

- **Informacoes da Pagina**: URL atual e titulo da pagina
- **Erros do Console**: Todas as mensagens `console.error()` e `console.warn()`
- **Requisicoes de Rede Falhas**: Requisicoes que retornaram status 4xx/5xx ou erros de rede

Esta evidencia e anexada ao relatorio do Serenity como "Playwright Failure Evidence".

### Habilitando Captura de Evidencias

Simplesmente habilite a captura de console e/ou rede no inicio dos seus testes:

```java
@BeforeEach
void setup() {
    alice = Actor.named("Alice")
        .whoCan(BrowseTheWebWithPlaywright.usingTheDefaultConfiguration());

    // Habilitar captura para evidencias de falha
    alice.attemptsTo(
        CaptureConsoleMessages.duringTest(),
        CaptureNetworkRequests.duringTest()
    );
}
```

### Acesso Programatico a Evidencias

Voce tambem pode consultar evidencias programaticamente para asserções ou relatorios customizados:

```java
import net.serenitybdd.screenplay.playwright.evidence.PlaywrightFailureEvidence;

// Obter erros do console
List<String> consoleErrors = PlaywrightFailureEvidence.getConsoleErrors(alice);

// Obter requisicoes de rede falhas
List<String> failedRequests = PlaywrightFailureEvidence.getFailedRequests(alice);

// Usar em asserções
assertThat(consoleErrors).isEmpty();
assertThat(failedRequests).isEmpty();
```

### Exemplo: Detectando Erros de JavaScript

```java
@Test
void pageShouldNotHaveJavaScriptErrors() {
    alice.attemptsTo(
        CaptureConsoleMessages.duringTest(),
        Navigate.to("https://myapp.com"),
        Click.on(Button.withText("Submit"))
    );

    // Verificar que nenhum erro de JavaScript ocorreu
    List<String> errors = alice.asksFor(ConsoleMessages.errors());
    assertThat(errors)
        .describedAs("JavaScript errors on page")
        .isEmpty();
}
```

### Exemplo: Detectando Chamadas de API Falhas

```java
@Test
void allApiCallsShouldSucceed() {
    alice.attemptsTo(
        CaptureNetworkRequests.duringTest(),
        Navigate.to("https://myapp.com/dashboard")
    );

    // Verificar que nenhuma chamada de API falhou
    List<CapturedRequest> failedRequests = alice.asksFor(NetworkRequests.failed());
    assertThat(failedRequests)
        .describedAs("Failed network requests")
        .isEmpty();
}
```

## Testes de Acessibilidade

Testar conformidade de acessibilidade usando snapshots ARIA:

```java
import net.serenitybdd.screenplay.playwright.questions.AccessibilitySnapshot;
import com.microsoft.playwright.options.AriaRole;

// Obter snapshot de acessibilidade da pagina inteira
String pageSnapshot = alice.asksFor(AccessibilitySnapshot.ofThePage());

// Obter snapshot de acessibilidade de um elemento especifico
String navSnapshot = alice.asksFor(AccessibilitySnapshot.of("#main-nav"));
String formSnapshot = alice.asksFor(AccessibilitySnapshot.of(LOGIN_FORM));

// Obter todos os elementos com um role ARIA especifico
List<String> buttons = alice.asksFor(AccessibilitySnapshot.allWithRole(AriaRole.BUTTON));
List<String> links = alice.asksFor(AccessibilitySnapshot.allWithRole(AriaRole.LINK));
List<String> headings = alice.asksFor(AccessibilitySnapshot.allWithRole(AriaRole.HEADING));
```

## Testes de Regressao Visual

Comparar screenshots contra imagens de baseline:

```java
import net.serenitybdd.screenplay.playwright.assertions.visual.CompareScreenshot;

// Comparacao de pagina inteira
alice.attemptsTo(
    CompareScreenshot.ofPage()
        .againstBaseline("homepage-baseline.png")
        .withThreshold(0.01)  // 1% de diferenca permitida
);

// Comparacao de elemento
alice.attemptsTo(
    CompareScreenshot.of("#product-card")
        .againstBaseline("product-card-baseline.png")
);

// Com mascara para conteudo dinamico
alice.attemptsTo(
    CompareScreenshot.ofPage()
        .againstBaseline("dashboard.png")
        .withMask("#timestamp", "#user-avatar")
);
```

## Emulacao de Dispositivos

Testar designs responsivos com emulacao de dispositivos:

```java
import net.serenitybdd.screenplay.playwright.interactions.EmulateDevice;

// Emular dispositivo especifico
alice.attemptsTo(EmulateDevice.device("iPhone 14"));
alice.attemptsTo(EmulateDevice.device("Pixel 7"));
alice.attemptsTo(EmulateDevice.device("iPad Pro 11"));

// Viewport customizada
alice.attemptsTo(EmulateDevice.withViewport(375, 812));

// Com fator de escala do dispositivo
alice.attemptsTo(
    EmulateDevice.withViewport(375, 812).andDeviceScaleFactor(2)
);

// Com user agent mobile
alice.attemptsTo(
    EmulateDevice.withViewport(375, 812).asMobile()
);
```

## Geolocalizacao

Testar recursos baseados em localizacao:

```java
import net.serenitybdd.screenplay.playwright.interactions.SetGeolocation;
import net.serenitybdd.screenplay.playwright.interactions.GrantPermissions;

// Primeiro conceder permissao de geolocalizacao
alice.attemptsTo(GrantPermissions.for_("geolocation"));

// Definir coordenadas especificas
alice.attemptsTo(SetGeolocation.to(51.5074, -0.1278));  // Londres

// Usar localizacoes predefinidas
alice.attemptsTo(SetGeolocation.toNewYork());
alice.attemptsTo(SetGeolocation.toLondon());
alice.attemptsTo(SetGeolocation.toTokyo());
alice.attemptsTo(SetGeolocation.toSanFrancisco());
alice.attemptsTo(SetGeolocation.toSydney());
alice.attemptsTo(SetGeolocation.toParis());

// Com precisao
alice.attemptsTo(
    SetGeolocation.to(40.7128, -74.0060).withAccuracy(100)
);

// Limpar geolocalizacao
alice.attemptsTo(SetGeolocation.clear());
```

## Gerenciamento de Permissoes

Conceder ou limpar permissoes do navegador:

```java
import net.serenitybdd.screenplay.playwright.interactions.GrantPermissions;
import net.serenitybdd.screenplay.playwright.interactions.ClearPermissions;

// Conceder permissoes especificas
alice.attemptsTo(GrantPermissions.for_("geolocation"));
alice.attemptsTo(GrantPermissions.for_("notifications", "camera", "microphone"));

// Limpar todas as permissoes
alice.attemptsTo(ClearPermissions.all());
```

## Controle do Relogio

Testar funcionalidade dependente de tempo:

```java
import net.serenitybdd.screenplay.playwright.interactions.ControlClock;
import java.time.Instant;

// Instalar relogio falso
alice.attemptsTo(ControlClock.install());

// Definir para hora especifica
alice.attemptsTo(
    ControlClock.setTo(Instant.parse("2024-01-15T10:30:00Z"))
);

// Avancar o tempo
alice.attemptsTo(ControlClock.advanceBy(Duration.ofHours(2)));
alice.attemptsTo(ControlClock.advanceBy(Duration.ofMinutes(30)));

// Retomar fluxo normal do tempo
alice.attemptsTo(ControlClock.resume());
```

## Rastreamento

Registrar rastreamentos detalhados para depuracao:

```java
import net.serenitybdd.screenplay.playwright.interactions.tracing.StartTracing;
import net.serenitybdd.screenplay.playwright.interactions.tracing.StopTracing;

// Iniciar rastreamento com opcoes
alice.attemptsTo(
    StartTracing.withScreenshots()
        .andSnapshots()
        .named("login-flow")
);

// ... executar acoes de teste ...

// Parar e salvar rastreamento
alice.attemptsTo(
    StopTracing.andSaveTo(Paths.get("traces/login-flow.zip"))
);

// Visualizar rastreamento: npx playwright show-trace traces/login-flow.zip
```

Opcoes de rastreamento:
- `withScreenshots()` - Incluir screenshots no rastreamento
- `andSnapshots()` - Incluir snapshots do DOM
- `andSources()` - Incluir arquivos de origem
- `named(String)` - Definir nome do rastreamento

## Persistencia de Estado de Sessao

:::info Novo na versao 5.2.2
A persistencia de estado de sessao foi adicionada no Serenity BDD 5.2.2.
:::

Salvar e restaurar estado de sessao do navegador (cookies, localStorage, sessionStorage) para acelerar testes e compartilhar sessoes autenticadas.

### Salvando Estado de Sessao

```java
import net.serenitybdd.screenplay.playwright.interactions.SaveSessionState;

// Salvar em um caminho especifico
Path sessionPath = Paths.get("target/sessions/authenticated.json");
alice.attemptsTo(
    SaveSessionState.toPath(sessionPath)
);

// Salvar no local padrao com um nome
// Salva em: target/playwright/session-state/{name}.json
alice.attemptsTo(
    SaveSessionState.toFile("admin-session")
);
```

### Restaurando Estado de Sessao

```java
import net.serenitybdd.screenplay.playwright.interactions.RestoreSessionState;

// Restaurar de um caminho especifico
alice.attemptsTo(
    RestoreSessionState.fromPath(Paths.get("target/sessions/authenticated.json"))
);

// Restaurar do local padrao
alice.attemptsTo(
    RestoreSessionState.fromFile("admin-session")
);
```

### Caso de Uso: Reutilizando Sessoes Autenticadas

Um padrao comum e fazer login uma vez e reutilizar a sessao em multiplos testes:

```java
public class AuthenticationSetup {

    private static final Path SESSION_FILE = Paths.get("target/sessions/logged-in.json");

    @BeforeAll
    static void setupAuthenticatedSession() {
        Actor setup = Actor.named("Setup")
            .whoCan(BrowseTheWebWithPlaywright.usingTheDefaultConfiguration());

        setup.attemptsTo(
            Navigate.to("https://myapp.com/login"),
            Enter.theValue("admin@example.com").into("#email"),
            Enter.theValue("password123").into("#password"),
            Click.on(Button.withText("Login")),

            // Salvar a sessao autenticada
            SaveSessionState.toPath(SESSION_FILE)
        );

        setup.wrapUp();
    }
}

// Nos seus testes
@Test
void shouldAccessDashboard() {
    alice.attemptsTo(
        // Restaurar a sessao pre-autenticada
        RestoreSessionState.fromPath(SESSION_FILE),

        // Navegar diretamente para pagina protegida
        Navigate.to("https://myapp.com/dashboard")
    );

    // Usuario ja esta logado!
    assertThat(alice.asksFor(Text.of("h1"))).isEqualTo("Dashboard");
}
```

### Conteudo do Estado de Sessao

O estado de sessao salvo e um arquivo JSON contendo:
- **Cookies**: Todos os cookies para o contexto do navegador
- **Origins**: Dados de localStorage e sessionStorage para cada origem

Isso permite:
- Pular passos de login nos testes (execucao mais rapida)
- Compartilhar autenticacao entre classes de teste
- Criar fixtures de sessao para diferentes papeis de usuario
- Testar Scenario de expiracao e atualizacao de sessao

### Exemplo: Multiplos Papeis de Usuario

```java
public class SessionFixtures {

    public static void createAdminSession() {
        // Login como admin e salvar sessao
        Actor admin = createActor();
        admin.attemptsTo(
            Navigate.to("https://myapp.com/login"),
            Enter.theValue("admin@example.com").into("#email"),
            Enter.theValue("adminpass").into("#password"),
            Click.on(Button.withText("Login")),
            SaveSessionState.toFile("admin-session")
        );
        admin.wrapUp();
    }

    public static void createUserSession() {
        // Login como usuario regular e salvar sessao
        Actor user = createActor();
        user.attemptsTo(
            Navigate.to("https://myapp.com/login"),
            Enter.theValue("user@example.com").into("#email"),
            Enter.theValue("userpass").into("#password"),
            Click.on(Button.withText("Login")),
            SaveSessionState.toFile("user-session")
        );
        user.wrapUp();
    }
}

// Em testes de admin
@Test
void adminShouldSeeAdminPanel() {
    alice.attemptsTo(
        RestoreSessionState.fromFile("admin-session"),
        Navigate.to("https://myapp.com/admin")
    );
    assertThat(alice.asksFor(Presence.of("#admin-panel"))).isTrue();
}

// Em testes de usuario
@Test
void userShouldNotSeeAdminPanel() {
    alice.attemptsTo(
        RestoreSessionState.fromFile("user-session"),
        Navigate.to("https://myapp.com/admin")
    );
    assertThat(alice.asksFor(Text.of("h1"))).isEqualTo("Access Denied");
}
```

## Geracao de PDF

Gerar PDFs de paginas (apenas Chromium, modo headless):

```java
import net.serenitybdd.screenplay.playwright.interactions.GeneratePDF;

// Geracao basica de PDF
alice.attemptsTo(
    GeneratePDF.ofCurrentPage()
        .andSaveTo(Paths.get("output/report.pdf"))
);

// Com opcoes
alice.attemptsTo(
    GeneratePDF.ofCurrentPage()
        .withFormat("A4")
        .inLandscape()
        .withMargins("1cm", "1cm", "1cm", "1cm")
        .withHeaderTemplate("<div>Header</div>")
        .withFooterTemplate("<div>Page <span class='pageNumber'></span></div>")
        .displayHeaderAndFooter()
        .printBackground()
        .andSaveTo(Paths.get("output/report.pdf"))
);
```

## Alternando Contextos

### Frames

Trabalhar com iframes:

```java
// Alternar para frame por nome ou ID
alice.attemptsTo(Switch.toFrame("payment-iframe"));

// Alternar para frame por Target
alice.attemptsTo(Switch.toFrame(Target.the("payment").locatedBy("#payment-frame")));

// Voltar para frame principal
alice.attemptsTo(Switch.toMainFrame());
```

### Janelas e Abas

Lidar com multiplas janelas e abas:

```java
// Alternar para nova janela/aba
alice.attemptsTo(Switch.toNewWindow());

// Fechar janela atual
alice.attemptsTo(CloseCurrentWindow.now());
```

## Boas Praticas

### Use Constantes Target

Defina Target como constantes para reutilizacao e manutenibilidade:

```java
public class LoginPage {
    public static Target EMAIL_FIELD = Target.the("email field")
        .locatedBy("#email");
    public static Target PASSWORD_FIELD = Target.the("password field")
        .locatedBy("#password");
    public static Target LOGIN_BUTTON = Target.the("login button")
        .locatedBy("role=button[name='Log in']");
}
```

### Prefira Seletores de Role

Use seletores de role ARIA para testes mais resilientes:

```java
// Em vez de CSS
Target.the("Submit").locatedBy("button.primary-btn")

// Prefira seletor de role
Target.the("Submit").locatedBy("role=button[name='Submit']")
```

### Use Fabricas de Elementos UI

Para elementos comuns, use as fabricas de elementos UI:

```java
// Em vez de
Click.on(Target.the("Add button").locatedBy("role=button[name='Add to Cart']"))

// Use
Click.on(Button.withText("Add to Cart"))
```

### Mock de Rede para Isolamento

Mock respostas de API para isolar testes de UI:

```java
@BeforeEach
void setupMocks() {
    actor.attemptsTo(
        InterceptNetwork.requestsTo("**/api/products")
            .andRespondWithJson(200, mockProducts)
    );
}
```

### Use Rastreamento para Depuracao

Habilite rastreamento ao depurar falhas de teste:

```java
alice.attemptsTo(
    StartTracing.withScreenshots().andSnapshots()
);

// Execute seu teste...

alice.attemptsTo(
    StopTracing.andSaveTo(Paths.get("trace.zip"))
);
// Visualize com: npx playwright show-trace trace.zip
```

## Tabelas de Referencia Rapida

### Todas as Interaction

As tabelas a seguir fornecem uma referencia completa de todas as Interaction Playwright Screenplay disponiveis.

#### Interaction de Elementos

| Interaction | Descricao | Exemplo |
|-------------|-------------|---------|
| `Click.on(target)` | Clicar em um elemento | `Click.on("#submit")` |
| `DoubleClick.on(target)` | Clicar duas vezes em um elemento | `DoubleClick.on("#item")` |
| `RightClick.on(target)` | Clicar com botao direito (menu de contexto) em um elemento | `RightClick.on("#file")` |
| `Hover.over(target)` | Mover mouse sobre um elemento | `Hover.over("#menu")` |
| `Focus.on(target)` | Definir foco em um elemento | `Focus.on("#search")` |

#### Interaction de Entrada de Texto

| Interaction | Descricao | Exemplo |
|-------------|-------------|---------|
| `Enter.theValue(text).into(target)` | Digitar texto em um campo | `Enter.theValue("john@test.com").into("#email")` |
| `Clear.field(target)` | Limpar um campo de entrada | `Clear.field("#search")` |
| `Press.key(key)` | Pressionar uma tecla do teclado | `Press.key("Enter")` |
| `Press.key(combo)` | Pressionar uma combinacao de teclas | `Press.key("Control+a")` |
| `Press.keys(keys...)` | Pressionar multiplas teclas em sequencia | `Press.keys("Tab", "Tab", "Enter")` |

#### Interaction de Checkbox e Radio

| Interaction | Descricao | Exemplo |
|-------------|-------------|---------|
| `Check.checkbox(target)` | Marcar um checkbox | `Check.checkbox("#agree")` |
| `Uncheck.checkbox(target)` | Desmarcar um checkbox | `Uncheck.checkbox("#newsletter")` |

#### Interaction de Dropdown

| Interaction | Descricao | Exemplo |
|-------------|-------------|---------|
| `SelectFromOptions.byVisibleText(text).from(target)` | Selecionar por texto visivel | `SelectFromOptions.byVisibleText("Red").from("#color")` |
| `SelectFromOptions.byValue(value).from(target)` | Selecionar por atributo value | `SelectFromOptions.byValue("red").from("#color")` |
| `SelectFromOptions.byIndex(index).from(target)` | Selecionar por indice (0-based) | `SelectFromOptions.byIndex(2).from("#color")` |
| `DeselectFromOptions.byValue(value).from(target)` | Desselecionar por value | `DeselectFromOptions.byValue("red").from("#colors")` |
| `DeselectFromOptions.byVisibleText(text).from(target)` | Desselecionar por texto visivel | `DeselectFromOptions.byVisibleText("Red").from("#colors")` |
| `DeselectFromOptions.byIndex(index).from(target)` | Desselecionar por indice | `DeselectFromOptions.byIndex(0).from("#colors")` |
| `DeselectFromOptions.all().from(target)` | Desselecionar todas as opcoes | `DeselectFromOptions.all().from("#colors")` |

#### Interaction de Rolagem

| Interaction | Descricao | Exemplo |
|-------------|-------------|---------|
| `Scroll.to(target)` | Rolar elemento para visualizacao | `Scroll.to("#footer")` |
| `Scroll.to(target).andAlignToTop()` | Rolar com alinhamento no topo | `Scroll.to("#section").andAlignToTop()` |
| `Scroll.to(target).andAlignToCenter()` | Rolar com alinhamento no centro | `Scroll.to("#section").andAlignToCenter()` |
| `Scroll.to(target).andAlignToBottom()` | Rolar com alinhamento na base | `Scroll.to("#section").andAlignToBottom()` |
| `Scroll.toTop()` | Rolar para o topo da pagina | `Scroll.toTop()` |
| `Scroll.toBottom()` | Rolar para a base da pagina | `Scroll.toBottom()` |
| `Scroll.by(deltaX, deltaY)` | Rolar por quantidade em pixels | `Scroll.by(0, 500)` |
| `Scroll.toPosition(x, y)` | Rolar para posicao absoluta | `Scroll.toPosition(0, 1000)` |

#### Interaction de Drag and Drop

| Interaction | Descricao | Exemplo |
|-------------|-------------|---------|
| `Drag.from(source).to(target)` | Arrastar da origem para o destino | `Drag.from("#item").to("#dropzone")` |
| `Drag.the(source).onto(target)` | Sintaxe fluente alternativa | `Drag.the("#card").onto("#column")` |

#### Interaction de Navegacao

| Interaction | Descricao | Exemplo |
|-------------|-------------|---------|
| `Navigate.to(url)` | Navegar para uma URL | `Navigate.to("https://example.com")` |
| `Navigate.toTheBaseUrl()` | Navegar para URL base configurada | `Navigate.toTheBaseUrl()` |

#### Interaction de Frame e Janela

| Interaction | Descricao | Exemplo |
|-------------|-------------|---------|
| `Switch.toFrame(nameOrId)` | Alternar para iframe por nome/ID | `Switch.toFrame("payment-iframe")` |
| `Switch.toFrame(target)` | Alternar para iframe por Target | `Switch.toFrame(PAYMENT_FRAME)` |
| `Switch.toMainFrame()` | Voltar para frame principal | `Switch.toMainFrame()` |
| `Switch.toNewWindow()` | Alternar para nova janela/aba | `Switch.toNewWindow()` |
| `CloseCurrentWindow.now()` | Fechar janela atual | `CloseCurrentWindow.now()` |

#### Interaction de Arquivo

| Interaction | Descricao | Exemplo |
|-------------|-------------|---------|
| `Upload.file(path).to(target)` | Fazer upload de um arquivo | `Upload.file(Paths.get("doc.pdf")).to("#upload")` |
| `WaitForDownload.whilePerforming(action)` | Esperar download durante acao | `WaitForDownload.whilePerforming(Click.on("#download"))` |
| `WaitForDownload...andSaveTo(path)` | Salvar download em caminho | `WaitForDownload.whilePerforming(...).andSaveTo(path)` |

#### Interaction de JavaScript

| Interaction | Descricao | Exemplo |
|-------------|-------------|---------|
| `Evaluate.javascript(script)` | Executar JavaScript | `Evaluate.javascript("window.scrollTo(0,0)")` |

#### Interaction de Espera

| Interaction | Descricao | Exemplo |
|-------------|-------------|---------|
| `WaitUntil.the(target).isVisible()` | Esperar visibilidade do elemento | `WaitUntil.the("#modal").isVisible()` |
| `WaitUntil.the(target).isNotVisible()` | Esperar elemento ficar oculto | `WaitUntil.the("#spinner").isNotVisible()` |
| `WaitUntil.the(target).isHidden()` | Esperar elemento estar escondido | `WaitUntil.the("#loading").isHidden()` |
| `WaitUntil...forNoMoreThan(duration)` | Definir timeout customizado | `WaitUntil.the("#data").isVisible().forNoMoreThan(Duration.ofSeconds(10))` |

#### Interaction de Rede

| Interaction | Descricao | Exemplo |
|-------------|-------------|---------|
| `InterceptNetwork.requestsTo(pattern).andRespondWith(options)` | Mock resposta com opcoes | `InterceptNetwork.requestsTo("**/api/**").andRespondWith(...)` |
| `InterceptNetwork.requestsTo(pattern).andRespondWithJson(status, data)` | Mock resposta JSON | `InterceptNetwork.requestsTo("**/users").andRespondWithJson(200, users)` |
| `InterceptNetwork.requestsTo(pattern).andHandle(handler)` | Handler de requisicao customizado | `InterceptNetwork.requestsTo("**/api/**").andHandle(route -> ...)` |
| `InterceptNetwork.requestsTo(pattern).andAbort()` | Bloquear requisicoes | `InterceptNetwork.requestsTo("**/analytics/**").andAbort()` |
| `RemoveRoutes.all()` | Remover todos os handlers de rota | `RemoveRoutes.all()` |
| `RemoveRoutes.forUrl(pattern)` | Remover rotas para padrao | `RemoveRoutes.forUrl("**/api/**")` |

#### Interaction de Dispositivo e Ambiente

| Interaction | Descricao | Exemplo |
|-------------|-------------|---------|
| `EmulateDevice.device(name)` | Emular um dispositivo | `EmulateDevice.device("iPhone 14")` |
| `EmulateDevice.withViewport(width, height)` | Definir viewport customizada | `EmulateDevice.withViewport(375, 812)` |
| `SetGeolocation.to(lat, lng)` | Definir geolocalizacao | `SetGeolocation.to(51.5074, -0.1278)` |
| `SetGeolocation.toNewYork()` | Definir para Nova York | `SetGeolocation.toNewYork()` |
| `SetGeolocation.toLondon()` | Definir para Londres | `SetGeolocation.toLondon()` |
| `SetGeolocation.toTokyo()` | Definir para Toquio | `SetGeolocation.toTokyo()` |
| `SetGeolocation.clear()` | Limpar geolocalizacao | `SetGeolocation.clear()` |
| `GrantPermissions.for_(permissions...)` | Conceder permissoes do navegador | `GrantPermissions.for_("geolocation", "camera")` |
| `ClearPermissions.all()` | Limpar todas as permissoes | `ClearPermissions.all()` |

#### Interaction de Controle de Relogio

| Interaction | Descricao | Exemplo |
|-------------|-------------|---------|
| `ControlClock.install()` | Instalar relogio falso | `ControlClock.install()` |
| `ControlClock.setTo(instant)` | Definir relogio para hora especifica | `ControlClock.setTo(Instant.parse("2024-01-15T10:30:00Z"))` |
| `ControlClock.advanceBy(duration)` | Avancar relogio | `ControlClock.advanceBy(Duration.ofHours(2))` |
| `ControlClock.resume()` | Retomar fluxo normal do tempo | `ControlClock.resume()` |

#### Interaction de Depuracao e Rastreamento

| Interaction | Descricao | Exemplo |
|-------------|-------------|---------|
| `StartTracing.withScreenshots()` | Iniciar rastreamento com screenshots | `StartTracing.withScreenshots()` |
| `StopTracing.andSaveTo(path)` | Parar e salvar rastreamento | `StopTracing.andSaveTo(Paths.get("trace.zip"))` |
| `CaptureConsoleMessages.duringTest()` | Iniciar captura de console | `CaptureConsoleMessages.duringTest()` |
| `CaptureConsoleMessages.clear()` | Limpar mensagens capturadas | `CaptureConsoleMessages.clear()` |
| `CheckConsole.forErrors()` | Falhar se erros de console encontrados | `CheckConsole.forErrors()` |
| `CheckConsole.forWarnings()` | Falhar se avisos de console encontrados | `CheckConsole.forWarnings()` |
| `CaptureNetworkRequests.duringTest()` | Iniciar captura de rede | `CaptureNetworkRequests.duringTest()` |
| `CaptureNetworkRequests.clear()` | Limpar requisicoes capturadas | `CaptureNetworkRequests.clear()` |

#### Interaction de Estado de Sessao

| Interaction | Descricao | Exemplo |
|-------------|-------------|---------|
| `SaveSessionState.toPath(path)` | Salvar sessao em caminho especifico | `SaveSessionState.toPath(Paths.get("session.json"))` |
| `SaveSessionState.toFile(name)` | Salvar sessao em local padrao | `SaveSessionState.toFile("admin-session")` |
| `RestoreSessionState.fromPath(path)` | Restaurar sessao de caminho | `RestoreSessionState.fromPath(Paths.get("session.json"))` |
| `RestoreSessionState.fromFile(name)` | Restaurar sessao de local padrao | `RestoreSessionState.fromFile("admin-session")` |

#### Interaction de Requisicao de API

| Interaction | Descricao | Exemplo |
|-------------|-------------|---------|
| `APIRequest.get(url)` | Fazer requisicao GET | `APIRequest.get("https://api.example.com/users")` |
| `APIRequest.post(url)` | Fazer requisicao POST | `APIRequest.post("https://api.example.com/users")` |
| `APIRequest.put(url)` | Fazer requisicao PUT | `APIRequest.put("https://api.example.com/users/1")` |
| `APIRequest.patch(url)` | Fazer requisicao PATCH | `APIRequest.patch("https://api.example.com/users/1")` |
| `APIRequest.delete(url)` | Fazer requisicao DELETE | `APIRequest.delete("https://api.example.com/users/1")` |
| `APIRequest...withJsonBody(object)` | Definir corpo JSON da requisicao | `APIRequest.post(url).withJsonBody(Map.of("name", "John"))` |

#### Interaction de Geracao de PDF

| Interaction | Descricao | Exemplo |
|-------------|-------------|---------|
| `GeneratePDF.ofCurrentPage().andSaveTo(path)` | Gerar PDF | `GeneratePDF.ofCurrentPage().andSaveTo(Paths.get("page.pdf"))` |
| `GeneratePDF...withFormat(format)` | Definir formato do papel | `GeneratePDF.ofCurrentPage().withFormat("A4")` |
| `GeneratePDF...inLandscape()` | Usar orientacao paisagem | `GeneratePDF.ofCurrentPage().inLandscape()` |

#### Interaction de Testes Visuais

| Interaction | Descricao | Exemplo |
|-------------|-------------|---------|
| `CompareScreenshot.ofPage().againstBaseline(name)` | Comparar pagina inteira | `CompareScreenshot.ofPage().againstBaseline("home.png")` |
| `CompareScreenshot.of(target).againstBaseline(name)` | Comparar elemento | `CompareScreenshot.of("#card").againstBaseline("card.png")` |

---

### Todas as Question

As tabelas a seguir fornecem uma referencia completa de todas as Question Playwright Screenplay disponiveis.

#### Question de Estado de Elemento

| Question | Tipo de Retorno | Descricao | Exemplo |
|----------|-------------|-------------|---------|
| `Presence.of(target)` | `Boolean` | Elemento existe no DOM | `actor.asksFor(Presence.of("#modal"))` |
| `Absence.of(target)` | `Boolean` | Elemento nao esta presente | `actor.asksFor(Absence.of("#error"))` |
| `Visibility.of(target)` | `Boolean` | Elemento esta visivel | `actor.asksFor(Visibility.of("#popup"))` |
| `Enabled.of(target)` | `Boolean` | Elemento esta habilitado | `actor.asksFor(Enabled.of("#submit"))` |
| `SelectedStatus.of(target)` | `Boolean` | Checkbox/radio esta selecionado | `actor.asksFor(SelectedStatus.of("#agree"))` |

#### Question de Conteudo de Elemento

| Question | Tipo de Retorno | Descricao | Exemplo |
|----------|-------------|-------------|---------|
| `Text.of(target)` | `String` | Obter conteudo de texto do elemento | `actor.asksFor(Text.of("#title"))` |
| `Text.ofEach(target)` | `List<String>` | Obter texto de todos os elementos correspondentes | `actor.asksFor(Text.ofEach(".item"))` |
| `Value.of(target)` | `String` | Obter valor do campo de entrada | `actor.asksFor(Value.of("#email"))` |
| `Attribute.of(target).named(attr)` | `String` | Obter valor do atributo | `actor.asksFor(Attribute.of("#link").named("href"))` |
| `CSSValue.of(target).named(prop)` | `String` | Obter valor da propriedade CSS | `actor.asksFor(CSSValue.of("#box").named("color"))` |

#### Question de Informacao da Pagina

| Question | Tipo de Retorno | Descricao | Exemplo |
|----------|-------------|-------------|---------|
| `CurrentUrl.ofThePage()` | `String` | Obter URL atual da pagina | `actor.asksFor(CurrentUrl.ofThePage())` |
| `PageTitle.ofThePage()` | `String` | Obter titulo da pagina | `actor.asksFor(PageTitle.ofThePage())` |

#### Question de Download

| Question | Tipo de Retorno | Descricao | Exemplo |
|----------|-------------|-------------|---------|
| `DownloadedFile.suggestedFilename()` | `String` | Obter nome de arquivo sugerido | `actor.asksFor(DownloadedFile.suggestedFilename())` |
| `DownloadedFile.url()` | `String` | Obter URL do download | `actor.asksFor(DownloadedFile.url())` |
| `DownloadedFile.path()` | `Path` | Obter caminho do arquivo baixado | `actor.asksFor(DownloadedFile.path())` |
| `DownloadedFile.failure()` | `String` | Obter razao da falha (null se sucesso) | `actor.asksFor(DownloadedFile.failure())` |

#### Question de Mensagem do Console

| Question | Tipo de Retorno | Descricao | Exemplo |
|----------|-------------|-------------|---------|
| `ConsoleMessages.all()` | `List<String>` | Obter todas as mensagens do console | `actor.asksFor(ConsoleMessages.all())` |
| `ConsoleMessages.errors()` | `List<String>` | Obter erros do console | `actor.asksFor(ConsoleMessages.errors())` |
| `ConsoleMessages.warnings()` | `List<String>` | Obter avisos do console | `actor.asksFor(ConsoleMessages.warnings())` |
| `ConsoleMessages.count()` | `Integer` | Obter contagem total de mensagens | `actor.asksFor(ConsoleMessages.count())` |

#### Question de Acessibilidade

| Question | Tipo de Retorno | Descricao | Exemplo |
|----------|-------------|-------------|---------|
| `AccessibilitySnapshot.ofThePage()` | `String` | Obter arvore de acessibilidade da pagina | `actor.asksFor(AccessibilitySnapshot.ofThePage())` |
| `AccessibilitySnapshot.of(target)` | `String` | Obter arvore de acessibilidade do elemento | `actor.asksFor(AccessibilitySnapshot.of("#nav"))` |

#### Question de Requisicao de Rede

| Question | Tipo de Retorno | Descricao | Exemplo |
|----------|-------------|-------------|---------|
| `NetworkRequests.all()` | `List<CapturedRequest>` | Obter todas as requisicoes capturadas | `actor.asksFor(NetworkRequests.all())` |
| `NetworkRequests.count()` | `Integer` | Obter contagem total de requisicoes | `actor.asksFor(NetworkRequests.count())` |
| `NetworkRequests.failed()` | `List<CapturedRequest>` | Obter requisicoes falhas | `actor.asksFor(NetworkRequests.failed())` |

#### Question de Resposta de API

| Question | Tipo de Retorno | Descricao | Exemplo |
|----------|-------------|-------------|---------|
| `LastAPIResponse.statusCode()` | `Integer` | Obter codigo de status da resposta | `actor.asksFor(LastAPIResponse.statusCode())` |
| `LastAPIResponse.ok()` | `Boolean` | Verificar se status e 2xx | `actor.asksFor(LastAPIResponse.ok())` |
| `LastAPIResponse.body()` | `String` | Obter corpo da resposta como string | `actor.asksFor(LastAPIResponse.body())` |
| `LastAPIResponse.jsonBody()` | `Map<String, Object>` | Parsear resposta JSON como Map | `actor.asksFor(LastAPIResponse.jsonBody())` |

---

### Fabricas de Elementos UI

Classes de fabrica para localizar elementos UI comuns.

| Fabrica | Metodos | Exemplo |
|---------|---------|---------|
| `Button` | `withText(text)`, `withNameOrId(id)`, `withAriaLabel(label)`, `containingText(text)`, `locatedBy(selector)` | `Button.withText("Submit")` |
| `InputField` | `withNameOrId(id)`, `withPlaceholder(text)`, `withLabel(label)`, `withAriaLabel(label)`, `locatedBy(selector)` | `InputField.withPlaceholder("Email")` |
| `Link` | `withText(text)`, `containingText(text)`, `withTitle(title)`, `locatedBy(selector)` | `Link.withText("Learn more")` |
| `Checkbox` | `withLabel(label)`, `withNameOrId(id)`, `withValue(value)`, `locatedBy(selector)` | `Checkbox.withLabel("I agree")` |
| `RadioButton` | `withLabel(label)`, `withNameOrId(id)`, `withValue(value)`, `locatedBy(selector)` | `RadioButton.withValue("express")` |
| `Dropdown` | `withLabel(label)`, `withNameOrId(id)`, `locatedBy(selector)` | `Dropdown.withLabel("Country")` |
| `Label` | `withText(text)`, `withExactText(text)`, `forFieldId(id)`, `locatedBy(selector)` | `Label.forFieldId("email")` |
| `Image` | `withAltText(alt)`, `withSrc(src)`, `withSrcContaining(text)`, `locatedBy(selector)` | `Image.withAltText("Logo")` |

---

## Migracao do WebDriver

Ao migrar do `serenity-screenplay-webdriver`:

1. **Mudanca de Ability**:
   - Substitua `BrowseTheWeb` por `BrowseTheWebWithPlaywright`

2. **Sintaxe de Seletores**:
   - CSS e XPath funcionam de forma semelhante
   - Adicione seletores de role para testes mais robustos
   - Use `>>` para encadear seletores em vez de aninhar

3. **Espera**:
   - Playwright espera automaticamente; esperas explicitas sao menos necessarias
   - Remova a maioria das chamadas `WaitUntil`

4. **Metodos de Localizacao**:
   - `By.id("x")` se torna `"#x"`
   - `By.cssSelector("x")` se torna `"x"`
   - `By.xpath("x")` se torna `"xpath=x"`

5. **Novas Capacidades**:
   - Use interceptacao de rede para mock de APIs
   - Use rastreamento para depuracao
   - Use emulacao de dispositivos para testes responsivos

## Exemplo Completo

```java
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.playwright.abilities.BrowseTheWebWithPlaywright;
import net.serenitybdd.screenplay.playwright.interactions.*;
import net.serenitybdd.screenplay.playwright.questions.*;
import net.serenitybdd.screenplay.playwright.ui.*;
import static org.assertj.core.api.Assertions.assertThat;

public class ShoppingCartTest {

    Actor alice = Actor.named("Alice");

    @BeforeEach
    void setup() {
        Playwright playwright = Playwright.create();
        Browser browser = playwright.chromium().launch();
        alice.can(BrowseTheWebWithPlaywright.using(browser));
    }

    @Test
    void shouldAddItemToCart() {
        alice.attemptsTo(
            Navigate.to("https://shop.example.com"),
            Click.on(Button.withText("Electronics")),
            Click.on(Link.containingText("Laptop")),
            SelectFromOptions.byVisibleText("16GB").from(Dropdown.withLabel("Memory")),
            Click.on(Button.withText("Add to Cart"))
        );

        String cartCount = alice.asksFor(Text.of("#cart-count"));
        assertThat(cartCount).isEqualTo("1");

        List<String> cartItems = alice.asksFor(Text.ofEach(".cart-item-name"));
        assertThat(cartItems).contains("Laptop");
    }
}
```

## Leitura Adicional

- [Documentacao Java do Playwright](https://playwright.dev/java/docs/intro)
- [Serenity Screenplay Pattern](screenplay_fundamentals)
- [Testes Web com WebDriver](screenplay_webdriver)
