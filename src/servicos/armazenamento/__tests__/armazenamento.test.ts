import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PontoMonitorado } from '@/dominio/tipos';

import {
  apagarAlertas,
  confirmarSeguranca,
  contarAlertasPendentes,
  listarAlertas,
  registrarAlerta,
} from '../alertasServico';
import { atualizarLista, lerJSON, lerLista } from '../armazenamento';
import { lerCopiaPontos, salvarCopiaPontos } from '../cacheServico';
import {
  atualizarUltimoRisco,
  deixarDeSeguir,
  listarPontosSeguidos,
  seguirPonto,
} from '../pontosSeguidosServico';

const PONTO: PontoMonitorado = {
  id: 'p1',
  nome: 'Ponto 1',
  endereco: 'Rua A',
  regiao: 'São Paulo, SP',
  nivelAtualCm: 12,
  risco: 'ATENCAO',
  riscoDetectadoEm: '2026-11-05T14:00:00Z',
  atualizadoEm: '2026-11-05T14:00:10Z',
  limites: { atencaoCm: 10, alertaCm: 25, evacuacaoCm: 40 },
};

function alerta(recebidoEm: string) {
  return {
    pontoId: 'p1',
    pontoNome: 'Ponto 1',
    risco: 'ALERTA' as const,
    nivelCm: 30,
    detectadoEm: '2026-11-05T14:00:00Z',
    recebidoEm,
  };
}

beforeEach(() => AsyncStorage.clear());

describe('armazenamento', () => {
  it('devolve o padrao para chave inexistente ou JSON corrompido', async () => {
    expect(await lerJSON('x', 7)).toBe(7);
    await AsyncStorage.setItem('x', '{quebrado');
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(await lerJSON('x', 7)).toBe(7);
  });

  it('trata como lista vazia o que nao for lista', async () => {
    await AsyncStorage.setItem('l', '{"a":1}');
    expect(await lerLista('l')).toEqual([]);
  });

  it('nao perde alteracoes feitas ao mesmo tempo', async () => {
    await Promise.all(
      Array.from({ length: 20 }, (_, i) => atualizarLista<number>('n', (lista) => [...lista, i])),
    );
    expect((await lerLista<number>('n')).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 20 }, (_, i) => i),
    );
  });
});

describe('alertas', () => {
  it('lista do mais recente para o mais antigo e conta os pendentes', async () => {
    await registrarAlerta('u1', alerta('2026-11-05T14:00:10Z'));
    const segundo = await registrarAlerta('u1', alerta('2026-11-05T14:05:00Z'));
    const lista = await listarAlertas('u1');
    expect(lista[0].id).toBe(segundo.id);
    expect(await contarAlertasPendentes('u1')).toBe(2);

    await confirmarSeguranca('u1', segundo.id, '2026-11-05T14:06:00Z');
    expect(await contarAlertasPendentes('u1')).toBe(1);
    expect((await listarAlertas('u1'))[0].confirmadoEm).toBe('2026-11-05T14:06:00Z');
  });

  it('separa os alertas de cada usuario', async () => {
    await registrarAlerta('u1', alerta('2026-11-05T14:00:10Z'));
    expect(await listarAlertas('u2')).toEqual([]);
    await apagarAlertas('u1');
    expect(await listarAlertas('u1')).toEqual([]);
  });
});

describe('pontos seguidos', () => {
  it('segue, atualiza o risco e deixa de seguir', async () => {
    await seguirPonto('u1', PONTO);
    await seguirPonto('u1', PONTO);
    expect(await listarPontosSeguidos('u1')).toEqual([
      { pontoId: 'p1', pontoNome: 'Ponto 1', ultimoRisco: 'ATENCAO' },
    ]);
    await atualizarUltimoRisco('u1', 'p1', 'EVACUACAO');
    expect((await listarPontosSeguidos('u1'))[0].ultimoRisco).toBe('EVACUACAO');
    await deixarDeSeguir('u1', 'p1');
    expect(await listarPontosSeguidos('u1')).toEqual([]);
  });
});

describe('copia local dos pontos', () => {
  it('salva e le a ultima lista', async () => {
    expect(await lerCopiaPontos()).toBeNull();
    const salvoEm = new Date('2026-11-05T14:00:20Z');
    await salvarCopiaPontos([PONTO], salvoEm);
    expect(await lerCopiaPontos()).toEqual({ pontos: [PONTO], salvoEm });
  });
});
