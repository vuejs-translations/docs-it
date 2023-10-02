# Reactivity API: Utilities {#reactivity-api-utilities}

## isRef() {#isref}

Verifica se un valore è un oggetto ref.

- **Tipo**

  ```ts
  function isRef<T>(r: Ref<T> | unknown): r is Ref<T>
  ```

  Nota: il tipo di ritorno è un [type predicate](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates), il che significa che `isRef` può essere utilizzato come type guard:

  ```ts
  let foo: unknown
  if (isRef(foo)) {
    // il tipo di foo è ora limitato a Ref<unknown>
    foo.value
  }
  ```

## unref() {#unref}

Restituisce il valore interno se l'argomento è un ref, altrimenti restituisce l'argomento stesso. Questa è una funzione di "zucchero sintattico" equivalente a `val = isRef(val) ? val.value : val`.

- **Tipo**

  ```ts
  function unref<T>(ref: T | Ref<T>): T
  ```

- **Esempio**

  ```ts
  function useFoo(x: number | Ref<number>) {
    const unwrapped = unref(x)
    // unwrapped è certo che sia ora un numero
  }
  ```

## toRef() {#toref}

Può essere utilizzato per normalizzare value / ref / getter nei ref (3.3+).

Può anche essere utilizzato per creare un ref per una proprietà su un oggetto reattivo sorgente. Il ref creato è sincronizzato con la proprietà di origine: la modifica della proprietà di origine aggiornerà il ref e viceversa.

- **Tipo**

  ```ts
  // firma di normalizzazione (3.3+)
  function toRef<T>(
    value: T
  ): T extends () => infer R
    ? Readonly<Ref<R>>
    : T extends Ref
    ? T
    : Ref<UnwrapRef<T>>

  // firma della proprietà dell'oggetto
  function toRef<T extends object, K extends keyof T>(
    object: T,
    key: K,
    defaultValue?: T[K]
  ): ToRef<T[K]>

  type ToRef<T> = T extends Ref ? T : Ref<T>
  ```

- **Esempio**

  Firma di normalizzazione (3.3+):

  ```js
  // restituisce i ref esistenti così come sono
  toRef(existingRef)

  // crea un ref in sola lettura che chiama il getter su accesso a .value
  toRef(() => props.foo)

  // crea ref normali da valori non funzione
  // equivalente a ref(1)
  toRef(1)
  ```

  Firma della proprietà dell'oggetto:

  ```js
  const state = reactive({
    foo: 1,
    bar: 2
  })

  // un ref bidirezionale che si sincronizza con la proprietà originale
  const fooRef = toRef(state, 'foo')

  // la modifica del ref aggiorna l'originale
  fooRef.value++
  console.log(state.foo) // 2

  // la modifica dell'originale aggiorna anche il ref
  state.foo++
  console.log(fooRef.value) // 3
  ```

  Nota che ciò è diverso da:

  ```js
  const fooRef = ref(state.foo)
  ```

  Il ref sopra **non** è sincronizzato con `state.foo`, perchè `ref()` riceve un valore numerico semplice.

  `toRef()`  è utile quando si desidera passare il ref di una prop a una funzione composable:

  ```vue
  <script setup>
  import { toRef } from 'vue'

  const props = defineProps(/* ... */)

  // converti `props.foo` in un ref, poi passalo a
  // una funzione componibile
  useSomeFeature(toRef(props, 'foo'))

  // sintassi getter - consigliata in 3.3+
  useSomeFeature(toRef(() => props.foo))
  </script>
  ```

  Quando `toRef` viene utilizzato con le prop del componente, si applicano comunque le solite restrizioni sulla modifica delle prop. Tentare di assegnare un nuovo valore al ref è equivalente a cercare di modificare direttamente la prop e non è consentito. In questo scenario potrebbe essere utile considerare l'uso di [`computed`](./reactivity-core#computed) con `get` e `set` al loro posto. Consulta la guida su [usare `v-model` con i componenti](/guide/components/v-model) per maggiori informazioni.

  Quando viene utilizzata la firma della proprietà dell'oggetto, `toRef()`restituirà un ref utilizzabile anche se la proprietà di origine non esiste attualmente. Ciò consente di lavorare con proprietà opzionali, che non verrebbero rilevate da [`toRefs`](#torefs).

