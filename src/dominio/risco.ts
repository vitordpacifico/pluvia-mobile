import type MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';

import type { Leitura, LimitesRisco, NivelRisco, PontoMonitorado } from './tipos';

type NomeIcone = ComponentProps<typeof MaterialCommunityIcons>['name'];

export const ORDEM_RISCO: readonly NivelRisco[] = ['NORMAL', 'ATENCAO', 'ALERTA', 'EVACUACAO'];

export function gravidade(risco: NivelRisco): number {
  return ORDEM_RISCO.indexOf(risco);
}

export function ehNivelRisco(valor: unknown): valor is NivelRisco {
  return typeof valor === 'string' && (ORDEM_RISCO as readonly string[]).includes(valor);
}

interface InfoRisco {
  rotulo: string;
  icone: NomeIcone;
  corTexto: string;
  corFundo: string;
  orientacao: string;
}

/** Cor, ícone e texto: o risco nunca é comunicado só pela cor. */
export const INFO_RISCO: Record<NivelRisco, InfoRisco> = {
  NORMAL: {
    rotulo: 'Normal',
    icone: 'check-circle',
    corTexto: '#1B5E20',
    corFundo: '#E8F5E9',
    orientacao: 'Nível da água dentro do esperado. Nenhuma ação necessária.',
  },
  ATENCAO: {
    rotulo: 'Atenção',
    icone: 'alert-circle',
    corTexto: '#5C3B00',
    corFundo: '#FFF4D6',
    orientacao: 'O nível da água está subindo. Fique atento e acompanhe as atualizações.',
  },
  ALERTA: {
    rotulo: 'Alerta',
    icone: 'alert',
    corTexto: '#8A2B00',
    corFundo: '#FFE5D6',
    orientacao:
      'Possibilidade de alagamento. Retire veículos, proteja mercadorias e eleve móveis e equipamentos.',
  },
  EVACUACAO: {
    rotulo: 'Evacuação',
    icone: 'run-fast',
    corTexto: '#FFFFFF',
    corFundo: '#B00020',
    orientacao:
      'Condição crítica. Deixe a área de risco seguindo as orientações da Defesa Civil (telefone 199).',
  },
};

export function classificarNivel(nivelCm: number, limites: LimitesRisco): NivelRisco {
  if (nivelCm >= limites.evacuacaoCm) return 'EVACUACAO';
  if (nivelCm >= limites.alertaCm) return 'ALERTA';
  if (nivelCm >= limites.atencaoCm) return 'ATENCAO';
  return 'NORMAL';
}

/**
 * Regra do grupo contra alarme falso: o risco só muda depois de duas leituras
 * seguidas no novo nível. Na solução final quem aplica a regra é a API; aqui ela
 * é usada pela simulação. Aplicar a mesma regra na descida é uma suposição.
 *
 * As leituras precisam estar em ordem cronológica.
 */
export function aplicarRegraDeConfirmacao(
  leituras: readonly Leitura[],
  limites: LimitesRisco,
): { risco: NivelRisco; detectadoEm: string | null } {
  let risco: NivelRisco = 'NORMAL';
  let detectadoEm: string | null = null;

  for (let i = 1; i < leituras.length; i++) {
    const anterior = classificarNivel(leituras[i - 1].nivelCm, limites);
    const atual = classificarNivel(leituras[i].nivelCm, limites);
    if (atual === anterior && atual !== risco) {
      risco = atual;
      detectadoEm = leituras[i - 1].medidoEm;
    }
  }
  return { risco, detectadoEm };
}

/** Texto mostrado nas telas para explicar por que o nível demora alguns segundos para mudar. */
export const EXPLICACAO_REGRA_DE_CONFIRMACAO =
  'O nível só muda depois de 2 leituras seguidas do sensor, para evitar alarme falso. ' +
  'Por isso a água pode passar do limite alguns segundos antes de o nível mudar.';

/** Depois deste tempo sem leitura, o app avisa que os dados podem estar desatualizados. */
export const MINUTOS_PARA_DADO_ANTIGO = 5;

export function dadosDesatualizados(ponto: PontoMonitorado, agora = Date.now()): boolean {
  return agora - Date.parse(ponto.atualizadoEm) > MINUTOS_PARA_DADO_ANTIGO * 60_000;
}

/**
 * Indicador de impacto do projeto: tempo entre a detecção da condição pelo sensor
 * e a chegada do alerta ao morador.
 */
export function tempoAteReceber(alerta: { detectadoEm: string; recebidoEm: string }): number {
  return Date.parse(alerta.recebidoEm) - Date.parse(alerta.detectadoEm);
}

/** Quantos pontos estão em cada nível. Usado no painel do agente. */
export function contarPorNivel(pontos: readonly PontoMonitorado[]): Record<NivelRisco, number> {
  const contagem: Record<NivelRisco, number> = { NORMAL: 0, ATENCAO: 0, ALERTA: 0, EVACUACAO: 0 };
  for (const ponto of pontos) contagem[ponto.risco]++;
  return contagem;
}
