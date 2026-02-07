export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const config = useRuntimeConfig()

    const searchTerm = body?.query || "";

    const isId = !isNaN(searchTerm) && !isNaN(parseFloat(searchTerm));

    if (!isId) return null;

    // 1. Obtener Token de Twitch
    const auth: any = await $fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        params: {
            client_id: process.env.IGDB_CLIENT_ID,
            client_secret: process.env.IGDB_CLIENT_SECRET,
            grant_type: 'client_credentials'
        }
    })

    // 2. Consultar IGDB
    const games: any[] = await $fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
            'Client-ID': process.env.IGDB_CLIENT_ID,
            'Authorization': `Bearer ${auth.access_token}`
        },
        body: `
          fields name, summary, cover.url, genres.name, 
              involved_companies.company.name, 
              involved_companies.developer, 
              platforms.name, 
              first_release_date, 
              total_rating;
          where id = ${searchTerm};
          limit 1; 
        `,
    });

    return games.length > 0 ? games[0] : null;
})