import { products } from '../frontend/src/data/products.js';
console.log('Total products in products.js:', products.length);
console.log('Categories in products.js:', [...new Set(products.map(p => p.category))]);
