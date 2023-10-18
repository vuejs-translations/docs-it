# Reactivity API: Core {#reactivity-api-core}

:::info Vedi anche
Per comprendere meglio le API di reattività, si consiglia di leggere i seguenti capitoli nella guida:

- [Fondamenti della reattività](/guide/essentials/reactivity-fundamentals) (with the API preference set to Composition API)
- [Reattività approfondita](/guide/extras/reactivity-in-depth)
  :::

## ref() {#ref}

Prende un valore interno e restituisce un oggetto ref reattivo e modificabile, che ha una singola proprietà `.value` che punta al suo valore interno.

- **Tipo**

  ```ts
  function ref<T>(value: T): Ref<UnwrapRef<T>>

  interface Ref<T> {
    value: T
  }
  ```

- **Dettagli**

L'oggetto ref è mutevole, ovvero è possibile assegnare nuovi valori a `.value`. È anche reattivo, cioè tutte le operazioni di lettura su `.value` sono tracciate, e le operazioni di scrittura scateneranno gli effetti associati.

Se un oggetto viene assegnato come valore di un ref, l'oggetto viene reso profondamente reattivo con [reactive()](#reactive). Ciò significa anche che se l'oggetto contiene ref nidificati, saranno estratti profondamente.

Per evitare la conversione profonda, puoi usare [`shallowRef()`](./reactivity-advanced#shallowref).

- **Esempio**

  ```js
  const count = ref(0)
  console.log(count.value) // 0

  count.value++
  console.log(count.value) // 1
  ```

- **Vedi anche**
  - [Guide - Fondamenti della reattività con `ref()`](/guide/essentials/reactivity-fundamentals#ref)
  - [Guide - Tipizzazione `ref()`](/guide/typescript/composition-api#typing-ref) <sup class="vt-badge ts" />

## computed() {#computed}

Prende una funzione getter e restituisce un oggetto ref reattivo in sola lettura per il valore restituito dalla funzione getter. Può anche accettare un oggetto con funzioni `get` e `set` per creare un oggetto ref modificabile.

- **Tipo**

  ```ts
  // sola lettura
  function computed<T>(
    getter: () => T,
    // vedi "Computed Debugging" link sotto
    debuggerOptions?: DebuggerOptions
  ): Readonly<Ref<Readonly<T>>>

  // modificabile
  function computed<T>(
    options: {
      get: () => T
      set: (value: T) => void
    },
    debuggerOptions?: DebuggerOptions
  ): Ref<T>
  ```

- **Esempio**

  Creazione di un ref reattivo in sola lettura:

  ```js
  const count = ref(1)
  const plusOne = computed(() => count.value + 1)

  console.log(plusOne.value) // 2

  plusOne.value++ // errore
  ```

  Creazione di un ref modificabile:

  ```js
  const count = ref(1)
  const plusOne = computed({
    get: () => count.value + 1,
    set: (val) => {
      count.value = val - 1
    }
  })

  plusOne.value = 1
  console.log(count.value) // 0
  ```

  Debugging:

  ```js
  const plusOne = computed(() => count.value + 1, {
    onTrack(e) {
      debugger
    },
    onTrigger(e) {
      debugger
    }
  })
  ```

- **Vedi anche**
  - [Guide - Proprietà delle Computed](/guide/essentials/computed)
  - [Guide - Debug delle Computed](/guide/extras/reactivity-in-depth#computed-debugging)
  - [Guide - Tipizzazione `computed()`](/guide/typescript/composition-api#typing-computed) <sup class="vt-badge ts" />

## reactive() {#reactive}

Ritorna un proxy reattivo dell'oggetto.

- **Tipo**

  ```ts
  function reactive<T extends object>(target: T): UnwrapNestedRefs<T>
  ```

- **Dettagli**

La conversione reattiva è "profonda": influisce su tutte le proprietà nidificate. Un oggetto reattivo estrae 

 profondamente anche tutte le proprietà che sono [ref](#ref), mantenendone al contempo la reattività.

Va notato che non viene eseguito l'estrazione di ref quando il ref è acceduto come elemento di un array reattivo o di un tipo di collezione nativo come il `Map`.

Per evitare la conversione profonda e mantenere la reattività solo al livello root, usare [shallowReactive()](./reactivity-advanced#shallowreactive).

L'oggetto restituito e i suoi oggetti nidificati sono racchiusi con [ES Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) e **non** sono uguali agli oggetti originali. Si consiglia di lavorare esclusivamente con il proxy reattivo ed evitar di fare affidamento sull'oggetto originale.

- **Esempio**

  Creazione di un oggetto reattivo:

  ```js
  const obj = reactive({ count: 0 })
  obj.count++
  ```

  Estrazione del Ref:

  ```ts
  const count = ref(1)
  const obj = reactive({ count })

  // il ref verrà estratto
  console.log(obj.count === count.value) // true

  // sarà aggiornato `obj.count`
  count.value++
  console.log(count.value) // 2
  console.log(obj.count) // 2

  // sarà aggiornato anche il ref `count`
  obj.count++
  console.log(obj.count) // 3
  console.log(count.value) // 3
  ```

  Nota che i ref **non** vengono estratti quando vengono acceduti come elementi di un array o di una collezione:

  ```js
  const books = reactive([ref('Vue 3 Guide')])
  // serve .value qui
  console.log(books[0].value)

  const map = reactive(new Map([['count', ref(0)]]))
  // serve .value qui
  console.log(map.get('count').value)
  ```

Quando si assegna un [ref](#ref) a una proprietà `reactive`, tale ref verrà anche automaticamente estratto:

  ```ts
  const count = ref(1)
  const obj = reactive({})

  obj.count = count

  console.log(obj.count) // 1
  console.log(obj.count === count.value) // true
  ```

- **Vedi anche**
  - [Guide - Fondamenti della reattività](/guide/essentials/reactivity-fundamentals)
  - [Guide - Tipizzazione `reactive()`](/guide/typescript/composition-api#typing-reactive) <sup class="vt-badge ts" />

## readonly() {#readonly}

Prende un oggetto (reattivo o normale) o un [ref](#ref) e restituisce un proxy di sola lettura all'originale.

- **Tipo**

  ```ts
  function readonly<T extends object>(
    target: T
  ): DeepReadonly<UnwrapNestedRefs<T>>
  ```

- **Dettagli**

 Un proxy di sola lettura profondo: ogni proprietà nidificata a cui si accede sarà anch'essa di sola lettura. Ha anche lo stesso comportamento di estrazione dei ref di `reactive()`, tranne che i valori estratti saranno anch'essi resi di sola lettura.

Per evitare la conversione profonda, usare [shallowReadonly()](./reactivity-advanced#shallowreadonly).

- **Esempio**

  ```js
  const original = reactive({ count: 0 })

  const copy = readonly(original)

  watchEffect(() => {
    // funziona per il tracciamento della reattività
    console.log(copy.count)
  })

  // cambiare original attiverà i watcher che dipendono dalla copia
  original.count++

  // cambiare copy fallirà e produrrà un warning
  copy.count++ // warning!
  ```

## watchEffect() {#watcheffect}

Esegue immediatamente una funzione mentre traccia reattivamente le sue dipendenze e la ri-esegue ogni volta che le dipendenze vengono modificate.

- **Tipo**

  ```ts
  function watchEffect(
    effect: (onCleanup: OnCleanup) => void,
    options?: WatchEffectOptions
  ): StopHandle

  type OnCleanup = (cleanupFn: () => void) => void

  interface WatchEffectOptions {
    flush?: 'pre' | 'post' | 'sync' // default: 'pre'
    onTrack?: (event: DebuggerEvent) => void
    onTrigger?: (event: DebuggerEvent) => void
  }

  type StopHandle = () => void
  ```

- **Dettagli**

  Il primo argomento è la funzione d'effetto (effect) da eseguire. La funzione d'effetto riceve una funzione che può essere utilizzata per registrare una callback di pulizia (cleanup). La cleanup sarà chiamata esattamente prima della successiva esecuzione dell'effetto, e può essere utilizzata per ripulire effetti collaterali non validi, ad esempio una richiesta asincrona in sospeso (vedi esempio sotto).

  Il secondo argomento è un oggetto opzionale di opzioni che può essere utilizzato per regolare il timing di esecuzione dell'effetto o per eseguire il debug delle dipendenze dell'effetto.

  Per impostazione predefinita, i watcher vengono eseguiti poco prima del rendering del componente. Impostare `flush: 'post'` ritarderà l'esecuzione del watcher dopo il rendering del componente. Vedere [Callback Flush Timing](/guide/essentials/watchers#callback-flush-timing) per ulteriori informazioni. In casi rari, potrebbe essere necessario attivare immediatamente un watcher quando una dipendenza reattiva cambia, ad esempio per invalidare una cache. Si può fare usando `flush: 'sync'`. Questa impostazione, tuttavia, dovrebbe essere utilizzata con cautela, poiché può causare problemi di prestazioni e coerenza dei dati se più proprietà vengono aggiornate contemporaneamente.

  Il valore restituito è una funzione di gestione che può essere chiamata per interrompere l'esecuzione dell'effetto.

- **Esempio**

  ```js
  const count = ref(0)

  watchEffect(() => console.log(count.value))
  // -> logs 0

  count.value++
  // -> logs 1
  ```

  Pulizia degli effetti collaterali:

  ```js
  watchEffect(async (onCleanup) => {
    const { response, cancel } = doAsyncWork(id.value)
    // `cancel` verrà chiamato se `id` cambia
    // quindi la richiesta in sospeso precedente verrà annullata
    // se non è ancora stata completata
    onCleanup(cancel)
    data.value = await response
  })
  ```

  Fermare il watcher:

  ```js
  const stop = watchEffect(() => {})

  // quando il watcher non è più necessario:
  stop()
  ```

  Opzioni:

  ```js
  watchEffect(() => {}, {
    flush: 'post',
    onTrack(e) {
      debugger
    },
    onTrigger(e) {
      debugger
    }
  })
  ```

- **Vedi anche**
  - [Guide - Watchers](/guide/essentials/watchers#watcheffect)
  - [Guide - Debug dei Watcher](/guide/extras/reactivity-in-depth#watcher-debugging)

## watchPostEffect() {#watchposteffect}

Alias di [`watchEffect()`](#watcheffect) con l'opzione `flush: 'post'`.

## watchSyncEffect() {#watchsynceffect}

Alias di [`watchEffect()`](#watcheffect) con l'opzione `flush: 'sync'`.

## watch() {#watch}

Osserva una o più fonti di dati reattive e invoca una funzione di callback quando le fonti cambiano.

- **Tipo**

  ```ts
  // watch sulla singola source
  function watch<T>(
    source: WatchSource<T>,
    callback: WatchCallback<T>,
    options?: WatchOptions
  ): StopHandle

  // watch su più sources
  function watch<T>(
    sources: WatchSource<T>[],
    callback: WatchCallback<T[]>,
    options?: WatchOptions
  ): StopHandle

  type WatchCallback<T> = (
    value: T,
    oldValue: T,
    onCleanup: (cleanupFn: () => void) => void
  ) => void

  type WatchSource<T> =
    | Ref<T> // ref
    | (() => T) // getter
    | T extends object
    ? T
    : never // oggetto reattivo

  interface WatchOptions extends WatchEffectOptions {
    immediate?: boolean // default: false
    deep?: boolean // default: false
    flush?: 'pre' | 'post' | 'sync' // default: 'pre'
    onTrack?: (event: DebuggerEvent) => void
    onTrigger?: (event: DebuggerEvent) => void
  }
  ```

  > I tipi sono semplificati per leggibilità.

- **Dettagli**

`watch()` è lazy di default, ovvero la funzione di callback viene chiamata solo quando la source osservata cambia.

  Il primo argomento è la **source** del watcher. La source può essere una delle seguenti:

  - Una funzione getter che restituisce un valore
  - Una ref
  - Un oggetto reattivo
  - ...o un array dei punti precedenti.

  Il secondo argomento è la funzione di callback che verrà chiamata quando la source cambia. La callback riceve tre argomenti: il nuovo valore, il vecchio valore e una funzione per registrare una callback di pulizia degli effetti collaterali. La callback di pulizia sarà chiamata proprio prima della successiva esecuzione dell'effetto e può essere utilizzata per pulire effetti collaterali non validi, ad esempio una richiesta asincrona in sospeso.

  Quando si osservano più sources, la callback riceve due array contenenti i valori nuovi/vecchi corrispondenti all'array di sources.

  Il terzo argomento opzionale è un oggetto di opzioni che supporta le seguenti opzioni:

  - **`immediate`**: attiva immediatamente la callback alla creazione del watcher. Il vecchio valore sarà `undefined` alla prima chiamata.
  - **`deep`**: forza la lettura profonda delle proprietà della source se è un oggetto, in modo che la callback si attivi durante le mutazioni profonde. Vedi [Deep Watchers](/guide/essentials/watchers#deep-watchers).
  - **`flush`**: regola il timing di esecuzione della callback. Vedi [Callback Flush Timing](/guide/essentials/watchers#callback-flush-timing) e [`watchEffect()`](/api/reactivity-core#watcheffect).
  - **`onTrack / onTrigger`**: esegue il debug delle dipendenze del watcher. Vedi [Watcher Debugging](/guide/extras/reactivity-in-depth#watcher-debugging).

  Rispetto a [`watchEffect()`](#watcheffect), `watch()` ci consente di:

  - Eseguire l'effetto collaterale in modo pigro;
  - Essere più specifici su quale stato dovrebbe attivare nuovamente il watcher;
  - Accedere sia al valore precedente che a quello corrente dello stato osservato.

- **Esempio**

  Fare il watch di un getter:

  ```js
  const state = reactive({ count: 0 })
  watch(
    () => state.count,
    (count, prevCount) => {
      /* ... */
    }
  )
  ```

  Fare il watch di una ref:

  ```js
  const count = ref(0)
  watch(count, (count, prevCount) => {
    /* ... */
  })
  ```

  Quando si osservano più sources, la funzione di callback riceve array contenenti i valori nuovi/vecchi corrispondenti all'array di sources:

  ```js
  watch([fooRef, barRef], ([foo, bar], [prevFoo, prevBar]) => {
    /* ... */
  })
  ```

  Quando si utilizza una source getter, il watcher si attiva solo se il valore restituito dal getter è cambiato. Se si desidera che la funzione di callback si attivi anche su mutazioni profonde, è necessario forzare esplicitamente il watcher in modalità profonda con `{ deep: true }`. Nota che in modalità profonda, il nuovo e il vecchio valore saranno lo stesso oggetto se la callback è stata attivata da una mutazione profonda:

  ```js
  const state = reactive({ count: 0 })
  watch(
    () => state,
    (newValue, oldValue) => {
      // newValue === oldValue
    },
    { deep: true }
  )
  ```

  Quando si osserva direttamente un oggetto reattivo, il watcher è automaticamente in modalità profonda:

  ```js
  const state = reactive({ count: 0 })
  watch(state, () => {
    /* attivato da una mutazione profonda di state */
  })
  ```

  `watch()` condivide lo stesso timing di esecuzione e le opzioni di debug con [`watchEffect()`](#watcheffect):

  ```js
  watch(source, callback, {
    flush: 'post',
    onTrack(e) {
      debugger
    },
    onTrigger(e) {
      debugger
    }
  })
  ```

  Ferma il watcher:

  ```js
  const stop = watch(source, callback)

  // when the watcher is no longer needed:
  stop()
  ```

  Pulizia degli effetti collaterali:

  ```js
  watch(id, async (newId, oldId, onCleanup) => {
    const { response, cancel } = doAsyncWork(newId)
    // `cancel` will be called if `id` changes, cancelling
    // the previous request if it hasn't completed yet
    onCleanup(cancel)
    data.value = await response
  })
  ```

- **Vedi anche**

  - [Guide - Watchers](/guide/essentials/watchers)
  - [Guide - Debug dei Watcher](/guide/extras/reactivity-in-depth#watcher-debugging)
