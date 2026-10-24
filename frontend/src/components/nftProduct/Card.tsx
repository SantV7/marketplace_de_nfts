interface NftCardProps {
  img: string;
  nameNft: string;
  idNft: number;
  price: string;
  previousPrice?: string;
}

const Card = ({ img, nameNft, idNft, price, previousPrice }: NftCardProps) => {
  return (
    <article className="group min-w-0 font-mono cursor-pointer transition-all duration-300">
      <div className="bg-[#231712] p-1.5 rounded-xl border border-transparent transition-all duration-200 hover:border-sky-300">
        <img
          src={img}
          alt={`${nameNft} NFT`}
          loading="lazy"
          className="aspect-square w-[calc(100%-15px)] h-[calc(100%-15px)] mx-auto rounded-xl object-cover"
        />
      </div>
      <div className="mt-2 flex flex-col gap-1">
        <h3 className="truncate text-xs text-[#F5F1EB]">
          {nameNft} #{String(idNft).padStart(3, '0')}
        </h3>
        <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="font-bold text-[#D28A4C]">{price} ETH</span>
          {previousPrice && (
            <span className="text-xs text-[#8C7A6B] line-through">{previousPrice} ETH</span>
          )}
        </p>
      </div>
    </article>
  );
};

export default Card;