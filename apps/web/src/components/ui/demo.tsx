import {
  Bell,
  Calendar,
  FileText,
  Globe,
  Search,
} from 'lucide-react';

import { BentoCard, BentoGrid } from './bento-grid';

const features = [
  {
    Icon: FileText,
    name: 'Save your files',
    description: 'We automatically save your files as you type.',
    href: '/',
    cta: 'Learn more',
    background: (
      <img
        className="absolute -right-20 -top-20 opacity-60"
        src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80"
        alt="File saving"
      />
    ),
    className: 'lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3',
  },
  {
    Icon: Search,
    name: 'Full text search',
    description: 'Search through all your files in one place.',
    href: '/',
    cta: 'Learn more',
    background: (
      <img
        className="absolute -right-20 -top-20 opacity-60"
        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80"
        alt="Search"
      />
    ),
    className: 'lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3',
  },
  {
    Icon: Globe,
    name: 'Multilingual',
    description: 'Supports 100+ languages and counting.',
    href: '/',
    cta: 'Learn more',
    background: (
      <img
        className="absolute -right-20 -top-20 opacity-60"
        src="https://images.unsplash.com/photo-15267792570-926e4b56242f?w=400&q=80"
        alt="Multilingual"
      />
    ),
    className: 'lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4',
  },
  {
    Icon: Calendar,
    name: 'Calendar',
    description: 'Use the calendar to filter your files by date.',
    href: '/',
    cta: 'Learn more',
    background: (
      <img
        className="absolute -right-20 -top-20 opacity-60"
        src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&q=80"
        alt="Calendar"
      />
    ),
    className: 'lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2',
  },
  {
    Icon: Bell,
    name: 'Notifications',
    description: 'Get notified when someone shares a file or mentions you in a comment.',
    href: '/',
    cta: 'Learn more',
    background: (
      <img
        className="absolute -right-20 -top-20 opacity-60"
        src="https://images.unsplash.com/photo-1517483000871-88dbf607a3cb?w=400&q=80"
        alt="Notifications"
      />
    ),
    className: 'lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4',
  },
];

export function BentoDemo() {
  return (
    <BentoGrid className="lg:grid-rows-3">
      {features.map((feature) => (
        <BentoCard key={feature.name} {...feature} />
      ))}
    </BentoGrid>
  );
}
