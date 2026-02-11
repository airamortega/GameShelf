<template>
  <div class="p-6 max-w-lg mx-auto pb-24 min-h-screen">
    <header class="flex items-center justify-between mb-10">
      <div>
        <h1 class="text-4xl font-black text-white uppercase tracking-tighter italic">Mis Listas</h1>
        <p class="text-slate-500 font-bold uppercase text-xs tracking-widest mt-2">Organiza tus juegos en listas</p>
      </div>
      <button
          @click="showCreateModal = true"
          class="w-12 h-12 bg-white text-slate-950 rounded-2xl font-bold flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-white/5"
      >
        <PlusCircle :size="24" />
      </button>
    </header>

    <div v-if="loading" >
      <AppSpinner />
    </div>

    <draggable
        v-else
        v-model="lists"
        item-key="id"
        handle=".drag-handle"
        ghost-class="opacity-30"
        :delay="200" :delay-on-touch-only="true"
        :touch-start-threshold="5"
        @end="saveOrder"
        class="flex flex-col gap-4"
    >
      <template #item="{ element }">
        <div class="relative group">
          <ListCard :list="element"/>
        </div>
      </template>
    </draggable>
  </div>

  <ListCreateModal
      v-model="showCreateModal"
      @created="handleListCreated"
  />
</template>

<script setup>
import { PlusCircle, Loader2, GripVertical} from 'lucide-vue-next'
import { useLists } from "~/composables/useLists.js"
import draggable from 'vuedraggable'
import ListCreateModal from "~/components/listCreateModal.vue"
import ListCard from "~/components/listCard.vue"

const { fetchMyLists } = useLists();
const { showToast } = useToast();

const supabase = useSupabaseClient()

const lists = ref([])
const loading = ref(true)
const showCreateModal = ref(false)

const handleListCreated = (newList) => {
  lists.value.unshift({
    ...newList,
    game_count: 0,
    covers: [],
    sort_order: 0
  })
}

const saveOrder = async () => {
  const updates = lists.value.map((list, index) => ({
    id: list.id,
    sort_order: index,
    user_id: list.user_id,
    name: list.name
  }))

  const { error } = await supabase
      .from('lists')
      .upsert(updates)

  if (error) console.error("Error guardando orden:", error)

  showToast("¡Listas reordenadas!")
}

onMounted(async () => {
  const { data, error } = await fetchMyLists()
  if (data) lists.value = data
  loading.value = false
})
</script>