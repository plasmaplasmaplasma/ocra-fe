<script setup lang="ts">
import type { ColumnDef } from "@tanstack/vue-table";
import type {
  ColumnFiltersState,
  ExpandedState,
  SortingState,
  Updater,
  VisibilityState,
} from "@tanstack/vue-table";
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  isFunction,
  useVueTable,
} from "@tanstack/vue-table";
import { ChevronDown } from "lucide-vue-next";
import {
  Pagination,
  PaginationContent,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    columns: ColumnDef<any, any>[];
    data: any[];
    page?: number;
    total?: number;
    perPage?: number;
    pending?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    showColumnVisibility?: boolean;
  }>(),
  {
    page: 1,
    total: 0,
    perPage: 20,
    pending: false,
    emptyTitle: "",
    emptyDescription: "",
    showColumnVisibility: true,
  },
);

const emit = defineEmits<{
  (e: "update:page", value: number): void;
}>();

const totalPages = computed(() => {
  if (!props.total || !props.perPage) {
    return 1;
  }
  return Math.max(1, Math.ceil(props.total / props.perPage));
});

function goTo(nextPage: number) {
  const page = Math.max(1, Math.min(totalPages.value, nextPage));
  emit("update:page", page);
}

function updateValue<T>(updaterOrValue: Updater<T>, state: Ref<T>) {
  state.value = isFunction(updaterOrValue)
    ? updaterOrValue(state.value)
    : updaterOrValue;
}

const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({});
const rowSelection = ref({});
const expanded = ref<ExpandedState>({});

const table = useVueTable({
  get data() {
    return props.data;
  },
  get columns() {
    return props.columns;
  },
  enableRowSelection: true,
  manualSorting: true,
  manualFiltering: true,
  manualPagination: true,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  onSortingChange: (updaterOrValue) => updateValue(updaterOrValue, sorting),
  onColumnFiltersChange: (updaterOrValue) => updateValue(updaterOrValue, columnFilters),
  onColumnVisibilityChange: (updaterOrValue) => updateValue(updaterOrValue, columnVisibility),
  onRowSelectionChange: (updaterOrValue) => updateValue(updaterOrValue, rowSelection),
  onExpandedChange: (updaterOrValue) => updateValue(updaterOrValue, expanded),
  state: {
    get sorting() {
      return sorting.value;
    },
    get columnFilters() {
      return columnFilters.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
    get rowSelection() {
      return rowSelection.value;
    },
    get expanded() {
      return expanded.value;
    },
  },
});

function getColumnLabel(column: ReturnType<typeof table.getAllColumns>[number]) {
  const header = column.columnDef.header;
  if (typeof header === "string" && header.trim() !== "") {
    return header;
  }
  return column.id;
}
</script>

<template>
  <div class="space-y-4">
    <div v-if="showColumnVisibility" class="flex items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" class="ml-auto">
            {{ t("common.columns") }}
            <ChevronDown class="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuCheckboxItem
            v-for="column in table.getAllColumns().filter((column) => column.getCanHide())"
            :key="column.id"
            class="capitalize"
            :model-value="column.getIsVisible()"
            @update:model-value="(value) => column.toggleVisibility(!!value)"
          >
            {{ getColumnLabel(column) }}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <Table>
      <TableHeader>
        <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <TableHead v-for="header in headerGroup.headers" :key="header.id">
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <template v-if="table.getRowModel().rows?.length">
          <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </TableCell>
          </TableRow>
        </template>

        <TableRow v-else>
          <TableCell :colspan="columns.length" class="h-24 text-center">
            <div class="space-y-1">
              <p class="font-medium">{{ emptyTitle }}</p>
              <p class="text-sm text-muted-foreground">{{ emptyDescription }}</p>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <div class="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
      <p class="text-sm text-muted-foreground">
        {{ t("pagination.summary", { page, totalPages, total }) }}
      </p>

      <Pagination :items-per-page="perPage" :total="total" :default-page="page" :sibling-count="0" show-edges>
        <PaginationContent>
          <PaginationPrevious
            href="#"
            :disabled="page <= 1 || pending"
            @click.prevent="goTo(page - 1)"
          >
            {{ t("pagination.previous") }}
          </PaginationPrevious>

          <PaginationNext
            href="#"
            :disabled="page >= totalPages || pending"
            @click.prevent="goTo(page + 1)"
          >
            {{ t("pagination.next") }}
          </PaginationNext>
        </PaginationContent>
      </Pagination>
    </div>
  </div>
</template>