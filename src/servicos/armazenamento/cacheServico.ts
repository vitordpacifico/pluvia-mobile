import type { PontoMonitorado } from '@/dominio/tipos';

import { CHAVES, lerJSON, salvarJSON } from './armazenamento';

/** Ultima situacao conhecida dos pontos, para o app continuar mostrando algo sem conexao. */
interface CopiaPontos {
  pontos: PontoMonitorado[];
  salvoEm: string;
}

export async function salvarCopiaPontos(pontos: PontoMonitorado[], salvoEm: Date): Promise<void> {
  await salvarJSON(CHAVES.cachePontos, { pontos, salvoEm: salvoEm.toISOString() });
}

export async function lerCopiaPontos(): Promise<{ pontos: PontoMonitorado[]; salvoEm: Date } | null> {
  const copia = await lerJSON<CopiaPontos | null>(CHAVES.cachePontos, null);
  if (!copia || !Array.isArray(copia.pontos) || copia.pontos.length === 0) return null;
  return { pontos: copia.pontos, salvoEm: new Date(copia.salvoEm) };
}
