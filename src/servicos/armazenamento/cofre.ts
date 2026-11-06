import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { lerJSON, remover, salvarJSON } from './armazenamento';

/**
 * Cofre do celular para os dados de contato do cidadão (telefone e CEP).
 *
 * No Android e no iOS, o expo-secure-store grava no Keystore e no Keychain do sistema,
 * criptografado e preso a este aparelho. Esses dados nunca vão para o AsyncStorage,
 * que guarda tudo em texto aberto.
 *
 * O navegador não tem cofre. A versão web serve só para demonstração e prints,
 * por isso lá os dados ficam no armazenamento comum.
 */

export interface DadosProtegidos {
  telefone?: string;
  cep?: string;
}

export const COFRE_DO_SISTEMA = Platform.OS !== 'web';

const OPCOES: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/** O SecureStore só aceita letras, números, ".", "-" e "_" no nome da chave. */
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
