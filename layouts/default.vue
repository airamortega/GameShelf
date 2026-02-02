<template>
  <div class="min-h-screen bg-slate-950 text-white">

    <template>
      <div>
        <Transition name="toast">
          <div v-if="visible"
               class="fixed top-10 left-1/2 -translate-x-1/2 z-[200] flex items-center text-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/10"
               :class="type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'"
          >
            <span class="text-sm font-bold uppercase tracking-widest">{{ message }}</span>
          </div>
        </Transition>
      </div>
    </template>

    <slot />
    <AppNavbar />
  </div>
</template>

<script setup>
  import { useToast } from '~/composables/useToast'
  const { message, visible, type } = useToast()
</script>
