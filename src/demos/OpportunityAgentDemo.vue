<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { CheckCircle2, PartyPopper, Send, X } from '@lucide/vue';
import Avatar from '@/components/ui/Avatar.vue';
import Badge from '@/components/ui/Badge.vue';
import Button from '@/components/ui/Button.vue';
import Card from '@/components/ui/Card.vue';
import Input from '@/components/ui/Input.vue';
import Label from '@/components/ui/Label.vue';
import Textarea from '@/components/ui/Textarea.vue';
import { loadPlatformConfig } from '@/lib/platform-config';
import { mockOpportunityPayload, type SaveOpportunityPayload } from '@/lib/mock-api';
import { createActionResult, createConfigureMessage, type WiseMessage } from '@/lib/wise-embed-protocol';
import { formatCurrency, nowIso } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

const { t, locale } = useI18n();

interface LogItem {
  time: string;
  type: string;
  title: string;
  detail: string;
}

const customerForm = ref({
  companyName: '',
  address: '',
  phone: '',
  riskItems: [] as string[],
});

const opportunityForm = ref({
  title: '',
  stage: '',
  estimatedAmount: null as number | null,
  remark: '',
});

const sheetOpen = ref(false);
const configured = ref(false);
const submitting = ref(false);
const submitted = ref(false);
const iframeRef = ref<HTMLIFrameElement | null>(null);
const defaultUserId = '100200';
const defaultUserName = 'andy';
const platformConfig = loadPlatformConfig();
const agentAvatarUrl = './agent-avatar.svg';
const robotEmbedUrl = computed(() => {
  const template = platformConfig.robotEmbedUrl;
  return template
    .replace(/\{userId\}/g, encodeURIComponent(defaultUserId))
    .replace(/\{userName\}/g, encodeURIComponent(defaultUserName));
});

const logs = ref<LogItem[]>([
  {
    time: nowIso(),
    type: 'system',
    title: t('opportunity.logReadyTitle'),
    detail: t('opportunity.logReadyDetail'),
  },
]);
const lastReceivedPayload = ref<Record<string, unknown> | null>(null);

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

function toNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const normalized = value.replace(/[^\d.-]/g, '');
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : String(item ?? '').trim()))
      .filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/[，,；;\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [] as string[];
}

function normalizeOpportunityPayload(rawPayload: unknown): SaveOpportunityPayload | null {
  const rawObject = asObject(rawPayload);
  const root =
    asObject(rawObject?.payload) ??
    asObject(rawObject?.arguments) ??
    asObject(rawObject?.args) ??
    asObject(rawObject?.params) ??
    asObject(rawObject?.input) ??
    rawObject;

  if (!root) return null;

  const companyName = firstString(root.companyName, root.customerName, root.enterpriseName, root.name);
  const opportunityTitle = firstString(root.opportunityTitle, root.title, root.opportunityName, root.bizTitle);

  if (!companyName && !opportunityTitle) return null;

  return {
    companyName,
    address: firstString(root.address, root.companyAddress, root.registeredAddress),
    phone: firstString(root.phone, root.contactPhone, root.telephone),
    riskItems: toStringArray(root.riskItems ?? root.risks ?? root.riskList),
    opportunityTitle,
    opportunityStage: firstString(root.opportunityStage, root.stage, root.status) || t('opportunity.defaultStage'),
    estimatedAmount: toNumber(root.estimatedAmount ?? root.amount ?? root.budget) ?? 0,
    remark: firstString(root.remark, root.memo, root.comment, root.summary),
  };
}

function appendLog(type: string, title: string, detail: string) {
  logs.value.unshift({
    time: nowIso(),
    type,
    title,
    detail,
  });
}

function postToIframe(message: WiseMessage) {
  iframeRef.value?.contentWindow?.postMessage(message, '*');
  appendLog(message.type, `发送 ${message.action}`, JSON.stringify(message.payload, null, 2));
}

function configureIframe() {
  const message = createConfigureMessage();
  configured.value = true;
  postToIframe(message);
}

function saveOpportunity(payload: SaveOpportunityPayload) {
  submitted.value = false;
  customerForm.value.companyName = payload.companyName;
  customerForm.value.address = payload.address;
  customerForm.value.phone = payload.phone;
  customerForm.value.riskItems = payload.riskItems ?? [];

  opportunityForm.value.title = payload.opportunityTitle;
  opportunityForm.value.stage = payload.opportunityStage ?? t('opportunity.defaultStage');
  opportunityForm.value.estimatedAmount = payload.estimatedAmount ?? null;
  opportunityForm.value.remark = payload.remark ?? '';

  appendLog('host-action', '执行 saveOpportunity', JSON.stringify(payload, null, 2));
}

