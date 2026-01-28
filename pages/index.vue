<template>
  <div class="library-dashboard">
    <header class="header">
      <h1>Mi Biblioteca</h1>
    </header>

    <div class="stats-list">
      <NuxtLink
          v-for="(info, status) in GameStatusLabels"
          :key="status"
          :to="`/list/${status}`"
          class="stat-card"
      >
        <div class="stat-icon" :style="{ backgroundColor: info.color + '22', color: info.color }">
          <span v-if="status === GameStatus.PENDIENTE">⏳</span>
          <span v-else-if="status === GameStatus.JUGANDO">🎮</span>
          <span v-else-if="status === GameStatus.TERMINADO">✅</span>
          <span v-else>🌑</span>
        </div>

        <div class="stat-content">
          <h3>{{ info.label }}</h3>
          <p>{{ getStatusSubtext(status) }}</p>
        </div>

        <div class="stat-count">
          <span>{{ counts[status] || 0 }}</span>
          <span class="arrow">›</span>
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
  const userId = session?.user?.id

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
    const user = useSupabaseUser()
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
    if (!user.value) return

    // Hacemos una petición para contar por grupos
    const { data, error } = await client
        .from('user_library')
        .select('status')
        .eq('user_id', user.value.id)

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
.hero {
  text-align: center;
  margin-bottom: 3rem;
}

.search-box {
  display: flex;
  gap: 10px;
  background: var(--card-bg);
  padding: 8px;
  border-radius: 50px;
  border: 1px solid rgba(255,255,255,0.1);
}

.search-box input {
  background: transparent;
  border: none;
  padding-left: 15px;
  margin-top: 0;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 columnas en móvil */
  gap: 1.5rem;
}

.game-card {
  background: var(--card-bg);
  border-radius: var(--radius);
  overflow: hidden;
  transition: transform 0.2s;
}

.cover-wrapper {
  position: relative;
  aspect-ratio: 3 / 4;
}

.cover-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.game-card:hover .overlay {
  opacity: 1;
}

.info {
  padding: 0.8rem;
}

.info h3 {
  font-size: 0.9rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.year {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.status-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 10px;
}

.btn-status {
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  color: #000;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s;
}

.btn-status:active {
  transform: scale(0.95);
}

.btn-add {
  background: var(--bg-color);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add.btn-success {
  background: #4ade80 !important; /* Verde esmeralda */
  transform: scale(1.05);
}

.btn-add:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.library-dashboard {
  padding: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.search-trigger {
  background: var(--card-bg);
  padding: 8px 16px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 0.9rem;
}

.stats-list {
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.05);
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 16px;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  transition: background 0.2s;
}

.stat-card:last-child { border-bottom: none; }
.stat-card:active { background: rgba(255,255,255,0.05); }

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin-right: 16px;
}

.stat-content {
  flex-grow: 1;
}

.stat-content h3 {
  margin: 0;
  font-size: 1rem;
}

.stat-content p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.stat-count {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: bold;
  font-size: 1.1rem;
  color: var(--text-muted);
}

.arrow {
  font-size: 1.5rem;
  font-weight: 300;
  opacity: 0.3;
}

</style>