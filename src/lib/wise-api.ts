import { loadPlatformConfig, normalizeWiseBaseUrl, type PlatformConfig } from '@/lib/platform-config';
import type { ContractAuditResult, PurchaseOrderDraft, PurchaseItem } from '@/lib/mock-api';

export const PURCHASE_CONTRACT_AUDIT_SERVICE_CODE = 'wise_po_contract_audit_v1';
export const PURCHASE_ITEM_SUGGEST_SERVICE_CODE = 'wise_po_item_suggest_v1';
export const PURCHASE_PRODUCT_CATALOG = [
  { productName: '喔壳K1智能设备', unitPrice: 2999 },
  { productName: '喔壳K2智能会议一体机', unitPrice: 3999 },
  { productName: '喔壳S300智能收单机', unitPrice: 5999 },
  { productName: '喔壳智能审核服务', unitPrice: 6999 },
  { productName: '喔壳智能比对', unitPrice: 6999 },
  { productName: '喔壳智能取数服务', unitPrice: 6999 },
] as const;

interface ApiResult<T> {
  code?: number;
  msg?: string;
  data?: T;
}

interface ClassificationPageData {
  ExtractDataJson?: string | null;
}

interface ClassificationFileData {
  Status?: string;
  Message?: string;
  ClassificationResults?: ClassificationPageData[];
}

interface ClassificationResultPayload {
  Code: number;
  Progress: number;
  Result?: ClassificationFileData[];
}

interface AiServiceExecuteRes {
  Code: number;
  Message?: string;
  Data?: unknown;
  ConversationId?: string;
  TaskId?: number | null;
}

interface PurchaseExtractPayload {
  purchase_header?: {
    supplierName?: string;
    contactName?: string;
    contactPhone?: string;
    contractNo?: string;
    contractTitle?: string;
    contractAmount?: string;
    paymentTerms?: string;
    deliveryDate?: string;
    deliveryAddress?: string;
  };
  purchase_items?: Array<{
    materialName?: string;
    specification?: string;
    quantity?: string;
    unitPrice?: string;
    subtotal?: string;
  }>;
}

interface ContractAuditPayload {
  riskLevel?: 'high' | 'medium' | 'low';
  summary?: string;
  issues?: Array<{
    title?: string;
    severity?: 'high' | 'medium' | 'low';
    description?: string;
    suggestion?: string;
  }>;
}

interface PurchaseItemSuggestPayload {
  items?: Array<{
    productName?: string;
    unitPrice?: string | number;
    quantity?: string | number;
    subtotal?: string | number;
    specification?: string;
  }>;
}

function requirePlatformConfig(config: PlatformConfig) {
  if (!config.apiKey.trim()) {
    throw new Error('请先在平台配置中填写 API Key');
  }
}

function buildApiUrl(baseUrl: string, path: string) {
  return `${normalizeWiseBaseUrl(baseUrl)}/net-api${path}`;
}

function parseMoney(input?: string) {
  if (!input) return 0;
  const normalized = input.replace(/[^\d.-]/g, '');
  const value = Number(normalized);
  return Number.isFinite(value) ? value : 0;
}

function parseInteger(input?: string) {
  if (!input) return 0;
  const normalized = input.replace(/[^\d.-]/g, '');
  const value = Number(normalized);
  return Number.isFinite(value) ? value : 0;
}

function mapPurchaseItems(items: PurchaseExtractPayload['purchase_items']): PurchaseItem[] {
  return (items ?? []).map((item) => ({
    name: item.materialName ?? '',
    spec: item.specification ?? '',
    quantity: parseInteger(item.quantity),
    unitPrice: parseMoney(item.unitPrice),
  }));
}

function mapPurchaseDraft(payload: PurchaseExtractPayload): PurchaseOrderDraft {
  const header = payload.purchase_header ?? {};

  return {
    supplierName: header.supplierName ?? '',
    supplierContact: header.contactName ?? '',
    supplierPhone: header.contactPhone ?? '',
    contractNo: header.contractNo ?? '',
    contractTitle: header.contractTitle ?? '',
    amount: parseMoney(header.contractAmount),
    currency: 'CNY',
    paymentTerms: header.paymentTerms ?? '',
    deliveryDate: header.deliveryDate ?? '',
    deliveryAddress: header.deliveryAddress ?? '',
    items: mapPurchaseItems(payload.purchase_items),
  };
}

