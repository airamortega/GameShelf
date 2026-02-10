<template>
  <Teleport to="body">
    <Transition name="fade-scale">
      <div v-if="modelValue" class="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-md" @click="close"></div>

        <div class="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-[40px] p-8 shadow-2xl overflow-hidden text-center">

          <div class="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <Trash2 class="w-10 h-10 text-red-500" />
          </div>

          <h3 class="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">
            {{ title || '¿Estás seguro?' }}
          </h3>

          <p class="text-gray-400 text-sm mb-8 leading-relaxed">
            {{ description || 'Esta acción no se puede deshacer y los datos se perderán permanentemente.' }}
          </p>

          <div class="flex flex-col gap-3">
            <button
                @click="handleConfirm"
                :disabled="loading"
                class="w-full py-5 bg-red-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl active:scale-95 disabled:opacity-50 transition-all flex justify-center items-center gap-2 shadow-lg shadow-red-900/20"
            >
              <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
              <span v-else>{{ confirmText || 'Sí, eliminar' }}</span>
            </button>

            <button
                type="button"
                @click="close"
                class="w-full py-4 bg-white/5 text-gray-500 font-bold uppercase tracking-widest text-[10px] rounded-2xl hover:text-white hover:bg-white/10 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { Trash2, Loader2 } from 'lucide-vue-next'

const props = defineProps({
  modelValue: Boolean,
  loading: Boolean,
  title: String,
  description: String,
  confirmText: String
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const close = () => {
  emit('update:modelValue', false)
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped>
.fade-scale-enter-active, .fade-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-scale-enter-from, .fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
</style>