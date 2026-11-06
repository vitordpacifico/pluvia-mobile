import { ehNivelRisco } from '@/dominio/risco';
import type { NivelRisco, PontoMonitorado, PontoSeguido } from '@/dominio/tipos';

import { atualizarLista, CHAVES, lerLista } from './armazenamento';

/** Pontos em que cada cidadão ativou os alertas, com o último risco conhecido. */

export async function listarPontosSeguidos(usuarioId: string): Promise<PontoSeguido[]> {
  const lista = await lerLista<PontoSeguido>(CHAVES.pontosSeguidos(usuarioId));
  return lista.map((p) => ({ ...p, ultimoRisco: ehNivelRisco(p.ultimoRisco) ? p.ultimoRisco : 'NORMAL' }));
}

/** Guarda o risco atual para só avisar quando ele piorar a partir de agora. */
export async function seguirPonto(usuarioId: string, ponto: PontoMonitorado): Promise<void> {
  await atualizarLista<PontoSeguido>(CHAVES.pontosSeguidos(usuarioId), (lista) => [
    ...lista.filter((p) => p.pontoId !== ponto.id),
    { pontoId: ponto.id, pontoNome: ponto.nome, ultimoRisco: ponto.risco },
  ]);
}

export async function deixarDeSeguir(usuarioId: string, pontoId: string): Promise<void> {
  await atualizarLista<PontoSeguido>(CHAVES.pontosSeguidos(usuarioId), (lista) =>
    lista.filter((p) => p.pontoId !== pontoId),
  );
}

export async function atualizarUltimoRisco(
  usuarioId: string,
  pontoId: string,
  risco: NivelRisco,
): Promise<void> {
  await atualizarLista<PontoSeguido>(CHAVES.pontosSeguidos(usuarioId), (lista) =>
    lista.map((p) => (p.pontoId === pontoId ? { ...p, ultimoRisco: risco } : p)),
  );
}
