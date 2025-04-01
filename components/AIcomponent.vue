<template>
  <div>
    <button
        @click="openSlideover"
        class="text-zinc-500 hover:text-white text-sm font-bold"
    >
      <ChatLogo />
    </button>

    <transition name="slide">
      <div
          v-if="isSlideoverOpen"
          class="fixed inset-0 z-50 flex justify-end"
          @click.self="closeSlideover"
      >
        <div class="bg-white w-80 h-full shadow-xl p-6 relative">
          <button
              @click="closeSlideover"
              class="absolute top-4 right-4 text-zinc-500 hover:text-black"
          >
            &times;
          </button>

          <h2 class="text-xl font-bold mb-4">Education Assistant</h2>
          <ChatBot :noteText="stripHtml(noteText)"  />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import ChatLogo from '~/components/ChatLogo.vue'
import ChatBot from '~/components/ChatBot.vue'
const props = defineProps({
  noteText: {
    type: Object,
    required: true,
  },
})

const isSlideoverOpen = ref(false)
const noteText = ref('')

// Watch and initialize noteText once the prop is available
onMounted(() => {
  if (props.noteText && props.noteText.text) {
    noteText.value = props.noteText.text
  }
})

const stripHtml = (html) => {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  return tempDiv.textContent || tempDiv.innerText || ''
}
// Watch for changes to noteText prop
watchEffect(() => {
  if (props.noteText && props.noteText.text !== noteText.value) {
    noteText.value = props.noteText.text
  }
})

const openSlideover = () => {
  isSlideoverOpen.value = true
}

const closeSlideover = () => {
  isSlideoverOpen.value = false
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
