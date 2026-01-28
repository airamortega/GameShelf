<template>
  <div class="profile-page" v-if="user">
    <header class="header">
      <h1>Perfil</h1>
    </header>

    <section class="profile-header-card" @click="isEditing = true" :class="{ 'is-clickable': !isEditing }">
      <div class="avatar-circle">
        <img v-if="profile?.avatar_url" :src="profile.avatar_url" alt="Avatar" />
        <span v-else>{{ user?.email?.charAt(0).toUpperCase() }}</span>
      </div>
      <div class="user-info-basic">
        <h2>{{ profile?.username || 'Username' }}</h2>
        <p class="role-badge">Toca para editar perfil</p>
      </div>
    </section>

    <template v-if="isEditing">
      <section class="info-section">
        <h3 class="section-title">Editando</h3>
        <div class="info-list">
          <div class="edit-group">
            <span class="label">Usuario</span>
            <input class="value" v-model="tempUsername" type="text" placeholder="Escribe tu username..." />
          </div>
          <div class="edit-actions">
            <button @click="cancelEdit" class="btn-cancel">Cancelar</button>
            <button @click="saveProfile" class="btn-save" :disabled="loading">
              {{ loading ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </div>
      </section>
    </template>

    <section class="info-section">
      <h3 class="section-title">Información del usuario</h3>

      <div class="info-list">
        <div class="info-item">
          <span class="label">Email</span>
          <span class="value">{{ user?.email }}</span>
        </div>
        <div class="info-item">
          <span class="label">Última sesión</span>
          <span class="value">{{ formatDate(user?.last_sign_in_at) }}</span>
        </div>
      </div>
    </section>

    <section class="actions-section" v-if="!isEditing">
      <button @click="handleLogout" class="btn-logout">Cerrar Sesión</button>
    </section>
  </div>
</template>

<script setup>
const user = useSupabaseUser()
const client = useSupabaseClient()

// Estados de edición
const isEditing = ref(false)
const loading = ref(false)
const tempUsername = ref(user.value?.user_metadata?.username || '')
const tempAvatarUrl = ref(user.value?.user_metadata?.avatar_url || '')

const fetchProfile = async () => {
  if (!user.value) return
  const { data } = await client
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()

  if (data) {
    profile.value = data
    tempUsername.value = data.username || ''
    tempAvatarUrl.value = data.avatar_url || ''
  }
}

const saveProfile = async () => {
  loading.value = true
  try {
    // Usamos UPSERT para que cree o actualice
    const { error } = await client
        .from('profiles')
        .upsert({
          id: user.value.id,
          username: tempUsername.value,
          avatar_url: tempAvatarUrl.value,
          updated_at: new Date()
        })

    if (error) throw error

    // Actualizamos la vista local
    profile.value = { ...profile.value, username: tempUsername.value, avatar_url: tempAvatarUrl.value }
    isEditing.value = false
  } catch (err) {
    alert("Error al guardar en la tabla profiles: " + err.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchProfile())

const cancelEdit = () => {
  isEditing.value = false
  tempUsername.value = user.value?.user_metadata?.username || ''
  tempAvatarUrl.value = user.value?.user_metadata?.avatar_url || ''
}

const handleLogout = async () => {
  await client.auth.signOut()
  navigateTo('/login')
}

const formatDate = (dateString) => {
  if (!dateString) return '---'
  return new Date(dateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<style scoped>
.profile-page {
  padding: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.header h1 {
  font-size: 2rem;
  margin-bottom: 2rem;
  font-weight: 800;
}

/* Card Superior (Avatar + Username) */
.profile-header-card {
  display: flex;
  align-items: center;
  gap: 20px;
  background: var(--card-bg);
  padding: 20px;
  border-radius: 20px;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.avatar-circle {
  width: 70px;
  height: 70px;
  background: var(--bg-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  overflow: hidden;
}

.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info-basic h2 {
  margin: 0;
  font-size: 1.3rem;
}

.role-badge {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* Sección de Lista de Información */
.section-title {
  font-size: 0.9rem;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 1px;
  margin-left: 10px;
  margin-bottom: 10px;
}

.info-list {
  background: var(--card-bg);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-item:last-child { border-bottom: none; }

.info-item .label, .edit-group .label {
  color: var(--text-muted);
  font-size: 0.95rem;
}

.info-item .value {
  font-weight: 500;
  font-size: 0.95rem;
}

.code { font-family: monospace; }

/* Botón Logout */
.actions-section {
  margin-top: 2.5rem;
}

.btn-logout {
  width: 100%;
  padding: 16px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: none;
  border-radius: 16px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-logout:active {
  background: rgba(239, 68, 68, 0.2);
}

.is-clickable { cursor: pointer; }
.profile-header-card:hover.is-clickable { background: rgba(255,255,255,0.08); }

.edit-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--bg-color);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--card-bg);
}

.edit-group {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
}

.edit-group label {
  display: block;
  font-size: 0.75rem;
  color: var(--bg-color);
  margin-bottom: 8px;
  text-transform: uppercase;
  font-weight: 700;
}

.edit-group input {
  background: transparent;
  border: none;
  color: white;
  outline: none;
  font-weight: 700;
  font-size: 0.95rem;
  text-align: end;
}

.edit-actions {
  display: flex;
  padding: 16px;
  gap: 12px;
}

.btn-save, .btn-cancel {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.btn-save {
  background: var(--bg-color); color: white;
}
.btn-cancel {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.btn-save:disabled { opacity: 0.5; }
</style>