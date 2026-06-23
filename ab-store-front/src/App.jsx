import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Hero from './components/layout/Hero';
import InfoSection from './components/layout/InfoSection';
import Categories from './components/layout/Categories';
import Featured from './components/home/Featured';
import Feedback from './components/home/Feedback';
import Footer from './components/layout/Footer';
import BackToTop from './components/layout/BackToTop';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Admin from './pages/Admin';
import { About, Contact, NotFound } from './pages/StaticPages';

function Home() {
  return (
    <>
      <Hero />
      <InfoSection />
      <Categories />
      <Featured />
      <Feedback />
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/Catalog" element={<Navigate to="/catalog" replace />} />
        <Route path="/shop" element={<Navigate to="/catalog" replace />} />
        <Route path="/products" element={<Navigate to="/catalog" replace />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdmin && <Footer />}
      {!isAdmin && <BackToTop />}
    </>
  );
}

export default App;
