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
      <div v-if="selectedGame" class="fixed inset-0 z-50 flex items-end max-w-lg mx-auto min-h-screen">
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
              <div class="grid grid-cols-6 gap-2">
                <button
                    v-for="(info, key) in GameStatusLabels" :key="key"
                    @click="toggleStatus(key)"
                    :style="{backgroundColor: info.color + '22',
                      color: info.color,
                      borderColor: tempStatus.includes(key) ? info.color : ''
                    }"
                    :class="[
                    'flex items-center justify-center aspect-square rounded-2xl border transition-all duration-300',
                    tempStatus.includes(key) ? '' : 'bg-white/5 border-white/5 text-gray-500'
                  ]"
                >
                  <span v-html="info.icon" class="text-[10px] font-black uppercase tracking-widest "></span>
                </button>
              </div>
            </div>

            <div class="mt-8 flex gap-3 items-center">

              <button
                  @click="saveToLibrary"
                  :disabled="isInvalidSelection"
                  class="flex-1 py-5 bg-white text-slate-950 font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl active:scale-[0.98] disabled:opacity-20 flex justify-center items-center gap-2"
              >
                <component :is="isAlreadyInLibrary ? 'RefreshCw' : 'Plus'" v-if="!loading" class="w-4 h-4" />
                <span v-if="loading" class="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"></span>
                <span v-else class="text-xs">
                  {{ isAlreadyInLibrary ? 'Actualizar' : 'Añadir' }}
                </span>
              </button>

              <button
                  v-if="isAlreadyInLibrary"
                  @click="confirmDelete"
                  class="w-16 h-[60px] flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl active:bg-red-500 active:text-white transition-all duration-300"
                  title="Eliminar de la biblioteca"
              >
                <Trash2 class="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </div>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showDeleteDialog" class="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-md" @click="showDeleteDialog = false"></div>

        <div class="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-[32px] p-8 shadow-2xl scale-in">
          <div class="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Trash2 class="w-8 h-8 text-red-500" />
          </div>

          <h3 class="text-xl font-black text-white text-center uppercase tracking-tight mb-2">
            ¿Estás seguro?
          </h3>
          <p class="text-gray-400 text-center text-sm leading-relaxed mb-8">
            Esta acción quitará el juego de tu biblioteca.
          </p>

          <div class="flex flex-col gap-3">
            <button
                @click="removeFromLibrary"
                class="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl active:scale-95 transition-all"
            >
              Sí, eliminar ahora
            </button>
            <button
                @click="showDeleteDialog = false"
                class="w-full py-4 bg-white/5 text-gray-400 font-bold uppercase tracking-widest text-xs rounded-2xl active:scale-95 transition-all"
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
import { Trash2, RefreshCw, Plus } from 'lucide-vue-next'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const { showToast } = useToast()

const searchQuery = ref('')
const searchResults = ref([])

const loading = ref(false)
const showDeleteDialog = ref(false)

const selectedGame = ref(null)
const tempStatus = ref([])
const isAlreadyInLibrary = ref(false)

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

// Abrir detalles y verificar si ya está en la biblioteca
const openDetails = async (game) => {
  // Limpiamos antes de empezar
  selectedGame.value = game
  tempStatus.value = []
  isAlreadyInLibrary.value = false

  if (!user.value) return

  // Ejecutamos la consulta
  const { data, error } = await supabase
      .from('user_library')
      .select('status')
      .eq('game_id', game.id)
      .eq('user_id', user.value.sub)
      .maybeSingle() // Importante: devuelve null si no existe

  if (error) {
    console.error("Error al abrir detalles del juego desde el buscador:", error.message)
    return
  }

  // Asignamos SOLO si hay datos, si no, se queda como array vacío
  if (data) {
    tempStatus.value = [...data.status]
    isAlreadyInLibrary.value = true
  } else {
    tempStatus.value = []
  }
}

