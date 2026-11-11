export const cores = {
  fundo: '#F3F5FA',
  superficie: '#FFFFFF',
  superficieSuave: '#EEF2F9',
  texto: '#111827',
  textoSecundario: '#3F4855',
  borda: '#D9E0EC',
  primaria: '#012AD0',
  primariaSuave: '#E8EEFF',
  destaque: '#5BC4F8',
  textoSobrePrimaria: '#FFFFFF',
  perigo: '#B00020',
  perigoSuave: '#FDECEE',
  sucesso: '#1B5E20',
  sucessoSuave: '#E8F5E9',
  avisoFundo: '#FFF6DE',
  avisoTexto: '#5C3B00',
  infoFundo: '#E8EEFF',
  infoTexto: '#0B2A80',
  erroFundo: '#FDECEE',
  erroTexto: '#8C0019',
} as const;

export const sombra = { boxShadow: '0 6px 20px rgba(17, 24, 39, 0.08)' } as const;

export const sombraLeve = { boxShadow: '0 2px 10px rgba(17, 24, 39, 0.06)' } as const;

export const espaco = { p: 8, m: 16, g: 24 } as const;

export const raio = { p: 10, m: 14, g: 20 } as const;

export const ALVO_MINIMO_TOQUE = 48;
