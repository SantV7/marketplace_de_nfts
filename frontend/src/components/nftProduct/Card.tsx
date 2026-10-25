import { useNavigate } from '@tanstack/react-router';

interface NftCardProps {
  img: string;
  nameNft: string;
  idNft: number;
  price: string;
  previousPrice?: string;
}

const Card = ({ img, nameNft, idNft, price, previousPrice }: NftCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate({ to: '/nft/$id', params: { id: String(idNft) } });
  };

  return (
    <article
      onClick={handleCardClick}
      className="group min-w-0 font-mono cursor-pointer transition-all duration-300"
    >
      <div className="bg-[#231712] p-3.75 rounded-2xl border border-transparent transition-all duration-200 hover:border-sky-300">
        <img
          src={img}
          alt={`${nameNft} NFT`}
          loading="lazy"
          className="aspect-square w-full h-full rounded-[15px] object-cover"
        />
      </div>
      <div className="mt-3 flex flex-col gap-1">
        <h3 className="truncate text-[15px] font-medium leading-4 text-[#F5F1EB]">
          {nameNft} #{String(idNft).padStart(3, '0')}
        </h3>
        <p className="flex flex-wrap items-baseline gap-x-2 text-[18px] font-bold leading-4">
          <span className="text-[#D28A4C]">{price} ETH</span>
          {previousPrice && (
            <span className="text-[14px] font-normal text-[#8C7A6B] line-through">{previousPrice} ETH</span>
          )}
        </p>
      </div>
    </article>
  );
};

export default Card;