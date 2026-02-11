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
  },

  app: {
    head: {
      title: 'GameShelf',
      meta: [
        { name: 'theme-color', content: '#0f172a' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
      link: [
        // Icono estándar
        { rel: 'icon', type: 'image/x-icon', href: '/512x512.png' },
        // Icono para iOS (Apple)
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ]
    }
  }
})