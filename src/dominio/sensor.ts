export function nivelPelaDistancia(alturaInstalacaoCm: number, distanciaCm: number): number {
  return Math.max(0, alturaInstalacaoCm - distanciaCm);
}