function canSubmitOpportunity() {
  return Boolean(customerForm.value.companyName && opportunityForm.value.title);
}

async function submitOpportunity() {
  if (!canSubmitOpportunity()) return;

  submitting.value = true;
  await new Promise((resolve) => window.setTimeout(resolve, 700));
  submitting.value = false;
  submitted.value = true;
  appendLog(
    'submit',
    t('opportunity.logSubmitSuccess'),
    JSON.stringify(
      {
        customer: customerForm.value,
        opportunity: opportunityForm.value,
        submitMode: 'mock',
      },
      null,
      2,
    ),
  );
}

function simulateHostAction() {
  const requestId = `act-${Date.now()}`;
  const payload = mockOpportunityPayload();
  saveOpportunity(payload);
  appendLog('action-result', '回传 action-result', JSON.stringify(createActionResult(requestId).payload, null, 2));
}

function handleMessage(event: MessageEvent<WiseMessage>) {
  const message = event.data;
  if (!message || message.source !== 'wiseai-embed') return;

  appendLog(message.type, `收到 ${message.action}`, JSON.stringify(message.payload, null, 2));

  if (message.type === 'event' && message.action === 'ready') {
    configureIframe();
    return;
  }

  if (message.type === 'host-action' && message.action === 'saveOpportunity') {
    lastReceivedPayload.value = asObject(message.payload);
    const normalizedPayload = normalizeOpportunityPayload(message.payload);

    if (!normalizedPayload) {
      const failedResult = createActionResult(message.requestId, {
        action: 'saveOpportunity',
        success: false,
        message: t('opportunity.errorNoArgs'),
        data: {
          receivedPayload: lastReceivedPayload.value,
        },
      });
      (event.source as Window)?.postMessage(failedResult, '*');
      appendLog(
        'action-result',
        '回传 action-result',
        JSON.stringify(failedResult.payload, null, 2),
      );
      return;
    }

    saveOpportunity(normalizedPayload);
    const result = createActionResult(message.requestId, {
      action: 'saveOpportunity',
      success: true,
      message: t('opportunity.logFilled'),
      data: {
        filled: true,
        companyName: normalizedPayload.companyName,
        opportunityTitle: normalizedPayload.opportunityTitle,
      },
    });
    (event.source as Window)?.postMessage(result, '*');
    appendLog('action-result', '回传 action-result', JSON.stringify(result.payload, null, 2));
    return;
  }

  if (message.type === 'host-action' && message.action === 'submitOpportunity') {
    if (!canSubmitOpportunity()) {
      const failedResult = createActionResult(message.requestId, {
        action: 'submitOpportunity',
        success: false,
        message: t('opportunity.errorIncomplete'),
        data: {
          companyName: customerForm.value.companyName,
          opportunityTitle: opportunityForm.value.title,
        },
      });
      (event.source as Window)?.postMessage(failedResult, '*');
      appendLog('action-result', '回传 action-result', JSON.stringify(failedResult.payload, null, 2));
      return;
    }

    void submitOpportunity().then(() => {
      const result = createActionResult(message.requestId, {
        action: 'submitOpportunity',
        success: true,
        message: t('opportunity.logSubmitSuccess'),
        data: {
          submitted: true,
          companyName: customerForm.value.companyName,
          opportunityTitle: opportunityForm.value.title,
        },
      });
      (event.source as Window)?.postMessage(result, '*');
      appendLog('action-result', '回传 action-result', JSON.stringify(result.payload, null, 2));
    });
  }
}

