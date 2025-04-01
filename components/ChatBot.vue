<script setup lang="ts">
import { ref, onMounted, watch, watchEffect } from 'vue'
import { marked } from 'marked'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// Prop definition
const props = defineProps({
  noteText: {
    type: String,
    required: false,
    default: '' // Fallback to empty string if undefined
  },
})

const messages = ref<Message[]>([])
const input = ref('')
const loading = ref(false)
const initialRequestSent = ref(false)

// Function to ask the assistant (Llama API) with user input
const askLlama = async (userText: string, hideUserMessage = false) => {
  loading.value = true

  const chatHistory = [
    {
      role: 'system',
      content: "You are Mindex, where user made mistake and explain you dont have to explain the text ,you are like teacher and tell what they need to add or what they need to fix"
    },
    ...messages.value,
    { role: 'user', content: userText }
  ]

  if (!hideUserMessage) {
    messages.value.push({ role: 'user', content: userText })
  }

  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        messages: chatHistory,
        stream: false
      })
    })

    const data = await response.json()

    messages.value.push({
      role: 'assistant',
      content: data.message.content
    })
  } catch (err) {
    console.error(err)
    messages.value.push({
      role: 'assistant',
      content: "Sorry, something went wrong 😢"
    })
  } finally {
    loading.value = false
  }
}

// Send message function
const sendMessage = async () => {
  if (!input.value.trim()) return
  const userText = input.value
  input.value = ''
  await askLlama(userText)
}

// Initialize with a default message if noteText is undefined
onMounted(() => {
  if (props.noteText && !initialRequestSent.value) {
    askLlama(`Explain: ${props.noteText}`, true)
    initialRequestSent.value = true // Set flag to prevent repeated requests
    console.log("OnMounted", props.noteText)
  }
})

// Watch for changes to noteText and update the messages accordingly
watch(() => props.noteText, (newText) => {
  if (newText && newText !== props.noteText) {
    askLlama(`Explain: ${newText}`, true)
    console.log('Explain', newText)
  }
})
</script>

<template>
  <div class="max-w-lg mx-auto border rounded-lg shadow h-[600px] flex flex-col bg-white">
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <div
          v-for="(msg, i) in messages"
          :key="i"
          :class="msg.role === 'user' ? 'text-right' : 'text-left'"
      >
        <div
            :class="[
            'inline-block px-4 py-2 rounded-xl max-w-[80%] markdown-body',
            msg.role === 'user'
              ? 'bg-blue-500 text-white ml-auto'
              : 'bg-gray-100 text-gray-800'
          ]"
            v-html="marked(msg.content)"
        ></div>
      </div>

      <!-- 🟢 Typing animation -->
      <div v-if="loading" class="flex justify-start">
        <div class="bg-gray-100 text-gray-800 px-4 py-2 rounded-xl inline-block">
          <span class="typing-dots">
            <span>.</span><span>.</span><span>.</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="border-t p-3 flex items-center gap-2">
      <input
          v-model="input"
          @keydown.enter="sendMessage"
          type="text"
          class="flex-1 border rounded-md px-3 py-2 outline-none w-1/3"
          placeholder="Talk to Mindex 🎓"      />
      <button
          @click="sendMessage"
          :disabled="loading"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
      >
        {{ loading ? '...' : 'Send' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.typing-dots {
  display: inline-flex;
  gap: 4px;
  font-weight: bold;
  font-size: 20px;
  animation: blink 1.2s infinite;
}

.typing-dots span {
  animation: bounce 1.2s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: 0s;
}
.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-6px);
  }
}

/* Optional: add GitHub markdown styling for better readability */
.markdown-body {
  line-height: 1.5;
}

.markdown-body ul {
  list-style: disc;
  padding-left: 1rem;
}

.markdown-body code {
  background-color: rgba(175, 184, 193, 0.2);
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}
</style>
