// stores/language.ts
import { defineStore } from 'pinia'

export const useLanguageStore = defineStore('language', {
  state: () => ({
    currentLanguage: '简体中文', // 默认语言
  }),

  actions: {
    setLanguage(language: string) {
      this.currentLanguage = language
      // 保存到 localStorage 以便在页面刷新后保持语言选择
      if (process.client) {
        localStorage.setItem('language', language)
      }
    },

    // 初始化语言，从 localStorage 中恢复或使用默认值
    initLanguage() {
      if (process.client) {
        const savedLanguage = localStorage.getItem('language')
        if (savedLanguage && this.isValidLanguage(savedLanguage)) {
          this.currentLanguage = savedLanguage
        } else {
          // 检查浏览器语言设置
          const browserLang = this.getBrowserLanguage()
          if (browserLang && this.isValidLanguage(browserLang)) {
            this.currentLanguage = browserLang
          }
        }
      }
    },

    // 验证语言是否为支持的语言
    isValidLanguage(language: string) {
      const supportedLanguages = ['简体中文', '繁体中文', 'English', '日本語']
      return supportedLanguages.includes(language)
    },

    // 根据浏览器语言设置返回对应的语言
    getBrowserLanguage() {
      if (process.client) {
        const browserLang = navigator.language || navigator.languages[0]
        if (browserLang?.startsWith('zh-TW')) {
          return '繁体中文'
        } else if (browserLang?.startsWith('zh')) {
          return '简体中文'
        } else if (browserLang?.startsWith('en')) {
          return 'English'
        } else if (browserLang?.startsWith('ja') || browserLang?.startsWith('jp')) {
          return '日本語'
        }
      }
      return null
    }
  }
})