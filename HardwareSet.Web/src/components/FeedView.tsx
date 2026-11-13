import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import type {
  HardwareCategory,
  HardwareProduct,
  PrebuiltSetup,
} from '../types/hardware';
import {
  SLOT_DEFINITIONS,
  buildDynamicSetupsFromCatalog,
  calculateSetupPartsTotal,
  formatBRL,
} from '../data/hardwareCatalog';

interface FeedViewProps {
  products: HardwareProduct[];
  isLoading: boolean;
  error: string | null;
  onStartEmptyBuilder: () => void;
  onOpenCreateItem: () => void;
  onLoadPrebuiltSetup: (setup: PrebuiltSetup) => void;
  onSelectSinglePartAndBuild: (product: HardwareProduct) => void;
}

const EASE_ENTER: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function FeedView({
  products,
  isLoading,
  error,
  onStartEmptyBuilder,
  onOpenCreateItem,
  onLoadPrebuiltSetup,
  onSelectSinglePartAndBuild,
}: FeedViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    HardwareCategory | 'all'
  >('all');

  const dynamicSetups = buildDynamicSetupsFromCatalog(products);
  const featuredSetup = dynamicSetups[0];
  const featuredTotal = featuredSetup
    ? calculateSetupPartsTotal(featuredSetup.parts)
    : 0;

  const heroGpu =
    products.find((p) => p.category === 'gpu') || products[0] || null;
  const heroMotherboard =
    products.find((p) => p.category === 'motherboard') || products[1] || null;
  const heroCpu =
    products.find((p) => p.category === 'cpu') || products[2] || null;

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((item) => item.category === selectedCategory);

  return (
    <div>
      {/* SECTION 1: HERO (100svh, split composition) */}
      <section
        className="hero-screen border-b border-[var(--border)]"
        aria-labelledby="hero-heading"
      >
        <div className="wrap flex items-center">
          <div className="grid-12 w-full items-start">
            {/* Left Column: Span 5 on desktop */}
            <div className="col-span-12 lg:col-span-5 flex flex-col justify-between h-full">
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.52, ease: EASE_ENTER }}
                  className="text-[14px] text-[var(--muted)] tabular-price mb-4"
                >
                  6 etapas de montagem · Orçamento atualizado em tempo real
                </motion.p>

                <h1 id="hero-heading" className="h1-display mb-6">
                  {[
                    'Montagem de',
                    'computadores sob',
                    'medida para estudo,',
                    'trabalho e jogos.',
                  ].map((line, index) => (
                    <span
                      key={line}
                      className="block overflow-hidden pb-[0.06em]"
                    >
                      <motion.span
                        initial={{ y: '100%' }}
                        animate={{ y: '0%' }}
                        transition={{
                          duration: 0.7,
                          delay: index * 0.06,
                          ease: EASE_ENTER,
                        }}
                        className="block"
                      >
                        {line}
                      </motion.span>
                    </span>
                  ))}
                </h1>

                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.52, delay: 0.24, ease: EASE_ENTER }}
                  className="t-body-copy text-[18px] leading-[28px] measure mb-8"
                >
                  Selecione processador, placa-mãe, placa de vídeo, memória,
                  armazenamento e fonte em um painel interativo com soma
                  imediata do valor total.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.52, delay: 0.3, ease: EASE_ENTER }}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-12"
                >
                  <button
                    type="button"
                    onClick={onStartEmptyBuilder}
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

                  <button
                    type="button"
                    onClick={onOpenCreateItem}
                    className="btn btn--secondary"
                  >
                    <Plus size={16} aria-hidden="true" />
                    <span>Cadastrar Item</span>
                  </button>
                </motion.div>
              </div>

              {/* Docked three-fact row */}
              <motion.dl
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.52, delay: 0.36, ease: EASE_ENTER }}
                className="grid grid-cols-3 gap-4 pt-6 border-t border-[var(--border)] m-0"
              >
                <div>
                  <dt className="t-label-meta mb-1">Catálogo</dt>
                  <dd className="m-0 text-[16px] font-medium text-[var(--ink)] tabular-price">
                    {products.length} itens
                  </dd>
                </div>
                <div>
                  <dt className="t-label-meta mb-1">Arquitetura</dt>
                  <dd className="m-0 text-[16px] font-medium text-[var(--ink)]">
                    AM4 & PCIe 5.0
                  </dd>
                </div>
                <div>
                  <dt className="t-label-meta mb-1">Alimentação</dt>
                  <dd className="m-0 text-[16px] font-medium text-[var(--ink)] tabular-price">
                    650&nbsp;W 80 Plus
                  </dd>
                </div>
              </motion.dl>
            </div>

            {/* Right Column: Span 7 on desktop - Lit Hardware Stage */}
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: EASE_ENTER }}
              className="col-span-12 lg:col-span-7 relative"
            >
              <div className="hw-stage min-h-[380px] sm:min-h-[480px] lg:min-h-[540px] p-6 sm:p-10 flex flex-col justify-between border border-[var(--border)]">
                <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
                  <span className="t-label-meta">
                    {heroGpu
                      ? `Composição em destaque · ${heroGpu.name}`
                      : 'Composição de hardware'}
                  </span>
                  <span className="font-mono text-[13px] text-[var(--c-text)] tabular-price">
                    650&nbsp;W 80 Plus
                  </span>
                </div>

                {heroGpu ? (
                  <div className="relative my-auto py-6 grid grid-cols-12 items-center gap-4">
                    <div className="col-span-12 sm:col-span-7 flex items-center justify-center">
                      <img
                        src={heroGpu.image}
                        alt={heroGpu.name}
                        fetchPriority="high"
                        width={520}
                        height={360}
                        className="hw-stage__img w-full max-w-[360px] max-h-[260px] object-contain"
                      />
                    </div>
                    <div className="col-span-12 sm:col-span-5 flex sm:flex-col items-center justify-center gap-4">
                      {heroMotherboard && (
                        <img
                          src={heroMotherboard.image}
                          alt={heroMotherboard.name}
                          width={240}
                          height={180}
                          className="hw-stage__img w-1/2 sm:w-full max-w-[190px] max-h-[140px] object-contain"
                        />
                      )}
                      {heroCpu && (
                        <img
                          src={heroCpu.image}
                          alt={heroCpu.name}
                          width={160}
                          height={160}
                          className="hw-stage__img w-1/3 sm:w-full max-w-[120px] max-h-[110px] object-contain"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="my-auto py-12 text-center">
                    <p className="t-card-title mb-2">
                      {isLoading
                        ? 'Carregando catálogo de peças...'
                        : 'Nenhuma peça cadastrada ainda'}
                    </p>
                    <p className="t-body-copy mb-6">
                      Adicione um item ao catálogo para visualizá-lo no palco e
                      no montador de computadores.
                    </p>
                    <button
                      type="button"
                      onClick={onOpenCreateItem}
                      className="btn btn--primary"
                    >
                      <Plus size={16} aria-hidden="true" />
                      <span>Cadastrar Item</span>
                    </button>
                  </div>
                )}

                {featuredSetup ? (
                  <div className="bg-[var(--card)] border border-[var(--border-strong)] rounded-[12px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-2 h-2 rounded-full bg-[var(--action)]"
                          aria-hidden="true"
                        />
                        <span className="t-label-meta">
                          {featuredSetup.name}
                        </span>
                      </div>
                      <p className="m-0 text-[16px] text-[var(--c-text)]">
                        {Object.values(featuredSetup.parts)
                          .filter(Boolean)
                          .map((p) => p!.name)
                          .join(' · ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="block t-label-meta">
                          Total somado
                        </span>
                        <span className="text-[20px] font-medium font-mono text-[var(--ink)] tabular-price">
                          {formatBRL(featuredTotal)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onLoadPrebuiltSetup(featuredSetup)}
                        className="btn btn--secondary !px-4"
                      >
                        <span>Abrir setup</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-4 flex items-center justify-between gap-4">
                    <span className="text-[14px] text-[var(--muted)]">
                      {error ||
                        'Cadastre componentes para visualizar combinações recomendadas.'}
                    </span>
                    <button
                      type="button"
                      onClick={onOpenCreateItem}
                      className="btn btn--secondary !min-h-[38px] !px-3.5 !text-[14px]"
                    >
                      <span>Adicionar item</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PRE-BUILT SETUPS VITRINE (#setups) */}
      {dynamicSetups.length > 0 && (
        <section
          id="setups"
          className="section-block border-b border-[var(--border)]"
          aria-labelledby="setups-heading"
        >
          <div className="wrap">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
              <div>
                <h2 id="setups-heading" className="h2-display measure">
                  Setups prontos para montar.{' '}
                  <span className="text-[var(--muted)]">
                    Carregue uma configuração completa ou edite cada slot.
                  </span>
                </h2>
              </div>
              <button
                type="button"
                onClick={onStartEmptyBuilder}
                className="btn btn--primary self-start lg:self-auto"
              >
                <span>Criar computador do zero</span>
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

            <div className="grid-12 items-stretch">
              {dynamicSetups.map((setup) => {
                const total = calculateSetupPartsTotal(setup.parts);
                const gpu = setup.parts.gpu;
                const mb = setup.parts.motherboard;
                const cpu = setup.parts.cpu;

                return (
                  <article
                    key={setup.id}
                    className="col-span-12 lg:col-span-4 hw-card hw-card--interactive p-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="hw-stage h-[240px] p-6 flex items-center justify-between gap-3">
                        {gpu && (
                          <img
                            src={gpu.image}
                            alt={gpu.name}
                            loading="lazy"
                            width={260}
                            height={180}
                            className="hw-stage__img w-[58%] h-full object-contain"
                          />
                        )}
                        <div className="w-[38%] h-full flex flex-col items-center justify-center gap-3">
                          {mb && (
                            <img
                              src={mb.image}
                              alt={mb.name}
                              loading="lazy"
                              width={130}
                              height={100}
                              className="hw-stage__img max-h-[105px] w-full object-contain"
                            />
                          )}
                          {cpu && (
                            <img
                              src={cpu.image}
                              alt={cpu.name}
                              loading="lazy"
                              width={90}
                              height={90}
                              className="hw-stage__img max-h-[72px] w-full object-contain"
                            />
                          )}
                        </div>
                      </div>

                      <div className="p-6 pb-4">
                        <p className="t-label-meta m-0 mb-2">{setup.tag}</p>
                        <h3 className="t-card-title m-0 mb-2">{setup.name}</h3>
                        <p className="t-body-copy m-0 mb-6">
                          {setup.description}
                        </p>

                        <ul className="spec-rows border-t border-[var(--border)]">
                          {SLOT_DEFINITIONS.map((slot) => {
                            const part = setup.parts[slot.category];
                            return (
                              <li key={slot.category}>
                                <span className="text-[var(--muted)]">
                                  {slot.shortLabel}
                                </span>
                                <span className="text-[var(--ink)] font-medium text-right">
                                  {part ? part.name : 'Livre no montador'}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>

                    <div className="p-6 pt-2 flex items-center justify-between gap-4">
                      <div>
                        <span className="block t-label-meta">Valor total</span>
                        <span className="text-[22px] font-medium font-mono text-[var(--ink)] tabular-price">
                          {formatBRL(total)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onLoadPrebuiltSetup(setup)}
                        className="btn btn--primary"
                      >
                        <span>Personalizar</span>
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
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: HARDWARE CATALOG (#catalogo, alternate ground) */}
      <section
        id="catalogo"
        className="section-block ground-surface border-b border-[var(--border)]"
        aria-labelledby="catalog-heading"
      >
        <div className="wrap">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <h2 id="catalog-heading" className="h2-display measure">
                Catálogo de peças disponíveis.{' '}
                <span className="text-[var(--muted)]">
                  Adicione novos itens ou selecione uma peça para o seu
                  computador.
                </span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                role="tablist"
                aria-label="Filtrar peças por categoria"
                className="flex flex-wrap gap-2"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === 'all'}
                  onClick={() => setSelectedCategory('all')}
                  className={`min-h-[44px] px-4 rounded-[8px] text-[14px] font-medium cursor-pointer border transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-[var(--action)] text-[var(--action-ink)] border-transparent'
                      : 'bg-[var(--card)] text-[var(--c-text)] border-[var(--border)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  Todas
                </button>
                {SLOT_DEFINITIONS.map((slot) => (
                  <button
                    key={slot.category}
                    type="button"
                    role="tab"
                    aria-selected={selectedCategory === slot.category}
                    onClick={() => setSelectedCategory(slot.category)}
                    className={`min-h-[44px] px-4 rounded-[8px] text-[14px] font-medium cursor-pointer border transition-colors ${
                      selectedCategory === slot.category
                        ? 'bg-[var(--action)] text-[var(--action-ink)] border-transparent'
                        : 'bg-[var(--card)] text-[var(--c-text)] border-[var(--border)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    {slot.shortLabel}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={onOpenCreateItem}
                className="btn btn--primary"
              >
                <Plus size={16} aria-hidden="true" />
                <span>Cadastrar Item</span>
              </button>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="hw-card p-10 text-center">
              <h3 className="t-card-title m-0 mb-2">
                Nenhum componente encontrado nesta categoria
              </h3>
              <p className="t-body-copy m-0 mb-6">
                Cadastre um novo item para disponibilizá-lo na vitrine e no
                montador de computadores.
              </p>
              <button
                type="button"
                onClick={onOpenCreateItem}
                className="btn btn--primary"
              >
                <Plus size={16} aria-hidden="true" />
                <span>Cadastrar Item</span>
              </button>
            </div>
          ) : (
            <div className="grid-12 items-stretch">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="col-span-12 sm:col-span-6 lg:col-span-3 hw-card hw-card--interactive p-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="hw-stage aspect-[4/3] p-6 flex items-center justify-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        width={300}
                        height={225}
                        className="hw-stage__img max-h-[160px] w-full object-contain"
                      />
                    </div>

                    <div className="p-5 pb-3">
                      <p className="t-label-meta m-0 mb-1.5">
                        {product.categoryLabel}
                      </p>
                      <h3 className="t-card-title m-0 mb-2">{product.name}</h3>
                      <p className="t-body-copy m-0">{product.summarySpec}</p>
                    </div>
                  </div>

                  <div className="p-5 pt-3 flex items-center justify-between gap-3 border-t border-[var(--border)] mx-1">
                    <span className="text-[18px] font-medium font-mono text-[var(--ink)] tabular-price">
                      {formatBRL(product.price)}
                    </span>

                    <button
                      type="button"
                      onClick={() => onSelectSinglePartAndBuild(product)}
                      className="btn btn--secondary !px-3.5 !min-h-[40px] !text-[14px]"
                    >
                      <span>Adicionar</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
