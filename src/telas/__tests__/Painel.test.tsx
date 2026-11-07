import { render, screen } from '@testing-library/react-native';

import { useDados } from '@/contexto/DadosContext';
import type { SensorNivel } from '@/dominio/tipos';
import { fonteDeDados } from '@/servicos/dados/fonte';
import { CAMBUCI, ocorrencia } from '@/testes/fabricas';

import TelaPainel from '../Painel';

jest.mock('@/contexto/DadosContext', () => ({ useDados: jest.fn() }));

const minutosAtras = (minutos: number) => new Date(Date.now() - minutos * 60_000).toISOString();

function sensor(id: string, nivelCm: number, minutosSemLeitura = 0): SensorNivel {
  return {
    id,
    nome: `Sensor ${id}`,
    bairro: 'Cambuci',
    referencia: 'Av. do Estado',
    local: CAMBUCI,
    nivelCm,
    atualizadoEm: minutosAtras(minutosSemLeitura),
    leituras: [{ nivelCm, medidoEm: minutosAtras(minutosSemLeitura) }],
  };
}

beforeEach(() => {
  jest.spyOn(fonteDeDados, 'listarRelatos').mockResolvedValue([]);
  jest.mocked(useDados).mockReturnValue({
    ocorrencias: [
      ocorrencia({ id: 'a' }),
      ocorrencia({ id: 'b', atualizadaEm: minutosAtras(120) }),
      ocorrencia({ id: 'c', status: 'ENCERRADO', encerradaEm: minutosAtras(30) }),
      ocorrencia({ id: 'd', fonte: { tipo: 'COMUNIDADE', nome: 'Relato comunitário verificado' } }),
    ],
    riscos: [],
    sensores: [sensor('1', 32), sensor('3', 2, 120)],
    carregando: false,
    erro: null,
    origem: 'rede',
    obtidosEm: new Date(),
    simulada: true,
    recarregar: jest.fn(async () => undefined),
  });
});

it('conta as ocorrências por situação', async () => {
  await render(<TelaPainel />);
  expect(screen.getByLabelText('1 ocorrência(s): Confirmado • ativo')).toBeTruthy();
  expect(screen.getByLabelText('1 ocorrência(s): Sem dados recentes')).toBeTruthy();
  expect(screen.getByLabelText('1 ocorrência(s): Encerrado')).toBeTruthy();
  expect(screen.getByLabelText('1 ocorrência(s): Possível alagamento • relato comunitário')).toBeTruthy();
});

it('mostra o nível dos sensores e avisa o sensor sem sinal', async () => {
  await render(<TelaPainel />);
  expect(screen.getByText('Água: 32,0 cm')).toBeTruthy();
  expect(screen.getByText(/Sem leituras há 2 h/)).toBeTruthy();
});

it('mostra os controles da simulação IoT só para sensores com sinal', async () => {
  await render(<TelaPainel />);
  expect(screen.getByRole('button', { name: 'Simular chuva no Sensor 1' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Simular chuva no Sensor 3' })).toBeNull();
  expect(screen.getByRole('link', { name: 'Reiniciar a demonstração' })).toBeTruthy();
});
