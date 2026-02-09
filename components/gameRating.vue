<template>
  <div
      class="absolute top-2 right-2 px-2 py-1 rounded-[24px] font-black text-xs min-w-[35px] text-center shadow-md uppercase"
      :class="getRatingColors"
  >
    {{ displayValue }}
  </div>
</template>

<script setup>
import { computed } from 'vue';

const { getRatingClasses } = useRatingColors();

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

const getRatingColors = computed(() => {
  return getRatingClasses(props.rating)
});

</script>