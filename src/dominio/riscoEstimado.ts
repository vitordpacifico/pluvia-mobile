import { distanciaMetros, type Coordenada } from './geo';

export type FaixaRisco = 'BAIXO' | 'MODERADO' | 'ELEVADO';

export interface RiscoEstimado {
  id: string;
  bairro: string;
  centro: Coordenada;
  raioM: number;
  faixa: FaixaRisco;
  calculadoEm: string;
  validoAte: string;
  motivo: string;
}

export const ORDEM_FAIXA: readonly FaixaRisco[] = ['BAIXO', 'MODERADO', 'ELEVADO'];

export function pesoFaixa(faixa: FaixaRisco): number {
  return ORDEM_FAIXA.indexOf(faixa);
}

export const INFO_FAIXA: Record<FaixaRisco, { rotulo: string; corTexto: string; corFundo: string }> = {
  BAIXO: { rotulo: 'Risco estimado: baixo', corTexto: '#1B5E20', corFundo: '#E8F5E9' },
  MODERADO: { rotulo: 'Risco estimado: moderado', corTexto: '#5C3B00', corFundo: '#FFF4D6' },
  ELEVADO: { rotulo: 'Risco estimado: elevado', corTexto: '#8A2B00', corFundo: '#FFE5D6' },
};

export const AVISO_INCERTEZA =
  'Estimativa calculada a partir de chuva e histórico. Não confirma água na pista e pode mudar rapidamente.';

export function riscoNoPonto(riscos: readonly RiscoEstimado[], ponto: Coordenada): RiscoEstimado | null {
  return riscos
    .filter((risco) => distanciaMetros(risco.centro, ponto) <= risco.raioM)
    .reduce<RiscoEstimado | null>(
      (maior, risco) => (!maior || pesoFaixa(risco.faixa) > pesoFaixa(maior.faixa) ? risco : maior),
      null,
    );
}
