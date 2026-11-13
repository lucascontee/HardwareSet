import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Cpu,
  HardDrive,
  Layers,
  Monitor,
  RotateCcw,
  Trash2,
  Zap,
} from 'lucide-react';
import type {
  BuildSelection,
  HardwareCategory,
  HardwareProduct,
  PrebuiltSetup,
} from '../types/hardware';
import {
  PREBUILT_SETUPS,
  SLOT_DEFINITIONS,
  formatBRL,
  getProductsByCategory,
} from '../data/hardwareCatalog';
import { AnimatedPrice } from './AnimatedPrice';

interface BuilderViewProps {
  selection: BuildSelection;
  activeCategory: HardwareCategory;
  onChangeCategory: (category: HardwareCategory) => void;
  onSelectPart: (product: HardwareProduct) => void;
  onRemovePart: (category: HardwareCategory) => void;
  onClearBuild: () => void;
  onLoadPrebuilt: (setup: PrebuiltSetup) => void;
  onBackToFeed: () => void;
}

const EASE_UI: [number, number, number, number] = [0.2, 0.8, 0.2, 1];

function getCategoryIcon(category: HardwareCategory) {
  switch (category) {
    case 'cpu':
      return <Cpu size={16} aria-hidden="true" />;
    case 'motherboard':
      return <Layers size={16} aria-hidden="true" />;
    case 'gpu':
      return <Monitor size={16} aria-hidden="true" />;
    case 'ram':
      return <Layers size={16} aria-hidden="true" />;
    case 'ssd':
      return <HardDrive size={16} aria-hidden="true" />;
    case 'psu':
      return <Zap size={16} aria-hidden="true" />;
  }
}

