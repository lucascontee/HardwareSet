import type { ActiveView } from './Navbar';

interface FooterProps {
  onNavigate: (view: ActiveView, sectionId?: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="section-block bg-[var(--g-dark)]">
      <div className="wrap flex flex-col justify-between gap-16">
        {/* Row 1: Close-type (sections.md Section 2) */}
        <div className="pb-16 border-b border-[var(--border)] flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <h2 className="h2-display measure mb-4">
              Monte seu computador peça por peça.{' '}
              <span className="text-[var(--muted)]">
                Catálogo integrado diretamente ao banco de dados MongoDB.
              </span>
            </h2>
            <p className="t-body-copy m-0">
              Cadastre novas peças no catálogo ou inicie a montagem do seu
              computador agora.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => onNavigate('create')}
              className="btn btn--secondary"
            >
              <span>Cadastrar nova peça</span>
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

        {/* Row 2: Directory & Legal Row (system.md Footer) */}
        <div className="flex flex-col gap-10">
          <div className="grid-12 items-start">
            <div className="col-span-12 md:col-span-5">
              <div className="inline-flex items-center gap-3 mb-3">
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
                <span className="text-[20px] font-medium tracking-[-0.03em] text-[var(--ink)]">
                  HardwareSet
                </span>
              </div>
              <p className="t-body-copy measure m-0">
                Configurador de hardware e estações de trabalho com persistência
                NoSQL em MongoDB.
              </p>
            </div>

            <div className="col-span-6 md:col-span-3">
              <h3 className="t-label-meta m-0 mb-3">Navegação</h3>
              <ul className="list-none m-0 p-0 flex flex-col gap-2">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('feed', 'top')}
                    className="nav-link !min-h-[32px] !p-0"
                  >
                    Vitrine
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('feed', 'setups')}
                    className="nav-link !min-h-[32px] !p-0"
                  >
                    Setups prontos
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('feed', 'catalogo')}
                    className="nav-link !min-h-[32px] !p-0"
                  >
                    Catálogo de peças
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('create')}
                    className="nav-link !min-h-[32px] !p-0"
                  >
                    Cadastrar peça
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('builder')}
                    className="nav-link !min-h-[32px] !p-0"
                  >
                    Montador de PC
                  </button>
                </li>
              </ul>
            </div>

            <div className="col-span-6 md:col-span-4">
              <h3 className="t-label-meta m-0 mb-3">Integração Backend</h3>
              <p className="t-body-copy m-0 text-[15px]">
                ASP.NET Core Web API (.NET 10) · MongoDB.Driver · Coleção
                CatalogoDb.Products
              </p>
            </div>
          </div>

          {/* Single Footer Credit Line */}
          <div className="pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[13px] text-[var(--muted)]">
            <span>© 2026 HardwareSet. Todos os direitos reservados.</span>
            <span>
              Nomes de produtos e imagens pertencem aos seus respectivos
              fabricantes.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
