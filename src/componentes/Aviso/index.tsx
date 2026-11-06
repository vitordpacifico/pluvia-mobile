import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, View } from 'react-native';

import { CORES_AVISO, estilos } from './estilos';

interface Props {
  texto: string;
  tipo?: keyof typeof CORES_AVISO;
}

/** Mensagem destacada. Erros e avisos sao anunciados pelo leitor de tela assim que aparecem. */
export function Aviso({ texto, tipo = 'info' }: Props) {
  const cor = CORES_AVISO[tipo];
  const urgente = tipo === 'erro' || tipo === 'aviso';
  return (
    <View
      style={[estilos.aviso, { backgroundColor: cor.fundo }]}
      accessibilityRole={urgente ? 'alert' : 'text'}
      accessibilityLiveRegion={urgente ? 'polite' : 'none'}
    >
      <MaterialCommunityIcons name={cor.icone} size={22} color={cor.texto} />
      <Text style={[estilos.texto, { color: cor.texto }]}>{texto}</Text>
    </View>
  );
}
