import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Minus, Plus, Tag } from 'lucide-react';
import Card from '@/components/nftProduct/Card';
import Footer from '@/components/footer/Footer';
import Navbar from '@/components/navbar/Navbar';
import { useCartItems, removeCartItem, updateCartItemQuantity } from '@/libs/cartStore';
import { nfts } from '@/pages/home/products/productData';

const ethUnit = 100_000_000n;
const promoCode = 'KURIO10';
const networkFee = 1_600_000n;

const toEthUnits = (value: string) => {
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole) * ethUnit + BigInt(fraction.padEnd(8, '0'));
};

const formatEth = (value: bigint) => {
  const whole = value / ethUnit;
  const fraction = (value % ethUnit).toString().padStart(8, '0').replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole.toString();
};

const Cart = () => {
  const items = useCartItems();
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [cartActionError, setCartActionError] = useState('');
  const [activeRecommendations, setActiveRecommendations] = useState(0);

  const subtotal = items.reduce(
    (total, item) => total + toEthUnits(item.price) * BigInt(item.quantity),
    0n,
  );
  const discount = appliedCoupon ? (subtotal * 1_000n) / 10_000n : 0n;
  const fee = items.length > 0 ? networkFee : 0n;
  const total = subtotal - discount + fee;
  const recommendationPages = [nfts.slice(0, 5), nfts.slice(5, 10), nfts.slice(10, 15)];
  const recommendations = recommendationPages[activeRecommendations];

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

  const handleApplyCoupon = () => {
    if (coupon.trim().toUpperCase() === promoCode) {
      setAppliedCoupon(true);
      setCouponMessage('Cupom KURIO10 aplicado: 10% de desconto demonstrativo.');
      return;
    }

    setAppliedCoupon(false);
    setCouponMessage('Cupom inválido ou expirado. Verifique o código e tente novamente.');
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
            <section aria-label="Itens no carrinho" className="min-w-0">
              <div className="hidden grid-cols-[minmax(220px,1fr)_100px_130px_100px_40px] gap-4 border-b border-[#3D2C24] px-4 pb-3 text-xs text-[#F5F1EB] md:grid">
                <span>NFT</span>
                <span>Preço</span>
                <span>Edições</span>
                <span>Total</span>
                <span />
              </div>
              {cartActionError && (
                <p role="alert" className="mt-4 text-xs text-red-400">
                  {cartActionError}
                </p>
              )}
              <ul className="space-y-2">
                {items.map((item) => {
                  const itemTotal = toEthUnits(item.price) * BigInt(item.quantity);

                  return (
                    <li
                      key={item.id}
                      className="grid min-h-17.5 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 border-b border-[#140D0A] bg-[#231712] px-3 py-2 transition-colors hover:bg-[#2D1C14] md:grid-cols-[minmax(220px,1fr)_100px_130px_100px_40px] md:gap-4 md:py-0 md:pl-4 md:pr-6"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <img
                          src={item.image}
                          alt={`${item.name}${item.styleLabel && item.styleLabel !== 'Normal' ? ` - ${item.styleLabel}` : ''}`}
                          style={{ filter: item.styleFilter ?? 'none' }}
                          className="h-14 w-14 shrink-0 rounded-md object-cover"
                        />
                        <div className="min-w-0">
                          <h2 className="truncate text-sm font-bold leading-4">{item.name}</h2>
                          <p className="mt-1 text-xs font-normal leading-4 text-[#B39463]">
                            #{String(item.nftId).padStart(3, '0')} · {item.edition}
                            {item.styleLabel && item.styleLabel !== 'Normal' && ` · ${item.styleLabel}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right md:text-left">
                        <span className="block text-[10px] text-[#F5F1EB] md:hidden">
                          Preço
                        </span>
                        <span className="text-sm font-semibold">{item.price} ETH</span>
                      </div>
                      <div className="col-span-2 flex items-center justify-between md:col-span-1 md:justify-start">
                        <span className="text-[10px] text-[#F5F1EB] md:hidden">
                          Edições
                        </span>
                        <div className="flex h-9 items-center gap-0.75 rounded-lg border border-[#3D2C24] bg-[#231712] p-0.75">
                          <button
                            type="button"
                            aria-label={`Diminuir quantidade de ${item.name}`}
                            disabled={item.quantity <= 1}
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D28A4C] text-[#140D0A] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span aria-live="polite" className="min-w-7 text-center text-xs">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Aumentar quantidade de ${item.name}`}
                            disabled={item.quantity >= item.availableQuantity}
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D28A4C] text-[#140D0A] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right md:text-left">
                        <span className="block text-[10px] text-[#F5F1EB] md:hidden">
                          Total
                        </span>
                        <span className="text-sm font-bold text-[#D28A4C]">
                          {formatEth(itemTotal)} ETH
                        </span>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remover ${item.name} do carrinho`}
                        onClick={() => handleRemoveItem(item.id)}
                        className="justify-self-end text-[#B39463] transition-opacity hover:opacity-70 md:justify-self-start"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M18.8894 9.55409C18.8894 17.5731 20.0437 21.1979 12.2799 21.1979C4.51515 21.1979 5.69324 17.5731 5.69324 9.55409"
                            stroke="#B39463"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M20.3653 6.47981H4.21484"
                            stroke="#B39463"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M15.7148 6.47981C15.7148 6.47981 16.2434 2.7141 12.2891 2.7141C8.33578 2.7141 8.86435 6.47981 8.86435 6.47981"
                            stroke="#B39463"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            <aside className="-mt-3.75 p-5 sm:p-6">
              <h2 className="text-lg font-bold">Resumo do pedido</h2>
              <div className="mt-5">
                <label htmlFor="cart-coupon" className="mb-2 block text-xs text-[#F5F1EB]">
                  Código promocional
                </label>
                <div className="flex overflow-hidden rounded-lg border border-[#D28A4C] bg-[#140D0A]">
                  <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
                    <Tag className="h-4 w-4 shrink-0 text-[#8C7A6B]" />
                    <input
                      id="cart-coupon"
                      value={coupon}
                      onChange={(event) => {
                        setCoupon(event.target.value);
                        setAppliedCoupon(false);
                        setCouponMessage('');
                      }}
                      placeholder="Digite o código promocional..."
                      aria-describedby="coupon-feedback"
                      className="min-w-0 flex-1 bg-transparent py-2.5 text-xs outline-none placeholder:text-[#B39463]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="border-l border-[#D28A4C] bg-[#D28A4C] px-4 text-xs font-bold text-[#140D0A] transition-colors hover:bg-[#E09A5C]"
                  >
                    Aplicar
                  </button>
                </div>
                <p
                  id="coupon-feedback"
                  role={couponMessage.startsWith('Cupom inválido') ? 'alert' : 'status'}
                  className={`mt-2 min-h-4 text-[11px] ${
                    couponMessage.startsWith('Cupom inválido') ? 'text-red-400' : 'text-[#B39463]'
                  }`}
                >
                  {couponMessage || 'Cupom demonstrativo: KURIO10'}
                </p>
                {appliedCoupon && (
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(false);
                      setCouponMessage('Cupom removido.');
                    }}
                    className="text-[11px] text-[#D28A4C] underline underline-offset-2"
                  >
                    Remover cupom
                  </button>
                )}
              </div>

              <dl className="mt-5 space-y-3 border-t border-[#3D2C24] pt-4 text-xs">
                <div className="flex justify-between gap-3 text-[#F5F1EB]">
                  <dt>Subtotal</dt>
                  <dd className="text-[#F5F1EB]">{formatEth(subtotal)} ETH</dd>
                </div>
                <div className="flex justify-between gap-3 text-[#F5F1EB]">
                  <dt>Desconto</dt>
                  <dd className="text-[#F5F1EB]">−{formatEth(discount)} ETH</dd>
                </div>
                <div className="flex justify-between gap-3 text-[#F5F1EB]">
                  <dt>Taxa de rede estimada</dt>
                  <dd className="text-[#F5F1EB]">{formatEth(fee)} ETH</dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-[#3D2C24] pt-4 text-sm font-bold">
                  <dt>Total estimado</dt>
                  <dd className="text-[#D28A4C]">{formatEth(total)} ETH</dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() =>
                  setCheckoutMessage(
                    'O pagamento ainda não está disponível. Seus itens continuam salvos no carrinho.',
                  )
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#D28A4C] px-4 py-3 text-sm font-bold text-[#140D0A] transition-colors hover:bg-[#E09A5C]"
              >
                Conectar e finalizar
                <ArrowRight className="h-4 w-4" />
              </button>
              {checkoutMessage && (
                <p role="status" className="mt-3 text-center text-[10px] leading-4 text-[#8C7A6B]">
                  {checkoutMessage}
                </p>
              )}
              <Link
                to="/market"
                className="mt-4 flex items-center justify-center gap-2 text-sm text-[#D28A4C] transition-colors hover:text-[#F5F1EB]"
              >
                <ArrowLeft className="h-4 w-4" />
                Continuar explorando
              </Link>
            </aside>
          </div>
        )}

        <section className="mt-16 border-t border-[#3D2C24] pt-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[17px] font-bold leading-4 text-[#D28A4C]">
              Colecionadores também viram
            </h2>
            <div className="flex items-center gap-2" aria-label="Páginas de recomendações">
              {recommendationPages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveRecommendations(index)}
                  aria-label={`Mostrar recomendações ${index + 1}`}
                  aria-current={activeRecommendations === index ? 'true' : undefined}
                  className={`h-3 w-3 rounded-full transition-colors ${
                    activeRecommendations === index ? 'bg-[#D28A4C]' : 'bg-[#5A4032]'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {recommendations.map((nft) => (
              <Card
                key={nft.id}
                img={nft.image}
                nameNft={nft.name}
                idNft={nft.id}
                price={nft.price.toFixed(2)}
                previousPrice={nft.previousPrice}
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
