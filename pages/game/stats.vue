<template>
  <div class="p-6 max-w-lg mx-auto pb-24 min-h-screen">
    <header class="mb-10">
      <h1 class="text-4xl font-black uppercase tracking-tighter italic">Estadísticas</h1>
      <p class="text-slate-500 font-bold uppercase text-xs tracking-widest mt-2">Análisis de tu biblioteca</p>
    </header>

    <div v-if="loading">
      <AppSpinner />
    </div>

    <div v-else>

      <div class="bg-slate-900/50 border border-white/5 p-8 rounded-[40px] flex items-center gap-3 relative overflow-hidden mb-5">
        <Star class="text-amber-500 mb-4" :size="32" fill="currentColor" />
        <div>
          <h3 class="text-7xl font-black italic tracking-tighter">
            {{ stats.averageRating }}<span class="text-xl text-slate-500 tracking-wide"> / 10</span>
          </h3>
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Nota media de tus votos</p>
        </div>
        <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-amber-500/25 blur-3xl rounded-full"></div>
      </div>

      <div class="md:col-span-2 bg-slate-900/50 border border-white/5 p-8 rounded-[40px] mb-5">
        <h3 class="text-sm font-black uppercase tracking-widest mb-6 text-blue-500">Mis Imprescindibles</h3>
        <div class="space-y-3">
          <div
              v-for="(item, index) in stats.topGames"
              :key="index"
              class="flex items-center gap-4 p-2 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group"
          >
            <span
              class="w-6 text-center font-black italic text-lg opacity-50"
              :class="[
                index === 0 ? 'text-amber-400' : '',
                index === 1 ? 'text-slate-300' : '',
                index === 2 ? 'text-amber-700' : '',
                index > 2 ? 'text-slate-600' : ''
              ]">
              #{{ index + 1 }}
            </span>

            <img
                :src="item.games?.cover?.replace('t_thumb', 't_cover_small')"
                class="w-10 h-14 object-cover rounded-lg shadow-lg"
            />

            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-sm text-white uppercase italic tracking-tight">
                {{ item.games?.name }}
              </h4>
            </div>

            <div class="flex items-center gap-1 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              <span class="text-xs font-black text-amber-500">{{ item.rating.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="md:col-span-2 bg-slate-900/50 border border-white/5 p-8 rounded-[40px] flex items-center justify-between relative overflow-hidden mb-5">
        <div class="relative z-10">
          <p class="text-blue-500 font-black uppercase tracking-[0.3em] text-xs mb-2">Total en Biblioteca</p>
          <h2 class="text-7xl font-black italic tracking-tighter">{{ stats.totalGames }}</h2>
          <p class="text-slate-400 mt-2 font-medium italic">Juegos coleccionados</p>
        </div>
        <Gamepad2 :size="120" class="text-white/5 absolute -right-4 -bottom-4 rotate-12" />
      </div>

      <div class="relative bg-blue-500 p-8 rounded-[40px] flex flex-col justify-between text-slate-950 mb-5">
        <Trophy :size="32" />
        <div>
          <h3 class="text-4xl font-black tracking-tighter leading-none">
            {{ calculateCompletion() }}%
          </h3>
          <p class="font-bold uppercase text-[10px] tracking-widest opacity-80 mt-1">Ratio de Completado</p>
        </div>
        <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-800/25 blur-2xl rounded-full"></div>
      </div>

      <div class="bg-slate-900/50 border border-white/5 p-8 rounded-[40px] mb-5">
        <h3 class="text-sm font-black uppercase tracking-widest mb-6 text-blue-500">Top Géneros</h3>
        <div class="space-y-4">
          <div v-for="[name, count] in stats.byGenre" :key="name" class="flex items-center justify-between">
            <span class="text-sm font-bold uppercase tracking-tight">{{ name }}</span>
            <span class="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black">{{ count }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { Gamepad2, Trophy, Loader2, Star } from 'lucide-vue-next'
import { useStats } from '~/composables/useStats.js'

const { getStats } = useStats()
const stats = ref(null)
const loading = ref(true)

const calculateCompletion = () => {
  if (!stats.value?.totalGames) return 0
  const finished = stats.value.byStatus[GameStatus.TERMINADO] || 0
  return Math.round((finished / stats.value.totalGames) * 100)
}

onMounted(async () => {
  stats.value = await getStats()
  loading.value = false
})
</script>