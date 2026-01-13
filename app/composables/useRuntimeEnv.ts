/**
 * 环境管理工具
 * 根据环境变量 RUNTIME_ENV 决定运行环境
 * RUNTIME_ENV=nodejs | cloudflare
 */

// 默认运行环境为 nodejs
const RUNTIME_ENV = (process.env.RUNTIME_ENV || 'nodejs') as 'nodejs' | 'cloudflare'

/**
 * 检查当前运行环境
 */
export const getRuntimeEnvironment = (): 'nodejs' | 'cloudflare' => {
  return RUNTIME_ENV
}

/**
 * 检查是否在 Node.js 环境下运行
 */
export const isNodeRuntime = (): boolean => {
  return RUNTIME_ENV === 'nodejs'
}

/**
 * 检查是否在 Cloudflare 环境下运行
 */
export const isCloudflareRuntime = (): boolean => {
  return RUNTIME_ENV === 'cloudflare'
}

/**
 * 根据运行环境执行不同的函数
 */
export const executeByRuntime = <T>(
  nodejsFn: () => T | Promise<T>,
  cloudflareFn: () => T | Promise<T>
): Promise<T> | T => {
  return RUNTIME_ENV === 'nodejs' ? nodejsFn() : cloudflareFn()
}

/**
 * 通用的路径处理函数，根据运行环境选择实现
 */
export const joinPath = (...paths: string[]): string => {
  if (RUNTIME_ENV === 'nodejs') {
    try {
      const { join } = require('path') as typeof import('path')
      return join(...paths)
    } catch (error) {
      // 在客户端环境中，简单地连接路径
      return paths.join('/').replace(/\/+/g, '/')
    }
  } else {
    // 在 Cloudflare 环境中，简单地连接路径
    return paths.join('/').replace(/\/+/g, '/')
  }
}

/**
 * 通用的文件读取函数，根据运行环境选择实现
 */
export const readConfigFile = async (configPath: string): Promise<string | null> => {
  if (RUNTIME_ENV === 'nodejs') {
    try {
      const fs = await import('fs')
      if (typeof fs.promises !== 'undefined') {
        // 使用 fs.promises（Node.js 14+）
        const content = await fs.promises.readFile(configPath, 'utf-8')
        return content
      } else {
        // 如果不支持 fs.promises，使用同步方法
        const content = fs.readFileSync(configPath, 'utf-8')
        return content
      }
    } catch (error) {
      console.warn(`Node.js read failed for ${configPath}:`, error)
      return null
    }
  } else { // Cloudflare
    try {
      // 在 Cloudflare Workers 环境中，配置文件通常通过 HTTP 请求获取
      // 或者从 KV 存储中读取
      const response = await fetch(configPath.startsWith('/') ? configPath : `/${configPath}`)
      if (response.ok) {
        return await response.text()
      }
      return null
    } catch (error) {
      console.warn(`Cloudflare fetch failed for ${configPath}:`, error)
      return null
    }
  }
}

/**
 * 通用的文件存在检查函数，根据运行环境选择实现
 */
export const checkFileExists = async (configPath: string): Promise<boolean> => {
  if (RUNTIME_ENV === 'nodejs') {
    try {
      const fs = await import('fs')
      return fs.existsSync(configPath)
    } catch (error) {
      console.warn(`Node.js file check failed for ${configPath}:`, error)
      return false
    }
  } else { // Cloudflare
    try {
      // 在 Cloudflare 环境中，通过尝试 fetch 来检查文件是否存在
      const response = await fetch(configPath.startsWith('/') ? configPath : `/${configPath}`)
      return response.ok
    } catch (error) {
      console.warn(`Cloudflare file check failed for ${configPath}:`, error)
      return false
    }
  }
}

/**
 * 获取当前工作目录，根据运行环境选择实现
 */
export const getCurrentWorkingDirectory = (): string => {
  if (RUNTIME_ENV === 'nodejs') {
    try {
      return process.cwd()
    } catch (error) {
      console.warn('process.cwd() not available, using "/" as fallback:', error)
      return '/'
    }
  } else {
    // 在 Cloudflare 环境中，没有传统的文件系统概念
    // 返回根路径作为占位符
    return '/'
  }
}

/**
 * 通用的路径解析函数，根据运行环境选择实现
 */
export const resolvePath = (...pathSegments: string[]): string => {
  if (RUNTIME_ENV === 'nodejs') {
    try {
      const { resolve } = require('path') as typeof import('path')
      return resolve(...pathSegments)
    } catch (error) {
      // 如果在客户端环境中，简单地连接路径
      return pathSegments.join('/').replace(/\/+/g, '/')
    }
  } else {
    // 在 Cloudflare 环境中，简单地连接路径
    return pathSegments.join('/').replace(/\/+/g, '/')
  }
}