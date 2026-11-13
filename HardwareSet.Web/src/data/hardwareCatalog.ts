import type {
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
  },
  {
    category: 'motherboard',
    step: 2,
    label: 'Placa-Mãe (Motherboard)',
    shortLabel: 'Placa-Mãe',
    emptyHint: 'Conecta processador, memória e barramentos PCIe',
  },
  {
    category: 'gpu',
    step: 3,
    label: 'Placa de Vídeo (GPU)',
    shortLabel: 'Placa de Vídeo',
    emptyHint: 'Motor gráfico dedicado para renderização e jogos',
  },
  {
    category: 'ram',
    step: 4,
    label: 'Memória RAM',
    shortLabel: 'Memória RAM',
    emptyHint: 'Memória de acesso rápido para multitarefa',
  },
  {
    category: 'ssd',
    step: 5,
    label: 'Armazenamento (SSD)',
    shortLabel: 'Armazenamento',
    emptyHint: 'Unidade NVMe de leitura e gravação em alta velocidade',
  },
  {
    category: 'psu',
    step: 6,
    label: 'Fonte de Alimentação (PSU)',
    shortLabel: 'Fonte',
    emptyHint: 'Fornecimento estabilizado de energia para o conjunto',
  },
];

export const HARDWARE_PRODUCTS: HardwareProduct[] = [
  {
    id: 'cpu-ryzen-7-5700x',
    name: 'Ryzen 7 5700X',
    category: 'cpu',
    categoryLabel: 'Processador',
    price: 1290.0,
    image:
      'https://i0.wp.com/esgaming.co.ke/wp-content/uploads/2023/02/Ryzen-7-5700X-Processor.png?fit=1000%2C1000&ssl=1',
    summarySpec: '8 núcleos · 16 threads · 4.6\u00A0GHz Boost · AM4',
    wattage: 65,
    specs: [
      { label: 'Arquitetura', value: 'AMD Zen 3 (7\u00A0nm)' },
      { label: 'Núcleos / Threads', value: '8 núcleos / 16 threads' },
      { label: 'Frequência Boost', value: 'Até 4.6\u00A0GHz' },
      { label: 'Cache L3', value: '32\u00A0MB' },
      { label: 'TDP nominal', value: '65\u00A0W' },
    ],
  },
  {
    id: 'mb-b550m-aorus-elite',
    name: 'B550M Aorus Elite',
    category: 'motherboard',
    categoryLabel: 'Placa-Mãe',
    price: 890.0,
    image:
      'https://static.gigabyte.com/StaticFile/Image/Global/1b1da8c384156857305f63d8986c98ec/Product/40296',
    summarySpec: 'Micro-ATX · Chipset AMD B550 · PCIe 4.0 · AM4',
    wattage: 35,
    specs: [
      { label: 'Formato', value: 'Micro-ATX (24.4\u00A0cm x 24.4\u00A0cm)' },
      { label: 'Soquete / Chipset', value: 'AMD AM4 / B550' },
      { label: 'VRM Digital', value: '5+3 fases Pure Digital' },
      { label: 'Slots M.2', value: '2x NVMe PCIe 4.0 / 3.0' },
      { label: 'Memória suportada', value: '4x DDR4 até 128\u00A0GB' },
    ],
  },
  {
    id: 'mb-rog-strix',
    name: 'ROG Strix',
    category: 'motherboard',
    categoryLabel: 'Placa-Mãe',
    price: 1490.0,
    image:
      'https://dlcdnwebimgs.asus.com/gain/38460501-ED11-4ADB-B4DD-6C9FE5BE2684/w717/h525',
    summarySpec: 'ATX · Chipset B550 · VRM 12+2 fases · Áudio SupremeFX',
    wattage: 45,
    specs: [
      { label: 'Formato', value: 'ATX padrão (30.5\u00A0cm x 24.4\u00A0cm)' },
      { label: 'Soquete / Chipset', value: 'AMD AM4 / ROG B550' },
      { label: 'Alimentação VRM', value: '12+2 Power Stages DrMOS' },
      { label: 'Rede integrada', value: 'Intel 2.5\u00A0Gb Ethernet' },
      { label: 'Dissipação', value: 'Heatsinks em alumínio escovado nos 2 slots M.2' },
    ],
  },
  {
    id: 'gpu-rx-9070',
    name: 'RX 9070',
    category: 'gpu',
    categoryLabel: 'Placa de Vídeo',
    price: 4590.0,
    image:
      'https://dlcdnwebimgs.asus.com/gain/9a412979-3657-437f-91c7-aa677c0bd9ba/w800',
    summarySpec: '16\u00A0GB GDDR6 · RDNA 4 · Triplo Fan Axial · 220\u00A0W',
    wattage: 220,
    specs: [
      { label: 'Memória de vídeo', value: '16\u00A0GB GDDR6 (256-bit)' },
      { label: 'Arquitetura', value: 'AMD RDNA 4 com Ray Accelerators' },
      { label: 'Refrigeração', value: 'Triplo ventilador Axial-tech com backplate metálico' },
      { label: 'Interface', value: 'PCI Express 5.0 x16' },
      { label: 'Consumo estimado', value: '220\u00A0W' },
    ],
  },
  {
    id: 'gpu-rtx-5070',
    name: 'RTX 5070',
    category: 'gpu',
    categoryLabel: 'Placa de Vídeo',
    price: 4890.0,
    image: 'https://assets.nvidia.partners/images/png/5070-1000x1000.png',
    summarySpec: '12\u00A0GB GDDR7 · Arquitetura Blackwell · DLSS 4 · 250\u00A0W',
    wattage: 250,
    specs: [
      { label: 'Memória de vídeo', value: '12\u00A0GB GDDR7 (192-bit)' },
      { label: 'Arquitetura', value: 'NVIDIA Blackwell · Tensor Cores 5ª Geração' },
      { label: 'Tecnologias', value: 'DLSS 4 Multi Frame Generation · Reflex 2' },
      { label: 'Chassi', value: 'Founders Edition em alumínio usinado' },
      { label: 'Consumo estimado', value: '250\u00A0W' },
    ],
  },
  {
    id: 'ram-hyperx-ddr4',
    name: 'HyperX DDR4',
    category: 'ram',
    categoryLabel: 'Memória RAM',
    price: 340.0,
    image:
      'https://e7.pngegg.com/pngimages/307/966/png-clipart-ddr3-sdram-dimm-ddr4-sdram-kingston-technology-hyperx-ram-ram-hdmi-ram.png',
    summarySpec: '16\u00A0GB · 3200\u00A0MT/s · CL16 · Dissipador em alumínio preto',
    wattage: 10,
    specs: [
      { label: 'Capacidade', value: '16\u00A0GB DDR4 SDRAM' },
      { label: 'Taxa de transferência', value: '3200\u00A0MT/s (PC4-25600)' },
      { label: 'Latência CAS', value: 'CL16-18-18' },
      { label: 'Tensão de operação', value: '1.35\u00A0V (Perfil XMP 2.0)' },
      { label: 'Dissipador', value: 'Alumínio assimétrico de baixo perfil' },
    ],
  },
  {
    id: 'ssd-wd-black-1tb',
    name: 'SSD WD Black/Sandisk 1TB',
    category: 'ssd',
    categoryLabel: 'Armazenamento',
    price: 680.0,
    image:
      'https://www.sandisk.com/content/dam/sandisk/en-us/assets/products/internal-storage/wd-black-sn7100-nvme-internal-ssd/gallery/wd-black-sn7100-nvme-internal-ssd-1tb-left.png.wdthumb.1280.1280.png',
    summarySpec: '1\u00A0TB NVMe M.2 2280 · PCIe Gen4 x4 · 7250\u00A0MB/s leitura',
    wattage: 8,
    specs: [
      { label: 'Capacidade', value: '1\u00A0TB (1000\u00A0GB)' },
      { label: 'Interface', value: 'M.2 2280 PCIe Gen4 x4 NVMe' },
      { label: 'Leitura sequencial', value: 'Até 7250\u00A0MB/s' },
      { label: 'Gravação sequencial', value: 'Até 6900\u00A0MB/s' },
      { label: 'Durabilidade', value: '600\u00A0TBW' },
    ],
  },
  {
    id: 'psu-corsair-650w',
    name: 'Fonte 650W Corsair',
    category: 'psu',
    categoryLabel: 'Fonte de Alimentação',
    price: 460.0,
    image:
      'https://img.terabyteshop.com.br/produto/g/fonte-corsair-cx650-cp-9020122-ww-650w-atxeps-23-pfc-ativo_41301.png',
    summarySpec: '650\u00A0W reais · 80 Plus Bronze · PFC Ativo · Cabos Sleeved',
    wattage: 0,
    specs: [
      { label: 'Potência contínua', value: '650\u00A0W (Linha +12V de 54\u00A0A)' },
      { label: 'Certificação', value: '80 Plus Bronze (Eficiência até 88%)' },
      { label: 'Correção de fator', value: 'PFC Ativo (Bivolt automático 100–240\u00A0V)' },
      { label: 'Refrigeração', value: 'Ventoinha de 120\u00A0mm com controle térmico' },
      { label: 'Proteções', value: 'OVP, UVP, SCP, OTP e OPP' },
    ],
  },
];

