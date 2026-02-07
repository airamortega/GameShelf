<template>

  <div v-if="loading" class="flex items-center justify-center min-h-screen">
    <AppSpinner />
  </div>

  <div v-if="game" class="max-w-lg mx-auto pb-24 min-h-screen">
    <div class="relative h-[35vh] w-full overflow-hidden">
      <img
          :src="game_cover_1080"
          class="w-full h-full object-cover opacity-30 blur-xl scale-110"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

      <button @click="$router.back()" class="absolute top-6 left-6 z-20 w-10 h-10 flex items-center justify-center bg-black/20 backdrop-blur-md rounded-xl border border-white/10">
        <ChevronLeft class="w-6 h-6" />
      </button>

      <div class="absolute bottom-0 left-0 w-full p-6 flex items-end gap-6 translate-y-6">
        <div class="w-32 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 relative">
          <img :src="game_cover_big" class="w-32 rounded-2xl shadow-2xl" />
          <gameRating :rating="game.total_rating" />
        </div>

        <div class="pb-12">
          <h1 class="text-3xl font-black uppercase italic tracking-tighter leading-none mb-2">
            {{ game.name }}
          </h1>
          <div class="flex flex-wrap gap-2">
            <span v-for="g in game.game_genres" :key="g.genres.id" class="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-white/10 rounded-md border border-white/5">
              {{ g.genres.name }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="game" class="px-6 mt-16 mb-16 space-y-8">

      <section>
        <gameUserRating :gameId="game.id" />
      </section>

      <section v-if="game.summary">
        <h2 class="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Sinopsis</h2>
        <p class="text-sm text-gray-400 leading-relaxed font-medium">
          {{ game.summary }}
        </p>
      </section>

      <section>
        <div class="grid grid-cols-2 gap-6 mt-6 p-4 bg-white/5 rounded-xl border border-white/10">

          <div>
            <p class="text-xs uppercase tracking-widest text-gray-500 font-bold">Lanzamiento</p>
            <p class="text-white font-medium">{{ releaseDate }}</p>
          </div>

          <div>
            <p class="text-xs uppercase tracking-widest text-gray-500 font-bold">Desarrollador</p>
            <p class="text-emerald-400 font-medium">{{ developers }}</p>
          </div>

          <div v-if="game.platforms" class="col-span-2">
            <p class="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Plataformas</p>
            <div class="flex flex-wrap gap-2">
              <span
                  v-for="platform in game.platforms"
                  :key="platform.id"
                  class="px-2 py-1 bg-white/10 rounded text-xs text-gray-300 border border-white/5"
              >
                {{ platform.name }}
              </span>
            </div>
          </div>

        </div>
      </section>

      <section>
        <div class="space-y-4">
          <h4 class="text-xs font-black uppercase tracking-[0.2em] text-blue-500">Tu Biblioteca</h4>
          <div class="grid grid-cols-6 gap-2">
            <button
                v-for="(info, key) in GameStatusLabels" :key="key"
                @click="toggleStatus(key)"
                :style="{backgroundColor: info.color + '22',
                      color: info.color,
                      borderColor: userStatus.includes(key) ? info.color : ''
                    }"
                :class="[
                    'flex items-center justify-center aspect-square rounded-2xl border transition-all duration-300',
                    userStatus.includes(key) ? '' : 'bg-white/5 border-white/5 text-gray-500'
                  ]"
            >
              <span v-html="info.icon" class="text-[10px] font-black uppercase tracking-widest "></span>
            </button>
          </div>
        </div>

        <div class="mt-8 flex gap-3 items-center">

          <button
              @click="handleAction"
              :disabled="isInvalidSelection"
              class="flex-1 py-5 bg-white text-slate-950 font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl active:scale-[0.98] disabled:opacity-20 flex justify-center items-center gap-2"
          >
            <span v-if="loading" class="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"></span>
            <span v-else-if="isAlreadyInLibrary" class="text-xs">Actualizar</span>
            <span v-else class="text-xs">Añadir</span>
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
      </section>

      <section>
        <gameComments :gameId="game.id" />
      </section>

    </div>
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
import {ChevronLeft, Trash2} from 'lucide-vue-next'
const { showToast } = useToast()

