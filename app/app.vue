<template>
  <div class="app-container">
    <NavigationBar />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import NavigationBar from '~/components/navigation_bar.vue'
</script>