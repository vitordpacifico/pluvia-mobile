import * as Location from 'expo-location';

import type { Coordenada } from '@/dominio/geo';

export class ErroLocalizacao extends Error {}

export async function obterLocalizacaoAtual(): Promise<Coordenada> {
  const permissao = await Location.requestForegroundPermissionsAsync();
  if (!permissao.granted) {
    throw new ErroLocalizacao('Sem permissão de localização. Escolha o bairro na lista.');
  }
  try {
    const posicao = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { latitude: posicao.coords.latitude, longitude: posicao.coords.longitude };
  } catch {
    throw new ErroLocalizacao('Não foi possível obter a localização. Escolha o bairro na lista.');
  }
}
