# Sicurezza {#security}

## Report delle vulnerabilità {#reporting-vulnerabilities}

Quando una vulnerabilità viene riportata, diventa immediatamente una alta priorità, dedicandovi un collaboratore a tempo pieno. Per riportare una vulnerabilità, basta scrivere una mail a [security@vuejs.org](mailto:security@vuejs.org).

Nonostante la scoperta di nuove vulnerabilità sia rara, ci si raccomanda sempre di utilizzare l'ultima versione di Vue e le librerie e pacchetti ufficiali, per assicurare che la propria applicazione rimanga il più sicura possibile.

## Regola Numero 1: Mai usare template di terze parti {#rule-no-1-never-use-non-trusted-templates}

La regola fondamentale quando si utilizza Vue è **mai utilizzare contenuto di terze parti come componente per il proprio template**. Fare ciò può causare l'esecuzione casuale di JavaScript nella propria applicazione o peggio, se il codice viene eseguito server side può anche portare a violazioni di questo tipo. Un esempio di tale uso, qui di seguito:

```js
Vue.createApp({
  template: `<div>` + userProvidedString + `</div>` // DA NON FARE
}).mount('#app')
```

I template di Vue sono compilati in JavaScript e le espressioni dentro i template verranno eseguite come parte del processo di rendering. Nonostante le espressioni sono misurate secondo uno specifico contesto di rendering, a causa della potenziale complessità di un ambiente di esecuzione globale, è impraticabile per un framework come Vue proteggersi totalmente dall'esecuzione di codice malevolo senza incappare in visibili costi di performance. La pratica migliore per tenersi lontani da questo tipo di complicazioni, è mantenere il contesto delle proprie applicazioni Vue, con contenuti totalmente sicuri e controllati in autonomia.

## Cosa fa Vue per garantirti sicurezza {#what-vue-does-to-protect-you}

### Contenuto HTML {#html-content}

Usando template o funzioni di render, il contenuto è automaticamente al sicuro tramite escaping. Ad esempio in questo template:

```vue-html
<h1>{{ userProvidedString }}</h1>
```

se `userProvidedString` contenesse:

```js
'<script>alert("hi")</script>'
```

si rende sicuro con escaping come nell'esempio seguente in HTML:

```vue-html
&lt;script&gt;alert(&quot;hi&quot;)&lt;/script&gt;
```

prevenendo quindi iniezioni di script. Questa tecnica di sicurezza (escaping) viene fatta utilizzando una API nativa del browser come `textContent`, quindi una vulnerabilità può esistere solo nel browser se vulnerabile.

### Binding degli attributi {#attribute-bindings}

In maniera simile, il binding degli attributi sono anch'essi protetti da escaping. Possiamo vedere nel seguente template:

```vue-html
<h1 :title="userProvidedString">
  hello
</h1>
```

se `userProvidedString` contenesse:

```js
'" onclick="alert(\'hi\')'
```

sarebbe protetto con l'escaping tramite il seguente HTML:

```vue-html
&quot; onclick=&quot;alert('hi')
```

perciò preveniamo la chiusura dell'attributo `title` per iniettare nuovo HTML casuale. Questo escaping viene fatto utilizzando l'API nativa del browser: `setAttribute`, così una vulnerabilità può esistere solo se il browser è vulnerabile.

## Potenziali Pericoli {#potential-dangers}

In ogni applicazione web, permettere l'uso di contenuti di terze parti eseguito tramite HTML, CSS e JavaScript è potenzialmente dannoso, quindi andrebbe evitato ovunque possibile. Alcune volte però il rischio è accettabile.

Ad esempio, servizi come CodePen e JSFiddle permettono di eseguire contenuti forniti dagli utenti, ma è in un contesto sia previsto che reso come sandbox all'interno di iframes. Nei casi in cui una feature importante richieda per forza di cose un livello accettabile di vulnerabilità, spetta al team di sviluppo soppesare l'importanza della feature contro i casi peggiori in cui la vulnerabilità si possa presentare.

### Iniezione di HTML {#html-injection}

Come abbiamo detto sopra, Vue automaticamente mette al sicuro con escaping il contenuto HTML, evitando di iniettare accidentalmente codice HTML nella propria applicazione. Però, **in casi in cui si sa che l'HTML è sicuro**, si può esplicitamente prestare contenuto HTML:

- Usando un template:

  ```vue-html
  <div v-html="userProvidedHtml"></div>
  ```

- Usando una funzione di render:

  ```js
  h('div', {
    innerHTML: this.userProvidedHtml
  })
  ```

- Usando una funzione di render con JSX:

  ```jsx
  <div innerHTML={this.userProvidedHtml}></div>
  ```

:::attenzione
Il contenuto HTML fornito da qualsiasi utente non può mai essere considerato al 100% sicuro a meno che non è inserito in un iframe di sandbox oppure in una parte dell'applicazione in cui solo l'utente che ha scritto quel codice HTML può esservi esposto. In maniera addizionale, permettere agli utenti di scrivere i loro template Vue può portare vulnerabilità simili.
:::

### Iniezione tramite URL {#url-injection}

In un URL come questo:

```vue-html
<a :href="userProvidedUrl">
  cliccami
</a>
```

