<template>
  <div class="copyright-page">

    <!-- Page Title -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">{{ getLocalizedText('copyrightTitle') }}</h1>
        <p class="page-subtitle">{{ getLocalizedText('copyrightSubtitle') }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container">
      <div class="copyright-container">
        <div class="copyright-content">
          <h2 class="section-title">{{ getLocalizedText('licenseInfo') }}</h2>
          
          <div class="license-section">
            <h3>{{ getLocalizedText('mitLicense') }}</h3>
            <p>{{ getLocalizedText('licenseDescription') }}</p>
            
            <div class="license-terms">
              <h4>{{ getLocalizedText('permissions') }}:</h4>
              <ul>
                <li>{{ getLocalizedText('commercialUse') }}</li>
                <li>{{ getLocalizedText('modify') }}</li>
                <li>{{ getLocalizedText('distribute') }}</li>
                <li>{{ getLocalizedText('privateUse') }}</li>
              </ul>
              
              <h4>{{ getLocalizedText('conditions') }}:</h4>
              <ul>
                <li>{{ getLocalizedText('licenseNotice') }}</li>
                <li>{{ getLocalizedText('copyrightNotice') }}</li>
              </ul>
              
              <h4>{{ getLocalizedText('limitations') }}:</h4>
              <ul>
                <li>{{ getLocalizedText('noWarranty') }}</li>
                <li>{{ getLocalizedText('noLiability') }}</li>
              </ul>
            </div>
          </div>
          
          <div class="copyright-notice">
            <h3>{{ getLocalizedText('copyrightNoticeTitle') }}</h3>
            <p>{{ getLocalizedText('copyrightNoticeText') }}</p>
            
            <div class="derivative-warning">
              <h4>{{ getLocalizedText('derivativeWarningTitle') }}</h4>
              <p>{{ getLocalizedText('derivativeWarningText') }}</p>
            </div>
          </div>
          
          <div class="template-info">
            <h3>{{ getLocalizedText('templateInfoTitle') }}</h3>
            <p>{{ getLocalizedText('templateInfoText') }}</p>
          </div>
          
          <div class="creator-info">
            <h3>{{ getLocalizedText('creatorInfoTitle') }}</h3>
            <div class="creator-details">
              <p><strong>{{ getLocalizedText('creatorNameLabel') }}:</strong> {{ getLocalizedText('localizedCreatorName') }}</p>
              <p><strong>{{ getLocalizedText('github') }}:</strong> <a href="https://github.com/Iamliuxiaozhen" target="_blank">Iamliuxiaozhen</a></p>
              <p><strong>{{ getLocalizedText('sourceProject') }}:</strong> <a href="https://github.com/zitzhen/MTR-web" target="_blank">https://github.com/zitzhen/MTR-web</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '~~/stores/language'
import { storeToRefs } from 'pinia'
import { usePageTitle } from '~/composables/usePageTitle'

// 设置动态页面标题和描述
usePageTitle({
  key: 'copyright',
  descriptionKey: 'copyright',
  defaultTitle: '版权声明',
  defaultDescription: 'MTR交通局网站的版权声明和许可证信息',
  suffix: 'MTR'
})

const languageStore = useLanguageStore()
const { currentLanguage } = storeToRefs(languageStore)

// Use useAsyncData with correct path handling for server-side
const { data: configData } = await useAsyncData('config', async () => {
  try {
    // For server-side, we need to fetch from the public directory directly
    if (process.server) {
      // Running on server - access file directly
      const fs = await import('fs')
      const path = await import('path')
      const configPath = path.resolve(process.cwd(), 'public', 'configuration.json')
      if (fs.existsSync(configPath)) {
        const configFile = fs.readFileSync(configPath, 'utf-8')
        return JSON.parse(configFile)
      } else {
        console.error('Configuration file does not exist at:', configPath)
        return { city_name: 'Error', color: '#0047AB' }
      }
    } else {
      // Running on client - use $fetch
      const config = await $fetch('/configuration.json')
      return config
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
    'home': {
      '简体中文': '首页',
      '繁体中文': '首頁',
      'English': 'Home',
      '日本語': 'ホーム'
    },
    'subwayLines': {
      '简体中文': '地铁线路',
      '繁体中文': '地鐵路線',
      'English': 'Subway Lines',
      '日本語': '地下鉄路線'
    },
    'stationInfo': {
      '简体中文': '站点信息',
      '繁体中文': '站點資訊',
      'English': 'Station Info',
      '日本語': '駅情報'
    },
    'schedule': {
      '简体中文': '时刻表',
      '繁体中文': '時刻表',
      'English': 'Schedule',
      '日本語': '時刻表'
    },
    'copyrightTitle': {
      '简体中文': '版权声明',
      '繁体中文': '版權聲明',
      'English': 'Copyright Notice',
      '日本語': '著作権表示'
    },
    'copyrightSubtitle': {
      '简体中文': '本项目基于MIT许可证开源',
      '繁体中文': '本項目基於MIT許可證開源',
      'English': 'This project is open-sourced under the MIT License',
      '日本語': 'このプロジェクトはMITライセンスのもとでオープンソース化されています'
    },
    'licenseInfo': {
      '简体中文': '许可证信息',
      '繁体中文': '許可證資訊',
      'English': 'License Information',
      '日本語': 'ライセンス情報'
    },
    'mitLicense': {
      '简体中文': 'MIT许可证',
      '繁体中文': 'MIT許可證',
      'English': 'MIT License',
      '日本語': 'MITライセンス'
    },
    'licenseDescription': {
      '简体中文': 'MIT许可证是一项宽松的开源许可证，允许在专有软件中使用、修改、合并和分发，前提是包含原始版权通知和许可证声明。',
      '繁体中文': 'MIT許可證是一項寬鬆的開源許可證，允許在專有軟件中使用、修改、合併和分發，前提是包含原始版權通知和許可證聲明。',
      'English': 'The MIT License is a permissive open source license that allows using, modifying, merging, and distributing the software, provided the original copyright notice and license disclaimer are included.',
      '日本語': 'MITライセンスは、元の著作権表示とライセンス表示を含める限り、ソフトウェアの使用、変更、マージ、配布を許可する緩やかなオープンソースライセンスです。'
    },
    'permissions': {
      '简体中文': '权限',
      '繁体中文': '權限',
      'English': 'Permissions',
      '日本語': '権限'
    },
    'commercialUse': {
      '简体中文': '商业使用 - 可以用于商业项目',
      '繁体中文': '商業使用 - 可以用於商業項目',
      'English': 'Commercial Use - Can be used in commercial projects',
      '日本語': '商用利用 - 商用プロジェクトで使用可能'
    },
    'modify': {
      '简体中文': '修改 - 可以修改源代码',
      '繁体中文': '修改 - 可以修改原始碼',
      'English': 'Modification - Source code can be modified',
      '日本語': '変更 - ソースコードを変更可能'
    },
    'distribute': {
      '简体中文': '分发 - 可以分发软件',
      '繁体中文': '分發 - 可以分發軟件',
      'English': 'Distribution - Software can be distributed',
      '日本語': '配布 - ソフトウェアを配布可能'
    },
    'privateUse': {
      '简体中文': '私用 - 可以私下使用',
      '繁体中文': '私用 - 可以私下使用',
      'English': 'Private Use - Can be used privately',
      '日本語': '私的使用 - 私的に使用可能'
    },
    'conditions': {
      '简体中文': '条件',
      '繁体中文': '條件',
      'English': 'Conditions',
      '日本語': '条件'
    },
    'licenseNotice': {
      '简体中文': '许可证声明 - 必须包含许可证副本',
      '繁体中文': '許可證聲明 - 必須包含許可證副本',
      'English': 'License Notice - License copy must be included',
      '日本語': 'ライセンス表示 - ライセンスのコピーを含める必要があります'
    },
    'copyrightNotice': {
      '简体中文': '版权声明 - 必须包含版权声明',
      '繁体中文': '版權聲明 - 必須包含版權聲明',
      'English': 'Copyright Notice - Copyright notice must be included',
      '日本語': '著作権表示 - 著作権表示を含める必要があります'
    },
    'limitations': {
      '简体中文': '限制',
      '繁体中文': '限制',
      'English': 'Limitations',
      '日本語': '制限'
    },
    'noWarranty': {
      '简体中文': '无担保 - 软件按"原样"提供，不提供任何担保',
      '繁体中文': '無擔保 - 軟件按"原樣"提供，不提供任何擔保',
      'English': 'No Warranty - Software is provided "as is" without warranty',
      '日本語': '保証なし - ソフトウェアは「現状のまま」提供され、一切の保証はありません'
    },
    'noLiability': {
      '简体中文': '无责任 - 作者对软件使用不承担任何责任',
      '繁体中文': '無責任 - 作者對軟件使用不承擔任何責任',
      'English': 'No Liability - Authors are not liable for software use',
      '日本語': '責任なし - 作者はソフトウェア使用について一切の責任を負いません'
    },
    'copyrightNoticeTitle': {
      '简体中文': '版权声明',
      '繁体中文': '版權聲明',
      'English': 'Copyright Notice',
      '日本語': '著作権表示'
    },
    'copyrightNoticeText': {
      '简体中文': '本项目是一个开源的地铁信息展示网站模板，旨在为城市交通部门提供现代化的网站解决方案。',
      '繁体中文': '本項目是一個開源的地鐵資訊展示網站模板，旨在為城市交通部門提供現代化的網站解決方案。',
      'English': 'This project is an open-source subway information display website template designed to provide modern website solutions for city transportation departments.',
      '日本語': 'このプロジェクトは、都市交通部門に現代的なウェブサイトソリューションを提供することを目的とした、オープンソースの地下鉄情報表示ウェブサイトテンプレートです。'
    },
    'derivativeWarningTitle': {
      '简体中文': '重要提醒',
      '繁体中文': '重要提醒',
      'English': 'Important Notice',
      '日本語': '重要なお知らせ'
    },
    'derivativeWarningText': {
      '简体中文': '任何基于本项目创建的衍生作品都不得删除此版权声明页面。此页面必须在所有衍生作品中保留。',
      '繁体中文': '任何基於本項目創建的衍生作品都不得刪除此版權聲明頁面。此頁面必須在所有衍生作品中保留。',
      'English': 'Any derivative works created based on this project must not remove this copyright notice page. This page must be preserved in all derivative works.',
      '日本語': 'このプロジェクトに基づいて作成されたすべての派生物では、この著作権表示ページを削除してはいけません。このページはすべての派生物に保存する必要があります。'
    },
    'templateInfoTitle': {
      '简体中文': '模板信息',
      '繁体中文': '模板資訊',
      'English': 'Template Information',
      '日本語': 'テンプレート情報'
    },
    'templateInfoText': {
      '简体中文': '这是一个通用的交通信息网站模板，可以根据需要进行定制以适应不同的城市和交通系统。模板使用Nuxt.js构建，支持多语言和响应式设计。',
      '繁体中文': '這是一個通用的交通資訊網站模板，可以根據需要進行定制以適應不同的城市和交通系統。模板使用Nuxt.js構建，支援多語言和響應式設計。',
      'English': 'This is a generic transportation information website template that can be customized as needed to adapt to different cities and transportation systems. The template is built with Nuxt.js and supports multi-language and responsive design.',
      '日本語': 'これは一般的な交通情報ウェブサイトテンプレートで、さまざまな都市や交通システムに合わせてカスタマイズできます。テンプレートはNuxt.jsで構築されており、多言語対応とレスポンシブデザインをサポートしています。'
    },
    'creatorInfoTitle': {
      '简体中文': '源创作者信息',
      '繁体中文': '源創作者資訊',
      'English': 'Creator Information',
      '日本語': '制作者情報'
    },
    'chineseName': {
      '简体中文': '中文名',
      '繁体中文': '中文名',
      'English': 'Chinese Name',
      '日本語': '中国語名'
    },
    'englishName': {
      '简体中文': '英文名',
      '繁体中文': '英文名',
      'English': 'English Name',
      '日本語': '英語名'
    },
    'japaneseName': {
      '简体中文': '日文名',
      '繁体中文': '日文名',
      'English': 'Japanese Name',
      '日本語': '日本語名'
    },
    'github': {
      '简体中文': 'GitHub',
      '繁体中文': 'GitHub',
      'English': 'GitHub',
      '日本語': 'GitHub'
    },
    'creatorName': {
      '简体中文': '刘小圳',
      '繁体中文': '劉小圳',
      'English': '刘小圳',
      '日本語': '劉小圳'
    },
    'creatorEnglishName': {
      '简体中文': 'Oliver',
      '繁体中文': 'Oliver',
      'English': 'Oliver',
      '日本語': 'Oliver'
    },
    'creatorNameLabel': {
      '简体中文': '创作者',
      '繁体中文': '創作者',
      'English': 'Creator',
      '日本語': '制作者'
    },
    'localizedCreatorName': {
      '简体中文': '刘小圳',
      '繁体中文': '劉小圳',
      'English': 'Oliver',
      '日本語': 'Oliver'
    },
    'sourceProject': {
      '简体中文': '源项目',
      '繁体中文': '源項目',
      'English': 'Source Project',
      '日本語': 'ソースプロジェクト'
    },
    'derivativeWarningText': {
      '简体中文': '任何基于本项目创建的衍生作品都不得删除原创作者信息，只允许在保留原始作者信息的基础上添加新的贡献者信息。',
      '繁体中文': '任何基於本項目創建的衍生作品都不得刪除原創作者資訊，只允許在保留原始作者資訊的基礎上添加新的貢獻者資訊。',
      'English': 'Any derivative works created based on this project must not remove the original author information; only additional contributor information may be added while preserving the original author credits.',
      '日本語': 'このプロジェクトに基づいて作成されたすべての派生物では、元の作成者情報を削除してはいけません。元の作成者情報を保持したまま、新しい貢献者情報を追加することのみが許可されます。'
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

/* Page Header styles - Liquid Glass effect */
.page-header {
  background-color: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  padding: 20px 0;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 0 0 24px 24px;
  margin: 0 15px 0 15px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.12),
              inset 0 2px 2px rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.page-header:hover {
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(35px) saturate(180%);
  -webkit-backdrop-filter: blur(35px) saturate(180%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 24px;
  color: var(--ios-text-primary);
  margin: 0 0 5px 0;
  font-weight: 600;
}

.page-subtitle {
  font-size: 14px;
  color: var(--ios-text-secondary);
  margin: 0;
}

/* Copyright Container styles */
.copyright-container {
  margin-top: 20px;
}

.copyright-content {
  background-color: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border-radius: var(--ios-card-radius);
  padding: 32px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.12),
              inset 0 2px 2px rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: all 0.3s ease;
}

.copyright-content:hover {
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(35px) saturate(180%);
  -webkit-backdrop-filter: blur(35px) saturate(180%);
}

.section-title {
  font-size: 20px;
  color: var(--ios-text-primary);
  margin: 0 0 20px 0;
  font-weight: 600;
}

.license-section, .copyright-notice, .template-info {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.license-section:last-child,
.copyright-notice:last-child,
.template-info:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.license-section h3,
.copyright-notice h3,
.template-info h3 {
  color: var(--ios-text-primary);
  margin: 0 0 15px 0;
  font-size: 18px;
  font-weight: 600;
}

.license-section p,
.copyright-notice p,
.template-info p {
  color: var(--ios-text-primary);
  line-height: 1.6;
  margin-bottom: 15px;
}

.license-terms h4 {
  color: var(--ios-text-primary);
  margin: 15px 0 10px 0;
  font-size: 16px;
  font-weight: 600;
}

.license-terms ul {
  padding-left: 20px;
  margin: 10px 0;
}

.license-terms li {
  margin-bottom: 8px;
  color: var(--ios-text-primary);
  line-height: 1.5;
}

.derivative-warning {
  background-color: rgba(255, 193, 7, 0.15);
  border-left: 4px solid #FFCC00;
  padding: 16px;
  margin-top: 15px;
  border-radius: 8px;
}

.derivative-warning h4 {
  color: #FF9500;
  margin: 0 0 10px 0;
}

.derivative-warning p {
  color: var(--ios-text-primary);
  margin: 0;
  line-height: 1.5;
}

.creator-info {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.creator-info h3 {
  color: var(--ios-text-primary);
  margin: 0 0 15px 0;
  font-size: 18px;
  font-weight: 600;
}

.creator-details p {
  margin: 8px 0;
  color: var(--ios-text-primary);
  line-height: 1.5;
}

.creator-details a {
  color: var(--ios-primary);
  text-decoration: none;
}

.creator-details a:hover {
  text-decoration: underline;
}

/* Tablet responsiveness */
@media (min-width: 481px) and (max-width: 768px) {
  .page-title {
    font-size: 22px;
  }
  
  .page-header {
    margin: 0 10px 0 10px;
  }
  
  .copyright-content {
    padding: 28px;
  }
}

/* PC responsiveness */
@media (min-width: 769px) {
  .page-title {
    font-size: 26px;
  }
  
  .page-subtitle {
    font-size: 15px;
  }
  
  .section-title {
    font-size: 21px;
  }
  
  .copyright-content {
    padding: 36px;
  }
  
  .license-section h3,
  .copyright-notice h3,
  .template-info h3 {
    font-size: 19px;
  }
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .container {
    padding: 0 12px;
  }
  
  .page-title {
    font-size: 21px;
  }
  
  .page-subtitle {
    font-size: 13px;
  }
  
  .section-title {
    font-size: 19px;
  }
  
  .copyright-content {
    padding: 22px;
  }
  
  .page-header {
    margin: 0 8px 0 8px;
  }
  
  .license-terms h4 {
    font-size: 15px;
  }
  
  .derivative-warning {
    padding: 12px;
  }
}
</style>