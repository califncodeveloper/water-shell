/**
 * AquaPure — Product Card Component
 * Conforms to DESIGN.md §5 Reusable Component Library & §5.4 Product Card
 * Fully dynamic light and dark mode styling.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Product } from '@/types';
import { useTheme, spacing, radius, typography } from '@/theme';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuthStore } from '@/stores/authStore';
import { PricingService } from '@/services/pricingService';

// Local bundled images for official catalog additions (Aqua Touch etc.)
const LOCAL_CATALOG_IMAGES: Record<string, any> = {
  'AP-WP-061': require('../../assets/images/aqua-touch.jpg'),
  'aqua-touch': require('../../assets/images/aqua-touch.jpg'),
};

interface ProductCardProps {
  product: Product;
  isDealer?: boolean;
  onAddToCart?: (product: Product) => void;
  horizontal?: boolean;
}

export function ProductCard({
  product,
  isDealer,
  onAddToCart,
  horizontal = false,
}: ProductCardProps) {
  const { colors, isDark } = useTheme();
  const [imageError, setImageError] = useState(false);
  const { user, isDealerApproved: authIsDealerApproved, setPendingAction } = useAuthStore();

  const handlePress = () => {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id },
    });
  };

  // Resolve dealer pricing: explicit prop overrides or falls back to reactive auth store
  const effectiveIsDealer = isDealer !== undefined ? isDealer : authIsDealerApproved;
  const pricing = PricingService.getProductPricing(product, effectiveIsDealer);

  const categoryDisplay = (
    product?.category ||
    product?.categoryId?.replace(/-/g, ' ') ||
    'PRODUCTS'
  ).toUpperCase();

  const localImg = LOCAL_CATALOG_IMAGES[product.id] || LOCAL_CATALOG_IMAGES[product.slug];

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowOpacity: isDark ? 0.35 : 0.05,
        },
        horizontal && styles.cardHorizontal,
      ]}
      onPress={handlePress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, price ${pricing.formattedPrice}`}
    >
      {/* Product Image */}
      <View
        style={[
          styles.imageContainer,
          { backgroundColor: colors.surfaceMuted },
          horizontal && styles.imageContainerHorizontal,
        ]}
      >
        {!imageError && product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : localImg ? (
          <Image
            source={localImg}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholderContainer, { backgroundColor: colors.surfaceMuted }]}>
            <Ionicons name="water-outline" size={36} color={colors.textSecondary} />
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>Image unavailable</Text>
          </View>
        )}
        {product.stockStatus === 'limited' && (
          <View style={styles.badgeOverlay}>
            <StatusBadge variant="warning" label="Limited" />
          </View>
        )}
        {product.stockStatus === 'out_of_stock' && (
          <View style={styles.badgeOverlay}>
            <StatusBadge variant="error" label="Sold Out" />
          </View>
        )}
      </View>

      {/* Product Details */}
      <View style={[styles.content, horizontal && styles.contentHorizontal]}>
        <View style={styles.headerInfo}>
          <Text style={[styles.categoryName, { color: colors.textSecondary }]} numberOfLines={1}>
            {categoryDisplay}
          </Text>
          <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
            {product.name}
          </Text>
        </View>

        <View style={styles.footerInfo}>
          {/* Pricing — exclusive dealer pricing hides retail MRP completely */}
          <View style={styles.priceRow}>
            <Text style={[styles.customerPrice, { color: isDark ? colors.accent : colors.primary }]}>
              {pricing.formattedPrice}
            </Text>
            {pricing.isDealerActive && (
              <View style={[styles.dealerPricePill, { backgroundColor: colors.surfaceMuted }]}>
                <Text style={[styles.dealerPriceText, { color: colors.secondary }]}>
                  {pricing.wholesaleBadgeText || 'Dealer Wholesale'}
                </Text>
              </View>
            )}
          </View>

          {/* Action Button */}
          {onAddToCart && product.stockStatus !== 'out_of_stock' && (
            <TouchableOpacity
              style={[styles.cartButton, { backgroundColor: colors.accent }]}
              onPress={(e) => {
                e.stopPropagation();
                if (!user) {
                  Alert.alert(
                    'Sign In Required',
                    'Please sign in to add this item to your cart.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Sign In',
                        onPress: () => {
                          setPendingAction({
                            type: 'ADD_TO_CART',
                            product,
                            quantity: 1,
                            returnUrl: `/product/${product.id}`,
                          });
                          router.push('/auth/login');
                        },
                      },
                    ]
                  );
                  return;
                }
                onAddToCart(product);
              }}
              activeOpacity={0.8}
              accessibilityLabel={`Add ${product.name} to cart`}
            >
              <Ionicons name="cart-outline" size={16} color="#1B1F5E" />
              <Text style={[styles.cartButtonText, { color: '#1B1F5E' }]}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardHorizontal: {
    flexDirection: 'row',
    width: 280,
    flex: 0,
    marginRight: spacing.md,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
  },
  imageContainerHorizontal: {
    width: 110,
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
  },
  content: {
    padding: spacing.md,
    flex: 1,
    justifyContent: 'space-between',
  },
  contentHorizontal: {
    flex: 1,
    justifyContent: 'center',
  },
  headerInfo: {
    gap: 4,
  },
  footerInfo: {
    marginTop: spacing.sm,
  },
  categoryName: {
    ...typography.labelSmall,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  productName: {
    ...typography.heading3,
    fontSize: 14,
    minHeight: 38,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginTop: spacing.xs,
    flexWrap: 'wrap',
  },
  customerPrice: {
    ...typography.heading2,
    fontSize: 16,
    fontWeight: '700',
  },
  dealerPricePill: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  dealerPriceText: {
    ...typography.labelSmall,
    fontWeight: '700',
    fontSize: 11,
  },
  cartButton: {
    backgroundColor: '#F5A623',
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  cartButtonText: {
    ...typography.labelSmall,
    color: '#1B1F5E',
    fontWeight: '700',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  placeholderText: {
    ...typography.labelSmall,
    fontSize: 10,
  },
});
