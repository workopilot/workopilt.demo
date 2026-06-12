# Demo 2：客户商机创建

## 目标

展示喔壳数字员工嵌入业务系统后的协同能力：

1. 前端页面展示客户和商机表单。
2. 页面右下角展示喔壳数字员工头像。
3. 点击头像后通过 iframe 打开数字员工页面。
4. 宿主页面向数字员工注入 `saveOpportunity` 前端动作。
5. 用户对数字员工说：“帮我创建北京XXX公司的商机信息”。
6. 数字员工查询公司名称、地址、电话、风险项等信息。
7. 数字员工调用前端保存工具，前端直接填充商机表单。

第一版原型使用 Mock 数据和协议蓝图，不新增后端接口。

## 页面结构

推荐使用 shadcn-vue 组件：

| 区域 | 组件建议 | 说明 |
| --- | --- | --- |
| 客户信息 | `Card`、`Input`、`Textarea` | 公司名称、地址、电话、风险项 |
| 商机信息 | `Card`、`Input`、`Textarea`、`Badge` | 商机标题、阶段、预计金额、备注 |
| 数字员工头像 | `Avatar`、`Button` | 固定在右下角 |
| 数字员工窗口 | `Sheet`、`ScrollArea` | 内部放 iframe |
| 调用日志 | `Card`、`Badge` | 展示 host-action/action-result |

## 配置项

从配置读取：

```ts
import { demoConfig } from '../config/demo.config';

const embedUrl = demoConfig.ROBOT_EMBED_URL;
const targetOrigin = demoConfig.IFRAME_TARGET_ORIGIN;
```

`ROBOT_EMBED_URL` 示例：

```text
https://wiseai.example.com/embed/chat/sales_assistant?token=xxx&externalUserId=demo-user
```

## iframe 初始化流程

用户点击数字员工头像后：

1. 打开 `Sheet`。
2. 创建 iframe，地址为 `ROBOT_EMBED_URL`。
3. iframe 发送 `ready` 后，宿主发送 `configure`。

`configure` 示例：

```json
{
  "version": "1.0.0",
  "source": "wiseai-host",
  "type": "command",
  "action": "configure",
  "requestId": "cfg-opportunity-demo",
  "timestamp": "2026-06-09T10:00:00.000Z",
  "payload": {
    "contextData": {
      "hostApp": "wise.demo",
      "scene": "customer-opportunity-create",
      "currentUserName": "演示销售",
      "formPurpose": "创建客户商机"
    },
    "capabilities": {
      "contextSync": true,
      "hostActions": true,
      "filePicker": false,
      "microphone": false,
      "speaker": false
    },
    "frontendActions": [
      {
        "code": "saveOpportunity",
        "name": "保存商机信息",
        "description": "当已经收集到客户公司基础信息、风险项和商机建议时，调用该动作把信息保存到宿主页面表单。",
        "awaitResult": true,
        "parameters": {
          "type": "object",
          "properties": {
            "companyName": { "type": "string", "description": "客户公司名称" },
            "address": { "type": "string", "description": "注册地址或办公地址" },
            "phone": { "type": "string", "description": "联系电话" },
            "riskItems": {
              "type": "array",
              "items": { "type": "string" },
              "description": "工商、司法、经营等风险项"
            },
            "opportunityTitle": { "type": "string", "description": "商机标题" },
            "opportunityStage": { "type": "string", "description": "商机阶段" },
            "estimatedAmount": { "type": "number", "description": "预计金额" },
            "remark": { "type": "string", "description": "补充说明" }
          },
          "required": ["companyName", "opportunityTitle"]
        }
      }
    ]
  }
}
```

## host-action 处理

数字员工调用 `saveOpportunity` 时，宿主页面会收到 `host-action`。

示例：

```json
{
  "version": "1.0.0",
  "source": "wiseai-embed",
  "type": "host-action",
  "action": "saveOpportunity",
  "requestId": "act-001",
  "payload": {
    "companyName": "北京XXX科技有限公司",
    "address": "北京市海淀区中关村大街1号",
    "phone": "010-66668888",
    "riskItems": ["存在1条司法风险", "近期有股权变更记录"],
    "opportunityTitle": "北京XXX科技有限公司数字化采购系统商机",
    "opportunityStage": "初步沟通",
    "estimatedAmount": 300000,
    "remark": "建议销售跟进企业采购系统和AI办公助手需求。"
  }
}
```

前端处理逻辑：

```ts
function saveOpportunity(payload: SaveOpportunityPayload) {
  customerForm.companyName = payload.companyName;
  customerForm.address = payload.address;
  customerForm.phone = payload.phone;
  customerForm.riskItems = payload.riskItems ?? [];

  opportunityForm.title = payload.opportunityTitle;
  opportunityForm.stage = payload.opportunityStage ?? '初步沟通';
  opportunityForm.estimatedAmount = payload.estimatedAmount ?? null;
  opportunityForm.remark = payload.remark ?? '';
}
```

处理完成后回传 `action-result`：

```json
{
  "version": "1.0.0",
  "source": "wiseai-host",
  "type": "action-result",
  "action": "action-result",
  "requestId": "act-001",
  "timestamp": "2026-06-09T10:01:00.000Z",
  "payload": {
    "success": true,
    "action": "saveOpportunity",
    "message": "商机信息已填充到页面表单",
    "data": {
      "filled": true
    }
  }
}
```

## Mock 模式

Mock 模式下可以不依赖真实数字员工：

- 点击“模拟数字员工保存商机”按钮。
- 直接调用 `saveOpportunity(mockPayload)`。
- 在调用日志中追加一条虚拟 `host-action` 和 `action-result`。

## 真实联调要点

- 数字员工需要能访问互联网或绑定搜索类 MCP 工具。
- 数字员工系统提示词应说明：收集到公司基础信息后调用 `saveOpportunity`。
- 宿主必须在 iframe `ready` 后发送 `configure`。
- `action-result.requestId` 必须与原始 `host-action.requestId` 一致。
- 生产环境应限制 `postMessage` 的 origin，不建议使用 `*`。

## 验收口径

- 文档说明数字员工头像、iframe、动作注入和表单回填流程。
- `saveOpportunity` 的参数结构明确。
- `host-action` 和 `action-result` 示例完整。
- APIKEY 不在页面逻辑里硬编码。
