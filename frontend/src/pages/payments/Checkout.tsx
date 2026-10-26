import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/footer/Footer';
import Navbar from '@/components/navbar/Navbar';
import { toEthUnits } from '@/pages/cart/cartPricing';
import CheckoutOrderSummary from './CheckoutOrderSummary';
import CheckoutMobile from './CheckoutMobile';
import CheckoutProfileForm from './CheckoutProfileForm';
import { useCart, useCreateOrder, useOrder, useQuote, useSession } from '@/services/queries';
import { useWallets, useWalletConnection } from '@/services/queries';
import { api } from '@/services/api';
import type { Order, Wallet } from '@/services/contracts';
import {
  walletProviders,
  type WalletProviderId,
} from './paymentData';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { readStored, sessionStorageKey } from '@/services/session';
import { useMobile } from '@/hooks/useMobile';
import { PageSkeleton, RequestError } from '@/components/RemoteState';

type OrderAttempt = Parameters<ReturnType<typeof useCreateOrder>['mutateAsync']>[0];
const noWallets: Wallet[] = [];

const Checkout = () => {
  const { coupon } = useSearch({ from: '/payment' });
  const navigate = useNavigate();
  const mobile = useMobile();
  const session = useSession();
  const attemptKey = sessionStorageKey('kurio-pending-attempt');
  const draftKey = sessionStorageKey('kurio-checkout-draft');
  const stateKey = sessionStorageKey('kurio-last-order-state');
  const [attempt, setAttempt] = useState<OrderAttempt | undefined>(() => readStored<OrderAttempt>(attemptKey));
  const [recoveredId, setRecoveredId] = useState(() => localStorage.getItem(stateKey) ?? '');
  const needsReview = useRef(false);
  const cartQuery = useCart();
  const items = cartQuery.data ?? [];
  const quoteQuery = useQuote(coupon);
  const walletsQuery = useWallets();
  const walletConnection = useWalletConnection();
  const wallets = walletsQuery.data ?? noWallets;
  const createOrder = useCreateOrder();
  const submitLock = useRef(false);
  const [selectedProvider, setSelectedProvider] = useState<WalletProviderId>(
    walletProviders[2].id,
  );
  const [selectedWalletAddress, setSelectedWalletAddress] = useState('');
  const [connectedWalletAddress, setConnectedWalletAddress] = useState('');
  const selectedWallet = selectedWalletAddress || wallets[0]?.address || '';
  const walletConnected = connectedWalletAddress === selectedWallet && Boolean(selectedWallet);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const attemptQuery = useQuery({
    queryKey: ['order-attempt', attempt?.key],
    enabled: Boolean(attempt),
    queryFn: async ({ signal }) => (await api.get<Order>(`/orders/by-key/${encodeURIComponent(attempt!.key)}`, { signal })).data,
    retry: false,
  });
  const pendingOrder = useOrder(recoveredId || attemptQuery.data?.orderId || '');
  const rememberAttempt = (value: OrderAttempt | undefined) => {
    if (value) localStorage.setItem(attemptKey, JSON.stringify(value));
    else localStorage.removeItem(attemptKey);
    setAttempt(value);
  };
  const finishOrder = async (order: Order) => {
    setRecoveredId(order.orderId);
    if (order.status === 'confirmed') {
      localStorage.removeItem(stateKey);
      localStorage.removeItem(attemptKey);
      localStorage.removeItem(draftKey);
      localStorage.setItem('kurio-order-id', order.orderId);
      await navigate({ to: '/order-confirmation' });
    } else {
      localStorage.setItem(stateKey, order.orderId);
      if (order.status === 'rejected') rememberAttempt(undefined);
      setConfirmationMessage(order.status === 'rejected' ? 'Pagamento recusado. O carrinho foi preservado.' : 'Pedido pendente. Consulte novamente em instantes.');
    }
  };
  const saveDraft = (form: HTMLFormElement) => {
    const draft = Object.fromEntries(new FormData(form).entries());
    localStorage.setItem(draftKey, JSON.stringify(draft));
  };
  const restoreDraft = (form: HTMLFormElement | null) => {
    if (!form) return;
    const draft = readStored<Record<string, string>>(draftKey);
    if (!draft) return;
    for (const [name, value] of Object.entries(draft)) {
      if (['walletAddress', 'network', 'walletProvider', 'paymentProvider', 'connectedWallet'].includes(name)) continue;
      const input = form.elements.namedItem(name);
      if (input instanceof HTMLInputElement && !['radio', 'checkbox', 'password'].includes(input.type) || input instanceof HTMLTextAreaElement) input.value = value;
    }
  };

  const handleWalletConnection = async () => {
    const wallet = wallets.find((entry) => entry.address === selectedWallet);
    if (!wallet) return;
    try {
      if (walletConnected) {
        await walletConnection.mutateAsync({ id: wallet.id, connected: true });
        setConnectedWalletAddress('');
        setConfirmationMessage('Carteira desconectada.');
      } else {
        await walletConnection.mutateAsync({ id: wallet.id, connected: false });
        setConnectedWalletAddress(selectedWallet);
        setConfirmationMessage('Carteira conectada.');
      }
    } catch {
      setConnectedWalletAddress('');
      setConfirmationMessage('A conexão da carteira foi recusada. Tente novamente.');
    }
  };

  useEffect(() => {
    const onNftUpdated = () => { needsReview.current = true; setConfirmationMessage('Preço ou disponibilidade alterados. A cotação foi atualizada; revise antes de confirmar.'); };
    window.addEventListener('kurio:nft-updated', onNftUpdated);
    return () => window.removeEventListener('kurio:nft-updated', onNftUpdated);
  }, []);

  useEffect(() => {
    const order = pendingOrder.data;
    if (!order || order.status !== 'confirmed') return;
    localStorage.removeItem(attemptKey);
    localStorage.removeItem(draftKey);
    localStorage.removeItem(stateKey);
    localStorage.setItem('kurio-order-id', order.orderId);
    void navigate({ to: '/order-confirmation' });
  }, [navigate, pendingOrder.data, attemptKey, draftKey, stateKey]);

  const subtotal = toEthUnits(quoteQuery.data?.subtotal ?? '0');
  const discount = toEthUnits(quoteQuery.data?.discount ?? '0');
  const fee = toEthUnits(quoteQuery.data?.networkFee ?? '0');
  const total = toEthUnits(quoteQuery.data?.total ?? '0');
  const paymentMessage = confirmationMessage || (pendingOrder.data?.status === 'rejected' ? 'Pagamento recusado. O carrinho foi preservado.' : pendingOrder.data?.status === 'pending' ? 'Pedido pendente. Consulte novamente em instantes.' : quoteQuery.isError ? 'Não foi possível validar a cotação. Revise a disponibilidade e o cupom no carrinho.' : '');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    saveDraft(event.currentTarget);
    if (submitLock.current || createOrder.isPending) return;
    if (!attempt && (!wallets.length || !walletConnected)) {
      setConfirmationMessage('Selecione e conecte uma carteira cadastrada antes de confirmar.');
      return;
    }
    submitLock.current = true;
    try {
      if (attempt) {
        await finishOrder(await createOrder.mutateAsync(attempt));
        return;
      }
      const previousQuote = quoteQuery.data;
      const [freshCart, freshQuote, freshWallets] = await Promise.all([cartQuery.refetch(), quoteQuery.refetch(), walletsQuery.refetch()]);
      const currentItems = freshCart.data ?? [];
      const currentQuote = freshQuote.data;
      if (freshCart.isError || freshQuote.isError || freshWallets.isError || !currentQuote || currentItems.length === 0) {
        setConfirmationMessage('Não foi possível validar o carrinho e a cotação. Verifique disponibilidade e cupom e tente novamente.');
        return;
      }
      const quoteSignature = (quote: typeof currentQuote | undefined) => quote && JSON.stringify([quote.version, quote.total, quote.subtotal, quote.discount, quote.networkFee, quote.coupon]);
      if (needsReview.current || quoteSignature(previousQuote) !== quoteSignature(currentQuote) || JSON.stringify(items) !== JSON.stringify(currentItems) || Date.parse(currentQuote.expiresAt) <= Date.now()) {
        needsReview.current = false;
        setConfirmationMessage('A cotação foi atualizada. Revise os valores e confirme novamente.');
        return;
      }
      const wallet = freshWallets.data?.find((entry) => entry.address === selectedWallet);
      const network = String(form.get('network') ?? wallet?.network ?? '');
      if (!wallet || wallet.network !== network) {
        setConfirmationMessage('Selecione a rede correspondente à carteira cadastrada.');
        return;
      }
      const input = { items: currentItems, total: currentQuote.total, discount: currentQuote.discount, networkFee: currentQuote.networkFee, coupon: currentQuote.coupon, quoteVersion: currentQuote.version, quoteExpiresAt: currentQuote.expiresAt, wallet: wallet.address, provider: selectedProvider, network };
      const transaction = { key: crypto.randomUUID(), input };
      setRecoveredId('');
      localStorage.removeItem(stateKey);
      rememberAttempt(transaction);
      await finishOrder(await createOrder.mutateAsync(transaction));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status >= 400 && error.response.status < 500 && error.response.status !== 401) rememberAttempt(undefined);
        setConfirmationMessage(error.response.status === 409 ? 'A compra mudou. Revise o carrinho e confirme novamente.' : 'Não foi possível validar o pagamento. Tente novamente.');
      } else {
        setConfirmationMessage('A resposta do pagamento não chegou. A tentativa foi guardada; confirme novamente para recuperar o mesmo pedido.');
      }
    } finally {
      submitLock.current = false;
    }
  };

  if (cartQuery.isLoading || walletsQuery.isLoading || quoteQuery.isLoading) return <PageSkeleton label="Carregando pagamento…" summary />;
  if (cartQuery.isError || walletsQuery.isError) return <RequestError message="Não foi possível carregar o pagamento." retry={() => { void cartQuery.refetch(); void walletsQuery.refetch(); }} />;

  return (
    <div aria-busy={quoteQuery.isFetching || createOrder.isPending} className="min-h-screen bg-[#140D0A] font-mono text-[#F5F1EB]">
      {!mobile && <div>
        <Navbar />
        <main className="mx-auto max-w-300 px-4 pb-14 pt-6 sm:px-6 lg:px-10">
          <h1 className="sr-only">Pagamento</h1>
          <nav aria-label="Navegação estrutural" className="mb-6 text-xs text-[#F5F1EB]">
            <Link to="/" className="transition-colors hover:text-[#D28A4C]">Início</Link>
            <span className="px-2">/</span>
            <Link to="/market" className="transition-colors hover:text-[#D28A4C]">Mercado</Link>
            <span className="px-2">/</span>
            <span>Pagamento</span>
          </nav>

          {items.length === 0 ? (
            <EmptyCheckout />
          ) : (
            <form ref={restoreDraft} onSubmit={handleSubmit} onChange={(event) => saveDraft(event.currentTarget)}>
              <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px] xl:gap-12">
                <CheckoutProfileForm
                  user={session.data?.user}
                  selectedProvider={selectedProvider}
                  onProviderChange={setSelectedProvider}
                  wallets={wallets}
                  selectedWallet={selectedWallet}
                  onWalletChange={setSelectedWalletAddress}
                />
                <CheckoutOrderSummary
                  items={items}
                  subtotal={subtotal}
                  discount={discount}
                  fee={fee}
                  total={total}
                  selectedProvider={selectedProvider}
                  onProviderChange={setSelectedProvider}
                  confirmationMessage={paymentMessage}
                  couponApplied={Boolean(quoteQuery.data && discount > 0n)}
                />
              </div>
              <button type="button" onClick={handleWalletConnection} disabled={!selectedWallet} className="mt-6 rounded border border-[#D28A4C] px-5 py-3 text-sm text-[#D28A4C]">
                {walletConnected ? 'Desconectar carteira' : 'Conectar carteira'}
              </button>
            </form>
          )}
        </main>
        <Footer />
      </div>}

      {mobile && (items.length > 0 ? (
        <CheckoutMobile
          items={items}
          subtotal={subtotal}
          discount={discount}
          fee={fee}
          user={session.data?.user}
          formRef={restoreDraft}
          onFormChange={saveDraft}
          total={total}
          selectedProvider={selectedProvider}
          selectedWallet={selectedWallet}
          wallets={wallets}
          confirmationMessage={paymentMessage}
          onProviderChange={setSelectedProvider}
          onWalletChange={setSelectedWalletAddress}
          onConnectWallet={handleWalletConnection}
          walletConnected={walletConnected}
          onSubmit={handleSubmit}
        />
      ) : (
        <main className="px-4 py-10 md:hidden">
          <EmptyCheckout />
        </main>
      ))}
    </div>
  );
};

const EmptyCheckout = () => (
  <section className="mx-auto max-w-xl rounded-2xl border border-[#3D2C24] bg-[#1C120E] px-5 py-12 text-center">
    <h1 className="text-lg font-bold">Não há NFTs para pagar</h1>
    <p className="mt-2 text-sm text-[#B39463]">
      Adicione itens ao carrinho antes de continuar para o pagamento.
    </p>
    <Link
      to="/cart"
      className="mt-6 inline-flex items-center gap-2 text-sm text-[#D28A4C] hover:text-[#F5F1EB]"
    >
      <ArrowLeft className="h-4 w-4" />
      Voltar ao carrinho
    </Link>
  </section>
);

export default Checkout;
