import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/footer/Footer';
import Navbar from '@/components/navbar/Navbar';
import { toEthUnits } from '@/pages/cart/cartPricing';
import CheckoutOrderSummary from './CheckoutOrderSummary';
import CheckoutMobile from './CheckoutMobile';
import CheckoutProfileForm from './CheckoutProfileForm';
import { useCart, useCreateOrder, useOrder, useQuote } from '@/services/queries';
import {
  connectedWallets,
  walletProviders,
  type ConnectedWalletId,
  type WalletProviderId,
} from './paymentData';

const Checkout = () => {
  const { coupon } = useSearch({ from: '/payment' });
  const navigate = useNavigate();
  const cartQuery = useCart();
  const items = cartQuery.data ?? [];
  const quoteQuery = useQuote(coupon);
  const createOrder = useCreateOrder();
  const [selectedProvider, setSelectedProvider] = useState<WalletProviderId>(
    walletProviders[2].id,
  );
  const [selectedWallet, setSelectedWallet] = useState<ConnectedWalletId>(
    connectedWallets[0].id,
  );
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const savedOrderKey = localStorage.getItem('kurio-pending-order-key');
  const recoveredKey = savedOrderKey ? (JSON.parse(savedOrderKey) as { key?: string }).key : undefined;
  const pendingOrderId = localStorage.getItem('kurio-pending-order-id') ?? (recoveredKey ? `ORD-${recoveredKey.slice(0, 12)}` : '');
  const pendingOrder = useOrder(pendingOrderId);

  useEffect(() => {
    const onNftUpdated = () => setConfirmationMessage('Preço ou disponibilidade alterados. A cotação foi atualizada; revise antes de confirmar.');
    window.addEventListener('kurio:nft-updated', onNftUpdated);
    return () => window.removeEventListener('kurio:nft-updated', onNftUpdated);
  }, []);

  useEffect(() => {
    const order = pendingOrder.data;
    if (!order || order.status !== 'confirmed') return;
    localStorage.removeItem('kurio-pending-order-id');
    localStorage.removeItem('kurio-pending-order-key');
    localStorage.setItem('kurio-order-id', order.orderId);
    void navigate({ to: '/order-confirmation' });
  }, [navigate, pendingOrder.data]);

  const subtotal = toEthUnits(quoteQuery.data?.subtotal ?? '0');
  const discount = toEthUnits(quoteQuery.data?.discount ?? '0');
  const fee = toEthUnits(quoteQuery.data?.networkFee ?? '0');
  const total = toEthUnits(quoteQuery.data?.total ?? '0');
  const paymentMessage = confirmationMessage || (pendingOrder.data?.status === 'rejected' ? 'Pagamento recusado. O carrinho foi preservado.' : '');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (items.length === 0) return;

    if (createOrder.isPending) return;
    try {
      const previousQuote = quoteQuery.data;
      const [freshCart, freshQuote] = await Promise.all([cartQuery.refetch(), quoteQuery.refetch()]);
      const currentItems = freshCart.data ?? [];
      const currentQuote = freshQuote.data;
      if (!currentQuote || currentItems.length === 0) {
        setConfirmationMessage('Não foi possível validar o carrinho e a cotação. Tente novamente.');
        return;
      }
      const quoteChanged = previousQuote && (previousQuote.total !== currentQuote.total || previousQuote.version !== currentQuote.version);
      const itemsChanged = JSON.stringify(items) !== JSON.stringify(currentItems);
      if (quoteChanged || itemsChanged || new Date(currentQuote.expiresAt).getTime() <= Date.now()) {
        setConfirmationMessage('A cotação foi atualizada. Revise os valores e confirme novamente.');
        return;
      }
      const input = { items: currentItems, total: currentQuote.total, discount: currentQuote.discount, networkFee: currentQuote.networkFee, coupon: currentQuote.coupon, quoteVersion: currentQuote.version, quoteExpiresAt: currentQuote.expiresAt, wallet: String(form.get('walletAddress') ?? selectedWallet), provider: selectedProvider, network: String(form.get('network') ?? 'Ethereum') };
      const fingerprint = JSON.stringify({ items: input.items, total: input.total, discount: input.discount, networkFee: input.networkFee, coupon: input.coupon, quoteVersion: input.quoteVersion, wallet: input.wallet, provider: input.provider, network: input.network });
      const saved = localStorage.getItem('kurio-pending-order-key');
      const savedTransaction = saved ? JSON.parse(saved) as { key: string; fingerprint: string } : undefined;
      const key = savedTransaction?.fingerprint === fingerprint ? savedTransaction.key : crypto.randomUUID();
      localStorage.setItem('kurio-pending-order-key', JSON.stringify({ key, fingerprint }));
      let response;
      try {
        response = await createOrder.mutateAsync({ key, input });
      } catch {
        const recovery = await cartQuery.refetch().catch(() => undefined);
        void recovery;
        setConfirmationMessage('A resposta do pagamento não chegou. A tentativa foi guardada; confirme novamente para recuperar o mesmo pedido.');
        return;
      }
      if (response.status !== 'confirmed') {
        if (response.status === 'pending') localStorage.setItem('kurio-pending-order-id', response.orderId);
        if (response.status === 'rejected') localStorage.removeItem('kurio-pending-order-key');
        setConfirmationMessage(response.status === 'rejected' ? 'Pagamento recusado. O carrinho foi preservado.' : 'Pedido pendente. Consulte novamente em instantes.');
        return;
      }
      localStorage.removeItem('kurio-pending-order-key');
      localStorage.removeItem('kurio-pending-order-id');
      localStorage.setItem('kurio-order-id', response.orderId);
      localStorage.setItem('kurio-order-snapshot', JSON.stringify({ ...response, wallet: input.wallet, provider: input.provider, network: input.network }));
      await navigate({ to: '/order-confirmation' });
    } catch (error) {
      console.error('Não foi possível criar a prévia do recibo.', error);
      setConfirmationMessage(
        'Não foi possível abrir a confirmação demonstrativa. Tente novamente.',
      );
    }
  };

  const handleSwitchWallet = () => {
    setSelectedWallet((currentWallet) =>
      currentWallet === connectedWallets[0].id
        ? connectedWallets[1].id
        : connectedWallets[0].id,
    );
  };

  return (
    <div className="min-h-screen bg-[#140D0A] font-mono text-[#F5F1EB]">
      <div className="hidden md:block">
        <Navbar />
        <main className="mx-auto max-w-300 px-4 pb-14 pt-6 sm:px-6 lg:px-10">
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
            <form onSubmit={handleSubmit} onChange={() => setConfirmationMessage('')}>
              <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px] xl:gap-12">
                <CheckoutProfileForm
                  selectedProvider={selectedProvider}
                  onProviderChange={setSelectedProvider}
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
            </form>
          )}
        </main>
        <Footer />
      </div>

      {items.length > 0 ? (
        <CheckoutMobile
          total={total}
          selectedProvider={selectedProvider}
          selectedWallet={selectedWallet}
          confirmationMessage={paymentMessage}
          onProviderChange={setSelectedProvider}
          onWalletChange={setSelectedWallet}
          onSwitchWallet={handleSwitchWallet}
          onSubmit={handleSubmit}
        />
      ) : (
        <main className="px-4 py-10 md:hidden">
          <EmptyCheckout />
        </main>
      )}
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
