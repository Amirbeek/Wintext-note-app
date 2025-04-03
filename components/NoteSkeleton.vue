<template>
  <div class="p-3 rounded-lg bg-zinc-800 animate-pulse mt-2">
    <div class="h-4 bg-zinc-700 rounded w-3/4 mb-2"></div>
    <div class="h-3 bg-zinc-700 rounded w-1/2 mt-2"></div>
  </div>
</template>


<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
</style>
