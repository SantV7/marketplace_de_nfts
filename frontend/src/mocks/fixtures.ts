import brownNft from '@/assets/img/nfts/brown_nft.png';
import cosmicBloom from '@/assets/img/nfts/cosmic_bloom.png';
import emeraldApe from '@/assets/img/nfts/esmeral_ape.png';
import goldenBeat from '@/assets/img/nfts/golden_beat.png';
import type { Nft } from '@/services/contracts';

export const mockNfts: Nft[] = [
  { id: 42, name: 'Emerald Ape', price: '1.19', image: emeraldApe, category: 'Arte digital', network: 'Ethereum', isNew: true, isTrending: false, previousPrice: undefined, edition: '1/50', available: 50, description: 'Um colecionável digital finalizado à mão da coleção Kurio Editions, verificado na Ethereum.', editions: [{ name: '1/1', available: 1 }, { name: '1/10', available: 10 }, { name: '1/50', available: 50 }, { name: 'ABERTA', available: 100 }], rating: 5, tokenId: '042', collection: 'Kurio Editions', attributes: ['Arte Digital', 'Verificado', 'Raro'], thumbnails: [emeraldApe, cosmicBloom, brownNft, goldenBeat], contractAddress: '0x7A42...19E8', blockchain: 'Ethereum', royalty: '5%' },
  { id: 9, name: 'Sage Nomad', price: '1.69', image: cosmicBloom, category: 'Arte digital', network: 'Ethereum', isNew: false, isTrending: true, previousPrice: undefined, edition: '1/50', available: 30 },
  { id: 552, name: 'Neon Vessel', price: '1.99', image: brownNft, category: 'Arte 3D', network: 'Polygon', isNew: true, isTrending: false, previousPrice: '2.29', edition: '1/50', available: 12 },
  { id: 118, name: 'Cosmic Bloom', price: '1.29', image: cosmicBloom, category: 'Colecionáveis', network: 'Ethereum', isNew: false, isTrending: false, previousPrice: undefined, edition: '1/50', available: 50 },
  { id: 314, name: 'Violet Nomad', price: '1.39', image: cosmicBloom, category: 'Arte digital', network: 'Solana', isNew: false, isTrending: true, previousPrice: undefined, edition: '1/50', available: 25 },
  { id: 88, name: 'Ivory Baron', price: '1.79', image: brownNft, category: 'Fotografia', network: 'Polygon', isNew: false, isTrending: false, previousPrice: undefined, edition: '1/50', available: 20 },
  { id: 207, name: 'Golden Beat', price: '0.99', image: goldenBeat, category: 'Música', network: 'Solana', isNew: true, isTrending: false, previousPrice: undefined, edition: '1/50', available: 40 },
  { id: 160, name: 'Golden Signal', price: '0.39', image: goldenBeat, category: 'Música', network: 'Ethereum', isNew: false, isTrending: true, previousPrice: undefined, edition: '1/50', available: 45 },
  { id: 73, name: 'Golden Hour', price: '0.79', image: goldenBeat, category: 'Generativa', network: 'Polygon', isNew: false, isTrending: false, previousPrice: undefined, edition: '1/50', available: 50 },
  { id: 224, name: 'Solar Drift', price: '1.49', image: cosmicBloom, category: 'Generativa', network: 'Ethereum', isNew: true, isTrending: false, previousPrice: undefined, edition: '1/50', available: 18 },
  { id: 305, name: 'Violet Horizon', price: '1.59', image: cosmicBloom, category: 'Arte digital', network: 'Solana', isNew: false, isTrending: true, previousPrice: undefined, edition: '1/50', available: 15 },
  { id: 416, name: 'Obsidian Crown', price: '2.09', image: brownNft, category: 'Arte 3D', network: 'Polygon', isNew: false, isTrending: false, previousPrice: undefined, edition: '1/50', available: 10 },
  { id: 528, name: 'Amber Pulse', price: '0.89', image: goldenBeat, category: 'Música', network: 'Ethereum', isNew: true, isTrending: false, previousPrice: undefined, edition: '1/50', available: 32 },
  { id: 639, name: 'Echoes of Dawn', price: '1.09', image: goldenBeat, category: 'Música', network: 'Solana', isNew: false, isTrending: false, previousPrice: undefined, edition: '1/50', available: 27 },
  { id: 741, name: 'Emerald Guardian', price: '2.49', image: brownNft, category: 'Colecionáveis', network: 'Polygon', isNew: false, isTrending: true, previousPrice: undefined, edition: '1/50', available: 8 },
  { id: 852, name: 'Lunar Muse', price: '1.89', image: cosmicBloom, category: 'Fotografia', network: 'Ethereum', isNew: false, isTrending: false, previousPrice: undefined, edition: '1/50', available: 22 },
  { id: 963, name: 'Midnight Muse', price: '1.69', image: brownNft, category: 'Arte digital', network: 'Solana', isNew: true, isTrending: false, previousPrice: undefined, edition: '1/50', available: 13 },
  { id: 174, name: 'Golden Reverie', price: '1.29', image: goldenBeat, category: 'Generativa', network: 'Polygon', isNew: false, isTrending: false, previousPrice: undefined, edition: '1/50', available: 19 },
];
const defaultNfts = mockNfts.map((nft) => ({ ...nft }));

