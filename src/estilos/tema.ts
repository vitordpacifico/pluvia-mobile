/** Cores com contraste minimo de 4.5:1 entre texto e fundo (WCAG AA). */
export const cores = {
  fundo: '#F4F6F8',
  superficie: '#FFFFFF',
  texto: '#1A1C1E',
  textoSecundario: '#454B52',
  borda: '#C4CAD0',
  primaria: '#0B4F8A',
  textoSobrePrimaria: '#FFFFFF',
  perigo: '#B00020',
  sucesso: '#1B5E20',
  avisoFundo: '#FFF4D6',
  avisoTexto: '#5C3B00',
  infoFundo: '#E3EEF9',
  infoTexto: '#0B3A66',
  erroFundo: '#FDE7EA',
  erroTexto: '#8C0019',
} as const;

export const espaco = { p: 8, m: 16, g: 24 } as const;

export const raio = { m: 10, g: 12 } as const;

/** Area minima de toque recomendada para acessibilidade. */
export const ALVO_MINIMO_TOQUE = 48;
