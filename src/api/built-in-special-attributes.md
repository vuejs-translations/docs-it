# Built-in Special Attributes {#built-in-special-attributes}

## key {#key}

L'attributo speciale `key` è utilizzato principalmente come un suggerimento per l'algoritmo del DOM virtuale di Vue, al fine di identificare i vnodes durante il confronto della nuova lista di nodi con la lista precedente.

- **Si aspetta:** `number | string | symbol`

- **Dettagli**

  Senza le chiavi, Vue utilizza un algoritmo che minimizza il movimento degli elementi e cerca di riparare/riutilizzare elementi dello stesso tipo sul posto il più possibile. Con le chiavi, Vue riordinerà gli elementi in base al cambiamento dell'ordine delle chiavi e gli elementi con chiavi che non sono più presenti verranno sempre rimossi / distrutti.

  I figli dello stesso genitore comune devono avere **chiavi uniche**. Chiavi duplicate causeranno errori nel rendering.
  
  Il caso d'uso più comune è combinato con `v-for`:

  ```vue-html
  <ul>
    <li v-for="item in items" :key="item.id">...</li>
  </ul>
  ```

  Questo metodo può essere utilizzato anche per forzare la sostituzione di un elemento/componente, invece di riutilizzarlo. Questo può essere utile quando si vuole:

  - Attivare correttamente gli hook del ciclo di vita di un componente
  - Innescare transizioni

  Per esempio:

  ```vue-html
  <transition>
    <span :key="text">{{ text }}</span>
  </transition>
  ```

  Quando il `text` cambia, il `<span>` verrà sempre sostituito invece di essere aggiornato, in modo da innescare una transizione.

- **Vedi anche** [Guide - List Rendering - Maintaining State with `key`](/guide/essentials/list#maintaining-state-with-key)

## ref {#ref}

Indica un [template ref](/guide/essentials/template-refs).

- **Si aspetta:** `string | Function`

- **Dettagli**

  `ref` viene utilizzato per registrare un riferimento a un elemento o a un componente figlio.

  Nell'API delle Opzioni, il riferimento sarà registrato sotto l'oggetto `this.$refs` del componente:

  ```vue-html
  <!-- memorizzato come this.$refs.p -->
  <p ref="p">hello</p>
  ```

  Nell'API della Composizione, il riferimento sarà memorizzato in un ref con lo stesso nome:

  ```vue
  <script setup>
  import { ref } from 'vue'

  const p = ref()
  </script>

  <template>
    <p ref="p">hello</p>
  </template>
  ```

  Se utilizzato su un elemento DOM semplice, il riferimento sarà quell'elemento; se utilizzato su un componente figlio, il riferimento sarà l'istanza del componente figlio.

  In alternativa, `ref` può accettare un valore di funzione che offre il pieno controllo su dove memorizzare il riferimento:

  ```vue-html
  <ChildComponent :ref="(el) => child = el" />
  ```

  Una nota importante in riferimento al momento della registrazione del ref: poiché i refs stessi vengono creati come risultato della funzione di rendering, è necessario attendere che il componente sia montato prima di accedervi.

  Anche `this.$refs` è non reattivo, quindi non dovresti tentare di usarlo nei template per il data-binding.

- **Vedi anche**
  - [Guide - Template Refs](/guide/essentials/template-refs)
  - [Guide - Typing Template Refs](/guide/typescript/composition-api#typing-template-refs) <sup class="vt-badge ts" />
  - [Guide - Typing Component Template Refs](/guide/typescript/composition-api#typing-component-template-refs) <sup class="vt-badge ts" />

## is {#is}

Utilizzato per il binding di [dynamic components](/guide/essentials/component-basics#dynamic-components).

- **Si aspetta:** `string | Component`

- **Uso su elementi nativi** <sup class="vt-badge">3.1+</sup>

  Quando l'attributo `is` viene utilizzato su un elemento HTML nativo, verrà interpretato come un [Customized built-in element](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements-customized-builtin-example), che è una funzionalità nativa della piattaforma web.

  Tuttavia, esiste un caso d'uso in cui potresti aver bisogno che Vue sostituisca un elemento nativo con un componente Vue, come spiegato in [DOM Template Parsing Caveats](/guide/essentials/component-basics#dom-template-parsing-caveats). Puoi prefissare il valore dell'attributo `is` con `vue:` in modo che Vue renderizzi l'elemento come un componente Vue invece:

  ```vue-html
  <table>
    <tr is="vue:my-row-component"></tr>
  </table>
  ```

- **Vedi anche**

  - [Built-in Special Element - `<component>`](/api/built-in-special-elements#component)
  - [Dynamic Components](/guide/essentials/component-basics#dynamic-components)
