<script setup lang="ts">
import AppSideNav from "./AppSideNav.vue";
import LanguageToggle from "@/components/LanguageToggle.vue";
import ThemeToggle from "@/components/ThemeToggle.vue";

const { t } = useI18n();
</script>

<template>
  <SidebarProvider>
    <AppSideNav />
    <SidebarInset>
      <header
        class="flex h-14 items-center justify-between border-b px-4 lg:px-6"
      >
        <div class="flex items-center gap-2">
          <SidebarTrigger class="md:hidden" />
          <h2 class="text-lg font-semibold">{{ t("app.panelTitle") }}</h2>
        </div>
        <div class="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main class="flex-1 p-6">
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
