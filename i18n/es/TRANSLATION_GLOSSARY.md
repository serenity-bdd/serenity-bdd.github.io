# Glosario de Traducción – Serenity BDD

Este glosario define cómo traducir (o no traducir) términos técnicos en la documentación de Serenity BDD, con especial foco en Java, testing automatizado y el Screenplay Pattern.

---

## Términos que **NO se traducen** (mantener en inglés)

### Nombres de patrones y conceptos de Screenplay / Serenity

- **Actor** – Mantener como *Actor*
- **Task** – Mantener como *Task*  
  *(se puede usar “tarea” solo en texto explicativo)*
- **Question** – Mantener como *Question*
- **Ability** – Mantener como *Ability*
- **Interaction** – Mantener como *Interaction*
- **Performable** – Mantener como *Performable*
- **Target** – Mantener como *Target*
- **Remember / Recall** – Mantener en inglés cuando se refiere a la memoria del Actor

- **Screenplay Pattern** – Preferir *Screenplay Pattern*  
  *(“Patrón Screenplay” solo en texto narrativo o pedagógico)*

- **Page Object** – Preferir *Page Object*  
  *(“Objeto de Página” solo en introducciones conceptuales)*
- **Page Component** – Mantener como *Page Component*

- **Action Class** – Mantener como *Action Class*  
  *(uso descriptivo; no es un concepto central del Screenplay Pattern)*

---

### Términos de Cucumber / Gherkin

- **Feature** – Mantener como *Feature*
- **Scenario** – *Scenario* o *Escenario* (según contexto)
- **Background** – Mantener como *Background*
- **Scenario Outline** – Mantener como *Scenario Outline*
- **Examples** – Mantener como *Examples*

- **Given / When / Then**
  - En código: **mantener en inglés**
  - En explicaciones: traducir (*Dado / Cuando / Entonces*)

- **Step Definition** – Preferir *Step Definition*  
  *(“Definición de Paso” solo en texto explicativo)*

---

### Términos técnicos generales (mantener en inglés en APIs y código)

- **WebDriver**
- **Framework**
- **Matcher**
- **Assertion**
- **Browser** – Mantener en inglés en APIs y código
- **Report** – Mantener en inglés en nombres técnicos
- **Annotation** – Mantener en inglés en código

---

### Nombres de herramientas y bibliotecas (NO traducir)

Selenium, JUnit, Maven, Gradle, Chrome, Firefox  
AssertJ, Hamcrest, Cucumber  
IntelliJ, Eclipse, Git, GitHub

---

## Términos que **SÍ se traducen** (en texto explicativo)

| Inglés | Español |
|------|---------|
| test | prueba / test |
| run | ejecutar |
| build | compilar / construir |
| tutorial | tutorial |
| prerequisite | prerrequisito |
| project | proyecto |
| class | clase |
| method | método |
| field | campo |
| package | paquete |
| directory | directorio |
| file | archivo |
| code | código |
| step | paso |
| browser | navegador |
| report | reporte / informe |
| annotation | anotación |
| search | búsqueda / buscar |
| click | clic / hacer clic |
| type | escribir / tipear |
| navigate | navegar |
| element | elemento |
| selector | selector |
| heading | encabezado |
| sidebar | barra lateral |
| result | resultado |
| requirement | requisito |
| acceptance criteria | criterios de aceptación |
| tag | etiqueta |
| narrative | narrativa |
| test outcome | resultado del test |

---

## Notas de estilo

1. **Voz activa**  
   Preferir:  
   > Ejecuta el comando  
   sobre:  
   > El comando debe ser ejecutado

2. **Tuteo vs. Usted**  
   Usar **tú** para un tono cercano, moderno y consistente.

3. **Introducción de términos técnicos**  
   La primera vez que aparezcan, usar:  
   > término en inglés (traducción)

4. **Código**
   - Los comentarios **pueden** traducirse
   - Los nombres de clases, métodos, paquetes y variables **NO se traducen**

5. **Pluralización**
   - No pluralizar términos técnicos en inglés  
     ❌ los Tasks, los Actors  
     ✅ los Task, los Actor o reformular la frase

6. **URLs y rutas de archivos**
   - No traducir
   - No adaptar nombres de carpetas o endpoints
