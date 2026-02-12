<template>
  <div class="p-6 max-w-lg mx-auto pb-24 min-h-screen">
    <header class="mb-6 flex items-center gap-4">
      <NuxtLink to="/" class="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white active:scale-90 transition-all">
        <ChevronLeft class="w-6 h-6" />
      </NuxtLink>

      <div
          class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner transition-transform group-hover:scale-110"
          :style="{ backgroundColor: statusData.color + '22', color: statusData.color }"
      >
        <span v-html="statusData.icon"></span>
      </div>

      <div>
        <h1 class="text-3xl font-black text-white uppercase tracking-tighter italic">{{ statusData.label }}</h1>
        <p class="text-gray-500 text-xs font-bold uppercase tracking-widest">{{ filteredGames.length }} Juegos</p>
      </div>

    </header>

    <div class="relative mb-8">
      <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar en esta lista..."
          class="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-600 font-medium"
      />
      <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
        <X class="w-4 h-4" />
      </button>
    </div>

    <div v-if="loading" class="grid grid-cols-2 gap-4">
      <div v-for="i in 4" :key="i" class="aspect-[3/4] bg-white/5 animate-pulse rounded-[24px]"></div>
    </div>

    <div v-else-if="filteredGames.length > 0" class="grid grid-cols-2 gap-4">
      <NuxtLink
          v-for="item in filteredGames"
          :key="item.games.id"
          :to="`/game/${item.games.id}?from=${status}`"
          class="group relative aspect-[3/4] rounded-[24px] overflow-hidden border border-white/10 bg-slate-900 shadow-2xl active:scale-95 transition-all duration-300"
      >
        <img
            :src="item.games.cover?.replace('t_thumb', 't_cover_big')"
            :alt="item.games.name"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <gameRating :rating="item.games.total_rating" />

        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>

        <div class="absolute bottom-0 p-4 w-full transform translate-y-1 group-hover:translate-y-0 transition-transform">
          <h3 class="text-white font-bold text-sm leading-tight line-clamp-2 uppercase italic tracking-tighter">
            {{ item.games.name }}
          </h3>
          <div class="h-0.5 w-0 bg-blue-500 group-hover:w-full transition-all duration-300 mt-2"></div>
        </div>

        <MicroGameStatus :statuses="item.status"/>

      </NuxtLink>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-20 text-center">
      <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
        <SearchX class="w-10 h-10 text-gray-600" />
      </div>
      <h3 class="text-white font-bold uppercase tracking-widest text-sm">Sin resultados</h3>
      <p v-if="searchQuery" class="text-gray-500 text-xs mt-2">No encontramos nada que coincida con "{{ searchQuery }}"</p>
      <p v-else class="text-gray-500 text-xs mt-2">No se ha encontrado ningún juego</p>
    </div>
  </div>
</template>

<script setup>
import { ChevronLeft, Search, X, SearchX } from 'lucide-vue-next'
import MicroGameStatus from "~/components/microGameStatus.vue";

const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const status = route.params.status
const games = ref([])
const loading = ref(true)
const searchQuery = ref('')

// Lógica de filtrado reactivo
const filteredGames = computed(() => {
  if (!searchQuery.value.trim()) return games.value

  const query = searchQuery.value.toLowerCase().trim()
  return games.value.filter(item =>
      item.games.name.toLowerCase().includes(query)
  )
})

const statusLabel = computed(() => GameStatus[status] || status)

const statusData = computed(() => {
  return GameStatusLabels[status] || null;
});


const fetchGamesByStatus = async () => {
  if (!user.value) return

  loading.value = true
  try {
    // Consulta con JOIN: Traemos la relación y los datos del juego
    const { data, error } = await supabase
        .from('user_library')
        .select(`
          status,
          games (id, name, cover, total_rating)
        `)
        .eq('user_id', user.value.sub)
        .contains('status', [status]) // Filtramos en el array de Supabase

    if (error) throw error

    games.value = data || []

  } catch (err) {
    console.error("Error cargando lista:", err)
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchGamesByStatus())
</script>