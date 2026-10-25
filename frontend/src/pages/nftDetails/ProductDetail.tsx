import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import Footer from '@/components/footer/Footer';
import Navbar from '@/components/navbar/Navbar';
import { addCartItem } from '@/libs/cartStore';
import { getNftDetailById } from './productDetailData';
import {
  availableQuantityByEdition,
  nftStyles,
} from './productDetailContent';
import NftDetailsTabs from './NftDetailsTabs';
import NftGallery from './NftGallery';
import NftNotFound from './NftNotFound';
import NftPurchasePanel from './NftPurchasePanel';
import RelatedNfts from './RelatedNfts';

const ProductDetail = () => {
  const { id } = useParams({ from: '/nft/$id' });
  return <ProductDetailContent key={id} id={id} />;
};

const ProductDetailContent = ({ id }: { id: string }) => {
  const navigate = useNavigate();
  const nftData = getNftDetailById(id);
  const [cartError, setCartError] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(nftStyles[0]);
  const [selectedEdition, setSelectedEdition] = useState('1/50');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!nftData) return <NftNotFound id={id} />;

  const formattedId = String(id).padStart(3, '0');
  const baseImage = nftData.thumbnails[0];
  const availableQuantity = availableQuantityByEdition[selectedEdition] ?? 1;

  const handleAddToCart = () => {
    setCartError('');

    try {
      const result = addCartItem({
        nftId: id,
        name: nftData.name,
        image: baseImage,
        price: nftData.price.toFixed(2),
        edition: selectedEdition,
        styleId: selectedStyle.id,
        styleLabel: selectedStyle.label,
        styleFilter: selectedStyle.filter,
        quantity,
        availableQuantity,
      });

      if (!result.success) {
        setCartError(result.message);
        return;
      }

      void navigate({ to: '/cart' });
    } catch (error) {
      console.error('Não foi possível salvar o NFT no carrinho.', error);
      setCartError('Não foi possível salvar o carrinho neste navegador. Tente novamente.');
    }
  };

  const handleSelectEdition = (edition: string) => {
    setSelectedEdition(edition);
    setQuantity((currentQuantity) =>
      Math.min(currentQuantity, availableQuantityByEdition[edition] ?? 1),
    );
  };

  return (
    <div className="min-h-screen bg-[#140D0A]">
      <Navbar />

      <div className="mx-auto max-w-360 px-4 pt-6 pb-16 font-mono text-[#F5F1EB] lg:px-27.5">
        <nav className="mb-6 text-xs leading-4 text-[#CFB28C]">
          <span>Início</span> / <span>Mercado</span> /{' '}
          <span className="text-[#D28A4C]">{nftData.name} #{formattedId}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <NftGallery
            baseImage={baseImage}
            nftName={nftData.name}
            selectedStyle={selectedStyle}
            isModalOpen={isModalOpen}
            onSelectStyle={setSelectedStyle}
            onModalOpenChange={setIsModalOpen}
          />
          <NftPurchasePanel
            nftData={nftData}
            formattedId={formattedId}
            selectedStyle={selectedStyle}
            selectedEdition={selectedEdition}
            quantity={quantity}
            availableQuantity={availableQuantity}
            isFavorite={isFavorite}
            cartError={cartError}
            onSelectEdition={handleSelectEdition}
            onQuantityChange={setQuantity}
            onAddToCart={handleAddToCart}
            onToggleFavorite={() => setIsFavorite(!isFavorite)}
          />
        </div>

        <NftDetailsTabs
          nftData={nftData}
          formattedId={formattedId}
          styleLabel={selectedStyle.label}
          selectedEdition={selectedEdition}
        />
        <RelatedNfts />
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
