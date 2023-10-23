---
outline: deep
---

# FAQ sulla Composition API {#composition-api-faq}

:::tip
Queste FAQ presuppongono una precedente esperienza con Vue, in particolare l'esperienza con Vue 2 utilizzando principalmente le "Options API".
:::

## Cos'è la Composition API? {#what-is-composition-api}

<VueSchoolLink href="https://vueschool.io/lessons/introduction-to-the-vue-js-3-composition-api" title="Lezione gratuita di Composition API"/>

La Composition API è un insieme di API che ci consente di creare componenti Vue utilizzando funzioni importate invece di dichiarare opzioni. È un termine generico che include le seguenti API:

- [Reactivity API](/api/reactivity-core), es. `ref()` e `reactive()`, che consentono di creare direttamente un valore reattivo, computed property, o watcher.

- [Lifecycle Hooks](/api/composition-api-lifecycle), es. `onMounted()` e `onUnmounted()`, che consentono di istruire comportamenti all'interno del lifecycle delle componenti applicative.

- [Dependency Injection](/api/composition-api-dependency-injection), es. `provide()` e `inject()`, che consentono di sfruttare il sistema di dependency injection di Vue  durante l'utilizzo delle Reactivity API.

Composition API sono un insieme di feature incluse all'interno di Vue 3 e [Vue 2.7](https://blog.vuejs.org/posts/vue-2-7-naruto.html). Per le versioni più vecchie di Vue 2, utilizza il plugin ufficiale [`@vue/composition-api`](https://github.com/vuejs/composition-api). In Vue 3, è anche principalmente utilizzato assieme alla sintassi [`<script setup>`](/api/sfc-script-setup) nei "Single-File Components". Qui di seguito un semplice esempio di un componente che utilizza le Composition API:

```vue
<script setup>
import { ref, onMounted } from 'vue'

// Inizializza un valore reattivo
const count = ref(0)

// la funzione cambia il valore e notifica l'aggiornamento 
function increment() {
  count.value++
}

// lifecycle hooks
onMounted(() => {
  console.log(`Il valore iniziale è ${count.value}.`)
})
</script>

<template>
  <button @click="increment">Il valore è: {{ count }}</button>
</template>
```

Nonostante questo stile è basato sull'utilizzo di funzioni, la **Composition API NON è functional programming**. Composition API è basata sul paradigma di reattività mutevole a granularità fine di Vue, mentre la programmazione funzionale enfatizza l'immutabilità.

Se sei interessato a studiare come utilizzare Vue con la Composition API, puoi impostare la preferenza a Composition API su questa documentazione nella parte superiore della barra laterale sinistra, dopodiche segui la guida dall'inizio.

## Perché utilizzare la Composition API? {#why-composition-api}

### Migliore riutilizzo della logica {#better-logic-reuse}

