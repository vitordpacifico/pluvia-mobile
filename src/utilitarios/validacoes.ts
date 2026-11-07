import { somenteDigitos } from './mascaras';

export type Validacao = string | null;

export const SENHA_TAMANHO_MINIMO = 8;
export const LIMITE_MINIMO_CM = 1;
export const LIMITE_MAXIMO_CM = 300;

export function validarNome(nome: string): Validacao {
  const limpo = nome.trim();
  if (!limpo) return 'Informe seu nome.';
  if (limpo.length < 2) return 'O nome precisa ter pelo menos 2 letras.';
  if (limpo.length > 60) return 'O nome pode ter no máximo 60 caracteres.';
  if (!/^[\p{L}][\p{L} '.-]*$/u.test(limpo)) return 'Use apenas letras no nome.';
  return null;
}

export function validarEmail(email: string): Validacao {
  const limpo = email.trim();
  if (!limpo) return 'Informe seu e-mail.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(limpo)) return 'E-mail inválido. Exemplo: nome@email.com';
  return null;
}

export function validarTelefone(telefone: string): Validacao {
  const d = somenteDigitos(telefone);
  if (!d) return 'Informe seu telefone.';
  if (d.length !== 10 && d.length !== 11) return 'Telefone incompleto. Use DDD e número.';
  if (d[0] === '0') return 'DDD inválido.';
  if (d.length === 11 && d[2] !== '9') return 'Celular deve começar com 9 depois do DDD.';
  return null;
}

export function validarCep(cep: string): Validacao {
  const d = somenteDigitos(cep);
  if (!d) return 'Informe seu CEP.';
  if (d.length !== 8) return 'O CEP tem 8 números.';
  if (/^0+$/.test(d)) return 'CEP inválido.';
  return null;
}

export function validarSenha(senha: string): Validacao {
  if (!senha) return 'Crie uma senha.';
  if (senha.length < SENHA_TAMANHO_MINIMO) {
    return `A senha precisa ter pelo menos ${SENHA_TAMANHO_MINIMO} caracteres.`;
  }
  if (!/\p{L}/u.test(senha) || !/\d/.test(senha)) return 'Use letras e números na senha.';
  return null;
}

export function validarConfirmacaoSenha(senha: string, confirmacao: string): Validacao {
  if (!confirmacao) return 'Repita a senha.';
  if (senha !== confirmacao) return 'As senhas não são iguais.';
  return null;
}

export function validarObrigatorio(valor: string, mensagem: string): Validacao {
  return valor.trim() ? null : mensagem;
}

interface LimitesDigitados {
  atencaoCm: number | null;
  alertaCm: number | null;
  evacuacaoCm: number | null;
}

function validarLimite(valor: number | null): Validacao {
  if (valor === null) return 'Informe um valor.';
  if (valor < LIMITE_MINIMO_CM || valor > LIMITE_MAXIMO_CM) {
    return `Use um valor entre ${LIMITE_MINIMO_CM} e ${LIMITE_MAXIMO_CM} cm.`;
  }
  return null;
}

export function validarLimites(limites: LimitesDigitados): Record<keyof LimitesDigitados, Validacao> {
  const erros = {
    atencaoCm: validarLimite(limites.atencaoCm),
    alertaCm: validarLimite(limites.alertaCm),
    evacuacaoCm: validarLimite(limites.evacuacaoCm),
  };
  const { atencaoCm, alertaCm, evacuacaoCm } = limites;
  if (!erros.alertaCm && atencaoCm !== null && alertaCm !== null && alertaCm <= atencaoCm) {
    erros.alertaCm = 'Precisa ser maior que o limite de Atenção.';
  }
  if (!erros.evacuacaoCm && alertaCm !== null && evacuacaoCm !== null && evacuacaoCm <= alertaCm) {
    erros.evacuacaoCm = 'Precisa ser maior que o limite de Alerta.';
  }
  return erros;
}

export function semErros(erros: Record<string, Validacao>): boolean {
  return Object.values(erros).every((erro) => erro === null);
}
