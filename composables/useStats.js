export const useStats = () => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()

    const getStats = async () => {
        if (!user.value?.sub) {
            console.warn("Stats: No user found");
            return { totalGames: 0, byStatus: {}, byPlatform: {}, byGenre: [] }
        }

        // 1. Total de juegos y distribución por estado (Terminado, Jugando, etc)
        const { data: statusData } = await supabase
            .from('user_library')
            .select('status')
            .eq('user_id', user.value.sub)

        // 2. Juegos por plataforma
        const { data: platformData } = await supabase
            .from('user_library')
            .select('platforms')
            .eq('user_id', user.value.sub)

        // 3. Géneros más jugados (requiere join con games y game_genres)
        const { data: genreData } = await supabase
            .from('user_library')
            .select(`
                games (
                  game_genres (
                    genres (name)
                  )
                )
            `)
            .eq('user_id', user.value.sub)

        // 4. Obtener juegos con nota (rating) para el Top 5 y media
        const { data: ratingData, error: ratingError } = await supabase
            .from('game_votes')
            .select(`
                rating,
                games (
                  name,
                  cover
                )
              `)
            .eq('user_id', user.value.sub)
            .not('rating', 'is', null)

        if (ratingError) {
            console.error("Error obteniendo ratings:", ratingError)
        }

        return {
            totalGames: statusData?.length || 0,
            byStatus: processStatus(statusData),
            byPlatform: processPlatforms(platformData),
            byGenre: processGenres(genreData),
            averageRating: calculateAverage(ratingData),
            topGames: processTopGames(ratingData),
        }
    }

    // Funciones auxiliares para agrupar datos
    const processStatus = (data) => {
        return data.reduce((acc, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1
            return acc;
        }, {})
    }

    const processPlatforms = (data) => {
        if (!data) return {};

        return data.reduce((acc, curr) => {
            const gamePlatforms = curr.platforms || [];

            gamePlatforms.forEach(platform => {
                acc[platform] = (acc[platform] || 0) + 1;
            });

            return acc;
        }, {});
    };

    const processGenres = (data) => {
        const counts = {}
        data?.forEach(item => {
            item.games?.game_genres?.forEach(gg => {
                const name = gg.genres?.name
                counts[name] = (counts[name] || 0) + 1
            })
        })
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5) // Top 5 géneros
    }

    const calculateAverage = (data) => {
        if (!data || data.length === 0) return 0
        const sum = data.reduce((acc, curr) => acc + (curr.rating || 0), 0)
        return (sum / data.length).toFixed(1)
    }

    const processTopGames = (data) => {
        return (data || [])
            .filter(item => item.rating !== null)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5)
    }

    return { getStats }
}