import * as React from 'react';
import type { Product } from '@/types/product';
import { DataTable } from '@/tables/data-table';
import { columns } from '@/tables/columns';
import UserDetailsDialog from '@/components/customUi/UserDetailsDialog';
import { useProductsQuery } from '@/hooks/products/useProductsQuery.hook';

export default function ProductsTable() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [selectedIds, setSelectedIds] = React.useState<Set<string | number>>(new Set());
  const [open, setOpen] = React.useState(false);
  const [activeProduct, setActiveProduct] = React.useState<Product | null>(
    null
  );
  const [search, setSearch] = React.useState('');

  const { data, isLoading } = useProductsQuery(page, pageSize);
  const rows = data?.data || [];

  console.log('Page:', page, 'PageSize:', pageSize, 'Rows count:', rows.length, 'Product IDs:', rows.map(p => p._id));

  const openDetails = (product: Product) => {
    setActiveProduct(product);
    setOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Products</h1>
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
          onRowAction={openDetails}
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
              <p className="font-medium">{activeProduct.Name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Price</p>
              <p className="font-medium">${activeProduct.Price}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Category</p>
              <p className="font-medium">{activeProduct.Category}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Brand</p>
              <p className="font-medium">{activeProduct.Brand}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Stock</p>
              <p className="font-medium">{activeProduct.Stock}</p>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">No product selected.</div>
        )}
      </UserDetailsDialog>
    </>
  );
}
