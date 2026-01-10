<template>
    <!-- Navigation Bar -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-logo">
          <h1 class="nav-title">{{ getLocalizedText('transportationBureau') }}</h1>
        </div>
        <div class="nav-menu" :class="{ active: isMobileMenuOpen }">
          <a href="#" class="nav-link">{{ getLocalizedText('home') }}</a>
          <a href="#" class="nav-link">{{ getLocalizedText('subwayLines') }}</a>
          <a href="#" class="nav-link">{{ getLocalizedText('stationInfo') }}</a>
          <a href="#" class="nav-link">{{ getLocalizedText('schedule') }}</a>
          <a href="#" class="nav-link">{{ getLocalizedText('ticketInfo') }}</a>
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

    <!-- Top Card with Logo and City Name -->
    <div class="top-card">
      <div class="top-card-content">
        <div class="logo-container">
          <img src="/LOGO.jpg" alt="Logo" class="logo-image" />
        </div>
        <div class="title-container">
          <h2 class="card-title">{{ getLocalizedText('transportationBureau') }}</h2>
          <p class="card-subtitle">{{ getLocalizedText('transportationBureau') }}</p>
        </div>
      </div>
    </div>

    <!-- Welcome card -->
    <div class="welcome-card">
      <h3 class="welcome-title">{{ getLocalizedText('welcome') }}</h3>
      <p class="welcome-text">
        {{ getLocalizedText('welcomeMessage') }}
      </p>
    </div>

    <!-- Notification box -->
    <div class="notification-box">
      <div class="notification-header">⚠️ {{ getLocalizedText('notification') }}</div>
      <div class="notification-content">
        {{ getLocalizedText('notificationContent') }}
      </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

// Helper function to lighten a color
const lightenColor = (color, percent) => {
  // Parse the hex color
  let R = parseInt(color.substring(1, 3), 16)
  let G = parseInt(color.substring(3, 5), 16)
  let B = parseInt(color.substring(5, 7), 16)

  // Lighten the color
  R = Math.min(255, R + (255 - R) * (percent / 100))
  G = Math.min(255, G + (255 - G) * (percent / 100))
  B = Math.min(255, B + (255 - B) * (percent / 100))

  // Convert back to hex
  const newR = Math.round(R).toString(16).padStart(2, '0')
  const newG = Math.round(G).toString(16).padStart(2, '0')
  const newB = Math.round(B).toString(16).padStart(2, '0')

  return `#${newR}${newG}${newB}`
}

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

const changeLanguage = (langCode) => {
  currentLanguage.value = langCode
  // Here you could add logic to change the language of the entire page
  // For now, we're just updating the current language value
}

// Function to get localized text based on current language
const getLocalizedText = (key) => {
  const localizedText = {
    'transportationBureau': {
      '简体中文': `${cityName}交通局`,
      '繁体中文': `${cityName}交通局`,
      'English': `${cityName} Transportation Bureau`,
      '日本語': `${cityName}交通局`
    },
    'home': {
      '简体中文': '首页',
      '繁体中文': '首頁',
      'English': 'Home',
      '日本語': 'ホーム'
    },
    'subwayLines': {
      '简体中文': '地铁线路',
      '繁体中文': '地鐵路線',
      'English': 'Subway Lines',
      '日本語': '地下鉄路線'
    },
    'stationInfo': {
      '简体中文': '站点信息',
      '繁体中文': '站點資訊',
      'English': 'Station Info',
      '日本語': '駅情報'
    },
    'schedule': {
      '简体中文': '时刻表',
      '繁体中文': '時刻表',
      'English': 'Schedule',
      '日本語': '時刻表'
    },
    'ticketInfo': {
      '简体中文': '票务信息',
      '繁体中文': '票務資訊',
      'English': 'Ticket Info',
      '日本語': '切符情報'
    },
    'welcome': {
      '简体中文': '欢迎访问',
      '繁体中文': '歡迎訪問',
      'English': 'Welcome',
      '日本語': 'ようこそ'
    },
    'welcomeMessage': {
      '简体中文': `欢迎访问${cityName}交通局官方网站。本网站为您提供${cityName}地铁线路的各类信息。请从以下菜单中选择您需要的服务。`,
      '繁体中文': `歡迎訪問${cityName}交通局官方網站。本網站為您提供${cityName}地鐵線路的各類資訊。請從以下選單中選擇您需要的服務。`,
      'English': `Welcome to the official ${cityName} Transportation Bureau website. This site provides you with various information about ${cityName} subway lines. Please select the services you need from the following menu.`,
      '日本語': `${cityName}交通局公式サイトへようこそ。当サイトでは、${cityName}地下鉄の各種情報を提供しています。以下のメニューから必要なサービスを選択してください。`
    },
    'notification': {
      '简体中文': '通知',
      '繁体中文': '通知',
      'English': 'Notice',
      '日本語': 'お知らせ'
    },
    'notificationContent': {
      '简体中文': `本网站是虚构城市"${cityName}"的交通信息网站，所有内容均为虚构。`,
      '繁体中文': `本網站是虛構城市"${cityName}"的交通資訊網站，所有內容均為虛構。`,
      'English': `This website is a fictional transportation information site for the city of "${cityName}", all content is fictional.`,
      '日本語': `当サイトは架空の都市「${cityName}」の交通情報サイトであり、すべての内容は架空です。`
    }
  }
  
  return localizedText[key] && localizedText[key][currentLanguage.value] 
    ? localizedText[key][currentLanguage.value] 
    : localizedText[key] && localizedText[key]['简体中文'] 
      ? localizedText[key]['简体中文'] 
      : key
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
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

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 15px;
}



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

