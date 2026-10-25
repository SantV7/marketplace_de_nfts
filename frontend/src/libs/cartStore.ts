import { useSyncExternalStore } from 'react';

const cartStorageKey = 'kurio-cart-v1';

export interface CartItem {
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

const listeners = new Set<() => void>();
const validStyleIds = new Set(['normal', 'platinum', 'gold', 'saturated']);

const isCartItem = (value: unknown): value is CartItem => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CartItem>;

  return (
    typeof item.id === 'string' &&
    typeof item.nftId === 'string' &&
    typeof item.name === 'string' &&
    typeof item.image === 'string' &&
    typeof item.price === 'string' &&
    /^\d+(\.\d{1,8})?$/.test(item.price) &&
    typeof item.edition === 'string' &&
    (item.styleId === undefined ||
      (typeof item.styleId === 'string' && validStyleIds.has(item.styleId))) &&
    (item.styleLabel === undefined || typeof item.styleLabel === 'string') &&
    (item.styleFilter === undefined || typeof item.styleFilter === 'string') &&
    Number.isInteger(item.quantity) &&
    Number(item.quantity) > 0 &&
    Number.isInteger(item.availableQuantity) &&
    Number(item.availableQuantity) >= Number(item.quantity)
  );
};

const readStoredCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];

  try {
    const storedCart = window.localStorage.getItem(cartStorageKey);
    if (!storedCart) return [];

    const parsed: unknown = JSON.parse(storedCart);
    if (Array.isArray(parsed) && parsed.every(isCartItem)) return parsed;

    console.error('O carrinho salvo possui um formato inválido; iniciando um carrinho vazio.');
  } catch (error) {
    console.error('Não foi possível ler o carrinho salvo no navegador.', error);
  }

  return [];
};

let cartSnapshot = readStoredCart();

const notifySubscribers = () => {
  listeners.forEach((listener) => listener());
};

const saveCart = (nextCart: CartItem[]) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(cartStorageKey, JSON.stringify(nextCart));
  }

  cartSnapshot = nextCart;
  notifySubscribers();
};

export const subscribeToCart = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getCartSnapshot = () => cartSnapshot;

export const useCartItems = () =>
  useSyncExternalStore(subscribeToCart, getCartSnapshot, getCartSnapshot);

export const addCartItem = (
  item: Omit<CartItem, 'id'>,
): { success: true } | { success: false; message: string } => {
  const existingItem = cartSnapshot.find(
    (cartItem) =>
      cartItem.nftId === item.nftId &&
      cartItem.edition === item.edition &&
      (cartItem.styleId ?? 'normal') === (item.styleId ?? 'normal'),
  );
  const editionQuantity = cartSnapshot
    .filter((cartItem) => cartItem.nftId === item.nftId && cartItem.edition === item.edition)
    .reduce((total, cartItem) => total + cartItem.quantity, 0);
  const nextQuantity = editionQuantity + item.quantity;

  if (nextQuantity > item.availableQuantity) {
    return {
      success: false,
      message: `Disponibilidade insuficiente para esta edição. Máximo: ${item.availableQuantity}.`,
    };
  }

  const nextItem: CartItem = {
    ...item,
    id: existingItem?.id ?? `${item.nftId}:${item.edition}:${item.styleId ?? 'normal'}`,
    quantity: (existingItem?.quantity ?? 0) + item.quantity,
  };
  const nextCart = existingItem
    ? cartSnapshot.map((cartItem) => (cartItem.id === nextItem.id ? nextItem : cartItem))
    : [...cartSnapshot, nextItem];

  saveCart(nextCart);
  return { success: true };
};

export const updateCartItemQuantity = (
  itemId: string,
  quantity: number,
): { success: true } | { success: false; message: string } => {
  const item = cartSnapshot.find((cartItem) => cartItem.id === itemId);
  if (!item) {
    return { success: false, message: 'Este NFT não está mais no carrinho.' };
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > item.availableQuantity) {
    return {
      success: false,
      message: `A quantidade deve estar entre 1 e ${item.availableQuantity}.`,
    };
  }
  const otherEditionQuantity = cartSnapshot
    .filter(
      (cartItem) =>
        cartItem.nftId === item.nftId &&
        cartItem.edition === item.edition &&
        cartItem.id !== itemId,
    )
    .reduce((total, cartItem) => total + cartItem.quantity, 0);
  if (otherEditionQuantity + quantity > item.availableQuantity) {
    return {
      success: false,
      message: `Disponibilidade insuficiente para esta edição. Máximo: ${item.availableQuantity}.`,
    };
  }

  saveCart(
    cartSnapshot.map((cartItem) =>
      cartItem.id === itemId ? { ...cartItem, quantity } : cartItem,
    ),
  );
  return { success: true };
};

export const removeCartItem = (itemId: string) => {
  saveCart(cartSnapshot.filter((item) => item.id !== itemId));
};

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== cartStorageKey) return;
    cartSnapshot = readStoredCart();
    notifySubscribers();
  });
}
