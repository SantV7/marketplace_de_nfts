import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import {
  Star,
  Heart,
  Minus,
  Plus,
  Share2,
  Mail,
  ZoomIn,
  X,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import Card from '@/components/nftProduct/Card';
import { getNftDetailById } from './productDetailData';
import cosmicBloom from '@/assets/img/nfts/cosmic_bloom.png';
import brownNft from '@/assets/img/nfts/brown_nft.png';
import goldenBeat from '@/assets/img/nfts/golden_beat.png';

const relatedNfts = [
  { id: '118', name: 'Cosmic Bloom', price: '1.29', image: cosmicBloom },
  { id: '314', name: 'Violet Nomad', price: '1.39', image: cosmicBloom },
  { id: '088', name: 'Ivory Baron', price: '1.79', image: brownNft },
  { id: '207', name: 'Golden Beat', price: '0.99', image: goldenBeat },
  { id: '160', name: 'Golden Signal', price: '0.39', image: goldenBeat },
];

const nftStyles = [
  { id: 'normal', label: 'Normal', filter: 'none' },
  { id: 'platinum', label: 'Platinada', filter: 'grayscale(100%) brightness(1.2)' },
  { id: 'gold', label: 'Dourada', filter: 'sepia(100%) hue-rotate(-30deg) saturate(250%)' },
  { id: 'saturated', label: 'Saturada (+30%)', filter: 'saturate(130%)' },
];

const ProductDetail = () => {
  const { id } = useParams({ from: '/nft/$id' });
  return <ProductDetailContent key={id} id={id} />;
};

const ProductDetailContent = ({ id }: { id: string }) => {
  const navigate = useNavigate();

  const nftData = getNftDetailById(id);
  const [selectedStyle, setSelectedStyle] = useState(nftStyles[0]);
  const [selectedEdition, setSelectedEdition] = useState('1/50');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Tela tratada para NFT Inexistente (conforme requisito do desafio)
  if (!nftData) {
    return (
      <div className="min-h-screen bg-[#140D0A] flex flex-col justify-between">
        <Navbar />
        <div className="mx-auto max-w-md px-4 py-20 text-center font-mono text-[#F5F1EB]">
          <div className="flex justify-center mb-4 text-[#D28A4C]">
            <AlertCircle className="h-16 w-16" />
          </div>
          <h1 className="text-xl font-bold text-[#F5F1EB]">NFT não encontrado</h1>
          <p className="mt-2 text-xs text-[#CFB28C]">
            O ativo com o identificador <span className="text-[#D28A4C]">#{id}</span> não existe ou foi removido do marketplace.
          </p>
          <button
            onClick={() => navigate({ to: '/market' })}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#D28A4C] px-5 py-2.5 text-xs font-bold text-[#140D0A] transition-colors hover:bg-[#E09A5C] cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para o Mercado
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const formattedId = String(id).padStart(3, '0');
  const baseImage = nftData.thumbnails[0];

  return (
    <div className="min-h-screen bg-[#140D0A]">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 font-mono text-[#F5F1EB]">
        {/* Breadcrumb */}
        <nav className="mb-6 text-xs text-[#CFB28C]">
          <span>Início</span> / <span>Mercado</span> / <span className="text-[#D28A4C]">{nftData.name} #{formattedId}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Miniaturas de Estilos */}
          <div className="flex gap-3 lg:col-span-5">
            <div className="flex flex-col gap-3">
              {nftStyles.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedStyle(style)}
                  className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                    selectedStyle.id === style.id ? 'border-[#D28A4C]' : 'border-[#3D2C24] opacity-60 hover:opacity-100'
                  }`}
                  title={style.label}
                >
                  <img
                    src={baseImage}
                    alt={style.label}
                    style={{ filter: style.filter }}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>


            <div className="relative flex-1 overflow-hidden rounded-2xl bg-[#231712] border border-[#3D2C24]">
              <img
                src={baseImage}
                alt={nftData.name}
                style={{ filter: selectedStyle.filter }}
                className="h-full w-full object-cover aspect-square transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="absolute right-3 top-3 rounded-lg bg-[#140D0A]/80 p-2 text-[#D28A4C] transition-colors hover:bg-[#140D0A] cursor-pointer"
                title="Ampliar imagem"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-between lg:col-span-7">
            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[#F5F1EB]">{nftData.name} #{formattedId}</h1>
              </div>

              <div className="mt-2 flex items-center gap-3">
                <span className="text-2xl font-bold text-[#D28A4C]">{nftData.price} ETH</span>
                <div className="flex items-center gap-1 text-xs text-[#CFB28C]">
                  <div className="flex text-[#D28A4C]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-[#D28A4C]" />
                    ))}
                  </div>
                  <span>{nftData.totalReviews} avaliações de colecionadores</span>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-xs font-bold text-[#F5F1EB]">Sobre este NFT:</h2>
                <p className="mt-2 text-xs leading-relaxed text-[#CFB28C]">
                  {nftData.description} Estilo aplicado: <span className="text-[#D28A4C] font-bold">{selectedStyle.label}</span>.
                </p>
              </div>

              {/* Seleção de Edição */}
              <div className="mt-6">
                <h2 className="text-xs font-bold text-[#F5F1EB]">Edição:</h2>
                <div className="mt-2 flex gap-2">
                  {nftData.editions.map((edition) => (
                    <button
                      key={edition}
                      type="button"
                      onClick={() => setSelectedEdition(edition)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                        selectedEdition === edition
                          ? 'border-[#D28A4C] bg-[#D28A4C] text-[#140D0A]'
                          : 'border-[#3D2C24] bg-[#231712] text-[#CFB28C] hover:border-[#D28A4C]'
                      }`}
                    >
                      {edition}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantidade e Ações */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center rounded-lg bg-[#231712] border border-[#3D2C24]">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-[#D28A4C] hover:text-[#F5F1EB] cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-3 text-xs font-bold text-[#F5F1EB]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-[#D28A4C] hover:text-[#F5F1EB] cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  className="flex-1 rounded-lg bg-[#D28A4C] px-6 py-2.5 text-xs font-bold text-[#140D0A] transition-colors hover:bg-[#E09A5C] cursor-pointer"
                >
                  COMPRAR
                </button>

                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs transition-colors cursor-pointer ${
                    isFavorite
                      ? 'border-[#D28A4C] bg-[#D28A4C]/10 text-[#D28A4C]'
                      : 'border-[#3D2C24] bg-[#231712] text-[#CFB28C] hover:border-[#D28A4C]'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-[#D28A4C]' : ''}`} />
                  Favoritar
                </button>
              </div>

              {/* Metadados */}
              <div className="mt-6 space-y-1.5 text-xs text-[#CFB28C]">
                <p><span className="text-[#F5F1EB]">ID do token:</span> #{formattedId}</p>
                <p><span className="text-[#F5F1EB]">Coleção:</span> <span className="text-[#D28A4C]">{nftData.collection}</span></p>
                <p><span className="text-[#F5F1EB]">Atributos:</span> {nftData.attributes.join(', ')}, Estilo: {selectedStyle.label}</p>
              </div>

              {/* Redes Compartilhar */}
              <div className="mt-6 flex items-center gap-3 text-xs text-[#CFB28C]">
                <span className="flex items-center gap-1">
                  <Share2 className="h-3.5 w-3.5 text-[#D28A4C]" /> Compartilhar este NFT:
                </span>
                <div className="flex gap-2 text-[#D28A4C]">
                  <svg className="h-4 w-4 cursor-pointer hover:opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                  <Mail className="h-4 w-4 cursor-pointer hover:opacity-80" />
                  <svg className="h-4 w-4 cursor-pointer hover:opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Zoom (Lupa) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="relative max-w-2xl w-full bg-[#231712] p-4 rounded-2xl border border-[#3D2C24]">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 text-[#CFB28C] hover:text-[#F5F1EB] bg-[#140D0A] p-2 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-sm font-bold text-[#F5F1EB] mb-4">Visualização Expandida - {nftData.name} ({selectedStyle.label})</h3>
              <img
                src={baseImage}
                alt="Zoom NFT"
                style={{ filter: selectedStyle.filter }}
                className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Seção de Abas Inferiores */}
        <div className="mt-16 border-t border-[#3D2C24] pt-8">
          <div className="flex gap-8 border-b border-[#3D2C24] pb-3 text-sm font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`pb-3 transition-colors cursor-pointer ${
                activeTab === 'details' ? 'border-b-2 border-[#D28A4C] text-[#D28A4C]' : 'text-[#CFB28C] hover:text-[#F5F1EB]'
              }`}
            >
              Detalhes do NFT
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 transition-colors cursor-pointer ${
                activeTab === 'reviews' ? 'border-b-2 border-[#D28A4C] text-[#D28A4C]' : 'text-[#CFB28C] hover:text-[#F5F1EB]'
              }`}
            >
              Avaliações de colecionadores ({nftData.totalReviews})
            </button>
          </div>

          <div className="mt-6 text-xs text-[#CFB28C] space-y-4">
            {activeTab === 'details' ? (
              <>
                <p>
                  <strong className="text-[#F5F1EB]">{nftData.name} #{formattedId}</strong> ({selectedStyle.label}) é uma obra digital {selectedEdition} finalizada à mão da coleção {nftData.collection}. Cada atributo fica armazenado nos metadados do token e verificado na {nftData.blockchain}.
                </p>
                <p>
                  A propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro permanente de procedência registrada na rede.
                </p>
                <div>
                  <h3 className="font-bold text-[#F5F1EB]">Rede:</h3>
                  <p>Cunhado na {nftData.blockchain} com procedência imutável e metadados armazenados no IPFS.</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#F5F1EB]">Contrato:</h3>
                  <p>Direitos autorais do criador: {nftData.royalty} nas vendas secundárias, pagos automaticamente pelos mercados compatíveis.</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#F5F1EB]">Direitos autorais:</h3>
                  <p className="text-[#D28A4C]">{nftData.contractAddress} • Contrato inteligente ERC-721 verificado.</p>
                </div>
              </>
            ) : (
              <p>Nenhuma avaliação cadastrada no momento.</p>
            )}
          </div>
        </div>

        {/* Mais desta coleção */}
        <div className="mt-16 border-t border-[#3D2C24] pt-8">
          <h2 className="text-sm font-bold text-[#D28A4C]">Mais desta coleção</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {relatedNfts.map((nft) => (
              <Card
                key={nft.id}
                img={nft.image}
                nameNft={nft.name}
                idNft={Number(nft.id)}
                price={nft.price}
              />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;