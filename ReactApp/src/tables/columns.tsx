import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";

export const columns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "_id",
    header: "ID",
  },
  {
    accessorKey: "Name",
    header: "Name",
  },
  {
    accessorKey: "Price",
    header: "Price",
    cell: ({ row }) => `$${row.original.Price}`,
  },
  {
    accessorKey: "Category",
    header: "Category",
  },
  {
    accessorKey: "Brand",
    header: "Brand",
  },
  {
    accessorKey: "Stock",
    header: "Stock",
  },
  {
    id: "actions",
    header: () => <div className="text-left pr-1">Actions</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      return (
        <div className="flex items-left justify-start gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={() => meta?.onRowAction?.(row.original)}
            aria-label="View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </Button>
        </div>
      );
    },
  },
];
