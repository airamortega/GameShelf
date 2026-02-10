<template>
  <Teleport to="body">
    <Transition name="fade-scale">
      <div v-if="modelValue" class="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-md" @click="close"></div>

        <div class="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-[40px] p-8 shadow-2xl overflow-hidden">

          <div class="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[80px] rounded-full"></div>

          <header class="text-center mb-8">
            <div class="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <PlusCircle class="w-8 h-8 text-emerald-500" />
            </div>
            <h3 class="text-2xl font-black text-white uppercase italic tracking-tighter">Nueva Lista</h3>
            <p class="text-gray-500 text-sm">Organiza tu colección a tu gusto</p>
          </header>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Nombre de la lista</label>
              <input
                  v-model="form.name"
                  type="text"
                  placeholder="Ej: Joyas Ocultas, Backlog 2024..."
                  required
                  class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>

            <div
                @click="form.is_public = !form.is_public"
                class="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-all"
            >
              <div class="flex items-center gap-3">
                <div :class="form.is_public ? 'text-emerald-500' : 'text-gray-500'">
                  <Globe v-if="form.is_public" class="w-5 h-5" />
                  <Lock v-else class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-xs font-bold text-white uppercase">{{ form.is_public ? 'Pública' : 'Privada' }}</p>
                  <p class="text-[10px] text-gray-500 uppercase">{{ form.is_public ? 'Visible para todos' : 'Solo tú puedes verla' }}</p>
                </div>
              </div>

              <div class="w-10 h-6 rounded-full bg-slate-800 relative transition-all" :class="{'bg-emerald-500/20': form.is_public}">
                <div
                    class="absolute top-1 w-4 h-4 rounded-full transition-all duration-300"
                    :class="form.is_public ? 'right-1 bg-emerald-500' : 'left-1 bg-gray-600'"
                ></div>
              </div>
            </div>

            <div class="flex flex-col gap-3 pt-2">
              <button
                  type="submit"
                  :disabled="loading || !form.name"
                  class="w-full py-5 bg-white text-slate-950 font-black uppercase tracking-widest text-xs rounded-2xl active:scale-95 disabled:opacity-20 transition-all flex justify-center items-center gap-2"
              >
                <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
                <span v-else>Crear Lista</span>
              </button>

              <button
                  type="button"
                  @click="close"
                  class="w-full py-4 text-gray-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { PlusCircle, Globe, Lock, Loader2 } from 'lucide-vue-next'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue', 'created'])

const { createList } = useLists()
const { showToast } = useToast()

const loading = ref(false)
const form = ref({
  name: '',
  is_public: false
})

const close = () => {
  form.value = { name: '', is_public: false }
  emit('update:modelValue', false)
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const { data, error } = await createList(form.value.name, form.value.is_public)
    if (error) throw error

    showToast('¡Lista creada con éxito!')
    emit('created', data) // Avisamos al padre para que refresque la lista
    close()
  } catch (err) {
    showToast('Error al crear la lista', 'error')
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-scale-enter-active, .fade-scale-leave-active {
  transition: all 0.3s ease;
}
.fade-scale-enter-from, .fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
</style>