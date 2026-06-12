<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { ArrowLeft, Check, Clipboard, CloudLightning, Info, ShieldCheck, UserCheck } from '@lucide/vue';
import Button from '@/components/ui/Button.vue';
import Card from '@/components/ui/Card.vue';
import { loadPlatformConfig, normalizeWiseBaseUrl } from '@/lib/platform-config';
import { useI18n } from '@/lib/i18n';
import LocaleSwitcher from '@/components/LocaleSwitcher.vue';

const { t, locale } = useI18n();

interface UserProfile {
  userId: string;
  userName: string;
  nickName: string;
  email: string;
  phoneNumber: string;
  avatar: string;
  tenantId: string;
  tenantName: string;
  isPlatformUser: boolean;
}

const copiedField = ref<string | null>(null);
const parsedParams = ref<Record<string, string>>({});
const platformConfig = loadPlatformConfig();

const apiStatus = ref<'idle' | 'loading' | 'success' | 'failed'>('idle');
const apiError = ref<string | null>(null);
const fetchSource = ref<'real' | 'mock'>('mock');

const userInfo = ref<UserProfile>({
  userId: '',
  userName: '',
  nickName: '',
  email: '',
  phoneNumber: '',
  avatar: '',
  tenantId: '',
  tenantName: '',
  isPlatformUser: false,
});

// 解析 URL hash 后面的参数
function parseHashParams() {
  const hash = window.location.hash;
  const qIndex = hash.indexOf('?');
  if (qIndex === -1) {
    parsedParams.value = {};
    return;
  }

  const queryString = hash.slice(qIndex + 1);
  const searchParams = new URLSearchParams(queryString);
  const params: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    if (value) {
      params[key] = value;
    }
  }
  parsedParams.value = params;
}

// 模拟的高仿真用户信息
const mockUserProfile = computed<UserProfile>(() => {
  return {
    userId: parsedParams.value.userId || '100200',
    userName: 'andy_sso_demo',
    nickName: '喔壳商机专员 (演示账号)',
    email: 'andy.sso@workopilot.demo',
    phoneNumber: '188-8888-8888',
    avatar: './agent-avatar.svg',
    tenantId: parsedParams.value.tenantId || 'tenant_demo_corp',
    tenantName: '北京喔壳智能科技有限公司',
    isPlatformUser: true,
  };
});

// 计算 Curl 命令行，帮助开发者理解对接
const curlCommand = computed(() => {
  const token = parsedParams.value.runtimeToken || 'MOCK_RUNTIME_TOKEN';
  const apiKey = platformConfig.apiKey || 'YOUR_API_KEY';
  return `curl -X GET "${platformConfig.baseUrl}/api/ai/runtime/user/profile?runtimeToken=${token}" \\\n  -H "API-KEY: ${apiKey}" \\\n  -H "X-Runtime-Token: ${token}"`;
});

// 异步调取用户信息接口
async function fetchUserProfile() {
  const token = parsedParams.value.runtimeToken;
  if (!token) {
    // 如果没有 runtimeToken，直接回退到高仿真模拟数据（这通常是单点登录场景，只含 userId）
    fetchSource.value = 'mock';
    userInfo.value = mockUserProfile.value;
    apiStatus.value = 'idle';
    return;
  }

  apiStatus.value = 'loading';
  apiError.value = null;

  try {
    const baseUrl = normalizeWiseBaseUrl(platformConfig.baseUrl);
    const response = await fetch(`${baseUrl}/api/ai/runtime/user/profile?runtimeToken=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: {
        'API-KEY': platformConfig.apiKey || '',
        'X-Runtime-Token': token,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP 错误 ${response.status}: ${response.statusText}`);
    }

    const resJson = await response.json() as { code?: number; data?: UserProfile; msg?: string };
    if (resJson.code !== undefined && resJson.code !== 200 && resJson.code !== 0) {
      throw new Error(resJson.msg || `接口报错，代码 ${resJson.code}`);
    }

    if (resJson.data) {
      userInfo.value = resJson.data;
      fetchSource.value = 'real';
      apiStatus.value = 'success';
    } else {
      throw new Error('未返回有效的用户信息数据');
    }
  } catch (err: any) {
    console.warn('获取真实用户信息失败，切入高仿真本地模拟模式:', err);
    apiError.value = err.message || '网络连接或跨域限制阻碍';
    userInfo.value = mockUserProfile.value;
    fetchSource.value = 'mock';
    apiStatus.value = 'failed';
  }
}

