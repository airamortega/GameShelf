<template>
  <div
      class="absolute top-2 right-2 px-2 py-1 rounded-[24px] font-black text-xs min-w-[35px] text-center shadow-md uppercase"
      :class="ratingClasses"
  >
    {{ displayValue }}
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  rating: {
    type: [Number, String],
    default: null
  }
});

const displayValue = computed(() => {
  if (!props.rating) return '-';
  return Number(props.rating / 10).toFixed(1);
});

const ratingClasses = computed(() => {
  const r = props.rating;

  if (!r) return 'bg-gray-500 text-white';

  // Lógica de rangos cada 10 puntos
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

</script>