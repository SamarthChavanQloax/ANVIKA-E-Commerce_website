import { RevealOnScroll } from '../animations/RevealOnScroll';
import ProductCard from '../product/ProductCard';
import Button from '../common/Button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockProducts = [
  { _id: '1', name: 'Rosewood Banarasi Silk Saree', price: 12500, originalPrice: 15000, category: 'Sarees', image: '/demo-saree.jpg', isNew: true, discount: 16 },
  { _id: '2', name: 'Moonlight Chanderi Saree', price: 8900, category: 'Sarees', image: '/demo-saree.jpg' },
  { _id: '3', name: 'Mehfil Embroidered Anarkali', price: 15000, category: 'Women\'s Wear', image: '/demo-saree.jpg', isBestseller: true },
  { _id: '4', name: 'Little Bloom Cotton Dress', price: 2500, category: 'Baby & Kids', image: '/demo-saree.jpg' },
];

const ProductCarouselSection = ({ 
  title = "NEW ARRIVALS", 
  subtitle = "Fresh silhouettes. Timeless details.",
  viewAllLink = "/shop?filter=new",
  products = mockProducts
}) => {
  // TODO: Implement Axios fetch logic when MongoDB is running
  // const [products, setProducts] = useState([]);
  // useEffect(() => { axios.get('/api/products?isNew=true').then(res => setProducts(res.data)) }, [])
  
  const productsToDisplay = products && products.length > 0 ? products : mockProducts;

  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-12 max-w-[90rem] mx-auto">
      <RevealOnScroll>
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-text font-light mb-3 tracking-wide">{title}</h2>
            <p className="text-text-muted text-sm tracking-wide">{subtitle}</p>
          </div>
          <Link to={viewAllLink} className="hidden md:inline-flex mt-4 group text-xs font-medium tracking-[0.15em] uppercase text-text hover:text-accent transition-colors items-center gap-2">
            VIEW ALL <ArrowRight size={14} className="transform transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </RevealOnScroll>

      {/* Grid for Desktop, scrollable flex for mobile */}
      <div className="flex overflow-x-auto md:grid md:grid-cols-4 gap-4 md:gap-6 pb-8 md:pb-0 snap-x snap-mandatory hide-scrollbar">
        {productsToDisplay.map((product, idx) => (
          <div key={product._id} className="min-w-[70vw] sm:min-w-[45vw] md:min-w-0 snap-center">
            <RevealOnScroll delay={idx * 0.1}>
              <ProductCard product={product} />
            </RevealOnScroll>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center md:hidden">
        <Link to={viewAllLink}>
          <Button variant="outline" className="w-full">VIEW ALL</Button>
        </Link>
      </div>
    </section>
  );
};

export default ProductCarouselSection;
