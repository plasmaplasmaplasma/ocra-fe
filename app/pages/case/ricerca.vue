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
import DataTable from "@/components/common/DataTable.vue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { PaginatedApiEnvelope } from "../../../shared/types/api";
import {
  type RicercaCasaUpdate,
  type RicercaCasaCreate,
  type RicercaCasaFilter,
  RicercaCasaSchemaUpdate,
  RicercaCasaSchemaCreate,
  type RicercaCasa,
} from "../../../shared/schemas/ricerca-casa";
import { toast } from "vue-sonner";
import { h } from "vue";
import { EMPTY_SELECT_VALUE } from "~~/shared/schemas/common";
import type { Cliente } from "~~/shared/schemas/cliente";
import type { Casa } from "~~/shared/schemas/casa";
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

const query = reactive<Partial<RicercaCasaFilter>>({});

const form = reactive<Partial<RicercaCasaUpdate | RicercaCasaCreate>>({});

const { data, pending, error, refresh } = useOcraFetch<PaginatedApiEnvelope<RicercaCasa>>("/search_houses/read", {
  query,
  immediate: false,
  watch: false,
});

const { data: clientsData, refresh: refreshClients } = useOcraFetch<PaginatedApiEnvelope<Cliente>>("/clients/read", {
  query: { page: 1 },
  immediate: false,
  watch: false,
});

const { data: housesData, refresh: refreshHouses } = useOcraFetch<PaginatedApiEnvelope<Casa>>("/houses/read", {
  query: { page: 1 },
  immediate: false,
  watch: false,
});

const { create, update, remove } = useOcraCrud("/search_houses");

function resetForm() {
  editingId.value = null;
  formError.value = "";
  Object.assign(form, {});
}

function openCreateSheet() {
  resetForm();
  ensureLookupData();
  sheetOpen.value = true;
}

function editRicerca(item: RicercaCasa) {
  ensureLookupData();
  editingId.value = item.id;
  formError.value = "";
  Object.assign(form, {});
  sheetOpen.value = true;
}

