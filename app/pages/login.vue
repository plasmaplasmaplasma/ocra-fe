<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserCredentials } from "../../shared/types/user";
import { loginCredentialsSchema } from "../../shared/schemas/auth";

const localePath = useLocalePath();
const { t } = useI18n();
const { loggedIn, fetch: refreshSession } = useUserSession();
if (loggedIn.value) {
  navigateTo(localePath("/"));
}
const credentials = reactive<UserCredentials>({
  email: "",
  password: "",
});
const loginErrorOpen = ref(false);
const loginErrorMessage = ref("");

async function login() {
  const parsedCredentials = loginCredentialsSchema.safeParse(credentials);
  if (!parsedCredentials.success) {
    loginErrorMessage.value = t("auth.login.badCredentials");
    loginErrorOpen.value = true;
    return;
  }

  try {
    await $fetch("/api/login", {
      method: "POST",
      body: parsedCredentials.data,
    });
    await refreshSession();
    await navigateTo(localePath("/"));
  } catch {
    loginErrorMessage.value = t("auth.login.badCredentials");
    loginErrorOpen.value = true;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <form @submit.prevent="login">
      <Card class="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{{ t("auth.login.title") }}</CardTitle>
          <CardDescription>
            {{ t("auth.login.description") }}
          </CardDescription>
          <CardAction class="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div class="grid w-full items-center gap-4">
            <div class="flex flex-col space-y-1.5">
              <Label for="email">{{ t("auth.login.email") }}</Label>
              <Input
                id="email"
                v-model="credentials.email"
                type="email"
                :placeholder="t('auth.login.emailPlaceholder')"
              />
            </div>
            <div class="flex flex-col space-y-1.5">
              <div class="flex items-center">
                <Label for="password">{{ t("auth.login.password") }}</Label>
              </div>
              <Input
                id="password"
                v-model="credentials.password"
                type="password"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter class="flex flex-col gap-2">
          <Button type="submit" class="w-full">
            {{ t("auth.login.submit") }}
          </Button>
        </CardFooter>
      </Card>
    </form>

    <AlertDialog v-model:open="loginErrorOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ t("auth.login.title") }}</AlertDialogTitle>
          <AlertDialogDescription>{{
            loginErrorMessage
          }}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>{{ t("common.ok") }}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
