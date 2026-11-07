import type { Coordenada } from './geo';

export type TipoEvento = 'RUA_ALAGADA' | 'AGUA_SUBINDO' | 'CHUVA_FORTE' | 'OUTRO';

export type CategoriaTriagem = 'INDICIO' | 'SEM_INDICIO' | 'INCONCLUSIVA';

export type StatusRelato = 'EM_ANALISE' | 'PUBLICADO' | 'RECUSADO';

export interface Triagem {
  categoria: CategoriaTriagem;
  confianca: number;
  analisadaEm: string;
  simulada: boolean;
}

export interface Relato {
  id: string;
  autorId: string;
  tipo: TipoEvento;
  descricao: string;
  bairro: string;
  referencia: string;
  local: Coordenada;
  ocorridoEm: string;
  enviadoEm: string;
  fotoUri: string | null;
  triagem: Triagem | null;
  status: StatusRelato;
  revisadoEm: string | null;
  motivoRecusa: string | null;
  ocorrenciaId: string | null;
}

export interface NovoRelato {
  tipo: TipoEvento;
  descricao: string;
  bairro: string;
  referencia: string;
  local: Coordenada;
  ocorridoEm: string;
  fotoUri: string | null;
}

export const OPCOES_TIPO_EVENTO: { valor: TipoEvento; rotulo: string; descricao: string }[] = [
  { valor: 'RUA_ALAGADA', rotulo: 'Rua alagada', descricao: 'Água acumulada sobre a via' },
  { valor: 'AGUA_SUBINDO', rotulo: 'Água subindo', descricao: 'Córrego ou bueiro transbordando' },
  { valor: 'CHUVA_FORTE', rotulo: 'Chuva forte', descricao: 'Muita chuva, sem água acumulada' },
  { valor: 'OUTRO', rotulo: 'Outro', descricao: 'Descreva o que viu' },
];

export const ROTULO_TIPO_EVENTO: Record<TipoEvento, string> = {
  RUA_ALAGADA: 'Rua alagada',
  AGUA_SUBINDO: 'Água subindo',
  CHUVA_FORTE: 'Chuva forte',
  OUTRO: 'Outro',
};

export const INFO_TRIAGEM: Record<CategoriaTriagem, { rotulo: string; explicacao: string }> = {
  INDICIO: {
    rotulo: 'Indício de água sobre a via',
    explicacao: 'A foto parece mostrar água acumulada na rua.',
  },
  SEM_INDICIO: {
    rotulo: 'Chuva ou piso molhado, sem indício claro',
    explicacao: 'A foto mostra chuva ou piso molhado, mas não água acumulada.',
  },
  INCONCLUSIVA: {
    rotulo: 'Imagem inconclusiva',
    explicacao: 'Não foi possível identificar a situação pela foto.',
  },
};

export const INFO_STATUS_RELATO: Record<StatusRelato, { rotulo: string; explicacao: string }> = {
  EM_ANALISE: {
    rotulo: 'Em análise',
    explicacao: 'A equipe confere o relato com outros registros, sensores e chuva antes de publicar.',
  },
  PUBLICADO: {
    rotulo: 'Publicado como relato comunitário',
    explicacao: 'O relato aparece no mapa como possível alagamento, separado dos registros oficiais.',
  },
  RECUSADO: {
    rotulo: 'Não publicado',
    explicacao: 'A equipe não encontrou evidência suficiente para publicar.',
  },
};

export const LIMITE_DA_IA =
  'Uma foto não comprova profundidade, extensão nem risco para atravessar. A IA só ajuda na triagem: quem decide a publicação é a equipe.';
