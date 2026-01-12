import { useHead, useAsyncData } from '#imports'
import { useLanguageStore } from '../stores/language'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

interface PageTitleConfig {
  key?: string; // 使用配置文件中的键来获取标题
  defaultTitle?: string; // 默认标题，如果配置中没有找到
  suffix?: string; // 标题后缀，通常是城市名
  descriptionKey?: string; // 使用配置文件中的键来获取描述
  defaultDescription?: string; // 默认描述，如果配置中没有找到
}

/**
 * 动态页面标题管理可组合函数
 * 从配置文件中读取标题并根据当前语言设置页面标题和meta描述
 */
export const usePageTitle = (config: PageTitleConfig) => {
  const languageStore = useLanguageStore()
  const { currentLanguage } = storeToRefs(languageStore)

  // 使用 useAsyncData 获取配置数据
  const { data: configData } = useAsyncData('config', async () => {
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
              return { city_name: 'MTR', color: '#0047AB' }
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
            return { city_name: 'MTR', color: '#0047AB' }
          }
        }
      } else {
        // On client-side, use fetch
        try {
          const config = await $fetch('/configuration.json')
          return config
        } catch (error) {
          console.error('Failed to load configuration:', error)
          return { city_name: 'MTR', color: '#0047AB' }
        }
      }
    } catch (error) {
      console.error('加载配置失败:', error)
      return { city_name: 'MTR', color: '#0047AB' }
    }
  })

  // 构建标题
  const buildTitle = () => {
    const cityName = configData.value?.city_name || 'MTR'
    const suffix = config.suffix || cityName
    
    if (config.key && configData.value) {
      // 尝试从配置文件中获取特定页面的标题
      if (configData.value.page_titles) {
        const pageTitles = configData.value.page_titles
        if (pageTitles[config.key]) {
          const titleInCurrentLanguage = pageTitles[config.key][languageStore.currentLanguage] || 
                                         pageTitles[config.key]['简体中文']
          return `${titleInCurrentLanguage} - ${suffix}`
        }
      }
    }
    
    // 如果没有找到特定标题，使用默认标题
    return config.defaultTitle ? `${config.defaultTitle} - ${suffix}` : suffix
  }

  // 构建描述
  const buildDescription = () => {
    if (config.descriptionKey && configData.value) {
      // 尝试从配置文件中获取特定页面的描述
      if (configData.value.page_descriptions) {
        const pageDescriptions = configData.value.page_descriptions
        if (pageDescriptions[config.descriptionKey]) {
          const descriptionInCurrentLanguage = pageDescriptions[config.descriptionKey][languageStore.currentLanguage] || 
                                               pageDescriptions[config.descriptionKey]['简体中文']
          return descriptionInCurrentLanguage
        }
      }
    }
    
    // 如果没有找到特定描述，使用默认描述
    return config.defaultDescription || `欢迎访问${configData.value?.city_name || 'MTR'}交通局官方网站`
  }

  // 设置页面标题
  const title = computed(() => buildTitle())
  const description = computed(() => buildDescription())
  
  useHead({
    title: title,
    meta: [
      {
        name: 'description',
        content: description
      },
      {
        name: 'keywords',
        content: `${configData.value?.city_name || 'MTR'},地铁,交通,时刻表,站点信息`
      },
      {
        property: 'og:title',
        content: title
      },
      {
        property: 'og:description',
        content: description
      },
      {
        property: 'og:type',
        content: 'website'
      },
      {
        name: 'twitter:card',
        content: 'summary'
      }
    ]
  })

  return {
    title,
    description
  }
}