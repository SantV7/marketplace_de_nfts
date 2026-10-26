import { ArrowLeft, MoreVertical } from 'lucide-react';
import type { FormEventHandler } from 'react';
import { Link } from '@tanstack/react-router';
import type { Wallet } from '@/services/contracts';
import { formatEth } from '@/pages/cart/cartPricing';
import { walletProviders, type WalletProviderId } from './paymentData';

interface CheckoutMobileProps {
  total: bigint;
  selectedProvider: WalletProviderId;
  selectedWallet: string;
  wallets: Wallet[];
  confirmationMessage: string;
  walletConnected: boolean;
  onProviderChange: (provider: WalletProviderId) => void;
  onWalletChange: (wallet: string) => void;
  onConnectWallet: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

const CoinbaseWalletIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M21.1712 14.6755H17.2845C15.8693 14.6755 14.7217 13.5279 14.7217 12.1117C14.7217 10.6964 15.8693 9.54883 17.2845 9.54883H21.1407" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="#D28A4C" />
    <path d="M17.7221 12.0529H17.4249" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="#D28A4C" />
    <path d="M7.6062 8.14367H11.6662" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="#D28A4C" />
    <path d="M2.71411 12.2529C2.71411 5.84815 5.03887 3.71387 12.0151 3.71387C18.9903 3.71387 21.3151 5.84815 21.3151 12.2529C21.3151 18.6567 18.9903 20.792 12.0151 20.792C5.03887 20.792 2.71411 18.6567 2.71411 12.2529Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="#D28A4C" />
  </svg>
);

const CheckoutMobile = ({
  total,
  selectedProvider,
  selectedWallet,
  wallets,
  confirmationMessage,
  walletConnected,
  onProviderChange,
  onWalletChange,
  onConnectWallet,
  onSubmit,
}: CheckoutMobileProps) => (
  <form
    onSubmit={onSubmit}
    className="mx-auto flex min-h-svh w-full max-w-[390px] flex-col rounded-[32px] bg-[#140D0A] px-[21px] pb-6 pt-8 md:hidden"
  >
    <header className="mb-5 grid grid-cols-[35px_1fr_35px] items-center">
      <Link
        to="/cart"
        aria-label="Voltar ao carrinho"
        className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-[#3D2C24] bg-[#241612] text-[#D28A4C]"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <h1 className="whitespace-nowrap text-center text-base font-bold">Pagamento com carteira</h1>
      <span aria-hidden="true" />
    </header>

    <section aria-labelledby="mobile-connected-wallet-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="mobile-connected-wallet-heading" className="text-xs font-bold">
          Carteira conectada
        </h2>
        <Link to="/wallets" className="text-xs font-bold text-[#D28A4C]">Gerir carteiras</Link>
      </div>
      <fieldset className="space-y-3">
        <legend className="sr-only">Selecione uma carteira conectada</legend>
        {wallets.map((wallet) => (
          <label
            key={wallet.id}
            className="flex min-h-[72px] cursor-pointer items-center gap-3 rounded-[15px] bg-[#241612] px-3"
          >
            <input
              type="radio"
              name="connectedWallet"
              value={wallet.address}
              checked={selectedWallet === wallet.id}
              onChange={() => onWalletChange(wallet.address)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-[#B39463] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#D28A4C]"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  selectedWallet === wallet.id ? 'bg-[#D28A4C]' : 'bg-transparent'
                }`}
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold">{wallet.label}</span>
              <span className="mt-1 block truncate text-xs leading-4 text-[#B39463]">
                {wallet.address}
              </span>
              <span className="block text-xs leading-4 text-[#B39463]">
                  {wallet.primary ? 'Rede principal ' : 'Rede '}{wallet.network}
              </span>
            </span>
            <MoreVertical className="h-4 w-4 shrink-0 text-[#B39463]" aria-hidden="true" />
          </label>
        ))}
      </fieldset>
      {wallets.length === 0 && <p role="alert" className="mt-3 text-xs">Cadastre uma carteira antes de pagar.</p>}
    </section>

    <section className="mt-4" aria-labelledby="mobile-wallet-options-heading">
      <h2 id="mobile-wallet-options-heading" className="mb-3 text-base font-bold">
        Carteira e rede
      </h2>
      <fieldset className="space-y-3">
        <legend className="sr-only">Selecione a carteira para pagamento</legend>
        {walletProviders.map((provider) => (
          <label
            key={provider.id}
            className="flex min-h-[50px] cursor-pointer items-center gap-3 rounded-[15px] bg-[#241612] px-3"
          >
            <span className="flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-full border border-[#3D2C24] bg-[#2A1A13] text-xs font-bold text-[#D28A4C]">
              {provider.id === 'coinbase' ? (
                <CoinbaseWalletIcon />
              ) : (
                provider.initial
              )}
            </span>
            <span className="flex-1 text-xs text-[#F5F1EB]">{provider.name}</span>
            <input
              type="radio"
              name="paymentProvider"
              value={provider.id}
              checked={selectedProvider === provider.id}
              onChange={() => onProviderChange(provider.id)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-[#B39463] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#D28A4C]"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  selectedProvider === provider.id ? 'bg-[#D28A4C]' : 'bg-transparent'
                }`}
              />
            </span>
          </label>
        ))}
      </fieldset>
    </section>

    <input type="hidden" name="walletAddress" value={selectedWallet} />
    <input type="hidden" name="network" value={wallets.find((wallet) => wallet.address === selectedWallet)?.network ?? ''} />

    <div className="mt-3 flex items-center justify-end gap-4 text-base font-bold">
      <span>Total:</span>
      <span className="text-[#D28A4C]">{formatEth(total)} ETH</span>
    </div>
    {confirmationMessage && (
      <p role="status" className="mt-2 text-right text-[10px] leading-4 text-[#B39463]">
        {confirmationMessage}
      </p>
    )}

    <button type="button" onClick={onConnectWallet} disabled={!selectedWallet} className="mt-3 h-11 w-full rounded-full border border-[#D28A4C] text-xs font-bold text-[#D28A4C] disabled:opacity-50">
      {walletConnected ? 'Desconectar carteira' : 'Conectar carteira'}
    </button>

    <button
      type="submit"
      className="mt-auto flex h-[46px] w-full items-center justify-center rounded-full bg-[#D28A4C] text-xs font-bold text-[#140D0A] transition-colors hover:bg-[#E09A5C]"
    >
      Confirmar compra
    </button>
  </form>
);

export default CheckoutMobile;
