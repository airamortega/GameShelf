<template>
  <div class="list-page">
    <header class="header">
      <NuxtLink to="/" class="back-btn">‹ Mi Biblioteca</NuxtLink>
      <h1>{{ GameStatusLabels[status]?.label || 'Juegos' }}</h1>
    </header>

    <div v-if="pending" class="loading">Cargando...</div>

    <div v-else-if="games?.length" class="game-grid">
      <div v-for="item in games" :key="item.id" class="game-card">
        <div class="cover-wrapper">
          <img :src="item.games.cover_url" :alt="item.games.name" />
          <div class="overlay">
            <select @change="updateStatus(item.id, $event.target.value)" :value="item.status">
              <option v-for="(info, key) in GameStatusLabels" :key="key" :value="key">
                {{ info.label }}
              </option>
            </select>
            <button @click="deleteItem(item.id)" class="btn-delete">🗑️</button>
          </div>
        </div>
        <div class="info">
          <h3>{{ item.games.name }}</h3>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>No tienes juegos en esta categoría.</p>
      <NuxtLink to="/search" class="btn-primary">Añadir juegos</NuxtLink>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const status = route.params.status // Obtenemos el estado de la URL
const client = useSupabaseClient()
const user = useSupabaseUser()

// Consultar solo los juegos de este estado
const { data: games, pending, refresh } = await useAsyncData(`list-${status}`, async () => {
  const { data } = await client
      .from('user_library')
      .select(`
      id,
      status,
      games ( id, name, cover_url )
    `)
      .eq('user_id', user.value.id)
      .eq('status', status)
  return data
})

const updateStatus = async (id, newStatus) => {
  const { error } = await client
      .from('user_library')
      .update({ status: newStatus })
      .eq('id', id)

  if (!error) refresh() // Recarga la lista para que el juego desaparezca si ya no pertenece aquí
}

const deleteItem = async (id) => {
  if (confirm('¿Eliminar de la biblioteca?')) {
    const { error } = await client.from('user_library').delete().eq('id', id)
    if (!error) refresh()
  }
}
</script>

<style scoped>
.header {
  margin-bottom: 2rem;
}
.back-btn {
  text-decoration: none;
  color: var(--bg-color);
  font-size: 1rem;
  display: block;
  margin-bottom: 0.5rem;
}
.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}
.game-card {
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
}
.cover-wrapper {
  position: relative;
  aspect-ratio: 3/4;
}
.cover-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.2s;
}
.game-card:hover .overlay { opacity: 1; }
.info { padding: 8px; }
.info h3 { font-size: 0.85rem; margin: 0; text-align: center; }

/* Estilos para el select y botones internos */
select {
  background: #fff;
  border: none;
  padding: 4px;
  border-radius: 4px;
  font-size: 0.8rem;
}
.btn-delete {
  background: #ef4444;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  color: white;
  cursor: pointer;
}
</style>