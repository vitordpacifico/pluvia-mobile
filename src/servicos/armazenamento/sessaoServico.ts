import { CHAVES, lerJSON, remover, salvarJSON } from './armazenamento';

interface Sessao {
  usuarioId: string;
  iniciadaEm: string;
}

export async function iniciarSessao(usuarioId: string): Promise<void> {
  await salvarJSON(CHAVES.sessao, { usuarioId, iniciadaEm: new Date().toISOString() });
}

export async function lerSessao(): Promise<Sessao | null> {
  const sessao = await lerJSON<Sessao | null>(CHAVES.sessao, null);
  return sessao && typeof sessao.usuarioId === 'string' ? sessao : null;
}

export async function encerrarSessao(): Promise<void> {
  await remover(CHAVES.sessao);
}
