import React from 'react';
import { FOOD_CATEGORIES, type FoodCategoryKey } from '@/constants/food_categories';
import { Icon } from '@/components/Icon';

export type FoodCategoryIconProps = {
  category: FoodCategoryKey;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  ariaLabelOverride?: string;
  fallbackEmoji?: string;
};

export default function FoodCategoryIcon({
  category,
  size = 18,
  className,
  style,
  ariaLabelOverride,
}: FoodCategoryIconProps) {
  const meta = FOOD_CATEGORIES[category];

  return (
    <Icon
      src={meta.iconSrc}
      alt={ariaLabelOverride ?? meta.label}
      size={size}
      className={className}
      style={style}
    />
  );
}
