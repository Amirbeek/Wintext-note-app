<script setup lang="ts">
// No props needed for now
</script>

<template>
  <div class="flex items-center justify-center w-full h-full">
    <div class="loader-container">
      <div class="orbit orbit-1"></div>
      <div class="orbit orbit-2"></div>
      <div class="orbit orbit-3"></div>
      <div class="center-glow">🤖</div>
    </div>
  </div>
</template>

<style scoped>
.loader-container {
  position: relative;
  width: 100px;
  height: 100px;
}

.center-glow {
  width: 40px;
  height: 40px;
  background: radial-gradient(circle, #6366f1, #4f46e5);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 1.5rem;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.6);
}

.orbit {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: #6366f1;
  animation: spin 2s linear infinite;
}

.orbit-1 {
  width: 60px;
  height: 60px;
  top: 20px;
  left: 20px;
  animation-duration: 2s;
}

.orbit-2 {
  width: 80px;
  height: 80px;
  top: 10px;
  left: 10px;
  animation-duration: 3s;
  border-top-color: #818cf8;
}

.orbit-3 {
  width: 100px;
  height: 100px;
  top: 0;
  left: 0;
  animation-duration: 4s;
  border-top-color: #a5b4fc;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
