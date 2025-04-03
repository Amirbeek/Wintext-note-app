<template>
  <div class="flex justify-center w-full px-4 " >
    <div
        class="shadow-lg shadow-indigo-500/50  rounded-2xl transition-shadow duration-300 ease-in-out shimmer-wrapper p-12 space-y-8 w-full"

    >
      <!-- Fake Date -->
      <div class="skeleton h-5 w-36 mb-4 rounded"></div>

      <!-- Fake Toolbar (Buttons) -->
      <div class="flex flex-wrap gap-3">
        <div v-for="i in 14" :key="i" class="skeleton h-9 w-9 rounded-full"></div>
      </div>

      <!-- Fake Editor Content -->
      <div class="editor-container bg-zinc-800 rounded-xl p-5 space-y-5 max-h-[500px] overflow-y-auto">
        <div class="skeleton h-5 w-5/6 rounded"></div>
        <div class="skeleton h-5 w-2/3 rounded"></div>
        <div class="skeleton h-5 w-3/4 rounded"></div>
        <div class="skeleton h-5 w-2/5 rounded"></div>
        <div class="skeleton h-5 w-1/2 rounded"></div>
        <div class="skeleton h-5 w-3/4 rounded"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Shimmer */
.shimmer-wrapper {
  position: relative;
  overflow: hidden;
}
.shimmer-wrapper::before {
  content: "";
  position: absolute;
  top: 0;
  left: -150px;
  height: 100%;
  width: 150px;
  background: linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%);
  animation: shimmer 2s infinite;
}
@keyframes shimmer {
  0% {
    left: -150px;
  }
  100% {
    left: 100%;
  }
}

/* Skeleton Block */
.skeleton {
  background-color: #3f3f46;
  position: relative;
  overflow: hidden;
}

/* Scrollbar styling */
.editor-container::-webkit-scrollbar {
  width: 8px;
}
.editor-container::-webkit-scrollbar-thumb {
  background-color: #606060;
  border-radius: 4px;
}
.editor-container::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>
