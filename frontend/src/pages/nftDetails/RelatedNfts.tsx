import { useState } from 'react';
import Card from '@/components/nftProduct/Card';
import { useNfts } from '@/services/queries';

const RelatedNfts = ({ excludeId }: { excludeId: string }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const query = useNfts({ limit: 100 });
  const relatedNfts = (query.data?.data ?? []).filter((nft) => String(nft.id) !== excludeId);

  return (
    <div className="mt-16 border-t border-[#3D2C24] pt-8">
      <h2 className="text-[16px] font-bold text-[#D28A4C]">Mais desta coleção</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {relatedNfts.slice(activeSlide * 5, activeSlide * 5 + 5).map((nft) => (
          <Card
            key={nft.id}
            img={nft.image}
            nameNft={nft.name}
            idNft={Number(nft.id)}
            price={nft.price}
          />
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-2" role="group" aria-label="Páginas de NFTs desta coleção">
        {Array.from({ length: Math.ceil(relatedNfts.length / 5) }, (_, slideIndex) => (
          <button
            key={slideIndex}
            type="button"
            onClick={() => setActiveSlide(slideIndex)}
            aria-label={`Mostrar página ${slideIndex + 1} de NFTs`}
            aria-current={activeSlide === slideIndex ? 'true' : undefined}
            className="flex h-6 w-6 items-center justify-center rounded-full cursor-pointer"
          >
            <span className={`h-2.5 w-2.5 rounded-full border border-[#D28A4C] transition-colors ${
              activeSlide === slideIndex
                ? 'bg-[#D28A4C]'
                : 'bg-transparent hover:bg-[#D28A4C]/50'
            }`} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default RelatedNfts;
