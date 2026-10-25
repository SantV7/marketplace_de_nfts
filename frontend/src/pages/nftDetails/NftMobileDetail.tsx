import { useNavigate } from '@tanstack/react-router';
import { Heart, Minus, Plus, Star } from 'lucide-react';
import type { NftDetail } from './productDetailData';
import { totalReviews, type nftStyles } from './productDetailContent';

type NftStyle = (typeof nftStyles)[number];

interface NftMobileDetailProps {
  nftData: NftDetail;
  formattedId: string;
  baseImage: string;
  selectedStyle: NftStyle;
  selectedEdition: string;
  quantity: number;
  availableQuantity: number;
  isFavorite: boolean;
  cartError: string;
  onSelectEdition: (edition: string) => void;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onToggleFavorite: () => void;
}

const NftMobileDetail = ({
  nftData,
  formattedId,
  baseImage,
  selectedStyle,
  selectedEdition,
  quantity,
  availableQuantity,
  isFavorite,
  cartError,
  onSelectEdition,
  onQuantityChange,
  onAddToCart,
  onToggleFavorite,
}: NftMobileDetailProps) => {
  const navigate = useNavigate();

  return (
    <main className="mx-auto min-h-screen w-full max-w-[414px] px-6 pb-8 pt-6 font-mono text-[#F5F1EB] md:hidden">
      <section aria-label={`Detalhes de ${nftData.name}`}>
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => void navigate({ to: '/market' })}
            aria-label="Voltar ao mercado"
            className="flex h-[60px] w-[60px] items-center justify-center rounded-full border border-[#3F2319] bg-[#2F1D15] text-[#B39463] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D28A4C]"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M12.5 4.5L7.5 10L12.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            aria-pressed={isFavorite}
            className="flex h-[60px] w-[60px] items-center justify-center rounded-full border border-[#3F2319] bg-[#2F1D15] text-[#B39463] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D28A4C]"
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-[#D28A4C] text-[#D28A4C]' : ''}`} />
          </button>
        </div>

        <img
          src={baseImage}
          alt={`${nftData.name} #${formattedId}`}
          fetchPriority="high"
          style={{ filter: selectedStyle.filter }}
          className="aspect-square w-full rounded-t-[24px] object-cover"
        />

        <div className="relative -mt-1 rounded-t-[24px] bg-[#241612] px-5 pb-5 pt-7">
          <div className="flex items-center justify-between gap-2">
            <h1 className="min-w-0 truncate text-xl font-bold leading-6 text-[#F5F1EB]">
              {nftData.name} #{formattedId}
            </h1>
            <span className="flex shrink-0 items-center gap-1 rounded-full border border-[#D28A4C] px-2 py-1 text-[13px] leading-4 text-[#CFB28C]">
              <Star className="h-4 w-4 fill-[#D28A4C] text-[#D28A4C]" aria-hidden="true" />
              {nftData.rating.toFixed(1)} ({totalReviews})
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-[#CFB28C]">
            Um colecionável digital {selectedEdition} finalizado à mão da coleção{' '}
            {nftData.collection}, verificado na {nftData.blockchain}.
          </p>

          <div className="mt-4">
            <h2 className="text-[15px] font-bold leading-4 text-[#F5F1EB]">Edição:</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {nftData.editions.map((edition) => (
                <button
                  key={edition}
                  type="button"
                  aria-pressed={selectedEdition === edition}
                  onClick={() => onSelectEdition(edition)}
                  className={`rounded-full border px-2.5 py-1 text-[13px] leading-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D28A4C] ${
                    selectedEdition === edition
                      ? 'border-[#D28A4C] text-[#D28A4C]'
                      : 'border-[#3F2319] text-[#B39463]'
                  }`}
                >
                  {edition}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 space-y-2 text-[15px] leading-5 text-[#B39463]">
            <p>ID do token: #{formattedId}</p>
            <p>Coleção: {nftData.collection}</p>
            <p>Atributos: {nftData.attributes.join(', ')}</p>
          </div>

          <div className="mt-8 rounded-[40px] bg-[#2F1D15] p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[15px] text-[#B39463]">Qtd.</span>
                <button
                  type="button"
                  aria-label="Diminuir quantidade"
                  disabled={quantity <= 1}
                  onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D28A4C] text-[#140D0A] disabled:opacity-50"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <span aria-live="polite" className="min-w-4 text-center text-xl text-[#F5F1EB]">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label={`Aumentar quantidade, máximo ${availableQuantity}`}
                  disabled={quantity >= availableQuantity}
                  onClick={() => onQuantityChange(Math.min(availableQuantity, quantity + 1))}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D28A4C] text-[#140D0A] disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <span className="shrink-0 text-xl font-bold leading-6 text-[#E89B55]">
                {nftData.price.toFixed(2)} ETH
              </span>
            </div>

            <div className="mt-5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={onAddToCart}
                className="flex h-[60px] w-[196px] max-w-[calc(100%-70px)] items-center justify-center rounded-[40px] bg-[linear-gradient(93deg,#D28A4C_-3.96%,rgba(210,138,76,0.8)_121%)] px-5 text-[15px] font-bold text-[#140D0A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5F1EB]"
              >
                Comprar NFT
              </button>
              <button
                type="button"
                onClick={onAddToCart}
                aria-label="Adicionar NFT ao carrinho"
                className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D28A4C]"
              >
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 60 60"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <rect x="0.5" y="0.5" width="59" height="59" rx="29.5" fill="#2F1D15" />
                  <rect x="0.5" y="0.5" width="59" height="59" rx="29.5" stroke="#3F2319" />
                  <path
                    d="M38.3334 26.8012L37.3897 32.7776C37.2182 33.9561 36.2745 34.7136 35.0736 34.7136H26.8383C25.7231 34.7136 24.6937 33.8719 24.5221 32.7776L23.4927 25.7911L23.2353 23.8551C23.1496 23.35 22.7206 23.0133 22.1201 23.0133H21.5196C21.1765 23.0133 20.8334 22.6766 20.8334 22.3399C20.8334 22.0032 21.1765 21.6665 21.5196 21.6665H22.1201C23.3211 21.6665 24.3505 22.5083 24.4363 23.6867L24.6079 25.0335H36.7893C37.2182 25.0335 37.6471 25.2019 37.9045 25.5386C38.2476 25.8753 38.3334 26.3803 38.3334 26.8012Z"
                    fill="#B39463"
                  />
                  <path d="M35.2451 38.3332C35.7189 38.3332 36.103 37.9563 36.103 37.4914C36.103 37.0265 35.7189 36.6497 35.2451 36.6497C34.7714 36.6497 34.3873 37.0265 34.3873 37.4914C34.3873 37.9563 34.7714 38.3332 35.2451 38.3332Z" fill="#B39463" />
                  <path d="M26.6667 38.3332C27.1405 38.3332 27.5246 37.9563 27.5246 37.4914C27.5246 37.0265 27.1405 36.6497 26.6667 36.6497C26.1929 36.6497 25.8089 37.0265 25.8089 37.4914C25.8089 37.9563 26.1929 38.3332 26.6667 38.3332Z" fill="#B39463" />
                </svg>
              </button>
            </div>
            {cartError && (
              <p role="alert" className="mt-3 text-xs text-red-300">
                {cartError}
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default NftMobileDetail;
