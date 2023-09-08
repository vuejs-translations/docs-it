# Emits {#emits}

Oltre a poter ricevere props, un componente può anche emettere eventi al padre:

<div class="composition-api">
<div class="sfc">

```vue
<script setup>
// dichiara gli eventi che si emettono
const emit = defineEmits(['response'])

// emissione evento con argomento
emit('response', 'hello from child')
</script>
```

</div>

<div class="html">

```js
export default {
  // dichiara gli eventi che si emettono
  emits: ['response'],
  setup(props, { emit }) {
    // emissione evento con argomento
    emit('response', 'hello from child')
  }
}
```

</div>

</div>

<div class="options-api">

```js
export default {
  // dichiara gli eventi che si emettono
  emits: ['response'],
  created() {
    // emissione evento con argomento
    this.$emit('response', 'hello from child')
  }
}
```

</div>

Il primo parametro di <span class="options-api">`this.$emit()`</span><span class="composition-api">`emit()`</span> è il nome dell'evento. Eventuali argomenti aggiuntivi vengono passati al listener dell'evento.

Il padre può ascoltare gli eventi emessi dal figlio utilizzando `v-on`, in questo caso il handler riceve l'argomento extra della chiamata emit del figlio e lo assegna allo stato locale:

<div class="sfc">

```vue-html
<ChildComp @response="(msg) => childMsg = msg" />
```

</div>
<div class="html">

```vue-html
<child-comp @response="(msg) => childMsg = msg"></child-comp>
```

</div>

Ora prova nell'editor.
