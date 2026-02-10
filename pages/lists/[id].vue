<template>
  <div class="p-6 max-w-7xl mx-auto">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/5">
      <div class="flex items-center gap-4">
        <NuxtLink to="/lists/shelfs" class="p-3 bg-white/5 rounded-2xl text-gray-400 hover:bg-white/10 hover:text-white transition-all">
          <ChevronLeft class="w-6 h-6" />
        </NuxtLink>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-4xl font-black text-white uppercase tracking-tighter italic">{{ list?.name }}</h1>
            <Lock v-if="!list?.is_public" class="w-6 h-6 text-gray-500" />
            <Globe v-else class="w-6 h-6 text-emerald-500" />
          </div>
          <p class="text-gray-500 text-sm font-medium">Creada el {{ formatDate(list?.created_at) }}</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button @click="showEditModal = true"
                class="px-5 py-3 bg-white/5 rounded-xl text-white font-bold text-sm hover:bg-white/10 active:scale-95 transition-all"
        >
          <Pencil :size="20" class=" text-white" />
        </button>
        <button @click="showDeleteModal = true" class="px-5 py-3 bg-red-500/10 text-red-400 rounded-xl font-bold text-sm hover:bg-red-500/20 active:scale-95 transition-all">
          <Trash2 :size="20" class=" text-red-500" />
        </button>
      </div>
    </header>

    <div v-if="loading" class="text-center text-gray-500 py-20">Cargando juegos...</div>

    <div v-else-if="games.length === 0" class="text-center py-20 bg-slate-900 rounded-3xl border border-white/5">
      <Gamepad2 class="w-16 h-16 text-gray-700 mx-auto mb-4" />
      <h3 class="text-xl font-bold text-white">Lista vacía</h3>
      <p class="text-gray-500 mb-6">Añade juegos desde su ficha técnica.</p>
      <NuxtLink to="/" class="px-6 py-3 bg-white text-slate-950 rounded-xl font-bold text-sm">
        Explorar juegos
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-5 gap-6">
      <div v-for="gameItem in games" :key="gameItem.games.id" class="relative group">
        <NuxtLink :to="`/game/${gameItem.games.id}`">
          <div class="aspect-[3/4] rounded-2xl overflow-hidden mb-3 border-2 border-transparent group-hover:border-emerald-500/50 transition-all shadow-lg">
            <img :src="getCoverUrl(gameItem.games.cover)" :alt="gameItem.games.name" class="w-full h-full object-cover" />
          </div>
          <h4 class="text-sm font-bold text-white truncate">{{ gameItem.games.name }}</h4>
        </NuxtLink>

        <button
            @click="removeGame(gameItem.games.id)"
            class="absolute top-2 right-2 p-2 bg-slate-950/70 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>

  <ListEditModal
      v-model="showEditModal"
      :list="list"
      @updated="fetchListDetails"
  />

  <ListDeleteModal
      v-model="showDeleteModal"
      :loading="isDeleting"
      title="¿Borrar esta lista?"
      description="Se perderán todos los juegos guardados en esta colección. No podrás recuperarla."
      confirmText="Eliminar permanentemente"
      @confirm="handleDeleteList"
  />

</template>

<script setup>
import { ChevronLeft, Lock, Globe, Gamepad2, Trash2, Pencil } from 'lucide-vue-next'
import { useLists } from '@/composables/useLists'
import ListEditModal from "~/components/listEditModal.vue";
import ListDeleteModal from "~/components/listDeleteModal.vue";

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()
const supabase = useSupabaseClient()

const list = ref(null)
const games = ref([])
const loading = ref(true)

const showEditModal = ref(false)

const listId = route.params.id

const showDeleteModal = ref(false)
const isDeleting = ref(false)

const handleDeleteList = async () => {
  isDeleting.value = true
  const { error } = await supabase.from('lists').delete().eq('id', listId)

  if (!error) {
    showToast('Lista eliminada con éxito')
    router.push('/lists/shelfs')
  } else {
    showToast('Hubo un error al eliminar', 'error')
    isDeleting.value = false
    showDeleteModal.value = false
  }
}

// Función para obtener detalles de la lista y sus juegos
const fetchListDetails = async () => {
  loading.value = true

  // 1. Obtener info de la lista
  const { data: listData, error: listError } = await supabase
      .from('lists')
      .select('*')
      .eq('id', listId)
      .single()

  if (listError) {
    showToast('Error cargando lista', 'error')
    router.push('/lists')
    return
  }
  list.value = listData

  // 2. Obtener juegos de la lista
  const { data: gamesData, error: gamesError } = await supabase
      .from('list_games')
      .select(`
      games (id, name, cover)
    `)
      .eq('list_id', listId)
      .order('added_at', { ascending: false })

  if (gamesError) {
    showToast('Error cargando juegos', 'error')
  } else {
    games.value = gamesData
  }

  loading.value = false
}

// Eliminar juego de la lista
const removeGame = async (gameId) => {
  const { removeGameFromList } = useLists()
  const { error } = await removeGameFromList(listId, gameId)
  if (!error) {
    showToast('Juego eliminado de la lista')
    games.value = games.value.filter(g => g.games.id !== gameId)
  } else {
    showToast('Error al eliminar juego', 'error')
  }
}

// Eliminar la lista completa
const deleteList = async () => {
  if (!confirm('¿Estás seguro de eliminar esta lista? No se pueden deshacer los cambios.')) return

  const { error } = await supabase.from('lists').delete().eq('id', listId)
  if (!error) {
    showToast('Lista eliminada')
    router.push('/lists')
  } else {
    showToast('Error al eliminar lista', 'error')
  }
}

const getCoverUrl = (url) => url?.replace('t_thumb', 't_cover_big') || '/placeholder.jpg'
const formatDate = (date) => new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })

onMounted(fetchListDetails)
</script>