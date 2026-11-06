import * as Crypto from 'expo-crypto';

import type { AlertaRegistrado } from '@/dominio/tipos';

import { atualizarLista, CHAVES, lerLista } from './armazenamento';

/** Histórico de alertas de cada cidadão. Guarda os 100 mais recentes. */
const MAXIMO_ALERTAS = 100;

export async function listarAlertas(usuarioId: string): Promise<AlertaRegistrado[]> {
  const lista = await lerLista<AlertaRegistrado>(CHAVES.alertas(usuarioId));
  return [...lista].sort((a, b) => Date.parse(b.recebidoEm) - Date.parse(a.recebidoEm));
}

export async function registrarAlerta(
  usuarioId: string,
  alerta: Omit<AlertaRegistrado, 'id' | 'confirmadoEm'>,
): Promise<AlertaRegistrado> {
  const novo: AlertaRegistrado = { ...alerta, id: Crypto.randomUUID(), confirmadoEm: null };
  await atualizarLista<AlertaRegistrado>(CHAVES.alertas(usuarioId), (lista) =>
    [novo, ...lista].slice(0, MAXIMO_ALERTAS),
  );
  return novo;
}

export async function confirmarSeguranca(
  usuarioId: string,
  alertaId: string,
  confirmadoEm: string,
): Promise<void> {
  await atualizarLista<AlertaRegistrado>(CHAVES.alertas(usuarioId), (lista) =>
    lista.map((a) => (a.id === alertaId ? { ...a, confirmadoEm } : a)),
  );
}

export async function contarAlertasPendentes(usuarioId: string): Promise<number> {
  const lista = await lerLista<AlertaRegistrado>(CHAVES.alertas(usuarioId));
  return lista.filter((a) => a.confirmadoEm === null).length;
}

export async function apagarAlertas(usuarioId: string): Promise<void> {
  await atualizarLista<AlertaRegistrado>(CHAVES.alertas(usuarioId), () => []);
}
