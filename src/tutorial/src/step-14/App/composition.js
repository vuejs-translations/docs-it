import { ref } from 'vue'
import ChildComp from './ChildComp.vue'

export default {
  components: {
    ChildComp
  },
  setup() {
    const msg = ref('dal padre')

    return {
      msg
    }
  }
}
