import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { lerJSON, remover, salvarJSON } from './armazenamento';

export interface DadosProtegidos {
  telefone?: string;
  cep?: string;
}

export const COFRE_DO_SISTEMA = Platform.OS !== 'web';

const OPCOES: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

function chaveDoCofre(usuarioId: string): string {
  return `sentinela.protegido.${usuarioId}`;
}

export async function guardarProtegido(usuarioId: string, dados: DadosProtegidos): Promise<void> {
  const chave = chaveDoCofre(usuarioId);
  if (!COFRE_DO_SISTEMA) {
    await salvarJSON(chave, dados);
    return;
  }
  await SecureStore.setItemAsync(chave, JSON.stringify(dados), OPCOES);
}

export async function lerProtegido(usuarioId: string): Promise<DadosProtegidos> {
  const chave = chaveDoCofre(usuarioId);
  if (!COFRE_DO_SISTEMA) return lerJSON<DadosProtegidos>(chave, {});
  const bruto = await SecureStore.getItemAsync(chave, OPCOES);
  if (bruto === null) return {};
  try {
    return JSON.parse(bruto) as DadosProtegidos;
  } catch {
    return {};
  }
}

export async function apagarProtegido(usuarioId: string): Promise<void> {
  const chave = chaveDoCofre(usuarioId);
  if (!COFRE_DO_SISTEMA) {
    await remover(chave);
    return;
  }
  await SecureStore.deleteItemAsync(chave, OPCOES);
}
