import { useMemo } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useOrder } from '@/services/queries';
import type { OrderReceipt } from './OrderConfirmation';
import OrderConfirmation from './OrderConfirmation';

const OrderReceiptRoute = () => {
  const id = sessionStorage.getItem('kurio-order-id') ?? '';
  const query = useOrder(id);
  const navigate = useNavigate();
  const receipt = useMemo(() => {
    const snapshot = sessionStorage.getItem('kurio-order-snapshot');
    if (!snapshot) return;
    try {
      const order = JSON.parse(snapshot) as { orderId: string; status: string; date: string; total: string; discount: string; networkFee: string; txHash: string; items: Array<{ id: string; name: string; nftId: string; image: string; quantity: number; price: string }>; wallet: string; provider: string };
      if (order.status !== 'confirmed') return null;
      return { isDemo: true, transactionId: order.txHash, date: new Date(order.date).toLocaleDateString('pt-BR'), total: order.total, discount: order.discount, wallet: order.wallet, network: 'Ethereum', networkFee: order.networkFee, explorerName: 'Etherscan', explorerUrl: `https://etherscan.io/tx/${order.txHash}`, items: order.items.map((item) => ({ id: item.id, name: item.name, tokenId: item.nftId.padStart(4, '0'), image: item.image, quantity: item.quantity, subtotal: (Number(item.price) * item.quantity).toFixed(8).replace(/0+$/, '').replace(/\.$/, '') })) } as OrderReceipt;
    } catch { return null; }
  }, []);
  if (query.data?.status !== 'confirmed' || !receipt) return <main className="flex min-h-svh items-center justify-center bg-[#140D0A] p-6 font-mono text-[#F5F1EB]"><section className="max-w-lg text-center"><h1 className="text-xl font-bold">Confirmação indisponível</h1><p role={query.isError ? 'alert' : 'status'} className="my-4 text-[#B39463]">{query.isLoading ? 'Consultando estado do pedido…' : 'Não há pedido confirmado para exibir.'}</p><Link to="/cart" className="text-[#D28A4C]">Voltar ao carrinho</Link></section></main>;
  return <OrderConfirmation receipt={receipt} onClose={() => { sessionStorage.removeItem('kurio-order-id'); sessionStorage.removeItem('kurio-order-snapshot'); void navigate({ to: '/market' }); }} />;
};
export default OrderReceiptRoute;
