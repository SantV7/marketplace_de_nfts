import brownNft from '@/assets/img/nfts/brown_nft.png';
import cosmicBloom from '@/assets/img/nfts/cosmic_bloom.png';
import emeraldApe from '@/assets/img/nfts/esmeral_ape.png';
import goldenBeat from '@/assets/img/nfts/golden_beat.png';

export interface Nft {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  network: string;
  isNew?: boolean;
  isTrending?: boolean;
  previousPrice?: string;
}

export const nfts: Nft[] = [
  {
    id: 42,
    name: 'Emerald Ape',
    price: 1.19,
    image: emeraldApe,
    category: 'Arte digital',
    network: 'Ethereum',
    isNew: true,
  },
  {
    id: 9,
    name: 'Sage Nomad',
    price: 1.69,
    image: cosmicBloom,
    category: 'Arte digital',
    network: 'Ethereum',
    isTrending: true,
  },
  {
    id: 552,
    name: 'Neon Vessel',
    price: 1.99,
    image: brownNft,
    category: 'Arte 3D',
    network: 'Polygon',
    previousPrice: '2.29',
    isNew: true,
  },
  {
    id: 118,
    name: 'Cosmic Bloom',
    price: 1.29,
    image: cosmicBloom,
    category: 'Colecionáveis',
    network: 'Ethereum',
  },
  {
    id: 314,
    name: 'Violet Nomad',
    price: 1.39,
    image: cosmicBloom,
    category: 'Arte digital',
    network: 'Solana',
    isTrending: true,
  },
  {
    id: 88,
    name: 'Ivory Baron',
    price: 1.79,
    image: brownNft,
    category: 'Fotografia',
    network: 'Polygon',
  },
  {
    id: 207,
    name: 'Golden Beat',
    price: 0.99,
    image: goldenBeat,
    category: 'Música',
    network: 'Solana',
    isNew: true,
  },
  {
    id: 160,
    name: 'Golden Signal',
    price: 0.39,
    image: goldenBeat,
    category: 'Música',
    network: 'Ethereum',
    isTrending: true,
  },
  {
    id: 73,
    name: 'Golden Hour',
    price: 0.79,
    image: goldenBeat,
    category: 'Generativa',
    network: 'Polygon',
  },
];

const categoryNames = [
  'Arte digital',
  'Fotografia',
  'Música',
  'Arte 3D',
  'Colecionáveis',
  'Generativa',
  'Jogos',
  'Assinaturas',
  'Utilidade',
];

export const categories = categoryNames.map((name) => ({
  name,
  count: nfts.filter((nft) => nft.category === name).length,
}));

const networkNames = ['Ethereum', 'Polygon', 'Solana'];

export const networks = networkNames.map((name) => ({
  name,
  count: nfts.filter((nft) => nft.network === name).length,
}));

export const tabs = [
  { id: 'all', label: 'Todos os NFTs' },
  { id: 'new', label: 'Novos lançamentos' },
  { id: 'trending', label: 'Em alta' },
] as const;

export type TabId = (typeof tabs)[number]['id'];
export type SortOrder = 'recent' | 'price-asc' | 'price-desc';

export const initialPriceRange = { min: 0.02, max: 12.3 };