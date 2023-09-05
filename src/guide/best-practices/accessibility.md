# Accessibilità {#accessibilità}

L'accessibilità web (conosciuta anche come a11y) si riferisce alla pratica di creare siti web che possono essere utilizzati da chiunque: persone con disabilità, connessioni lente, hardware obsoleto o danneggiato o semplicemente persone in ambienti sfavorevoli. Ad esempio, aggiungere sottotitoli a un video aiuta sia gli utenti sordi che quelli con problemi di udito, sia gli utenti in ambienti rumorosi che non possono sentire il loro telefono. Allo stesso modo, assicurarsi che il testo non abbia un contrasto troppo basso aiuta sia gli utenti con bassa visione che gli utenti che cercano di utilizzare il loro telefono alla luce del sole.

Pronto a iniziare ma non sei sicuro da dove cominciare?

Consulta la [Guida alla pianificazione e gestione dell'accessibilità web](https://www.w3.org/WAI/planning-and-managing/) fornita dal [World Wide Web Consortium (W3C)](https://www.w3.org/)

## Skip link {#skip-link}

Dovresti aggiungere un link nella parte superiore di ogni pagina che vada direttamente all'area principale del contenuto in modo che gli utenti possano saltare il contenuto che si ripete su più pagine web.

Di solito questo viene fatto nella parte superiore di `App.vue`, poiché sarà il primo elemento selezionabile su tutte le tue pagine:

```vue-html
<ul class="skip-links">
  <li>
    <a href="#main" ref="skipLink" class="skip-link">Vai al contenuto principale</a>
  </li>
</ul>

```

Per nascondere il link a meno che non sia focalizzato, puoi aggiungere lo stile seguente:

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

Una volta che un utente cambia percorso, riporta il focus al link di salto. Puoi farlo chiamando il focus sul riferimento del template del link di salto (ipotizzando l'uso di 'vue-router'):

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

[Leggi la documentazione sul link di salto al contenuto principale](https://www.w3.org/WAI/WCAG21/Techniques/general/G1.html)

## Struttura del contenuto {#content-structure}

Uno dei fattori più importanti dell'accessibilità è assicurarsi che il design possa supportare un'implementazione accessibile. Il design dovrebbe considerare non solo il contrasto dei colori, la scelta del font, le dimensioni del testo e la lingua, ma anche come il contenuto è strutturato nell'applicazione.

### Headings {#headings}

Gli utenti possono navigare in un'applicazione attraverso le intestazioni. Avere intestazioni descrittive per ogni sezione della tua applicazione rende più facile per gli utenti prevedere il contenuto di ogni sezione. Per quanto riguarda le intestazioni, ci sono un paio di pratiche consigliate per l'accessibilità:

- Annida le intestazioni secondo il loro ordine gerarchico: `<h1>` - `<h6>`
- Non saltare le intestazioni all'interno di una sezione
- Usa tag di intestazione effettivi invece di stilizzare il testo per dare l'aspetto visivo delle intestazioni

[Leggi di più sulle intestazioni](https://www.w3.org/TR/UNDERSTANDING-WCAG20/navigation-mechanisms-descriptive.html)

```vue-html
<main role="main" aria-labelledby="main-title">
  <h1 id="main-title">Main title</h1>
  <section aria-labelledby="section-title-1">
    <h2 id="section-title-1"> Section Title </h2>
    <h3>Section Subtitle</h3>
    <!-- Content -->
  </section>
  <section aria-labelledby="section-title-2">
    <h2 id="section-title-2"> Section Title </h2>
    <h3>Section Subtitle</h3>
    <!-- Content -->
    <h3>Section Subtitle</h3>
    <!-- Content -->
  </section>
</main>
```

### Punti di riferimento {#landmarks}

I [Punti di riferimento](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/landmark_role) forniscono accesso programmabile alle sezioni all'interno di un'applicazione. Gli utenti che si affidano a tecnologie assistive possono navigare in ogni sezione dell'applicazione e saltare il contenuto. Puoi utilizzare  [ARIA roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles) to help you achieve this.

| HTML            | ARIA Role            | Scopo del punto di riferimento                                                                                   |
| --------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| header          | role="banner"        | Intestazione principale: titolo della pagina                                                                     |
| nav             | role="navigation"    | Raccolta di link adatta all'uso durante la navigazione del documento o di documenti correlati                    |
| main            | role="main"          | Il contenuto principale o centrale del documento                                                                 |
| footer          | role="contentinfo"   | Informazioni sul documento principale: note a piè di pagina/diritto d'autore/collegamenti alla                   |
|                                        | dichiarazione sulla privacy                                                                                      |
| aside           | role="complementary" | Supporta il contenuto principale, ma è separato e significativo di per sé                                        |
| _Not available_ | role="search"        | Questa sezione contiene la funzionalità di ricerca per l'applicazione                                            |
| form            | role="form"          | Raccolta di elementi associati al modulo                                                                         |
| section         | role="region"        | Contenuto rilevante e che gli utenti vorranno probabilmente navigare. Deve essere fornita                        |
|                 |                      | un'etichetta per questo elemento                                                                                 |

:::tip Suggerimento:
È consigliabile utilizzare elementi HTML di landmark con attributi di ruolo di landmark ridondanti al fine di massimizzare la compatibilità con i [browser legacy che non supportano gli elementi semantici HTML5].(https://caniuse.com/#feat=html5semantic).
:::

[Leggi di più sui landmark](https://www.w3.org/TR/wai-aria-1.2/#landmark_roles)

## Moduli Semantici {#semantic-forms}

Nella creazione di un modulo, è possibile utilizzare gli elementi seguenti:  `<form>`, `<label>`, `<input>`, `<textarea>`, e `<button>`

Di solito, le etichette vengono posizionate sopra o a sinistra dei campi del modulo:

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
  <button type="submit">Submit</button>
</form>
```

<!-- <common-codepen-snippet title="Simple Form" slug="dyNzzWZ" :height="368" tab="js,result" theme="light" :preview="false" :editable="false" /> -->

Nota come è possibile includere `autocomplete='on'` sull'elemento del modulo e si applicherà a tutti gli input nel tuo modulo. Puoi anche impostare valori diversi per l'attributo di [autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) per ogni input.

### Label {#labels}

Fornire etichette per descrivere lo scopo di tutti i controlli del modulo; collegare `for` e `id`:

```vue-html
<label for="name">Name</label>
<input type="text" name="name" id="name" v-model="name" />
```

<!-- <common-codepen-snippet title="Form Label" slug="XWpaaaj" :height="265" tab="js,result" theme="light" :preview="false" :editable="false" /> -->

Se ispezioni questo elemento nei Chrome Developer Tools e apri la scheda Accessibilità all'interno della scheda Elementi, vedrai come l'input ottiene il suo nome dall'etichetta:

![Chrome Developer Tools showing input accessible name from label](./images/AccessibleLabelChromeDevTools.png)

:::warning Warning:
Anche se hai visto etichette che uniscono i campi di input in questo modo:

```vue-html
<label>
  Name:
  <input type="text" name="name" id="name" v-model="name" />
</label>
```

Impostare esplicitamente le etichette con un id corrispondente è meglio supportato dalla tecnologia assistiva.
:::

#### `aria-label` {#aria-label}

È possibile dare all'input un nome accessibile con [`aria-label`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label).

```vue-html
<label for="name">Name</label>
<input
  type="text"
  name="name"
  id="name"
  v-model="name"
  :aria-label="nameLabel"
/>
```

<!-- <common-codepen-snippet title="Form ARIA label" slug="NWdvvYQ" :height="265" tab="js,result" theme="light" :preview="false" :editable="false" /> -->

Sentiti libero di ispezionare questo elemento in Chrome DevTools per vedere come il nome accessibile è cambiato:

![Chrome Developer Tools showing input accessible name from aria-label](./images/AccessibleARIAlabelDevTools.png)

#### `aria-labelledby` {#aria-labelledby}

L'utilizzo di [`aria-labelledby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby) è simile a `aria-label` ranne che viene utilizzato se il testo dell'etichetta è visibile sullo schermo. È abbinato ad altri elementi dai loro `id` e puoi collegare più `id`:

```vue-html
<form
  class="demo"
  action="/dataCollectionLocation"
  method="post"
  autocomplete="on"
>
  <h1 id="billing">Billing</h1>
  <div class="form-item">
    <label for="name">Name:</label>
    <input
      type="text"
      name="name"
      id="name"
      v-model="name"
      aria-labelledby="billing name"
    />
  </div>
  <button type="submit">Submit</button>
</form>
```

<!-- <common-codepen-snippet title="Form ARIA labelledby" slug="MWJvvBe" :height="265" tab="js,result" theme="light" :preview="false" :editable="false" /> -->

![Chrome Developer Tools showing input accessible name from aria-labelledby](./images/AccessibleARIAlabelledbyDevTools.png)

#### `aria-describedby` {#aria-describedby}

[aria-describedby](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby) è utilizzato allo stesso modo di  `aria-labelledby` tranne che fornisce una descrizione con informazioni aggiuntive che l'utente potrebbe aver bisogno. Questo può essere utilizzato per descrivere i criteri per qualsiasi input:

```vue-html
<form
  class="demo"
  action="/dataCollectionLocation"
  method="post"
  autocomplete="on"
>
  <h1 id="billing">Billing</h1>
  <div class="form-item">
    <label for="name">Full Name:</label>
    <input
      type="text"
      name="name"
      id="name"
      v-model="name"
      aria-labelledby="billing name"
      aria-describedby="nameDescription"
    />
    <p id="nameDescription">Please provide first and last name.</p>
  </div>
  <button type="submit">Submit</button>
</form>
```

<!-- <common-codepen-snippet title="Form ARIA describedby" slug="gOgxxQE" :height="265" tab="js,result" theme="light" :preview="false" :editable="false" /> -->

Puoi vedere la descrizione ispezionando Chrome DevTools:

![Chrome Developer Tools showing input accessible name from aria-labelledby and description with aria-describedby](./images/AccessibleARIAdescribedby.png)

### Placeholder {#placeholder}

Evita di utilizzare i placeholder poiché possono confondere molti utenti.

Uno dei problemi con i placeholder è che di default non soddisfano i [criteri di contrasto dei colori](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html); correggendo il contrasto dei colori, il segnaposto sembra essere dati preimpostati nei campi di input. Guardando l'esempio seguente, puoi vedere che il segnaposto "Cognome" che soddisfa i criteri di contrasto dei colori sembra essere dati preimpostati:

![Accessible placeholder](./images/AccessiblePlaceholder.png)

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
  <button type="submit">Submit</button>
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

È meglio fornire tutte le informazioni necessarie per riempire i moduli al di fuori di eventuali input.

### Istruzioni {#instructions}

Quando si aggiungono istruzioni per i campi di input, assicurarsi di collegarle correttamente all'input.
È possibile fornire istruzioni aggiuntive e collegare più id all'interno di un [`aria-labelledby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby). Questo consente un design più flessibile.

```vue-html
<fieldset>
  <legend>Using aria-labelledby</legend>
  <label id="date-label" for="date">Current Date:</label>
  <input
    type="date"
    name="date"
    id="date"
    aria-labelledby="date-label date-instructions"
  />
  <p id="date-instructions">MM/DD/YYYY</p>
</fieldset>
```

In alternativa, è possibile allegare le istruzioni all'input con [`aria-describedby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby):

```vue-html
<fieldset>
  <legend>Using aria-describedby</legend>
  <label id="dob" for="dob">Date of Birth:</label>
  <input type="date" name="dob" id="dob" aria-describedby="dob-instructions" />
  <p id="dob-instructions">MM/DD/YYYY</p>
</fieldset>
```

<!-- <common-codepen-snippet title="Form Instructions" slug="WNREEqv" :height="265" tab="js,result" theme="light" :preview="false" :editable="false" /> -->

### Contenuti nascosti {#hiding-content}

Di solito non è consigliabile nascondere visualmente le etichette, anche se l'input ha un nome accessibile. Tuttavia, se la funzionalità dell'input può essere compresa con il contenuto circostante, è possibile nascondere l'etichetta visiva.

Guardiamo questo campo di ricerca:

```vue-html
<form role="search">
  <label for="search" class="hidden-visually">Search: </label>
  <input type="text" name="search" id="search" v-model="search" />
  <button type="submit">Search</button>
</form>
```

Possiamo farlo perché il pulsante di ricerca aiuterà gli utenti  a identificare lo scopo del campo di input.

Possiamo utilizzare CSS per nascondere visualmente gli elementi ma mantenerli disponibili per la tecnologia assistiva:

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

L'aggiunta di  `aria-hidden="true"` nasconderà l'elemento dalla tecnologia assistiva ma lo lascerà visibile per gli altri utenti. Non utilizzarlo su elementi focalizzabili, solo su contenuti decorativi, duplicati o fuori schermo.

```vue-html
<p>This is not hidden from screen readers.</p>
<p aria-hidden="true">This is hidden from screen readers.</p>
```

### Bottoni {#buttons}

Quando si utilizzano pulsanti all'interno di un modulo, è necessario impostare il tipo per impedire l'invio del modulo.
È anche possibile utilizzare un input per creare pulsanti:

```vue-html
<form action="/dataCollectionLocation" method="post" autocomplete="on">
  <!-- Buttons -->
  <button type="button">Cancel</button>
  <button type="submit">Submit</button>

  <!-- Input buttons -->
  <input type="button" value="Cancel" />
  <input type="submit" value="Submit" />
</form>
```

<!-- <common-codepen-snippet title="Form Buttons" slug="JjEyrYZ" :height="467" tab="js,result" theme="light" :preview="false" :editable="false" /> -->

### Immagini funzionali {#functional-images}

È possibile utilizzare questa tecnica per creare immagini funzionali.

- Campi di input

 - Queste immagini fungeranno da pulsante di invio nei moduli

  ```vue-html
  <form role="search">
    <label for="search" class="hidden-visually">Search: </label>
    <input type="text" name="search" id="search" v-model="search" />
    <input
      type="image"
      class="btnImg"
      src="https://img.icons8.com/search"
      alt="Search"
    />
  </form>
  ```

- Icone

```vue-html
<form role="search">
  <label for="searchIcon" class="hidden-visually">Search: </label>
  <input type="text" name="searchIcon" id="searchIcon" v-model="searchIcon" />
  <button type="submit">
    <i class="fas fa-search" aria-hidden="true"></i>
    <span class="hidden-visually">Search</span>
  </button>
</form>
```

<!-- <common-codepen-snippet title="Functional Images" slug="jOyLGqM" :height="265" tab="js,result" theme="light" :preview="false" :editable="false" /> -->

## Standards {#standards}

Il World Wide Web Consortium (W3C) Web Accessibility Initiative (WAI) sviluppa gli standard di accessibilità Web per i diversi componenti:


- [User Agent Accessibility Guidelines (UAAG)](https://www.w3.org/WAI/standards-guidelines/uaag/)
  - browser web e lettori multimediali, compresi alcuni aspetti delle tecnologie assistive
- [Authoring Tool Accessibility Guidelines (ATAG)](https://www.w3.org/WAI/standards-guidelines/atag/)
  - strumenti di autore per lo sviluppo di contenuti web
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/)
  - contenuto web - utilizzato da sviluppatori, strumenti di autore e strumenti di valutazione dell'accessibilità

### Web Content Accessibility Guidelines (WCAG) {#web-content-accessibility-guidelines-wcag}

[WCAG 2.1](https://www.w3.org/TR/WCAG21/) estende [WCAG 2.0](https://www.w3.org/TR/WCAG20/) e consente l'implementazione di nuove tecnologie affrontando i cambiamenti nel web. Il W3C incoraggia l'uso della versione più recente di WCAG durante lo sviluppo o l'aggiornamento delle politiche di accessibilità Web.

## Quattro Principi Guida Principali di WCAG 2.1 (abbreviati come POUR):

- [Percepibile](https://www.w3.org/TR/WCAG21/#perceivable)
  - Gli utenti devono essere in grado di percepire le informazioni presentate.
- [Operabile](https://www.w3.org/TR/WCAG21/#operable)
  - Le forme dell'interfaccia, i controlli e la navigazione devono essere operabili.
- [Comprensibile](https://www.w3.org/TR/WCAG21/#understandable)
  - Le informazioni e il funzionamento dell'interfaccia utente devono essere comprensibili per tutti gli utenti.
- [Robusto](https://www.w3.org/TR/WCAG21/#robust)
  - Gli utenti devono essere in grado di accedere al contenuto mentre le tecnologie avanzano.

## Web Accessibility Initiative – Accessible Rich Internet Applications (WAI-ARIA):

Il WAI-ARIA del W3C fornisce indicazioni su come costruire contenuti dinamici e controlli avanzati dell'interfaccia utente.

- [Accessible Rich Internet Applications (WAI-ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [WAI-ARIA Authoring Practices 1.2](https://www.w3.org/TR/wai-aria-practices-1.2/)

## Risorse:

### Documentazione:

- [WCAG 2.0](https://www.w3.org/TR/WCAG20/)
- [WCAG 2.1](https://www.w3.org/TR/WCAG21/)
- [Accessible Rich Internet Applications (WAI-ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [WAI-ARIA Authoring Practices 1.2](https://www.w3.org/TR/wai-aria-practices-1.2/)

### Tecnologie Assistive:

- Lettori di Schermo
  - [NVDA](https://www.nvaccess.org/download/)
  - [VoiceOver](https://www.apple.com/accessibility/mac/vision/)
  - [JAWS](https://www.freedomscientific.com/products/software/jaws/?utm_term=jaws%20screen%20reader&utm_source=adwords&utm_campaign=All+Products&utm_medium=ppc&hsa_tgt=kwd-394361346638&hsa_cam=200218713&hsa_ad=296201131673&hsa_kw=jaws%20screen%20reader&hsa_grp=52663682111&hsa_net=adwords&hsa_mt=e&hsa_src=g&hsa_acc=1684996396&hsa_ver=3&gclid=Cj0KCQjwnv71BRCOARIsAIkxW9HXKQ6kKNQD0q8a_1TXSJXnIuUyb65KJeTWmtS6BH96-5he9dsNq6oaAh6UEALw_wcB)
  - [ChromeVox](https://chrome.google.com/webstore/detail/chromevox-classic-extensi/kgejglhpjiefppelpmljglcjbhoiplfn?hl=en)
- Strumenti di Ingrandimento
  - [MAGic](https://www.freedomscientific.com/products/software/magic/)
  - [ZoomText](https://www.zoomtext.com/)
  - [Magnifier](https://support.microsoft.com/en-us/help/11542/windows-use-magnifier-to-make-things-easier-to-see)

### Test:

- Strumenti Automatizzati
  - [Lighthouse](https://chrome.google.com/webstore/detail/lighthouse/blipmdconlkpinefehnmjammfjpmpbjk)
  - [WAVE](https://chrome.google.com/webstore/detail/wave-evaluation-tool/jbbplnpkjmmeebjpijfedlgcdilocofh)
  - [ARC Toolkit](https://chrome.google.com/webstore/detail/arc-toolkit/chdkkkccnlfncngelccgbgfmjebmkmce?hl=en-US)
- Strumenti per il Contrasto dei Colori
  - [WebAim Color Contrast](https://webaim.org/resources/contrastchecker/)
  - [WebAim Link Color Contrast](https://webaim.org/resources/linkcontrastchecker)
- Altri Strumenti Utili
  - [HeadingMap](https://chrome.google.com/webstore/detail/headingsmap/flbjommegcjonpdmenkdiocclhjacmbi?hl=en…)
  - [Color Oracle](https://colororacle.org)
  - [Focus Indicator](https://chrome.google.com/webstore/detail/focus-indicator/heeoeadndnhebmfebjccbhmccmaoedlf?hl=en-US…)
  - [NerdeFocus](https://chrome.google.com/webstore/detail/nerdefocus/lpfiljldhgjecfepfljnbjnbjfhennpd?hl=en-US…)
  - [Visual Aria](https://chrome.google.com/webstore/detail/visual-aria/lhbmajchkkmakajkjenkchhnhbadmhmk?hl=en-US)
  - [Simulatore di Accessibilità del Sito Web Silktide](https://chrome.google.com/webstore/detail/silktide-website-accessib/okcpiimdfkpkjcbihbmhppldhiebhhaf?hl=en-US)

### Utenti:

L'Organizzazione Mondiale della Sanità stima che il 15% della popolazione mondiale abbia una qualche forma di disabilità, di cui il 2-4% in modo grave. Questo corrisponde a circa 1 miliardo di persone in tutto il mondo, rendendo le persone con disabilità il più grande gruppo di minoranza al mondo.

Esistono una vasta gamma di disabilità, che possono essere divise approssimativamente in quattro categorie:

- [Visive](https://webaim.org/articles/visual/): questi utenti possono beneficiare dell'uso di lettori di schermo, ingrandimento dello schermo, controllo del contrasto dello schermo o display in braille.
- [Uditiva](https://webaim.org/articles/auditory/): questi utenti possono beneficiare di sottotitoli, trascrizioni o video in lingua dei segni.
- [Motorie](https://webaim.org/articles/motor/): questi utenti possono beneficiare di una serie di [tecnologie assistive per le disabilità motorie](https://webaim.org/articles/motor/assistive): software di riconoscimento vocale, tracciamento degli occhi, accesso a un solo pulsante, wand per la testa, interruttore sip e puff, mouse trackball oversize, tastiera adattiva o altre tecnologie assistive.
- [Cognitive](https://webaim.org/articles/cognitive/): questi utenti possono beneficiare di supporti multimediali supplementari, organizzazione strutturale del contenuto, scrittura chiara e semplice.

Controlla i seguenti link di WebAim per comprendere meglio le esigenze degli utenti:

- [Prospettive sull'Accessibilità Web: Esplora l'Impatto e i Benefici per Tutti](https://www.w3.org/WAI/perspective-videos/)
- [Storie degli Utenti Web](https://www.w3.org/WAI/people-use-web/user-stories/)
