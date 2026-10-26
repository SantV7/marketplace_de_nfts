import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useSearch } from '@tanstack/react-router';
import { z } from 'zod';
import { useLogin, useRegister } from '@/services/queries';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/queries';

const AuthPanel = ({ children }: { children: ReactNode }) => <div className="w-full">{children}</div>;
const AuthDialog = ({ children, onClose, title }: { children: ReactNode; onClose: () => void; title: string }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0C0705]/45 px-5 py-8 font-mono" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-label={title} className="relative flex min-h-[600px] max-h-[calc(100svh-48px)] w-full max-w-[500px] flex-col overflow-y-auto border-b-[10px] border-[#D28A4C] bg-[#241612] px-8 pb-12 pt-10 sm:px-12">
      <button type="button" onClick={onClose} aria-label="Fechar" className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center text-[#D28A4C] hover:text-[#F5F1EB]">×</button>
      {children}
    </section>
  </div>
);

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Digite seu e-mail.')
  .email('Digite um e-mail válido.');

const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres.')
  .regex(/[a-z]/, 'Inclua uma letra minúscula.')
  .regex(/[A-Z]/, 'Inclua uma letra maiúscula.')
  .regex(/[0-9]/, 'Inclua pelo menos um número.');

const registrationSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'O nome deve ter pelo menos 3 caracteres.')
      .max(24, 'O nome deve ter no máximo 24 caracteres.'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

type AuthField = 'username' | 'email' | 'password' | 'confirmPassword';
type AuthErrors = Partial<Record<AuthField, string>>;

const GoogleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g clipPath="url(#google-icon-clip)">
      <path d="M16.4336 17.6055C14.6992 19.0703 12.4493 20 10 20C6.35547 20 3.15621 17.9922 1.42188 15.0625L2.07117 12.0695L4.94922 11.5352C5.61719 13.6914 7.63278 15.2734 10 15.2734C11.1484 15.2734 12.2148 14.9102 13.0938 14.2656L15.8594 14.6875L16.4336 17.6055Z" fill="#59C36A" />
      <path d="M16.4336 17.6055L15.8594 14.6875L13.0937 14.2656C12.2148 14.9102 11.1484 15.2734 10 15.2734V20C12.4493 20 14.6992 19.0703 16.4336 17.6055Z" fill="#00A66C" />
      <path d="M4.72656 10C4.72656 10.539 4.8086 11.0546 4.94922 11.5352L1.42188 15.0625C0.542969 13.5859 0 11.8515 0 10C0 8.1484 0.542969 6.41406 1.42188 4.9375L4.25285 5.42473L4.94922 8.46484C4.8086 8.94527 4.72656 9.4609 4.72656 10Z" fill="#FFDA2D" />
      <path d="M20 10C20 13.0468 18.5899 15.7773 16.4336 17.6055L13.0938 14.2656C13.7734 13.7734 14.3477 13.1171 14.7227 12.3437H10C9.67184 12.3437 9.41406 12.0859 9.41406 11.7578V8.24219C9.41406 7.91402 9.67184 7.65625 10 7.65625H19.25C19.5312 7.65625 19.7773 7.85543 19.8242 8.13668C19.9414 8.74609 20 9.37887 20 10Z" fill="#4086F4" />
      <path d="M14.7227 12.3437C14.3477 13.1171 13.7734 13.7734 13.0938 14.2656L16.4336 17.6055C18.5899 15.7773 20 13.0469 20 10C20 9.37887 19.9414 8.74609 19.8242 8.13668C19.7773 7.85543 19.5312 7.65625 19.25 7.65625H10V12.3437H14.7227Z" fill="#4175DF" />
      <path d="M16.5977 2.79293C16.6094 2.95699 16.5391 3.10937 16.4336 3.22652L13.9258 5.72262C13.7266 5.93355 13.3985 5.95699 13.1641 5.78121C12.2382 5.08984 11.1484 4.72656 10 4.72656C7.63278 4.72656 5.61719 6.30855 4.94922 8.46484L1.42188 4.9375C3.15621 2.00781 6.35547 0 10 0C12.332 0 14.6055 0.859375 16.3867 2.35934C16.5156 2.46484 16.5859 2.62887 16.5977 2.79293Z" fill="#FF641A" />
      <path d="M13.1641 5.78121C13.3984 5.95703 13.7265 5.93355 13.9257 5.72262L16.4336 3.22652C16.5391 3.10938 16.6094 2.95703 16.5976 2.79293C16.5859 2.62883 16.5156 2.46484 16.3867 2.35934C14.6055 0.859375 12.332 0 10 0V4.72656C11.1484 4.72656 12.2382 5.08984 13.1641 5.78121Z" fill="#F0805F" />
    </g>
    <defs>
      <clipPath id="google-icon-clip">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const FacebookIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M13.3309 3.32083H15.1567V0.140833C14.8417 0.0975 13.7584 0 12.4967 0C6.72005 0 8.29172 6.54167 8.06172 7.5H5.15588V11.055H8.06088V20H11.6226V11.0558H14.4101L14.8526 7.50083H11.6217C11.7784 5.1475 10.9876 3.32083 13.3309 3.32083V3.32083Z" fill="#3B5999" />
  </svg>
);

