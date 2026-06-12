import { nowIso } from '@/lib/utils';
import type { SaveOpportunityPayload } from './mock-api';

export interface WiseMessage<TPayload = unknown> {
  version: '1.0.0';
  source: 'wiseai-host' | 'wiseai-embed';
  type: 'command' | 'event' | 'host-action' | 'action-result';
  action: string;
  requestId: string;
  timestamp: string;
  payload: TPayload;
}

export interface HostActionPayload extends SaveOpportunityPayload {
  action?: string;
}

export interface ActionResultOptions {
  action?: string;
  success?: boolean;
  state?: 'granted' | 'denied' | 'blocked' | 'unsupported';
  errorCode?: string | null;
  message?: string;
  data?: Record<string, unknown> | null;
}

export function createConfigureMessage(): WiseMessage {
  return {
    version: '1.0.0',
    source: 'wiseai-host',
    type: 'command',
    action: 'configure',
    requestId: `cfg-${Date.now()}`,
    timestamp: nowIso(),
    payload: {
      contextData: {
        hostApp: 'wise.demo',
        scene: 'customer-opportunity-create',
        currentUserName: '演示销售',
        formPurpose: '创建客户商机',
      },
      capabilities: {
        contextSync: true,
        hostActions: true,
        filePicker: false,
        microphone: false,
        speaker: false,
      },
      frontendActions: [
        {
          code: 'saveOpportunity',
          name: '保存商机信息',
          description: '当已经收集到客户公司基础信息、风险项和商机建议时，调用该动作把信息保存到宿主页面表单。',
          target: 'parent',
          fireAndForget: false,
          awaitResult: true,
          inputSchema: {
            type: 'object',
            properties: {
              companyName: { type: 'string', description: '客户公司名称' },
              address: { type: 'string', description: '注册地址或办公地址' },
              phone: { type: 'string', description: '联系电话' },
              riskItems: {
                type: 'array',
                items: { type: 'string' },
                description: '工商、司法、经营等风险项',
              },
              opportunityTitle: { type: 'string', description: '商机标题' },
              opportunityStage: { type: 'string', description: '商机阶段' },
              estimatedAmount: { type: 'number', description: '预计金额' },
              remark: { type: 'string', description: '补充说明' },
            },
            required: ['companyName', 'opportunityTitle'],
          },
          parameters: {
            type: 'object',
            properties: {
              companyName: { type: 'string', description: '客户公司名称' },
              address: { type: 'string', description: '注册地址或办公地址' },
              phone: { type: 'string', description: '联系电话' },
              riskItems: {
                type: 'array',
                items: { type: 'string' },
                description: '工商、司法、经营等风险项',
              },
              opportunityTitle: { type: 'string', description: '商机标题' },
              opportunityStage: { type: 'string', description: '商机阶段' },
              estimatedAmount: { type: 'number', description: '预计金额' },
              remark: { type: 'string', description: '补充说明' },
            },
            required: ['companyName', 'opportunityTitle'],
          },
        },
        {
          code: 'submitOpportunity',
          name: '提交商机',
          description: '当商机信息已经确认完整后，调用该动作直接触发宿主页面的商机提交流程。',
          target: 'parent',
          fireAndForget: false,
          awaitResult: true,
          inputSchema: {
            type: 'object',
            properties: {
              submitReason: { type: 'string', description: '本次提交原因或说明，可选' },
            },
          },
          parameters: {
            type: 'object',
            properties: {
              submitReason: { type: 'string', description: '本次提交原因或说明，可选' },
            },
          },
        },
      ],
    },
  };
}

export function createActionResult(requestId: string, options: ActionResultOptions = {}): WiseMessage {
  const {
    action = 'saveOpportunity',
    success = true,
    state = success ? 'granted' : 'denied',
    errorCode = null,
    message = '商机信息已填充到页面表单',
    data = { filled: true },
  } = options;
  return {
    version: '1.0.0',
    source: 'wiseai-host',
    type: 'action-result',
    action: 'action-result',
    requestId,
    timestamp: nowIso(),
    payload: {
      success,
      state,
      errorCode,
      action,
      message,
      ...(data ?? {}),
      payload: data,
      data,
    },
  };
}
