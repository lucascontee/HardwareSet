import type {
  ApiProduct,
  HardwareCategory,
  HardwareProduct,
  PrebuiltSetup,
  SlotDefinition,
} from '../types/hardware';

export const SLOT_DEFINITIONS: SlotDefinition[] = [
  {
    category: 'cpu',
    step: 1,
    label: 'Processador (CPU)',
    shortLabel: 'Processador',
    emptyHint: 'Define a arquitetura e o poder de processamento base',
    suggestedAttributes: [
      { key: 'Arquitetura', placeholder: 'Ex: AMD Zen 3 (7 nm)' },
      { key: 'Núcleos / Threads', placeholder: 'Ex: 8 núcleos / 16 threads' },
      { key: 'Frequência Boost', placeholder: 'Ex: Até 4.6 GHz' },
      { key: 'Soquete', placeholder: 'Ex: AM4' },
    ],
  },
  {
    category: 'motherboard',
    step: 2,
    label: 'Placa-Mãe (Motherboard)',
    shortLabel: 'Placa-Mãe',
    emptyHint: 'Conecta processador, memória e barramentos PCIe',
    suggestedAttributes: [
      { key: 'Formato', placeholder: 'Ex: ATX ou Micro-ATX' },
      { key: 'Soquete / Chipset', placeholder: 'Ex: AMD AM4 / B550' },
      { key: 'VRM', placeholder: 'Ex: 12+2 Power Stages' },
      { key: 'Slots M.2', placeholder: 'Ex: 2x NVMe PCIe 4.0' },
    ],
  },
  {
    category: 'gpu',
    step: 3,
    label: 'Placa de Vídeo (GPU)',
    shortLabel: 'Placa de Vídeo',
    emptyHint: 'Motor gráfico dedicado para renderização e jogos',
    suggestedAttributes: [
      { key: 'Memória de vídeo', placeholder: 'Ex: 12 GB GDDR7' },
      { key: 'Arquitetura', placeholder: 'Ex: NVIDIA Blackwell / RDNA 4' },
      { key: 'Interface', placeholder: 'Ex: PCI Express 5.0 x16' },
    ],
  },
  {
    category: 'ram',
    step: 4,
    label: 'Memória RAM',
    shortLabel: 'Memória RAM',
    emptyHint: 'Memória de acesso rápido para multitarefa',
    suggestedAttributes: [
      { key: 'Capacidade', placeholder: 'Ex: 16 GB DDR4' },
      { key: 'Velocidade', placeholder: 'Ex: 3200 MT/s' },
      { key: 'Latência', placeholder: 'Ex: CL16' },
    ],
  },
  {
    category: 'ssd',
    step: 5,
    label: 'Armazenamento (SSD)',
    shortLabel: 'Armazenamento',
    emptyHint: 'Unidade NVMe de leitura e gravação em alta velocidade',
    suggestedAttributes: [
      { key: 'Capacidade', placeholder: 'Ex: 1 TB NVMe' },
      { key: 'Interface', placeholder: 'Ex: M.2 2280 PCIe Gen4 x4' },
      { key: 'Leitura sequencial', placeholder: 'Ex: Até 7250 MB/s' },
    ],
  },
  {
    category: 'psu',
    step: 6,
    label: 'Fonte de Alimentação (PSU)',
    shortLabel: 'Fonte',
    emptyHint: 'Fornecimento estabilizado de energia para o conjunto',
    suggestedAttributes: [
      { key: 'Potência contínua', placeholder: 'Ex: 650 W' },
      { key: 'Certificação', placeholder: 'Ex: 80 Plus Bronze' },
      { key: 'Correção de fator', placeholder: 'Ex: PFC Ativo Bivolt' },
    ],
  },
];

const VALID_CATEGORIES: HardwareCategory[] = [
  'cpu',
  'motherboard',
  'gpu',
  'ram',
  'ssd',
  'psu',
];

