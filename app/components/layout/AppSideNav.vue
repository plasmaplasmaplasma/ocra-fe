<script setup lang="ts">
import { Home, House, Search, Users, MapPinned, LogOut } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

const route = useRoute();
const { clear: clearSession } = useUserSession();
const localePath = useLocalePath();
const { t } = useI18n();
const { isMobile, setOpenMobile } = useSidebar();

async function go(path: string) {
  if (isMobile.value) {
    setOpenMobile(false);
  }
  await navigateTo(localePath(path));
}

async function logout() {
  if (isMobile.value) {
    setOpenMobile(false);
  }
  await clearSession();
  await navigateTo(localePath("/login"));
}

const menuItems = computed(() => [
  { label: t("nav.home"), to: "/", icon: Home },
  { label: t("nav.clients"), to: "/clienti", icon: Users },
  { label: t("nav.zones"), to: "/zone", icon: MapPinned },
]);

const caseItems = computed(() => [
  { label: t("nav.portfolio"), to: "/case/portfolio", icon: House },
  { label: t("nav.search"), to: "/case/ricerca", icon: Search },
]);

function isActive(path: string) {
  const localizedPath = localePath(path);
  if (path === "/") {
    return route.path === localizedPath;
  }
  return route.path.startsWith(localizedPath);
}
</script>

<template>
  <Sidebar>
    <SidebarHeader>
      <div class="px-2 py-1">
        <h1 class="text-xl font-semibold tracking-tight">{{ t("app.name") }}</h1>
        <p class="text-sm text-muted-foreground">{{ t("app.subtitle") }}</p>
      </div>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>{{ t("nav.navigation") }}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in menuItems" :key="item.to">
              <SidebarMenuButton :is-active="isActive(item.to)" @click="go(item.to)">
                <component :is="item.icon" />
                <span>{{ item.label }}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton :is-active="isActive('/case')">
                <House />
                <span>{{ t("nav.houses") }}</span>
              </SidebarMenuButton>
              <SidebarMenuSub>
                <SidebarMenuSubItem v-for="item in caseItems" :key="item.to">
                  <SidebarMenuSubButton :is-active="isActive(item.to)" @click="go(item.to)">
                    <component :is="item.icon" />
                    <span>{{ item.label }}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <Button class="w-full" variant="outline" @click="logout">
        <LogOut class="h-4 w-4" />
        {{ t("nav.logout") }}
      </Button>
    </SidebarFooter>
  </Sidebar>
</template>
