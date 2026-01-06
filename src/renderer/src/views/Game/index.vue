<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppStore } from '@renderer/store/app'

const appStore = useAppStore()

const showAddModal = ref(false)
// 游戏数据
const games = ref([
  {
    id: 1,
    name: '超级马里奥兄弟',
    path: '/roms/super_mario.nes',
    image: '',
    year: 1985,
    saves: [
      { time: '2023-05-10 14:30' },
      { time: '2023-05-15 09:45' },
      { time: '2023-05-20 21:15' }
    ]
  },
  {
    id: 2,
    name: '魂斗罗',
    path: '/roms/contra.nes',
    image: '',
    year: 1987,
    saves: [{ time: '2023-05-12 16:20' }, { time: '2023-05-18 11:30' }]
  },
  {
    id: 3,
    name: '塞尔达传说',
    path: '/roms/zelda.nes',
    image: '',
    year: 1986,
    saves: [{ time: '2023-05-08 10:15' }, { time: '2023-05-22 19:40' }]
  },
  {
    id: 4,
    name: '坦克大战',
    path: '/roms/tank.nes',
    image: '',
    year: 1985,
    saves: [
      { time: '2023-05-05 08:50' },
      { time: '2023-05-19 15:20' },
      { time: '2023-05-25 22:10' }
    ]
  },
  {
    id: 5,
    name: '双截龙',
    path: '/roms/double_dragon.nes',
    image: '',
    year: 1987,
    saves: [{ time: '2023-05-14 13:25' }]
  },
  {
    id: 6,
    name: '冒险岛',
    path: '/roms/adventure_island.nes',
    image: '',
    year: 1986,
    saves: [{ time: '2023-05-11 17:45' }, { time: '2023-05-16 20:30' }]
  }
])

// 搜索文本
const searchText = ref('')

// 过滤后的游戏列表
const filteredGames = computed(() => {
  if (!searchText.value) return games.value
  return games.value.filter((game) =>
    game.name.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

const startGame = (game) => {
  appStore.openCustomWindow({
    id: `EmulatorJS`,
    title: `EmulatorJS`,
    url: `http://${appStore.realHost}:${appStore.devicePort}/game`
  })
}
const handleSearch = (value) => {
  console.log('搜索:', value)
}
</script>
<template>
  <div class="game-container">
    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="action-title">
        <icon-sync />
        我的游戏库 ({{ games.length }})
      </div>
      <a-input-search
        v-model="searchText"
        placeholder="搜索游戏..."
        size="large"
        allow-clear
        @search="handleSearch"
      />
    </div>

    <!-- 游戏网格 -->
    <a-grid :cols="{ md: 3, lg: 4, xl: 5, xxl: 6 }" :colGap="12" :rowGap="16">
      <a-grid-item
        v-for="game in filteredGames"
        :key="game.id"
        class="game-card"
        @click="startGame(game)"
      >
        <img src="@renderer/assets/logo.svg" class="game-image" alt="游戏截图" />
        <div class="game-info">
          <div class="game-name">{{ game.name }}</div>
          <div class="game-year">发行年份: {{ game.year }}</div>
        </div>

        <!-- 悬停面板 -->
        <div class="game-hover-panel">
          <h3>游戏存档</h3>
          <div v-for="(save, index) in game.saves" :key="index" class="save-item">
            <div style="font-size: 12px">存档 {{ index + 1 }} {{ save.time }}</div>
          </div>

          <a-button class="quick-start-btn" @click.stop="startGame(game)"> 快速开始 </a-button>
        </div>
      </a-grid-item>
    </a-grid>

    <!-- 空状态 -->
    <div v-if="filteredGames.length === 0" class="empty-state">
      <i class="arco-icon arco-icon-inbox empty-icon"></i>
      <div class="empty-text">没有找到【{{ searchText }}】游戏，请手动添加您的红白机游戏</div>
      <!--        <a-button type="primary" size="large" @click="showAddModal = true">添加游戏</a-button>-->
    </div>
  </div>
</template>

<style scoped>
.game-container {
  height: calc(100vh - 30px);
  background-color: var(--color-bg-1);
  overflow: auto;
  padding: 20px;
}

.action-bar {
  background: var(--color-bg-3);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.action-title {
  font-size: 22px;
  color: var(--color-neutral-8);
  display: flex;
  margin-bottom: 10px;
  align-items: center;
}

.action-title i {
  color: #e63946;
}

.game-card {
  background: var(--color-bg-3);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  position: relative;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.game-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(230, 144, 57, 0.4);
}

.game-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-bottom: 2px solid rgba(230, 144, 57, 1);
}

.game-info {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.game-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
  color: var(--color-neutral-8);
  text-align: center;
  flex: 1;
}

.game-year {
  font-size: 12px;
  color: var(--color-neutral-6);
  text-align: center;
  margin-bottom: 10px;
}

.game-hover-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--color-bg-3);
  backdrop-filter: blur(5px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  padding: 6px;
}

.game-card:hover .game-hover-panel {
  opacity: 1;
}

.save-item {
  width: 100%;
  padding: 10px 15px;
  background: rgba(230, 144, 57, 0.2);
  border-radius: 8px;
  margin-bottom: 10px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.save-item:hover {
  background: rgba(230, 144, 57, 0.4);
  transform: translateX(5px);
}

.quick-start-btn {
  width: 100%;
  margin-top: 15px;
  background: linear-gradient(to right, #e63946, #f28482);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.quick-start-btn:hover {
  background: linear-gradient(to right, #e63946, #d62828);
  box-shadow: 0 0 15px rgba(230, 144, 57, 0.6);
}

/* 空状态样式 */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background: rgba(29, 53, 87, 0.3);
  border-radius: 12px;
  margin-top: 20px;
}

.empty-icon {
  font-size: 60px;
  color: #e63946;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 18px;
  color: var(--color-neutral-10);
  margin-bottom: 30px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .games-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }

  .action-bar {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .games-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
