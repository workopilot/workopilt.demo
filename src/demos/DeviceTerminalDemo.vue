<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import {
  Box,
  CheckCircle2,
  Lightbulb,
  Loader2,
  Mic,
  MicOff,
  Printer,
  Radio,
  Search,
  ServerCog,
  Sparkles,
  Wifi,
  Battery,
  Volume2,
  Sun,
  FolderArchive,
  Settings,
  Receipt,
  X,
} from '@lucide/vue';
import Badge from '@/components/ui/Badge.vue';
import Button from '@/components/ui/Button.vue';
import Card from '@/components/ui/Card.vue';
import LocaleSwitcher from '@/components/LocaleSwitcher.vue';
import { useI18n } from '@/lib/i18n';
import { loadPlatformConfig } from '@/lib/platform-config';
import { createActionResult, type WiseMessage } from '@/lib/wise-embed-protocol';
import { nowIso } from '@/lib/utils';

const { t, locale } = useI18n();

// iPad 设备首页状态
const showEmbedAgent = ref(false);
const currentTime = ref('16:20');
const toastMessage = ref('');
const toastVisible = ref(false);
const showSettings = ref(false);
const deviceVolume = ref(80);
const deviceBrightness = ref(90);

let toastTimer: number | null = null;
function showToast(msg: string) {
  toastMessage.value = msg;
  toastVisible.value = true;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastVisible.value = false;
  }, 2000);
}

function handleMenuClick(menu: 'purchase' | 'archive' | 'settings') {
  if (menu === 'purchase') {
    appendLog('system', t('device.logClickCheckout'), t('device.logClickCheckoutDetail'));
    showToast(t('device.toastCheckoutReady'));
  } else if (menu === 'archive') {
    appendLog('system', t('device.logClickArchive'), t('device.logClickArchiveDetail'));
    showToast(t('device.toastArchiveReady'));
  } else if (menu === 'settings') {
    appendLog('system', t('device.logClickSettings'), t('device.logClickSettingsDetail'));
    showSettings.value = true;
  }
}

let timeInterval: number | null = null;
function updateTime() {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}


interface DeviceFileItem {
  id: string;
  name: string;
  createdAt: string;
  url: string;
  type: string;
}

interface DeviceLogItem {
  id: string;
  time: string;
  type: string;
  title: string;
  detail: string;
}

interface PrintJobState {
  fileName: string;
  fileUrl: string;
  copies: number;
}

interface PrintHistoryItem {
  id: string;
  fileName: string;
  copies: number;
  status: 'printing' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
}

const totalSlots = 50;
const usedSlots = ref(Math.floor(Math.random() * 20) + 14);
const lightOn = ref(false);
const printerStatus = ref<'idle' | 'printing'>('idle');
const printRemainingSec = ref(0);
const currentPrintJob = ref<PrintJobState | null>(null);
const printHistory = ref<PrintHistoryItem[]>([
  {
    id: 'hist-1',
    fileName: '3月去上海喔壳项目报销单.pdf',
    copies: 1,
    status: 'completed',
    progress: 100,
    createdAt: '2026-03-08 14:23:11',
  },
  {
    id: 'hist-2',
    fileName: '4月设备巡检记录表.pdf',
    copies: 2,
    status: 'completed',
    progress: 100,
    createdAt: '2026-04-21 10:05:42',
  },
]);
const voiceState = ref('idle');
const voiceOverlayVisible = ref(false);
const screenMounted = ref(false);
const voiceRequested = ref(false);
const configured = ref(false);
const embedReady = ref(false);
const iframeRef = ref<HTMLIFrameElement | null>(null);
const latestSearchResults = ref<DeviceFileItem[]>([]);
const latestToolPayload = ref<Record<string, unknown> | null>(null);
const logs = ref<DeviceLogItem[]>([
  {
    id: 'boot',
    time: nowIso(),
    type: 'system',
    title: t('device.logDeviceReady'),
    detail: t('device.logDeviceReadyDetail'),
  },
]);

const defaultUserId = '100200';
const defaultUserName = 'andy';
const platformConfig = loadPlatformConfig();
const deviceRobotEmbedUrl = computed(() => {
  const template = platformConfig.deviceRobotEmbedUrl || platformConfig.robotEmbedUrl;
  return template
    .replace(/\{userId\}/g, encodeURIComponent(defaultUserId))
    .replace(/\{userName\}/g, encodeURIComponent(defaultUserName));
});

const availableSlots = computed(() => totalSlots - usedSlots.value);
const deviceStatusSummary = computed(() => ({
  slotCapacity: totalSlots,
  slotUsed: usedSlots.value,
  slotAvailable: availableSlots.value,
  lightOn: lightOn.value,
  printerStatus: printerStatus.value,
  currentPrintJob: currentPrintJob.value,
  voiceOverlayVisible: voiceOverlayVisible.value,
  voiceState: voiceState.value,
}));

function createDeviceFileCatalog(isZh: boolean): DeviceFileItem[] {
  const items: DeviceFileItem[] = [];
  const months = Array.from({ length: 10 }, (_, index) => index + 3);

  for (const month of months) {
    const monthText = `${month}`.padStart(2, '0');
    items.push({
      id: `expense-${month}`,
      name: isZh ? `${month}月去上海喔壳项目报销单.pdf` : `Shanghai_Project_Expense_Sheet_Month_${monthText}.pdf`,
      createdAt: `2026-${monthText}-08`,
      url: `https://files.workopilot.mock/device/2026-${monthText}/expense-sheet.pdf`,
      type: isZh ? '报销单' : 'Expense Sheet',
    });
    items.push({
      id: `report-${month}`,
      name: isZh ? `${month}月设备巡检记录表.pdf` : `Device_Inspection_Report_Month_${monthText}.pdf`,
      createdAt: `2026-${monthText}-21`,
      url: `https://files.workopilot.mock/device/2026-${monthText}/inspection-report.pdf`,
      type: isZh ? '巡检记录' : 'Inspection Report',
    });
  }

  return items;
}

