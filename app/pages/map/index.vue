<template>
  <div class="map-page">

    <!-- Page Title -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">{{ getLocalizedText('subwayMap') }}</h1>
        <p class="page-subtitle">{{ getLocalizedText('mapDescription') }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container">
      <div class="map-container">
        <!-- Map Visualization -->
        <div class="map-visualization">
          <div class="map-area">
            <!-- MTR Lines representation -->
            <div 
              v-for="line in mtrLines" 
              :key="line.name" 
              :class="['line', 'line-' + line.name.replace('_line', '')]" 
              :style="{ top: getLinePosition(line.name) }"
            >
              <div class="line-name">{{ line.localizedName }}</div>
              <div class="stations">
                <div class="station" v-for="(station, index) in getLineStations(line.name)" :key="`${line.name}-${index}`">
                  <div class="station-dot" :style="{ backgroundColor: line.color, boxShadow: `0 0 0 2px ${line.color}` }"></div>
                  <div class="station-name">{{ station }}</div>
                </div>
              </div>
            </div>
            
            <div class="interchange-station">
              <div class="station-dot interchange"></div>
              <div class="station-name">{{ getLocalizedText('centralStation') }}</div>
            </div>
          </div>
        </div>
        
        <!-- Line Information Panel -->
        <div class="info-panel">
          <div class="line-info" v-for="line in mtrLines" :key="line.name">
            <div class="line-color" :style="{ backgroundColor: line.color }"></div>
            <div class="line-details">
              <h3>{{ line.localizedName }}</h3>
              <p>{{ getLocalizedText('stationsCount') }}: {{ line.stations.length }}</p>
              <p>{{ getLocalizedText('operatingHours') }}: {{ line.operatingHours }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLanguageStore } from '~~/stores/language'
import { storeToRefs } from 'pinia'
import { usePageTitle } from '~/composables/usePageTitle'

// 设置动态页面标题和描述
usePageTitle({
  key: 'map',
  descriptionKey: 'map',
  defaultTitle: '地铁线路图',
  defaultDescription: '查看并探索MTR的所有地铁线路和站点地图',
  suffix: 'MTR'
})

const languageStore = useLanguageStore()
const { currentLanguage } = storeToRefs(languageStore)

// Use useAsyncData with correct path handling for server-side
const { data: configData } = await useAsyncData('config', async () => {
  try {
    // For server-side, we need to fetch from the public directory directly
    if (process.server) {
      // Running on server - access file directly
      const fs = await import('fs')
      const path = await import('path')
      const configPath = path.resolve(process.cwd(), 'public', 'configuration.json')
      if (fs.existsSync(configPath)) {
        const configFile = fs.readFileSync(configPath, 'utf-8')
        return JSON.parse(configFile)
      } else {
        console.error('Configuration file does not exist at:', configPath)
        return { city_name: 'Error', color: '#0047AB' }
      }
    } else {
      // Running on client - use $fetch
      const config = await $fetch('/configuration.json')
      return config
    }
  } catch (error) {
    console.error('Failed to load configuration:', error)
    return { city_name: 'Error', color: '#0047AB' }
  }
})

const cityName = configData.value?.city_name || 'Error'
const color = configData.value?.color || '#0047AB'

// Function to get line position based on its index
const getLinePosition = (lineName) => {
  const lineOrder = ['red_line', 'blue_line', 'green_line'];
  const index = lineOrder.indexOf(lineName);
  if (index === -1) return '20%';
  
  // Calculate position: red_line at 20%, blue_line at 45%, green_line at 70%
  const positions = ['20%', '45%', '70%'];
  return positions[index] || '20%';
};

// Function to get stations for a specific line
const getLineStations = (lineName) => {
  switch(lineName) {
    case 'red_line':
      return redLineStations.value;
    case 'blue_line':
      return blueLineStations.value;
    case 'green_line':
      return greenLineStations.value;
    default:
      return [];
  }
};

// Get MTR lines data from configuration
const mtrLines = computed(() => {
  if (configData.value?.mtr_lines) {
    return configData.value.mtr_lines.map(line => ({
      name: line.name,
      localizedName: line.localizedName[languageStore.currentLanguage] || line.localizedName['简体中文'],
      color: line.color,
      stations: line.stations,
      operatingHours: line.operating_hours
    }))
  }
  return []
})

// Get stations for each line based on current language
const redLineStations = computed(() => {
  const line = mtrLines.value.find(l => l.name === 'red_line')
  if (line) {
    return line.stations.map(station => station.name[languageStore.currentLanguage] || station.name['简体中文'])
  }
  return []
})

const blueLineStations = computed(() => {
  const line = mtrLines.value.find(l => l.name === 'blue_line')
  if (line) {
    return line.stations.map(station => station.name[languageStore.currentLanguage] || station.name['简体中文'])
  }
  return []
})

const greenLineStations = computed(() => {
  const line = mtrLines.value.find(l => l.name === 'green_line')
  if (line) {
    return line.stations.map(station => station.name[languageStore.currentLanguage] || station.name['简体中文'])
  }
  return []
})

// Function to get localized text based on current language
const getLocalizedText = (key) => {
  const localizedText = {
    'subwayMap': {
      '简体中文': '地铁线路图',
      '繁体中文': '地鐵路線圖',
      'English': 'Subway Map',
      '日本語': '地下鉄路線図'
    },
    'mapDescription': {
      '简体中文': '查看并探索本市的所有地铁线路和站点',
      '繁体中文': '查看並探索本市的所有地鐵路線和站點',
      'English': 'View and explore all subway lines and stations in the city',
      '日本語': '市のすべての地下鉄路線と駅を表示・探索'
    },

    'centralStation': {
      '简体中文': '中央站',
      '繁体中文': '中央站',
      'English': 'Central Station',
      '日本語': 'セントラル駅'
    },
    'stationsCount': {
      '简体中文': '站点数',
      '繁体中文': '站點數',
      'English': 'Stations',
      '日本語': '駅数'
    },
    'operatingHours': {
      '简体中文': '运营时间',
      '繁体中文': '運營時間',
      'English': 'Operating Hours',
      '日本語': '営業時間'
    }
  }
  
  return localizedText[key] && localizedText[key][languageStore.currentLanguage] 
    ? localizedText[key][languageStore.currentLanguage] 
    : localizedText[key] && localizedText[key]['简体中文'] 
      ? localizedText[key]['简体中文'] 
      : key
}
</script>

<style>
/* Reset and base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
}

/* Page Header styles - Liquid Glass effect */
.page-header {
  background-color: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  padding: 20px 0;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 0 0 24px 24px;
  margin: 0 15px 0 15px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.12),
              inset 0 2px 2px rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.page-header:hover {
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(35px) saturate(180%);
  -webkit-backdrop-filter: blur(35px) saturate(180%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 24px;
  color: var(--ios-text-primary);
  margin: 0 0 5px 0;
  font-weight: 600;
}

.page-subtitle {
  font-size: 14px;
  color: var(--ios-text-secondary);
  margin: 0;
}

/* Map Container styles */
.map-container {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.map-visualization {
  flex: 3;
  background-color: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border-radius: var(--ios-card-radius);
  padding: 22px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.12),
              inset 0 2px 2px rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(255, 255, 255, 0.3);
  min-height: 500px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: all 0.3s ease;
}

.map-visualization:hover {
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(35px) saturate(180%);
  -webkit-backdrop-filter: blur(35px) saturate(180%);
}

.map-area {
  position: relative;
  height: 100%;
  min-height: 460px;
}

/* Line styles */
.line {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  left: 10%;
  width: 80%;
}

.line-red_line {
  top: 20%;
}

.line-blue_line {
  top: 45%;
}

.line-green_line {
  top: 70%;
}

.line-name {
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--ios-text-primary);
}

.stations {
  display: flex;
  justify-content: space-between;
  width: 100%;
  position: relative;
}

.station {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.station-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #3498db;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #3498db;
  margin-bottom: 5px;
  z-index: 2;
}

.station-dot.interchange {
  background-color: #e67e22;
  box-shadow: 0 0 0 2px #e67e22;
  width: 20px;
  height: 20px;
}

.station-name {
  font-size: 12px;
  text-align: center;
  max-width: 60px;
  word-wrap: break-word;
}

.line-red .station-dot {
  background-color: #e74c3c;
  box-shadow: 0 0 0 2px #e74c3c;
}

.line-blue .station-dot {
  background-color: #3498db;
  box-shadow: 0 0 0 2px #3498db;
}

.line-green .station-dot {
  background-color: #2ecc71;
  box-shadow: 0 0 0 2px #2ecc71;
}

/* Info Panel styles - Liquid Glass effect */
.info-panel {
  flex: 1;
  background-color: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border-radius: var(--ios-card-radius);
  padding: 22px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.12),
              inset 0 2px 2px rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: all 0.3s ease;
}

