<template>
  <Sandbox
    template="vanilla-ts"
    :custom-setup="{
      ...props,
      deps: { usegl: '*' },
    }"
    :code-options="codeOptions"
    :options="{ ...props }"
  >
    <slot />
  </Sandbox>
</template>

<script setup lang="ts">
import { Sandbox, sandboxProps } from "vitepress-plugin-sandpack";

const props = defineProps(sandboxProps);
</script>
