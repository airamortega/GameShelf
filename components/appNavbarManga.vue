<script setup lang="ts">

</script>

<template>
  <nav class="fixed -bottom-1 left-0 right-0 z-50">
    <div class="bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 pb-safe">
      <div class="max-w-lg mx-auto flex justify-around items-center h-20 relative px-2">

        <NuxtLink to="/manga/inicio" exact class="nav-link group" active-class="text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 transition-transform group-active:scale-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span class="nav-label">Inicio</span>
        </NuxtLink>

        <div class="relative flex justify-center w-16 -translate-y-5">
          <NuxtLink
              to="/manga/search"
              class="w-14 h-14 bg-white text-slate-950 rounded-full flex items-center justify-center shadow-2xl shadow-white/10 border-4 border-slate-950 transition-all hover:scale-110 active:scale-90 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 transition-transform duration-300 group-hover:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </NuxtLink>
        </div>


        <NuxtLink to="/profile" class="nav-link group" active-class="text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 transition-transform group-active:scale-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span class="nav-label">Perfil</span>
        </NuxtLink>

      </div>
    </div>
  </nav>
</template>

<style scoped>
.nav-link {
  @apply flex flex-col items-center justify-center flex-1 text-slate-400;
}

.nav-label {
  @apply text-[9px] font-black uppercase tracking-[0.1em] mt-1.5 transition-colors;
}

.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

.router-link-exact-active.nav-link.group {
  @apply bg-white/5 rounded-3xl border-white/10 pt-2 pb-2;
}
</style>