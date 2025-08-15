<template>
  <div v-if="controller.question!.question_type === 'choice'">
    <ChoiceView />
  </div>
  <div v-else-if="controller.question!.question_type === 'match'">
    <MatchView />
  </div>
  <div v-else-if="controller.question!.question_type === 'assembly'">
    <AssemblyView />
  </div>
</template>

<script setup lang="ts">
import { questionController } from '@/controller/question'
import ChoiceView from './questions/ChoiceView.vue'
import MatchView from './questions/MatchView.vue'
import AssemblyView from './questions/AssemblyView.vue'

const controller = questionController()
</script>
