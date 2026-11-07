export type PerfilUsuario = 'cidadao' | 'agente';

export type TipoCidadao = 'morador' | 'comerciante';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  criadoEm: string;
  telefone?: string;
  cep?: string;
  tipoCidadao?: TipoCidadao;
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
