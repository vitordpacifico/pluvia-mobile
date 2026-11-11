import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, View } from 'react-native';

import { INFO_ESTADO, type EstadoExibido } from '@/dominio/ocorrencia';
import { INFO_FAIXA, type FaixaRisco } from '@/dominio/riscoEstimado';

import { estilos } from './estilos';

interface Props {
  estado: EstadoExibido;
  grande?: boolean;
}

export function SeloEstado({ estado, grande = false }: Props) {
  const info = INFO_ESTADO[estado];
  return (
    <View
      style={[estilos.selo, grande && estilos.seloGrande, { backgroundColor: info.corFundo }]}
      accessible
      accessibilityLabel={`Situação: ${info.rotulo}`}
    >
      <MaterialCommunityIcons name={info.icone} size={grande ? 22 : 16} color={info.corTexto} />
      <Text style={[estilos.texto, grande && estilos.textoGrande, { color: info.corTexto }]}>
        {info.rotulo}
      </Text>
    </View>
  );
}

export function SeloFaixa({ faixa }: { faixa: FaixaRisco }) {
  const info = INFO_FAIXA[faixa];
  return (
    <View style={[estilos.selo, { backgroundColor: info.corFundo }]} accessible accessibilityLabel={info.rotulo}>
      <MaterialCommunityIcons name="weather-pouring" size={16} color={info.corTexto} />
      <Text style={[estilos.texto, { color: info.corTexto }]}>{info.rotulo}</Text>
    </View>
  );
}
