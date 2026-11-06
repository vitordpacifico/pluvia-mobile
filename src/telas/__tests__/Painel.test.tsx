import { render, screen } from '@testing-library/react-native';

import { useDados } from '@/contexto/DadosContext';
import type { NivelRisco, PontoMonitorado } from '@/dominio/tipos';

import TelaPainel from '../Painel';

jest.mock('@/contexto/DadosContext', () => ({ useDados: jest.fn() }));

function ponto(id: string, risco: NivelRisco, minutosSemLeitura = 0): PontoMonitorado {
  return {
    id,
    nome: `Ponto ${id}`,
    endereco: 'Rua',
    regiao: 'São Paulo, SP',
    nivelAtualCm: risco === 'EVACUACAO' ? 45 : 2,
    risco,
    riscoDetectadoEm: null,
    atualizadoEm: new Date(Date.now() - minutosSemLeitura * 60_000).toISOString(),
    limites: { atencaoCm: 10, alertaCm: 25, evacuacaoCm: 40 },
  };
}

beforeEach(() => {
  jest.mocked(useDados).mockReturnValue({
    pontos: [ponto('A', 'EVACUACAO'), ponto('B', 'NORMAL'), ponto('C', 'NORMAL', 120)],
    carregando: false,
    erro: null,
    origem: 'rede',
    obtidosEm: new Date(),
    simulada: true,
    recarregar: jest.fn(async () => undefined),
  });
});

it('conta os pontos por nível', async () => {
  await render(<TelaPainel />);
  expect(screen.getByLabelText('2 pontos em Normal')).toBeTruthy();
  expect(screen.getByLabelText('1 pontos em Evacuação')).toBeTruthy();
  expect(screen.getByLabelText('0 pontos em Alerta')).toBeTruthy();
});

it('lista os pontos em risco e os sensores sem sinal', async () => {
  await render(<TelaPainel />);
  expect(screen.getByText('Ponto A: 45,0 cm')).toBeTruthy();
  expect(screen.getByText(/Ponto C: última leitura/)).toBeTruthy();
});

it('explica a regra das duas leituras', async () => {
  await render(<TelaPainel />);
  expect(screen.getByText(/só muda depois de 2 leituras seguidas/)).toBeTruthy();
});

it('mostra os controles da simulação IoT', async () => {
  await render(<TelaPainel />);
  expect(screen.getByRole('button', { name: 'Reiniciar simulação' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Simular chuva em Ponto de demonstração B' })).toBeTruthy();
});
