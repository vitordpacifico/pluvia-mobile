export type NivelRisco = 'NORMAL' | 'ATENCAO' | 'ALERTA' | 'EVACUACAO';

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
  riscoDetectadoEm: string | null;
  atualizadoEm: string;
  limites: LimitesRisco;
}

export interface Leitura {
  pontoId: string;
  nivelCm: number;
  medidoEm: string;
}

export interface FonteDeDados {
  readonly simulada: boolean;
  listarPontos(): Promise<PontoMonitorado[]>;
  listarLeituras(pontoId: string): Promise<Leitura[]>;
  registrarConfirmacao(pontoId: string, confirmadoEm: string): Promise<void>;
  atualizarLimites(pontoId: string, limites: LimitesRisco): Promise<void>;
}

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

export interface PontoSeguido {
  pontoId: string;
  pontoNome: string;
  ultimoRisco: NivelRisco;
}
