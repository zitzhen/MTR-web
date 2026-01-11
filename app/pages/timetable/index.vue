<template>
  <div class="schedule-page">

    <!-- Page Title -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">{{ getLocalizedText('scheduleTitle') }}</h1>
        <p class="page-subtitle">{{ getLocalizedText('scheduleDescription') }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container">
      <div class="schedule-container">
        <!-- Line Selection -->
        <div class="line-selection">
          <h2 class="section-title">{{ getLocalizedText('selectLine') }}</h2>
          <div class="line-buttons">
            <button 
              v-for="line in mtrLines" 
              :key="line.name"
              :class="['line-btn', { active: selectedLine === line.name }]"
              :style="{ backgroundColor: selectedLine === line.name ? line.color : 'transparent', borderColor: line.color }"
              @click="selectLine(line.name)"
            >
              {{ line.localizedName }}
            </button>
          </div>
        </div>

        <!-- Schedule Table -->
        <div class="schedule-table-container">
          <h2 class="section-title">
            {{ getLocalizedText('scheduleFor') }} 
            <span :style="{ color: selectedLineColor }">{{ selectedLineName }}</span>
          </h2>
          
          <div class="schedule-legend">
            <div class="legend-item">
              <div class="legend-color" :style="{ backgroundColor: getLineColor('red_line') }"></div>
              <span>{{ getLineName('red_line') }}</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" :style="{ backgroundColor: getLineColor('blue_line') }"></div>
              <span>{{ getLineName('blue_line') }}</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" :style="{ backgroundColor: getLineColor('green_line') }"></div>
              <span>{{ getLineName('green_line') }}</span>
            </div>
          </div>
          
          <div class="schedule-table">
            <div class="table-header">
              <div class="time-column">{{ getLocalizedText('station') }}</div>
              <div class="time-column">05:00</div>
              <div class="time-column">06:00</div>
              <div class="time-column">07:00</div>
              <div class="time-column">08:00</div>
              <div class="time-column">09:00</div>
              <div class="time-column">10:00</div>
              <div class="time-column">11:00</div>
              <div class="time-column">12:00</div>
              <div class="time-column">13:00</div>
              <div class="time-column">14:00</div>
              <div class="time-column">15:00</div>
              <div class="time-column">16:00</div>
              <div class="time-column">17:00</div>
              <div class="time-column">18:00</div>
              <div class="time-column">19:00</div>
              <div class="time-column">20:00</div>
              <div class="time-column">21:00</div>
              <div class="time-column">22:00</div>
              <div class="time-column">23:00</div>
            </div>
            
            <div 
              v-for="(station, index) in getCurrentLineStations" 
              :key="station.name[currentLanguage] || station.name['简体中文']"
              :class="['table-row', { odd: index % 2 === 0 }]"
            >
              <div class="station-cell">
                {{ station.name[currentLanguage] || station.name['简体中文'] }}
              </div>
              <div 
                v-for="hour in 19" 
                :key="hour"
                class="time-cell"
                :class="getRandomScheduleClass()"
              ></div>
            </div>
          </div>
        </div>

        <!-- Peak Hours Info -->
        <div class="peak-hours-info">
          <h3>{{ getLocalizedText('peakHours') }}</h3>
          <div class="peak-hours-content">
            <p><strong>{{ getLocalizedText('morningPeak') }}:</strong> {{ getLocalizedText('morningPeakTime') }}</p>
            <p><strong>{{ getLocalizedText('eveningPeak') }}:</strong> {{ getLocalizedText('eveningPeakTime') }}</p>
            <p>{{ getLocalizedText('frequency') }}: {{ selectedLine ? getLineFrequency(selectedLine) : '5-8' }} {{ getLocalizedText('minutes') }}</p>
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

// 设置动态页面标题
usePageTitle({
  key: 'timetable',
  defaultTitle: '时刻表',
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

const selectedLine = ref('red_line') // Default to red line

// Get MTR lines from configuration
const mtrLines = computed(() => {
  if (configData.value?.mtr_lines) {
    return configData.value.mtr_lines.map(line => ({
      name: line.name,
      localizedName: line.localizedName[languageStore.currentLanguage] || line.localizedName['简体中文'],
      color: line.color
    }))
  }
  return []
})

// Get stations for the currently selected line
const getCurrentLineStations = computed(() => {
  if (configData.value?.mtr_lines && selectedLine.value) {
    const line = configData.value.mtr_lines.find(l => l.name === selectedLine.value)
    if (line) {
      return line.stations
    }
  }
  return []
})

// Function to select a line
const selectLine = (lineName) => {
  selectedLine.value = lineName
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

// Function to get selected line name in current language
const selectedLineName = computed(() => {
  return getLineName(selectedLine.value)
})

// Function to get selected line color
const selectedLineColor = computed(() => {
  return getLineColor(selectedLine.value)
})

// Function to get line frequency
const getLineFrequency = (lineName) => {
  if (configData.value?.mtr_lines) {
    const line = configData.value.mtr_lines.find(l => l.name === lineName)
    if (line) {
      // Return a frequency based on the line, in a real app this would come from config
      switch(lineName) {
        case 'red_line': return '4-6'
        case 'blue_line': return '5-7'
        case 'green_line': return '6-8'
        default: return '5-8'
      }
    }
  }
  return '5-8'
}

// Function to get random schedule class for demo purposes
const getRandomScheduleClass = () => {
  // Randomly assign classes for demo purposes to simulate actual schedule data
  const classes = ['', 'train', 'delayed']
  const randomIndex = Math.floor(Math.random() * 5) // 20% chance of showing a train
  return randomIndex === 0 ? 'train' : ''
}

// Function to get localized text based on current language
const getLocalizedText = (key) => {
  const localizedText = {
    'scheduleTitle': {
      '简体中文': '时刻表',
      '繁体中文': '時刻表',
      'English': 'Schedule',
      '日本語': '時刻表'
    },
    'scheduleDescription': {
      '简体中文': '查看本市地铁各线路的运营时刻表',
      '繁体中文': '查看本市地鐵各路線的營運時刻表',
      'English': 'View operation schedules for subway lines in the city',
      '日本語': '市の地下鉄各路線の運行時刻表を表示'
    },
    'selectLine': {
      '简体中文': '选择线路',
      '繁体中文': '選擇路線',
      'English': 'Select Line',
      '日本語': '路線選択'
    },
    'scheduleFor': {
      '简体中文': '时刻表 - ',
      '繁体中文': '時刻表 - ',
      'English': 'Schedule for - ',
      '日本語': '時刻表 - '
    },
    'station': {
      '简体中文': '站点',
      '繁体中文': '站點',
      'English': 'Station',
      '日本語': '駅'
    },
    'peakHours': {
      '简体中文': '高峰时段',
      '繁体中文': '高峰時段',
      'English': 'Peak Hours',
      '日本語': 'ラッシュアワー'
    },
    'morningPeak': {
      '简体中文': '早高峰',
      '繁体中文': '早高峰',
      'English': 'Morning Rush',
      '日本語': '朝ラッシュ'
    },
    'eveningPeak': {
      '简体中文': '晚高峰',
      '繁体中文': '晚高峰',
      'English': 'Evening Rush',
      '日本語': '夜ラッシュ'
    },
    'morningPeakTime': {
      '简体中文': '07:30 - 09:00',
      '繁体中文': '07:30 - 09:00',
      'English': '07:30 - 09:00',
      '日本語': '07:30 - 09:00'
    },
    'eveningPeakTime': {
      '简体中文': '17:30 - 19:00',
      '繁体中文': '17:30 - 19:00',
      'English': '17:30 - 19:00',
      '日本語': '17:30 - 19:00'
    },
    'frequency': {
      '简体中文': '发车间隔',
      '繁体中文': '發車間隔',
      'English': 'Frequency',
      '日本語': '運行間隔'
    },
    'minutes': {
      '简体中文': '分钟',
      '繁体中文': '分鐘',
      'English': 'minutes',
      '日本語': '分'
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

/* Schedule Container styles */
.schedule-container {
  margin-top: 20px;
}

.section-title {
  font-size: 20px;
  color: var(--ios-text-primary);
  margin: 0 0 15px 0;
  font-weight: 600;
}

/* Line Selection styles - Liquid Glass effect */
.line-selection {
  background-color: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border-radius: var(--ios-card-radius);
  padding: 22px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.12),
              inset 0 2px 2px rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(255, 255, 255, 0.3);
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: all 0.3s ease;
}

.line-selection:hover {
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(35px) saturate(180%);
  -webkit-backdrop-filter: blur(35px) saturate(180%);
}

.line-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.line-btn {
  padding: 8px 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  background: transparent;
  color: var(--ios-text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.line-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.line-btn.active {
  background-color: var(--ios-primary);
  color: white;
  border-color: var(--ios-primary);
  font-weight: 500;
}

/* Schedule Table styles - Liquid Glass effect */
.schedule-table-container {
  background-color: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border-radius: var(--ios-card-radius);
  padding: 22px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.12),
              inset 0 2px 2px rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(255, 255, 255, 0.3);
  margin-bottom: 20px;
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: all 0.3s ease;
}

.schedule-table-container:hover {
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(35px) saturate(180%);
  -webkit-backdrop-filter: blur(35px) saturate(180%);
}

.schedule-legend {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.table-header {
  display: grid;
  grid-template-columns: 150px repeat(19, 1fr);
  background-color: rgba(0, 0, 0, 0.03);
  position: sticky;
  left: 0;
}

.table-header > div {
  padding: 10px;
  text-align: center;
  font-weight: 600;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  color: var(--ios-text-primary);
}

.table-header > div:last-child {
  border-right: none;
}

.table-row {
  display: grid;
  grid-template-columns: 150px repeat(19, 1fr);
}

.table-row.odd {
  background-color: rgba(0, 0, 0, 0.02);
}

.table-row > div {
  padding: 8px;
  text-align: center;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  color: var(--ios-text-secondary);
}

.table-row > div:last-child {
  border-right: none;
}

.station-cell {
  font-weight: 600;
  background-color: rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--ios-text-primary);
}

.time-cell {
  position: relative;
}

.time-cell.train::before {
  content: "🚇";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
}

.time-cell.delayed::after {
  content: "⚠️";
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 10px;
}

/* Peak Hours Info styles - Liquid Glass effect */
.peak-hours-info {
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

.peak-hours-info:hover {
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(35px) saturate(180%);
  -webkit-backdrop-filter: blur(35px) saturate(180%);
}

.peak-hours-info h3 {
  color: var(--ios-text-primary);
  margin-bottom: 10px;
  font-weight: 600;
}

.peak-hours-content p {
  margin: 8px 0;
  color: var(--ios-text-primary);
  line-height: 1.5;
}

/* Tablet responsiveness */
@media (min-width: 481px) and (max-width: 768px) {
  .page-title {
    font-size: 22px;
  }
  
  .page-header {
    margin: 0 10px 0 10px;
  }
  
  .line-selection {
    padding: 20px;
  }
  
  .schedule-table-container {
    padding: 20px;
  }
  
  .peak-hours-info {
    padding: 20px;
  }
  
  .table-header, .table-row {
    grid-template-columns: 120px repeat(19, 30px);
  }
  
  .station-cell {
    padding: 5px;
    font-size: 11px;
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
  
  .section-title {
    font-size: 21px;
  }
  
  .line-btn {
    font-size: 14px;
    padding: 9px 18px;
  }
  
  .line-selection {
    padding: 24px;
  }
  
  .schedule-table-container {
    padding: 24px;
  }
  
  .peak-hours-info {
    padding: 24px;
  }
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .container {
    padding: 0 12px;
  }
  
  .page-title {
    font-size: 21px;
  }
  
  .page-subtitle {
    font-size: 13px;
  }
  
  .section-title {
    font-size: 19px;
  }
  
  .line-selection {
    padding: 18px;
  }
  
  .schedule-table-container {
    padding: 18px;
  }
  
  .peak-hours-info {
    padding: 18px;
  }
  
  .page-header {
    margin: 0 8px 0 8px;
  }
  
  .line-buttons {
    justify-content: center;
  }
  
  .table-header, .table-row {
    grid-template-columns: 100px repeat(19, 25px);
  }
  
  .station-cell {
    font-size: 10px;
    padding: 3px;
  }
  
  .table-header > div, .table-row > div {
    padding: 5px 2px;
  }
}
</style>