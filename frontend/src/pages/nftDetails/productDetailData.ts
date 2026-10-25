import emeraldApe from '@/assets/img/nfts/esmeral_ape.png';
import cosmicBloom from '@/assets/img/nfts/cosmic_bloom.png';
import brownNft from '@/assets/img/nfts/brown_nft.png';
import goldenBeat from '@/assets/img/nfts/golden_beat.png';

export interface NftDetail {
  id: string;
  name: string;
  price: number;
  rating: number;
  totalReviews: number;
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

const allNftsCatalog: Record<string, { name: string; image: string; price: number }> = {
  '42': { name: 'Emerald Ape', image: emeraldApe, price: 1.19 },
  '9': { name: 'Emerald Ape', image: emeraldApe, price: 1.19 },
  '6': { name: 'Emerald Ape', image: emeraldApe, price: 1.19 },
  '118': { name: 'Cosmic Bloom', image: cosmicBloom, price: 1.29 },
  '314': { name: 'Violet Nomad', image: cosmicBloom, price: 1.39 },
  '88': { name: 'Ivory Baron', image: brownNft, price: 1.79 },
  '207': { name: 'Golden Beat', image: goldenBeat, price: 0.99 },
  '160': { name: 'Golden Signal', image: goldenBeat, price: 0.39 },
  '552': { name: 'Neon Vessel', image: brownNft, price: 1.99 },
};

export const getNftDetailById = (id: string): NftDetail | null => {
  const found = allNftsCatalog[id];
  if (!found) return null;

  return {
    id,
    name: found.name,
    price: found.price,
    rating: 5,
    totalReviews: 19,
    description: `Um colecionável digital exclusivo da coleção Kurio Editions, verificado na Ethereum, com arte desbloqueável e acesso para colecionadores.`,
    editions: ['1/1', '1/10', '1/50', 'ABERTA'],
    tokenId: `#${String(id).padStart(3, '0')}`,
    collection: 'Kurio Editions',
    attributes: ['Arte Digital', 'Verificado', 'Raro'],
    thumbnails: [found.image, cosmicBloom, brownNft, goldenBeat],
    contractAddress: '0x7A42...19E8',
    blockchain: 'Ethereum',
    royalty: '5%',
  };
};