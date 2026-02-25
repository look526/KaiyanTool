import React from 'react';
import BentoCard, { BentoCardProps } from './BentoCard';

type BentoCardLargeProps = Omit<BentoCardProps, 'size'>;

export function BentoCardLarge(props: BentoCardLargeProps) {
  return <BentoCard {...props} size="large" />;
}

export default BentoCardLarge;
