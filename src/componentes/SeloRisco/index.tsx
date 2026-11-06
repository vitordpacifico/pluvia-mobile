import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, View } from 'react-native';

import { INFO_RISCO } from '@/dominio/risco';
import type { NivelRisco } from '@/dominio/tipos';

import { estilos } from './estilos';

interface Props {
  risco: NivelRisco;
  grande?: boolean;
}

/** Mostra o risco com icone, texto e cor juntos: nunca so pela cor. */
export function SeloRisco({ risco, grande = false }: Props) {
  const info = INFO_RISCO[risco];
  return (
    <View
      style={[estilos.selo, grande && estilos.seloGrande, { backgroundColor: info.corFundo }]}
      accessible
      accessibilityLabel={`Risco: ${info.rotulo}`}
    >
      <MaterialCommunityIcons name={info.icone} size={grande ? 32 : 20} color={info.corTexto} />
      <Text style={[estilos.texto, grande && estilos.textoGrande, { color: info.corTexto }]}>
        {info.rotulo.toUpperCase()}
      </Text>
    </View>
  );
}
