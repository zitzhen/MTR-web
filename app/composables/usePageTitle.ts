import { useHead, useAsyncData } from '#imports'
import { useLanguageStore } from '../stores/language'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

interface PageTitleConfig {
  key?: string; // 使用配置文件中的键来获取标题
  defaultTitle?: string; // 默认标题，如果配置中没有找到
  suffix?: string; // 标题后缀，通常是城市名
}

/**
 * 动态页面标题管理可组合函数
 * 从配置文件中读取标题并根据当前语言设置页面标题
 */
export const usePageTitle = (config: PageTitleConfig) => {
  const languageStore = useLanguageStore()
  const { currentLanguage } = storeToRefs(languageStore)

  // 使用 useAsyncData 获取配置数据
  const { data: configData } = useAsyncData('config', async () => {
    try {
      if (process.server) {
        // 服务端运行时 - 直接访问文件
        const fs = await import('fs')
        const path = await import('path')
        const configPath = path.resolve(process.cwd(), 'public', 'configuration.json')
        if (fs.existsSync(configPath)) {
          const configFile = fs.readFileSync(configPath, 'utf-8')
          return JSON.parse(configFile)
        } else {
          console.error('配置文件不存在:', configPath)
          return { city_name: 'MTR', color: '#0047AB' }
        }
      } else {
        // 客户端运行时 - 使用 $fetch
        const config = await $fetch('/configuration.json')
        return config
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

  // 设置页面标题
  const title = computed(() => buildTitle())
  
  useHead({
    title: title
  })

  return {
    title
  }
}