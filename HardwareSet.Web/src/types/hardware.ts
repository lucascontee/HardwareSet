export type HardwareCategory =
  | 'cpu'
  | 'motherboard'
  | 'gpu'
  | 'ram'
  | 'ssd'
  | 'psu';

export interface HardwareSpec {
  label: string;
  value: string;
}

export interface HardwareProduct {
  id: string;
  name: string;
  category: HardwareCategory;
  categoryLabel: string;
  price: number;
  image: string;
  summarySpec: string;
  wattage: number;
  specs: HardwareSpec[];
}

export interface SlotDefinition {
  category: HardwareCategory;
  step: number;
  label: string;
  shortLabel: string;
  emptyHint: string;
}

export interface PrebuiltSetup {
  id: string;
  name: string;
  tag: string;
  description: string;
  parts: Record<HardwareCategory, string>;
}

export type BuildSelection = Partial<Record<HardwareCategory, HardwareProduct>>;
