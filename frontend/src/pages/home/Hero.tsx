import { Link } from '@tanstack/react-router';
import HeroImgDigitalArt from '../../assets/img/nfts/esmeral_ape.png';

const Hero = () => {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="mx-auto flex w-full max-w-360 items-center justify-between gap-8 px-10 py-8 font-mono max-lg:flex-col lg:px-27.5 lg:py-10"
    >
      <div className="flex flex-1 flex-col justify-center">
        <p className="mb-2 text-xs font-normal leading-4 text-[#F5F1EB]">
          Bem-vindo à Kurio
        </p>

        <h1
          id="home-hero-title"
          className="w-full text-[43px] font-bold leading-17.5 tracking-normal text-[#F5F1EB]"
        >
          SEJA DONO DO FUTURO DA ARTE DIGITAL
        </h1>

        <p className="mt-2 max-w-139.25 text-[14px] font-normal leading-6 text-[#CFB28C]">
          Descubra NFTs selecionados de criadores emergentes e consagrados.
          Colecione arte digital rara, apoie artistas e tenha uma parte da
          cultura da internet.
        </p>

        <div className="mt-8 flex items-center gap-4.5">
          <Link
            to="/market"
            className="flex h-12 items-center justify-center rounded-md bg-[#D28A4C] px-9 py-4 text-xs font-bold uppercase text-[#140D0A] transition-colors hover:bg-[#E09A5C]"
          >
            EXPLORAR
          </Link>
        </div>

        <div
          aria-hidden="true"
          className="mt-8 flex items-center justify-center gap-2 pr-30 max-lg:pr-0"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#D28A4C]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#D28A4C]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#D28A4C]" />
        </div>
      </div>

      {/* Frame 136 - Imagem Principal */}
      <div className="flex shrink-0 items-center justify-center">
        <img
          src={HeroImgDigitalArt}
          alt="Personagem NFT de macaco usando óculos e jaqueta verde"
          fetchPriority="high"
          className="h-112.5 w-112.5 rounded-3xl object-cover"
        />
      </div>
    </section>
  );
};

export default Hero;