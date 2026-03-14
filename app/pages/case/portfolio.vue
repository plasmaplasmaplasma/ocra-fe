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
  ALL_OPTION_VALUE,
  EMPTY_SELECT_VALUE,
} from "../../../shared/schemas/common";
import {
  type CasaCreate,
  type CasaUpdate,
  type CasaFilters,
  type Casa,
  CasaSchemaCreate,
  CasaSchemaUpdate,
} from "../../../shared/schemas/casa";
import { toast } from "vue-sonner";
import { h } from "vue";
import type { Zona } from "~~/shared/schemas/zona";

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

const query = reactive<Partial<CasaFilters>>({});
const form = reactive<Partial<CasaCreate | CasaUpdate>>({});

const { data, pending, error, refresh } = useOcraFetch<
  PaginatedApiEnvelope<Casa>
>("/houses/read", {
  query,
  immediate: false,
  watch: false,
});

const { data: zonesData, refresh: refreshZones } = useOcraFetch<
  PaginatedApiEnvelope<Zona>
>("/zones/read", {
  query: { page: 1 },
  immediate: false,
  watch: false,
});

const { create, update, remove } = useOcraCrud("/houses");

function resetForm() {
  editingId.value = null;
  formError.value = "";
  Object.assign(form, {});
}

function openCreateSheet() {
  resetForm();
  ensureZonesData();
  sheetOpen.value = true;
}

function editCasa(item: Casa) {
  ensureZonesData();
  editingId.value = item.id;
  formError.value = "";
  Object.assign(form, item);
  sheetOpen.value = true;
}

