import React from 'react';
import { HeroSection } from '../sections/HeroSection';
import { BrandHighlightsMarquee } from '../components/BrandHighlightsMarquee';
import { AboutSection } from '../sections/AboutSection';
import { CategoriesSection } from '../sections/CategoriesSection';
import { FeaturedProductsSection } from '../sections/FeaturedProductsSection';
import { WhyChooseSection } from '../sections/WhyChooseSection';
import { AppShowcaseSection } from '../sections/AppShowcaseSection';
import { HowItWorksSection } from '../sections/HowItWorksSection';
import { CustomerSupportSection } from '../sections/CustomerSupportSection';
import { FAQSection } from '../sections/FAQSection';
import { Product } from '../types';
import { useSmoothScroll } from '../providers/SmoothScrollProvider';

interface HomePageProps {
  flagshipProduct: Product;
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onSelectProduct: (product: Product) => void;
  onOrderApp: (product: Product) => void;
  onOpenAppModal: (productId?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  flagshipProduct,
  products,
  selectedCategory,
  onSelectCategory,
  onSelectProduct,
  onOrderApp,
  onOpenAppModal,
}) => {
  const { scrollTo } = useSmoothScroll();

  const handleExploreProducts = () => {
    scrollTo('#products', { offset: -80 });
  };

  const handleSelectCat = (catId: string) => {
    onSelectCategory(catId);
    scrollTo('#products', { offset: -80 });
  };

  return (
    <>
      {/* 1. Hero Section */}
      <HeroSection
        flagshipProduct={flagshipProduct}
        onOpenAppModal={() => onOpenAppModal()}
        onExploreProducts={handleExploreProducts}
        onSelectProduct={onSelectProduct}
      />

      {/* 1b. Infinite Brand Highlights Marquee */}
      <BrandHighlightsMarquee />

      {/* 2. About Water Shell */}
      <AboutSection
        onOpenAppModal={() => onOpenAppModal()}
        onExploreProducts={handleExploreProducts}
      />

      {/* 3. Product Categories */}
      <CategoriesSection onSelectCategory={handleSelectCat} />

      {/* 4. Featured Products Catalog */}
      <FeaturedProductsSection
        products={products}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
        onSelectProduct={onSelectProduct}
        onOrderApp={onOrderApp}
      />

      {/* 5. Why Choose Water Shell */}
      <WhyChooseSection />

      {/* 6. Water Shell Mobile App Showcase */}
      <AppShowcaseSection onOpenAppModal={() => onOpenAppModal()} />

      {/* 7. How It Works */}
      <HowItWorksSection
        onExploreProducts={handleExploreProducts}
        onOpenAppModal={() => onOpenAppModal()}
      />

      {/* 8. Customer Support & Physical Branches */}
      <CustomerSupportSection />

      {/* 9. Frequently Asked Questions */}
      <FAQSection onOpenAppModal={() => onOpenAppModal()} />
    </>
  );
};

