export default defineEventHandler(async (event) => {
    const { gameId } = await readBody(event);

    // 1. Obtener Token de Twitch
    const auth: any = await $fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        params: {
            client_id: process.env.IGDB_CLIENT_ID,
            client_secret: process.env.IGDB_CLIENT_SECRET,
            grant_type: 'client_credentials'
        }
    })

    try {
        const times: any[] = await $fetch('https://api.igdb.com/v4/game_time_to_beats', {
            method: 'POST',
            headers: {
                'Client-ID': process.env.IGDB_CLIENT_ID,
                'Authorization': `Bearer ${auth.access_token}`
            },
            body: `fields *; where game = ${gameId};`
        });

        // IMPORTANTE: Si no hay datos, devolvemos un objeto con campos null
        // para que el frontend no rompa al intentar leer propiedades.
        if (!times || times.length === 0) {
            return { normally: null, hastly: null, completely: null };
        }

        return times[0]; // Retornamos el primer objeto del array
    } catch (error) {
        console.error("Error en IGDB:", error);
        return { normally: null, hastly: null, completely: null };
    }
});