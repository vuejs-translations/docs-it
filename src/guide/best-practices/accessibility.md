# Accessibilità {#accessibility}

Accessibilità web (conosciuta anche come a11y) rimanda alla pratica di creare siti che possono essere fruiti da qualsiasi persona che sia: affetta da disabilità, connessione lenta (non performante) hardware difettoso o malfunzionante o semplicemente qualcuno in un ambiente sfavorevole per la fruizione di contenuti. Per esempio, aggiungere sottotitoli ad un video aiuterebbe sia utenti sordi o con problemi d'udito, o utenti che si trovano in un ambiente rumoroso e non possono ascoltare l'audio del loro telefono. In maniera simile, assicurarsi che il testo non abbia un contrasto troppo lieve, aiuterà sia utenti con problemi di vista ed utenti che stanno provando ad utilizzare il proprio telefono in un ambiente con luce elevata.

Pronti ad iniziare, ma da dove?

Uno sguardo a [Guida alla pianificazione e gestione dell'accessibilità web](https://www.w3.org/WAI/planning-and-managing/) messa a disposizione dal [World Wide Web Consortium (W3C)](https://www.w3.org/)

## Skip link {#skip-link}

Bisognerebbe aggiungere un link nella parte superiore di ogni pagina che porta direttamente all'area dove c'è il contenuto principale, in modo tale che gli utenti possono saltare contenuti che sono ripetuti su diverse pagine web.

Solitamente questo viene fatto nella parte superiore di `App.vue` e dovrà essere il primo elemento di focus su tutte le pagine:

```vue-html
<ul class="skip-links">
  <li>
    <a href="#main" ref="skipLink" class="skip-link">Vai al contenuto principale</a>
  </li>
</ul>
```

Per nascondere il link a meno che non vi è un focus su di esso, si può usare il seguente stile:

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

Una volta che l'utente cambia rotta, si può ripristinare il focus sullo skip link. Ciò può essere realizzato chiamando il focus sul ref del template dello skip link (ammesso che si stia utilizzando `vue-router`):

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

[Documentazione sullo skip link per i contenuti principali](https://www.w3.org/WAI/WCAG21/Techniques/general/G1.html)

## Struttura dei contenuti {#content-structure}

Uno dei più importanti pezzi dell'accessibilità è assicurarsi che il design supporti l'implementazione accessibile. Il design dovrebbe considerare non solo il contrasto dei colori, la selezione del font, grandezza dei caratteri, linguaggi, ma anche come i contenuti sono strutturati nell'applicazione (web).

### Titoli (Headings) {#headings}

Gli utenti possono navigare in un'applicazione attraverso i titoli. Avere titoli descrittivi per ogni sezione della propria applicazione fa si che gli utenti sappiano cosa aspettarsi del contenuto di ogni sezione. Quando si tratta dei titoli, ci sono alcune raccomandazioni riguardo le pratiche di accessibilità:

- Annidare i titoli nel loro ordine gerarchico: `<h1>` - `<h6>`
- Non saltare titoli all'interno di una sezione
- Utilizzare i tag di heading invece degli stili di testo per mostrare parvenza visiva dei titoli

[Di più riguardo agli headings](https://www.w3.org/TR/UNDERSTANDING-WCAG20/navigation-mechanisms-descriptive.html)

```vue-html
<main role="main" aria-labelledby="main-title">
  <h1 id="main-title">Titolo principale</h1>
  <section aria-labelledby="section-title-1">
    <h2 id="section-title-1"> Titolo di sezione </h2>
    <h3>Sottotitolo di sezione</h3>
    <!-- Contenuto -->
  </section>
  <section aria-labelledby="section-title-2">
    <h2 id="section-title-2"> Titolo di sezione </h2>
    <h3>Sottotitolo di Sezione</h3>
    <!-- Contenuto -->
    <h3>Sottotitolo di sezione</h3>
    <!-- Contenuto -->
  </section>
</main>
```

### Punti di riferimento (landmarks) {#landmarks}

[Landmarks - Punti di riferimento](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/landmark_role) forniscono accesso programmatico alle sezioni all'interno di un'applicazione. Utenti che si affidano a tecnologie d'assistenza possono passare ad ogni sezione dell'applicazione in modo da saltare contenuti. Si può fare uso degli [ARIA roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles) che permettono di realizzare tale scopo.

| HTML            | ARIA Role            | Scopo del Landmark                                                                                    |
| --------------- | -------------------- | ----------------------------------------------------------------------------------------------------- |
| header          | role="banner"        | Prime heading: titolo della pagina                                                                    |
| nav             | role="navigation"    | Assortimento di link utili nella navigazione del documento o di documenti affini.                     |
| main            | role="main"          | Il contenuto principale o centrale del documento.                                                     |
| footer          | role="contentinfo"   | Informazione riguardo il documento genitore: note del footer, copyright, link ad informative privacy. |
| aside           | role="complementary" | Supporta il contenuto principale, ma è separato da esso e significativo per il proprio contenuto.     |
| _Not available_ | role="search"        | Questa sezione contiene la funzionalità di ricerca per l'applicazione.                                |
| form            | role="form"          | Assortimento di elementi collegati a form                                                             |
| section         | role="region"        | Contenuto che è rilevante e a cui l'utente vorrà sicuramente accedere.                                |

:::tip Suggerimento:
Si consiglia l'utilizzo di elementi HTML di landmark con ruoli ridondanti in modo da massimizzare la compatibilità con la legacy [browsers che non supportano la semantica di HTML5](https://caniuse.com/#feat=html5semantic).
:::

[Leggi di più riguardo i landmarks](https://www.w3.org/TR/wai-aria-1.2/#landmark_roles)

## Form semantici {#semantic-forms}

Quando si crea un form, si possono usare i seguenti elementi: `<form>`, `<label>`, `<input>`, `<textarea>`, e `<button>`

Le labels sono generalmente piazzate in alto o a sinistra del campo del form:

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

Notare come si può includere `autocomplete='on'` sull'elemento del form e verrà applicato a tutti gli input all'interno del form stesso. Si può anche impostare [valori differenti per l'attributo di autocompilazione](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) per ogni input.

### Labels {#labels}

Le label permettono di descrivere il fine di tutti i form control; collegando `for` e `id`:

```vue-html
<label for="name">Name</label>
<input type="text" name="name" id="name" v-model="name" />
```

<!-- <common-codepen-snippet title="Form Label" slug="XWpaaaj" :height="265" tab="js,result" theme="light" :preview="false" :editable="false" /> -->

Se si ispeziona questo elemento negli strumenti di sviluppo di chrome e si apre il tab accessibilità, dentro il tab elementi, vedremo come input prende il suo nome dalla label:

![Chrome Developer Tools showing input accessible name from label](./images/AccessibleLabelChromeDevTools.png)

:::warning Attenzione:
Si può essere incappati in labels che avvolgono (wrappano) un input field in questo modo:

```vue-html
<label>
  Nome:
  <input type="text" name="name" id="name" v-model="name" />
</label>
```

Assegnare un id specifico alla label permette un supporto migliore dalle tecnologie assistive.
:::

#### `aria-label` {#aria-label}

Si può fornire all'input un nome accessibile con [`aria-label`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label).

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

Ispezioniamo questo elemento tramite gli strumenti di sviluppo di Chrome per vedere come il nome accessibile è cambiato:

![Chrome Developer Tools showing input accessible name from aria-label](./images/AccessibleARIAlabelDevTools.png)

#### `aria-labelledby` {#aria-labelledby}

Usare [`aria-labelledby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby) è simile ad `aria-label` fatta eccezzione che viene utilizzato se il testo della label è visibile sullo schermo. Si accoppia ad altri elementi tramite i loro `id` e si possono assegnare molteplici `id`:

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

[aria-describedby](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby) è utilizzato nello stesso modo di `aria-labelledby` fatta eccezzione che fornisce una descrizione con informazioni aggiuntive di cui l'utente potrebbe aver bisogno. Questo può essere utilizzato per descrivere i criteri per qualsiasi input:

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

Si può vedere la descrizione tramite l'ispezione degli strumenti di sviluppo di Chrome:

![Chrome Developer Tools showing input accessible name from aria-labelledby and description with aria-describedby](./images/AccessibleARIAdescribedby.png)

### Placeholder {#placeholder}

Evitiamo di usare placeholders siccome potrebbero confondere molti utenti.

Uno dei problemi con i placeholders è che non rispettano di default i [criteri del contrasto riguardo i colori](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html); aggiustando il contrasto del colore fa sembrare che il placeholder è pre-popolato con dati all'interno dell'input field. Guardando il seguente esempio, si può notare che il placeholder Last Name che rispetta i criteri di contrasto del colore, sembra avere l'input field già precompilato:

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

Sarebbe meglio fornire all'esterno di qualsiasi input, tutte le informazioni che l'utente necessita per riempire i form.

### Istruzioni {#instructions}

Quando si aggiungono le istruzioni per gli input field, si raccomanda di associarli correttamente all'input. Si possono fornire ulteriori istruzioni e legare più id all'interno di [`aria-labelledby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby). Questo permette anche un design più flessibile.

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
  <p id="date-instructions">MM/DD/YYYY</p>
</fieldset>
```

In alternativa si possono allegare le istruzioni all'input con [`aria-describedby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby):

```vue-html
<fieldset>
  <legend>Using aria-describedby</legend>
  <label id="dob" for="dob">Data di nascita:</label>
  <input type="date" name="dob" id="dob" aria-describedby="dob-instructions" />
  <p id="dob-instructions">MM/DD/YYYY</p>
</fieldset>
```

<!-- <common-codepen-snippet title="Form Instructions" slug="WNREEqv" :height="265" tab="js,result" theme="light" :preview="false" :editable="false" /> -->

### Nascondere contenuti {#hiding-content}

Di norma non è raccomandato nascondere visivamente le label, anche se l'input ha un nome accessibile. Tuttavia, se la funzionalità dell'input può essere compresa con contenuto circostante, si può nascondere la visualizzazione della label.

Guardiamo questo field di ricerca:

```vue-html
<form role="search">
  <label for="search" class="hidden-visually">Search: </label>
  <input type="text" name="search" id="search" v-model="search" />
  <button type="submit">Search</button>
</form>
```

Possiamo fare questo perchè il bottone di ricerca aiuterà visivamente gli utenti ad identificare l'obiettivo dell'input field.

Possiamo usare CSS per nascondere visivamente gli elementi, ma lasciarli disponibili per la tecnologia assistiva:

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

Adding `aria-hidden="true"` nasconderà l'elemento alla tecnologia assistiva, ma lo lascerà visualmente disponibile per altri utenti. Da non utilizzare su elementi di focus, elementi decorativi, contenuto duplicato oppure offscren.

```vue-html
<p>Questo non è nascosto dai lettori dello schermo.</p>
<p aria-hidden="true">Questo è nascosto dai lettori dello schermo.</p>
```

### Bottoni {#buttons}

Quando usiamo bottoni dentro un form, bisogna impostare il type (del bottone) per prevenire il submit del form stesso. Si può utilizzare un input per creare dei bottoni:

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

### Functional Images {#functional-images}

Si può usare questa tecnica per creare immagini funzionali.

- Input fields

  - Queste immagini si comporteranno come un bottone di tipo submit nei form.

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

Il consorzio del world wide web (W3C) e la Web Accessibility Initiative (WAI) sviluppano standard per l'accessibilità web per componenti differenti:

- [Linee guida per l'accessibilità dell'User Agent (UAAG)](https://www.w3.org/WAI/standards-guidelines/uaag/)
  - web browsers e media players, assieme ad alcuni aspetti delle tecnologie assistive.
- [Linee guida per l'accessibilità degli strumenti d'autore (ATAG)](https://www.w3.org/WAI/standards-guidelines/atag/)
  - strumenti per gli autori
- [Linee guida per l'accessibilità dei contenuti web (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/)
  - contenuti web - usati dagli sviluppatori, strumenti per gli autori, e strumenti per la valutazione dell'accessibilità

### Linee guida per l'accessibilità dei contenuti web (WCAG) {#web-content-accessibility-guidelines-wcag}

[WCAG 2.1](https://www.w3.org/TR/WCAG21/) approfondisce [WCAG 2.0](https://www.w3.org/TR/WCAG20/) e considera l'implementazione di nuove tecnologie indirizzando ai cambiamenti del web. Il W3C esorta all'uso delle più recenti versioni del WCAG quando si sviluppano o si aggiornano le politiche riguardo l'accessibilità web.

#### WCAG 2.1 Quattro importanti principi guida (acronimo inglese POUR): {#wcag-2-1-four-main-guiding-principles-abbreviated-as-pour}

- [Perceivable](https://www.w3.org/TR/WCAG21/#perceivable)
  - Gli utenti devono essere in grado di percepire le informazioni presentate
- [Operable](https://www.w3.org/TR/WCAG21/#operable)
  - Form di interfaccia, controlli e la navigazione sono fruibili
- [Understandable](https://www.w3.org/TR/WCAG21/#understandable)
  - Le informazioni e le operazioni delle interfacce utenti devono essere comprensibili a tutti gli utenti
- [Robust](https://www.w3.org/TR/WCAG21/#robust)
  - Gli utenti devono poter accedere ai contenuti nell'avanzare della tecnologia

#### Iniziative riguardo l'accessibilità web – Accessible Rich Internet Applications (WAI-ARIA) {#web-accessibility-initiative-–-accessible-rich-internet-applications-wai-aria}

W3C's WAI-ARIA forniscono delle linee guida su come sviluppare contenuto dinamico e controlli avanzati per interfacce utenti.

- [Accessible Rich Internet Applications (WAI-ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [WAI-ARIA pratiche d'autore 1.2](https://www.w3.org/TR/wai-aria-practices-1.2/)

## Risorse {#resources}

### Documentazione {#documentation}

- [WCAG 2.0](https://www.w3.org/TR/WCAG20/)
- [WCAG 2.1](https://www.w3.org/TR/WCAG21/)
- [Accessible Rich Internet Applications (WAI-ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [WAI-ARIA pratiche d'autore 1.2](https://www.w3.org/TR/wai-aria-practices-1.2/)

### Tecnologie Assistive {#assistive-technologies}

- Lettori dello schermo
  - [NVDA](https://www.nvaccess.org/download/)
  - [VoiceOver](https://www.apple.com/accessibility/mac/vision/)
  - [JAWS](https://www.freedomscientific.com/products/software/jaws/?utm_term=jaws%20screen%20reader&utm_source=adwords&utm_campaign=All+Products&utm_medium=ppc&hsa_tgt=kwd-394361346638&hsa_cam=200218713&hsa_ad=296201131673&hsa_kw=jaws%20screen%20reader&hsa_grp=52663682111&hsa_net=adwords&hsa_mt=e&hsa_src=g&hsa_acc=1684996396&hsa_ver=3&gclid=Cj0KCQjwnv71BRCOARIsAIkxW9HXKQ6kKNQD0q8a_1TXSJXnIuUyb65KJeTWmtS6BH96-5he9dsNq6oaAh6UEALw_wcB)
  - [ChromeVox](https://chrome.google.com/webstore/detail/chromevox-classic-extensi/kgejglhpjiefppelpmljglcjbhoiplfn?hl=en)
- Strumenti di Zooming
  - [MAGic](https://www.freedomscientific.com/products/software/magic/)
  - [ZoomText](https://www.zoomtext.com/)
  - [Magnifier](https://support.microsoft.com/en-us/help/11542/windows-use-magnifier-to-make-things-easier-to-see)

### Testing {#testing}

- Strumenti automatizzati
  - [Lighthouse](https://chrome.google.com/webstore/detail/lighthouse/blipmdconlkpinefehnmjammfjpmpbjk)
  - [WAVE](https://chrome.google.com/webstore/detail/wave-evaluation-tool/jbbplnpkjmmeebjpijfedlgcdilocofh)
  - [ARC Toolkit](https://chrome.google.com/webstore/detail/arc-toolkit/chdkkkccnlfncngelccgbgfmjebmkmce?hl=en-US)
- Strumenti per il colore
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

L'organizzazione mondiale della sanità stima che il 15% della popolazione mondiale ha qualche forma di disabilità, il 2-4% è affetto da disabilità grave. Il 15% della popolazione mondiale è circa un miliardo di persone. Questo dato fa delle persone affette da disabilità la minoranza più grande in tutto il mondo.

C'è un gran numero di disabilità, che possono essere divise in quattro categorie:

- _[Visive](https://webaim.org/articles/visual/)_ - Utenti che possono beneficiare dei lettori dello schermo, ingrandimento dello schermo, controllare il contrasto o display braille.
- _[Uditivo](https://webaim.org/articles/auditory/)_ - Utenti che possono beneficiare da video con sottotitoli, trascrizioni o linguaggio dei segni.
- _[Motorie](https://webaim.org/articles/motor/)_ - Utenti che possono beneficiare di un ampio assortimento di [tecnologie assistive per disabilità motorie](https://webaim.org/articles/motor/assistive): software di riconoscimento vocale, tracciamento visivo o altre tecnologie assistive riguardo le disabilità motorie.
- _[Cognitive](https://webaim.org/articles/cognitive/)_ - Questi utenti possono beneficiare di materiale audio/video supplementare, organizzazione strutturale dei contenuti, scrittura semplice e chiara.

Si può dare uno sguardo ai seguenti link di WebAim per capire la prospettiva da parte degli utenti:

- [Prospettive dell'accessibilità web: esploriamo l'impatto ed il beneficio per tutti](https://www.w3.org/WAI/perspective-videos/)
- [Storie di utenti web](https://www.w3.org/WAI/people-use-web/user-stories/)
