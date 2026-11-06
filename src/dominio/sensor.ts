/**
 * O sensor ultrassônico fica preso acima da rua e mede a distância até a superfície.
 * Quanto menor a distância, mais alta está a água.
 *
 *   sensor
 *     |  distância medida
 *     v
 *   ~~~~~~ superfície da água
 *     |  nível da água
 *   ______ chão
 */
export function nivelPelaDistancia(alturaInstalacaoCm: number, distanciaCm: number): number {
  return Math.max(0, alturaInstalacaoCm - distanciaCm);
}
