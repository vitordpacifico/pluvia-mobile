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

export const CHAVES_COFRE = {
  contato: (usuarioId: string) => `pluvia.protegido.${usuarioId}`,
  locais: (usuarioId: string) => `pluvia.locais.${usuarioId}`,
} as const;

export async function guardarNoCofre(chave: string, valor: unknown): Promise<void> {
  if (!COFRE_DO_SISTEMA) {
    await salvarJSON(chave, valor);
    return;
  }
  await SecureStore.setItemAsync(chave, JSON.stringify(valor), OPCOES);
}

export async function lerDoCofre<T>(chave: string, padrao: T): Promise<T> {
  if (!COFRE_DO_SISTEMA) return lerJSON<T>(chave, padrao);
  const bruto = await SecureStore.getItemAsync(chave, OPCOES);
  if (bruto === null) return padrao;
  try {
    return JSON.parse(bruto) as T;
  } catch {
    return padrao;
  }
}

export async function apagarDoCofre(chave: string): Promise<void> {
  if (!COFRE_DO_SISTEMA) {
    await remover(chave);
    return;
  }
  await SecureStore.deleteItemAsync(chave, OPCOES);
}

export function guardarProtegido(usuarioId: string, dados: DadosProtegidos): Promise<void> {
  return guardarNoCofre(CHAVES_COFRE.contato(usuarioId), dados);
}

export function lerProtegido(usuarioId: string): Promise<DadosProtegidos> {
  return lerDoCofre<DadosProtegidos>(CHAVES_COFRE.contato(usuarioId), {});
}

export function apagarProtegido(usuarioId: string): Promise<void> {
  return apagarDoCofre(CHAVES_COFRE.contato(usuarioId));
}