const fileCatalog = computed(() => createDeviceFileCatalog(locale.value === 'zh'));

let printTimer: number | null = null;

function appendLog(type: string, title: string, detail: string) {
  logs.value.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    time: nowIso(),
    type,
    title,
    detail,
  });
}

function createCommandMessage(action: string, payload: Record<string, unknown> = {}): WiseMessage {
  return {
    version: '1.0.0',
    source: 'wiseai-host',
    type: 'command',
    action,
    requestId: `${action}-${Date.now()}`,
    timestamp: nowIso(),
    payload,
  };
}

function createDeviceConfigureMessage(): WiseMessage {
  return createCommandMessage('configure', {
    contextData: {
      hostApp: 'wise.demo.device',
      scene: 'device-voice-terminal',
      deviceName: t('device.terminalName'),
      deviceType: 'voice-service-terminal',
      warehouseSlotCapacity: totalSlots,
    },
    capabilities: {
      contextSync: true,
      hostActions: true,
      filePicker: false,
      microphone: true,
      speaker: true,
    },
    forceNewSession: false,
    theme: 'deepBlue',
    themeColors: {
      '--voice-overlay-bg-start': '#123749',
      '--voice-overlay-bg-end': '#0b1827',
    },
    uiConfig: {
      showHangupButton: true,
    },
    frontendActions: [
      {
        code: 'turnOnLight',
        name: locale.value === 'zh' ? '开灯' : 'Turn On Light',
        description: locale.value === 'zh' ? '打开设备照明灯。' : 'Turn on the device light.',
        target: 'parent',
        awaitResult: true,
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        code: 'turnOffLight',
        name: locale.value === 'zh' ? '关灯' : 'Turn Off Light',
        description: locale.value === 'zh' ? '关闭设备照明灯。' : 'Turn off the device light.',
        target: 'parent',
        awaitResult: true,
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        code: 'searchDeviceFiles',
        name: locale.value === 'zh' ? '查询文件' : 'Search Files',
        description:
          locale.value === 'zh'
            ? '按日期范围和关键字查询设备内可打印文件。你必须直接根据工具返回结果告诉用户文件名和文件地址，不要让用户自己看设备屏幕。'
            : 'Search printable files on the device by date range and keyword. You must tell the user the file name and URL directly based on the tool result instead of asking them to check the screen.',
        target: 'parent',
        awaitResult: true,
        inputSchema: {
          type: 'object',
          properties: {
            startDate: { type: 'string', description: '开始日期，格式 YYYY-MM-DD' },
            endDate: { type: 'string', description: '结束日期，格式 YYYY-MM-DD' },
            keyword: { type: 'string', description: '文件关键字，例如 报销单、巡检、上海' },
          },
        },
      },
      {
        code: 'printFile',
        name: locale.value === 'zh' ? '扫描打印' : 'Print File',
        description:
          locale.value === 'zh'
            ? '根据文件地址 and 文件名发起打印。此工具是纯异步执行的，调用后前端会立即返回受理成功的 result，并在此后异步执行。你不需要等待打印机完成打印，请立即回复用户并告诉用户已经开始打印。当打印完成后，主系统会向你推送 print-complete 事件通知。'
            : 'Initiate printing according to file URL and file name. This tool runs asynchronously. The host will return success immediately and print in the background. You do not need to wait for it; tell the user printing has started. A print-complete event will be pushed to you on completion.',
        target: 'parent',
        awaitResult: false,
        inputSchema: {
          type: 'object',
          properties: {
            fileUrl: { type: 'string', description: '待打印文件地址' },
            fileName: { type: 'string', description: '待打印文件名' },
            copies: { type: 'integer', description: '打印份数，默认 1 份' },
          },
          required: ['fileUrl', 'fileName'],
        },
      },
      {
        code: 'getDeviceStatus',
        name: locale.value === 'zh' ? '查询设备状态' : 'Get Device Status',
        description: locale.value === 'zh' ? '获取仓位数量、灯状态、打印机状态和语音状态。' : 'Get slot capacity, light state, printer status, and voice state.',
        target: 'parent',
        awaitResult: true,
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  });
}

function postToIframe(message: WiseMessage) {
  iframeRef.value?.contentWindow?.postMessage(message, '*');
  appendLog(message.type, `发送 ${message.action}`, JSON.stringify(message.payload, null, 2));
}

function configureIframe() {
  configured.value = true;
  postToIframe(createDeviceConfigureMessage());
}

function requestOpenVoice() {
  voiceRequested.value = true;
  if (!screenMounted.value) {
    screenMounted.value = true;
    return;
  }

  if (embedReady.value) {
    postToIframe(createCommandMessage('openVoice'));
  }
}

function exitDeviceAgent() {
  screenMounted.value = false;
  embedReady.value = false;
  configured.value = false;
}

function stopVoiceConversation() {
  voiceRequested.value = false;
  postToIframe(createCommandMessage('closeVoice'));
  exitDeviceAgent();
}

function openDeviceAgent() {
  requestOpenVoice();
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function toPositiveInt(value: unknown, fallback = 1) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return Math.floor(value);
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed);
  }
  return fallback;
}

function withinDateRange(date: string, startDate: string, endDate: string) {
  const current = new Date(date).getTime();
  const start = startDate ? new Date(startDate).getTime() : Number.NEGATIVE_INFINITY;
  const end = endDate ? new Date(endDate).getTime() : Number.POSITIVE_INFINITY;
  return current >= start && current <= end;
}

