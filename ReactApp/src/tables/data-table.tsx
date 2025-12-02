import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import TablePagination from "@/components/customUi/TablePagination";
import SearchInput from "@/components/customUi/SearchInput";

interface DataRow {
  id?: number;
  _id?: string;
}

type DataTableProps<TData extends DataRow> = {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  total?: number;
  page?: number; // 1-based
  pageSize?: number;
  loading?: boolean;
  title?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  // selection across pages: managed via Set of ids outside
  selectedIds: Set<string | number>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string | number>>>;

  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onRowAction?: (row: TData) => void;
  onSecondaryAction?: (row: TData) => void;
  onViewAction?: (row: TData) => void;
};

export function DataTable<TData extends DataRow>({
  columns,
  data,
  total,
  page,
  pageSize,
  loading = false,
  title = "Table",
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  selectedIds,
  setSelectedIds,
  onPageChange,
  onPageSizeChange,
  onRowAction,
  onSecondaryAction,
  onViewAction,
}: DataTableProps<TData>) {
  const hasPagination = total !== undefined && page !== undefined && pageSize !== undefined;

  // Helpers for “select all on page”
  const pageIds = React.useMemo(() => data.map((d) => (d.id || d._id) as string | number), [data]);
  const pageSelectedCount = React.useMemo(
    () => pageIds.filter((id) => selectedIds.has(id)).length,
    [pageIds, selectedIds]
  );
  const allOnPageSelected =
    pageIds.length > 0 && pageSelectedCount === pageIds.length;
  const someOnPageSelected =
    pageSelectedCount > 0 && pageSelectedCount < pageIds.length;

  const toggleAllOnPage = (checked: boolean | string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) pageIds.forEach((id) => next.add(id));
      else pageIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // meta provides hooks to columns/actions
    meta: {
      isRowSelected: (id: string | number) => selectedIds.has(id),
      toggleRowSelected: (id: string | number, selected: boolean) => {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (selected) next.add(id);
          else next.delete(id);
          return next;
        });
      },
      onRowAction,
      onSecondaryAction,
      onViewAction,
    },
    // We keep sorting/filtering out for simplicity; add if you need later.
  });

  return (
    <div className="w-full space-y-4">
      {searchValue !== undefined && onSearchChange && (
        <div className="flex justify-end">
          <div className="w-full max-w-sm">
            <SearchInput
              value={searchValue}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Our custom header checkbox for 'select all on page' */}
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    allOnPageSelected ? true : someOnPageSelected ? "indeterminate" : false
                  }
                  onCheckedChange={toggleAllOnPage}
                  aria-label="Select all on page"
                />
              </TableHead>

              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => {
                  // We render headers except the first "select" one—already above.
                  if (header.id === "select") return null;
                  return (
                    <TableHead key={header.id} style={{ width: header.getSize() }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: Math.min(pageSize || 10, 10) }).map((_, i) => (
                <TableRow key={`s-${i}`}>
                  {/* 9 visible skeleton cells to match your previous layout */}
                  {Array.from({ length: 9 }).map((__, j) => (
                    <TableCell key={`s-${i}-${j}`}>
                      <Skeleton className="h-4 w-[60%]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-sm text-center text-muted-foreground">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {/* Row checkbox (first column) */}
                  <TableCell className="w-10">
                    <Checkbox
                      checked={selectedIds.has((row.original.id || row.original._id) as string | number)}
                      onCheckedChange={(c) =>
                        setSelectedIds((prev) => {
                          const next = new Set(prev);
                          const rowId = (row.original.id || row.original._id) as string | number;
                          if (c) next.add(rowId);
                          else next.delete(rowId);
                          return next;
                        })
                      }
                      aria-label={`Select row ${row.original.id || row.original._id}`}
                    />
                  </TableCell>

                  {/* Render the rest of cells, skipping the virtual "select" header */}
                  {row.getVisibleCells().map((cell) => {
                    if (cell.column.id === "select") return null;
                    return (
                      <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {hasPagination && onPageChange && onPageSizeChange && (
        <TablePagination
          page={page!}
          pageSize={pageSize!}
          total={total!}
          selectedCount={selectedIds.size}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
