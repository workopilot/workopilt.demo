<script setup lang="ts">
import { computed, ref } from 'vue';
import { AlertTriangle, FileCheck2, Loader2, UploadCloud } from '@lucide/vue';
import Badge from '@/components/ui/Badge.vue';
import Button from '@/components/ui/Button.vue';
import Card from '@/components/ui/Card.vue';
import Input from '@/components/ui/Input.vue';
import Label from '@/components/ui/Label.vue';
import Textarea from '@/components/ui/Textarea.vue';
import type { ContractAuditResult, PurchaseOrderDraft } from '@/lib/mock-api';
import { formatCurrency } from '@/lib/utils';
import { auditPurchaseContractByAi, extractPurchaseContract, suggestPurchaseItemsByAi, uploadDocumentFile } from '@/lib/wise-api';
import { useI18n } from '@/lib/i18n';

const { t, locale } = useI18n();

const blankOrder: PurchaseOrderDraft = {
  supplierName: '',
  supplierContact: '',
  supplierPhone: '',
  contractNo: '',
  contractTitle: '',
  amount: 0,
  currency: 'CNY',
  paymentTerms: '',
  deliveryDate: '',
  deliveryAddress: '',
  items: [],
};

function createBlankOrder(): PurchaseOrderDraft {
  return {
    ...blankOrder,
    items: [],
  };
}

const order = ref<PurchaseOrderDraft>(createBlankOrder());
const auditResult = ref<ContractAuditResult | null>(null);
const fileName = ref('');
const recognizing = ref(false);
const auditing = ref(false);
const extractError = ref('');
const auditError = ref('');
const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedContractFile = ref<File | null>(null);
const uploadedContractUrl = ref('');
const pendingFileAction = ref<'extract' | 'audit'>('extract');
const activePanel = ref<'draft' | 'report'>('draft');
const itemAssistantOpen = ref(false);
const itemAssistantPrompt = ref('帮我添加3个喔壳K1智能设备');
const itemAssistantLoading = ref(false);
const itemAssistantError = ref('');

const totalQuantity = computed(() => order.value.items.reduce((sum, item) => sum + item.quantity, 0));
const totalAmount = computed(() => order.value.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));

function triggerFileSelect(action: 'extract' | 'audit' = 'extract') {
  pendingFileAction.value = action;
  fileInputRef.value?.click();
}

async function handleExtract(file: File) {
  selectedContractFile.value = file;
  uploadedContractUrl.value = '';
  fileName.value = file.name;
  recognizing.value = true;
  auditResult.value = null;
  extractError.value = '';

  try {
    order.value = await extractPurchaseContract(file);
    activePanel.value = 'draft';
  } catch (error) {
    const message = error instanceof Error ? error.message : t('purchase.errorExtractFailed');
    extractError.value = message;
    order.value = createBlankOrder();
  } finally {
    recognizing.value = false;
  }
}

async function ensureUploadedContractUrl() {
  if (uploadedContractUrl.value) {
    return uploadedContractUrl.value;
  }

  if (!selectedContractFile.value) {
    throw new Error(t('purchase.errorSelectFileFirst'));
  }

  uploadedContractUrl.value = await uploadDocumentFile(selectedContractFile.value);
  return uploadedContractUrl.value;
}

async function handleAudit() {
  auditError.value = '';

  if (!selectedContractFile.value) {
    triggerFileSelect('audit');
    return;
  }

  auditing.value = true;
  try {
    const fileUrl = await ensureUploadedContractUrl();
    auditResult.value = await auditPurchaseContractByAi(fileUrl);
    activePanel.value = 'report';
  } catch (error) {
    const message = error instanceof Error ? error.message : t('purchase.errorAuditFailed');
    auditError.value = message;
    auditResult.value = null;
  } finally {
    auditing.value = false;
  }
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const selectedFile = target.files?.[0];
  if (!selectedFile) return;

  if (pendingFileAction.value === 'audit') {
    selectedContractFile.value = selectedFile;
    uploadedContractUrl.value = '';
    fileName.value = selectedFile.name;
    await handleAudit();
  } else {
    await handleExtract(selectedFile);
  }

  target.value = '';
}

function severityLabel(severity: string) {
  return severity === 'high' ? t('purchase.riskHigh') : severity === 'medium' ? t('purchase.riskMedium') : t('purchase.riskLow');
}

function openItemAssistant() {
  itemAssistantOpen.value = true;
  itemAssistantError.value = '';
}

