import Product from '../models/Product.js';

export const getAllProducts = async () => {
  return await Product.find({});
};

export const getProductById = async (id) => {
  return await Product.findById(id);
};

export const searchProducts = async (query) => {
  return await Product.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } },
    ],
  });
};
