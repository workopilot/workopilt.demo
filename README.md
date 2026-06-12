# Wise Open Capability Demo (`wise.demo`)

English | [简体中文](./README.zh-CN.md)

`wise.demo` is an open capability demonstration package designed for developers. It showcases how to integrate and connect with **Wise** AI capabilities, including **Digital Employees (Agents)**, **Document Classification & Extraction**, **Contract Risk Auditing**, **iframe Embedding**, and **Host Action Injection** under realistic business scenarios.

The project provides interactive, fully-functional frontend demos, detailed architectural guides, and connection templates. By default, it features a **Mock-First** mode, allowing developers to understand UI interactions, data flows, and message protocols instantly, then switch to real API connections via simple configuration.

---

## 🚀 Key Features & Demos

### 1. Service Integration (Purchase Order Creation)
* **Doc Classification & Extraction**: Upload a purchase contract (PDF, Word, Image) and call Wise intelligent extraction services to extract supplier info, contract details, and purchase items.
* **Automated Data Autofill**: Parse the unstructured contract and auto-populate purchase orders and detail lists.
* **Contract Risk Auditing**: Run AI contract auditing to scan and list legal, payment, and breach risk clauses.

### 2. Embedded Digital Employee (Customer Opportunity Form)
* **iframe Embed & Synchronization**: Load the Wise Agent chat panel inside a host page via iframe and automatically synchronize tenant, user context, and metadata.
* **Bidirectional Communication**: Establish secure parent-iframe postMessage channels.
* **Host Action Injection**: Register custom frontend actions like `saveOpportunity` and `submitOpportunity`. The AI can dynamically trigger these actions based on conversations, autofilling CRM/SFA forms and submitting them automatically.

### 3. Voice Physical Terminal (IoT Device Integration)
* **Mimic Hardware UI**: A realistic iPad terminal interface that simulates voice-enabled IoT screen terminals.
* **Voice-First Agent**: Embeds a dedicated voice Agent that automatically triggers microphone/voice panel on boot.
* **Hardware Tool Execution**: Registers local device tools (like LED lighting `turnOnLight`/`turnOffLight`, document search `searchDeviceFiles`, printing `printFile`, and status sync `getDeviceStatus`). The AI Agent can invoke these tools to control physical hardware and report real-time status.

### 4. Platform Embedded Page (SSO & Card Integration)
* **SSO Parameter Capture**: Demonstrates capturing URL query parameters (`runtimeToken`, `userId`, `tenantId`, `sessionId`) when loaded as a card or app inside the Wise platform.
* **Profile Synchronization**: Communicates with the Wise backend using `runtimeToken` and `API-Key` to pull real user profiles and tenant permissions.

### 5. Multi-language Support (i18n)
* Full translation of all menus, pages, logs, and interactive UI states into **English** and **Chinese**, complete with localized persistence (`localStorage`).

---

## 🛠️ Technology Stack

* **Core Framework**: [Vue 3](https://vuejs.org/) (Composition API with `<script setup>`)
* **Build Tool**: [Vite](https://vitejs.dev/)
* **CSS & Layout**: [Tailwind CSS](https://tailwindcss.com/)
* **Icons**: [Lucide Vue](https://lucide.dev/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Internationalization**: Lightweight custom i18n manager with local persistence.

---

## 📂 Directory Structure

```text
wise.demo/
├── src/
│   ├── main.ts              # Application entry point
│   ├── App.vue              # Root layout & route switcher
│   ├── assets/              # Static SVG avatars & mock files
│   ├── components/          # Reusable UI components (Buttons, Cards, Inputs, Tables)
│   ├── config/              # Runtime settings
│   ├── demos/               # Core Demo Views
│   │   ├── IntegrationGuideDemo.vue     # Interactive architectural guide
│   │   ├── PurchaseOrderDemo.vue        # Service API integration (doc parsing & auditing)
│   │   ├── OpportunityAgentDemo.vue     # Embedded Agent (iframe & postMessage)
│   │   ├── DeviceTerminalDemo.vue       # Voice terminal simulator (IoT tools)
│   │   ├── PlatformIntegrationPage.vue  # SSO & Card parameter parsing page
│   │   └── PlatformConfigDemo.vue       # API Key & Address connection settings
│   ├── lib/                 # Core helper classes
│   │   ├── i18n.ts          # Localization manager
│   │   ├── mock-api.ts      # Structured mock data
│   │   ├── platform-config.ts # Local storage config manager
│   │   ├── utils.ts         # Formatting & helper utilities
│   │   ├── wise-api.ts      # Real Wise REST API client
│   │   └── wise-embed-protocol.ts # iframe postMessage protocol wrapper
│   └── locales/             # i18n resource files
│       ├── zh.ts            # Chinese resources
│       └── en.ts            # English resources
├── vite.config.ts           # Vite development server & reverse proxy config
├── tailwind.config.ts       # Tailwind CSS design system config
├── tsconfig.json            # TypeScript configuration
└── package.json             # NPM dependencies & scripts
```

---

## 💻 Local Setup & Installation

### 1. Clone the repository
Ensure you have Git installed, then clone the project:
```bash
git clone git@github.com:workopilot/workopilt.demo.git
cd workopilt.demo
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
By default, the server will launch at:
```text
http://localhost:5177
```

### 4. Build for Production
To bundle the assets for deployment:
```bash
npm run build
```

---

## ⚙️ Configuration & Proxy Setup

To invoke the real Wise platform APIs directly from your local dev environment, you need to configure your API Credentials and start the Vite Dev Server to route requests via the built-in reverse proxy.

### Setup Steps
1. Navigate to the **Platform Config** tab in the Demo App.
2. Enter your Wise **API Key** (obtainable from the Wise Open Platform console).
3. Ensure the **Base URL** points to `https://agent.workopilot.com` (default).
4. Restart your Vite development server (`npm run dev`) to initialize the proxy configured in `vite.config.ts`:
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
5. Requests pointing to the default API Base URL will automatically route through local endpoints `/api/...` and `/net-api/...` to bypass browser CORS (Cross-Origin Resource Sharing) restrictions.

---

## 📖 Recommended Integration Workflow

1. **Understand Scenarios**: Read the interactive architecture guide on the **Integration Guide** page to choose between *Service APIs* (data parsing/extraction) and *Digital Employees* (interactive iframe workflows).
2. **Experience Mock Flow**: Run the demo app in default Mock mode to test UI interactions, HMR, and look-and-feel.
3. **Configure API Keys**: Add your credentials in the **Platform Config** tab.
4. **Connect Real Services**: Set `MOCK_ENABLED = false` or trigger real actions to verify document uploads, data extractions, and user profiles through the local proxy.
5. **Connect Agent iframe**: Configure your customized Agent embed URL in the config screen, open the Opportunity Demo or Voice Terminal, and verify bidirectional `host-action` callouts and hardware controls.

---

## 📄 License
Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
