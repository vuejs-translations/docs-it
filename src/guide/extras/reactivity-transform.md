# Trasformazione della reattività (Reactivity Transform) {#reactivity-transform}

:::danger Funzionalità sperimentale deprecata
La trasformazione della reattività (Reactivity Transform) era una funzionalità sperimentale ed è stata deprecata. Si prega di leggere [il ragionamento qui](https://github.com/vuejs/rfcs/discussions/369#discussioncomment-5059028).

Essa verrà rimossa dal core Vue in una versione futura tramite minor release.

- Per rimuoverne l'utilizzo, controlla questo [strumento da riga di comando](https://github.com/edison1105/drop-reactivity-transform) che può automatizzare il processo.
- Se intendi ancora utilizzarlo, ora è disponibile tramite il plugin [Vue Macros](https://vue-macros.sxzz.moe/features/reactivity-transform.html).
:::

:::tip Specifico per la Composition API
La trasformazione della reattività è una funzionalità specifica della Composition API e richiede lo step di compilazione.
:::

## Refs vs Variabili Reattive {#refs-vs-reactive-variables}

Sin dall'introduzione della Composition API, una delle principali domande irrisolte è l'uso dei riferimenti (Refs) rispetto agli oggetti reattivi. È facile perdere reattività quando si destrutturano oggetti reattivi, mentre può essere complicato utilizzare `.value` ovunque quando si utilizzano refs. Inoltre, `.value` è facile da dimenticare se non si utilizza la tipizzazione.

[La trasformazione della reattività con Vue](https://github.com/vuejs/core/tree/main/packages/reactivity-transform) è una trasformazione in fase di compilazione che ci consente di scrivere codice come questo:

```vue
<script setup>
let count = $ref(0)

console.log(count)

function increment() {
  count++
}
</script>

<template>
  <button @click="increment">{{ count }}</button>
</template>
```

Il metodo `$ref()` è una **macro computata in fase di compilazione**: non è un metodo vero e proprio che verrà chiamato in fase di runtime. Invece, il compilatore Vue lo utilizza come suggerimento per trattare la variabile "count" risultante come una **variabile reattiva.**

Le variabili reattive possono essere accedute e riassegnate solamente come le variabili normali, ma queste operazioni vengono compilate in riferimenti (refs) con `.value`. Ad esempio, lo `<script>` del componente che abbiamo visto precedentemente è compilato in:

```js{5,8}
import { ref } from 'vue'

let count = ref(0)

console.log(count.value)

function increment() {
  count.value++
}
```

Ogni API reattiva che restituisce una referenza (refs) avrà una sua macro equivalente richiamabile con il prefisso `$`. Queste API includono:

- [`ref`](/api/reactivity-core#ref) -> `$ref`
- [`computed`](/api/reactivity-core#computed) -> `$computed`
- [`shallowRef`](/api/reactivity-advanced#shallowref) -> `$shallowRef`
- [`customRef`](/api/reactivity-advanced#customref) -> `$customRef`
- [`toRef`](/api/reactivity-utilities#toref) -> `$toRef`

Queste macro sono disponibili a livello globale e non è necessario importarle quando la  trasformazione della reattività (Reactivity Transform) è attiva, ma se vuoi essere più esplicito puoi facoltativamente importarle da `vue/macros`:

```js
import { $ref } from 'vue/macros'

let count = $ref(0)
```

## Destrutturazione con `$()` {#destructuring-with}

È molto comune che una funzione di composizione (composition function) restituisca un oggetto del riferimento (refs) e utilizzi la destrutturazione per recuperare questi riferimenti. A questo scopo, la trasformazione della reattività fornisce la macro **`$()`**:

```js
import { useMouse } from '@vueuse/core'

const { x, y } = $(useMouse())

console.log(x, y)
```

Risultato compilato:

```js
import { toRef } from 'vue'
import { useMouse } from '@vueuse/core'

const __temp = useMouse(),
  x = toRef(__temp, 'x'),
  y = toRef(__temp, 'y')

console.log(x.value, y.value)
```

Tieni presente che se `x` è già un riferimento, `toRef(__temp, 'x')` lo restituirà semplicemente così com'è e non verrà creato alcun riferimento aggiuntivo. Se un valore destrutturato non è un riferimento (ad esempio una funzione), funzionerà comunque: il valore verrà racchiuso in un riferimento in modo che il resto del codice funzioni come previsto.

La destrutturazione `$()` funziona sia su oggetti reattivi e **anche** su oggetti semplici contenenti dei riferimenti.

## Converti i riferimenti esistenti in variabili reattive con `$()`{#convert-existing-refs-to-reactive-variables-with}

In alcuni casi potremmo avere funzioni incapsulate che a loro volta restituiscono delle refs. Tuttavia, il compilatore Vue non sarà in grado di sapere in anticipo se una funzione restituirà un riferimento. In questi casi, la macro `$()` può essere utilizzata anche per convertire eventuali riferimenti esistenti in variabili reattive:

```js
function myCreateRef() {
  return ref(0)
}

let count = $(myCreateRef())
```

## Destrutturare proprietà reattive {#reactive-props-destructure}

Ci sono due punti critici nell'attuale utilizzo di `defineProps()` dentro a `<script setup>`:

1. Come con `.value`, per mantenere la reattività devi sempre accedere alle proprietà (props) come `props.x`. Ciò significa che non puoi destrutturare `defineProps` poiché le variabili destrutturate risultanti non saranno reattive e non si aggiorneranno.

2. Quando utilizzi le [dichiarazioni delle props di un solo tipo](/api/sfc-script-setup#type-only-props-emit-declarations), non esiste un modo semplice per dichiarare i valori predefiniti per le proprietà. Abbiamo introdotto l'API `withDefaults()` proprio per questo scopo, ma il suo uso non è ancora ottimale.

Possiamo risolvere questi problemi applicando una trasformazione in fase di compilazione quando `defineProps` viene utilizzato con la destrutturazione, simile a quello che abbiamo visto in precedenza con `$()`:

```html
<script setup lang="ts">
  interface Props {
    msg: string
    count?: number
    foo?: string
  }

  const {
    msg,
    // valore di default funziona
    count = 1,
    // anche l'aliasing locale funziona
    // qui stiamo trasformando "props.foo" in "bar".
    foo: bar
  } = defineProps<Props>()

  watchEffect(() => {
    // registrerà ogni volta che cambiano gli oggetti di scena
    console.log(msg, count, bar)
  })
</script>
```

Quanto sopra verrà compilato nella seguente dichiarazione equivalente di runtime:

```js
export default {
  props: {
    msg: { type: String, required: true },
    count: { type: Number, default: 1 },
    foo: String
  },
  setup(props) {
    watchEffect(() => {
      console.log(props.msg, props.count, props.foo)
    })
  }
}
```

## Limiti di funzionamento per mantenere la reattività {#retaining-reactivity-across-function-boundaries}

Mentre le variabili reattive da una parte ci sollevano dal compito di dover utilizzare `.value` ovunque, dall'altra creano un problema di "perdita di reattività" quando passiamo variabili reattive oltre i limiti della funzione. Ciò può avvenire in due casi:

### Passaggio in funzione come argomento {#passing-into-function-as-argument}

Data una funzione che prevede un ref come argomento, ad esempio:

```ts
function trackChange(x: Ref<number>) {
  watch(x, (x) => {
    console.log('x changed!')
  })
}

let count = $ref(0)
trackChange(count) // non funziona
```

Il caso precedente non funzionerà come previsto perché viene compilato in:

```ts
let count = ref(0)
trackChange(count.value)
```

Qui `count.value` viene passato come numero, mentre `trackChange` si aspetta un riferimento effettivo. Questo problema può essere risolto racchiudendo `count` con `$$()` prima di passarlo:

```diff
let count = $ref(0)
- trackChange(count)
+ trackChange($$(count))
```

Quanto sopra si compila in:

```js
import { ref } from 'vue'

let count = ref(0)
trackChange(count)
```

Come possiamo vedere, `$$()` è una macro che serve come **via di uscita**: alle variabili reattive all'interno di `$$()` non verrà aggiunto `.value`.

### Ritorno all'interno dell'ambito della funzione {#returning-inside-function-scope}

La reattività può anche andare persa se le variabili reattive vengono utilizzate direttamente in un'espressione nel ritorno della funzione:

```ts
function useMouse() {
  let x = $ref(0)
  let y = $ref(0)

  // ascolta il movimento del mouse...

  // non funziona
  return {
    x,
    y
  }
}
```

L'istruzione "return" precedente viene compilata in:

```ts
return {
  x: x.value,
  y: y.value
}
```

Per mantenere la reattività, dovremmo restituire i riferimenti effettivi, non il valore corrente al momento della restituzione.

Ancora una volta, possiamo usare `$$()` per risolvere questo problema. In questo caso, `$$()` può essere utilizzato direttamente sull'oggetto restituito: qualsiasi riferimento a variabili reattive all'interno della chiamata `$$()` manterrà l'origine del riferimento:

```ts
function useMouse() {
  let x = $ref(0)
  let y = $ref(0)

  // ascolta il movimento del mouse...

  // aggiustato
  return $$({
    x,
    y
  })
}
```

### Usare `$$()` per destrutturare le proprietà {#using-on-destructured-props}

`$$()` funziona su su props destrutturate poiché anch'esse sono variabili reattive. Il compilatore le convertirà con `toRef` per un discorso di ottimizzazione:

```ts
const { count } = defineProps<{ count: number }>()

passAsRef($$(count))
```

compilato in:

```js
setup(props) {
  const __props_count = toRef(props, 'count')
  passAsRef(__props_count)
}
```

## Integrazione in TypeScript <sup class="vt-badge ts" /> {#typescript-integration}

Vue mette a disposizione typings per queste macro (disponibili a livello globale) e funzioneranno come ci si aspetta. Non sono presenti incompatibilità con la semantica TypeScript standard, quindi la sintassi funzionerà con tutti gli strumenti esistenti.

Ciò significa anche che le macro possono funzionare in qualsiasi file in cui sono consentiti JS/TS validi, non solo all'interno degli SFC Vue.

Poiché le macro sono disponibili a livello globale, è necessario fare riferimento esplicitamente ai loro tipi (ad esempio in un file `env.d.ts`):

```ts
/// <reference types="vue/macros-global" />
```

Quando si importano esplicitamente le macro da "vue/macros", il tipo funzionerà senza dichiararlo globalmente.

## Uso esplicito {#explicit-opt-in}

:::warning
Quanto segue si applica solo fino alla versione Vue 3.3 e precedenti. Il supporto principale verrà rimosso nella versione 3.4 e successive. Se intendi continuare a utilizzare la trasformazione, esegui invece la migrazione a [Vue Macros](https://vue-macros.sxzz.moe/features/reactivity-transform.html).
:::

### Vite {#vite}

- Richiede `@vitejs/plugin-vue@>=2.0.0`
- Si applica ai file SFC e js(x)/ts(x). Viene eseguito un rapido controllo dell'utilizzo dei file prima di applicare la trasformazione, pertanto non dovrebbero esserci costi in termini di prestazioni per i file che non utilizzano le macro.
- Nota che `reactivityTransform` è ora un'opzione del plugin a livello root invece che annidata come `script.refSugar`, poiché non influisce solo sugli SFC.

```js
// vite.config.js
export default {
  plugins: [
    vue({
      reactivityTransform: true
    })
  ]
}
```

### `vue-cli` {#vue-cli}

- Attualmente funzionante solo in file SFC
- Richiede `vue-loader@>=17.0.0`

```js
// vue.config.js
module.exports = {
  chainWebpack: (config) => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        return {
          ...options,
          reactivityTransform: true
        }
      })
  }
}
```

### Uso di `webpack` + `vue-loader` {#plain-webpack-vue-loader}

- Attualmente funzionante solo in file SFC
- Richiede `vue-loader@>=17.0.0`

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          reactivityTransform: true
        }
      }
    ]
  }
}
```
