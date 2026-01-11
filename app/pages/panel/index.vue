<!-- app/pages/panel/index.vue -->
<template>
  <div class="mtr-panel-container">
    <h1>MTR 系统监控面板</h1>
    
    <div class="connection-status">
      <div class="status-card">
        <h2>服务器连接</h2>
        <div class="status-indicators">
          <div :class="['status-item', { active: isConnected }]">
            <span class="status-icon" :class="{ connected: isConnected, disconnected: !isConnected }">
              ●
            </span>
            <span>服务器: {{ isConnected ? '已连接' : '未连接' }}</span>
          </div>
          <div class="status-item">
            <span class="status-icon" :class="{ active: !isChecking }">
              ●
            </span>
            <span>状态: {{ isChecking ? '检查中...' : '就绪' }}</span>
          </div>
        </div>
        <button @click="checkConnection" :disabled="isChecking" class="refresh-btn">
          {{ isChecking ? '刷新中...' : '刷新状态' }}
        </button>
      </div>
    </div>

    <div v-if="isConnected" class="system-cards">
      <!-- 系统状态 -->
      <div class="card">
        <h3>系统信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">版本:</span>
            <span class="value">{{ systemStatus?.version || '未知' }}</span>
          </div>
          <div class="info-item">
            <span class="label">运行时间:</span>
            <span class="value">{{ systemStatus?.uptime ? formatUptime(systemStatus.uptime) : '未知' }}</span>
          </div>
          <div class="info-item">
            <span class="label">维度:</span>
            <span class="value">{{ systemStatus?.dimension || '默认' }}</span>
          </div>
          <div class="info-item">
            <span class="label">最大玩家数:</span>
            <span class="value">{{ systemStatus?.maxPlayers || '未知' }}</span>
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="card">
        <h3>统计信息</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ trains.length }}</div>
            <div class="stat-label">列车</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stations.length }}</div>
            <div class="stat-label">车站</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ rails.length }}</div>
            <div class="stat-label">轨道</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ lines.length }}</div>
            <div class="stat-label">线路</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 列车信息 -->
    <div v-if="isConnected && trains.length > 0" class="section">
      <h2>列车信息</h2>
      <div class="items-grid">
        <div 
          v-for="train in trains" 
          :key="train.id" 
          class="item-card"
          @click="showTrainDetails(train)"
        >
          <h4>{{ train.name || `列车 #${train.id}` }}</h4>
          <div class="item-details">
            <p><strong>状态:</strong> <span :class="getStatusClass(train.status)">{{ train.status || '未知' }}</span></p>
            <p><strong>速度:</strong> {{ train.speed?.toFixed(2) || '0.00' }} m/s</p>
            <p><strong>位置:</strong> ({{ train.position?.x?.toFixed(2) || 0 }}, {{ train.position?.y?.toFixed(2) || 0 }}, {{ train.position?.z?.toFixed(2) || 0 }})</p>
            <p v-if="train.lineId"><strong>线路:</strong> {{ train.lineId }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 车站信息 -->
    <div v-if="isConnected && stations.length > 0" class="section">
      <h2>车站信息</h2>
      <div class="items-grid">
        <div 
          v-for="station in stations" 
          :key="station.id" 
          class="item-card"
          @click="showStationDetails(station)"
        >
          <h4>{{ station.name || `车站 #${station.id}` }}</h4>
          <div class="item-details">
            <p><strong>位置:</strong> ({{ station.position?.x?.toFixed(2) || 0 }}, {{ station.position?.y?.toFixed(2) || 0 }}, {{ station.position?.z?.toFixed(2) || 0 }})</p>
            <p><strong>连接轨道:</strong> {{ station.connectedRails?.length || 0 }} 条</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 线路信息 -->
    <div v-if="isConnected && lines.length > 0" class="section">
      <h2>线路信息</h2>
      <div class="items-grid">
        <div 
          v-for="line in lines" 
          :key="line.id" 
          class="item-card"
        >
          <h4>{{ line.name || `线路 #${line.id}` }}</h4>
          <div class="item-details">
            <p><strong>车站数:</strong> {{ line.stations?.length || 0 }}</p>
            <p><strong>列车数:</strong> {{ line.trains?.length || 0 }}</p>
            <p v-if="line.color"><strong>颜色:</strong> <span :style="{ color: line.color }">{{ line.color }}</span></p>
          </div>
        </div>
      </div>
    </div>

    <!-- 如果未连接或无数据的提示 -->
    <div v-if="!isConnected" class="no-data">
      <p>未连接到MTR服务器，请确保服务器正在运行</p>
    </div>
    <div v-else-if="!trains.length && !stations.length && !lines.length" class="no-data">
      <p>暂无数据，请刷新或检查服务器状态</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useMtrApi, useMtrServerStatus } from '../composables/mtrApi'