export function normalizeCategory(raw?: string): HardwareCategory {
  const cleaned = (raw || '').trim().toLowerCase();
  if (VALID_CATEGORIES.includes(cleaned as HardwareCategory)) {
    return cleaned as HardwareCategory;
  }
  return 'gpu';
}

export function getCategoryLabel(category: HardwareCategory): string {
  return (
    SLOT_DEFINITIONS.find((s) => s.category === category)?.shortLabel ||
    'Componente'
  );
}

export function mapApiProductToHardwareProduct(
  apiProduct: ApiProduct
): HardwareProduct {
  const attributes = apiProduct.attributes || {};
  const category = normalizeCategory(
    apiProduct.category || attributes.category
  );
  const categoryLabel = getCategoryLabel(category);

  const parsedWattage = Number.parseInt(
    attributes.wattage || attributes.tdpWatts || attributes.Consumo || '0',
    10
  );
  const wattage = Number.isNaN(parsedWattage) ? 0 : parsedWattage;

  const reservedKeys = new Set(['category', 'summary', 'wattage', 'tdpWatts']);

  const specs = Object.entries(attributes)
    .filter(([key, value]) => !reservedKeys.has(key) && Boolean(value))
    .map(([label, value]) => ({
      label,
      value,
    }));

  const summarySpec =
    attributes.summary ||
    (specs.length > 0
      ? specs
          .slice(0, 3)
          .map((s) => s.value)
          .join(' · ')
      : `${categoryLabel} homologado`);

  return {
    id: apiProduct.id || crypto.randomUUID(),
    name: apiProduct.name,
    category,
    categoryLabel,
    price: Number(apiProduct.price) || 0,
    image: apiProduct.imageUrl || '',
    summarySpec,
    wattage,
    purchaseDate: apiProduct.purchaseDate,
    specs,
    rawAttributes: attributes,
  };
}

/**
 * Generates dynamic pre-configured setups from the real database products
 * when corresponding components exist in MongoDB.
 */
export function buildDynamicSetupsFromCatalog(
  products: HardwareProduct[]
): PrebuiltSetup[] {
  if (products.length === 0) return [];

  const cpus = products.filter((p) => p.category === 'cpu');
  const motherboards = products.filter((p) => p.category === 'motherboard');
  const gpus = products.filter((p) => p.category === 'gpu');
  const rams = products.filter((p) => p.category === 'ram');
  const ssds = products.filter((p) => p.category === 'ssd');
  const psus = products.filter((p) => p.category === 'psu');

  if (gpus.length === 0 && cpus.length === 0) return [];

  const setups: PrebuiltSetup[] = [];

  gpus.forEach((gpu, idx) => {
    const cpu = cpus[idx % Math.max(cpus.length, 1)];
    const motherboard = motherboards[idx % Math.max(motherboards.length, 1)];
    const ram = rams[0];
    const ssd = ssds[0];
    const psu = psus[0];

    const parts: Partial<Record<HardwareCategory, HardwareProduct>> = {};
    if (cpu) parts.cpu = cpu;
    if (motherboard) parts.motherboard = motherboard;
    parts.gpu = gpu;
    if (ram) parts.ram = ram;
    if (ssd) parts.ssd = ssd;
    if (psu) parts.psu = psu;

    const totalWatts = Object.values(parts).reduce(
      (sum, part) => sum + (part ? part.wattage : 0),
      0
    );

    setups.push({
      id: `db-setup-${gpu.id}`,
      name: `Estação ${gpu.name}${motherboard ? ` · ${motherboard.name}` : ''}`,
      tag: `Configuração do banco de dados · ${totalWatts}\u00A0W estimados`,
      description: `Conjunto montado dinamicamente a partir das peças cadastradas no MongoDB com ${gpu.name}.`,
      parts,
    });
  });

  return setups.slice(0, 3);
}

export function calculateSetupPartsTotal(
  parts: Partial<Record<HardwareCategory, HardwareProduct>>
): number {
  return Object.values(parts).reduce(
    (sum, part) => sum + (part ? part.price : 0),
    0
  );
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
    .format(value)
    .replace(/\s/g, '\u00A0');
}
