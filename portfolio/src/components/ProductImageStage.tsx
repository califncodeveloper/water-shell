import React, { useState } from 'react';
import { getProductImageConfig, resolveProductImageSrc } from '../utils/productImageUtils';

export interface ProductImageStageProps {
  src: string;
  alt: string;
  categoryId?: string;
  productId?: string;
  variant?: 'card' | 'category' | 'spotlight' | 'modal' | 'thumb';
  className?: string;
  imageClassName?: string;
  children?: React.ReactNode;
  fallbackSrc?: string;
}

export const ProductImageStage: React.FC<ProductImageStageProps> = ({
  src,
  alt,
  categoryId,
  productId,
  variant = 'card',
  className = '',
  imageClassName = '',
  children,
  fallbackSrc = '/images/aqua-touch.jpg',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const config = getProductImageConfig(categoryId, productId, variant);
  const resolvedSrc = hasError
    ? fallbackSrc
    : resolveProductImageSrc(src, productId, hasError);

  // Variant-specific stage container heights & geometries
  const stageDimensions = {
    card: 'w-full h-60 sm:h-64',
    category: 'w-full h-60 sm:h-64',
    spotlight: 'w-full h-72 sm:h-84 lg:h-[380px]',
    modal: 'w-full h-64 sm:h-80',
    thumb: 'w-16 h-16',
  }[variant];

  return (
    <div
      className={`relative ${stageDimensions} bg-white flex items-center justify-center overflow-hidden select-none ${className}`}
    >
      {/* Soft studio stage backdrop with subtle light vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/40 via-white to-white pointer-events-none" />

      {/* Gentle grounded floor shadow beneath the product to convey realistic depth */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 w-3/5 h-3 bg-slate-200/40 rounded-full blur-md pointer-events-none transition-all duration-300 group-hover:w-4/6 group-hover:bg-slate-300/40"
        aria-hidden="true"
      />

      {/* Product Image Stage wrapper: centers image perfectly and manages scaling */}
      <div
        className={`relative z-10 w-full h-full flex items-center justify-center ${config.paddingClass}`}
      >
        <img
          src={resolvedSrc}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`max-h-full max-w-full w-auto h-auto object-contain transition-all duration-500 ease-out transform-gpu ${
            config.scaleClass
          } ${config.hoverScaleClass} ${config.shadowClass} ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${imageClassName}`}
        />
      </div>

      {/* Overlay Children (Badges, indicators, status pills) */}
      {children}
    </div>
  );
};

