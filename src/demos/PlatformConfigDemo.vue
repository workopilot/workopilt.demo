<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { CheckCircle2, Settings2 } from '@lucide/vue';
import { useI18n } from '@/lib/i18n';
import Button from '@/components/ui/Button.vue';
import Card from '@/components/ui/Card.vue';
import Input from '@/components/ui/Input.vue';
import Label from '@/components/ui/Label.vue';
import {
  DEFAULT_BASE_URL,
  DEFAULT_DEVICE_ROBOT_EMBED_URL,
  DEFAULT_ROBOT_EMBED_URL,
  loadPlatformConfig,
  savePlatformConfig,
} from '@/lib/platform-config';

const { t } = useI18n();

const apiKey = ref('');
const baseUrl = ref(DEFAULT_BASE_URL);
const robotEmbedUrl = ref(DEFAULT_ROBOT_EMBED_URL);
const deviceRobotEmbedUrl = ref(DEFAULT_DEVICE_ROBOT_EMBED_URL);
const saved = ref(false);

const previewConfig = computed(() => ({
  apiKey: apiKey.value ? '•'.repeat(Math.min(Math.max(apiKey.value.length, 8), 24)) : t('config.unfilled'),
  baseUrl: baseUrl.value || DEFAULT_BASE_URL,
  robotEmbedUrl: robotEmbedUrl.value || t('config.unfilled'),
  deviceRobotEmbedUrl: deviceRobotEmbedUrl.value || t('config.unfilled'),
}));

onMounted(() => {
  const config = loadPlatformConfig();
  apiKey.value = config.apiKey;
  baseUrl.value = config.baseUrl;
  robotEmbedUrl.value = config.robotEmbedUrl;
  deviceRobotEmbedUrl.value = config.deviceRobotEmbedUrl;
});

function saveConfig() {
  savePlatformConfig({
    apiKey: apiKey.value,
    baseUrl: baseUrl.value,
    robotEmbedUrl: robotEmbedUrl.value,
    deviceRobotEmbedUrl: deviceRobotEmbedUrl.value,
  });

  saved.value = true;
  window.setTimeout(() => {
    saved.value = false;
  }, 1800);
}

