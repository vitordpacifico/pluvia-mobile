import * as Crypto from 'expo-crypto';

import type { TipoCidadao, Usuario } from '@/dominio/usuario';
import { calcularHashSenha, gerarSal, senhaConfere } from '@/servicos/seguranca/senha';

import { atualizarLista, CHAVES, lerLista, remover } from './armazenamento';
import { apagarProtegido, guardarProtegido, lerProtegido, type DadosProtegidos } from './cofre';

interface ContaSalva extends Omit<Usuario, keyof DadosProtegidos> {
  sal: string;
  senhaHash: string;
}

type ContaAntiga = ContaSalva & DadosProtegidos;

export interface DadosCadastroCidadao {
  nome: string;
  email: string;
  telefone: string;
  cep: string;
  tipoCidadao: TipoCidadao;
  senha: string;
}

export interface DadosAtualizacaoCidadao {
  nome: string;
  telefone: string;
  cep: string;
  tipoCidadao: TipoCidadao;
}

export class ErroCadastro extends Error {}

export const CONTAS_DEMONSTRACAO = [
  {
    nome: 'Cidadã de demonstração',
    email: 'cidadao@sentinela.demo',
    senha: 'Cidadao123',
    perfil: 'cidadao',
    telefone: '(11) 91234-5678',
    cep: '01001-000',
    tipoCidadao: 'comerciante',
  },
  {
    nome: 'Agente de demonstração',
    email: 'agente@sentinela.demo',
    senha: 'Agente123',
    perfil: 'agente',
    orgao: 'Defesa Civil (demonstração)',
  },
] as const;

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function paraUsuario(conta: ContaSalva): Promise<Usuario> {
  const { sal: _sal, senhaHash: _hash, ...usuario } = conta;
  if (usuario.perfil !== 'cidadao') return usuario;
  return { ...usuario, ...(await lerProtegido(conta.id)) };
}

function separarProtegidos<T extends DadosProtegidos>(dados: T): [Omit<T, keyof DadosProtegidos>, DadosProtegidos] {
  const { telefone, cep, ...resto } = dados;
  const protegidos: DadosProtegidos = {};
  if (telefone !== undefined) protegidos.telefone = telefone;
  if (cep !== undefined) protegidos.cep = cep;
  return [resto, protegidos];
}

async function montarConta(dados: Omit<Usuario, 'id' | 'criadoEm'>, senha: string): Promise<ContaSalva> {
  const [publicos, protegidos] = separarProtegidos(dados);
  const sal = gerarSal();
  const conta: ContaSalva = {
    ...publicos,
    id: Crypto.randomUUID(),
    email: normalizarEmail(dados.email),
    criadoEm: new Date().toISOString(),
    sal,
    senhaHash: await calcularHashSenha(senha, sal),
  };
  if (Object.keys(protegidos).length > 0) await guardarProtegido(conta.id, protegidos);
  return conta;
}

async function migrarContasAntigas(): Promise<void> {
  const contas = await lerLista<ContaAntiga>(CHAVES.contas);
  const antigas = contas.filter((conta) => conta.telefone !== undefined || conta.cep !== undefined);
  if (antigas.length === 0) return;

  for (const conta of antigas) {
    await guardarProtegido(conta.id, separarProtegidos(conta)[1]);
  }
  await atualizarLista<ContaAntiga>(CHAVES.contas, (atuais) =>
    atuais.map((conta) => separarProtegidos(conta)[0]),
  );
}

export async function garantirContasDemonstracao(): Promise<void> {
  await migrarContasAntigas();
  const existentes = await lerLista<ContaSalva>(CHAVES.contas);
  const faltando = CONTAS_DEMONSTRACAO.filter(
    (demo) => !existentes.some((conta) => conta.email === demo.email),
  );
  if (faltando.length === 0) return;

  const novas = await Promise.all(
    faltando.map(({ senha, ...dados }) => montarConta({ ...dados }, senha)),
  );
  await atualizarLista<ContaSalva>(CHAVES.contas, (contas) => [...contas, ...novas]);
}

export async function cadastrarCidadao(dados: DadosCadastroCidadao): Promise<Usuario> {
  const email = normalizarEmail(dados.email);
  const contas = await lerLista<ContaSalva>(CHAVES.contas);
  if (contas.some((conta) => conta.email === email)) {
    throw new ErroCadastro('Este e-mail já está cadastrado.');
  }

  const conta = await montarConta(
    {
      nome: dados.nome.trim(),
      email,
      perfil: 'cidadao',
      telefone: dados.telefone,
      cep: dados.cep,
      tipoCidadao: dados.tipoCidadao,
    },
    dados.senha,
  );
  await atualizarLista<ContaSalva>(CHAVES.contas, (atuais) => [...atuais, conta]);
  return paraUsuario(conta);
}

export async function autenticar(email: string, senha: string): Promise<Usuario | null> {
  const contas = await lerLista<ContaSalva>(CHAVES.contas);
  const conta = contas.find((c) => c.email === normalizarEmail(email));
  if (!conta) return null;
  return (await senhaConfere(senha, conta.sal, conta.senhaHash)) ? paraUsuario(conta) : null;
}

export async function obterUsuario(id: string): Promise<Usuario | null> {
  const contas = await lerLista<ContaSalva>(CHAVES.contas);
  const conta = contas.find((c) => c.id === id);
  return conta ? paraUsuario(conta) : null;
}

export async function atualizarCidadao(
  id: string,
  dados: DadosAtualizacaoCidadao,
): Promise<Usuario> {
  const publicos = { nome: dados.nome.trim(), tipoCidadao: dados.tipoCidadao };
  const protegidos: DadosProtegidos = { telefone: dados.telefone, cep: dados.cep };
  const existentes = await lerLista<ContaSalva>(CHAVES.contas);
  if (!existentes.some((c) => c.id === id)) throw new ErroCadastro('Conta não encontrada.');

  await guardarProtegido(id, protegidos);
  const contas = await atualizarLista<ContaSalva>(CHAVES.contas, (atuais) =>
    atuais.map((c) => (c.id === id ? { ...c, ...publicos } : c)),
  );
  const conta = contas.find((c) => c.id === id);
  if (!conta) throw new ErroCadastro('Conta não encontrada.');
  return paraUsuario(conta);
}

export async function excluirConta(id: string): Promise<void> {
  await atualizarLista<ContaSalva>(CHAVES.contas, (contas) => contas.filter((c) => c.id !== id));
  await Promise.all([
    apagarProtegido(id),
    remover(CHAVES.pontosSeguidos(id)),
    remover(CHAVES.alertas(id)),
  ]);
}
