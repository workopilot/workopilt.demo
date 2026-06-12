import { ref } from 'vue';
import zh from '../locales/zh';
import en from '../locales/en';

type Locale = 'zh' | 'en';

const STORAGE_KEY = 'wise.demo.locale';
const currentLocale = ref<Locale>((localStorage.getItem(STORAGE_KEY) as Locale) || 'zh');

const messages = {
  zh,
  en,
};

export function setLocale(locale: Locale) {
  currentLocale.value = locale;
  localStorage.setItem(STORAGE_KEY, locale);
}

export function useI18n() {
  function t(path: string): string {
    const locale = currentLocale.value;
    const dict = messages[locale];
    
    const keys = path.split('.');
    let value: any = dict;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return path; // 如果未找到，直接返回路径本身作为 fallback
      }
    }
    
    return typeof value === 'string' ? value : path;
  }

  return {
    locale: currentLocale,
    t,
    setLocale,
  };
}
