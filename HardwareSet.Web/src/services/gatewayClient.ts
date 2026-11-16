const rawGatewayUrl =
  import.meta.env.VITE_GATEWAY_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000';

export const GATEWAY_BASE_URL = rawGatewayUrl.replace(/\/+$/, '');

export const GATEWAY_ROUTES = {
  products: '/api/products',
  builds: '/api/builds',
  inventory: '/api/inventory',
} as const;

export function buildGatewayUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${GATEWAY_BASE_URL}${normalizedPath}`;
}

export async function gatewayRequest<T>(
  path: string,
  options: RequestInit = {},
  defaultErrorMessage = 'Não foi possível concluir a solicitação.'
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(buildGatewayUrl(path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText || defaultErrorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
