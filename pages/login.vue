<template>
  <div class="min-h-screen flex flex-col justify-center px-6 bg-slate-950">
    <div class="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
      <div class="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div class="absolute -bottom-[10%] -left-[10%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
    </div>

    <div class="max-w-sm mx-auto w-full space-y-10">
      <header class="text-center space-y-2">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-2xl shadow-white/10 rotate-12">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-library-icon lucide-library w-8 h-8 text-slate-950"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>
        </div>
        <h1 class="text-4xl font-black tracking-tighter text-white uppercase italic">GameShelf</h1>
        <p class="text-gray-500 font-medium">Gestiona tu colección personal</p>
      </header>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div class="space-y-4">
          <input
              v-model="email"
              type="email"
              placeholder="Email"
              required
              class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-600"
          />
          <input
              v-model="password"
              type="password"
              placeholder="Contraseña"
              required
              class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-600"
          />
        </div>

        <button
            type="submit"
            :disabled="loading"
            class="w-full py-4 bg-white text-slate-950 font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 active:scale-[0.98] transition-all shadow-xl shadow-white/5 disabled:opacity-50"
        >
          {{ loading ? 'Conectando...' : 'Entrar' }}
        </button>
      </form>

      <Transition name="fade">
        <div v-if="errorMsg" class="h-12">

            <p class="text-center text-red-400 text-[11px] font-bold bg-red-400/10 py-3 rounded-xl border border-red-400/20 uppercase tracking-wider">
              {{ errorMsg }}
            </p>
        </div>
      </Transition>

      <div class="text-center pt-4">
        <p class="text-gray-500 text-sm font-medium">
          ¿No tienes cuenta?
          <NuxtLink to="/register" class="text-white font-bold hover:text-blue-400 transition-colors ml-1">
            Registrate
          </NuxtLink>
        </p>
      </div>

      <footer class="text-center">
        <p class="text-[10px] text-gray-600 uppercase tracking-[0.2em]">GameShelf v1.0.0</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'auth'
})

const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) {
      errorMsg.value = error.message
    } else {
      await navigateTo('/')
    }
  } catch (e) {
    errorMsg.value = "Error de conexión inesperado"
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>