/** Niveis de risco definidos pelo grupo, do menor para o maior. */
export type NivelRisco = 'NORMAL' | 'ATENCAO' | 'ALERTA' | 'EVACUACAO';

/** Altura da agua, em cm, a partir da qual cada nivel comeca. Configuravel por ponto. */
export interface LimitesRisco {
  atencaoCm: number;
  alertaCm: number;
  evacuacaoCm: number;
}

export interface PontoMonitorado {
  id: string;
  nome: string;
  endereco: string;
  regiao: string;
  nivelAtualCm: number;
  risco: NivelRisco;
  /** Horario da primeira leitura que levou ao risco atual. Nulo quando sempre esteve NORMAL. */
  riscoDetectadoEm: string | null;
  /** Horario da ultima leitura recebida do sensor. */
  atualizadoEm: string;
  limites: LimitesRisco;
}

export interface Leitura {
  pontoId: string;
  nivelCm: number;
  medidoEm: string;
}

/** Contrato que tanto a simulacao quanto a API real seguem. */
export interface FonteDeDados {
  readonly simulada: boolean;
  listarPontos(): Promise<PontoMonitorado[]>;
  listarLeituras(pontoId: string): Promise<Leitura[]>;
  registrarConfirmacao(pontoId: string, confirmadoEm: string): Promise<void>;
  /** Usado pelo agente da Defesa Civil. */
  atualizarLimites(pontoId: string, limites: LimitesRisco): Promise<void>;
}

/** Alerta recebido pelo cidadao, guardado no celular. */
export interface AlertaRegistrado {
  id: string;
  pontoId: string;
  pontoNome: string;
  risco: NivelRisco;
  nivelCm: number;
  detectadoEm: string;
  recebidoEm: string;
  confirmadoEm: string | null;
}

/** Ponto em que o cidadao ativou os alertas. */
export interface PontoSeguido {
  pontoId: string;
  pontoNome: string;
  ultimoRisco: NivelRisco;
}
