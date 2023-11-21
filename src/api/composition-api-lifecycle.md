# Composition API: Hook del Ciclo di Vita {#composition-api-lifecycle-hooks}

:::info Usage Note
Tutte le API elencate in questa pagina devono essere chiamate sincronamente durante la fase `setup()` di un componente. Vedi [Guida - Hook del Ciclo di Vita](/guide/essentials/lifecycle) per maggiori dettagli.
:::

## onMounted() {#onmounted}

Registra una funzione di callback da eseguire dopo che il componente è stato montato.

- **Type**

  ```ts
  function onMounted(callback: () => void): void
  ```

- **Details**

  Un componente è considerato montato dopo che:

  - Tutti i suoi componenti figlio sincroni sono stati montati (non include componenti asincroni o componenti all'interno di alberi `<Suspense>`).

  - L'albero del suo DOM è stato creato e inserito nel contenitore padre. Nota: è garantito solo che l'albero DOM del componente sia nel documento se anche il contenitore nella root dell'applicazione è nel documento.

  Questo hook è tipicamente utilizzato per eseguire effetti collaterali che hanno accesso al DOM renderizzato del componente, o per limitare il codice correlato al DOM al client in un'applicazione [renderizzata lato server](/guide/scaling-up/ssr).

  **Questo hook non viene chiamato durante il rendering lato server.**

- **Esempio**

  Accesso ad un elemento tramite ref al template:

  ```vue
  <script setup>
  import { ref, onMounted } from 'vue'

  const el = ref()

  onMounted(() => {
    el.value // <div>
  })
  </script>

  <template>
    <div ref="el"></div>
  </template>
  ```

## onUpdated() {#onupdated}

Registra una callback da chiamare dopo che il componente ha aggiornato il suo albero DOM a causa di un cambiamento di stato reattivo.

- **Tipo**

  ```ts
  function onUpdated(callback: () => void): void
  ```

- **Dettagli**

  L'hook di aggiornamento del componente padre viene chiamato dopo quello dei suoi componenti figli.

  Questo hook viene chiamato dopo ogni aggiornamento del DOM del componente, che può essere causato da diversi cambiamenti di stato, poiché più cambiamenti di stato possono essere raggruppati in un singolo ciclo di rendering per motivi di prestazioni. Se è necessario accedere al DOM aggiornato dopo un cambiamento di stato specifico, usare [nextTick()](/api/general#nexttick) al suo posto.

  **Questo hook non viene chiamato durante il rendering lato server.**

  :::warning
  Evita di mutare lo stato del componente nell'hook di aggiornamento, poiché ciò probabilmente porterà a un ciclo di aggiornamento infinito!
  :::

- **Esempio**

  Accesso al DOM aggiornato:

  ```vue
  <script setup>
  import { ref, onUpdated } from 'vue'

  const count = ref(0)

  onUpdated(() => {
   // Il contenuto del testo dovrebbe essere lo stesso di `count.value` attuale
    console.log(document.getElementById('count').textContent)
  })
  </script>

  <template>
    <button id="count" @click="count++">{{ count }}</button>
  </template>
  ```

## onUnmounted() {#onunmounted}

Registra una callback da chiamare dopo che il componente è stato smontato.

- **Tipo**

  ```ts
  function onUnmounted(callback: () => void): void
  ```

- **Dettagli**

  Un componente viene considerato smontato dopo:

  - Tutti i suoi componenti figli sono stati smontati.

  - Tutti i suoi effetti reattivi associati (effetto di render e computed / watcher creati durante `setup()`) sono stati interrotti.

  Utilizzare questo hook per azzerare manualmente gli effetti collaterali creati, come timer, gestori di eventi DOM o connessioni server.

  **Questo hook non viene chiamato durante il rendering lato server.**

- **Esempio**

  ```vue
  <script setup>
  import { onMounted, onUnmounted } from 'vue'

  let intervalId
  onMounted(() => {
    intervalId = setInterval(() => {
      // ...
    })
  })

  onUnmounted(() => clearInterval(intervalId))
  </script>
  ```

## onBeforeMount() {#onbeforemount}

Registra un hook da chiamare proprio prima che il componente debba essere montato.

- **Tipo**

  ```ts
  function onBeforeMount(callback: () => void): void
  ```

- **Dettagli**

  Quando questo hook viene chiamato, il componente ha completato la configurazione del suo stato reattivo, ma ancora nessun nodo è stato creato nel DOM. Sta per eseguire il suo effetto di render del DOM per la prima volta.

  **Questo hook non viene chiamato durante il rendering lato server.**

## onBeforeUpdate() {#onbeforeupdate}

Registra un hook da chiamare proprio prima che il componente aggiorni il suo albero DOM a causa di un cambiamento di stato reattivo.

- **Tipo**

  ```ts
  function onBeforeUpdate(callback: () => void): void
  ```

- **Dettagli**

  Questo hook può essere utilizzato per accedere allo stato del DOM prima che Vue aggiorni il DOM. È anche sicuro modificare lo stato del componente all'interno di questo hook.

  **Questo hook non viene chiamato durante il rendering lato server.**

## onBeforeUnmount() {#onbeforeunmount}

Registra un hook da chiamare proprio prima che un'istanza del componente debba essere smontata.

- **Tipo**

  ```ts
  function onBeforeUnmount(callback: () => void): void
  ```

- **Dettagli**

  Quando questo hook viene chiamato, l'istanza del componente è ancora completamente funzionante.

  **Questo hook non viene chiamato durante il rendering lato server.**

## onErrorCaptured() {#onerrorcaptured}

Registra un hook da chiamare quando un errore propagato da un componente discendente è stato catturato.

- **Tipo**

  ```ts
  function onErrorCaptured(callback: ErrorCapturedHook): void

  type ErrorCapturedHook = (
    err: unknown,
    instance: ComponentPublicInstance | null,
    info: string
  ) => boolean | void
  ```

- **Dettagli**

  Gli errori possono essere catturati dalle seguenti fonti:

  - Render del componente
  - Gestore di eventi
  - Hook del ciclo di vita
  - Funzione `setup()`
  - I Watcher
  - Hook personalizzati delle direttive
  - Hook delle transizioni

  L'hook riceve tre argomenti: l'errore, l'istanza del componente che ha generato l'errore e una stringa di informazione che specifica il tipo di origine dell'errore.

  Puoi modificare lo stato del componente in `errorCaptured()` per mostrare uno stato di errore all'utente. Tuttavia, è importante che lo stato di errore non renderizzi il contenuto originale che ha causato l'errore; altrimenti il componente entrerà in un ciclo di rendering infinito.

  L'hook può restituire `false` per impedire alla propagazione dell'errore. Vedi i dettagli sulla propagazione degli errori di seguito.

  **Regole di Propagazione degli Errori**

  - Per impostazione predefinita, tutti gli errori vengono comunque inviati all'handler delle applicazioni [`app.config.errorHandler`](/api/application#app-config-errorhandler) se è definito, in modo che questi errori possano ancora essere segnalati ad un servizio di analytics in un unico punto.

  - Se esistono più hook `errorCaptured` nella catena di ereditarietà di un componente o nella catena dei padri, tutti saranno invocati per lo stesso errore, in ordine dal basso verso l'alto. Questo è simile al meccanismo di propagazione degli eventi DOM nativi.

  - Se l'hook `errorCaptured` stesso genera un errore, sia quest'ultimo errore che l'errore originale vengono inviati a `app.config.errorHandler`.

  - Un hook `errorCaptured` può restituire `false` per impedire la propagazione dell'errore. Questo equivale a dire "questo errore è stato gestito e dovrebbe essere ignorato". Ciò impedirà che vengano invocati ulteriori hook `errorCaptured` o `app.config.errorHandler` per questo errore.

## onRenderTracked() <sup class="vt-badge dev-only" /> {#onrendertracked}

Registra un hook di debug da chiamare quando una dipendenza reattiva è stata tracciata dall'effetto di render del componente.

**Questo hook è disponibile solo in modalità di sviluppo e non viene chiamato durante il rendering lato server.**

- **Tipo**

  ```ts
  function onRenderTracked(callback: DebuggerHook): void

  type DebuggerHook = (e: DebuggerEvent) => void

  type DebuggerEvent = {
    effect: ReactiveEffect
    target: object
    type: TrackOpTypes /* 'get' | 'has' | 'iterate' */
    key: any
  }
  ```

- **Vedi anche** [Reactivity in Depth](/guide/extras/reactivity-in-depth)

## onRenderTriggered() <sup class="vt-badge dev-only" /> {#onrendertriggered}

Registra un hook di debug da chiamare quando una dipendenza reattiva scatena nuovamente l'effetto di render del componente.

**Questo hook è disponibile solo in modalità di sviluppo e non viene chiamato durante il rendering lato server.**

- **Tipo**

  ```ts
  function onRenderTriggered(callback: DebuggerHook): void

  type DebuggerHook = (e: DebuggerEvent) => void

  type DebuggerEvent = {
    effect: ReactiveEffect
    target: object
    type: TriggerOpTypes /* 'set' | 'add' | 'delete' | 'clear' */
    key: any
    newValue?: any
    oldValue?: any
    oldTarget?: Map<any, any> | Set<any>
  }
  ```

- **Vedi anche** [Reactivity in Depth](/guide/extras/reactivity-in-depth)

## onActivated() {#onactivated}

Registra una callback da chiamare dopo che l'istanza del componente è stata inserita nel DOM come parte di un albero memorizzato in cache da [`<KeepAlive>`](/api/built-in-components#keepalive).

**Questo hook non viene chiamato durante il rendering lato server.**

- **Tipo**

  ```ts
  function onActivated(callback: () => void): void
  ```

- **Vedi anche** [Guide - Lifecycle of Cached Instance](/guide/built-ins/keep-alive#lifecycle-of-cached-instance)

## onDeactivated() {#ondeactivated}

Registra una callback da chiamare dopo che l'istanza del componente è stata rimossa dal DOM come parte di un albero memorizzato in cache da [`<KeepAlive>`](/api/built-in-components#keepalive).

**Questo hook non viene chiamato durante il rendering lato server.**

- **Tipo**

  ```ts
  function onDeactivated(callback: () => void): void
  ```

- **Vedi anche** [Guide - Lifecycle of Cached Instance](/guide/built-ins/keep-alive#lifecycle-of-cached-instance)

## onServerPrefetch() <sup class="vt-badge" data-text="SSR only" /> {#onserverprefetch}

Registra una funzione asincrona da risolvere prima che l'istanza del componente debba essere renderizzata sul server.

- **Tipo**

  ```ts
  function onServerPrefetch(callback: () => Promise<any>): void
  ```

- **Dettagli**

  Se la callback restituisce una Promise, il renderer sul server aspetterà che la Promise venga risolta prima di renderizzare il componente.

  Questo hook viene chiamato solo durante il rendering lato server ed è utilizzato per eseguire il recupero di dati specifico del server.

- **Esempio**

  ```vue
  <script setup>
  import { ref, onServerPrefetch, onMounted } from 'vue'

  const data = ref(null)

  onServerPrefetch(async () => {
    // il componente viene renderizzato come parte della richiesta iniziale
    // effettua il pre-recupero dei dati sul server poiché è più veloce che farlo sul client
    data.value = await fetchOnServer(/* ... */)
  })

  onMounted(async () => {
    if (!data.value) {
      // se i dati sono nulli al momento del montaggio, significa che il componente
      // viene renderizzato dinamicamente sul client. Esegui il recupero sul lato client.
      data.value = await fetchOnClient(/* ... */)
    }
  })
  </script>
  ```

- **Vedi anche** [Server-Side Rendering](/guide/scaling-up/ssr)
