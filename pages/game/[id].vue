<template>
  <div v-if="game" class="p-6 max-w-lg mx-auto pb-24 min-h-screen">
    <div class="relative h-[35vh] w-full overflow-hidden">
      <img
          :src="game.cover_url?.replace('t_thumb', 't_1080p')"
          class="w-full h-full object-cover opacity-30 blur-xl scale-110"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

      <button @click="$router.back()" class="absolute top-6 left-6 z-20 w-10 h-10 flex items-center justify-center bg-black/20 backdrop-blur-md rounded-xl border border-white/10">
        <ChevronLeft class="w-6 h-6" />
      </button>

      <div class="absolute bottom-0 left-0 w-full p-6 flex items-end gap-6 translate-y-10">
        <div class="w-32 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0">
          <img :src="game.cover_url?.replace('t_thumb', 't_cover_big')" class="w-full h-full object-cover" />
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

    <div class="px-6 mt-16 mb-16 space-y-8">

      <section v-if="game.summary">
        <h2 class="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Sinopsis</h2>
        <p class="text-sm text-gray-400 leading-relaxed font-medium">
          {{ game.summary }}
        </p>
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
              @click="updateStatus"
              :disabled="isInvalidSelection"
              class="flex-1 py-5 bg-white text-slate-950 font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl active:scale-[0.98] disabled:opacity-20 flex justify-center items-center gap-2"
          >
            <span v-if="loading" class="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"></span>
            <span v-else class="text-xs">Actualizar</span>
          </button>

          <button
              @click="confirmDelete"
              class="w-16 h-[60px] flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl active:bg-red-500 active:text-white transition-all duration-300"
              title="Eliminar de la biblioteca"
          >
            <Trash2 class="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
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
const userStatus = ref([])
const loading = ref(false)
const showDeleteDialog = ref(false)

const fetchGameDetails = async () => {
  const { data, error } = await supabase
      .from('games')
      .select(`
      *,
      game_genres ( genres ( id, name ) )
    `)
      .eq('id', route.params.id)
      .single()

  if (data) game.value = data

  // Obtener estado del usuario
  const { data: libData } = await supabase
      .from('user_library')
      .select('status')
      .eq('game_id', route.params.id)
      .eq('user_id', user.value.sub)
      .maybeSingle()

  if (libData) userStatus.value = libData.status
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
      router.push(prevStatus ? '/list/'+ prevStatus :'/library')
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


onMounted(() => fetchGameDetails())
</script>