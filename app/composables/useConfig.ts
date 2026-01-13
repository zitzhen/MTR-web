/**
 * 统一的配置文件获取 composable，支持重试逻辑
 * 当 /configuration.json HTTP 请求失败时，重试请求
 */
export const useConfig = () => {
  return useAsyncData('config', async () => {
    try {
      if (process.server) {
        // 服务端实现
        try {
          const fs = await import('fs')
          const path = await import('path')
          
          // 首先尝试正常的配置文件路径
          const configPath = path.join(process.cwd(), 'public', 'configuration.json')
          if (fs.existsSync(configPath)) {
            const configFile = fs.readFileSync(configPath, 'utf-8')
            return JSON.parse(configFile)
          } else {
            // 尝试备用配置文件路径
            const altConfigPath = path.join(process.cwd(), '.output/public/configuration.json')
            if (fs.existsSync(altConfigPath)) {
              const configFile = fs.readFileSync(altConfigPath, 'utf-8')
              return JSON.parse(configFile)
            } else {
              console.error('Configuration file does not exist at:', configPath, 'or', altConfigPath)
              // 如果文件系统访问失败，回退到 fetch
              try {
                const config = await $fetch('/configuration.json')
                return config
              } catch (fetchError) {
                console.error('Configuration fetch also failed:', fetchError)
                return { city_name: 'Error', color: '#0047AB' }
              }
            }
          }
        } catch (fsError) {
          console.warn('Server-side file access failed, falling back to fetch:', fsError)
          // 如果文件系统访问失败，回退到 HTTP fetch，实现重试逻辑
          try {
            const config = await $fetch('/configuration.json')
            return config
          } catch (primaryError) {
            console.warn('Primary configuration fetch failed, implementing retry logic:', primaryError)
            // 重试逻辑：当 /configuration.json 请求失败时，重试
            try {
              const config = await $fetch('/configuration.json')
              return config
            } catch (retryError) {
              console.error('Configuration fetch failed after retry:', retryError)
              return { city_name: 'Error', color: '#0047AB' }
            }
          }
        }
      } else {
        // 客户端实现 - 首先尝试 HTTP 请求
        try {
          const config = await $fetch('/configuration.json')
          return config
        } catch (primaryError) {
          console.warn('Primary configuration fetch failed, implementing retry logic:', primaryError)
          // 实现重试逻辑：当 /configuration.json 请求失败时，重试
          try {
            const config = await $fetch('/configuration.json')
            return config
          } catch (retryError) {
            console.error('Configuration fetch failed after retry:', retryError)
            return { city_name: 'Error', color: '#0047AB' }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load configuration:', error)
      return { city_name: 'Error', color: '#0047AB' }
    }
  })
}