import { SlidersHorizontal } from 'lucide-react';
import { initialPriceRange } from './productData';

interface PriceRange {
  min: number;
  max: number;
}

interface PriceRangeFilterProps {
  draftPriceRange: PriceRange;
  onDraftPriceChange: (range: PriceRange) => void;
  onApplyPriceRange: () => void;
}

const PriceRangeFilter = ({
  draftPriceRange,
  onDraftPriceChange,
  onApplyPriceRange,
}: PriceRangeFilterProps) => {
  const updateMin = (min: number) =>
    onDraftPriceChange({ ...draftPriceRange, min: Number(min.toFixed(2)) });
  const updateMax = (max: number) =>
    onDraftPriceChange({ ...draftPriceRange, max: Number(max.toFixed(2)) });

  return (
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
            onDraftPriceChange({
              ...draftPriceRange,
              min: Math.min(Number(event.target.value), draftPriceRange.max),
            });
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
            onDraftPriceChange({
              ...draftPriceRange,
              max: Math.max(Number(event.target.value), draftPriceRange.min),
            });
          }}
          className="price-range-thumb absolute inset-0 h-4 w-full appearance-none bg-transparent cursor-pointer"
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-[#CFB28C]">
        <div className="flex items-center gap-1.5">
          <span>Mín:</span>
          <button
            type="button"
            onClick={() => updateMin(Math.max(0, draftPriceRange.min - 0.1))}
            className="flex h-5 w-5 items-center justify-center rounded bg-[#140D0A] text-[#D28A4C] hover:bg-[#3D2C24] cursor-pointer"
          >
            -
          </button>
          <span className="font-semibold text-[#F5F1EB]">{draftPriceRange.min.toFixed(2)}</span>
          <button
            type="button"
            onClick={() => updateMin(Math.min(draftPriceRange.max, draftPriceRange.min + 0.1))}
            className="flex h-5 w-5 items-center justify-center rounded bg-[#140D0A] text-[#D28A4C] hover:bg-[#3D2C24] cursor-pointer"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span>Máx:</span>
          <button
            type="button"
            onClick={() => updateMax(Math.max(draftPriceRange.min, draftPriceRange.max - 0.1))}
            className="flex h-5 w-5 items-center justify-center rounded bg-[#140D0A] text-[#D28A4C] hover:bg-[#3D2C24] cursor-pointer"
          >
            -
          </button>
          <span className="font-semibold text-[#F5F1EB]">{draftPriceRange.max.toFixed(2)}</span>
          <button
            type="button"
            onClick={() =>
              updateMax(Math.min(initialPriceRange.max, draftPriceRange.max + 0.1))
            }
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
  );
};

export default PriceRangeFilter;
