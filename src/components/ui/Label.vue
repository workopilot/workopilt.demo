<script setup lang="ts">
import { cn } from '@/lib/utils';

defineProps<{ class?: string }>();
</script>

<template>
  <label :class="cn('text-xs font-semibold text-slate-600', $props.class)">
    <slot />
  </label>
</template>
