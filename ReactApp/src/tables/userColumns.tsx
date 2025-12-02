import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { User } from "@/apis/users/users.api";
import { useAuth } from "@/store/authStore";

export const userColumns: ColumnDef<User>[] = [
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
    cell: ({ row }) => (
      row.original.image ? (
        <img src={row.original.image} alt="User" className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
          {row.original.firstname?.charAt(0)}{row.original.lastname?.charAt(0)}
        </div>
      )
    ),
    size: 60,
  },
  {
    accessorKey: "firstname",
    header: "First Name",
  },
  {
    accessorKey: "lastname",
    header: "Last Name",
  },
  {
    accessorKey: "age",
    header: "Age",
    cell: ({ row }) => <div className="tabular-nums">{row.original.age}</div>,
    size: 80,
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => <span className="capitalize">{row.original.gender}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "birthdate",
    header: "Birthdate",
    cell: ({ row }) => {
      const birthdate = row.original.birthdate;
      if (!birthdate) return <span className="text-muted-foreground">N/A</span>;
      return <span>{new Date(birthdate).toLocaleDateString()}</span>;
    },
  },
  {
    id: "actions",
    header: () => <div className="pr-1 text-right">Actions</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      const user = row.original;
      const { user: currentUser } = useAuth();
      const isAdmin = currentUser?.role === 'admin';
      
      return (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={() => meta?.onViewAction?.(user)}
            aria-label="View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </Button>
          {isAdmin && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="w-8 h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => meta?.onSecondaryAction?.(user)}
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
                onClick={() => meta?.onRowAction?.(user)}
                aria-label="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </Button>
            </>
          )}
        </div>
      );
    },
    enableSorting: false,
    size: 120,
  },
];
