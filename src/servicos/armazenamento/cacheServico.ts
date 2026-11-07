import type { Ocorrencia } from '@/dominio/ocorrencia';
import type { RiscoEstimado } from '@/dominio/riscoEstimado';

import { CHAVES, lerJSON, salvarJSON } from './armazenamento';

export interface CopiaMapa {
  ocorrencias: Ocorrencia[];
  riscos: RiscoEstimado[];
  salvoEm: string;
}

export async function salvarCopiaMapa(copia: CopiaMapa): Promise<void> {
  await salvarJSON(CHAVES.cacheMapa, copia);
}

export async function lerCopiaMapa(): Promise<CopiaMapa | null> {
  const copia = await lerJSON<CopiaMapa | null>(CHAVES.cacheMapa, null);
  if (!copia || !Array.isArray(copia.ocorrencias) || !Array.isArray(copia.riscos)) return null;
  return copia;
}
