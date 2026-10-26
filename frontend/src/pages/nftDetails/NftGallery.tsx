import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ZoomIn } from 'lucide-react';
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
  <Dialog open={isModalOpen} onOpenChange={onModalOpenChange}>
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
        <DialogTrigger asChild><button
          type="button"
          className="absolute right-3 top-3 rounded-lg bg-[#140D0A]/80 p-2 text-[#D28A4C] transition-colors hover:bg-[#140D0A] cursor-pointer"
          title="Ampliar imagem"
        >
          <ZoomIn className="h-4 w-4" />
        </button></DialogTrigger>
      </div>
    </div>

    <DialogContent aria-describedby={undefined}>
      <DialogTitle className="mb-4 pr-10 text-sm font-bold">Visualização Expandida - {nftName} ({selectedStyle.label})</DialogTitle>
      <img src={baseImage} alt={nftName} style={{ filter: selectedStyle.filter }} className="h-auto max-h-[70vh] w-full rounded-2xl object-contain" />
    </DialogContent>
  </Dialog>
);

export default NftGallery;