function searchFiles(payload: Record<string, unknown>) {
  const startDate = firstString(payload.startDate, payload.fromDate);
  const endDate = firstString(payload.endDate, payload.toDate);
  const keyword = firstString(payload.keyword, payload.fileKeyword).toLowerCase();
  const matched = fileCatalog.value.filter((file) => {
    const hitDate = withinDateRange(file.createdAt, startDate, endDate);
    const hitKeyword =
      !keyword ||
      file.name.toLowerCase().includes(keyword) ||
      file.type.toLowerCase().includes(keyword) ||
      file.url.toLowerCase().includes(keyword);
    return hitDate && hitKeyword;
  });
  latestSearchResults.value = matched;
  appendLog('tool', t('device.logExecuteSearchFiles'), JSON.stringify({ startDate, endDate, keyword, count: matched.length }, null, 2));
  return matched;
}

function buildSearchResultMessage(files: DeviceFileItem[]) {
  if (files.length === 0) {
    return t('device.searchNoFiles');
  }

  const addressWord = locale.value === 'zh' ? '，地址：' : ', URL: ';
  const lines = files
    .slice(0, 5)
    .map((file, index) => `${index + 1}. ${file.name}${addressWord}${file.url}`);

  return t('device.searchFoundFiles').replace('{count}', files.length.toString()) + '\n' + lines.join('\n');
}

function finishPrintJob(jobId: string) {
  if (printTimer != null) {
    window.clearInterval(printTimer);
    printTimer = null;
  }
  
  // 更新历史队列中的状态
  const histItem = printHistory.value.find((item) => item.id === jobId);
  if (histItem) {
    histItem.status = 'completed';
    histItem.progress = 100;
  }

  const completedJob = currentPrintJob.value;
  printerStatus.value = 'idle';
  printRemainingSec.value = 0;
  
  appendLog(
    'tool',
    t('device.logPrintComplete'),
    JSON.stringify(
      {
        fileName: completedJob?.fileName ?? '',
        copies: completedJob?.copies ?? 0,
      },
      null,
      2,
    ),
  );

  // 主动推送异步事件给大模型
  if (completedJob) {
    const defaultMsg = locale.value === 'zh' 
      ? `文件 [${completedJob.fileName}] (${completedJob.copies}份) 已成功打印完毕。`
      : `File [${completedJob.fileName}] (${completedJob.copies} copies) printed successfully.`;
      
    postToIframe({
      version: '1.0.0',
      source: 'wiseai-host',
      type: 'event',
      action: 'print-complete',
      requestId: `evt-print-done-${Date.now()}`,
      timestamp: nowIso(),
      payload: {
        success: true,
        fileName: completedJob.fileName,
        copies: completedJob.copies,
        message: defaultMsg,
      },
    });

    appendLog(
      'event',
      t('device.logPrintEventPush'),
      JSON.stringify(
        {
          fileName: completedJob.fileName,
          copies: completedJob.copies,
        },
        null,
        2,
      ),
    );

    // 主动发送播报命令
    const speakText = locale.value === 'zh'
      ? `我已为您成功打印 [${completedJob.fileName}]。`
      : `I have successfully printed [${completedJob.fileName}] for you.`;

    postToIframe({
      version: '1.0.0',
      source: 'wiseai-host',
      type: 'command',
      action: 'sendToUser',
      requestId: `cmd-print-notify-${Date.now()}`,
      timestamp: nowIso(),
      payload: {
        content: speakText,
        playAudio: true,
      },
    });
  }
  
  currentPrintJob.value = null;
}

function startPrintJob(payload: Record<string, unknown>) {
  const fileName = firstString(payload.fileName, payload.name);
  const fileUrl = firstString(payload.fileUrl, payload.url);
  const copies = toPositiveInt(payload.copies, 1);

  if (printerStatus.value === 'printing') {
    return {
      ok: false,
      message: t('device.errorPrinterBusy'),
      data: {
        printerStatus: printerStatus.value,
        currentPrintJob: currentPrintJob.value,
      },
    };
  }

  if (!fileName || !fileUrl) {
    return {
      ok: false,
      message: t('device.errorPrintParamsEmpty'),
      data: {
        fileName,
        fileUrl,
      },
    };
  }

  printerStatus.value = 'printing';
  currentPrintJob.value = {
    fileName,
    fileUrl,
    copies,
  };
  printRemainingSec.value = 10;

  const newJobId = `job-${Date.now()}`;
  const newJob: PrintHistoryItem = {
    id: newJobId,
    fileName,
    copies,
    status: 'printing',
    progress: 0,
    createdAt: new Date().toLocaleTimeString(locale.value === 'zh' ? 'zh-CN' : 'en-US', { hour12: false }),
  };
  printHistory.value.unshift(newJob);

  if (printTimer != null) {
    window.clearInterval(printTimer);
  }

  printTimer = window.setInterval(() => {
    printRemainingSec.value -= 1;
    
    // 更新历史记录中的进度
    const histItem = printHistory.value.find((item) => item.id === newJobId);
    if (histItem) {
      histItem.progress = Math.min(100, Math.floor((10 - printRemainingSec.value) * 10));
    }

    if (printRemainingSec.value <= 0) {
      finishPrintJob(newJobId);
    }
  }, 1000);

  appendLog('tool', t('device.logExecutePrintFile'), JSON.stringify(currentPrintJob.value, null, 2));

  return {
    ok: true,
    message: t('device.actionPrintAccepted'),
    data: {
      printerStatus: printerStatus.value,
      currentPrintJob: currentPrintJob.value,
      estimatedSeconds: 10,
      jobId: newJobId,
    },
  };
}

