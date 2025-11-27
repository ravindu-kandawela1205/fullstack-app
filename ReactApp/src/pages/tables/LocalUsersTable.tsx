import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { DataTable } from "@/tables/data-table";
import { User, createUser, updateUser, deleteUser } from "@/apis/users/users.api";
import UserFormDialog from "@/components/customUi/UserFormDialog";
import UserDetailsDialog from "@/components/customUi/UserDetailsDialog";
import { userColumns } from "@/tables/userColumns";
import { useUsersQuery } from "@/hooks/users/useUsersQuery.hook";


export default function LocalUsersPage() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [open, setOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [viewingUser, setViewingUser] = React.useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletingUser, setDeletingUser] = React.useState<User | null>(null);
  const [search, setSearch] = React.useState("");

  const { data, isLoading, refetch } = useUsersQuery(page, pageSize);
  const users = data?.data || [];

  const handleSubmit = async (data: any) => {
    try {
      if (editingUser) {
        const response = await updateUser(editingUser._id!, {
          firstname: data.firstName,
          lastname: data.lastName,
          age: data.age,
          gender: data.gender,
          email: data.email,
          birthdate: new Date(data.birthday).toISOString(),
          image: data.image,
        });
        toast.success(response.message);
        setEditingUser(null);
      } else {
        const response = await createUser({
          firstname: data.firstName,
          lastname: data.lastName,
          age: data.age,
          gender: data.gender,
          email: data.email,
          birthdate: new Date(data.birthday).toISOString(),
          image: data.image,
        });
        toast.success(response.message);
      }
      refetch();
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
      const response = await deleteUser(deletingUser._id!);
      toast.success(response.message);
      refetch();
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
        columns={userColumns}
        data={users as any}
        page={page}
        pageSize={pageSize}
        total={data?.total || 0}
        loading={isLoading}
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
                <img src={viewingUser.image} alt="User" className="object-cover w-32 h-32 mt-2 rounded-lg" />
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