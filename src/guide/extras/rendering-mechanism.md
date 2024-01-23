---
outline: deep
---

# Meccanismo di rendering {#rendering-mechanism}

Come fa Vue a trasformare un template in un nodo del DOM? Come aggiorna questi nodi in modo efficiente? Cercheremo di fare luce su queste domande approfondendo il meccanismo di rendering interno di Vue.

## Virtual DOM {#virtual-dom}

Probabilmente hai sentito parlare del termine "virtual DOM", su cui si basa il sistema di rendering di Vue.

Il DOM virtuale (VDOM) è un concetto di programmazione in cui una rappresentazione ideale, o "virtuale", di un'interfaccia utente viene mantenuta in memoria e sincronizzata con il DOM "reale". Il concetto è stato introdotto da [React](https://reactjs.org/) ed è stato adottato da molti altri framework con diverse implementazioni, tra cui Vue.

Il DOM virtuale è più un modello che una tecnologia specifica, quindi non esiste un'implementazione canonica. Possiamo illustrare l'idea con un semplice esempio:

```js
const vnode = {
  type: 'div',
  props: {
    id: 'hello'
  },
  children: [
    /* more vnodes */
  ]
}
```

Qui, `vnode` è un oggetto JavaScript (un "nodo virtuale") che rappresenta un elemento `<div>`. Contiene tutte le informazioni necessarie per creare l'elemento vero e proprio. Contiene anche altri vnode figli, il che lo rende la root di un albero DOM virtuale.

Un runtime renderer può scorrere un albero DOM virtuale e costruire un albero DOM reale da esso. Questo processo è chiamato **mount**.

Se abbiamo due copie di alberi DOM virtuali, il render può anche scorrere e confrontare i due alberi, capire le differenze e applicare le modifiche al DOM reale. Questo processo è chiamato **patch**, noto anche come "diffing" o "reconciliation".

Il vantaggio principale del DOM virtuale è che offre allo sviluppatore la possibilità di creare, ispezionare e comporre programmaticamente le strutture dell'interfaccia utente desiderate in modo dichiarativo, lasciando al renderer la manipolazione diretta del DOM.

## Render Pipeline {#render-pipeline}

Ad alto livello, questo è ciò che accade quando viene montato un componente Vue:

1. **Compile**: I modelli di Vue vengono compilati in **render functions**: funzioni che restituiscono alberi DOM virtuali. Questo passaggio può essere fatto sia in anticipo, tramite una fase di compilazione, o dinamicamente, utilizzando il compilatore a runtime.

2. **Mount**: Il runtime renderer invoca le funzioni di rendering, percorre l'albero DOM virtuale restituito e crea i nodi DOM reali basandosi su di esso. Questo passaggio viene eseguito come un [reactive effect](./reactivity-in-depth), quindi tiene traccia di tutte le dipendenze reattive utilizzate.

3. **Patch**: Quando una dipendenza utilizzata durante il mount cambia, l'effetto viene rieseguito. Questa volta, viene creato un nuovo albero DOM virtuale aggiornato. Il runtime renderer esamina il nuovo albero, lo confronta con quello vecchio e applica gli aggiornamenti necessari al DOM reale.

![render pipeline](./images/render-pipeline.png)

<!-- https://www.figma.com/file/elViLsnxGJ9lsQVsuhwqxM/Rendering-Mechanism -->

## Templates vs. Render Functions {#templates-vs-render-functions}

I templates di Vue sono compilati in funzioni di rendering del DOM virtuale. Vue fornisce anche delle API che consentono di saltare la fase di compilazione dei template e di creare direttamente le funzioni di rendering. Le funzioni di rendering sono più flessibili dei template quando si ha a che fare con una logica altamente dinamica, perché si può lavorare con i vnodes utilizzando tutta la potenza di JavaScript.

Perché Vue raccomanda i templates per impostazione predefinita? Ci sono diverse ragioni:

1. I templates sono più vicini all'HTML vero e proprio. In questo modo è più facile riutilizzare gli snippet HTML esistenti, applicare le migliori pratiche di accessibilità, creare uno stile con i CSS, migliorando la comprensione e la modifica da parte dei designer.

2. I template sono più facili da analizzare staticamente grazie alla loro sintassi. Questo consente al compilatore di template di Vue di applicare molte ottimizzazioni in fase di compilazione per migliorare le prestazioni del DOM virtuale (di cui parleremo più avanti).

In pratica, i templates sono sufficienti per la maggior parte dei casi d'uso nelle applicazioni. Le render functions sono tipicamente utilizzate solo nei componenti riutilizzabili che devono gestire una logica di rendering altamente dinamica. L'uso delle render functions è discusso più dettagliatamente in [Render function e JSX](./render-function).

