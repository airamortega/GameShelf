<script setup>
  definePageMeta({
    layout: 'auth'
  })

  // Extraemos las funciones del composable
  const { setMode, mode } = useAppMode();
  const router = useRouter();

  const selectApp = (selectedMode) => {
    if (typeof setMode === 'function') {
      setMode(selectedMode);

      if (selectedMode === 'manga') {
        router.push('/manga/search');
      } else {
        router.push('/game/inicio');
      }
    } else {
      console.error("Error: setMode no está definida correctamente en el composable");
    }
  };
</script>

<template>
  <div class="p-6 max-w-lg mx-auto pb-24 min-h-screen">

    <div class="text-center space-y-2 mb-4">
      <h1 class="text-4xl font-black text-white uppercase tracking-tighter italic">Selecciona tu Hub</h1>
      <p class="text-slate-400 text-sm font-medium">¿Qué quieres hacer hoy?</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">

      <button
          @click="selectApp('manga')"
          class="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 p-8 text-left transition-all hover:border-blue-500/50 hover:bg-blue-500/5 active:scale-95"
      >
        <div class="relative z-10 space-y-4 text-center">
          <div class="flex items-center justify-center">
            <div class="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>
            </div>
          </div>
          <div>
            <h2 class="text-2xl font-black text-white uppercase italic">Manga</h2>
            <p class="text-slate-400 text-sm">Gestiona tu lectura y capítulos pendientes.</p>
          </div>
        </div>
        <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-colors"></div>
      </button>

      <button
          @click="selectApp('games')"
          class="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 p-8 text-left transition-all hover:border-purple-500/50 hover:bg-purple-500/5 active:scale-95"
      >
        <div class="relative z-10 space-y-4 text-center">
          <div class="flex items-center justify-center">
            <div class="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M16 12h2"/><path d="M17 11v2"/></svg>
            </div>
          </div>
          <div>
            <h2 class="text-2xl font-black text-white uppercase italic">Juegos</h2>
            <p class="text-slate-400 text-sm">Organiza tu backlog y lista de deseos.</p>
          </div>
        </div>
        <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-purple-500/10 blur-3xl group-hover:bg-purple-500/20 transition-colors"></div>
      </button>

    </div>

  </div>
</template>

<style scoped>
div {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>