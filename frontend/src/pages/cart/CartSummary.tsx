import { ArrowLeft, ArrowRight, Tag } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { formatEth } from './cartPricing';

interface CartSummaryProps {
  coupon: string;
  appliedCoupon: boolean;
  couponMessage: string;
  checkoutMessage: string;
  subtotal: bigint;
  discount: bigint;
  fee: bigint;
  total: bigint;
  onCouponChange: (value: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  onCheckout: () => void;
}

const CartSummary = ({
  coupon,
  appliedCoupon,
  couponMessage,
  checkoutMessage,
  subtotal,
  discount,
  fee,
  total,
  onCouponChange,
  onApplyCoupon,
  onRemoveCoupon,
  onCheckout,
}: CartSummaryProps) => (
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
            onChange={(event) => onCouponChange(event.target.value)}
            placeholder="Digite o código promocional..."
            aria-describedby="coupon-feedback"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-xs outline-none placeholder:text-[#B39463]"
          />
        </div>
        <button
          type="button"
          onClick={onApplyCoupon}
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
          onClick={onRemoveCoupon}
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
      onClick={onCheckout}
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
);

export default CartSummary;
