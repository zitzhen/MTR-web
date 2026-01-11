//@ts-nocheck
import { existsSync } from 'fs'
import { resolve } from 'path'

/**
 * 仅允许用于开发调试的域名
 */
const DEV_DOMAIN = 'mtr-web.test'

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
const httpsOptions =
  existsSync(SSL_KEY_PATH) && existsSync(SSL_CERT_PATH)
    ? {
        key: SSL_KEY_PATH,
        cert: SSL_CERT_PATH
      }
    : false

if (!httpsOptions) {
  console.warn('[devServer] 未检测到 SSL 证书，已自动使用 HTTP')
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