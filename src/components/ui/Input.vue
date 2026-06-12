<script setup lang="ts">
import { cn } from '@/lib/utils';

defineProps<{
  modelValue?: string | number | null;
  placeholder?: string;
  type?: string;
  class?: string;
  readonly?: boolean;
}>();

defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <input
    :class="
      cn(
        'h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        $props.class,
      )
    "
    :placeholder="placeholder"
    :readonly="readonly"
    :type="type ?? 'text'"
    :value="modelValue ?? ''"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
