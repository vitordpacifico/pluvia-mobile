import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PontoMonitorado } from '@/dominio/tipos';
import { CHAVES } from '@/servicos/armazenamento/armazenamento';

import { fonteSimulada, reiniciarSimulacao, simularChuvaForte } from '../simulacao';

const INICIO = Date.UTC(2026, 10, 5, 14, 0, 0);

/** Avança o relógio falso até `segundos` depois do início e consulta os pontos. */
async function pontosAos(segundos: number): Promise<PontoMonitorado[]> {
  jest.setSystemTime(INICIO + segundos * 1000);
  const promessa = fonteSimulada.listarPontos();
  await jest.advanceTimersByTimeAsync(300);
  return promessa;
}

function risco(pontos: PontoMonitorado[], id: string) {
  return pontos.find((p) => p.id === id)!.risco;
}

beforeEach(() => {
  jest.useFakeTimers({ now: INICIO });
  reiniciarSimulacao();
});

afterEach(() => jest.useRealTimers());

it('começa sem risco em nenhum ponto', async () => {
  const pontos = await pontosAos(0);
  expect(pontos.map((p) => p.risco)).toEqual(['NORMAL', 'NORMAL', 'NORMAL']);
});

it('o ponto A passa por todos os níveis e volta ao normal', async () => {
  const vistos: string[] = [];
  for (let s = 0; s <= 350; s += 10) {
    const atual = risco(await pontosAos(s), 'demo-a');
    if (vistos[vistos.length - 1] !== atual) vistos.push(atual);
  }
  expect(vistos).toEqual(['NORMAL', 'ATENCAO', 'ALERTA', 'EVACUACAO', 'ALERTA', 'ATENCAO', 'NORMAL']);
});

it('informa quando o risco atual foi detectado', async () => {
  const pontoA = (await pontosAos(150)).find((p) => p.id === 'demo-a')!;
  expect(pontoA.risco).toBe('EVACUACAO');
  expect(Date.parse(pontoA.riscoDetectadoEm!)).toBeLessThanOrEqual(INICIO + 150_000);
});

it('o ponto C simula um sensor sem sinal há 2 horas', async () => {
  const pontoC = (await pontosAos(0)).find((p) => p.id === 'demo-c')!;
  expect(INICIO - Date.parse(pontoC.atualizadoEm)).toBeGreaterThanOrEqual(2 * 60 * 60_000);
});

it('o agente pode simular chuva forte em outro ponto', async () => {
  expect(risco(await pontosAos(0), 'demo-b')).toBe('NORMAL');
  simularChuvaForte('demo-b');
  expect(risco(await pontosAos(150), 'demo-b')).toBe('EVACUACAO');
  expect(() => simularChuvaForte('nao-existe')).toThrow('Ponto não encontrado.');
});

it('devolve 18 leituras em ordem cronológica', async () => {
  jest.setSystemTime(INICIO + 100_000);
  const promessa = fonteSimulada.listarLeituras('demo-a');
  await jest.advanceTimersByTimeAsync(300);
  const leituras = await promessa;
  expect(leituras).toHaveLength(18);
  for (let i = 1; i < leituras.length; i++) {
    expect(Date.parse(leituras[i].medidoEm)).toBeGreaterThan(Date.parse(leituras[i - 1].medidoEm));
  }
});

it('recusa um ponto que não existe', async () => {
  const promessa = fonteSimulada.listarLeituras('nao-existe');
  const verificacao = expect(promessa).rejects.toThrow('Ponto não encontrado.');
  await jest.advanceTimersByTimeAsync(300);
  await verificacao;
});

it('aplica e salva os limites ajustados pelo agente', async () => {
  // Com limites altos, 48 cm de água ficam em Alerta, e não em Evacuação.
  await fonteSimulada.atualizarLimites('demo-a', { atencaoCm: 20, alertaCm: 45, evacuacaoCm: 60 });
  const pontoA = (await pontosAos(180)).find((p) => p.id === 'demo-a')!;
  expect(pontoA.limites.evacuacaoCm).toBe(60);
  expect(pontoA.risco).toBe('ALERTA');
  expect(JSON.parse((await AsyncStorage.getItem(CHAVES.limitesSimulacao)) ?? '{}')).toHaveProperty('demo-a');
});

it('continua a chuva simulada depois que o app é aberto de novo', async () => {
  simularChuvaForte('demo-b');
  await jest.advanceTimersByTimeAsync(0);

  // Carrega o módulo do zero, como se o app tivesse sido fechado e aberto.
  await jest.isolateModulesAsync(async () => {
    const nova = jest.requireActual<typeof import('../simulacao')>('../simulacao');
    jest.setSystemTime(INICIO + 150_000);
    const promessa = nova.fonteSimulada.listarPontos();
    await jest.advanceTimersByTimeAsync(300);
    expect(risco(await promessa, 'demo-b')).toBe('EVACUACAO');
  });
});