function openAgent() {
  sheetOpen.value = true;
  window.setTimeout(() => {
    if (!configured.value) configureIframe();
  }, 800);
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && sheetOpen.value) {
    sheetOpen.value = false;
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage as EventListener);
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('message', handleMessage as EventListener);
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div class="relative grid gap-5 pb-24">
    <div class="grid gap-2">
      <div class="flex flex-wrap items-center gap-3">
        <h2 class="text-2xl font-bold tracking-normal">{{ t('opportunity.title') }}</h2>
      </div>
      <p class="max-w-3xl text-sm leading-6 text-muted-foreground">
        {{ t('opportunity.desc') }}
      </p>
    </div>

    <Card class="border-sky-200 bg-sky-50/80 p-4 shadow-none">
      <div class="grid gap-3 text-sm leading-6 text-sky-950 lg:grid-cols-3">
        <div>
          <p class="font-semibold">{{ t('opportunity.alertTitle1') }}</p>
          <p class="text-sky-800">
            {{ t('opportunity.alertDesc1') }}
          </p>
        </div>
        <div>
          <p class="font-semibold">{{ t('opportunity.alertTitle2') }}</p>
          <p class="text-sky-800">
            {{ t('opportunity.alertDesc2') }}
          </p>
        </div>
        <div>
          <p class="font-semibold">{{ t('opportunity.alertTitle3') }}</p>
          <p class="text-sky-800">
            {{ t('opportunity.alertDesc3') }}
          </p>
        </div>
      </div>
    </Card>

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div class="grid gap-5">
        <Card v-if="submitted" class="relative min-h-[520px] overflow-hidden p-8">
          <div class="pointer-events-none absolute inset-x-0 top-0 h-56 overflow-hidden">
            <span
              v-for="index in 38"
              :key="index"
              class="confetti-piece"
              :style="{
                left: `${(index * 29) % 100}%`,
                animationDelay: `${(index % 13) * 0.08}s`,
                backgroundColor: ['#0f766e', '#2563eb', '#f59e0b', '#ef4444', '#7c3aed'][index % 5],
              }"
            />
          </div>

          <div class="relative z-10 grid h-full min-h-[460px] place-items-center text-center">
            <div class="grid max-w-xl gap-5">
              <div class="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <PartyPopper class="h-10 w-10" />
              </div>
              <div>
                <h3 class="text-2xl font-bold tracking-normal">{{ t('opportunity.successTitle') }}</h3>
                <p class="mt-2 text-sm leading-6 text-muted-foreground">
                  {{ t('opportunity.successDesc') }}
                </p>
              </div>
              <div class="grid gap-3 rounded-lg border bg-muted/35 p-4 text-left">
                <div class="flex items-center gap-2">
                  <CheckCircle2 class="h-4 w-4 text-emerald-600" />
                  <span class="text-sm font-semibold">{{ customerForm.companyName }}</span>
                </div>
                <p class="text-sm text-muted-foreground">{{ opportunityForm.title }}</p>
                <div class="flex flex-wrap gap-2">
                  <Badge variant="success">{{ opportunityForm.stage }}</Badge>
                  <Badge variant="outline">{{ formatCurrency(opportunityForm.estimatedAmount) }}</Badge>
                </div>
              </div>
              <div class="flex flex-wrap justify-center gap-3">
                <Button variant="outline" @click="submitted = false">{{ t('opportunity.btnBackEdit') }}</Button>
                <Button @click="simulateHostAction">{{ t('opportunity.btnSimulateNext') }}</Button>
              </div>
            </div>
          </div>
        </Card>

        <template v-else>
        <Card class="p-5">
          <div class="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold">{{ t('opportunity.secCustomer') }}</h3>
              <p class="mt-1 text-sm text-muted-foreground">{{ t('opportunity.secCustomerDesc') }}</p>
            </div>
            <Badge :variant="customerForm.companyName ? 'success' : 'outline'">{{ customerForm.companyName ? t('opportunity.badgeFilled') : t('opportunity.badgeEmpty') }}</Badge>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="grid gap-2">
              <Label>{{ t('opportunity.labelCompany') }}</Label>
              <Input v-model="customerForm.companyName" :placeholder="t('opportunity.labelCompany')" />
            </div>
            <div class="grid gap-2">
              <Label>{{ t('opportunity.labelPhone') }}</Label>
              <Input v-model="customerForm.phone" :placeholder="t('opportunity.labelPhone')" />
            </div>
            <div class="grid gap-2 md:col-span-2">
              <Label>{{ t('opportunity.labelAddress') }}</Label>
              <Input v-model="customerForm.address" :placeholder="t('opportunity.labelAddress')" />
            </div>
          </div>
          <div class="mt-4 grid gap-2">
            <Label>{{ t('opportunity.labelRisks') }}</Label>
            <div class="flex min-h-10 flex-wrap gap-2 rounded-md border bg-muted/35 p-2">
              <Badge v-for="risk in customerForm.riskItems" :key="risk" variant="warning">{{ risk }}</Badge>
              <span v-if="customerForm.riskItems.length === 0" class="px-1 py-1 text-sm text-muted-foreground">{{ t('opportunity.noRisks') }}</span>
            </div>
          </div>
        </Card>

        <Card class="p-5">
          <div class="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold">{{ t('opportunity.secOpportunity') }}</h3>
              <p class="mt-1 text-sm text-muted-foreground">{{ t('opportunity.secOpportunityDesc') }}</p>
            </div>
            <Badge variant="outline">{{ opportunityForm.stage || (locale === 'zh' ? '未进入阶段' : 'Draft') }}</Badge>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="grid gap-2 md:col-span-2">
              <Label>{{ t('opportunity.labelTitle') }}</Label>
              <Input v-model="opportunityForm.title" :placeholder="t('opportunity.labelTitle')" />
            </div>
            <div class="grid gap-2">
              <Label>{{ t('opportunity.labelStage') }}</Label>
              <Input v-model="opportunityForm.stage" :placeholder="t('opportunity.defaultStage')" />
            </div>
            <div class="grid gap-2">
              <Label>{{ t('opportunity.labelAmount') }}</Label>
              <Input
                :model-value="opportunityForm.estimatedAmount ?? ''"
                :placeholder="t('opportunity.labelAmount')"
                @update:model-value="opportunityForm.estimatedAmount = Number($event || 0)"
              />
            </div>
            <div class="grid gap-2 md:col-span-2">
              <Label>{{ t('opportunity.labelRemark') }}</Label>
              <Textarea v-model="opportunityForm.remark" :rows="4" :placeholder="t('opportunity.labelRemark')" />
            </div>
          </div>
          <div class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md bg-muted/50 p-3 text-sm">
            <span>{{ t('opportunity.currentAmount') }}<span class="font-semibold">{{ formatCurrency(opportunityForm.estimatedAmount) }}</span></span>
            <Button
              :disabled="submitting || !customerForm.companyName || !opportunityForm.title"
              size="sm"
              @click="submitOpportunity"
            >
              <Send class="h-3.5 w-3.5" />
              {{ submitting ? t('common.submitting') : t('opportunity.btnSubmitOpp') }}
            </Button>
          </div>
        </Card>
        </template>
      </div>

      <Card class="grid max-h-[680px] grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
        <div class="border-b p-5">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold">{{ t('opportunity.logTitle') }}</h3>
              <p class="mt-1 text-sm text-muted-foreground">{{ t('opportunity.logDesc') }}</p>
            </div>
            <Button size="sm" variant="outline" @click="simulateHostAction">
              <Send class="h-3.5 w-3.5" />
              {{ t('opportunity.btnSimulateSave') }}
            </Button>
          </div>
        </div>
        <div class="grid gap-3 overflow-auto p-4">
          <div v-if="lastReceivedPayload" class="rounded-md border border-emerald-200 bg-emerald-50 p-3">
            <p class="text-sm font-semibold text-emerald-900">{{ t('opportunity.logRecentInput') }}</p>
            <pre class="mt-2 max-h-28 overflow-auto whitespace-pre-wrap rounded bg-white/80 p-2 text-xs leading-5 text-emerald-900">{{ JSON.stringify(lastReceivedPayload, null, 2) }}</pre>
          </div>
          <div v-for="log in logs" :key="log.time + log.title" class="rounded-md border bg-card p-3">
            <div class="mb-2 flex items-center justify-between gap-2">
              <Badge variant="secondary">{{ log.type }}</Badge>
              <span class="text-[11px] text-muted-foreground">{{ new Date(log.time).toLocaleTimeString() }}</span>
            </div>
            <p class="text-sm font-semibold">{{ log.title }}</p>
            <pre class="mt-2 max-h-28 overflow-auto whitespace-pre-wrap rounded bg-muted p-2 text-xs leading-5 text-muted-foreground">{{ log.detail }}</pre>
          </div>
        </div>
      </Card>
    </div>

    <button
      class="fixed bottom-6 right-6 z-30 flex items-center gap-3 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90"
      @click="openAgent"
    >
      <Avatar class="h-10 w-10 overflow-hidden ring-2 ring-white/20">
        <img :src="agentAvatarUrl" :alt="t('opportunity.agentFloatBtn')" class="h-full w-full object-cover" />
      </Avatar>
      <span>{{ t('opportunity.agentFloatBtn') }}</span>
    </button>

    <div v-if="sheetOpen" class="fixed inset-y-0 right-0 z-40 w-full max-w-[520px]">
      <aside class="relative flex h-full w-full flex-col border-l bg-card shadow-soft">
        <Button
          size="icon"
          variant="ghost"
          class="absolute right-3 top-16 z-10 bg-background/90 backdrop-blur"
          @click="sheetOpen = false"
        >
          <X class="h-4 w-4" />
        </Button>
        <div class="min-h-0 flex-1">
          <iframe
            ref="iframeRef"
            class="h-full w-full border-0"
            :src="robotEmbedUrl"
            :title="t('opportunity.agentFloatBtn')"
            @load="configureIframe"
          />
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.confetti-piece {
  position: absolute;
  top: -18px;
  width: 8px;
  height: 14px;
  border-radius: 2px;
  opacity: 0;
  animation: confetti-fall 1.85s ease-out forwards;
  transform: rotate(0deg);
}

@keyframes confetti-fall {
  0% {
    opacity: 0;
    transform: translate3d(0, -18px, 0) rotate(0deg);
  }
  12% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate3d(22px, 230px, 0) rotate(420deg);
  }
}
</style>
