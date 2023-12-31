import { ref } from 'vue'

export default {
  setup() {
    // assegna un ID univoco a ciascun todo
    let id = 0

    const newTodo = ref('')
    const todos = ref([
      { id: id++, text: 'Learn HTML' },
      { id: id++, text: 'Learn JavaScript' },
      { id: id++, text: 'Learn Vue' }
    ])

    function addTodo() {
      // ...
      newTodo.value = ''
    }

    function removeTodo(todo) {
      // ...
    }

    return {
      newTodo,
      todos,
      addTodo,
      removeTodo
    }
  }
}
