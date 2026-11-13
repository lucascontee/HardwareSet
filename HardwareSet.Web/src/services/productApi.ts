import type {
  ApiProduct,
  CreateProductInput,
  HardwareProduct,
} from '../types/hardware';
import { mapApiProductToHardwareProduct } from '../data/hardwareCatalog';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5188/api/products';

export async function fetchAllProducts(): Promise<HardwareProduct[]> {
  const response = await fetch(API_BASE_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Não foi possível carregar o catálogo de peças.');
  }

  const data: ApiProduct[] = await response.json();
  return data.map(mapApiProductToHardwareProduct);
}

export async function createProductInDb(
  input: CreateProductInput
): Promise<HardwareProduct> {
  const payload: ApiProduct = {
    name: input.name.trim(),
    category: input.category,
    price: input.price,
    imageUrl: input.imageUrl.trim(),
    purchaseDate: input.purchaseDate || new Date().toISOString(),
    attributes: {
      ...input.attributes,
      category: input.category,
    },
  };

  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText || 'Não foi possível cadastrar o item.');
  }

  const created: ApiProduct = await response.json();
  return mapApiProductToHardwareProduct(created);
}

export async function deleteProductFromDb(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Não foi possível remover o item.');
  }
}
