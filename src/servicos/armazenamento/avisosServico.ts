import * as Crypto from 'expo-crypto';

import { ESTADO_INICIAL, type EstadoConhecido, type NovoAviso } from '@/dominio/avisos';
import { PREFERENCIAS_PADRAO, type Aviso, type PreferenciasAviso } from '@/dominio/local';

import { atualizarLista, CHAVES, lerJSON, lerLista, remover, salvarJSON } from './armazenamento';

const MAXIMO_AVISOS = 100;

export async function listarAvisos(usuarioId: string): Promise<Aviso[]> {
  const lista = await lerLista<Aviso>(CHAVES.avisos(usuarioId));
  return [...lista].sort((a, b) => Date.parse(b.recebidoEm) - Date.parse(a.recebidoEm));
}

export async function registrarAvisos(usuarioId: string, novos: NovoAviso[]): Promise<Aviso[]> {
  if (novos.length === 0) return [];
  const registrados: Aviso[] = [];
  await atualizarLista<Aviso>(CHAVES.avisos(usuarioId), (lista) => {
    const chaves = new Set(lista.map((a) => a.chave));
    for (const aviso of novos) {
      if (chaves.has(aviso.chave)) continue;
      chaves.add(aviso.chave);
      registrados.push({ ...aviso, id: Crypto.randomUUID(), lidoEm: null });
    }
    return [...registrados, ...lista].slice(0, MAXIMO_AVISOS);
  });
  return registrados;
}

export async function marcarTodosComoLidos(usuarioId: string, lidoEm: string): Promise<void> {
  await atualizarLista<Aviso>(CHAVES.avisos(usuarioId), (lista) =>
    lista.map((a) => (a.lidoEm ? a : { ...a, lidoEm })),
  );
}

export async function contarNaoLidos(usuarioId: string): Promise<number> {
  const lista = await lerLista<Aviso>(CHAVES.avisos(usuarioId));
  return lista.filter((a) => a.lidoEm === null).length;
}

export async function lerPreferencias(usuarioId: string): Promise<PreferenciasAviso> {
  const salvas = await lerJSON<Partial<PreferenciasAviso>>(CHAVES.preferencias(usuarioId), {});
  return { ...PREFERENCIAS_PADRAO, ...salvas };
}

export async function salvarPreferencias(usuarioId: string, preferencias: PreferenciasAviso): Promise<void> {
  await salvarJSON(CHAVES.preferencias(usuarioId), preferencias);
}

export async function lerEstadoConhecido(usuarioId: string): Promise<EstadoConhecido> {
  const estado = await lerJSON<EstadoConhecido | null>(CHAVES.estadoAvisos(usuarioId), null);
  if (!estado || typeof estado.ocorrencias !== 'object' || typeof estado.riscos !== 'object') {
    return ESTADO_INICIAL;
  }
  return estado;
}

export async function salvarEstadoConhecido(usuarioId: string, estado: EstadoConhecido): Promise<void> {
  await salvarJSON(CHAVES.estadoAvisos(usuarioId), estado);
}

export async function apagarDadosDeAvisos(usuarioId: string): Promise<void> {
  await Promise.all([
    remover(CHAVES.avisos(usuarioId)),
    remover(CHAVES.preferencias(usuarioId)),
    remover(CHAVES.estadoAvisos(usuarioId)),
  ]);
}
