import * as Location from 'expo-location';

import type { Coordenada } from '@/dominio/geo';

export class ErroLocalizacao extends Error {}

const TEMPO_LIMITE_MS = 15_000;

function comLimiteDeTempo<T>(promessa: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolver, rejeitar) => {
    const temporizador = setTimeout(() => rejeitar(new Error('tempo esgotado')), ms);
    promessa.then(
      (valor) => {
        clearTimeout(temporizador);
        resolver(valor);
      },
      (erro) => {
        clearTimeout(temporizador);
        rejeitar(erro);
      },
    );
  });
}

export async function obterLocalizacaoAtual(): Promise<Coordenada> {
  const permissao = await Location.requestForegroundPermissionsAsync();
  if (!permissao.granted) {
    throw new ErroLocalizacao('Sem permissão de localização. Escolha o bairro na lista.');
  }
  try {
    const posicao = await comLimiteDeTempo(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      TEMPO_LIMITE_MS,
    );
    return { latitude: posicao.coords.latitude, longitude: posicao.coords.longitude };
  } catch {
    const ultima = await Location.getLastKnownPositionAsync().catch(() => null);
    if (ultima) return { latitude: ultima.coords.latitude, longitude: ultima.coords.longitude };
    throw new ErroLocalizacao('Não foi possível obter a localização. Escolha o bairro na lista.');
  }
}
