export interface MentionItem {
  id: string;
  type: 'character' | 'item' | 'scene' | 'asset';
  name: string;
  icon: string;
}