export function BuilderView({
  selection,
  activeCategory,
  onChangeCategory,
  onSelectPart,
  onRemovePart,
  onClearBuild,
  onLoadPrebuilt,
  onBackToFeed,
}: BuilderViewProps) {
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  const currentSlotIndex = SLOT_DEFINITIONS.findIndex(
    (s) => s.category === activeCategory
  );
  const currentSlot = SLOT_DEFINITIONS[currentSlotIndex] || SLOT_DEFINITIONS[0];
  const availableProducts = getProductsByCategory(currentSlot.category);

  const selectedList = SLOT_DEFINITIONS.map((slot) => ({
    slot,
    product: selection[slot.category],
  }));

  const filledCount = selectedList.filter((item) => Boolean(item.product)).length;
  const totalSlots = SLOT_DEFINITIONS.length;
  const isComplete = filledCount === totalSlots;

  const totalPrice = selectedList.reduce(
    (sum, item) => sum + (item.product ? item.product.price : 0),
    0
  );

  const totalWattage = selectedList.reduce(
    (sum, item) => sum + (item.product ? item.product.wattage : 0),
    0
  );

  const psuCapacity = selection.psu ? 650 : 650;

  const handleChooseProduct = (product: HardwareProduct) => {
    setOrderSubmitted(false);
    onSelectPart(product);

    if (autoAdvance) {
      // Find next empty slot after current, or any empty slot
      const nextEmptyAfter = SLOT_DEFINITIONS.slice(currentSlotIndex + 1).find(
        (s) => !selection[s.category] && s.category !== product.category
      );
      const firstEmpty = SLOT_DEFINITIONS.find(
        (s) => !selection[s.category] && s.category !== product.category
      );
      const targetSlot = nextEmptyAfter || firstEmpty;
      if (targetSlot) {
        setTimeout(() => {
          onChangeCategory(targetSlot.category);
        }, 220);
      }
    }
  };

  const goPrevStep = () => {
    if (currentSlotIndex > 0) {
      onChangeCategory(SLOT_DEFINITIONS[currentSlotIndex - 1].category);
    }
  };

  const goNextStep = () => {
    if (currentSlotIndex < SLOT_DEFINITIONS.length - 1) {
      onChangeCategory(SLOT_DEFINITIONS[currentSlotIndex + 1].category);
    }
  };

  return (
    <section
      className="section-block min-h-[100svh] pb-[140px] lg:pb-[96px] border-b border-[var(--border)]"
      aria-labelledby="builder-heading"
    >
      <div className="wrap">
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <button
              type="button"
              onClick={onBackToFeed}
              className="inline-flex items-center gap-2 text-[14px] font-medium text-[var(--muted)] hover:text-[var(--ink)] bg-transparent border-0 p-0 mb-3 cursor-pointer transition-colors min-h-[36px]"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              <span>Voltar para a vitrine de setups</span>
            </button>

            <h1 id="builder-heading" className="h2-display">
              Criador de computador.{' '}
              <span className="text-[var(--muted)]">
                Selecione cada slot e acompanhe o orçamento em tempo real.
              </span>
            </h1>
          </div>

          {/* Preset Quick-Loaders */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="t-label-meta mr-1">Preencher com base:</span>
            {PREBUILT_SETUPS.map((setup) => (
              <button
                key={setup.id}
                type="button"
                onClick={() => {
                  setOrderSubmitted(false);
                  onLoadPrebuilt(setup);
                }}
                className="min-h-[40px] px-3.5 rounded-[8px] text-[13px] font-medium bg-[var(--card)] text-[var(--c-text)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:text-[var(--ink)] cursor-pointer transition-colors"
              >
                {setup.name.replace('Estação ', '')}
              </button>
            ))}
          </div>
        </div>

        {/* 6-SLOT INTERACTIVE BLUEPRINT BAR */}
        <div
          role="tablist"
          aria-label="Slots de componentes do computador"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10"
        >
          {SLOT_DEFINITIONS.map((slot) => {
            const installed = selection[slot.category];
            const isActive = slot.category === activeCategory;

            return (
              <div
                key={slot.category}
                className={`hw-card relative flex flex-col justify-between p-4 transition-all ${
                  isActive
                    ? '!border-[var(--action)] !bg-[var(--card-hover)]'
                    : installed
                    ? 'border-[var(--border-strong)]'
                    : 'border-dashed border-[var(--border)] opacity-90'
                }`}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onChangeCategory(slot.category)}
                  className="text-left bg-transparent border-0 p-0 cursor-pointer w-full flex flex-col justify-between h-full"
                >
                  <div className="flex items-center justify-between gap-2 w-full mb-3">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[12px] text-[var(--muted)]">
                      <span>0{slot.step}</span>
                      {getCategoryIcon(slot.category)}
                    </span>
                    {installed ? (
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--ink)] bg-[rgba(226,230,238,0.12)] px-2 py-0.5 rounded-[4px]">
                        <Check size={12} aria-hidden="true" />
                        <span>OK</span>
                      </span>
                    ) : (
                      <span className="text-[12px] text-[var(--muted)]">
                        Vazio
                      </span>
                    )}
                  </div>

                  {installed ? (
                    <div className="flex items-center gap-3 my-1">
                      <div className="w-11 h-11 rounded-[8px] bg-[var(--stage)] p-1.5 flex items-center justify-center shrink-0">
                        <img
                          src={installed.image}
                          alt={installed.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="m-0 text-[13px] text-[var(--muted)] truncate">
                          {slot.shortLabel}
                        </p>
                        <p className="m-0 text-[14px] font-medium text-[var(--ink)] truncate">
                          {installed.name}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="my-2">
                      <p className="m-0 text-[15px] font-medium text-[var(--ink)]">
                        {slot.shortLabel}
                      </p>
                      <p className="m-0 text-[13px] text-[var(--muted)]">
                        Selecionar peça
                      </p>
                    </div>
                  )}

                  <div className="pt-2.5 mt-2 border-t border-[var(--border)] w-full flex items-center justify-between">
                    <span className="font-mono text-[13px] text-[var(--c-text)] tabular-price">
                      {installed ? formatBRL(installed.price) : 'R$\u00A00,00'}
                    </span>
                    <span className="text-[12px] text-[var(--muted)]">
                      {isActive ? 'Ativo' : 'Abrir'}
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* MAIN BUILDER WORKSPACE: 8 Columns Stage + 4 Columns Summary Panel */}
        <div className="grid-12 items-start">
          {/* LEFT 8 COLUMNS: Active Step Component Selector */}
          <div className="col-span-12 lg:col-span-8">
            {/* Step Controls Header */}
            <div className="hw-card p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="font-mono text-[13px] px-2 py-0.5 rounded-[4px] bg-[var(--action)] text-[var(--action-ink)] font-medium">
                    Etapa {currentSlot.step} de {totalSlots}
                  </span>
                  <span className="t-label-meta">
                    {availableProducts.length}{' '}
                    {availableProducts.length === 1
                      ? 'opção disponível'
                      : 'opções disponíveis'}
                  </span>
                </div>
                <h2 className="h3-display m-0">{currentSlot.label}</h2>
                <p className="t-body-copy m-0 mt-1">{currentSlot.emptyHint}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={goPrevStep}
                  disabled={currentSlotIndex === 0}
                  aria-label="Etapa anterior"
                  className="btn btn--secondary !px-3.5 !min-h-[42px]"
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  <span>Anterior</span>
                </button>
                <button
                  type="button"
                  onClick={goNextStep}
                  disabled={currentSlotIndex === SLOT_DEFINITIONS.length - 1}
                  aria-label="Próxima etapa"
                  className="btn btn--secondary !px-3.5 !min-h-[42px]"
                >
                  <span>Próxima</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Animated Step Content (Framer Motion AnimatePresence) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlot.category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: EASE_UI }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {availableProducts.map((product) => {
                  const isSelected =
                    selection[currentSlot.category]?.id === product.id;

                  return (
                    <article
                      key={product.id}
                      className={`hw-card hw-card--interactive p-2 flex flex-col justify-between ${
                        isSelected
                          ? '!border-[var(--action)] !bg-[var(--card-hover)]'
                          : ''
                      }`}
                    >
                      <div>
                        {/* Lit Studio Hardware Stage */}
                        <div className="hw-stage h-[230px] p-6 flex items-center justify-center relative">
                          {isSelected && (
                            <span className="absolute top-3.5 right-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-[var(--action)] text-[var(--action-ink)] text-[13px] font-medium">
                              <Check size={14} aria-hidden="true" />
                              <span>Instalado no slot</span>
                            </span>
                          )}
                          <img
                            src={product.image}
                            alt={product.name}
                            width={320}
                            height={220}
                            className="hw-stage__img max-h-[175px] w-full object-contain"
                          />
                        </div>

                        {/* Product Info & Ruled Specifications */}
                        <div className="p-6 pb-4">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <p className="t-label-meta m-0 mb-1">
                                {product.categoryLabel}
                              </p>
                              <h3 className="t-card-title m-0">
                                {product.name}
                              </h3>
                            </div>
                            <span className="text-[22px] font-medium font-mono text-[var(--ink)] tabular-price shrink-0">
                              {formatBRL(product.price)}
                            </span>
                          </div>

                          <p className="t-body-copy m-0 mb-5">
                            {product.summarySpec}
                          </p>

                          <ul className="spec-rows border-t border-[var(--border)]">
                            {product.specs.map((spec) => (
                              <li key={spec.label}>
                                <span className="text-[var(--muted)]">
                                  {spec.label}
                                </span>
                                <span className="text-[var(--c-text)] font-medium text-right">
                                  {spec.value}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Card Action Bar */}
                      <div className="p-6 pt-2 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleChooseProduct(product)}
                          className={`btn w-full ${
                            isSelected ? 'btn--secondary' : 'btn--primary'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check size={16} aria-hidden="true" />
                              <span>Peça selecionada</span>
                            </>
                          ) : (
                            <>
                              <span>Selecionar peça</span>
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
                            </>
                          )}
                        </button>

                        {isSelected && (
                          <button
                            type="button"
                            onClick={() => onRemovePart(product.category)}
                            aria-label={`Remover ${product.name} da montagem`}
                            className="btn btn--secondary !px-3.5 shrink-0"
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* Auto-advance preference bar */}
            <div className="mt-6 flex items-center justify-between gap-4 px-1">
              <label className="inline-flex items-center gap-2.5 text-[14px] text-[var(--c-text)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoAdvance}
                  onChange={(e) => setAutoAdvance(e.target.checked)}
                  className="w-4 h-4 rounded accent-[var(--action)] cursor-pointer"
                />
                <span>
                  Avançar automaticamente para o próximo slot vazio ao escolher
                  uma peça
                </span>
              </label>
            </div>
          </div>

          {/* RIGHT 4 COLUMNS: Reactive Setup Summary & Total Price Calculator */}
          <aside
            aria-label="Resumo do computador e valor total"
            className="col-span-12 lg:col-span-4 hw-card p-6 flex flex-col justify-between"
          >
            <div>
              {/* Summary Header */}
              <div className="flex items-center justify-between gap-4 pb-5 border-b border-[var(--border)]">
                <div>
                  <h2 className="t-card-title m-0">Resumo do Setup</h2>
                  <p className="t-label-meta m-0 mt-1 tabular-price">
                    {filledCount} de {totalSlots} componentes selecionados
                  </p>
                </div>

                {filledCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setOrderSubmitted(false);
                      onClearBuild();
                    }}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--muted)] hover:text-[var(--ink)] bg-transparent border-0 cursor-pointer min-h-[36px]"
                  >
                    <RotateCcw size={14} aria-hidden="true" />
                    <span>Limpar</span>
                  </button>
                )}
              </div>

              {/* Power / Wattage Meter */}
              <div className="py-4 border-b border-[var(--border)]">
                <div className="flex items-center justify-between text-[13px] mb-2">
                  <span className="text-[var(--muted)]">
                    Consumo energético estimado
                  </span>
                  <span className="font-mono text-[var(--c-text)] tabular-price">
                    {totalWattage}&nbsp;W / {psuCapacity}&nbsp;W
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[var(--stage)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--action)] transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        Math.round((totalWattage / psuCapacity) * 100),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Slot-by-Slot Itemized List */}
              <ul className="list-none m-0 p-0 divide-y divide-[var(--border)]">
                {selectedList.map(({ slot, product }) => {
                  const isCurrentSlot = slot.category === activeCategory;

                  return (
                    <li
                      key={slot.category}
                      className="py-3.5 flex items-center justify-between gap-3"
                    >
                      <button
                        type="button"
                        onClick={() => onChangeCategory(slot.category)}
                        className="flex items-center gap-3 text-left bg-transparent border-0 p-0 cursor-pointer min-w-0 flex-1"
                      >
                        <div
                          className={`w-11 h-11 rounded-[8px] flex items-center justify-center shrink-0 border ${
                            product
                              ? 'bg-[var(--stage)] border-[var(--border)] p-1.5'
                              : isCurrentSlot
                              ? 'bg-[var(--stage)] border-[var(--action)] text-[var(--ink)]'
                              : 'bg-[var(--g-alt)] border-dashed border-[var(--border)] text-[var(--muted)]'
                          }`}
                        >
                          {product ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            getCategoryIcon(slot.category)
                          )}
                        </div>

                        <div className="min-w-0">
                          <span className="block text-[12px] font-medium text-[var(--muted)]">
                            {slot.shortLabel}
                          </span>
                          {product ? (
                            <span className="block text-[15px] font-medium text-[var(--ink)] truncate">
                              {product.name}
                            </span>
                          ) : (
                            <span className="block text-[14px] text-[var(--muted)]">
                              Slot vazio · Escolher
                            </span>
                          )}
                        </div>
                      </button>

                      <div className="flex items-center gap-2 shrink-0">
                        {product ? (
                          <>
                            <span className="font-mono text-[14px] font-medium text-[var(--ink)] tabular-price">
                              {formatBRL(product.price)}
                            </span>
                            <button
                              type="button"
                              onClick={() => onRemovePart(slot.category)}
                              aria-label={`Remover ${product.name}`}
                              className="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--stage)] bg-transparent border-0 cursor-pointer transition-colors"
                            >
                              <Trash2 size={14} aria-hidden="true" />
                            </button>
                          </>
                        ) : (
                          <span className="font-mono text-[13px] text-[var(--muted)]">
                            —
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Reactive Total Footer */}
            <div className="pt-6 mt-2 border-t border-[var(--border)]">
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <span className="text-[16px] text-[var(--c-text)]">
                  Valor total
                </span>
                <AnimatedPrice
                  value={totalPrice}
                  className="text-[28px] font-medium font-mono text-[var(--ink)] tracking-[-0.02em]"
                />
              </div>

              <div className="flex items-center justify-between text-[13px] text-[var(--muted)] mb-6 tabular-price">
                <span>À vista no PIX (10% off)</span>
                <span className="font-mono text-[var(--c-text)]">
                  {formatBRL(totalPrice * 0.9)}
                </span>
              </div>

              <button
                type="button"
                disabled={filledCount === 0}
                onClick={() => setOrderSubmitted(true)}
                className="btn btn--primary w-full"
              >
                <span>
                  {isComplete
                    ? 'Finalizar configuração'
                    : `Salvar configuração (${filledCount}/${totalSlots})`}
                </span>
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

              {/* Inline Confirmation Status (system.md Forms: no popup modal, inline role="status") */}
              {orderSubmitted && filledCount > 0 && (
                <div
                  role="status"
                  className="mt-4 p-4 rounded-[12px] bg-[var(--stage)] border border-[var(--border-strong)]"
                >
                  <p className="m-0 text-[14px] font-medium text-[var(--ink)] mb-1">
                    Configuração registrada ({filledCount}/{totalSlots} peças).
                  </p>
                  <p className="m-0 text-[13px] text-[var(--c-text)] tabular-price">
                    Orçamento total de {formatBRL(totalPrice)} pronto para
                    integração com a API HardwareSet.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* MOBILE / TABLET FIXED BOTTOM BAR (<1024px) */}
      <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden bg-[var(--g-main)] border-t border-[var(--border-strong)] px-6 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setMobileSummaryOpen((prev) => !prev)}
            className="text-left bg-transparent border-0 p-0 cursor-pointer"
          >
            <span className="block text-[12px] text-[var(--muted)] tabular-price">
              {filledCount}/{totalSlots} peças ·{' '}
              {mobileSummaryOpen ? 'Ocultar resumo' : 'Ver resumo'}
            </span>
            <AnimatedPrice
              value={totalPrice}
              className="text-[20px] font-medium font-mono text-[var(--ink)]"
            />
          </button>

          <button
            type="button"
            disabled={filledCount === 0}
            onClick={() => setOrderSubmitted(true)}
            className="btn btn--primary"
          >
            <span>Finalizar ({filledCount}/{totalSlots})</span>
          </button>
        </div>

        {mobileSummaryOpen && (
          <div className="mt-4 pt-4 border-t border-[var(--border)] max-h-[50vh] overflow-y-auto">
            <ul className="spec-rows">
              {selectedList.map(({ slot, product }) => (
                <li key={slot.category}>
                  <span className="text-[var(--muted)]">{slot.shortLabel}</span>
                  <span className="text-[var(--ink)] font-medium tabular-price">
                    {product
                      ? `${product.name} (${formatBRL(product.price)})`
                      : 'Slot vazio'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
