export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryId: string;
  description: string;
  price: number;
  imageUrl: string;
  gallery: string[];
  stockStatus: string;
  specifications: ProductSpecification[];
  active: boolean;
}

export interface ProductCategoryItem {
  id: string;
  name: string;
  shortName: string;
  description: string;
  iconName: string;
  badge: string;
  itemCount: number;
  sampleProduct: string;
  image: string;
  highlights: string[];
}

export interface SupportContact {
  id: string;
  title: string;
  phone: string;
  dialPhone: string;
  whatsapp?: string;
  role: string;
  hours: string;
  badge: string;
  isMainHub?: boolean;
  address?: string;
  landmark?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'products' | 'app' | 'delivery' | 'service';
}

