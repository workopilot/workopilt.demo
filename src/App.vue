<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { ArrowLeft, BookOpenText, Bot, Code2, Layers3, MonitorSmartphone, Play, Settings2, ShoppingCart } from '@lucide/vue';
import DeviceTerminalDemo from '@/demos/DeviceTerminalDemo.vue';
import IntegrationGuideDemo from '@/demos/IntegrationGuideDemo.vue';
import OpportunityAgentDemo from '@/demos/OpportunityAgentDemo.vue';
import PlatformConfigDemo from '@/demos/PlatformConfigDemo.vue';
import PurchaseOrderDemo from '@/demos/PurchaseOrderDemo.vue';
import PlatformIntegrationPage from '@/demos/PlatformIntegrationPage.vue';
import { useI18n } from '@/lib/i18n';
import LocaleSwitcher from '@/components/LocaleSwitcher.vue';

const { t } = useI18n();

type DemoKey = 'purchase' | 'opportunity' | 'device' | 'guide' | 'config' | 'integration';
type ViewKey = 'home' | 'workspace';

const activeDemo = ref<DemoKey>('guide');
const currentView = ref<ViewKey>('home');

const defaultUserId = '100200';

function goToBusinessCard(e: Event) {
  e.stopPropagation();
  const mockToken = 'rt_card_' + Math.random().toString(36).slice(2, 10);
  const sessId = 'sess_opp_' + Date.now().toString().slice(-6);
  window.location.hash = `integration?runtimeToken=${mockToken}&userId=${defaultUserId}&sessionId=${sessId}`;
}

function goToAppSso(e: Event) {
  e.stopPropagation();
  window.location.hash = `integration?userId=${defaultUserId}&tenantId=tenant_demo_corp`;
}

function syncFromHash() {
  const hash = window.location.hash.slice(1);
  if (!hash) {
    currentView.value = 'home';
    return;
  }

  const routeKey = hash.split('?')[0] as DemoKey;
  const validDemos: DemoKey[] = ['purchase', 'opportunity', 'device', 'guide', 'config', 'integration'];
  if (validDemos.includes(routeKey)) {
    activeDemo.value = routeKey;
    currentView.value = 'workspace';
  } else {
    currentView.value = 'home';
  }
}

function enterWorkspace(demo: DemoKey) {
  window.location.hash = demo;
}

function goBackHome() {
  window.location.hash = '';
}

onMounted(() => {
  syncFromHash();
  window.addEventListener('hashchange', syncFromHash);
});

onUnmounted(() => {
  window.removeEventListener('hashchange', syncFromHash);
});
</script>

