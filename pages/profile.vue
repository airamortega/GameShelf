<template>
  <div class="p-6 max-w-lg mx-auto pb-24 min-h-screen" v-if="user">
    <header class="mb-8">
      <h1 class="text-3xl font-extrabold tracking-tight text-white">Perfil</h1>
    </header>

    <section @click="isEditing = true"
        class="flex items-center gap-5 bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 transition-all duration-300"
        :class="{ ' hover:bg-white/10 active:scale-[0.98]': !isEditing }"
    >
      <div class="relative w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-500/20 overflow-hidden border-2 border-white/10">
        <img v-if="profile?.avatar_url" :src="profile.avatar_url" class="object-cover w-full h-full" />
        <span v-else class="text-white">{{ profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() }}</span>
      </div>

      <div class="flex-1">
        <h2 class="text-xl font-bold text-white leading-tight">
          {{ profile?.username || '' }}
        </h2>
        <p class="text-sm text-gray-400 font-medium">
          {{ isEditing ? 'Editando información...' : 'Toca para editar perfil' }}
        </p>
      </div>
    </section>

    <Transition name="fade-slide">
      <section v-if="isEditing" class="mt-8 space-y-4">
        <h3 class="text-xs uppercase tracking-widest text-blue-400 font-bold ml-2">Configuración</h3>

        <div class="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
          <div class="p-5 space-y-4">
            <div class="space-y-2">
              <input
                  v-model="tempUsername"
                  type="text"
                  class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-400 placeholder:text-sm"
                  placeholder="Nombre de Usuario"
              />
            </div>
            <!--
            <div class="space-y-2">
              <label class="text-[10px] uppercase font-black text-gray-500 tracking-tighter">URL Avatar</label>
              <input
                  v-model="tempAvatarUrl"
                  type="text"
                  class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  placeholder="https://..."
              />
            </div>
            -->
            </div>

          <div class="p-4 flex gap-3 bg-white/[0.02] border-t border-white/5">
            <button @click="cancelEdit" class="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors">
              Cancelar
            </button>
            <button
                @click="saveProfile"
                :disabled="loading"
                class="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </section>
    </Transition>

    <section class="mt-10">
      <h3 class="text-xs uppercase tracking-widest text-blue-400 font-bold ml-2 mb-3">Información de cuenta</h3>
      <div class="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 divide-y divide-white/5 overflow-hidden">
        <div class="p-4 flex justify-between items-center">
          <span class="text-gray-400 text-sm">Email</span>
          <span class="text-white font-medium text-sm">{{ user?.email }}</span>
        </div>
      </div>
    </section>

    <section class="mt-10" v-if="!isEditing">
      <button
          @click="handleLogout"
          class="w-full py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold border border-red-500/20 transition-all active:scale-[0.97]"
      >
        Cerrar Sesión
      </button>
      <p class="text-center text-[10px] text-gray-600 mt-8 uppercase tracking-[0.2em]">GameShelf v1.0.0</p>
    </section>
  </div>
</template>

<script setup>
const user = useSupabaseUser()
const client = useSupabaseClient()

const profile = ref(null)

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
      .eq('id', user.value.sub)
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
          id: user.value.sub,
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

onMounted(() => fetchProfile())

</script>

<style scoped>

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

</style>