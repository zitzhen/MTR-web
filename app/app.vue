<template>
  <div class="app-container">
    <NavigationBar />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import NavigationBar from '~/components/navigation_bar.vue'
import { onMounted } from 'vue'

// 动态加载CSS样式
const loadCSS = (href) => {
  return new Promise((resolve, reject) => {
    // 检查是否已加载相同的CSS
    const existingLink = document.querySelector(`link[href*="${href.split('/').pop()}"]`)
    if (existingLink) {
      existingLink.remove() // 移除旧的样式链接
    }
    
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = href
    
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`))
    
    document.head.appendChild(link)
  })
}

// 移除已加载的CSS
const removeCSS = (fileName) => {
  const existingLink = document.querySelector(`link[href*="${fileName}"]`)
  if (existingLink) {
    existingLink.remove()
  }
}

onMounted(async () => {
  try {
    // 从配置文件获取样式设置
    const config = await $fetch('/configuration.json')
    const style = config?.style

    // 根据style值应用不同的样式
    if (style === '3') {
      // 移除默认的ios26样式并加载aero样式
      removeCSS('ios26-style') // 移除ios26样式
      await loadCSS('/assets/css/aero-style.css')
    } else {
      // 如果不是style 3，则确保加载默认的ios26样式
      removeCSS('aero-style') // 移除aero样式（如果已加载）
      // Nuxt会自动加载ios26-style.css，无需额外操作
    }
  } catch (error) {
    console.error('Failed to load configuration or apply styles:', error)
    // 如果加载失败，保持默认样式
  }
})
</script>