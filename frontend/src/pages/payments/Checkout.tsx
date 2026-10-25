import { useState, type FormEvent } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/footer/Footer';
import Navbar from '@/components/navbar/Navbar';
import { useCartItems } from '@/libs/cartStore';
import {
  networkFee,
  promoCode,
  toEthUnits,
} from '@/pages/cart/cartPricing';
import CheckoutOrderSummary from './CheckoutOrderSummary';
import CheckoutMobile from './CheckoutMobile';
import CheckoutProfileForm from './CheckoutProfileForm';
import {
  connectedWallets,
  walletProviders,
  type ConnectedWalletId,
  type WalletProviderId,
} from './paymentData';

const Checkout = () => {
  const { coupon } = useSearch({ from: '/payment' });
  const items = useCartItems();
  const [selectedProvider, setSelectedProvider] = useState<WalletProviderId>(
    walletProviders[2].id,
  );
  const [selectedWallet, setSelectedWallet] = useState<ConnectedWalletId>(
    connectedWallets[0].id,
  );
  const [confirmationMessage, setConfirmationMessage] = useState('');

  const subtotal = items.reduce(
    (total, item) => total + toEthUnits(item.price) * BigInt(item.quantity),
    0n,
  );
  const discount = coupon === promoCode ? (subtotal * 1_000n) / 10_000n : 0n;
  const fee = items.length > 0 ? networkFee : 0n;
  const total = subtotal - discount + fee;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setConfirmationMessage(
      'Dados validados. Nenhum pedido ou pagamento foi enviado nesta versão demonstrativa.',
    );
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
                  confirmationMessage={confirmationMessage}
                  couponApplied={coupon === promoCode}
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
          confirmationMessage={confirmationMessage}
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
