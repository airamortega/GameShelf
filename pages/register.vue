<template>
  <div class="auth-container">
    <h1>Crear Cuenta</h1>
    <form @submit.prevent="handleRegister">
      <div>
        <label>Email:</label>
        <input v-model="email" type="email" placeholder="tu@email.com" required />
      </div>
      <div>
        <label>Contraseña:</label>
        <input v-model="password" type="password" placeholder="Mínimo 6 caracteres" required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Creando cuenta...' : 'Registrarse' }}
      </button>
    </form>

    <p v-if="errorMsg" style="color: red;">{{ errorMsg }}</p>
    <p v-if="successMsg" style="color: green;">{{ successMsg }}</p>

    <hr />
    <p>¿Ya tienes cuenta? <NuxtLink to="/login">Inicia sesión</NuxtLink></p>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
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
    // Opcional: Esto enviará metadatos a la tabla auth.users
    options: {
      emailRedirectTo: 'http://localhost:3000/confirm',
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