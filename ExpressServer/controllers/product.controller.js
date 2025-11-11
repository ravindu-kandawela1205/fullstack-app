import Product from "../models/product.js";

export const getProducts = async (req, res) => {
  try {
    const productData = await Product.find();
    console.log(`Found ${productData.length} products`);
    res.json(productData);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};