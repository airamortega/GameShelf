<template>
  <div class="max-w-lg mx-auto min-h-screen">
    <header class="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 p-6">
      <h1 class="text-2xl font-black text-white uppercase tracking-tighter mb-4 italic">Explorar</h1>
      <div class="relative group">
        <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="Busca un juego..."
            class="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
        />
        <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </div>
    </header>

    <main class="p-6">
      <div v-if="loading" class="flex justify-center py-20">
        <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else class="grid grid-cols-2 gap-4">
        <NuxtLink
            v-for="game in searchResults"
            :key="game.id"
            :to="`/game/${game.id}?from=search`"
            class="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/5 active:scale-95 transition-all duration-300"
        >
          <div class="aspect-[3/4] relative">
            <img :src="getCoverUrl(game.cover?.url)" class="w-full h-full object-cover" alt="cover" />
            <gameRating :rating="game.total_rating" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
            <div class="absolute bottom-3 left-3 right-3">
              <p class="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{{ game.involved_companies?.[0]?.company?.name }}</p>
              <h3 class="text-white font-bold text-s leading-tight line-clamp-2 uppercase">{{ game.name }}</h3>
            </div>
          </div>
        </NuxtLink>
      </div>
    </main>
  </div>

</template>

<script setup>

defineOptions({name: 'search'})

const searchQuery = ref('')
const searchResults = ref([])
const loading = ref(false)

// Helper para portadas de IGDB
const getCoverUrl = (url, size = 'cover_big') => {
  if (!url) return '/images/default_cover.png'
  return url.replace('t_thumb', `t_${size}`)
}

// 1. Función de Búsqueda
let timeout = null
const handleSearch = () => {
  clearTimeout(timeout)
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  timeout = setTimeout(async () => {
    loading.value = true
    try {
      // Llamamos a nuestro servidor proxy de Nuxt
      const data = await $fetch('/api/search', {
        method: 'POST',
        body: { query: searchQuery.value }
      })
      searchResults.value = data
    } catch (e) {
      console.error("Error buscando en IGDB:", e)
    } finally {
      loading.value = false
    }
  }, 600) // Debounce de 600ms para no quemar la API
}

</script>

<style scoped>
@keyframes scaleIn {
  from {
    transform: scale(0.9) translateY(10px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
</style>