const products = [];

export const getProductPrice = (product) => {
  if (!product.isPromo || !product.discountPercent) {
    return product.price;
  }

  return product.price * (1 - product.discountPercent / 100);
};

export default products;
