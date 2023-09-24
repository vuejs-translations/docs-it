import { ref } from 'vue'

export default {
  setup() {
    // Un "ref" è una fonte di dati reattiva che memorizza un valore.
    // Tecnicamente, non abbiamo bisogno di wrappare la stringa con ref()
    // per poterla visualizzare, ma vedremo nel prossimo esempio
    // perché è necessario se si intende modificare
    // il valore.
    const message = ref('Ciao Mondo!')

    return {
      message
    }
  }
}
