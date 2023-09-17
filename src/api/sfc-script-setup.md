# \<script setup> {#script-setup}

`<script setup>` è uno dei modi per usare la Composition API dentro ai Single-File Components (SFC).  È la sintassi consigliata se stai utilizzando sia i componenti SFC che la Composition API. Fornisce diversi vantaggi rispetto alla normale sintassi `<script>`:

- Codice più succinto con meno boilerplate
- Possibilità di dichiarare props ed eventi emessi usando TypeScript puro
- Migliore performance a runtime (il template viene compilato in una funzione di rendering nello stesso ambito, senza un proxy intermedio)
- Migliore performance di inferenza del tipo nell'IDE (meno lavoro per il language server per estrarre i tipi dal codice)

## Sintassi base {#basic-syntax}

Per aderire a questa sintassi, aggiungi l'attributo `setup` al blocco `<script>`:

```vue
<script setup>
console.log('Ciao, script setup!')
</script>
```

Il codice al suo interno viene compilato come contenuto della funzione `setup()` del componente. Ciò significa che, a differenza di un normale `<script>`, che si esegue solo una volta quando il componente viene importato per la prima volta, il codice all'interno di `<script setup>` verrà eseguito **ogni volta che viene creato un'istanza del componente**.

### I top-level bindings sono esposti al template {#top-level-bindings-are-exposed-to-template}

Quando si utilizza `<script setup>`, tutti i top-level bindings (incluse variabili, dichiarazioni di funzioni e importazioni) definite all'interno di `<script setup>` sono direttamente utilizzabili nel template:

```vue
<script setup>
// variabile
const msg = 'Ciao!'

// funzione
function log() {
  console.log(msg)
}
</script>

<template>
  <button @click="log">{{ msg }}</button>
</template>
```

Le importazioni sono esposte allo stesso modo. Ciò significa che è possibile utilizzare direttamente una funzione di utility importata nelle espressioni del template senza doverla esporre tramite l'opzione `methods`:

```vue
<script setup>
import { capitalize } from './helpers'
</script>

<template>
  <div>{{ capitalize('ciao') }}</div>
</template>
```

## Reattività {#reactivity}

Lo stato reattivo deve essere creato esplicitamente utilizzando le [API di reattività](./reactivity-core). Similmente ai valori restituiti da una funzione `setup()`, i `ref` vengono automaticamente "srotolati" quando vengono referenziati nei template:

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button @click="count++">{{ count }}</button>
</template>
```

## Usando i componenti {#using-components}

I valori nello scope di `<script setup>` possono essere utilizzati direttamente come nomi di tag per i componenti personalizzati:

```vue
<script setup>
import MyComponent from './MyComponent.vue'
</script>

<template>
  <MyComponent />
</template>
```

Pensa a `MyComponent` come se fosse referenziato come una variabile. Se hai utilizzato JSX, il modello mentale è simile qui. L'equivalente in kebab-case `<my-component>` funziona anche nel template, ma è fortemente consigliato utilizzare PascalCase per la coerenza. Ciò aiuta anche a differenziare dagli elementi personalizzati nativi.

### Componenti dinamici {#dynamic-components}

Poiché i componenti sono referenziati come variabili invece che registrati con chiavi di stringa, dovremmo utilizzare il binding dinamico `:is` quando si utilizzano componenti dinamici all'interno di `<script setup>`:

```vue
<script setup>
import Foo from './Foo.vue'
import Bar from './Bar.vue'
</script>

<template>
  <component :is="Foo" />
  <component :is="someCondition ? Foo : Bar" />
</template>
```

Nota come i componenti possono essere utilizzati come variabili in un'espressione ternaria.

### Componenti ricorsivi {#recursive-components}

Un SFC può fare riferimento implicito a se stesso tramite il proprio nome file. Ad esempio, un file chiamato `FooBar.vue` può fare riferimento a se stesso come `<FooBar/>` nel suo template.

Nota che ciò ha una priorità inferiore rispetto ai componenti importati. Se hai un import con nome che entra in conflitto con il nome inferito del componente, puoi creare un alias per l'import:

```js
import { FooBar as FooBarChild } from './components'
```

### Componenti col namespace {#namespaced-components}

Puoi utilizzare tag dei componenti con punti come `<Foo.Bar>` per fare riferimento a componenti annidati sotto proprietà di oggetti. Questo è utile quando importi più componenti da un singolo file:

```vue
<script setup>
import * as Form from './form-components'
</script>

<template>
  <Form.Input>
    <Form.Label>label</Form.Label>
  </Form.Input>