async function parseJsonResponse<T>(response: Response): Promise<ApiResult<T>> {
  const payload = (await response.json()) as ApiResult<T>;
  if (!response.ok) {
    throw new Error(payload.msg || `请求失败：${response.status}`);
  }
  if (payload.code === 0) {
    throw new Error(payload.msg || '接口调用失败');
  }
  return payload;
}

async function parseDirectJsonResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T;
  if (!response.ok) {
    const maybeMessage =
      typeof payload === 'object' && payload && 'Message' in payload
        ? String((payload as { Message?: string }).Message || '')
        : '';
    throw new Error(maybeMessage || `请求失败：${response.status}`);
  }
  return payload;
}

async function uploadExtractFile(file: File, config: PlatformConfig) {
  requirePlatformConfig(config);

  const formData = new FormData();
  formData.append('CategoryCode', 'PO');
  formData.append('ExtractMode', 'DOCUMENT');
  formData.append('File', file);

  const response = await fetch(buildApiUrl(config.baseUrl, '/api/Classfication/ExtractFile'), {
    method: 'POST',
    headers: {
      'API-KEY': config.apiKey.trim(),
    },
    body: formData,
  });

  const payload = await parseJsonResponse<string>(response);
  if (!payload.data) {
    throw new Error('接口未返回批次号');
  }
  return payload.data;
}

async function getClassificationResult(batchNo: string, config: PlatformConfig) {
  requirePlatformConfig(config);

  const url = new URL(buildApiUrl(config.baseUrl, '/api/Classfication/GetClassificationResult'));
  url.searchParams.set('batchNo', batchNo);

  const response = await fetch(url.toString(), {
    headers: {
      'API-KEY': config.apiKey.trim(),
    },
  });

  const payload = await parseJsonResponse<ClassificationResultPayload>(response);
  if (!payload.data) {
    throw new Error('接口未返回识别结果');
  }
  return payload.data;
}

function findExtractDataJson(result: ClassificationResultPayload) {
  const fileResults = result.Result ?? [];
  const failed = fileResults.find((item) => item.Status && item.Status !== '成功' && item.Message);
  if (failed?.Message) {
    throw new Error(failed.Message);
  }

  for (const fileResult of fileResults) {
    for (const pageResult of fileResult.ClassificationResults ?? []) {
      if (pageResult.ExtractDataJson) {
        return pageResult.ExtractDataJson;
      }
    }
  }

  throw new Error('未获取到 ExtractDataJson');
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function extractPurchaseContract(file: File): Promise<PurchaseOrderDraft> {
  const config = loadPlatformConfig();
  const batchNo = await uploadExtractFile(file, config);

  const maxAttempts = 30;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const result = await getClassificationResult(batchNo, config);
    if (result.Code === 1) {
      const extractDataJson = findExtractDataJson(result);
      const parsed = JSON.parse(extractDataJson) as PurchaseExtractPayload;
      return mapPurchaseDraft(parsed);
    }

    await sleep(2000);
  }

  throw new Error('识别超时，请稍后重试');
}

export async function uploadDocumentFile(file: File): Promise<string> {
  const config = loadPlatformConfig();
  requirePlatformConfig(config);

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(buildApiUrl(config.baseUrl, '/api/Document/UploadDocument/Upload'), {
    method: 'POST',
    headers: {
      'API-KEY': config.apiKey.trim(),
    },
    body: formData,
  });

  const payload = await parseJsonResponse<string>(response);
  if (!payload.data) {
    throw new Error('上传成功，但未返回文件地址');
  }

  return payload.data;
}

function normalizeAuditPayload(data: unknown): ContractAuditPayload {
  if (typeof data === 'string') {
    return JSON.parse(data) as ContractAuditPayload;
  }
  if (data && typeof data === 'object') {
    return data as ContractAuditPayload;
  }
  throw new Error('审核结果格式无法识别');
}

