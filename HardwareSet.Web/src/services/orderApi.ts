import type {
  BuildSelection,
  HardwareProduct,
  OrderDto,
} from '../types/hardware';
import { GATEWAY_ROUTES, gatewayRequest } from './gatewayClient';

export interface SubmitOrderOptions {
  customerName?: string;
  paymentMethod: 'pix' | 'card';
  simulatePaymentFailure?: boolean;
}

export async function createOrderFromSelection(
  selection: BuildSelection,
  options: SubmitOrderOptions
): Promise<OrderDto> {
  const items = Object.values(selection)
    .filter((item): item is HardwareProduct => Boolean(item))
    .map((product) => ({
      productId: product.id,
      productName: product.name,
      category: product.category,
      unitPrice: product.price,
      quantity: 1,
    }));

  return gatewayRequest<OrderDto>(
    GATEWAY_ROUTES.orders,
    {
      method: 'POST',
      body: JSON.stringify({
        customerName: options.customerName || 'Cliente HardwareSet',
        paymentMethod: options.paymentMethod,
        simulatePaymentFailure: Boolean(options.simulatePaymentFailure),
        items,
      }),
    },
    'Não foi possível processar o fechamento do pedido.'
  );
}

export async function fetchOrderById(orderId: string): Promise<OrderDto> {
  return gatewayRequest<OrderDto>(
    `${GATEWAY_ROUTES.orders}/${encodeURIComponent(orderId)}`,
    { method: 'GET' },
    'Pedido não encontrado.'
  );
}
