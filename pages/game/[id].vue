<template>

  <div v-if="loading" class="flex items-center justify-center min-h-screen">
    <AppSpinner />
  </div>

  <div v-if="game" class="max-w-lg mx-auto pb-24 min-h-screen">
    <div class="relative h-[35vh] w-full overflow-hidden">
      <img
          :src="game_cover_1080"
          class="w-full h-full object-cover opacity-30 blur-xl scale-110"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

      <button @click="$router.back()" class="absolute top-6 left-6 z-20 w-10 h-10 flex items-center justify-center bg-black/20 backdrop-blur-md rounded-xl border border-white/10">
        <ChevronLeft class="w-6 h-6" />
      </button>

      <button
          v-if="game"
          @click="showAddToListModal = true"
          class="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center bg-black/20 backdrop-blur-md rounded-xl border border-white/10"
      >
        <PlusCircle :size="20" />
      </button>

      <div class="absolute bottom-0 left-0 w-full p-6 flex items-end gap-6 translate-y-6">
        <div class="w-32 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 relative">
          <img :src="game_cover_big" class="w-32 rounded-2xl shadow-2xl" />
          <gameRating :rating="game.total_rating" />
        </div>

        <div class="pb-12">
          <h1 class="text-3xl font-black uppercase italic tracking-tighter leading-none mb-2">
            {{ game.name }}
          </h1>
          <div class="flex flex-wrap gap-2">
            <span v-for="g in game.game_genres" :key="g.genres.id" class="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-white/10 rounded-md border border-white/5">
              {{ g.genres.name }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="px-6 mt-16 mb-16 space-y-8">

      <section>
        <h4 class="text-s font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Tu Biblioteca</h4>
        <gameUserRating :gameId="game.id" />
      </section>

      <section>
        <GameUserStatus
            v-model="userStatus"
            v-model:userPlatforms="userPlatforms"
            v-model:isAlreadyInLibrary="isAlreadyInLibrary"
            :game="game"
            :isAlreadyInBD="isAlreadyInBD"
        />
      </section>

      <section v-if="game.summary">
        <h2 class="text-s font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Sinopsis</h2>
        <p class="text-sm text-gray-400 leading-relaxed font-medium">
          {{ game.summary }}
        </p>
      </section>

      <section>
        <div class="grid grid-cols-2 gap-6 mt-6 p-4 bg-white/5 rounded-xl border border-white/10">

          <div>
            <p class="text-xs uppercase tracking-widest text-gray-500 font-bold">Lanzamiento</p>
            <p class="text-white font-medium">{{ releaseDate }}</p>
          </div>

          <div>
            <p class="text-xs uppercase tracking-widest text-gray-500 font-bold">Desarrollador</p>
            <p class="text-emerald-400 font-medium">{{ developers }}</p>
          </div>

          <div v-if="game.platforms" class="col-span-2">
            <p class="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Plataformas</p>
            <div class="flex flex-wrap gap-2">
              <span
                  v-for="platform in game.platforms"
                  :key="platform.id"
                  class="px-2 py-1 bg-white/10 rounded text-xs text-gray-300 border border-white/5"
              >
                {{ platform.name }}
              </span>
            </div>
          </div>

        </div>
      </section>

      <section>
        <gameComments :gameId="game.id" />
      </section>

    </div>

    <AddToListModal
        v-model="showAddToListModal"
        :game-id="game.id"
        :game-name="game.name"
    />

  </div>
</template>

<script setup>
import {ChevronLeft, FolderPlus, PlusCircle} from 'lucide-vue-next'
import AddToListModal from "~/components/addToListModal.vue";

const route = useRoute()

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const game = ref(null)
let game_cover_big = ref(null)
let game_cover_1080 = ref(null)

const userStatus = ref([])
const userPlatforms = ref([])
const loading = ref(false)

const isAlreadyInBD = ref(false)
const isAlreadyInLibrary = ref(false)

const showAddToListModal = ref(false)

let timeout = null

const developers = computed(() => {
  if (game.value.game_companies && game.value.game_companies.length > 0) {
    return game.value.game_companies
        .filter(c => c.is_developer)
        .map(c => c.companies?.name)
        .filter(name => name)
        .join(', ') || 'Desconocido';
  }

  return game.value.involved_companies
      ?.filter(c => c.developer)
      .map(c => c.company.name)
      .join(', ') || 'Desconocido';
});

const releaseDate = computed(() => {
  if (game.value.release_date) {
    return new Date(game.value.release_date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } else if (game.value.first_release_date){
    return new Date(game.value.first_release_date * 1000).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }else {
    return 'TBA';
  }
});

const fetchGameDetails = async () => {
  loading.value = true

  const { data, error } = await supabase
      .from('games')
      .select(`
      *,
      game_genres ( genres ( name ) ),
      game_companies (
        is_developer,
        companies ( name )
      )
    `)
      .eq('id', route.params.id)
      .maybeSingle()

  if (data) {
    game.value = data

    // Obtener estado del usuario
    const { data: libData } = await supabase
        .from('user_library')
        .select('status, platforms')
        .eq('game_id', route.params.id)
        .eq('user_id', user.value.sub)
        .maybeSingle()

    if (libData) {
      userStatus.value = libData.status || []
      userPlatforms.value = libData.platforms || []
      isAlreadyInLibrary.value = true
    }

    isAlreadyInBD.value = true

    game_cover_big.value = getCoverUrl(game.value.cover)
    game_cover_1080.value = getCoverUrl(game.value.cover, 't_1080p')

    loading.value = false

  }else{
    timeout = setTimeout(async () => {
      try {
        const data = await $fetch('/api/searchById', {
          method: 'POST',
          body: { query: route.params.id }
        })
        game.value = data

        game_cover_big.value = getCoverUrl(game.value.cover.url);
        game_cover_1080.value = getCoverUrl(game.value.cover.url, 't_1080p');

        loading.value = false

      } catch (e) {
        console.error("Error buscando en IGDB:", e)
      }
    }, 600)
  }


}

const getCoverUrl = (url, size = 't_cover_big') => {
  if (!url) return '/images/default_cover.png'
  return url.replace('t_thumb', `${size}`)
}

onMounted(() => fetchGameDetails())
</script>