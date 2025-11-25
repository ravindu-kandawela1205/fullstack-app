import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { DataTable } from "@/tables/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocalUsers } from "@/store/useLocalUsers";
import { User } from "@/apis/users/users.api";
import UserFormDialog from "@/components/customUi/UserFormDialog";
import UserDetailsDialog from "@/components/customUi/UserDetailsDialog";
import { useAuth } from "@/store/authStore";


export default function LocalUsersPage() {
  const { users, total, loading, fetchUsers, addUser, updateUser, removeUser } = useLocalUsers();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const { user } = useAuth();
  React.useEffect(() => {
    fetchUsers(page, pageSize);
  }, [page, pageSize]);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [open, setOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [viewingUser, setViewingUser] = React.useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletingUser, setDeletingUser] = React.useState<User | null>(null);
  const [search, setSearch] = React.useState("");

  // Use server-side data directly
  const pageRows = users;

  const localUserColumns: ColumnDef<User, any>[] = [
    {
      id: "select",
      header: () => <div className="w-10" />,
      cell: ({ row, table }) => {
        const meta = table.options.meta as any;
        const u = row.original;
        const checked = meta.isRowSelected(u._id!);
        return (
          <Checkbox
            aria-label={`Select row ${u._id}`}
            checked={checked}
            onCheckedChange={(c) => meta.toggleRowSelected(u._id!, !!c)}
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 44,
    },
    {
      accessorKey: "_id",
      header: "ID",
      cell: ({ row }) => <div className="tabular-nums">{row.original._id}</div>,
      size: 80,
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
        const u = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="w-8 h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => meta.onViewAction!(u)}
              aria-label="View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </Button>

            {/* edit button  */}

            {user ?.role === 'admin' &&(
              <Button
              size="icon"
              variant="ghost"
              className="w-8 h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => meta.onSecondaryAction!(u)}
              aria-label="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </Button> 
            )}
           

            {user?.role === 'admin' && (
              
                          <Button
              size="icon"
              variant="ghost"
              className="w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => meta.onRowAction(u)}
              aria-label="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </Button>
            )}
            {/* delete button  */}
            

          </div>
        );
      },
      enableSorting: false,
      size: 120,
    },
  ];

  const handleSubmit = async (data: any) => {
    try {
      if (editingUser) {
        const message = await updateUser(editingUser._id!, {
          firstname: data.firstName,
          lastname: data.lastName,
          age: data.age,
          gender: data.gender,
          email: data.email,
          birthdate: new Date(data.birthday).toISOString(),
          image: data.image,
        });
        toast.success(message);
        setEditingUser(null);
      } else {
        const message = await addUser({
          firstname: data.firstName,
          lastname: data.lastName,
          age: data.age,
          gender: data.gender,
          email: data.email,
          birthdate: new Date(data.birthday).toISOString(),
          image: data.image,
        });
        // Refresh current page after adding
        toast.success(message);
      }
      setOpen(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Operation failed!";
      toast.error(errorMessage);
    }
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setOpen(true);
  };

  const openView = (user: User) => {
    setViewingUser(user);
    setViewOpen(true);
  };

  const openRemove = (user: User) => {
    setDeletingUser(user);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;

    try {
      const message = await removeUser(deletingUser._id!);
      toast.success(message);

      // Page will be refreshed by removeUser function

      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deletingUser._id!);
        return next;
      });

      setDeleteOpen(false);
      setDeletingUser(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to delete user!";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Local Users</h1>
        <Button className="inline-flex items-center gap-2" onClick={() => {
          setEditingUser(null);
          setOpen(true);
        }}>
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {open && (
        <UserFormDialog
          key={editingUser?._id || Date.now()}
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) setEditingUser(null);
          }}
          editingUser={editingUser}
          onSubmit={handleSubmit}
        />
      )}

      {/* Table */}
      <DataTable
        columns={localUserColumns as any}
        data={pageRows as any}
        page={page}
        pageSize={pageSize}
        total={total}
        loading={loading}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search by name, email, or phone..."
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds as any}
        onPageChange={setPage}
        onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
        onRowAction={openRemove as any}
        onSecondaryAction={openEdit as any}
        onViewAction={openView as any}
      />
      <UserDetailsDialog open={viewOpen} onOpenChange={setViewOpen} title="User Details">
        {viewingUser ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <p className="text-xs text-gray-500">ID</p>
              <p className="font-medium">{viewingUser._id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">First Name</p>
              <p className="font-medium">{viewingUser.firstname}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Last Name</p>
              <p className="font-medium">{viewingUser.lastname}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Age</p>
              <p className="font-medium">{viewingUser.age}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Gender</p>
              <p className="font-medium capitalize">{viewingUser.gender}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium">{viewingUser.email}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-500">Phone</p>
              <p className="font-medium">N/A</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-500">Birthday</p>
              <p className="font-medium">{viewingUser.birthdate ? new Date(viewingUser.birthdate).toLocaleDateString() : "N/A"}</p>
            </div>
            {viewingUser.image && (
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500">Image</p>
                <img src={viewingUser.image} alt="User" className="w-32 h-32 rounded-lg object-cover mt-2" />
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500">No user selected.</div>
        )}
      </UserDetailsDialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white text-gray-800">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deletingUser?.firstname} {deletingUser?.lastname}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}