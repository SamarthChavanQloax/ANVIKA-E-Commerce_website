import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
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
import ForgotPassword from './pages/Auth/ForgotPassword';
import Profile from './pages/Auth/Profile';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';

import Contact from './pages/Info/Contact';
import Shipping from './pages/Info/Shipping';
import Returns from './pages/Info/Returns';
import FAQ from './pages/Info/FAQ';
import About from './pages/Info/About';
import Sustainability from './pages/Info/Sustainability';
import Terms from './pages/Info/Terms';
import Privacy from './pages/Info/Privacy';

// Admin Components & Pages
import AdminRoute from './components/admin/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/Admin/AdminLogin';
import Dashboard from './pages/Admin/Dashboard';
import ProductList from './pages/Admin/ProductList';
import ProductForm from './pages/Admin/ProductForm';
import CategoryList from './pages/Admin/CategoryList';
import Inventory from './pages/Admin/Inventory';
import OrderList from './pages/Admin/OrderList';
import CustomerList from './pages/Admin/CustomerList';
import CouponManagement from './pages/Admin/CouponManagement';
import Analytics from './pages/Admin/Analytics';
import Reports from './pages/Admin/Reports';

function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isHome = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password';

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="categories" element={<CategoryList />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="coupons" element={<CouponManagement />} />
            <Route path="reports" element={<Reports />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Route>
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-text bg-background selection:bg-accent selection:text-background transition-colors duration-300">
      {/* Route scroll reset & floating back-to-top button */}
      <ScrollToTop />

      {/* Unified Navbar which includes AnnouncementBar on top */}
      <Navbar />

      {/* Main page content: Home and Auth pages start at 0 for full-bleed cinematic video; other pages offset by header height */}
      <main className={`flex-grow ${isHome || isAuthPage ? 'pt-0' : 'pt-[115px]'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/category/:categoryName" element={<Shop />} />
          <Route path="/collections" element={<Shop />} />
          <Route path="/new-arrivals" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/order/:id" element={<OrderConfirmation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
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
        <ProductProvider>
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
        </ProductProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
