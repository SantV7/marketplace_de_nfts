import { Link } from '@tanstack/react-router';
import HeroImgDigitalArt from '../../assets/img/nfts/esmeral_ape.webp';
import NomadImg from '../../assets/img/nfts/cosmic_bloom.webp';
import { Bitcoin } from 'lucide-react';

const Hero = () => {
  return (
    <>
      <section
        aria-labelledby="home-hero-title"
        className="mx-auto hidden w-full max-w-360 items-center justify-between gap-8 px-10 py-8 font-mono max-lg:flex-col md:flex lg:px-27.5 lg:py-10"
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
              <Bitcoin size={19} />
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

        <div className="flex shrink-0 items-center justify-center">
          <img
            src={HeroImgDigitalArt}
            alt="Personagem NFT de macaco usando óculos e jaqueta verde"
            fetchPriority="high"
            className="h-112.5 w-112.5 rounded-3xl object-cover"
          />
        </div>
      </section>

      <section
        aria-label="Destaque da Kurio"
        className="relative mx-auto h-[190px] w-[calc(100%-48px)] max-w-[366px] overflow-hidden rounded-[30px] bg-[linear-gradient(115deg,#5E3B25_0%,#3B261B_49%,#241612_100%)] px-3 py-2 font-mono md:hidden"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 top-[-78px] h-[250px] w-[220px] rounded-full bg-[linear-gradient(155deg,rgba(221,154,95,0.43),rgba(210,138,76,0.04))]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-70px] top-[-55px] h-[240px] w-[240px] rounded-full bg-[linear-gradient(155deg,rgba(221,154,95,0.37),rgba(210,138,76,0))]"
        />
        <div className="relative z-10 w-[58%]">
          <p className="text-xs leading-4 text-[#F5F1EB]">Bem-vindo à Kurio</p>
          <h1
            id="home-hero-title-mobile"
            className="mt-1 text-[18px] font-bold leading-[25px] text-[#F5F1EB]"
          >
            SEJA DONO DA CULTURA DIGITAL
          </h1>
          <p className="mt-2 text-[12px] leading-4 text-[#CFB28C]">
            Descubra NFTs selecionados de criadores do mundo todo.
          </p>
          <Link
            to="/market"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#E89B55]"
          >
            EXPLORAR <span aria-hidden="true">→</span>
          </Link>
        </div>
        <img
          src={HeroImgDigitalArt}
          alt="NFT de macaco usando óculos e jaqueta verde"
          fetchPriority="high"
          className="absolute right-3 top-2 h-[136px] w-[136px] rounded-[15px] object-cover"
        />
        <img
          src={NomadImg}
          alt=""
          className="absolute right-[78px] top-[104px] z-10 h-[60px] w-[60px] rounded-full border-2 border-[#3B261B] object-cover"
        />
        <div aria-hidden="true" className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E89B55]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#E89B55]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#E89B55]" />
        </div>
      </section>
    </>
  );
};

export default Hero;