const PasswordVisibilityIcon = ({ visible }: { visible: boolean }) => (
  <svg
    width="23"
    height="20"
    viewBox="0 0 23 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {visible ? (
      <>
        <path d="M2.59723 10.1165C2.59723 7.3832 6.50723 4.0332 11.3333 4.0332C16.1592 4.0332 20.0786 7.3832 20.0786 10.117C20.0786 12.8503 16.1592 16.2003 11.3331 16.2003C6.50723 16.2003 2.59723 12.8503 2.59723 10.1165Z" stroke="#B39463" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="11.34" cy="10.12" r="2.75" stroke="#B39463" strokeWidth="1.5" />
      </>
    ) : (
      <>
        <path d="M6.06334 14.7749C3.95723 13.5582 2.59723 11.7249 2.59723 10.1165C2.59723 7.3832 6.50723 4.0332 11.3333 4.0332C13.3072 4.0332 15.1395 4.59154 16.6128 5.4582M18.747 7.17529C19.5885 8.11696 20.0786 9.15863 20.0786 10.117C20.0786 12.8503 16.1592 16.2003 11.3331 16.2003C10.4736 16.2003 9.63402 16.092 8.84918 15.9003M9.22318 11.9724C8.66123 11.4816 8.34673 10.8124 8.34957 10.1149C8.34579 8.66074 9.67934 7.47907 11.3283 7.47657C12.1217 7.4749 12.8829 7.7524 13.4439 8.2474M14.2701 10.5825C14.0491 11.6592 13.0942 12.5034 11.874 12.7009M18.7866 3.5415L3.88892 16.6865" stroke="#B39463" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    )}
  </svg>
);

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegister = location.pathname === '/register';
  const { redirect: returnTo } = useSearch({ from: isRegister ? '/register' : '/login' });
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<AuthErrors>({});
  const [status, setStatus] = useState('');
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const queryClient = useQueryClient();

  const handleModeChange = (register: boolean) => {
    setErrors({});
    setStatus('');
    void navigate({ to: register ? '/register' : '/login' });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('');

    if (isRegister) {
      const result = registrationSchema.safeParse({
        username,
        email,
        password,
        confirmPassword,
      });
      if (!result.success) {
        const nextErrors: AuthErrors = {};
        for (const issue of result.error.issues) {
          const field = issue.path[0];
          if (
            (field === 'username' ||
              field === 'email' ||
              field === 'password' ||
              field === 'confirmPassword') &&
            !nextErrors[field]
          ) {
            nextErrors[field] = issue.message;
          }
        }
        setErrors(nextErrors);
        return;
      }
    } else {
      const emailResult = emailSchema.safeParse(email);
      const passwordResult = passwordSchema.safeParse(password);
      const nextErrors: AuthErrors = {};
      if (!emailResult.success) nextErrors.email = emailResult.error.issues[0]?.message;
      if (!passwordResult.success) {
        nextErrors.password = passwordResult.error.issues[0]?.message;
      }
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;
    }

    setErrors({});
    try {
      if (isRegister) await registerMutation.mutateAsync({ username, email, password });
      else await loginMutation.mutateAsync({ email, password });
      setStatus('Sessão iniciada com sucesso.');
      await queryClient.invalidateQueries({ queryKey: queryKeys.session });
      const destination = returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/';
      window.setTimeout(() => { void navigate({ to: destination }); }, 150);
    } catch (error) {
      const message = typeof error === 'object' && error && 'response' in error
        ? String((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? '')
        : '';
      setStatus(message || 'Não foi possível concluir a autenticação. Tente novamente.');
    }
  };

  const handleSocialClick = (provider: string) => {
    setStatus(
      `O login com ${provider} está apenas ilustrado; nenhum acesso externo foi iniciado.`,
    );
  };

  const handleForgotPassword = () => {
    setStatus('A recuperação de senha ainda não está conectada a um serviço.');
  };

  const renderFormContent = (idPrefix: string) => (
    <AuthPanel>
      <div className="mb-6 flex items-center justify-center gap-2 text-xl font-medium">
        <button
          type="button"
          onClick={() => handleModeChange(false)}
          aria-current={!isRegister ? 'page' : undefined}
          className={!isRegister ? 'text-[#E89B55]' : 'text-[#F5F1EB]'}
        >
          Entrar
        </button>
        <span className="text-[#8C5A32]">|</span>
        <button
          type="button"
          onClick={() => handleModeChange(true)}
          aria-current={isRegister ? 'page' : undefined}
          className={isRegister ? 'text-[#E89B55]' : 'text-[#F5F1EB]'}
        >
          Criar conta
        </button>
      </div>

      <p className="mx-auto mb-6 max-w-[410px] text-center text-[13px] leading-4 text-[#F5F1EB]">
        {isRegister
          ? 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.'
          : 'Entre para gerenciar sua carteira, coleção e perfil de criador.'}
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        {isRegister && (
          <AuthInput
            id={`${idPrefix}-auth-username`}
            label="Nome de usuário"
            value={username}
            onChange={setUsername}
            error={errors.username}
            autoComplete="username"
          />
        )}
        <AuthInput
          id={`${idPrefix}-auth-email`}
          label={isRegister ? 'Digite seu e-mail' : 'contato@email.com'}
          type="email"
          value={email}
          onChange={setEmail}
          error={errors.email}
          autoComplete="email"
        />
        <AuthInput
          id={`${idPrefix}-auth-password`}
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={setPassword}
          error={errors.password}
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          onToggleVisibility={() => setShowPassword((visible) => !visible)}
          visibilityIcon={<PasswordVisibilityIcon visible={showPassword} />}
          visibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
        />
        {isRegister ? (
          <AuthInput
            id={`${idPrefix}-auth-confirm-password`}
            label="Confirmar senha"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={errors.confirmPassword}
            autoComplete="new-password"
            onToggleVisibility={() =>
              setShowConfirmPassword((visible) => !visible)
            }
            visibilityIcon={
              <PasswordVisibilityIcon visible={showConfirmPassword} />
            }
            visibilityLabel={
              showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'
            }
          />
        ) : (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-[13px] text-[#E89B55] hover:text-[#F5F1EB]"
            >
              Esqueceu a senha?
            </button>
          </div>
        )}

        <button
          type="submit"
          className="flex h-[45px] w-full items-center justify-center rounded-[5px] bg-[#D28A4C] text-sm font-bold text-[#140D0A] transition-colors hover:bg-[#E09A5C]"
        >
          {isRegister ? (
            <>
              <span className="md:hidden">{registerMutation.isPending ? 'Aguarde…' : 'Criar perfil'}</span>
              <span className="hidden md:inline">{registerMutation.isPending ? 'Aguarde…' : 'Criar conta'}</span>
            </>
          ) : (
            loginMutation.isPending ? 'Aguarde…' : 'Entrar'
          )}
        </button>
      </form>

      {status && (
        <p
          role="status"
          className="mt-3 text-center text-xs leading-5 text-[#CFB28C]"
        >
          {status}
        </p>
      )}

      <div className="my-5 flex items-center gap-3 text-[13px]">
        <span className="h-px flex-1 bg-[#3D2C24]" />
        <span className="shrink-0">Ou continue com</span>
        <span className="h-px flex-1 bg-[#3D2C24]" />
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => handleSocialClick('Google')}
          className="flex h-10 w-full items-center justify-center gap-3 rounded-[5px] border border-[#3D2C24] text-[13px] text-[#CFB28C] transition-colors hover:border-[#8C5A32]"
        >
          <GoogleIcon />
          Continuar com Google
        </button>
        <button
          type="button"
          onClick={() => handleSocialClick('Facebook')}
          className="flex h-10 w-full items-center justify-center gap-3 rounded-[5px] border border-[#3D2C24] text-[13px] text-[#CFB28C] transition-colors hover:border-[#8C5A32]"
        >
          <FacebookIcon />
          Continuar com Facebook
        </button>
      </div>

      <p className="mt-8 text-center text-xs text-[#CFB28C]">
        {isRegister ? 'Já tem uma conta? ' : 'Novo na Kurio? '}
        <button
          type="button"
          onClick={() => handleModeChange(!isRegister)}
          className="font-bold text-[#E89B55]"
        >
          {isRegister ? 'Entre' : 'Crie uma conta'}
        </button>
      </p>
    </AuthPanel>
  );

  return (
      <AuthDialog title={isRegister ? 'Criar conta' : 'Entrar'} onClose={() => void navigate({ to: '/' })}>
          <Link to="/" className="mx-auto mb-6 block w-fit text-[26px] font-bold uppercase tracking-[0.18em] text-[#F5F1EB]">KURIO</Link>
          <h1 className="mb-6 text-center text-base font-bold">{isRegister ? 'Criar perfil de colecionador' : 'Entrar'}</h1>
          {renderFormContent('auth')}
      </AuthDialog>
  );
};

const AuthInput = ({
  id,
  label,
  value,
  onChange,
  error,
  type = 'text',
  autoComplete,
  onToggleVisibility,
  visibilityIcon,
  visibilityLabel,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoComplete: string;
  onToggleVisibility?: () => void;
  visibilityIcon?: ReactNode;
  visibilityLabel?: string;
}) => (
  <div>
    <div
      className={`flex min-h-[40px] items-center rounded-[5px] border bg-transparent ${
        error ? 'border-red-400' : 'border-[#3D2C24]'
      }`}
    >
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        autoComplete={autoComplete}
        aria-required="true"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="min-w-0 flex-1 bg-transparent px-3.5 py-2 text-center text-xs text-[#F5F1EB] outline-none placeholder:text-[#B39463] md:text-left"
      />
      {onToggleVisibility && (
        <button
          type="button"
          onClick={onToggleVisibility}
          aria-label={visibilityLabel}
          className="flex h-10 w-10 shrink-0 items-center justify-center"
        >
          {visibilityIcon}
        </button>
      )}
    </div>
    {error && (
      <p id={`${id}-error`} className="mt-1 text-[11px] leading-4 text-red-400">
        {error}
      </p>
    )}
  </div>
);

export default Auth;
