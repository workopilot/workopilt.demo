# 技术选型

## 目标

`wise.demo` 面向外部开发者，重点不是复刻完整喔壳后台，而是用尽量少的技术栈展示喔壳能力：

- 文件上传和自动填表。
- 合同审核结果展示。
- 数字员工 iframe 嵌入。
- 宿主页面向数字员工注入前端动作。
- 数字员工调用宿主动作并回填业务表单。

## 前端技术栈

推荐使用：

| 技术 | 用途 |
| --- | --- |
| Vue 3 | 页面状态、组件组织、响应式表单 |
| Vite | 轻量开发和构建工具 |
| shadcn-vue | 表单、按钮、卡片、弹层、头像、表格等 UI 组件 |
| Tailwind CSS | 页面布局和局部样式 |
| TypeScript | 配置、Mock 数据和消息协议类型约束 |

## 为什么使用 shadcn-vue

shadcn-vue 适合开发者 demo：

- 组件轻量，便于按需复制和定制。
- 风格现代，适合展示 AI 能力和业务表单。
- 和 Tailwind CSS 配合自然，不需要维护复杂主题包。
- 能覆盖本 demo 所需的 `Card`、`Button`、`Input`、`Textarea`、`Table`、`Badge`、`Avatar`、`Sheet`、`Dialog`、`ScrollArea`。

## Mock 优先策略

第一版建议默认使用 Mock：

- 采购合同识别和审核返回固定示例数据。
- 客户商机创建模拟数字员工调用宿主动作。
- 配置文件保留真实接口地址和 APIKEY。

这样开发者可以先跑通页面和协议，再逐步接入真实服务。

## 配置与安全

配置文件建议命名为：

```text
src/config/demo.config.ts
```

根目录提供 `config.example.ts` 作为示例。

注意：

- demo 环境可以把 APIKEY 放前端配置，便于快速演示。
- 生产环境不要把长期 APIKEY 暴露到浏览器。
- 生产环境建议使用后端代理，由后端保存 APIKEY，前端只拿短期 token 或业务会话。

## 建议目录结构

如果后续实现可运行 demo，可使用：

```text
wise.demo/
  package.json
  index.html
  src/
    main.ts
    App.vue
    config/
      demo.config.ts
    demos/
      PurchaseOrderDemo.vue
      OpportunityAgentDemo.vue
    lib/
      wise-embed-protocol.ts
      mock-api.ts
    components/
      ui/
```

当前版本已经按上述结构实现可运行 demo，并保留文档说明与配置样例。
