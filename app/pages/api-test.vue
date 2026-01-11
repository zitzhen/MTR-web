<!-- app/pages/api-test.vue -->
<template>
  <div class="api-test-container">
    <h1>MTR API 测试</h1>
    
    <div class="test-section">
      <h2>服务器连接测试</h2>
      <div class="test-controls">
        <input 
          v-model="serverUrl" 
          type="text" 
          placeholder="输入服务器地址，例如: http://localhost:8888"
          class="server-input"
        />
        <button @click="testConnection" :disabled="isTesting">
          {{ isTesting ? '测试中...' : '测试连接' }}
        </button>
      </div>
      
      <div v-if="connectionResult" class="result" :class="{ success: connectionResult.success, error: !connectionResult.success }">
        <h3>连接结果:</h3>
        <p><strong>状态:</strong> {{ connectionResult.success ? '成功' : '失败' }}</p>
        <p v-if="connectionResult.message"><strong>消息:</strong> {{ connectionResult.message }}</p>
        <p v-if="connectionResult.error"><strong>错误:</strong> {{ connectionResult.error }}</p>
        <div v-if="connectionResult.data">
          <strong>服务器信息:</strong>
          <pre>{{ JSON.stringify(connectionResult.data, null, 2) }}</pre>
        </div>
      </div>
    </div>
    
    <div v-if="isConnected" class="test-section">
      <h2>API 功能测试</h2>
      
      <div class="api-tests">
        <div class="test-card">
          <h3>获取列车信息</h3>
          <button @click="testTrains" :disabled="isTesting">测试</button>
          <div v-if="trainResult" class="result" :class="{ success: trainResult.success, error: !trainResult.success }">
            <p><strong>状态:</strong> {{ trainResult.success ? '成功' : '失败' }}</p>
            <p v-if="trainResult.message"><strong>消息:</strong> {{ trainResult.message }}</p>
            <p v-if="trainResult.error"><strong>错误:</strong> {{ trainResult.error }}</p>
            <div v-if="trainResult.data">
              <p><strong>列车数量:</strong> {{ Array.isArray(trainResult.data) ? trainResult.data.length : 'N/A' }}</p>
              <div v-if="Array.isArray(trainResult.data) && trainResult.data.length > 0">
                <h4>前3个列车信息:</h4>
                <div v-for="train in trainResult.data.slice(0, 3)" :key="train.id" class="data-item">
                  <p><strong>ID:</strong> {{ train.id }}</p>
                  <p><strong>名称:</strong> {{ train.name || 'N/A' }}</p>
                  <p><strong>状态:</strong> {{ train.status || 'N/A' }}</p>
                  <p><strong>速度:</strong> {{ train.speed || 0 }} m/s</p>
                  <p><strong>位置:</strong> ({{ train.position?.x || 0 }}, {{ train.position?.y || 0 }}, {{ train.position?.z || 0 }})</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="test-card">
          <h3>获取车站信息</h3>
          <button @click="testStations" :disabled="isTesting">测试</button>
          <div v-if="stationResult" class="result" :class="{ success: stationResult.success, error: !stationResult.success }">
            <p><strong>状态:</strong> {{ stationResult.success ? '成功' : '失败' }}</p>
            <p v-if="stationResult.message"><strong>消息:</strong> {{ stationResult.message }}</p>
            <p v-if="stationResult.error"><strong>错误:</strong> {{ stationResult.error }}</p>
            <div v-if="stationResult.data">
              <p><strong>车站数量:</strong> {{ Array.isArray(stationResult.data) ? stationResult.data.length : 'N/A' }}</p>
              <div v-if="Array.isArray(stationResult.data) && stationResult.data.length > 0">
                <h4>前3个车站信息:</h4>
                <div v-for="station in stationResult.data.slice(0, 3)" :key="station.id" class="data-item">
                  <p><strong>ID:</strong> {{ station.id }}</p>
                  <p><strong>名称:</strong> {{ station.name || 'N/A' }}</p>
                  <p><strong>位置:</strong> ({{ station.position?.x || 0 }}, {{ station.position?.y || 0 }}, {{ station.position?.z || 0 }})</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="test-card">
          <h3>获取轨道信息</h3>
          <button @click="testRails" :disabled="isTesting">测试</button>
          <div v-if="railResult" class="result" :class="{ success: railResult.success, error: !railResult.success }">
            <p><strong>状态:</strong> {{ railResult.success ? '成功' : '失败' }}</p>
            <p v-if="railResult.message"><strong>消息:</strong> {{ railResult.message }}</p>
            <p v-if="railResult.error"><strong>错误:</strong> {{ railResult.error }}</p>
            <div v-if="railResult.data">
              <p><strong>轨道数量:</strong> {{ Array.isArray(railResult.data) ? railResult.data.length : 'N/A' }}</p>
              <div v-if="Array.isArray(railResult.data) && railResult.data.length > 0">
                <h4>前3个轨道信息:</h4>
                <div v-for="rail in railResult.data.slice(0, 3)" :key="rail.id" class="data-item">
                  <p><strong>ID:</strong> {{ rail.id }}</p>
                  <p><strong>类型:</strong> {{ rail.type || 'N/A' }}</p>
                  <p><strong>起点:</strong> ({{ rail.x1 || 0 }}, {{ rail.y1 || 0 }}, {{ rail.z1 || 0 }})</p>
                  <p><strong>终点:</strong> ({{ rail.x2 || 0 }}, {{ rail.y2 || 0 }}, {{ rail.z2 || 0 }})</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="test-card">
          <h3>获取线路信息</h3>
          <button @click="testLines" :disabled="isTesting">测试</button>
          <div v-if="lineResult" class="result" :class="{ success: lineResult.success, error: !lineResult.success }">
            <p><strong>状态:</strong> {{ lineResult.success ? '成功' : '失败' }}</p>
            <p v-if="lineResult.message"><strong>消息:</strong> {{ lineResult.message }}</p>
            <p v-if="lineResult.error"><strong>错误:</strong> {{ lineResult.error }}</p>
            <div v-if="lineResult.data">
              <p><strong>线路数量:</strong> {{ Array.isArray(lineResult.data) ? lineResult.data.length : 'N/A' }}</p>
              <div v-if="Array.isArray(lineResult.data) && lineResult.data.length > 0">
                <h4>前3个线路信息:</h4>
                <div v-for="line in lineResult.data.slice(0, 3)" :key="line.id" class="data-item">
                  <p><strong>ID:</strong> {{ line.id }}</p>
                  <p><strong>名称:</strong> {{ line.name || 'N/A' }}</p>
                  <p><strong>颜色:</strong> {{ line.color || 'N/A' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMtrApi } from '../composables/mtrApi'

const serverUrl = ref('http://localhost:8888')
const isTesting = ref(false)
const isConnected = ref(false)

// 测试结果
const connectionResult = ref<any>(null)
const trainResult = ref<any>(null)
const stationResult = ref<any>(null)
const railResult = ref<any>(null)
const lineResult = ref<any>(null)

// 测试时使用当前输入的服务器URL
const getTestApi = () => {
  return useMtrApi(serverUrl.value)
}

// 测试连接
const testConnection = async () => {
  isTesting.value = true
  try {
    const api = getTestApi()
    const result = await api.getSystemStatus()
    connectionResult.value = result
    isConnected.value = result.success
  } catch (error: any) {
    connectionResult.value = {
      success: false,
      error: error.message || '连接测试失败',
      message: '无法连接到服务器'
    }
    isConnected.value = false
  } finally {
    isTesting.value = false
  }
}

// 测试列车API
const testTrains = async () => {
  isTesting.value = true
  try {
    const api = getTestApi()
    const result = await api.getTrains()
    trainResult.value = result
  } catch (error: any) {
    trainResult.value = {
      success: false,
      error: error.message || '获取列车信息失败',
      message: 'API调用失败'
    }
  } finally {
    isTesting.value = false
  }
}

// 测试车站API
const testStations = async () => {
  isTesting.value = true
  try {
    const api = getTestApi()
    const result = await api.getStations()
    stationResult.value = result
  } catch (error: any) {
    stationResult.value = {
      success: false,
      error: error.message || '获取车站信息失败',
      message: 'API调用失败'
    }
  } finally {
    isTesting.value = false
  }
}

// 测试轨道API
const testRails = async () => {
  isTesting.value = true
  try {
    const api = getTestApi()
    const result = await api.getRails()
    railResult.value = result
  } catch (error: any) {
    railResult.value = {
      success: false,
      error: error.message || '获取轨道信息失败',
      message: 'API调用失败'
    }
  } finally {
    isTesting.value = false
  }
}

// 测试线路API
const testLines = async () => {
  isTesting.value = true
  try {
    const api = getTestApi()
    const result = await api.getLines()
    lineResult.value = result
  } catch (error: any) {
    lineResult.value = {
      success: false,
      error: error.message || '获取线路信息失败',
      message: 'API调用失败'
    }
  } finally {
    isTesting.value = false
  }
}
</script>

<style scoped>
.api-test-container {
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

.test-section {
  margin-bottom: 40px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.test-section h2 {
  color: #34495e;
  margin-top: 0;
  margin-bottom: 20px;
}

.test-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.server-input {
  flex: 1;
  min-width: 300px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

button {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.result {
  padding: 15px;
  border-radius: 4px;
  margin-top: 15px;
}

.result.success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.result.error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.api-tests {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.test-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.test-card h3 {
  margin-top: 0;
  color: #34495e;
}

.data-item {
  background-color: #f8f9fa;
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
  border-left: 3px solid #3498db;
}

pre {
  background-color: #2d3748;
  color: #e2e8f0;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .test-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .server-input {
    min-width: auto;
  }
  
  .api-tests {
    grid-template-columns: 1fr;
  }
}
</style>