Il primo vantaggio della composition API è quello di rendere la logica chiara, efficace e riutilizzabile in [funzioni componibili](/guide/reusability/composables). Questo risolve [tutti gli svantaggi dei mixin](/guide/reusability/composables#vs-mixins), il principale meccanismo per riutilizzare la logica con approccio Options API. 

La capacità di riutilizzare la logica della Composition API ha dato vita a progetti della community molto interessanti come [VueUse](https://vueuse.org/),una collezione di utility componibili in continua crescita. Serve anche come meccanismo per integrare facilmente e in modo pulito librerie o servizi di terze parti all'interno del "reactivity system" di Vue, ad esempio [dati immutabili](/guide/extras/reactivity-in-depth#immutable-data), [macchine a stati finiti](/guide/extras/reactivity-in-depth#state-machines) e [RxJS](/guide/extras/reactivity-in-depth#rxjs).

### Ancora più flessibilità nell'organizzazione del codice{#more-flexible-code-organization}

Molti sviluppatori amano che di default l'organizzazione del codice sfrutti le Options API: ogni cosa ha il suo posto in base all'opzione in cui rientra. D'altra parte però, Options API pone delle serie limitazioni quando una singola componente logica cresce oltre una certa soglia di complessità. Questo limite è particolarmente preponderante in componenti che utilizzano molteplici **logiche funzionali** (logic concerns), questo problema l'abbiamo visto più volte in molte applicazioni Vue 2.

Prendi come esempio il componente "folder explorer" dalla Vue CLI GUI: questo componente è responsabile per le seguenti logiche funzionali:

- Monitoraggio dello stato della cartella corrente e visualizzazione del suo contenuto
- Gestione della navigazione delle cartelle (apertura, chiusura, aggiornamento...)
- Gestione della creazione di nuove cartelle
- Mostra e nascondi solo le cartelle preferite
- Mostra e nascondi le cartelle nascoste
- Gestione delle modifiche alla directory di lavoro corrente

La [versione originale](https://github.com/vuejs/vue-cli/blob/a09407dd5b9f18ace7501ddb603b95e31d6d93c0/packages/@vue/cli-ui/src/components/folder/FolderExplorer.vue#L198-L404) del componente è stata scritta con le Options API. Se dovessimo dare a ogni linea di codice un colore basato sulle logiche funzionali scritte, questo è l'aspetto che avrebbe:

<img alt="versione precedente del componente" src="./images/options-api.png" width="129" height="500" style="margin: 1.2em auto">

Si noti come il codice che si occupa della stessa logica funzionale sia costretto a essere suddiviso in diverse options, localizzate in diverse parti del file. In un componente che ha centinaia di linee di codice, capire e navigare ogni singola logica funzionale richiede costantemente di scrollare su e giù, rendendolo la comprensione molto più difficoltosa di quanto dovrebbe essere. Inoltre, se vogliamo estrarre una logica funzionale esponendola come utility riutilizzabile, questo richiede un pò di lavoro per trovare ed estrarre i pezzi di codice posizionate in parti differenti del file.

Qui lo stesso componente, prima e dopo il [refactor tramite Composition API](https://gist.github.com/yyx990803/8854f8f6a97631576c14b63c8acd8f2e):

![versione refactor del componente](./images/composition-api-after.png)

Si noti come il codice relativo alla stessa logica funzionale può ora essere raggruppato: non abbiamo più bisogno di saltare tra blocchi di options mentre lavoriamo su una logica funzionale specifica. Infine, possiamo muovere un gruppo di codice in un file esterno con il minimo effort, poiché non abbiamo più bisogno di muoverci nel codice per estrarre la parte che ci interessa.  La riduzione degli impatti in caso di refactoring è la chiave per la manutenibilità a lungo termine in progetti molto complessi.

### Miglioramento della tipizzazione {#better-type-inference}

Negli ultimi anni, tanti sviluppatori frontend hanno adottato [TypeScript](https://www.typescriptlang.org/) poiché ci aiuta a scrivere codice più robusto, apportare modifiche con maggiore sicurezza e offre un'ottima esperienza di sviluppo tramite l'aiuto dell'IDE. Tuttavia, l'Options API, originariamente concepita nel 2013, è stata progettata senza tenere conto della tipizzazione. Abbiamo dovuto implementare qualche [magheggio complesso](https://github.com/vuejs/core/blob/44b95276f5c086e1d88fa3c686a5f39eb5bb7821/packages/runtime-core/src/componentPublicInstance.ts#L132-L165) per far funzionare la tipizzazione nella Options API. Anche con tutto questo sforzo, la tipizzazione nella Options API non è del tutto completa quando si usano mixin e dependency injection.

Ciò ha portato molti sviluppatori che volevano utilizzare Vue assieme a TypeScript a utilizzare un approccio costruito tramite Class API utilizzando la libreria `vue-class-component`. Tuttavia, un'API basata su classi fa molto affidamento sui decoratori ES (ECMAScript), una caratteristica del linguaggio che era solo una proposta di fase 2 quando Vue 3 è stato sviluppato nel 2019. Abbiamo ritenuto che fosse troppo rischioso basare un'API ufficiale su una proposta instabile. Da allora, la proposta dei decoratori ha subito un'altra revisione completa e ha finalmente raggiunto la fase 3 nel 2022. Inoltre, l'API basata sulla classe soffre nel riutilizzo della logica e ha limitazioni organizzative simili alle Options API.

In confronto, la Composition API utilizza principalmente variabili e funzioni semplici, che sono nativamente tipizzate. Il codice scritto nella Composition API può godere della tipizzazione completa con poca necessità di dichiarazioni manuali. La maggior parte delle volte, il codice della Composition API apparirà in gran parte identico in TypeScript e in semplice JavaScript. Ciò consente anche agli utenti JavaScript di trarre vantaggio dalla tipizzazione parziale.

### Pacchetto di produzione più piccolo e meno uso di risorse{#smaller-production-bundle-and-less-overhead}

Il codice scritto con la Composition API e `<script setup>` è anche più efficiente e facile da minimizzare rispetto all'equivalente scritto tramite Options API. Questo perché il template in un componente `<script setup>` è compilato come una funzione incorporata nello stesso ambito del codice `<script setup>`. A differenza dell'accesso alle proprietà da `this`, il codice del template compilato può accedere direttamente alle variabili dichiarate all'interno di `<script setup>`, senza necessità di un istanza proxy. Ciò porta anche a una migliore minificazione perché tutti i nomi delle variabili possono essere abbreviati in modo sicuro.

## Relazioni con Options API {#relationship-with-options-api}

### Compromessi {#trade-offs}

Alcuni utenti che arrivano dall'utilizzo delle Options API hanno trovato il codice prodotto tramite Composition API meno organizzato e hanno concluso che la Composition API è "peggiore" in termini di organizzazione del codice. Consigliamo agli utenti con tali opinioni di esaminare il problema da una prospettiva diversa.

È vero che la Composition API non fornisce più i "guard rail" che ti guidano a inserire il tuo codice in rispettivi "blocchi". Nonostante ciò, potrai creare i componenti con un codice molto simile al codice JavaScript nativo. Ciò significa che **puoi e dovresti applicare qualsiasi best practice per l'organizzazione del codice al tuo codice Composition API come faresti quando scrivi in JavaScript nativo**. Se riesci a scrivere JavaScript ben organizzato, dovresti anche essere in grado di scrivere codice ben organizzato tramite Composition API.

Le Options API ti consentono di "pensare meno" quando scrivi il codice del componente, motivo per cui molti utenti lo adorano. Tuttavia, pur riducendo il sovraccarico mentale, ti ingessa verso un modello di organizzazione del codice bloccato che non può essere cambiato, il che può rendere difficile il refactoring o migliorare la qualità del codice in grandi progetti. A questo proposito, la Composition API offre una migliore scalabilità a lungo termine.

### L'API Composition copre tutti i casi d'uso?{#does-composition-api-cover-all-use-cases}

Si, in termini di logica stateful. Quando si utilizza la Composition API, ci sono solo poche "options" che potrebbero essere ancora necessarie: `props`, `emits`, `name` e `inheritAttrs`.

:::tip

Dalla 3.3 puoi usare direttamente `defineOptions` in `<script setup>` per impostare il nome del componente o la proprietà `inheritAttrs`

:::

Se intendi utilizzare esclusivamente la Composition API (insieme alle opzioni sopra elencate), puoi eliminare alcuni kb dal tuo pacchetto di produzione tramite un [parametro a compile-time](https://github.com/vuejs/core/tree/main/packages/vue#bundler-build-feature-flags) che elimina il codice relativo alle Options API da Vue. Nota bene che questo influirà anche sui componenti Vue importati dalle dipendenze.

### Posso utilizzare entrambe le API nello stesso componente?{#can-i-use-both-apis-in-the-same-component}

Si. Puoi utilizzare la Composition API tramite la "option" [`setup()`](/api/composition-api-setup) in un componente che utilizza le Options API.

Tuttavia, ti consigliamo di farlo solo se disponi di un codice già presente basato su Options API che deve integrare nuove funzionalità / librerie esterne scritte con la Composition API.

### Le Options API verranno deprecate? {#will-options-api-be-deprecated}

No, non abbiamo alcun piano a riguardo. Le Options API è parte integrante di Vue e il motivo per cui molti sviluppatori lo adorano. Ci rendiamo anche conto che molti dei vantaggi della Composition API si manifestano solo in progetti molto grandi e le Option API rimangono una scelta solida per molte applicazioni con complessità medio-bassa.

## Relazione con Class API {#relationship-with-class-api}

Non consigliamo più di utilizzare Class API con Vue 3, dato che la Composition API offre un'ottima integrazione di TypeScript con ulteriori vantaggi per il riutilizzo della logica e l'organizzazione del codice.

## Comparazione con i React Hooks {#comparison-with-react-hooks}

La Composition API fornisce lo stesso livello di funzionalità per la composizione della logica dei React Hooks, ma con alcune importanti differenze.

Gli hook React vengono richiamati ripetutamente ogni volta che un componente si aggiorna. Ciò crea una serie di "situazioni" che possono confondere anche gli sviluppatori React più esperti. Porta anche a problemi di ottimizzazione delle prestazioni che possono influire gravemente sull'esperienza di sviluppo. Ecco alcuni esempi:

- Gli hook sono sensibili all'ordine di chiamata e non possono essere condizionali.

- Le variabili dichiarate in un componente React possono essere catturate da una "closure hook" e diventare "stantia" se lo sviluppatore non riesce a passare l'array delle dipendenze correttamente. Ciò porta gli sviluppatori di React a fare affidamento sulle regole ESLint per garantire che vengano passate le dipendenze corrette. Tuttavia, la regola spesso non è abbastanza da definirsi corretta, il che porta a inutili invalidazioni e mal di testa quando si incontrano casi limite.

- I calcoli costosi richiedono l'uso di `useMemo`, esso richiede nuovamente il passaggio manuale dell'array delle dipendenze.

- I "gestori di eventi" (Event handlers) passati ai componenti figlio causano aggiornamenti a quest'ultimo non necessari per impostazione predefinita e richiedono `useCallback` esplicito come ottimizzazione. Questo è quasi sempre necessario e richiede ancora una volta il passaggio delle dipendenze. Trascurare questo punto, porta l'applicazione ad eseguire il rendering eccessivo delle componenti e può causare problemi di prestazioni senza rendersene conto.

- Il problema della closure "stantia", combinato con le funzionalità Concurrent, rende difficile capire la ragione su quando un pezzo di codice viene eseguito, e rende poco pratico la gestione della mutabilità dello stato che dovrebbe persistere tra i rendering (tramite `useRef`).

Confronto con Vue Composition API:

- Richiama il codice `setup()` o `<script setup>` solo una volta. Questo fa sì che il codice sia più intuitivo nell'uso idiomatico di JavaScript in quanto non ci sono "closures" obsolete di cui preoccuparsi. Anche la Composition API non è sensibile all'ordine di chiamata e possono essere condizionali.

- Il sistema di reattività di Vue a runtime raccoglie automaticamente le dipendenze reattive utilizzate nelle proprietà calcolate (computed properties) e nei watcher, quindi non è necessario dichiarare manualmente le dipendenze.

- Non è necessario memorizzare manualmente nella cache le funzioni di callback per evitare aggiornamenti secondari non necessari. In generale, il sistema di reattività a grana fine di Vue garantisce che i componenti figlio si aggiornino solo quando necessario. Le ottimizzazioni manuali per gli aggiornamenti delle componenti figlio sono raramente utilizzate dagli sviluppatori Vue.

Riconosciamo la creatività di React Hooks, ed è una delle principali fonti di ispirazione per la Composition API. Tuttavia, i problemi sopra menzionati esistono nel suo design e abbiamo notato che il modello di reattività di Vue fornisce un modo per aggirarli.
