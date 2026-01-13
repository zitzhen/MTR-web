# 环境变量配置说明

## 运行环境配置

本项目支持两种运行环境：`nodejs` 和 `cloudflare`，通过环境变量 `RUNTIME_ENV` 进行配置。

### 设置环境变量

#### 方法1：使用 .env 文件
在项目根目录创建 `.env` 文件：

```bash
# .env
RUNTIME_ENV=nodejs
# 或者
RUNTIME_ENV=cloudflare
```

#### 方法2：运行时设置
```bash
# Node.js 环境
RUNTIME_ENV=nodejs npm run dev
RUNTIME_ENV=nodejs npm run build

# Cloudflare 环境
RUNTIME_ENV=cloudflare npm run dev
RUNTIME_ENV=cloudflare npm run build
```

### 环境差异

不同运行环境下的 API 支持情况：

| API | Node.js | Cloudflare |
|-----|---------|----------|
| fs 模块 | ✅ 支持 | ❌ 不支持，使用 HTTP 请求替代 |
| path 模块 | ✅ 支持 | ⚠️ 部分支持，使用通用实现 |
| process.cwd() | ✅ 支持 | ⚠️ 回退到 "/" |
| 文件系统操作 | ✅ 支持 | ❌ 不支持，使用 KV 或 HTTP 替代 |

### 代码实现

项目中的 `useRuntimeEnv.ts` 提供了以下环境适配函数：

- `isNodeRuntime()` - 检查是否为 Node.js 环境
- `isCloudflareRuntime()` - 检查是否为 Cloudflare 环境
- `readConfigFile()` - 通用配置文件读取
- `checkFileExists()` - 通用文件存在检查
- `joinPath()` - 通用路径连接
- `resolvePath()` - 通用路径解析
- `getCurrentWorkingDirectory()` - 获取当前工作目录

### 配置文件获取

在 `useConfig.ts` 中实现了环境自适应的配置文件获取逻辑：
- Node.js 环境：优先使用文件系统读取，回退到 HTTP 请求
- Cloudflare 环境：使用 HTTP 请求获取配置文件

### Cloudflare 部署

当部署到 Cloudflare Workers 时：
1. 设置 `RUNTIME_ENV=cloudflare`
2. 配置文件将通过 HTTP 请求获取
3. 避免使用 Node.js 特定的 API

### 运行项目

```bash
# 开发模式
npm run dev

# 构建项目
npm run build

# 预览构建结果
npm run preview
```