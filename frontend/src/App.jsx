import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { QuickViewProvider } from './context/QuickViewContext';
import { CompareProvider } from './context/CompareContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ThemeSwitcher from './components/common/ThemeSwitcher';
import ScrollToTop from './components/common/ScrollToTop';
import CartDrawer from './components/cart/CartDrawer';
import WishlistDrawer from './components/wishlist/WishlistDrawer';
import QuickViewModal from './components/product/QuickViewModal';
import CompareWidget from './components/compare/CompareWidget';

import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Compare from './pages/Compare';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Auth/Profile';

import Contact from './pages/Info/Contact';
import Shipping from './pages/Info/Shipping';
import Returns from './pages/Info/Returns';
import FAQ from './pages/Info/FAQ';
import About from './pages/Info/About';
import Sustainability from './pages/Info/Sustainability';
import Terms from './pages/Info/Terms';
import Privacy from './pages/Info/Privacy';

function AppLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col font-sans text-text bg-background selection:bg-accent selection:text-background transition-colors duration-300">
      {/* Route scroll reset & floating back-to-top button */}
      <ScrollToTop />

      {/* Unified Navbar which includes AnnouncementBar on top */}
      <Navbar />

      {/* Main page content: Home starts at 0 for cinematic scrollytelling; other pages offset by header height */}
      <main className={`flex-grow ${isHome ? 'pt-0' : 'pt-[115px]'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/category/:categoryName" element={<Shop />} />
          <Route path="/collections" element={<Shop />} />
          <Route path="/new-arrivals" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<Orders />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profile" element={<Profile />} />

          {/* Help Pages */}
          <Route path="/contact" element={<Contact />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/faq" element={<FAQ />} />

          {/* Company Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/sustainability" element={<Sustainability />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </main>

      <Footer />
      <ThemeSwitcher />

      {/* Global Drawers & Modals */}
      <CartDrawer />
      <WishlistDrawer />
      <QuickViewModal />
      <CompareWidget />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <QuickViewProvider>
              <CompareProvider>
                <Router>
                  <AppLayout />
                </Router>
              </CompareProvider>
            </QuickViewProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
