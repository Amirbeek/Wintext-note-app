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
const showModal = ref(false)
const currentIndex = ref(0)
const selectedOption = ref<string | null>(null)
const showFeedback = ref(false)
import { jsonrepair } from 'jsonrepair'


const currentQuiz = computed(() => quizzes.value[currentIndex.value])
const isLastQuestion = computed(() => currentIndex.value === quizzes.value.length - 1)
const quizzes = ref<{ question: string, options: string[], answer: string,shortExplanation: string }[]>([])

interface Message {
  role: 'user' | 'assistant'
  content: string
}


const nextQuestion = () => {
  if (!isLastQuestion.value) {
    currentIndex.value++
    selectedOption.value = null
    showFeedback.value = false
  }
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

const selectOption = (option: string) => {
  if (!showFeedback.value) {
    selectedOption.value = option
    showFeedback.value = true
  }
}

function sanitizeAndParseJSON(raw: string): any | null {
  try {
    // Remove any code block formatting and trim
    let cleaned = raw.replace(/```(json)?/gi, '').trim()

    // Extract the JSON string from text
    const jsonStart = cleaned.indexOf('{')
    const jsonEnd = cleaned.lastIndexOf('}') + 1
    if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON block found")

    let jsonStr = cleaned.slice(jsonStart, jsonEnd)

    // Attempt to auto-repair broken JSON
    const repaired = jsonrepair(jsonStr)
    const parsed = JSON.parse(repaired)

    // Validate structure
    if (!parsed || !Array.isArray(parsed.quizzes)) {
      throw new Error("⚠️ Parsed result does not contain quizzes array")
    }

    // Cleanup extra keys and normalize answers
    const answerMap = { a: 0, b: 1, c: 2, d: 3 }
    parsed.quizzes = parsed.quizzes.map((quiz: any) => {
      Object.keys(quiz).forEach((key) => {
        if (!["question", "options", "answer", "shortExplanation"].includes(key)) {
          delete quiz[key]
        }
      })

      if (quiz.answer && typeof quiz.answer === 'string' && answerMap[quiz.answer.toLowerCase()]) {
        const index = answerMap[quiz.answer.toLowerCase()]
        if (quiz.options && quiz.options[index]) {
          quiz.answer = quiz.options[index]
        }
      }

      return quiz
    })

    return parsed
  } catch (err) {
    console.error("❌ JSON parsing failed:", err)
    return null
  }
}

const generate_Quiz = async (userText: string) => {
  modalLoading.value = true
  quizzes.value = []

  const instruction = `
    Generate 10 multiple-choice quiz questions about the given topic.

    Each question must have:
    - exactly 4 options
    - one correct answer
    - a shortExplanation field that briefly explains why the answer is correct (1–2 sentences only, no extra fluff)

    Return ONLY valid JSON in this format:
    {
      "quizzes": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "answer": "string",
          "shortExplanation": "string"
        }
      ]
    }
  `.trim()

  const prompt = `${instruction} Topic: ${userText}`

  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        messages: [{ role: 'user', content: prompt }],
        stream: false
      })
    })

    const data = await response.json()
    const parsed = sanitizeAndParseJSON(data.message?.content)
    console.log(data.message?.content)
    if (parsed && parsed.quizzes) {
      quizzes.value = parsed.quizzes
    } else {
      console.warn('⚠️ Parsed result does not contain quizzes array')
    }
  } catch (err) {
    console.error("Failed to extract quizzes:", err)
  } finally {
    modalLoading.value = false
    showModal.value = true
  }
}

const showQuizModal=()=>{
  if (props.noteText){
    console.log('started')
    console.log(props.noteText)
    generate_Quiz(props.noteText)

    showModal.value = true
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
      <div v-for="(msg, i) in messages" :key="i" :class="msg.role === 'user' ? 'text-right' : 'text-left'">
        <div :class="[
            'inline-block px-4 py-2 rounded-xl max-w-[80%] markdown-body',
            msg.role === 'user' ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-100 text-gray-800'
          ]"
             v-html="marked(msg.content)"></div>
      </div>

      <div v-if="animatedChunks.length" class="text-left">
        <div v-for="(chunk, index) in animatedChunks" :key="index"
             class="inline-block px-4 py-2 rounded-xl max-w-[80%] markdown-body bg-gray-100 text-gray-800 mb-2"
             v-html="chunk"></div>
      </div>

      <div v-if="loading && animatedChunks.length === 0" class="flex justify-start">
        <DotLoader />
      </div>
    </div>

    <div class="border-t p-3 flex items-center gap-2">
      <input v-model="input" @keydown.enter="sendMessage" type="text"
             class="flex-1 border rounded-md px-3 py-2 outline-none w-1/3" placeholder="Talk to Mindex 🎓" />
      <button @click="sendMessage" :disabled="loading"
              class="bg-indigo-500 hover:bg-indigo-500/50 text-white px-4 py-2 rounded-md">
        {{ loading ? '...' : 'Send' }}
      </button>
    </div>
  </div>

  <div @click="showQuizModal"
       class="max-w-lg mx-auto mt-2 px-6 text-indigo-800 hover:bg-indigo-50 transition-colors cursor-pointer rounded-md py-2 flex items-center justify-between group">
    <QuizButton />
  </div>

  <Transition name="fade">
    <div v-if="showModal"
         class="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div class="bg-white w-[70vw] h-[70vh] p-6 rounded-xl overflow-y-auto shadow-xl relative">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Generated Quiz</h2>
          <button @click="showModal = false" class="text-gray-600 hover:text-black text-2xl">&times;</button>
        </div>

        <div>
          <div v-if="modalLoading" class="text-center py-10 text-gray-500 text-lg">
            <Loader />
          </div>

          <div v-else-if="currentQuiz" class="space-y-6 animate-fade-in">
            <div class="border border-gray-200 p-6 rounded-lg shadow-md transition-transform duration-300 hover:shadow-lg">
              <h3 class="text-lg font-semibold mb-4">
                <span class="text-indigo-600 font-bold">Q{{ currentIndex + 1 }}.</span> {{ currentQuiz.question }}
              </h3>

              <ul class="space-y-3">
                <li v-for="option in currentQuiz.options" :key="option" @click="selectOption(option)"
                    class="border px-4 py-2 rounded cursor-pointer transition-all transform hover:scale-[1.02]"
                    :class="[
                    showFeedback && option === currentQuiz.answer ? 'bg-green-100 border-green-500' : '',
                    showFeedback && selectedOption === option && option !== currentQuiz.answer ? 'bg-red-100 border-red-500' : '',
                    !showFeedback ? 'hover:bg-indigo-50' : 'opacity-70'
                  ]">
                  {{ option }}
                </li>
              </ul>

              <transition name="fade">
                <div v-if="showFeedback" class="mt-4 space-y-2 animate-fade-in">
                  <div class="text-sm font-medium"
                       :class="selectedOption === currentQuiz.answer ? 'text-green-600' : 'text-red-600'">
                    {{ selectedOption === currentQuiz.answer ? '✅ Correct!' : '❌ Incorrect!' }}
                  </div>
                  <p class="text-sm text-gray-600 italic">💡 {{ currentQuiz.shortExplanation }}</p>
                </div>
              </transition>

              <div class="mt-6">
                <button v-if="!isLastQuestion" @click="nextQuestion"
                        class="bg-indigo-600 text-white mt-2 px-4 py-2 rounded hover:bg-indigo-700 transition shadow-md">
                  Next Question →
                </button>
                <button v-else @click="() => showModal = false"
                        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition shadow-md">
                  🎉 More Quiz
                </button>
              </div>
            </div>
          </div>

          <div v-else class="text-center text-gray-400">
            Quiz not loaded.
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease forwards;
}
</style>