## Compiler-Informed Virtual DOM {#compiler-informed-virtual-dom}

L'implementazione del DOM virtuale in React e la maggior parte delle altre implementazioni del DOM virtuale sono puramente runtime: l'algoritmo di riconciliazione non può fare alcuna ipotesi sull'albero del DOM virtuale in arrivo, quindi deve attraversare completamente l'albero e diffondere gli oggetti di scena di ogni vnode per garantire la correttezza. Inoltre, anche se una parte dell'albero non cambia mai, a ogni re-render vengono sempre creati nuovi vnode, con conseguente inutile pressione sulla memoria. Questo è uno degli aspetti più criticati del DOM virtuale: il processo di riconciliazione, piuttosto brute-force, sacrifica l'efficienza in cambio di dichiaratività e correttezza.

Ma non deve essere necessariamente così. In Vue, il framework controlla sia il compilatore che il runtime. Questo ci permette di implementare molte ottimizzazioni in fase di compilazione che solo un renderer strettamente accoppiato può sfruttare. Il compilatore può analizzare staticamente il template e lasciare suggerimenti nel codice generato, in modo che il runtime possa prendere delle scorciatoie quando possibile. Allo stesso tempo, conserviamo la possibilità per l'utente di scendere al livello della funzione di rendering per un controllo più diretto nei casi limite. Chiamiamo questo approccio ibrido **Compiler-Informed Virtual DOM**.

Di seguito, discuteremo alcune importanti ottimizzazioni effettuate dal compilatore di template di Vue per migliorare le prestazioni del DOM virtuale in fase di esecuzione.

### Hoisting statico {#static-hoisting}

Molto spesso ci sono parti di un modello che non contengono legami dinamici:

```vue-html{2-3}
<div>
  <div>foo</div> <!-- hoisted -->
  <div>bar</div> <!-- hoisted -->
  <div>{{ dynamic }}</div>
</div>
```

