import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AutenticacaoProvider } from '@/contexto/AutenticacaoContext';
import { LocaisProvider } from '@/contexto/LocaisContext';
import { registrarAvisos } from '@/servicos/armazenamento/avisosServico';
import { CHAVES } from '@/servicos/armazenamento/armazenamento';
import { listarLocais, salvarCarro } from '@/servicos/armazenamento/locaisServico';
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
    tipoCidadao: 'motorista',
    senha: 'Senha1234',
  });
  usuarioId = usuario.id;
  await iniciarSessao(usuario.id);
  await registrarAvisos(usuario.id, [
    {
      tipo: 'NOVO',
      chave: 'NOVO:o1',
      titulo: 'Alagamento perto de Meu carro',
      texto: 'Texto',
      ocorrenciaId: 'o1',
      localId: 'carro',
      detectadoEm: '2026-11-07T14:00:00Z',
      recebidoEm: '2026-11-07T14:00:11Z',
    },
  ]);
  await salvarCarro(usuario.id, {
    nome: 'Meu carro',
    bairro: 'Cambuci',
    referencia: 'Rua Lavapés',
    local: { latitude: -23.5679, longitude: -46.6178 },
    raioM: 500,
  });
  await render(
    <AutenticacaoProvider>
      <LocaisProvider>
        <TelaPerfil />
      </LocaisProvider>
    </AutenticacaoProvider>,
  );
  await screen.findByRole('button', { name: 'Excluir minha conta' });
});

it('mostra as áreas monitoradas', async () => {
  expect(await screen.findByText('1 local(is): Meu carro.')).toBeTruthy();
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

it('exclui a conta, o carro, os avisos e encerra a sessão', async () => {
  await fireEvent.press(screen.getByRole('button', { name: 'Excluir minha conta' }));
  await fireEvent.changeText(screen.getByLabelText('Sua senha'), 'Senha1234');
  await fireEvent.press(screen.getByRole('button', { name: 'Confirmar exclusão' }));

  await waitFor(async () => expect(await obterUsuario(usuarioId)).toBeNull());
  expect(await lerSessao()).toBeNull();
  expect(await AsyncStorage.getItem(CHAVES.avisos(usuarioId))).toBeNull();
  expect(await listarLocais(usuarioId)).toEqual([]);
});
