import AsyncStorage from '@react-native-async-storage/async-storage';

import { estadoExibido } from '@/dominio/ocorrencia';
import type { NovoRelato } from '@/dominio/relato';
import { PERTO_DO_CAMBUCI } from '@/testes/fabricas';

import { fonteSimulada, reiniciarSimulacao } from '../simulacao';

const INICIO = Date.parse('2026-11-07T15:00:00Z');

const NOVO_RELATO: NovoRelato = {
  tipo: 'RUA_ALAGADA',
  descricao: 'Água na altura da calçada',
  bairro: 'Cambuci',
  referencia: 'Rua Lavapés',
  local: PERTO_DO_CAMBUCI,
  ocorridoEm: '2026-11-07T14:55:00Z',
  fotoUri: 'file:///foto-limpa.jpg',
};

async function avancar(ms: number) {
  await jest.advanceTimersByTimeAsync(ms);
}

async function ocorrenciasAgora() {
  const pedido = fonteSimulada.listarOcorrencias();
  await avancar(300);
  return pedido;
}

beforeEach(async () => {
  jest.useFakeTimers({ now: INICIO });
  await AsyncStorage.clear();
  reiniciarSimulacao(INICIO);
});

afterEach(() => jest.useRealTimers());

it('traz ocorrências oficiais de demonstração ativas, encerradas e sem dados recentes', async () => {
  const ocorrencias = await ocorrenciasAgora();
  const estados = new Set(ocorrencias.map((o) => estadoExibido(o, INICIO)));
  expect(estados).toEqual(new Set(['ATIVO', 'ENCERRADO', 'SEM_DADOS']));
  expect(ocorrencias.every((o) => o.fonte.nome.length > 0 && o.registradaEm)).toBe(true);
});

it('abre e depois encerra uma ocorrência quando a chuva passa pelo sensor', async () => {
  await avancar(100_000);
  const durante = (await ocorrenciasAgora()).filter((o) => o.fonte.tipo === 'SENSOR');
  expect(durante).toHaveLength(1);
  expect(durante[0]).toMatchObject({ status: 'ATIVO', bairro: 'Cambuci' });

  await avancar(220_000);
  const depois = (await ocorrenciasAgora()).filter((o) => o.id === durante[0].id);
  expect(depois[0].status).toBe('ENCERRADO');
  expect(depois[0].historico.map((h) => h.status)).toEqual(['ATIVO', 'ENCERRADO']);
});

it('marca o risco estimado como elevado enquanto o sensor mede água', async () => {
  await avancar(100_000);
  const pedido = fonteSimulada.listarRiscos();
  const riscos = await pedido;
  expect(riscos.find((r) => r.id === 'risco-cambuci')?.faixa).toBe('ELEVADO');
  expect(riscos.find((r) => r.id === 'risco-vila-mariana')?.faixa).toBe('BAIXO');
});

it('deixa o relato em análise com a triagem simulada, e publica depois da revisão', async () => {
  const envio = fonteSimulada.enviarRelato('u1', NOVO_RELATO);
  await avancar(1200);
  const relato = await envio;
  expect(relato.status).toBe('EM_ANALISE');
  expect(relato.triagem).toMatchObject({ categoria: 'INDICIO', simulada: true });
  expect(await fonteSimulada.listarRelatos({ status: 'EM_ANALISE' })).toHaveLength(1);

  const publicado = await fonteSimulada.revisarRelato(relato.id, { publicar: true });
  expect(publicado).toMatchObject({ status: 'PUBLICADO', ocorrenciaId: `relato-${relato.id}` });
  const comunitaria = (await ocorrenciasAgora()).find((o) => o.relatoId === relato.id);
  expect(comunitaria && estadoExibido(comunitaria, INICIO)).toBe('COMUNITARIO');
});

it('relato sem foto não passa pela IA e pode ser excluído pelo autor', async () => {
  const envio = fonteSimulada.enviarRelato('u1', { ...NOVO_RELATO, fotoUri: null });
  await avancar(1200);
  const relato = await envio;
  expect(relato.triagem).toBeNull();
  await fonteSimulada.excluirRelato('outra-pessoa', relato.id);
  expect(await fonteSimulada.listarRelatos({ autorId: 'u1' })).toHaveLength(1);
  await fonteSimulada.excluirRelato('u1', relato.id);
  expect(await fonteSimulada.listarRelatos({ autorId: 'u1' })).toHaveLength(0);
});

it('encerra uma ocorrência oficial pela simulação da fonte', async () => {
  await fonteSimulada.encerrarOcorrencia('oficial-1');
  const encerrada = (await ocorrenciasAgora()).find((o) => o.id === 'oficial-1');
  expect(encerrada?.status).toBe('ENCERRADO');
  expect(encerrada?.historico.at(-1)?.descricao).toBe('A fonte marcou a ocorrência como encerrada.');
  await expect(fonteSimulada.encerrarOcorrencia('sensor-1-123')).rejects.toThrow('próprias leituras');
});

it('não simula chuva em sensor sem sinal', async () => {
  await expect(fonteSimulada.simularChuva('sensor-3')).rejects.toThrow('sem sinal');
  await expect(fonteSimulada.simularChuva('sensor-9')).rejects.toThrow('não encontrado');
});
