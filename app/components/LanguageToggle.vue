<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const { locale, setLocale, t } = useI18n();

const currentFlag = computed(() => (locale.value === "it" ? "🇮🇹" : "🇬🇧"));
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="icon" :aria-label="t('language.toggle')">
        <span aria-hidden="true">{{ currentFlag }}</span>
        <span class="sr-only">{{ t("language.toggle") }}</span>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="setLocale('it')">
        🇮🇹 {{ t("language.italian") }}
      </DropdownMenuItem>
      <DropdownMenuItem @click="setLocale('en')">
        🇬🇧 {{ t("language.english") }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
