import { PageSkeleton, RequestError } from '@/components/RemoteState';
import { useMobile } from '@/hooks/useMobile';
import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Footer from '@/components/footer/Footer';
import Navbar from '@/components/navbar/Navbar';
import { useCart, useQuote, useValidateCoupon, useRemoveCartItem, useUpdateCartItem } from '@/services/queries';
import CartItemList from './CartItemList';
import CartRecommendations from './CartRecommendations';
import CartSummary from './CartSummary';
import { toEthUnits } from './cartPricing';

const Cart = () => {
  const mobile = useMobile();
  const cartQuery = useCart();
  const [realtimeMessage, setRealtimeMessage] = useState('');
  useEffect(() => { const notify = () => setRealtimeMessage('Preço ou disponibilidade alterados. Confira os valores atualizados.'); window.addEventListener('kurio:nft-updated', notify); return () => window.removeEventListener('kurio:nft-updated', notify); }, []);
  const items = cartQuery.data ?? [];
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const validateCoupon = useValidateCoupon();
  const [coupon, setCoupon] = useState(() => localStorage.getItem('kurio-cart-coupon') ?? '');
  const [appliedCoupon, setAppliedCoupon] = useState(() => Boolean(localStorage.getItem('kurio-cart-coupon')));
  const [couponMessage, setCouponMessage] = useState('');
  const [cartActionError, setCartActionError] = useState('');

  const quoteQuery = useQuote(appliedCoupon ? coupon.trim().toUpperCase() : undefined);
  const subtotal = toEthUnits(quoteQuery.data?.subtotal ?? '0');
  const discount = toEthUnits(quoteQuery.data?.discount ?? '0');
  const fee = toEthUnits(quoteQuery.data?.networkFee ?? '0');
  const total = toEthUnits(quoteQuery.data?.total ?? '0');

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setCartActionError('');
    try {
      updateItem.mutate({ id: itemId, quantity }, { onError: () => setCartActionError('Disponibilidade insuficiente. Tente uma quantidade menor.') });
    } catch (error) {
      console.error('Não foi possível atualizar a quantidade do carrinho.', error);
      setCartActionError('Não foi possível salvar a alteração. Tente novamente.');
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setCartActionError('');
    try {
      removeItem.mutate(itemId, { onError: () => setCartActionError('Não foi possível remover o item. Tente novamente.') });
    } catch (error) {
      console.error('Não foi possível remover o NFT do carrinho.', error);
      setCartActionError('Não foi possível salvar a remoção. Tente novamente.');
    }
  };

  const handleCouponChange = (value: string) => {
    localStorage.removeItem('kurio-cart-coupon');
    setCoupon(value);
    setAppliedCoupon(false);
    setCouponMessage('');
  };

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) { setCouponMessage('Cupom inválido: informe um código.'); return; }
    try {
      await validateCoupon.mutateAsync(coupon.trim().toUpperCase());
      localStorage.setItem('kurio-cart-coupon', coupon.trim().toUpperCase());
      setAppliedCoupon(true);
      setCouponMessage('Cupom aplicado à cotação.');
    } catch {
      setAppliedCoupon(false);
      setCouponMessage('Cupom inválido ou expirado. Verifique o código e tente novamente.');
    }
  };

  const handleRemoveCoupon = () => {
    localStorage.removeItem('kurio-cart-coupon');
    setAppliedCoupon(false);
    setCouponMessage('Cupom removido.');
  };

  if (cartQuery.isLoading) return <PageSkeleton label="Carregando carrinho…" summary />;
  if (cartQuery.isError) return <RequestError message="Não foi possível carregar o carrinho." retry={() => void cartQuery.refetch()} />;
  return (
    <div className="min-h-screen bg-[#140D0A] font-mono text-[#F5F1EB]">
      {!mobile && <div>
        <Navbar />
        <main className="mx-auto max-w-360 px-4 py-8 sm:px-6 lg:px-12 xl:px-20">
          <nav aria-label="Navegação estrutural" className="mb-8 text-xs text-[#F5F1EB]">
            <Link to="/" className="transition-colors hover:text-[#D28A4C]">Início</Link>
            <span className="px-2">/</span>
            <Link to="/market" className="transition-colors hover:text-[#D28A4C]">Mercado</Link>
            <span className="px-2">/</span>
            <span className="text-[#F5F1EB]">Carrinho</span>
          </nav>

          <h1 className="mb-7 text-2xl font-bold sm:text-3xl">Carrinho de NFTs</h1>

          {items.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
              <CartItemList
                items={items}
                error={cartActionError}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
              <CartSummary
                coupon={coupon}
                appliedCoupon={appliedCoupon}
                couponMessage={couponMessage}
                loading={quoteQuery.isFetching || updateItem.isPending}
                error={quoteQuery.isError}
                onRetry={() => void quoteQuery.refetch()}
                subtotal={subtotal}
                discount={discount}
                fee={fee}
                total={total}
                onCouponChange={handleCouponChange}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
              />
            </div>
          )}

          <CartRecommendations />
        </main>
        <Footer />
      </div>}

      {mobile && <main className="mx-auto flex min-h-svh w-full max-w-[390px] flex-col bg-[#140D0A] px-6 pb-0 pt-[25px] md:hidden">
        <header className="mb-4 grid grid-cols-[32px_1fr_32px] items-center">
          <Link
            to="/market"
            aria-label="Voltar ao mercado"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#3D2C24] bg-[#241612] text-[#D28A4C]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-center text-base font-bold">Carrinho de NFTs</h1>
          <span aria-hidden="true" />
        </header>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="flex flex-1 flex-col">
            <CartItemList
              items={items}
              error={cartActionError}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemoveItem}
            />
            <CartSummary
              coupon={coupon}
              appliedCoupon={appliedCoupon}
              couponMessage={couponMessage}
                loading={quoteQuery.isFetching || updateItem.isPending}
                error={quoteQuery.isError}
                onRetry={() => void quoteQuery.refetch()}
              subtotal={subtotal}
              discount={discount}
              fee={fee}
              total={total}
              onCouponChange={handleCouponChange}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
            />
          </div>
        )}
      </main>}
      {realtimeMessage && <p role="status" className="p-4 text-center">{realtimeMessage}</p>}
    </div>
  );
};

const EmptyCart = () => (
  <section className="rounded-2xl border border-[#3D2C24] bg-[#1C120E] px-5 py-14 text-center">
    <h2 className="text-lg font-semibold">Seu carrinho está vazio</h2>
    <p className="mt-2 border-b border-[#3D2C24] pb-6 text-sm text-[#F5F1EB]">
      Explore o mercado e adicione NFTs para continuar.
    </p>
    <Link
      to="/market"
      className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#D28A4C] px-5 py-3 text-sm font-bold text-[#140D0A] transition-colors hover:bg-[#E09A5C]"
    >
      Explorar o mercado <ArrowRight className="h-4 w-4" />
    </Link>
  </section>
);

export default Cart;
