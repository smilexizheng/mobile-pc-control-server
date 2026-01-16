<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

type CoreMap = {
  [key: string]: string
}

const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const selectedCore = ref('')
const showCoreSelector = ref(false)
const showEmulator = ref(false)

const cores: CoreMap = {
  'Nintendo 64': 'n64',
  'Nintendo Game Boy': 'gb',
  'Nintendo Game Boy Advance': 'gba',
  'Nintendo DS': 'nds',
  'Nintendo Entertainment System': 'nes',
  'Super Nintendo Entertainment System': 'snes',
  PlayStation: 'psx',
  'Virtual Boy': 'vb',
  'Sega Mega Drive': 'segaMD',
  'Sega Master System': 'segaMS',
  'Sega CD': 'segaCD',
  'Atari Lynx': 'lynx',
  'Sega 32X': 'sega32x',
  'Atari Jaguar': 'jaguar',
  'Sega Game Gear': 'segaGG',
  'Sega Saturn': 'segaSaturn',
  'Atari 7800': 'atari7800',
  'Atari 2600': 'atari2600',
  Arcade: 'arcade',
  'NEC TurboGrafx-16/SuperGrafx/PC Engine': 'pce',
  'NEC PC-FX': 'pcfx',
  'SNK NeoGeo Pocket (Color)': 'ngp',
  'Bandai WonderSwan (Color)': 'ws',
  ColecoVision: 'coleco',
  'Commodore 64': 'vice_x64sc',
  'Commodore 128': 'vice_x128',
  'Commodore VIC20': 'vice_xvic',
  'Commodore Plus/4': 'vice_xplus4',
  'Commodore PET': 'vice_xpet'
}

const sortedCores = computed(() => {
  return Object.keys(cores)
    .sort()
    .reduce((obj: CoreMap, key) => {
      obj[key] = cores[key]
      return obj
    }, {})
})

const coreExtensions: { [key: string]: string[] } = {
  nes: ['fds', 'nes', 'unif', 'unf'],
  snes: ['smc', 'fig', 'sfc', 'gd3', 'gd7', 'dx2', 'bsx', 'swc'],
  n64: ['z64', 'n64'],
  pce: ['pce'],
  ngp: ['ngc', 'ngp'],
  ws: ['ws'],
  coleco: ['col', 'vn'],
  vice_x64sc: ['d64'],
  ext: ['nds', 'gba', 'gb', 'z64', 'n64']
}

const enableDebug = ref(false)
const enableThreads = ref(false)

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  enableDebug.value = urlParams.get('debug') === '1'
  enableThreads.value = urlParams.get('threads') === '1' && !!window.SharedArrayBuffer
})

function handleDragOver() {
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files[0]) {
    handleFile(files[0])
  }
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    handleFile(input.files[0])
  }
}

async function handleFile(file: File) {
  selectedFile.value = file
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  const core = await determineCore(ext)

  if (core) {
    selectedCore.value = core
    loadEmulator()
  } else {
    showCoreSelector.value = true
  }
}

function determineCore(ext: string): Promise<string> {
  for (const [core, exts] of Object.entries(coreExtensions)) {
    if (exts.includes(ext)) {
      return Promise.resolve(core)
    }
  }
  return new Promise((resolve) => {
    showCoreSelector.value = true
  })
}

function loadEmulator() {
  showEmulator.value = true
  showCoreSelector.value = false

  // 设置模拟器配置
  const gameName = selectedFile.value?.name.split('.').shift() || ''

  window.EJS_player = '#game'
  window.EJS_gameName = gameName
  window.EJS_language = 'zh-CN'
  window.EJS_biosUrl = ''
  window.EJS_gameUrl = URL.createObjectURL(selectedFile.value)
  window.EJS_core = selectedCore.value
  window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/'
  window.EJS_startOnLoaded = true
  window.EJS_DEBUG_XX = enableDebug.value
  window.EJS_disableDatabases = true
  window.EJS_threads = enableThreads.value

  // 加载模拟器脚本
  const script = document.createElement('script')
  script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js'
  document.body.appendChild(script)
}
</script>
<template>
  <div class="game-container">
    <div v-if="!showEmulator" id="top">
      <h1>EmulatorJS Demo</h1>
      <img src="@mobile/assets/logo.svg" alt="Logo" class="logo" />
    </div>

    <div
      v-if="!showEmulator"
      id="box"
      :class="{ drag: isDragging }"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <input type="file" id="input" @change="handleFileSelect" />
      Drag ROM file or click here
    </div>

    <div v-if="showCoreSelector" class="core-selector">
      <select v-model="selectedCore">
        <option v-for="(value, name) in sortedCores" :key="value" :value="value">
          {{ name }}
        </option>
      </select>
      <button @click="loadEmulator">Load game</button>
    </div>

    <div v-if="showEmulator" id="display">
      <div id="game"></div>
    </div>
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

#top {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin: 5px;
}

.logo {
  width: 130px;
  height: 130px;
  filter: drop-shadow(0 0 10px #fc932b);
}

#box {
  color: #aaa;
  height: 20em;
  width: 30em;
  max-width: 80%;
  max-height: 80%;
  background-color: #333;
  border-radius: 0.4em;
  border: 2px solid #555;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  transition-duration: 0.2s;
  overflow: hidden;
  font-family: monospace;
  font-weight: bold;
  font-size: 20px;
  margin: 5px;
}

#box.drag {
  border-color: #38f;
  color: #ddd;
}

#input {
  cursor: pointer;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

#display {
  width: 100%;
  height: 100%;
}

.core-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
}

select,
button {
  padding: 0.6em 0.4em;
  margin: 0.5em;
  width: 15em;
  max-width: 100%;
  font-family: monospace;
  font-weight: bold;
  font-size: 16px;
  background-color: #444;
  color: #aaa;
  border-radius: 0.4em;
  border: 1px solid #555;
  cursor: pointer;
  transition-duration: 0.2s;
}

select:hover,
button:hover {
  background-color: #666;
  color: #ddd;
}
</style>
