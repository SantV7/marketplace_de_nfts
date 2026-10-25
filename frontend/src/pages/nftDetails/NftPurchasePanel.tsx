import { Heart, Mail, Minus, Plus, Share2, Star } from 'lucide-react';
import type { NftDetail } from './productDetailData';
import type { nftStyles } from './productDetailContent';
import { totalReviews } from './productDetailContent';

type NftStyle = (typeof nftStyles)[number];
type Edition = NftDetail['editions'][number];

interface NftPurchasePanelProps {
  nftData: NftDetail;
  formattedId: string;
  selectedStyle: NftStyle;
  selectedEdition: Edition;
  quantity: number;
  availableQuantity: number;
  isFavorite: boolean;
  cartError: string;
  onSelectEdition: (edition: Edition) => void;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onToggleFavorite: () => void;
}

const NftPurchasePanel = ({
  nftData,
  formattedId,
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
}: NftPurchasePanelProps) => (
  <div className="flex flex-col justify-between lg:col-span-7">
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold leading-9 text-[#F5F1EB]">
          {nftData.name} #{formattedId}
        </h1>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <span className="text-[24px] font-bold leading-8 text-[#D28A4C]">{nftData.price} ETH</span>
        <div className="flex items-center gap-1 text-[12px] text-[#CFB28C]">
          <div className="flex text-[#D28A4C]">
            {[...Array(5)].map((_, index) => (
              <Star key={index} className="h-3.5 w-3.5 fill-[#D28A4C]" />
            ))}
          </div>
          <span>{totalReviews} avaliações de colecionadores</span>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-[14px] font-bold text-[#F5F1EB]">Sobre este NFT:</h2>
        <p className="mt-2 text-[14px] leading-6 text-[#CFB28C]">
          {nftData.description} Estilo aplicado:{' '}
          <span className="text-[#D28A4C] font-bold">{selectedStyle.label}</span>.
        </p>
      </div>

      <div className="mt-6">
        <h2 className="text-[14px] font-bold text-[#F5F1EB]">Edição:</h2>
        <div className="mt-2 flex gap-2">
          {nftData.editions.map((edition) => (
            <button
              key={edition}
              type="button"
              onClick={() => onSelectEdition(edition)}
              className={`rounded-[20px] px-4 py-1.5 text-[12px] font-semibold border transition-all cursor-pointer ${
                selectedEdition === edition
                  ? 'border-[#D28A4C] bg-[#D28A4C] text-[#140D0A]'
                  : 'border-[#3D2C24] bg-[#231712] text-[#CFB28C] hover:border-[#D28A4C]'
              }`}
            >
              {edition}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center rounded-xl bg-[#231712] border border-[#3D2C24] h-12">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            aria-label="Diminuir quantidade"
            disabled={quantity <= 1}
            className="p-3 text-[#D28A4C] hover:text-[#F5F1EB] cursor-pointer"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span aria-live="polite" className="px-3 text-[14px] font-bold text-[#F5F1EB]">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(Math.min(availableQuantity, quantity + 1))}
            aria-label={`Aumentar quantidade, máximo ${availableQuantity}`}
            disabled={quantity >= availableQuantity}
            className="p-3 text-[#D28A4C] hover:text-[#F5F1EB] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onAddToCart}
          className="flex-1 h-12 rounded-xl bg-[#D28A4C] px-6 text-[14px] font-bold text-[#140D0A] transition-colors hover:bg-[#E09A5C] cursor-pointer"
        >
          COMPRAR
        </button>

        <button
          type="button"
          onClick={onToggleFavorite}
          className={`flex h-12 items-center gap-2 rounded-xl border px-5 text-[14px] transition-colors cursor-pointer ${
            isFavorite
              ? 'border-[#D28A4C] bg-[#D28A4C]/10 text-[#D28A4C]'
              : 'border-[#3D2C24] bg-[#231712] text-[#CFB28C] hover:border-[#D28A4C]'
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-[#D28A4C]' : ''}`} />
          Favoritar
        </button>
      </div>
      {cartError && (
        <p role="alert" className="mt-3 text-xs text-red-400">
          {cartError}
        </p>
      )}

      <div className="mt-6 space-y-1.5 text-[12px] text-[#CFB28C]">
        <p><span className="text-[#F5F1EB]">ID do token:</span> #{formattedId}</p>
        <p><span className="text-[#F5F1EB]">Coleção:</span> <span className="text-[#D28A4C]">{nftData.collection}</span></p>
        <p><span className="text-[#F5F1EB]">Atributos:</span> {nftData.attributes.join(', ')}, Estilo: {selectedStyle.label}</p>
      </div>

      <div className="mt-6 flex items-center gap-3 text-[12px] text-[#CFB28C]">
        <span className="flex items-center gap-1">
          <Share2 className="h-3.5 w-3.5 text-[#D28A4C]" /> Compartilhar este NFT:
        </span>
        <div className="flex gap-2 text-[#D28A4C]">
          <svg className="h-4 w-4 cursor-pointer hover:opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
          <Mail className="h-4 w-4 cursor-pointer hover:opacity-80" />
          <svg className="h-4 w-4 cursor-pointer hover:opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
        </div>
      </div>
    </div>
  </div>
);

export default NftPurchasePanel;
