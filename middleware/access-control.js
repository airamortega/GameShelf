export default defineNuxtRouteMiddleware((to) => {
    const user = useSupabaseUser();
    const userPerms = user.value?.user_metadata; // Supabase guarda info aquí

    if (to.path.startsWith('/games') && !userPerms?.has_games_access) {
        return navigateTo('/mangaSearch'); // Redirigir si no tiene permiso
    }
});