</template>
```

## Usando direttive personalizzate {#using-custom-directives}

L'uso di direttive personalizzate globalmente registrate funziona normalmente. Le direttive personalizzate locali non devono essere registrate esplicitamente con `<script setup>`, ma devono seguire lo schema di denominazione `vNameOfDirective`:

```vue
<script setup>
const vMyDirective = {
  beforeMount: (el) => {
    // fai qualcosa con l'elemento
  }
}
</script>
<template>
  <h1 v-my-directive>Questo è un titolo</h1>
</template>
```

Se stai importando una direttiva da altrove, puoi rinominarla per adattarla allo schema di denominazione richiesto:

```vue
<script setup>
import { myDirective as vMyDirective } from './MyDirective.js'
</script>
```

## defineProps() & defineEmits() {#defineprops-defineemits}

Per dichiarare opzioni come `props` and `emits` con il supporto completo per l'inferenza dei tipi, possiamo utilizzare le API `defineProps` e `defineEmits`, che sono disponibili automaticamente all'interno di `<script setup>`:

```vue
<script setup>
const props = defineProps({
  foo: String
})

const emit = defineEmits(['change', 'delete'])
// codice di setup
</script>
```

- `defineProps` and `defineEmits` are **compiler macros** only usable inside `<script setup>`. They do not need to be imported, and are compiled away when `<script setup>` is processed.

- `defineProps` accepts the same value as the `props` option, while `defineEmits` accepts the same value as the `emits` option.

- `defineProps` and `defineEmits` provide proper type inference based on the options passed.

- The options passed to `defineProps` and `defineEmits` will be hoisted out of setup into module scope. Therefore, the options cannot reference local variables declared in setup scope. Doing so will result in a compile error. However, it _can_ reference imported bindings since they are in the module scope as well.

### Type-only props/emit declarations<sup class="vt-badge ts" /> {#type-only-props-emit-declarations}

Props and emits can also be declared using pure-type syntax by passing a literal type argument to `defineProps` or `defineEmits`:

```ts
const props = defineProps<{
  foo: string
  bar?: number
}>()

const emit = defineEmits<{
  (e: 'change', id: number): void
  (e: 'update', value: string): void
}>()

// 3.3+: alternative, more succinct syntax
const emit = defineEmits<{
  change: [id: number] // named tuple syntax
  update: [value: string]
}>()
```

- `defineProps` or `defineEmits` can only use either runtime declaration OR type declaration. Using both at the same time will result in a compile error.

- When using type declaration, the equivalent runtime declaration is automatically generated from static analysis to remove the need for double declaration and still ensure correct runtime behavior.

  - In dev mode, the compiler will try to infer corresponding runtime validation from the types. For example here `foo: String` is inferred from the `foo: string` type. If the type is a reference to an imported type, the inferred result will be `foo: null` (equal to `any` type) since the compiler does not have information of external files.

  - In prod mode, the compiler will generate the array format declaration to reduce bundle size (the props here will be compiled into `['foo', 'bar']`)

- In version 3.2 and below, the generic type parameter for `defineProps()` were limited to a type literal or a reference to a local interface.

  This limitation has been resolved in 3.3. The latest version of Vue supports referencing imported and a limited set of complex types in the type parameter position. However, because the type to runtime conversion is still AST-based, some complex types that require actual type analysis, e.g. conditional types, are not supported. You can use conditional types for the type of a single prop, but not the entire props object.

### Default props values when using type declaration {#default-props-values-when-using-type-declaration}

One drawback of the type-only `defineProps` declaration is that it doesn't have a way to provide default values for the props. To resolve this problem, a `withDefaults` compiler macro is also provided:

```ts
export interface Props {
  msg?: string
  labels?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  msg: 'Ciao',
  labels: () => ['one', 'two']
})
```

This will be compiled to equivalent runtime props `default` options. In addition, the `withDefaults` helper provides type checks for the default values, and ensures the returned `props` type has the optional flags removed for properties that do have default values declared.

## defineExpose() {#defineexpose}

Components using `<script setup>` are **closed by default** - i.e. the public instance of the component, which is retrieved via template refs or `$parent` chains, will **not** expose any of the bindings declared inside `<script setup>`.

To explicitly expose properties in a `<script setup>` component, use the `defineExpose` compiler macro:

```vue
<script setup>
import { ref } from 'vue'

const a = 1
const b = ref(2)

