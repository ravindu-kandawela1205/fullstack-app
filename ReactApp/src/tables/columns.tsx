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
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const image = row.original.image || row.original.Image;
      return image ? (
        <img src={image} alt="Product" className="w-12 h-12 object-cover rounded" />
      ) : (
        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No image</div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.original.name || row.original.Name,
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => `$${row.original.price || row.original.Price}`,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => row.original.category || row.original.Category,
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => row.original.brand || row.original.Brand,
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => row.original.stock || row.original.Stock,
  },
  {
    id: "actions",
    header: () => <div className="pr-1 text-right">Actions</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      const product = row.original;
      return (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={() => meta?.onViewAction?.(product)}
            aria-label="View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => meta?.onSecondaryAction?.(product)}
            aria-label="Edit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => meta?.onRowAction?.(product)}
            aria-label="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </Button>
        </div>
      );
    },
    enableSorting: false,
    size: 120,
  },
];
