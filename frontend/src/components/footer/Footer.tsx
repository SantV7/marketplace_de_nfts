import { useRef, useState, type FormEvent } from 'react';
import {
  ShieldCheck,
  Palette,
  Bell,
  User,
  Bookmark,
  Activity,
  Sparkles,
  Heart,
  HelpCircle,
  ShoppingBag,
  Lock,
  FileText,
  AlertTriangle,
  Layers,
  Camera,
  Music,
  Box,
  Compass,
} from 'lucide-react';

const Footer = () => {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [emailError, setEmailError] = useState('');

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const emailInput = emailInputRef.current;
    if (!emailInput) return;

    if (!emailInput.validity.valid) {
      setEmailError(
        emailInput.validity.valueMissing
          ? 'Informe seu e-mail.'
          : 'Digite um endereço de e-mail válido.',
      );
      emailInput.focus();
      return;
    }

    setEmailError('');
  };

  return (
    <footer className="bg-[#140D0A] pt-16 font-mono text-[#F5F1EB] border-t border-[#3D2C24]">
      <div className="mx-auto max-w-7xl px-4 pb-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-[#231712] p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#D28A4C] text-[#140D0A]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold">Segurança da carteira</h3>
            <p className="mt-2 text-xs text-[#CFB28C]">
              Proteja sua carteira e colecione arte digital verificada com confiança.
            </p>
          </div>

          <div className="rounded-xl bg-[#231712] p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#D28A4C] text-[#140D0A]">
              <Palette className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold">Criadores em destaque</h3>
            <p className="mt-2 text-xs text-[#CFB28C]">
              Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.
            </p>
          </div>

          <div className="rounded-xl bg-[#231712] p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#D28A4C] text-[#140D0A]">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold">Alertas de lançamentos</h3>
            <p className="mt-2 text-xs text-[#CFB28C]">
              Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.
            </p>
          </div>

          <div className="rounded-xl bg-[#231712] p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold">Antecipe-se ao próximo lançamento</h3>
              <p className="mt-2 text-xs text-[#CFB28C]">
                Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
              </p>
            </div>
            <form
              className="mt-4"
              noValidate
              onSubmit={handleNewsletterSubmit}
            >
              <div className="flex gap-2">
                <input
                  ref={emailInputRef}
                  name="newsletter-email"
                  type="email"
                  required
                  placeholder="digite seu e-mail..."
                  aria-label="E-mail para receber novidades"
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={emailError ? 'newsletter-email-error' : undefined}
                  onChange={() => {
                    if (emailInputRef.current?.validity.valid) setEmailError('');
                  }}
                  className={`w-full rounded-lg bg-[#140D0A] px-3 py-2 text-xs text-[#F5F1EB] outline-none border focus:border-[#D28A4C] ${
                    emailError ? 'border-red-500' : 'border-[#3D2C24]'
                  }`}
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[#D28A4C] px-4 py-2 text-xs font-bold text-[#140D0A] transition-colors hover:bg-[#E09A5C]"
                >
                  Enviar
                </button>
              </div>
              {emailError && (
                <p
                  id="newsletter-email-error"
                  role="alert"
                  className="mt-2 rounded-md border border-red-500/70 bg-red-950/60 px-3 py-2 text-xs text-red-300"
                >
                  {emailError}
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between border-y border-[#3D2C24] py-8 text-xs text-[#CFB28C]">
          <span className="font-bold text-[#F5F1EB]">KURIO</span>
          <span>Feito para colecionadores, criadores e cultura</span>
          <span>contato@email.com</span>
          <span>+55 11 4002 8922</span>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div>
            <h4 className="font-bold text-[#F5F1EB]">Meu perfil</h4>
            <ul className="mt-3 space-y-2.5 text-[#CFB28C]">
              <li className="flex items-center gap-2 hover:text-[#D28A4C] cursor-pointer transition-colors">
                <User className="h-3.5 w-3.5 text-[#D28A4C]" /> Meu perfil
              </li>
              <li className="flex items-center gap-2 hover:text-[#D28A4C] cursor-pointer transition-colors">
                <Bookmark className="h-3.5 w-3.5 text-[#D28A4C]" /> Minha coleção
              </li>
              <li className="flex items-center gap-2 hover:text-[#D28A4C] cursor-pointer transition-colors">
                <Activity className="h-3.5 w-3.5 text-[#D28A4C]" /> Atividade
              </li>
              <li className="flex items-center gap-2 hover:text-[#D28A4C] cursor-pointer transition-colors">
                <Sparkles className="h-3.5 w-3.5 text-[#D28A4C]" /> Estúdio do criador
              </li>
              <li className="flex items-center gap-2 hover:text-[#D28A4C] cursor-pointer transition-colors">
                <Heart className="h-3.5 w-3.5 text-[#D28A4C]" /> Lista de interesse
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#F5F1EB]">Central de ajuda</h4>
            <ul className="mt-3 space-y-2.5 text-[#CFB28C]">
              <li className="flex items-center gap-2 hover:text-[#D28A4C] cursor-pointer transition-colors">
                <HelpCircle className="h-3.5 w-3.5 text-[#D28A4C]" /> Central de ajuda
              </li>
              <li className="flex items-center gap-2 hover:text-[#D28A4C] cursor-pointer transition-colors">
                <ShoppingBag className="h-3.5 w-3.5 text-[#D28A4C]" /> Como comprar NFTs
              </li>
              <li className="flex items-center gap-2 hover:text-[#D28A4C] cursor-pointer transition-colors">
                <Lock className="h-3.5 w-3.5 text-[#D28A4C]" /> Carteira e segurança
              </li>
              <li className="flex items-center gap-2 hover:text-[#D28A4C] cursor-pointer transition-colors">
                <FileText className="h-3.5 w-3.5 text-[#D28A4C]" /> Política do mercado
              </li>
              <li className="flex items-center gap-2 hover:text-[#D28A4C] cursor-pointer transition-colors">
                <AlertTriangle className="h-3.5 w-3.5 text-[#D28A4C]" /> Denunciar item
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#F5F1EB]">Coleções</h4>
            <ul className="mt-3 space-y-2.5 text-[#CFB28C]">
              <li className="flex items-center gap-2 hover:text-[#D28A4C] cursor-pointer transition-colors">
                <Layers className="h-3.5 w-3.5 text-[#D28A4C]" /> Arte digital
              </li>
              <li className="flex items-center gap-2 hover:text-[#D28A4C] cursor-pointer transition-colors">
                <Camera className="h-3.5 w-3.5 text-[#D28A4C]" /> Fotografia
              </li>
              <li className="flex items-center gap-2 hover:text-[#D28A4C] cursor-pointer transition-colors">
                <Music className="h-3.5 w-3.5 text-[#D28A4C]" /> Música
              </li>
              <li className="flex items-center gap-2 hover:text-[#D28A4C] cursor-pointer transition-colors">
                <Box className="h-3.5 w-3.5 text-[#D28A4C]" /> Arte 3D
              </li>
              <li className="flex items-center gap-2 hover:text-[#D28A4C] cursor-pointer transition-colors">
                <Compass className="h-3.5 w-3.5 text-[#D28A4C]" /> Utilidade
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h4 className="font-bold text-[#F5F1EB]">Redes sociais</h4>
              <div className="mt-3 flex gap-3 text-[#D28A4C]">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#3D2C24] hover:border-[#D28A4C] cursor-pointer">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#3D2C24] hover:border-[#D28A4C] cursor-pointer">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#3D2C24] hover:border-[#D28A4C] cursor-pointer">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#3D2C24] hover:border-[#D28A4C] cursor-pointer">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#3D2C24] hover:border-[#D28A4C] cursor-pointer">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-[#F5F1EB]">Carteiras compatíveis</h4>
              <p className="mt-2 text-[10px] text-[#CFB28C]">METAMASK • WALLETCONNECT • COINBASE</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-[10px] text-[#CFB28C]">
          © 2026 Kurio. Propriedade digital para todos.
        </div>
      </div>
    </footer>
  );
};

export default Footer;