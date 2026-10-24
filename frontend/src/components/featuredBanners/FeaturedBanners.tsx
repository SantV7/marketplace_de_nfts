import esmeralApe from '@/assets/img/nfts/esmeral_ape.png';
import brownNft from '@/assets/img/nfts/brown_nft.png';

const FeaturedBanners = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 font-mono">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col sm:flex-row items-center justify-between rounded-xl bg-[#231712] p-6 border border-transparent transition-all duration-300 hover:border-[#D28A4C]">
          <div className="w-full sm:w-1/2 mb-4 sm:mb-0">
            <img
              src={esmeralApe}
              alt="Lançamentos gênesis de edição limitada"
              className="h-48 w-full rounded-lg object-cover"
            />
          </div>
          <div className="w-full sm:w-1/2 sm:pl-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-[#F5F1EB]">
                Lançamentos gênesis de edição limitada
              </h3>
              <p className="mt-2 text-xs text-[#CFB28C]">
                Colecione edições escassas diretamente dos criadores antes da revelação pública.
              </p>
            </div>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#D28A4C] px-4 py-2 text-xs font-bold text-[#140D0A] transition-colors hover:bg-[#E09A5C] w-fit"
            >
              Explorar →
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between rounded-xl bg-[#231712] p-6 border border-transparent transition-all duration-300 hover:border-[#D28A4C]">
          <div className="w-full sm:w-1/2 mb-4 sm:mb-0">
            <img
              src={brownNft}
              alt="Arte digital selecionada e muito mais"
              className="h-48 w-full rounded-lg object-cover"
            />
          </div>
          <div className="w-full sm:w-1/2 sm:pl-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-[#F5F1EB]">
                Arte digital selecionada e muito mais
              </h3>
              <p className="mt-2 text-xs text-[#CFB28C]">
                Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.
              </p>
            </div>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#D28A4C] px-4 py-2 text-xs font-bold text-[#140D0A] transition-colors hover:bg-[#E09A5C] w-fit"
            >
              Explorar →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBanners;