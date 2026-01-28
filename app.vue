<template>
  <div class="app-layout">
    <AppNavbar />
    <main class="container">
      <NuxtPage />
    </main>
  </div>
</template>

<style>
.page-enter-active, .page-leave-active {
  transition: opacity 0.3s ease;
}
.page-enter-from, .page-leave-to {
  opacity: 0;
}
</style>