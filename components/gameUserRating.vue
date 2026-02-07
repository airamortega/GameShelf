<template>
  <div class="bg-white/5 border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col items-center gap-3">

    <div v-if="userRating !== null"
         :class="getRatingColor"
         class="w-[70px] h-[60px] rounded-lg flex items-center justify-center font-black text-xl shadow-lg transition-colors">
      {{ Number(userRating).toFixed(2) }}
    </div>

    <div v-if="user" class="space-y-6 w-full">
      <input
          type="range"
          v-model="tempRating"
          min="0"
          max="10"
          step="0.05"
          :style="sliderStyle"
          class="custom-slider w-full h-2 rounded-lg appearance-none cursor-pointer"
      />
      <div class="flex justify-between text-[12px] text-gray-500 font-bold uppercase tracking-widest">
        <span>0.0</span>
        <span class="text-white text-s">Puntuación: {{ tempRating }}</span>
        <span>10.0</span>
      </div>

      <div class="flex gap-3">
        <button
            @click="submitVote"
            class="flex-1 py-5 bg-white text-slate-950 font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl active:scale-[0.98] disabled:opacity-20 flex justify-center items-center gap-2"
        >
          {{ userRating ? 'Actualizar' : 'Votar' }}
        </button>

        <button
            v-if="userRating"
            @click="deleteVote"
            class="w-16 h-[60px] flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl active:bg-red-500 active:text-white transition-all duration-300"
        >
          <Trash2 :size="20" />
        </button>
      </div>
    </div>

    <div v-else class="text-center py-4">
      <p class="text-gray-500 text-sm">Inicia sesión para puntuar este juego</p>
    </div>
  </div>
</template>

<script setup>
import {Trash2 } from 'lucide-vue-next'
import {computed} from "vue";

const props = defineProps(['gameId']);
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const userRating = ref(null);
const tempRating = ref(0);

const getRatingColor = computed(() => {
  const r = userRating.value * 10;

  if (!r) return 'bg-gray-500 text-white';

  if (r >= 90) return 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50';
  if (r >= 80) return 'bg-green-500 text-white';
  if (r >= 70) return 'bg-lime-500 text-black';
  if (r >= 60) return 'bg-yellow-400 text-black';
  if (r >= 50) return 'bg-yellow-600 text-white';
  if (r >= 40) return 'bg-orange-400 text-black';
  if (r >= 30) return 'bg-orange-600 text-white';
  if (r >= 20) return 'bg-red-500 text-white';
  if (r >= 10) return 'bg-red-700 text-white';
  return 'bg-red-900 text-white';
});

const fetchUserVote = async () => {
  if (!user.value) return;
  const { data } = await supabase
    .from('game_votes')
    .select('rating')
    .eq('game_id', props.gameId)
    .eq('user_id', user.value.sub)
    .maybeSingle();

  if (data) {
    userRating.value = data.rating;
    tempRating.value = data.rating;
  }
};

const submitVote = async () => {
  const { error } = await supabase
    .from('game_votes')
    .upsert({
      user_id: user.value.sub,
      game_id: props.gameId,
      rating: parseInt(tempRating.value)
    });

  if (!error) userRating.value = tempRating.value;
};

const deleteVote = async () => {
  const { error } = await supabase
    .from('game_votes')
    .delete()
    .eq('user_id', user.value.sub)
    .eq('game_id', props.gameId);

  if (!error) {
    userRating.value = null;
    tempRating.value = 0;
  }
};

const sliderStyle = computed(() => {
  const percentage = (tempRating.value / 10) * 100;

  return {
    background: `linear-gradient(to right,
      #ef4444 0%,    /* Rojo */
      #eab308 50%,   /* Amarillo */
      #10b981 100%)  /* Esmeralda */
      no-repeat`,
    backgroundSize: `${percentage}% 100%`,
    backgroundColor: '#262626'
  };
});

const getTextColor = (score) => {
  if (score >= 75) return 'text-emerald-500';
  if (score >= 50) return 'text-yellow-500';
  return 'text-red-500';
};

onMounted(fetchUserVote);
watch(user, fetchUserVote);
</script>

<style scoped>
.custom-slider {
  outline: none;
  -webkit-appearance: none;
}

.custom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: white;
  border: 3px solid #171717;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  transition: transform 0.1s ease;
}

.custom-slider::-webkit-slider-thumb:active {
  transform: scale(1.2);
}

.custom-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: white;
  border: 3px solid #171717;
  border-radius: 50%;
  cursor: pointer;
}
</style>