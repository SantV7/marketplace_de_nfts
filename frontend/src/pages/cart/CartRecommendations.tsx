import { useState } from 'react';
import Card from '@/components/nftProduct/Card';
import { nfts } from '@/pages/home/products/productData';

const recommendationPages = [nfts.slice(0, 5), nfts.slice(5, 10), nfts.slice(10, 15)];

const CartRecommendations = () => {
  const [activePage, setActivePage] = useState(0);

  return (
    <section className="mt-16 border-t border-[#3D2C24] pt-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[17px] font-bold leading-4 text-[#D28A4C]">
          Colecionadores também viram
        </h2>
        <div className="flex items-center gap-2" aria-label="Páginas de recomendações">
          {recommendationPages.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActivePage(index)}
              aria-label={`Mostrar recomendações ${index + 1}`}
              aria-current={activePage === index ? 'true' : undefined}
              className={`h-3 w-3 rounded-full transition-colors ${
                activePage === index ? 'bg-[#D28A4C]' : 'bg-[#5A4032]'
              }`}
            />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {recommendationPages[activePage].map((nft) => (
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
    </section>
  );
};

export default CartRecommendations;
