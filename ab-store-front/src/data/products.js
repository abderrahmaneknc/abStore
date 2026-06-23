const products = [
  {
    id: 1,
    brand: 'Canon',
    category: 'Cameras',
    productName: 'EOS R5',
    name: 'Canon EOS R5',
    image: 'https://images.unsplash.com/photo-1610825469439-d49c8f41d968',
    image2:
      'https://images.unsplash.com/photo-1613235577937-9ac3eed992fc?w=500&auto=format&fit=crop&q=60',
    description:
      'Professional full-frame mirrorless camera with high resolution, advanced autofocus, and excellent video capabilities.',
    price: 3899,
    rating: 4.9,
    isNew: true,
    isPromo: true,
    discountPercent: 20,
  },
  {
    id: 2,
    brand: 'Sony',
    category: 'Cameras',
    productName: 'A7 IV',
    name: 'Sony A7 IV',
    image:
      'https://images.unsplash.com/photo-1647920564028-5756c7af4bd1?w=500&auto=format&fit=crop&q=60',
    image2:
      'https://images.unsplash.com/photo-1710887030475-f9077ee433b5?w=500&auto=format&fit=crop&q=60',
    description:
      'A hybrid full-frame camera designed for photography and videography with excellent dynamic range and autofocus.',
    price: 2499,
    rating: 4.8,
    isNew: true,
    isPromo: true,
    discountPercent: 40,
  },
  {
    id: 3,
    brand: 'Nikon',
    category: 'Cameras',
    productName: 'Z6',
    name: 'Nikon Z6',
    image:
      'https://images.unsplash.com/photo-1614108831136-a6bba175a08e?w=500&auto=format&fit=crop&q=60',
    image2:
      'https://images.unsplash.com/photo-1614108830714-74f0e4c8cd7e?w=500&auto=format&fit=crop&q=60',
    description:
      'Full-frame mirrorless camera with strong low-light performance and in-body image stabilization.',
    price: 1999,
    rating: 4.7,
    isNew: true,
    isPromo: true,
    discountPercent: 20,
  },
  {
    id: 4,
    brand: 'Apple',
    category: 'Laptop',
    productName: 'MacBook Pro',
    name: 'MacBook Pro',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
    image2: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',
    description:
      'High-performance laptop designed for professionals with powerful chips, Retina display, and long battery life.',
    price: 2399,
    rating: 4.9,
    isNew: true,
    isPromo: true,
    discountPercent: 10,
  },
  {
    id: 5,
    brand: 'GoPro',
    category: 'Cameras',
    productName: 'Hero 12',
    name: 'GoPro Hero 12',
    image:
      'https://images.unsplash.com/photo-1643104444614-292853865f54?w=500&auto=format&fit=crop&q=60',
    image2:
      'https://images.unsplash.com/photo-1490971269589-386b2934c495?w=500&auto=format&fit=crop&q=60',
    description:
      'Compact action camera with hyper-smooth stabilization and 4K video recording.',
    price: 499,
    rating: 4.6,
    isNew: true,
    isPromo: true,
    discountPercent: 10,
  },
  {
    id: 6,
    brand: 'DJI',
    category: 'Cameras',
    productName: 'Mini 3 Pro',
    name: 'DJI Mini 3 Pro',
    image:
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=500&auto=format&fit=crop&q=60',
    image2:
      'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500&auto=format&fit=crop&q=60',
    description:
      'Lightweight drone with 4K video, advanced obstacle sensing, and long flight time.',
    price: 759,
    rating: 4.8,
    isNew: true,
    isPromo: false,
    discountPercent: 0,
  },
  {
    id: 7,
    brand: 'DJI',
    category: 'Accessoires',
    productName: 'RS 3',
    name: 'DJI RS 3 Gimbal Stabilizer',
    image:
      'https://images.unsplash.com/photo-1693496830158-a1881a678a48?w=500&auto=format&fit=crop&q=60',
    image2:
      'https://images.unsplash.com/photo-1667847571526-cb885b9e4764?w=500&auto=format&fit=crop&q=60',
    description:
      'Professional 3-axis gimbal stabilizer for smooth and cinematic video recording.',
    price: 549,
    rating: 4.7,
    isNew: true,
    isPromo: false,
    discountPercent: 0,
  },
  {
    id: 8,
    brand: 'Manfrotto',
    category: 'Accessoires',
    productName: 'Tripod',
    name: 'Manfrotto Tripod',
    image:
      'https://images.unsplash.com/photo-1545254000-6c843440c5cd?w=500&auto=format&fit=crop&q=60',
    image2:
      'https://images.unsplash.com/photo-1612548403247-aa2873e9422d?w=500&auto=format&fit=crop&q=60',
    description:
      'Professional tripod offering strong stability and adjustable positioning for photography and video.',
    price: 299,
    rating: 4.5,
    isNew: true,
    isPromo: false,
    discountPercent: 0,
  },
];

export const getProductPrice = (product) => {
  if (!product.isPromo || !product.discountPercent) {
    return product.price;
  }

  return product.price * (1 - product.discountPercent / 100);
};

export default products;
