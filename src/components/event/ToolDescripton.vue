<template>
  <div class="text-sm">
    <span class="text-gray-900">{{ name + ': ' }}</span>
    <span class="text-gray-500">{{ description }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const { tool_name, tool_data } = defineProps<{
  tool_name: string
  tool_data: any
}>()
const name = ref('')
const description = ref('')

onMounted(() => {
  if (/^add_.*_question$/.test(tool_name)) {
    name.value = t('addQuestion')
    // 如果是add_choice_question, 让description添加 选择题:
    if (tool_name === 'add_choice_question') {
      description.value += t('choiceQuestion')
    } else if (tool_name === 'add_match_question') {
      description.value += t('matchQuestion')
    } else if (tool_name === 'add_assembly_question') {
      description.value += t('assemblyQuestion')
    }
    // 检测tool_data这个字典内是否有input.stem, 如果有, 获取
    if (
      tool_data &&
      typeof tool_data === 'object' &&
      'input' in tool_data &&
      'stem' in tool_data.input
    ) {
      description.value += ':' + (tool_data.input.stem as string)
    }
  } else if (tool_name === 'get_questions') {
    name.value = t('getQuestions')
    description.value = t('getQuestionsDescription')
  } else if (tool_name === 'search_resource') {
    name.value = t('searchResource')
    // 从tool_data中获取input.resource
    const resource = tool_data!.input!.resource! ?? ''
    // 从tool_data中获取input.query, 如果不是string, 则返回空字符串
    const query = tool_data!.input!.query! ?? ''
    // 从tool_data中获取input.is_vector
    const is_vector = tool_data!.input!.is_vector! ?? false

    description.value += t(resource) + is_vector ? t('vectorSearch') : t('textSearch') + query
  } else if (tool_name === 'add_and_record_vocab') {
    name.value = t('addAndRecordVocab')
    description.value = tool_data!.input!.name ?? ''
  } else if (tool_name === 'add_and_record_grammar') {
    name.value = t('addAndRecordVocabGrammar')
    description.value = tool_data!.input!.name ?? ''
  } else if (tool_name === 'record_vocab') {
    name.value = t('recordVocab')
    description.value = tool_data!.input!.name ?? ''
  } else if (tool_name === 'record_grammar') {
    name.value = t('recordGrammar')
    description.value = tool_data!.input!.name ?? ''
  } else if (tool_name === 'add_memory') {
    name.value = t('addMemory')
    description.value = tool_data!.input!.summary ?? ''
  } else if (tool_name === 'update_memory') {
    name.value = t('updateMemory')
    description.value = tool_data!.input!.summary ?? ''
  } else if (tool_name === 'delete_memory') {
    name.value = t('deleteMemory')
    description.value = ''
  } else {
    name.value = tool_name
    description.value = tool_data ?? ''
  }
})
</script>
