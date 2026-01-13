/**
 * 统一的配置文件获取 composable，支持重试逻辑和多运行环境
 * 当 /configuration.json HTTP 请求失败时，重试请求
 */
import { 
  isNodeRuntime, 
  isCloudflareRuntime, 
  readConfigFile, 
  checkFileExists,
  joinPath,
  getCurrentWorkingDirectory
} from '~/composables/useRuntimeEnv'

export const useConfig = () => {
  return useAsyncData('config', async () => {
    try {
      if (process.server) {
        // 服务端实现 - 根据运行环境选择实现
        if (isNodeRuntime()) {
          try {
            const fs = await import('fs')
            const path = await import('path')
            
            // 使用环境特定的路径处理
            const cwd = getCurrentWorkingDirectory()
            const configPath = joinPath(cwd, 'public', 'configuration.json')
            
            if (await checkFileExists(configPath)) {
              const configFile = await readConfigFile(configPath)
              if (configFile) {
                return JSON.parse(configFile)
              } else {
                console.error('Could not read config file at:', configPath)
              }
            } else {
              // 尝试备用配置文件路径
              const altConfigPath = joinPath(cwd, '.output', 'public', 'configuration.json')
              if (await checkFileExists(altConfigPath)) {
                const configFile = await readConfigFile(altConfigPath)
                if (configFile) {
                  return JSON.parse(configFile)
                } else {
                  console.error('Could not read alt config file at:', altConfigPath)
                }
              } else {
                console.error('Configuration file does not exist at:', configPath, 'or', altConfigPath)
              }
            }
            
            // 如果文件系统访问失败，回退到 fetch
            try {
              const config = await $fetch('/configuration.json')
              return config
            } catch (fetchError) {
              console.error('Configuration fetch also failed:', fetchError)
              return { city_name: 'Error', color: '#0047AB' }
            }
          } catch (fsError) {
            console.warn('Node.js server-side file access failed, falling back to fetch:', fsError)
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
        } else if (isCloudflareRuntime()) {
          // Cloudflare Workers 实现
          try {
            // 在 Cloudflare 环境中，配置文件通常通过 HTTP 请求获取
            // 或从 KV 存储中获取
            const configPath = '/configuration.json'
            const configContent = await readConfigFile(configPath)
            
            if (configContent) {
              return JSON.parse(configContent)
            } else {
              console.warn('Configuration file not found via readConfigFile, trying fetch')
              // 回退到 fetch
              try {
                const config = await $fetch('/configuration.json')
                return config
              } catch (fetchError) {
                console.error('Configuration fetch also failed:', fetchError)
                return { city_name: 'Error', color: '#0047AB' }
              }
            }
          } catch (error) {
            console.warn('Cloudflare runtime config loading failed, falling back to fetch:', error)
            // 如果任何操作失败，回退到 fetch
            try {
              const config = await $fetch('/configuration.json')
              return config
            } catch (primaryError) {
              console.warn('Primary configuration fetch failed, implementing retry logic:', primaryError)
              // 重试逻辑
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
          // 默认回退到 Node.js 实现
          try {
            const fs = await import('fs')
            const path = await import('path')
            
            // 使用环境特定的路径处理
            const cwd = getCurrentWorkingDirectory()
            const configPath = joinPath(cwd, 'public', 'configuration.json')
            
            if (await checkFileExists(configPath)) {
              const configFile = await readConfigFile(configPath)
              if (configFile) {
                return JSON.parse(configFile)
              } else {
                console.error('Could not read config file at:', configPath)
              }
            } else {
              // 尝试备用配置文件路径
              const altConfigPath = joinPath(cwd, '.output', 'public', 'configuration.json')
              if (await checkFileExists(altConfigPath)) {
                const configFile = await readConfigFile(altConfigPath)
                if (configFile) {
                  return JSON.parse(configFile)
                } else {
                  console.error('Could not read alt config file at:', altConfigPath)
                }
              } else {
                console.error('Configuration file does not exist at:', configPath, 'or', altConfigPath)
              }
            }
            
            // 如果文件系统访问失败，回退到 fetch
            try {
              const config = await $fetch('/configuration.json')
              return config
            } catch (fetchError) {
              console.error('Configuration fetch also failed:', fetchError)
              return { city_name: 'Error', color: '#0047AB' }
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