import HeroVideo from '../components/home/HeroVideo';
import FeaturedCategories from '../components/home/FeaturedCategories';
import ProductCarouselSection from '../components/home/ProductCarouselSection';
import SareeFeature from '../components/home/SareeFeature';
import BabyFeature from '../components/home/BabyFeature';
import CollectionGrid from '../components/home/CollectionGrid';
import EditorialSplit from '../components/home/EditorialSplit';
import BrandStory from '../components/home/BrandStory';
import SocialGallery from '../components/home/SocialGallery';
import { useMemo } from 'react';
import Newsletter from '../components/home/Newsletter';
import { useProducts } from '../context/ProductContext';

const Home = () => {
  const { products } = useProducts();

  // Helper to place newest pieces from MongoDB at the front of marketing carousels
  const sortByNewest = (list) => {
    return [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  };

  const newArrivals = useMemo(() => {
    const list = products.filter(p => p.isNew !== false);
    return sortByNewest(list.length > 0 ? list : products);
  }, [products]);

  const sareesProducts = useMemo(() => {
    return sortByNewest(products.filter(p => (p.category || '').toLowerCase().includes('saree')));
  }, [products]);

  const womenProducts = useMemo(() => {
    return sortByNewest(products.filter(p => {
      const c = (p.category || '').toLowerCase();
      return c.includes('women') || c.includes('dress');
    }));
  }, [products]);

  const dressesProducts = useMemo(() => {
    return sortByNewest(products.filter(p => (p.category || '').toLowerCase().includes('dress')));
  }, [products]);

  const ethnicProducts = useMemo(() => {
    return sortByNewest(products.filter(p => {
      const c = (p.category || '').toLowerCase();
      return c.includes('ethnic') || c.includes('women') || c.includes('lehenga');
    }));
  }, [products]);

  const kidsProducts = useMemo(() => {
    return sortByNewest(products.filter(p => {
      const c = (p.category || '').toLowerCase();
      return c.includes('kid') || c.includes('baby');
    }));
  }, [products]);
  return (
    <div className="w-full font-sans bg-[#121212]">
      {/* 
        Hero Video Showcase:
        Plays the raw silk bridal lehenga videos on loop with 3-phase timed 
        narrative text transitions (3s, 3s, 5.5s).
      */}
      <HeroVideo />

      {/* 
        Below the hero video, transition into the 
        bright, premium Indian fashion e-commerce showcase.
      */}
      <div id="featured-content" className="bg-background pt-20 rounded-t-[40px] -mt-[30px] relative z-30 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        
        {/* 1. Explore Categories Grid */}
        <FeaturedCategories />
        
        {/* 2. New Arrivals Section */}
        <div id="new-arrivals">
          <ProductCarouselSection 
            title="NEW ARRIVALS" 
            subtitle="Fresh silhouettes. Timeless details." 
            viewAllLink="/shop?filter=new"
            products={newArrivals}
          />
        </div>

        {/* 3. Sarees Spotlight Banner + Carousel */}
        <div id="sarees">
          <SareeFeature />
          <ProductCarouselSection 
            title="HANDCRAFTED SAREES" 
            subtitle="Pure Banarasi, Chanderi, and Tissue Silk drapes." 
            viewAllLink="/category/sarees"
            products={sareesProducts}
          />
        </div>

        {/* 4. Women's Wear Section */}
        <div id="women">
          <ProductCarouselSection 
            title="WOMEN'S EDIT" 
            subtitle="Flowing kurtas, shararas, and everyday grace." 
            viewAllLink="/category/women"
            products={womenProducts}
          />
        </div>

        {/* 5. Dresses Section */}
        <div id="dresses">
          <ProductCarouselSection 
            title="CONTEMPORARY DRESSES" 
            subtitle="Modern silhouettes cut from breathable luxury textiles." 
            viewAllLink="/category/dresses"
            products={dressesProducts}
          />
        </div>

        {/* 6. Editorial Feature + Ethnic Wear Section */}
        <div id="ethnic-wear">
          <EditorialSplit />
          <ProductCarouselSection 
            title="FESTIVE ETHNIC WEAR" 
            subtitle="Celebration-ready lehengas, anarkalis, and artisanal sets." 
            viewAllLink="/category/ethnic"
            products={ethnicProducts}
          />
        </div>

        {/* 7. Baby & Kids Section */}
        <div id="kids">
          <BabyFeature />
          <ProductCarouselSection 
            title="BABY & KIDS" 
            subtitle="Gentle organic fabrics and festive outfits crafted with pure love." 
            viewAllLink="/category/kids"
            products={kidsProducts}
          />
        </div>

        {/* 8. Collections Grid */}
        <div id="collections">
          <CollectionGrid />
        </div>

        {/* Brand Heritage, Social, & Newsletter */}
        <BrandStory />
        <SocialGallery />
        <Newsletter />
      </div>
    </div>
  );
};

export default Home;
