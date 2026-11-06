import type { PontoMonitorado } from '@/dominio/tipos';
import * as alertas from '@/servicos/armazenamento/alertasServico';
import * as seguidos from '@/servicos/armazenamento/pontosSeguidosServico';

import { verificarPontosSeguidos } from '../monitor';
import * as notificacoes from '../notificacoes';

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: { Warning: 'warning', Error: 'error' },
}));
jest.mock('@/servicos/armazenamento/pontosSeguidosServico', () => ({
  listarPontosSeguidos: jest.fn(),
  atualizarUltimoRisco: jest.fn(),
}));
jest.mock('@/servicos/armazenamento/alertasServico', () => ({ registrarAlerta: jest.fn() }));
jest.mock('../notificacoes', () => ({
  notificacoesPermitidas: jest.fn(),
  notificarMudancaDeRisco: jest.fn(),
}));

const USUARIO = 'u1';
const AGORA = new Date('2026-11-05T14:01:11Z');
const mockSeguidos = jest.mocked(seguidos);
const mockAlertas = jest.mocked(alertas);
const mockNotificacoes = jest.mocked(notificacoes);

function ponto(risco: PontoMonitorado['risco']): PontoMonitorado {
  return {
    id: 'p1',
    nome: 'Ponto 1',
    endereco: 'Rua A',
    regiao: 'São Paulo, SP',
    nivelAtualCm: 30,
    risco,
    riscoDetectadoEm: '2026-11-05T14:01:00Z',
    atualizadoEm: '2026-11-05T14:01:10Z',
    limites: { atencaoCm: 10, alertaCm: 25, evacuacaoCm: 40 },
  };
}

function seguindo(ultimoRisco: PontoMonitorado['risco']) {
  mockSeguidos.listarPontosSeguidos.mockResolvedValue([
    { pontoId: 'p1', pontoNome: 'Ponto 1', ultimoRisco },
  ]);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockNotificacoes.notificacoesPermitidas.mockResolvedValue(true);
});

it('cria alerta e notifica quando o risco piora', async () => {
  seguindo('NORMAL');
  const novos = await verificarPontosSeguidos(USUARIO, [ponto('ALERTA')], () => AGORA);

  expect(novos).toBe(1);
  expect(mockSeguidos.atualizarUltimoRisco).toHaveBeenCalledWith(USUARIO, 'p1', 'ALERTA');
  expect(mockAlertas.registrarAlerta).toHaveBeenCalledWith(USUARIO, {
    pontoId: 'p1',
    pontoNome: 'Ponto 1',
    risco: 'ALERTA',
    nivelCm: 30,
    detectadoEm: '2026-11-05T14:01:00Z',
    recebidoEm: AGORA.toISOString(),
  });
  expect(mockNotificacoes.notificarMudancaDeRisco).toHaveBeenCalledTimes(1);
});

it('só atualiza o risco quando ele melhora', async () => {
  seguindo('EVACUACAO');
  expect(await verificarPontosSeguidos(USUARIO, [ponto('ATENCAO')], () => AGORA)).toBe(0);
  expect(mockSeguidos.atualizarUltimoRisco).toHaveBeenCalledWith(USUARIO, 'p1', 'ATENCAO');
  expect(mockAlertas.registrarAlerta).not.toHaveBeenCalled();
});

it('não faz nada quando o risco não muda', async () => {
  seguindo('ALERTA');
  expect(await verificarPontosSeguidos(USUARIO, [ponto('ALERTA')], () => AGORA)).toBe(0);
  expect(mockSeguidos.atualizarUltimoRisco).not.toHaveBeenCalled();
});

it('ignora pontos que o morador não acompanha', async () => {
  mockSeguidos.listarPontosSeguidos.mockResolvedValue([]);
  expect(await verificarPontosSeguidos(USUARIO, [ponto('EVACUACAO')], () => AGORA)).toBe(0);
});

it('registra o alerta mesmo sem permissão de notificação', async () => {
  seguindo('NORMAL');
  mockNotificacoes.notificacoesPermitidas.mockResolvedValue(false);
  expect(await verificarPontosSeguidos(USUARIO, [ponto('ATENCAO')], () => AGORA)).toBe(1);
  expect(mockNotificacoes.notificarMudancaDeRisco).not.toHaveBeenCalled();
});

it('usa o horário da última leitura se a API não informar a detecção', async () => {
  seguindo('NORMAL');
  await verificarPontosSeguidos(USUARIO, [{ ...ponto('ALERTA'), riscoDetectadoEm: null }], () => AGORA);
  expect(mockAlertas.registrarAlerta.mock.calls[0][1].detectadoEm).toBe('2026-11-05T14:01:10Z');
});
