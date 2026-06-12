# Demo 1：采购单创建

## 目标

展示喔壳在采购合同处理中的能力：

1. 上传供应商采购合同。
2. 自动识别合同内容。
3. 将识别结果填充到采购单页面。
4. 一键审核合同漏洞和风险项。

第一版原型使用 Mock 数据，后续可替换为真实合同识别和合同审核接口。

## 页面结构

推荐使用 shadcn-vue 组件：

| 区域 | 组件建议 | 说明 |
| --- | --- | --- |
| 页面标题 | `Card` / 普通布局 | 展示“采购单创建 Demo”和能力说明 |
| 合同上传 | `Button`、`Input`、`Card` | 上传供应商采购合同 |
| 采购单表单 | `Input`、`Textarea`、`Table` | 展示供应商、合同、金额、明细、条款 |
| 审核结果 | `Badge`、`Card`、`Table` | 展示风险等级、漏洞项、建议 |
| 操作按钮 | `Button` | 上传识别、审核 |

## 主要按钮

### 上传供应商的采购合同

按钮文案：

```text
上传供应商的采购合同
```

Mock 行为：

1. 用户选择合同文件。
2. 页面显示“识别中”状态。
3. 1 秒后填充采购单字段。

Mock 返回示例：

```json
{
  "supplierName": "北京华北设备供应有限公司",
  "supplierContact": "张经理",
  "supplierPhone": "010-88990011",
  "contractNo": "HT-PO-2026-0609",
  "contractTitle": "办公设备采购合同",
  "amount": 268000,
  "currency": "CNY",
  "paymentTerms": "合同签署后预付30%，验收通过后支付70%",
  "deliveryDate": "2026-07-15",
  "deliveryAddress": "北京市海淀区中关村软件园",
  "items": [
    {
      "name": "商用笔记本电脑",
      "spec": "16G/512G/14英寸",
      "quantity": 50,
      "unitPrice": 5200
    },
    {
      "name": "显示器",
      "spec": "27英寸 2K",
      "quantity": 20,
      "unitPrice": 1400
    }
  ]
}
```

### 审核

按钮文案：

```text
审核
```

Mock 行为：

1. 读取当前采购单和合同识别结果。
2. 显示“审核中”状态。
3. 输出风险等级和漏洞项。

Mock 返回示例：

```json
{
  "riskLevel": "medium",
  "summary": "合同整体可执行，但付款、验收和违约责任条款需要补强。",
  "issues": [
    {
      "title": "验收标准不明确",
      "severity": "high",
      "description": "合同只写明验收通过后付款，但未定义验收周期、验收标准和异议处理方式。",
      "suggestion": "补充验收清单、验收负责人、验收期限和不合格处理流程。"
    },
    {
      "title": "违约责任偏弱",
      "severity": "medium",
      "description": "供应商延期交付的违约金比例较低，缺少连续延期后的解除条款。",
      "suggestion": "增加延期超过约定天数后的解除权和赔偿范围。"
    }
  ]
}
```

## 真实接口扩展点

建议后续封装两个服务函数：

```ts
async function recognizePurchaseContract(file: File) {
  // Mock 模式返回固定数据
  // Real 模式调用合同识别接口
}

async function auditPurchaseContract(orderDraft: PurchaseOrderDraft) {
  // Mock 模式返回固定风险项
  // Real 模式调用合同审核 AI 服务
}
```

真实接口调用要求：

- 从配置读取 `API_BASE_URL`。
- 从配置读取 `API_KEY`。
- 请求头统一带 `API-KEY` 或平台约定的 APIKEY header。
- 页面逻辑不要硬编码密钥。

## 验收口径

- 不接真实接口时，上传按钮能说明如何触发 Mock 识别。
- 审核按钮能说明如何输出风险结果。
- 文档清楚说明哪些字段会被自动填充。
- 文档清楚说明真实接口接入点。
