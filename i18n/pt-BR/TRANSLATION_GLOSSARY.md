# Glossário de Tradução – Serenity BDD

Este glossário define como traduzir (ou não traduzir) termos técnicos na documentação do Serenity BDD, com foco especial em Java, testes automatizados e o Screenplay Pattern.

---

## Termos que **NÃO se traduzem** (manter em inglês)

### Nomes de padrões e conceitos do Screenplay / Serenity

- **Actor** – Manter como *Actor*
- **Task** – Manter como *Task*
  *(pode-se usar "tarefa" apenas em texto explicativo)*
- **Question** – Manter como *Question*
- **Ability** – Manter como *Ability*
- **Interaction** – Manter como *Interaction*
- **Performable** – Manter como *Performable*
- **Target** – Manter como *Target*
- **Remember / Recall** – Manter em inglês quando se refere à memória do Actor

- **Screenplay Pattern** – Preferir *Screenplay Pattern*
  *("Padrão Screenplay" apenas em texto narrativo ou pedagógico)*

- **Page Object** – Preferir *Page Object*
  *("Objeto de Página" apenas em introduções conceituais)*
- **Page Component** – Manter como *Page Component*

- **Action Class** – Manter como *Action Class*
  *(uso descritivo; não é um conceito central do Screenplay Pattern)*

---

### Termos do Cucumber / Gherkin

- **Feature** – Manter como *Feature*
- **Scenario** – *Scenario* ou *Cenário* (conforme contexto)
- **Background** – Manter como *Background*
- **Scenario Outline** – Manter como *Scenario Outline*
- **Examples** – Manter como *Examples*

- **Given / When / Then**
  - Em código: **manter em inglês**
  - Em explicações: traduzir (*Dado / Quando / Então*)

- **Step Definition** – Preferir *Step Definition*
  *("Definição de Passo" apenas em texto explicativo)*

---

### Termos técnicos gerais (manter em inglês em APIs e código)

- **WebDriver**
- **Framework**
- **Matcher**
- **Assertion**
- **Browser** – Manter em inglês em APIs e código
- **Report** – Manter em inglês em nomes técnicos
- **Annotation** – Manter em inglês em código

---

### Nomes de ferramentas e bibliotecas (NÃO traduzir)

Selenium, JUnit, Maven, Gradle, Chrome, Firefox
AssertJ, Hamcrest, Cucumber
IntelliJ, Eclipse, Git, GitHub

---

## Termos que **SIM se traduzem** (em texto explicativo)

| Inglês | Português |
|--------|-----------|
| test | teste |
| run | executar |
| build | compilar / construir |
| tutorial | tutorial |
| prerequisite | pré-requisito |
| project | projeto |
| class | classe |
| method | método |
| field | campo |
| package | pacote |
| directory | diretório |
| file | arquivo |
| code | código |
| step | passo |
| browser | navegador |
| report | relatório |
| annotation | anotação |
| search | busca / pesquisa |
| click | clicar |
| type | digitar |
| navigate | navegar |
| element | elemento |
| selector | seletor |
| heading | cabeçalho |
| sidebar | barra lateral |
| result | resultado |
| requirement | requisito |
| acceptance criteria | critérios de aceitação |
| tag | tag / etiqueta |
| narrative | narrativa |
| test outcome | resultado do teste |
| settings | configurações |
| dependency | dependência |
| assertion | asserção (em texto explicativo) |

---

## Notas de estilo

1. **Voz ativa**
   Preferir:
   > Execute o comando
   em vez de:
   > O comando deve ser executado

2. **Você vs. Tu**
   Usar **você** para um tom acessível e consistente com o português brasileiro.

3. **Introdução de termos técnicos**
   Na primeira vez que aparecerem, usar:
   > termo em inglês (tradução)

4. **Código**
   - Os comentários **podem** ser traduzidos
   - Os nomes de classes, métodos, pacotes e variáveis **NÃO se traduzem**

5. **Pluralização**
   - Não pluralizar termos técnicos em inglês
     ❌ os Tasks, os Actors
     ✅ os Task, os Actor ou reformular a frase

6. **URLs e caminhos de arquivos**
   - Não traduzir
   - Não adaptar nomes de pastas ou endpoints
