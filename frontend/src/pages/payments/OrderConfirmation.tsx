import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface OrderReceiptItem {
  id: string;
  name: string;
  tokenId: string;
  image: string;
  quantity: number;
  subtotal: string;
}

export interface OrderReceipt {
  isDemo: true;
  transactionId: string;
  date: string;
  total: string;
  discount: string;
  wallet: string;
  network: string;
  networkFee: string;
  explorerName: string;
  explorerUrl: string;
  items: OrderReceiptItem[];
}

interface OrderConfirmationProps {
  receipt: OrderReceipt;
  onClose: () => void;
}

const ThankYouIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 80 80"
    fill="none"
    className="h-20 w-20 text-[#D28A4C]"
  >
    <path
      d="M23 18V13a17 17 0 0 1 34 0v5M15 22h50a4 4 0 0 1 4 4v43a4 4 0 0 1-4 4H15a4 4 0 0 1-4-4V26a4 4 0 0 1 4-4Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path
      d="m12 27 22 23a8 8 0 0 0 12 0l22-23M12 70l24-25m32 25L44 45"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <text
      x="40"
      y="37"
      fill="currentColor"
      fontFamily="Arial, sans-serif"
      fontSize="10"
      fontWeight="700"
      textAnchor="middle"
    >
      <tspan x="40">THANK</tspan>
      <tspan x="40" dy="11">YOU</tspan>
    </text>
  </svg>
);

const OrderConfirmation = ({ receipt, onClose }: OrderConfirmationProps) => {
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose]);

  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-[#140D0A] px-3 py-5 font-mono text-[#F5F1EB] sm:px-6 sm:py-10">
      <section
        ref={dialogRef}
        aria-labelledby="order-confirmation-title"
        aria-modal="true"
        className="max-h-[calc(100svh-40px)] w-full max-w-[720px] overflow-y-auto border-b-[6px] border-[#D28A4C] bg-[#241612] shadow-2xl sm:max-h-[calc(100svh-80px)]"
        role="dialog"
        tabIndex={-1}
      >
        <header className="relative flex flex-col items-center border-b border-[#8C5A32] px-5 pb-6 pt-7 text-center sm:px-10 sm:pb-7 sm:pt-8">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar confirmação"
            className="absolute right-4 top-4 rounded p-1 text-[#D28A4C] transition-colors hover:text-[#F5F1EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D28A4C] sm:right-5 sm:top-5"
          >
            <X className="h-5 w-5" />
          </button>
          <ThankYouIcon />
          <div className="mt-4 rounded border border-[#8C5A32] bg-[#140D0A] px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-[#E89B55] sm:text-xs">
            PRÉVIA DEMONSTRATIVA · NENHUMA TRANSAÇÃO REAL FOI ENVIADA
          </div>
          <h1
            id="order-confirmation-title"
            className="mt-3 text-sm font-bold leading-5 text-[#CFB28C] sm:text-base"
          >
            Recibo demonstrativo do pedido
          </h1>
        </header>

        <dl className="grid grid-cols-2 text-xs text-[#CFB28C] sm:grid-cols-4 sm:text-sm">
          <ReceiptMetadata label="ID da transação" value={receipt.transactionId} />
          <ReceiptMetadata label="Data" value={receipt.date} />
          <ReceiptMetadata label="Total" value={`${receipt.total} ETH`} />
          <ReceiptMetadata label="Carteira" value={receipt.wallet} />
        </dl>

        <div className="px-4 pb-7 pt-6 sm:px-12 sm:pb-8">
          <h2 className="mb-3 text-sm font-bold leading-4 sm:text-base">
            Detalhes da transação
          </h2>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-3 border-b border-[#60402C] pb-3 text-sm font-bold sm:grid-cols-[minmax(0,1fr)_100px_120px] sm:gap-x-4">
            <span>NFTs</span>
            <span className="hidden text-center sm:block">Edições</span>
            <span className="text-right">
              <span className="sm:hidden">Edições / </span>
              Subtotal
            </span>
          </div>

          <ul className="divide-y divide-[#3D2C24]">
            {receipt.items.map((item) => (
              <li
                key={item.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 py-3 sm:grid-cols-[minmax(0,1fr)_100px_120px] sm:gap-x-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={item.image}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg object-cover sm:h-[70px] sm:w-[70px]"
                  />
                  <div className="min-w-0">
                    <h3 className="truncate text-xs font-bold sm:text-sm">
                      {item.name} #{item.tokenId}
                    </h3>
                    <p className="mt-1 truncate text-[11px] leading-4 text-[#B39463] sm:text-sm">
                      ID do token: #{item.tokenId}
                    </p>
                  </div>
                </div>
                <span className="hidden text-center text-sm text-[#CFB28C] sm:block">
                  (x {item.quantity})
                </span>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-[#CFB28C] sm:hidden">
                    (x {item.quantity})
                  </span>
                  <span className="whitespace-nowrap text-xs font-bold text-[#E89B55] sm:text-base">
                    {item.subtotal} ETH
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <dl className="ml-auto mt-4 max-w-[300px] space-y-2 text-xs sm:text-sm">
            {receipt.discount !== '0' && (
              <div className="flex justify-between gap-4">
                <dt>Desconto promocional</dt>
                <dd className="whitespace-nowrap">−{receipt.discount} ETH</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt>Taxa de rede</dt>
              <dd className="whitespace-nowrap">{receipt.networkFee} ETH</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-[#60402C] pb-3 font-bold">
              <dt>Total</dt>
              <dd className="whitespace-nowrap text-[#E89B55]">
                {receipt.total} ETH
              </dd>
            </div>
          </dl>

          <p className="mx-auto mt-4 max-w-[490px] text-center text-xs leading-[22px] text-[#B39463] sm:text-sm">
            Esta é uma confirmação simulada na rede {receipt.network}. Seus NFTs
            continuam no carrinho; nenhum pagamento ou transferência foi realizado.
          </p>
          <a
            href={receipt.explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="mx-auto mt-4 flex min-h-12 w-fit items-center justify-center rounded-[5px] bg-[#D28A4C] px-4 py-3 text-sm font-bold text-[#140D0A] transition-colors hover:bg-[#E09A5C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5F1EB]"
          >
            Abrir {receipt.explorerName} (prévia)
          </a>
        </div>
      </section>
    </main>
  );
};

const ReceiptMetadata = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0 border-b border-[#8C5A32] px-3 py-3 odd:border-r sm:border-b-0 sm:border-r sm:px-4 sm:py-4 sm:last:border-r-0">
    <dt className="font-bold">{label}</dt>
    <dd className="break-words">{value}</dd>
  </div>
);

export default OrderConfirmation;
