# MTR-web
## 项目简介
MTR-web是一个提供给游玩minecraft玩家，特别是玩Mtr Mod的，给你们提供的游戏服务器官网。包含SSR功能，SEO友好等特点。
本项目已于2026.1.10 16时左右开源。
## 技术栈
- Nuxt.js 4.2.2
- Vue 3.5.26

## 样式
在MTR-Web 中，您可以通过修改`configuration.json`文件来切换当前样式。
```json
"style":"1",
```
修改此键。
### 样式表
|编号|样式|
|--|--|
|1|IOS26(轻度液态)|
|2|Material Design|

## 调试
使用以下命令
```bash
npm run dev
```
如果您需要HTTPS调试，请生成包含`mtr-web.test`的证书并命名为
- `server.crt`
- `server.key`
  
>[!caution]
>请勿将您的证书上传到Git（版本控制）

请在您计算机中的Host文件中增加此段
```text
127.0.0.1 mtr-web.test
```
