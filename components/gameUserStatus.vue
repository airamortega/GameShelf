<template>
  <div class="bg-white/5 border border-white/5 rounded-2xl p-6 shadow-xl">
    <div>
      <div class="grid grid-cols-6 gap-2">
        <button
            v-for="(info, key) in GameStatusLabels" :key="key"
            @click="toggleStatus(key)"
            :style="{
              backgroundColor: info.color + '22',
              color: info.color,
              borderColor: userStatus.includes(key) ? info.color : ''
            }"
            :class="[
                'flex items-center justify-center aspect-square rounded-2xl border transition-all duration-300',
                userStatus.includes(key) ? '' : 'bg-white/5 border-white/5 text-gray-500'
              ]"
        >
          <span v-html="info.icon" class="text-[10px] font-black uppercase tracking-widest"></span>
        </button>
      </div>
    </div>

    <div class="space-y-4 mt-8">
      <div class="flex gap-3 overflow-x-auto no-scrollbar py-3 pl-1">
        <button
            v-for="plat in PLATFORMS_LIST"
            :key="plat.id"
            @click="togglePlatform(plat.name)"
            :style="{
              backgroundColor: userPlatforms.includes(plat.name) ? plat.color : '',
              borderColor: userPlatforms.includes(plat.name) ? plat.color : '',
              boxShadow: userPlatforms.includes(plat.name) ? `0 10px 15px -3px ${plat.color}44` : ''
            }"
            :class="[
              'flex-shrink-0 px-6 py-3 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all duration-300',
              userPlatforms.includes(plat.name)
                ? 'text-white scale-105 border-transparent'
                : 'bg-white/5 border-white/5 text-gray-500 opacity-60'
            ]"
        >
          {{ plat.name }}
        </button>
      </div>
    </div>

    <div class="mt-8 flex gap-3 items-center">
      <button
          @click="handleAction"
          :disabled="isInvalidSelection || loading"
          class="flex-1 py-5 bg-white text-slate-950 font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl active:scale-[0.98] disabled:opacity-20 flex justify-center items-center gap-2"
      >
        <span v-if="loading" class="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"></span>
        <template v-else>
          <span v-if="isAlreadyInLibrary">Actualizar</span>
          <span v-else>Añadir</span>
        </template>
      </button>

      <button
          v-if="isAlreadyInLibrary"
          @click="showDeleteDialog = true"
          class="w-16 h-[60px] flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl active:bg-red-500 active:text-white transition-all duration-300"
      >
        <Trash2 :size="20" />
      </button>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDeleteDialog" class="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-md" @click="showDeleteDialog = false"></div>
          <div class="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-[32px] p-8 shadow-2xl">
            <div class="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trash2 class="w-8 h-8 text-red-500" />
            </div>
            <h3 class="text-xl font-black text-white text-center uppercase tracking-tight mb-2">¿Estás seguro?</h3>
            <p class="text-gray-400 text-center text-sm mb-8">Esta acción quitará el juego de tu biblioteca.</p>
            <div class="flex flex-col gap-3">
              <button @click="removeFromLibrary" class="w-full py-4 bg-red-600 text-white font-black uppercase text-xs rounded-2xl">Sí, eliminar ahora</button>
              <button @click="showDeleteDialog = false" class="w-full py-4 bg-white/5 text-gray-400 font-bold uppercase text-xs rounded-2xl">Cancelar</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { Trash2 } from 'lucide-vue-next'

const props = defineProps({
  game: { type: Object, required: true },
  isAlreadyInBD: { type: Boolean, default: false }
})

const userStatus = defineModel()
const userPlatforms = defineModel('userPlatforms')
const isAlreadyInLibrary = defineModel('isAlreadyInLibrary')

const { showToast } = useToast()
const supabase = useSupabaseClient()

const user = useSupabaseUser()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const showDeleteDialog = ref(false)

const toggleStatus = (key) => {
  let current = [...userStatus.value]
  if (current.includes(key)) {
    current = current.filter(s => s !== key)
  } else {
    if (key === GameStatus.ABANDONADO) {
      current = current.filter(s => ![GameStatus.TERMINADO, GameStatus.PLATINO, GameStatus.JUGANDO].includes(s))
    }
    if ([GameStatus.TERMINADO, GameStatus.PLATINO, GameStatus.JUGANDO].includes(key)) {
      current = current.filter(s => s !== GameStatus.ABANDONADO)
    }
    current.push(key)
  }
  userStatus.value = current
}

const isInvalidSelection = computed(() => {
  const status = userStatus.value
  if (status.length === 0) return true
  return status.includes(GameStatus.ABANDONADO) &&
      (status.includes(GameStatus.TERMINADO) || status.includes(GameStatus.PLATINO))
})

const handleAction = () => props.isAlreadyInBD ? updateStatus() : saveToLibrary()

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
      platforms: userPlatforms.value,
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
          status: userStatus.value,
          platforms: userPlatforms.value
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

const removeFromLibrary = async () => {
  if (!props.game || !user.value) return

  loading.value = true
  try {
    const { error } = await supabase
        .from('user_library')
        .delete()
        .eq('game_id', props.game.id)
        .eq('user_id', user.value.sub)

    if (error) throw error

    showDeleteDialog.value = false

    showToast('¡Eliminado!', 'success')

    setTimeout(() => {
      const prevStatus = route.query.from

      if("SEARCH" === prevStatus){
        router.push('/search')
      } else {
        router.push(prevStatus ? '/game/'+ prevStatus :'/library')
      }
    }, 500)

  } catch (err) {
    showToast('¡Error al eliminar!', 'error')
    console.error("Error al eliminar:", err)
  } finally {
    loading.value = false
  }
}

// Lógica para marcar/desmarcar
const togglePlatform = (id) => {
  if (userPlatforms.value.includes(id)) {
    userPlatforms.value = userPlatforms.value.filter(p => p !== id)
  } else {
    userPlatforms.value.push(id)
  }
}

</script>