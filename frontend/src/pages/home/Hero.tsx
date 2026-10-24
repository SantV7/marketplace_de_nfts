import { Link } from '@tanstack/react-router';
import HeroImgDigitalArt from '../../assets/img/nfts/hero_logo.png';

const Hero = () => {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="mx-auto grid w-full max-w-[1440px] items-center gap-8 px-10 py-8 font-mono 
      md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] md:gap-10 lg:px-16 lg:py-10"
    >
      <div className="flex min-w-0 flex-col md:self-stretch md:py-8">
        <p className="mb-3 text-xs tracking-[0.1em] text-[#F5F1EB]">
          Bem-vindo à Kurio
        </p>
        <h1
          id="home-hero-title"
          className="max-w-[600px] text-4xl font-bold leading-tight text-[#F5F1EB] lg:text-[43px]"
        >
          SEJA DONO DO FUTURO DA ARTE DIGITAL
        </h1>
        <p className="mt-2 max-w-[600px] text-sm leading-6 text-[#CFB28C]">
          Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione
          arte digital rara, apoie artistas e tenha uma parte da cultura da internet.
        </p>
        <Link
          to="/market"
          className="mt-6 inline-flex h-10 w-[120px] items-center justify-center rounded-[6px]
           bg-[#D28A4C] text-sm font-bold uppercase text-[#140D0A] transition-colors 
           hover:bg-[#E09A5C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 
           focus-visible:outline-[#D28A4C]"
        >
          Explorar
        </Link>
        <div
          aria-hidden="true"
          className="flex justify-center gap-2 pl-17 pr-0 md:mt-auto -translate-y-[30px]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#D28A4C]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#D28A4C]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#D28A4C]" />
        </div>
      </div>

      <img
        src={HeroImgDigitalArt}
        alt="Personagem NFT de macaco usando óculos e jaqueta verde"
        fetchPriority="high"
        className="mx-auto aspect-square w-full max-w-[450px] rounded-3xl object-cover"
      />
    </section>
  );
};

export default Hero;