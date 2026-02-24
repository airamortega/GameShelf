<template>
  <div class="min-h-screen bg-slate-950 text-slate-200 pb-32" v-if="mangaInfo">

    <div class="relative h-64 w-full overflow-hidden">
      <img :src="coverUrl" class="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30 scale-110" />
      <div class="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950"></div>

      <div class="relative max-w-lg mx-auto px-6 pt-10 flex flex-col h-full">
        <NuxtLink to="/manga/inicio" class="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-white active:scale-90 transition-all mb-6">
          <ChevronLeft class="w-5 h-5" />
        </NuxtLink>

        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-3">
            <h1 class="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">
              {{ mangaInfo.title }}
            </h1>
          </div>

          <div class="flex items-center gap-2">
            <span :class="statusClasses">
              {{ stats.status || 'Cargando...' }}
            </span>
            <span v-if="stats.status === 'ongoing'" class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-lg mx-auto px-6 -mt-12 relative z-10">

      <div class="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl mb-6">
        <div class="flex gap-6">
          <div class="w-32 shrink-0">
            <img :src="coverUrl" class="rounded-xl shadow-2xl border border-white/5 object-cover aspect-[2/3]" />
          </div>

          <div class="flex flex-col justify-center flex-1 space-y-4">
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-2">Tu progreso</p>
              <div class="flex items-center gap-2">
                <input
                    v-model="newRead"
                    type="number"
                    class="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-xl font-mono focus:outline-none focus:border-orange-500/50 transition-all"
                    placeholder="0"
                />
                <button @click="saveProgress" class="h-12 w-12 shrink-0 bg-orange-600 hover:bg-orange-500 text-white rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-orange-600/20">
                  <BookOpenText class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="hasUpdates"
             class="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-3">
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <p class="text-[11px] font-bold text-blue-400 uppercase tracking-tight">
            {{ parseFloat(stats.spanish) - parseFloat(stats.user) }} capítulos nuevos disponibles
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Japón" :value="stats.japan" color="gray" />
        <StatCard label="Inglés" :value="stats.english" color="blue" />
        <StatCard label="Español" :value="stats.spanish" color="red" />
        <StatCard label="Leído" :value="stats.user" color="orange" highlight />
      </div>

      <button
          @click="handleArchive"
          :class="[
            'w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border flex items-center justify-center gap-2',
            isDropped
              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10'
              : 'bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500/10'
          ]"
      >
        <component :is="isDropped ? 'Play' : 'ArchiveX'" class="w-4 h-4" />
        {{ isDropped ? 'Retomar Lectura' : 'Abandonar Manga' }}
      </button>

    </div>
  </div>
</template>

<script setup>
import { ChevronLeft, BookOpenText } from "lucide-vue-next";
import StatCard from "~/components/statCard.vue";

const { showToast } = useToast();

const route = useRoute();

const { getLatestChapter, updateProgress, toggleArchiveStatus } = useMangaTracker();
const client = useSupabaseClient();

const lastRead = ref('0');
const newRead = ref('');
const coverUrl = ref('');

const isDropped = ref(false);

const mangaInfo = ref({});
const stats = reactive({
  japan: '?',
  english: '0',
  spanish: '0',
  user: '0',
  status: ''
});

const statusClasses = computed(() => {
  const base = 'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border backdrop-blur-md';
  const styles = {
    ongoing: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    hiatus: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20'
  };
  return `${base} ${styles[stats.status] || 'bg-white/5 text-white/50 border-white/10'}`;
});

const hasUpdates = computed(() => parseFloat(stats.spanish) > parseFloat(stats.user));

onMounted(async () => {
  const mangaId = route.params.id;
  const tracker = useMangaTracker();

  // Obtenemos el título primero de MangaDex para buscar en Jikan
  const response  = await $fetch(`https://api.mangadex.org/manga/${mangaId}?includes[]=cover_art`);

  const mangaData = response.data;
  if (!mangaData ) {
    throw new Error("No se encontró el manga en MangaDex");
  }

  stats.status = mangaData.attributes.status;
  mangaInfo.value = { id: mangaData.id, title: mangaData.attributes.title.en };

  const coverRel = mangaData.relationships.find(r => r.type === 'cover_art');
  const coverFile = coverRel?.attributes?.fileName;

  coverUrl.value = (coverFile) ? `https://uploads.mangadex.org/covers/${mangaId}/${coverFile}`: 'https://via.placeholder.com/256x400?text=No+Cover';

  const [capJa, capEn, capEs, dbData] = await Promise.all([
    tracker.getLatestChapter(mangaId, 'ja'),
    tracker.getLatestChapter(mangaId, 'en'),
    tracker.getLatestChapter(mangaId, 'es'),
    client.from('user_manga_progress').select('last_read_chapter, reading_status').eq('manga_id', mangaId).maybeSingle()
  ]);

  stats.japan = capJa;
  stats.english = capEn;
  stats.spanish = capEs;
  stats.user = dbData.data?.last_read_chapter || '0';
  isDropped.value = dbData.data?.reading_status === 'dropped';
});

const saveProgress = async () => {
  try {
    await updateProgress({
      id: mangaInfo.value.id,
      title: mangaInfo.value.title,
      chapter: newRead.value,
      cover: coverUrl.value
    });
    lastRead.value = newRead.value;
    stats.user = newRead.value;
    showToast('¡Progreso guardado!');
  } catch (error) {
    showToast('¡Error al guardar!', 'error')
  }
};

const handleArchive = async () => {
  try {
    const newStatus = await toggleArchiveStatus(mangaInfo.value.id, isDropped.value ? 'dropped' : 'reading');
    isDropped.value = newStatus === 'dropped';
    showToast(isDropped.value ? 'Manga abandonado' : 'Manga retomado');
  } catch (e) {
    showToast('Error al cambiar estado', 'error');
  }
};

</script>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>