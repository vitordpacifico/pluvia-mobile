import AsyncStorage from '@react-native-async-storage/async-storage';

import { CHAVES } from '../armazenamento';
import { encerrarSessao, iniciarSessao, lerSessao } from '../sessaoServico';
import {
  atualizarCidadao,
  autenticar,
  cadastrarCidadao,
  CONTAS_DEMONSTRACAO,
  ErroCadastro,
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

it('cadastra um cidadao com e-mail normalizado', async () => {
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

it('nao devolve o hash nem o sal para as telas', async () => {
  const usuario = await cadastrarCidadao(DADOS);
  expect(usuario).not.toHaveProperty('senhaHash');
  expect(usuario).not.toHaveProperty('sal');
});

it('recusa e-mail repetido, sem diferenciar maiusculas', async () => {
  await cadastrarCidadao(DADOS);
  await expect(cadastrarCidadao({ ...DADOS, email: 'ANA@email.com' })).rejects.toThrow(ErroCadastro);
});

it('autentica so com a senha correta', async () => {
  await cadastrarCidadao(DADOS);
  expect(await autenticar('ana@email.com', 'Senha123')).toMatchObject({ nome: 'Ana Souza' });
  expect(await autenticar('ana@email.com', 'Senha124')).toBeNull();
  expect(await autenticar('outra@email.com', 'Senha123')).toBeNull();
});

it('cria as contas de demonstracao uma unica vez', async () => {
  await garantirContasDemonstracao();
  await garantirContasDemonstracao();
  const contas = JSON.parse((await AsyncStorage.getItem(CHAVES.contas)) ?? '[]');
  expect(contas).toHaveLength(CONTAS_DEMONSTRACAO.length);
  const agente = await autenticar('agente@sentinela.demo', 'Agente123');
  expect(agente?.perfil).toBe('agente');
});

it('atualiza os dados do cidadao', async () => {
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

it('guarda e encerra a sessao', async () => {
  await iniciarSessao('u1');
  expect((await lerSessao())?.usuarioId).toBe('u1');
  await encerrarSessao();
  expect(await lerSessao()).toBeNull();
});
