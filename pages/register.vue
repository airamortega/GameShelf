<template>
  <div class="min-h-screen flex flex-col justify-center px-6 bg-slate-950">
    <div class="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
      <div class="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      <div class="absolute -bottom-[10%] -right-[10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]"></div>
    </div>

    <div class="max-w-sm mx-auto w-full space-y-10">
      <header class="text-center space-y-2">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-2xl shadow-white/10 -rotate-12">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
        </div>
        <h1 class="text-4xl font-black tracking-tighter text-white uppercase italic">Únete</h1>
        <p class="text-gray-500 font-medium">Comienza tu colección</p>
      </header>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div class="space-y-4">
          <div class="space-y-1">
            <input
                v-model="username"
                type="text"
                placeholder="Nombre de usuario"
                required
                class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-600"
            />
          </div>

          <div class="space-y-1">
            <input
                v-model="email"
                type="email"
                placeholder="Email"
                required
                class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-600"
            />
          </div>

          <div class="space-y-1">
            <input
                v-model="password"
                type="password"
                placeholder="Contraseña"
                required
                class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-600"
            />
          </div>
        </div>

        <button
            type="submit"
            :disabled="loading"
            class="w-full py-4 bg-white text-slate-950 font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 active:scale-[0.98] transition-all shadow-xl shadow-white/5 disabled:opacity-50"
        >
          {{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}
        </button>
      </form>

      <div class="space-y-3">
        <Transition name="fade">
          <p v-if="errorMsg" class="text-center text-red-400 text-xs font-bold bg-red-400/10 py-3 rounded-xl border border-red-400/20">
            {{ errorMsg }}
          </p>
        </Transition>
        <Transition name="fade">
          <p v-if="successMsg" class="text-center text-green-400 text-xs font-bold bg-green-400/10 py-3 rounded-xl border border-green-400/20">
            {{ successMsg }}
          </p>
        </Transition>
      </div>

      <div class="text-center pt-4">
        <p class="text-gray-500 text-sm font-medium">
          ¿Ya tienes cuenta?
          <NuxtLink to="/login" class="text-white font-bold hover:text-blue-400 transition-colors ml-1">
            Inicia sesión
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
const username = ref('')

const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const handleRegister = async () => {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      emailRedirectTo: 'http://localhost:3000/',
      data: {
        user_name: username.value,
      }
    }
  })

  if (error) {
    errorMsg.value = error.message
  } else {
    successMsg.value = '¡Registro con éxito! Revisa tu email para confirmar la cuenta.'
    // Si desactivaste la confirmación de email en Supabase,
    // podrías usar navigateTo('/') directamente aquí.
  }

  loading.value = false
}
</script>

<style scoped>

</style>