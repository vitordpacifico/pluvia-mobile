import {
  aplicarRegraDeConfirmacao,
  classificarNivel,
  contarPorNivel,
  dadosDesatualizados,
  ehNivelRisco,
  gravidade,
  tempoAteReceber,
} from '../risco';
import { nivelPelaDistancia } from '../sensor';
import type { Leitura, PontoMonitorado } from '../tipos';

const LIMITES = { atencaoCm: 10, alertaCm: 25, evacuacaoCm: 40 };

function leituras(niveis: number[]): Leitura[] {
  return niveis.map((nivelCm, i) => ({
    pontoId: 'p1',
    nivelCm,
    medidoEm: new Date(Date.UTC(2026, 10, 5, 14, 0, i * 10)).toISOString(),
  }));
}

describe('classificarNivel', () => {
  it.each([
    [0, 'NORMAL'],
    [9.9, 'NORMAL'],
    [10, 'ATENCAO'],
    [24.9, 'ATENCAO'],
    [25, 'ALERTA'],
    [40, 'EVACUACAO'],
    [80, 'EVACUACAO'],
  ])('%p cm vira %s', (nivel, esperado) => {
    expect(classificarNivel(nivel, LIMITES)).toBe(esperado);
  });
});

describe('aplicarRegraDeConfirmacao (duas leituras seguidas)', () => {
  it('ignora um pico isolado', () => {
    expect(aplicarRegraDeConfirmacao(leituras([2, 30, 2, 2]), LIMITES).risco).toBe('NORMAL');
  });

  it('muda o risco com duas leituras seguidas no novo nível', () => {
    const resultado = aplicarRegraDeConfirmacao(leituras([2, 30, 31]), LIMITES);
    expect(resultado.risco).toBe('ALERTA');
  });

  it('registra a detecção na primeira leitura do par', () => {
    const lista = leituras([2, 30, 31]);
    expect(aplicarRegraDeConfirmacao(lista, LIMITES).detectadoEm).toBe(lista[1].medidoEm);
  });

  it('acompanha a subida e a descida da água', () => {
    const sobe = leituras([2, 12, 13, 27, 28, 45, 46]);
    expect(aplicarRegraDeConfirmacao(sobe, LIMITES).risco).toBe('EVACUACAO');
    const desce = leituras([45, 46, 30, 29, 3, 2]);
    expect(aplicarRegraDeConfirmacao(desce, LIMITES).risco).toBe('NORMAL');
  });

  it('não muda nada sem leituras suficientes', () => {
    expect(aplicarRegraDeConfirmacao([], LIMITES)).toEqual({ risco: 'NORMAL', detectadoEm: null });
    expect(aplicarRegraDeConfirmacao(leituras([50]), LIMITES).risco).toBe('NORMAL');
  });
});

describe('utilitarios de risco', () => {
  it('ordena a gravidade', () => {
    expect(gravidade('NORMAL')).toBeLessThan(gravidade('ATENCAO'));
    expect(gravidade('ALERTA')).toBeLessThan(gravidade('EVACUACAO'));
  });

  it('reconhece só os níveis válidos', () => {
    expect(ehNivelRisco('ALERTA')).toBe(true);
    expect(ehNivelRisco('alerta')).toBe(false);
    expect(ehNivelRisco(3)).toBe(false);
  });

  it('marca dados antigos depois de 5 minutos', () => {
    const agora = Date.UTC(2026, 10, 5, 14, 10);
    const ponto = { atualizadoEm: new Date(agora - 4 * 60_000).toISOString() } as PontoMonitorado;
    expect(dadosDesatualizados(ponto, agora)).toBe(false);
    expect(dadosDesatualizados({ ...ponto, atualizadoEm: new Date(agora - 6 * 60_000).toISOString() }, agora)).toBe(true);
  });
});

describe('indicadores', () => {
  it('mede o tempo entre a detecção e a chegada do alerta', () => {
    expect(tempoAteReceber({ detectadoEm: '2026-11-05T14:00:00Z', recebidoEm: '2026-11-05T14:00:11Z' })).toBe(11_000);
  });

  it('conta os pontos por nível', () => {
    const pontos = ['NORMAL', 'ALERTA', 'ALERTA'].map((r) => ({ risco: r }) as PontoMonitorado);
    expect(contarPorNivel(pontos)).toEqual({ NORMAL: 1, ATENCAO: 0, ALERTA: 2, EVACUACAO: 0 });
  });
});

describe('sensor ultrassônico', () => {
  it('calcula o nível pela distância até a água', () => {
    expect(nivelPelaDistancia(250, 250)).toBe(0);
    expect(nivelPelaDistancia(250, 210)).toBe(40);
    expect(nivelPelaDistancia(250, 260)).toBe(0);
  });
});
