export interface Item {
  id: string;
  projectId: string;
  name: string;
  type: 'prop' | 'clothing' | 'accessory';
  image?: string;
  description?: string;
  prompt?: string;
  scenes?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ItemType {
  id: string;
  name: string;
  icon: string;
}

export const ITEM_TYPES: ItemType[] = [
  { id: 'all', name: '全部', icon: 'Package' },
  { id: 'prop', name: '道具', icon: 'Box' },
  { id: 'clothing', name: '服装', icon: 'Shirt' },
  { id: 'accessory', name: '配饰', icon: 'Wand' },
];
