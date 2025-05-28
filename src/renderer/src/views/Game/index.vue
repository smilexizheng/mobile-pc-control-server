
<script setup lang="ts">

</script>
<template>
  <div class="game-container">
  <iframe src="http://127.0.0.1:3002/game"></iframe>
  </div>
</template>


<style scoped>
/* 保持原有样式，根据Vue需求调整 */
.game-container {
  height: 100%;
  background-color: black;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin: 0;
  overflow: hidden;
}

</style>
