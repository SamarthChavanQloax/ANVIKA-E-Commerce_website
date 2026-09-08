const NEW_PRODUCT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

const toFinitePrice = (value) => {
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : null;
};

export const getProductPricing = (product) => {
  const salePrice = toFinitePrice(product?.salePrice ?? product?.price);
  const originalPrice = toFinitePrice(product?.originalPrice);
  const hasDiscount = salePrice !== null
    && originalPrice !== null
    && salePrice < originalPrice;

  return {
    salePrice,
    originalPrice,
    hasDiscount,
    discountPercentage: hasDiscount
      ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
      : 0,
  };
};

export const isProductNew = (product) => {
  if (product?.isNew === true) {
    return true;
  }

  if (!product?.createdAt) {
    return false;
  }

  const createdAt = new Date(product.createdAt).getTime();
  return Number.isFinite(createdAt)
    && Date.now() - createdAt >= 0
    && Date.now() - createdAt <= NEW_PRODUCT_WINDOW_MS;
};

export const getProductBadges = (product) => {
  const pricing = getProductPricing(product);

  return {
    isNew: isProductNew(product),
    ...pricing,
  };
};
