---
pageClass: api
---

# Componenti integrati {#componenti-integrati}

:::info Registrazione e uso
I componenti integrati possono essere usati direttamente nel template senza essere registrati. Sono anche tree-shakeable: sono inclusi nella build solamente quando sono utilizzati.

Quando usati nelle [render functions](/guide/extras/render-function), devono essere importati esplicitamente. Per esempio:

```js
import { h, Transition } from 'vue'

h(Transition, {
  /* props */
})
```

:::

## `<Transition>` {#transition}

Fornisce un'animazione di transizione a un **solo** elemento o componente.

- **Props**

  ```ts
  interface TransitionProps {
    /**
     * Usato per generare automaticamente classi CSS per le transizioni.
     * Per esempio `name: 'fade'` verrà automaticamente espanso in `.fade-enter`,
     * `.fade-enter-active`, etc.
     */
    name?: string
    /**
     * Definisce se applicare le classi di transizione CSS.
     * Predefinito: true
     */
    css?: boolean
    /**
     * Specifica il tipo di evento di transizione da attendere
     * per determinare la tempistica della fine della transizione.
     * Il comportamento predefinito rileva automaticamente il tipo che ha
     * la durata maggiore.
     */
    type?: 'transition' | 'animation'
    /**
     * Specifica esplicitamente la durata della transizione.
     * Il comportamento predefinito è di attendere il primo evento
     * `transitionend` o `animationend` nel root dell'elemento transition.
     */
    duration?: number | { enter: number; leave: number }
    /**
     * Controlla la sequenza temporale delle transizioni di uscita/entrata.
     * Il comportamento predefinito è simultaneo
     */
    mode?: 'in-out' | 'out-in' | 'default'
    /**
     * Definisce se applicare la transizione al rendering iniziale.
     * Predefinito: false
     */
    appear?: boolean

    /**
     * Props per personalizzare le classi di transizione.
     * Usa il kebab-case nei template, per esempio enter-from-class="xxx"
     */
    enterFromClass?: string
    enterActiveClass?: string
    enterToClass?: string
    appearFromClass?: string
    appearActiveClass?: string
    appearToClass?: string
    leaveFromClass?: string
    leaveActiveClass?: string
    leaveToClass?: string
  }
  ```

- **Eventi**

  - `@before-enter`
  - `@before-leave`
  - `@enter`
  - `@leave`
  - `@appear`
  - `@after-enter`
  - `@after-leave`
  - `@after-appear`
  - `@enter-cancelled`
  - `@leave-cancelled` (solo `v-show`)
  - `@appear-cancelled`

- **Esempio**

  Elemento semplice:

  ```vue-html
  <Transition>
    <div v-if="ok">contenuto attivato</div>
  </Transition>
  ```

  Forzare una transizione cambiando l'attributo `key`:

  ```vue-html
  <Transition>
    <div :key="text">{{ text }}</div>
  </Transition>
  ```

  Componente dinamico, con modalità di transizione + animazione in entrata:

  ```vue-html
  <Transition name="fade" mode="out-in" appear>
    <component :is="view"></component>
  </Transition>
  ```

  Ascolto eventi transizione:

  ```vue-html
  <Transition @after-enter="onTransitionComplete">
    <div v-show="ok">toggled content</div>
  </Transition>
  ```

- **Vedi anche** [Guida `<Transition>`](/guide/built-ins/transition)

## `<TransitionGroup>` {#transitiongroup}

Fornisce effetti di transizione per elementi **multipli** o componenti in un elenco.

- **Props**

  `<TransitionGroup>` accetta le stesse props di `<Transition>` tranne `mode`, più due prop aggiuntive:

  ```ts
  interface TransitionGroupProps extends Omit<TransitionProps, 'mode'> {
    /**
     * Se non definito, renderizza come un fragment
     */
    tag?: string
    /**
     * Per personalizzare la classe CSS applicata durante la transizione.
     * Usa il kebab-case nel template, per esempio move-class="xxx"
     */
    moveClass?: string
  }
  ```

- **Eventi**

  `<TransitionGroup>` emette gli stessi eventi di `<Transition>`.

