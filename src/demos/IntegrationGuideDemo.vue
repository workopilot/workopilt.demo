<script setup lang="ts">
import { computed } from 'vue';
import { Bot, CheckCircle2, FileSearch2, KeyRound, Layers3, RadioTower, Settings2, Sparkles, Workflow } from '@lucide/vue';
import Badge from '@/components/ui/Badge.vue';
import Card from '@/components/ui/Card.vue';
import { useI18n } from '@/lib/i18n';

const { t, locale } = useI18n();

const builtInSteps = computed(() => [
  [t('guide.builtInSteps.0.0'), t('guide.builtInSteps.0.1')],
  [t('guide.builtInSteps.1.0'), t('guide.builtInSteps.1.1')],
  [t('guide.builtInSteps.2.0'), t('guide.builtInSteps.2.1')],
  [t('guide.builtInSteps.3.0'), t('guide.builtInSteps.3.1')],
]);

const smartServiceSteps = computed(() => [
  [t('guide.smartServiceSteps.0.0'), t('guide.smartServiceSteps.0.1')],
  [t('guide.smartServiceSteps.1.0'), t('guide.smartServiceSteps.1.1')],
  [t('guide.smartServiceSteps.2.0'), t('guide.smartServiceSteps.2.1')],
  [t('guide.smartServiceSteps.3.0'), t('guide.smartServiceSteps.3.1')],
]);

const agentSteps = computed(() => [
  [t('guide.agentSteps.0.0'), t('guide.agentSteps.0.1')],
  [t('guide.agentSteps.1.0'), t('guide.agentSteps.1.1')],
  [t('guide.agentSteps.2.0'), t('guide.agentSteps.2.1')],
  [t('guide.agentSteps.3.0'), t('guide.agentSteps.3.1')],
  [t('guide.agentSteps.4.0'), t('guide.agentSteps.4.1')],
]);
</script>

