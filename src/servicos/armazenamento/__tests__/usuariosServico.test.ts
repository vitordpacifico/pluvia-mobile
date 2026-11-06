import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { CHAVES } from '../armazenamento';
import { encerrarSessao, iniciarSessao, lerSessao } from '../sessaoServico';
import {
  atualizarCidadao,
  autenticar,
  cadastrarCidadao,
  CONTAS_DEMONSTRACAO,
  ErroCadastro,
  excluirConta,
  garantirContasDemonstracao,
  obterUsuario,
} from '../usuariosServico';

const DADOS = {
  nome: 'Ana Souza',
  email: 'Ana@Email.com ',
  telefone: '(11) 91234-5678',
  cep: '01001-000',
  tipoCidadao: 'morador' as const,
  senha: 'Senha123',
};

beforeEach(() => AsyncStorage.clear());

it('cadastra um cidadão com e-mail normalizado', async () => {
  const usuario = await cadastrarCidadao(DADOS);
  expect(usuario).toMatchObject({ nome: 'Ana Souza', email: 'ana@email.com', perfil: 'cidadao' });
  expect(await obterUsuario(usuario.id)).toEqual(usuario);
});

it('nunca guarda a senha em texto', async () => {
  await cadastrarCidadao(DADOS);
  const salvo = (await AsyncStorage.getItem(CHAVES.contas)) ?? '';
  expect(salvo).not.toContain('Senha123');
  expect(salvo).toContain('senhaHash');
});

it('não devolve o hash nem o sal para as telas', async () => {
  const usuario = await cadastrarCidadao(DADOS);
  expect(usuario).not.toHaveProperty('senhaHash');
  expect(usuario).not.toHaveProperty('sal');
});

it('recusa e-mail repetido, sem diferenciar maiúsculas', async () => {
  await cadastrarCidadao(DADOS);
  await expect(cadastrarCidadao({ ...DADOS, email: 'ANA@email.com' })).rejects.toThrow(ErroCadastro);
});

it('autentica só com a senha correta', async () => {
  await cadastrarCidadao(DADOS);
  expect(await autenticar('ana@email.com', 'Senha123')).toMatchObject({ nome: 'Ana Souza' });
  expect(await autenticar('ana@email.com', 'Senha124')).toBeNull();
  expect(await autenticar('outra@email.com', 'Senha123')).toBeNull();
});

it('cria as contas de demonstração uma única vez', async () => {
  await garantirContasDemonstracao();
  await garantirContasDemonstracao();
  const contas = JSON.parse((await AsyncStorage.getItem(CHAVES.contas)) ?? '[]');
  expect(contas).toHaveLength(CONTAS_DEMONSTRACAO.length);
  const agente = await autenticar('agente@sentinela.demo', 'Agente123');
  expect(agente?.perfil).toBe('agente');
});

it('atualiza os dados do cidadão', async () => {
  const usuario = await cadastrarCidadao(DADOS);
  const atualizado = await atualizarCidadao(usuario.id, {
    nome: 'Ana S.',
    telefone: '(21) 3456-7890',
    cep: '20000-000',
    tipoCidadao: 'comerciante',
  });
  expect(atualizado).toMatchObject({ nome: 'Ana S.', tipoCidadao: 'comerciante', email: 'ana@email.com' });
  expect(await autenticar('ana@email.com', 'Senha123')).not.toBeNull();
});

it('guarda e encerra a sessão', async () => {
  await iniciarSessao('u1');
  expect((await lerSessao())?.usuarioId).toBe('u1');
  await encerrarSessao();
  expect(await lerSessao()).toBeNull();
});

it('exclui a conta e os dados dela, sem mexer nas outras contas', async () => {
  const ana = await cadastrarCidadao(DADOS);
  const bia = await cadastrarCidadao({ ...DADOS, email: 'bia@email.com' });
  await AsyncStorage.setItem(CHAVES.alertas(ana.id), '[]');
  await AsyncStorage.setItem(CHAVES.pontosSeguidos(ana.id), '[]');

  await excluirConta(ana.id);

  expect(await obterUsuario(ana.id)).toBeNull();
  expect(await AsyncStorage.getItem(CHAVES.alertas(ana.id))).toBeNull();
  expect(await AsyncStorage.getItem(CHAVES.pontosSeguidos(ana.id))).toBeNull();
  expect(await obterUsuario(bia.id)).not.toBeNull();
});

describe('cofre do telefone e do CEP', () => {
  it('guarda o telefone e o CEP no cofre, nunca no AsyncStorage', async () => {
    const usuario = await cadastrarCidadao(DADOS);

    const salvo = (await AsyncStorage.getItem(CHAVES.contas)) ?? '';
    expect(salvo).not.toContain('91234-5678');
    expect(salvo).not.toContain('01001-000');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      `sentinela.protegido.${usuario.id}`,
      expect.stringContaining('91234-5678'),
      expect.objectContaining({ keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }),
    );
    expect(await obterUsuario(usuario.id)).toMatchObject({ telefone: '(11) 91234-5678', cep: '01001-000' });
  });

  it('atualiza o telefone e o CEP só no cofre', async () => {
    const usuario = await cadastrarCidadao(DADOS);
    const { email: _email, senha: _senha, ...edicao } = DADOS;
    await atualizarCidadao(usuario.id, { ...edicao, telefone: '(21) 3456-7890', cep: '20000-000' });

    expect(await AsyncStorage.getItem(CHAVES.contas)).not.toContain('3456-7890');
    expect(await autenticar('ana@email.com', 'Senha123')).toMatchObject({
      telefone: '(21) 3456-7890',
      cep: '20000-000',
    });
  });

  it('move para o cofre os dados de contas salvas antes dele', async () => {
    const usuario = await cadastrarCidadao(DADOS);
    await SecureStore.deleteItemAsync(`sentinela.protegido.${usuario.id}`);
    const contas = JSON.parse((await AsyncStorage.getItem(CHAVES.contas)) ?? '[]');
    contas[0] = { ...contas[0], telefone: '(11) 98888-7777', cep: '04000-000' };
    await AsyncStorage.setItem(CHAVES.contas, JSON.stringify(contas));

    await garantirContasDemonstracao();

    expect(await AsyncStorage.getItem(CHAVES.contas)).not.toContain('98888-7777');
    expect(await obterUsuario(usuario.id)).toMatchObject({ telefone: '(11) 98888-7777', cep: '04000-000' });
  });

  it('apaga o cofre ao excluir a conta', async () => {
    const usuario = await cadastrarCidadao(DADOS);
    await excluirConta(usuario.id);
    expect(await SecureStore.getItemAsync(`sentinela.protegido.${usuario.id}`)).toBeNull();
  });

  it('não cria cofre para o agente', async () => {
    await garantirContasDemonstracao();
    const agente = await autenticar('agente@sentinela.demo', 'Agente123');
    expect(agente).not.toHaveProperty('telefone');
    const cidada = await autenticar('cidadao@sentinela.demo', 'Cidadao123');
    expect(cidada).toMatchObject({ telefone: '(11) 91234-5678' });
  });
});