Ci può essere un potenziale problema di sicurezza se l'URL non è stato "disinfettato" in maniera da prevenire l'esecuzione tramite JavaScript. Ci sono librerie come [sanitize-url](https://www.npmjs.com/package/@braintree/sanitize-url) che servono a tale scopo, ma attenzione: se ci si trova a fare una pulizia degli URL sul frontend, si ha già un problema di sicurezza. **url che provengono lato utente devono essere sempre controllati ed approvati dal proprio backend prima anche solo di essere memorizzati su un database.** In seguito il problema viene evitato per _ogni_ client che si collega al proprio API, ciò include anche le mobile app native. Da notare bene che anche con URL puliti, Vue non può garantire che direzioneranno ad un indirizzo sicuro.

### Iniezioni nello stile {#style-injection}

Guardando questo esempio:

```vue-html
<a
  :href="sanitizedUrl"
  :style="userProvidedStyles"
>
  cliccami
</a>
```

Diamo per scontato che `sanitizedUrl` è stato pulito, quindi è definitivamente un URL reale e non codice JavaScript. Con `userProvidedStyles`, utenti malevoli potrebbero utilizzare CSS per fare "click jack", ad esempio stilizzare un link in un box trasparente al di sopra del bottone di "Log In". Quindi, se `https://user-controlled-website.com/` è montato per raffigurare la pagina di login della propria applicazione, (gli utenti malevoli) potrebbero aver intercettato le reali informazioni di login di un ignaro utente.

Si può immaginare come il permettere contenuto fornito dagli utenti per l'elemento di `<style>` può causare anche vulnerabilità maggiori, dando all'utente che ha fornito il contenuto controllo su come stilizzare la pagina intera. Ecco perchè Vue previene il rendering dei tag di stile dentro i template, come ad esempio:

```vue-html
<style>{{ userProvidedStyles }}</style>
```

Per mettere in sicurezza totalmente gli utenti e proteggergli dal "clickjacking", ci si raccomanda di permettere il totale controllo del CSS solo all'interno di un iframe in ambiente di sandbox. In alternativa, quando si permette il controllo all'utente tramite un bind di stile, si raccomanda l'uso della [object syntax](/guide/essentials/class-and-style#binding-to-objects-1) e permettere soltanto agli utenti di fornire valori per specifiche proprietà che per loro è sicuro da controllare, ad esempio così:

```vue-html
<a
  :href="sanitizedUrl"
  :style="{
    color: userProvidedColor,
    background: userProvidedBackground
  }"
>
  cliccami
</a>
```

### Iniezione tramite JavaScript {#javascript-injection}

Si sconsiglia vivamente di fare rendering di un elemento di `<script>` tramite Vue, dato che i template e le funzioni di rendering non dovrebbero mai avere effetti secondari. In ogni caso, questa pratica non è l'unico metodo per includere stringhe che dovrebbero venire valutate come JavaScript al runtime.

Ogni elemento HTML ha attributi con valori che accettano stringhe di JavaScript, ad esempio `onclick`, `onfocus`, e `onmouseenter`. Legando JavaScript fornito da terze parti ad uno di questi eventi, è un rischio per la sicurezza, pertanto andrebbe evitato.

:::attenzione
Javascript di terze parti non può mai venire considerato sicuro al 100% a meno che non è in un iframe di ambiente di sandbox o in una parte dell'app in cui solo l'utente che ha scritto quella parte di Javascript può essere esposto a rischio diretto.
:::

Alcune volte riceviamo report su come sia possibile fare scripting cross site (XSS) nei template di Vue. In generale, non si considerano casi del genere come vulnerabilità, perchè non c'è un modo pratico per proteggere gli sviluppatori da due scenari che possono permettere XSS:

1. Lo sviluppatore sta esplicitamente chiedendo a Vue di fare rendering di contenuto di terze parti non sicuro. Questo è decisamente non sicuro e non c'è modo per Vue per conoscerne l'origine.

2. Lo sviluppatore sta montando Vue su un intera pagina HTML che contiene contenuto di terze parti anche lato server. Questo è lo stesso problema del punto \#1, ma a volte gli sviluppatori possono incapparvi senza esserne consci. Ciò porta a possibili vulnerabilità dove chi attacca (a livello di sicurezza) fornisce HTML che sembra sicuro lato HTML ma non è sicuro come template Vue. La pratica migliore è **mai montare Vue su nodi che possono contenere contenuto di terze parti anche lato server**.

## Best Practices {#best-practices}

La regola generale è che se si permette di avere contenuto di terze parti non pulito (come HTML, CSS o JavaScript) ci si espone a delle vulnerabilità. Questa regola è da applicarsi non solo a Vue.js ma anche ad altri framework o se non si utilizza nessun framework.

Beyond the recommendations made above for [Potential Dangers](#potential-dangers), we also recommend familiarizing yourself with these resources:

- [HTML5 scheda per la sicurezza](https://html5sec.org/)
- [Scheda di sicurezza di OWASP alla prevenzione per il Cross Site Scripting (XSS)](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

In seguito, si potrà utilizzare ciò che si è appreso per rivedere il sorgente delle proprie dipendenze, per evitare potenziali pattern dannosi, se alcuni di essi includono componenti di terze parti, o altri tipi di influenze che vengono renderizzati nel DOM.

## Coordinazione Backend {#backend-coordination}

Le vulnerabilità della sicurezza HTTP, come la contraffazione delle richieste cross-site (CSRF/XSRF) e l'inclusione di script cross-site (XSSI), sono principalmente monitorate dal backend, così che non siano una preoccupazione da parte di Vue. In ogni caso è sempre bene comunicare con il proprio backend per capire come interagire al meglio con le loro API, ad esempio inserire token CSRF all'interno dei submit dei form.

## Server-Side Rendering (SSR) {#server-side-rendering-ssr}

Ci sono ulteriori interessi di sicurezza quando si usa SSR, ci si raccomanda di seguire le best practices evidenziate all'interno [della nostra documentazione riguardo SSR](/guide/scaling-up/ssr) per evitare vulnerabilità.
