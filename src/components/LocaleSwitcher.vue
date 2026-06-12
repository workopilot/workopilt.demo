<script setup lang="ts">
import { Languages } from '@lucide/vue';
import { useI18n } from '../lib/i18n';

withDefaults(
  defineProps<{
    theme?: 'light' | 'dark' | 'auto';
  }>(),
  {
    theme: 'auto',
  },
);

const { locale, setLocale } = useI18n();

function toggleLocale() {
  setLocale(locale.value === 'zh' ? 'en' : 'zh');
}
</script>

<template>
  <button
    :class="[
      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition duration-300 shadow-sm cursor-pointer select-none active:scale-95',
      theme === 'dark'
        ? 'border-white/15 bg-white/8 text-white/80 hover:bg-white/15 hover:text-white hover:border-white/30'
        : theme === 'light'
          ? 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-white/15 dark:bg-white/8 dark:text-white/80 dark:hover:bg-white/15 dark:hover:text-white'
    ]"
    @click="toggleLocale"
  >
    <Languages class="h-3.5 w-3.5" />
    <span>{{ locale === 'zh' ? '中文' : 'English' }}</span>
  </button>
</template>
