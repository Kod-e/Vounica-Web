<template>
  <div>
    <h1>QuestionView</h1>
    <input v-model="userInput" />
    <button @click="questionAgent.start(userInput)">Start</button>
    <button @click="questionAgent.stop()" :disabled="!questionAgent.running">Stop</button>

    <div v-for="(ev, i) in questionAgent.events" :key="i">
      <div v-if="ev.type === 'message'">
        <div>{{ ev.data?.emoji }} {{ ev.data?.message }}</div>
      </div>

      <div v-else-if="ev.type === 'thinking'">
        <div>🤔 thinking...</div>
      </div>

      <div v-else-if="ev.type === 'tool_call'">
        <div>🔧 {{ ev.data?.tool_name }}: {{ ev.data?.tool_input }}</div>
      </div>

      <div v-else-if="ev.type === 'result'">
        <div>
          <div>Questions:</div>
          <ul>
            <li v-for="(q, qi) in ev.data || []" :key="qi">
              <span>{{ q.question_type }}</span>
              <span v-if="'stem' in q"> - {{ (q as any).stem }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-if="questionAgent.isStreaming">
      <strong>LLM streaming:</strong>
      <div>{{ questionAgent.streamText }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { questionAgentController } from '@/controller/questionAgent'
import { ref } from 'vue'

const questionAgent = questionAgentController()
const userInput = ref('')
</script>
