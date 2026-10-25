import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import Footer from '@/components/footer/Footer';
import Navbar from '@/components/navbar/Navbar';
import { useCartItems, removeCartItem, updateCartItemQuantity } from '@/libs/cartStore';
import CartItemList from './CartItemList';
import CartRecommendations from './CartRecommendations';
import CartSummary from './CartSummary';
import { networkFee, promoCode, toEthUnits } from './cartPricing';

const Cart = () => {
  const items = useCartItems();
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [cartActionError, setCartActionError] = useState('');

  const subtotal = items.reduce(
    (total, item) => total + toEthUnits(item.price) * BigInt(item.quantity),
    0n,
  );
  const discount = appliedCoupon ? (subtotal * 1_000n) / 10_000n : 0n;
  const fee = items.length > 0 ? networkFee : 0n;
  const total = subtotal - discount + fee;

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setCartActionError('');
    try {
      const result = updateCartItemQuantity(itemId, quantity);
      if (!result.success) setCartActionError(result.message);
    } catch (error) {
      console.error('Não foi possível atualizar a quantidade do carrinho.', error);
      setCartActionError('Não foi possível salvar a alteração. Tente novamente.');
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setCartActionError('');
    try {
      removeCartItem(itemId);
    } catch (error) {
      console.error('Não foi possível remover o NFT do carrinho.', error);
      setCartActionError('Não foi possível salvar a remoção. Tente novamente.');
    }
  };

  const handleCouponChange = (value: string) => {
    setCoupon(value);
    setAppliedCoupon(false);
    setCouponMessage('');
  };

  const handleApplyCoupon = () => {
    if (coupon.trim().toUpperCase() === promoCode) {
      setAppliedCoupon(true);
      setCouponMessage('Cupom KURIO10 aplicado: 10% de desconto demonstrativo.');
      return;
    }

    setAppliedCoupon(false);
    setCouponMessage('Cupom inválido ou expirado. Verifique o código e tente novamente.');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(false);
    setCouponMessage('Cupom removido.');
  };

  return (
    <div className="min-h-screen bg-[#140D0A] font-mono text-[#F5F1EB]">
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
              checkoutMessage={checkoutMessage}
              subtotal={subtotal}
              discount={discount}
              fee={fee}
              total={total}
              onCouponChange={handleCouponChange}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              onCheckout={() =>
                setCheckoutMessage(
                  'O pagamento ainda não está disponível. Seus itens continuam salvos no carrinho.',
                )
              }
            />
          </div>
        )}

        <CartRecommendations />
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
