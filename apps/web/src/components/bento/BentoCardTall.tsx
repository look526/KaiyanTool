import React from 'react';
import BentoCard, { BentoCardProps } from './BentoCard';

type BentoCardTallProps = Omit<BentoCardProps, 'size'>;

export function BentoCardTall(props: BentoCardTallProps) {
  return <BentoCard {...props} size="tall" />;
}

export default BentoCardTall;
