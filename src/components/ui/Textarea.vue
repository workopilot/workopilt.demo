<script setup lang="ts">
import { cn } from '@/lib/utils';

defineProps<{
  modelValue?: string | null;
  placeholder?: string;
  class?: string;
  rows?: number;
}>();

defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <textarea
    :class="
      cn(
        'min-h-24 w-full resize-none rounded-md border border-input bg-card px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring',
        $props.class,
      )
    "
    :placeholder="placeholder"
    :rows="rows ?? 4"
    :value="modelValue ?? ''"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>
