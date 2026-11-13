import { Plus } from 'lucide-react';
import { AnimatedPrice } from './AnimatedPrice';

export type ActiveView = 'feed' | 'builder' | 'create';

interface NavbarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView, sectionId?: string) => void;
  totalPrice: number;
}

export function Navbar({
  activeView,
  onNavigate,
  totalPrice,
}: NavbarProps) {
  return (
    <header className="nav">
      <div className="wrap h-full flex items-center justify-between gap-6">
        <a className="skip-link" href="#top">
          Pular para o conteúdo
        </a>

        {/* Left line: Brand Mark + Name + Links */}
        <div className="flex items-center gap-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('feed', 'top');
            }}
            className="inline-flex items-center gap-3 text-[var(--ink)] no-underline min-h-[44px]"
          >
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-[6px] bg-[var(--action)] text-[var(--action-ink)]"
              aria-hidden="true"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 3.5L7 1.5L12 3.5L7 5.5L2 3.5Z"
                  fill="currentColor"
                />
                <path
                  d="M2 7L7 9L12 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 10.25L7 12.25L12 10.25"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-[20px] font-medium tracking-[-0.03em]">
              HardwareSet
            </span>
          </a>

          <nav
            aria-label="Navegação principal"
            className="hidden md:flex items-center gap-6"
          >
            <button
              type="button"
              onClick={() => onNavigate('feed', 'top')}
              aria-current={activeView === 'feed' ? 'page' : undefined}
              className="nav-link"
            >
              Vitrine
            </button>
            <button
              type="button"
              onClick={() => onNavigate('feed', 'setups')}
              className="nav-link"
            >
              Setups
            </button>
            <button
              type="button"
              onClick={() => onNavigate('feed', 'catalogo')}
              className="nav-link"
            >
              Catálogo
            </button>
            <button
              type="button"
              onClick={() => onNavigate('builder')}
              aria-current={activeView === 'builder' ? 'page' : undefined}
              className="nav-link"
            >
              Montador
            </button>
            <button
              type="button"
              onClick={() => onNavigate('create')}
              aria-current={activeView === 'create' ? 'page' : undefined}
              className="nav-link"
            >
              Cadastrar Item
            </button>
          </nav>
        </div>

        {/* Right line: Total Price (when > 0) + Action Buttons (no hamburger icon, no X/Y peças) */}
        <div className="flex items-center gap-3">
          {totalPrice > 0 && (
            <button
              type="button"
              onClick={() => onNavigate('builder')}
              className="hidden lg:inline-flex items-center gap-2.5 min-h-[44px] px-3.5 rounded-[8px] border border-[var(--border)] bg-[var(--card)] text-[14px] text-[var(--c-text)] cursor-pointer hover:border-[var(--border-strong)] transition-colors"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--action)]" />
              <AnimatedPrice
                value={totalPrice}
                className="font-medium text-[var(--ink)] font-mono text-[14px]"
              />
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate('create')}
            className="btn btn--secondary !px-3.5 sm:!px-4"
          >
            <Plus size={16} aria-hidden="true" />
            <span>Adicionar item</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('builder')}
            className="btn btn--primary"
          >
            <span>Criar computador</span>
            <svg
              className="m-arrow"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
