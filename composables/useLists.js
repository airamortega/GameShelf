export const useLists = () => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()

    // Obtener todas mis listas con conteo de juegos
    const fetchMyLists = async () => {
        if (!user.value?.sub) {
            console.warn("Intento de fetch sin usuario autenticado");
            return { data: [], error: null };
        }

        const { data, error } = await supabase
            .from('lists')
            .select(`
        *,
        list_games (
          games (
            cover
          )
        )
      `)
            .eq('user_id', user.value.sub)
            .order('created_at', { ascending: false })

        if (error) {
            console.error("Error en Supabase:", error)
            return { data: [], error }
        }

        const formattedData = (data || []).map(list => {
            const rawCovers = list.list_games
                ?.map(lg => lg.games?.cover)
                .filter(Boolean) || []

            return {
                ...list,
                game_count: list.list_games?.length || 0,
                covers: rawCovers.map(cover => cover.replace('t_thumb', 't_cover_big'))
            }
        })

        return { data: formattedData.sort((a, b) => a.sort_order - b.sort_order), error: null }
    }

    // Crear nueva lista
    const createList = async (name, isPublic = false) => {
        return await supabase.from('lists').insert({
            name,
            is_public: isPublic,
            user_id: user.value.sub
        }).select().single()
    }

    // Añadir juego a lista
    const addGameToList = async (listId, gameId) => {
        return await supabase.from('list_games').insert({
            list_id: listId,
            game_id: gameId
        })
    }

    // Eliminar juego de lista
    const removeGameFromList = async (listId, gameId) => {
        return await supabase.from('list_games')
            .delete()
            .eq('list_id', listId)
            .eq('game_id', gameId)
    }

    return { fetchMyLists, createList, addGameToList, removeGameFromList }
}