- **Dettagli**

  Di default, `<TransitionGroup>` non renderizza un elemento DOM wrapper, ma uno può essere definito attraverso la prop `tag`.

  Nota che ogni figlio in `<transition-group>` deve avere una [**chiave univoca**](/guide/essentials/list#maintaining-state-with-key) per l'animazione per funzionare correttamente.

  `<TransitionGroup>` supporta le transizioni tramite trasformazione CSS. Quando la posizione di un figlio nello schermo cambia dopo un aggiornamento, gli verrà applicata una classe CSS di movimento (generata automaticamente dall'attributo `name` o configurato con la prop `move-class`). Se la proprietà CSS `transform` è "transition-able" quando la classe di movimento è applicata, l'elemento verrà animato fluidamente alla sua destinazione usando la [tecnica FLIP](https://aerotwist.com/blog/flip-your-animations/).

- **Esempio**

  ```vue-html
  <TransitionGroup tag="ul" name="slide">
    <li v-for="item in items" :key="item.id">
      {{ item.text }}
    </li>
  </TransitionGroup>
  ```

- **Vedi anche** [Guida - TransitionGroup](/guide/built-ins/transition-group)

## `<KeepAlive>` {#keepalive}

Memorizza nella cache i componenti attivati/disattivati ​​dinamicamente racchiusi all'interno.

- **Props**

  ```ts
  interface KeepAliveProps {
    /**
     * Se specificata, solo i componenti con gli stessi nomi corrispondenti a 
     * `include` saranno memorizzati nella cache.
     */
    include?: MatchPattern
    /**
     * Qualsiasi componente con un nome corrispondente a `exclude`
     * non verrà memorizzato nella cache.
     */
    exclude?: MatchPattern
    /**
     * Il numero massimo di istanze del componente da memorizzare nella cache.
     */
    max?: number | string
  }

  type MatchPattern = string | RegExp | (string | RegExp)[]
  ```

- **Dettagli**

  Quando racchiuso in un componente dinamico, `<KeepAlive>` memorizza nella cache le istanze dei componenti inattivi senza distruggerle.

  Ci può essere solo un'istanza di un componente come figlio diretto di `<KeepAlive>` in qualsiasi momento.

  Quando un componente è azionato dentro `<KeepAlive>`, i suoi lifecycle hooks `activated` e `deactivated` verranno richiamati di conseguenza, offrendo un alternativa a `mounted` e `unmounted`, che non sono chiamati. Questo si applica ai figli diretti di `<KeepAlive>` e anche a tutti i suoi discendenti.

- **Esempio**

  Utilizzo Base:

  ```vue-html
  <KeepAlive>
    <component :is="view"></component>
  </KeepAlive>
  ```
  Quando usato con `v-if` / `v-else`, ci deve essere solo un componente renderizzato alla volta:

  ```vue-html
  <KeepAlive>
    <comp-a v-if="a > 1"></comp-a>
    <comp-b v-else></comp-b>
  </KeepAlive>
  ```
  Usato insieme a `<Transition>`:

  ```vue-html
  <Transition>
    <KeepAlive>
      <component :is="view"></component>
    </KeepAlive>
  </Transition>
  ```
  Usando `include` / `exclude`: 

  ```vue-html
  <!-- stringa con delimitatore virgola -->
  <KeepAlive include="a,b">
    <component :is="view"></component>
  </KeepAlive>

  <!-- regex (usando `v-bind`) -->
  <KeepAlive :include="/a|b/">
    <component :is="view"></component>
  </KeepAlive>

  <!-- Array (usando `v-bind`) -->
  <KeepAlive :include="['a', 'b']">
    <component :is="view"></component>
  </KeepAlive>
  ```
  Utilizzo con `max`:

  ```vue-html
  <KeepAlive :max="10">
    <component :is="view"></component>
  </KeepAlive>
  ```

- **Vedi anche** [Guida - KeepAlive](/guide/built-ins/keep-alive)

## `<Teleport>` {#teleport}

Renderizza il contenuto dello slot in un' altra parte del DOM.

- **Props**

  ```ts
  interface TeleportProps {
    /**
     * Obbligatoria. Specifica il container di destinazione.
     * Può essere sia un selettore o un elemento reale.
     */
    to: string | HTMLElement
    /**
     * Quando `true`, il contenuto resterà nella posizione
     * originale invece di essere spostato nel container di destinazione.
     * Può essere cambiato dinamicamente.
     */
    disabled?: boolean
  }
  ```

- **Esempio**

  Specificando un container di destinazione

  ```vue-html
  <teleport to="#some-id" />
  <teleport to=".some-class" />
  <teleport to="[data-teleport]" />
  ```
  Disabilitazione condizionale:

  ```vue-html
  <teleport to="#popup" :disabled="displayVideoInline">
    <video src="./my-movie.mp4">
  </teleport>
  ```

- **Vedi anche** [Guida - Teleport](/guide/built-ins/teleport)

## `<Suspense>` <sup class="vt-badge experimental" /> {#suspense}

Usato per orchestrare dipendenze asincrone annidate in un albero di componenti.

- **Props**

  ```ts
  interface SuspenseProps {
    timeout?: string | number
  }
  ```

- **Eventi**

  - `@resolve`
  - `@pending`
  - `@fallback`

- **Dettagli**

  `<Suspense>` accetta due slots: lo slot di `#default` e lo slot `#fallback`. Mostrerà il contenuto dello slot di fallback mentre renderizza lo slot default in memoria.

  Se incontra dipendenze asincrone ([Componente asincrono](/guide/components/async) e componenti con [`async setup()`](/guide/built-ins/suspense#async-setup)) mentre renderizza lo slot di default, aspetterà fino a quando tutti sono risolti prima di visualizzare lo slot di default.

- **Vedi anche** [Guida - Suspense](/guide/built-ins/suspense)
