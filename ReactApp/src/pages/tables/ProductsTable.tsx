import * as React from 'react';
import type { Product } from '@/types/product';
import { DataTable } from '@/tables/data-table';
import { columns } from '@/tables/columns';
import UserDetailsDialog from '@/components/customUi/UserDetailsDialog';
import ProductDialog from '@/components/ProductDialog';
import { useProductsQuery } from '@/hooks/products/useProductsQuery.hook';
import { deleteProduct } from '@/apis/products/product.api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductsTable() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [selectedIds, setSelectedIds] = React.useState<Set<string | number>>(new Set());
  const [open, setOpen] = React.useState(false);
  const [productDialogOpen, setProductDialogOpen] = React.useState(false);
  const [activeProduct, setActiveProduct] = React.useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletingProduct, setDeletingProduct] = React.useState<Product | null>(null);
  const [search, setSearch] = React.useState('');

  const { data, isLoading, refetch } = useProductsQuery(page, pageSize);
  const rows = data?.data || [];

  console.log('Page:', page, 'PageSize:', pageSize, 'Rows count:', rows.length, 'Product IDs:', rows.map(p => p._id));



  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setProductDialogOpen(true);
  };

  const openDelete = (product: Product) => {
    setDeletingProduct(product);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;

    try {
      const response = await deleteProduct(deletingProduct._id);
      toast.success(response.message);
      refetch();
      setDeleteOpen(false);
      setDeletingProduct(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete product');
    }
  };

  const handleView = (product: Product) => {
    setActiveProduct(product);
    setOpen(true);
  };

  const handleDialogSuccess = () => {
    refetch();
    setEditingProduct(null);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Products</h1>
          <Button onClick={() => setProductDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={rows}
          total={data?.total || 0}
          page={page}
          pageSize={pageSize}
          loading={isLoading}
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Search by name, category, or brand..."
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
          onRowAction={openDelete}
          onSecondaryAction={handleEdit}
          onViewAction={handleView}
        />
      </div>
      <UserDetailsDialog
        open={open}
        onOpenChange={setOpen}
        title="Product Details"
      >
        {activeProduct ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">ID</p>
              <p className="font-medium">{activeProduct._id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="font-medium">{activeProduct.name || activeProduct.Name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Price</p>
              <p className="font-medium">${activeProduct.price || activeProduct.Price}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Category</p>
              <p className="font-medium">{activeProduct.category || activeProduct.Category}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Brand</p>
              <p className="font-medium">{activeProduct.brand || activeProduct.Brand}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Stock</p>
              <p className="font-medium">{activeProduct.stock || activeProduct.Stock}</p>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">No product selected.</div>
        )}
      </UserDetailsDialog>
      <ProductDialog
        open={productDialogOpen}
        onOpenChange={(open) => {
          setProductDialogOpen(open);
          if (!open) setEditingProduct(null);
        }}
        product={editingProduct}
        onSuccess={handleDialogSuccess}
      />
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white text-gray-800">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deletingProduct?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