export interface MockUser { id: string; email: string; password?: string; passwordHash?: string; name: string; username: string }

export const mockUsers: MockUser[] = [
  { id: 'usr_1', email: 'contato@email.com', password: 'Kurio123', name: 'Vinícius', username: 'santv7' },
  { id: 'usr_2', email: 'colecionador@email.com', password: 'Kurio123', name: 'Marina Costa', username: 'marinac' },
];
const defaultUsers = mockUsers.map((user) => ({ ...user }));

export interface MockCartItem {
  id: string;
  nftId: string;
  name: string;
  image: string;
  price: string;
  edition: string;
  styleId?: string;
  styleLabel?: string;
  styleFilter?: string;
  quantity: number;
  availableQuantity: number;
}

export const mockCartItems: MockCartItem[] = [];
export const mockUserCarts = new Map<string, MockCartItem[]>();
export const mockFavorites = new Map<string, Set<number>>();
export const mockOrders = new Map<string, { fingerprint: string; order: Record<string, unknown> }>();
export const mockProfiles = new Map<string, Record<string, unknown>>();
export const mockWallets = new Map<string, Array<Record<string, unknown>>>();
const defaultWallets: Array<[string, Array<Record<string, unknown>>]> = [
  ['usr_1', [{ id: 'wallet_1', address: '0xA91F00000000000000000000000000000000E82C', label: 'Principal', network: 'Ethereum', primary: true }, { id: 'wallet_2', address: 'nova.kurio.eth', label: 'Reserva', network: 'Polygon', primary: false }]],
  ['usr_2', [{ id: 'wallet_3', address: '0xB83A00000000000000000000000000000000A73D', label: 'Principal', network: 'Ethereum', primary: true }]],
];
defaultWallets.forEach(([userId, wallets]) => mockWallets.set(userId, wallets.map((wallet) => ({ ...wallet }))));
export const idempotentOrders = new Map<string, { fingerprint: string; order: Record<string, unknown> }>();
export const mockSessions = new Map<string, string>();

const storageKey = 'kurio_mock_state_v1';

export const hashMockPassword = async (password: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join('');
};

export const loadMockState = () => {
  try {
    const value = localStorage.getItem(storageKey);
    if (!value) return;
    const state = JSON.parse(value) as {
      carts?: Array<[string, MockCartItem[]]>;
      favorites?: Array<[string, number[]]>;
      profiles?: Array<[string, Record<string, unknown>]>;
      wallets?: Array<[string, Array<Record<string, unknown>>]>;
      sessions?: Array<[string, string]>;
      orders?: Array<[string, { fingerprint: string; order: Record<string, unknown> }]>;
      users?: Array<Omit<MockUser, 'password'> & { passwordHash: string }>;
      nfts?: typeof mockNfts;
    };
    mockUserCarts.clear(); state.carts?.forEach(([id, items]) => mockUserCarts.set(id, items));
    mockFavorites.clear(); state.favorites?.forEach(([id, ids]) => mockFavorites.set(id, new Set(ids)));
    mockProfiles.clear(); state.profiles?.forEach(([id, profile]) => mockProfiles.set(id, profile));
    mockWallets.clear(); state.wallets?.forEach(([id, wallets]) => mockWallets.set(id, wallets));
    mockSessions.clear(); state.sessions?.forEach(([token, email]) => mockSessions.set(token, email));
    idempotentOrders.clear(); state.orders?.forEach(([key, entry]) => idempotentOrders.set(key, entry));
    if (state.users?.length) {
      mockUsers.splice(0, mockUsers.length, ...state.users.map((user) => ({ ...user, password: undefined })));
    }
    if (state.nfts?.length) mockNfts.splice(0, mockNfts.length, ...state.nfts);
  } catch {
    localStorage.removeItem(storageKey);
  }
};

export const persistMockState = async () => {
  const users = await Promise.all(mockUsers.map(async ({ password, ...user }) => ({ ...user, passwordHash: user.passwordHash ?? (password ? await hashMockPassword(password) : '') })));
  localStorage.setItem(storageKey, JSON.stringify({
    carts: [...mockUserCarts],
    favorites: [...mockFavorites].map(([id, values]) => [id, [...values]]),
    profiles: [...mockProfiles],
    wallets: [...mockWallets],
    sessions: [...mockSessions],
    orders: [...idempotentOrders],
    users,
    nfts: mockNfts,
  }));
};

export const resetMockState = () => {
  mockCartItems.splice(0);
  mockFavorites.clear();
  mockOrders.clear();
  mockProfiles.clear();
  mockWallets.clear();
  defaultWallets.forEach(([userId, wallets]) => mockWallets.set(userId, wallets.map((wallet) => ({ ...wallet }))));
  idempotentOrders.clear();
  mockSessions.clear();
  mockUserCarts.clear();
  mockUsers.splice(0, mockUsers.length, ...defaultUsers.map((user) => ({ ...user })));
  mockNfts.splice(0, mockNfts.length, ...defaultNfts.map((nft) => ({ ...nft })));
  localStorage.removeItem(storageKey);
};

if (typeof localStorage !== 'undefined') loadMockState();
