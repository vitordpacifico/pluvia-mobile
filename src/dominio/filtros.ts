import { distanciaMetros, type Coordenada, type RaioMonitoramento } from './geo';
import type { Ocorrencia, TipoFonte } from './ocorrencia';

export type FiltroStatus = 'TODOS' | 'ATIVOS' | 'ENCERRADOS';
export type FiltroFonte = 'TODAS' | TipoFonte;
export type FiltroPeriodo = '1' | '6' | '24' | '72';

export interface Filtros {
  status: FiltroStatus;
  fonte: FiltroFonte;
  periodoH: FiltroPeriodo;
  raioM: RaioMonitoramento | null;
}

export const FILTROS_PADRAO: Filtros = { status: 'TODOS', fonte: 'TODAS', periodoH: '24', raioM: null };

export interface OcorrenciaProxima {
  ocorrencia: Ocorrencia;
  distanciaM: number;
}

export function filtrarOcorrencias(
  ocorrencias: readonly Ocorrencia[],
  filtros: Filtros,
  centro: Coordenada,
  agora = Date.now(),
): OcorrenciaProxima[] {
  const inicioPeriodo = agora - Number(filtros.periodoH) * 3_600_000;
  return ocorrencias
    .filter((o) => filtros.status === 'TODOS' || (filtros.status === 'ATIVOS') === (o.status === 'ATIVO'))
    .filter((o) => filtros.fonte === 'TODAS' || o.fonte.tipo === filtros.fonte)
    .filter((o) => o.status === 'ATIVO' || Date.parse(o.encerradaEm ?? o.atualizadaEm) >= inicioPeriodo)
    .map((ocorrencia) => ({ ocorrencia, distanciaM: distanciaMetros(centro, ocorrencia.local) }))
    .filter(({ distanciaM }) => filtros.raioM === null || distanciaM <= filtros.raioM)
    .sort((a, b) => {
      if (a.ocorrencia.status !== b.ocorrencia.status) return a.ocorrencia.status === 'ATIVO' ? -1 : 1;
      return a.distanciaM - b.distanciaM;
    });
}

export function filtrosAtivos(filtros: Filtros): number {
  return (Object.keys(FILTROS_PADRAO) as (keyof Filtros)[]).filter(
    (chave) => filtros[chave] !== FILTROS_PADRAO[chave],
  ).length;
}
