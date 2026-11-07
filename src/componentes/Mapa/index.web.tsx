import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, View } from 'react-native';

import { cores } from '@/estilos/tema';

import { estilos } from './estilos';
import type { PropsMapa } from './index';

export function Mapa({ ocorrencias }: PropsMapa) {
  return (
    <View style={[estilos.moldura, estilos.semMapa]}>
      <MaterialCommunityIcons name="map-marker-off" size={32} color={cores.textoSecundario} />
      <Text style={estilos.textoSemMapa}>
        O mapa aparece no celular. Na versão web, as {ocorrencias.length} ocorrências estão na lista abaixo.
      </Text>
    </View>
  );
}
