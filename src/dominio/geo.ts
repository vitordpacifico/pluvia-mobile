export interface Coordenada {
  latitude: number;
  longitude: number;
}

const RAIO_TERRA_M = 6_371_000;

function radianos(graus: number): number {
  return (graus * Math.PI) / 180;
}

export function distanciaMetros(a: Coordenada, b: Coordenada): number {
  const dLat = radianos(b.latitude - a.latitude);
  const dLon = radianos(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radianos(a.latitude)) * Math.cos(radianos(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * RAIO_TERRA_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function dentroDoRaio(centro: Coordenada, ponto: Coordenada, raioM: number): boolean {
  return distanciaMetros(centro, ponto) <= raioM;
}

export function formatarDistancia(metros: number): string {
  if (metros < 1000) return `${Math.max(10, Math.round(metros / 10) * 10)} m`;
  return `${(metros / 1000).toFixed(1).replace('.', ',')} km`;
}

export const RAIOS_MONITORAMENTO = [300, 500, 1000, 2000] as const;

export type RaioMonitoramento = (typeof RAIOS_MONITORAMENTO)[number];

export function ehRaioMonitoramento(valor: unknown): valor is RaioMonitoramento {
  return (RAIOS_MONITORAMENTO as readonly unknown[]).includes(valor);
}

export interface Bairro {
  nome: string;
  centro: Coordenada;
}

export const BAIRROS: readonly Bairro[] = [
  { nome: 'Ipiranga', centro: { latitude: -23.5869, longitude: -46.6094 } },
  { nome: 'Cambuci', centro: { latitude: -23.5658, longitude: -46.6213 } },
  { nome: 'Mooca', centro: { latitude: -23.5599, longitude: -46.5996 } },
  { nome: 'Vila Prudente', centro: { latitude: -23.5826, longitude: -46.5828 } },
  { nome: 'Sacomã', centro: { latitude: -23.6013, longitude: -46.6017 } },
  { nome: 'Aclimação', centro: { latitude: -23.5728, longitude: -46.6315 } },
  { nome: 'Liberdade', centro: { latitude: -23.5587, longitude: -46.6347 } },
  { nome: 'Vila Mariana', centro: { latitude: -23.5893, longitude: -46.6345 } },
  { nome: 'Brás', centro: { latitude: -23.5432, longitude: -46.6154 } },
  { nome: 'Sé', centro: { latitude: -23.5503, longitude: -46.6339 } },
];

export const CENTRO_PADRAO: Coordenada = BAIRROS[0].centro;

function semAcento(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function buscarBairros(termo: string): Bairro[] {
  const busca = semAcento(termo);
  if (!busca) return [...BAIRROS];
  return BAIRROS.filter((bairro) => semAcento(bairro.nome).includes(busca));
}

export function bairroMaisProximo(ponto: Coordenada): Bairro {
  return BAIRROS.reduce((melhor, bairro) =>
    distanciaMetros(ponto, bairro.centro) < distanciaMetros(ponto, melhor.centro) ? bairro : melhor,
  );
}
