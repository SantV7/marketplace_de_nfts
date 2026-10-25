import type { CartItem } from '@/libs/cartStore';
import { formatEth, toEthUnits } from '@/pages/cart/cartPricing';
import type { OrderReceipt } from './OrderConfirmation';
import {
  connectedWallets,
  walletProviders,
  type ConnectedWalletId,
  type WalletProviderId,
} from './paymentData';

const demoReceiptStorageKey = 'kurio-demo-order-receipt-v1';

export const createDemoReceipt = ({
  items,
  total,
  discount,
  fee,
  providerId,
  walletId,
}: {
  items: CartItem[];
  total: bigint;
  discount: bigint;
  fee: bigint;
  providerId: WalletProviderId;
  walletId: ConnectedWalletId;
}): OrderReceipt => {
  const provider = walletProviders.find(({ id }) => id === providerId);
  const wallet = connectedWallets.find(({ id }) => id === walletId);
  if (!provider || !wallet) {
    throw new Error('A carteira selecionada não está disponível para a demonstração.');
  }

  return {
    isDemo: true,
    transactionId: `DEMO-${Date.now().toString(16).toUpperCase()}`,
    date: new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
      .format(new Date())
      .replace(/(\d{2}) (\w{3}) (\d{4})/, '$1 $2, $3'),
    total: formatEth(total),
    discount: formatEth(discount),
    wallet: provider.name,
    network: wallet.network,
    networkFee: formatEth(fee),
    explorerName: 'Etherscan',
    explorerUrl: 'https://etherscan.io/',
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      tokenId: item.nftId.padStart(4, '0'),
      image: item.image,
      quantity: item.quantity,
      subtotal: formatEth(toEthUnits(item.price) * BigInt(item.quantity)),
    })),
  };
};

export const saveDemoReceipt = (receipt: OrderReceipt) => {
  window.sessionStorage.setItem(demoReceiptStorageKey, JSON.stringify(receipt));
};

const isOrderReceipt = (value: unknown): value is OrderReceipt => {
  if (!value || typeof value !== 'object') return false;
  const receipt = value as Partial<OrderReceipt>;
  return (
    receipt.isDemo === true &&
    typeof receipt.transactionId === 'string' &&
    receipt.transactionId.startsWith('DEMO-') &&
    typeof receipt.date === 'string' &&
    typeof receipt.total === 'string' &&
    typeof receipt.discount === 'string' &&
    typeof receipt.wallet === 'string' &&
    typeof receipt.network === 'string' &&
    typeof receipt.networkFee === 'string' &&
    receipt.explorerName === 'Etherscan' &&
    receipt.explorerUrl === 'https://etherscan.io/' &&
    Array.isArray(receipt.items) &&
    receipt.items.every(
      (item) =>
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.tokenId === 'string' &&
        typeof item.image === 'string' &&
        Number.isInteger(item.quantity) &&
        typeof item.subtotal === 'string',
    )
  );
};

export const loadDemoReceipt = (): OrderReceipt | null => {
  const storedReceipt = window.sessionStorage.getItem(demoReceiptStorageKey);
  if (!storedReceipt) return null;

  const parsed: unknown = JSON.parse(storedReceipt);
  if (!isOrderReceipt(parsed)) {
    throw new Error('Os dados da confirmação demonstrativa estão inválidos.');
  }
  return parsed;
};

export const clearDemoReceipt = () => {
  window.sessionStorage.removeItem(demoReceiptStorageKey);
};
