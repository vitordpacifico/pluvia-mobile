import type MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';

import type { Coordenada } from './geo';

type NomeIcone = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type StatusOcorrencia = 'ATIVO' | 'ENCERRADO';

export type TipoFonte = 'OFICIAL' | 'SENSOR' | 'COMUNIDADE';

export interface Fonte {
  tipo: TipoFonte;
  nome: string;
}

export interface MudancaStatus {
  status: StatusOcorrencia;
  em: string;
  descricao: string;
}

export interface Ocorrencia {
  id: string;
  titulo: string;
  bairro: string;
  referencia: string;
  local: Coordenada;
  fonte: Fonte;
  status: StatusOcorrencia;
  registradaEm: string;
  atualizadaEm: string;
  encerradaEm: string | null;
  historico: MudancaStatus[];
  nivelCm?: number;
  relatoId?: string;
}

export type EstadoExibido = 'ATIVO' | 'COMUNITARIO' | 'ENCERRADO' | 'SEM_DADOS';

export const MINUTOS_SEM_ATUALIZACAO = 60;

export function semDadosRecentes(ocorrencia: Ocorrencia, agora = Date.now()): boolean {
  return (
    ocorrencia.status === 'ATIVO' &&
    agora - Date.parse(ocorrencia.atualizadaEm) > MINUTOS_SEM_ATUALIZACAO * 60_000
  );
}

export function estadoExibido(ocorrencia: Ocorrencia, agora = Date.now()): EstadoExibido {
  if (ocorrencia.status === 'ENCERRADO') return 'ENCERRADO';
  if (semDadosRecentes(ocorrencia, agora)) return 'SEM_DADOS';
  return ocorrencia.fonte.tipo === 'COMUNIDADE' ? 'COMUNITARIO' : 'ATIVO';
}

interface InfoEstado {
  rotulo: string;
  icone: NomeIcone;
  corTexto: string;
  corFundo: string;
  explicacao: string;
}

export const INFO_ESTADO: Record<EstadoExibido, InfoEstado> = {
  ATIVO: {
    rotulo: 'Confirmado • ativo',
    icone: 'water-alert',
    corTexto: '#FFFFFF',
    corFundo: '#B00020',
    explicacao: 'Alagamento registrado como ativo por uma fonte identificada e atualizada.',
  },
  COMUNITARIO: {
    rotulo: 'Possível alagamento • relato comunitário',
    icone: 'account-group',
    corTexto: '#5C3B00',
    corFundo: '#FFE7B3',
    explicacao:
      'Relato de morador verificado pela equipe. Não é um registro oficial e não confirma a profundidade da água.',
  },
  ENCERRADO: {
    rotulo: 'Encerrado',
    icone: 'check-circle-outline',
    corTexto: '#1B5E20',
    corFundo: '#E8F5E9',
    explicacao:
      'A fonte marcou o fim da ocorrência. Isso não garante que a via esteja liberada: a condição precisa ser reavaliada no local.',
  },
  SEM_DADOS: {
    rotulo: 'Sem dados recentes',
    icone: 'clock-alert-outline',
    corTexto: '#FFFFFF',
    corFundo: '#4A4F55',
    explicacao:
      'A fonte não atualiza esta ocorrência há mais de 1 hora. Falta de atualização nunca é sinal de segurança.',
  },
};

export const ROTULO_FONTE: Record<TipoFonte, string> = {
  OFICIAL: 'Fonte oficial',
  SENSOR: 'Sensor de nível',
  COMUNIDADE: 'Relato comunitário',
};

export function textoEncerramento(ocorrencia: Ocorrencia, formatarHora: (iso: string) => string) {
  if (!ocorrencia.encerradaEm) return null;
  return `Ocorrência encerrada pela fonte às ${formatarHora(ocorrencia.encerradaEm)}. Isso não garante que a via esteja liberada.`;
}

export const AVISO_SEGURANCA =
  'Nunca atravesse nem entre em área alagada, nem para retirar o carro. Em emergência, ligue 199 (Defesa Civil) ou 193 (Bombeiros).';
