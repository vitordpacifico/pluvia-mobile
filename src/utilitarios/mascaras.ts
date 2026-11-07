export function somenteDigitos(texto: string): string {
  return texto.replace(/\D/g, '');
}

export function mascararTelefone(texto: string): string {
  const d = somenteDigitos(texto).slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function mascararCep(texto: string): string {
  const d = somenteDigitos(texto).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function mascararCentimetros(texto: string): string {
  const limpo = texto.replace(/\./g, ',').replace(/[^\d,]/g, '');
  const [inteiro = '', ...resto] = limpo.split(',');
  const parteInteira = inteiro.slice(0, 3);
  if (!limpo.includes(',')) return parteInteira;
  return `${parteInteira},${resto.join('').slice(0, 1)}`;
}

export function lerCentimetros(texto: string): number | null {
  if (!texto.trim()) return null;
  const numero = Number(texto.replace(',', '.'));
  return Number.isFinite(numero) ? numero : null;
}

export function centimetrosParaTexto(valor: number): string {
  return String(Math.round(valor * 10) / 10).replace('.', ',');
}
