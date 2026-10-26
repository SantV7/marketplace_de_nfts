import { useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import { useAddWallet, useChangePassword, useProfile, useUpdateProfile, useUpdateWallet, useWallets } from '@/services/queries';
import type { Wallet } from '@/services/contracts';

const shell = 'mx-auto min-h-[65vh] max-w-3xl px-5 py-10 font-mono text-[#F5F1EB]';
const field = 'mt-1 block w-full rounded border border-[#3D2C24] bg-transparent p-3';
const button = 'rounded bg-[#D28A4C] p-3 font-bold text-[#140D0A]';

export const ProfilePage = () => {
  const query = useProfile();
  const update = useUpdateProfile();
  const changePassword = useChangePassword();
  const [message, setMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await update.mutateAsync({ name: data.get('name'), username: data.get('username'), avatar: data.get('avatar') });
      setMessage('Perfil atualizado.');
    } catch {
      setMessage('Dados inválidos. Confira os campos e tente novamente.');
    }
  };

  const savePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const currentPassword = String(data.get('currentPassword'));
    const newPassword = String(data.get('newPassword'));
    if (newPassword !== data.get('confirmPassword')) {
      setPasswordMessage('A confirmação da nova senha não corresponde.');
      return;
    }
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setPasswordMessage('Senha alterada.');
      form.reset();
    } catch {
      setPasswordMessage('Senha atual inválida ou a nova senha não atende aos requisitos.');
    }
  };

  return <><Navbar /><main className={shell}>
    <h1 className="mb-6 text-2xl font-bold">Perfil do colecionador</h1>
    {query.isLoading ? <p role="status">Carregando perfil…</p> : query.isError ? <p role="alert">Não foi possível carregar o perfil. Inicie sessão novamente.</p> : <>
      <form className="grid gap-4" onSubmit={saveProfile}>
        <label>Nome<input name="name" defaultValue={query.data?.name ?? ''} minLength={2} required className={field} /></label>
        <label>Nome de usuário<input name="username" defaultValue={query.data?.username ?? ''} minLength={3} maxLength={24} pattern="[\w.-]{3,24}" required className={field} /></label>
        <label>URL do avatar<input name="avatar" type="url" defaultValue={String(query.data?.avatar ?? '')} className={field} /></label>
        <button className={button} disabled={update.isPending}>Salvar perfil</button>
        <p role="status">{message}</p>
      </form>
      <form className="mt-10 grid gap-4 border-t border-[#3D2C24] pt-6" onSubmit={savePassword}>
        <h2 className="text-xl font-bold">Alterar senha</h2>
        <label>Senha atual<input name="currentPassword" type="password" autoComplete="current-password" required className={field} /></label>
        <label>Nova senha<input name="newPassword" type="password" autoComplete="new-password" minLength={8} required className={field} /></label>
        <label>Confirmar nova senha<input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required className={field} /></label>
        <button className={button} disabled={changePassword.isPending}>Atualizar senha</button>
        <p role="status">{passwordMessage}</p>
      </form>
    </>}
    <Link to="/wallets" className="mt-6 inline-block text-[#D28A4C]">Gerenciar carteiras</Link>
  </main><Footer /></>;
};

const networkOptions = ['Ethereum', 'Polygon', 'Solana'];

const WalletEditor = ({ wallet, onSave }: { wallet: Wallet; onSave: (wallet: Wallet, changes: Partial<Wallet>) => Promise<void> }) => (
  <form className="grid gap-3 rounded border border-[#3D2C24] p-4" onSubmit={async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await onSave(wallet, { label: String(data.get('label')), address: String(data.get('address')), network: String(data.get('network')), primary: data.get('primary') === 'on' });
  }}>
    <label>Identificação<input name="label" defaultValue={wallet.label} minLength={2} required className={field} /></label>
    <label>Endereço<input name="address" defaultValue={wallet.address} minLength={8} required className={field} /></label>
    <label>Rede<select name="network" defaultValue={wallet.network} className={field}>{networkOptions.map((network) => <option key={network}>{network}</option>)}</select></label>
    <label className="flex items-center gap-2"><input type="checkbox" name="primary" defaultChecked={wallet.primary} /> Carteira principal</label>
    <button className={button}>Salvar carteira</button>
  </form>
);

export const WalletsPage = () => {
  const query = useWallets();
  const add = useAddWallet();
  const update = useUpdateWallet();
  const [message, setMessage] = useState('');
  const saveWallet = async (wallet: Wallet, changes: Partial<Wallet>) => {
    try {
      await update.mutateAsync({ id: wallet.id, changes });
      setMessage('Carteira atualizada.');
    } catch {
      setMessage('Dados inválidos ou endereço já cadastrado.');
    }
  };
  const addWallet = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await add.mutateAsync({ address: String(data.get('address')), label: String(data.get('label')), network: String(data.get('network')) });
      setMessage('Carteira cadastrada.');
      form.reset();
    } catch {
      setMessage('Carteira inválida ou já cadastrada.');
    }
  };

  return <><Navbar /><main className={shell}>
    <h1 className="mb-6 text-2xl font-bold">Carteiras</h1>
    {query.isLoading && <p role="status">Carregando carteiras…</p>}
    {query.isError && <p role="alert">Não foi possível carregar as carteiras.</p>}
    <div className="mb-6 space-y-3">{(query.data ?? []).map((wallet) => <WalletEditor key={wallet.id} wallet={wallet} onSave={saveWallet} />)}</div>
    <form className="grid gap-3 border-t border-[#3D2C24] pt-6" onSubmit={addWallet}>
      <h2 className="text-xl font-bold">Adicionar carteira</h2>
      <label>Identificação<input name="label" minLength={2} required className={field} /></label>
      <label>Endereço<input name="address" minLength={8} required className={field} /></label>
      <label>Rede<select name="network" className={field}>{networkOptions.map((network) => <option key={network}>{network}</option>)}</select></label>
      <button className={button} disabled={add.isPending}>Adicionar carteira</button>
      <p role="status">{message}</p>
    </form>
    <Link to="/profile" className="mt-6 inline-block text-[#D28A4C]">Voltar ao perfil</Link>
  </main><Footer /></>;
};
