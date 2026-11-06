import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Único ponto do app que conversa com o AsyncStorage.
 * Os outros serviços usam estas funções e nunca acessam o AsyncStorage diretamente.
 */

const PREFIXO = '@sentinela';

export const CHAVES = {
  contas: `${PREFIXO}:contas`,
  sessao: `${PREFIXO}:sessao`,
  cachePontos: `${PREFIXO}:cache-pontos`,
  limitesSimulacao: `${PREFIXO}:simulacao:limites`,
  chuvasSimulacao: `${PREFIXO}:simulacao:chuvas`,
  pontosSeguidos: (usuarioId: string) => `${PREFIXO}:usuario:${usuarioId}:pontos-seguidos`,
  alertas: (usuarioId: string) => `${PREFIXO}:usuario:${usuarioId}:alertas`,
} as const;

/** Lê um valor salvo em JSON. Se não existir ou estiver corrompido, devolve o padrão. */
export async function lerJSON<T>(chave: string, padrao: T): Promise<T> {
  const bruto = await AsyncStorage.getItem(chave);
  if (bruto === null) return padrao;
  try {
    return JSON.parse(bruto) as T;
  } catch {
    console.warn(`Dado corrompido em ${chave}. Usando o valor padrão.`);
    return padrao;
  }
}

/** Lê uma lista. Qualquer coisa que não seja lista vira lista vazia. */
export async function lerLista<T>(chave: string): Promise<T[]> {
  const valor = await lerJSON<unknown>(chave, []);
  return Array.isArray(valor) ? (valor as T[]) : [];
}

export async function salvarJSON(chave: string, valor: unknown): Promise<void> {
  await AsyncStorage.setItem(chave, JSON.stringify(valor));
}

export async function remover(chave: string): Promise<void> {
  await AsyncStorage.removeItem(chave);
}

const filas = new Map<string, Promise<unknown>>();

/**
 * Lê, altera e grava uma lista em fila, chave por chave.
 * Sem a fila, duas alterações ao mesmo tempo poderiam ler o mesmo valor e uma se perderia.
 */
export function atualizarLista<T>(chave: string, alterar: (atual: T[]) => T[]): Promise<T[]> {
  const anterior = filas.get(chave) ?? Promise.resolve();
  const proxima = anterior
    .catch(() => undefined)
    .then(async () => {
      const novo = alterar(await lerLista<T>(chave));
      await salvarJSON(chave, novo);
      return novo;
    });
  filas.set(chave, proxima);
  return proxima;
}
