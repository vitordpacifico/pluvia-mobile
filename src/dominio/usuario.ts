export type PerfilUsuario = 'cidadao' | 'agente';

export type TipoCidadao = 'motorista' | 'entregador' | 'pedestre' | 'morador';

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
  agente: 'Equipe de monitoramento',
};

export const ROTULO_TIPO_CIDADAO: Record<TipoCidadao, string> = {
  motorista: 'Motorista ou motociclista',
  entregador: 'Entregador',
  pedestre: 'Pedestre ou passageiro',
  morador: 'Morador de área de risco',
};

export const OPCOES_TIPO_CIDADAO: { valor: TipoCidadao; rotulo: string; descricao: string }[] = [
  { valor: 'motorista', rotulo: 'Motorista ou motociclista', descricao: 'Dirijo e estaciono na rua' },
  { valor: 'entregador', rotulo: 'Entregador', descricao: 'Circulo pela cidade a trabalho' },
  { valor: 'pedestre', rotulo: 'Pedestre ou passageiro', descricao: 'Ando a pé ou de transporte' },
  { valor: 'morador', rotulo: 'Morador de área de risco', descricao: 'Moro perto de um ponto que alaga' },
];

export function ehTipoCidadao(valor: unknown): valor is TipoCidadao {
  return typeof valor === 'string' && valor in ROTULO_TIPO_CIDADAO;
}