function handleHostAction(message: WiseMessage) {
  const action = message.action;
  const payload = asObject(message.payload) ?? {};
  latestToolPayload.value = payload;

  if (action === 'turnOnLight') {
    lightOn.value = true;
    appendLog('tool', t('device.logExecuteTurnOnLight'), JSON.stringify({ lightOn: true }, null, 2));
    postToIframe(
      createActionResult(message.requestId, {
        action,
        success: true,
        message: t('device.actionLightOnMsg'),
        data: {
          lightOn: true,
        },
      }),
    );
    return;
  }

  if (action === 'turnOffLight') {
    lightOn.value = false;
    appendLog('tool', t('device.logExecuteTurnOffLight'), JSON.stringify({ lightOn: false }, null, 2));
    postToIframe(
      createActionResult(message.requestId, {
        action,
        success: true,
        message: t('device.actionLightOffMsg'),
        data: {
          lightOn: false,
        },
      }),
    );
    return;
  }

  if (action === 'searchDeviceFiles') {
    const matched = searchFiles(payload);
    postToIframe(
      createActionResult(message.requestId, {
        action,
        success: true,
        message: buildSearchResultMessage(matched),
        data: {
          files: matched,
          fileNames: matched.map((file) => file.name),
          textSummary: buildSearchResultMessage(matched),
        },
      }),
    );
    return;
  }

  if (action === 'printFile') {
    const result = startPrintJob(payload);
    postToIframe(
      createActionResult(message.requestId, {
        action,
        success: result.ok,
        message: result.message,
        data: result.data,
      }),
    );
    return;
  }

  if (action === 'getDeviceStatus') {
    appendLog('tool', t('device.logExecuteGetDeviceStatus'), JSON.stringify(deviceStatusSummary.value, null, 2));
    postToIframe(
      createActionResult(message.requestId, {
        action,
        success: true,
        message: t('device.actionStatusMsg'),
        data: deviceStatusSummary.value,
      }),
    );
  }
}

function handleMessage(event: MessageEvent<WiseMessage>) {
  const message = event.data;
  if (!message || message.source !== 'wiseai-embed') return;

  appendLog(message.type, `收到 ${message.action}`, JSON.stringify(message.payload, null, 2));

  if (message.type === 'event' && message.action === 'ready') {
    embedReady.value = true;
    configureIframe();
    if (voiceRequested.value) {
      window.setTimeout(() => {
        postToIframe(createCommandMessage('openVoice'));
      }, 240);
    }
    return;
  }

  if (message.type === 'event' && message.action === 'state-change') {
    const payload = asObject(message.payload) ?? {};
    voiceOverlayVisible.value = Boolean(payload.voiceOverlayVisible);
    voiceState.value = firstString(payload.voiceState) || voiceState.value;
    return;
  }

  if (message.type === 'event' && message.action === 'voice-exit') {
    voiceOverlayVisible.value = false;
    voiceRequested.value = false;
    voiceState.value = 'idle';
    exitDeviceAgent();
    return;
  }

  if (message.type === 'host-action') {
    handleHostAction(message);
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && voiceOverlayVisible.value) {
    stopVoiceConversation();
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage as EventListener);
  window.addEventListener('keydown', handleKeydown);
  updateTime();
  timeInterval = window.setInterval(updateTime, 1000);
});

onUnmounted(() => {
  window.removeEventListener('message', handleMessage as EventListener);
  window.removeEventListener('keydown', handleKeydown);
  if (printTimer != null) {
    window.clearInterval(printTimer);
  }
  if (timeInterval != null) {
    window.clearInterval(timeInterval);
  }
});
</script>

