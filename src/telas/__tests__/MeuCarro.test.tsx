import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { useDados } from '@/contexto/DadosContext';
import { useLocais } from '@/contexto/LocaisContext';
import { local, ocorrencia, risco, VILA_MARIANA } from '@/testes/fabricas';

import TelaMeuCarro from '../MeuCarro';

jest.mock('@/contexto/DadosContext', () => ({ useDados: jest.fn() }));
jest.mock('@/contexto/LocaisContext', () => ({ useLocais: jest.fn() }));
jest.mock('@/servicos/alertas/notificacoes', () => ({
  pedirPermissaoDeNotificacao: jest.fn(async () => true),
}));

const salvarCarro = jest.fn(async () => undefined);

function configurar(carro: ReturnType<typeof local> | null) {
  jest.mocked(useLocais).mockReturnValue({
    locais: carro ? [carro] : [],
    carro,
    favoritos: [],
    carregando: false,
    salvarCarro,
    adicionarFavorito: jest.fn(),
    removerLocal: jest.fn(),
  });
  jest.mocked(useDados).mockReturnValue({
    ocorrencias: [ocorrencia(), ocorrencia({ id: 'longe', local: VILA_MARIANA })],
    riscos: [risco({ faixa: 'ELEVADO' })],
    sensores: [],
    carregando: false,
    erro: null,
    origem: 'rede',
    obtidosEm: new Date(),
    simulada: true,
    recarregar: jest.fn(),
  });
}

beforeEach(() => jest.clearAllMocks());

it('valida o formulário antes de salvar o carro', async () => {
  configurar(null);
  await render(<TelaMeuCarro />);
  await fireEvent.press(screen.getByRole('button', { name: 'Salvar local do carro' }));
  expect(screen.getByText('Escolha onde o carro está: use a localização ou um bairro.')).toBeTruthy();
  expect(screen.getByText('Informe a rua ou um ponto de referência.')).toBeTruthy();
  expect(salvarCarro).not.toHaveBeenCalled();
});

it('salva o carro com a localização do GPS e o raio escolhido', async () => {
  configurar(null);
  await render(<TelaMeuCarro />);
  await fireEvent.press(screen.getAllByRole('button', { name: 'Usar minha localização' })[0]);
  await screen.findByLabelText('Local escolhido: Cambuci');
  await fireEvent.changeText(screen.getByLabelText('Rua ou ponto de referência'), 'Rua Lavapés, 300');
  await fireEvent.press(screen.getByRole('radio', { name: 'Avisar num raio de: 1 km' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Salvar local do carro' }));

  await waitFor(() => expect(salvarCarro).toHaveBeenCalled());
  expect(salvarCarro).toHaveBeenCalledWith({
    nome: 'Meu carro',
    bairro: 'Cambuci',
    referencia: 'Rua Lavapés, 300',
    local: { latitude: -23.5662, longitude: -46.6196 },
    raioM: 1000,
  });
});

it('mostra os alagamentos ativos no raio do carro e o risco estimado', async () => {
  configurar(local());
  await render(<TelaMeuCarro />);
  expect(screen.getByText('1 alagamento(s) ativo(s) a até 500 m do carro.')).toBeTruthy();
  expect(screen.getByLabelText('Risco estimado: elevado')).toBeTruthy();
  expect(screen.getByText(/Nunca atravesse/)).toBeTruthy();
});
