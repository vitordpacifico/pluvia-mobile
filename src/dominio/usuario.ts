/**
 * Perfis do app:
 * - cidadão: morador ou comerciante. Acompanha pontos e recebe alertas.
 * - agente: Defesa Civil. Vê o painel de todos os pontos e ajusta os limites de risco.
 */
export type PerfilUsuario = 'cidadao' | 'agente';

export type TipoCidadao = 'morador' | 'comerciante';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  criadoEm: string;
  /** Só para cidadão. */
  telefone?: string;
  cep?: string;
  tipoCidadao?: TipoCidadao;
  /** Só para agente. */
  orgao?: string;
}

export function ehAgente(usuario: Usuario | null): boolean {
  return usuario?.perfil === 'agente';
}

export function ehCidadao(usuario: Usuario | null): boolean {
  return usuario?.perfil === 'cidadao';
}

export const ROTULO_PERFIL: Record<PerfilUsuario, string> = {
  cidadao: 'Cidadão',
  agente: 'Agente da Defesa Civil',
};

export const ROTULO_TIPO_CIDADAO: Record<TipoCidadao, string> = {
  morador: 'Morador',
  comerciante: 'Comerciante',
};

export const OPCOES_TIPO_CIDADAO: { valor: TipoCidadao; rotulo: string; descricao: string }[] = [
  { valor: 'morador', rotulo: 'Morador', descricao: 'Moro perto de um ponto de alagamento' },
  { valor: 'comerciante', rotulo: 'Comerciante', descricao: 'Tenho comércio perto de um ponto' },
];
