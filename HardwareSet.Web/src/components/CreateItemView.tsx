import { useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';
import type {
  CreateProductInput,
  HardwareCategory,
  HardwareProduct,
} from '../types/hardware';
import {
  SLOT_DEFINITIONS,
  formatBRL,
  getCategoryLabel,
} from '../data/hardwareCatalog';

interface CreateItemViewProps {
  products: HardwareProduct[];
  onCreateProduct: (input: CreateProductInput) => Promise<HardwareProduct>;
  onDeleteProduct: (id: string) => Promise<void>;
  onSelectPartAndBuild: (product: HardwareProduct) => void;
  onBackToFeed: () => void;
}

interface AttributeRow {
  id: string;
  key: string;
  value: string;
}

interface FormErrors {
  name?: string;
  price?: string;
  imageUrl?: string;
}

export function CreateItemView({
  products,
  onCreateProduct,
  onDeleteProduct,
  onSelectPartAndBuild,
  onBackToFeed,
}: CreateItemViewProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<HardwareCategory>('gpu');
  const [priceText, setPriceText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [wattageText, setWattageText] = useState('');
  const [summarySpec, setSummarySpec] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [attributeRows, setAttributeRows] = useState<AttributeRow[]>([
    { id: 'attr-1', key: 'Memória de vídeo', value: '' },
    { id: 'attr-2', key: 'Arquitetura', value: '' },
    { id: 'attr-3', key: 'Interface', value: '' },
  ]);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'idle' | 'sending' | 'success' | 'error';
    text: string;
  }>({ type: 'idle', text: '' });

  const nameInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);
  const imageUrlInputRef = useRef<HTMLInputElement>(null);

  const parsePrice = (raw: string): number => {
    const normalized = raw.replace(/\./g, '').replace(',', '.').trim();
    const num = Number.parseFloat(normalized);
    return Number.isNaN(num) ? -1 : num;
  };

  const validateField = (
    field: keyof FormErrors,
    currentName = name,
    currentPrice = priceText,
    currentImageUrl = imageUrl
  ): string | undefined => {
    if (field === 'name') {
      if (!currentName.trim()) {
        return 'Informe o nome da peça (ex: RTX 5070 ou Ryzen 7 5700X).';
      }
      return undefined;
    }

    if (field === 'price') {
      const parsed = parsePrice(currentPrice);
      if (!currentPrice.trim() || parsed < 0) {
        return 'Informe um valor numérico válido em reais (ex: 4890,00).';
      }
      return undefined;
    }

    if (field === 'imageUrl') {
      if (!currentImageUrl.trim()) {
        return 'Informe a URL da imagem PNG da peça.';
      }
      try {
        const parsedUrl = new URL(currentImageUrl.trim());
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
          return 'A URL da imagem deve iniciar com https:// ou http://.';
        }
      } catch {
        return 'Informe uma URL completa iniciando com https://.';
      }
      return undefined;
    }

    return undefined;
  };

  const handleBlur = (field: keyof FormErrors) => {
    if (!touched[field]) return;
    const error = validateField(field);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleCategoryChange = (newCategory: HardwareCategory) => {
    setCategory(newCategory);
    const slotDef = SLOT_DEFINITIONS.find((s) => s.category === newCategory);
    if (slotDef) {
      setAttributeRows(
        slotDef.suggestedAttributes.map((attr, idx) => ({
          id: `attr-${newCategory}-${idx}`,
          key: attr.key,
          value: '',
        }))
      );
    }
  };

  const handleAddAttributeRow = () => {
    setAttributeRows((prev) => [
      ...prev,
      { id: `attr-${Date.now()}`, key: '', value: '' },
    ]);
  };

  const handleRemoveAttributeRow = (id: string) => {
    setAttributeRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleAttributeChange = (
    id: string,
    field: 'key' | 'value',
    val: string
  ) => {
    setAttributeRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: val } : row))
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nameError = validateField('name');
    const priceError = validateField('price');
    const imageUrlError = validateField('imageUrl');

    const nextErrors: FormErrors = {
      name: nameError,
      price: priceError,
      imageUrl: imageUrlError,
    };

    setErrors(nextErrors);
    setTouched({ name: true, price: true, imageUrl: true });

    // Move focus to the first invalid field (modern-web-guidance forms + system.md)
    if (nameError) {
      nameInputRef.current?.focus();
      setStatusMessage({
        type: 'error',
        text: 'Verifique os campos obrigatórios destacados abaixo.',
      });
      return;
    }
    if (priceError) {
      priceInputRef.current?.focus();
      setStatusMessage({
        type: 'error',
        text: 'Verifique o campo de valor antes de cadastrar.',
      });
      return;
    }
    if (imageUrlError) {
      imageUrlInputRef.current?.focus();
      setStatusMessage({
        type: 'error',
        text: 'Verifique a URL da imagem antes de cadastrar.',
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({
      type: 'sending',
      text: 'Gravando peça no MongoDB...',
    });

    try {
      const attributesMap: Record<string, string> = {
        category,
      };

      if (summarySpec.trim()) {
        attributesMap.summary = summarySpec.trim();
      }
      if (wattageText.trim()) {
        attributesMap.wattage = wattageText.trim();
      }

      attributeRows.forEach((row) => {
        const k = row.key.trim();
        const v = row.value.trim();
        if (k && v) {
          attributesMap[k] = v;
        }
      });

      const created = await onCreateProduct({
        name: name.trim(),
        category,
        price: parsePrice(priceText),
        imageUrl: imageUrl.trim(),
        purchaseDate: purchaseDate
          ? new Date(purchaseDate).toISOString()
          : new Date().toISOString(),
        attributes: attributesMap,
      });

      setStatusMessage({
        type: 'success',
        text: `Peça "${created.name}" inserida no MongoDB (ID: ${created.id}).`,
      });

      // Reset form inputs while keeping category
      setName('');
      setPriceText('');
      setImageUrl('');
      setWattageText('');
      setSummarySpec('');
      setTouched({});
      setErrors({});
      setAttributeRows((prev) => prev.map((r) => ({ ...r, value: '' })));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erro ao comunicar com a API e MongoDB.';
      setStatusMessage({
        type: 'error',
        text: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewPrice = Math.max(0, parsePrice(priceText));
  const previewSpecs = attributeRows.filter(
    (r) => r.key.trim() && r.value.trim()
  );

  return (
    <section
      className="section-block min-h-[100svh] border-b border-[var(--border)]"
      aria-labelledby="create-item-heading"
    >
      <div className="wrap">
        {/* Header */}
        <div className="mb-10">
          <button
            type="button"
            onClick={onBackToFeed}
            className="inline-flex items-center gap-2 text-[14px] font-medium text-[var(--muted)] hover:text-[var(--ink)] bg-transparent border-0 p-0 mb-3 cursor-pointer transition-colors min-h-[36px]"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            <span>Voltar para a vitrine</span>
          </button>

          <h1 id="create-item-heading" className="h2-display">
            Cadastrar peça no catálogo.{' '}
            <span className="text-[var(--muted)]">
              O item é gravado diretamente na coleção Products do MongoDB.
            </span>
          </h1>
        </div>

        <div className="grid-12 items-start">
          {/* LEFT 7 COLUMNS: Form (system.md Forms + modern-web-guidance forms) */}
          <div className="col-span-12 lg:col-span-7 hw-card p-6 sm:p-8">
            <form
              aria-labelledby="create-item-heading"
              action="/api/products"
              method="POST"
              noValidate
              onSubmit={handleSubmit}
              className="flex flex-col gap-6"
            >
              {/* Category Selection Fieldset */}
              <fieldset className="m-0 p-0 border-0">
                <legend className="block text-[14px] font-medium text-[var(--ink)] mb-2.5">
                  Categoria do componente *
                </legend>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {SLOT_DEFINITIONS.map((slot) => {
                    const isChecked = category === slot.category;
                    return (
                      <label
                        key={slot.category}
                        className={`min-h-[48px] px-3.5 py-2.5 rounded-[8px] border flex items-center gap-2.5 cursor-pointer text-[14px] font-medium transition-colors ${
                          isChecked
                            ? 'bg-[var(--action)] text-[var(--action-ink)] border-transparent'
                            : 'bg-[var(--g-alt)] text-[var(--c-text)] border-[var(--border)] hover:border-[var(--border-strong)]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={slot.category}
                          checked={isChecked}
                          onChange={() => handleCategoryChange(slot.category)}
                          className="sr-only"
                        />
                        <span>{slot.shortLabel}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {/* Product Name */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="product-name"
                  className="text-[14px] font-medium text-[var(--ink)]"
                >
                  Nome da peça <span aria-hidden="true">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  id="product-name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setTouched((prev) => ({ ...prev, name: true }));
                    if (errors.name) {
                      setErrors((prev) => ({ ...prev, name: undefined }));
                    }
                  }}
                  onBlur={() => handleBlur('name')}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={
                    errors.name ? 'product-name-error' : 'product-name-hint'
                  }
                  placeholder="Ex: RTX 5070 ou Ryzen 7 5700X"
                  className="min-h-[48px] px-4 rounded-[8px] bg-[var(--g-alt)] border border-[var(--border-strong)] text-[16px] text-[var(--ink)] placeholder:text-[var(--muted)]"
                />
                <span id="product-name-hint" className="text-[13px] text-[var(--muted)]">
                  Nome comercial exibido nos cards da vitrine e no montador.
                </span>
                {errors.name && (
                  <span
                    id="product-name-error"
                    className="field__error text-[13px] text-[#f87171] font-medium"
                  >
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Price & Wattage Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="product-price"
                    className="text-[14px] font-medium text-[var(--ink)]"
                  >
                    Valor (R$) <span aria-hidden="true">*</span>
                  </label>
                  <input
                    ref={priceInputRef}
                    id="product-price"
                    name="price"
                    type="text"
                    inputMode="decimal"
                    required
                    value={priceText}
                    onChange={(e) => {
                      setPriceText(e.target.value);
                      setTouched((prev) => ({ ...prev, price: true }));
                      if (errors.price) {
                        setErrors((prev) => ({ ...prev, price: undefined }));
                      }
                    }}
                    onBlur={() => handleBlur('price')}
                    aria-invalid={Boolean(errors.price)}
                    aria-describedby={
                      errors.price ? 'product-price-error' : undefined
                    }
                    placeholder="Ex: 4890,00"
                    className="min-h-[48px] px-4 rounded-[8px] bg-[var(--g-alt)] border border-[var(--border-strong)] text-[16px] font-mono text-[var(--ink)] placeholder:text-[var(--muted)]"
                  />
                  {errors.price && (
                    <span
                      id="product-price-error"
                      className="field__error text-[13px] text-[#f87171] font-medium"
                    >
                      {errors.price}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="product-wattage"
                    className="text-[14px] font-medium text-[var(--ink)]"
                  >
                    Consumo (Watts)
                  </label>
                  <input
                    id="product-wattage"
                    name="wattage"
                    type="text"
                    inputMode="numeric"
                    value={wattageText}
                    onChange={(e) => setWattageText(e.target.value)}
                    placeholder="Ex: 250"
                    className="min-h-[48px] px-4 rounded-[8px] bg-[var(--g-alt)] border border-[var(--border-strong)] text-[16px] font-mono text-[var(--ink)] placeholder:text-[var(--muted)]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="product-purchase-date"
                    className="text-[14px] font-medium text-[var(--ink)]"
                  >
                    Data de referência
                  </label>
                  <input
                    id="product-purchase-date"
                    name="purchaseDate"
                    type="text"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    placeholder="AAAA-MM-DD"
                    className="min-h-[48px] px-4 rounded-[8px] bg-[var(--g-alt)] border border-[var(--border-strong)] text-[16px] font-mono text-[var(--ink)] placeholder:text-[var(--muted)]"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="product-image-url"
                  className="text-[14px] font-medium text-[var(--ink)]"
                >
                  URL da imagem PNG <span aria-hidden="true">*</span>
                </label>
                <input
                  ref={imageUrlInputRef}
                  id="product-image-url"
                  name="imageUrl"
                  type="url"
                  required
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setTouched((prev) => ({ ...prev, imageUrl: true }));
                    if (errors.imageUrl) {
                      setErrors((prev) => ({ ...prev, imageUrl: undefined }));
                    }
                  }}
                  onBlur={() => handleBlur('imageUrl')}
                  aria-invalid={Boolean(errors.imageUrl)}
                  aria-describedby={
                    errors.imageUrl
                      ? 'product-image-error'
                      : 'product-image-hint'
                  }
                  placeholder="https://..."
                  className="min-h-[48px] px-4 rounded-[8px] bg-[var(--g-alt)] border border-[var(--border-strong)] text-[16px] font-mono text-[var(--ink)] placeholder:text-[var(--muted)]"
                />
                <span
                  id="product-image-hint"
                  className="text-[13px] text-[var(--muted)]"
                >
                  Recomendado PNG com fundo transparente para composição no
                  palco escuro.
                </span>
                {errors.imageUrl && (
                  <span
                    id="product-image-error"
                    className="field__error text-[13px] text-[#f87171] font-medium"
                  >
                    {errors.imageUrl}
                  </span>
                )}
              </div>

              {/* Short Summary Line */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="product-summary"
                  className="text-[14px] font-medium text-[var(--ink)]"
                >
                  Resumo rápido das especificações
                </label>
                <input
                  id="product-summary"
                  name="summarySpec"
                  type="text"
                  value={summarySpec}
                  onChange={(e) => setSummarySpec(e.target.value)}
                  placeholder="Ex: 12 GB GDDR7 · Arquitetura Blackwell · DLSS 4"
                  className="min-h-[48px] px-4 rounded-[8px] bg-[var(--g-alt)] border border-[var(--border-strong)] text-[16px] text-[var(--ink)] placeholder:text-[var(--muted)]"
                />
              </div>

              {/* Dynamic Attributes Dictionary (MongoDB Product.Attributes) */}
              <fieldset className="m-0 p-0 border-0 pt-2 border-t border-[var(--border)]">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <legend className="text-[14px] font-medium text-[var(--ink)]">
                    Atributos técnicos (salvos no dicionário NoSQL do MongoDB)
                  </legend>
                  <button
                    type="button"
                    onClick={handleAddAttributeRow}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--ink)] bg-[var(--g-alt)] px-3 py-1.5 rounded-[6px] border border-[var(--border-strong)] cursor-pointer hover:bg-[var(--stage)]"
                  >
                    <Plus size={14} aria-hidden="true" />
                    <span>Adicionar atributo</span>
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {attributeRows.map((row, index) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-12 gap-2.5 items-center"
                    >
                      <div className="col-span-5">
                        <label
                          htmlFor={`attr-key-${row.id}`}
                          className="sr-only"
                        >
                          Nome do atributo {index + 1}
                        </label>
                        <input
                          id={`attr-key-${row.id}`}
                          name={`attr_key_${index}`}
                          type="text"
                          value={row.key}
                          onChange={(e) =>
                            handleAttributeChange(row.id, 'key', e.target.value)
                          }
                          placeholder="Propriedade (ex: Soquete)"
                          className="w-full min-h-[48px] px-3.5 rounded-[8px] bg-[var(--g-alt)] border border-[var(--border)] text-[15px] text-[var(--ink)] placeholder:text-[var(--muted)]"
                        />
                      </div>

                      <div className="col-span-6">
                        <label
                          htmlFor={`attr-val-${row.id}`}
                          className="sr-only"
                        >
                          Valor do atributo {index + 1}
                        </label>
                        <input
                          id={`attr-val-${row.id}`}
                          name={`attr_val_${index}`}
                          type="text"
                          value={row.value}
                          onChange={(e) =>
                            handleAttributeChange(
                              row.id,
                              'value',
                              e.target.value
                            )
                          }
                          placeholder="Valor (ex: AM4 / PCIe 5.0)"
                          className="w-full min-h-[48px] px-3.5 rounded-[8px] bg-[var(--g-alt)] border border-[var(--border)] text-[15px] text-[var(--ink)] placeholder:text-[var(--muted)]"
                        />
                      </div>

                      <div className="col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveAttributeRow(row.id)}
                          aria-label={`Remover atributo ${row.key || index + 1}`}
                          className="w-[44px] h-[44px] rounded-[8px] inline-flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--g-alt)] bg-transparent border-0 cursor-pointer"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset>

              {/* Submit Button & Status Line (system.md Forms) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn--primary w-full"
                >
                  <span>
                    {isSubmitting
                      ? 'Salvando no MongoDB...'
                      : 'Cadastrar item no MongoDB'}
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

                <p
                  role="status"
                  aria-live="polite"
                  data-form-status
                  className={`m-0 mt-3 text-[14px] ${
                    statusMessage.type === 'error'
                      ? 'text-[#f87171]'
                      : statusMessage.type === 'success'
                      ? 'text-[var(--ink)]'
                      : 'text-[var(--muted)]'
                  }`}
                >
                  {statusMessage.text ||
                    'O item cadastrado fica imediatamente disponível na vitrine e no montador de PC.'}
                </p>
              </div>
            </form>
          </div>

          {/* RIGHT 5 COLUMNS: Live Card Preview & Database Inventory */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            {/* Live Preview Card */}
            <div className="hw-card p-2">
              <div className="hw-stage h-[220px] p-6 flex items-center justify-center">
                {imageUrl.trim() ? (
                  <img
                    src={imageUrl.trim()}
                    alt={name.trim() || 'Pré-visualização da peça'}
                    className="hw-stage__img max-h-[165px] w-full object-contain"
                  />
                ) : (
                  <span className="text-[14px] text-[var(--muted)]">
                    Insira a URL da imagem PNG para pré-visualizar no palco
                  </span>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <p className="t-label-meta m-0 mb-1">
                      {getCategoryLabel(category)} · Pré-visualização
                    </p>
                    <h2 className="t-card-title m-0">
                      {name.trim() || 'Nome da peça'}
                    </h2>
                  </div>
                  <span className="text-[20px] font-medium font-mono text-[var(--ink)] tabular-price">
                    {formatBRL(previewPrice)}
                  </span>
                </div>

                <p className="t-body-copy m-0 mb-4">
                  {summarySpec.trim() ||
                    'Especificação resumida exibida no card do produto.'}
                </p>

                {previewSpecs.length > 0 && (
                  <ul className="spec-rows border-t border-[var(--border)]">
                    {previewSpecs.map((spec) => (
                      <li key={spec.id}>
                        <span className="text-[var(--muted)]">{spec.key}</span>
                        <span className="text-[var(--c-text)] font-medium text-right">
                          {spec.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Live MongoDB Inventory List */}
            <div className="hw-card p-6">
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
                <div>
                  <h2 className="t-card-title m-0">
                    Peças salvas no MongoDB
                  </h2>
                  <p className="t-label-meta m-0 mt-1 tabular-price">
                    {products.length}{' '}
                    {products.length === 1
                      ? 'documento registrado'
                      : 'documentos registrados'}
                  </p>
                </div>
              </div>

              {products.length === 0 ? (
                <p className="t-body-copy m-0 py-6 text-[var(--muted)]">
                  Nenhuma peça cadastrada no banco ainda. Utilize o formulário
                  ao lado para inserir o primeiro item no MongoDB.
                </p>
              ) : (
                <ul className="list-none m-0 p-0 divide-y divide-[var(--border)] max-h-[380px] overflow-y-auto">
                  {products.map((item) => (
                    <li
                      key={item.id}
                      className="py-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-[8px] bg-[var(--stage)] p-1.5 flex items-center justify-center shrink-0">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[12px] text-[var(--muted)]">
                            {item.categoryLabel}
                          </span>
                          <span className="block text-[15px] font-medium text-[var(--ink)] truncate">
                            {item.name}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-[14px] text-[var(--ink)] tabular-price">
                          {formatBRL(item.price)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onSelectPartAndBuild(item)}
                          title="Usar esta peça no Montador"
                          className="min-h-[36px] px-2.5 rounded-[6px] text-[12px] font-medium bg-[var(--stage)] text-[var(--ink)] border border-[var(--border)] hover:border-[var(--border-strong)] cursor-pointer"
                        >
                          <Check size={13} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteProduct(item.id)}
                          aria-label={`Excluir ${item.name} do MongoDB`}
                          className="w-8 h-8 rounded-[6px] inline-flex items-center justify-center text-[var(--muted)] hover:text-[#f87171] bg-transparent border-0 cursor-pointer"
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
