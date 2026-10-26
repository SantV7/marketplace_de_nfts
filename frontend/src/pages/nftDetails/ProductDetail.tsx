import axios from 'axios';
import { PageSkeleton, RequestError } from '@/components/RemoteState';
import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import Footer from '@/components/footer/Footer';
import Navbar from '@/components/navbar/Navbar';
import { useAddCartItem, useFavorites, useNft, useToggleFavorite } from '@/services/queries';
import type { NftDetail } from './productDetailData';
import { nftStyles } from './productDetailContent';
import NftDetailsTabs from './NftDetailsTabs';
import NftGallery from './NftGallery';
import NftMobileDetail from './NftMobileDetail';
import NftNotFound from './NftNotFound';
import NftPurchasePanel from './NftPurchasePanel';
import RelatedNfts from './RelatedNfts';

const ProductDetail = () => {
  const { id } = useParams({ from: '/nft/$id' });
  return <ProductDetailContent key={id} id={id} />;
};

const ProductDetailContent = ({ id }: { id: string }) => {
  const navigate = useNavigate();
  const nftQuery = useNft(id);
  const nftData = nftQuery.data;
  const addCart = useAddCartItem();
  const favoritesQuery = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const [cartError, setCartError] = useState('');
  const [favoriteError, setFavoriteError] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(nftStyles[0]);
  const [selectedEdition, setSelectedEdition] = useState('1/50');
  const [quantity, setQuantity] = useState(1);
  const isFavorite = favoritesQuery.data?.includes(Number(id)) ?? false;
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (nftQuery.isLoading) return <PageSkeleton label="Carregando NFT…" />;
  if (nftQuery.isError && !(axios.isAxiosError(nftQuery.error) && nftQuery.error.response?.status === 404)) return <RequestError message="Não foi possível carregar o NFT." retry={() => void nftQuery.refetch()} />;
  if (nftQuery.isError || !nftData) return <NftNotFound id={id} />;

  const formattedId = String(id).padStart(3, '0');
  const detailData: NftDetail = {
    reviews: nftData.reviews ?? [],
    id: String(nftData.id), name: nftData.name, price: nftData.price, rating: nftData.rating ?? 0,
    description: nftData.description ?? '', editions: nftData.editions?.map((row) => row.name) ?? [nftData.edition],
    tokenId: nftData.tokenId ?? String(nftData.id).padStart(3, '0'), collection: nftData.collection ?? '',
    attributes: nftData.attributes ?? [], thumbnails: nftData.thumbnails ?? [nftData.image],
    contractAddress: nftData.contractAddress ?? '', blockchain: nftData.blockchain ?? nftData.network, royalty: nftData.royalty ?? '0%',
  };
  const baseImage = detailData.thumbnails[0];
  const availableQuantity = Math.min(nftData.available, nftData.editions?.find((edition) => edition.name === selectedEdition)?.available ?? nftData.available);

  const handleAddToCart = async () => {
    setCartError('');

    try {
      await addCart.mutateAsync({
        nftId: id,
        name: nftData.name,
        image: baseImage,
        price: nftData.price,
        edition: selectedEdition,
        styleId: selectedStyle.id,
        styleLabel: selectedStyle.label,
        styleFilter: selectedStyle.filter,
        quantity,
        availableQuantity,
      });

      void navigate({ to: '/cart' });
    } catch (error) {
      console.error('Não foi possível salvar o NFT no carrinho.', error);
      setCartError('Não foi possível atualizar o carrinho. Verifique a disponibilidade e tente novamente.');
    }
  };

  const handleSelectEdition = (edition: string) => {
    setSelectedEdition(edition);
    setQuantity((currentQuantity) =>
      Math.max(1, Math.min(currentQuantity, nftData.editions?.find((row) => row.name === edition)?.available ?? 1)),
    );
  };

  const handleToggleFavorite = async () => {
    if (!localStorage.getItem('kurio_token')) { void navigate({ to: '/login', search: { redirect: `/nft/${id}` } }); return; }
    try {
      await toggleFavorite.mutateAsync({ id: Number(id), active: isFavorite });
      setFavoriteError('');
    } catch {
      setFavoriteError('Não foi possível atualizar os favoritos. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-[#140D0A]">
      <div className="hidden md:block">
        <Navbar />
      </div>

      <NftMobileDetail
        nftData={detailData}
        formattedId={formattedId}
        baseImage={baseImage}
        selectedStyle={selectedStyle}
        onSelectStyle={setSelectedStyle}
        selectedEdition={selectedEdition}
        quantity={quantity}
        availableQuantity={availableQuantity}
        isFavorite={isFavorite}
        cartError={cartError || favoriteError}
        onSelectEdition={handleSelectEdition}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCart}
        onToggleFavorite={handleToggleFavorite}
      />

      <main className="hidden md:block">
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
              nftData={detailData}
              formattedId={formattedId}
              selectedStyle={selectedStyle}
              selectedEdition={selectedEdition}
              quantity={quantity}
              availableQuantity={availableQuantity}
              isFavorite={isFavorite}
              cartError={cartError || favoriteError}
              onSelectEdition={handleSelectEdition}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>

          <NftDetailsTabs
            nftData={detailData}
            formattedId={formattedId}
            styleLabel={selectedStyle.label}
            selectedEdition={selectedEdition}
          />
          <RelatedNfts excludeId={id} />
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default ProductDetail;