async function submitForm() {
  formError.value = "";

  const parsedPayload = editingId.value
    ? CasaSchemaUpdate.safeParse({ ...form, id: editingId.value })
    : CasaSchemaCreate.safeParse(form);

  if (!parsedPayload.success) {
    formError.value = t("common.saveError");
    return;
  }

  try {
    if (editingId.value) {
      await update<Casa>(editingId.value, parsedPayload.data);
      toast.success(t("houses.toast.houseUpdated"));
    } else {
      await create<Casa>(parsedPayload.data);
      toast.success(t("houses.toast.houseCreated"));
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

async function confirmDeleteCasa() {
  if (deleteTargetId.value == null) {
    return;
  }

  try {
    await remove(deleteTargetId.value);
    hasSearched.value = true;
    await refresh();
    toast.success(t("houses.toast.houseDeleted"));
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
  ensureZonesData();
  refresh();
}

function onPageChange(nextPage: number) {
  page.value = nextPage;
  if (hasSearched.value) {
    refresh();
  }
}

function ensureZonesData() {
  if (!zonesData.value) {
    refreshZones();
  }
}

function formatHousePlus(item: Casa): string {
  return [
    `${t("houses.status.balcony")}: ${item.balcone ? t("common.yes") : t("common.no")}`,
    `${t("houses.status.terrace")}: ${item.terrazzo ? t("common.yes") : t("common.no")}`,
    `${t("houses.status.garden")}: ${item.giardino ? t("common.yes") : t("common.no")}`,
  ].join(" | ");
}

function renderActionsMenu(item: Casa) {
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
                { onClick: () => editCasa(item) },
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

const columns = computed<ColumnDef<Casa>[]>(() => [
  {
    accessorKey: "id",
    header: t("common.id"),
    cell: ({ row }) => row.original.id,
  },
  {
    accessorKey: "piano",
    header: t("houses.columns.floor"),
    cell: ({ row }) => row.original.piano ?? "-",
  },
  {
    accessorKey: "numero_di_locali",
    header: t("houses.columns.rooms"),
    cell: ({ row }) => row.original.numero_di_locali ?? "-",
  },
  {
    accessorKey: "numero_di_camere",
    header: t("houses.columns.bedrooms"),
    cell: ({ row }) => row.original.numero_di_camere ?? "-",
  },
  {
    accessorKey: "numero_di_bagni",
    header: t("houses.columns.bathrooms"),
    cell: ({ row }) => row.original.numero_di_bagni ?? "-",
  },
  {
    id: "zona",
    header: t("houses.columns.zone"),
    cell: ({ row }) => row.original.zona?.nome || row.original.zona_id,
  },
  {
    id: "plus",
    header: t("houses.columns.plus"),
    cell: ({ row }) => formatHousePlus(row.original),
  },
  {
    id: "actions",
    header: t("common.actions"),
    cell: ({ row }) => renderActionsMenu(row.original),
  },
]);
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-2xl font-semibold">{{ t("houses.portfolioTitle") }}</h1>
      <Button @click="openCreateSheet">{{ t("common.new") }}</Button>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>{{ t("houses.filtersTitle") }}</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div class="space-y-2">
            <Label for="f-piano">{{ t("houses.labels.floor") }}</Label>
            <Input id="f-piano" v-model="query.piano" type="number" />
          </div>
          <div class="space-y-2">
            <Label for="f-locali">{{ t("houses.sort.rooms") }}</Label>
            <Input
              id="f-locali"
              v-model="query.numero_di_locali"
              type="number"
            />
          </div>
          <div class="space-y-2">
            <Label for="f-camere">{{ t("houses.sort.bedrooms") }}</Label>
            <Input
              id="f-camere"
              v-model="query.numero_di_camere"
              type="number"
            />
          </div>
          <div class="space-y-2">
            <Label for="f-bagni">{{ t("houses.sort.bathrooms") }}</Label>
            <Input id="f-bagni" v-model="query.numero_di_bagni" type="number" />
          </div>
          <div class="space-y-2">
            <Label for="f-zona">{{ t("houses.labels.zone") }}</Label>
            <Select v-model="query.zona_id">
              <SelectTrigger id="f-zona" class="w-full">
                <SelectValue :placeholder="t('common.allFeminine')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="ALL_OPTION_VALUE">{{
                  t("common.allFeminine")
                }}</SelectItem>
                <SelectItem
                  v-for="zona in zonesData?.data || []"
                  :key="zona.id"
                  :value="String(zona.id)"
                >
                  {{ zona.nome }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="f-balcone">{{ t("houses.labels.balcony") }}</Label>
            <div class="flex items-center gap-2">
              <Checkbox id="f-balcone" v-model="form.balcone" />
              <Label for="f-balcone">{{ t("common.yes") }}</Label>
            </div>
          </div>
          <div class="space-y-2">
            <Label for="f-terrazzo">{{ t("houses.labels.terrace") }}</Label>
            <div class="flex items-center gap-2">
              <Checkbox id="f-terrazzo" v-model="form.terrazzo" />
              <Label for="f-terrazzo">{{ t("common.yes") }}</Label>
            </div>
          </div>
          <div class="space-y-2">
            <Label for="f-giardino">{{ t("houses.labels.garden") }}</Label>
            <div class="flex items-center gap-2">
              <Checkbox id="f-giardino" v-model="form.giardino" />
              <Label for="f-giardino">{{ t("common.yes") }}</Label>
            </div>
          </div>
          <div class="space-y-2">
            <Label for="f-sort-by">{{ t("houses.labels.sortBy") }}</Label>
            <Select v-model="query.sort_by">
              <SelectTrigger id="f-sort-by" class="w-full">
                <SelectValue :placeholder="t('common.none')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="ALL_OPTION_VALUE">{{
                  t("common.none")
                }}</SelectItem>
                <SelectItem value="piano">{{
                  t("houses.sort.floor")
                }}</SelectItem>
                <SelectItem value="numero_di_locali">{{
                  t("houses.sort.rooms")
                }}</SelectItem>
                <SelectItem value="numero_di_camere">{{
                  t("houses.sort.bedrooms")
                }}</SelectItem>
                <SelectItem value="numero_di_bagni">{{
                  t("houses.sort.bathrooms")
                }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="f-sort-dir">{{ t("houses.labels.sortDir") }}</Label>
            <Select v-model="query.sort_dir">
              <SelectTrigger id="f-sort-dir" class="w-full">
                <SelectValue :placeholder="t('common.asc')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">{{ t("common.asc") }}</SelectItem>
                <SelectItem value="desc">{{ t("common.desc") }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button variant="outline" @click="applyFilters">{{
          t("common.applyFilters")
        }}</Button>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>{{ t("houses.listTitle") }}</CardTitle>
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
          :empty-title="t('houses.empty.houseTitle')"
          :empty-description="t('houses.empty.houseDescription')"
          @update:page="onPageChange"
        />
      </CardContent>
    </Card>

    <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ t("common.delete") }}</AlertDialogTitle>
          <AlertDialogDescription>{{
            t("houses.confirmDeleteHouse")
          }}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{{ t("common.cancel") }}</AlertDialogCancel>
          <AlertDialogAction @click="confirmDeleteCasa">{{
            t("common.delete")
          }}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <Sheet v-model:open="sheetOpen">
      <SheetContent side="right" class="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{{
            editingId ? t("houses.editTitle") : t("houses.newTitle")
          }}</SheetTitle>
          <SheetDescription>{{ t("houses.portfolioTitle") }}</SheetDescription>
        </SheetHeader>

        <form class="space-y-4 px-4" @submit.prevent="submitForm">
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div class="space-y-2">
              <Label for="piano">{{ t("houses.labels.floor") }}</Label>
              <Input id="piano" v-model.number="form.piano" type="number" />
            </div>
            <div class="space-y-2">
              <Label for="locali">{{ t("houses.labels.rooms") }}</Label>
              <Input
                id="locali"
                v-model.number="form.numero_di_locali"
                type="number"
              />
            </div>
            <div class="space-y-2">
              <Label for="camere">{{ t("houses.labels.bedrooms") }}</Label>
              <Input
                id="camere"
                v-model.number="form.numero_di_camere"
                type="number"
              />
            </div>
            <div class="space-y-2">
              <Label for="bagni">{{ t("houses.labels.bathrooms") }}</Label>
              <Input
                id="bagni"
                v-model.number="form.numero_di_bagni"
                type="number"
              />
            </div>
            <div class="space-y-2">
              <Label for="balcone">{{ t("houses.labels.balcony") }}</Label>
              <div class="flex items-center gap-2">
                <Checkbox id="balcone" v-model="form.balcone" />
                <Label for="balcone">{{ t("common.yes") }}</Label>
              </div>
            </div>
            <div class="space-y-2">
              <Label for="terrazzo">{{ t("houses.labels.terrace") }}</Label>
              <div class="flex items-center gap-2">
                <Checkbox id="terrazzo" v-model="form.terrazzo" />
                <Label for="terrazzo">{{ t("common.yes") }}</Label>
              </div>
            </div>
            <div class="space-y-2">
              <Label for="giardino">{{ t("houses.labels.garden") }}</Label>
              <div class="flex items-center gap-2">
                <Checkbox id="giardino" v-model="form.giardino" />
                <Label for="giardino">{{ t("common.yes") }}</Label>
              </div>
            </div>
            <div class="space-y-2">
              <Label for="zona_id">{{ t("houses.labels.zone") }} *</Label>
              <Select v-model="form.zona_id">
                <SelectTrigger id="zona_id" class="w-full">
                  <SelectValue :placeholder="t('houses.selectZone')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem :value="EMPTY_SELECT_VALUE">{{
                    t("houses.selectZone")
                  }}</SelectItem>
                  <SelectItem
                    v-for="zona in zonesData?.data || []"
                    :key="zona.id"
                    :value="String(zona.id)"
                  >
                    {{ zona.nome }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
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
