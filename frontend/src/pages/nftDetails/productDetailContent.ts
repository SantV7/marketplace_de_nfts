import cosmicBloom from '@/assets/img/nfts/cosmic_bloom.png';
import brownNft from '@/assets/img/nfts/brown_nft.png';
import goldenBeat from '@/assets/img/nfts/golden_beat.png';

export const relatedNfts = [
  { id: '118', name: 'Cosmic Bloom', price: '1.29', image: cosmicBloom },
  { id: '314', name: 'Violet Nomad', price: '1.39', image: cosmicBloom },
  { id: '088', name: 'Ivory Baron', price: '1.79', image: brownNft },
  { id: '207', name: 'Golden Beat', price: '0.99', image: goldenBeat },
  { id: '160', name: 'Golden Signal', price: '0.39', image: goldenBeat },
  { id: '073', name: 'Golden Hour', price: '0.79', image: goldenBeat },
  { id: '224', name: 'Solar Drift', price: '1.49', image: cosmicBloom },
  { id: '305', name: 'Violet Horizon', price: '1.59', image: cosmicBloom },
  { id: '416', name: 'Obsidian Crown', price: '2.09', image: brownNft },
  { id: '528', name: 'Amber Pulse', price: '0.89', image: goldenBeat },
  { id: '639', name: 'Echoes of Dawn', price: '1.09', image: goldenBeat },
  { id: '741', name: 'Emerald Guardian', price: '2.49', image: brownNft },
  { id: '852', name: 'Lunar Muse', price: '1.89', image: cosmicBloom },
  { id: '963', name: 'Midnight Muse', price: '1.69', image: brownNft },
  { id: '174', name: 'Golden Reverie', price: '1.29', image: goldenBeat },
];

export const collectorReviews = [
  {
    name: 'Marina Costa',
    date: '12 out, 2026',
    comment: 'A arte tem muitos detalhes de perto. A esmeralda e os óculos ficaram incríveis nessa edição.',
  },
  {
    name: 'Lucas Almeida',
    date: '08 out, 2026',
    comment: 'Uma das peças mais marcantes da coleção. Gostei bastante da paleta de cores e do acabamento.',
  },
  {
    name: 'Rafaela Santos',
    date: '01 out, 2026',
    comment: 'Ótimo NFT para quem acompanha a Kurio Editions. A imagem em alta resolução faz diferença.',
  },
];

export const totalReviews = collectorReviews.length;

export const nftStyles = [
  { id: 'normal', label: 'Normal', filter: 'none' },
  { id: 'platinum', label: 'Platinada', filter: 'grayscale(100%) brightness(1.2)' },
  { id: 'gold', label: 'Dourada', filter: 'sepia(100%) hue-rotate(-30deg) saturate(250%)' },
  { id: 'saturated', label: 'Saturada (+30%)', filter: 'saturate(130%)' },
];

export const availableQuantityByEdition: Record<string, number> = {
  '1/1': 1,
  '1/10': 10,
  '1/50': 50,
  ABERTA: 100,
};
