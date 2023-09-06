# Composition API: <br>Dependency Injection {#composition-api-dependency-injection}

## provide() {#provide}

Fornisce un valore che può essere iniettato dai componenti discendenti.

- **Tipo**

  ```ts
  function provide<T>(key: InjectionKey<T> | string, value: T): void
  ```

- **Dettagli**

  `provide()` richiede due argomenti: la chiave, che può essere una stringa o un simbolo, e il valore da iniettare.

  Quando si utilizza TypeScript, la chiave può essere un simbolo convertito in `InjectionKey` - un tipo di utilità fornito da Vue che estende `Symbol`, il quale può essere utilizzato per sincronizzare il tipo di valore tra `provide()` e `inject()`.

  Simile alle API di registrazione dei hook del ciclo di vita, `provide()` deve essere chiamato sincronamente durante la fase `setup()` di un componente.

- **Esempio**

  ```vue
  <script setup>
  import { ref, provide } from 'vue'
  import { fooSymbol } from './injectionSymbols'

  // fornire un valore statico
  provide('foo', 'bar')

  // fornire un valore reattivo
  const count = ref(0)
  provide('count', count)

  // fornire con chiavi di tipo Symbol
  provide(fooSymbol, count)
  </script>
  ```

- **Vedi anche**
  - [Guide - Provide / Inject](/guide/components/provide-inject)
  - [Guide - Typing Provide / Inject](/guide/typescript/composition-api#typing-provide-inject) <sup class="vt-badge ts" />

## inject() {#inject}

Inietta un valore fornito da un componente ascendente o dall'applicazione (tramite `app.provide()`).

- **Tipo**

  ```ts
  // senza valore predefinito
  function inject<T>(key: InjectionKey<T> | string): T | undefined

  // con valore predefinito
  function inject<T>(key: InjectionKey<T> | string, defaultValue: T): T

  // con factory
  function inject<T>(
    key: InjectionKey<T> | string,
    defaultValue: () => T,
    treatDefaultAsFactory: true
  ): T
  ```

- **Dettagli**

  Il primo argomento è la injection key. Vue risalirà la catena dei padri per individuare un valore fornito con una chiave corrispondente. Se più componenti nella catena dei padri forniscono la stessa chiave, quello più vicino alla injection key "oscurerà" quelli più in alto nella catena. Se non viene trovato alcun valore con chiave corrispondente, `inject()` restituirà `undefined`, a meno che non venga fornito un valore predefinito.

  Il secondo argomento è opzionale ed è il valore predefinito da utilizzare quando non viene trovato alcun valore corrispondente.

  Il secondo argomento può anche essere una funzione factory che restituisce valori costosi da creare. In questo caso, il terzo argomento deve essere passato come `true` per indicare che la funzione deve essere utilizzata come una factory anziché il valore stesso.

  Simile alle API di registrazione dei lifecycle hook, `inject()` deve essere chiamato in modo sincrono durante la fase `setup()` di un componente.

  Quando si utilizza TypeScript, la chiave può essere del tipo `InjectionKey` - un tipo di utilità fornito da Vue che estende `Symbol`, che può essere utilizzato per sincronizzare il tipo di valore tra `provide()` e `inject()`.

- **Esempio**

  Supponeniamo che un componente padre abbia fornito valori come mostrato nell'esempio precedente di `provide()`:

  ```vue
  <script setup>
  import { inject } from 'vue'
  import { fooSymbol } from './injectionSymbols'

  // inietta un valore statico senza default
  const foo = inject('foo')

  // inietta un valore reattivo
  const count = inject('count')

  // inietta con chiavi Symbol
  const foo2 = inject(fooSymbol)

  // inietta con valore predefinito
  const bar = inject('foo', 'valore predefinito')

  // inietta con valore predefinito funzione
  const fn = inject('funzione', () => {})

  // inietta con fabbrica di valore predefinito
  const baz = inject('fabbrica', () => new OggettoCostoso(), true)
  </script>
  ```

- **Vedi anche**
  - [Guide - Provide / Inject](/guide/components/provide-inject)
  - [Guide - Typing Provide / Inject](/guide/typescript/composition-api#typing-provide-inject) <sup class="vt-badge ts" />
