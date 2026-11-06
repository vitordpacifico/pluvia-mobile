function doisDigitos(valor: number): string {
  return String(valor).padStart(2, '0');
}

/** 14:05:09 */
export function formatarHora(iso: string): string {
  const data = new Date(iso);
  return `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}:${doisDigitos(data.getSeconds())}`;
}

/** 05/11 14:05 */
export function formatarDataHora(iso: string): string {
  const data = new Date(iso);
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)} ${doisDigitos(
    data.getHours(),
  )}:${doisDigitos(data.getMinutes())}`;
}

/** 45 segundos | 3 min 20 s | 2 h 5 min */
export function formatarDuracao(ms: number): string {
  const segundos = Math.max(0, Math.round(ms / 1000));
  if (segundos < 60) return `${segundos} segundos`;
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `${minutos} min ${segundos % 60} s`;
  return `${Math.floor(minutos / 60)} h ${minutos % 60} min`;
}

export function formatarCm(valor: number): string {
  return `${valor.toFixed(1).replace('.', ',')} cm`;
}
