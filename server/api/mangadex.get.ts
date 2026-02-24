export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const mangaId = query.id
    const lang = query.lang || 'es'

    // Construimos la URL de MangaDex que fallaba
    const url = `https://api.mangadex.org/manga/${mangaId}/feed?limit=1&translatedLanguage[]=${lang}&order[chapter]=desc&includeFutureUpdates=0`

    try {
        return await $fetch(url)
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error fetching from MangaDex Proxy',
        })
    }
})