import { useNavigate } from '@tanstack/react-router';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Footer from '@/components/footer/Footer';
import Navbar from '@/components/navbar/Navbar';

interface NftNotFoundProps {
  id: string;
}

const NftNotFound = ({ id }: NftNotFoundProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#140D0A] flex flex-col justify-between font-mono">
      <Navbar />
      <div className="mx-auto max-w-md px-4 py-20 text-center text-[#F5F1EB]">
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
};

export default NftNotFound;
