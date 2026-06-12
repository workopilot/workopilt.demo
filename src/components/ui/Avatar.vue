<script setup lang="ts">
import { Bot } from '@lucide/vue';
import { cn } from '@/lib/utils';

defineProps<{ class?: string }>();
</script>

<template>
  <div :class="cn('grid place-items-center rounded-full bg-primary text-primary-foreground shadow-soft', $props.class)">
    <slot>
      <Bot class="h-6 w-6" />
    </slot>
  </div>
</template>
