import { Link } from '@tanstack/react-router';
import cosmicBloom from '@/assets/img/nfts/cosmic_bloom.webp';
import esmeralApe from '@/assets/img/nfts/esmeral_ape.webp';
import brownNft from '@/assets/img/nfts/brown_nft.webp';
import goldenBeat from '@/assets/img/nfts/golden_beat.webp';

const blogPosts = [
  {
    id: 1,
    image: brownNft,
    date: '12 de setembro',
    readTime: 'Leitura de 6 min',
    title: 'Como funciona a propriedade de NFTs',
    description: 'Aprenda a colecionar, negociar e verificar ativos digitais.',
  },
  {
    id: 2,
    image: esmeralApe,
    date: '13 de setembro',
    readTime: 'Leitura de 2 min',
    title: '10 artistas digitais para acompanhar',
    description: 'Conheça criadores que moldam a cultura digital.',
  },
  {
    id: 3,
    image: cosmicBloom,
    date: '15 de setembro',
    readTime: 'Leitura de 3 min',
    title: 'Raridade, atributos e procedência',
    description: 'Entenda raridade, procedência, direitos autorais e utilidade.',
  },
  {
    id: 4,
    image: goldenBeat,
    date: '15 de setembro',
    readTime: 'Leitura de 2 min',
    title: 'Como proteger sua carteira',
    description: 'Proteja sua carteira, seus ativos e sua identidade.',
  },
];

const BlogSection = () => {
  return (
    <section className="mx-auto max-w-360 px-10 py-16 font-mono lg:px-27.5">
      <div className="text-center">
        <h2 className="text-[28px] font-bold leading-9 text-[#F5F1EB]">Diário da Cunhagem</h2>
        <p className="mt-1 text-[14px] leading-6 text-[#CFB28C]">
          Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {blogPosts.map((post) => (
          <article
            key={post.id}
            className="flex flex-col rounded-2xl bg-[#231712] p-4 border border-transparent transition-all duration-300 hover:border-[#D28A4C] hover:scale-[1.02] cursor-pointer"
          >
            <img
              loading="lazy"
              src={post.image}
              alt={post.title}
              className="mb-4 aspect-4/3 w-full rounded-xl object-cover"
            />
            <div className="text-[12px] font-medium leading-4 text-[#CFB28C]">
              <span>{post.date}</span> | <span>{post.readTime}</span>
            </div>
            <h3 className="mt-2 text-[16px] font-bold leading-5.5 text-[#F5F1EB]">{post.title}</h3>
            <p className="mt-1 text-[12px] leading-4.5 text-[#CFB28C] line-clamp-2">{post.description}</p>
            <Link to="/learn" className="mt-4 text-[12px] font-bold leading-3.5 text-[#D28A4C] hover:underline">
              Ler mais →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
};

export default BlogSection;
