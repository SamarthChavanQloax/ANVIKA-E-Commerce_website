import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function syncPhotosPlugin() {
  const sync = () => {
    const basePhotos = path.resolve(__dirname, '../Photos')
    const destDir = path.resolve(__dirname, 'public/products')

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true })
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
    ]

    for (const { src, dest } of copyMap) {
      if (fs.existsSync(src)) {
        const destPath = path.join(destDir, dest)
        fs.copyFileSync(src, destPath)
      }
    }

    // Sync login video
    const rootLoginVideo = path.resolve(__dirname, '../login_video.mp4')
    if (fs.existsSync(rootLoginVideo)) {
      const publicVideosDir = path.resolve(__dirname, 'public/videos')
      if (!fs.existsSync(publicVideosDir)) {
        fs.mkdirSync(publicVideosDir, { recursive: true })
      }
      fs.copyFileSync(rootLoginVideo, path.join(publicVideosDir, 'login_video.mp4'))
      fs.copyFileSync(rootLoginVideo, path.resolve(__dirname, 'public/login_video.mp4'))
    }
  }

  // Execute sync immediately on config evaluation
  try {
    sync()
  } catch (e) {
    console.error('Error during initial sync:', e)
  }

  return {
    name: 'sync-photos',
    buildStart() {
      sync()
    },
    configureServer() {
      sync()
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), syncPhotosPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})
