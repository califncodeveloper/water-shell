import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AppDownloadModal } from './components/AppDownloadModal';
import { LegalModals, LegalModalType } from './components/LegalModals';
import { SmoothScrollProvider } from './providers/SmoothScrollProvider';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { TechnologyPage } from './pages/TechnologyPage';
import { WhyUsPage } from './pages/WhyUsPage';
import { AppShowcasePage } from './pages/AppShowcasePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { SupportPage } from './pages/SupportPage';
import { FAQPage } from './pages/FAQPage';
import { LegalPage } from './pages/LegalPage';
import { PRODUCTS } from './data/products';
import { Product } from './types';

export function AppContent() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAppModalOpen, setIsAppModalOpen] = useState<boolean>(false);
  const [targetProductId, setTargetProductId] = useState<string | undefined>(undefined);
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);

  // Flagship item for Hero Spotlight: Aqua Touch (AP-WP-061) or fallback to first item
  const flagshipProduct = PRODUCTS.find((p) => p.id === 'AP-WP-061') || PRODUCTS[0];

  const handleOpenAppModal = (productId?: string) => {
    setTargetProductId(productId);
    setIsAppModalOpen(true);
  };

  const handleCloseAppModal = () => {
    setIsAppModalOpen(false);
    setTargetProductId(undefined);
  };

  const handleOrderApp = (product: Product) => {
    handleOpenAppModal(product.id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-gray text-brand-navy antialiased">
      {/* Fixed Sticky Header Navigation */}
      <Navbar onOpenAppModal={() => handleOpenAppModal()} />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                flagshipProduct={flagshipProduct}
                products={PRODUCTS}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onSelectProduct={(prod) => setSelectedProduct(prod)}
                onOrderApp={handleOrderApp}
                onOpenAppModal={handleOpenAppModal}
              />
            }
          />
          <Route
            path="/products"
            element={
              <ProductsPage
                products={PRODUCTS}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onSelectProduct={(prod) => setSelectedProduct(prod)}
                onOrderApp={handleOrderApp}
              />
            }
          />
          <Route
            path="/categories"
            element={<CategoriesPage onSelectCategory={setSelectedCategory} />}
          />
          <Route
            path="/technology"
            element={<TechnologyPage onOpenAppModal={() => handleOpenAppModal()} />}
          />
          <Route
            path="/about"
            element={<TechnologyPage onOpenAppModal={() => handleOpenAppModal()} />}
          />
          <Route path="/why-us" element={<WhyUsPage />} />
          <Route
            path="/app"
            element={<AppShowcasePage onOpenAppModal={() => handleOpenAppModal()} />}
          />
          <Route
            path="/how-it-works"
            element={<HowItWorksPage onOpenAppModal={() => handleOpenAppModal()} />}
          />
          <Route path="/support" element={<SupportPage />} />
          <Route
            path="/faqs"
            element={<FAQPage onOpenAppModal={() => handleOpenAppModal()} />}
          />
          <Route
            path="/privacy-policy"
            element={<LegalPage type="privacy" />}
          />
          <Route
            path="/terms"
            element={<LegalPage type="terms" />}
          />
          <Route
            path="/warranty"
            element={<LegalPage type="delivery" />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer
        onOpenAppModal={() => handleOpenAppModal()}
        onOpenLegalModal={(type) => setLegalModalType(type)}
        onSelectCategory={setSelectedCategory}
      />

      {/* Interactive Modals with Smooth AnimatePresence Transitions */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onOpenApp={(productId) => {
              setSelectedProduct(null);
              handleOpenAppModal(productId);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAppModalOpen && (
          <AppDownloadModal
            isOpen={isAppModalOpen}
            onClose={handleCloseAppModal}
            targetProductId={targetProductId}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {legalModalType && (
          <LegalModals
            type={legalModalType}
            onClose={() => setLegalModalType(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <SmoothScrollProvider>
        <AppContent />
      </SmoothScrollProvider>
    </BrowserRouter>
  );
}

export default App;
