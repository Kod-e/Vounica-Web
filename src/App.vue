<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppBar from './components/AppBar.vue'
import NotifyOver from './components/NotifyOver.vue'
</script>

<template>
  <AppBar>
    <RouterView />
  </AppBar>
  <NotifyOver />
</template>

<style scoped></style>
