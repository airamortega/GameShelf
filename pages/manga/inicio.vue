<template>
  <div class="p-6 max-w-lg mx-auto pb-32 min-h-screen">
    <header class="mb-8">
      <h1 class="text-4xl font-black text-white uppercase italic tracking-tighter">Mi Biblioteca</h1>
      <p class="text-slate-400 text-sm font-medium">Seguimiento de tus lecturas</p>
    </header>

    <div class="flex gap-4 mb-8 bg-white/5 p-1.5 rounded-2xl border border-white/10">
      <button
          @click="filter = 'reading'; reloadLibrary()"
          :class="['flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all duration-300', filter === 'reading' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300']"
      >
        Leyendo
      </button>
      <button
          @click="filter = 'dropped'; reloadLibrary()"
          :class="['flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all duration-300', filter === 'dropped' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-500 hover:text-slate-300']"
      >
        Abandonados
      </button>
    </div>

    <div v-if="pending" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500 border-r-transparent"></div>
    </div>

    <div v-else-if="library.length === 0" class="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
      <p class="text-slate-400 font-medium">No hay mangas en esta sección.</p>
      <NuxtLink v-if="filter === 'reading'" to="/search" class="mt-4 inline-block text-blue-500 font-bold uppercase text-xs tracking-widest">Buscar algo nuevo</NuxtLink>
    </div>

    <div v-else>
      <div class="grid grid-cols-2 gap-6">
        <div v-for="manga in library" :key="manga.manga_id" class="group relative">
          <NuxtLink :to="`/manga/${manga.manga_id}`">
            <div class="aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-xl transition-all group-hover:border-blue-500/50 group-hover:-translate-y-2">
              <img :src="manga.manga_cover" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" :class="filter === 'dropped' ? 'grayscale opacity-60' : ''" />

              <div v-if="manga.hasUpdate && filter === 'reading'" class="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg animate-bounce">
                NUEVO
              </div>
            </div>

            <div class="mt-3 space-y-1">
              <h3 class="text-sm font-bold text-white truncate uppercase tracking-tight">{{ manga.manga_title }}</h3>
              <div class="flex items-center justify-between text-[11px] font-black text-slate-500 uppercase tracking-tighter">
                <span>Cap. {{ manga.last_read_chapter }}</span>
                <span v-if="manga.latestCap">Total: {{ manga.latestCap }}</span>
              </div>

              <div class="h-1.5 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
                <div
                    class="h-full transition-all duration-1000"
                    :class="getBarColor(manga)"
                    :style="{ width: calculateProgress(manga) + '%' }"
                ></div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <div v-if="hasMore" class="mt-12 flex justify-center">
        <button @click="loadLibraryPage(false)" :disabled="loadingMore" class="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/10 disabled:opacity-50">
          {{ loadingMore ? 'Cargando...' : 'Cargar más' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const { getUserLibrary, getLatestChapter } = useMangaTracker();

// Estados
const library = ref([]);
const totalCount = ref(0);
const filter = ref('reading'); // 'reading' o 'dropped'
const pending = ref(true);
const loadingMore = ref(false);
const itemsPerPage = 10;

// Lógica de carga
const loadLibraryPage = async (isInitial = false) => {
  if (isInitial) {
    pending.value = true;
    library.value = []; // Limpiamos al cambiar de filtro
  } else {
    loadingMore.value = true;
  }

  try {
    const from = library.value.length;
    const to = from + itemsPerPage - 1;

    // Pasamos el filtro al composable
    const { data, count } = await getUserLibrary(from, to, filter.value);
    totalCount.value = count;

    const enrichedData = await Promise.all(data.map(async (manga) => {
      const latest = await getLatestChapter(manga.manga_id, 'es');
      return {
        ...manga,
        latestCap: latest,
        hasUpdate: parseFloat(latest) > parseFloat(manga.last_read_chapter),
        // Nota: Asegúrate de que 'status' venga de tu tabla o de MangaDex
      };
    }));

    library.value.push(...enrichedData);
  } catch (e) {
    console.error("Error cargando biblioteca:", e);
  } finally {
    pending.value = false;
    loadingMore.value = false;
  }
};

// Función para recargar (el reloadLibrary que te faltaba)
const reloadLibrary = () => {
  loadLibraryPage(true);
};

// Helpers visuales
const calculateProgress = (manga) => {
  if (!manga.latestCap || manga.latestCap === '0') return 0;
  const progress = (parseFloat(manga.last_read_chapter) / parseFloat(manga.latestCap)) * 100;
  return Math.min(progress, 100);
};

const getBarColor = (manga) => {
  const isFinishedReading = parseFloat(manga.last_read_chapter) >= parseFloat(manga.latestCap);

  // Si está abandonado, usamos un color neutro (gris)
  if (filter.value === 'dropped') return 'bg-slate-600';

  if (manga.status === 'completed' && isFinishedReading) {
    return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
  } else if (manga.hasUpdate) {
    return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]';
  }
  return 'bg-blue-500';
};

const hasMore = computed(() => library.value.length < totalCount.value);

onMounted(() => loadLibraryPage(true));
</script>