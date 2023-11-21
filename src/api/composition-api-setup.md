# Composition API: setup() {#composition-api-setup}

## Utilizzo Base {#basic-usage}

L'hook `setup()` funge da punto di ingresso per l'uso della Composition API nei componenti nei seguenti casi:

1. Uso della Composition API senza una fase di compilazione;
2. Integrazione con codice basato su Composition API in un componente con Options API.

:::info Note
Se stai utilizzando la Composition API con i Componenti in un Singolo File, è vivamente consigliato utilizzare [`<script setup>`](/api/sfc-script-setup) per una sintassi più concisa ed ergonomica.
:::

Possiamo dichiarare uno stato reattivo utilizzando le [API di reattività](./reactivity-core) ed esporlo al template restituendo un oggetto da `setup()`. Le proprietà dell'oggetto restituito saranno anche accessibili nell'istanza del componente (se vengono utilizzate altre opzioni):

```vue
<script>
import { ref } from 'vue'

export default {
  setup() {
    const count = ref(0)

    // esponi al template e ad altri hook dell'Options API
    return {
      count
    }
  },

  mounted() {
    console.log(this.count) // 0
  }
}
</script>

<template>
  <button @click="count++">{{ count }}</button>
</template>
```

I ([refs](/api/reactivity-core#ref)) restituiti da `setup` vengono [automaticamente scartati a basso livello](/guide/essentials/reactivity-fundamentals#deep-reactivity) quando vengono caricati nel template, quindi non è necessario utilizzare `.value` quando li si accede. Vengono scartati nello stesso modo quando vengono acceduti tramite `this`.

`setup()` stesso non ha accesso all'istanza del componente - `this` avrà un valore `undefined` all'interno del `setup()`. Dalla Composition API puoi accedere ai valori esposti dall'Options API, ma non viceversa.

`setup()` dovrebbe restituire un oggetto in modo _sincrono_. L'unico caso in cui può essere utilizzato `async setup()` è quando il componente è discendente di un componente [Suspense](../guide/built-ins/suspense).

## Accesso alle Props {#accessing-props}

Il primo argomento nella funzione `setup` è l'argomento `props`. Proprio come ci si aspetterebbe in un componente standard, le `props` all'interno di una funzione `setup` sono reattive e si aggiorneranno quando vengono passate nuove props.

```js
export default {
  props: {
    title: String
  },
  setup(props) {
    console.log(props.title)
  }
}
```

Tieni presente che se destrutti l'oggetto `props`, le variabili destrutturate perderanno la reattività. È quindi consigliato accedere sempre alle props nella forma `props.xxx`.

Se hai davvero bisogno di destrutturare le props o devi passare una prop a una funzione esterna mantenendo la reattività, puoi farlo utilizzando le API [toRefs()](./reactivity-utilities#torefs) e [toRef()](/api/reactivity-utilities#toref):

```js
import { toRefs, toRef } from 'vue'

export default {
  setup(props) {
    // trasforma `props` in un oggetto di refs, poi destruttura
    const { title } = toRefs(props)
    // `title` è un ref che tiene traccia di `props.title`
    console.log(title.value)

    // OPPURE, trasforma una singola proprietà in `props` in un ref
    const title = toRef(props, 'title')
  }
}
```

## Setup Context {#setup-context}

Il secondo argomento passato alla funzione `setup` è un oggetto di **Context Setup**. L'oggetto context espone altri valori che potrebbero essere utili all'interno di `setup`:

```js
export default {
  setup(props, context) {
    // Attributi (Oggetto non reattivo, equivalente a $attrs)
    console.log(context.attrs)

    // Slots (Oggetto non reattivo, equivalente a $slots)
    console.log(context.slots)

    // Eventi Emit (Funzione, equivalente a $emit)
    console.log(context.emit)

    // Esporre proprietà pubbliche (Funzione)
    console.log(context.expose)
  }
}
```

L'oggetto context non è reattivo e può essere destrutturato in modo sicuro:

```js
export default {
  setup(props, { attrs, slots, emit, expose }) {
    ...
  }
}
```

`attrs` e `slots` sono stateful objects che vengono sempre aggiornati quando il componente stesso viene aggiornato. Questo significa che dovresti evitare di destrutturarli e fare sempre riferimento alle proprietà come `attrs.x` o `slots.x`. Inoltre, nota che, a differenza di `props`, le proprietà di `attrs` e `slots` **non** sono reattive. Se hai l'intenzione di applicare effetti collaterali basati su modifiche a `attrs` o `slots`, dovresti farlo all'interno di un hook del ciclo di vita `onBeforeUpdate`.

### Esporre Proprietà Pubbliche {#exposing-public-properties}

`expose` è una funzione che può essere utilizzata per limitare esplicitamente le proprietà esposte quando l'istanza del componente è caricata da un componente genitore tramite [template refs](/guide/essentials/template-refs#ref-on-component):

```js{5,10}
export default {
  setup(props, { expose }) {
    // rendi l'istanza "chiusa" -
    // cioè, non esporre nulla al componente genitore
    expose()

    const publicCount = ref(0)
    const privateCount = ref(0)
    // espone selettivamente lo stato locale
    expose({ count: publicCount })
  }
}
```

## Uso con Funzioni di Rendering {#usage-with-render-functions}

`setup` può anche restituire una [funzione di rendering](/guide/extras/render-function) che può utilizzare direttamente lo stato reattivo dichiarato nello stesso scope:

```js{6}
import { h, ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    return () => h('div', count.value)
  }
}
```

Restituire una funzione di rendering impedisce di restituire qualsiasi altra cosa. Internamente questo non dovrebbe essere un problema, ma può essere problematico se vogliamo esporre metodi di questo componente al componente genitore tramite i refs del template.

Possiamo risolvere questo problema chiamando [`expose()`](#exposing-public-properties):

```js{8-10}
import { h, ref } from 'vue'

export default {
  setup(props, { expose }) {
    const count = ref(0)
    const increment = () => ++count.value

    expose({
      increment
    })

    return () => h('div', count.value)
  }
}
```

Il metodo `increment` sarebbe quindi disponibile nel componente genitore tramite un riferimento al template.
