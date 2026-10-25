import Category from '@/components/nftProduct/Category';
import featuredNft from '@/assets/img/nfts/cosmic_bloom.png';
import { categories, initialPriceRange, networks } from './productData';
import { ClockAlert, Layers, Network, SlidersHorizontal } from 'lucide-react';

interface PriceRange {
  min: number;
  max: number;
}

interface ProductSidebarProps {
  selectedCategory: string | null;
  selectedNetworks: string[];
  draftPriceRange: PriceRange;
  priceRange: PriceRange;
  onSelectCategory: (category: string) => void;
  onToggleNetwork: (network: string) => void;
  onDraftPriceChange: (range: PriceRange) => void;
  onApplyPriceRange: () => void;
}

const ProductSidebar = ({
  selectedCategory,
  draftPriceRange,
  onSelectCategory,
  onDraftPriceChange,
  onApplyPriceRange,
}: ProductSidebarProps) => {
  const handleDecrementMin = () => {
    const newMin = Math.max(0, draftPriceRange.min - 0.1);
    const updated = { ...draftPriceRange, min: Number(newMin.toFixed(2)) };
    onDraftPriceChange(updated);
  };

  const handleIncrementMin = () => {
    const newMin = Math.min(draftPriceRange.max, draftPriceRange.min + 0.1);
    const updated = { ...draftPriceRange, min: Number(newMin.toFixed(2)) };
    onDraftPriceChange(updated);
  };

  const handleDecrementMax = () => {
    const newMax = Math.max(draftPriceRange.min, draftPriceRange.max - 0.1);
    const updated = { ...draftPriceRange, max: Number(newMax.toFixed(2)) };
    onDraftPriceChange(updated);
  };

  const handleIncrementMax = () => {
    const newMax = Math.min(initialPriceRange.max, draftPriceRange.max + 0.1);
    const updated = { ...draftPriceRange, max: Number(newMax.toFixed(2)) };
    onDraftPriceChange(updated);
  };

  return (
    <aside className="flex w-full max-w-67.5 shrink-0 flex-col gap-6 font-mono">
      <div className="bg-[#231712] p-6 rounded-2xl">
        <h2 className="mb-4 flex items-center gap-2 text-[15px] font-medium leading-4 text-[#F5F1EB]">
          <Layers className="h-4 w-4 text-[#D28A4C]" />
          Coleções
        </h2>
        <div className="space-y-1">
          {categories.map(({ name, count }) => (
            <Category
              key={name}
              categoryName={name}
              quantityNft={count}
              isActive={selectedCategory === name}
              onSelect={() => onSelectCategory(name)}
            />
          ))}
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[15px] font-medium leading-4 text-[#F5F1EB]">
              <SlidersHorizontal className="h-4 w-4 text-[#D28A4C]" />
              Faixa de preço
            </h3>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-[#CFB28C]">Min/Max</span>
            </div>
          </div>

          <div className="relative mt-4 h-4">
            <div className="absolute left-1 right-1 top-1/2 h-1 -translate-y-1/2 bg-[#D28A4C] rounded-full" />
            <input
              type="range"
              aria-label="Preço mínimo em ETH"
              min="0"
              max={initialPriceRange.max}
              step="0.01"
              value={draftPriceRange.min}
              onChange={(event) => {
                const updated = {
                  ...draftPriceRange,
                  min: Math.min(Number(event.target.value), draftPriceRange.max),
                };
                onDraftPriceChange(updated);
              }}
              className="price-range-thumb absolute inset-0 h-4 w-full appearance-none bg-transparent cursor-pointer"
            />
            <input
              type="range"
              aria-label="Preço máximo em ETH"
              min="0"
              max={initialPriceRange.max}
              step="0.01"
              value={draftPriceRange.max}
              onChange={(event) => {
                const updated = {
                  ...draftPriceRange,
                  max: Math.max(Number(event.target.value), draftPriceRange.min),
                };
                onDraftPriceChange(updated);
              }}
              className="price-range-thumb absolute inset-0 h-4 w-full appearance-none bg-transparent cursor-pointer"
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-[#CFB28C]">
            <div className="flex items-center gap-1.5">
              <span>Mín:</span>
              <button
                type="button"
                onClick={handleDecrementMin}
                className="flex h-5 w-5 items-center justify-center rounded bg-[#140D0A] text-[#D28A4C] hover:bg-[#3D2C24] cursor-pointer"
              >
                -
              </button>
              <span className="font-semibold text-[#F5F1EB]">{draftPriceRange.min.toFixed(2)}</span>
              <button
                type="button"
                onClick={handleIncrementMin}
                className="flex h-5 w-5 items-center justify-center rounded bg-[#140D0A] text-[#D28A4C] hover:bg-[#3D2C24] cursor-pointer"
              >
                +
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span>Máx:</span>
              <button
                type="button"
                onClick={handleDecrementMax}
                className="flex h-5 w-5 items-center justify-center rounded bg-[#140D0A] text-[#D28A4C] hover:bg-[#3D2C24] cursor-pointer"
              >
                -
              </button>
              <span className="font-semibold text-[#F5F1EB]">{draftPriceRange.max.toFixed(2)}</span>
              <button
                type="button"
                onClick={handleIncrementMax}
                className="flex h-5 w-5 items-center justify-center rounded bg-[#140D0A] text-[#D28A4C] hover:bg-[#3D2C24] cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-[#CFB28C]">
            Preço: {draftPriceRange.min.toFixed(2)} – {draftPriceRange.max.toFixed(2)} ETH
          </p>

          <button
            type="button"
            onClick={onApplyPriceRange}
            className="mt-3 w-full rounded-lg bg-[#D28A4C] px-3 py-2 text-[16px] font-bold leading-6.5 text-[#140D0A] transition-colors hover:bg-[#E09A5C] cursor-pointer"
          >
            Aplicar
          </button>
        </div>

        <div className="mt-8">
          <h3 className="mb-3 flex items-center gap-2 text-[15px] font-medium leading-4 text-[#F5F1EB]">
            <Network className="h-4 w-4 text-[#D28A4C]" />
            Rede
          </h3>
          <div className="space-y-1">
            {networks.map(({ name, count }) => (
              <div
                key={name}
                className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs text-[#CFB28C]"
              >
                <span>{name}</span>
                <span>({count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <article className="bg-[#231712] p-4 text-center rounded-2xl cursor-pointer border border-transparent transition-all duration-300 hover:border-sky-400 hover:scale-[1.02]">
        <h2 className="text-[24px] font-bold leading-8 text-[#D28A4C]">NFT EM DESTAQUE</h2>
        <div className="mt-1 flex items-center justify-center gap-1.5">
          <ClockAlert className="h-4 w-4 text-[#D28A4C]" />
          <p className="text-[22px] font-bold leading-4 text-[#F5F1EB]">OFERTA LIMITADA</p>
        </div>
        <img
          src={featuredNft}
          alt="NFT Sage Nomad em destaque"
          loading="lazy"
          className="mx-auto mt-4 aspect-square w-full rounded-2xl object-cover max-h-62.5"
        />
      </article>
    </aside>
  );
};

export default ProductSidebar;