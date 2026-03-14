<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import DataTable from "@/components/common/DataTable.vue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { ColumnDef } from "@tanstack/vue-table";
import { MoreHorizontal } from "lucide-vue-next";
import { useOcraCrud } from "@/composables/useOcraCrud";
import { useOcraFetch } from "@/composables/useOcraFetch";
import type { PaginatedApiEnvelope } from "../../shared/types/api";

import {
  type ClienteUpdate,
  type ClienteCreate,
  type ClienteFilters,
  ClienteSchemaUpdate,
  ClienteSchemaCreate,
  type Cliente,

} from "../../shared/schemas/cliente";
import { toast } from "vue-sonner";
import { h } from "vue";
import { EMPTY_SELECT_VALUE } from "~~/shared/schemas/common";
import type { Zona } from "~/types/ocra";
const { t } = useI18n();

definePageMeta({
  middleware: ["authenticated"],
  layout: "app-shell",
});

const page = ref(1);
const hasSearched = ref(false);
const formError = ref("");
const editingId = ref<number | null>(null);
const deleteDialogOpen = ref(false);
const deleteTargetId = ref<number | null>(null);
const sheetOpen = ref(false);
const query = reactive<Partial<ClienteFilters>>({});
const form = reactive<Partial<ClienteUpdate | ClienteCreate>>({});



const { data, pending, error, refresh } = useOcraFetch<PaginatedApiEnvelope<Cliente>>("/clients/read", {
  query,
  immediate: false,
  watch: false,
});

const { data: zonesData, refresh: refreshZones } = useOcraFetch<PaginatedApiEnvelope<Zona>>("/zones/read", {
  query: { page: 1 },
  immediate: false,
  watch: false,
});

const { create, update, remove } = useOcraCrud("/clients");

function resetForm() {
  editingId.value = null;
  formError.value = "";
  Object.assign(form, {});
}

function openCreateSheet() {
  resetForm();
  sheetOpen.value = true;
}

function editCliente(item: Cliente) {
  editingId.value = item.id;
  formError.value = "";
  Object.assign(form, item);
  sheetOpen.value = true;
}

