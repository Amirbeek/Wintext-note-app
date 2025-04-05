<script setup>
import { ref } from "vue";

// Example essays with a dynamic start point
const essays = [
  {
    text: "Climate change is not just a future threat; it's a present crisis. We must act now to ensure our children inherit a clean and sustainable world. Effective solutions include ",
    continue: "renewable energy adoption at a larger scale, conservation efforts that protect our natural ecosystems, and technological innovations designed to reduce carbon emissions."
  },
  {
    text: "Technology has revolutionized the way we live, introducing unparalleled convenience and efficiency. However, it also brings challenges that must be addressed responsibly. Among these challenges are issues of ",
    continue: "privacy, data security, and the digital divide that could exacerbate social inequalities. Proactive regulation and ethical technology development are essential for a balanced digital future."
  },
  {
    text: "Education must evolve to meet the needs of a rapidly changing world. The traditional focus on rote learning is giving way to more dynamic approaches that emphasize critical thinking and problem-solving skills. To further enrich this transformation, education systems are integrating ",
    continue: "interactive and personalized learning experiences that leverage digital tools to cater to individual learning styles and paces. This shift is crucial for preparing students for the demands of the modern workforce."
  }
];

const currentEssayIndex = ref(0);
const currentCharacterIndex = ref(0);
const currentText = ref("");
const isTyping = ref(true);
const cursor = ref("|");
const typingSpeed = () => Math.random() * (200 - 100) + 100; // Variable typing speed

function typeCharacter() {
  const fullText = essays[currentEssayIndex.value].text + essays[currentEssayIndex.value].continue;
  if (isTyping.value) {
    if (currentCharacterIndex.value < fullText.length) {
      currentText.value += fullText[currentCharacterIndex.value];
      currentCharacterIndex.value++;
      setTimeout(typeCharacter, typingSpeed());
    } else {
      setTimeout(() => {
        isTyping.value = false; // End typing after the full text
        prepareNextEssay();
      }, 1000);
    }
  }
}

function prepareNextEssay() {
  setTimeout(() => {
    if (currentEssayIndex.value < essays.length - 1) {
      currentEssayIndex.value++;
    } else {
      currentEssayIndex.value = 0; // Loop back to the first essay
    }
    currentCharacterIndex.value = 0;
    currentText.value = essays[currentEssayIndex.value].text; // Start with existing text
    isTyping.value = true;
    typeCharacter(); // Continue typing the remaining part
  }, 2000);
}

// Initialization with the first essay's starting text
onMounted(() => {
  currentText.value = essays[0].text;
  currentCharacterIndex.value = essays[0].text.length;
  typeCharacter();
});

</script>

<template>
  <div>
    <p id="text">{{ currentText }}<span class="cursor">{{ cursor }}</span></p>
  </div>
</template>

<style scoped>
#text {
  font-size: 1.2rem;
  line-height: 1.6;
  white-space: pre-wrap; /* Keeps formatting for new lines and spaces */
  color: #333;
  margin: 20px;
}

.cursor {
  animation: blink 1s infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}
</style>
