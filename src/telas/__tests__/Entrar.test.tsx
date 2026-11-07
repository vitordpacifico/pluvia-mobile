import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AutenticacaoProvider } from '@/contexto/AutenticacaoContext';
import { lerSessao } from '@/servicos/armazenamento/sessaoServico';

import TelaEntrar from '../Entrar';

async function abrirTela() {
  await render(
    <AutenticacaoProvider>
      <TelaEntrar />
    </AutenticacaoProvider>,
  );
  await waitFor(async () => expect(await AsyncStorage.getItem('@sentinela:contas')).not.toBeNull());
}

async function entrarCom(email: string, senha: string) {
  await fireEvent.changeText(screen.getByLabelText('E-mail'), email);
  await fireEvent.changeText(screen.getByLabelText('Senha'), senha);
  await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
}

beforeEach(() => AsyncStorage.clear());

it('mostra os erros quando os campos estão vazios', async () => {
  await abrirTela();
  await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
  expect(screen.getByText('Informe seu e-mail.')).toBeTruthy();
  expect(screen.getByText('Informe sua senha.')).toBeTruthy();
});

it('recusa a senha errada sem dizer qual campo errou', async () => {
  await abrirTela();
  await entrarCom('cidadao@sentinela.demo', 'Errada123');
  expect(await screen.findByText('E-mail ou senha incorretos.')).toBeTruthy();
  expect(await lerSessao()).toBeNull();
});

it('bloqueia o login depois de 5 senhas erradas seguidas', async () => {
  await abrirTela();
  for (let i = 0; i < 5; i++) {
    await entrarCom('cidadao@sentinela.demo', 'Errada123');
    await screen.findByText('E-mail ou senha incorretos.');
  }
  await entrarCom('cidadao@sentinela.demo', 'Cidadao123');
  expect(await screen.findByText(/Muitas tentativas/)).toBeTruthy();
  expect(await lerSessao()).toBeNull();
});

it('preenche a conta de demonstração do agente e entra', async () => {
  await abrirTela();
  await fireEvent.press(screen.getByRole('button', { name: 'Usar conta de agente' }));
  expect(screen.getByLabelText('E-mail').props.value).toBe('agente@sentinela.demo');
  await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
  await waitFor(async () => expect(await lerSessao()).not.toBeNull());
});
