import { ref } from 'vue'

export default {
  setup() {
    const message = ref('Hello World!')

    function reverseMessage() {
      // Accede/muta il valore del ref tramite
      // la sua proprietà .value.
      message.value = message.value.split('').reverse().join('')
    }

    function notify() {
      alert('navigation was prevented.')
    }

    return {
      message,
      reverseMessage,
      notify
    }
  }
}
