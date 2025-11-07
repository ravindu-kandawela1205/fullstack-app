import axiosInstance from "@/lib/axiosInstance";
import { Product } from "@/types/product";

export async function getProducts(
  page = 1,
  limit = 10
): Promise<{ data: Product[]; total: number }> {
  const skip = (page - 1) * limit;

  const res = await axiosInstance.get(`/api/products?limit=${limit}&skip=${skip}`);
  
  const allProducts = res.data.products || res.data.data || res.data;
  const total = res.data.total || allProducts.length;
  
  // If backend doesn't paginate, do it on frontend
  const paginatedData = Array.isArray(allProducts) ? allProducts.slice(skip, skip + limit) : allProducts;
  
  return { 
    data: paginatedData, 
    total 
  };
}
