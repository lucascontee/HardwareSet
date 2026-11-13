import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AnimatedPrice } from './AnimatedPrice';

export type ActiveView = 'feed' | 'builder';

interface NavbarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView, sectionId?: string) => void;
  selectedCount: number;
  totalSpots: number;
  totalPrice: number;
}

export function Navbar({
  activeView,
  onNavigate,
  selectedCount,
  totalSpots,
  totalPrice,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: ActiveView, sectionId?: string) => {
    setMobileMenuOpen(false);
    onNavigate(view, sectionId);
  };

  return (
    <header className="nav">
      <div className="wrap h-full flex items-center justify-between gap-6">
        <a className="skip-link" href="#top">
          Pular para o conteúdo
        </a>

        {/* Left line: Brand Mark + Name (system.md Nav) */}
        <div className="flex items-center gap-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('feed', 'top');
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

          {/* Navigation words (4 plain nouns, 15px/500, never wrap) */}
          <nav
            aria-label="Navegação principal"
            className="hidden md:flex items-center gap-6"
          >
            <button
              type="button"
              onClick={() => handleNavClick('feed', 'top')}
              aria-current={activeView === 'feed' ? 'page' : undefined}
              className="nav-link"
            >
              Vitrine
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('feed', 'setups')}
              className="nav-link"
            >
              Setups
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('feed', 'catalogo')}
              className="nav-link"
            >
              Catálogo
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('builder')}
              aria-current={activeView === 'builder' ? 'page' : undefined}
              className="nav-link"
            >
              Montador
            </button>
          </nav>
        </div>

        {/* Right line: Live Build Status + Main CTA Button */}
        <div className="flex items-center gap-3">
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={() => handleNavClick('builder')}
              className="hidden sm:inline-flex items-center gap-2.5 min-h-[44px] px-3.5 rounded-[8px] border border-[var(--border)] bg-[var(--card)] text-[14px] text-[var(--c-text)] cursor-pointer hover:border-[var(--border-strong)] transition-colors"
              aria-label={`Ver montagem atual com ${selectedCount} de ${totalSpots} peças`}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--action)]" />
              <span className="tabular-price text-[var(--muted)]">
                {selectedCount}/{totalSpots} peças
              </span>
              <span className="text-[var(--border-strong)]" aria-hidden="true">
                ·
              </span>
              <AnimatedPrice
                value={totalPrice}
                className="font-medium text-[var(--ink)] font-mono text-[14px]"
              />
            </button>
          )}

          <button
            type="button"
            onClick={() => handleNavClick('builder')}
            className="btn btn--primary hidden sm:inline-flex"
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

          {/* Mobile Menu Toggle (44x44 secondary look as required by system.md) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-sheet"
            aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            className="btn btn--secondary !px-0 w-[44px] h-[44px] md:hidden"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Full-screen mobile sheet under 768px (system.md Nav: 56px rows, closes on any tap) */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-sheet"
          className="fixed inset-x-0 top-[var(--nav)] bottom-0 bg-[var(--g-main)] border-t border-[var(--border)] z-40 md:hidden flex flex-col justify-between p-6"
        >
          <div className="flex flex-col divide-y divide-[var(--border)]">
            <button
              type="button"
              onClick={() => handleNavClick('feed', 'top')}
              className="h-[56px] flex items-center justify-between text-left text-[18px] font-medium text-[var(--ink)] bg-transparent border-0"
            >
              <span>Vitrine</span>
              {activeView === 'feed' && (
                <span className="t-label-meta">Atual</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('feed', 'setups')}
              className="h-[56px] flex items-center justify-between text-left text-[18px] font-medium text-[var(--ink)] bg-transparent border-0"
            >
              <span>Setups pré-montados</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('feed', 'catalogo')}
              className="h-[56px] flex items-center justify-between text-left text-[18px] font-medium text-[var(--ink)] bg-transparent border-0"
            >
              <span>Catálogo de peças</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('builder')}
              className="h-[56px] flex items-center justify-between text-left text-[18px] font-medium text-[var(--ink)] bg-transparent border-0"
            >
              <span>Montador de PC</span>
              <span className="tabular-price text-[14px] text-[var(--muted)]">
                {selectedCount}/{totalSpots} peças
              </span>
            </button>
          </div>

          <div className="pt-6 border-t border-[var(--border)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="t-label-meta">Orçamento em montagem</span>
              <AnimatedPrice
                value={totalPrice}
                className="text-[18px] font-medium text-[var(--ink)] font-mono"
              />
            </div>
            <button
              type="button"
              onClick={() => handleNavClick('builder')}
              className="btn btn--primary w-full"
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
      )}
    </header>
  );
}
