---
outline: deep
---

<script setup>
import SpreadSheet from './demos/SpreadSheet.vue'
</script>

# Reattività nel dettaglio {#reactivity-in-depth}

Una delle caratteristiche più distintive di Vue è il sistema di reattività "discreto" (unobtrusive). Lo stato del componente è costituito da oggetti JavaScript reattivi. Quando li modifichi, la vista si aggiorna. Rende la gestione dello stato semplice e intuitiva, ma è anche importante capire come funziona per evitare alcuni errori comuni. In questa sezione, approfondiremo alcuni dei dettagli al livello più profondo del sistema di reattività di Vue.

## Cos'è la reattività? {#what-is-reactivity}

Questo termine ricorre spesso nella programmazione in questi anni, ma cosa si intende esattamente? La reattività è un paradigma di programmazione che permette al componente di rispondere ai vari cambiamenti in modo dichiarativo. L’esempio canonico che le persone di solito mostrano, perché è fantastico, è un foglio di calcolo Excel:

<SpreadSheet />

Qui la cella A2 è definita tramite la formula `= A0 + A1` (puoi fare clic su A2 per visualizzare o modificare la formula), quindi il foglio di calcolo ci darà come risultato 3. Non ci sono sorprese. Ma se aggiorni A0 o A1, noterai che anche A2 si aggiorna automaticamente.

JavaScript di solito non funziona in questo modo. Dovendo scrivere qualcosa di simile in Javascript:

```js
let A0 = 1
let A1 = 2
let A2 = A0 + A1

console.log(A2) // 3

A0 = 2
console.log(A2) // Resta 3
```

Quando mutiamo `A0`, `A2` non cambia automaticamente.

Quindi come si fa a fare in JavaScript? Per prima cosa, per eseguire nuovamente il codice che aggiorna `A2`, racchiudiamolo in una funzione:

```js
let A2

function update() {
  A2 = A0 + A1
}
```

Poi, dobbiamo definire alcuni termini:

- La funzione `update()` produce un **effetto collaterale**, o per brevità **effetto**, poiché modifica lo stato del programma.

- `A0` e `A1` sono considerate **dipendenze** dell'effetto, in quanto i loro valori sono utilizzati per eseguire l'effetto stesso. L'effetto di fatto **si mette in ascolto** (subscriber) del cambiamento delle sue dipendenze.

