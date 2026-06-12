export interface PurchaseItem {
  name: string;
  spec: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrderDraft {
  supplierName: string;
  supplierContact: string;
  supplierPhone: string;
  contractNo: string;
  contractTitle: string;
  amount: number;
  currency: string;
  paymentTerms: string;
  deliveryDate: string;
  deliveryAddress: string;
  items: PurchaseItem[];
}

export interface ContractIssue {
  title: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  suggestion: string;
}

export interface ContractAuditResult {
  riskLevel: 'high' | 'medium' | 'low';
  summary: string;
  issues: ContractIssue[];
}

export interface SaveOpportunityPayload {
  companyName: string;
  address: string;
  phone: string;
  riskItems: string[];
  opportunityTitle: string;
  opportunityStage: string;
  estimatedAmount: number;
  remark: string;
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export async function recognizePurchaseContract(): Promise<PurchaseOrderDraft> {
  await wait(900);
  return {
    supplierName: '北京华北设备供应有限公司',
    supplierContact: '张经理',
    supplierPhone: '010-88990011',
    contractNo: 'HT-PO-2026-0609',
    contractTitle: '办公设备采购合同',
    amount: 268000,
    currency: 'CNY',
    paymentTerms: '合同签署后预付30%，验收通过后支付70%',
    deliveryDate: '2026-07-15',
    deliveryAddress: '北京市海淀区中关村软件园',
    items: [
      {
        name: '商用笔记本电脑',
        spec: '16G/512G/14英寸',
        quantity: 50,
        unitPrice: 5200,
      },
      {
        name: '显示器',
        spec: '27英寸 2K',
        quantity: 20,
        unitPrice: 1400,
      },
    ],
  };
}

export async function auditPurchaseContract(): Promise<ContractAuditResult> {
  await wait(850);
  return {
    riskLevel: 'medium',
    summary: '合同整体可执行，但付款、验收和违约责任条款需要补强。',
    issues: [
      {
        title: '验收标准不明确',
        severity: 'high',
        description: '合同只写明验收通过后付款，但未定义验收周期、验收标准和异议处理方式。',
        suggestion: '补充验收清单、验收负责人、验收期限和不合格处理流程。',
      },
      {
        title: '违约责任偏弱',
        severity: 'medium',
        description: '供应商延期交付的违约金比例较低，缺少连续延期后的解除条款。',
        suggestion: '增加延期超过约定天数后的解除权和赔偿范围。',
      },
      {
        title: '发票开具时点缺失',
        severity: 'low',
        description: '合同没有明确供应商开具增值税专用发票的时点。',
        suggestion: '约定预付款和尾款对应的发票开具节点。',
      },
    ],
  };
}

export function mockOpportunityPayload(): SaveOpportunityPayload {
  return {
    companyName: '北京星河智造科技有限公司',
    address: '北京市海淀区中关村软件园二期A座',
    phone: '010-66778899',
    riskItems: ['存在1条司法风险', '近一年有股权变更记录', '经营范围包含软件开发和供应链服务'],
    opportunityTitle: '北京星河智造科技有限公司采购数字化商机',
    opportunityStage: '初步沟通',
    estimatedAmount: 300000,
    remark: '建议重点跟进采购合同识别、订单录入和销售助手场景。',
  };
}