const route = useRoute()
const router = useRouter()

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const game = ref(null)
let game_cover_big = ref(null)
let game_cover_1080 = ref(null)

const userStatus = ref([])
const loading = ref(false)
const showDeleteDialog = ref(false)

const isAlreadyInBD = ref(false)
const isAlreadyInLibrary = ref(false)

const SEARCH = "search"

let timeout = null

const developers = computed(() => {
  if (game.value.game_companies && game.value.game_companies.length > 0) {
    return game.value.game_companies
        .filter(c => c.is_developer)
        .map(c => c.companies?.name)
        .filter(name => name)
        .join(', ') || 'Desconocido';
  }

  return game.value.involved_companies
      ?.filter(c => c.developer)
      .map(c => c.company.name)
      .join(', ') || 'Desconocido';
});

const releaseDate = computed(() => {
  if (game.value.release_date) {
    return new Date(game.value.release_date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } else if (game.value.first_release_date){
    return new Date(game.value.first_release_date * 1000).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }else {
    return 'TBA';
  }
});

const fetchGameDetails = async () => {
  loading.value = true

  const { data, error } = await supabase
      .from('games')
      .select(`
      *,
      game_genres ( genres ( name ) ),
      game_companies (
        is_developer,
        companies ( name )
      )
    `)
      .eq('id', route.params.id)
      .maybeSingle()

  if (data) {
    game.value = data

    // Obtener estado del usuario
    const { data: libData } = await supabase
        .from('user_library')
        .select('status')
        .eq('game_id', route.params.id)
        .eq('user_id', user.value.sub)
        .maybeSingle()

    if (libData) {
      userStatus.value = libData.status
      isAlreadyInLibrary.value = true
    }

    isAlreadyInBD.value = true

    game_cover_big.value = getCoverUrl(game.value.cover)
    game_cover_1080.value = getCoverUrl(game.value.cover, 't_1080p')

    loading.value = false

  }else{
    timeout = setTimeout(async () => {
      try {
        const data = await $fetch('/api/searchById', {
          method: 'POST',
          body: { query: route.params.id }
        })
        game.value = data

        game_cover_big.value = getCoverUrl(game.value.cover.url);
        game_cover_1080.value = getCoverUrl(game.value.cover.url, 't_1080p');

        loading.value = false

      } catch (e) {
        console.error("Error buscando en IGDB:", e)
      }
    }, 600)
  }


}

const handleAction = () => {
  if(isAlreadyInBD.value){
    updateStatus()
  }else{
    saveToLibrary()
  }
}

const saveToLibrary = async () => {
  if (!game.value || !user.value) return

  // --- VALIDACIONES DE ESTADO ---
  if (userStatus.value.length === 0) {
    userStatus.value = [GameStatus.PENDIENTE]
  }

  // Regla de exclusión: No puede estar 'ABANDONADO' y ('TERMINADO' o 'PLATINO') a la vez
  const tieneAbandonado = userStatus.value.includes(GameStatus.ABANDONADO)
  const tieneFinalizado = userStatus.value.includes(GameStatus.TERMINADO)
      || userStatus.value.includes(GameStatus.PLATINO)
      || userStatus.value.includes(GameStatus.JUGANDO)

  if (tieneAbandonado && tieneFinalizado) {
    showToast('¡Estados inválidos!', 'error')
    return
  }

  loading.value = true

  try {
    const releaseDate = game.value.first_release_date
        ? new Date(game.value.first_release_date * 1000).toISOString()
        : null;

    // Guardar/Actualizar el juego en la tabla maestra
    const { error: gameError } = await supabase
        .from('games')
        .upsert({
          id: game.value.id,
          name: game.value.name,
          summary: game.value.summary,
          cover: game.value.cover?.url,
          release_date: releaseDate,
          total_rating: game.value.total_rating
        })
    if (gameError) throw gameError

    // Procesar Géneros
    if (game.value.genres?.length > 0) {
      // Insertar géneros en la tabla maestra
      await supabase.from('genres').upsert(
          game.value.genres.map(g => ({ id: g.id, name: g.name }))
      )
      // Crear vínculos en la tabla intermedia
      await supabase.from('game_genres').upsert(
          game.value.genres.map(g => ({
            game_id: game.value.id,
            genre_id: g.id
          }))
      )
    }

    // Guardar Compañías (Involved Companies)
    if (game.value.involved_companies) {
      for (const inv of game.value.involved_companies) {
        // Guardamos la compañía en sí
        await supabase.from('companies').upsert({
          id: inv.company.id,
          name: inv.company.name
        })

        // Creamos la relación marcando si es developer
        await supabase.from('game_companies').upsert({
          game_id: game.value.id,
          company_id: inv.company.id,
          is_developer: inv.developer
        })
      }
    }

    // Guardar la relación personal en 'user_library'
    const { error: libError } = await supabase.from('user_library').upsert({
      user_id: user.value.sub,
      game_id: game.value.id,
      status: userStatus.value,
      added_at: new Date()
    }, { onConflict: 'user_id, game_id' })

    if (libError) throw libError

    showToast('¡Añadido!')
    isAlreadyInLibrary.value = true

  } catch (err) {
    showToast('Error al guardar', 'error')
    console.error("Error en el guardado:", err)
  } finally {
    loading.value = false
  }
}

const updateStatus = async () => {
  loading.value = true
  try {
    const { error } = await supabase
        .from('user_library')
        .upsert({
          user_id: user.value.sub,
          game_id: route.params.id,
          status: userStatus.value
        }, {
          onConflict: 'user_id, game_id'
        })

    if (error) throw error

    showToast('¡Actualizado!')
    isAlreadyInLibrary.value = true

  } catch (err) {
    showToast('Error al guardar', 'error')
    console.error("Error completo:", err)
  } finally {
    loading.value = false
  }
}

const confirmDelete = () => {
  showDeleteDialog.value = true
}

const removeFromLibrary = async () => {
  if (!game.value || !user.value) return

  loading.value = true
  try {
    const { error } = await supabase
        .from('user_library')
        .delete()
        .eq('game_id', game.value.id)
        .eq('user_id', user.value.sub)

    if (error) throw error

    showDeleteDialog.value = false
    game.value = null

    showToast('¡Eliminado!', 'success')

    setTimeout(() => {
      const prevStatus = route.query.from

      if(SEARCH === prevStatus){
        router.push('/search')
      } else {
        router.push(prevStatus ? '/list/'+ prevStatus :'/library')
      }
    }, 500)

  } catch (err) {
    showToast('¡Error al eliminar!', 'error')
    console.error("Error al eliminar:", err)
  } finally {
    loading.value = false
  }
}

const toggleStatus = (key) => {
  if (userStatus.value.includes(key)) {
    userStatus.value = userStatus.value.filter(s => s !== key)
  } else {
    // Si marcamos Abandonado, limpiamos Terminado/Platino/Jugando
    if (key === GameStatus.ABANDONADO) {
      userStatus.value = userStatus.value.filter(s => s !== GameStatus.TERMINADO && s !== GameStatus.PLATINO && s !== GameStatus.JUGANDO)
    }
    // Si marcamos uno de Terminado/Platino/Jugando, limpiamos Abandonado
    if (key === GameStatus.TERMINADO || key === GameStatus.PLATINO || key === GameStatus.JUGANDO) {
      userStatus.value = userStatus.value.filter(s => s !== GameStatus.ABANDONADO)
    }

    userStatus.value.push(key)
  }
}

const isInvalidSelection = computed(() => {
  const status = userStatus.value
  const hasEmpty = status.length === 0
  const hasConflict = status.includes(GameStatus.ABANDONADO) &&
      (status.includes(GameStatus.TERMINADO) || status.includes(GameStatus.PLATINO) || status.includes(GameStatus.TERMINADO))

  return hasEmpty || hasConflict
})

const getCoverUrl = (url, size = 't_cover_big') => {
  if (!url) return '/images/default_cover.png'
  return url.replace('t_thumb', `${size}`)
}

onMounted(() => fetchGameDetails())
</script>