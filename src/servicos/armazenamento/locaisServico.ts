import * as Crypto from 'expo-crypto';

import { ehRaioMonitoramento } from '@/dominio/geo';
import { MAXIMO_LOCAIS, type LocalMonitorado } from '@/dominio/local';

import { CHAVES_COFRE, apagarDoCofre, guardarNoCofre, lerDoCofre } from './cofre';

export class ErroLocal extends Error {}

export type DadosLocal = Omit<LocalMonitorado, 'id' | 'criadoEm'>;

function ehLocal(valor: unknown): valor is LocalMonitorado {
  if (typeof valor !== 'object' || valor === null) return false;
  const local = valor as Record<string, unknown>;
  const ponto = local.local as Record<string, unknown> | undefined;
  return (
    typeof local.id === 'string' &&
    (local.tipo === 'CARRO' || local.tipo === 'FAVORITO') &&
    typeof local.nome === 'string' &&
    typeof ponto?.latitude === 'number' &&
    typeof ponto?.longitude === 'number' &&
    ehRaioMonitoramento(local.raioM)
  );
}

export async function listarLocais(usuarioId: string): Promise<LocalMonitorado[]> {
  const salvos = await lerDoCofre<unknown>(CHAVES_COFRE.locais(usuarioId), []);
  return Array.isArray(salvos) ? salvos.filter(ehLocal) : [];
}

async function gravar(usuarioId: string, locais: LocalMonitorado[]): Promise<void> {
  await guardarNoCofre(CHAVES_COFRE.locais(usuarioId), locais);
}

export async function salvarCarro(usuarioId: string, dados: Omit<DadosLocal, 'tipo'>): Promise<LocalMonitorado> {
  const locais = await listarLocais(usuarioId);
  const anterior = locais.find((l) => l.tipo === 'CARRO');
  const carro: LocalMonitorado = {
    ...dados,
    tipo: 'CARRO',
    id: anterior?.id ?? Crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
  };
  await gravar(usuarioId, [carro, ...locais.filter((l) => l.tipo !== 'CARRO')]);
  return carro;
}

export async function adicionarFavorito(
  usuarioId: string,
  dados: Omit<DadosLocal, 'tipo'>,
): Promise<LocalMonitorado> {
  const locais = await listarLocais(usuarioId);
  if (locais.filter((l) => l.tipo === 'FAVORITO').length >= MAXIMO_LOCAIS) {
    throw new ErroLocal(`Você pode acompanhar até ${MAXIMO_LOCAIS} locais favoritos.`);
  }
  const favorito: LocalMonitorado = {
    ...dados,
    tipo: 'FAVORITO',
    id: Crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
  };
  await gravar(usuarioId, [...locais, favorito]);
  return favorito;
}

export async function removerLocal(usuarioId: string, localId: string): Promise<void> {
  const locais = await listarLocais(usuarioId);
  await gravar(
    usuarioId,
    locais.filter((l) => l.id !== localId),
  );
}

export async function apagarLocais(usuarioId: string): Promise<void> {
  await apagarDoCofre(CHAVES_COFRE.locais(usuarioId));
}
