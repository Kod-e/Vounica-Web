<template>
  <div>
    <h2>{{ question.stem }}</h2>
    <div v-for="option in question.options" :key="option">
      <input type="radio" :value="option" />
      <label>{{ option }}</label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { questionController } from '@/controller/question'
import { computed } from 'vue'
import type { components } from '@/types/api'

type ChoiceQuestion = components['schemas']['ChoiceQuestion']
const controller = questionController()
const question = computed(() => controller.question as ChoiceQuestion)
</script>