<template>
  <div class="grid gap-8">
    <section class="rounded-lg border border-slate-200 bg-white p-7 shadow-sm lg:p-10">
      <div class="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div class="grid gap-5">
          <Badge class="w-fit bg-slate-900 text-white">Integration Playbook</Badge>
          <div class="grid gap-4">
            <h2 class="text-3xl font-black tracking-normal text-slate-950 lg:text-5xl">{{ t('guide.playbookTitle') }}</h2>
            <p class="max-w-3xl text-sm leading-7 text-slate-600">
              {{ t('guide.playbookDesc') }}
            </p>
          </div>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <div class="rounded-lg border border-emerald-100 bg-emerald-50 p-6">
            <FileSearch2 class="h-6 w-6 text-emerald-700" />
            <p class="mt-4 text-lg font-bold text-slate-950">{{ t('guide.serviceTitle') }}</p>
            <p class="mt-2 text-sm leading-6 text-slate-600">{{ t('guide.serviceDesc') }}</p>
          </div>
          <div class="rounded-lg border border-cyan-100 bg-cyan-50 p-6">
            <Bot class="h-6 w-6 text-cyan-700" />
            <p class="mt-4 text-lg font-bold text-slate-950">{{ t('guide.employeeTitle') }}</p>
            <p class="mt-2 text-sm leading-6 text-slate-600">{{ t('guide.employeeDesc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-2">
      <Card class="overflow-hidden border-slate-200 bg-white">
        <div class="border-b border-slate-200 bg-slate-50 p-7">
          <div class="grid gap-5">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="flex min-w-0 items-center gap-3">
                <span class="grid h-11 w-11 place-items-center rounded-md bg-emerald-600 text-white">
                  <Layers3 class="h-5 w-5" />
                </span>
                <div class="min-w-0">
                  <h3 class="text-xl font-black tracking-normal text-slate-950">{{ t('guide.tab1Title') }}</h3>
                  <p class="text-sm text-slate-500">{{ t('guide.tab1Sub') }}</p>
                </div>
              </div>
              <Badge class="bg-emerald-100 text-emerald-800">{{ locale === 'zh' ? '低改造' : 'Low Effort' }}</Badge>
            </div>
            <div class="min-w-0">
              <p class="text-sm leading-7 text-slate-600">
                {{ t('guide.tab1Desc') }}
              </p>
            </div>
          </div>
        </div>

        <ol class="divide-y divide-slate-100">
          <li v-for="(step, index) in builtInSteps" :key="step[0]" class="grid gap-4 p-6 md:grid-cols-[3rem_1fr]">
            <span class="grid h-10 w-10 place-items-center rounded-md bg-emerald-50 text-sm font-black text-emerald-700">{{ index + 1 }}</span>
            <span>
              <span class="block text-sm font-bold text-slate-950">{{ step[0] }}</span>
              <span class="mt-2 block text-sm leading-7 text-slate-600">{{ step[1] }}</span>
            </span>
          </li>
        </ol>
      </Card>

      <Card class="overflow-hidden border-slate-200 bg-white">
        <div class="border-b border-slate-200 bg-slate-50 p-7">
          <div class="grid gap-5">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="flex min-w-0 items-center gap-3">
                <span class="grid h-11 w-11 place-items-center rounded-md bg-cyan-600 text-white">
                  <Workflow class="h-5 w-5" />
                </span>
                <div class="min-w-0">
                  <h3 class="text-xl font-black tracking-normal text-slate-950">{{ t('guide.tab2Title') }}</h3>
                  <p class="text-sm text-slate-500">{{ t('guide.tab2Sub') }}</p>
                </div>
              </div>
              <Badge class="bg-cyan-100 text-cyan-800">{{ locale === 'zh' ? '可定制' : 'Customizable' }}</Badge>
            </div>
            <div class="min-w-0">
              <p class="text-sm leading-7 text-slate-600">
                {{ t('guide.tab2Desc') }}
              </p>
            </div>
          </div>
        </div>

        <ol class="divide-y divide-slate-100">
          <li v-for="(step, index) in smartServiceSteps" :key="step[0]" class="grid gap-4 p-6 md:grid-cols-[3rem_1fr]">
            <span class="grid h-10 w-10 place-items-center rounded-md bg-cyan-50 text-sm font-black text-cyan-700">{{ index + 1 }}</span>
            <span>
              <span class="block text-sm font-bold text-slate-950">{{ step[0] }}</span>
              <span class="mt-2 block text-sm leading-7 text-slate-600">{{ step[1] }}</span>
            </span>
          </li>
        </ol>
      </Card>
    </section>

    <section class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card class="border-slate-200 bg-white p-7">
        <div class="flex items-center gap-3">
          <span class="grid h-11 w-11 place-items-center rounded-md bg-slate-950 text-white">
            <Bot class="h-5 w-5" />
          </span>
          <div>
            <h3 class="text-xl font-black tracking-normal text-slate-950">{{ t('guide.tab3Title') }}</h3>
            <p class="text-sm text-slate-500">{{ t('guide.tab3Sub') }}</p>
          </div>
        </div>

        <p class="mt-6 text-sm leading-7 text-slate-600">
          {{ t('guide.tab3Desc') }}
        </p>

        <div class="mt-6 grid gap-4 sm:grid-cols-2">
          <div class="rounded-md border border-slate-200 bg-slate-50 p-4">
            <KeyRound class="mb-2 h-4 w-4 text-teal-700" />
            <p class="text-sm font-bold text-slate-950">{{ t('guide.auth') }}</p>
            <p class="mt-1 text-xs leading-5 text-slate-600">{{ t('guide.authDesc') }}</p>
          </div>
          <div class="rounded-md border border-slate-200 bg-slate-50 p-4">
            <Settings2 class="mb-2 h-4 w-4 text-cyan-700" />
            <p class="text-sm font-bold text-slate-950">{{ t('guide.config') }}</p>
            <p class="mt-1 text-xs leading-5 text-slate-600">{{ t('guide.configDesc') }}</p>
          </div>
          <div class="rounded-md border border-slate-200 bg-slate-50 p-4">
            <RadioTower class="mb-2 h-4 w-4 text-slate-700" />
            <p class="text-sm font-bold text-slate-950">{{ t('guide.embed') }}</p>
            <p class="mt-1 text-xs leading-5 text-slate-600">{{ t('guide.embedDesc') }}</p>
          </div>
          <div class="rounded-md border border-slate-200 bg-slate-50 p-4">
            <Sparkles class="mb-2 h-4 w-4 text-emerald-700" />
            <p class="text-sm font-bold text-slate-950">{{ t('guide.action') }}</p>
            <p class="mt-1 text-xs leading-5 text-slate-600">{{ t('guide.actionDesc') }}</p>
          </div>
        </div>
      </Card>

      <Card class="overflow-hidden border-slate-200 bg-white">
        <ol class="divide-y divide-slate-100">
          <li v-for="(step, index) in agentSteps" :key="step[0]" class="grid gap-4 p-6 md:grid-cols-[3rem_1fr]">
            <span class="grid h-10 w-10 place-items-center rounded-md bg-slate-100 text-sm font-black text-slate-800">{{ index + 1 }}</span>
            <span>
              <span class="block text-sm font-bold text-slate-950">{{ step[0] }}</span>
              <span class="mt-2 block text-sm leading-7 text-slate-600">{{ step[1] }}</span>
            </span>
          </li>
        </ol>
      </Card>
    </section>

    <Card class="border-emerald-100 bg-emerald-50 p-6 shadow-none">
      <div class="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <CheckCircle2 class="h-6 w-6 text-emerald-700" />
        <div>
          <p class="text-sm font-bold text-slate-950">{{ t('guide.howToChoose') }}</p>
          <p class="mt-2 text-sm leading-7 text-slate-700">
            {{ t('guide.howToChooseDesc') }}
          </p>
        </div>
        <Badge class="w-fit bg-white text-emerald-800">{{ locale === 'zh' ? '推荐先从服务式接入验证价值' : 'Recommended to start with Service Integration' }}</Badge>
      </div>
    </Card>
  </div>
</template>
