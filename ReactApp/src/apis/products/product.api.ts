import axiosInstance from "@/lib/axiosInstance";
import { Product } from "@/types/product";

export async function getProducts(
  page = 1,
  limit = 10
): Promise<{ data: Product[]; total: number }> {
  const res = await axiosInstance.get(`/api/products?page=${page}&limit=${limit}`);
  
  const products = res.data.products || [];
  const total = res.data.pagination?.totalItems || 0;
  
  return { 
    data: products, 
    total 
  };
}

export async function createProduct(productData: Partial<Product>) {
  const res = await axiosInstance.post('/api/products', productData);
  return res.data;
}

export async function updateProduct(id: string, productData: Partial<Product>) {
  const res = await axiosInstance.put(`/api/products/${id}`, productData);
  return res.data;
}

export async function deleteProduct(id: string) {
  const res = await axiosInstance.delete(`/api/products/${id}`);
  return res.data;
}
