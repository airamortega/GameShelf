<template>
  <div>
    <p v-if="user">Tu ID es: - {{ userId }} -</p>
    <p v-else>No has iniciado sesión</p>
  </div>
</template>

<script setup>

const user = useSupabaseUser()
const client = useSupabaseClient()

let userId = ref(null)

onMounted(async () => {
    console.log("ID desde la sesión:", user.value.id)
    console.log("ID desde user.value.id:", user.value.sub)

})
</script>