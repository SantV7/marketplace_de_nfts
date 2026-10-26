import type { Nft } from '@/services/contracts';

export type { Nft };

export const tabs = [
  { id: 'all', label: 'Todos os NFTs' },
  { id: 'new', label: 'Novos lançamentos' },
  { id: 'trending', label: 'Em alta' },
] as const;

export type TabId = (typeof tabs)[number]['id'];
export type SortOrder = 'recent' | 'price-asc' | 'price-desc';

export const initialPriceRange = { min: 0.02, max: 12.3 };
