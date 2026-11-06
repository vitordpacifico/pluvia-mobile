/**
 * O sensor ultrassonico fica preso acima da rua e mede a distancia ate a superficie.
 * Quanto menor a distancia, mais alta esta a agua.
 *
 *   sensor
 *     |  distancia medida
 *     v
 *   ~~~~~~ superficie da agua
 *     |  nivel da agua
 *   ______ chao
 */
export function nivelPelaDistancia(alturaInstalacaoCm: number, distanciaCm: number): number {
  return Math.max(0, alturaInstalacaoCm - distanciaCm);
}
