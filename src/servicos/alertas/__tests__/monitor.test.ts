import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

import { salvarPreferencias } from '@/servicos/armazenamento/avisosServico';
import { salvarCarro } from '@/servicos/armazenamento/locaisServico';
import { local, ocorrencia, VILA_MARIANA } from '@/testes/fabricas';

import { verificarAvisos } from '../monitor';
import * as notificacoes from '../notificacoes';

jest.mock('expo-haptics', () => ({
  NotificationFeedbackType: { Warning: 'warning' },
  notificationAsync: jest.fn(async () => undefined),
}));
jest.mock('../notificacoes', () => ({
  notificacoesPermitidas: jest.fn(async () => true),
  notificarAviso: jest.fn(async () => undefined),
}));

const mockNotificacoes = jest.mocked(notificacoes);
const AGORA = () => new Date('2026-11-07T15:00:00Z');

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  await salvarCarro('u1', local());
  await verificarAvisos('u1', [], [], AGORA);
});

it('avisa, notifica e vibra quando surge um alagamento perto do carro', async () => {
  const novos = await verificarAvisos('u1', [ocorrencia()], [], AGORA);
  expect(novos).toHaveLength(1);
  expect(novos[0].titulo).toBe('Alagamento perto de Meu carro');
  expect(mockNotificacoes.notificarAviso).toHaveBeenCalledWith(novos[0]);
  expect(Haptics.notificationAsync).toHaveBeenCalled();
});

it('não repete o aviso na verificação seguinte', async () => {
  await verificarAvisos('u1', [ocorrencia()], [], AGORA);
  expect(await verificarAvisos('u1', [ocorrencia()], [], AGORA)).toEqual([]);
});

it('ignora alagamentos longe dos locais monitorados', async () => {
  expect(await verificarAvisos('u1', [ocorrencia({ local: VILA_MARIANA })], [], AGORA)).toEqual([]);
});

it('registra o aviso, mas não notifica quando a pessoa silenciou', async () => {
  await salvarPreferencias('u1', { novos: true, encerramentos: true, riscoElevado: true, silenciado: true });
  const novos = await verificarAvisos('u1', [ocorrencia()], [], AGORA);
  expect(novos).toHaveLength(1);
  expect(mockNotificacoes.notificarAviso).not.toHaveBeenCalled();
});

it('registra o aviso mesmo sem permissão de notificação', async () => {
  mockNotificacoes.notificacoesPermitidas.mockResolvedValueOnce(false);
  const novos = await verificarAvisos('u1', [ocorrencia()], [], AGORA);
  expect(novos).toHaveLength(1);
  expect(mockNotificacoes.notificarAviso).not.toHaveBeenCalled();
});
