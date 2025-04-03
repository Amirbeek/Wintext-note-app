<script setup lang="ts">
</script>

<template>
  <div class="bg-gray-100 text-gray-800 px-4 py-2 rounded-xl inline-block">
    <span class="typing-dots">
      <span>.</span><span>.</span><span>.</span>
    </span>
  </div>
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
</style>
