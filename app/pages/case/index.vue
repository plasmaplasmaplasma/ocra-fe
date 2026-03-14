<script setup lang="ts">
definePageMeta({
  middleware: ["authenticated"],
  layout: "app-shell",
});

const localePath = useLocalePath();
await navigateTo(localePath("/case/portfolio"), { redirectCode: 302 });
</script>

<template>
  <div />
</template>
