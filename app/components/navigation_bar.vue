<template>
  <!-- Navigation Bar -->
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-logo">
        <h1 class="nav-title">{{ getLocalizedText('transportationBureau') }}</h1>
      </div>
      <div class="nav-menu" :class="{ active: isMobileMenuOpen }">
        <NuxtLink to="/" class="nav-link">{{ getLocalizedText('home') }}</NuxtLink>
        <NuxtLink to="/map" class="nav-link">{{ getLocalizedText('subwayLines') }}</NuxtLink>
        <NuxtLink to="/station-info" class="nav-link">{{ getLocalizedText('stationInfo') }}</NuxtLink>
        <NuxtLink to="/timetable" class="nav-link">{{ getLocalizedText('schedule') }}</NuxtLink>
        <NuxtLink to="/copyright" class="nav-link">©</NuxtLink>
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
</template>

<script setup>
import { ref, reactive } from 'vue'

const isMobileMenuOpen = ref(false);

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

<style scoped>
/* Navigation Bar styles - Liquid Glass effect */
.navbar {
  background-color: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  color: var(--ios-text-primary);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.12),
              inset 0 2px 2px rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 0 0 24px 24px;
  margin: 0 15px;
  padding: 5px 0;
  transition: all 0.3s ease;
}

.navbar:hover {
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(35px) saturate(180%);
  -webkit-backdrop-filter: blur(35px) saturate(180%);
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-logo {
  display: flex;
  align-items: center;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--ios-text-primary);
}

.nav-menu {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-link {
  color: var(--ios-text-primary);
  text-decoration: none;
  font-size: 15px;
  padding: 8px 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: 400;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.25);
  color: var(--ios-primary);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.nav-link.nuxt-link-exact-active {
  background-color: var(--ios-primary);
  color: white !important;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.language-selector {
  display: flex;
  align-items: center;
}

.lang-dropdown {
  background-color: rgba(255, 255, 255, 0.15);
  color: var(--ios-text-primary);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 6px 30px 6px 12px;
  font-size: 14px;
  border-radius: 12px;
  cursor: pointer;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='rgba(142, 142, 147, 1)'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  min-width: 120px;
  transition: all 0.3s ease;
}

.lang-dropdown:hover {
  background-color: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.lang-dropdown:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3);
}

/* Ensure text color in dropdown options */
.lang-dropdown option {
  color: #333;
  background-color: white;
}

.lang-dropdown:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.lang-dropdown:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
}

/* Mobile menu toggle */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  padding: 5px;
}

.hamburger {
  width: 22px;
  height: 3px;
  background-color: var(--ios-text-primary);
  margin: 3px 0;
  transition: 0.3s;
  border-radius: 2px;
}

/* Tablet and Mobile responsiveness */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 15px;
  }
  
  .nav-menu {
    display: none;
    width: 100%;
    flex-direction: column;
    background-color: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    padding: 10px 0;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    margin-top: 5px;
  }
  
  .nav-menu.active {
    display: flex;
  }
  
  .nav-link {
    padding: 10px 20px;
    width: 100%;
    border-radius: 8px;
    margin: 0 8px;
  }
  
  .nav-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .mobile-menu-toggle {
    display: flex;
  }
  
  .navbar {
    margin: 10px;
    border-radius: 14px;
  }
}

/* PC responsiveness */
@media (min-width: 769px) {
  .nav-container {
    padding: 12px 25px;
  }
  
  .nav-title {
    font-size: 19px;
  }
  
  .nav-menu {
    gap: 22px;
  }
  
  .nav-link {
    font-size: 15px;
    padding: 9px 14px;
  }
  
  .lang-dropdown {
    font-size: 14px;
    padding: 6px 30px 6px 12px;
    min-width: 125px;
    background-size: 16px;
    padding-right: 32px;
  }
  
  /* PC responsive styles for dropdown options */
  .lang-dropdown option {
    color: #333;
    font-size: 14px;
  }
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .nav-title {
    font-size: 17px;
  }
  
  .nav-container {
    padding: 10px 12px;
    gap: 8px;
  }
  
  .nav-link {
    font-size: 14px;
    padding: 8px 12px;
  }
  
  .lang-dropdown {
    font-size: 13px;
    padding: 5px 28px 5px 10px;
    min-width: 110px;
    background-size: 14px;
    padding-right: 28px;
  }
  
  /* Mobile responsive styles for dropdown options */
  .lang-dropdown option {
    color: #333;
    font-size: 13px;
  }
  
  .navbar {
    margin: 8px;
    border-radius: 12px;
  }
}
</style>