import React from 'react';
import BentoCard, { BentoCardProps } from './BentoCard';

type BentoCardSmallProps = Omit<BentoCardProps, 'size'>;

export function BentoCardSmall(props: BentoCardSmallProps) {
  return <BentoCard {...props} size="small" />;
}

export default BentoCardSmall;