export const PREBUILT_SETUPS: PrebuiltSetup[] = [
  {
    id: 'setup-radeon-qhd',
    name: 'Estação Precision RX 9070',
    tag: 'Renderização & 1440p Nativo · 348\u00A0W estimados',
    description:
      'Equilíbrio térmico e acústico com 16\u00A0GB de VRAM na RX 9070 e placa-mãe B550M Aorus Elite.',
    parts: {
      cpu: 'cpu-ryzen-7-5700x',
      motherboard: 'mb-b550m-aorus-elite',
      gpu: 'gpu-rx-9070',
      ram: 'ram-hyperx-ddr4',
      ssd: 'ssd-wd-black-1tb',
      psu: 'psu-corsair-650w',
    },
  },
  {
    id: 'setup-nvidia-studio',
    name: 'Estação Studio RTX 5070',
    tag: 'Arquitetura Blackwell & DLSS 4 · 378\u00A0W estimados',
    description:
      'Aceleração por hardware para modelagem 3D, compilação pesada e ray tracing em tempo real.',
    parts: {
      cpu: 'cpu-ryzen-7-5700x',
      motherboard: 'mb-b550m-aorus-elite',
      gpu: 'gpu-rtx-5070',
      ram: 'ram-hyperx-ddr4',
      ssd: 'ssd-wd-black-1tb',
      psu: 'psu-corsair-650w',
    },
  },
  {
    id: 'setup-rog-flagship',
    name: 'Estação ROG Strix Blackwell',
    tag: 'Chassi ATX Completo · VRM 12+2 Fases · 388\u00A0W estimados',
    description:
      'Conjunto topo de linha combinando a plataforma ROG Strix com a RTX 5070 e armazenamento Gen4.',
    parts: {
      cpu: 'cpu-ryzen-7-5700x',
      motherboard: 'mb-rog-strix',
      gpu: 'gpu-rtx-5070',
      ram: 'ram-hyperx-ddr4',
      ssd: 'ssd-wd-black-1tb',
      psu: 'psu-corsair-650w',
    },
  },
];

export function getProductById(id: string): HardwareProduct | undefined {
  return HARDWARE_PRODUCTS.find((p) => p.id === id);
}

export function getProductsByCategory(
  category: HardwareCategory
): HardwareProduct[] {
  return HARDWARE_PRODUCTS.filter((p) => p.category === category);
}

export function calculateSetupTotal(parts: Record<HardwareCategory, string>): number {
  return Object.values(parts).reduce((acc, productId) => {
    const product = getProductById(productId);
    return acc + (product ? product.price : 0);
  }, 0);
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