## toValue() <sup class="vt-badge" data-text="3.3+" /> {#tovalue}

Normalizza valori / ref / getter in valori. Questo è simile a [unref()](#unref), tranne che normalizza anche i getter. Se l'argomento è un getter, verrà invocato e il suo valore di ritorno verrà restituito.

Può essere utilizzato nei [Composables](/guide/reusability/composables.html) per normalizzare un argomento che può essere un valore, un ref o un getter.

- **Tipo**

  ```ts
  function toValue<T>(source: T | Ref<T> | (() => T)): T
  ```

- **Esempio**

  ```js
  toValue(1) //       --> 1
  toValue(ref(1)) //  --> 1
  toValue(() => 1) // --> 1
  ```

  Normalizzazione degli argomenti nei composables:

  ```ts
  import type { MaybeRefOrGetter } from 'vue'

  function useFeature(id: MaybeRefOrGetter<number>) {
    watch(() => toValue(id), id => {
      // reagisce ai cambiamenti di id
    })
  }

  // questo composable supporta uno qualsiasi dei seguenti:
  useFeature(1)
  useFeature(ref(1))
  useFeature(() => 1)
  ```

## toRefs() {#torefs}

Converte un oggetto reattivo in un oggetto semplice in cui ogni proprietà dell'oggetto risultante è un ref che punta alla corrispondente proprietà dell'oggetto originale. Ciascun ref individuale è creato utilizzando [`toRef()`](#toref).

- **Tipo**

  ```ts
  function toRefs<T extends object>(
    object: T
  ): {
    [K in keyof T]: ToRef<T[K]>
  }

  type ToRef = T extends Ref ? T : Ref<T>
  ```

- **Esempio**

  ```js
  const state = reactive({
    foo: 1,
    bar: 2
  })

  const stateAsRefs = toRefs(state)
  /*
  Tipo di stateAsRefs: {
    foo: Ref<number>,
    bar: Ref<number>
  }
  */

  // Il ref e la proprietà originale sono "collegati"
  state.foo++
  console.log(stateAsRefs.foo.value) // 2

  stateAsRefs.foo.value++
  console.log(state.foo) // 3
  ```

  `toRefs` è utile quando si restituisce un oggetto reattivo da una funzione componibile in modo che il componente consumatore possa decostruire/spargere l'oggetto restituito senza perdere la reattività:

  ```js
  function useFeatureX() {
    const state = reactive({
      foo: 1,
      bar: 2
    })

    // ...logica che opera sullo state

    // converti in ref quando viene fatto il return
    return toRefs(state)
  }

  // può essere destrutturato senza perdere la reattività
  const { foo, bar } = useFeatureX()
  ```

  `toRefs` genererà refs solo per le proprietà che sono enumerabili sull'oggetto sorgente al momento della chiamata. Per creare un ref per una proprietà che potrebbe non ancora esistere, utilizzare [`toRef`](#toref) al suo posto.

## isProxy() {#isproxy}

Verifica se un oggetto è un proxy creato da [`reactive()`](./reactivity-core#reactive), [`readonly()`](./reactivity-core#readonly), [`shallowReactive()`](./reactivity-advanced#shallowreactive) o [`shallowReadonly()`](./reactivity-advanced#shallowreadonly).

- **Tipo**

  ```ts
  function isProxy(value: unknown): boolean
  ```

## isReactive() {#isreactive}

Verifica se un oggetto è un proxy creato da [`reactive()`](./reactivity-core#reactive) o [`shallowReactive()`](./reactivity-advanced#shallowreactive).

- **Tipo**

  ```ts
  function isReactive(value: unknown): boolean
  ```

## isReadonly() {#isreadonly}

Verifica se il valore passato è un oggetto di sola lettura. Le proprietà di un oggetto di sola lettura possono cambiare, ma non possono essere assegnate direttamente tramite l'oggetto passato.

I proxy creati da [`readonly()`](./reactivity-core#readonly) e [`shallowReadonly()`](./reactivity-advanced#shallowreadonly) ono entrambi considerati di sola lettura, così come un ref [`computed()`](./reactivity-core#computed) ref senza la funzione `set`.

- **Tipo**

  ```ts
  function isReadonly(value: unknown): boolean
  ```
