<template>
  <div class="flex items-center justify-center w-full gap-1 absolute bottom-0 left-0 bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 overflow-hidden divide-y divide-white/5 shadow-2xl py-2">
    <div v-for="(status) in statuses"
         :key="status"
         class="w-4 h-4 rounded-full shadow-lg relative"
         :style="{ backgroundColor: getStatus(status).color + '22', color: getStatus(status).color }"
    >
      <span class="micro-icon-container" v-html="getStatus(status).icon"></span>
    </div>
  </div>
</template>

<script setup >
  const props = defineProps({
    statuses: {
      type: Array,
      default: () => []
    }
  });

  const getStatus = (status) => {
    return GameStatusLabels[status] || null;
  }

</script>

<style scoped>

.micro-icon-container :deep(svg) {
  width: 100%;
  height: 100%;
}

</style>