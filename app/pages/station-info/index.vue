<template>
  <div class="station-info-page">

    <!-- Page Title -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">{{ getLocalizedText('stationInfoTitle') }}</h1>
        <p class="page-subtitle">{{ getLocalizedText('stationInfoDescription') }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container">
      <div class="station-info-container">
        <!-- Station List -->
        <div class="station-list">
          <div class="search-box">
            <input 
              type="text" 
              class="search-input" 
              :placeholder="getLocalizedText('searchStations')" 
              v-model="searchQuery"
            />
          </div>
          
          <div class="station-cards">
            <div 
              v-for="station in filteredStations" 
              :key="station.id"
              class="station-card"
              @click="selectStation(station)"
              :class="{ 'selected': selectedStation && selectedStation.id === station.id }"
            >
              <div class="station-header">
                <h3 class="station-name">{{ station.name[currentLanguage] || station.name['简体中文'] }}</h3>
                <div class="station-lines">
                  <span 
                    v-for="line in station.lines" 
                    :key="line" 
                    class="line-badge"
                    :style="{ backgroundColor: getLineColor(line) }"
                  >
                    {{ getLineName(line) }}
                  </span>
                </div>
              </div>
              <div class="station-details">
                <p class="station-address">
                  <strong>{{ getLocalizedText('address') }}:</strong> 
                  {{ station.address && (station.address[currentLanguage] || station.address['简体中文']) || getLocalizedText('noData') }}
                </p>
                <p class="station-features">
                  <strong>{{ getLocalizedText('features') }}:</strong> 
                  {{ station.features && (station.features[currentLanguage] || station.features['简体中文']) || getLocalizedText('noData') }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Station Detail Panel -->
        <div class="station-detail-panel" v-if="selectedStation">
          <div class="detail-header">
            <h2 class="detail-title">
              {{ selectedStation.name[currentLanguage] || selectedStation.name['简体中文'] }}
            </h2>
            <button class="close-btn" @click="selectedStation = null">×</button>
          </div>
          
          <div class="detail-content">
            <div class="detail-section">
              <h3>{{ getLocalizedText('stationLines') }}</h3>
              <div class="station-line-badges">
                <span 
                  v-for="line in selectedStation.lines" 
                  :key="line" 
                  class="line-badge detail"
                  :style="{ backgroundColor: getLineColor(line) }"
                >
                  {{ getLineName(line) }}
                </span>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>{{ getLocalizedText('stationAddress') }}</h3>
              <p>{{ selectedStation.address && (selectedStation.address[currentLanguage] || selectedStation.address['简体中文']) || getLocalizedText('noData') }}</p>
            </div>
            
            <div class="detail-section">
              <h3>{{ getLocalizedText('stationFeatures') }}</h3>
              <p>{{ selectedStation.features && (selectedStation.features[currentLanguage] || selectedStation.features['简体中文']) || getLocalizedText('noData') }}</p>
            </div>
            
            <div class="detail-section">
              <h3>{{ getLocalizedText('operatingHours') }}</h3>
              <p>{{ selectedStation.operating_hours || getLocalizedText('noData') }}</p>
            </div>
            
            <div class="detail-section">
              <h3>{{ getLocalizedText('connectedServices') }}</h3>
              <ul v-if="selectedStation.services && selectedStation.services.length > 0">
                <li v-for="(service, index) in selectedStation.services" :key="index">
                  {{ service[currentLanguage] || service['简体中文'] || getLocalizedText('noData') }}
                </li>
              </ul>
              <p v-else>{{ getLocalizedText('noData') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLanguageStore } from '~~/stores/language'
import { storeToRefs } from 'pinia'
import { usePageTitle } from '~/composables/usePageTitle'

// 设置动态页面标题和描述
usePageTitle({
  key: 'station_info',
  descriptionKey: 'station_info',
  defaultTitle: '站点信息',
  defaultDescription: '查看MTR地铁各站点的详细信息',
  suffix: 'MTR'
})

const languageStore = useLanguageStore()
const { currentLanguage } = storeToRefs(languageStore)

// Use useAsyncData with improved path handling for both server and client
const { data: configData } = await useAsyncData('config', async () => {
  try {
    if (process.server) {
      // On server-side, use a more robust approach for file access
      try {
        const fs = await import('fs')
        const path = await import('path')
        // Use a more reliable way to locate the configuration file
        const configPath = path.join(process.cwd(), 'public', 'configuration.json')
        if (fs.existsSync(configPath)) {
          const configFile = fs.readFileSync(configPath, 'utf-8')
          return JSON.parse(configFile)
        } else {
          // For Nuxt applications, public assets might be in a different location in production
          const altConfigPath = path.join(process.cwd(), '.output/public/configuration.json')
          if (fs.existsSync(altConfigPath)) {
            const configFile = fs.readFileSync(altConfigPath, 'utf-8')
            return JSON.parse(configFile)
          } else {
            console.error('Configuration file does not exist at:', configPath, 'or', altConfigPath)
            return { city_name: 'Error', color: '#0047AB' }
          }
        }
      } catch (fsError) {
        console.warn('Server-side file access failed, falling back to fetch:', fsError)
        // Fallback to fetch on server if file access fails
        try {
          const config = await $fetch('/configuration.json')
          return config
        } catch (fetchError) {
          console.error('Server fetch also failed:', fetchError)
          return { city_name: 'Error', color: '#0047AB' }
        }
      }
    } else {
      // On client-side, use fetch
      try {
        const config = await $fetch('/configuration.json')
        return config
      } catch (error) {
        console.error('Failed to load configuration:', error)
        return { city_name: 'Error', color: '#0047AB' }
      }
    }
  } catch (error) {
    console.error('Failed to load configuration:', error)
    return { city_name: 'Error', color: '#0047AB' }
  }
})

const cityName = configData.value?.city_name || 'Error'
const color = configData.value?.color || '#0047AB'

const searchQuery = ref('')
const selectedStation = ref(null)

// Get all stations from the configuration
const allStations = computed(() => {
  if (configData.value?.mtr_lines) {
    const stationsMap = new Map()
    
    configData.value.mtr_lines.forEach(line => {
      line.stations.forEach(station => {
        const stationName = station.name[languageStore.currentLanguage] || station.name['简体中文']
        
        if (!stationsMap.has(stationName)) {
          stationsMap.set(stationName, {
            id: `${line.name}-${stationName}`,
            name: station.name,
            lines: [line.name],
            address: station.address,
            features: station.features,
            operating_hours: line.operating_hours,
            services: station.services
          })
        } else {
          // If station exists, add the line to its lines array if not already present
          const existingStation = stationsMap.get(stationName)
          if (!existingStation.lines.includes(line.name)) {
            existingStation.lines.push(line.name)
          }
        }
      })
    })
    
    return Array.from(stationsMap.values())
  }
  return []
})

// Filter stations based on search query
const filteredStations = computed(() => {
  if (!searchQuery.value) {
    return allStations.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return allStations.value.filter(station => {
    const name = (station.name[languageStore.currentLanguage] || station.name['简体中文']).toLowerCase()
    return name.includes(query)
  })
})

// Function to select a station
const selectStation = (station) => {
  selectedStation.value = station
}

// Function to get line color from config
const getLineColor = (lineName) => {
  if (configData.value?.mtr_lines) {
    const line = configData.value.mtr_lines.find(l => l.name === lineName)
    if (line) {
      return line.color
    }
  }
  return '#999' // Default color
}

// Function to get line name in current language
const getLineName = (lineName) => {
  if (configData.value?.mtr_lines) {
    const line = configData.value.mtr_lines.find(l => l.name === lineName)
    if (line) {
      return line.localizedName[languageStore.currentLanguage] || line.localizedName['简体中文']
    }
  }
  return lineName
}

// Function to get localized text based on current language
const getLocalizedText = (key) => {
  const localizedText = {
    'stationInfoTitle': {
      '简体中文': '站点信息',
      '繁体中文': '站點資訊',
      'English': 'Station Information',
      '日本語': '駅情報'
    },
    'stationInfoDescription': {
      '简体中文': '查看本市各大地铁站的详细信息',
      '繁体中文': '查看本市各大地鐵站的詳細資訊',
      'English': 'View detailed information about major subway stations in the city',
      '日本語': '市の主要地下鉄駅の詳細情報を表示'
    },
    'searchStations': {
      '简体中文': '搜索站点...',
      '繁体中文': '搜索站點...',
      'English': 'Search stations...',
      '日本語': '駅を検索...'
    },
    'stationLines': {
      '简体中文': '所属线路',
      '繁体中文': '所屬路線',
      'English': 'Lines',
      '日本語': '路線'
    },
    'stationAddress': {
      '简体中文': '站点地址',
      '繁体中文': '站點地址',
      'English': 'Station Address',
      '日本語': '駅の住所'
    },
    'stationFeatures': {
      '简体中文': '站点设施',
      '繁体中文': '站點設施',
      'English': 'Station Facilities',
      '日本語': '駅の設備'
    },
    'operatingHours': {
      '简体中文': '运营时间',
      '繁体中文': '運營時間',
      'English': 'Operating Hours',
      '日本語': '営業時間'
    },
    'connectedServices': {
      '简体中文': '连接服务',
      '繁体中文': '連接服務',
      'English': 'Connected Services',
      '日本語': '接続サービス'
    },
    'address': {
      '简体中文': '地址',
      '繁体中文': '地址',
      'English': 'Address',
      '日本语': '住所'
    },
    'features': {
      '简体中文': '设施',
      '繁体中文': '設施',
      'English': 'Facilities',
      '日本語': '設備'
    },
    'noData': {
      '简体中文': '暂无数据',
      '繁体中文': '暫無數據',
      'English': 'No data available',
      '日本語': 'データがありません'
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

/* Station Info Container styles */
.station-info-container {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.station-list {
  flex: 3;
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

.station-list:hover {
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(35px) saturate(180%);
  -webkit-backdrop-filter: blur(35px) saturate(180%);
}

.search-box {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  font-size: 14px;
  background-color: rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--ios-primary);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
}

.station-cards {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.station-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: var(--ios-card-radius-small);
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: rgba(0, 0, 0, 0.02);
}

.station-card:hover {
  border-color: var(--ios-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background-color: rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.station-card.selected {
  border-color: var(--ios-primary);
  background-color: rgba(0, 122, 255, 0.08);
}

.station-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.station-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--ios-text-primary);
  margin: 0;
}

.station-lines {
  display: flex;
  gap: 6px;
}

.line-badge {
  background-color: #ccc;
  color: white;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  display: inline-block;
  min-width: 40px;
}

.line-badge.detail {
  display: inline-block;
  margin-right: 8px;
  margin-bottom: 5px;
}

.station-details p {
  margin: 5px 0;
  font-size: 13px;
  color: var(--ios-text-secondary);
}

/* Station Detail Panel styles - Liquid Glass effect */
.station-detail-panel {
  flex: 2;
  background-color: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border-radius: var(--ios-card-radius);
  padding: 22px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.12),
              inset 0 2px 2px rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(255, 255, 255, 0.3);
  height: fit-content;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: all 0.3s ease;
}

.station-detail-panel:hover {
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(35px) saturate(180%);
  -webkit-backdrop-filter: blur(35px) saturate(180%);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.detail-title {
  font-size: 20px;
  color: var(--ios-text-primary);
  margin: 0;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--ios-text-secondary);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--ios-text-primary);
}

.detail-section {
  margin-bottom: 22px;
}

.detail-section h3 {
  font-size: 16px;
  color: var(--ios-text-primary);
  margin: 0 0 10px 0;
  font-weight: 600;
}

.detail-section p {
  margin: 0 0 10px 0;
  color: var(--ios-text-primary);
  line-height: 1.5;
}

.detail-section ul {
  padding-left: 20px;
  margin: 0;
  color: var(--ios-text-primary);
  line-height: 1.5;
}

.detail-section li {
  margin-bottom: 5px;
}

.station-line-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

/* Tablet responsiveness */
@media (min-width: 481px) and (max-width: 768px) {
  .station-info-container {
    flex-direction: column;
  }
  
  .page-title {
    font-size: 22px;
  }
  
  .page-header {
    margin: 0 10px 0 10px;
  }
  
  .station-list {
    padding: 20px;
  }
  
  .station-detail-panel {
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
  
  .station-list {
    padding: 26px;
  }
  
  .station-name {
    font-size: 17px;
  }
  
  .detail-title {
    font-size: 21px;
  }
  
  .detail-section h3 {
    font-size: 17px;
  }
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .container {
    padding: 0 12px;
  }
  
  .station-info-container {
    flex-direction: column;
  }
  
  .page-title {
    font-size: 21px;
  }
  
  .page-subtitle {
    font-size: 13px;
  }
  
  .station-list {
    padding: 18px;
  }
  
  .station-detail-panel {
    padding: 20px;
  }
  
  .page-header {
    margin: 0 8px 0 8px;
  }
  
  .station-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .station-lines {
    align-self: flex-start;
  }
}
</style>