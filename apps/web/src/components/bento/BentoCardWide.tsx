import React from 'react';
import BentoCard, { BentoCardProps } from './BentoCard';

type BentoCardWideProps = Omit<BentoCardProps, 'size'>;

export function BentoCardWide(props: BentoCardWideProps) {
  return <BentoCard {...props} size="wide" />;
}

export default BentoCardWide;
