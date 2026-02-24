<template>
  <div class="p-6 max-w-lg mx-auto pb-24 min-h-screen">
    <header class="mb-8">
      <h1 class="text-4xl font-black text-white uppercase italic tracking-tighter">Buscador</h1>
      <p class="text-slate-400 text-sm font-medium">Encuentra cualquier manga</p>
    </header>

    <div class="flex gap-2 mb-8">
      <input
          v-model="query"
          @keyup.enter="handleSearch"
          type="text"
          placeholder="Busca un manga ... "
          class="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 outline-none"
      />
      <button @click="handleSearch" class="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-bold transition">
        Buscar
      </button>
    </div>

    <div v-if="results" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <NuxtLink
          v-for="manga in results.data"
          :key="manga.id"
          :to="`/manga/${manga.id}`"
          class="flex bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-orange-500 transition group"
      >
        <div class="w-24 bg-gray-800 flex-shrink-0">
          <img :src="getCoverUrl(manga)" class="h-full w-full object-cover" alt="Portada" />
        </div>
        <div class="p-4 break-words overflow-ellipsis">
          <h2 class="text-xl font-bold group-hover:text-orange-400">{{ manga.attributes.title.en || manga.attributes.title.ja }}</h2>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>

const query = ref('');
const results = ref(null);
const { searchManga } = useMangaTracker();

const handleSearch = async () => {
  if (!query.value) return;
  results.value = await searchManga(query.value);
};

// Función auxiliar para construir la URL de la portada de MangaDex
const getCoverUrl = (manga) => {
  const coverFileName = manga.relationships.find(r => r.type === 'cover_art')?.attributes?.fileName;
  return coverFileName
      ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}.256.jpg`
      : 'https://via.placeholder.com/256x400?text=No+Cover';
};
</script>