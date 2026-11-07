import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { useAutenticacao } from '@/contexto/AutenticacaoContext';
import { fonteDeDados } from '@/servicos/dados/fonte';
import { relato } from '@/testes/fabricas';

import TelaRelatar from '../Relatar';

jest.mock('@/contexto/AutenticacaoContext', () => ({ useAutenticacao: jest.fn() }));

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  jest.mocked(useAutenticacao).mockReturnValue({
    usuario: { id: 'u1', nome: 'Ana', email: 'ana@email.com', perfil: 'cidadao', criadoEm: '' },
  } as ReturnType<typeof useAutenticacao>);
  jest.spyOn(fonteDeDados, 'listarRelatos').mockResolvedValue([]);
});

it('mostra um erro em cada campo obrigatório', async () => {
  jest.spyOn(fonteDeDados, 'enviarRelato');
  await render(<TelaRelatar />);
  await fireEvent.changeText(screen.getByLabelText('Hora em que viu'), '2599');
  await fireEvent.press(screen.getByRole('button', { name: 'Enviar relato' }));

  expect(screen.getByText('Escolha onde foi: use a localização ou um bairro.')).toBeTruthy();
  expect(screen.getByText('Informe a rua ou um ponto de referência.')).toBeTruthy();
  expect(screen.getByText('Hora inválida. Use o formato 14:30.')).toBeTruthy();
  expect(screen.getByText('Só envie o relato se você estiver em um lugar seguro.')).toBeTruthy();
  expect(fonteDeDados.enviarRelato).not.toHaveBeenCalled();
});

it('aplica a máscara de hora', async () => {
  await render(<TelaRelatar />);
  await fireEvent.changeText(screen.getByLabelText('Hora em que viu'), '1430');
  expect(screen.getByLabelText('Hora em que viu').props.value).toBe('14:30');
});

it('exige a descrição quando o tipo é Outro', async () => {
  await render(<TelaRelatar />);
  await fireEvent.press(screen.getByRole('radio', { name: 'Outro. Descreva o que viu' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Enviar relato' }));
  expect(screen.getByText('Descreva o que você viu.')).toBeTruthy();
});

it('pede a confirmação da foto e envia o relato com a foto já limpa', async () => {
  const enviar = jest.spyOn(fonteDeDados, 'enviarRelato').mockResolvedValue(relato({ id: 'novo' }));
  await render(<TelaRelatar />);
  await fireEvent.press(screen.getByRole('radio', { name: 'Cambuci' }));
  await fireEvent.changeText(screen.getByLabelText('Rua ou ponto de referência'), 'Rua Lavapés');
  await fireEvent.press(screen.getByRole('button', { name: 'Tirar foto' }));
  await screen.findByLabelText('Foto escolhida para o relato');
  await fireEvent.press(screen.getByRole('checkbox', { name: 'Estou em um lugar seguro' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Enviar relato' }));
  expect(screen.getByText('Confirme que a foto é atual e do local indicado.')).toBeTruthy();

  await fireEvent.press(screen.getByRole('checkbox', { name: 'Confirmo que a foto é de agora e do local indicado' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Enviar relato' }));

  await waitFor(() => expect(enviar).toHaveBeenCalled());
  expect(enviar.mock.calls[0][1]).toMatchObject({
    tipo: 'RUA_ALAGADA',
    bairro: 'Cambuci',
    referencia: 'Rua Lavapés',
    fotoUri: 'file:///foto-limpa.jpg',
  });
  expect(router.push).toHaveBeenCalledWith({ pathname: '/relato/[id]', params: { id: 'novo' } });
});
