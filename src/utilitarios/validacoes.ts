import { somenteDigitos } from './mascaras';

export type Validacao = string | null;

export const SENHA_TAMANHO_MINIMO = 8;
export const HORAS_MAXIMAS_RELATO = 6;
export const TAMANHO_MAXIMO_DESCRICAO = 200;

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

export function horaParaData(hora: string, agora: Date): Date | null {
  const encontrado = /^(\d{2}):(\d{2})$/.exec(hora);
  if (!encontrado) return null;
  const horas = Number(encontrado[1]);
  const minutos = Number(encontrado[2]);
  if (horas > 23 || minutos > 59) return null;
  const data = new Date(agora);
  data.setHours(horas, minutos, 0, 0);
  if (data.getTime() > agora.getTime() + 60_000) data.setDate(data.getDate() - 1);
  return data;
}

export function validarHoraDoRelato(hora: string, agora: Date): Validacao {
  if (!hora) return 'Informe a hora em que viu.';
  const data = horaParaData(hora, agora);
  if (!data) return 'Hora inválida. Use o formato 14:30.';
  if (agora.getTime() - data.getTime() > HORAS_MAXIMAS_RELATO * 3_600_000) {
    return `Só é possível relatar o que aconteceu nas últimas ${HORAS_MAXIMAS_RELATO} horas.`;
  }
  return null;
}

export function validarReferencia(referencia: string): Validacao {
  const limpo = referencia.trim();
  if (!limpo) return 'Informe a rua ou um ponto de referência.';
  if (limpo.length < 3) return 'Escreva pelo menos 3 letras.';
  if (limpo.length > 80) return 'Use no máximo 80 caracteres.';
  return null;
}

export function validarDescricao(descricao: string, obrigatoria: boolean): Validacao {
  const limpo = descricao.trim();
  if (obrigatoria && !limpo) return 'Descreva o que você viu.';
  if (limpo.length > TAMANHO_MAXIMO_DESCRICAO) {
    return `Use no máximo ${TAMANHO_MAXIMO_DESCRICAO} caracteres.`;
  }
  return null;
}

export function validarNomeDoLocal(nome: string): Validacao {
  const limpo = nome.trim();
  if (!limpo) return 'Dê um nome ao local.';
  if (limpo.length < 2) return 'O nome precisa ter pelo menos 2 letras.';
  if (limpo.length > 30) return 'Use no máximo 30 caracteres.';
  return null;
}

export function semErros(erros: Record<string, Validacao>): boolean {
  return Object.values(erros).every((erro) => erro === null);
}
