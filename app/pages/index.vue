<template>
    <!-- Navigation Bar -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-logo">
          <h1 class="nav-title">{{ cityName }}交通局</h1>
        </div>
        <div class="nav-menu" :class="{ active: isMobileMenuOpen }">
          <a href="#" class="nav-link">首页</a>
          <a href="#" class="nav-link">地铁线路</a>
          <a href="#" class="nav-link">站点信息</a>
          <a href="#" class="nav-link">时刻表</a>
          <a href="#" class="nav-link">票务信息</a>
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

    <!-- Logo section -->
    <div class="logo-section">
      <div class="logo-circle">
        <img src="/LOGO.jpg" alt="Logo" class="logo-image" />
      </div>
      <h2 class="logo-title">{{ cityName }}交通局</h2>
      <p class="logo-subtitle">{{ cityName }}交通局</p>
    </div>

    <!-- Notification box -->
    <div class="notification-box">
      <div class="notification-header">通知</div>
      <div class="notification-content">
        本网站是虚构城市"{{ cityName }}"的交通信息网站，所有内容均为虚构。
      </div>
    </div>

    <!-- Welcome card -->
    <div class="welcome-card">
      <h3 class="welcome-title">欢迎访问</h3>
      <p class="welcome-text">
        欢迎访问{{ cityName }}交通局官方网站。本网站为您提供{{ cityName }}地铁线路的各类信息。请从以下菜单中选择您需要的服务。
      </p>
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

/* Logo section styles */
.logo-section {
  text-align: center;
  padding: 30px 15px;
}

.logo-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: var(--primary-color, #0047AB);
  margin: 0 auto 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.logo-image {
  width: 80%;
  height: 80%;
  object-fit: contain;
  max-width: 80px;
  max-height: 80px;
}

.logo-title {
  font-size: 24px;
  color: var(--primary-color, #0047AB); /* Dynamic primary color from config with fallback */
  margin: 10px 0 5px;
  font-weight: bold;
}

.logo-subtitle {
  font-size: 14px;
  color: #666;
}

/* Notification box styles */
.notification-box {
  background-color: white;
  border: 2px solid #FFA500; /* Yellow-orange border */
  border-radius: 8px;
  margin: 15px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.notification-header {
  font-weight: bold;
  color: #FFA500;
  margin-bottom: 8px;
  font-size: 16px;
}

.notification-content {
  color: #333;
  font-size: 14px;
  line-height: 1.4;
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


/* Tablet responsiveness */
@media (min-width: 481px) and (max-width: 768px) {
  .mtr-website {
    max-width: 95%;
  }
  
  .logo-title {
    font-size: 26px;
  }
  
  .logo-circle {
    width: 120px;
    height: 120px;
  }
  
  .welcome-text {
    font-size: 15px;
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
    min-width: 110px;
    background-size: 12px;
    padding-right: 28px;
  }
  
  /* Mobile responsive styles for dropdown options */
  .lang-dropdown option {
    color: #333;
    font-size: 14px;
  }
  
  /* PC responsive styles for dropdown options */
  .lang-dropdown option {
    color: #333;
    font-size: 14px;
  }
  
  .logo-section {
    padding: 40px 15px;
  }
  
  .logo-circle {
    width: 150px;
    height: 150px;
  }
  
  .logo-image {
    max-width: 100px;
    max-height: 100px;
  }
  
  .logo-title {
    font-size: 32px;
    margin: 15px 0 5px;
  }
  
  .logo-subtitle {
    font-size: 18px;
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
  
  .navigation-arrows {
    margin: 30px 0 40px;
    gap: 40px;
  }
  
  .arrow-btn {
    width: 50px;
    height: 50px;
    font-size: 22px;
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
  
  .logo-title {
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
}
</style>