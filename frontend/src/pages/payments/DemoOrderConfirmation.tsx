import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import OrderConfirmation from './OrderConfirmation';
import {
  clearDemoReceipt,
  loadDemoReceipt,
} from './demoReceipt';

const DemoOrderConfirmation = () => {
  const navigate = useNavigate();
  const [receiptState, setReceiptState] = useState(() => {
    try {
      return { receipt: loadDemoReceipt(), error: '' };
    } catch (error) {
      console.error('Não foi possível carregar o recibo demonstrativo.', error);
      return {
        receipt: null,
        error: 'Não foi possível carregar os dados da prévia demonstrativa.',
      };
    }
  });

  const handleClose = () => {
    try {
      clearDemoReceipt();
    } catch (error) {
      console.error('Não foi possível limpar a prévia demonstrativa.', error);
      setReceiptState({
        receipt: receiptState.receipt,
        error: 'Não foi possível limpar os dados temporários da prévia.',
      });
      return;
    }
    void navigate({ to: '/cart' }).catch((error: unknown) => {
      console.error('Não foi possível voltar ao carrinho.', error);
      setReceiptState({
        receipt: receiptState.receipt,
        error: 'Não foi possível voltar ao carrinho. Tente novamente.',
      });
    });
  };

  if (receiptState.receipt && !receiptState.error) {
    return (
      <OrderConfirmation receipt={receiptState.receipt} onClose={handleClose} />
    );
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#140D0A] px-4 py-8 font-mono text-[#F5F1EB]">
      <section className="w-full max-w-lg border-b-4 border-[#D28A4C] bg-[#241612] p-6 text-center sm:p-10">
        <h1 className="text-lg font-bold">Prévia de confirmação indisponível</h1>
        <p role={receiptState.error ? 'alert' : 'status'} className="mt-3 text-sm leading-6 text-[#B39463]">
          {receiptState.error ||
            'Finalize a demonstração pelo checkout para visualizar o recibo.'}
        </p>
        <Link
          to={receiptState.error ? '/cart' : '/payment'}
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-[5px] bg-[#D28A4C] px-5 py-3 text-sm font-bold text-[#140D0A] transition-colors hover:bg-[#E09A5C]"
        >
          {receiptState.error ? 'Voltar ao carrinho' : 'Ir para o checkout'}
        </Link>
      </section>
    </main>
  );
};

export default DemoOrderConfirmation;
