import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AutenticacaoProvider } from '@/contexto/AutenticacaoContext';
import { registrarAlerta } from '@/servicos/armazenamento/alertasServico';
import { CHAVES } from '@/servicos/armazenamento/armazenamento';
import { iniciarSessao, lerSessao } from '@/servicos/armazenamento/sessaoServico';
import { cadastrarCidadao, obterUsuario } from '@/servicos/armazenamento/usuariosServico';

import TelaPerfil from '../Perfil';

jest.mock('@/servicos/alertas/notificacoes', () => ({
  notificacoesPermitidas: jest.fn(async () => true),
  pedirPermissaoDeNotificacao: jest.fn(async () => true),
}));

let usuarioId = '';

beforeEach(async () => {
  await AsyncStorage.clear();
  const usuario = await cadastrarCidadao({
    nome: 'Ana Souza',
    email: 'ana@email.com',
    telefone: '(11) 98765-4321',
    cep: '01310-100',
    tipoCidadao: 'morador',
    senha: 'Senha1234',
  });
  usuarioId = usuario.id;
  await iniciarSessao(usuario.id);
  await registrarAlerta(usuario.id, {
    pontoId: 'demo-a',
    pontoNome: 'Ponto A',
    risco: 'ALERTA',
    nivelCm: 30,
    detectadoEm: '2026-11-05T14:00:00Z',
    recebidoEm: '2026-11-05T14:00:11Z',
  });
  await render(
    <AutenticacaoProvider>
      <TelaPerfil />
    </AutenticacaoProvider>,
  );
  await screen.findByRole('button', { name: 'Excluir minha conta' });
});

it('mostra os dados do cidadão com as máscaras', async () => {
  expect(screen.getByLabelText('Celular').props.value).toBe('(11) 98765-4321');
  expect(screen.getByLabelText('CEP').props.value).toBe('01310-100');
});

it('não exclui a conta com a senha errada', async () => {
  await fireEvent.press(screen.getByRole('button', { name: 'Excluir minha conta' }));
  await fireEvent.changeText(screen.getByLabelText('Sua senha'), 'Errada123');
  await fireEvent.press(screen.getByRole('button', { name: 'Confirmar exclusão' }));
  expect(await screen.findByText('Senha incorreta.')).toBeTruthy();
  expect(await obterUsuario(usuarioId)).not.toBeNull();
});

it('exclui a conta, os alertas e encerra a sessão', async () => {
  await fireEvent.press(screen.getByRole('button', { name: 'Excluir minha conta' }));
  await fireEvent.changeText(screen.getByLabelText('Sua senha'), 'Senha1234');
  await fireEvent.press(screen.getByRole('button', { name: 'Confirmar exclusão' }));

  await waitFor(async () => expect(await obterUsuario(usuarioId)).toBeNull());
  expect(await lerSessao()).toBeNull();
  expect(await AsyncStorage.getItem(CHAVES.alertas(usuarioId))).toBeNull();
});
