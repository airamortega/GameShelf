<template>
  <NuxtLink
      :to="`/lists/${list.id}`"
      class="group relative block bg-slate-900 rounded-3xl border border-white/5 p-4 transition-all hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 active:scale-[0.98]"
  >
    <div class="flex flex-1 gap-2">
      <div class="drag-handle cursor-grab active:cursor-grabbing text-slate-600 hover:text-white flex items-center pr-3 border-r border-slate-700">
        <GripVertical :size="20" class="text-slate-600" />
      </div>

      <div class="flex-1 pl-3 relative">
        <div class="w-full h-40 mb-4 relative rounded-2xl overflow-hidden bg-slate-800">
          <div v-if="covers.length > 0" class="absolute inset-0 grid grid-cols-4 gap-1 p-1">
            <img
                v-for="(cover, index) in covers.slice(0, 4)"
                :key="index"
                :src="cover"
                class="w-full h-full object-cover rounded-lg opacity-80 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <div v-else class="flex items-center justify-center h-full text-slate-400 font-bold uppercase tracking-widest text-xs">
            Esta lista está vacía
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        </div>

        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-white truncate">{{ list.name }}</h3>
            <Lock v-if="!list.is_public" class="w-4 h-4 text-gray-500" />
            <Globe v-else class="w-4 h-4 text-blue-500" />
          </div>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {{ list.game_count || 0 }} Juegos
          </p>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
import {Lock, Globe, FolderClosed, GripVertical} from 'lucide-vue-next'

const props = defineProps({
  list: {
    type: Object,
    required: true
  }
})

// Asumiendo que list.list_games contiene la información de las portadas
// Necesitarás ajustar la consulta SQL para traer los covers en list_games
const covers = computed(() => {
  return props.list.covers || [] // Esto se llenará con la lógica que haremos abajo
})
</script>