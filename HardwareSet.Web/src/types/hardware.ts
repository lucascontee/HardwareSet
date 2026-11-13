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

export interface ApiProduct {
  id?: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  purchaseDate?: string;
  attributes: Record<string, string>;
}

export interface CreateProductInput {
  name: string;
  category: HardwareCategory;
  price: number;
  imageUrl: string;
  purchaseDate?: string;
  attributes: Record<string, string>;
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
  purchaseDate?: string;
  specs: HardwareSpec[];
  rawAttributes: Record<string, string>;
}

export interface SlotDefinition {
  category: HardwareCategory;
  step: number;
  label: string;
  shortLabel: string;
  emptyHint: string;
  suggestedAttributes: { key: string; placeholder: string }[];
}

export interface PrebuiltSetup {
  id: string;
  name: string;
  tag: string;
  description: string;
  parts: Partial<Record<HardwareCategory, HardwareProduct>>;
}

export type BuildSelection = Partial<Record<HardwareCategory, HardwareProduct>>;