<template>
  <div class="grid gap-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="grid gap-2">
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="text-2xl font-bold tracking-normal">{{ t('nav.device') }}</h2>
          <Badge variant="secondary">3</Badge>
        </div>
        <p class="max-w-4xl text-sm leading-6 text-muted-foreground">
          {{ t('device.desc') }}
        </p>
      </div>
      <div class="flex items-center gap-3 self-start md:self-center shrink-0">
        <LocaleSwitcher theme="light" />
      </div>
    </div>

    <Card class="border-cyan-200 bg-cyan-50/80 p-4 shadow-none">
      <div class="grid gap-3 text-sm leading-6 text-cyan-950 lg:grid-cols-4">
        <div>
          <p class="font-semibold">{{ t('device.cardStartTitle') }}</p>
          <p class="text-cyan-800">{{ t('device.cardStartDesc') }}</p>
        </div>
        <div>
          <p class="font-semibold">{{ t('device.cardLightTitle') }}</p>
          <p class="text-cyan-800">{{ t('device.cardLightDesc') }}</p>
        </div>
        <div>
          <p class="font-semibold">{{ t('device.cardPrintTitle') }}</p>
          <p class="text-cyan-800">{{ t('device.cardPrintDesc') }}</p>
        </div>
        <div>
          <p class="font-semibold">{{ t('device.cardStatusTitle') }}</p>
          <p class="text-cyan-800">{{ t('device.cardStatusDesc') }}</p>
        </div>
      </div>
    </Card>

    <div class="grid gap-6 xl:grid-cols-[minmax(0,0.98fr)_minmax(340px,0.92fr)]">
      <section class="grid gap-6">
        <div class="device-shell rounded-[36px] p-5 md:p-7">
          <div class="device-topbar mb-5 flex items-center justify-between gap-3 rounded-[22px] px-4 py-3">
            <div class="flex items-center gap-2 text-slate-100">
              <Radio class="h-4 w-4 text-emerald-300" />
              <span class="text-sm font-semibold">{{ t('device.terminalName') }}</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <Button size="sm" class="bg-emerald-500 text-white hover:bg-emerald-600" @click="openDeviceAgent">
                <Mic class="h-3.5 w-3.5" />
                {{ t('device.btnStartVoice') }}
              </Button>
              <Button size="sm" variant="outline" class="border-white/20 bg-white/10 text-white hover:bg-white/16" @click="stopVoiceConversation">
                <MicOff class="h-3.5 w-3.5" />
                {{ t('device.btnStopVoice') }}
              </Button>
            </div>
          </div>

          <div class="device-frame rounded-[30px] p-4 md:p-5">
            <div class="device-screen relative min-h-[620px] overflow-hidden rounded-[26px]">
              <!-- 摄像头小黑点 -->
              <div class="absolute left-1/2 top-3 h-1.5 w-24 -translate-x-1/2 rounded-full bg-white/15 z-30" />

              <!-- 拟真设备首页 -->
              <div
                v-if="!screenMounted"
                class="device-screen-home flex flex-col h-full min-h-[620px] p-6 relative justify-between select-none"
              >
                <!-- 顶部 iPad 风格状态栏 -->
                <div class="flex items-center justify-between px-2 pt-1 pb-2 text-white/90 text-xs font-semibold">
                  <div class="flex items-center gap-1.5">
                    <Wifi class="h-3.5 w-3.5 text-white/90" />
                    <span>{{ t('device.carrier') }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="opacity-90">98%</span>
                    <Battery class="h-4 w-4 text-emerald-400 fill-emerald-400/20" />
                    <span class="ml-1 text-white/90">{{ currentTime }}</span>
                  </div>
                </div>

                <!-- 中间大玻璃按钮区域 -->
                <div class="flex flex-col items-center justify-center flex-1 my-auto gap-4">
                  <h3 class="text-white/60 text-xs font-bold tracking-[0.2em] mb-4 uppercase">WISE OS HOME</h3>
                  <div class="grid grid-cols-3 gap-5 w-full max-w-md">
                    <button
                      class="glass-btn flex flex-col items-center justify-center h-28 rounded-2xl"
                      @click="handleMenuClick('purchase')"
                    >
                      <Receipt class="h-9 w-9 text-sky-200 drop-shadow-[0_2px_8px_rgba(56,189,248,0.4)]" />
                      <span class="mt-3 text-sm font-semibold tracking-wide text-white">{{ t('device.btnCheckout') }}</span>
                    </button>
                    <button
                      class="glass-btn flex flex-col items-center justify-center h-28 rounded-2xl"
                      @click="handleMenuClick('archive')"
                    >
                      <FolderArchive class="h-9 w-9 text-emerald-200 drop-shadow-[0_2px_8px_rgba(16,185,129,0.4)]" />
                      <span class="mt-3 text-sm font-semibold tracking-wide text-white">{{ t('device.btnArchive') }}</span>
                    </button>
                    <button
                      class="glass-btn flex flex-col items-center justify-center h-28 rounded-2xl"
                      @click="handleMenuClick('settings')"
                    >
                      <Settings class="h-9 w-9 text-slate-200 drop-shadow-[0_2px_8px_rgba(148,163,184,0.4)]" />
                      <span class="mt-3 text-sm font-semibold tracking-wide text-white">{{ t('device.btnSettings') }}</span>
                    </button>
                  </div>
                </div>

                <!-- 右下角悬浮喔壳助理圆形头像 -->
                <div
                  class="absolute bottom-6 right-6 z-20 cursor-pointer group flex flex-col items-center"
                  @click="openDeviceAgent"
                >
                  <!-- 呼叫助理提示框 -->
                  <div class="absolute right-0 bottom-20 bg-slate-900/90 text-[11px] text-cyan-200 px-3 py-1.5 rounded-xl border border-cyan-500/30 whitespace-nowrap shadow-lg shadow-cyan-950/50 pointer-events-none opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    {{ t('device.assistantCallBubble') }}
                    <div class="absolute -bottom-1 right-7 w-2 h-2 bg-slate-900 border-r border-b border-cyan-500/30 rotate-45"></div>
                  </div>
                  <!-- 头像呼吸光环 -->
                  <div class="avatar-ring absolute inset-0 rounded-full bg-cyan-400/25"></div>
                  <div class="relative w-16 h-16 rounded-full border-2 border-white/40 bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden">
                    <img src="/agent-avatar.svg" :alt="t('device.assistantCallBubble')" class="w-full h-full object-cover" />
                  </div>
                </div>

                <!-- 底部小状态提示 -->
                <div class="text-center text-[10px] text-white/30 pb-1 pointer-events-none">
                  Copyright © 2026 WiseAi. All Rights Reserved.
                </div>
              </div>

              <!-- 对话模式 iframe -->
              <iframe
                v-else
                ref="iframeRef"
                class="h-[620px] w-full border-0"
                :src="deviceRobotEmbedUrl"
                allow="microphone; autoplay"
                title="device-digital-employee"
                @load="configureIframe"
              />

              <!-- 待机/通话状态标志 -->
              <div class="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-3 py-1.5 text-[11px] text-white/78 backdrop-blur">
                <span class="inline-block h-2 w-2 rounded-full animate-pulse-slow" :class="voiceOverlayVisible ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-400'" />
                <span>{{ voiceOverlayVisible ? t('device.callActive') : t('device.standby') }}</span>
              </div>
            </div>
          </div>
        </div>

        <Card class="border-slate-200 bg-white p-5">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold">{{ t('device.monitorTitle') }}</h3>
              <p class="mt-1 text-sm text-muted-foreground">{{ t('device.monitorDesc') }}</p>
            </div>
            <Badge :variant="voiceOverlayVisible ? 'success' : 'outline'">{{ voiceOverlayVisible ? t('device.statusOnline') : t('device.statusStandby') }}</Badge>
          </div>
          <div class="grid gap-4 md:grid-cols-3">
            <div class="rounded-xl border bg-slate-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{{ t('device.featureTitle') }}</p>
              <p class="mt-3 text-sm leading-6 text-slate-700">{{ t('device.featureDesc') }}</p>
            </div>
            <div class="rounded-xl border bg-slate-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{{ t('device.voiceEntranceTitle') }}</p>
              <p class="mt-3 text-sm leading-6 text-slate-700">{{ t('device.voiceEntranceDesc') }}</p>
            </div>
            <div class="rounded-xl border bg-slate-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{{ t('device.hostToolsTitle') }}</p>
              <p class="mt-3 text-sm leading-6 text-slate-700">`turnOnLight`、`turnOffLight`、`searchDeviceFiles`、`printFile`、`getDeviceStatus`</p>
            </div>
          </div>
        </Card>
      </section>

      <section class="grid gap-5">
        <!-- 卡片一：当前设备状态卡片（整合照明灯与设备仓位） -->
        <Card 
          :class="
            'transition-all duration-500 border p-5 shadow-sm hover:shadow-md cursor-default ' +
            (lightOn ? 'border-amber-400 bg-amber-50/10 shadow-[0_8px_30px_rgba(251,191,36,0.15)]' : 'border-slate-200 bg-white')
          "
        >
          <div class="flex items-start justify-between gap-3 border-b pb-3 mb-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{{ t('device.statusCardLabel') }}</p>
              <h3 class="mt-1 text-base font-bold text-slate-900">{{ t('device.statusCardTitle') }}</h3>
            </div>
            <div :class="['lamp-indicator transition-colors duration-500 scale-90 origin-right', lightOn ? 'is-on' : 'is-off']">
              <Lightbulb class="h-5 w-5" />
            </div>
          </div>
          
          <div class="grid gap-4 md:grid-cols-2 md:items-center">
            <!-- 左侧：照明灯拟物指示 -->
            <div class="grid gap-3">
              <div class="lamp-stage rounded-2xl p-4 transition-all duration-500" :class="lightOn ? 'lamp-stage-on' : 'lamp-stage-off'">
                <div class="lamp-body scale-90">
                  <span class="lamp-glow transition-all duration-500" :class="{ active: lightOn }" />
                </div>
              </div>
              <div class="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs">
                <span class="text-slate-600">{{ t('device.lightControl') }}</span>
                <Badge :variant="lightOn ? 'warning' : 'outline'">{{ lightOn ? t('device.lightOn') : t('device.lightOff') }}</Badge>
              </div>
            </div>

            <!-- 右侧：设备仓位容量 -->
            <div class="rounded-2xl border bg-slate-50 p-4 flex flex-col justify-between min-h-[190px]">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="text-xs text-slate-500 font-semibold uppercase tracking-wider">{{ t('device.totalSlotsLabel') }}</p>
                  <p class="mt-1.5 text-2xl font-black tracking-normal text-slate-950">{{ totalSlots }} <span class="text-xs text-slate-500 font-normal">{{ t('device.unitPiece') }}</span></p>
                </div>
                <Badge variant="outline" class="text-xs">{{ t('device.slotsUsed') }} {{ usedSlots }}</Badge>
              </div>
              
              <div class="mt-4 space-y-2">
                <div class="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div class="h-full rounded-full bg-emerald-500 transition-all duration-500" :style="{ width: `${(usedSlots / totalSlots) * 100}%` }" />
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-600">{{ t('device.slotsAvailableLabel') }}</span>
                  <span class="font-bold text-slate-900">{{ availableSlots }} / {{ totalSlots }}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <!-- 卡片二：打印机卡片 -->
        <Card 
          :class="
            'transition-all duration-500 border p-5 shadow-sm hover:shadow-md cursor-default ' +
            (printerStatus === 'printing' ? 'border-sky-400 bg-sky-50/5 shadow-[0_8px_25px_rgba(56,189,248,0.15)] animate-pulse-subtle' : 'border-slate-200 bg-white')
          "
        >
          <div class="flex items-start justify-between gap-3 border-b pb-3 mb-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{{ t('device.printerComponent') }}</p>
              <h3 class="mt-1 text-base font-bold text-slate-900">{{ t('device.printerTitle') }}</h3>
            </div>
            <div class="rounded-xl bg-sky-50 p-2 text-sky-700 scale-90 origin-right">
              <Printer class="h-5 w-5" />
            </div>
          </div>
          
          <div class="grid gap-4">
            <!-- 拟物打印机动画框 -->
            <div class="printer-visual rounded-2xl border bg-slate-950 p-4 min-h-[140px] flex flex-col justify-end items-center overflow-hidden relative">
              <!-- 打印机背景遮罩 -->
              <div class="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900"></div>
              
              <!-- 激光打印扫描头 -->
              <div v-if="printerStatus === 'printing'" class="printer-scanline absolute left-0 right-0 h-[2px] bg-sky-400 shadow-[0_0_8px_#38bdf8] z-10"></div>
              
              <!-- 出纸缝 -->
              <div class="absolute top-[55px] w-[85%] h-[6px] bg-slate-950 border border-slate-800 rounded-full z-20 shadow-inner"></div>
              
              <!-- 打印中的纸张 A4 -->
              <div 
                class="printer-paper-wrap z-10"
                :class="{ 'is-printing': printerStatus === 'printing' }"
              >
                <div class="printer-paper bg-white border border-slate-200 rounded-t-sm shadow-md p-2 flex flex-col gap-1.5 justify-start text-[8px] text-slate-300">
                  <div class="space-y-1">
                    <div class="h-[2px] w-3/4 bg-slate-200 rounded"></div>
                    <div class="h-[2px] w-5/6 bg-slate-200 rounded"></div>
                    <div class="h-[2px] w-2/3 bg-slate-200 rounded"></div>
                    <div class="h-[2px] w-4/5 bg-slate-200 rounded"></div>
                  </div>
                  <div class="flex items-center justify-between mt-1">
                    <div class="h-[3px] w-1/3 bg-sky-100 rounded"></div>
                    <div class="h-1.5 w-1.5 rounded-full bg-sky-500 animate-ping"></div>
                  </div>
                </div>
              </div>
              
              <div class="relative z-20 w-full text-center mt-auto">
                <span class="text-[10px] font-mono font-semibold tracking-wider text-slate-500">WISE PRINTER K2</span>
              </div>
            </div>

            <!-- 当前任务简报 -->
            <div class="rounded-xl border bg-slate-50 px-4 py-3 text-sm">
              <div class="flex items-center justify-between gap-3">
                <span class="text-slate-600">{{ t('device.printerStatusLabel') }}</span>
                <Badge :variant="printerStatus === 'printing' ? 'warning' : 'success'">
                  {{ printerStatus === 'printing' ? t('device.printerWorking') : t('device.printerIdle') }}
                </Badge>
              </div>
              <div class="mt-3 space-y-1.5 text-xs text-slate-700">
                <p class="truncate">
                  <span class="text-slate-500">{{ t('device.printingLabel') }}</span>
                  <span class="font-semibold text-slate-900">{{ currentPrintJob?.fileName || t('device.printNone') }}</span>
                </p>
                <p>
                  <span class="text-slate-500">{{ t('device.copiesLabel') }}</span>
                  <span>{{ currentPrintJob?.copies || 0 }} {{ t('device.unitCopies') }}</span>
                </p>
              </div>
              <div v-if="printerStatus === 'printing'" class="mt-3 space-y-2">
                <div class="h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    class="h-full rounded-full bg-sky-500 transition-all duration-300"
                    :style="{ width: `${Math.max(6, (10 - printRemainingSec) * 10)}%` }"
                  />
                </div>
                <div class="flex items-center gap-1.5 text-slate-500">
                  <Loader2 class="h-3 w-3 animate-spin text-sky-500" />
                  <span>{{ printRemainingSec }} {{ t('device.printRemaining') }}</span>
                </div>
              </div>
            </div>

            <!-- 打印队列与历史列表 -->
            <div class="border-t pt-3">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{{ t('device.printHistoryTitle') }}</span>
                <Badge variant="outline" class="text-[10px] scale-90 origin-right">{{ printHistory.length }} {{ t('device.unitItems') }}</Badge>
              </div>
              <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
                <div 
                  v-for="job in printHistory" 
                  :key="job.id" 
                  class="flex flex-col gap-1.5 rounded-lg border bg-slate-50 p-2.5 text-xs transition hover:bg-slate-100/80"
                >
                  <div class="flex items-start justify-between gap-2">
                    <p class="font-semibold text-slate-900 truncate flex-1" :title="job.fileName">
                      {{ job.fileName }}
                    </p>
                    <span class="text-[10px] text-slate-400 shrink-0">{{ job.createdAt }}</span>
                  </div>
                  <div class="flex items-center justify-between text-[11px] text-slate-600">
                    <span>{{ job.copies }} {{ t('device.unitCopies') }}</span>
                    <div class="flex items-center gap-1.5 font-medium">
                      <template v-if="job.status === 'printing'">
                        <span class="text-sky-600 animate-pulse">{{ t('device.historyPrinting') }} ({{ job.progress }}%)</span>
                        <Loader2 class="h-3 w-3 animate-spin text-sky-500" />
                      </template>
                      <template v-else-if="job.status === 'completed'">
                        <span class="text-emerald-600">{{ t('device.historyCompleted') }}</span>
                        <CheckCircle2 class="h-3 w-3 text-emerald-500" />
                      </template>
                    </div>
                  </div>
                  <div v-if="job.status === 'printing'" class="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div class="h-full bg-sky-500 transition-all duration-300" :style="{ width: `${job.progress}%` }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <!-- 设备协议日志 -->
        <Card class="grid max-h-[460px] grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
          <div class="border-b p-5">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h3 class="text-base font-semibold">{{ t('device.logPanelTitle') }}</h3>
                <p class="mt-1 text-sm text-muted-foreground">{{ t('device.logPanelDesc') }}</p>
              </div>
              <div class="flex items-center gap-2">
                <Badge variant="secondary">{{ configured ? t('device.toolsConfigured') : t('device.toolsPending') }}</Badge>
                <Badge :variant="voiceOverlayVisible ? 'success' : 'outline'">{{ voiceState }}</Badge>
              </div>
            </div>
          </div>
          <div class="grid gap-3 overflow-auto p-4">
            <div v-if="latestToolPayload" class="rounded-md border border-emerald-200 bg-emerald-50 p-3">
              <p class="text-sm font-semibold text-emerald-900">{{ t('device.logLastPayload') }}</p>
              <pre class="mt-2 max-h-28 overflow-auto whitespace-pre-wrap rounded bg-white/85 p-2 text-xs leading-5 text-emerald-950">{{ JSON.stringify(latestToolPayload, null, 2) }}</pre>
            </div>
            <div v-for="log in logs" :key="log.id" class="rounded-md border bg-card p-3">
              <div class="mb-2 flex items-center justify-between gap-2">
                <Badge variant="secondary">{{ log.type }}</Badge>
                <span class="text-[11px] text-muted-foreground">{{ new Date(log.time).toLocaleTimeString() }}</span>
              </div>
              <p class="text-sm font-semibold">{{ log.title }}</p>
              <pre class="mt-2 max-h-28 overflow-auto whitespace-pre-wrap rounded bg-muted p-2 text-xs leading-5 text-muted-foreground">{{ log.detail }}</pre>
            </div>
          </div>
        </Card>

        <!-- 当前设备状态返回体 -->
        <Card class="border-slate-200 bg-white p-5">
          <div class="mb-4 flex items-center gap-2">
            <ServerCog class="h-4 w-4 text-slate-500" />
            <h3 class="text-base font-semibold">{{ t('device.statusPayloadTitle') }}</h3>
          </div>
          <pre class="overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">{{ JSON.stringify(deviceStatusSummary, null, 2) }}</pre>
        </Card>
      </section>
    </div>
  </div>
</template>

<style scoped>
.device-shell {
  background:
    radial-gradient(circle at top left, rgba(34, 211, 238, 0.18), transparent 30%),
    linear-gradient(160deg, #0f172a 0%, #1e293b 42%, #0b1220 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 32px 90px rgba(15, 23, 42, 0.24);
}

.device-topbar {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.06));
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.device-frame {
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.05)),
    linear-gradient(180deg, rgba(15, 23, 42, 0.82), rgba(2, 6, 23, 0.96));
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(255, 255, 255, 0.03);
}