// Guardar en Supabase
const saveToLibrary = async () => {
  if (!selectedGame.value || !user.value) return

  // --- VALIDACIONES DE ESTADO ---
  // Si no hay ninguno marcado, por defecto se selecciona 'PENDIENTE'
  if (tempStatus.value.length === 0) {
    tempStatus.value = [GameStatus.PENDIENTE]
  }

  // Regla de exclusión: No puede estar 'ABANDONADO' y ('TERMINADO' o 'PLATINO') a la vez
  const tieneAbandonado = tempStatus.value.includes(GameStatus.ABANDONADO)
  const tieneFinalizado = tempStatus.value.includes(GameStatus.TERMINADO)
      || tempStatus.value.includes(GameStatus.PLATINO)
      || tempStatus.value.includes(GameStatus.JUGANDO)

  if (tieneAbandonado && tieneFinalizado) {
    alert("Un juego no puede estar 'Abandonado' y 'Terminado', 'Platino' o 'Jugando' al mismo tiempo.")
    return
  }

  loading.value = true

  try {
    // Guardar/Actualizar el juego en la tabla maestra
    const { error: gameError } = await supabase.from('games').upsert({
      id: selectedGame.value.id,
      name: selectedGame.value.name,
      summary: selectedGame.value.summary,
      cover_url: selectedGame.value.cover?.url,
      release_date: selectedGame.value.release_date
    })
    if (gameError) throw gameError

    // Procesar Géneros
    if (selectedGame.value.genres?.length > 0) {
      // Insertar géneros en la tabla maestra
      await supabase.from('genres').upsert(
          selectedGame.value.genres.map(g => ({ id: g.id, name: g.name }))
      )
      // Crear vínculos en la tabla intermedia
      await supabase.from('game_genres').upsert(
          selectedGame.value.genres.map(g => ({
            game_id: selectedGame.value.id,
            genre_id: g.id
          }))
      )
    }

    // Procesar Desarrolladores
    const devs = selectedGame.value.involved_companies
        ?.filter(c => c.developer)
        .map(c => ({ id: c.company.id, name: c.company.name })) || []

    if (devs.length > 0) {
      await supabase.from('companies').upsert(devs)
      await supabase.from('game_developers').upsert(
          devs.map(d => ({ game_id: selectedGame.value.id, company_id: d.id }))
      )
    }

    // Guardar la relación personal en 'user_library'
    const { error: libError } = await supabase.from('user_library').upsert({
      user_id: user.value.sub,
      game_id: selectedGame.value.id,
      status: tempStatus.value,
      added_at: new Date()
    }, { onConflict: 'user_id, game_id' })

    if (libError) throw libError

    if(isAlreadyInLibrary){
      showToast('¡Actualizado!')
    }else{
      showToast('¡Añadido!')
    }

    selectedGame.value = null
  } catch (err) {
    showToast('Error al guardar', 'error')
    console.error("Error en el guardado:", err)
  } finally {
    loading.value = false
  }
}

const confirmDelete = () => {
  showDeleteDialog.value = true
}

const removeFromLibrary = async () => {
  if (!selectedGame.value || !user.value) return

  loading.value = true
  try {
    const { error } = await supabase
        .from('user_library')
        .delete()
        .eq('game_id', selectedGame.value.id)
        .eq('user_id', user.value.sub)

    if (error) throw error

    showDeleteDialog.value = false
    selectedGame.value = null
    isAlreadyInLibrary.value = false
    tempStatus.value = []

    showToast('¡Eliminado!')

  } catch (err) {
    showToast('¡Error al eliminar!', 'error')
    console.error("Error al eliminar:", err)
  } finally {
    loading.value = false
  }
}

const toggleStatus = (key) => {
  if (tempStatus.value.includes(key)) {
    tempStatus.value = tempStatus.value.filter(s => s !== key)
  } else {
    // Si marcamos Abandonado, limpiamos Terminado/Platino/Jugando
    if (key === GameStatus.ABANDONADO) {
      tempStatus.value = tempStatus.value.filter(s => s !== GameStatus.TERMINADO && s !== GameStatus.PLATINO && s !== GameStatus.JUGANDO)
    }
    // Si marcamos uno de Terminado/Platino/Jugando, limpiamos Abandonado
    if (key === GameStatus.TERMINADO || key === GameStatus.PLATINO || key === GameStatus.JUGANDO) {
      tempStatus.value = tempStatus.value.filter(s => s !== GameStatus.ABANDONADO)
    }

    tempStatus.value.push(key)
  }
}

const isInvalidSelection = computed(() => {
  const status = tempStatus.value
  const hasEmpty = status.length === 0
  const hasConflict = status.includes(GameStatus.ABANDONADO) &&
      (status.includes(GameStatus.TERMINADO) || status.includes(GameStatus.PLATINO) || status.includes(GameStatus.TERMINADO))

  return hasEmpty || hasConflict
})

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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

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