import axiosInstance from "@/lib/axiosInstance";
import { Product } from "@/types/product";

export async function getProducts(
  page = 1,
  limit = 10
): Promise<{ data: Product[]; total: number }> {
  const res = await axiosInstance.get(`/api/products?page=${page}`);
  
  const products = res.data.products || [];
  const total = res.data.pagination?.totalItems || 0;
  
  return { 
    data: products, 
    total 
  };
}