import { usePageTitle } from '~/composables/usePageTitle'

// 设置动态页面标题和描述
usePageTitle({
  key: 'panel',
  descriptionKey: 'panel',
  defaultTitle: '系统监控面板',
  defaultDescription: '实时监控MTR地铁系统的运行状态',
  suffix: 'MTR'
})

// 使用MTR API服务
const mtrApi = useMtrApi()

// 使用服务器状态服务
const { isConnected, serverStatus, isChecking, checkConnection } = useMtrServerStatus()

// 数据存储
const systemStatus = ref<any>(null)
const trains = ref<any[]>([])
const stations = ref<any[]>([])
const rails = ref<any[]>([])
const lines = ref<any[]>([])

// 格式化运行时间
const formatUptime = (uptime: number) => {
  const seconds = Math.floor(uptime % 60)
  const minutes = Math.floor((uptime / 60) % 60)
  const hours = Math.floor((uptime / 3600) % 24)
  const days = Math.floor(uptime / 86400)
  
  return `${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`
}

// 获取状态类名
const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'running':
    case 'active':
      return 'status-running'
    case 'stopped':
    case 'inactive':
      return 'status-stopped'
    case 'maintenance':
      return 'status-maintenance'
    default:
      return 'status-unknown'
  }
}

// 显示列车详情
const showTrainDetails = (train: any) => {
  console.log('列车详情:', train)
  // 这里可以打开一个模态框显示详细信息
}

// 显示车站详情
const showStationDetails = (station: any) => {
  console.log('车站详情:', station)
  // 这里可以打开一个模态框显示详细信息
}

// 刷新所有数据
const refreshAllData = async () => {
  if (!isConnected.value) return

  try {
    // 获取系统状态
    const statusResponse = await mtrApi.getSystemStatus()
    if (statusResponse.success) {
      systemStatus.value = statusResponse.data
    }

    // 获取列车数据
    const trainsResponse = await mtrApi.getTrains()
    if (trainsResponse.success) {
      trains.value = trainsResponse.data || []
    }

    // 获取车站数据
    const stationsResponse = await mtrApi.getStations()
    if (stationsResponse.success) {
      stations.value = stationsResponse.data || []
    }

    // 获取轨道数据
    const railsResponse = await mtrApi.getRails()
    if (railsResponse.success) {
      rails.value = railsResponse.data || []
    }

    // 获取线路数据
    const linesResponse = await mtrApi.getLines()
    if (linesResponse.success) {
      lines.value = linesResponse.data || []
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

// 页面加载时检查连接并获取数据
onMounted(async () => {
  await checkConnection()
  if (isConnected.value) {
    await refreshAllData()
  }

  // 设置定时刷新（每15秒）
  const refreshInterval = setInterval(async () => {
    if (isConnected.value) {
      await refreshAllData()
    }
  }, 15000)

  // 组件卸载时清理定时器
  onUnmounted(() => {
    clearInterval(refreshInterval)
  })
})

// 当连接状态改变时更新数据
watch(isConnected, async (newConnected) => {
  if (newConnected) {
    await refreshAllData()
  } else {
    // 清空数据
    systemStatus.value = null
    trains.value = []
    stations.value = []
    rails.value = []
    lines.value = []
  }
})
</script>

<style scoped>
.mtr-panel-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

.connection-status {
  margin-bottom: 30px;
}

.status-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.status-card h2 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #34495e;
}

.status-indicators {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-icon {
  font-size: 16px;
  color: #ccc;
}

.status-icon.connected {
  color: #2ecc71;
}

.status-icon.disconnected {
  color: #e74c3c;
}

.refresh-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.refresh-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.system-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.card h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #34495e;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
}

.label {
  font-weight: bold;
  color: #7f8c8d;
}

.value {
  color: #2c3e50;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #3498db;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
  margin-top: 5px;
}

.section {
  margin-bottom: 40px;
}

.section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #3498db;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.item-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.item-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.item-card h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #3498db;
}

.item-details p {
  margin: 5px 0;
  font-size: 14px;
}

.status-running {
  color: #2ecc71;
  font-weight: bold;
}

.status-stopped {
  color: #e74c3c;
  font-weight: bold;
}

.status-maintenance {
  color: #f39c12;
  font-weight: bold;
}

.status-unknown {
  color: #95a5a6;
}

.no-data {
  text-align: center;
  padding: 40px;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #7f8c8d;
}

@media (max-width: 768px) {
  .mtr-panel-container {
    padding: 10px;
  }
  
  .status-indicators {
    flex-direction: column;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .items-grid {
    grid-template-columns: 1fr;
  }
}
</style>