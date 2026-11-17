import type {
  BuildComponentDto,
  BuildSelection,
  BuildSessionDto,
  HardwareCategory,
  HardwareProduct,
  ValidateBuildResponseDto,
} from '../types/hardware';
import { GATEWAY_ROUTES, gatewayRequest } from './gatewayClient';

export function mapProductToBuildComponent(
  product: HardwareProduct
): BuildComponentDto {
  return {
    productId: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    imageUrl: product.image,
    attributes: product.rawAttributes,
  };
}

export function mapSelectionToBuildComponents(
  selection: BuildSelection
): BuildComponentDto[] {
  return Object.values(selection)
    .filter((item): item is HardwareProduct => Boolean(item))
    .map(mapProductToBuildComponent);
}

export async function validateBuildSelection(
  selection: BuildSelection
): Promise<ValidateBuildResponseDto> {
  const components = mapSelectionToBuildComponents(selection);

  return gatewayRequest<ValidateBuildResponseDto>(
    `${GATEWAY_ROUTES.builds}/validate`,
    {
      method: 'POST',
      body: JSON.stringify({ components }),
    },
    'Não foi possível validar a compatibilidade das peças.'
  );
}

export async function createBuildSession(
  name = 'Configuração Personalizada',
  initialSelection?: BuildSelection
): Promise<BuildSessionDto> {
  const initialComponents = initialSelection
    ? mapSelectionToBuildComponents(initialSelection)
    : [];

  return gatewayRequest<BuildSessionDto>(
    GATEWAY_ROUTES.builds,
    {
      method: 'POST',
      body: JSON.stringify({
        name,
        initialComponents,
      }),
    },
    'Não foi possível iniciar a sessão de montagem.'
  );
}

export async function getBuildSession(
  buildId: string
): Promise<BuildSessionDto> {
  return gatewayRequest<BuildSessionDto>(
    `${GATEWAY_ROUTES.builds}/${encodeURIComponent(buildId)}`,
    { method: 'GET' },
    'Sessão de montagem não encontrada.'
  );
}

export async function selectBuildComponent(
  buildId: string,
  category: HardwareCategory,
  product: HardwareProduct
): Promise<BuildSessionDto> {
  const payload = mapProductToBuildComponent(product);

  return gatewayRequest<BuildSessionDto>(
    `${GATEWAY_ROUTES.builds}/${encodeURIComponent(
      buildId
    )}/components/${encodeURIComponent(category)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
    'Não foi possível atualizar a peça selecionada.'
  );
}

export async function removeBuildComponent(
  buildId: string,
  category: HardwareCategory
): Promise<BuildSessionDto> {
  return gatewayRequest<BuildSessionDto>(
    `${GATEWAY_ROUTES.builds}/${encodeURIComponent(
      buildId
    )}/components/${encodeURIComponent(category)}`,
    {
      method: 'DELETE',
    },
    'Não foi possível remover a peça da montagem.'
  );
}

export async function deleteBuildSession(buildId: string): Promise<void> {
  await gatewayRequest<void>(
    `${GATEWAY_ROUTES.builds}/${encodeURIComponent(buildId)}`,
    { method: 'DELETE' },
    'Não foi possível limpar a sessão de montagem.'
  );
}
