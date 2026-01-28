<script setup lang="ts">
</script>
<template>
  <nav class="bottom-nav">
    <div class="nav-container">
      <NuxtLink to="/" class="nav-item" active-class="active">
        <span class="icon">🏠</span>
        <span class="label">Inicio</span>
      </NuxtLink>

      <NuxtLink to="/" class="nav-item" active-class="active">
        <span class="icon">📊</span>
        <span class="label">Stats</span>
      </NuxtLink>

      <div class="center-button-wrapper">
        <NuxtLink to="/search" class="center-button">
          <span class="plus-icon">+</span>
        </NuxtLink>
      </div>

      <NuxtLink to="/" class="nav-item" active-class="active">
        <span class="icon">⭐</span>
        <span class="label">Deseados</span>
      </NuxtLink>

      <NuxtLink to="/profile" class="nav-item" active-class="active">
        <span class="icon">👤</span>
        <span class="label">Perfil</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--card-bg);
  height: 70px;
  display: flex;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: env(safe-area-inset-bottom); /* Para iPhone con notch */
  z-index: 1000;
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  position: relative;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: var(--text-muted);
  font-size: 0.7rem;
  transition: color 0.3s;
  flex: 1;
}

.nav-item.active {
  color: var(--bg-color);
}

.icon {
  font-size: 1.4rem;
  margin-bottom: 4px;
}

/* Estilos del botón central flotante */
.center-button-wrapper {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  margin-top: -40px; /* Sube el botón por encima de la barra */
}

.center-button {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--bg-color), #6366f1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
  border: 4px solid var(--bg-color); /* Crea el efecto de "corte" en la barra */
  transition: transform 0.2s;
}

.center-button:active {
  transform: scale(0.9);
}

.plus-icon {
  font-size: 2rem;
  font-weight: 300;
  line-height: 1;
}
</style>