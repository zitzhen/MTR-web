<template>
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
import { useLanguageStore } from '~~/stores/language'
import { storeToRefs } from 'pinia'
import { usePageTitle } from '~/composables/usePageTitle'

// 设置动态页面标题和描述
usePageTitle({
  key: 'home',
  descriptionKey: 'home',
  defaultTitle: '首页',
  defaultDescription: '欢迎访问MTR交通局官方网站',
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

// Function to get localized text based on current language
const getLocalizedText = (key) => {
  const localizedText = {
    'transportationBureau': {
      '简体中文': `${cityName}交通局`,
      '繁体中文': `${cityName}交通局`,
      'English': `${cityName} Transportation Bureau`,
      '日本語': `${cityName}交通局`
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

/* Top Card styles - Liquid Glass effect */
.top-card {
  background-color: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  margin: 15px;
  border-radius: var(--ios-card-radius);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.12),
              inset 0 2px 2px rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.top-card:hover {
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(35px) saturate(180%);
  -webkit-backdrop-filter: blur(35px) saturate(180%);
}

.top-card-content {
  display: flex;
  align-items: center;
  padding: 22px;
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
  border: 3px solid var(--ios-primary); /* iOS-style primary color */
}

.title-container {
  flex: 1;
}

.card-title {
  font-size: 22px;
  color: var(--ios-text-primary);
  margin: 0 0 5px 0;
  font-weight: 600;
}

.card-subtitle {
  font-size: 14px;
  color: var(--ios-text-secondary);
  margin: 0;
}

/* Notification box styles - Liquid Glass effect */
.notification-box {
  background-color: rgba(255, 235, 235, 0.25);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border: 1px solid rgba(255, 149, 149, 0.25);
  border-left: 4px solid #FF3B30;
  border-radius: var(--ios-card-radius);
  margin: 15px;
  padding: 16px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.12),
              inset 0 2px 2px rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: flex-start;
  transition: all 0.3s ease;
}

.notification-box:hover {
  background-color: rgba(255, 235, 235, 0.3);
  backdrop-filter: blur(35px) saturate(180%);
  -webkit-backdrop-filter: blur(35px) saturate(180%);
}

.notification-header {
  font-weight: 600;
  color: #FF2D55;
  margin-right: 10px;
  font-size: 16px;
  flex-shrink: 0;
}

.notification-content {
  color: var(--ios-text-primary);
  font-size: 14px;
  line-height: 1.5;
  flex: 1;
}

/* Welcome card styles - Liquid Glass effect */
.welcome-card {
  background-color: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border-radius: var(--ios-card-radius);
  margin: 15px;
  padding: 22px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.12),
              inset 0 2px 2px rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: all 0.3s ease;
}

.welcome-card:hover {
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(35px) saturate(180%);
  -webkit-backdrop-filter: blur(35px) saturate(180%);
}

.welcome-title {
  font-size: 18px;
  color: var(--ios-text-primary);
  margin-bottom: 12px;
  font-weight: 600;
}

.welcome-text {
  color: var(--ios-text-primary);
  font-size: 14px;
  line-height: 1.6;
}

.notification-box {
  margin: 15px;
  padding: 16px;
  flex-direction: column;
}

.notification-header {
  margin-bottom: 8px;
  margin-right: 0;
}

/* Tablet responsiveness */
@media (min-width: 481px) and (max-width: 768px) {
  .top-card-content {
    padding: 22px;
    gap: 20px;
  }
  
  .card-title {
    font-size: 23px;
  }
  
  .logo-image {
    width: 85px;
    height: 85px;
  }
  
  .welcome-text {
    font-size: 15px;
    line-height: 1.6;
  }
  
  .top-card-content {
    padding: 22px;
    gap: 20px;
  }
  
  .notification-box {
    margin: 15px;
    padding: 16px;
  }
  
  .notification-content {
    font-size: 14px;
  }
  
  .welcome-card {
    padding: 24px;
  }
}

/* PC responsiveness */
@media (min-width: 769px) {
  .top-card {
    margin: 20px 30px 15px 30px;
  }
  
  .top-card-content {
    padding: 28px;
    gap: 25px;
  }
  
  .logo-image {
    width: 90px;
    height: 90px;
    border-width: 3px;
  }
  
  .card-title {
    font-size: 26px;
  }
  
  .card-subtitle {
    font-size: 15px;
  }
  
  .notification-box {
    margin: 15px 30px;
    padding: 20px;
  }
  
  .notification-header {
    font-size: 17px;
  }
  
  .notification-content {
    font-size: 15px;
    line-height: 1.6;
  }
  
  .welcome-card {
    margin: 15px 30px;
    padding: 28px;
  }
  
  .welcome-title {
    font-size: 20px;
  }
  
  .welcome-text {
    font-size: 15px;
    line-height: 1.6;
  }
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .card-title {
    font-size: 21px;
  }
  
  .top-card-content {
    padding: 18px;
    gap: 15px;
    flex-direction: column;
    text-align: center;
  }
  
  .logo-image {
    width: 75px;
    height: 75px;
  }
  
  .title-container {
    text-align: center;
  }
  
  .notification-box {
    margin: 12px;
    padding: 14px;
  }
  
  .welcome-card {
    margin: 12px;
    padding: 18px;
  }
  
  .welcome-title {
    font-size: 17px;
  }
  
  .welcome-text {
    font-size: 13.5px;
    line-height: 1.6;
  }
}
</style>