import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIXO = '@pluvia';

export const CHAVES = {
  contas: `${PREFIXO}:contas`,
  sessao: `${PREFIXO}:sessao`,
  cacheMapa: `${PREFIXO}:cache-mapa`,
  simulacao: `${PREFIXO}:simulacao`,
  relatosSimulados: `${PREFIXO}:simulacao:relatos`,
  preferencias: (usuarioId: string) => `${PREFIXO}:usuario:${usuarioId}:preferencias`,
  avisos: (usuarioId: string) => `${PREFIXO}:usuario:${usuarioId}:avisos`,
  estadoAvisos: (usuarioId: string) => `${PREFIXO}:usuario:${usuarioId}:estado-avisos`,
} as const;

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