async function submitForm() {
  formError.value = "";

  const parsedPayload = editingId.value
    ? RicercaCasaSchemaUpdate.safeParse({ ...form, id: editingId.value })
    : RicercaCasaSchemaCreate.safeParse(form);


  if (!parsedPayload.success) {
    const issueKey = parsedPayload.error.issues[0]?.message;
    formError.value = issueKey ? t(issueKey) : t("common.saveError");
    return;
  }

  try {
    if (editingId.value) {
      await update<RicercaCasa>(editingId.value, parsedPayload.data);
      toast.success(t("houses.toast.searchUpdated"));
    } else {
      await create<RicercaCasa>(parsedPayload.data);
      toast.success(t("houses.toast.searchCreated"));
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

async function confirmDeleteRicerca() {
  if (deleteTargetId.value == null) {
    return;
  }

  try {
    await remove(deleteTargetId.value);
    hasSearched.value = true;
    await refresh();
    toast.success(t("houses.toast.searchDeleted"));
  } catch {
    toast.error(t("common.deleteError"));
  } finally {
    deleteDialogOpen.value = false;
    deleteTargetId.value = null;
  }
}

function applyFilters() {
  page.value = 1;
  hasSearched.value = true;
  ensureLookupData();
  refresh();
}

function onPageChange(nextPage: number) {
  page.value = nextPage;
  if (hasSearched.value) {
    refresh();
  }
}

function ensureLookupData() {
  if (!clientsData.value) {
    refreshClients();
  }
  if (!housesData.value) {
    refreshHouses();
  }
}

function houseLabel(house: Casa) {
  return t("houses.houseLabel", {
    id: house.id,
    zone: house.zona?.nome || house.zona_id,
    floor: house.piano ?? "-",
  });
}

function clientLabel(client: Cliente) {
  const nome = [client.nome, client.cognome].filter(Boolean).join(" ");
  return nome || client.email || t("houses.clientFallback", { id: client.id });
}

function renderRicercaActionsMenu(item: RicercaCasa) {
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
          h(DropdownMenuItem, { onClick: () => editRicerca(item) }, {
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

const columns = computed<ColumnDef<RicercaCasa>[]>(() => [
  {
    accessorKey: "id",
    header: t("common.id"),
    cell: ({ row }) => row.original.id,
  },
  {
    id: "cliente",
    header: t("houses.columns.client"),
    cell: ({ row }) => clientLabel(row.original.cliente),
  },
  {
    id: "casa",
    header: t("houses.columns.house"),
    cell: ({ row }) => houseLabel(row.original.casa),
  },
  {
    accessorKey: "tempo_di_acquisto",
    header: t("houses.columns.buyTime"),
    cell: ({ row }) => row.original.tempo_di_acquisto,
  },
  {
    accessorKey: "budget",
    header: t("houses.columns.budget"),
    cell: ({ row }) => row.original.budget,
  },
  {
    accessorKey: "percentuale_mutuo",
    header: t("houses.columns.mortgagePercent"),
    cell: ({ row }) => row.original.percentuale_mutuo,
  },
  {
    accessorKey: "liquidita",
    header: t("houses.columns.liquidity"),
    cell: ({ row }) => row.original.liquidita,
  },
  {
    id: "actions",
    header: t("common.actions"),
    cell: ({ row }) => renderRicercaActionsMenu(row.original),
  },
]);
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-2xl font-semibold">{{ t("houses.searchTitle") }}</h1>
      <Button @click="openCreateSheet">{{ t("common.new") }}</Button>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>{{ t("houses.searchFiltersTitle") }}</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div class="space-y-2">
            <Label>{{ t("houses.labels.buyTimeFrom") }}</Label>
            <Input v-model="query.tempo_di_acquisto_from" type="number" />
          </div>
          <div class="space-y-2">
            <Label>{{ t("houses.labels.buyTimeTo") }}</Label>
            <Input v-model="query.tempo_di_acquisto_to" type="number" />
          </div>
          <div class="space-y-2">
            <Label>{{ t("houses.labels.budgetFrom") }}</Label>
            <Input v-model="query.budget_from" type="number" />
          </div>
          <div class="space-y-2">
            <Label>{{ t("houses.labels.budgetTo") }}</Label>
            <Input v-model="query.budget_to" type="number" />
          </div>
          <div class="space-y-2">
            <Label>{{ t("houses.labels.mortgageFrom") }}</Label>
            <Input v-model="query.percentuale_mutuo_from" type="number" />
          </div>
          <div class="space-y-2">
            <Label>{{ t("houses.labels.mortgageTo") }}</Label>
            <Input v-model="query.percentuale_mutuo_to" type="number" />
          </div>
          <div class="space-y-2">
            <Label>{{ t("houses.labels.liquidityFrom") }}</Label>
            <Input v-model="query.liquidita_from" type="number" />
          </div>
          <div class="space-y-2">
            <Label>{{ t("houses.labels.liquidityTo") }}</Label>
            <Input v-model="query.liquidita_to" type="number" />
          </div>
          <div class="space-y-2">
            <Label>{{ t("houses.columns.client") }}</Label>
            <Select v-model="query.cliente_id">
              <SelectTrigger class="w-full">
                <SelectValue :placeholder="t('common.all')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="EMPTY_SELECT_VALUE">{{ t("common.all") }}</SelectItem>
                <SelectItem v-for="client in clientsData?.data || []" :key="client.id" :value="String(client.id)">
                  {{ clientLabel(client) }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>{{ t("houses.labels.floor") }}</Label>
            <Input v-model="query.piano" type="number" />
          </div>
          <div class="space-y-2">
            <Label>{{ t("houses.sort.rooms") }}</Label>
            <Input v-model="query.numero_di_locali" type="number" />
          </div>
          <div class="space-y-2">
            <Label>{{ t("houses.sort.bedrooms") }}</Label>
            <Input v-model="query.numero_di_camere" type="number" />
          </div>
          <div class="space-y-2">
            <Label>{{ t("houses.sort.bathrooms") }}</Label>
            <Input v-model="query.numero_di_bagni" type="number" />
          </div>
          <div class="space-y-2">
            <Label for="q-balcone">{{ t("houses.labels.balcony") }}</Label>
            <div class="flex items-center gap-2">
              <Checkbox id="q-balcone" v-model="query.balcone" />
              <Label for="q-balcone">{{ t("common.yes") }}</Label>
            </div>
          </div>
          <div class="space-y-2">
            <Label for="q-terrazzo">{{ t("houses.labels.terrace") }}</Label>
            <div class="flex items-center gap-2">
              <Checkbox id="q-terrazzo" v-model="query.terrazzo" />
              <Label for="q-terrazzo">{{ t("common.yes") }}</Label>
            </div>
          </div>
          <div class="space-y-2">
            <Label for="q-giardino">{{ t("houses.labels.garden") }}</Label>
            <div class="flex items-center gap-2">
              <Checkbox id="q-giardino" v-model="query.giardino" />
              <Label for="q-giardino">{{ t("common.yes") }}</Label>
            </div>
          </div>
          <div class="space-y-2">
            <Label>{{ t("houses.labels.zone") }}</Label>
            <Select v-model="query.zona_id">
              <SelectTrigger class="w-full">
                <SelectValue :placeholder="t('common.allFeminine')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="EMPTY_SELECT_VALUE">{{ t("common.allFeminine") }}</SelectItem>
                <SelectItem v-for="house in housesData?.data || []" :key="house.id" :value="String(house.zona_id)">
                  {{ house.zona?.nome || house.zona_id }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button variant="outline" @click="applyFilters">{{ t("common.applyFilters") }}</Button>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>{{ t("houses.searchListTitle") }}</CardTitle>
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
          :empty-title="t('houses.empty.searchTitle')"
          :empty-description="t('houses.empty.searchDescription')"
          @update:page="onPageChange"
        />
      </CardContent>
    </Card>

    <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ t("common.delete") }}</AlertDialogTitle>
          <AlertDialogDescription>{{ t("houses.confirmDeleteSearch") }}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{{ t("common.cancel") }}</AlertDialogCancel>
          <AlertDialogAction @click="confirmDeleteRicerca">{{ t("common.delete") }}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <Sheet v-model:open="sheetOpen">
      <SheetContent side="right" class="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{{ editingId ? t("houses.searchEditTitle") : t("houses.searchNewTitle") }}</SheetTitle>
          <SheetDescription>{{ t("houses.searchTitle") }}</SheetDescription>
        </SheetHeader>

        <form class="space-y-4 px-4" @submit.prevent="submitForm">
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div class="space-y-2">
              <Label>{{ t("houses.labels.buyTime") }}</Label>
              <Input v-model="form.tempo_di_acquisto" type="number" required />
            </div>
            <div class="space-y-2">
              <Label>{{ t("houses.labels.budget") }}</Label>
              <Input v-model="form.budget" type="number" required />
            </div>
            <div class="space-y-2">
              <Label>{{ t("houses.labels.mortgage") }}</Label>
              <Input v-model="form.percentuale_mutuo" type="number" required />
            </div>
            <div class="space-y-2">
              <Label>{{ t("houses.labels.liquidity") }}</Label>
              <Input v-model="form.liquidita" type="number" required />
            </div>
            <div class="space-y-2">
              <Label>{{ t("houses.labels.clientRequired") }}</Label>
              <Select v-model="form.cliente_id">
                <SelectTrigger class="w-full">
                  <SelectValue :placeholder="t('houses.selectClient')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem :value="EMPTY_SELECT_VALUE">{{ t("houses.selectClient") }}</SelectItem>
                  <SelectItem v-for="client in clientsData?.data || []" :key="client.id" :value="String(client.id)">
                    {{ clientLabel(client) }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>{{ t("houses.labels.houseRequired") }}</Label>
              <Select v-model="form.casa_id">
                <SelectTrigger class="w-full">
                  <SelectValue :placeholder="t('houses.selectHouse')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem :value="EMPTY_SELECT_VALUE">{{ t("houses.selectHouse") }}</SelectItem>
                  <SelectItem v-for="house in housesData?.data || []" :key="house.id" :value="String(house.id)">
                    {{ houseLabel(house) }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
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
