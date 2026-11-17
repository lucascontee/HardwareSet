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
  availableQuantity?: number;
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

export type CompatibilitySeverity = 'Info' | 'Warning' | 'Error';

export interface CompatibilityIssue {
  code: string;
  severity: CompatibilitySeverity;
  title: string;
  description: string;
  affectedCategories: string[];
}

export interface CompatibilityReport {
  isCompatible: boolean;
  isComplete: boolean;
  estimatedTdpWatts: number;
  recommendedPsuWatts: number;
  providedPsuWatts?: number | null;
  issues: CompatibilityIssue[];
}

export interface BuildComponentDto {
  productId?: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  attributes: Record<string, string>;
}

export interface BuildSessionDto {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  components: Record<string, BuildComponentDto>;
  totalPrice: number;
  compatibility: CompatibilityReport;
}

export interface ValidateBuildResponseDto {
  totalPrice: number;
  selectedComponentsCount: number;
  compatibility: CompatibilityReport;
}

export interface InventoryItemDto {
  id: string;
  productId: string;
  productName: string;
  category: string;
  availableQuantity: number;
  reservedQuantity: number;
  updatedAt: string;
}

export type OrderStatus =
  | 'Pending'
  | 'ReservingStock'
  | 'ProcessingPayment'
  | 'Confirmed'
  | 'FailedOutOfStock'
  | 'FailedPaymentCompensated';

export interface OrderItemDto {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  category: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderDto {
  id: string;
  customerName: string;
  paymentMethod: string;
  status: OrderStatus;
  statusMessage: string;
  transactionId?: string | null;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDto[];
}
