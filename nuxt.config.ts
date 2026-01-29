export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/supabase', '@nuxtjs/tailwindcss'],

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirect: true, // Habilita el guardián de rutas por defecto
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/register'],
    }
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY
    }
  }
})