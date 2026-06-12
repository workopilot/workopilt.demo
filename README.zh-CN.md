# 喔壳开放能力演示系统 (`wise.demo`)

[English](./README.md) | 简体中文

---

## 🌐 关于喔壳 (Workopilot)

[喔壳官网](https://www.workopilot.com/) | [喔壳平台](https://agent.workopilot.com/) | [API 开发文档](http://docs.workopilot.com/en/api/)

**喔壳 (Workopilot)** 是一款企业级 AI Agent 开放平台，致力于将前沿的大语言模型（LLM）能力与物理设备、业务系统以及网页应用进行深度连接。企业能借助喔壳快速构建和部署具备对话交流、系统接口调用与硬件操控能力的“数字员工”，实现复杂业务流的高效自动化。

本仓库（`wise.demo`）为**官方集成开发示例代码**，旨在帮助开发者快速掌握喔壳平台的各项能力接口。

### 喔壳如何服务三类开发者：

1. **智能服务 API 集成者（后端/系统开发者）**
   * **应用场景**：直接通过标准 HTTP REST API 调用喔壳高价值的内置 AI 算法（如文件识别分类、信息抽取、合同条款风险审核等）。
   * **核心价值**：快速为存量业务系统、审批流赋能，仅需关注 JSON 数据的输入与输出，无需关心底座模型的提示词设计与算力托管。
2. **交互式页面嵌入者（前端/SaaS 网页开发者）**
   * **应用场景**：利用 iframe 引入喔壳数字员工对话面板，并通过双向 postMessage 安全通信协议进行上下文同步与前端交互。
   * **核心价值**：可向数字员工注入前端宿主动作（Host Actions），使 Agent 能直接操控当前浏览器页面（如自动填表、弹出对话框、发起提交等），实现流畅的人机协同。
3. **IoT 与硬件终端开发者（嵌入式/硬件开发者）**
   * **应用场景**：将智能 POS 机、收银大屏、语音交互盒子等硬件终端与喔壳语音 Agent 进行对接。
   * **核心价值**：将终端物理操作（如控制 LED 状态灯、检索本地文件、驱动热敏打印机、查询硬件传感器状态）封装为 Agent 的本地工具，让 AI 深入实体服务场景，实现智能的物理操控。

---

`wise.demo` 是面向外部开发者的喔壳（Wise）开放能力官方演示包。本项目通过多个逼真的业务场景，向开发者说明如何接入和使用喔壳的**数字员工（Agent）**、**文件分类与数据抽取**、**合同条款审核**、**iframe 嵌入通信**以及**宿主动作（Host Action）注入**等核心能力。

本项目提供了一个开箱即用、交互精致的 Vue 3 前端系统，包含完整的开发规范和连接脚手架。项目默认采用 **Mock 优先** 策略，方便开发者零配置直接体验完整的数据交互流程和嵌入协议，之后只需简单配置密钥即可无缝切换到真实接口。

---

## 🚀 核心功能与演示场景

### 1. 智能服务集成（采购单自动创建）
* **合同识别与分类**：上传供应商采购合同（支持 PDF、Word、图片），调用喔壳分类取数服务自动提取供应商、合同金额、条款和采购明细。
* **数据自动回填**：解析非结构化文件，并将结构化字段自动填充进采购单和明细表格中。
* **合同合规审核**：一键调用喔壳合同审核服务，智能识别付款条款、验收节点及违约责任中的风险项，生成审核报告。

### 2. 嵌入式数字员工（客户商机协同）
* **iframe 嵌入与上下文感知**：在页面右下角嵌入数字员工浮层，宿主页面在 iframe 加载就绪后自动注入企业租户、当前用户及商机上下文。
* **双向安全通信**：基于 postMessage 建立双向安全通信通道。
* **前端动作（Host Action）注入**：向数字员工注册 `saveOpportunity`（保存商机表单）和 `submitOpportunity`（提交商机）动作。数字员工可在对话中根据用户诉求直接调用这些宿主动作，实现全自动的表单回填和一键提交。

### 3. 设备端语音助手（IoT 拟物终端）
* **拟物硬件界面**：采用 iPad 式拟物终端交互界面，模拟语音硬件终端的交互环境。
* **语音优先数字员工**：嵌入设备专用数字员工，启动后优先进入双向实时语音通话模式。
* **设备宿主工具（Tools）绑定**：注册并绑定设备本地工具（如灯控 `turnOnLight`/`turnOffLight`、文件检索 `searchDeviceFiles`、扫描打印 `printFile` 以及设备状态查询 `getDeviceStatus`）。数字员工能够调用这些工具实现软硬件一体化协作，控制物理设备并回传实时状态。

### 4. 平台内嵌对接（SSO 单点登录与业务卡片）
* **URL 参数捕获**：演示作为喔壳系统卡片或应用内嵌时，如何捕获 URL Query String 携带的会话凭证（`runtimeToken`、`userId`、`tenantId`、`sessionId`）。
* **用户信息与权限同步**：在前端利用捕获的 `runtimeToken`，结合配置的 `API Key` 向后端接口发送请求，获取该用户在喔壳系统内的真实 Profile 属性与租户范围。

### 5. 全局中英文多语言 (i18n)
* 系统所有菜单、演示页面、交互日志、状态看板均实现了**中英文双语**完整支持，并且支持基于 `localStorage` 的本地持久化存储。

---

## 🛠️ 技术选型

* **核心框架**：[Vue 3](https://vuejs.org/) (Composition API，`<script setup>` 风格)
* **构建工具**：[Vite](https://vitejs.dev/)
* **样式布局**：[Tailwind CSS](https://tailwindcss.com/)
* **图标库**：[Lucide Vue](https://lucide.dev/)
* **开发语言**：[TypeScript](https://www.typescriptlang.org/)
* **国际化方案**：支持本地持久化的响应式轻量级 i18n 管理器。

---

## 📂 目录结构

```text
wise.demo/
├── src/
│   ├── main.ts              # 应用入口
│   ├── App.vue              # 根组件与路由分流
│   ├── assets/              # 静态 SVG 头像及 Mock 样例文件
│   ├── components/          # 可复用 UI 基础组件 (Button, Card, Input, Table 等)
│   ├── config/              # 运行时配置
│   ├── demos/               # 核心能力演示页面
│   │   ├── IntegrationGuideDemo.vue     # 互动式接入架构指南
│   │   ├── PurchaseOrderDemo.vue        # 智能服务集成（采购提取与审核）
│   │   ├── OpportunityAgentDemo.vue     # 数字员工页面嵌入（iframe 动作注入）
│   │   ├── DeviceTerminalDemo.vue       # 设备端语音终端模拟（设备工具绑定）
│   │   ├── PlatformIntegrationPage.vue  # SSO 单点登录与卡片参数解析页面
│   │   └── PlatformConfigDemo.vue       # API 密钥与连接地址设置
│   ├── lib/                 # 核心公共库
│   │   ├── i18n.ts          # 多语言管理器
│   │   ├── mock-api.ts      # 结构化 Mock 数据集
│   │   ├── platform-config.ts # 本地连接配置管理器
│   │   ├── utils.ts         # 辅助工具函数
│   │   ├── wise-api.ts      # 喔壳开放接口封装
│   │   └── wise-embed-protocol.ts # iframe 通信协议封装
│   └── locales/             # 语言包定义
│       ├── zh.ts            # 中文包
│       └── en.ts            # 英文包
├── vite.config.ts           # Vite 开发服务器与反向代理配置
├── tailwind.config.ts       # Tailwind CSS 主题配置
├── tsconfig.json            # TypeScript 配置
└── package.json             # NPM 依赖与执行脚本
```

---

## 💻 本地开发与启动

### 1. 克隆仓库
确保您的系统已安装 Git，执行以下命令下载项目：
```bash
git clone git@github.com:workopilot/workopilt.demo.git
cd workopilt.demo
```

### 2. 安装项目依赖
```bash
npm install
```

### 3. 运行本地开发服务器
```bash
npm run dev
```
启动成功后，在浏览器中访问：
```text
http://localhost:5177
```

### 4. 生产环境打包
如需将项目打包构建以用于部署：
```bash
npm run build
```

---

> [!IMPORTANT]
> **安全与生产环境部署建议**：
> 在本演示项目中，所有对喔壳开放接口的调用都是**直接在前端浏览器中发起**的（通过 Vite 开发代理进行转发），这仅用于简化 Demo 运行和本地调试。
> **在实际生产部署中，建议您必须从您的后端服务（Server-to-Server）调用喔壳的接口**。在前端直接配置或暴露长期有效的 API Key 会带来严重的安全泄露风险。推荐的生产安全架构是：您的前端只与您自己的后端系统进行通信，由后端系统安全地保存 API 密钥并代理向喔壳平台发起请求。

---

## ⚙️ 真实接口代理配置

在本地联调喔壳开放接口时，为了规避浏览器的同源策略（CORS 跨域限制），您需要将请求发送给本地开发服务器，由本地反向代理转发给喔壳服务器。

### 配置步骤
1. 打开演示系统的 **配置平台连接信息（Platform Config）** 页面。
2. 录入您的喔壳开放平台 **API Key**（可在喔壳开放平台控制台或系统设置中获取）。
3. 确保 **Base URL** 指向默认域名 `https://agent.workopilot.com`。
4. 重新启动本地 Vite 开发服务器 (`npm run dev`)。系统会自动读取 [vite.config.ts](file:///e:/work/git2026/agent_platform/wise.demo/vite.config.ts) 中配置的反向代理规则：
   ```ts
   server: {
     port: 5177,
     proxy: {
       '/api': {
         target: 'https://agent.workopilot.com',
         changeOrigin: true,
         secure: false,
       },
       '/net-api': {
         target: 'https://agent.workopilot.com',
         changeOrigin: true,
         secure: false,
       }
     }
   }
   ```
5. 所有指向默认 Base URL 的前端请求都会被本地拦截并转化为相对路径 `/api/...` 和 `/net-api/...` 发送，由本地 Vite 服务进行转发，从而彻底绕过浏览器的跨域拦截。

---

## 📖 推荐接入推进流程

1. **阅读架构指南**：在 **对接说明 (Integration Guide)** 页面了解智能服务 API 与嵌入式数字员工的区别，确定符合您业务系统的接入路线。
2. **体验 Mock 演示**：运行本地服务，使用 Mock 数据测试数据联动、表单填充、HMR 通信和设备通话，熟悉整体用户体验。
3. **设置连接密钥**：在 **配置（Platform Config）** 中录入 API 密钥与地址。
4. **验证真实接口**：设置 `MOCK_ENABLED = false` 或触发真实接口动作，联调并测试合同提取、风险审核、SSO 参数捕获以及用户信息同步。
5. **端到端接入**：将您在喔壳平台配置的专属数字员工嵌入链接填入配置页，在商机页面和设备终端测试双向 `host-action` 调用和拟物硬件控制。

---

## 📄 授权协议
本项目基于 MIT 协议分发，详情请参阅 [LICENSE](LICENSE)。