.device-screen {
  background:
    radial-gradient(circle at top, rgba(56, 189, 248, 0.18), transparent 26%),
    linear-gradient(180deg, #0f172a 0%, #020617 100%);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 20px 60px rgba(59, 130, 246, 0.06);
}

.device-screen-home {
  background:
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.35), transparent 45%),
    radial-gradient(circle at bottom left, rgba(29, 78, 216, 0.35), transparent 45%),
    linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 20px 60px rgba(59, 130, 246, 0.06);
}

.glass-btn {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 
    inset 0 1px 1px rgba(255, 255, 255, 0.2),
    0 4px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    0 8px 32px rgba(0, 0, 0, 0.2);
}

.glass-btn:active {
  transform: translateY(0) scale(0.97);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 
    inset 0 1px 1px rgba(255, 255, 255, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-ring {
  animation: ripple 2s infinite ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.45);
    opacity: 0;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s infinite ease-in-out;
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.lamp-indicator {
  display: grid;
  place-items: center;
  height: 48px;
  width: 48px;
  border-radius: 16px;
}

.lamp-indicator.is-on {
  background: rgba(251, 191, 36, 0.16);
  color: #d97706;
}

.lamp-indicator.is-off {
  background: rgba(148, 163, 184, 0.12);
  color: #64748b;
}

.lamp-stage {
  position: relative;
  min-height: 140px;
  overflow: hidden;
}

.lamp-stage-on {
  background: radial-gradient(circle at 50% 40%, rgba(253, 224, 71, 0.45) 0%, rgba(254, 243, 199, 0.95) 60%, rgba(255, 255, 255, 0.9) 100%);
}

.lamp-stage-off {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.84), rgba(30, 41, 59, 0.92));
}

