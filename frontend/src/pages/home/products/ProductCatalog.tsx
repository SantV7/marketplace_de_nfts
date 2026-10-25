import Card from '@/components/nftProduct/Card';
import { tabs, type Nft, type SortOrder, type TabId } from './productData';
import { ChevronDown, SlidersHorizontal, LayoutGrid, Sparkles, TrendingUp, ChevronLeft, ChevronRight, ImagePlus } from 'lucide-react';

interface ProductCatalogProps {
  products: Nft[];
  activeTab: TabId;
  sortOrder: SortOrder;
  currentPage: number;
  pageCount: number;
  onTabChange: (tab: TabId) => void;
  onSortChange: (order: SortOrder) => void;
  onPageChange: (page: number) => void;
}

const ProductCatalog = ({
  products,
  activeTab,
  sortOrder,
  currentPage,
  pageCount,
  onTabChange,
  onSortChange,
  onPageChange,
}: ProductCatalogProps) => {
  const getTabIcon = (id: TabId) => {
    switch (id) {
      case 'all':
        return <LayoutGrid className="h-3.5 w-3.5" />;
      case 'new':
        return <Sparkles className="h-3.5 w-3.5" />;
      case 'trending':
        return <TrendingUp className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-w-0 font-mono">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div
          className="flex flex-wrap items-center gap-x-6 gap-y-2"
          role="tablist"
          aria-label="Tipo de listagem"
        >
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => onTabChange(id)}
              className={`flex items-center gap-2 border-b-2 pb-1 text-[15px] font-medium leading-4 transition-colors cursor-pointer ${
                activeTab === id
                  ? 'border-[#D28A4C] font-bold text-[#D28A4C]'
                  : 'border-transparent text-[#F5F1EB] hover:text-[#D28A4C]'
              }`}
            >
              {getTabIcon(id)}
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-[#CFB28C]">
          <span className="flex items-center gap-1.5 whitespace-nowrap text-[15px] font-medium leading-4 text-[#F5F1EB]">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#D28A4C]" />
            Ordenar por:
          </span>
          <div className="relative inline-block">
            <select
              value={sortOrder}
              onChange={(event) => {
                const value = event.currentTarget.value;
                if (value === 'recent' || value === 'price-asc' || value === 'price-desc') {
                  onSortChange(value);
                }
              }}
              className="appearance-none cursor-pointer rounded-lg bg-[#231712] px-3 py-2 pr-9 text-[15px] font-medium leading-4 text-[#F5F1EB] border border-[#3D2C24] transition-all hover:border-[#D28A4C] focus:outline-none focus:ring-1 focus:ring-[#D28A4C]"
            >
              <option value="recent" className="bg-[#231712] text-[#F5F1EB]">Listados recentemente</option>
              <option value="price-asc" className="bg-[#231712] text-[#F5F1EB]">Preço: menor para maior</option>
              <option value="price-desc" className="bg-[#231712] text-[#F5F1EB]">Preço: maior para menor</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#D28A4C]">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 min-[520px]:grid-cols-2 xl:grid-cols-3">
          {products.map((nft) => (
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
      ) : (
        currentPage === 3 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#3D2C24] px-6 text-center">
            <ImagePlus className="h-10 w-10 text-[#D28A4C]" aria-hidden="true" />
            <h2 className="text-[16px] font-bold text-[#F5F1EB]">
              Ainda não há NFTs nesta seção
            </h2>
            <p className="max-w-md text-xs leading-relaxed text-[#CFB28C]">
              Ainda não adicionamos mais NFTs nesta seção. Volte em breve para conferir as próximas novidades.
            </p>
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-[#CFB28C]">
            Nenhum NFT encontrado com esses filtros.
          </p>
        )
      )}

      <nav aria-label="Paginação de produtos" className="mt-8 flex items-center justify-end gap-2">
        {currentPage > 1 && (
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            className="flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs border border-[#4A3024] text-[#CFB28C] hover:border-[#D28A4C] transition-colors cursor-pointer"
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            type="button"
            aria-current={currentPage === page ? 'page' : undefined}
            onClick={() => onPageChange(page)}
            className={`h-8 min-w-8 rounded-lg px-2 text-xs cursor-pointer ${
              currentPage === page
                ? 'bg-[#D28A4C] font-bold text-[#140D0A]'
                : 'border border-[#4A3024] text-[#CFB28C] hover:border-[#D28A4C]'
            }`}
          >
            {page}
          </button>
        ))}

        {currentPage < pageCount && (
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            className="flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs border border-[#4A3024] text-[#CFB28C] hover:border-[#D28A4C] transition-colors cursor-pointer"
            aria-label="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </nav>
    </div>
  );
};

export default ProductCatalog;