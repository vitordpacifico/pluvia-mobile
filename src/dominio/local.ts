import type { Coordenada, RaioMonitoramento } from './geo';

export type TipoLocal = 'CARRO' | 'FAVORITO';

export interface LocalMonitorado {
  id: string;
  tipo: TipoLocal;
  nome: string;
  bairro: string;
  referencia: string;
  local: Coordenada;
  raioM: RaioMonitoramento;
  criadoEm: string;
}

export type TipoAviso = 'NOVO' | 'ENCERRADO' | 'RISCO';

export interface PreferenciasAviso {
  novos: boolean;
  encerramentos: boolean;
  riscoElevado: boolean;
  silenciado: boolean;
}

export const PREFERENCIAS_PADRAO: PreferenciasAviso = {
  novos: true,
  encerramentos: true,
  riscoElevado: true,
  silenciado: false,
};

export interface Aviso {
  id: string;
  tipo: TipoAviso;
  chave: string;
  titulo: string;
  texto: string;
  ocorrenciaId: string | null;
  localId: string;
  detectadoEm: string;
  recebidoEm: string;
  lidoEm: string | null;
}

export const MAXIMO_LOCAIS = 5;
