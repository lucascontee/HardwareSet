import type { InventoryItemDto } from '../types/hardware';
import { GATEWAY_ROUTES, gatewayRequest } from './gatewayClient';

export async function fetchAllInventory(): Promise<InventoryItemDto[]> {
  return gatewayRequest<InventoryItemDto[]>(
    GATEWAY_ROUTES.inventory,
    { method: 'GET' },
    'Não foi possível consultar a disponibilidade de estoque.'
  );
}

export async function fetchProductInventory(
  productId: string
): Promise<InventoryItemDto> {
  return gatewayRequest<InventoryItemDto>(
    `${GATEWAY_ROUTES.inventory}/${encodeURIComponent(productId)}`,
    { method: 'GET' },
    'Estoque do item não encontrado.'
  );
}
