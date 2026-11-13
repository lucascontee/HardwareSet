import { useState } from 'react';
import { motion } from 'framer-motion';
import type {
  HardwareCategory,
  HardwareProduct,
  PrebuiltSetup,
} from '../types/hardware';
import {
  HARDWARE_PRODUCTS,
  PREBUILT_SETUPS,
  SLOT_DEFINITIONS,
  calculateSetupTotal,
  formatBRL,
  getProductById,
} from '../data/hardwareCatalog';

interface FeedViewProps {
  onStartEmptyBuilder: () => void;
  onLoadPrebuiltSetup: (setup: PrebuiltSetup) => void;
  onSelectSinglePartAndBuild: (product: HardwareProduct) => void;
}

const EASE_ENTER: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function FeedView({
  onStartEmptyBuilder,
  onLoadPrebuiltSetup,
  onSelectSinglePartAndBuild,
}: FeedViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    HardwareCategory | 'all'
  >('all');

  const rtx5070 = getProductById('gpu-rtx-5070')!;
  const rogStrix = getProductById('mb-rog-strix')!;
  const ryzen5700x = getProductById('cpu-ryzen-7-5700x')!;
  const flagshipSetup = PREBUILT_SETUPS[2];
  const flagshipTotal = calculateSetupTotal(flagshipSetup.parts);

  const filteredProducts =
    selectedCategory === 'all'
      ? HARDWARE_PRODUCTS
      : HARDWARE_PRODUCTS.filter((item) => item.category === selectedCategory);

  return (
    <div>
      {/* SECTION 1: HERO (100svh, split composition, layout-v4.md) */}
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
                  6 etapas de montagem · Estações completas a partir de{' '}
                  {formatBRL(8250)}
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
                  imediata do orçamento.
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

                  <a href="#setups" className="btn btn--secondary">
                    <span>Ver setups prontos</span>
                  </a>
                </motion.div>
              </div>

              {/* Docked three-fact row (layout-v4.md Section 3) */}
              <motion.dl
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.52, delay: 0.36, ease: EASE_ENTER }}
                className="grid grid-cols-3 gap-4 pt-6 border-t border-[var(--border)] m-0"
              >
                <div>
                  <dt className="t-label-meta mb-1">Catálogo base</dt>
                  <dd className="m-0 text-[16px] font-medium text-[var(--ink)] tabular-price">
                    8 peças
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
                {/* Top technical header inside the stage */}
                <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
                  <span className="t-label-meta">
                    Composição em destaque · Plataforma ROG Strix + Blackwell
                  </span>
                  <span className="font-mono text-[13px] text-[var(--c-text)] tabular-price">
                    388&nbsp;W / 650&nbsp;W
                  </span>
                </div>

                {/* Hardware Transparent Cutouts Stage */}
                <div className="relative my-auto py-6 grid grid-cols-12 items-center gap-4">
                  <div className="col-span-12 sm:col-span-7 flex items-center justify-center">
                    <img
                      src={rtx5070.image}
                      alt={rtx5070.name}
                      fetchPriority="high"
                      width={520}
                      height={360}
                      className="hw-stage__img w-full max-w-[360px] max-h-[260px] object-contain"
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-5 flex sm:flex-col items-center justify-center gap-4">
                    <img
                      src={rogStrix.image}
                      alt={rogStrix.name}
                      width={240}
                      height={180}
                      className="hw-stage__img w-1/2 sm:w-full max-w-[190px] max-h-[140px] object-contain"
                    />
                    <img
                      src={ryzen5700x.image}
                      alt={ryzen5700x.name}
                      width={160}
                      height={160}
                      className="hw-stage__img w-1/3 sm:w-full max-w-[120px] max-h-[110px] object-contain"
                    />
                  </div>
                </div>

                {/* Single Opaque Float Card on Lower Left (layout-v4.md split hero spec) */}
                <div className="bg-[var(--card)] border border-[var(--border-strong)] rounded-[12px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2 h-2 rounded-full bg-[var(--action)]"
                        aria-hidden="true"
                      />
                      <span className="t-label-meta">
                        {flagshipSetup.name}
                      </span>
                    </div>
                    <p className="m-0 text-[16px] text-[var(--c-text)]">
                      RTX 5070 · Ryzen 7 5700X · ROG Strix · 16&nbsp;GB DDR4 ·
                      1&nbsp;TB NVMe
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="block t-label-meta">Total à vista</span>
                      <span className="text-[20px] font-medium font-mono text-[var(--ink)] tabular-price">
                        {formatBRL(flagshipTotal)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onLoadPrebuiltSetup(flagshipSetup)}
                      className="btn btn--secondary !px-4"
                    >
                      <span>Abrir setup</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PRE-BUILT SETUPS VITRINE (#setups) */}
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
                  Escolha uma base completa ou edite cada peça no criador.
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

          {/* 3-Up Grid (4+4+4 on 12-col grid, cards.md) */}
          <div className="grid-12 items-stretch">
            {PREBUILT_SETUPS.map((setup) => {
              const total = calculateSetupTotal(setup.parts);
              const gpu = getProductById(setup.parts.gpu)!;
              const mb = getProductById(setup.parts.motherboard)!;
              const cpu = getProductById(setup.parts.cpu)!;
              const ram = getProductById(setup.parts.ram)!;
              const ssd = getProductById(setup.parts.ssd)!;
              const psu = getProductById(setup.parts.psu)!;

              return (
                <article
                  key={setup.id}
                  className="col-span-12 lg:col-span-4 hw-card hw-card--interactive p-2 flex flex-col justify-between"
                >
                  {/* Level 2: Lit studio panel on top (.panel--top, cards.md) */}
                  <div>
                    <div className="hw-stage h-[240px] p-6 flex items-center justify-between gap-3">
                      <img
                        src={gpu.image}
                        alt={gpu.name}
                        loading="lazy"
                        width={260}
                        height={180}
                        className="hw-stage__img w-[58%] h-full object-contain"
                      />
                      <div className="w-[38%] h-full flex flex-col items-center justify-center gap-3">
                        <img
                          src={mb.image}
                          alt={mb.name}
                          loading="lazy"
                          width={130}
                          height={100}
                          className="hw-stage__img max-h-[105px] w-full object-contain"
                        />
                        <img
                          src={cpu.image}
                          alt={cpu.name}
                          loading="lazy"
                          width={90}
                          height={90}
                          className="hw-stage__img max-h-[72px] w-full object-contain"
                        />
                      </div>
                    </div>

                    {/* Card body padding (24px–32px, cards.md) */}
                    <div className="p-6 pb-4">
                      <p className="t-label-meta m-0 mb-2">{setup.tag}</p>
                      <h3 className="t-card-title m-0 mb-2">{setup.name}</h3>
                      <p className="t-body-copy m-0 mb-6">
                        {setup.description}
                      </p>

                      {/* Ruled Spec List (.spec-rows, 16px/24px in --c-text) */}
                      <ul className="spec-rows border-t border-[var(--border)]">
                        <li>
                          <span className="text-[var(--muted)]">
                            Placa de Vídeo
                          </span>
                          <span className="text-[var(--ink)] font-medium text-right">
                            {gpu.name}
                          </span>
                        </li>
                        <li>
                          <span className="text-[var(--muted)]">
                            Processador
                          </span>
                          <span className="text-[var(--ink)] font-medium text-right">
                            {cpu.name}
                          </span>
                        </li>
                        <li>
                          <span className="text-[var(--muted)]">Placa-Mãe</span>
                          <span className="text-[var(--ink)] font-medium text-right">
                            {mb.name}
                          </span>
                        </li>
                        <li>
                          <span className="text-[var(--muted)]">
                            Memória & SSD
                          </span>
                          <span className="text-[var(--c-text)] text-right">
                            {ram.name} · 1&nbsp;TB NVMe
                          </span>
                        </li>
                        <li>
                          <span className="text-[var(--muted)]">Fonte</span>
                          <span className="text-[var(--c-text)] text-right">
                            {psu.name} ({ssd.wattage + gpu.wattage + cpu.wattage + mb.wattage + ram.wattage}&nbsp;W uso)
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Card Footer: Price + Action */}
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
                Peças avulsas homologadas.{' '}
                <span className="text-[var(--muted)]">
                  Adicione qualquer componente diretamente ao seu computador.
                </span>
              </h2>
            </div>

            {/* Category Filter Tabs (click only, motion.md) */}
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
                Todas (8)
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
          </div>

          {/* 4-Up Product Grid (3+3+3+3 on 12-col grid) */}
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
        </div>
      </section>
    </div>
  );
}
