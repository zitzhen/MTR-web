//@ts-nocheck
import { existsSync } from 'fs'
import { resolve } from 'path'

/**
 * 根据运行环境决定是否使用 SSL
 * 在 Cloudflare 环境中，不需要本地 SSL 证书
 */
const RUNTIME_ENV = process.env.RUNTIME_ENV || 'nodejs'

/**
 * 仅允许用于开发调试的域名
 */
const DEV_DOMAIN = 'mtr-web.test'

let httpsOptions = false

// 只在 Node.js 环境下检查 SSL 证书
if (RUNTIME_ENV === 'nodejs') {
  /**
   * SSL 证书路径（必须是字符串路径）
   */
  const SSL_KEY_PATH = resolve('./server.key')
  const SSL_CERT_PATH = resolve('./server.crt')

  /**
   * HTTPS 配置
   * - 证书存在 → HTTPS
   * - 证书不存在 → 自动回退 HTTP
   */
  httpsOptions =
    existsSync(SSL_KEY_PATH) && existsSync(SSL_CERT_PATH)
      ? {
          key: SSL_KEY_PATH,
          cert: SSL_CERT_PATH
        }
      : false

  if (!httpsOptions) {
    console.warn('[devServer] 未检测到 SSL 证书，已自动使用 HTTP')
  }
} else {
  console.log(`[devServer] 运行环境: ${RUNTIME_ENV}, 跳过 SSL 证书检查`)
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  /**
   * 添加 Pinia 状态管理
   */
  modules: [
    '@pinia/nuxt'
  ],

  app: {
    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/jpeg',
          href: '/LOGO.jpg'
        }
      ]
    }
  },

  /**
   * 全局CSS配置 - 确保CSS在页面加载时立即可用
   */
  css: [
    '~/assets/css/ios26-style.css'
  ],

  /**
   * Nuxt Dev Server 配置
   */
  devServer: {
    host: DEV_DOMAIN, // 只监听域名
    port: 3000,
    https: httpsOptions
  },

  /**
   * 额外保险：限制 Vite 仅接受该域名访问
   */
  vite: {
    server: {
      host: DEV_DOMAIN,
      allowedHosts: [DEV_DOMAIN]
    }
  }
})