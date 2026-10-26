import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useSearch } from '@tanstack/react-router';
import { AuthInput } from './AuthInput';
import { AuthDialog } from './AuthDialog';
import { GoogleIcon, FacebookIcon, PasswordVisibilityIcon } from './AuthIcons';
import { z } from 'zod';
import { useLogin, useRegister } from '@/services/queries';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/queries';

const AuthPanel = ({ children }: { children: ReactNode }) => <div className="w-full">{children}</div>;
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

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegister = location.pathname === '/register';
  const { redirect: returnTo } = useSearch({ strict: false });
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
    void navigate({ to: register ? '/register' : '/login', search: { redirect: returnTo } });
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

      <p className="mx-auto mb-6 max-w-102.5 text-center text-[13px] leading-4 text-[#F5F1EB]">
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
          disabled={loginMutation.isPending || registerMutation.isPending}
          className="flex h-11.25 w-full items-center justify-center rounded-[5px] bg-[#D28A4C] text-sm font-bold text-[#140D0A] transition-colors hover:bg-[#E09A5C]"
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

export default Auth;
