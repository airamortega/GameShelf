<template>
  <div class="p-6 max-w-lg mx-auto pb-24 min-h-screen">
    <header class="flex items-center mb-10 mt-4">
      <div>
        <h1 class="text-4xl font-black tracking-tight text-white italic uppercase">Biblioteca</h1>
        <p class="text-gray-500 mt-1 font-medium">Gestiona tu colección de juegos</p>
      </div>
      <NuxtLink to="/game/shuffle" class="ml-auto w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white active:scale-90 transition-all">
        <Dices class="w-6 h-6" />
      </NuxtLink>
    </header>

    <div v-if="isLoading">
      <AppSpinner />
    </div>

    <div v-else >
      <div class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden divide-y divide-white/5 shadow-2xl mb-5">
        <NuxtLink
            :to="'/game/library'"
            class="flex items-center p-5 transition-all duration-200 hover:bg-white/[0.07] active:scale-[0.98] group"
        >
          <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner transition-transform group-hover:scale-110"
              :style="{ backgroundColor: '#94a3b8' + '22', color: '#94a3b8' }"
          >
            <span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-library-icon lucide-library w-8 h-8"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg></span>
          </div>

          <div class="flex-1 ml-4">
            <h3 class="text-white font-bold text-lg leading-tight uppercase">Todos</h3>
            <p class="text-gray-500 text-xs font-medium tracking-wider mt-0.5">Colección completa</p>
          </div>

          <div class="flex items-center gap-3">
          <span class="text-xl font-black text-gray-400">
            {{ counts['total'] || 0 }}
          </span>
            <span class="text-2xl text-white/20 group-hover:text-white/40 transition-colors font-light">
            ›
          </span>
          </div>
        </NuxtLink>
      </div>

      <div class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden divide-y divide-white/5 shadow-2xl">
        <NuxtLink
            v-for="(info, status) in GameStatusLabels"
            :key="status"
            :to="`/game/status/${status}`"
            class="flex items-center p-5 transition-all duration-200 hover:bg-white/[0.07] active:scale-[0.98] group"
        >
          <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner transition-transform group-hover:scale-110"
              :style="{ backgroundColor: info.color + '22', color: info.color }"
          >
            <span v-html="info.icon"></span>
          </div>

          <div class="flex-1 ml-4">
            <h3 class="text-white font-bold text-lg leading-tight uppercase">{{ info.label }}</h3>
            <p class="text-gray-500 text-xs font-medium tracking-wider mt-0.5">{{ info.subText }}</p>
          </div>

          <div class="flex items-center gap-3">
          <span class="text-xl font-black text-gray-400">
            {{ counts[status.toLowerCase()] || 0 }}
          </span>
            <span class="text-2xl text-white/20 group-hover:text-white/40 transition-colors font-light">
            ›
          </span>
          </div>
        </NuxtLink>
      </div>

    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import {Dices} from "lucide-vue-next";

  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  const counts = ref({
    total: 0,
    pendiente: 0,
    jugando: 0,
    terminado: 0,
    platino: 0,
    abandonado: 0,
    deseados: 0
  })
  const isLoading = ref(true)

  const fetchLibraryStats = async () => {
    if (!user.value) return

    try {
      // Traemos solo la columna status de todos los juegos del usuario
      const { data, error } = await supabase
          .from('user_library')
          .select('*')
          .eq('user_id', user.value.sub)

      if (error) throw error

      // Reiniciamos contadores
      const tempCounts = { total: data.length, deseados: 0, jugando: 0, terminado: 0, platino: 0, abandonado: 0, pendiente: 0 }

      // Procesamos cada juego
      data.forEach(item => {
        if (item.status && Array.isArray(item.status)) {
          item.status.forEach(s => {
            const key = s.toLowerCase()
            if (tempCounts.hasOwnProperty(key)) {
              tempCounts[key]++
            }
          })
        }
      })

      counts.value = { ...tempCounts }
    } catch (err) {
      console.error("Error obteniendo conteo de estados:", err)
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => fetchLibraryStats())

</script>

<style scoped>


</style>