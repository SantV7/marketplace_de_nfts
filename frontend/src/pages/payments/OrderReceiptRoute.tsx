import { Link, useNavigate } from '@tanstack/react-router';
import { useOrder } from '@/services/queries';
import { formatEth, toEthUnits } from '@/pages/cart/cartPricing';
import type { OrderReceipt } from './OrderConfirmation';
import OrderConfirmation from './OrderConfirmation';

const OrderReceiptRoute = () => {
  const id = localStorage.getItem('kurio-order-id') ?? '';
  const query = useOrder(id);
  const navigate = useNavigate();
  const order = query.data;
  if (query.isLoading) return <main role="status" className="flex min-h-svh items-center justify-center bg-[#140D0A] font-mono text-[#B39463]">Consultando estado do pedido…</main>;
  if (query.isError || order?.status !== 'confirmed') return <main className="flex min-h-svh items-center justify-center bg-[#140D0A] p-6 font-mono text-[#F5F1EB]"><section className="max-w-lg text-center"><h1 className="text-xl font-bold">Confirmação indisponível</h1><p role={query.isError ? 'alert' : 'status'} className="my-4 text-[#B39463]">{order?.status === 'pending' ? 'O pedido ainda está pendente.' : 'Não há pedido confirmado para exibir.'}</p><Link to="/cart" className="text-[#D28A4C]">Voltar ao carrinho</Link></section></main>;
  const receipt: OrderReceipt = {
    isDemo: true,
    transactionId: order.txHash,
    date: new Date(order.date).toLocaleDateString('pt-BR'),
    total: order.total,
    discount: order.discount,
    wallet: order.wallet ?? 'Carteira simulada',
    network: order.network ?? 'Ethereum',
    networkFee: order.networkFee,
    explorerName: 'Etherscan',
    explorerUrl: `https://etherscan.io/tx/${order.txHash}`,
    items: order.items.map((item) => ({ id: item.id, name: item.name, tokenId: item.nftId.padStart(4, '0'), image: item.image, quantity: item.quantity, subtotal: formatEth(toEthUnits(item.price) * BigInt(item.quantity)) })),
  };
  return <OrderConfirmation receipt={receipt} onClose={() => { localStorage.removeItem('kurio-order-id'); void navigate({ to: '/market' }); }} />;
};

export default OrderReceiptRoute;
