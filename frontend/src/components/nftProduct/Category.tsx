interface CategoryNftProps {
  categoryName: string;
  quantityNft: number;
  isActive?: boolean;
  onSelect?: () => void;
}

const Category = ({
  categoryName,
  quantityNft,
  isActive = false,
  onSelect,
}: CategoryNftProps) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={onSelect ? isActive : undefined}
      style={{ transitionDuration: '0.26s' }}
      className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded px-2 py-1.5 text-left font-mono text-xs transition-colors ${
        isActive
          ? 'text-[#D28A4C] font-semibold border-b-[3px] border-[#D28A4C]'
          : 'text-[#CFB28C] border-b-[3px] border-transparent hover:bg-[#140D0A]/40 hover:text-[#F5F1EB]'
      }`}
    >
      <span>{categoryName || 'Não listado'}</span>
      <span className="shrink-0">({quantityNft})</span>
    </button>
  );
};

export default Category;