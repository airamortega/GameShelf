<template>
  <div class="mt-12 space-y-8">
    <h3 class="text-s font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Comentarios</h3>

    <div v-if="user" class="bg-white/5 border border-white/10 rounded-xl p-4 shadow-inner flex gap-3">
      <textarea
          v-model="newComment"
          placeholder="¿Qué te pareció este juego?"
          class="w-full bg-transparent border-none focus:ring-0 text-gray-200 placeholder:text-gray-500 resize-none outline-none"
          rows="3"
      ></textarea>
      <button
          @click="postComment"
          :disabled="!newComment.trim()"
          class="bg-white disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95"
      >
        <Send :size="20" />
      </button>
    </div>

    <div class="space-y-4">
      <div v-for="comment in comments" :key="comment.id"
           class="bg-white/5 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">

        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xs">
              {{ comment.user_email?.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="text-sm font-bold text-gray-200">{{ comment.user_email?.split('@')[0] }}</p>
              <p class="text-[10px] text-gray-500 uppercase tracking-wider">{{ formatDate(comment.created_at) }}</p>
            </div>
          </div>

          <div v-if="user && user.sub === comment.user_id" class="flex gap-2">
            <button @click="startEdit(comment)" class="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-blue-400 transition-colors">
              <Pencil :size="16" />
            </button>
            <button @click="confirmDelete(comment)" class="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>

        <div v-if="editingId === comment.id" class="space-y-3">
          <textarea v-model="editText" class="w-full bg-black/40 border border-blue-500/50 rounded-lg p-3 text-white focus:ring-1 focus:ring-blue-500 outline-none"></textarea>
          <div class="flex gap-2 justify-end">
            <button @click="editingId = null" class="px-3 py-1 text-sm text-gray-400">Cancelar</button>
            <button @click="saveEdit(comment.id)" class="px-4 py-1 text-sm bg-blue-600 rounded-md font-bold">Guardar</button>
          </div>
        </div>
        <p v-else class="text-gray-300 leading-relaxed">{{ comment.content }}</p>

        <div class="mt-4 pt-4 border-t border-white/5">
          <button
              @click="toggleLike(comment)"
              class="flex items-center gap-2 group"
          >
            <Heart
                :size="18"
                :class="userLikes.includes(comment.id) ? 'text-pink-500 fill-current' : 'text-gray-500'"
                class="transition-transform group-active:scale-125"
            />
            <span :class="userLikes.includes(comment.id) ? 'text-pink-500' : 'text-gray-500'" class="text-xs font-bold">
              {{ comment.likes_count }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDeleteDialog" class="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-md" @click="showDeleteDialog = false"></div>

          <div class="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-[32px] p-8 shadow-2xl scale-in">
            <div class="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trash2 class="w-8 h-8 text-red-500" />
            </div>

            <h3 class="text-xl font-black text-white text-center uppercase tracking-tight mb-2">
              ¿Estás seguro?
            </h3>
            <p class="text-gray-400 text-center text-sm leading-relaxed mb-8">
              Esta acción eliminará tu comentario.
            </p>

            <div class="flex flex-col gap-3">
              <button
                  @click="deleteComment"
                  class="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl active:scale-95 transition-all"
              >
                Sí, eliminar ahora
              </button>
              <button
                  @click="showDeleteDialog = false"
                  class="w-full py-4 bg-white/5 text-gray-400 font-bold uppercase tracking-widest text-xs rounded-2xl active:scale-95 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { Heart, Trash2, Pencil, Send } from 'lucide-vue-next'
import { formatDistanceToNow } from 'date-fns'
const { showToast } = useToast()
import { es } from 'date-fns/locale'

const props = defineProps(['gameId']);

const supabase = useSupabaseClient();
const user = useSupabaseUser();

const showDeleteDialog = ref(false);
const commentToDelete = ref(null);
const comments = ref([]);
const newComment = ref('');
const editingId = ref(null);
const editText = ref('');

const confirmDelete = (comment) => {
  commentToDelete.value = comment.id;
  showDeleteDialog.value = true;
};

const deleteComment = async () => {
  if (!commentToDelete.value) return;

  const { error } = await supabase
      .from('game_comments')
      .delete()
      .eq('id', commentToDelete.value);

  if (error) {
    console.error("Error al borrar:", error.message);
    showToast('¡Error al eliminar!', 'error')
  } else {
    comments.value = comments.value.filter(c => c.id !== commentToDelete.value);
    showToast('¡Eliminado!')
  }

  showDeleteDialog.value = false;
  commentToDelete.value = null;
};

const formatDate = (dateString) => {
  return formatDistanceToNow(new Date(dateString), {
    addSuffix: true,
    locale: es
  })
}

// Cargar comentarios
const fetchComments = async () => {
  const { data } = await supabase
      .from('game_comments')
      .select('*')
      .eq('game_id', props.gameId)
      .order('created_at', { ascending: false });
  comments.value = data;
};

// Crear comentario
const postComment = async () => {
  if (!newComment.value.trim()) return;
  const { error } = await supabase.from('game_comments').insert({
    game_id: props.gameId,
    user_id: user.value.sub,
    content: newComment.value
  });

  if(error) {
    showToast('¡Error al comentar!', 'error')
  }else {
    newComment.value = '';
    fetchComments();
    showToast('¡Comentado!')
  }
};

// Editar
const startEdit = (comment) => {
  editingId.value = comment.id;
  editText.value = comment.content;
};

const saveEdit = async (id) => {
  const { error } =  await supabase.from('game_comments').update({
    content: editText.value
  }).eq('id', id);

  if(error) {
    showToast('¡Error al editar!', 'error')
  } else {
    editingId.value = null;
    fetchComments();
    showToast('¡Editado!')
  }
};

const userLikes = ref([]);

const fetchUserLikes = async () => {
  if (!user.value) return;
  const { data } = await supabase
      .from('comment_likes')
      .select('comment_id')
      .eq('user_id', user.value.sub);

  userLikes.value = data.map(l => l.comment_id);
};

const toggleLike = async (comment) => {
  if (!user.value) return alert('Debes iniciar sesión');

  const hasLiked = userLikes.value.includes(comment.id);

  if (hasLiked) {
    // QUITAR LIKE
    const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('user_id', user.value.sub)
        .eq('comment_id', comment.id);

    if (!error) {
      userLikes.value = userLikes.value.filter(id => id !== comment.id);
      comment.likes_count--;
    }
  } else {
    const { error } = await supabase
        .from('comment_likes')
        .insert({ user_id: user.value.sub, comment_id: comment.id });

    if (!error) {
      userLikes.value.push(comment.id);
      comment.likes_count++;
    }
  }
};

onMounted(() => {
  fetchComments();
  fetchUserLikes();
});

</script>