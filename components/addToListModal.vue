<template>
  <Teleport to="body">
    <Transition name="fade-scale">
      <div v-if="modelValue" class="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-md" @click="close"></div>

        <div class="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-[40px] p-8 shadow-2xl overflow-hidden">

          <header class="text-center mb-6">
            <h3 class="text-xl font-black text-white uppercase italic tracking-tighter">Añadir a lista</h3>
            <p class="text-gray-500 text-sm truncate">"{{ gameName }}"</p>
          </header>

          <div v-if="loadingLists" class="text-center text-gray-500 py-4">Cargando listas...</div>

          <div v-else class="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 no-scrollbar">
            <div
                v-for="list in userLists"
                :key="list.id"
                @click="toggleGameInList(list.id)"
                class="flex items-center justify-between p-4 bg-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-all border-2"
                :class="isGameInList(list.id) ? 'border-emerald-500' : 'border-transparent'"
            >
              <div class="flex items-center gap-3">
                <Lock v-if="!list.is_public" class="w-4 h-4 text-gray-500" />
                <Globe v-else class="w-4 h-4 text-emerald-500" />
                <span class="text-sm font-bold text-white">{{ list.name }}</span>
              </div>
              <input type="checkbox" :checked="isGameInList(list.id)" class="accent-emerald-500" />
            </div>
          </div>

          <div class="flex flex-col gap-3 pt-2">
            <button
                @click="saveChanges"
                :disabled="saving"
                class="w-full py-5 bg-emerald-500 text-slate-950 font-black uppercase tracking-widest text-xs rounded-2xl active:scale-95 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
            >
              <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
              <span v-else>Confirmar</span>
            </button>

            <button
                type="button"
                @click="close"
                class="w-full py-3 text-gray-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-all"
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
import { Globe, Lock, Loader2 } from 'lucide-vue-next'

const props = defineProps(['modelValue', 'gameId', 'gameName'])
const emit = defineEmits(['update:modelValue'])

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { showToast } = useToast()

const userLists = ref([])
const loadingLists = ref(true)
const saving = ref(false)
const listIdsWithGame = ref(new Set())

// Cargar listas del usuario y verificar en cuáles está el juego
const fetchUserListsAndGameStatus = async () => {
  if (!user.value) return
  loadingLists.value = true

  const { data, error } = await supabase
      .from('lists')
      .select(`
      id, name, is_public,
      list_games!left (game_id)
    `)
      .eq('user_id', user.value.sub)

  if (data) {
    userLists.value = data
    listIdsWithGame.value = new Set(
        data
            .filter(list => list.list_games.some(lg => lg.game_id === props.gameId))
            .map(list => list.id)
    )
  }
  loadingLists.value = false
}

const isGameInList = (listId) => listIdsWithGame.value.has(listId)

const toggleGameInList = (listId) => {
  if (isGameInList(listId)) {
    listIdsWithGame.value.delete(listId)
  } else {
    listIdsWithGame.value.add(listId)
  }
}

// Guardar cambios en la tabla list_games
const saveChanges = async () => {
  saving.value = true

  // Lógica para comparar listIdsWithGame (actual) vs lo que había originalmente
  // Para simplificar, la forma más segura es eliminar y volver a insertar
  // solo para las listas que están en el Set actual.

  // Primero, eliminar el juego de todas las listas del usuario (para resetear)
  // Nota: Esto requiere una política RLS correcta en list_games
  await supabase
      .from('list_games')
      .delete()
      .eq('game_id', props.gameId)
      .in('list_id', userLists.value.map(l => l.id))

  // Segundo, insertar el juego en las listas seleccionadas
  const inserts = Array.from(listIdsWithGame.value).map(listId => ({
    list_id: listId,
    game_id: props.gameId
  }))

  if (inserts.length > 0) {
    const { error } = await supabase.from('list_games').insert(inserts)
    if (error) {
      showToast('Error al actualizar listas', 'error')
      saving.value = false
      return
    }
  }

  showToast('¡Listas actualizadas!')
  saving.value = false
  close()
}

const close = () => {
  emit('update:modelValue', false)
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) fetchUserListsAndGameStatus()
})
</script>

<style scoped>
/* Scrollbar invisible para el contenedor de listas */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.fade-scale-enter-active, .fade-scale-leave-active {
  transition: all 0.3s ease;
}
.fade-scale-enter-from, .fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
</style>