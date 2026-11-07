import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, View } from 'react-native';

import { cores } from '@/estilos/tema';

import { estilos } from './estilos';

export function Marca() {
  return (
    <View style={estilos.marca} accessible accessibilityRole="header" accessibilityLabel="Pluvia">
      <Text style={estilos.nome}>Pluvia</Text>
      <MaterialCommunityIcons name="water" size={30} color={cores.destaque} />
    </View>
  );
}
