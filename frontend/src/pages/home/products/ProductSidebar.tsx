import Category from '@/components/nftProduct/Category';
import { Layers, Network, X } from 'lucide-react';
import { categories, networks } from './productData';
import FeaturedNftCard from './FeaturedNftCard';
import PriceRangeFilter from './PriceRangeFilter';

interface PriceRange {
  min: number;
  max: number;
}

interface ProductSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
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
  mobileOpen = false,
  onMobileClose,
  selectedCategory,
  selectedNetworks,
  draftPriceRange,
  onSelectCategory,
  onToggleNetwork,
  onDraftPriceChange,
  onApplyPriceRange,
}: ProductSidebarProps) => (
  <aside
    className={`w-full shrink-0 flex-col gap-6 font-mono md:flex md:max-w-67.5 ${
      mobileOpen ? 'flex' : 'hidden'
    }`}
  >
    <div className="rounded-2xl bg-[#231712] p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between">
      <h2 className="mb-0 flex items-center gap-2 text-[15px] font-medium leading-4 text-[#F5F1EB]">
        <Layers className="h-4 w-4 text-[#D28A4C]" />
        Coleções
      </h2>
        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Fechar filtros"
            className="rounded p-2 text-[#D28A4C] md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
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

      <PriceRangeFilter
        draftPriceRange={draftPriceRange}
        onDraftPriceChange={onDraftPriceChange}
        onApplyPriceRange={onApplyPriceRange}
      />

      <div className="mt-8">
        <h3 className="mb-3 flex items-center gap-2 text-[15px] font-medium leading-4 text-[#F5F1EB]">
          <Network className="h-4 w-4 text-[#D28A4C]" />
          Rede
        </h3>
        <div className="space-y-1">
          {networks.map(({ name, count }) => (
            <div key={name} className="flex items-center justify-between gap-2">
              <button
                type="button"
                aria-pressed={selectedNetworks.includes(name)}
                onClick={() => onToggleNetwork(name)}
                className={`flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left text-xs transition-colors ${
                  selectedNetworks.includes(name)
                    ? 'text-[#D28A4C]'
                    : 'text-[#CFB28C] hover:text-[#F5F1EB]'
                }`}
              >
                <span>{name}</span>
                <span>({count})</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>

    <FeaturedNftCard />
  </aside>
);

export default ProductSidebar;
