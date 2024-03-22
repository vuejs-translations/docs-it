# Options: State {#options-state}

## data {#data}

Una funzione che restituisce lo stato reattivo iniziale per l'istanza del componente.

- **Tipo**

  ```ts
  interface ComponentOptions {
    data?(
      this: ComponentPublicInstance,
      vm: ComponentPublicInstance
    ): object
  }
  ```

- **Dettagli**

  La funzione si aspetta il ritorno di un semplice oggetto JavaScript, che sarà reso reattivo da Vue. Dopo la creazione dell'istanza, è possibile accedere all'oggetto reattivo data con `this.$data`. L'istanza del componente inoltre funziona come proxy per tutte le proprietà dell'oggetto data, quindi `this.a` sarà uguale a `this.$data.a`.

  Tutte le proprietà dei dati di livello superiore devono essere incluse nell'oggetto data restituito. Aggiungere nuove proprietà a `this.$data` è possibile, ma **non** è raccomandato. Se il valore desiderato di una proprietà non è ancora disponibile è necessario includere un valore vuoto come `undefined` o `null` come segnaposto per garantire che Vue sappia che la proprietà esiste.

  Proprietà che iniziano con `_` o `$` **non** saranno proxy sull'istanza del componente potrebbero entrare in conflitto con le proprietà interne di Vue e i metodi API. Dovrai accedervi come `this.$data._property`.

  **Non** raccomandato ritornare oggetti con il proprio comportamento con stato come oggetti API del browser e proprietà del prototipo. L'oggetto restituito dovrebbe idealmente essere un oggetto semplice che rappresenta solo lo stato del componente.

- **Esempio**

  ```js
  export default {
    data() {
      return { a: 1 }
    },
    created() {
      console.log(this.a) // 1
      console.log(this.$data) // { a: 1 }
    }
  }
  ```

  Tieni presente che se utilizzi una funzione freccia con la proprietà `data`, `this` non sarà l'istanza del componente, ma potrai comunque accedere all'istanza come primo argomento della funzione:

  ```js
  data: (vm) => ({ a: vm.myProp })
  ```

- **Guarda anche** [Reattività nel dettaglio](/guide/extras/reactivity-in-depth)

## props {#props}

Dichiarare le props di un componente

- **Type**

  ```ts
  interface ComponentOptions {
    props?: ArrayPropsOptions | ObjectPropsOptions
  }

  type ArrayPropsOptions = string[]

  type ObjectPropsOptions = { [key: string]: Prop }

  type Prop<T = any> = PropOptions<T> | PropType<T> | null

  interface PropOptions<T> {
    type?: PropType<T>
    required?: boolean
    default?: T | ((rawProps: object) => T)
    validator?: (value: unknown) => boolean
  }

  type PropType<T> = { new (): T } | { new (): T }[]
  ```

  > I tipi sono semplificati per la leggibilità.

