import type {
  ApiProduct,
  CreateProductInput,
  HardwareProduct,
} from '../types/hardware';
import { mapApiProductToHardwareProduct } from '../data/hardwareCatalog';
import { GATEWAY_ROUTES, gatewayRequest } from './gatewayClient';

export async function fetchAllProducts(): Promise<HardwareProduct[]> {
  const data = await gatewayRequest<ApiProduct[]>(
    GATEWAY_ROUTES.products,
    { method: 'GET' },
    'Não foi possível carregar o catálogo de peças.'
  );

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

  const created = await gatewayRequest<ApiProduct>(
    GATEWAY_ROUTES.products,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    'Não foi possível cadastrar o item.'
  );

  return mapApiProductToHardwareProduct(created);
}

export async function deleteProductFromDb(id: string): Promise<void> {
  await gatewayRequest<void>(
    `${GATEWAY_ROUTES.products}/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    'Não foi possível remover o item.'
  );
}
