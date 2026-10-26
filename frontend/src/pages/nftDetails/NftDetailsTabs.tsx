import { useState } from 'react';
import { Star } from 'lucide-react';
import type { NftDetail } from './productDetailData';


type DetailTab = 'details' | 'reviews';

interface NftDetailsTabsProps {
  nftData: NftDetail;
  formattedId: string;
  styleLabel: string;
  selectedEdition: string;
}

const NftDetailsTabs = ({
  nftData,
  formattedId,
  styleLabel,
  selectedEdition,
}: NftDetailsTabsProps) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('details');

  return (
    <div className="mt-16 border-t border-[#3D2C24] pt-8">
      <div className="flex gap-8 border-b border-[#3D2C24] pb-3 text-[15px] font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'details'
              ? 'border-b-2 border-[#D28A4C] text-[#D28A4C]'
              : 'text-[#CFB28C] hover:text-[#F5F1EB]'
          }`}
        >
          Detalhes do NFT
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'reviews'
              ? 'border-b-2 border-[#D28A4C] text-[#D28A4C]'
              : 'text-[#CFB28C] hover:text-[#F5F1EB]'
          }`}
        >
          Avaliações de colecionadores ({nftData.reviews.length})
        </button>
      </div>

      <div className="mt-6 text-[14px] text-[#CFB28C] space-y-4">
        {activeTab === 'details' ? (
          <>
            <p>
              <strong className="text-[#F5F1EB]">
                {nftData.name} #{formattedId}
              </strong>{' '}
              ({styleLabel}) é uma obra digital {selectedEdition} finalizada à mão da coleção{' '}
              {nftData.collection}. Cada atributo fica armazenado nos metadados do token e
              verificado na {nftData.blockchain}.
            </p>
            <p>
              A propriedade inclui a arte em alta resolução, lançamentos exclusivos para
              colecionadores e um registro permanente de procedência registrada na rede.
            </p>
            <div>
              <h3 className="font-bold text-[#F5F1EB]">Rede:</h3>
              <p>Cunhado na {nftData.blockchain} com procedência imutável e metadados armazenados no IPFS.</p>
            </div>
            <div>
              <h3 className="font-bold text-[#F5F1EB]">Contrato:</h3>
              <p>
                Direitos autorais do criador: {nftData.royalty} nas vendas secundárias, pagos
                automaticamente pelos mercados compatíveis.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[#F5F1EB]">Direitos autorais:</h3>
              <p className="text-[#D28A4C]">
                {nftData.contractAddress} Contrato inteligente ERC-721 verificado.
              </p>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-[12px] text-[#8C7A6B]">
              Exibindo todas as {nftData.reviews.length} avaliações de colecionadores.
            </p>
            {nftData.reviews.map((review) => (
              <article
                key={review.name}
                className="rounded-2xl border border-[#3D2C24] bg-[#231712] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold text-[#F5F1EB]">{review.name}</h3>
                  <time className="text-[12px] text-[#8C7A6B]">{review.date}</time>
                </div>
                <div className="mt-2 flex text-[#D28A4C]" aria-label="5 de 5 estrelas">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  ))}
                </div>
                <p className="mt-2 leading-5.5 text-[#CFB28C]">{review.comment}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NftDetailsTabs;