.lamp-body {
  position: absolute;
  left: 50%;
  top: 22px;
  height: 74px;
  width: 54px;
  transform: translateX(-50%);
  border-radius: 999px 999px 22px 22px;
  background: linear-gradient(180deg, #e2e8f0, #94a3b8);
  box-shadow:
    inset 0 2px 10px rgba(255, 255, 255, 0.35),
    0 10px 16px rgba(15, 23, 42, 0.12);
}

.lamp-body::before {
  position: absolute;
  left: 50%;
  top: -24px;
  width: 2px;
  height: 26px;
  transform: translateX(-50%);
  background: rgba(100, 116, 139, 0.9);
  content: '';
}

.lamp-glow {
  position: absolute;
  left: 50%;
  top: 52px;
  height: 22px;
  width: 22px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.56);
}

.lamp-glow.active {
  box-shadow:
    0 0 22px rgba(251, 191, 36, 0.9),
    0 0 56px rgba(252, 211, 77, 0.64),
    0 38px 92px rgba(253, 224, 71, 0.48);
  background: #fde68a;
}

/* 打印机拟物动画样式 */
.printer-scanline {
  top: 55px;
  animation: scanner-move 1.5s ease-in-out infinite;
}

.printer-paper-wrap {
  position: absolute;
  top: 57px;
  width: 55%;
  height: 65px;
  transform: translateY(-100%);
  opacity: 0;
  pointer-events: none;
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.printer-paper-wrap.is-printing {
  opacity: 1;
  animation: 
    paper-slide-out 10s linear forwards, 
    paper-vibrate 0.12s linear infinite;
}

.printer-paper {
  width: 100%;
  height: 100%;
}

@keyframes paper-slide-out {
  0% {
    transform: translateY(-100%);
  }
  80% {
    transform: translateY(-12%);
  }
  88% {
    transform: translateY(-12%);
    opacity: 1;
  }
  98% {
    transform: translateY(-240%);
    opacity: 0;
  }
  100% {
    transform: translateY(-240%);
    opacity: 0;
  }
}

@keyframes paper-vibrate {
  0%, 100% { transform: translateY(var(--tw-translate-y, -12%)) translateX(0); }
  25% { transform: translateY(var(--tw-translate-y, -12%)) translateX(-0.5px) translateY(-0.5px); }
  75% { transform: translateY(var(--tw-translate-y, -12%)) translateX(0.5px) translateY(0.5px); }
}

@keyframes scanner-move {
  0%, 100% { top: 57px; }
  50% { top: 95px; }
}

@keyframes pulse-subtle {
  0%, 100% { border-color: rgba(56, 189, 248, 0.35); box-shadow: 0 8px 25px rgba(56, 189, 248, 0.08); }
  50% { border-color: rgba(56, 189, 248, 0.75); box-shadow: 0 8px 25px rgba(56, 189, 248, 0.22); }
}

.animate-pulse-subtle {
  animation: pulse-subtle 2s infinite ease-in-out;
}
</style>
