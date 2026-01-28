<template>
  <div class="library-page">
    <header class="hero">
      <h1>Mi Colección</h1>
      <p class="text-muted">Gestiona tus partidas y progresos</p>
    </header>

    <div v-if="pending" class="loading">Cargando colección...</div>

    <div v-else class="game-list">
      <div v-for="item in myGames" :key="item.id" class="library-item">
        <img :src="item.games.cover_url" alt="Portada" class="mini-cover" />
        <div class="item-info">
          <h3>{{ item.games.name }}</h3>
          <span class="status-badge" :class="item.status">{{ item.status }}</span>
        </div>
        <button @click="removeGame(item.id)" class="btn-remove">🗑️</button>
      </div>
    </div>
  </div>
</template>

<script setup>
  const user = useSupabaseUser()
  const client = useSupabaseClient()

  // Obtenemos los juegos uniendo la tabla library con la de games
  const { data: myGames, pending, refresh } = await useAsyncData('my-library', async () => {
    const { data } = await client
        .from('user_library')
        .select(`
        id,
        status,
        games (
          name,
          cover_url
        )
      `)
        .eq('user_id', user.value.id)
    return data
  })

  const removeGame = async (id) => {
    const { error } = await client.from('user_library').delete().eq('id', id)
    if (!error) refresh()
  }
</script>

<style scoped>
.library-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--card-bg);
  padding: 1rem;
  border-radius: var(--radius);
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.mini-cover {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info {
  flex-grow: 1;
}

.status-badge {
  font-size: 0.7rem;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(255,255,255,0.1);
}

.status-badge.completado { color: #4ade80; }
.status-badge.pendiente { color: #facc15; }

.btn-remove {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  opacity: 0.5;
}
</style>