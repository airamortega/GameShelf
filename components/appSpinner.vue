<script setup lang="ts">
import {Loader2} from "lucide-vue-next";
</script>

<template>
  <div class="flex flex-col items-center justify-center p-12 w-full">
    <Loader2 class="animate-spin text-blue-600" :size="40" />
    <span class="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 animate-pulse">
        Cargando
      </span>
  </div>
</template>