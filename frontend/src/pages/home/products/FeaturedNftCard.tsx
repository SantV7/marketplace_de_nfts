import { ClockAlert } from 'lucide-react';
import featuredNft from '@/assets/img/nfts/cosmic_bloom.png';

const FeaturedNftCard = () => (
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
);

export default FeaturedNftCard;
