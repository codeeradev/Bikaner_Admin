import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState } from "react";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  searchPlaceholder?: string;
  searchColumn?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  toolbarContent?: ReactNode;
  showSearch?: boolean;
  resultCount?: number;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

function getSearchableValues(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.flatMap(getSearchableValues);
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap(
      getSearchableValues,
    );
  }
  return [String(value)];
}

export function DataTable<TData>({
  columns,
  data,
  searchPlaceholder = "Search...",
  searchColumn,
  isLoading = false,
  emptyMessage = "No data found",
  toolbarContent,
  showSearch = true,
  resultCount,
  searchValue,
  onSearchChange,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = String(filterValue ?? "").toLocaleLowerCase();
      if (!query) return true;
      const values = searchColumn
        ? getSearchableValues(row.getValue(searchColumn))
        : getSearchableValues(row.original);
      return values.some((value) =>
        value.toLocaleLowerCase().includes(query),
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="rounded-lg border border-border">
          <div className="space-y-2 p-4">
            {["a", "b", "c", "d", "e"].map((k) => (
              <Skeleton key={k} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {showSearch && (
            <Input
              placeholder={searchPlaceholder}
              value={searchValue ?? globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                onSearchChange?.(e.target.value);
              }}
              className="h-10 w-full rounded-xl bg-background sm:max-w-sm"
              data-ocid="datatable.search_input"
            />
          )}
          {toolbarContent}
        </div>
        <div className="shrink-0 text-sm text-muted-foreground">
          <span className="rounded-full bg-muted px-3 py-1.5">
            {resultCount ?? table.getFilteredRowModel().rows.length} results
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/70">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isActionsColumn = header.id === 'actions';
                    const isStatusColumn = header.column.id === 'status' || header.column.id === 'isActive';
                    
                    return (
                      <th
                        key={header.id}
                        className={cn(
                          "whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                          isActionsColumn && "w-auto text-right",
                          isStatusColumn && "w-auto text-center",
                          !isActionsColumn && !isStatusColumn && "text-left"
                        )}
                      >
                        {header.isPlaceholder ? null : (
                          <button
                            type="button"
                            className={cn(
                              "flex items-center gap-1 hover:text-foreground transition-colors",
                              header.column.getCanSort() && "cursor-pointer",
                              isActionsColumn && "ml-auto",
                              isStatusColumn && "mx-auto"
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                            disabled={!header.column.getCanSort()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {header.column.getCanSort() && (
                              <span className="ml-1">
                                {header.column.getIsSorted() === "asc" ? (
                                  <ArrowUp className="h-3 w-3" />
                                ) : header.column.getIsSorted() === "desc" ? (
                                  <ArrowDown className="h-3 w-3" />
                                ) : (
                                  <ArrowUpDown className="h-3 w-3 opacity-50" />
                                )}
                              </span>
                            )}
                          </button>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border/70">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-16 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-muted/40"
                  >
                    {row.getVisibleCells().map((cell) => {
                      const isActionsColumn = cell.column.id === 'actions';
                      const isStatusColumn = cell.column.id === 'status' || cell.column.id === 'isActive';
                      
                      return (
                        <td 
                          key={cell.id} 
                          className={cn(
                            "px-4 py-3",
                            isActionsColumn && "text-right",
                            isStatusColumn && "text-center"
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            data-ocid="datatable.pagination_first"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            data-ocid="datatable.pagination_prev"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            data-ocid="datatable.pagination_next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            data-ocid="datatable.pagination_last"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
