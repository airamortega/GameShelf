// composables/useMangaTracker.js
export const useMangaTracker = () => {
    const client = useSupabaseClient();
    const user = useSupabaseUser();

    // Buscar mangas (Cambiado a $fetch)
    const searchManga = async (query) => {
        // Usamos $fetch para peticiones que ocurren después de que el componente cargue
        const data = await $fetch(`https://api.mangadex.org/manga`, {
            params: {
                title: query,
                limit: 50,
                'includes[]': ['cover_art']
            }
        });
        return data;
    };

    // Obtener último capítulo (Arreglado el parámetro de idioma)
    const getLatestChapter = async (mangaId, lang = 'es') => {
        try {
            const response = await $fetch('/api/mangadex', {
                params: {
                    id: mangaId,
                    lang: lang
                }
            });

            if (response.data && response.data.length > 0) {
                return response.data[0].attributes.chapter;
            }
            return '0';
        } catch (error) {
            console.error("Proxy error:", error);
            return '0';
        }
    };

    const getUserLibrary = async (from = 0, to = 9, status = 'reading') => {
        const client = useSupabaseClient();
        const user = useSupabaseUser();

        // 1. Verificación de seguridad
        if (!user.value) return { data: [], count: 0 };

        // 2. Consulta a Supabase
        const { data, error, count } = await client
            .from('user_manga_progress')
            .select('*', { count: 'exact' })
            .eq('user_id', user.value.sub)
            .eq('reading_status', status)
            .order('updated_at', { ascending: false })
            .range(from, to);

        if (error) {
            console.error("Error fetching library:", error.message);
            throw error;
        }

        return { data, count };
    };

    const updateProgress = async (manga) => {
        const client = useSupabaseClient();
        const user = useSupabaseUser();

        if (!user.value) throw new Error("Inicia sesión para guardar");

        const { error } = await client
            .from('user_manga_progress')
            .upsert({
                user_id: user.value.sub,
                manga_id: manga.id,
                manga_title: manga.title,
                manga_cover: manga.cover,
                last_read_chapter: manga.chapter,
                updated_at: new Date()
            }, {
                onConflict: 'user_id,manga_id'
            });

        if (error) throw error;
    };

    const toggleArchiveStatus = async (mangaId, currentStatus) => {
        const client = useSupabaseClient();
        const newStatus = currentStatus === 'dropped' ? 'reading' : 'dropped';

        const { error } = await client
            .from('user_manga_progress')
            .update({ reading_status: newStatus })
            .eq('manga_id', mangaId);

        if (error) throw error;
        return newStatus;
    };

    return { searchManga, getLatestChapter, updateProgress, getUserLibrary, toggleArchiveStatus };
};