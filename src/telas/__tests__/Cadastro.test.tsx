import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AutenticacaoProvider } from '@/contexto/AutenticacaoContext';
import { lerSessao } from '@/servicos/armazenamento/sessaoServico';
import { autenticar } from '@/servicos/armazenamento/usuariosServico';

import TelaCadastro from '../Cadastro';

jest.mock('@/servicos/alertas/notificacoes', () => ({
  pedirPermissaoDeNotificacao: jest.fn(async () => true),
}));

async function abrirTela() {
  await render(
    <AutenticacaoProvider>
      <TelaCadastro />
    </AutenticacaoProvider>,
  );
}

async function preencher(campos: Record<string, string>) {
  for (const [rotulo, valor] of Object.entries(campos)) {
    await fireEvent.changeText(screen.getByLabelText(rotulo), valor);
  }
}

const VALIDOS = {
  Nome: 'Ana Souza',
  'E-mail': 'ana@email.com',
  Celular: '11987654321',
  CEP: '01310100',
  Senha: 'Senha1234',
  'Repita a senha': 'Senha1234',
};

beforeEach(() => AsyncStorage.clear());

it('aplica as máscaras de celular e CEP', async () => {
  await abrirTela();
  await preencher({ Celular: '11987654321', CEP: '01310100' });
  expect(screen.getByLabelText('Celular').props.value).toBe('(11) 98765-4321');
  expect(screen.getByLabelText('CEP').props.value).toBe('01310-100');
});

it('mostra um erro em cada campo inválido', async () => {
  await abrirTela();
  await preencher({ Nome: 'A', 'E-mail': 'ana@', Celular: '1198', CEP: '0131', Senha: 'curta' });
  await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));

  expect(screen.getByText('O nome precisa ter pelo menos 2 letras.')).toBeTruthy();
  expect(screen.getByText(/E-mail inválido/)).toBeTruthy();
  expect(screen.getByText('Telefone incompleto. Use DDD e número.')).toBeTruthy();
  expect(screen.getByText('O CEP tem 8 números.')).toBeTruthy();
  expect(screen.getByText('A senha precisa ter pelo menos 8 caracteres.')).toBeTruthy();
  expect(screen.getByText('Repita a senha.')).toBeTruthy();
  expect(screen.getByText('É preciso concordar para receber os avisos.')).toBeTruthy();
  expect(await lerSessao()).toBeNull();
});

it('cria a conta e já deixa a pessoa logada', async () => {
  await abrirTela();
  await preencher(VALIDOS);
  await fireEvent.press(screen.getByRole('checkbox'));
  await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));

  await waitFor(async () => expect(await lerSessao()).not.toBeNull());
  expect(await autenticar('ana@email.com', 'Senha1234')).toMatchObject({
    telefone: '(11) 98765-4321',
    cep: '01310-100',
  });
});

it('avisa quando o e-mail já está cadastrado', async () => {
  await abrirTela();
  await waitFor(async () => expect(await AsyncStorage.getItem('@pluvia:contas')).not.toBeNull());
  await preencher({ ...VALIDOS, 'E-mail': 'cidadao@pluvia.demo' });
  await fireEvent.press(screen.getByRole('checkbox'));
  await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));
  expect(await screen.findByText('Este e-mail já está cadastrado.')).toBeTruthy();
});
