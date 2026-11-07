import type { LocalMonitorado } from '@/dominio/local';
import type { Ocorrencia } from '@/dominio/ocorrencia';
import type { Relato } from '@/dominio/relato';
import type { RiscoEstimado } from '@/dominio/riscoEstimado';

export const CAMBUCI = { latitude: -23.5662, longitude: -46.6196 };
export const PERTO_DO_CAMBUCI = { latitude: -23.5679, longitude: -46.6178 };
export const VILA_MARIANA = { latitude: -23.5893, longitude: -46.6345 };

export function ocorrencia(dados: Partial<Ocorrencia> = {}): Ocorrencia {
  const agora = new Date().toISOString();
  return {
    id: 'o1',
    titulo: 'Alagamento na via',
    bairro: 'Cambuci',
    referencia: 'Av. do Estado',
    local: CAMBUCI,
    fonte: { tipo: 'OFICIAL', nome: 'CGE-SP (dados de demonstração)' },
    status: 'ATIVO',
    registradaEm: agora,
    atualizadaEm: agora,
    encerradaEm: null,
    historico: [],
    ...dados,
  };
}

export function local(dados: Partial<LocalMonitorado> = {}): LocalMonitorado {
  return {
    id: 'carro',
    tipo: 'CARRO',
    nome: 'Meu carro',
    bairro: 'Cambuci',
    referencia: 'Rua Lavapés',
    local: PERTO_DO_CAMBUCI,
    raioM: 500,
    criadoEm: '2026-11-07T10:00:00Z',
    ...dados,
  };
}

export function risco(dados: Partial<RiscoEstimado> = {}): RiscoEstimado {
  return {
    id: 'r1',
    bairro: 'Cambuci',
    centro: CAMBUCI,
    raioM: 900,
    faixa: 'MODERADO',
    calculadoEm: '2026-11-07T10:00:00Z',
    validoAte: '2026-11-07T11:00:00Z',
    motivo: 'Chuva forte medida agora.',
    ...dados,
  };
}

export function relato(dados: Partial<Relato> = {}): Relato {
  return {
    id: 'rel1',
    autorId: 'u1',
    tipo: 'RUA_ALAGADA',
    descricao: '',
    bairro: 'Cambuci',
    referencia: 'Rua Lavapés',
    local: PERTO_DO_CAMBUCI,
    ocorridoEm: new Date().toISOString(),
    enviadoEm: new Date().toISOString(),
    fotoUri: null,
    triagem: null,
    status: 'EM_ANALISE',
    revisadoEm: null,
    motivoRecusa: null,
    ocorrenciaId: null,
    ...dados,
  };
}
