---
id: playwright_intro
title: Introdução ao Serenity Playwright
sidebar_position: 1
---

# Serenity BDD com Playwright

O módulo `serenity-playwright` fornece integração perfeita entre as poderosas capacidades de relatórios do Serenity BDD e a automação de navegador moderna do [Playwright](https://playwright.dev/). Essa combinação oferece o melhor dos dois mundos:

- **Velocidade e Confiabilidade do Playwright** - Automação de navegador moderna com espera automática
- **Relatórios Ricos do Serenity** - Documentação passo a passo com capturas de tela
- **Suporte ao Page Object Pattern** - Arquitetura de testes limpa e fácil de manter
- **Testes Cross-Browser** - Suporte a Chromium, Firefox e WebKit

## Por que Playwright com Serenity?

O Playwright é uma biblioteca moderna de automação de navegador desenvolvida pela Microsoft que oferece várias vantagens:

- **Espera automática** - O Playwright espera automaticamente que os elementos estejam prontos para ação antes de executar ações
- **Múltiplos Contextos de Navegador** - Execute testes em contextos de navegador isolados para paralelização verdadeira
- **Interceptação de Rede** - Simule e modifique requisições de rede facilmente
- **Emulação Mobile** - Teste designs responsivos com emulação de dispositivos
- **Suporte Web Moderno** - Suporte de primeira classe para Shadow DOM, iframes e web components

Combinado com o Serenity BDD, você obtém:

- **Captura Automática de Tela** - Capturas de tela a cada conclusão de passo
- **Relatórios HTML Ricos** - Relatórios interativos com documentação passo a passo
- **Documentação Viva** - Testes que documentam como sua aplicação funciona
- **Captura de Código-Fonte da Página** - Snapshots HTML para depuração de testes que falharam

## Duas Abordagens: Page Object ou Screenplay

O Serenity Playwright suporta duas abordagens arquiteturais:

### Page Object Pattern (Tradicional)

O padrão clássico de três camadas familiar à maioria dos engenheiros de automação de testes:

```
Classe de Teste (cenários de negócio)
    └── Step Library (métodos @Step para relatórios do Serenity)
          └── Page Object (encapsula locators e interações com a página)
```

Essa separação garante:
- **Testes** leem como requisitos de negócio sem detalhes técnicos
- **Step Library** fornecem relatórios ricos do Serenity com anotações `@Step`
- **Page Object** encapsulam todas as estratégias de localização e lógica específica da página

### Screenplay Pattern (Moderno)

O Screenplay Pattern é uma abordagem mais moderna, centrada no ator:

```
Classe de Teste (cenários de negócio)
    └── Actor executa Task e faz Question
          └── Task usam Target para interagir com a UI
```

Com Screenplay:
- **Actor** representam usuários com habilidades (Ability), como navegar na web
- **Task** expressam ações de alto nível em linguagem de negócio
- **Question** consultam o estado da aplicação
- **Target** definem elementos de UI usando seletores do Playwright

Ambas as abordagens se integram perfeitamente com os relatórios do Serenity.

## Exemplos Rápidos

### Abordagem Page Object

Veja como é um teste Serenity Playwright baseado em Page Object:

```java
@ExtendWith(SerenityJUnit5Extension.class)
class SearchTest {

    @Steps
    WikipediaSteps wikipedia;

    private Page page;

    @BeforeEach
    void setup() {
        page = browser.newPage();
        PlaywrightSerenity.registerPage(page);
    }

    @Test
    void shouldSearchForATerm() {
        wikipedia.openWikipedia(page);
        wikipedia.searchFor(page, "Playwright");
        wikipedia.verifyTitleContains(page, "Playwright");
    }
}
```

### Abordagem Screenplay

Veja o mesmo teste usando o Screenplay Pattern:

```java
@ExtendWith(SerenityJUnit5Extension.class)
class SearchTest {

    Actor researcher;

    @BeforeEach
    void setup() {
        researcher = Actor.named("Researcher");
        researcher.can(BrowseTheWebWithPlaywright.usingTheDefaultConfiguration());
    }

    @Test
    void shouldSearchForATerm() {
        researcher.attemptsTo(
            Open.url("https://en.wikipedia.org"),
            SearchFor.term("Playwright"),
            Ensure.that(ThePageTitle.displayed()).contains("Playwright")
        );
    }
}
```

Ambas as abordagens leem como especificações - sem seletores CSS ou chamadas de API de baixo nível do Playwright, apenas linguagem de negócio clara.

## Começando

Pronto para começar? Vá para o guia de [Primeiros Passos](playwright_getting_started) para configurar seu primeiro projeto Serenity Playwright.

Para um exemplo completo:
- **Abordagem Page Object**: Confira o [Tutorial TodoMVC](playwright_tutorial_todomvc) que mostra passo a passo como construir uma suíte de testes completa
- **Abordagem Screenplay**: Veja o guia [Screenplay com Playwright](playwright_screenplay) para o padrão centrado no ator com exemplos abrangentes
