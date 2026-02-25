import React from 'react';
import BentoCard, { BentoCardProps } from './BentoCard';

type BentoCardMediumProps = Omit<BentoCardProps, 'size'>;

export function BentoCardMedium(props: BentoCardMediumProps) {
  return <BentoCard {...props} size="medium" />;
}

export default BentoCardMedium;