async function submitForm() {
  formError.value = "";

  const parsedPayload = editingId.value
    ? ClienteSchemaUpdate.safeParse({ ...form, id: editingId.value })
    : ClienteSchemaCreate.safeParse(form);

  if (!parsedPayload.success) {
    const issueKey = parsedPayload.error.issues[0]?.message;
    formError.value = issueKey ? t(issueKey) : t("common.saveError");
    return;
  }

  try {
    if (editingId.value) {
      await update<Cliente>(editingId.value, parsedPayload.data);
      toast.success(t("clients.toast.updated"));
    } else {
      await create<Cliente>(parsedPayload.data);
      toast.success(t("clients.toast.created"));
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

function formatClienteFlags(item: Cliente): string {
  return `A: ${item.acquista ? t("common.yes") : t("common.no")} | V: ${item.vende ? t("common.yes") : t("common.no")} | VPA: ${item.vende_per_acquistare ? t("common.yes") : t("common.no")}`;
}

function renderClienteActionsMenu(item: Cliente) {
  return h(DropdownMenu, {}, {
    default: () => [
      h(DropdownMenuTrigger, { asChild: true }, {
        default: () =>
          h(Button, { variant: "ghost", size: "icon" }, {
            default: () => h(MoreHorizontal, { class: "size-4" }),
          }),
      }),
      h(DropdownMenuContent, { align: "end" }, {
        default: () => [
          h(DropdownMenuItem, { onClick: () => editCliente(item) }, {
            default: () => t("common.edit"),
          }),
          h(
            DropdownMenuItem,
            {
              class: "text-destructive focus:text-destructive",
              onClick: () => openDeleteDialog(item.id),
            },
            { default: () => t("common.delete") },
          ),
        ],
      }),
    ],
  });
}

async function confirmDeleteCliente() {
  if (deleteTargetId.value == null) {
    return;
  }

  try {
    await remove(deleteTargetId.value);
    hasSearched.value = true;
    await refresh();
    toast.success(t("clients.toast.deleted"));
  } catch {
    toast.error(t("common.deleteError"));
  } finally {
    deleteDialogOpen.value = false;
    deleteTargetId.value = null;
  }
}

const columns = computed<ColumnDef<Cliente>[]>(() => [
  {
    accessorKey: "nome",
    header: t("common.name"),
    cell: ({ row }) => row.original.nome || "-",
  },
  {
    accessorKey: "cognome",
    header: t("clients.surname"),
    cell: ({ row }) => row.original.cognome || "-",
  },
  {
    accessorKey: "numero_di_telefono",
    header: t("clients.phone"),
    cell: ({ row }) => row.original.numero_di_telefono || "-",
  },
  {
    accessorKey: "email",
    header: t("common.email"),
    cell: ({ row }) => row.original.email || "-",
  },
  {
    id: "flags",
    header: t("clients.flags"),
    cell: ({ row }) => formatClienteFlags(row.original),
  },
  {
    id: "actions",
    header: t("common.actions"),
    cell: ({ row }) => renderClienteActionsMenu(row.original),
  },
]);

function applyFilters() {
  page.value = 1;
  hasSearched.value = true;
  if (!zonesData.value) {
    refreshZones();
  }
  refresh();
}

function onPageChange(nextPage: number) {
  page.value = nextPage;
  if (hasSearched.value) {
    refresh();
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-2xl font-semibold">{{ t("clients.title") }}</h1>
      <Button @click="openCreateSheet">{{ t("common.new") }}</Button>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>{{ t("clients.filtersTitle") }}</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div class="space-y-2">
            <Label for="q-acquista">{{ t("clients.acquista") }}</Label>
            <div class="flex items-center gap-2">
              <Checkbox id="q-acquista" v-model="query.acquista" />
              <Label for="q-acquista">{{ t("common.yes") }}</Label>
            </div>
          </div>
          <div class="space-y-2">
            <Label for="q-vende">{{ t("clients.vende") }}</Label>
            <div class="flex items-center gap-2">
              <Checkbox id="q-vende" v-model="query.vende" />
              <Label for="q-vende">{{ t("common.yes") }}</Label>
            </div>
          </div>
          <div class="space-y-2">
            <Label for="q-vpa">{{ t("clients.vendePerAcquistare") }}</Label>
            <div class="flex items-center gap-2">
              <Checkbox id="q-vpa" v-model="query.vende_per_acquistare" />
              <Label for="q-vpa">{{ t("common.yes") }}</Label>
            </div>
          </div>
          <div class="space-y-2">
            <Label for="zona">{{ t("clients.zona") }}</Label>
            <Select v-model="query.zona_id">
              <SelectTrigger id="zona" class="w-full">
                <SelectValue :placeholder="t('common.allFeminine')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="EMPTY_SELECT_VALUE">{{ t("common.allFeminine") }}</SelectItem>
                <SelectItem v-for="zona in zonesData?.data || []" :key="zona.id" :value="String(zona.id)">
                  {{ zona.nome }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="sortBy">{{ t("clients.sortBy") }}</Label>
            <Select v-model="query.sort_by">
              <SelectTrigger id="sortBy" class="w-full">
                <SelectValue :placeholder="t('common.none')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="EMPTY_SELECT_VALUE">{{ t("common.none") }}</SelectItem>
                <SelectItem value="nome">{{ t("clients.sort.name") }}</SelectItem>
                <SelectItem value="cognome">{{ t("clients.sort.surname") }}</SelectItem>
                <SelectItem value="numero_di_telefono">{{ t("clients.sort.phone") }}</SelectItem>
                <SelectItem value="email">{{ t("clients.sort.email") }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="sortDir">{{ t("clients.sortDir") }}</Label>
            <Select v-model="query.sort_dir">
              <SelectTrigger id="sortDir" class="w-full">
                <SelectValue :placeholder="t('common.asc')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">{{ t("common.asc") }}</SelectItem>
                <SelectItem value="desc">{{ t("common.desc") }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button variant="outline" @click="applyFilters">{{ t("common.applyFilters") }}</Button>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>{{ t("clients.listTitle") }}</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <p v-if="error" class="text-sm text-destructive">{{ t("common.loadError") }}</p>
        <div v-if="pending" class="flex items-center gap-2 text-sm text-muted-foreground">
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
          :empty-title="t('clients.empty.title')"
          :empty-description="t('clients.empty.description')"
          @update:page="onPageChange"
        />
      </CardContent>
    </Card>

    <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ t("common.delete") }}</AlertDialogTitle>
          <AlertDialogDescription>{{ t("clients.confirmDelete") }}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{{ t("common.cancel") }}</AlertDialogCancel>
          <AlertDialogAction @click="confirmDeleteCliente">{{ t("common.delete") }}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <Sheet v-model:open="sheetOpen">
      <SheetContent side="right" class="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{{ editingId ? t("clients.editTitle") : t("clients.newTitle") }}</SheetTitle>
          <SheetDescription>{{ t("clients.title") }}</SheetDescription>
        </SheetHeader>

        <form class="space-y-4 px-4" @submit.prevent="submitForm">
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div class="space-y-2">
              <Label for="nome">{{ t("common.name") }}</Label>
              <Input id="nome" v-model="form.nome" />
            </div>
            <div class="space-y-2">
              <Label for="cognome">{{ t("clients.surname") }}</Label>
              <Input id="cognome" v-model="form.cognome" />
            </div>
            <div class="space-y-2">
              <Label for="telefono">{{ t("clients.phone") }}</Label>
              <Input id="telefono" v-model="form.numero_di_telefono" />
            </div>
            <div class="space-y-2">
              <Label for="email">{{ t("common.email") }}</Label>
              <Input id="email" v-model="form.email" type="email" />
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <label class="flex items-center gap-2 text-sm">
              <Checkbox :model-value="form.acquista" @update:model-value="form.acquista = Boolean($event)" />
              {{ t("clients.acquista") }}
            </label>
            <label class="flex items-center gap-2 text-sm">
              <Checkbox
                :model-value="form.vende"
                @update:model-value="(value) => { form.vende = Boolean(value); if (form.vende) form.vende_per_acquistare = false; }" />
              {{ t("clients.vende") }}
            </label>
            <label class="flex items-center gap-2 text-sm">
              <Checkbox
                :model-value="form.vende_per_acquistare"
                @update:model-value="(value) => { form.vende_per_acquistare = Boolean(value); if (form.vende_per_acquistare) form.vende = false; }" />
              {{ t("clients.vendePerAcquistare") }}
            </label>
          </div>

          <p v-if="formError" class="text-sm text-destructive">{{ formError }}</p>

          <SheetFooter class="px-0">
            <Button type="submit">{{ editingId ? t("common.update") : t("common.create") }}</Button>
            <Button type="button" variant="outline" @click="sheetOpen = false">{{ t("common.cancel") }}</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  </div>
</template>
