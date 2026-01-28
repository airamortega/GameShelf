<template>
  <div class="auth-container">
    <h1>Entrar a mi Librería</h1>
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Contraseña" required />
      <button type="submit" :disabled="loading">
        {{ loading ? 'Cargando...' : 'Iniciar Sesión' }}
      </button>
    </form>
    <p v-if="errorMsg">{{ errorMsg }}</p>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (error) {
    errorMsg.value = "Error: " + error.message
  } else {
    navigateTo('/') // Redirigir al home tras el éxito
  }
  loading.value = false
}
</script>

<style scoped>
.auth-container {
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

input {
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 1rem;
  border-radius: var(--radius);
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: var(--accent);
}

.btn-primary {
  background: var(--accent);
  color: #000;
  border: none;
  padding: 1rem;
  border-radius: var(--radius);
  font-weight: 700;
  font-size: 1rem;
  margin-top: 1rem;
}

.text-link {
  color: var(--text-muted);
  text-align: center;
  font-size: 0.9rem;
}
</style>