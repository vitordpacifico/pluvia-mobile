/** Mascaras aplicadas enquanto a pessoa digita. Todas aceitam texto colado com outros caracteres. */

export function somenteDigitos(texto: string): string {
  return texto.replace(/\D/g, '');
}

/** (11) 91234-5678 para celular e (11) 1234-5678 para fixo. */
export function mascararTelefone(texto: string): string {
  const d = somenteDigitos(texto).slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** 01001-000 */
export function mascararCep(texto: string): string {
  const d = somenteDigitos(texto).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/** Ate 3 digitos inteiros e 1 casa decimal, com virgula: 12,5 */
export function mascararCentimetros(texto: string): string {
  const limpo = texto.replace(/\./g, ',').replace(/[^\d,]/g, '');
  const [inteiro = '', ...resto] = limpo.split(',');
  const parteInteira = inteiro.slice(0, 3);
  if (!limpo.includes(',')) return parteInteira;
  return `${parteInteira},${resto.join('').slice(0, 1)}`;
}

/** Converte o texto da mascara de centimetros em numero. Vazio ou invalido vira null. */
export function lerCentimetros(texto: string): number | null {
  if (!texto.trim()) return null;
  const numero = Number(texto.replace(',', '.'));
  return Number.isFinite(numero) ? numero : null;
}

/** 12,5 */
export function centimetrosParaTexto(valor: number): string {
  return String(Math.round(valor * 10) / 10).replace('.', ',');
}
