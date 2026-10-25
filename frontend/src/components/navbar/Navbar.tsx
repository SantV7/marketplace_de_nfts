import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { Search, ShoppingCart, X } from 'lucide-react';

interface NavbarProps {
  badgeCount?: number;
}

export const Navbar = ({ badgeCount = 1 }: NavbarProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const isHomeActive =
    currentPath === '/' ||
    currentPath.startsWith('/login') ||
    currentPath.startsWith('/register') ||
    currentPath.startsWith('/profile') ||
    currentPath.startsWith('/wallets');
  const isMarketActive =
    currentPath.startsWith('/market') || currentPath.startsWith('/nft/');
  const isCreatorsActive = currentPath.startsWith('/creators');
  const isLearnActive = currentPath.startsWith('/learn');
  const isCartActive = currentPath.startsWith('/cart');

  const navItems = [
    { to: '/', label: 'Início', active: isHomeActive },
    { to: '/market', label: 'Mercado', active: isMarketActive },
    { to: '/creators', label: 'Criadores', active: isCreatorsActive },
    { to: '/learn', label: 'Aprenda', active: isLearnActive },
  ] as const;

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchValue.trim();

    if (!query) return;

    void navigate({
      to: '/market',
      search: { q: query },
    });
    setIsSearchOpen(false);
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  const navigationLinks = navItems.map(({ to, label, active }) => (
    <div key={to} className="relative flex h-full shrink-0 items-center">
      <Link
        to={to}
        aria-current={active ? 'page' : undefined}
        className={`whitespace-nowrap text-[13px] transition-opacity hover:opacity-80 max-[700px]:text-[10px] max-[420px]:text-[8px] ${
          active ? 'font-semibold text-[#D28A4C]' : 'font-normal text-[#F5F1EB]'
        }`}
      >
        {label}
      </Link>
      {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D28A4C]" />}
    </div>
  ));

  const searchControl = isSearchOpen ? (
    <form
      onSubmit={handleSearchSubmit}
      className="flex h-8 w-42.5 items-center gap-2 border-b border-[#D28A4C] px-1 max-[700px]:w-27.5 max-[420px]:w-20.5"
    >
      <Search className="h-4 w-4 shrink-0 text-[#D28A4C]" />
      <input
        type="search"
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        onKeyDown={handleSearchKeyDown}
        placeholder="Buscar NFTs"
        aria-label="Buscar NFTs"
        autoFocus
        className="min-w-0 flex-1 bg-transparent text-xs text-[#F5F1EB] placeholder-[#8C7A6B] outline-none"
      />
      <button
        type="button"
        onClick={() => {
          setSearchValue('');
          setIsSearchOpen(false);
        }}
        aria-label="Fechar busca"
        className="text-[#8C7A6B] hover:text-[#F5F1EB]"
      >
        <X className="h-4 w-4" />
      </button>
    </form>
  ) : (
    <button
      type="button"
      aria-label="Buscar NFTs"
      onClick={() => setIsSearchOpen(true)}
      className="flex h-8 w-8 shrink-0 items-center justify-center text-[#F5F1EB] transition-opacity hover:opacity-80"
    >
      <Search className="h-4.5 w-4.5" />
    </button>
  );

  const cartLink = (
    <Link
      to="/cart"
      aria-label="Carrinho de compras"
      className={`relative flex h-8 w-8 shrink-0 items-center justify-center border-b-2 transition-opacity hover:opacity-80 ${
        isCartActive ? 'border-[#D28A4C] text-[#D28A4C]' : 'border-transparent text-[#F5F1EB]'
      }`}
    >
      <ShoppingCart className="h-4.5 w-4.5" />
      {badgeCount > 0 && (
        <span
          style={{ backgroundColor: '#D28A4C', color: '#140D0A' }}
          className="absolute right-0 top-0 flex h-3 min-w-3 items-center justify-center rounded-full px-1 text-[9px] font-bold"
        >
          {badgeCount}
        </span>
      )}
    </Link>
  );

  return (
    <nav className="w-full bg-[#140D0A]">
      <div className="mx-auto w-full max-w-[1800px] px-10 font-mono max-[700px]:px-4 max-[420px]:px-2">
        <div className="grid h-13 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b border-[#F5F1EB]/10 max-[420px]:gap-1">
          <Link
            to="/"
            className="relative z-10 justify-self-start whitespace-nowrap text-[14px] font-bold uppercase tracking-widest text-[#F5F1EB] transition-opacity hover:opacity-90 max-[420px]:text-[10px]"
          >
            KURIO
          </Link>

          <div className="flex h-full items-center justify-center gap-8 max-[700px]:gap-2 max-[420px]:gap-1">
            {navigationLinks}
          </div>

          <div className="relative flex min-w-0 items-center justify-self-end gap-3 max-[700px]:gap-1 max-[420px]:gap-0">
            {searchControl}
            {cartLink}
            <Link
              to="/login"
              style={{ backgroundColor: '#D28A4C', color: '#140D0A' }}
              className="flex h-7 w-19.25 shrink-0 items-center justify-center gap-1 rounded-[5px] text-xs font-semibold transition-opacity hover:opacity-90 max-[700px]:h-7 max-[700px]:w-7 max-[700px]:rounded-full"
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 20 20" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <path d="M18.1592 10.1006H8.125" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="#140D0A"/>
                <path d="M15.7202 7.67059L18.1602 10.1006L15.7202 12.5306" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="#140D0A"/>
                <path d="M13.6332 6.35825C13.3582 3.37492 12.2415 2.29158 7.79985 2.29158C1.88234 2.29158 1.88234 4.21658 1.88234 9.99992C1.88234 15.7833 1.88234 17.7083 7.79985 17.7083C12.2415 17.7083 13.3582 16.6249 13.6332 13.6416" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="#140D0A"/>
              </svg>
              <span className="max-[700px]:hidden">Entrar</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;