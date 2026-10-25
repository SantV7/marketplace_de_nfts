import { Minus, Plus } from 'lucide-react';
import type { CartItem } from '@/libs/cartStore';
import { formatEth, toEthUnits } from './cartPricing';

interface CartItemListProps {
  items: CartItem[];
  error: string;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

const CartItemList = ({ items, error, onQuantityChange, onRemove }: CartItemListProps) => (
  <section aria-label="Itens no carrinho" className="min-w-0">
    <div className="hidden grid-cols-[minmax(220px,1fr)_100px_130px_100px_40px] gap-4 border-b border-[#3D2C24] px-4 pb-3 text-xs text-[#F5F1EB] md:grid">
      <span>NFT</span>
      <span>Preço</span>
      <span>Edições</span>
      <span>Total</span>
      <span />
    </div>
    {error && (
      <p role="alert" className="mt-4 text-xs text-red-400">
        {error}
      </p>
    )}
    <ul className="space-y-2 max-md:space-y-[17px]">
      {items.map((item) => {
        const itemTotal = toEthUnits(item.price) * BigInt(item.quantity);

        return (
          <li
            key={item.id}
            className="overflow-hidden rounded-[14px] bg-[#241612] pr-3 md:grid md:min-h-17.5 md:grid-cols-[minmax(220px,1fr)_100px_130px_100px_40px] md:items-center md:gap-4 md:rounded-none md:border-b md:border-[#140D0A] md:bg-[#231712] md:px-4 md:py-0 md:pr-6 md:transition-colors md:hover:bg-[#2D1C14]"
          >
            <div className="flex min-h-[82px] min-w-0 items-center gap-2 md:min-h-0 md:gap-3">
              <img
                src={item.image}
                alt={`${item.name}${item.styleLabel && item.styleLabel !== 'Normal' ? ` - ${item.styleLabel}` : ''}`}
                style={{ filter: item.styleFilter ?? 'none' }}
                className="h-[82px] w-[82px] shrink-0 object-cover md:h-14 md:w-14 md:rounded-md"
              />
              <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch py-2 md:block md:self-auto md:py-0">
                <div className="min-w-0 md:hidden">
                  <h2 className="truncate text-xs font-bold leading-4">
                    {item.name} #{String(item.nftId).padStart(3, '0')}
                  </h2>
                  <p className="mt-1 truncate text-xs font-normal leading-4 text-[#B39463]">
                    Edição: {item.edition}
                    {item.styleLabel && item.styleLabel !== 'Normal' && ` · ${item.styleLabel}`}
                  </p>
                </div>
                <div className="hidden min-w-0 md:block">
                  <h2 className="truncate text-sm font-bold leading-4">{item.name}</h2>
                  <p className="mt-1 text-xs font-normal leading-4 text-[#B39463]">
                    #{String(item.nftId).padStart(3, '0')} · {item.edition}
                    {item.styleLabel && item.styleLabel !== 'Normal' && ` · ${item.styleLabel}`}
                  </p>
                </div>
                <div className="flex min-w-0 items-center justify-between gap-1 md:hidden">
                  <span className="truncate text-sm font-bold text-[#D28A4C]">{item.price} ETH</span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      aria-label={`Diminuir quantidade de ${item.name}`}
                      disabled={item.quantity <= 1}
                      onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-[#38221A] text-[#F5F1EB] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span aria-live="polite" className="min-w-3 text-center text-xs">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Aumentar quantidade de ${item.name}`}
                      disabled={item.quantity >= item.availableQuantity}
                      onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-[#38221A] text-[#F5F1EB] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remover ${item.name} do carrinho`}
                      onClick={() => onRemove(item.id)}
                      className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center text-[#B39463] transition-opacity hover:opacity-70"
                    >
                      <svg className="block" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M18.8894 9.55409C18.8894 17.5731 20.0437 21.1979 12.2799 21.1979C4.51515 21.1979 5.69324 17.5731 5.69324 9.55409" stroke="#B39463" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M20.3653 6.47981H4.21484" stroke="#B39463" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M15.7148 6.47981C15.7148 6.47981 16.2434 2.7141 12.2891 2.7141C8.33578 2.7141 8.86435 6.47981 8.86435 6.47981" stroke="#B39463" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden text-right md:block md:text-left">
              <span className="block text-[10px] text-[#F5F1EB] md:hidden">Preço</span>
              <span className="text-sm font-semibold">{item.price} ETH</span>
            </div>
            <div className="hidden items-center justify-between md:flex md:justify-start">
              <span className="text-[10px] text-[#F5F1EB] md:hidden">Edições</span>
              <div className="flex h-9 items-center gap-0.75 rounded-lg border border-[#3D2C24] bg-[#231712] p-0.75">
                <button
                  type="button"
                  aria-label={`Diminuir quantidade de ${item.name}`}
                  disabled={item.quantity <= 1}
                  onClick={() => onQuantityChange(item.id, item.quantity - 1)}
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
                  onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D28A4C] text-[#140D0A] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="hidden text-right md:block md:text-left">
              <span className="block text-[10px] text-[#F5F1EB] md:hidden">Total</span>
              <span className="text-sm font-bold text-[#D28A4C]">{formatEth(itemTotal)} ETH</span>
            </div>
            <button
              type="button"
              aria-label={`Remover ${item.name} do carrinho`}
              onClick={() => onRemove(item.id)}
              className="hidden text-[#B39463] transition-opacity hover:opacity-70 md:block md:justify-self-start"
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
);

export default CartItemList;
