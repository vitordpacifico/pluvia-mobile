import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, Text, View } from 'react-native';

import { cores } from '@/estilos/tema';

import { estilos } from './estilos';

interface Props {
  texto: string;
  marcada: boolean;
  onMudar: (marcada: boolean) => void;
  erro?: string | null;
}

export function CaixaSelecao({ texto, marcada, onMudar, erro }: Props) {
  return (
    <View>
      <Pressable
        onPress={() => onMudar(!marcada)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: marcada }}
        accessibilityLabel={texto}
        accessibilityHint={erro ?? undefined}
        style={estilos.caixa}
      >
        <MaterialCommunityIcons
          name={marcada ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={28}
          color={erro ? cores.perigo : cores.primaria}
        />
        <Text style={estilos.texto}>{texto}</Text>
      </Pressable>
      {erro && (
        <Text style={estilos.erro} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {erro}
        </Text>
      )}
    </View>
  );
}
