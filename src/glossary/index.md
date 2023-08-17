# Glossario {#glossary}

Questo glossario ha lo scopo di fornire una guida al significato dei termini tecnici usati abitualmente quando si parla di Vue. È pensato per *descrivere* come questi termini vengano utilizzati di solito, non per essere una *prescrizione* di come dovrebbero essere utilizzati. Alcuni termini potrebbero avere significati o sfumature leggermente diverse a seconda del contesto che li circonda.

[[TOC]]

## componente asincrono {#async-component}

Un *componente asincrono* (*async component*) è un contenitore che racchiude un altro componente e che permette al componente racchiuso di essere caricato in modo "lazy" (lazy loaded, "pigro"). Questo metodo viene utilizzato tipicamente per ridurre la dimensione dei file `.js` generati, permettendo di suddividerli in frammenti più piccoli che vengono caricati solo quando necessario.

Vue Router ha una funzionalità simile per il [caricamento lazy dei route components](https://router.vuejs.org/guide/advanced/lazy-loading.html), anche se questa non utilizza la funzionalità degli async components di Vue.

Per maggiori dettagli consulta:
- [Guida - Componenti asincroni](/guide/components/async.html)

## macro del compilatore {#compiler-macro}

Una *macro del compilatore* (*compiler macro*) è un codice speciale che viene elaborato da un compilatore e convertito in qualcos'altro. Si tratta effettivamente di un modo intelligente di sostituzione di stringhe.

Il compilatore [SFC](#single-file-component) di Vue supporta varie macro, come `defineProps()`, `defineEmits()` e `defineExpose()`. Queste macro sono progettate con l'intenzione di sembrare delle normali funzioni JavaScript, così da poter sfruttare lo stesso parser e gli strumenti di type inference di JavaScript/TypeScript. Tuttavia, non sono delle vere funzioni che vengono eseguite nel browser. Si tratta di stringhe speciali che il compilatore rileva e sostituisce con il vero codice JavaScript che verrà effettivamente eseguito.

Le macro hanno limitazioni sul loro uso che non si applicano al normale codice JavaScript. Ad esempio, potresti pensare che `const dp = defineProps` ti permetta di creare un alias per `defineProps`, ma ciò si tradurrebbe in un errore. Ci sono anche limitazioni sui valori che possono essere passati a `defineProps()`, poiché gli 'argomenti' devono essere elaborati dal compilatore e non a runtime.

Per maggiori dettagli consulta:
- [`<script setup>` - `defineProps()` & `defineEmits()`](/api/sfc-script-setup.html#defineprops-defineemits)
- [`<script setup>` - `defineExpose()`](/api/sfc-script-setup.html#defineexpose)

## componente {#component}

Il termine *componente* (*component*) non è unico di Vue. È comune a molti framework UI. Descrive una parte della UI, come un pulsante o una casella di spunta. I componenti possono anche essere combinati per formare componenti più grandi.

I componenti sono il principale meccanismo fornito da Vue per suddividere un'interfaccia utente in parti più piccole, sia per migliorare la manutenibilità che per permettere il riutilizzo del codice.

Un componente Vue è un oggetto. Tutte le proprietà sono opzionali, ma è richiesto o un template o una render function (funzione di rendering) affinché il componente possa essere visualizzato. Ad esempio, l'oggetto seguente potrebbe essere un componente valido:

```js
const HelloWorldComponent = {
  render() {
    return 'Ciao Mondo!'
  }
}
```

In pratica, la maggior parte delle applicazioni Vue sono scritte usando [Componenti Single-File](#single-file-component) (file `.vue`). Anche se questi componenti potrebbero non sembrare oggetti a prima vista, il compilatore SFC li convertirà in un oggetto, che viene utilizzato come export predefinito per il file. Da una prospettiva esterna, un file `.vue` è solo un modulo ES che esporta un oggetto del componente.

Le proprietà di un oggetto del componente sono solitamente chiamate *opzioni*. Da qui il nome [Options API](#options-api).

Le opzioni per un componente definiscono come dovrebbero essere create le istanze di quel componente. I componenti sono concettualmente simili alle classi, anche se Vue non usa vere classi JavaScript per definirli.

Il termine componente può anche essere utilizzato in modo più generico per riferirsi alle istanze dei componenti.

Per maggiori dettagli consulta:
- [Guida - Nozioni base sui Componenti](/guide/essentials/component-basics.html)

La parola 'componente' appare anche in vari altri termini:
- [componente asincrono](#async-component)
- [componente dinamico](#dynamic-component)
- [componente funzionale](#functional-component)
- [Web Component](#web-component)

## composable {#composable}

Il termine *composable* descrive un patter molto comune in Vue. Non è una caratteristica separata di Vue, ma solo un modo di utilizzare la [Composition API](#composition-api) del framework.

* Un composable è una funzione.
* I composables sono usati per incapsulare e riutilizzare la logica stateful.
* Il nome della funzione di solito inizia con `use`, in modo che gli altri sviluppatori sappiano che è un composable.
* Ci si aspetta che la funzione venga chiamata durante l'esecuzione sincrona della funzione `setup()` di un componente (o, in modo equivalente, durante l'esecuzione di un blocco `<script setup>`). Questo collega l'invocazione del composable al contesto del componente corrente, ad es. tramite chiamate a `provide()`, `inject()` o `onMounted()`.
* I composables di solito restituiscono un oggetto semplice, non un oggetto reattivo. Questo oggetto di solito contiene refs e funzioni ed è previsto che venga destrutturato all'interno del codice chiamante.

Come per molti modelli, può esserci disaccordo su fatto che se un codice specifico sia identificato per l'etichetta. Non tutte le utility functions JavaScript sono composables. Se una funzione non utilizza la Composition API, probabilmente non è un composable. Se non ci si aspetta che venga chiamata durante l'esecuzione sincrona di `setup()`, probabilmente non è un composable. I composables sono usati specificamente per incapsulare la logica stateful (con stato), non sono solo una convenzione per etichettare le funzioni.

Consulta [Guida - I Composables](/guide/reusability/composables.html) per ulteriori dettagli sulla scrittura di composables.

## Composition API {#composition-api}

La *Composition API* è una raccolta di funzioni utilizzate per scrivere componenti e composables in Vue.

Il termine viene anche utilizzato per descrivere uno dei due principali stili utilizzati per scrivere componenti, mentre l'altro sarebbe l'[Options API](#options-api). I componenti scritti utilizzando la Composition API usano o `<script setup>` o una funzione `setup()` esplicita.

Consulta le [FAQ sulla Composition API](/guide/extras/composition-api-faq) per ulteriori dettagli.

## elemento personalizzato {#custom-element}

Un *elemento personalizzato* (*custom element*) è una caratteristica dello standard dei [Web Components](#web-component), che è implementato nei moderni browser web. Si riferisce alla capacità di utilizzare un elemento HTML personalizzato nel proprio markup HTML per includere un Web Component in quel punto della pagina.

Vue ha il supporto nativo per la resa di elementi personalizzati e permette di utilizzarli direttamente nei template dei componenti Vue.

Gli elementi personalizzati non devono essere confusi con la capacità di includere componenti Vue come tag all'interno del template di un altro componente Vue. Gli elementi personalizzati sono utilizzati per creare Web Component, non componenti Vue.

Per maggiori dettagli consulta:
- [Guida - Vue e i Web Components](/guide/extras/web-components.html)

## direttiva {#directive}

Il termine *direttiva* (*directive*) si riferisce agli attributi del template che iniziano con il prefisso `v-`, o ai loro equivalenti abbreviati.

Le direttive native includono `v-if`, `v-for`, `v-bind`, `v-on` e `v-slot`.

Vue supporta anche la creazione di direttive personalizzate, anche se sono tipicamente utilizzate solo come "ultima via d'uscita", un modo per manipolare direttamente i nodi del DOM. In generale, le direttive personalizzate non possono essere utilizzate per ricreare la funzionalità delle direttive native.

Per maggiori dettagli consulta:
- [Guida - La Sintassi del Template - Le Directtive](/guide/essentials/template-syntax.html#directives)
- [Guida - Le Direttive Personalizzate](/guide/reusability/custom-directives.html)

## componente dinamico {#dynamic-component}

Il termine *componente dinamico* (*dynamic component*) viene utilizzato per descrivere quei casi in cui la scelta di quale componente figlio renderizzare deve essere fatta dinamicamente. Tipicamente, ciò viene ottenuto utilizzando `<component :is="type">`.

Un componente dinamico non è un tipo speciale di componente. Qualsiasi componente può essere utilizzato come componente dinamico. È la scelta del componente che è dinamica, non è il componente ad esserlo.

Per maggiori dettagli consulta:
- [Guida - Nozioni base sui Componenti - Componenti Dinamici](/guide/essentials/component-basics.html#dynamic-components)

## effetto {#effect}

Vedi [effetto reattivo](#reactive-effect) e [effetto collaterale](#side-effect).

## evento {#event}

L'uso degli eventi (events) per la comunicazione tra diverse parti di un programma è comune a molte delle diverse aree della programmazione. All'interno di Vue, il termine viene comunemente applicato sia agli eventi nativi degli elementi HTML sia agli eventi dei componenti Vue. La direttiva `v-on` viene utilizzata nei template per ascoltare entrambi i tipi di evento.

Per maggiori dettagli consulta:
- [Guida - La Gestione degli Eventi](/guide/essentials/event-handling.html)
- [Guida - Componenti ed Eventi](/guide/components/events.html)

## fragment {#fragment}

Il termine *fragment* si riferisce a un tipo speciale di [VNode](#vnode) utilizzato come genitore per altri VNode, ma che non renderizza elementi lui stesso.

Il nome deriva dal concetto simile a quello di un [`DocumentFragment`](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment) nell'API DOM nativa.

I Fragment sono utilizzati per supportare componenti con nodi radice multipli. Sebbene tali componenti possano sembrare avere molteplici radici, dietro le quinte utilizzano un nodo fragment come unica radice, come genitore dei nodi 'radice'.

I Fragment vengono anche utilizzati dal compilatore di template come un modo per racchiudere più nodi dinamici, ad es. quelli creati tramite `v-for` o `v-if`. Ciò permette di passare suggerimenti aggiuntivi all'algoritmo di patching del [VDOM](#virtual-dom). Gran parte di ciò è gestito internamente, ma un posto in cui potresti imbatterti in esso è l'uso diretto di una key su un tag `<template>` con `v-for`. In questo scenario, la `key` viene aggiunta come una [prop](#prop) al fragment VNode.

I nodi Fragment sono attualmente renderizzati nel DOM come nodi di testo vuoti, anche se questo è un dettaglio implementativo. Potresti incontrare questi nodi di testo se usi `$el` o tenti di esplorare il DOM con le API native del browser.

## componente funzionale {#functional-component}

Una definizione di componente è solitamente un 'oggetto che contiene opzioni'. Potrebbe non apparire in questo modo se stai utilizzando `<script setup>`, ma il componente esportato dal file `.vue` rimarrà comunque un oggetto.

Un *componente funzionale* (*functional component*) è una forma alternativa di componente che viene dichiarata usando una funzione. Tale funzione serve da [funzione di rendering](#render-function)  per il componente.

Un componente funzionale non può avere un proprio stato. Inoltre, non attraversa il normale ciclo di vita del componente, quindi gli hook del ciclo di vita non possono essere utilizzati. Ciò lo rende leggermente più leggero rispetto ai normali componenti stateful.

Per maggiori dettagli consulta:
- [Guida - Le Render Function e JSX - I Componenti Funzionali](/guide/extras/render-function.html#functional-components)

## hoisting {#hoisting}

Il termine *hoisting* è utilizzato per descrivere l'esecuzione di una sezione di codice prima che essa sia raggiunta, prima di altro codice. L'esecuzione viene 'tirata su' in un punto precedente del codice.

JavaScript utilizza l'hoisting per alcuni costrutti, come `var`, `import` e dichiarazioni di funzione.

Nel un contesto di Vue, il compiler del template applica lo *static hoisting* per migliorare le prestazioni. Quando si converte un template in una render function, i VNodes che corrispondono a contenuti statici possono essere creati una sola volta e poi riutilizzati. Questi VNodes statici vengono descritti come 'hoisted' perché sono creati al di fuori della funzione di rendering, prima che essa venga eseguita. Una forma simile di hoisting viene applicata agli oggetti o array statici generati dal compiler del template.

Per maggiori dettagli consulta:
- [Guida - Il Meccanismo di Rendering - Static Hoisting](/guide/extras/rendering-mechanism.html#static-hoisting)

## template in-DOM {#in-dom-template}

Ci sono vari modi per specificare un template per un componente. Nella maggior parte dei casi, il template è fornito come stringa.

Il termine *template in-DOM* (*in-DOM template*) si riferisce allo scenario in cui il template viene fornito sotto forma di nodi DOM, anziché come una stringa. Vue quindi converte i nodi DOM in una stringa di template utilizzando `innerHTML`.

Tipicamente, un template in-DOM inizia come markup HTML scritto direttamente nell'HTML della pagina. Il browser poi lo analizza in nodi DOM, che Vue utilizza infine per leggere l'`innerHTML`.

Per maggiori dettagli consulta:
- [Guida - Creare un\'applicazione - Template del Componente Root nel DOM](/guide/essentials/application.html#in-dom-root-component-template)
- [Guida - Nozioni base sui Componenti - Limitazioni nel Parsing dei DOM Template](/guide/essentials/component-basics.html#dom-template-parsing-caveats)
- [Options: Rendering - template](/api/options-rendering.html#template)

## inject {#inject}

Vedi [provide / inject](#provide-inject).

## hook del ciclo di vita {#lifecycle-hooks}

Un'istanza di componente Vue attraversa un ciclo di vita. Ad esempio, viene creata, montata, aggiornata e smontata.

Gli *hook del ciclo di vita* (*lifecycle hooks*) sono un modo per ascoltare questi eventi del ciclo di vita.

Con l'Options API, ogni hook è fornito come un'opzione separata, ad es. `mounted`. La Composition API usa invece funzioni, come `onMounted()`.

Per maggiori dettagli consulta:
- [Guida - Gli Hook del Ciclo di Vit](/guide/essentials/lifecycle.html)

## macro {#macro}

Vedi [macro del compilatore](#compiler-macro).

## named slot {#named-slot}

Un componente può avere più slot, differenziati per nome. Gli slot diversi dallo slot predefinito sono definiti come *named slots* (*slot con nome*).

Per maggiori dettagli consulta:
- [Guida - Gli Slot - Slot con nome](/guide/components/slots.html#named-slots)

## Options API {#options-api}

Vue components are defined using objects. The properties of these component objects are known as *options*.

Components can be written in two styles. One style uses the [Composition API](#composition-api) in conjunction with `setup` (either via a `setup()` option or `<script setup>`). The other style makes very little direct use of the Composition API, instead using various component options to achieve a similar result. The component options that are used in this way are referred to as the *Options API*.

The Options API includes options such as `data()`, `computed`, `methods` and `created()`.

Some options, such as `props`, `emits` and `inheritAttrs`, can be used when authoring components with either API. As they are component options, they could be considered part of the Options API. However, as these options are also used in conjunction with `setup()`, it is usually more useful to think of them as shared between the two component styles.

The `setup()` function itself is a component option, so it *could* be described as part of the Options API. However, this is not how the term 'Options API' is normally used. Instead, the `setup()` function is considered to be part of Composition API.

## plugin {#plugin}

While the term *plugin* can be used in a wide variety of contexts, Vue has a specific concept of a plugin as a way to add functionality to an application.

Plugins are added to an application by calling `app.use(plugin)`. The plugin itself is either a function or an object with an `install` function. That function will be passed the application instance and can then do whatever it needs to do.

Per maggiori dettagli consulta:
- [Guida - Plugins](/guide/reusability/plugins.html)

## prop {#prop}

There are three common uses of the term *prop* in Vue:

* Component props
* VNode props
* Slot props

*Component props* are what most people think of as props. These are explicitly defined by a component using either `defineProps()` or the `props` option.

The term *VNode props* refers to the properties of the object passed as the second argument to `h()`. These can include component props, but they can also include component events, DOM events, DOM attributes and DOM properties. You'd usually only encounter VNode props if you're working with render functions to manipulate VNodes directly.

*Slot props* are the properties passed to a scoped slot.

In all cases, props are properties that are passed in from elsewhere.

While the word props is derived from the word *properties*, the term props has a much more specific meaning in the context of Vue. You should avoid using it as an abbreviation of properties.

Per maggiori dettagli consulta:
- [Guida - Props](/guide/components/props.html)
- [Guida - Render Functions & JSX](/guide/extras/render-function.html)
- [Guida - Slots - Scoped Slots](/guide/components/slots.html#scoped-slots)

## provide / inject {#provide-inject}

`provide` and `inject` are a form of inter-component communication.

When a component *provides* a value, all descendants of that component can then choose to grab that value, using `inject`. Unlike with props, the providing component doesn't know precisely which component is receiving the value.

`provide` and `inject` are sometimes used to avoid *prop drilling*. They can also be used as an implicit way for a component to communicate with its slot contents.

`provide` can also be used at the application level, making a value available to all components within that application.

Per maggiori dettagli consulta:
- [Guida - provide / inject](/guide/components/provide-inject.html)

## reactive effect {#reactive-effect}

A *reactive effect* is part of Vue's reactivity system. It refers to the process of tracking the dependencies of a function and re-running that function when the values of those dependencies change.

`watchEffect()` is the most direct way to create an effect. Various other parts of Vue use effects internally. e.g. component rendering updates, `computed()` and `watch()`.

Vue can only track reactive dependencies within a reactive effect. If a property's value is read outside a reactive effect it'll 'lose' reactivity, in the sense that Vue won't know what to do if that property subsequently changes.

The term is derived from 'side effect'. Calling the effect function is a side effect of the property value being changed.

Per maggiori dettagli consulta:
- [Guida - Reactivity in Depth](/guide/extras/reactivity-in-depth.html)

## reactivity {#reactivity}

In general, *reactivity* refers to the ability to automatically perform actions in response to data changes. For example, updating the DOM or making a network request when a data value changes.

In a Vue context, reactivity is used to describe a collection of features. Those features combine to form a *reactivity system*, which is exposed via the [Reactivity API](#reactivity-api).

There are various different ways that a reactivity system could be implemented. For example, it could be done by static analysis of code to determine its dependencies. However, Vue doesn't employ that form of reactivity system.

Instead, Vue's reactivity system tracks property access at runtime. It does this using both Proxy wrappers and getter/setter functions for properties.

Per maggiori dettagli consulta:
- [Guida - Reactivity Fundamentals](/guide/essentials/reactivity-fundamentals.html)
- [Guida - Reactivity in Depth](/guide/extras/reactivity-in-depth.html)

## Reactivity API {#reactivity-api}

The *Reactivity API* is a collection of core Vue functions related to [reactivity](#reactivity). These can be used independently of components. It includes functions such as `ref()`, `reactive()`, `computed()`, `watch()` and `watchEffect()`.

The Reactivity API is a subset of the Composition API.

Per maggiori dettagli consulta:
- [Reactivity API: Core](/api/reactivity-core.html)
- [Reactivity API: Utilities](/api/reactivity-utilities.html)
- [Reactivity API: Advanced](/api/reactivity-advanced.html)

## ref {#ref}

> This entry is about the use of `ref` for reactivity. For the `ref` attribute used in templates, see [template ref](#template-ref) instead.

A `ref` is part of Vue's reactivity system. It is an object with a single reactive property, called `value`.

There are various different types of ref. For example, refs can be created using `ref()`, `shallowRef()`, `computed()`, and `customRef()`. The function `isRef()` can be used to check whether an object is a ref, and `isReadonly()` can be used to check whether the ref allows the direct reassignment of its value.

Per maggiori dettagli consulta:
- [Guida - Reactivity Fundamentals](/guide/essentials/reactivity-fundamentals.html)
- [Reactivity API: Core](/api/reactivity-core.html)
- [Reactivity API: Utilities](/api/reactivity-utilities.html)
- [Reactivity API: Advanced](/api/reactivity-advanced.html)

## render function {#render-function}

A *render function* is the part of a component that generates the VNodes used during rendering. Templates are compiled down into render functions.

Per maggiori dettagli consulta:
- [Guida - Render Functions & JSX](/guide/extras/render-function.html)

## scheduler {#scheduler}

The *scheduler* is the part of Vue's internals that controls the timing of when [reactive effects](#reactive-effect) are run.

When reactive state changes, Vue doesn't immediately trigger rendering updates. Instead, it batches them together using a queue. This ensures that a component only re-renders once, even if multiple changes are made to the underlying data.

[Watchers](/guide/essentials/watchers.html) are also batched using the scheduler queue. Watchers with `flush: 'pre'` (the default) will run before component rendering, whereas those with `flush: 'post'` will run after component rendering.

Jobs in the scheduler are also used to perform various other internal tasks, such as triggering some [lifecycle hooks](#lifecycle-hooks) and updating [template refs](#template-ref).

## scoped slot {#scoped-slot}

The term *scoped slot* is used to refer to a [slot](#slot) that receives [props](#prop).

Historically, Vue made a much greater distinction between scoped and non-scoped slots. To some extent they could be regarded as two separate features, unified behind a common template syntax.

In Vue 3, the slot APIs were simplified to make all slots behave like scoped slots. However, the use cases for scoped and non-scoped slots often differ, so the term still proves useful as a way to refer to slots with props.

The props passed to a slot can only be used within a specific region of the parent template, responsible for defining the slot's contents. This region of the template behaves as a variable scope for the props, hence the name 'scoped slot'.

Per maggiori dettagli consulta:
- [Guida - Slots - Scoped Slots](/guide/components/slots.html#scoped-slots)

## SFC {#sfc}

See [Single-File Component](#single-file-component).

## side effect {#side-effect}

The term *side effect* is not specific to Vue. It is used to describe operations or functions that do something beyond their local scope.

For example, in the context of setting a property like `user.name = null`, it is expected that this will change the value of `user.name`. If it also does something else, like triggering Vue's reactivity system, then this would be described as a side effect. This is the origin of the term [reactive effect](#reactive-effect) within Vue.

When a function is described as having side effects, it means that the function performs some sort of action that is observable outside the function, aside from just returning a value. This might mean that it updates a value in state, or triggers a network request.

The term is often used when describing rendering or computed properties. It is considered best practice for rendering to have no side effects. Likewise, the getter function for a computed property should have no side effects.

## Single-File Component {#single-file-component}

The term *Single-File Component*, or SFC, refers to the `.vue` file format that is commonly used for Vue components.

See also:
- [Guida - Single-File Components](/guide/scaling-up/sfc.html)
- [SFC Syntax Specification](/api/sfc-spec.html)

## slot {#slot}

Slots are used to pass content to child components. Whereas props are used to pass data values, slots are used to pass richer content consisting of HTML elements and other Vue components.

Per maggiori dettagli consulta:
- [Guida - Slots](/guide/components/slots.html)

## template ref {#template-ref}

The term *template ref* refers to using a `ref` attribute on a tag within a template. After the component renders, this attribute is used to populate a corresponding property with either the HTML element or the component instance that corresponds to the tag in the template.

If you are using the Options API then the refs are exposed via properties of the `$refs` object.

With the Composition API, template refs populate a reactive [ref](#ref) with the same name.

Template refs should not be confused with the reactive refs found in Vue's reactivity system.

Per maggiori dettagli consulta:
- [Guida - Template Refs](/guide/essentials/template-refs.html)

## VDOM {#vdom}

See [virtual DOM](#virtual-dom).

## virtual DOM {#virtual-dom}

The term *virtual DOM* (VDOM) is not unique to Vue. It is a common approach used by several web frameworks for managing updates to the UI.

Browsers use a tree of nodes to represent the current state of the page. That tree, and the JavaScript APIs used to interact with it, are referred to as the *document object model*, or *DOM*.

Manipulating the DOM is a major performance bottleneck. The virtual DOM provides one strategy for managing that.

Rather than creating DOM nodes directly, Vue components generate a description of what DOM nodes they would like. These descriptors are plain JavaScript objects, known as VNodes (virtual DOM nodes). Creating VNodes is relatively cheap.

Every time a component re-renders, the new tree of VNodes is compared to the previous tree of VNodes and any differences are then applied to the real DOM. If nothing has changed then the DOM doesn't need to be touched.

Vue uses a hybrid approach that we call [Compiler-Informed Virtual DOM](/guide/extras/rendering-mechanism.html#compiler-informed-virtual-dom). Vue's template compiler is able to apply performance optimizations based on static analysis of the template. Rather than performing a full comparison of a component's old and new VNode trees at runtime, Vue can use information extracted by the compiler to reduce the comparison to just the parts of the tree that can actually change.

Per maggiori dettagli consulta:
- [Guida - Rendering Mechanism](/guide/extras/rendering-mechanism.html)
- [Guida - Render Functions & JSX](/guide/extras/render-function.html)

## VNode {#vnode}

A *VNode* is a *virtual DOM node*. They can be created using the [`h()`](/api/render-function.html#h) function.

See [virtual DOM](#virtual-dom) for more information.

## Web Component {#web-component}

The *Web Components* standard is a collection of features implemented in modern web browsers.

Vue components are not Web Components, but `defineCustomElement()` can be used to create a [custom element](#custom-element) from a Vue component. Vue also supports the use of custom elements inside Vue components.

Per maggiori dettagli consulta:
- [Guida - Vue and Web Components](/guide/extras/web-components.html)
