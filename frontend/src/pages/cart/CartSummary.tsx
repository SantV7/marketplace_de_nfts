import { ArrowLeft, ArrowRight, Tag } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatEth } from './cartPricing';

interface CartSummaryProps {
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  coupon: string;
  appliedCoupon: boolean;
  couponMessage: string;
  subtotal: bigint;
  discount: bigint;
  fee: bigint;
  total: bigint;
  onCouponChange: (value: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
}

const CartSummary = ({
  loading,
  error,
  onRetry,
  coupon,
  appliedCoupon,
  couponMessage,
  subtotal,
  discount,
  fee,
  total,
  onCouponChange,
  onApplyCoupon,
  onRemoveCoupon,
}: CartSummaryProps) => (
  <aside className="-mx-6 mt-auto rounded-t-[40px] border-x-0 border-b-0 border-t border-[#3D2C24] bg-[#241612] p-5 pb-8 pt-[22px] md:mx-0 md:mt-0 md:rounded-none md:border-0 md:bg-transparent md:p-5 xl:-mt-3.75 xl:p-6">
    <h2 className="hidden text-lg font-bold md:block">Resumo do pedido</h2>
    <div className="md:mt-5">
      <label htmlFor="cart-coupon" className="mb-2 hidden text-xs text-[#F5F1EB] md:block">
        Código promocional
      </label>
      <div className="flex h-[50px] rounded-[40px] border border-[#3F2319] bg-[#241612] shadow-[0_2px_6px_9px_rgba(10,6,4,0.25)] md:h-auto md:rounded-lg md:border-[#D28A4C] md:bg-[#140D0A] md:shadow-none">
        <div className="flex min-w-0 flex-1 items-center gap-2 px-4 md:px-3">
          <Tag className="hidden h-4 w-4 shrink-0 text-[#8C7A6B] md:block" />
          <input
            id="cart-coupon"
            value={coupon}
            onChange={(event) => onCouponChange(event.target.value)}
            placeholder="Digite o código promocional..."
            aria-describedby="coupon-feedback"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-[10px] outline-none placeholder:text-[#B39463] md:text-xs"
          />
        </div>
        <button
          type="button"
          onClick={onApplyCoupon}
          className="flex w-[97px] shrink-0 items-center justify-center gap-[10px] rounded-full bg-[linear-gradient(93deg,rgba(210,138,76,0.54)_0%,#D28A4C_100%)] px-4 text-[10px] font-bold text-[#F5F1EB] transition-colors hover:brightness-110 md:rounded-none md:border-l md:border-[#D28A4C] md:text-xs"
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
        {couponMessage}
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

    {loading ? <div role="status" aria-label="Atualizando cotação" className="my-5 space-y-3">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-6 bg-[#3D2C24]" />)}</div> : error ? <div className="my-5"><p role="alert">Não foi possível validar a cotação. Revise a quantidade e o cupom.</p><Button onClick={onRetry}>Tentar novamente</Button></div> : <dl className="mt-[14px] space-y-[9px] text-xs leading-[14px] md:mt-5 md:space-y-3 md:border-t md:border-[#3D2C24] md:pt-4 md:leading-4">
      <div className="flex justify-between gap-3 text-[#F5F1EB]">
        <dt>Subtotal</dt>
        <dd className="text-[#F5F1EB]">{formatEth(subtotal)} ETH</dd>
      </div>
      <div className="flex justify-between gap-3 text-[#F5F1EB]">
        <dt>Desconto do lançamento</dt>
        <dd className="text-[#F5F1EB]">−{formatEth(discount)} ETH</dd>
      </div>
      <div className="flex justify-between gap-3 text-[#F5F1EB]">
        <dt>Taxa de rede</dt>
        <dd className="text-[#F5F1EB]">{formatEth(fee)} ETH</dd>
      </div>
      <div className="pt-0 text-right text-[10px] text-[#D28A4C] md:pt-1">
        Taxa estimada
      </div>
      <div className="flex justify-between gap-3 border-t border-[#3D2C24] pt-3 text-sm font-bold leading-5 md:pt-4">
        <dt>Total</dt>
        <dd className="text-[#D28A4C]">{formatEth(total)} ETH</dd>
      </div>
    </dl>}

    {!loading && !error && <Link
      to="/payment"
      search={{ coupon: appliedCoupon ? coupon.trim().toUpperCase() : undefined }}
      className="mt-[18px] flex h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[#D28A4C] px-4 text-xs font-bold text-[#140D0A] transition-colors hover:bg-[#E09A5C] md:mt-6 md:h-auto md:rounded-lg md:py-3 md:text-sm"
    >
      Conectar e finalizar
      <ArrowRight className="h-4 w-4" />
    </Link>}
    <Link
      to="/market"
      className="mt-4 hidden items-center justify-center gap-2 text-sm text-[#D28A4C] transition-colors hover:text-[#F5F1EB] md:flex"
    >
      <ArrowLeft className="h-4 w-4" />
      Continuar explorando
    </Link>
  </aside>
);

export default CartSummary;