function handleCopy(text: string, field: string) {
  navigator.clipboard.writeText(text).then(() => {
    copiedField.value = field;
    window.setTimeout(() => {
      copiedField.value = null;
    }, 1500);
  });
}

function goBack() {
  window.location.hash = 'opportunity';
}

function handleHashChange() {
  parseHashParams();
  fetchUserProfile();
}

onMounted(() => {
  parseHashParams();
  fetchUserProfile();
  window.addEventListener('hashchange', handleHashChange);
});

onUnmounted(() => {
  window.removeEventListener('hashchange', handleHashChange);
});

watch(mockUserProfile, (newVal) => {
  if (fetchSource.value === 'mock') {
    userInfo.value = newVal;
  }
});
</script>

<template>
  <div class="platform-integration-view min-h-[600px] rounded-xl border border-slate-200 bg-slate-50 p-6 text-slate-800 shadow-sm transition-all duration-300">
    <!-- 头部面包屑及导航 -->
    <header class="mb-6 flex items-center justify-between border-b border-slate-200/80 pb-4">
      <div class="flex items-center gap-3">
        <Button size="icon" variant="ghost" class="h-9 w-9 rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900" @click="goBack">
          <ArrowLeft class="h-4 w-4" />
        </Button>
        <div>
          <h2 class="text-xl font-bold tracking-tight text-slate-900">{{ t('integration.title') }}</h2>
          <p class="text-xs text-slate-500">{{ t('integration.desc') }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <LocaleSwitcher theme="light" />
        <span class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
          <span :class="['h-2 w-2 rounded-full', fetchSource === 'real' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500']"></span>
          {{ fetchSource === 'real' ? t('integration.badgeReal') : t('integration.badgeMock') }}
        </span>
      </div>
    </header>

    <div class="grid gap-6 lg:grid-cols-[1fr_380px]">
      <!-- 左侧：参数抓取及对接说明 -->
      <div class="grid gap-6">
        <!-- 参数表格 -->
        <Card class="border-slate-200 bg-white p-6 shadow-none">
          <div class="mb-4">
            <h3 class="text-base font-semibold text-slate-900 flex items-center gap-2">
              <CloudLightning class="h-4 w-4 text-sky-500" />
              {{ t('integration.tableTitle') }}
            </h3>
            <p class="text-xs text-slate-500 mt-1">{{ t('integration.tableDesc') }}</p>
          </div>

          <div class="overflow-x-auto rounded-lg border border-slate-200">
            <table class="min-w-full divide-y divide-slate-200 text-sm">
              <thead class="bg-slate-50 font-semibold text-slate-600">
                <tr>
                  <th class="px-4 py-3 text-left">{{ t('integration.thName') }}</th>
                  <th class="px-4 py-3 text-left">{{ t('integration.thValue') }}</th>
                  <th class="px-4 py-3 text-left">{{ t('integration.thAction') }}</th>
                  <th class="px-4 py-3 text-center w-20">{{ t('integration.thOp') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white text-slate-700">
                <!-- runtimeToken -->
                <tr>
                  <td class="px-4 py-3 font-mono text-xs font-bold text-slate-900">runtimeToken</td>
                  <td class="px-4 py-3">
                    <span v-if="parsedParams.runtimeToken" class="font-mono text-xs break-all bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-100">
                      {{ parsedParams.runtimeToken }}
                    </span>
                    <span v-else class="text-xs text-slate-400 italic">{{ t('integration.notReceivedToken') }}</span>
                  </td>
                  <td class="px-4 py-3 text-xs text-slate-500">{{ t('integration.descToken') }}</td>
                  <td class="px-4 py-3 text-center">
                    <Button v-if="parsedParams.runtimeToken" size="icon" variant="ghost" class="h-7 w-7 text-slate-400 hover:text-slate-600" @click="handleCopy(parsedParams.runtimeToken, 'token')">
                      <Check v-if="copiedField === 'token'" class="h-3.5 w-3.5 text-emerald-500" />
                      <Clipboard v-else class="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>

                <!-- userId -->
                <tr>
                  <td class="px-4 py-3 font-mono text-xs font-bold text-slate-900">userId</td>
                  <td class="px-4 py-3">
                    <span v-if="parsedParams.userId" class="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">
                      {{ parsedParams.userId }}
                    </span>
                    <span v-else class="text-xs text-slate-400 italic">{{ t('integration.notReceived') }}</span>
                  </td>
                  <td class="px-4 py-3 text-xs text-slate-500">{{ t('integration.descUserId') }}</td>
                  <td class="px-4 py-3 text-center">
                    <Button v-if="parsedParams.userId" size="icon" variant="ghost" class="h-7 w-7 text-slate-400 hover:text-slate-600" @click="handleCopy(parsedParams.userId, 'userId')">
                      <Check v-if="copiedField === 'userId'" class="h-3.5 w-3.5 text-emerald-500" />
                      <Clipboard v-else class="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>

                <!-- sessionId -->
                <tr>
                  <td class="px-4 py-3 font-mono text-xs font-bold text-slate-900">sessionId</td>
                  <td class="px-4 py-3">
                    <span v-if="parsedParams.sessionId" class="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">
                      {{ parsedParams.sessionId }}
                    </span>
                    <span v-else class="text-xs text-slate-400 italic">{{ t('integration.notReceived') }}</span>
                  </td>
                  <td class="px-4 py-3 text-xs text-slate-500">{{ t('integration.descSessionId') }}</td>
                  <td class="px-4 py-3 text-center">
                    <Button v-if="parsedParams.sessionId" size="icon" variant="ghost" class="h-7 w-7 text-slate-400 hover:text-slate-600" @click="handleCopy(parsedParams.sessionId, 'sessionId')">
                      <Check v-if="copiedField === 'sessionId'" class="h-3.5 w-3.5 text-emerald-500" />
                      <Clipboard v-else class="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>

                <!-- tenantId -->
                <tr>
                  <td class="px-4 py-3 font-mono text-xs font-bold text-slate-900">tenantId</td>
                  <td class="px-4 py-3">
                    <span v-if="parsedParams.tenantId" class="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">
                      {{ parsedParams.tenantId }}
                    </span>
                    <span v-else class="text-xs text-slate-400 italic">{{ t('integration.notReceivedTenant') }}</span>
                  </td>
                  <td class="px-4 py-3 text-xs text-slate-500">{{ t('integration.descTenantId') }}</td>
                  <td class="px-4 py-3 text-center">
                    <Button v-if="parsedParams.tenantId" size="icon" variant="ghost" class="h-7 w-7 text-slate-400 hover:text-slate-600" @click="handleCopy(parsedParams.tenantId, 'tenantId')">
                      <Check v-if="copiedField === 'tenantId'" class="h-3.5 w-3.5 text-emerald-500" />
                      <Clipboard v-else class="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <!-- 对接联调代码预览 -->
        <Card class="border-slate-200 bg-slate-900 p-5 text-slate-200 shadow-none">
          <div class="mb-3 flex items-center justify-between">
            <h4 class="text-sm font-semibold flex items-center gap-2 text-white">
              <Info class="h-4 w-4 text-emerald-400" />
              {{ t('integration.devRef') }}
            </h4>
            <Button size="sm" variant="ghost" class="h-7 text-xs text-slate-400 hover:text-white hover:bg-slate-800" @click="handleCopy(curlCommand, 'curl')">
              <Check v-if="copiedField === 'curl'" class="h-3 w-3 text-emerald-400" />
              <Clipboard v-else class="h-3 w-3" />
              {{ copiedField === 'curl' ? t('common.copied') : t('common.copy') + ' Curl' }}
            </Button>
          </div>
          <p class="text-xs text-slate-400 mb-3 leading-5">
            {{ t('integration.devRefDesc') }}
          </p>
          <pre class="overflow-x-auto rounded bg-black/60 p-3 font-mono text-xs text-emerald-400 leading-5 whitespace-pre-wrap">{{ curlCommand }}</pre>
        </Card>
      </div>

      <!-- 右侧：用户信息展示面板 -->
      <div class="grid gap-6 content-start">
        <Card class="border-slate-200 bg-white p-6 shadow-none">
          <div class="mb-4 border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck class="h-4 w-4 text-emerald-500" />
              {{ t('integration.userProfileTitle') }}
            </h3>
            <span v-if="apiStatus === 'loading'" class="text-xs text-sky-500">{{ t('integration.userProfileLoading') }}</span>
          </div>

          <!-- 用户卡片展示 -->
          <div class="grid gap-5">
            <div class="flex items-center gap-4 border-b border-slate-100/60 pb-4">
              <div class="h-16 w-16 overflow-hidden rounded-full border-2 border-slate-200 bg-slate-50 p-0.5 shadow-sm">
                <img :src="userInfo.avatar || './agent-avatar.svg'" class="h-full w-full rounded-full object-cover" :alt="t('integration.userProfileTitle')" />
              </div>
              <div>
                <h4 class="text-base font-bold text-slate-900">{{ userInfo.nickName || userInfo.userName || 'Andy' }}</h4>
                <p class="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <span class="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                  UserId: {{ userInfo.userId || '100200' }}
                </p>
              </div>
            </div>

            <!-- 用户具体信息项 -->
            <div class="grid gap-3 text-xs leading-5">
              <div class="grid grid-cols-[80px_1fr] border-b border-slate-100 pb-2">
                <span class="text-slate-500 font-medium">{{ t('integration.labelTenantName') }}</span>
                <span class="text-slate-800 font-semibold text-right break-all">{{ userInfo.tenantName || '北京喔壳智能科技有限公司' }}</span>
              </div>
              <div class="grid grid-cols-[80px_1fr] border-b border-slate-100 pb-2">
                <span class="text-slate-500 font-medium">{{ t('integration.labelTenantId') }}</span>
                <span class="text-slate-800 font-mono text-right break-all">{{ userInfo.tenantId || 'tenant_demo_corp' }}</span>
              </div>
              <div class="grid grid-cols-[80px_1fr] border-b border-slate-100 pb-2">
                <span class="text-slate-500 font-medium">{{ t('integration.labelPhone') }}</span>
                <span class="text-slate-800 text-right">{{ userInfo.phoneNumber || '188-8888-8888' }}</span>
              </div>
              <div class="grid grid-cols-[80px_1fr] border-b border-slate-100 pb-2">
                <span class="text-slate-500 font-medium">{{ t('integration.labelEmail') }}</span>
                <span class="text-slate-800 font-mono text-right break-all">{{ userInfo.email || 'andy.sso@workopilot.demo' }}</span>
              </div>
              <div class="grid grid-cols-[80px_1fr] pb-1">
                <span class="text-slate-500 font-medium">{{ t('integration.labelAccountType') }}</span>
                <span class="text-slate-800 text-right flex items-center justify-end gap-1 font-semibold">
                  <ShieldCheck class="h-3.5 w-3.5 text-sky-500" />
                  {{ userInfo.isPlatformUser ? t('integration.typeAdmin') : t('integration.typeUser') }}
                </span>
              </div>
            </div>

            <!-- 连接状态信息 -->
            <div v-if="fetchSource === 'mock'" class="rounded-md bg-amber-50 border border-amber-200 p-3 mt-2">
              <p class="text-xs font-semibold text-amber-900">{{ t('integration.alertMockTitle') }}</p>
              <p class="text-[11px] text-amber-800/80 mt-1 leading-4">
                {{ apiError ? (locale === 'zh' ? '报错: ' + apiError + '。' : 'Error: ' + apiError + '. ') : '' }}{{ t('integration.alertMockDesc') }}
              </p>
            </div>
            <div v-else class="rounded-md bg-emerald-50 border border-emerald-200 p-3 mt-2 flex items-start gap-2">
              <Check class="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p class="text-xs font-semibold text-emerald-900">{{ t('integration.alertRealTitle') }}</p>
                <p class="text-[11px] text-emerald-800/80 mt-0.5 leading-4">
                  {{ t('integration.alertRealDesc') }}
                </p>
              </div>
            </div>
            <Button size="sm" class="w-full mt-2" @click="fetchUserProfile">
              {{ t('integration.btnReverify') }}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.platform-integration-view {
  font-family: inherit;
}
table th {
  font-weight: 600;
}
</style>
