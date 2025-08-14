<template>
  <div>
    <h1>QuestionView</h1>
    <input v-model="userInput" />
    <button @click="questionAgent.start(userInput)">Start</button>
    <div v-for="message in questionAgent.messages" :key="message.message">
      <div>{{ message.message }}</div>
    </div>
    <div v-for="question in questionAgent.questions" :key="question.question_type">
      <div>{{ question.question_type }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { questionAgentController } from '@/controller/questionAgent'
import { ref } from 'vue'

const questionAgent = questionAgentController()
const userInput = ref('')
</script>
