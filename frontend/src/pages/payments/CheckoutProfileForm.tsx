import { useState } from 'react';
import { Check } from 'lucide-react';
import {
  ensDomains,
  isEnsDomain,
  isWalletProviderId,
  profileNetworks,
  walletProviders,
} from './paymentData';
import type { WalletProviderId } from './paymentData';

interface CheckoutProfileFormProps {
  selectedProvider: WalletProviderId;
  onProviderChange: (provider: WalletProviderId) => void;
}

const fieldClassName =
  'h-10 w-full rounded-[3px] border border-[#3D2C24] bg-transparent px-3 text-xs text-[#F5F1EB] outline-none transition-colors placeholder:text-[#8C7A6B] focus:border-[#D28A4C]';

const CheckoutProfileForm = ({
  selectedProvider,
  onProviderChange,
}: CheckoutProfileFormProps) => {
  const [useAnotherWallet, setUseAnotherWallet] = useState(false);
  const [ensDomain, setEnsDomain] = useState<(typeof ensDomains)[number]>('.eth');

  return (
    <section aria-labelledby="collector-profile-heading" className="min-w-0">
      <h2 id="collector-profile-heading" className="mb-4 text-[17px] font-bold leading-5">
        Perfil do colecionador
      </h2>

      <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
        <label className="block min-w-0 text-xs">
          <span className="mb-1 block">Nome de exibição<span className="text-[#D28A4C]">*</span></span>
          <input name="displayName" autoComplete="name" required className={fieldClassName} />
        </label>
        <label className="block min-w-0 text-xs">
          <span className="mb-1 block">Nome de usuário<span className="text-[#D28A4C]">*</span></span>
          <input name="username" autoComplete="username" required className={fieldClassName} />
        </label>

        <label className="block min-w-0 text-xs">
          <span className="mb-1 block">Rede <span className="text-[#D28A4C]">*</span></span>
          <select name="network" required defaultValue="" className={`${fieldClassName} text-[#B39463]`}>
            <option value="" disabled>Selecione uma rede</option>
            {profileNetworks.map((network) => <option key={network}>{network}</option>)}
          </select>
        </label>
        <label className="block min-w-0 text-xs">
          <span className="mb-1 block">Nome do perfil<span className="text-[#D28A4C]">*</span></span>
          <input name="profileName" required className={fieldClassName} />
        </label>

        <label className="block min-w-0 text-xs">
          <span className="mb-1 block">Endereço da carteira<span className="text-[#D28A4C]">*</span></span>
          <input
            name="walletAddress"
            autoComplete="off"
            required
            placeholder="Endereço 0x da carteira"
            className={fieldClassName}
          />
        </label>
        <label className="block min-w-0 text-xs">
          <span className="mb-1 block">ENS ou carteira secundária (opcional)</span>
          <input name="secondaryWallet" placeholder="ENS ou carteira secundária" className={fieldClassName} />
        </label>

        <label className="block min-w-0 text-xs">
          <span className="mb-1 block">Tipo de carteira<span className="text-[#D28A4C]">*</span></span>
          <select
            name="walletProvider"
            value={selectedProvider}
            onChange={(event) => {
              if (isWalletProviderId(event.target.value)) {
                onProviderChange(event.target.value);
              }
            }}
            required
            className={`${fieldClassName} text-[#B39463]`}
          >
            {walletProviders.map((provider) => (
              <option key={provider.id} value={provider.id}>{provider.name}</option>
            ))}
          </select>
        </label>
        <label className="block min-w-0 text-xs">
          <span className="mb-1 block">Código de indicação<span className="text-[#D28A4C]">*</span></span>
          <input name="referralCode" required className={fieldClassName} />
        </label>

        <label className="block min-w-0 text-xs">
          <span className="mb-1 block">E-mail<span className="text-[#D28A4C]">*</span></span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className={fieldClassName}
          />
        </label>
        <label className="block min-w-0 text-xs">
          <span className="mb-1 block">Nome ENS <span className="text-[#D28A4C]">*</span></span>
          <span className="flex">
            <input
              name="ensName"
              required
              className={`${fieldClassName} min-w-0 rounded-r-none border-r-0`}
            />
            <select
              aria-label="Domínio ENS"
              value={ensDomain}
              onChange={(event) => {
                if (isEnsDomain(event.target.value)) setEnsDomain(event.target.value);
              }}
              className="h-10 rounded-r-[3px] border border-[#3D2C24] bg-[#140D0A] px-2 text-xs text-[#F5F1EB] outline-none focus:border-[#D28A4C]"
            >
              {ensDomains.map((domain) => <option key={domain}>{domain}</option>)}
            </select>
          </span>
        </label>

        <div className="sm:col-span-2">
          <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-[#F5F1EB]">
            <input
              type="checkbox"
              checked={useAnotherWallet}
              onChange={(event) => setUseAnotherWallet(event.target.checked)}
              className="peer sr-only"
            />
            <span className="flex h-3 w-3 items-center justify-center rounded-full border border-[#D28A4C] text-transparent peer-checked:bg-[#D28A4C] peer-checked:text-[#140D0A]">
              <Check className="h-2.5 w-2.5" />
            </span>
            Usar outra carteira?
          </label>
          {useAnotherWallet && (
            <label className="mt-3 block text-xs">
              <span className="mb-1 block">Endereço da outra carteira<span className="text-[#D28A4C]">*</span></span>
              <input
                name="alternateWallet"
                required
                placeholder="Endereço 0x da carteira"
                className={fieldClassName}
              />
            </label>
          )}
        </div>

        <label className="block text-xs sm:col-span-2">
          <span className="mb-1 block">Observação do colecionador (opcional)</span>
          <textarea
            name="note"
            rows={5}
            className="w-full resize-y rounded-[3px] border border-[#3D2C24] bg-transparent p-3 text-xs text-[#F5F1EB] outline-none transition-colors placeholder:text-[#8C7A6B] focus:border-[#D28A4C]"
          />
        </label>
      </div>
    </section>
  );
};

export default CheckoutProfileForm;
