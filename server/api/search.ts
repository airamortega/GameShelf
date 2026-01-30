export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const config = useRuntimeConfig()

    const searchTerm = body?.query || "";

    if (!searchTerm) return [];

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
          search "${searchTerm}";
          fields name, summary, cover.url, genres.name, 
                 involved_companies.company.name, platforms.name, 
                 first_release_date, total_rating;
          where version_parent = null; 
          limit 20;
        `,
    });

    return games
})