.info-panel:hover {
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(35px) saturate(180%);
  -webkit-backdrop-filter: blur(35px) saturate(180%);
}

.line-info {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.line-info:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.line-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 10px;
  flex-shrink: 0;
  margin-top: 5px;
}

.line-details h3 {
  font-size: 16px;
  margin: 0 0 5px 0;
  color: var(--ios-text-primary);
  font-weight: 600;
}

.line-details p {
  font-size: 13px;
  color: var(--ios-text-secondary);
  margin: 3px 0;
}

/* Tablet responsiveness */
@media (min-width: 481px) and (max-width: 768px) {
  .map-container {
    flex-direction: column;
  }
  
  .page-title {
    font-size: 22px;
  }
  
  .page-header {
    margin: 0 10px 0 10px;
  }
  
  .map-visualization {
    padding: 20px;
  }
  
  .info-panel {
    padding: 20px;
  }
}

/* PC responsiveness */
@media (min-width: 769px) {
  .page-title {
    font-size: 26px;
  }
  
  .page-subtitle {
    font-size: 15px;
  }
  
  .map-visualization {
    padding: 28px;
  }
  
  .line-name {
    font-size: 18px;
  }
  
  .station-name {
    font-size: 14px;
  }
  
  .line-details h3 {
    font-size: 17px;
  }
  
  .line-details p {
    font-size: 14px;
  }
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .container {
    padding: 0 12px;
  }
  
  .map-container {
    flex-direction: column;
  }
  
  .page-title {
    font-size: 21px;
  }
  
  .page-subtitle {
    font-size: 13px;
  }
  
  .map-visualization {
    padding: 18px;
  }
  
  .info-panel {
    padding: 18px;
  }
  
  .page-header {
    margin: 0 8px 0 8px;
  }
}
</style>