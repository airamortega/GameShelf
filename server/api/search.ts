export default defineEventHandler(async (event) => {
    const { q } = getQuery(event)
    const config = useRuntimeConfig()

    // 1. Obtener Token de Twitch
    const auth: any = await $fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        params: {
            client_id: process.env.IGDB_CLIENT_ID,
            client_secret: process.env.IGDB_CLIENT_SECRET,
            grant_type: 'client_credentials'
        }
    })

    // 2. Consultar IGDB (Nombre, Portada e ID)
    // Usamos el lenguaje de consulta de IGDB (Apicalypse)
    const games = await $fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
            'Client-ID': process.env.IGDB_CLIENT_ID,
            'Authorization': `Bearer ${auth.access_token}`
        },
        body: `
      search "${q}";
      fields name, cover.url, first_release_date;
      limit 12;
    `
    })

    return games
})