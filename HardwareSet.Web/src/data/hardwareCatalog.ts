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
      { key: 'Socket', placeholder: 'Ex: AM4 ou AM5' },
      { key: 'Núcleos / Threads', placeholder: 'Ex: 8 Núcleos / 16 Threads' },
      { key: 'Clock Boost', placeholder: 'Ex: Até 4.6 GHz' },
      { key: 'Cache', placeholder: 'Ex: 36MB (L2 + L3)' },
    ],
  },
  {
    category: 'motherboard',
    step: 2,
    label: 'Placa-Mãe',
    shortLabel: 'Placa-Mãe',
    emptyHint: 'Conecta processador, memória e barramentos PCIe',
    suggestedAttributes: [
      { key: 'Socket', placeholder: 'Ex: AM4 ou AM5' },
      { key: 'Formato', placeholder: 'Ex: ATX ou Micro-ATX' },
      { key: 'Memória', placeholder: 'Ex: 4x DDR4 até 128GB' },
      { key: 'PCIe', placeholder: 'Ex: PCIe 4.0 x16' },
    ],
  },
  {
    category: 'gpu',
    step: 3,
    label: 'Placa de Vídeo (GPU)',
    shortLabel: 'Placa de Vídeo',
    emptyHint: 'Motor gráfico dedicado para renderização e jogos',
    suggestedAttributes: [
      { key: 'VRAM', placeholder: 'Ex: 12GB GDDR7' },
      { key: 'Barramento', placeholder: 'Ex: 192-bit' },
      { key: 'PCIe', placeholder: 'Ex: PCIe 5.0 x16' },
    ],
  },
  {
    category: 'ram',
    step: 4,
    label: 'Memória RAM',
    shortLabel: 'Memória RAM',
    emptyHint: 'Memória de acesso rápido para multitarefa',
    suggestedAttributes: [
      { key: 'Capacidade', placeholder: 'Ex: 8GB DDR4' },
      { key: 'Frequência', placeholder: 'Ex: 3200 MT/s' },
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
      { key: 'Capacidade', placeholder: 'Ex: 1TB NVMe' },
      { key: 'PCIe', placeholder: 'Ex: M.2 PCIe Gen4 x4' },
      { key: 'Leitura Sequencial', placeholder: 'Ex: 7.250 MB/s' },
      { key: 'Gravação Sequencial', placeholder: 'Ex: 6.900 MB/s' },
    ],
  },
  {
    category: 'psu',
    step: 6,
    label: 'Fonte de Alimentação (PSU)',
    shortLabel: 'Fonte',
    emptyHint: 'Fornecimento estabilizado de energia para o conjunto',
    suggestedAttributes: [
      { key: 'Potência', placeholder: 'Ex: 650W Reais' },
      { key: 'Eficiência', placeholder: 'Ex: 80 Plus Bronze' },
      { key: 'PFC', placeholder: 'Ex: PFC Ativo' },
      { key: 'Refrigeração', placeholder: 'Ex: Ventoinha 120mm Silenciosa' },
    ],
  },
];

const FRIENDLY_ATTRIBUTE_LABELS: Record<string, string> = {
  brand: 'Marca',
  marca: 'Marca',
  formfactor: 'Formato',
  formato: 'Formato',
  memory: 'Memória',
  memoria: 'Memória',
  memória: 'Memória',
  socket: 'Socket',
  soquete: 'Socket',
  pcie: 'PCIe',
  interface: 'Interface',
  vram: 'VRAM',
  bus: 'Barramento',
  barramento: 'Barramento',
  tdp: 'TDP',
  cores: 'Núcleos / Threads',
  boostclock: 'Clock Boost',
  cache: 'Cache',
  vrm: 'VRM',
  networking: 'Rede',
  rede: 'Rede',
  capacity: 'Capacidade',
  capacidade: 'Capacidade',
  frequency: 'Frequência',
  frequencia: 'Frequência',
  frequência: 'Frequência',
  latency: 'Latência',
  latencia: 'Latência',
  latência: 'Latência',
  voltage: 'Tensão',
  tensao: 'Tensão',
  tensão: 'Tensão',
  wattage: 'Potência',
  potencia: 'Potência',
  potência: 'Potência',
  efficiency: 'Eficiência',
  eficiencia: 'Eficiência',
  eficiência: 'Eficiência',
  pfc: 'PFC',
  cooling: 'Refrigeração',
  refrigeracao: 'Refrigeração',
  refrigeração: 'Refrigeração',
  seqread: 'Leitura Sequencial',
  seqwrite: 'Gravação Sequencial',
};

export function formatAttributeLabel(rawKey: string): string {
  const normalized = rawKey.trim().toLowerCase();
  return FRIENDLY_ATTRIBUTE_LABELS[normalized] || rawKey.trim();
}

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

  const rawPowerText =
    attributes.TDP ||
    attributes.tdp ||
    attributes.Potência ||
    attributes.potencia ||
    attributes.wattage ||
    attributes.tdpWatts ||
    attributes.Consumo ||
    '0';

  const parsedWattage = Number.parseInt(
    rawPowerText.replace(/[^\d]/g, ''),
    10
  );
  const wattage = Number.isNaN(parsedWattage) ? 0 : parsedWattage;

  const reservedKeys = new Set([
    'category',
    'summary',
    'tagline',
    'resumo',
    'tdpwatts',
  ]);

  const specs = Object.entries(attributes)
    .filter(
      ([key, value]) =>
        !reservedKeys.has(key.trim().toLowerCase()) && Boolean(value)
    )
    .map(([key, value]) => ({
      label: formatAttributeLabel(key),
      value,
    }));

  const summarySpec =
    attributes.Resumo ||
    attributes.resumo ||
    attributes.summary ||
    attributes.tagline ||
    (specs.length > 0
      ? specs
          .slice(0, 3)
          .map((s) => s.value)
          .join(' · ')
      : `${categoryLabel} selecionado`);

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
      id: `setup-${gpu.id}`,
      name: `Estação ${gpu.name}${motherboard ? ` · ${motherboard.name}` : ''}`,
      tag: `Desempenho dedicado · ${totalWatts}\u00A0W estimados`,
      description: `Configuração equilibrada equipada com ${gpu.name} para máxima fluidez gráfica e multitarefa.`,
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
