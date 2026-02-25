import { useState } from 'react';
import { Edit2, Trash2, Plus, Search, Box, Shirt, Wand } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/Badge';
import { Item } from '../../types/item.types';

interface ItemCardProps {
  item: Item;
  onEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
}

export function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const typeIcon = {
    prop: Box,
    clothing: Shirt,
    accessory: Wand,
  };

  const typeColor = {
    prop: 'bg-blue-500/20',
    clothing: 'bg-purple-500/20',
    accessory: 'bg-pink-500/20',
  };

  const Icon = typeIcon[item.type as keyof typeof typeIcon];

  return (
    <Card 
      className="group relative overflow-hidden"
      hoverable
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {item.image ? (
        <div className="aspect-video bg-slate-800">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="aspect-video bg-slate-800 flex items-center justify-center">
          <Icon className="w-16 h-16 text-slate-500" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-100 group-hover:text-accent transition-colors duration-200">
            {item.name}
          </h3>
          <Badge variant="secondary">
            {item.type}
          </Badge>
        </div>

        {item.description && (
          <p className="text-sm text-slate-400 line-clamp-2 mb-4">
            {item.description}
          </p>
        )}

        {item.scenes && item.scenes.length > 0 && (
          <div className="flex gap-2 mb-4">
            <span className="text-xs text-slate-500">关联场景：</span>
            {item.scenes.slice(0, 3).map((scene, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300"
              >
                {scene}
              </span>
            ))}
            {item.scenes.length > 3 && (
              <span className="text-xs text-slate-500">+{item.scenes.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(item)}
            className="flex-1"
          >
            <Edit2 className="w-4 h-4" />
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(item)}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </Button>
        </div>
      </div>

      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-t from-accent/20 to-transparent pointer-events-none" />
      )}
    </Card>
  );
}
