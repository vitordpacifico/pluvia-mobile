export interface Leitura {
  nivelCm: number;
  medidoEm: string;
}

export interface Episodio {
  inicio: string;
  fim: string | null;
  picoCm: number;
}

export const LIMIAR_ALAGAMENTO_CM = 20;
export const LIMIAR_FIM_CM = 8;

export function nivelPelaDistancia(alturaInstalacaoCm: number, distanciaCm: number): number {
  return Math.max(0, alturaInstalacaoCm - distanciaCm);
}

export function detectarEpisodios(leituras: readonly Leitura[]): Episodio[] {
  const episodios: Episodio[] = [];
  let atual: Episodio | null = null;

  for (let i = 1; i < leituras.length; i++) {
    const anterior = leituras[i - 1];
    const leitura = leituras[i];
    if (!atual) {
      if (anterior.nivelCm >= LIMIAR_ALAGAMENTO_CM && leitura.nivelCm >= LIMIAR_ALAGAMENTO_CM) {
        atual = {
          inicio: anterior.medidoEm,
          fim: null,
          picoCm: Math.max(anterior.nivelCm, leitura.nivelCm),
        };
        episodios.push(atual);
      }
      continue;
    }
    atual.picoCm = Math.max(atual.picoCm, leitura.nivelCm);
    if (anterior.nivelCm < LIMIAR_FIM_CM && leitura.nivelCm < LIMIAR_FIM_CM) {
      atual.fim = leitura.medidoEm;
      atual = null;
    }
  }
  return episodios;
}

export const EXPLICACAO_CONFIRMACAO_SENSOR =
  `O sensor só registra alagamento depois de 2 leituras seguidas acima de ${LIMIAR_ALAGAMENTO_CM} cm, ` +
  `e só encerra depois de 2 leituras abaixo de ${LIMIAR_FIM_CM} cm. Isso evita alarme falso.`;
