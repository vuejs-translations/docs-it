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

Declare computed properties to be exposed on the component instance.

- **Type**

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

- **Details**

  The option accepts an object where the key is the name of the computed property, and the value is either a computed getter, or an object with `get` and `set` methods (for writable computed properties).

  All getters and setters have their `this` context automatically bound to the component instance.

  Note that if you use an arrow function with a computed property, `this` won't point to the component's instance, but you can still access the instance as the function's first argument:

  ```js
  export default {
    computed: {
      aDouble: (vm) => vm.a * 2
    }
  }
  ```

- **Example**

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

- **See also**
  - [Guide - Computed Properties](/guide/essentials/computed)
  - [Guide - Typing Computed Properties](/guide/typescript/options-api#typing-computed-properties) <sup class="vt-badge ts" />

## methods {#methods}

Declare methods to be mixed into the component instance.

- **Type**

  ```ts
  interface ComponentOptions {
    methods?: {
      [key: string]: (this: ComponentPublicInstance, ...args: any[]) => any
    }
  }
  ```

- **Details**

  Declared methods can be directly accessed on the component instance, or used in template expressions. All methods have their `this` context automatically bound to the component instance, even when passed around.

  Avoid using arrow functions when declaring methods, as they will not have access to the component instance via `this`.

- **Example**

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

- **See also** [Event Handling](/guide/essentials/event-handling)

## watch {#watch}

Declare watch callbacks to be invoked on data change.

- **Type**

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

  > Types are simplified for readability.

- **Details**

  The `watch` option expects an object where keys are the reactive component instance properties to watch (e.g. properties declared via `data` or `computed`) — and values are the corresponding callbacks. The callback receives the new value and the old value of the watched source.

  In addition to a root-level property, the key can also be a simple dot-delimited path, e.g. `a.b.c`. Note that this usage does **not** support complex expressions - only dot-delimited paths are supported. If you need to watch complex data sources, use the imperative [`$watch()`](/api/component-instance#watch) API instead.

  The value can also be a string of a method name (declared via `methods`), or an object that contains additional options. When using the object syntax, the callback should be declared under the `handler` field. Additional options include:

  - **`immediate`**: trigger the callback immediately on watcher creation. Old value will be `undefined` on the first call.
  - **`deep`**: force deep traversal of the source if it is an object or an array, so that the callback fires on deep mutations. See [Deep Watchers](/guide/essentials/watchers#deep-watchers).
  - **`flush`**: adjust the callback's flush timing. See [Callback Flush Timing](/guide/essentials/watchers#callback-flush-timing) and [`watchEffect()`](/api/reactivity-core#watcheffect).
  - **`onTrack / onTrigger`**: debug the watcher's dependencies. See [Watcher Debugging](/guide/extras/reactivity-in-depth#watcher-debugging).

  Avoid using arrow functions when declaring watch callbacks as they will not have access to the component instance via `this`.

- **Example**

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
      // watching top-level property
      a(val, oldVal) {
        console.log(`new: ${val}, old: ${oldVal}`)
      },
      // string method name
      b: 'someMethod',
      // the callback will be called whenever any of the watched object properties change regardless of their nested depth
      c: {
        handler(val, oldVal) {
          console.log('c changed')
        },
        deep: true
      },
      // watching a single nested property:
      'c.d': function (val, oldVal) {
        // do something
      },
      // the callback will be called immediately after the start of the observation
      e: {
        handler(val, oldVal) {
          console.log('e changed')
        },
        immediate: true
      },
      // you can pass array of callbacks, they will be called one-by-one
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
      this.a = 3 // => new: 3, old: 1
    }
  }
  ```

- **See also** [Watchers](/guide/essentials/watchers)

## emits {#emits}

Declare the custom events emitted by the component.

- **Type**

  ```ts
  interface ComponentOptions {
    emits?: ArrayEmitsOptions | ObjectEmitsOptions
  }

  type ArrayEmitsOptions = string[]

  type ObjectEmitsOptions = { [key: string]: EmitValidator | null }

  type EmitValidator = (...args: unknown[]) => boolean
  ```

- **Details**

  Emitted events can be declared in two forms:

  - Simple form using an array of strings
  - Full form using an object where each property key is the name of the event, and the value is either `null` or a validator function.

  The validation function will receive the additional arguments passed to the component's `$emit` call. For example, if `this.$emit('foo', 1)` is called, the corresponding validator for `foo` will receive the argument `1`. The validator function should return a boolean to indicate whether the event arguments are valid.

  Note that the `emits` option affects which event listeners are considered component event listeners, rather than native DOM event listeners. The listeners for declared events will be removed from the component's `$attrs` object, so they will not be passed through to the component's root element. See [Fallthrough Attributes](/guide/components/attrs) for more details.

- **Example**

  Array syntax:

  ```js
  export default {
    emits: ['check'],
    created() {
      this.$emit('check')
    }
  }
  ```

  Object syntax:

  ```js
  export default {
    emits: {
      // no validation
      click: null,

      // with validation
      submit: (payload) => {
        if (payload.email && payload.password) {
          return true
        } else {
          console.warn(`Invalid submit event payload!`)
          return false
        }
      }
    }
  }
  ```

- **See also**
  - [Guide - Fallthrough Attributes](/guide/components/attrs)
  - [Guide - Typing Component Emits](/guide/typescript/options-api#typing-component-emits) <sup class="vt-badge ts" />

## expose {#expose}

Declare exposed public properties when the component instance is accessed by a parent via template refs.

- **Type**

  ```ts
  interface ComponentOptions {
    expose?: string[]
  }
  ```

- **Details**

  By default, a component instance exposes all instance properties to the parent when accessed via `$parent`, `$root`, or template refs. This can be undesirable, since a component most likely has internal state or methods that should be kept private to avoid tight coupling.

  The `expose` option expects a list of property name strings. When `expose` is used, only the properties explicitly listed will be exposed on the component's public instance.

  `expose` only affects user-defined properties - it does not filter out built-in component instance properties.

- **Example**

  ```js
  export default {
    // only `publicMethod` will be available on the public instance
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
