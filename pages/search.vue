<template>
  <div class="min-h-screen bg-slate-950 pb-24">
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
        <div
            v-for="game in searchResults"
            :key="game.id"
            @click="openDetails(game)"
            class="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/5 active:scale-95 transition-all duration-300"
        >
          <div class="aspect-[3/4] relative">
            <img :src="getCoverUrl(game.cover?.url)" class="w-full h-full object-cover" alt="cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
            <div class="absolute bottom-3 left-3 right-3">
              <p class="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{{ game.involved_companies?.[0]?.company?.name }}</p>
              <h3 class="text-white font-bold text-xs leading-tight line-clamp-2 uppercase">{{ game.name }}</h3>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Transition name="sheet">
      <div v-if="selectedGame" class="fixed inset-0 z-50 flex items-end">
        <div @click="selectedGame = null" class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"></div>

        <div class="relative w-full max-h-[90vh] bg-slate-900 border-t border-white/10 rounded-t-[40px] shadow-2xl overflow-y-auto overflow-x-hidden mb-20">
          <div class="sticky top-0 bg-slate-900 z-10 p-4 flex justify-center">
            <div class="w-12 h-1.5 bg-white/10 rounded-full"></div>
          </div>

          <div class="p-8 pt-2 space-y-8">
            <div class="flex gap-6">
              <img :src="getCoverUrl(selectedGame.cover?.url, 'cover_big')" class="w-32 rounded-2xl shadow-2xl" />
              <div class="flex-1">
                <h2 class="text-2xl font-black text-white leading-tight mb-2">{{ selectedGame.name }}</h2>
                <div class="flex flex-wrap gap-2">
                  <span v-for="g in selectedGame.genres?.slice(0, 2)" :key="g.id" class="text-[9px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md text-gray-400 border border-white/5">
                    {{ g.name }}
                  </span>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <h4 class="text-xs font-black uppercase tracking-[0.2em] text-blue-500">Sinopsis</h4>
              <p class="text-gray-400 text-sm leading-relaxed line-clamp-4">{{ selectedGame.summary }}</p>
            </div>

            <div class="space-y-4">
              <h4 class="text-xs font-black uppercase tracking-[0.2em] text-blue-500">Tu Biblioteca</h4>
              <div class="grid grid-cols-5 gap-3">
                <button
                    v-for="(info, key) in GameStatusLabels" :key="key"
                    @click="toggleStatus(key)"
                    :style="{backgroundColor: info.color + '22', color: info.color}"
                    :class="[
                    'flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300',
                    tempStatus.includes(key) ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/5 text-gray-500'
                  ]"
                >
                  <component :is="getIcon(key)" class="w-5 h-5" />
                  <span v-html="info.icon" class="text-[10px] font-black uppercase tracking-widest"></span>
                </button>
              </div>
            </div>

            <button
                @click="saveToLibrary"
                class="w-full py-5 font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-2xl active:scale-[0.98]"
                :class="tempStatus.length > 0 ? 'bg-white text-slate-950' : 'bg-red-500/10 text-red-500 border border-red-500/20'"
            >
              {{ loading ? 'Procesando...' : (tempStatus.length > 0 ? 'Confirmar Cambios' : 'Eliminar') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { Clock, Gamepad2, CheckCircle2, XCircle } from 'lucide-vue-next'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const searchQuery = ref('')
const searchResults = ref([])
const loading = ref(false)
const selectedGame = ref(null)
const tempStatus = ref([]) // Estados seleccionados en el modal

// Helper para portadas de IGDB
const getCoverUrl = (url, size = 'cover_big') => {
  if (!url) return 'https://via.placeholder.com/264x352'
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

// 2. Abrir detalles y verificar si ya está en la biblioteca
const openDetails = async (game) => {
  selectedGame.value = game
  tempStatus.value = [] // Reset temporal

  // Consultamos si el usuario ya tiene este juego
  const { data } = await supabase
      .from('user_library')
      .select('status')
      .eq('game_id', game.id)
      .eq('user_id', user.value.sub)
      .single()

  if (data) {
    tempStatus.value = data.status || []
  }
}

// 3. Guardar en Supabase (Multi-estado)
const saveToLibrary = async () => {
  if (!selectedGame.value || !user.value) return

  loading.value = true

  try {
    // PASO 1: Asegurar que el juego existe en la tabla 'games'
    const { error: gameError } = await supabase
        .from('games')
        .upsert({
          id: selectedGame.value.id,
          name: selectedGame.value.name,
          summary: selectedGame.value.summary,
          cover_url: selectedGame.value.cover?.url,
          genres: selectedGame.value.genres?.map(g => g.name) || [],
          developer: selectedGame.value.involved_companies?.find(c => c.developer)?.company?.name
              || selectedGame.value.involved_companies?.[0]?.company?.name,
          updated_at: new Date()
        }, { onConflict: 'id' })

    if (gameError) throw gameError

    // PASO 2: Gestionar la relación en 'user_library'
    // Si tempStatus está vacío, significa que el usuario quiere quitar el juego de su lista
    if (tempStatus.value.length === 0) {
      const { error: deleteError } = await supabase
          .from('user_library')
          .delete()
          .eq('user_id', user.value.sub)
          .eq('game_id', selectedGame.value.id)

      if (deleteError) throw deleteError
    } else {
      const { error: libraryError } = await supabase
          .from('user_library')
          .upsert({
            user_id: user.value.sub,
            game_id: selectedGame.value.id,
            status: tempStatus.value,
            updated_at: new Date()
          }, { onConflict: 'user_id, game_id' })

      if (libraryError) throw libraryError
    }

    // ÉXITO: Cerramos el modal
    selectedGame.value = null
    // Aquí podrías disparar un confetti o una notificación suave

  } catch (err) {
    console.error("Error completo:", err)
    alert("No se pudo guardar: " + err.message)
  } finally {
    loading.value = false
  }
}

const toggleStatus = (key) => {
  if (tempStatus.value.includes(key)) {
    tempStatus.value = tempStatus.value.filter(s => s !== key)
  } else {
    tempStatus.value.push(key)
  }
}

const getIcon = (key) => {
  const map = { PENDIENTE: Clock, JUGANDO: Gamepad2, TERMINADO: CheckCircle2, ABANDONADO: XCircle }
  return map[key]
}

</script>

<style scoped>
/* Animación del Modal (Entra desde abajo) */
.sheet-enter-active, .sheet-leave-active {
  transition: all 0.5s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from, .sheet-leave-to {
  transform: translateY(100%);
}

.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-4 { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
</style>