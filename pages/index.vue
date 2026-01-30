<template>
  <div class="p-6 max-w-lg mx-auto pb-24 min-h-screen">
    <header class="mb-10 mt-4">
      <h1 class="text-4xl font-black tracking-tight text-white">Mi Biblioteca</h1>
      <p class="text-gray-500 mt-1 font-medium">Gestiona tu colección de juegos</p>
    </header>

    <div class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden divide-y divide-white/5 shadow-2xl">
      <NuxtLink
          v-for="(info, status) in GameStatusLabels"
          :key="status"
          :to="`/list/${status}`"
          class="flex items-center p-5 transition-all duration-200 hover:bg-white/[0.07] active:scale-[0.98] group"
      >
        <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner transition-transform group-hover:scale-110"
            :style="{ backgroundColor: info.color + '22', color: info.color }"
        >
          <span v-html="info.icon"></span>
        </div>

        <div class="flex-1 ml-4">
          <h3 class="text-white font-bold text-lg leading-tight">{{ info.label }}</h3>
          <p class="text-gray-500 text-xs font-medium uppercase tracking-wider mt-0.5">
            {{ getStatusSubtext(status) }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-xl font-black text-gray-400">
            {{ counts[status] || 0 }}
          </span>
          <span class="text-2xl text-white/20 group-hover:text-white/40 transition-colors font-light">
            ›
          </span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import {GameStatus} from "~/utils/enums.ts";

  const user = useSupabaseUser()
  const client = useSupabaseClient()

  const { data: { session } } = await client.auth.getSession()
  const userId = session?.user?.sub

  const query = ref('')
  const results = ref([])
  const loading = ref(false)
  const savingId = ref(null)
  const savedIds = ref(new Set())
  const counts = ref({})

  const searchGames = async () => {
    if (!query.value) return
    loading.value = true
    results.value = [] // Limpiamos resultados anteriores

    try {
      const data = await $fetch('/api/search', { params: { q: query.value } })
      results.value = data || []
    } catch (e) {
      console.error("Error buscando juegos:", e)
      alert("Hubo un error al conectar con la API")
    } finally {
      loading.value = false
    }
  }

  const addToLibrary = async (game, status = GameStatus.PENDIENTE) => {
    if (!user.value) {
      alert('Debes estar logueado para añadir juegos.')
      return navigateTo('/login')
    }

    try {
      const { error: gameError } = await client
          .from('games')
          .upsert({
            id: game.id,
            name: game.name,
            cover_url: game.cover?.url?.replace('t_thumb', 't_cover_big'),
            release_date: new Date(game.first_release_date * 1000).toISOString()
          })

      if (gameError) throw gameError

      const { error: libraryError } = await client
          .from('user_library')
          .insert({
            user_id: userId,
            game_id: game.id,
            status: status
          })

      if (libraryError) {
        if (libraryError.code === '23505') {
          return { success: false, message: 'Duplicado' }
        } else {
          throw libraryError
        }
      }

      return { success: true, message: 'Guardado' }

    } catch (err) {
      console.error('Error al guardar:', err.message)
      return { success: false, message: 'No se pudo añadir el juego' }
    }
  }

  const handleSave = async (game) => {
    if (savedIds.value.has(game.id)) return

    savingId.value = game.id

    try {
      await addToLibrary(game)

      savedIds.value.add(game.id)

      setTimeout(() => {
        savedIds.value.delete(game.id)
      }, 3000)

    } catch (err) {
      alert(err.message)
    } finally {
      savingId.value = null
    }
  }

  // Función para obtener los conteos reales de Supabase
  const fetchCounts = async () => {

    const { data, error } = await client
        .from('user_library')
        .select('status')
        .eq('user_id', user.value.sub)

    if (data) {
      const tally = {}
      data.forEach(item => {
        tally[item.status] = (tally[item.status] || 0) + 1
      })
      counts.value = tally
    }
  }

  const getStatusSubtext = (status) => {
    const texts = {
      pendiente: 'Planificando jugar',
      jugando: 'En progreso',
      terminado: 'Completados al 100%',
      abandonado: 'Pausados o descartados'
    }
    return texts[status]
  }

  onMounted(() => fetchCounts())
</script>

<style scoped>


</style>