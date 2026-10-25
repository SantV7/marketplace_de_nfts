export const mockNfts = [
  {
    id: 42,
    name: 'Emerald Ape',
    price: 1.19,
    category: 'Arte digital',
    network: 'Ethereum',
    image: '/src/assets/img/nfts/cosmic_bloom.png',
    isNew: true,
    isTrending: false,
    description: 'Um colecionável digital finalizado à mão...',
    editions: ['1/1', '1/10', '1/50'],
    blockchain: 'Ethereum',
    royalty: '5%',
    contractAddress: '0x7A42...19E8',
    attributes: ['Óculos', 'Esmeralda', 'Raro'],
    thumbnails: ['/src/assets/img/nfts/cosmic_bloom.png']
  },
];

export let mockCartItems = [
  { id: 1, nftId: 42, name: 'Emerald Ape', price: 1.19, quantity: 2, edition: '1/50', image: '/src/assets/img/nfts/cosmic_bloom.png' }
];

export let mockUser = {
  id: 'usr_1',
  email: 'contato@email.com',
  name: 'Vinícius',
  username: 'santv7'
};