<template>
  <main v-if="activeDemo === 'integration' && currentView === 'workspace'" class="min-h-screen bg-slate-50">
    <PlatformIntegrationPage />
  </main>

  <main v-else-if="activeDemo === 'device' && currentView === 'workspace'" class="min-h-screen bg-[#020617] text-white">
    <!-- 顶部极简浮动半透明控制栏 -->
    <div class="border-b border-white/10 bg-slate-950/80 px-6 py-3 backdrop-blur-md">
      <div class="mx-auto flex max-w-[1480px] items-center justify-between">
        <button
          class="inline-flex items-center gap-2 text-xs font-semibold text-white/60 transition hover:text-white"
          @click="goBackHome"
        >
          <ArrowLeft class="h-3.5 w-3.5" />
          {{ t('device.btnBack') }}
        </button>
        <div class="flex items-center gap-3">
          <LocaleSwitcher theme="dark" />
          <a
            href="https://github.com/workopilot/workopilt.demo"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white"
            title="GitHub Repository"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          </a>
          <button
            class="inline-flex items-center gap-2 rounded border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
            @click="enterWorkspace('config')"
          >
            <Settings2 class="h-3.5 w-3.5 text-cyan-400" />
            {{ t('device.btnConfig') }}
          </button>
        </div>
      </div>
    </div>
    <div class="mx-auto max-w-[1480px] px-6 py-6 lg:px-8">
      <DeviceTerminalDemo />
    </div>
  </main>

  <main v-else-if="currentView === 'home'" class="home-shell min-h-screen overflow-hidden text-white">
    <section class="mx-auto flex min-h-screen max-w-[1480px] flex-col px-5 py-6 lg:px-8">
      <header class="flex h-14 items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="grid h-10 w-10 place-items-center rounded-md border border-white/20 bg-white/12 text-sm font-black shadow-lg shadow-cyan-950/40 backdrop-blur-xl">
            W
          </div>
          <div>
            <h1 class="text-base font-bold tracking-normal">{{ t('nav.title') }}</h1>
            <p class="text-xs text-white/60">{{ t('nav.subtitle') }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <LocaleSwitcher theme="dark" />
          <a
            href="https://github.com/workopilot/workopilt.demo"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 transition hover:bg-white/15 hover:text-white"
            title="GitHub Repository"
          >
            <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          </a>
          <button
            class="rounded-md border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/86 backdrop-blur-xl transition hover:border-white/30 hover:bg-white/16"
            @click="enterWorkspace('guide')"
          >
            {{ t('nav.guide') }}
          </button>
        </div>
      </header>

      <div class="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.82fr_1.18fr] lg:py-12">
        <div class="max-w-3xl">
          <p class="mb-5 inline-flex rounded-md border border-cyan-200/18 bg-cyan-100/10 px-3 py-1 text-sm font-semibold text-cyan-100 backdrop-blur-xl">
            {{ t('home.tag') }}
          </p>
          <h2 class="text-5xl font-black leading-[1.02] tracking-normal text-white md:text-7xl">
            {{ t('home.title') }}
          </h2>
          <p class="mt-6 max-w-xl text-base leading-7 text-white/68">
            {{ t('home.desc') }}
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <button
              class="inline-flex h-11 items-center gap-2 rounded-md bg-white px-5 text-sm font-bold text-slate-950 shadow-xl shadow-black/20 transition hover:bg-cyan-50"
              @click="enterWorkspace('guide')"
            >
              <Play class="h-4 w-4" />
              {{ t('home.btnGuide') }}
            </button>
            <button
              class="inline-flex h-11 items-center gap-2 rounded-md border border-white/16 bg-white/10 px-5 text-sm font-semibold text-white/86 backdrop-blur-xl transition hover:border-white/30 hover:bg-white/14"
              @click="enterWorkspace('purchase')"
            >
              <Layers3 class="h-4 w-4" />
              {{ t('home.btnPurchase') }}
            </button>
          </div>
        </div>

        <div class="grid gap-5">
          <!-- 第一个卡片：喔壳数字员工 (平台内) -->
          <button
            class="group grid grid-cols-[auto_1fr] gap-6 rounded-lg border border-white/14 bg-gradient-to-br from-white/[0.08] to-cyan-950/10 p-7 text-left shadow-2xl shadow-black/24 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] hover:from-white/[0.12] hover:to-cyan-950/30 md:p-8"
            @click="enterWorkspace('opportunity')"
          >
            <span class="grid h-16 w-16 place-items-center rounded-md border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 transition-all duration-300 group-hover:border-cyan-400/40 group-hover:bg-cyan-400/20 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.25)]">
              <Bot class="h-8 w-8 transition duration-300 group-hover:scale-110" />
            </span>
            <span>
              <span class="flex flex-wrap items-center gap-3">
                <span class="block text-2xl font-black tracking-normal text-white md:text-3xl">{{ t('home.card1Title') }}</span>
                <span class="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-300 backdrop-blur-md shadow-[0_0_12px_rgba(34,211,238,0.1)]">
                  <span class="relative flex h-1.5 w-1.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400"></span>
                  </span>
                  {{ t('home.card1Tag') }}
                </span>
              </span>
              <span class="mt-4 block max-w-xl text-sm leading-6 text-white/70">
                {{ t('home.card1Desc') }}
              </span>
              <div class="mt-5 flex flex-wrap gap-2.5">
                <button
                  class="inline-flex h-8 items-center gap-1.5 rounded bg-cyan-500/20 border border-cyan-400/30 px-3 text-xs font-bold text-cyan-200 transition hover:bg-cyan-500/35 hover:text-white hover:border-cyan-400/50"
                  @click="goToBusinessCard"
                >
                  {{ t('home.card1Btn1') }}
                </button>
                <button
                  class="inline-flex h-8 items-center gap-1.5 rounded bg-cyan-500/20 border border-cyan-400/30 px-3 text-xs font-bold text-cyan-200 transition hover:bg-cyan-500/35 hover:text-white hover:border-cyan-400/50"
                  @click="goToAppSso"
                >
                  {{ t('home.card1Btn2') }}
                </button>
              </div>
              <span class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition-colors duration-200 group-hover:text-cyan-200">
                {{ t('home.card1Explore') }}
                <Code2 class="h-4 w-4 transition duration-300 group-hover:translate-x-1.5 group-hover:scale-110" />
              </span>
            </span>
          </button>

          <!-- 第二个卡片：集成喔壳服务 (三方系统) -->
          <button
            class="group grid grid-cols-[auto_1fr] gap-6 rounded-lg border border-white/14 bg-gradient-to-br from-white/[0.08] to-emerald-950/10 p-7 text-left shadow-2xl shadow-black/24 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:from-white/[0.12] hover:to-emerald-950/30 md:p-8"
            @click="enterWorkspace('purchase')"
          >
            <span class="grid h-16 w-16 place-items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 transition-all duration-300 group-hover:border-emerald-400/40 group-hover:bg-emerald-400/20 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              <Layers3 class="h-8 w-8 transition duration-300 group-hover:scale-110" />
            </span>
            <span>
              <span class="flex flex-wrap items-center gap-3">
                <span class="block text-2xl font-black tracking-normal text-white md:text-3xl">{{ t('home.card2Title') }}</span>
                <span class="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 backdrop-blur-md shadow-[0_0_12px_rgba(16,185,129,0.1)]">
                  <span class="relative flex h-1.5 w-1.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                  </span>
                  {{ t('home.card2Tag') }}
                </span>
              </span>
              <span class="mt-4 block max-w-xl text-sm leading-6 text-white/70">
                {{ t('home.card2Desc') }}
              </span>
              <span class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition-colors duration-200 group-hover:text-emerald-200">
                {{ t('home.card2Explore') }}
                <ShoppingCart class="h-4 w-4 transition duration-300 group-hover:translate-x-1.5 group-hover:scale-110" />
              </span>
            </span>
          </button>

          <!-- 第三个卡片：设备端数字员工 (设备端) -->
          <button
            class="group grid grid-cols-[auto_1fr] gap-6 rounded-lg border border-white/14 bg-gradient-to-br from-white/[0.08] to-violet-950/10 p-7 text-left shadow-2xl shadow-black/24 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:from-white/[0.12] hover:to-violet-950/30 md:p-8"
            @click="enterWorkspace('device')"
          >
            <span class="grid h-16 w-16 place-items-center rounded-md border border-violet-500/20 bg-violet-500/10 text-violet-300 transition-all duration-300 group-hover:border-violet-400/40 group-hover:bg-violet-400/20 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.25)]">
              <MonitorSmartphone class="h-8 w-8 transition duration-300 group-hover:scale-110" />
            </span>
            <span>
              <span class="flex flex-wrap items-center gap-3">
                <span class="block text-2xl font-black tracking-normal text-white md:text-3xl">{{ t('home.card3Title') }}</span>
                <span class="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-400/10 px-2.5 py-0.5 text-xs font-semibold text-violet-300 backdrop-blur-md shadow-[0_0_12px_rgba(139,92,246,0.1)]">
                  <span class="relative flex h-1.5 w-1.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-400"></span>
                  </span>
                  {{ t('home.card3Tag') }}
                </span>
              </span>
              <span class="mt-4 block max-w-xl text-sm leading-6 text-white/70">
                {{ t('home.card3Desc') }}
              </span>
              <span class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-300 transition-colors duration-200 group-hover:text-violet-200">
                {{ t('home.card3Explore') }}
                <MonitorSmartphone class="h-4 w-4 transition duration-300 group-hover:translate-x-1.5 group-hover:scale-110" />
              </span>
            </span>
          </button>
        </div>
      </div>
    </section>
  </main>

  <main v-else class="demo-shell min-h-screen">
    <header class="sticky top-0 z-20 border-b bg-white">
      <div class="mx-auto grid h-16 max-w-[1480px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 lg:px-8">
        <div class="flex min-w-0 items-center gap-3">
          <button
            class="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white text-muted-foreground transition hover:bg-muted hover:text-foreground"
            :title="t('nav.home')"
            @click="goBackHome()"
          >
            <ArrowLeft class="h-4 w-4" />
          </button>
          <div class="grid h-9 w-9 place-items-center rounded-md bg-primary text-sm font-black text-primary-foreground">
            W
          </div>
          <div class="min-w-0">
            <h1 class="truncate text-base font-bold tracking-normal text-slate-950">{{ t('nav.title') }}</h1>
            <p class="truncate text-xs text-muted-foreground">{{ t('nav.subtitle') }}</p>
          </div>
        </div>

        <nav class="grid min-w-[980px] grid-cols-4 rounded-md border bg-muted/50 p-1">
          <button
            :class="[
              'inline-flex h-12 items-center justify-center gap-2 rounded-sm px-4 text-left transition',
              activeDemo === 'guide' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            ]"
            @click="enterWorkspace('guide')"
          >
            <BookOpenText class="h-4 w-4 shrink-0" />
            <span class="grid leading-tight">
              <span class="text-sm font-semibold">{{ t('nav.guide') }}</span>
              <span :class="['text-[11px]', activeDemo === 'guide' ? 'text-primary-foreground/80' : 'text-muted-foreground']">{{ t('nav.guideDesc') }}</span>
            </span>
          </button>
          <button
            :class="[
              'inline-flex h-12 items-center justify-center gap-2 rounded-sm px-4 text-left transition',
              activeDemo === 'purchase' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            ]"
            @click="enterWorkspace('purchase')"
          >
            <span class="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-black/5 text-base font-black">
              1
            </span>
            <span class="grid leading-tight">
              <span class="text-sm font-semibold">{{ t('nav.purchase') }}</span>
              <span :class="['text-[11px]', activeDemo === 'purchase' ? 'text-primary-foreground/80' : 'text-muted-foreground']">{{ t('nav.purchaseDesc') }}</span>
            </span>
          </button>
          <button
            :class="[
              'inline-flex h-12 items-center justify-center gap-2 rounded-sm px-4 text-left transition',
              activeDemo === 'opportunity' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            ]"
            @click="enterWorkspace('opportunity')"
          >
            <span class="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-black/5 text-base font-black">
              2
            </span>
            <span class="grid leading-tight">
              <span class="text-sm font-semibold">{{ t('nav.opportunity') }}</span>
              <span :class="['text-[11px]', activeDemo === 'opportunity' ? 'text-primary-foreground/80' : 'text-muted-foreground']">{{ t('nav.opportunityDesc') }}</span>
            </span>
          </button>
          <button
            :class="[
              'inline-flex h-12 items-center justify-center gap-2 rounded-sm px-4 text-left transition',
              activeDemo === 'config' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            ]"
            @click="enterWorkspace('config')"
          >
            <Settings2 class="h-4 w-4 shrink-0" />
            <span class="grid leading-tight">
              <span class="text-sm font-semibold">{{ t('nav.config') }}</span>
              <span :class="['text-[11px]', activeDemo === 'config' ? 'text-primary-foreground/80' : 'text-muted-foreground']">{{ t('nav.configDesc') }}</span>
            </span>
          </button>
        </nav>

        <div class="flex items-center justify-end gap-3">
          <LocaleSwitcher theme="light" />
          <a
            href="https://github.com/workopilot/workopilt.demo"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300"
            title="GitHub Repository"
          >
            <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          </a>
        </div>
      </div>
    </header>

    <div class="mx-auto grid max-w-[1480px] gap-8 px-6 py-8 lg:px-8 lg:py-10">
      <IntegrationGuideDemo v-if="activeDemo === 'guide'" />
      <PurchaseOrderDemo v-else-if="activeDemo === 'purchase'" />
      <OpportunityAgentDemo v-else-if="activeDemo === 'opportunity'" />
      <PlatformConfigDemo v-else-if="activeDemo === 'config'" />
    </div>
  </main>
</template>
