<template>
  <div
      class="relative overflow-hidden bg-white/5 border border-white/10 p-4 rounded-2xl transition-all duration-300"
      :class="{ 'ring-1 ring-orange-500/30 bg-orange-500/5': highlight }"
  >
    <p
        class="text-[9px] font-black uppercase tracking-[0.15em] mb-1.5 transition-colors"
        :class="colorClasses[color]?.label || 'text-slate-500'"
    >
      {{ label }}
    </p>

    <p class="text-2xl font-mono font-bold text-white leading-none">
      {{ value }}
    </p>

    <div
        class="absolute -right-2 -bottom-2 w-12 h-12 blur-2xl opacity-20 rounded-full"
        :class="colorClasses[color]?.bg || 'bg-slate-500'"
    ></div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: [String, Number],
  color: {
    type: String,
    default: 'gray'
  },
  highlight: {
    type: Boolean,
    default: false
  }
});

// Mapeo de colores para mantener el componente limpio
const colorClasses = {
  gray:   { label: 'text-slate-500',  bg: 'bg-slate-500' },
  blue:   { label: 'text-blue-400',   bg: 'bg-blue-500' },
  red:    { label: 'text-red-400',    bg: 'bg-red-500' },
  orange: { label: 'text-orange-400', bg: 'bg-orange-500' },
  emerald: { label: 'text-emerald-400', bg: 'bg-emerald-500' }
};
</script>