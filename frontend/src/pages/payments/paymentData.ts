export const walletProviders = [
  { id: 'walletconnect', name: 'WalletConnect', initial: 'W' },
  { id: 'metamask', name: 'MetaMask', initial: 'M' },
  { id: 'coinbase', name: 'Coinbase Wallet', initial: 'C' },
] as const;

export type WalletProviderId = (typeof walletProviders)[number]['id'];
export const isWalletProviderId = (value: string): value is WalletProviderId =>
  walletProviders.some((provider) => provider.id === value);

export const profileNetworks = ['Ethereum', 'Polygon', 'Solana'] as const;

export const ensDomains = ['.eth', '.xyz', '.art'] as const;
export const isEnsDomain = (value: string): value is (typeof ensDomains)[number] =>
  ensDomains.some((domain) => domain === value);