defineExpose({
  a,
  b
})
</script>
```

When a parent gets an instance of this component via template refs, the retrieved instance will be of the shape `{ a: number, b: number }` (refs are automatically unwrapped just like on normal instances).

## defineOptions() {#defineoptions}

This macro can be used to declare component options directly inside `<script setup>` without having to use a separate `<script>` block:

```vue
<script setup>
defineOptions({
  inheritAttrs: false,
  customOptions: {
    /* ... */
  }
})
</script>
```

- Only supported in 3.3+.
- This is a macro. The options will be hoisted to module scope and cannot access local variables in `<script setup>` that are not literal constants.

## defineSlots()<sup class="vt-badge ts"/> {#defineslots}

This macro can be used to provide type hints to IDEs for slot name and props type checking.

`defineSlots()` only accepts a type parameter and no runtime arguments. The type parameter should be a type literal where the property key is the slot name, and the value type is the slot function. The first argument of the function is the props the slot expects to receive, and its type will be used for slot props in the template. The return type is currently ignored and can be `any`, but we may leverage it for slot content checking in the future.

It also returns the `slots` object, which is equivalent to the `slots` object exposed on the setup context or returned by `useSlots()`.

```vue
<script setup lang="ts">
const slots = defineSlots<{
  default(props: { msg: string }): any
}>()
</script>
```

- Only supported in 3.3+.

## `useSlots()` & `useAttrs()` {#useslots-useattrs}

Usage of `slots` and `attrs` inside `<script setup>` should be relatively rare, since you can access them directly as `$slots` and `$attrs` in the template. In the rare case where you do need them, use the `useSlots` and `useAttrs` helpers respectively:

```vue
<script setup>
import { useSlots, useAttrs } from 'vue'

const slots = useSlots()
const attrs = useAttrs()
</script>
```

`useSlots` and `useAttrs` are actual runtime functions that return the equivalent of `setupContext.slots` and `setupContext.attrs`. They can be used in normal composition API functions as well.

## Usage alongside normal `<script>` {#usage-alongside-normal-script}

`<script setup>` can be used alongside normal `<script>`. A normal `<script>` may be needed in cases where we need to:

- Declare options that cannot be expressed in `<script setup>`, for example `inheritAttrs` or custom options enabled via plugins (Can be replaced by [`defineOptions`](/api/sfc-script-setup#defineoptions) in 3.3+).
- Declaring named exports.
- Run side effects or create objects that should only execute once.

```vue
<script>
// normal <script>, executed in module scope (only once)
runSideEffectOnce()

// declare additional options
export default {
  inheritAttrs: false,
  customOptions: {}
}
</script>

<script setup>
// executed in setup() scope (for each instance)
</script>
```

Support for combining `<script setup>` and `<script>` in the same component is limited to the scenarios described above. Specifically:

- Do **NOT** use a separate `<script>` section for options that can already be defined using `<script setup>`, such as `props` and `emits`.
- Variables created inside `<script setup>` are not added as properties to the component instance, making them inaccessible from the Options API. Mixing APIs in this way is strongly discouraged.

If you find yourself in one of the scenarios that is not supported then you should consider switching to an explicit [`setup()`](/api/composition-api-setup) function, instead of using `<script setup>`.

## Top-level `await` {#top-level-await}

Top-level `await` can be used inside `<script setup>`. The resulting code will be compiled as `async setup()`:

```vue
<script setup>
const post = await fetch(`/api/post/1`).then((r) => r.json())
</script>
```

In addition, the awaited expression will be automatically compiled in a format that preserves the current component instance context after the `await`.

:::warning Note
`async setup()` must be used in combination with `Suspense`, which is currently still an experimental feature. We plan to finalize and document it in a future release - but if you are curious now, you can refer to its [tests](https://github.com/vuejs/core/blob/main/packages/runtime-core/__tests__/components/Suspense.spec.ts) to see how it works.
:::

## Generics <sup class="vt-badge ts" /> {#generics}

Generic type parameters can be declared using the `generic` attribute on the `<script>` tag:

```vue
<script setup lang="ts" generic="T">
defineProps<{
  items: T[]
  selected: T
}>()
</script>
```

The value of `generic` works exactly the same as the parameter list between `<...>` in TypeScript. For example, you can use multiple parameters, `extends` constraints, default types, and reference imported types:

```vue
<script
  setup
  lang="ts"
  generic="T extends string | number, U extends Item"
>
import type { Item } from './types'
defineProps<{
  id: T
  list: U[]
}>()
</script>
```

## Restrictions {#restrictions}

Due to the difference in module execution semantics, code inside `<script setup>` relies on the context of an SFC. When moved into external `.js` or `.ts` files, it may lead to confusion for both developers and tools. Therefore, **`<script setup>`** cannot be used with the `src` attribute.
