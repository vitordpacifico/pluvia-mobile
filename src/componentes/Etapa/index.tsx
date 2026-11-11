import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { estilosComuns } from '@/estilos/comuns';

import { estilos } from './estilos';

interface Props {
  numero: number;
  titulo: string;
  children: ReactNode;
}

export function Etapa({ numero, titulo, children }: Props) {
  return (
    <View style={estilosComuns.cartao}>
      <View style={estilos.topo}>
        <View style={estilos.numero}>
          <Text style={estilos.textoNumero}>{numero}</Text>
        </View>
        <Text style={estilos.titulo} accessibilityRole="header">
          {titulo}
        </Text>
      </View>
      {children}
    </View>
  );
}
