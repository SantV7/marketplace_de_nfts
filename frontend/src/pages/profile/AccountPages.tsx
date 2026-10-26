import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import { useAddWallet, useProfile, useUpdateProfile, useWallets } from '@/services/queries';

const shell = 'mx-auto min-h-[65vh] max-w-3xl px-5 py-10 font-mono text-[#F5F1EB]';

export const ProfilePage = () => {
  const query = useProfile();
  const update = useUpdateProfile();
  const [message, setMessage] = useState('');
  return <><Navbar /><main className={shell}><h1 className="mb-6 text-2xl font-bold">Perfil do colecionador</h1>{query.isLoading ? <p role="status">Carregando perfil…</p> : query.isError ? <p role="alert">Inicie sessão para editar o perfil.</p> : <form className="grid gap-4" onSubmit={async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); try { await update.mutateAsync({ name: form.get('name'), username: form.get('username'), avatar: form.get('avatar') }); setMessage('Perfil atualizado.'); } catch { setMessage('Não foi possível atualizar o perfil.'); } }}><label>Nome<input name="name" defaultValue={String(query.data?.name ?? '')} required className="mt-1 block w-full rounded border border-[#3D2C24] bg-transparent p-3" /></label><label>Nome de usuário<input name="username" defaultValue={String(query.data?.username ?? '')} minLength={3} required className="mt-1 block w-full rounded border border-[#3D2C24] bg-transparent p-3" /></label><label>URL do avatar<input name="avatar" type="url" className="mt-1 block w-full rounded border border-[#3D2C24] bg-transparent p-3" /></label><button className="rounded bg-[#D28A4C] p-3 font-bold text-[#140D0A]">Salvar perfil</button><p role="status">{message}</p></form>}<Link to="/wallets" className="mt-6 inline-block text-[#D28A4C]">Gerenciar carteiras</Link></main><Footer /></>;
};

export const WalletsPage = () => {
  const query = useWallets();
  const add = useAddWallet();
  const [message, setMessage] = useState('');
  return <><Navbar /><main className={shell}><h1 className="mb-6 text-2xl font-bold">Carteiras</h1>{query.isError && <p role="alert">Inicie sessão para consultar as carteiras.</p>}<ul className="mb-6 space-y-2">{(query.data ?? []).map((wallet) => <li key={wallet.id} className="rounded border border-[#3D2C24] p-4">{wallet.label} · {wallet.address} · {wallet.network}</li>)}</ul><form className="grid gap-3" onSubmit={async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); try { await add.mutateAsync({ address: String(form.get('address')), label: String(form.get('label')), network: String(form.get('network')) }); setMessage('Carteira cadastrada.'); (event.currentTarget as HTMLFormElement).reset(); } catch { setMessage('Carteira inválida ou já cadastrada.'); } }}><label>Identificação<input name="label" required className="mt-1 block w-full rounded border border-[#3D2C24] bg-transparent p-3" /></label><label>Endereço<input name="address" required minLength={8} className="mt-1 block w-full rounded border border-[#3D2C24] bg-transparent p-3" /></label><label>Rede<select name="network" className="mt-1 block w-full rounded border border-[#3D2C24] bg-[#140D0A] p-3"><option>Ethereum</option><option>Polygon</option><option>Solana</option></select></label><button className="rounded bg-[#D28A4C] p-3 font-bold text-[#140D0A]">Adicionar carteira</button><p role="status">{message}</p></form></main><Footer /></>;
};
