function doisDigitos(valor: number): string {
  return String(valor).padStart(2, '0');
}

export function formatarHora(iso: string): string {
  const data = new Date(iso);
  return `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}:${doisDigitos(data.getSeconds())}`;
}

export function formatarDataHora(iso: string): string {
  const data = new Date(iso);
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)} ${doisDigitos(
    data.getHours(),
  )}:${doisDigitos(data.getMinutes())}`;
}

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

export function formatarHoraCurta(iso: string): string {
  const data = new Date(iso);
  return `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
}

export function formatarHaQuanto(iso: string, agora = Date.now()): string {
  const minutos = Math.max(0, Math.round((agora - Date.parse(iso)) / 60_000));
  if (minutos < 1) return 'agora mesmo';
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  return `há ${Math.floor(horas / 24)} dia(s)`;
}
