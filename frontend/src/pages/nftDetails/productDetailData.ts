import type { Review } from '@/services/contracts';

export interface NftDetail {
  reviews: Review[];
  id: string;
  name: string;
  price: string;
  rating: number;
  description: string;
  editions: string[];
  tokenId: string;
  collection: string;
  attributes: string[];
  thumbnails: string[];
  contractAddress: string;
  blockchain: string;
  royalty: string;
}