function resetBaseUrl() {
  baseUrl.value = DEFAULT_BASE_URL;
}
</script>
<template>
  <div class="grid gap-8">
    <section class="rounded-lg border border-slate-200 bg-white p-7 shadow-sm lg:p-10">
      <div class="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div class="grid gap-4">
          <div class="inline-flex w-fit items-center gap-2 rounded-md bg-slate-950 px-3 py-1 text-xs font-bold text-white">
            <Settings2 class="h-3.5 w-3.5" />
            {{ t('nav.config') }}
          </div>
          <div class="grid gap-4">
            <h2 class="text-3xl font-black tracking-normal text-slate-950 lg:text-5xl">{{ t('config.title') }}</h2>
            <p class="max-w-3xl text-sm leading-7 text-slate-600">
              {{ t('config.desc') }}
            </p>
          </div>
        </div>

        <Card class="border-slate-200 bg-slate-50 p-6 shadow-none">
          <div class="grid gap-4">
            <p class="text-sm font-bold text-slate-950">{{ t('config.previewTitle') }}</p>
            <div class="rounded-md border border-slate-200 bg-white p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{{ t('config.labelBaseUrl') }}</p>
              <p class="mt-2 break-all text-sm font-semibold text-slate-950">{{ previewConfig.baseUrl }}</p>
            </div>
            <div class="rounded-md border border-slate-200 bg-white p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{{ t('config.labelApiKey') }}</p>
              <p class="mt-2 break-all text-sm font-semibold text-slate-950">{{ previewConfig.apiKey }}</p>
            </div>
            <div class="rounded-md border border-slate-200 bg-white p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{{ t('config.labelEmbedUrl') }}</p>
              <p class="mt-2 break-all text-sm font-semibold text-slate-950">{{ previewConfig.robotEmbedUrl }}</p>
            </div>
            <div class="rounded-md border border-slate-200 bg-white p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{{ t('config.labelDeviceUrl') }}</p>
              <p class="mt-2 break-all text-sm font-semibold text-slate-950">{{ previewConfig.deviceRobotEmbedUrl }}</p>
            </div>
          </div>
        </Card>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <Card class="border-slate-200 bg-white p-7">
        <div class="grid gap-6">
          <div class="grid gap-2">
            <h3 class="text-xl font-black tracking-normal text-slate-950">{{ t('config.settingsTitle') }}</h3>
            <p class="text-sm leading-6 text-slate-600">{{ t('config.settingsDesc') }}</p>
          </div>

          <div class="grid gap-5">
            <div class="grid gap-2">
              <Label for="wise-base-url">{{ t('config.labelBaseUrl') }}</Label>
              <Input id="wise-base-url" v-model="baseUrl" placeholder="https://agent.workopilot.com" />
            </div>

            <div class="grid gap-2">
              <Label for="wise-api-key">{{ t('config.labelApiKey') }}</Label>
              <Input id="wise-api-key" v-model="apiKey" type="password" :placeholder="t('config.placeholderApiKey')" />
            </div>

            <div class="grid gap-2">
              <Label for="wise-robot-embed-url">{{ t('config.labelEmbedUrl') }}</Label>
              <Input id="wise-robot-embed-url" v-model="robotEmbedUrl" :placeholder="t('config.placeholderEmbedUrl')" />
            </div>

            <div class="grid gap-2">
              <Label for="wise-device-robot-embed-url">{{ t('config.labelDeviceUrl') }}</Label>
              <Input
                id="wise-device-robot-embed-url"
                v-model="deviceRobotEmbedUrl"
                :placeholder="t('config.placeholderDeviceUrl')"
              />
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <Button @click="saveConfig">{{ t('config.btnSave') }}</Button>
            <Button variant="outline" @click="resetBaseUrl">{{ t('config.btnRestore') }}</Button>
            <span
              v-if="saved"
              class="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700"
            >
              <CheckCircle2 class="h-4 w-4" />
              {{ t('config.alertSaved') }}
            </span>
          </div>
        </div>
      </Card>

      <Card class="border-slate-200 bg-white p-7">
        <div class="grid gap-5">
          <div class="grid gap-2">
            <h3 class="text-xl font-black tracking-normal text-slate-950">{{ t('config.descUse') }}</h3>
            <p class="text-sm leading-6 text-slate-600">{{ t('config.descUseDetail') }}</p>
          </div>

          <div class="grid gap-3">
            <div class="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p class="text-sm font-bold text-slate-950">{{ t('config.labelBaseUrl') }}</p>
              <p class="mt-2 text-sm leading-6 text-slate-600">{{ t('config.descBaseUrl') }}</p>
            </div>
            <div class="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p class="text-sm font-bold text-slate-950">{{ t('config.labelApiKey') }}</p>
              <p class="mt-2 text-sm leading-6 text-slate-600">{{ t('config.descApiKey') }}</p>
            </div>
            <div class="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p class="text-sm font-bold text-slate-950">{{ t('config.labelEmbedUrl') }}</p>
              <p class="mt-2 text-sm leading-6 text-slate-600">{{ t('config.descEmbedUrl') }}</p>
            </div>
            <div class="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p class="text-sm font-bold text-slate-950">{{ t('config.labelDeviceUrl') }}</p>
              <p class="mt-2 text-sm leading-6 text-slate-600">{{ t('config.descDeviceUrl') }}</p>
            </div>
            <div class="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p class="text-sm font-bold text-slate-950">{{ t('config.labelLocalStorage') }}</p>
              <p class="mt-2 text-sm leading-6 text-slate-600">{{ t('config.descLocalStorage') }}</p>
            </div>
          </div>
        </div>
      </Card>
    </section>
  </div>
</template>
