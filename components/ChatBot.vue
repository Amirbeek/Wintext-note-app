<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { marked } from 'marked'
const messages = ref<Message[]>([])
const input = ref('')
const loading = ref(false)
const modalLoading = ref(false)
const initialRequestSent = ref(false)
const chatContainer = ref<HTMLElement | null>(null)
const animatedChunks = ref<string[]>([])

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const props = defineProps({
  noteText: {
    type: String,
    required: false,
    default: ''
  }
})

const sendMessage = async () => {
  if (!input.value.trim()) return
  const userText = input.value
  input.value = ''
  await askLlama(userText)
}

const askLlama = async (userText: string, hideUserMessage = false) => {
  loading.value = true
  animatedChunks.value = []

  const chatHistory = [
    {
      role: 'system',
      content: "You are Mindex, where user made mistake and explain you dont have to explain the text, you are like teacher and tell what they need to add or what they need to fix"
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
    const fullContent = data.message.content

    // Split by triple backticks for code blocks
    const parts = fullContent.split(/(```[\s\S]*?```)/g)
    let i = 0

    const typeChunk = async () => {
      if (i >= parts.length) {
        messages.value.push({ role: 'assistant', content: fullContent })
        animatedChunks.value = []
        loading.value = false
        return
      }

      const part = parts[i]

      if (part.startsWith("```")) {
        // Full code block, show immediately
        animatedChunks.value.push(marked(part))
        i++
        await nextTick()
        chatContainer.value?.scrollTo({ top: chatContainer.value.scrollHeight })
        typeChunk()
      } else {
        let j = 0
        let tempText = ''
        const animateText = setInterval(() => {
          if (j < part.length) {
            tempText += part[j]
            animatedChunks.value[animatedChunks.value.length - 1] =
                marked(tempText)
            j++
            nextTick(() => {
              chatContainer.value?.scrollTo({ top: chatContainer.value.scrollHeight })
            })
          } else {
            clearInterval(animateText)
            i++
            typeChunk()
          }
        }, 15)

        animatedChunks.value.push('')
      }
    }

    typeChunk()
  } catch (err) {
    console.error(err)
    messages.value.push({
      role: 'assistant',
      content: "Sorry, something went wrong 😢"
    })
    loading.value = false
  }
}

watch(messages, () => {
  nextTick(() => {
    chatContainer.value?.scrollTo({ top: chatContainer.value.scrollHeight })
  })
})

const generate_Quiz = async (userText: string) => {
  modalLoading.value =  true
  const instruction = "Generate 10 multiple-choice quiz questions with 4 options each. Only one option should be correct. The questions should be strictly related to the topic, no extra content.";
  const prompt = `${instruction} Topic: ${userText}. Return the result in JSON format with the following structure:
  {
    quizzes: [
      {
        question: "string",
        options: ["string", "string", "string", "string"],
        answer: "string"
      }
    ]
  }`;

  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3',
      messages: [
        { role: 'user', content: prompt }
      ],
      stream: false
    })
  });

  const data = await response.json();
  const message = data.message?.content;
  console.log("Generated Quizzes:", message);
  modalLoading.value =  false
  return message;
};

const showQuizModal=()=>{
  if (props.noteText){
    console.log('started')
    generate_Quiz(props.noteText)
  }
}
onMounted(() => {
  if (props.noteText && !initialRequestSent.value) {
    askLlama(`Explain: ${props.noteText}`, true)
    initialRequestSent.value = true
  }
})

watch(() => props.noteText, (newText) => {
  if (newText && newText !== props.noteText) {
    askLlama(`Explain: ${newText}`, true)
  }

})
</script>

<template>
  <div class="max-w-lg mx-auto border rounded-lg shadow h-[670px] flex flex-col bg-white">
    <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
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

      <!-- Animated response -->
      <div v-if="animatedChunks.length" class="text-left">
        <div
            v-for="(chunk, index) in animatedChunks"
            :key="index"
            class="inline-block px-4 py-2 rounded-xl max-w-[80%] markdown-body bg-gray-100 text-gray-800 mb-2"
            v-html="chunk"
        ></div>
      </div>

      <!-- Typing dots -->
      <div v-if="loading && animatedChunks.length === 0" class="flex justify-start">
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
          placeholder="Talk to Mindex 🎓"
      />
      <button
          @click="sendMessage"
          :disabled="loading"
          class="bg-indigo-500 hover:bg-indigo-500/50 text-white px-4 py-2 rounded-md"
      >
        {{ loading ? '...' : 'Send' }}
      </button>
    </div>

  </div>
  <!-- Quiz Icon CTA -->
  <div
      @click="showQuizModal"
      class="max-w-lg mx-auto mt-2 px-6 text-indigo-800 hover:bg-indigo-50 transition-colors cursor-pointer rounded-md py-2 flex items-center justify-between group"
  >
  <span class="text-sm font-medium">
    Start Learning Quiz
    <span class="underline-offset-4 group-hover:underline">Generator</span>
  </span>
    <QuizIcon class="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
  </div>


<!--  Quiz Modal -->
</template>

<style scoped>
.typing-dots {
  display: inline-flex;
  gap: 4px;
  font-weight: bold;
  font-size: 20px;
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