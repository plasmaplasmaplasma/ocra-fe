<script setup lang="ts">
definePageMeta({
    middleware: ["authenticated"],
    layout: "app-shell",
})

const { user } = useUserSession()
const { t } = useI18n()

const displayName = computed(() => {
    const sessionUser = user.value as {
        username?: string
        email?: string
        Username?: string
        Email?: string
    } | null

    return sessionUser?.username || sessionUser?.Username || sessionUser?.email || sessionUser?.Email || t("home.defaultUser")
})
</script>

<template>
    <div class="flex min-h-[60vh] items-center justify-center">
        <div class="text-center">
            <h1 class="text-4xl font-semibold tracking-tight">
                {{ t("home.welcome", { name: displayName }) }}
            </h1>
            <p class="mt-3 text-muted-foreground">
                {{ t("home.subtitle") }}
            </p>
    </div>
    </div>
</template>