Abbiamo bisogno di una funzione che possa invocare `update()` (l'**effetto**) ogni volta che `A0` o `A1` (le **dipendenze**) cambiano:

```js
whenDepsChange(update)
```

I compiti di questa funzione `whenDepsChange()` sono:

1. Tracciare quando viene letta una variabile. Ad esempio quando si valuta l'espressione `A0 + A1`, vengono letti sia`A0` che `A1`.

2. Se una variabile viene letta quando c'è un effetto in esecuzione, rendere quell'effetto un sottoscrittore di quella variabile. Ad esempio, poiché `A0` e `A1` vengono letti quando `update()` viene eseguito, `update()` diventa un subscriber sia di `A0` che di `A1` dopo la prima esecuzione.

3. Rilevare quando una variabile viene modificata. Ad esempio quando ad `A0` viene assegnato un nuovo valore, notificare a tutti gli effetti che la sottoscrivono di eseguire di nuovo la funzione.

## Come Funziona la Reattività in Vue {#how-reactivity-works-in-vue}

Non possiamo davvero tracciare la lettura e la scrittura di variabili locali come nell'esempio. Non c'è proprio nessun meccanismo per farlo in vanilla JavaScript. Quello che *possiamo* fare, però, è intercettare la lettura e la scrittura delle **proprietà dell'oggetto**.

Ci sono due modi per intercettare l'accesso alle proprietà in JavaScript: [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) / [setters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set) e [Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). Vue 2 usava i getter e i setter esclusivamente a causa di limitazioni date dal supporto dei browser. In Vue 3, i Proxy sono usati per gli oggetti reattivi e i getter / setter sono usati per i refs. Ecco alcuni esempi in pseudo-codice che illustrano come funzionano:

```js{4,9,17,22}
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      track(target, key)
      return target[key]
    },
    set(target, key, value) {
      target[key] = value
      trigger(target, key)
    }
  })
}

function ref(value) {
  const refObject = {
    get value() {
      track(refObject, 'value')
      return value
    },
    set value(newValue) {
      value = newValue
      trigger(refObject, 'value')
    }
  }
  return refObject
}
```

:::tip
I frammenti di codice qui e sotto hanno lo scopo di spiegare i concetti fondamentali nel modo più semplice possibile, quindi molti dettagli vengono omessi e i casi limite ignorati.
:::

Questo spiega alcune [limitazioni degli oggetti reattivi](/guide/essentials/reactivity-fundamentals#limitations-of-reactive) che abbiamo discusso nella sezione "fondamenti delle reattività":

- Quando si assegna o si distrugge una proprietà di un oggetto reattivo a una variabile locale, l'accesso o l'assegnazione a quella variabile non è più attiva perché non attiva più i trigger get / set proxy sull'oggetto. Nota che questa "disconnessione" ha effetto solo sul binding delle variabili - se la variabile punta ad un valore non primitivo, come un oggetto, la mutazione dell'oggetto sarà comunque reattiva.

- Il valore proxy restituito dalla funzione `reactive()`, pur comportandosi esattamente come il valore originale, ha un'identità diversa se lo confrontiamo al valore originale usando l'operatore `===`.

All'interno del metodo `track()`, viene controllato se c'è un effetto in esecuzione. Se ce n'è uno, cerchiamo effetti sottoscritti (memorizzati in un Set) per la proprietà che si sta tracciando e aggiungiamo l'effetto al Set:

```js
// Questo sarà impostato appena prima che un effetto
// stia per essere eseguito. Ne parleremo più avanti.
let activeEffect

function track(target, key) {
  if (activeEffect) {
    const effects = getSubscribersForProperty(target, key)
    effects.add(activeEffect)
  }
}
```

Le sottoscrizioni degli effetti sono archiviate in una struttura dati globale `WeakMap<target, Map<key, Set<effect>>>`. Se non viene trovato alcun Set di effetti sottoscrittori per una determinata proprietà (tracciata per la prima volta), verrà creato. In sintesi questo è quello che fa la funzione `getSubscribersForProperty()`. Per semplicità verranno tralasciati i dettagli.

All'interno di `trigger()`, cerchiamo nuovamente gli effetti sottoscrittori per la proprietà. Ma questa volta li invochiamo nel seguente modo:

```js
function trigger(target, key) {
  const effects = getSubscribersForProperty(target, key)
  effects.forEach((effect) => effect())
}
```

Ora torniamo alla funzione `whenDepsChange()`:

```js
function whenDepsChange(update) {
  const effect = () => {
    activeEffect = effect
    update()
    activeEffect = null
  }
  effect()
}
```

La funzione `whenDepsChange()` racchiude la funzione `update` nativa in un effetto che imposta se stesso come l'effetto attualmente attivo prima di eseguire l'aggiornamento vero e proprio. Ciò abilita le chiamate `track()` durante l'aggiornamento per individuare l'effetto attivo corrente.

A questo punto, abbiamo creato un effetto che tiene traccia automaticamente delle sue dipendenze e viene eseguito nuovamente ogni volta che una dipendenza cambia. Lo chiamiamo **Effetto Reattivo**.

Vue fornisce un'API che ti consente di creare effetti reattivi: [`watchEffect()`](/api/reactivity-core#watcheffect). Difatti, potresti aver notato che funziona in modo abbastanza simile alla funzione `whenDepsChange()` riportata nell'esempio. Ora possiamo riscrivere l'esempio originale utilizzando le API Vue:

```js
import { ref, watchEffect } from 'vue'

const A0 = ref(0)
const A1 = ref(1)
const A2 = ref()

watchEffect(() => {
  // traccia A0 e A1
  A2.value = A0.value + A1.value
})

// Innesca l'effetto di cambiamento
A0.value = 2
```

Usare un effetto reattivo per mutare un riferimento (ref) non è un caso d'uso molto interessante - infatti, usare una proprietà calcolata (computed property) lo rende più dichiarativo:

```js
import { ref, computed } from 'vue'

const A0 = ref(0)
const A1 = ref(1)
const A2 = computed(() => A0.value + A1.value)

A0.value = 2
```

Internamente, `computed` gestisce la sua invalidazione e il ricalcolo utilizzando un effetto reattivo.

Allora qual potrebbe essere un esempio utile per un effetto reattivo? Bene, aggiornare il DOM! Possiamo implementare un semplice "rendering reattivo" in questo modo:

```js
import { ref, watchEffect } from 'vue'

const count = ref(0)

watchEffect(() => {
  document.body.innerHTML = `count is: ${count.value}`
})

// aggiorna il DOM
count.value++
```

In effetti, questo è abbastanza vicino al modo in cui un componente Vue mantiene sincronizzati lo stato e il DOM: ciascuna istanza di componente crea un effetto reattivo per eseguire il rendering e aggiornare il DOM. Naturalmente, i componenti Vue utilizzano modi molto più efficienti per aggiornare il DOM rispetto a `innerHTML`. Questo viene approfondito nella sezione [Meccanismo di rendering](./rendering-mechanism).

<div class="options-api">

Le API `ref()`, `computed()` e `watchEffect()` fanno tutte parte della Composition API. Se finora hai utilizzato Vue solo con le Options API, noterai che la Composition API è più vicina al modo in cui funziona il sistema di reattività di Vue. Infatti, in Vue 3 l'Options API è implementata utilizzando la Composition API. Tutti gli accessi alle proprietà sull'istanza del componente (`this`) attivano getter/setter per il monitoraggio della reattività e opzioni come `watch` e `computed` richiamano internamente i loro equivalenti nella Composition API.

</div>

## Reattività a runtime contro reattività in fase di compilazione {#runtime-vs-compile-time-reactivity}

Il sistema di reattività di Vue è principalmente basato sul runtime: il tracking e il triggering vengono tutti eseguiti mentre il codice viene eseguito direttamente nel browser. I vantaggi della reattività a runtime sono che può funzionare senza una fase di build e ci sono meno casi limite. D'altra parte, ciò rende il tutto limitato dai vincoli della sintassi JavaScript, portando alla necessità di avere dei contenitori dei valori come i refs di Vue.

Alcuni framework, come [Svelte](https://svelte.dev/), scelgono di superare tali limitazioni implementando la reattività durante la compilazione. Questo (Svelte), analizza e trasforma il codice per simulare la reattività. La fase di compilazione consente al framework di alterare la semantica di JavaScript stesso, ad esempio inserendo implicitamente codice che esegue l'analisi delle dipendenze e attiva l'effetto sull'accesso a variabili definite localmente. Lo svantaggio è che tali trasformazioni richiedono una fase di build e alterare la semantica di JavaScript significa essenzialmente creare un linguaggio che assomigli a JavaScript ma che diventata qualcos'altro.

Il team di Vue ha esplorato questa direzione tramite una funzionalità sperimentale chiamata [Reactivity Transform](/guide/extras/reactivity-transform), ma alla fine abbiamo deciso che non sarebbe stata adatta al progetto a causa [di alcuni ragionamenti espressi qui](https://github.com/vuejs/rfcs/discussions/369#discussioncomment-5059028).

## Debug della Reattività {#reactivity-debugging}

È fantastico che il sistema di reattività di Vue tenga traccia automaticamente delle dipendenze, ma in alcuni casi potremmo voler capire esattamente cosa viene tracciato o cosa sta causando il re-rendering di un componente.

### Hooks per il Debug dei Componenti {#component-debugging-hooks}

Possiamo eseguire il debug di quali dipendenze vengono utilizzate durante il rendering di un componente e quale dipendenza sta attivando un aggiornamento utilizzando lifecycle hooks, ovvero gli hook legati al ciclo di vita, <span class="options-api">`renderTracked`</span><span class="composition-api">`onRenderTracked`</span> e <span class="options-api">`renderTriggered`</span><span class="composition-api">`onRenderTriggered`</span>. Entrambi gli hook riceveranno un evento del debugger che contiene informazioni sulla dipendenza in questione. Si consiglia di inserire un'istruzione `debugger` nei callback per ispezionare in modo interattivo la dipendenza:

<div class="composition-api">

```vue
<script setup>
import { onRenderTracked, onRenderTriggered } from 'vue'

onRenderTracked((event) => {
  debugger
})

onRenderTriggered((event) => {
  debugger
})
</script>
```

</div>
<div class="options-api">

```js
export default {
  renderTracked(event) {
    debugger
  },
  renderTriggered(event) {
    debugger
  }
}
```

</div>

:::tip
Gli hook per il debug dei componenti funzionano solo in modalità di sviluppo.
:::

Gli oggetti associati all'evento evento di debug hanno la seguente interfaccia:

<span id="debugger-event"></span>

```ts
type DebuggerEvent = {
  effect: ReactiveEffect
  target: object
  type:
    | TrackOpTypes /* 'get' | 'has' | 'iterate' */
    | TriggerOpTypes /* 'set' | 'add' | 'delete' | 'clear' */
  key: any
  newValue?: any
  oldValue?: any
  oldTarget?: Map<any, any> | Set<any>
}
```

### Debug delle Computed {#computed-debugging}

<!-- TODO options API equivalent -->

Possiamo eseguire il debug delle proprietà calcolate passando a `computed()` un secondo oggetto con i callback `onTrack` e `onTrigger` come secondo argomento:

- `onTrack` verrà chiamato quando una proprietà reattiva o un riferimento (ref) viene tracciato come dipendenza.
- `onTrigger` verrà chiamato quando la callback del watcher viene attivata dalla modifica di una dipendenza.

Entrambe le callback riceveranno eventi di debug nel [medesimo formato](#debugger-event) degli hook per il debug dei componenti:

```js
const plusOne = computed(() => count.value + 1, {
  onTrack(e) {
    // si attiva quando count.value viene tracciato come dipendenza
    debugger
  },
  onTrigger(e) {
    // sia attiva quando count.value cambia
    debugger
  }
})

// accesso al valore plusOne, dovrebbe attivare onTrack
console.log(plusOne.value)

// cambiare il valore a count.value, dovrebbe attivare onTrigger
count.value++
```

:::tip
Le opzioni (computed options) `onTrack` e `onTrigger` funzionano solo in modalità sviluppo.
:::

### Debug degli Watcher {#watcher-debugging}

<!-- TODO options API equivalent -->

Similmente a `computed()`, gli osservatori (watcher) supportano anch'essi le opzioni `onTrack` e `onTrigger`:

```js
watch(source, callback, {
  onTrack(e) {
    debugger
  },
  onTrigger(e) {
    debugger
  }
})

watchEffect(callback, {
  onTrack(e) {
    debugger
  },
  onTrigger(e) {
    debugger
  }
})
```

:::tip
Le opzioni `onTrack` e `onTrigger` per gli osservatori (watcher) funzionano solo in modalità sviluppo.
:::

## Integrazione con gli External State Systems {#integration-with-external-state-systems}

Il sistema di reattività di Vue funziona convertendo profondamente semplici oggetti JavaScript in proxy reattivi. Questa conversione può non essere necessaria o talvolta indesiderata durante l'integrazione con sistemi di gestione dello stato esterni (ad esempio se una soluzione esterna utilizza anch'essa Proxies).

L'idea generale di integrare il sistema di reattività di Vue con una soluzione di gestione dello stato esterna è di mantenere in quest'ultimo in uno [`shallowRef`](/api/reactivity-advanced#shallowref). Uno shallow ref (riferimento superficiale) è reattivo solo quando si accede alla sua proprietà `.value`: il valore interno viene lasciato intatto. Quando lo stato esterno cambia, sostituisce il valore ref per attivare gli aggiornamenti.

### Immutabilità del dato {#immutable-data}

Se stai implementando una funzionalità di annullamento/ripristino, probabilmente vorrai acquisire un'istantanea dello stato dell'applicazione ad ogni modifica dell'utente. Tuttavia se l'alberatura dello stato è molto complessa il sistema di reattività mutabile di Vue non è il più adatto a questo scopo, poiché serializzare l'intero albero ad ogni aggiornamento può essere costoso in termini sia di CPU che di memoria.

Le [strutture di dati immutabili](https://en.wikipedia.org/wiki/Persistent_data_structure) risolvono questo problema non modificando mai gli oggetti dello stato: creano, invece, nuovi oggetti che condividono le stesse parti invariate degli stati precedenti. In Javascript esistono diversi modi per utilizzare i dati immutabili, ma noi consigliamo l'utilizzo di [Immer](https://immerjs.github.io/immer/) assieme a Vue perché ti consente di utilizzare dati immutabili mantenendo la sintassi più chiara e mantenibile.

Possiamo integrare Immer in un progetto Vue tramite un semplice composable:

```js
import produce from 'immer'
import { shallowRef } from 'vue'

export function useImmer(baseState) {
  const state = shallowRef(baseState)
  const update = (updater) => {
    state.value = produce(state.value, updater)
  }

  return [state, update]
}
```

[Prova nel Playground](https://play.vuejs.org/#eNplU8Fu2zAM/RXOlzpAYu82zEu67lhgpw3bJcrBs5VYqywJkpxmMPzvoyjZNRodbJF84iOppzH7ZkxxHXhWZXvXWGE8OO4H88iU6I22HkYYHH/ue25hgrPVPTwUpQh28dc9MAXAVKOV83AUnvduC4Npa8+fg3GCw3I8PwbwGD64vPCSV8Cy77y2Cn4PnGXbFGu1wpC36EPHRO67c78cD6fgVfgOiOB9gnMtXczA1GnDFFPnQTVeaAVeXy6SSsyFavltE/OvKs+pGTg8zsxkHwl9KgIBtvbhzkl0yIWU+zIOFEeJBgKNxORoAewHSX/cSQHX3VnbA8vyMXa3pfqxb0i1CRXZWZb6w1U1snYOT40JvQ4+NVI0Lxi865NliTisMRHChOVSNaUUscCSKtyXq7LRdP6fDNvYPw3G85vftbzRtg6TrUAKxXe+s3q4dF/mQdC5bJtFTe362qB4tELVURKWAthhNc87+OhSw2V33htXleWgzMulaHQfFfj0ufhYfCpb4XySJHc9Zv7a63aQqKh0+xNRR8kiZ1K2sYhqeBI1xVHPi+xdV0upX3/w8yJ8fCiIYIrfCLPIaZH4n9rxnx7nlQQVH4YLHpTLW8YV8A0W1Ye4PO7sZiU/ylFca4mSP8yl5yvv/O4sZcSmw8/iW8bXdSTcjDiFgUz/AcH6WZQ=)

### Macchina a stati {#state-machines}

Una [macchina a stati](https://en.wikipedia.org/wiki/Finite-state_machine) è un modello per descrivere tutti i possibili stati in cui può trovarsi un'applicazione e tutti i possibili modi in cui può passare da uno stato a un altro. Sebbene possa essere eccessivo per componenti semplici, può aiutare a rendere i flussi di stati complessi più robusti e gestibili.

Una delle più popolari implementazioni per creare una macchina a stati in JavaScript è [XState](https://xstate.js.org/). Ecco una composizione (composable) che si integra con esso:

```js
import { createMachine, interpret } from 'xstate'
import { shallowRef } from 'vue'

export function useMachine(options) {
  const machine = createMachine(options)
  const state = shallowRef(machine.initialState)
  const service = interpret(machine)
    .onTransition((newState) => (state.value = newState))
    .start()
  const send = (event) => service.send(event)

  return [state, send]
}
```

[Prova nel Playground](https://play.vuejs.org/#eNp1U81unDAQfpWRL7DSFqqqUiXEJumhyqVVpDa3ugcKZtcJjC1syEqId8/YBu/uIRcEM9/P/DGz71pn0yhYwUpTD1JbMMKO+o6j7LUaLMwwGvGrqk8SBSzQDqqHJMv7EMleTMIRgGOt0Fj4a2xlxZ5EsPkHhytuOjucbApIrDoeO5HsfQCllVVHUYlVbeW0xr2OKcCzHCwkKQAK3fP56fHx5w/irSyqbfFMgA+h0cKBHZYey45jmYfeqWv6sKLXHbnTF0D5f7RWITzUnaxfD5y5ztIkSCY7zjwKYJ5DyVlf2fokTMrZ5sbZDu6Bs6e25QwK94b0svgKyjwYkEyZR2e2Z2H8n/pK04wV0oL8KEjWJwxncTicnb23C3F2slabIs9H1K/HrFZ9HrIPX7Mv37LPuTC5xEacSfa+V83YEW+bBfleFkuW8QbqQZDEuso9rcOKQQ/CxosIHnQLkWJOVdept9+ijSA6NEJwFGePaUekAdFwr65EaRcxu9BbOKq1JDqnmzIi9oL0RRDu4p1u/ayH9schrhlimGTtOLGnjeJRAJnC56FCQ3SFaYriLWjA4Q7SsPOp6kYnEXMbldKDTW/ssCFgKiaB1kusBWT+rkLYjQiAKhkHvP2j3IqWd5iMQ+M=)

### RxJS {#rxjs}

[RxJS](https://rxjs.dev/) è una libreria per lavorare con flussi di eventi asincroni. La libreria [VueUse](https://vueuse.org/) fornisce il componente aggiuntivo [`@vueuse/rxjs`](https://vueuse.org/rxjs/readme.html) per connettere i flussi RxJS con il sistema reattivo di Vue.

## Connessione ai signals {#connection-to-signals}

Molti altri framework hanno introdotto moduli reattivi simili ai refs della Composition API di Vue, con il termine "signals":

- [Solid Signals](https://www.solidjs.com/docs/latest/api#createsignal)
- [Angular Signals](https://github.com/angular/angular/discussions/49090)
- [Preact Signals](https://preactjs.com/guide/v10/signals/)
- [Qwik Signals](https://qwik.builder.io/docs/components/state/#usesignal)

Fondamentalmente, i signals hanno lo stesso modello di reattività  dei refs di Vue. È un contenitore di valori che fornisce il monitoraggio delle dipendenze durate l'accesso e l'attivazione degli effetti collaterali di una mutazione. Questo paradigma basato sulla reattività di valori primitivi non è un concetto particolarmente nuovo nel mondo frontend: le prime implementazioni risalgono a più di dieci anni fa come [Knockout observables](https://knockoutjs.com/documentation/observables.html) e [Meteor Tracker]( https://docs.meteor.com/api/tracker.html). Anche l'Options API di Vue e la libreria di gestione dello stato React [MobX](https://mobx.js.org/) si basano sugli stessi principi, ma nascondono i modelli primitivi dietro le proprietà degli oggetti.

Sebbene non sia una caratteristica necessaria per definire qualcosa come signals, oggi questo concetto viene spesso discusso insieme al modello di rendering in cui gli aggiornamenti vengono eseguiti tramite piccole sottoscrizioni. Utilizzando il DOM virtuale (Virtual DOM), Vue attualmente [si affida ai compilatori per ottenere ottimizzazioni simili](/guide/extras/rendering-mechanism#compiler-informed-virtual-dom). Tuttavia, stiamo anche esplorando una nuova strategia di compilazione ispirata al framework Solid (Vapor Mode) che non si affida al DOM virtuale e sfrutta di più il sistema di reattività integrato di Vue.

### Compromessi nella progettazione API {#api-design-trade-offs}

Il design dei signals di Preact e Qwik è molto simile a quello di [shallowRef](/api/reactivity-advanced#shallowref) di Vue: tutti e tre forniscono un'interfaccia modificabile tramite la proprietà `.value`. Quindi concentreremo la discussione sui signals di Solid e Angolar.

#### I Signals di Solid {#solid-signals}

Il design dell'API `createSignal()` di Solid enfatizza la separazione di lettura e scrittura. I signals sono esposti come getter di sola lettura e di un setter separato:

```js
const [count, setCount] = createSignal(0)

count() // accesso al valore
setCount(1) // modifica del valore
```

Da notare come il signal `count` può essere utilizzato senza il setter. Ciò garantisce che lo stato non possa mai essere modificato a meno che anche il setter non sia esplicitamente esposto. Se questa garanzia di sicurezza giustifica o meno una sintassi più verbosa potrebbe dipendere dalle esigenze specifiche del progetto e dalle preferenze personali, ma se preferisci questo stile di API, è possibile replicarlo facilmente in Vue:

```js
import { shallowRef, triggerRef } from 'vue'

export function createSignal(value, options) {
  const r = shallowRef(value)
  const get = () => r.value
  const set = (v) => {
    r.value = typeof v === 'function' ? v(r.value) : v
    if (options?.equals === false) triggerRef(r)
  }
  return [get, set]
}
```

[Prova nel Playground](https://play.vuejs.org/#eNpdUk1TgzAQ/Ss7uQAjgr12oNXxH+ix9IAYaDQkMV/qMPx3N6G0Uy9Msu/tvn2PTORJqcI7SrakMp1myoKh1qldI9iopLYwQadpa+krG0TLYYZeyxGSojSSs/d7E8vFh0ka0YhOCmPh0EknbB4mPYfTEeqbIelD1oiqXPRQCS+WjoojAW8A1Wmzm1A39KYZzHNVYiUib85aKeCx46z7rBuySqQe6h14uINN1pDIBWACVUcqbGwtl17EqvIiR3LyzwcmcXFuTi3n8vuF9jlYzYaBajxfMsDcomv6E/m9E51luN2NV99yR3OQKkAmgykss+SkMZerxMLEZFZ4oBYJGAA600VEryAaD6CPaJwJKwnr9ldR2WMedV1Dsi6WwB58emZlsAV/zqmH9LzfvqBfruUmNvZ4QN7VearjenP4aHwmWsABt4x/+tiImcx/z27Jqw==)

#### I Signals di Angular {#angular-signals}

Angular sta subendo alcuni cambiamenti fondamentali abbandonando il dirty-checking e creando una propria implementazione di un modello reattivo. La Signal API di Angular si presenta così:

```js
const count = signal(0)

count() // accesso al valore
count.set(1) // imposto un nuovo valore 
count.update((v) => v + 1) // modifico il valore basandomi sul valore precedente

// modifica degli oggetti con la stessa identità
const state = signal({ count: 0 })
state.mutate((o) => {
  o.count++
})
```

Ancora una volta, possiamo facilmente replicare l'API in Vue:

```js
import { shallowRef, triggerRef } from 'vue'

export function signal(initialValue) {
  const r = shallowRef(initialValue)
  const s = () => r.value
  s.set = (value) => {
    r.value = value
  }
  s.update = (updater) => {
    r.value = updater(r.value)
  }
  s.mutate = (mutator) => {
    mutator(r.value)
    triggerRef(r)
  }
  return s
}
```

[Prova nel Playground](https://play.vuejs.org/#eNp9UslOwzAQ/ZVRLiRQEsqxpBUIvoADp0goTd3U4DiWl4AU5d8ZL3E3iZtn5r1Z3vOYvAiRD4Ykq6RUjaRCgyLaiE3FaSd6qWEERVteswU0fSeMJjuYYC/7Dm7youatYbW895D8S91UvOJNz5VGuOEa1oGePmRzYdebLSNYmRumaQbrjSfg8xYeEVsWfh/cBANNOsFqTTACKA/LzavrTtUKxjEyp6kssDZj3vygAPJjL1Bbo3XP4blhtPleV4nrlBuxw1npYLca4A6WWZU4PADljSQd4drRC8//rxfKaW+f+ZJg4oJbFvG8ZJFcaYreHL041Iz1P+9kvwAtadsS6d7Rm1rB55VRaLAzhvy6NnvDG01x1WAN5VTTmn3UzJAMRrudd0pa++LEc9wRpRDlHZT5YGu2pOzhWHAJWxvnakxOHufFxqx/4MxzcEinIYP+eV5ntOe5Rx94IYjopxOZUhnIEr+4xPMrjuG1LPFftkTj5DNJGhwYBZ4BJz3DV56FmJLpD1DrKXU=)

Rispetto ai refs di Vue, lo stile dell'API basato sui getter di Solid e Angular offre alcuni compromessi interessanti quando utilizzato nei componenti Vue:

- `()` è leggermente meno verboso di `.value`, ma l'aggiornamento del valore è più verboso.
- Non è previsto il ref-unwrapping: l'accesso ai valori richiede sempre `()`. Ciò rende l’accesso ad un valore consistente ovunque. Ciò significa anche che puoi trasmettere signals nativi come proprietà dei componenti.

Se questi stili di API siano adatti o meno ad un tuo caso d'uso è in una certa misura una scelta soggettiva. Il nostro obiettivo qui è dimostrare le somiglianze sottostanti e i compromessi tra questi diversi progetti di API. Vogliamo anche dimostrare che Vue è flessibile: non sei realmente vincolato alle API esistenti. Se necessario, puoi creare la tua funzione API per gestire la reattività così che soddisferai le tue esigenze specifiche.
