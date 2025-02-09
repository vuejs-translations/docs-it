# Accessibilità {#accessibility}

L'accessibilità web (conosciuta anche come a11y) si riferisce alla pratica di creare siti web che possano essere usati da chiunque - che si tratti di un utente con disabilità, di una connessione lenta, di hardware obsoleto o malfunzionante o semplicemente di qualcuno in un ambiente sfavorevole. Ad esempio, aggiungere i sottotitoli a un video aiuterebbe sia gli utenti sordi e con problemi di udito, sia chi si trova in un ambiente rumoroso e non riesce a sentire l'audio. Allo stesso modo, assicurarsi che il testo non abbia un contrasto troppo basso aiuterà sia gli utenti con difficoltà visive sia chi usa il telefono sotto la luce del sole.

Pronto per iniziare ma non sai da dove?

Controlla la [Guida alla pianificazione e gestione dell'accessibilità web](https://www.w3.org/WAI/planning-and-managing/) fornita dal [World Wide Web Consortium (W3C)](https://www.w3.org/)

## Salta collegamento {#skip-link}

Dovresti aggiungere un collegamento all'inizio di ogni pagina che vada direttamente nell'area del contenuto principale in modo che le persone possano saltare il contenuto che è ripetuto su più pagine web

Tipicamente questo è fatto all'inizio di `App.vue` perchè sarà il primo elemento focalizzato in tutte le tue pagine:

```vue-html
<ul class="skip-links">
  <li>
    <a href="#main" ref="skipLink" class="skip-link">Vai al contenuto principale</a>
  </li>
</ul>
```

Per nascondere il collegamento salvo essere focalizzato, puoi aggiungere il seguente stile:

```css
.skip-link {
  white-space: nowrap;
  margin: 1em auto;
  top: 0;
  position: fixed;
  left: 50%;
  margin-left: -72px;
  opacity: 0;
}

.skip-link:focus {
  opacity: 1;
  background-color: white;
  padding: 0.5em;
  border: 1px solid black;
}
```

Una volta che la persona cambia percorso, riporta il focus al collegamento per saltare. Può essere ottenuto richiamando la focalizzazione sul ref del template del collegamento per saltare (ipotizzando l'uso di `vue-router`)

<div class="options-api">

```vue

<script>
  export default {
    watch: {
      $route() {
        this.$refs.skipLink.focus()
      }
    }
  }
</script>
```

</div>
<div class="composition-api">

```vue

<script setup>
  import { ref, watch } from 'vue'
  import { useRoute } from 'vue-router'

  const route = useRoute()
  const skipLink = ref()

  watch(
    () => route.path,
    () => {
      skipLink.value.focus()
    }
  )
</script>
```

</div>

[Leggi la documentazione sul collegamento per saltare al contenuto principale](https://www.w3.org/WAI/WCAG21/Techniques/general/G1.html)

## Struttura del contenuto {#content-structure}

Uno dei più importanti fattori dell'accessibilità è assicurarsi che il design possa supportare un'implementazione accessibile. Il design dovrebbe considerare non solo il contrasto dei colori, la scelta dei font, le dimensioni dei testi e la lingua, ma anche come il contenuto è strutturato nell'applicazione.

### Intestazioni {#headings}

Gli utenti possono navigare un'applicazione attraverso le intestazioni. Avere intestazioni descrittive per ogni sezione della tua applicazione rende più facile per gli utenti prevedere il contenuto di ogni sezione. Quando si parla di intestazioni, ci sono un paio di pratiche consigliate per l'accessibilità

- Annida le intestazioni secondo il loro ordine gerarchico: `<h1>` - `<h6>`
- Non saltare intestazioni all'interno di una sezione
- Usa i tag delle intestazioni invece di stilizzare il testo per dargli l'aspetto visivo delle intestazioni

[Leggi di più sulle intestazioni](https://www.w3.org/TR/UNDERSTANDING-WCAG20/navigation-mechanisms-descriptive.html)

```vue-html
<main role="main" aria-labelledby="main-title">
  <h1 id="main-title">Intestazione principale</h1>
  <section aria-labelledby="section-title-1">
    <h2 id="section-title-1"> Intestazione sezione </h2>
    <h3>Sotto-intestazione sezione</h3>
    <!-- Contenuto -->
  </section>
  <section aria-labelledby="section-title-2">
    <h2 id="section-title-2"> Intestazione sezione </h2>
    <h3>Sotto-intestazione sezione</h3>
    <!-- Contenuto -->
    <h3>Sotto-intestazione sezione</h3>
    <!-- Contenuto -->
  </section>
</main>
```

### Punti di riferimento {#landmarks}

I [punti di riferimento](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/landmark_role) forniscono accesso programmabile alle sezioni all'interno di un'applicazione. Gli utenti che si affidano a tecnologie assistive possono navigare ad ogni sezione dell'applicazione e saltarne il contenuto. Puoi usare gli [ARIA roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles) per aiutarti a raggiungere questo risultato.

| HTML            | ARIA Role            | Scopo del punto di riferimento                                                                                               |
|-----------------|----------------------|------------------------------------------------------------------------------------------------------------------------------|
| header          | role="banner"        | Intestazione principale: Titolo della pagina                                                                                 |
| nav             | role="navigation"    | Raccolta di collegamenti adatti all'uso durante la navigazione del documento o di documenti correlati                        |
| main            | role="main"          | Il contenuto principale o centrale di un documento                                                                           |
| footer          | role="contentinfo"   | Informazioni sul documento padre: note a piè di pagina/diritti d'autore/link alle informative sulla privacy                  |
| aside           | role="complementary" | Supporta il contenuto principale, ma è separato e significativo di per sè                                                    |
| _Not available_ | role="search"        | Questa sezione contiene la funzionalità di ricerca dell'applicazione                                                         |
| form            | role="form"          | Raccolta di elementi associati ai moduli                                                                                     |
| section         | role="region"        | Contenuto rilevante a cui gli utenti vorranno probabilmente accedere. È necessario fornire un'etichetta per questo elemento. |

:::tip Tip:
Si consiglia di usare elementi HTML per i punti di riferimento con un ridondante attributo role di punto di riferimento col fine di massimizzare la compatibilità con [browser legacy che non supportano gli elementi semantici di HTML5](https://caniuse.com/#feat=html5semantic).
:::

[Leggi di più sui punti di riferimento](https://www.w3.org/TR/wai-aria-1.2/#landmark_roles)

## Moduli semantici {#semantic-forms}

Quando si crea un modulo, puoi usare gli elementi seguenti: `<form>`, `<label>`, `<input>`, `<textarea>` e `<button>`

Le etichette sono solitamente posizionate sopra o a sinistra dei campi del modulo

```vue-html
<form action="/dataCollectionLocation" method="post" autocomplete="on">
  <div v-for="item in formItems" :key="item.id" class="form-item">
    <label :for="item.id">{{ item.label }}: </label>
    <input
      :type="item.type"
      :id="item.id"
      :name="item.id"
      v-model="item.value"
    />
  </div>
  <button type="submit">Invia</button>
</form>
```

<!-- <common-codepen-snippet title="Simple Form" slug="dyNzzWZ" :height="368" tab="js,result" theme="light" :preview="false" :editable="false" /> -->

Nota come puoi includere `autocomplete='on'` sull'elemento form e si applicherà a tutti gli input del tuo modulo. Puoi anche impostare diversi [valori per l'attributo autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete)per ogni input

### Etichette {#labels}

Fornisci etichette per descrivere lo scopo di tutti i campi del form, collegando `for` e `id`:

```vue-html
<label for="name">Nome</label>
<input type="text" name="name" id="name" v-model="name" />
```

<!-- <common-codepen-snippet title="Form Label" slug="XWpaaaj" :height="265" tab="js,result" theme="light" :preview="false" :editable="false" /> -->

Se ispezioni questo elemento con il tuo strumento per sviluppatori di chrome e apri il pannello Accessibilità dentro la tab Elementi, vedrai come l'input prende il suo nome dall'etichetta:

![Strumento per sviluppatori di Chrome mostra il nome accessibile dell'input dall'etichetta](./images/AccessibleLabelChromeDevTools.png)

:::warning Warning:
Potresti aver visto etichette che racchiudono i campi di input in questo modo:

```vue-html
<label>
  Nome:
  <input type="text" name="name" id="name" v-model="name" />
</label>
```

Impostare esplicitamente l'etichetta con un id corrispondente è meglio supportato dalle tecnologie assistive.
:::

#### `aria-label` {#aria-label}

Puoi anche dare all'input un nome accessibile con [`aria-label`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label).

```vue-html
<label for="name">Nome</label>
<input
  type="text"
  name="name"
  id="name"
  v-model="name"
  :aria-label="nameLabel"
/>
```

<!-- <common-codepen-snippet title="Form ARIA label" slug="NWdvvYQ" :height="265" tab="js,result" theme="light" :preview="false" :editable="false" /> -->

Sentiti libero di ispezionare questo elemento con lo strumento per sviluppatori di Chrome per vedere come il nome accessibile è cambiato:

![Strumento per sviluppatori di Chrome mostra il nome accessibile di un input dall'aria-label](./images/AccessibleARIAlabelDevTools.png)

#### `aria-labelledby` {#aria-labelledby}

L'utilizzo di [`aria-labelledby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby) è simile a quello di `aria-label`, eccetto che è usato se il testo dell'etichetta è visibile a schermo. È abbinato ad altri elementi dal loro `id` e puoi collegare più `id:

```vue-html
<form
  class="demo"
  action="/dataCollectionLocation"
  method="post"
  autocomplete="on"
>
  <h1 id="billing">Fatturazione</h1>
  <div class="form-item">
    <label for="name">Name:</label>
    <input
      type="text"
      name="name"
      id="name"
      v-model="name"
      aria-labelledby="nome fatturazione"
    />
  </div>
  <button type="submit">Invia</button>
</form>
```

<!-- <common-codepen-snippet title="Form ARIA labelledby" slug="MWJvvBe" :height="265" tab="js,result" theme="light" :preview="false" :editable="false" /> -->

![Chrome Developer Tools showing input accessible name from aria-labelledby](./images/AccessibleARIAlabelledbyDevTools.png)

#### `aria-describedby` {#aria-describedby}

[aria-describedby](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby) è usato allo stesso modo di `aria-labelledby`, eccetto che fornisce una descrizione con informazioni aggiuntive di cui l'utente potrebbe aver bisogno. Questo può essere utilizzato per descrivere i criteri per qualsiasi input:

```vue-html
<form
  class="demo"
  action="/dataCollectionLocation"
  method="post"
  autocomplete="on"
>
  <h1 id="billing">Fatturazione</h1>
  <div class="form-item">
    <label for="name">Nome completo:</label>
    <input
      type="text"
      name="name"
      id="name"
      v-model="name"
      aria-labelledby="nome fatturazione"
      aria-describedby="nameDescription"
    />
    <p id="nameDescription">Fornisci nome e cognome.</p>
  </div>
  <button type="submit">Invia</button>
</form>
```

<!-- <common-codepen-snippet title="Form ARIA describedby" slug="gOgxxQE" :height="265" tab="js,result" theme="light" :preview="false" :editable="false" /> -->

Puoi vedere la descrizione ispezionando lo strumento per sviluppatori di Chrome:

![Lo strumento per sviluppatori di Chrome mostra il nome accessibile dell'input dall'aria-labelledby e la descrizione con aria-describedby](./images/AccessibleARIAdescribedby.png)

### Segnaposto {#placeholder}

Evita di utilizzare i segnaposto perchè potrebbero confondere molti utenti.

Uno dei problemi con i segnaposto è il fatto che non raggiungono i [criteri di contrasto dei colori](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) di default; correggere il contrasto dei colori rende il segnaposto simile a un campo di input pre-popolato. Guardando l'esempio seguente, puoi vedere che il segnaposto del cognome che soddisfa i criteri di contrasto del colore assomiglia a un campo pre-popolato:

![Segnaposto accessibile](./images/AccessiblePlaceholder.png)

```vue-html
<form
  class="demo"
  action="/dataCollectionLocation"
  method="post"
  autocomplete="on"
>
  <div v-for="item in formItems" :key="item.id" class="form-item">
    <label :for="item.id">{{ item.label }}: </label>
    <input
      type="text"
      :id="item.id"
      :name="item.id"
      v-model="item.value"
      :placeholder="item.placeholder"
    />
  </div>
  <button type="submit">Invia</button>
</form>
```

```css
/* https://www.w3schools.com/howto/howto_css_placeholder.asp */

#lastName::placeholder {
  /* Chrome, Firefox, Opera, Safari 10.1+ */
  color: black;
  opacity: 1; /* Firefox */
}

#lastName:-ms-input-placeholder {
  /* Internet Explorer 10-11 */
  color: black;
}

#lastName::-ms-input-placeholder {
  /* Microsoft Edge */
  color: black;
}
```

È meglio fornire tutte le informazioni di cui l'utente ha bisogno per compilare il modulo fuori da tutti gli input.

### Istruzioni {#instructions}

Quando aggiungi istruzioni per i tuoi campi di input, assicurati che si colleghino correttamente all'input.
Puoi offrire informazioni aggiuntive e legare molteplici id dentro un [`aria-labelledby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby). Questo permette un design maggiormente flessibile

```vue-html
<fieldset>
  <legend>Usando aria-labelledby</legend>
  <label id="date-label" for="date">Data attuale:</label>
  <input
    type="date"
    name="date"
    id="date"
    aria-labelledby="date-label date-instructions"
  />
  <p id="date-instructions">DD/MM/YYYY</p>
</fieldset>
```

In alternativa, puoi allegare le istruzioni all'input con [`aria-describedby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby):

```vue-html
<fieldset>
  <legend>Usando aria-describedby</legend>
  <label id="dob" for="dob">Data di nascita:</label>
  <input type="date" name="dob" id="dob" aria-describedby="dob-instructions" />
  <p id="dob-instructions">DD/MM/YYYY</p>
</fieldset>
```

<!-- <common-codepen-snippet title="Form Instructions" slug="WNREEqv" :height="265" tab="js,result" theme="light" :preview="false" :editable="false" /> -->

### Nascondere contenuti {#hiding-content}

Di solito non è consigliato nascondere visivamente le etichette, anche se l'input ha un nome accessibile. Tuttavia, se la funzionalità dell'input può essere compresa con il contenuto circostante, allora possiamo nascondere visivamente l'etichetta.

Diamo uno sguardo a questo campo di ricerca:

```vue-html
<form role="search">
  <label for="search" class="hidden-visually">Cerca: </label>
  <input type="text" name="search" id="search" v-model="search" />
  <button type="submit">Cerca</button>
</form>
```

Possiamo fare questo perchè il bottone di ricerca aiuta visivamente l'utente a identificare lo scopo del campo di input.

Possiamo usare CSS per nascondere visivamente l'elemento ma mantenerlo disponibile per le tecnologie assistive:

```css
.hidden-visually {
  position: absolute;
  overflow: hidden;
  white-space: nowrap;
  margin: 0;
  padding: 0;
  height: 1px;
  width: 1px;
  clip: rect(0 0 0 0);
  clip-path: inset(100%);
}
```

<!-- <common-codepen-snippet title="Form Search" slug="QWdMqWy" :height="265" tab="js,result" theme="light" :preview="false" :editable="false" /> -->

#### `aria-hidden="true"` {#aria-hidden-true}

Aggiungere `aria-hidden="true"` nasconderà l'elemento alle tecnologie assistive ma lo lascerà visivamente accessibile per gli altri utenti. Non utilizzarlo su elementi focalizzabili, puramente decorativi, duplicati o contenuti fuori dallo schermo.

```vue-html
<p>Questo non è nascosto agli screen reader.</p>
<p aria-hidden="true">Questo è nascosto agli screen reader.</p>
```

### Bottoni {#buttons}

Quando usi bottoni all'interno di un modulo, devi impostare il tipo per prevenire l'invio del modulo
Puoi anche utilizzare un input per creare un pulsante:

```vue-html
<form action="/dataCollectionLocation" method="post" autocomplete="on">
  <!-- Bottoni -->
  <button type="button">Cancella</button>
  <button type="submit">Invia</button>

  <!-- Bottoni input -->
  <input type="button" value="Cancella" />
  <input type="submit" value="Invia" />
</form>
```

<!-- <common-codepen-snippet title="Form Buttons" slug="JjEyrYZ" :height="467" tab="js,result" theme="light" :preview="false" :editable="false" /> -->

### Immagini funzionali {#functional-images}

Puoi usare questa tecnica per creare immagini funzionali.

- Campi di input

  - Queste immagini agiranno come pulsante di invio nei moduli

  ```vue-html
  <form role="search">
    <label for="search" class="hidden-visually">Cerca: </label>
    <input type="text" name="search" id="search" v-model="search" />
    <input
      type="image"
      class="btnImg"
      src="https://img.icons8.com/search"
      alt="Cerca"
    />
  </form>
  ```

- Icone

```vue-html
<form role="search">
  <label for="searchIcon" class="hidden-visually">Cerca: </label>
  <input type="text" name="searchIcon" id="searchIcon" v-model="searchIcon" />
  <button type="submit">
    <i class="fas fa-search" aria-hidden="true"></i>
    <span class="hidden-visually">Cerca</span>
  </button>
</form>
```

<!-- <common-codepen-snippet title="Functional Images" slug="jOyLGqM" :height="265" tab="js,result" theme="light" :preview="false" :editable="false" /> -->

## Standard {#standards}

Il World Wide Web Consortium (W3C) Web Accessibility Initiative (WAI) sviluppa gli standard di accessibilità del web per i diversi componenti:

- [User Agent Accessibility Guidelines (UAAG)](https://www.w3.org/WAI/standards-guidelines/uaag/)
  - Browser web e lettori multimediali, inclusi alcuni aspetti delle tecnologie assistive
- [Authoring Tool Accessibility Guidelines (ATAG)](https://www.w3.org/WAI/standards-guidelines/atag/)
  - Strumenti di authoring
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/)
  - Contenuti web - usati dagli sviluppatori, strumenti di authoring e strumenti di valutazione dell'accessibilità

### Web Content Accessibility Guidelines (WCAG) {#web-content-accessibility-guidelines-wcag}

[WCAG 2.1](https://www.w3.org/TR/WCAG21/) si estende su [WCAG 2.0](https://www.w3.org/TR/WCAG20/) e permette l'implementazione di nuove tecnologie affrontando i cambiamenti del web. Il W3C incoraggia l'uso dell'ultima versione di WCAG quando si sviluppa o aggiorna le policy di accessibilità web.

#### WCAG 2.1 Quattro Principi Guida (abbreviati come POUR): {#wcag-2-1-four-main-guiding-principles-abbreviated-as-pour}

- [Perceivable(Percepibile)](https://www.w3.org/TR/WCAG21/#perceivable)
  - GLi utenti devono essere in grado di percepire le informazioni che gli sono presentate
- [Operable(Operabile)](https://www.w3.org/TR/WCAG21/#operable)
  - I moduli, controlli e la navigazione devono essere operabili
- [Understandable(Comprensibile)](https://www.w3.org/TR/WCAG21/#understandable)
  - Le informazioni e le operazioni delle interfacce devono essere comprensibili a tutti gli utenti
- [Robust(Robusto)](https://www.w3.org/TR/WCAG21/#robust)
  - Gli utenti devono essere in grado di accedere al contenuto con l'avanzare delle tecnologie

#### Web Accessibility Initiative – Accessible Rich Internet Applications (WAI-ARIA) {#web-accessibility-initiative-–-accessible-rich-internet-applications-wai-aria}

Il W3C WAI-ARIA fornisce guide su come costruire contenuti dinamici e controlli avanzati dell'interfaccia utente.

- [Accessible Rich Internet Applications (WAI-ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [Pratiche di creazione WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-practices-1.2/)

## Risorse {#resources}

### Documentazione {#documentation}

- [WCAG 2.0](https://www.w3.org/TR/WCAG20/)
- [WCAG 2.1](https://www.w3.org/TR/WCAG21/)
- [Accessible Rich Internet Applications (WAI-ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [Pratiche di creazione WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-practices-1.2/)

### Tecnologie assistive {#assistive-technologies}

- Lettori schermo
  - [NVDA](https://www.nvaccess.org/download/)
  - [VoiceOver](https://www.apple.com/accessibility/mac/vision/)
  - [JAWS](https://www.freedomscientific.com/products/software/jaws/?utm_term=jaws%20screen%20reader&utm_source=adwords&utm_campaign=All+Products&utm_medium=ppc&hsa_tgt=kwd-394361346638&hsa_cam=200218713&hsa_ad=296201131673&hsa_kw=jaws%20screen%20reader&hsa_grp=52663682111&hsa_net=adwords&hsa_mt=e&hsa_src=g&hsa_acc=1684996396&hsa_ver=3&gclid=Cj0KCQjwnv71BRCOARIsAIkxW9HXKQ6kKNQD0q8a_1TXSJXnIuUyb65KJeTWmtS6BH96-5he9dsNq6oaAh6UEALw_wcB)
  - [ChromeVox](https://chrome.google.com/webstore/detail/chromevox-classic-extensi/kgejglhpjiefppelpmljglcjbhoiplfn?hl=en)
- Strumenti di zoom
  - [MAGic](https://www.freedomscientific.com/products/software/magic/)
  - [ZoomText](https://www.zoomtext.com/)
  - [Magnifier](https://support.microsoft.com/en-us/help/11542/windows-use-magnifier-to-make-things-easier-to-see)

### Test {#testing}

- Tool automatici
  - [Lighthouse](https://chrome.google.com/webstore/detail/lighthouse/blipmdconlkpinefehnmjammfjpmpbjk)
  - [WAVE](https://chrome.google.com/webstore/detail/wave-evaluation-tool/jbbplnpkjmmeebjpijfedlgcdilocofh)
  - [ARC Toolkit](https://chrome.google.com/webstore/detail/arc-toolkit/chdkkkccnlfncngelccgbgfmjebmkmce?hl=en-US)
- Strumenti colore
  - [WebAim Color Contrast](https://webaim.org/resources/contrastchecker/)
  - [WebAim Link Color Contrast](https://webaim.org/resources/linkcontrastchecker)
- Altri strumenti utili
  - [HeadingMap](https://chrome.google.com/webstore/detail/headingsmap/flbjommegcjonpdmenkdiocclhjacmbi?hl=en…)
  - [Color Oracle](https://colororacle.org)
  - [Focus Indicator](https://chrome.google.com/webstore/detail/focus-indicator/heeoeadndnhebmfebjccbhmccmaoedlf?hl=en-US…)
  - [NerdeFocus](https://chrome.google.com/webstore/detail/nerdefocus/lpfiljldhgjecfepfljnbjnbjfhennpd?hl=en-US…)
  - [Visual Aria](https://chrome.google.com/webstore/detail/visual-aria/lhbmajchkkmakajkjenkchhnhbadmhmk?hl=en-US)
  - [Silktide Website Accessibility Simulator](https://chrome.google.com/webstore/detail/silktide-website-accessib/okcpiimdfkpkjcbihbmhppldhiebhhaf?hl=en-US)

### Utenti {#users}

L'Organizzazione Mondiale della Sanità (WHO) stima che il 15% della popolazione mondiale ha qualche forma di disabilità, il 2.4% di loro gravemente. Questo equivale a circa 1 miliardo di persone nel mondo, rendendo le persone con disabilità la più grande minoranza nel mondo.

Esiste una vasta gamma di disabilità, che può essere suddivisa approssimativamente in quattro categorie:

- _[Visiva](https://webaim.org/articles/visual/)_ - Questi utenti possono trarre vantaggio dai lettori di schermo, ingrandimento dello schermo, controllo del contrasto dello schermo o display in braille.
- _[Sonora](https://webaim.org/articles/auditory/)_ - Questi utenti possono trarre vantaggio dai sottotitoli, trascrizioni o video in linguaggio dei segni
- _[Motoria](https://webaim.org/articles/motor/)_ - Questi utenti possono trarre vantaggio da una serie di [tecnologie assistive per disabilità motorie](https://webaim.org/articles/motor/assistive): software per il riconoscimento vocale, tracciamento degli occhi, accesso a un solo pulsante, bacchetta per la testa, interrutori a soffio e aspirazione, mouse trackball ingranditi, tastiere adattive o altre tecnologie assistive.
- _[Cognitiva](https://webaim.org/articles/cognitive/)_ - Questi utenti possono trarre vantaggio da informazioni supplementari, organizzazione strutturata dei contenuti, scrittura semplice e chiara.

Dai un'occhiata ai link seguenti di WebAim per comprendere l'esperienza degli utenti:

- [Prospettive dell'accessibilità web: Esplora l'impatto e i benefici per tutti](https://www.w3.org/WAI/perspective-videos/)
- [Storie di utenti del web](https://www.w3.org/WAI/people-use-web/user-stories/)
