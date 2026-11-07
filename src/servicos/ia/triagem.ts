import type { Triagem, TipoEvento } from '@/dominio/relato';

const RESULTADO_SIMULADO: Record<TipoEvento, Pick<Triagem, 'categoria' | 'confianca'>> = {
  RUA_ALAGADA: { categoria: 'INDICIO', confianca: 0.84 },
  AGUA_SUBINDO: { categoria: 'INDICIO', confianca: 0.77 },
  CHUVA_FORTE: { categoria: 'SEM_INDICIO', confianca: 0.71 },
  OUTRO: { categoria: 'INCONCLUSIVA', confianca: 0.48 },
};

export function triarFotoSimulada(tipo: TipoEvento, temFoto: boolean, agora = new Date()): Triagem | null {
  if (!temFoto) return null;
  return { ...RESULTADO_SIMULADO[tipo], analisadaEm: agora.toISOString(), simulada: true };
}

export function formatarConfianca(confianca: number): string {
  return `${Math.round(confianca * 100)}%`;
}
