import * as Crypto from 'expo-crypto';

import type { TipoCidadao, Usuario } from '@/dominio/usuario';
import { calcularHashSenha, gerarSal, senhaConfere } from '@/servicos/seguranca/senha';

import { atualizarLista, CHAVES, lerLista } from './armazenamento';

/** Conta como fica salva: os dados do usuario mais o sal e o hash da senha. */
interface ContaSalva extends Usuario {
  sal: string;
  senhaHash: string;
}

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

/**
 * Contas criadas no primeiro uso para a demonstracao, listadas no README.
 * Agentes nao se cadastram pelo app: o acesso viria do orgao responsavel.
 */
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

function paraUsuario(conta: ContaSalva): Usuario {
  const { sal: _sal, senhaHash: _hash, ...usuario } = conta;
  return usuario;
}

async function montarConta(dados: Omit<Usuario, 'id' | 'criadoEm'>, senha: string): Promise<ContaSalva> {
  const sal = gerarSal();
  return {
    ...dados,
    id: Crypto.randomUUID(),
    email: normalizarEmail(dados.email),
    criadoEm: new Date().toISOString(),
    sal,
    senhaHash: await calcularHashSenha(senha, sal),
  };
}

export async function garantirContasDemonstracao(): Promise<void> {
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

/** Devolve o usuario se o e-mail e a senha conferirem. Caso contrario, null. */
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
  const contas = await atualizarLista<ContaSalva>(CHAVES.contas, (atuais) =>
    atuais.map((c) => (c.id === id ? { ...c, ...dados, nome: dados.nome.trim() } : c)),
  );
  const conta = contas.find((c) => c.id === id);
  if (!conta) throw new ErroCadastro('Conta não encontrada.');
  return paraUsuario(conta);
}