function closeItemAssistant() {
  if (itemAssistantLoading.value) return;
  itemAssistantOpen.value = false;
  itemAssistantError.value = '';
}

async function handleSmartAddItems() {
  itemAssistantLoading.value = true;
  itemAssistantError.value = '';

  try {
    const items = await suggestPurchaseItemsByAi(itemAssistantPrompt.value.trim() || '帮我添加3个喔壳K1智能设备');
    order.value.items = [...order.value.items, ...items];
    itemAssistantOpen.value = false;
    activePanel.value = 'draft';
  } catch (error) {
    itemAssistantError.value = error instanceof Error ? error.message : t('purchase.modalErrorFailed');
  } finally {
    itemAssistantLoading.value = false;
  }
}
</script>

<template>
  <div class="grid gap-5">
    <div class="grid gap-2">
      <div class="flex flex-wrap items-center gap-3">
        <h2 class="text-2xl font-bold tracking-normal">{{ t('purchase.pageTitle') }}</h2>
      </div>
      <p class="max-w-3xl text-sm leading-6 text-muted-foreground">
        {{ t('purchase.pageDesc') }}
      </p>
    </div>

    <Card class="border-teal-200 bg-teal-50/80 p-4 shadow-none">
      <div class="grid gap-3 text-sm leading-6 text-teal-950 md:grid-cols-2">
        <div>
          <p class="font-semibold">{{ t('purchase.alertUploadTitle') }}</p>
          <p class="text-teal-800">
            {{ t('purchase.alertUploadDesc') }}
          </p>
          <p class="mt-1 text-xs text-teal-700">{{ t('purchase.alertUploadSetting') }}</p>
        </div>
        <div>
          <p class="font-semibold">{{ t('purchase.alertAuditTitle') }}</p>
          <p class="text-teal-800">
            {{ t('purchase.alertAuditDesc') }}
          </p>
          <p class="mt-1 text-xs text-teal-700">{{ t('purchase.alertAuditSetting') }}</p>
        </div>
      </div>
    </Card>

    <div class="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Card class="p-5">
        <div class="grid gap-4">
          <div class="grid gap-1">
            <h3 class="text-base font-semibold">{{ t('purchase.contractCardTitle') }}</h3>
            <p class="text-sm text-muted-foreground">{{ t('purchase.contractCardDesc') }}</p>
          </div>
          <div class="rounded-lg border border-dashed bg-muted/45 p-5 text-center">
            <UploadCloud class="mx-auto mb-3 h-9 w-9 text-primary" />
            <p class="text-sm font-semibold">{{ fileName || t('purchase.noFileSelected') }}</p>
            <p class="mt-1 text-xs text-muted-foreground">{{ t('purchase.fileTypesDesc') }}</p>
          </div>
          <input ref="fileInputRef" class="hidden" type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp" @change="handleFileChange" />
          <div class="relative">
            <Button :disabled="recognizing || auditing" size="lg" class="w-full pr-16" @click="triggerFileSelect('extract')">
              <Loader2 v-if="recognizing" class="h-4 w-4 animate-spin" />
              <UploadCloud v-else class="h-4 w-4" />
              {{ t('purchase.btnExtract') }}
            </Button>
            <span class="pointer-events-none absolute right-3 top-[-8px] inline-flex rounded-sm bg-orange-700 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
              {{ locale === 'zh' ? '喔壳' : 'Wise' }}
            </span>
          </div>
          <div class="relative">
            <Button :disabled="auditing || recognizing" variant="outline" size="lg" class="w-full pr-16" @click="handleAudit">
              <Loader2 v-if="auditing" class="h-4 w-4 animate-spin" />
              <FileCheck2 v-else class="h-4 w-4" />
              {{ t('purchase.btnAudit') }}
            </Button>
            <span class="pointer-events-none absolute right-3 top-[-8px] inline-flex rounded-sm bg-orange-700 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
              {{ locale === 'zh' ? '喔壳' : 'Wise' }}
            </span>
          </div>
          <p v-if="extractError" class="text-sm leading-6 text-destructive">{{ extractError }}</p>
          <p v-if="auditError" class="text-sm leading-6 text-destructive">{{ auditError }}</p>
        </div>
      </Card>

      <div class="grid gap-5">
        <Card class="overflow-hidden">
          <div class="border-b p-2">
            <div class="grid grid-cols-2 rounded-md bg-muted/60 p-1">
              <button
                :class="[
                  'inline-flex h-11 items-center justify-center rounded-sm text-sm font-semibold transition',
                  activePanel === 'draft' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                ]"
                @click="activePanel = 'draft'"
              >
                {{ t('purchase.tabCreate') }}
              </button>
              <button
                :class="[
                  'inline-flex h-11 items-center justify-center rounded-sm text-sm font-semibold transition',
                  activePanel === 'report' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                ]"
                @click="activePanel = 'report'"
              >
                {{ t('purchase.tabReport') }}
              </button>
            </div>
          </div>

          <div v-if="activePanel === 'draft'" class="grid gap-5 p-5">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 class="text-base font-semibold">{{ t('purchase.draftTitle') }}</h3>
                <p class="mt-1 text-sm text-muted-foreground">{{ t('purchase.draftDesc') }}</p>
              </div>
              <Badge v-if="order.contractNo" variant="success">{{ t('purchase.badgeRecognized') }}</Badge>
              <Badge v-else variant="outline">{{ t('purchase.badgePending') }}</Badge>
            </div>

            <div class="grid gap-4 md:grid-cols-3">
              <div class="grid gap-2">
                <Label>{{ t('purchase.labelSupplier') }}</Label>
                <Input v-model="order.supplierName" :placeholder="t('purchase.labelSupplierPlaceholder')" />
              </div>
              <div class="grid gap-2">
                <Label>{{ t('purchase.labelContact') }}</Label>
                <Input v-model="order.supplierContact" :placeholder="t('purchase.labelContactPlaceholder')" />
              </div>
              <div class="grid gap-2">
                <Label>{{ t('purchase.labelPhone') }}</Label>
                <Input v-model="order.supplierPhone" :placeholder="t('purchase.labelPhonePlaceholder')" />
              </div>
              <div class="grid gap-2">
                <Label>{{ t('purchase.labelContractNo') }}</Label>
                <Input v-model="order.contractNo" :placeholder="t('purchase.labelContractNoPlaceholder')" />
              </div>
              <div class="grid gap-2">
                <Label>{{ t('purchase.labelContractTitle') }}</Label>
                <Input v-model="order.contractTitle" :placeholder="t('purchase.labelContractTitlePlaceholder')" />
              </div>
              <div class="grid gap-2">
                <Label>{{ t('purchase.labelAmount') }}</Label>
                <Input :model-value="order.amount || ''" :placeholder="t('purchase.labelAmountPlaceholder')" @update:model-value="order.amount = Number($event || 0)" />
              </div>
              <div class="grid gap-2 md:col-span-2">
                <Label>{{ t('purchase.labelPayment') }}</Label>
                <Textarea v-model="order.paymentTerms" :rows="3" :placeholder="t('purchase.labelPaymentPlaceholder')" />
              </div>
              <div class="grid gap-2">
                <Label>{{ t('purchase.labelDeliveryDate') }}</Label>
                <Input v-model="order.deliveryDate" :placeholder="t('purchase.labelDeliveryDatePlaceholder')" />
                <Label class="mt-2">{{ t('purchase.labelDeliveryAddress') }}</Label>
                <Input v-model="order.deliveryAddress" :placeholder="t('purchase.labelDeliveryAddressPlaceholder')" />
              </div>
            </div>

            <Card class="overflow-hidden shadow-none">
              <div class="flex flex-wrap items-center justify-between gap-3 border-b p-5">
                <div>
                  <h3 class="text-base font-semibold">{{ t('purchase.detailTitle') }}</h3>
                  <p class="mt-1 text-sm text-muted-foreground">
                    {{ t('purchase.detailDescCount').replace('{count}', totalQuantity.toString()) }}，{{ t('purchase.detailDescAmount').replace('{amount}', formatCurrency(totalAmount)) }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <div class="relative">
                    <Button variant="outline" size="sm" class="pr-14" @click="openItemAssistant">{{ t('purchase.btnSmartAdd') }}</Button>
                    <span class="pointer-events-none absolute right-2 top-[-8px] inline-flex rounded-sm bg-orange-700 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
                      {{ locale === 'zh' ? '喔壳' : 'Wise' }}
                    </span>
                  </div>
                  <Badge variant="outline">{{ locale === 'zh' ? order.items.length + ' 项' : order.items.length + (order.items.length === 1 ? ' item' : ' items') }}</Badge>
                </div>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full min-w-[720px] text-sm">
                  <thead class="bg-muted/60 text-left text-xs text-muted-foreground">
                    <tr>
                      <th class="px-5 py-3 font-semibold">{{ t('purchase.tableThName') }}</th>
                      <th class="px-5 py-3 font-semibold">{{ t('purchase.tableThSpec') }}</th>
                      <th class="px-5 py-3 text-right font-semibold">{{ t('purchase.tableThQuantity') }}</th>
                      <th class="px-5 py-3 text-right font-semibold">{{ t('purchase.tableThPrice') }}</th>
                      <th class="px-5 py-3 text-right font-semibold">{{ t('purchase.tableThSubtotal') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="order.items.length === 0">
                      <td class="px-5 py-8 text-center text-muted-foreground" colspan="5">{{ t('purchase.tableEmptyTip') }}</td>
                    </tr>
                    <tr v-for="item in order.items" :key="item.name" class="border-t">
                      <td class="px-5 py-3 font-medium">{{ item.name }}</td>
                      <td class="px-5 py-3 text-muted-foreground">{{ item.spec }}</td>
                      <td class="px-5 py-3 text-right">{{ item.quantity }}</td>
                      <td class="px-5 py-3 text-right">{{ formatCurrency(item.unitPrice) }}</td>
                      <td class="px-5 py-3 text-right font-semibold">{{ formatCurrency(item.quantity * item.unitPrice) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div v-else class="p-5">
            <template v-if="auditResult">
              <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 class="text-base font-semibold">{{ t('purchase.reportTitle') }}</h3>
                  <p class="mt-1 text-sm text-muted-foreground">{{ auditResult.summary }}</p>
                </div>
                <Badge variant="warning">{{ t('purchase.riskLevelTitle') }}{{ severityLabel(auditResult.riskLevel) }}</Badge>
              </div>
              <div class="grid gap-3">
                <div v-for="issue in auditResult.issues" :key="issue.title" class="rounded-lg border p-4">
                  <div class="mb-2 flex flex-wrap items-center gap-2">
                    <AlertTriangle class="h-4 w-4 text-amber-600" />
                    <p class="font-semibold">{{ issue.title }}</p>
                    <Badge :variant="issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'warning' : 'secondary'">
                      {{ severityLabel(issue.severity) }}
                    </Badge>
                  </div>
                  <p class="text-sm leading-6 text-muted-foreground">{{ issue.description }}</p>
                  <p class="mt-2 text-sm leading-6"><span class="font-semibold">{{ t('purchase.labelSuggestion') }}</span>{{ issue.suggestion }}</p>
                </div>
              </div>
            </template>
            <div v-else class="grid min-h-[320px] place-items-center rounded-lg border border-dashed bg-muted/35 p-6 text-center">
              <div>
                <h3 class="text-base font-semibold">{{ t('purchase.reportEmptyTitle') }}</h3>
                <p class="mt-2 text-sm leading-6 text-muted-foreground">{{ t('purchase.reportEmptyDesc') }}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <div v-if="itemAssistantOpen" class="fixed inset-0 z-40 grid place-items-center bg-slate-950/35 p-4 backdrop-blur-[1px]">
      <Card class="w-full max-w-[560px] border-slate-200 bg-white p-6 shadow-2xl">
        <div class="grid gap-5">
          <div class="grid gap-2">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-bold tracking-normal text-slate-950">{{ t('purchase.modalTitle') }}</h3>
              <span class="inline-flex rounded-sm bg-orange-700 px-2 py-0.5 text-[11px] font-bold text-white">{{ locale === 'zh' ? '喔壳' : 'Wise' }}</span>
            </div>
            <p class="text-sm leading-6 text-muted-foreground">{{ t('purchase.modalDesc') }}</p>
          </div>

          <div class="grid gap-2">
            <Label>{{ t('purchase.modalLabelPrompt') }}</Label>
            <Textarea v-model="itemAssistantPrompt" :rows="5" :placeholder="t('purchase.modalPlaceholderPrompt')" />
          </div>

          <p v-if="itemAssistantError" class="text-sm leading-6 text-destructive">{{ itemAssistantError }}</p>

          <div class="flex justify-end gap-3">
            <Button variant="outline" :disabled="itemAssistantLoading" @click="closeItemAssistant">{{ t('common.cancel') }}</Button>
            <Button :disabled="itemAssistantLoading" @click="handleSmartAddItems">
              <Loader2 v-if="itemAssistantLoading" class="h-4 w-4 animate-spin" />
              {{ t('purchase.modalBtnAdd') }}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
