<template>
  <div class="map-page">
    <!-- Navigation Bar -->
    <nav class="navbar">
      <div class="nav-container">
        <NuxtLink to="/" class="nav-logo">
          <h1 class="nav-title">{{ cityName }}交通局</h1>
        </NuxtLink>
        <div class="nav-menu" :class="{ active: isMobileMenuOpen }">
          <NuxtLink to="/" class="nav-link">首页</NuxtLink>
          <NuxtLink to="/map" class="nav-link active">地铁线路</NuxtLink>
          <NuxtLink to="#" class="nav-link">站点信息</NuxtLink>
          <NuxtLink to="#" class="nav-link">时刻表</NuxtLink>
          <NuxtLink to="#" class="nav-link">票务信息</NuxtLink>
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
            <div class="line line-red">
              <div class="line-name">{{ getLocalizedText('redLine') }}</div>
              <div class="stations">
                <div class="station" v-for="(station, index) in redLineStations" :key="'red-'+index">
                  <div class="station-dot"></div>
                  <div class="station-name">{{ station }}</div>
                </div>
              </div>
            </div>
            
            <div class="line line-blue">
              <div class="line-name">{{ getLocalizedText('blueLine') }}</div>
              <div class="stations">
                <div class="station" v-for="(station, index) in blueLineStations" :key="'blue-'+index">
                  <div class="station-dot"></div>
                  <div class="station-name">{{ station }}</div>
                </div>
              </div>
            </div>
            
            <div class="line line-green">
              <div class="line-name">{{ getLocalizedText('greenLine') }}</div>
              <div class="stations">
                <div class="station" v-for="(station, index) in greenLineStations" :key="'green-'+index">
                  <div class="station-dot"></div>
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
import { ref } from 'vue'

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

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const changeLanguage = (langCode) => {
  currentLanguage.value = langCode
}

// MTR lines data
const redLineStations = ref([
  '北站', '中央站', '东站', '机场站', '南站'
])
const blueLineStations = ref([
  '西站', '中央站', '科技园', '大学站', '会展站'
])
const greenLineStations = ref([
  '中央站', '公园站', '文化中心', '体育中心', '动物园'
])

// All lines information
const mtrLines = ref([
  {
    name: 'redLine',
    localizedName: '红色线',
    color: '#e74c3c',
    stations: redLineStations.value,
    operatingHours: '05:30 - 23:30'
  },
  {
    name: 'blueLine',
    localizedName: '蓝色线',
    color: '#3498db',
    stations: blueLineStations.value,
    operatingHours: '05:45 - 23:45'
  },
  {
    name: 'greenLine',
    localizedName: '绿色线',
    color: '#2ecc71',
    stations: greenLineStations.value,
    operatingHours: '06:00 - 23:30'
  }
])

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
    'redLine': {
      '简体中文': '红色线',
      '繁体中文': '紅色線',
      'English': 'Red Line',
      '日本語': '赤線'
    },
    'blueLine': {
      '简体中文': '蓝色线',
      '繁体中文': '藍色線',
      'English': 'Blue Line',
      '日本語': '青線'
    },
    'greenLine': {
      '简体中文': '绿色线',
      '繁体中文': '綠色線',
      'English': 'Green Line',
      '日本語': '緑線'
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

/* Map Container styles */
.map-container {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.map-visualization {
  flex: 3;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  min-height: 500px;
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
}

.line-red {
  top: 20%;
  left: 10%;
  width: 80%;
}

.line-blue {
  top: 45%;
  left: 10%;
  width: 80%;
}

.line-green {
  top: 70%;
  left: 10%;
  width: 80%;
}

.line-name {
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--primary-color, #0047AB);
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

/* Info Panel styles */
.info-panel {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.line-info {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
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
  color: var(--primary-color, #0047AB);
}

.line-details p {
  font-size: 13px;
  color: #666;
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
  
  .map-visualization {
    padding: 30px;
  }
  
  .line-name {
    font-size: 18px;
  }
  
  .station-name {
    font-size: 14px;
  }
  
  .line-details h3 {
    font-size: 18px;
  }
  
  .line-details p {
    font-size: 14px;
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
  
  .map-container {
    flex-direction: column;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .page-subtitle {
    font-size: 13px;
  }
  
  .map-visualization {
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
}
</style>