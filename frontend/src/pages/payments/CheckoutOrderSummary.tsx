import type { CartItem } from '@/services/contracts';
import { formatEth, toEthUnits } from '@/pages/cart/cartPricing';
import { walletProviders, type WalletProviderId } from './paymentData';
import { Link } from '@tanstack/react-router';

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  subtotal: bigint;
  discount: bigint;
  fee: bigint;
  total: bigint;
  selectedProvider: WalletProviderId;
  onProviderChange: (provider: WalletProviderId) => void;
  confirmationMessage: string;
  couponApplied: boolean;
}

const CheckoutOrderSummary = ({
  items,
  subtotal,
  discount,
  fee,
  total,
  selectedProvider,
  onProviderChange,
  confirmationMessage,
  couponApplied,
}: CheckoutOrderSummaryProps) => (
  <aside className="min-w-0">
    <h2 className="text-[15px] font-bold leading-5">Seus NFTs</h2>
    <div className="mt-2 flex items-center justify-between border-b border-[#3D2C24] pb-2 text-xs text-[#F5F1EB]">
      <span>NFTs</span>
      <span>Subtotal</span>
    </div>
    <ul className="space-y-2 pt-2">
      {items.map((item) => {
        const itemTotal = toEthUnits(item.price) * BigInt(item.quantity);
        return (
          <li
            key={item.id}
            className="flex min-w-0 items-center gap-2 rounded-sm bg-[#231712] p-2"
          >
            <img
              src={item.image}
              alt=""
              style={{ filter: item.styleFilter ?? 'none' }}
              className="h-14 w-14 shrink-0 rounded-md object-cover"
            />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-xs font-bold text-[#F5F1EB]">
                {item.name} #{String(item.nftId).padStart(3, '0')}
              </h3>
              <p className="mt-1 truncate text-[11px] text-[#B39463]">
                ID do token: #{String(item.nftId).padStart(4, '0')} <span className="px-1">(x {item.quantity})</span>
              </p>
            </div>
            <span className="shrink-0 text-xs font-bold text-[#D28A4C]">
              {formatEth(itemTotal)} ETH
            </span>
          </li>
        );
      })}
    </ul>

    <div className="mt-3 space-y-2 text-xs">
      <Link
        to="/cart"
        className="block text-center text-[#F5F1EB] transition-colors hover:text-[#D28A4C]"
      >
        {couponApplied ? 'Cupom KURIO10 aplicado' : 'Tem um código promocional? Aplique aqui'}
      </Link>
      <dl className="space-y-2">
        <div className="flex justify-between gap-3">
          <dt>Subtotal</dt>
          <dd>{formatEth(subtotal)} ETH</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Desconto do lançamento</dt>
          <dd>(−) {formatEth(discount)} ETH</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Taxa de rede</dt>
          <dd>{formatEth(fee)} ETH</dd>
        </div>
      </dl>
      <p className="border-b border-[#3D2C24] pb-1 text-center text-[10px] text-[#D28A4C]">
        Taxa estimada
      </p>
      <dl className="flex justify-between gap-3 border-t border-[#3D2C24] pt-3 text-sm font-bold">
        <dt>Total</dt>
        <dd className="text-[#D28A4C]">{formatEth(total)} ETH</dd>
      </dl>
    </div>

    <section className="mt-4" aria-labelledby="wallet-options-heading">
      <h2 id="wallet-options-heading" className="mb-3 text-center text-[17px] font-bold">
        Carteira e rede
      </h2>
      <fieldset className="space-y-2">
        <legend className="sr-only">Selecione o tipo de carteira</legend>
        {walletProviders.map((provider, index) => (
          <label
            key={provider.id}
            className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-[3px] border px-3 transition-colors ${
              selectedProvider === provider.id
                ? 'border-[#D28A4C]'
                : 'border-[#3D2C24] hover:border-[#8C5A32]'
            }`}
          >
            {index === 0 ? (
              <span className="rounded-md bg-[#4A2A12] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#D28A4C]">
                MetaMask&nbsp; · &nbsp;WalletConnect&nbsp; · &nbsp;Coinbase
              </span>
            ) : (
              <span className="text-xs text-[#F5F1EB]">{provider.name}</span>
            )}
            <input
              type="radio"
              name="paymentProvider"
              value={provider.id}
              required
              checked={selectedProvider === provider.id}
              onChange={() => onProviderChange(provider.id)}
              className="h-3.5 w-3.5 accent-[#D28A4C]"
            />
          </label>
        ))}
      </fieldset>
    </section>

    <button
      type="submit"
      className="mt-5 flex h-11 w-full items-center justify-center rounded-lg bg-[#D28A4C] px-4 text-xs font-bold text-[#140D0A] transition-colors hover:bg-[#E09A5C]"
    >
      Confirmar compra
    </button>
    {confirmationMessage && (
      <p role="status" className="mt-3 text-center text-[11px] leading-4 text-[#B39463]">
        {confirmationMessage}
      </p>
    )}
  </aside>
);

export default CheckoutOrderSummary;
