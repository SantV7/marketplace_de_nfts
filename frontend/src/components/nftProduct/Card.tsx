import { useFavorites, useToggleFavorite } from '@/services/queries';
import { Link, useNavigate } from '@tanstack/react-router';
import { Heart } from 'lucide-react';

interface NftCardProps {
  img: string;
  nameNft: string;
  idNft: number;
  price: string;
  previousPrice?: string;
  isPriority?: boolean;
}

const Card = ({ img, nameNft, idNft, price, previousPrice, isPriority = false }: NftCardProps) => {
  const navigate = useNavigate();

  const favorites = useFavorites();
  const toggle = useToggleFavorite();
  const active = favorites.data?.includes(idNft) ?? false;

  return (
    <article
      className="group relative min-w-0 font-mono cursor-pointer transition-all duration-300"
    >
      <Link to="/nft/$id" params={{ id: String(idNft) }} aria-label={`Ver ${nameNft} #${String(idNft).padStart(3, '0')}`} className="absolute inset-0 z-10 rounded-2xl" />
      <div className="relative rounded-2xl border border-transparent bg-[#231712] p-1.5 transition-all duration-200 hover:border-[#D28A4C] md:p-3.75">
        <img
          src={img}
          alt={`${nameNft} NFT`}
          loading={isPriority ? 'eager' : 'lazy'}
          fetchPriority={isPriority ? 'high' : 'auto'}
          className="aspect-square h-full w-full rounded-[15px] object-cover"
        />
        <button
          type="button"
          aria-label={`${active ? 'Remover' : 'Adicionar'} ${nameNft} ${active ? 'dos' : 'aos'} favoritos`}
          aria-pressed={active}
          onClick={(event) => {
            event.preventDefault();
            if (!localStorage.getItem('kurio_token')) { void navigate({ to: '/login', search: { redirect: `/nft/${idNft}` } }); return; }
            toggle.mutate({ id: idNft, active });
          }}
          className="absolute z-20 right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#241612]/95 text-[#E89B55] md:hidden"
        >
          <Heart className="h-4 w-4" fill={active ? "currentColor" : "none"} />
        </button>
        {previousPrice && (
          <span className="absolute left-1.5 top-1.5 flex h-8 w-[68px] items-center rounded-r-sm bg-[#D28A4C] px-2 text-[13px] font-medium text-[#140D0A] md:hidden">
            RARO
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-col gap-1 px-1 md:mt-3 md:px-0">
        <h3 className="truncate text-[13px] font-normal leading-4 text-[#F5F1EB] md:text-[15px]">
          {nameNft} #{String(idNft).padStart(3, '0')}
        </h3>
        <p className="flex flex-wrap items-baseline gap-x-2 text-base font-bold leading-4 md:text-base">
          <span className="text-[#D28A4C]">{price} ETH</span>
          {previousPrice && (
            <span className="text-[14px] font-normal text-[#8C7A6B] line-through">{previousPrice} ETH</span>
          )}
        </p>
      </div>
      {toggle.isError && <p role="alert" className="text-xs text-red-300">Não foi possível atualizar os favoritos. Tente novamente.</p>}
    </article>
  );
};

export default Card;
