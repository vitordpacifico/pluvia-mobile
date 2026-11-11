import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';

import { cores } from '@/estilos/tema';

import { estilos } from './estilos';

interface Props {
  icone: ComponentProps<typeof MaterialCommunityIcons>['name'];
  titulo: string;
  texto: string;
}

export function EstadoVazio({ icone, titulo, texto }: Props) {
  return (
    <View style={estilos.vazio} accessible accessibilityLabel={`${titulo}. ${texto}`}>
      <View style={estilos.icone}>
        <MaterialCommunityIcons name={icone} size={32} color={cores.primaria} />
      </View>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.texto}>{texto}</Text>
    </View>
  );
}
