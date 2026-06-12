<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/lib/utils';

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';
    class?: string;
  }>(),
  {
    variant: 'default',
    class: '',
  },
);

const classes = computed(() =>
  cn(
    'inline-flex min-h-6 items-center rounded-md px-2.5 py-0.5 text-xs font-semibold',
    {
      'bg-primary text-primary-foreground': props.variant === 'default',
      'bg-secondary text-secondary-foreground': props.variant === 'secondary',
      'bg-emerald-100 text-emerald-800': props.variant === 'success',
      'bg-amber-100 text-amber-800': props.variant === 'warning',
      'bg-red-100 text-red-800': props.variant === 'destructive',
      'border border-border bg-card text-foreground': props.variant === 'outline',
    },
    props.class,
  ),
);
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>
