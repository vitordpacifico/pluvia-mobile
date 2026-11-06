import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { useDados } from '@/contexto/DadosContext';
import type { PontoMonitorado } from '@/dominio/tipos';

import TelaLimites from '../Limites';

jest.mock('@/contexto/DadosContext', () => ({ useDados: jest.fn() }));

const PONTO: PontoMonitorado = {
  id: 'demo-a',
  nome: 'Ponto de demonstração A',
  endereco: 'Endereço a definir',
  regiao: 'São Paulo, SP',
  nivelAtualCm: 3,
  risco: 'NORMAL',
  riscoDetectadoEm: null,
  atualizadoEm: new Date().toISOString(),
  limites: { atencaoCm: 10, alertaCm: 25, evacuacaoCm: 40 },
};

const recarregar = jest.fn(async () => undefined);

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: 'demo-a' });
  jest.mocked(useDados).mockReturnValue({
    pontos: [PONTO],
    carregando: false,
    erro: null,
    origem: 'rede',
    obtidosEm: new Date(),
    simulada: true,
    recarregar,
  });
});

it('começa com os limites atuais do ponto', async () => {
  await render(<TelaLimites />);
  expect(screen.getByLabelText('Atenção (cm)').props.value).toBe('10');
  expect(screen.getByLabelText('Alerta (cm)').props.value).toBe('25');
  expect(screen.getByLabelText('Evacuação (cm)').props.value).toBe('40');
});

it('recusa limites fora de ordem e não salva', async () => {
  await render(<TelaLimites />);
  await fireEvent.changeText(screen.getByLabelText('Alerta (cm)'), '8');
  await fireEvent.press(screen.getByRole('button', { name: 'Salvar limites' }));
  expect(screen.getByText('Precisa ser maior que o limite de Atenção.')).toBeTruthy();
  expect(router.back).not.toHaveBeenCalled();
});

it('aceita decimal com ponto, salva e volta', async () => {
  await render(<TelaLimites />);
  await fireEvent.changeText(screen.getByLabelText('Alerta (cm)'), '30.55');
  expect(screen.getByLabelText('Alerta (cm)').props.value).toBe('30,5');
  await fireEvent.press(screen.getByRole('button', { name: 'Salvar limites' }));

  await waitFor(() => expect(router.back).toHaveBeenCalled());
  expect(recarregar).toHaveBeenCalled();
  const salvos = JSON.parse((await AsyncStorage.getItem('@sentinela:simulacao:limites')) ?? '{}');
  expect(salvos['demo-a']).toEqual({ atencaoCm: 10, alertaCm: 30.5, evacuacaoCm: 40 });
});
