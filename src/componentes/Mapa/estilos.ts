import { StyleSheet } from 'react-native';

import type { FaixaRisco } from '@/dominio/riscoEstimado';
import { cores, raio } from '@/estilos/tema';

export const COR_AREA_RISCO: Record<FaixaRisco, string> = {
  BAIXO: 'rgba(46, 125, 50, 0.10)',
  MODERADO: 'rgba(230, 160, 0, 0.16)',
  ELEVADO: 'rgba(200, 60, 0, 0.22)',
};

export const estilos = StyleSheet.create({
  moldura: {
    height: 320,
    borderRadius: raio.g,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  mapa: { flex: 1 },
  marcadorLocal: {
    backgroundColor: cores.primaria,
    borderRadius: 999,
    padding: 6,
    borderWidth: 2,
    borderColor: cores.textoSobrePrimaria,
  },
  semMapa: { height: 120, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 },
  textoSemMapa: { fontSize: 15, color: cores.textoSecundario, textAlign: 'center' },
});
