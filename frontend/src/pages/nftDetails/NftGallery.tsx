import { X, ZoomIn } from 'lucide-react';
import { nftStyles } from './productDetailContent';

type NftStyle = (typeof nftStyles)[number];

interface NftGalleryProps {
  baseImage: string;
  nftName: string;
  selectedStyle: NftStyle;
  isModalOpen: boolean;
  onSelectStyle: (style: NftStyle) => void;
  onModalOpenChange: (isOpen: boolean) => void;
}

const NftGallery = ({
  baseImage,
  nftName,
  selectedStyle,
  isModalOpen,
  onSelectStyle,
  onModalOpenChange,
}: NftGalleryProps) => (
  <>
    <div className="flex gap-4 lg:col-span-5">
      <div className="flex flex-col gap-3">
        {nftStyles.map((style) => (
          <button
            key={style.id}
            type="button"
            onClick={() => onSelectStyle(style)}
            className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
              selectedStyle.id === style.id
                ? 'border-[#D28A4C]'
                : 'border-[#3D2C24] opacity-60 hover:opacity-100'
            }`}
            title={style.label}
          >
            <img
              src={baseImage}
              alt={style.label}
              style={{ filter: style.filter }}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      <div className="relative flex-1 overflow-hidden rounded-3xl bg-[#231712] border border-[#3D2C24]">
        <img
          src={baseImage}
          alt={nftName}
          style={{ filter: selectedStyle.filter }}
          className="h-full w-full object-cover aspect-square transition-all duration-300"
        />
        <button
          type="button"
          onClick={() => onModalOpenChange(true)}
          className="absolute right-3 top-3 rounded-lg bg-[#140D0A]/80 p-2 text-[#D28A4C] transition-colors hover:bg-[#140D0A] cursor-pointer"
          title="Ampliar imagem"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>
    </div>

    {isModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="relative max-w-2xl w-full bg-[#231712] p-4 rounded-3xl border border-[#3D2C24]">
          <button
            onClick={() => onModalOpenChange(false)}
            className="absolute right-4 top-4 text-[#CFB28C] hover:text-[#F5F1EB] bg-[#140D0A] p-2 rounded-lg cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
          <h3 className="text-sm font-bold text-[#F5F1EB] mb-4">
            Visualização Expandida - {nftName} ({selectedStyle.label})
          </h3>
          <img
            src={baseImage}
            alt="Zoom NFT"
            style={{ filter: selectedStyle.filter }}
            className="w-full h-auto max-h-[70vh] object-contain rounded-2xl"
          />
        </div>
      </div>
    )}
  </>
);

export default NftGallery;