function mapContractAuditResult(payload: ContractAuditPayload): ContractAuditResult {
  const normalizedRiskLevel = payload.riskLevel === 'high' || payload.riskLevel === 'low' ? payload.riskLevel : 'medium';

  return {
    riskLevel: normalizedRiskLevel,
    summary: payload.summary ?? '合同审核已完成',
    issues: (payload.issues ?? []).map((item) => ({
      title: item.title ?? '待确认问题',
      severity: item.severity === 'high' || item.severity === 'low' ? item.severity : 'medium',
      description: item.description ?? '',
      suggestion: item.suggestion ?? '',
    })),
  };
}

function parseDecimal(input?: string | number) {
  if (typeof input === 'number') return Number.isFinite(input) ? input : 0;
  if (!input) return 0;
  return parseMoney(String(input));
}

function tryParseJsonWithRepair<T>(input: string): T {
  try {
    return JSON.parse(input) as T;
  } catch {
    const repaired = input
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/("quantity"\s*:\s*[^,\n}]+)\s*("unitPrice")/g, '$1,$2')
      .replace(/("unitPrice"\s*:\s*[^,\n}]+)\s*("subtotal")/g, '$1,$2')
      .replace(/("specification"\s*:\s*"[^"]*")\s*("quantity")/g, '$1,$2')
      .replace(/("productName"\s*:\s*"[^"]*")\s*("specification")/g, '$1,$2');

    return JSON.parse(repaired) as T;
  }
}

function parseSuggestedItems(data: unknown): PurchaseItem[] {
  let payload: PurchaseItemSuggestPayload;

  if (typeof data === 'string') {
    payload = tryParseJsonWithRepair<PurchaseItemSuggestPayload>(data);
  } else if (Array.isArray(data)) {
    payload = { items: data as PurchaseItemSuggestPayload['items'] };
  } else if (data && typeof data === 'object') {
    payload = data as PurchaseItemSuggestPayload;
  } else {
    throw new Error('智能新增明细返回格式无法识别');
  }

  const items = payload.items ?? [];
  return items.map((item) => ({
    name: item.productName ?? '',
    spec: item.specification ?? '',
    quantity: parseInteger(String(item.quantity ?? '0')),
    unitPrice: parseDecimal(item.unitPrice),
  })).map((item) => ({
    ...item,
    quantity: item.quantity > 0 ? item.quantity : 1,
    unitPrice: item.unitPrice > 0 ? item.unitPrice : 0,
  }));
}

export async function auditPurchaseContractByAi(fileUrl: string): Promise<ContractAuditResult> {
  const config = loadPlatformConfig();
  requirePlatformConfig(config);

  const response = await fetch(buildApiUrl(config.baseUrl, '/api/aiagent/run'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-KEY': config.apiKey.trim(),
    },
    body: JSON.stringify({
      serviceCode: PURCHASE_CONTRACT_AUDIT_SERVICE_CODE,
      conversationId: '',
      inputs: {
        user_message: '请审核这份采购合同，识别其中的风险点，并输出结构化审核结果。',
      },
      files: [fileUrl],
    }),
  });

  const payload = await parseDirectJsonResponse<AiServiceExecuteRes>(response);
  if (payload.Code !== 0) {
    throw new Error(payload.Message || '合同审核失败');
  }
  if (payload.TaskId) {
    throw new Error('当前审核服务被配置为异步模式，请改为同步模式后再调用');
  }

  return mapContractAuditResult(normalizeAuditPayload(payload.Data));
}

export async function suggestPurchaseItemsByAi(userMessage: string): Promise<PurchaseItem[]> {
  const config = loadPlatformConfig();
  requirePlatformConfig(config);

  const response = await fetch(buildApiUrl(config.baseUrl, '/api/aiagent/run'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-KEY': config.apiKey.trim(),
    },
    body: JSON.stringify({
      serviceCode: PURCHASE_ITEM_SUGGEST_SERVICE_CODE,
      conversationId: '',
      inputs: {
        user_message: userMessage,
        product_catalog: JSON.stringify(PURCHASE_PRODUCT_CATALOG),
      },
    }),
  });

  const payload = await parseDirectJsonResponse<AiServiceExecuteRes>(response);
  if (payload.Code !== 0) {
    throw new Error(payload.Message || '智能新增明细失败');
  }
  if (payload.TaskId) {
    throw new Error('当前明细服务被配置为异步模式，请改为同步模式后再调用');
  }

  return parseSuggestedItems(payload.Data);
}