/* Ensure text color in dropdown options */
.lang-dropdown option {
  color: #333; /* Dark color for options to ensure readability */
  background-color: white; /* White background for options */
}

.lang-dropdown:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

.lang-dropdown:focus {
  outline: none;
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

/* Tablet and Mobile responsiveness */
@media (max-width: 768px) {
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
  
  .logo-section {
    padding-top: 20px;
  }
}

/* Top Card styles */
.top-card {
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 15px;
  border-radius: 12px;
  overflow: hidden;
}

.top-card-content {
  display: flex;
  align-items: center;
  padding: 20px;
  gap: 20px;
}

.logo-container {
  flex-shrink: 0;
}

.logo-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--primary-color, #0047AB); /* Dynamic primary color from config with fallback */
}

.title-container {
  flex: 1;
}

.card-title {
  font-size: 22px;
  color: var(--primary-color, #0047AB); /* Dynamic primary color from config with fallback */
  margin: 0 0 5px 0;
  font-weight: bold;
}

.card-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* Notification box styles - Warning Alert */
.notification-box {
  background-color: #fff3cd; /* Light yellow background */
  border: 1px solid #ffeaa7; /* Yellow border */
  border-left: 4px solid #f39c12; /* Orange left border for emphasis */
  border-radius: 8px;
  margin: 15px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: flex-start;
}

.notification-header {
  font-weight: bold;
  color: #d35400; /* Darker orange */
  margin-right: 10px;
  font-size: 16px;
  flex-shrink: 0;
}

.notification-content {
  color: #7d6608; /* Darker yellow/brown text */
  font-size: 14px;
  line-height: 1.5;
  flex: 1;
}

/* Welcome card styles */
.welcome-card {
  background-color: white;
  border-radius: 8px;
  margin: 15px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.welcome-title {
  font-size: 18px;
  color: var(--primary-color, #0047AB); /* Dynamic primary color from config with fallback */
  margin-bottom: 10px;
  font-weight: bold;
}

.welcome-text {
  color: #333;
  font-size: 14px;
  line-height: 1.5;
}

.notification-box {
  margin: 15px;
  padding: 15px;
  flex-direction: column;
}

.notification-header {
  margin-bottom: 8px;
  margin-right: 0;
}


/* Tablet responsiveness */
@media (min-width: 481px) and (max-width: 768px) {
  .mtr-website {
    max-width: 95%;
  }
  
  .card-title {
    font-size: 24px;
  }
  
  .logo-image {
    width: 90px;
    height: 90px;
  }
  
  .welcome-text {
    font-size: 15px;
  }
  
  .top-card-content {
    padding: 20px;
    gap: 20px;
  }
  
  .notification-box {
    margin: 15px;
    padding: 16px;
  }
  
  .notification-content {
    font-size: 14px;
  }
}

/* PC responsiveness */
@media (min-width: 769px) {
  .mtr-website {
    max-width: 90%;
    margin: 20px auto;
  }
  

  
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
  
  
  
  /* PC responsive styles for dropdown options */
  
  .lang-dropdown option {
  
    color: #333;
  
    font-size: 14px;
  
  }
  
  
  
  .top-card {
  
    margin: 20px 30px;
  
  }
  
  
  
  .top-card-content {
  
    padding: 25px;
  
    gap: 25px;
  
  }
  
  
  
  .logo-image {
  
    width: 100px;
  
    height: 100px;
  
    border-width: 4px;
  
  }
  
  
  
  .card-title {
  
    font-size: 26px;
  
  }
  
  
  
  .card-subtitle {
  
    font-size: 16px;
  
  }  
  .notification-box {
    margin: 20px 30px;
    padding: 20px;
  }
  
  .notification-header {
    font-size: 18px;
  }
  
  .notification-content {
    font-size: 16px;
    line-height: 1.5;
  }
  
  .welcome-card {
    margin: 20px 30px;
    padding: 30px;
  }
  
  .welcome-title {
    font-size: 22px;
  }
  
  .welcome-text {
    font-size: 16px;
    line-height: 1.6;
  }
  
  .notification-box {
    margin: 15px 30px;
    padding: 18px;
  }
  
  .notification-header {
    font-size: 17px;
  }
  
  .notification-content {
    font-size: 15px;
  }
}

/* Mobile responsiveness - Updated for new navbar */
@media (max-width: 480px) {
  .mtr-website {
    max-width: 100%;
  }
  
  .nav-title {
    font-size: 16px;
  }
  
  .card-title {
    font-size: 20px;
  }
  
  .nav-container {
    padding: 10px 15px;
    gap: 10px;
  }
  
  .nav-link {
    font-size: 14px;
    padding: 8px 12px;
  }
  
  .top-card-content {
    padding: 15px;
    gap: 15px;
    flex-direction: column;
    text-align: center;
  }
  
  .logo-image {
    width: 80px;
    height: 80px;
  }
  
  .title-container {
    text-align: center;
  }
  
  .lang-dropdown {
    font-size: 14px;
    padding: 6px 12px;
    min-width: 110px;
    background-size: 12px;
    padding-right: 28px;
  }
  
  /* Mobile responsive styles for dropdown options */
  .lang-dropdown option {
    color: #333;
    font-size: 14px;
  }
}
</style>