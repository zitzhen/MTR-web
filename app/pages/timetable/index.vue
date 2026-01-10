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

const currentLanguage = ref('简体中文')
const selectedLine = ref('red_line') // Default to red line

const changeLanguage = (langCode) => {
  currentLanguage.value = langCode
}

// Get MTR lines from configuration
const mtrLines = computed(() => {
  if (configData.value?.mtr_lines) {
    return configData.value.mtr_lines.map(line => ({
      name: line.name,
      localizedName: line.localizedName[currentLanguage.value] || line.localizedName['简体中文'],
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
      return line.localizedName[currentLanguage.value] || line.localizedName['简体中文']
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

/* Schedule Container styles */
.schedule-container {
  margin-top: 20px;
}

.section-title {
  font-size: 20px;
  color: var(--primary-color, #0047AB);
  margin: 0 0 15px 0;
  font-weight: bold;
}

/* Line Selection styles */
.line-selection {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.line-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.line-btn {
  padding: 8px 16px;
  border: 2px solid;
  border-radius: 20px;
  background: transparent;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.line-btn:hover {
  opacity: 0.8;
}

.line-btn.active {
  color: white;
  font-weight: bold;
}

/* Schedule Table styles */
.schedule-table-container {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  overflow-x: auto;
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
  background-color: #f0f0f0;
  position: sticky;
  left: 0;
}

.table-header > div {
  padding: 10px;
  text-align: center;
  font-weight: bold;
  border-right: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}

.table-header > div:last-child {
  border-right: none;
}

.table-row {
  display: grid;
  grid-template-columns: 150px repeat(19, 1fr);
}

.table-row.odd {
  background-color: #fafafa;
}

.table-row > div {
  padding: 8px;
  text-align: center;
  border-right: 1px solid #eee;
  border-bottom: 1px solid #eee;
  position: relative;
}

.table-row > div:last-child {
  border-right: none;
}

.station-cell {
  font-weight: bold;
  background-color: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
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

/* Peak Hours Info styles */
.peak-hours-info {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.peak-hours-info h3 {
  color: var(--primary-color, #0047AB);
  margin-bottom: 10px;
}

.peak-hours-content p {
  margin: 8px 0;
  color: #555;
  line-height: 1.5;
}

/* Tablet responsiveness */
@media (min-width: 481px) and (max-width: 768px) {
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
  
  .section-title {
    font-size: 22px;
  }
  
  .line-btn {
    font-size: 15px;
    padding: 10px 20px;
  }
  
  .schedule-table-container, .line-selection, .peak-hours-info {
    padding: 25px;
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
  
  .page-title {
    font-size: 20px;
  }
  
  .page-subtitle {
    font-size: 13px;
  }
  
  .section-title {
    font-size: 18px;
  }
  
  .line-selection, .schedule-table-container, .peak-hours-info {
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