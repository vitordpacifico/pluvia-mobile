import type { Coordenada } from './geo';
import type { Ocorrencia } from './ocorrencia';
import type { NovoRelato, Relato, StatusRelato } from './relato';
import type { RiscoEstimado } from './riscoEstimado';
import type { Leitura } from './sensor';

export interface SensorNivel {
  id: string;
  nome: string;
  bairro: string;
  referencia: string;
  local: Coordenada;
  nivelCm: number;
  atualizadoEm: string;
  leituras: Leitura[];
}

export interface FiltroRelatos {
  autorId?: string;
  status?: StatusRelato;
}

export interface DecisaoModeracao {
  publicar: boolean;
  motivo?: string;
}

export interface FonteDeDados {
  readonly simulada: boolean;
  listarOcorrencias(): Promise<Ocorrencia[]>;
  listarRiscos(): Promise<RiscoEstimado[]>;
  listarSensores(): Promise<SensorNivel[]>;
  enviarRelato(autorId: string, relato: NovoRelato): Promise<Relato>;
  listarRelatos(filtro: FiltroRelatos): Promise<Relato[]>;
  excluirRelato(autorId: string, relatoId: string): Promise<void>;
  excluirRelatosDoAutor(autorId: string): Promise<void>;
  revisarRelato(relatoId: string, decisao: DecisaoModeracao): Promise<Relato>;
  encerrarOcorrencia(ocorrenciaId: string): Promise<void>;
  simularChuva(sensorId: string): Promise<void>;
}
