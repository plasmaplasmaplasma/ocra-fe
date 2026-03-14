<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import DataTable from "~/components/DataTable.vue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type { ColumnDef } from "@tanstack/vue-table";
import { MoreHorizontal } from "lucide-vue-next";
import { useOcraCrud } from "@/composables/useOcraCrud";
import { useOcraFetch } from "@/composables/useOcraFetch";
import type { PaginatedApiEnvelope } from "../../shared/types/api";
import {
  ZonaSchemaUpdate,
  ZonaSchemaCreate,
  type ZonaUpdate,
  type ZonaCreate,
  type Zona,
} from "../../shared/schemas/zona";
import { toast } from "vue-sonner";
import { h } from "vue";
const { t } = useI18n();

definePageMeta({
  middleware: ["authenticated"],
  layout: "app-shell",
});

const page = ref(1);
const hasSearched = ref(false);
const editingId = ref<number | null>(null);
const formError = ref("");
const deleteDialogOpen = ref(false);
const deleteTargetId = ref<number | null>(null);
const sheetOpen = ref(false);
const form = reactive<Partial<ZonaUpdate | ZonaCreate>>({});

const { data, pending, error, refresh } = useOcraFetch<
  PaginatedApiEnvelope<Zona>
>("/zones/read", {
  query: computed(() => ({ page: page.value })),
  immediate: false,
  watch: false,
});

const { create, update, remove } = useOcraCrud("/zones");

function resetForm() {
  editingId.value = null;
  formError.value = "";
  Object.assign(form, {});
}

function openCreateSheet() {
  resetForm();
  sheetOpen.value = true;
}

function editZona(zona: ZonaUpdate) {
  editingId.value = zona.id;
  formError.value = "";
  Object.assign(form, zona);
  sheetOpen.value = true;
}

async function submitForm() {
  formError.value = "";
  const parsedPayload = editingId.value
    ? ZonaSchemaUpdate.safeParse({ ...form, id: editingId.value })
    : ZonaSchemaCreate.safeParse(form);
  if (!parsedPayload.success) {
    const issueKey = parsedPayload.error.issues[0]?.message;
    formError.value = issueKey ? t(issueKey) : t("common.saveError");
    return;
  }

  try {
    if (editingId.value) {
      await update<Zona>(editingId.value, parsedPayload.data);
      toast.success(t("zones.toast.updated"));
    } else {
      await create<Zona>(parsedPayload.data);
      toast.success(t("zones.toast.created"));
    }
    hasSearched.value = true;
    resetForm();
    sheetOpen.value = false;
    await refresh();
  } catch {
    formError.value = t("common.saveError");
    toast.error(formError.value);
  }
}

function openDeleteDialog(id: number) {
  deleteTargetId.value = id;
  deleteDialogOpen.value = true;
}

async function confirmDeleteZona() {
  if (deleteTargetId.value == null) {
    return;
  }

  try {
    await remove(deleteTargetId.value);
    hasSearched.value = true;
    await refresh();
    toast.success(t("zones.toast.deleted"));
  } catch {
    toast.error(t("common.deleteError"));
  } finally {
    deleteDialogOpen.value = false;
    deleteTargetId.value = null;
  }
}

function searchZones() {
  page.value = 1;
  hasSearched.value = true;
  refresh();
}

function onPageChange(nextPage: number) {
  page.value = nextPage;
  if (hasSearched.value) {
    refresh();
  }
}

function renderZonaActionsMenu(item: Zona) {
  return h(
    DropdownMenu,
    {},
    {
      default: () => [
        h(
          DropdownMenuTrigger,
          { asChild: true },
          {
            default: () =>
              h(
                Button,
                { variant: "ghost", size: "icon" },
                {
                  default: () => h(MoreHorizontal, { class: "size-4" }),
                },
              ),
          },
        ),
        h(
          DropdownMenuContent,
          { align: "end" },
          {
            default: () => [
              h(
                DropdownMenuItem,
                { onClick: () => editZona(item) },
                {
                  default: () => t("common.edit"),
                },
              ),
              h(
                DropdownMenuItem,
                {
                  class: "text-destructive focus:text-destructive",
                  onClick: () => openDeleteDialog(item.id),
                },
                { default: () => t("common.delete") },
              ),
            ],
          },
        ),
      ],
    },
  );
}

const columns = computed<ColumnDef<Zona>[]>(() => [
  {
    accessorKey: "id",
    header: t("common.id"),
    cell: ({ row }) => row.original.id,
  },
  {
    accessorKey: "nome",
    header: t("common.name"),
    cell: ({ row }) => row.original.nome,
  },
  {
    id: "actions",
    header: t("common.actions"),
    cell: ({ row }) => renderZonaActionsMenu(row.original),
  },
]);
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-2xl font-semibold">{{ t("zones.title") }}</h1>
      <div class="flex items-center gap-2">
        <Button variant="outline" @click="searchZones">{{
          t("common.search")
        }}</Button>
        <Button @click="openCreateSheet">{{ t("common.new") }}</Button>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>{{ t("zones.listTitle") }}</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <p v-if="error" class="text-sm text-destructive">
          {{ t("common.loadError") }}
        </p>
        <div
          v-if="pending"
          class="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Spinner class="size-4" />
          <span>{{ t("common.loading") }}</span>
        </div>

        <DataTable
          :columns="columns"
          :data="data?.data || []"
          :page="page"
          :total="data?.total || 0"
          :per-page="data?.per_page || 20"
          :pending="pending"
          :empty-title="t('zones.empty.title')"
          :empty-description="t('zones.empty.description')"
          @update:page="onPageChange"
        />
      </CardContent>
    </Card>

    <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ t("common.delete") }}</AlertDialogTitle>
          <AlertDialogDescription>{{
            t("zones.confirmDelete")
          }}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{{ t("common.cancel") }}</AlertDialogCancel>
          <AlertDialogAction @click="confirmDeleteZona">{{
            t("common.delete")
          }}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <Sheet v-model:open="sheetOpen">
      <SheetContent side="right" class="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{{
            editingId ? t("zones.editTitle") : t("zones.newTitle")
          }}</SheetTitle>
          <SheetDescription>{{ t("zones.title") }}</SheetDescription>
        </SheetHeader>

        <form class="space-y-4 px-4" @submit.prevent="submitForm">
          <div class="space-y-2">
            <Label for="nome-zona">{{ t("common.name") }}</Label>
            <Input id="nome-zona" v-model="form.nome" />
          </div>

          <p v-if="formError" class="text-sm text-destructive">
            {{ formError }}
          </p>

          <SheetFooter class="px-0">
            <Button type="submit">{{
              editingId ? t("common.update") : t("common.create")
            }}</Button>
            <Button
              type="button"
              variant="outline"
              @click="sheetOpen = false"
              >{{ t("common.cancel") }}</Button
            >
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  </div>
</template>