[Ispeziona in Template Explorer](https://template-explorer.vuejs.org/#eyJzcmMiOiI8ZGl2PlxuICA8ZGl2PmZvbzwvZGl2PiA8IS0tIGhvaXN0ZWQgLS0+XG4gIDxkaXY+YmFyPC9kaXY+IDwhLS0gaG9pc3RlZCAtLT5cbiAgPGRpdj57eyBkeW5hbWljIH19PC9kaXY+XG48L2Rpdj5cbiIsIm9wdGlvbnMiOnsiaG9pc3RTdGF0aWMiOnRydWV9fQ==)

I div `foo` e `bar` sono statici: ricreare i vnode e differenziarli a ogni rendering non è necessario. Il compilatore di Vue sposta automaticamente le chiamate alla creazione dei vnode dalla funzione di rendering e riutilizza gli stessi vnode a ogni rendering. Il renderer è anche in grado di saltare completamente la creazione di vnode quando si accorge che il vecchio vnode e il nuovo vnode sono gli stessi.

Inoltre, quando ci sono abbastanza elementi statici consecutivi, essi saranno condensati in un singolo "vnode statico" che contiene la stringa HTML semplice per tutti questi nodi ([Esempio](https://template-explorer.vuejs.org/#eyJzcmMiOiI8ZGl2PlxuICA8ZGl2IGNsYXNzPVwiZm9vXCI+Zm9vPC9kaXY+XG4gIDxkaXYgY2xhc3M9XCJmb29cIj5mb288L2Rpdj5cbiAgPGRpdiBjbGFzcz1cImZvb1wiPmZvbzwvZGl2PlxuICA8ZGl2IGNsYXNzPVwiZm9vXCI+Zm9vPC9kaXY+XG4gIDxkaXYgY2xhc3M9XCJmb29cIj5mb288L2Rpdj5cbiAgPGRpdj57eyBkeW5hbWljIH19PC9kaXY+XG48L2Rpdj4iLCJzc3IiOmZhbHNlLCJvcHRpb25zIjp7ImhvaXN0U3RhdGljIjp0cnVlfX0=)). Questi vnode statici vengono montati impostando direttamente `innerHTML`. Inoltre, al momento del montaggio iniziale, vengono memorizzati nella cache i nodi DOM corrispondenti: se lo stesso contenuto viene riutilizzato in altre parti dell'applicazione, i nuovi nodi DOM vengono creati usando il metodo nativo `cloneNode()`, che è estremamente efficiente.

### Patch Flags {#patch-flags}

Per un singolo elemento con vincoli dinamici, possiamo dedurre molte informazioni in fase di compilazione:

```vue-html
<!-- class binding only -->
<div :class="{ active }"></div>

<!-- id and value bindings only -->
<input :id="id" :value="value">

<!-- text children only -->
<div>{{ dynamic }}</div>
```

[Ispeziona in Template Explorer](https://template-explorer.vuejs.org/#eyJzcmMiOiI8ZGl2IDpjbGFzcz1cInsgYWN0aXZlIH1cIj48L2Rpdj5cblxuPGlucHV0IDppZD1cImlkXCIgOnZhbHVlPVwidmFsdWVcIj5cblxuPGRpdj57eyBkeW5hbWljIH19PC9kaXY+Iiwib3B0aW9ucyI6e319)

Quando genera il codice della funzione di rendering per questi elementi, Vue codifica il tipo di aggiornamento di cui ciascuno di essi ha bisogno direttamente nella chiamata di creazione del vnode:

```js{3}
createElementVNode("div", {
  class: _normalizeClass({ active: _ctx.active })
}, null, 2 /* CLASS */)
```

L'ultimo argomento, `2`, è un [patch flag](https://github.com/vuejs/core/blob/main/packages/shared/src/patchFlags.ts). Un elemento può avere più patch flags, che verranno unite in un unico numero. Il runtime renderer può quindi controllare i flag usando [bitwise operations](https://en.wikipedia.org/wiki/Bitwise_operation) per determinare se deve fare un certo lavoro:

```js
if (vnode.patchFlag & PatchFlags.CLASS /* 2 */) {
  // update the element's class
}
```

I controlli bitwise sono estremamente veloci. Con i patch flags, Vue è in grado di eseguire la minima quantità di lavoro necessaria quando si aggiornano elementi con legami dinamici.

Vue codifica anche il tipo di figli che ha un vnode. Ad esempio, un modello che ha più root nodes viene rappresentato come un frammento. Nella maggior parte dei casi, sappiamo con certezza che l'ordine di questi root nodes non cambierà mai, quindi questa informazione può essere fornita al runtime come flag patch:

```js{4}
export function render() {
  return (_openBlock(), _createElementBlock(_Fragment, null, [
    /* children */
  ], 64 /* STABLE_FRAGMENT */))
}
```

Il runtime può quindi saltare completamente la riconciliazione dell'ordine dei figli per il frammento root.

### Tree Flattening {#tree-flattening}

Dando un'altra occhiata al codice generato dall'esempio precedente, si noterà che la root dell'albero del DOM virtuale restituito viene creata usando una chiamata speciale `createElementBlock()`:

```js{2}
export function render() {
  return (_openBlock(), _createElementBlock(_Fragment, null, [
    /* children */
  ], 64 /* STABLE_FRAGMENT */))
}
```

Concettualmente, un "block" è una parte del template che ha una struttura interna stabile. In questo caso, l'intero template ha un unico blocco, perché non contiene direttive strutturali come `v-if` e `v-for`.

Ogni blocco tiene traccia di tutti i nodi discendenti (non solo i figli diretti) che hanno la flag patch. Per esempio:

```vue-html{3,5}
<div> <!-- root block -->
  <div>...</div>         <!-- not tracked -->
  <div :id="id"></div>   <!-- tracked -->
  <div>                  <!-- not tracked -->
    <div>{{ bar }}</div> <!-- tracked -->
  </div>
</div>
```

Il risultato è un array appiattito che contiene solo i nodi discendenti dinamici:

```
div (block root)
- div with :id binding
- div with {{ bar }} binding
```

Quando questo componente deve eseguire un nuovo rendering, deve attraversare solo l'albero appiattito invece dell'albero completo. Questa operazione è chiamata **Tree flattering** e riduce notevolmente il numero di nodi che devono essere attraversati durante la riconciliazione del DOM virtuale. Tutte le parti statiche del modello vengono di fatto saltate.

Le direttive `v-if` e `v-for` creeranno un nuovo block node:

```vue-html
<div> <!-- root block -->
  <div>
    <div v-if> <!-- if block -->
      ...
    <div>
  </div>
</div>
```

Un blocco figlio viene tracciato all'interno dell'array di discendenti dinamici del blocco genitore. In questo modo si mantiene una struttura stabile per il blocco genitore.

### Impatto sulla SSR Hydration {#impact-on-ssr-hydration}

Sia i patch flags che l'appiattimento dell'albero migliorano notevolmente le prestazioni di Vue [SSR Hydration](/guide/scaling-up/ssr#client-hydration):

- L'idratazione di un singolo elemento può seguire percorsi veloci in base al patch flag del vnodo corrispondente.

- Solo block nodes e i loro discendenti dinamici devono essere attraversati durante l'idratazione, ottenendo di fatto un'idratazione parziale a livello di modello.
