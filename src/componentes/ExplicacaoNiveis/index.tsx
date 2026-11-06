import { Text, View } from 'react-native';

import { ORDEM_RISCO } from '@/dominio/risco';

import { SeloRisco } from '../SeloRisco';
import { estilos } from './estilos';

const RESUMO_NIVEL = {
  NORMAL: 'Água dentro do esperado',
  ATENCAO: 'A água começou a subir',
  ALERTA: 'Pode alagar: proteja seus bens',
  EVACUACAO: 'Deixe a área de risco',
} as const;

export function ExplicacaoNiveis() {
  return (
    <View style={estilos.lista}>
      {ORDEM_RISCO.map((risco) => (
        <View key={risco} style={estilos.nivel} accessible>
          <SeloRisco risco={risco} />
          <Text style={estilos.texto}>{RESUMO_NIVEL[risco]}</Text>
        </View>
      ))}
    </View>
  );
}
