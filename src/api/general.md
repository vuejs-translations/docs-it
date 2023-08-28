# API Globali: Generale {#global-api-general}

## version {#version}

Espone la versione corrente di Vue.

- **Type:** `string`

- **Esempio**

  ```js
  import { version } from 'vue'

  console.log(version)
  ```

## nextTick() {#nexttick}

Una utility per attendere il successivo aggiornamento del DOM.

- **Tipo**

  ```ts
  function nextTick(callback?: () => void): Promise<void>
  ```

- **Dettagli**

  Quando modifichi uno stato reattivo in Vue, gli aggiornamenti del DOM che ne risultano non vengono applicati istantaneamente. Vue, invece, li mette in buffer fino al "next tick" per garantire che ogni componente venga aggiornato solo una volta, indipendentemente da quante modifiche allo stato hai effettuato.

  `nextTick()` può essere utilizzato immediatamente dopo una modifica dello stato per attendere che gli aggiornamenti del DOM siano completati. Puoi sia passare una callback come argomento, sia utilizzare await sulla Promise restituita.

- **Esempio**

  <div class="composition-api">

  ```vue
  <script setup>
  import { ref, nextTick } from 'vue'

  const count = ref(0)

  async function increment() {
    count.value++

    // il DOM non è ancora aggiornato
    console.log(document.getElementById('counter').textContent) // 0

    await nextTick()
    // il DOM ora è aggiornato
    console.log(document.getElementById('counter').textContent) // 1
  }
  </script>

  <template>
    <button id="counter" @click="increment">{{ count }}</button>
  </template>
  ```

  </div>
  <div class="options-api">

  ```vue
  <script>
  import { nextTick } from 'vue'

  export default {
    data() {
      return {
        count: 0
      }
    },
    methods: {
      async increment() {
        this.count++

        // il DOM non è ancora aggiornato
        console.log(document.getElementById('counter').textContent) // 0

        await nextTick()
        // il DOM ora è aggiornato
        console.log(document.getElementById('counter').textContent) // 1
      }
    }
  }
  </script>

  <template>
    <button id="counter" @click="increment">{{ count }}</button>
  </template>
  ```

  </div>

