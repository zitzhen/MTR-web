<template>
  <div class="station-info-page">
    <!-- Navigation Bar -->
    <nav class="navbar">
      <div class="nav-container">
        <NuxtLink to="/" class="nav-logo">
          <h1 class="nav-title">{{ cityName }}交通局</h1>
        </NuxtLink>
        <div class="nav-menu" :class="{ active: isMobileMenuOpen }">
          <NuxtLink to="/" class="nav-link">首页</NuxtLink>
          <NuxtLink to="/map" class="nav-link">地铁线路</NuxtLink>
          <NuxtLink to="/station-info" class="nav-link active">站点信息</NuxtLink>
          <NuxtLink to="/timetable" class="nav-link">时刻表</NuxtLink>
        </div>
        <div class="nav-right">
          <div class="language-selector">
            <select class="lang-dropdown" v-model="currentLanguage" @change="changeLanguage(currentLanguage)">
              <option value="简体中文">
                🇨🇳 简体中文
              </option>
              <option value="繁体中文">
                🇭🇰 繁体中文
              </option>
              <option value="English">
                English
              </option>
              <option value="日本語">
                日本語
              </option>
            </select>
          </div>
          <div class="mobile-menu-toggle" @click="toggleMobileMenu">
            <span class="hamburger"></span>
            <span class="hamburger"></span>
            <span class="hamburger"></span>
          </div>
        </div>
      </div>
    </nav>

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

const isMobileMenuOpen = ref(false)
const currentLanguage = ref('简体中文')
const searchQuery = ref('')
const selectedStation = ref(null)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const changeLanguage = (langCode) => {
  currentLanguage.value = langCode
  // Reset selected station when language changes to refresh text
  if (selectedStation.value) {
    const stationId = selectedStation.value.id
    selectedStation.value = null
    // Small delay to allow the UI to update before re-selecting
    setTimeout(() => {
      const station = allStations.value.find(s => s.id === stationId)
      if (station) {
        selectedStation.value = station
      }
    }, 0)
  }
}

// Get all stations from the configuration
const allStations = computed(() => {
  if (configData.value?.mtr_lines) {
    const stationsMap = new Map()
    
    configData.value.mtr_lines.forEach(line => {
      line.stations.forEach(station => {
        const stationName = station.name[currentLanguage.value] || station.name['简体中文']
        
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
    const name = (station.name[currentLanguage.value] || station.name['简体中文']).toLowerCase()
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
      return line.localizedName[currentLanguage.value] || line.localizedName['简体中文']
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
  
  return localizedText[key] && localizedText[key][currentLanguage.value] 
    ? localizedText[key][currentLanguage.value] 
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

/* Navigation Bar styles */
.navbar {
  background-color: var(--primary-color, #0047AB); /* Dynamic primary color from config with fallback */
  color: white;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.nav-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  color: white;
}

.nav-menu {
  display: flex;
  gap: 25px;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover, .nav-link.active {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* Language selector styles */
.language-selector {
  display: flex;
  align-items: center;
}

.lang-dropdown {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 5px 10px;
  font-size: 12px;
  border-radius: 12px;
  cursor: pointer;
  outline: none;
  appearance: none; /* Remove default dropdown arrow */
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 12px;
  padding-right: 25px;
  min-width: 100px;
}

.lang-dropdown:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

.lang-dropdown option {
  color: #333;
  background-color: white;
}

/* Mobile menu toggle */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  padding: 5px;
}

.hamburger {
  width: 25px;
  height: 3px;
  background-color: white;
  margin: 3px 0;
  transition: 0.3s;
}

/* Page Header styles */
.page-header {
  background-color: white;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 24px;
  color: var(--primary-color, #0047AB);
  margin: 0 0 5px 0;
  font-weight: bold;
}

.page-subtitle {
  font-size: 14px;
  color: #666;
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
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.search-box {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.station-cards {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.station-card {
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.station-card:hover {
  border-color: var(--primary-color, #0047AB);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.station-card.selected {
  border-color: var(--primary-color, #0047AB);
  background-color: rgba(0, 71, 171, 0.05);
}

.station-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.station-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.station-lines {
  display: flex;
  gap: 5px;
}

.line-badge {
  background-color: #ccc;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.line-badge.detail {
  display: inline-block;
  margin-right: 8px;
  margin-bottom: 5px;
}

.station-details p {
  margin: 5px 0;
  font-size: 13px;
  color: #666;
}

/* Station Detail Panel styles */
.station-detail-panel {
  flex: 2;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  height: fit-content;
  max-height: 80vh;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.detail-title {
  font-size: 20px;
  color: var(--primary-color, #0047AB);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h3 {
  font-size: 16px;
  color: var(--primary-color, #0047AB);
  margin: 0 0 10px 0;
  font-weight: bold;
}

.detail-section p {
  margin: 0 0 10px 0;
  color: #555;
  line-height: 1.5;
}

.detail-section ul {
  padding-left: 20px;
  margin: 0;
  color: #555;
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
  
  .nav-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .nav-menu {
    display: none;
    width: 100%;
    flex-direction: column;
    background-color: var(--primary-color, #0047AB);
    padding: 10px 0;
    border-radius: 4px;
  }
  
  .nav-menu.active {
    display: flex;
  }
  
  .nav-link {
    padding: 10px 20px;
    width: 100%;
  }
  
  .nav-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .mobile-menu-toggle {
    display: flex;
  }
}

/* PC responsiveness */
@media (min-width: 769px) {
  .nav-container {
    padding: 15px 30px;
  }
  
  .nav-title {
    font-size: 20px;
  }
  
  .nav-menu {
    gap: 30px;
  }
  
  .nav-link {
    font-size: 15px;
    padding: 10px 15px;
  }
  
  .lang-dropdown {
    font-size: 14px;
    padding: 6px 12px;
    min-width: 120px;
    background-size: 14px;
    padding-right: 30px;
  }
  
  .lang-dropdown option {
    color: #333;
    font-size: 14px;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .page-subtitle {
    font-size: 16px;
  }
  
  .station-list {
    padding: 25px;
  }
  
  .station-name {
    font-size: 18px;
  }
  
  .detail-title {
    font-size: 22px;
  }
  
  .detail-section h3 {
    font-size: 18px;
  }
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .container {
    padding: 0 15px;
  }
  
  .nav-title {
    font-size: 16px;
  }
  
  .station-info-container {
    flex-direction: column;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .page-subtitle {
    font-size: 13px;
  }
  
  .station-list {
    padding: 15px;
  }
  
  .nav-container {
    padding: 10px 15px;
    gap: 10px;
  }
  
  .nav-link {
    font-size: 14px;
    padding: 8px 12px;
  }
  
  .lang-dropdown {
    font-size: 14px;
    padding: 6px 12px;
    min-width: 110px;
    background-size: 12px;
    padding-right: 28px;
  }
  
  .lang-dropdown option {
    color: #333;
    font-size: 14px;
  }
  
  .mobile-menu-toggle {
    display: flex;
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