- **Dettagli**

  In Vue, tutte le props dei componenti devono essere dichiarate esplicitamente. Le props dei componenti possono essere dichiarate in due forme:

  - Forma semplice che utilizza un array di stringhe
  - Forma completa utilizzando un oggetto in cui ciascuna chiave è il nome di una prop, e il valore è il suo tipo (una funzione di costruzione) o le opzioni avanzate.

  Con la sintassi basata sugli oggetti, ciascuna prop può definire ulteriormente le seguenti opzioni:

  - **`type`**: Può essere uno dei seguenti costruttori nativi: `String`, `Number`, `Boolean`, `Array`, `Object`, `Date`, `Function`, `Symbol`, qualsiasi funzione di costruzione personalizzata o un array di queste. In modalità sviluppo, Vue controllerà se il valore di un oggetto corrisponde al tipo dichiarato, e darà errore in caso contrario. Guarda [Validazione delle props](/guide/components/props#prop-validation) per maggiori dettagli.

    Tieni inoltre presente che un oggetto di tipo `Boolean` influisce sul suo comportamento di conversione del valore sia nello sviluppo che nella produzione. Guarda [Conversione in Booleano](/guide/components/props#boolean-casting) per maggiori dettagli.

  - **`default`**: Specifica un valore predefinito per la prop quando non viene passata dal genitore o ha un valore `undefined`. I valori predefiniti dell'oggetto o dell'array devono essere restituiti utilizzando una funzione di fabbrica. La funzione di fabbrica riceve anche l'oggetto raw props come argomento.

  - **`required`**: Definisce se la prop è richiesta. In un ambiente non di produzione, verrà lanciato un avviso sulla console se questo valore è vero e la prop non viene passata.

  - **`validator`**: Funzione di convalida personalizzata che accetta il valore prop come unico argomento. In modalità sviluppo, verrà lanciato un avviso sulla console se questa funzione restituisce un valore falso (ovvero la convalida fallisce).

- **Esempio**

  Semplice dichiarazione:

  ```js
  export default {
    props: ['size', 'myMessage']
  }
  ```

  Dichiarazione dell'oggetto con validazione:

  ```js
  export default {
    props: {
      // controllo del tipo
      height: Number,
      // controllo del tipo più altre validazioni
      age: {
        type: Number,
        default: 0,
        required: true,
        validator: (value) => {
          return value >= 0
        }
      }
    }
  }
  ```

- **Guarda anche**
  - [Guida - Props](/guide/components/props)
  - [Guida - Tipizzare le props dei componenti](/guide/typescript/options-api#typing-component-props) <sup class="vt-badge ts" />

## computed {#computed}

Dichiarare le proprietà calcolate da esporre nell'istanza del componente.

- **Tipo**

  ```ts
  interface ComponentOptions {
    computed?: {
      [key: string]: ComputedGetter<any> | WritableComputedOptions<any>
    }
  }

  type ComputedGetter<T> = (
    this: ComponentPublicInstance,
    vm: ComponentPublicInstance
  ) => T

  type ComputedSetter<T> = (
    this: ComponentPublicInstance,
    value: T
  ) => void

  type WritableComputedOptions<T> = {
    get: ComputedGetter<T>
    set: ComputedSetter<T>
  }
  ```

- **Dettagli**

  L'opzione accetta un oggetto in cui la chiave è il nome della proprietà calcolata e il valore è un getter calcolato o un oggetto con metodi `get` e `set` (per proprietà calcolate scrivibili).

  Tutti i getter e i setter hanno il loro contesto `this` automaticamente associato all'istanza del componente.

  Tieni presente che se utilizzi una funzione freccia con una proprietà calcolata, `this` non punterà all'istanza del componente, ma puoi comunque accedere all'istanza come primo argomento della funzione:

  ```js
  export default {
    computed: {
      aDouble: (vm) => vm.a * 2
    }
  }
  ```

- **Esempio**

  ```js
  export default {
    data() {
      return { a: 1 }
    },
    computed: {
      // readonly
      aDouble() {
        return this.a * 2
      },
      // writable
      aPlus: {
        get() {
          return this.a + 1
        },
        set(v) {
          this.a = v - 1
        }
      }
    },
    created() {
      console.log(this.aDouble) // => 2
      console.log(this.aPlus) // => 2

      this.aPlus = 3
      console.log(this.a) // => 2
      console.log(this.aDouble) // => 4
    }
  }
  ```

- **Guarda anche**
  - [Guida - Computed Properties](/guide/essentials/computed)
  - [Guida - Tipizzare le Computed Properties](/guide/typescript/options-api#typing-computed-properties) <sup class="vt-badge ts" />

## metodi {#methods}

Dichiarare i metodi da combinare nell'istanza del componente.

- **Tipo**

  ```ts
  interface ComponentOptions {
    methods?: {
      [key: string]: (this: ComponentPublicInstance, ...args: any[]) => any
    }
  }
  ```

- **Dettagli**

  È possibile accedere direttamente ai metodi dichiarati nell'istanza del componente o utilizzarli nelle espressioni del modello. Tutti i metodi hanno il loro contesto `this` automaticamente associato all'istanza del componente, anche quando viene passato.

  Evita di utilizzare le funzioni freccia quando dichiari i metodi, poiché non avranno accesso all'istanza del componente tramite `this`.

- **Esempio**

  ```js
  export default {
    data() {
      return { a: 1 }
    },
    methods: {
      plus() {
        this.a++
      }
    },
    created() {
      this.plus()
      console.log(this.a) // => 2
    }
  }
  ```

- **Guarda anche** [Gestione degli Eventi](/guide/essentials/event-handling)

## watch {#watch}

Dichiara le callback di controllo da richiamare alla modifica dei dati.

- **Tipo**

  ```ts
  interface ComponentOptions {
    watch?: {
      [key: string]: WatchOptionItem | WatchOptionItem[]
    }
  }

  type WatchOptionItem = string | WatchCallback | ObjectWatchOptionItem

  type WatchCallback<T> = (
    value: T,
    oldValue: T,
    onCleanup: (cleanupFn: () => void) => void
  ) => void

  type ObjectWatchOptionItem = {
    handler: WatchCallback | string
    immediate?: boolean // default: false
    deep?: boolean // default: false
    flush?: 'pre' | 'post' | 'sync' // default: 'pre'
    onTrack?: (event: DebuggerEvent) => void
    onTrigger?: (event: DebuggerEvent) => void
  }
  ```

  > I Tipi sono semplificati per leggibilità.

- **Dettagli**

  L'opzione `watch` prevede un oggetto in cui le chiavi sono le proprietà dell'istanza del componente reattivo da controllare (ad esempio, le proprietà dichiarate tramite `data` o `computed`) — e i valori sono le callback corrispondenti. La callback riceve il nuovo valore e il vecchio valore dell'origine controllata.

  Oltre a una proprietà a livello di root, la chiave può anche essere un semplice percorso delimitato da punti, ad es. `a.b.c`. Tieni presente che questo utilizzo **non** supporta espressioni complesse: sono supportati solo percorsi delimitati da punti. Se devi monitorare origini dati complesse, utilizza invece l'API imperativa [`$watch()`](/api/component-instance#watch).

  Il valore può anche essere una stringa del nome di un metodo (dichiarato tramite `methods`) o un oggetto che contiene opzioni aggiuntive. Quando si utilizza la sintassi dell'oggetto, la callback deve essere dichiarata nel campo `handler`. Ulteriori opzioni includono:

  - **`immediate`**: attivare immediatamente la richiamata alla creazione del watcher. Il vecchio valore sarà `undefined` alla prima chiamata.
  - **`deep`**: forza l'attraversamento profondo dell'origine se si tratta di un oggetto o di un array, in modo che la callback si attivi su mutazioni avanzate. Guarda [Watcher Avanzati](/guide/essentials/watchers#deep-watchers).
  - **`flush`**: regolare i tempi di flush della callback. Guarda [Tempi di esecuzione della Callback](/guide/essentials/watchers#callback-flush-timing) e [`watchEffect()`](/api/reactivity-core#watcheffect).
  - **`onTrack / onTrigger`**: eseguire il debug delle dipendenze del watcher. Guarda [Debug degli Watcher](/guide/extras/reactivity-in-depth#watcher-debugging).

  Evita di utilizzare le funzioni freccia quando dichiari le callback di watch poiché non avranno accesso all'istanza del componente tramite `this`.

- **Esempio**

  ```js
  export default {
    data() {
      return {
        a: 1,
        b: 2,
        c: {
          d: 4
        },
        e: 5,
        f: 6
      }
    },
    watch: {
      // guardare proprietà di alto livello
      a(val, oldVal) {
        console.log(`new: ${val}, old: ${oldVal}`)
      },
      // nome del metodo stringa
      b: 'someMethod',
      // la callback verrà chiamata ogni volta che una qualsiasi delle proprietà dell'oggetto controllato cambia indipendentemente dalla sua profondità di nidificazione
      c: {
        handler(val, oldVal) {
          console.log('c changed')
        },
        deep: true
      },
      // guardando una singola proprietà nidificata:
      'c.d': function (val, oldVal) {
        // fa qualcosa
      },
      // la callback verrà effettuata immediatamente dopo l'inizio dell'osservazione
      e: {
        handler(val, oldVal) {
          console.log('e changed')
        },
        immediate: true
      },
      // puoi passare una serie di callback, verranno chiamate una per una
      f: [
        'handle1',
        function handle2(val, oldVal) {
          console.log('handle2 triggered')
        },
        {
          handler: function handle3(val, oldVal) {
            console.log('handle3 triggered')
          }
          /* ... */
        }
      ]
    },
    methods: {
      someMethod() {
        console.log('b changed')
      },
      handle1() {
        console.log('handle 1 triggered')
      }
    },
    created() {
      this.a = 3 // => nuovo: 3, vecchio: 1
    }
  }
  ```

- **Guarda anche** [Watchers](/guide/essentials/watchers)

## emits {#emits}

Dichiarare gli eventi personalizzati emessi dal componente.

- **Tipo**

  ```ts
  interface ComponentOptions {
    emits?: ArrayEmitsOptions | ObjectEmitsOptions
  }

  type ArrayEmitsOptions = string[]

  type ObjectEmitsOptions = { [key: string]: EmitValidator | null }

  type EmitValidator = (...args: unknown[]) => boolean
  ```

- **Dettagli**

  Gli eventi emessi possono essere dichiarati in due forme:

  - Forma semplice che utilizza un array di stringhe
  - Forma completa che utilizza un oggetto in cui ciascuna chiave di proprietà è il nome dell'evento e il valore è `null` o una funzione di convalida.

  La funzione di convalida riceverà gli argomenti aggiuntivi passati alla chiamata `$emit` del componente. Ad esempio, se viene chiamato `this.$emit('foo', 1)`, il validatore corrispondente per `foo` riceverà l'argomento `1`. La funzione di validazione dovrebbe restituire un valore booleano per indicare se gli argomenti dell'evento sono validi.

  Tieni presente che l'opzione `emits` influisce sugli ascoltatori di eventi che sono considerati del componente, piuttosto che ascoltatori di eventi DOM nativi. Gli ascoltatori per gli eventi dichiarati verranno rimossi dall'oggetto `$attrs` del componente, quindi non verranno passati all'elemento root del componente. Guarda [Attributi trasferibili](/guide/components/attrs) per maggiori dettagli.

- **Esempio**

  Sintassi con array:

  ```js
  export default {
    emits: ['check'],
    created() {
      this.$emit('check')
    }
  }
  ```

  Sintassi con oggetto:

  ```js
  export default {
    emits: {
      // senza validazione
      click: null,

      // con validazione
      submit: (payload) => {
        if (payload.email && payload.password) {
          return true
        } else {
          console.warn(`Payload dell'evento di invio non valido!`)
          return false
        }
      }
    }
  }
  ```

- **Guarda anche**
  - [Guida - Attributi trasferibili](/guide/components/attrs)
  - [Guida - Tipizzare gli emits dei componenti](/guide/typescript/options-api#typing-component-emits) <sup class="vt-badge ts" />

## expose {#expose}

Dichiara le proprietà pubbliche esposte quando un genitore accede all'istanza del componente tramite riferimenti al modello.

- **Tipo**

  ```ts
  interface ComponentOptions {
    expose?: string[]
  }
  ```

- **Dettagli**

  Per impostazione predefinita, un'istanza del componente espone tutte le proprietà dell'istanza al genitore quando si accede tramite `$parent`, `$root` o riferimenti al modello. Ciò può essere indesiderabile, poiché molto probabilmente un componente ha uno stato interno o metodi che dovrebbero essere mantenuti privati ​​per evitare un accoppiamento stretto.

  L'opzione `expose` prevede un elenco di stringhe di nomi di proprietà. Quando viene utilizzato `expose`, solo le proprietà esplicitamente elencate verranno esposte nell'istanza pubblica del componente.

  `expose` influisce solo sulle proprietà definite dall'utente e non filtra le proprietà dell'istanza del componente integrato.

- **Esempio**

  ```js
  export default {
    // solo `publicMethod` sarà disponibile sull'istanza pubblica
    expose: ['publicMethod'],
    methods: {
      publicMethod() {
        // ...
      },
      privateMethod() {
        // ...
      }
    }
  }
  ```
