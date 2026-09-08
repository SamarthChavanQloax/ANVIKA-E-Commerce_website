import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basePhotos = path.resolve(__dirname, '../../Photos');
const destDir = path.resolve(__dirname, '../public/products');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const copyMap = [
  // Saree Collection
  { src: path.join(basePhotos, 'Saree/Nayanthara.jpeg'), dest: 'saree-silver-silk.jpg' },
  { src: path.join(basePhotos, 'Saree/saree.jpeg'), dest: 'saree-rosewood-silk.jpg' },
  { src: path.join(basePhotos, 'Saree/_ (8).jpeg'), dest: 'saree-pink-gold.jpg' },
  { src: path.join(basePhotos, 'Saree/_ (7).jpeg'), dest: 'saree-royal-yellow.jpg' },
  { src: path.join(basePhotos, 'Saree/_ (9).jpeg'), dest: 'saree-champagne-bridal.jpg' },
  { src: path.join(basePhotos, 'Saree/Luxurious Saree Look ✨ _ Elegant Royal Ethnic Fashion Style.jpeg'), dest: 'saree-bronze-regal.jpg' },
  
  // Baby & Kids Collection
  { src: path.join(basePhotos, 'images/Modern & Minimalist baby frock design ✨🌻💛.jpg'), dest: 'baby-cherry-yellow.jpg' },
  { src: path.join(basePhotos, 'images/blue 💙.jpg'), dest: 'baby-blue-stripe.jpg' },
  { src: path.join(basePhotos, 'images/Cute! Baby Girl Pink Polka Dot Frock with Hairband.jpg'), dest: 'baby-pink-polka.jpg' },
  { src: path.join(basePhotos, 'images/Little Bloom🌸🌹.jpg'), dest: 'baby-little-bloom.jpg' },
  { src: path.join(basePhotos, 'images/850898923389432957.jpg'), dest: 'baby-mustard-flutter.jpg' },
  { src: path.join(basePhotos, 'images/689824867973052542.jpg'), dest: 'baby-gingham-red.jpg' },
  { src: path.join(basePhotos, 'images/baby girl dress.jpg'), dest: 'baby-floral-angrakha.jpg' },
  { src: path.join(basePhotos, 'images/168251736078677358.jpg'), dest: 'baby-blue-scallop.jpg' },

  // Dresses & Women's Wear Collection
  { src: path.join(basePhotos, 'Dress/Cream Mustard Floral Printed 3PC Winter Suit _ Winter Cotton + Brown Korean Chiffon Dupatta.jpeg'), dest: 'dress-cream-mustard-suit.jpg' },
  { src: path.join(basePhotos, 'Dress/💫Elegant Magenta Designer Chudidhar with Zari Embroidery _ Royal Ethnic Fashion Inspo 😍.jpeg'), dest: 'dress-magenta-designer-suit.jpg' },
  { src: path.join(basePhotos, 'Dress/Elegant Paisley Print Co-Ord Set.jpeg'), dest: 'dress-paisley-coord.jpg' },
  { src: path.join(basePhotos, 'Dress/Kurta Set with Duptta for Women.jpeg'), dest: 'dress-aqua-embroidered-suit.jpg' },
  { src: path.join(basePhotos, 'Dress/Punjabi Patiala Suit with Traditional Jewelry _ Elegant Punjabi Look.jpeg'), dest: 'dress-punjabi-patiala-suit.jpg' },
  { src: path.join(basePhotos, 'Dress/the dress every girl must have.jpeg'), dest: 'dress-plum-dhoti-set.jpg' }
];

let count = 0;
for (const { src, dest } of copyMap) {
  if (fs.existsSync(src)) {
    const destPath = path.join(destDir, dest);
    fs.copyFileSync(src, destPath);
    count++;
  } else {
    console.warn(`Source not found: ${src}`);
  }
}

console.log(`Successfully synced ${count} curated product photos to ${destDir}`);