- **Guarda anche** [`this.$nextTick()`](/api/component-instance#nexttick)

## defineComponent() {#definecomponent}

Un helper per definire un componente Vue con inferenza del Type.

- **Tipo**

  ```ts
  // sintassi con le options
  function defineComponent(
    component: ComponentOptions
  ): ComponentConstructor

  // sintassi con una funzione (richiede la 3.3+)
  function defineComponent(
    setup: ComponentOptions['setup'],
    extraOptions?: ComponentOptions
  ): () => any
  ```

  > Il Type è semplificato per la leggibilità.

- **Dettagli**

  Il primo argomento si aspetta un oggetto delle opzioni del componente. Il valore di ritorno sarà lo stesso oggetto delle opzioni, poiché la funzione è essenzialmente una no-op a runtime solo per scopi di inferenza del Type.

  Nota che il type restituito è un po' speciale: sarà un type di costruttore il cui type di istanza è il type dell'istanza del componente ricavato dalle options. Il type restituito viene poi utilizzato per l'inferenza del type quando è usato come un tag in TSX.

  Puoi estrarre l'instance type di un componente (equivalente al type di `this` nelle sue options) dal return type di `defineComponent()` in questo modo:

  ```ts
  const Foo = defineComponent(/* ... */)

  type FooInstance = InstanceType<typeof Foo>
  ```

  ### Function Signature <sup class="vt-badge" data-text="3.3+" /> {#function-signature}

  `defineComponent()` also has an alternative signature that is meant to be used with Composition API and [render functions or JSX](/guide/extras/render-function.html).

  Instead of passing in an options object, a function is expected instead. This function works the same as the Composition API [`setup()`](/api/composition-api-setup.html#composition-api-setup) function: it receives the props and the setup context. The return value should be a render function - both `h()` and JSX are supported:

  ```js
  import { ref, h } from 'vue'

  const Comp = defineComponent(
    (props) => {
      // use Composition API here like in <script setup>
      const count = ref(0)

      return () => {
        // render function or JSX
        return h('div', count.value)
      }
    },
    // extra options, e.g. declare props and emits
    {
      props: {
        /* ... */
      }
    }
  )
  ```

  The main use case for this signature is with TypeScript (and in particular with TSX), as it supports generics:

  ```tsx
  const Comp = defineComponent(
    <T extends string | number>(props: { msg: T; list: T[] }) => {
      // use Composition API here like in <script setup>
      const count = ref(0)

      return () => {
        // render function or JSX
        return <div>{count.value}</div>
      }
    },
    // manual runtime props declaration is currently still needed.
    {
      props: ['msg', 'list']
    }
  )
  ```

  In the future, we plan to provide a Babel plugin that automatically infers and injects the runtime props (like for `defineProps` in SFCs) so that the runtime props declaration can be omitted.

  ### Note on webpack Treeshaking {#note-on-webpack-treeshaking}

  Because `defineComponent()` is a function call, it could look like that it would produce side-effects to some build tools, e.g. webpack. This will prevent the component from being tree-shaken even when the component is never used.

  To tell webpack that this function call is safe to be tree-shaken, you can add a `/*#__PURE__*/` comment notation before the function call:

  ```js
  export default /*#__PURE__*/ defineComponent(/* ... */)
  ```

  Note this is not necessary if you are using Vite, because Rollup (the underlying production bundler used by Vite) is smart enough to determine that `defineComponent()` is in fact side-effect-free without the need for manual annotations.

- **Guarda anche** [Guida - Using Vue with TypeScript](/guide/typescript/overview#general-usage-notes)

## defineAsyncComponent() {#defineasynccomponent}

Define an async component which is lazy loaded only when it is rendered. The argument can either be a loader function, or an options object for more advanced control of the loading behavior.

- **Tipo**

  ```ts
  function defineAsyncComponent(
    source: AsyncComponentLoader | AsyncComponentOptions
  ): Component

  type AsyncComponentLoader = () => Promise<Component>

  interface AsyncComponentOptions {
    loader: AsyncComponentLoader
    loadingComponent?: Component
    errorComponent?: Component
    delay?: number
    timeout?: number
    suspensible?: boolean
    onError?: (
      error: Error,
      retry: () => void,
      fail: () => void,
      attempts: number
    ) => any
  }
  ```

- **Guarda anche** [Guida - Async Components](/guide/components/async)

## defineCustomElement() {#definecustomelement}

This method accepts the same argument as [`defineComponent`](#definecomponent), but instead returns a native [Custom Element](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) class constructor.

- **Tipo**

  ```ts
  function defineCustomElement(
    component:
      | (ComponentOptions & { styles?: string[] })
      | ComponentOptions['setup']
  ): {
    new (props?: object): HTMLElement
  }
  ```

  > Type is simplified for readability.

- **Dettagli**

  In addition to normal component options, `defineCustomElement()` also supports a special option `styles`, which should be an array of inlined CSS strings, for providing CSS that should be injected into the element's shadow root.

  The return value is a custom element constructor that can be registered using [`customElements.define()`](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define).

- **Esempio**

  ```js
  import { defineCustomElement } from 'vue'

  const MyVueElement = defineCustomElement({
    /* component options */
  })

  // Register the custom element.
  customElements.define('my-vue-element', MyVueElement)
  ```

- **Guarda anche**

  - [Guida - Building Custom Elements with Vue](/guide/extras/web-components#building-custom-elements-with-vue)

  - Also note that `defineCustomElement()` requires [special config](/guide/extras/web-components#sfc-as-custom-element) when used with Single-File Components.
