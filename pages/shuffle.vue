<template>
  <div class="min-h-screen flex flex-col justify-center items-center p-6">
    <div class="w-full max-w-lg mx-auto">
      <div class="flex flex-col items-center gap-6 bg-slate-900/50 rounded-[32px] border border-white/5 shadow-2xl py-6">

        <div v-if="!isShuffling && !selectedGame" class="text-center space-y-2 ">
          <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
            <Dices class="w-10 h-10 text-emerald-500" />
          </div>
          <h3 class="text-2xl font-black italic uppercase tracking-tighter">¿A qué jugamos hoy?</h3>
          <p class="text-gray-400 text-sm">Deja que el destino elija por ti entre tus pendientes</p>
        </div>

        <div v-if="isShuffling" class="relative w-48 aspect-[3/4] mb-4">
          <Transition name="slide-up" mode="out-in">
            <div :key="displayGame?.games.id" class="w-full h-full">
              <img
                  :src="getCoverUrl(displayGame?.games.cover)"
                  class="w-full h-full object-cover rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] border-2 border-emerald-500/50"
              />
            </div>
          </Transition>
        </div>

        <button
            @click="shuffle"
            :disabled="isShuffling"
            class="group relative overflow-hidden px-8 py-4 bg-emerald-500 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
        >
          <div class="relative z-10 flex items-center gap-3 text-slate-950 font-black uppercase tracking-widest text-sm">
            <Dices v-if="!isShuffling" class="w-5 h-5 animate-bounce" />
            <Loader2 v-else class="w-5 h-5 animate-spin" />
            {{ isShuffling ? 'Eligiendo...' : 'Shuffle' }}
          </div>
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
        </button>

        <Teleport to="body">
          <Transition name="scale">
            <div v-if="selectedGame" class="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-950/90">
              <div class="relative max-w-sm w-full bg-slate-900 rounded-[40px] border border-white/10 overflow-hidden shadow-2xl">
                <img :src="getCoverUrl(selectedGame.games.cover, 't_1080p')" class="absolute inset-0 w-full h-full object-cover opacity-20 blur-2xl" />

                <div class="relative p-8 flex flex-col items-center text-center">
                  <div class="w-40 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl mb-6 border-2 border-emerald-500/50">
                    <img :src="getCoverUrl(selectedGame.games.cover)" class="w-full h-full object-cover" />
                  </div>

                  <h4 class="text-xs font-black text-emerald-400 uppercase tracking-[0.3em] mb-2">Tu próximo reto es:</h4>
                  <h2 class="text-3xl font-black text-white uppercase italic leading-none mb-8">{{ selectedGame.games.name }}</h2>

                  <div class="flex flex-col gap-3 w-full">
                    <NuxtLink
                        :to="`/game/${selectedGame.games.id}`"
                        class="w-full py-4 bg-white text-slate-950 font-black uppercase tracking-widest text-xs rounded-2xl text-center"
                    >
                      Ver detalles
                    </NuxtLink>
                    <button
                        @click="selectedGame = null"
                        class="w-full py-4 bg-white/5 text-gray-400 font-bold uppercase tracking-widest text-xs rounded-2xl"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </Teleport>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Dices, Loader2 } from 'lucide-vue-next'
import confetti from 'canvas-confetti'
const { showToast } = useToast()

const user = useSupabaseUser()
const supabase = useSupabaseClient()

const isShuffling = ref(false)
const selectedGame = ref(null)
const displayGame = ref(null)

const status = GameStatus.PENDIENTE

const games = ref([])
const loading = ref(true)

const shuffle = () => {
  if (games.value.length === 0) {
    showToast('No tienes juegos pendientes', 'error')
    return
  }

  isShuffling.value = true
  selectedGame.value = null

  const pending = games.value.filter(g => g.status.includes(GameStatus.PENDIENTE))

  let iterations = 0
  const maxIterations = 20

  const interval = setInterval(() => {
    displayGame.value = pending[Math.floor(Math.random() * pending.length)]
    iterations++

    if (iterations >= maxIterations) {
      clearInterval(interval)
      selectedGame.value = pending[Math.floor(Math.random() * pending.length)]
      isShuffling.value = false
      displayGame.value = null

      launchConfetti()
    }
  }, 50)
}

const launchConfetti = () => {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 300 };

  const randomInRange = (min, max) => Math.random() * (max - min) + min;

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.5, 0.7), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.2, 0.2), y: Math.random() - 0.2 } });
  }, 250);
}

const getCoverUrl = (url, size = 't_cover_big') => {
  if (!url) return '/images/default_cover.png'
  return url.replace('t_thumb', size)
}

const fetchGamesByStatus = async () => {
  if (!user.value) return

  loading.value = true
  try {
    const { data, error } = await supabase
        .from('user_library')
        .select(`
          status,
          games (id, name, cover, total_rating)
        `)
        .eq('user_id', user.value.sub)
        .contains('status', [status])

    if (error) throw error

    games.value = data || []

  } catch (err) {
    console.error("Error cargando lista:", err)
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchGamesByStatus())
</script>

<style scoped>
/* Animación de las portadas durante el shuffle */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.1s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(1.1);
}

/* Animación del modal de resultado */
.modal-scale-enter-active, .modal-scale-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-scale-enter-from, .modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

@keyframes shimmer {
  100% { transform: translateX(100%); }
}
.animate-shimmer {
  animation: shimmer 1.5s infinite;
}
</style>