import { ClockAlert } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useNfts } from '@/services/queries';
import { Skeleton } from '@/components/ui/skeleton';

const FeaturedNftCard = () => {
  const query = useNfts({ tab: 'trending', limit: 1 });
  const nft = query.data?.data[0];
  if (query.isLoading) return <Skeleton className="h-80 rounded-2xl" />;
  if (!nft) return null;
  return <article className="rounded-2xl border border-transparent bg-[#231712] p-4 text-center transition-all hover:border-[#D28A4C]">
    <Link to="/nft/$id" params={{ id: String(nft.id) }}>
      <h2 className="text-[24px] font-bold leading-8 text-[#D28A4C]">NFT EM DESTAQUE</h2>
      <div className="mt-1 flex items-center justify-center gap-1.5">
        <ClockAlert className="h-4 w-4 text-[#D28A4C]" />
        <p className="text-[22px] font-bold leading-4 text-[#F5F1EB]">EM ALTA</p>
      </div>
      <img src={nft.image} alt={nft.name} loading="lazy" className="mx-auto mt-4 aspect-square max-h-62.5 w-full rounded-2xl object-cover" />
    </Link>
  </article>;
};
export default FeaturedNftCard;
