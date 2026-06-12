<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/lib/utils';

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    class?: string;
    disabled?: boolean;
  }>(),
  {
    variant: 'default',
    size: 'md',
    class: '',
    disabled: false,
  },
);

const classes = computed(() =>
  cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
    {
      'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90': props.variant === 'default',
      'bg-secondary text-secondary-foreground hover:bg-secondary/80': props.variant === 'secondary',
      'border border-input bg-card hover:bg-muted': props.variant === 'outline',
      'hover:bg-muted': props.variant === 'ghost',
      'bg-destructive text-destructive-foreground hover:bg-destructive/90': props.variant === 'destructive',
      'h-8 px-3 text-xs': props.size === 'sm',
      'h-10 px-4': props.size === 'md',
      'h-11 px-6': props.size === 'lg',
      'h-10 w-10': props.size === 'icon',
    },
    props.class,
  ),
);
</script>

<template>
  <button :class="classes" :disabled="disabled">
    <slot />
  </button>
</template>
