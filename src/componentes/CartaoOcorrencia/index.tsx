import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, Text, View } from 'react-native';

import { formatarDistancia } from '@/dominio/geo';
import { estadoExibido, INFO_ESTADO, type Ocorrencia } from '@/dominio/ocorrencia';
import { cores } from '@/estilos/tema';
import { formatarHaQuanto, formatarHoraCurta } from '@/utilitarios/formato';

import { SeloEstado } from '../SeloEstado';
import { estilos } from './estilos';

interface Props {
  ocorrencia: Ocorrencia;
  distanciaM?: number;
  onPress: () => void;
}

export function CartaoOcorrencia({ ocorrencia, distanciaM, onPress }: Props) {
  const estado = estadoExibido(ocorrencia);
  const info = INFO_ESTADO[estado];
  const horario =
    ocorrencia.status === 'ENCERRADO' && ocorrencia.encerradaEm
      ? `Encerrada às ${formatarHoraCurta(ocorrencia.encerradaEm)}`
      : `Atualizada ${formatarHaQuanto(ocorrencia.atualizadaEm)}`;
  const descricao = [
    ocorrencia.titulo,
    info.rotulo,
    `${ocorrencia.referencia}, ${ocorrencia.bairro}`,
    distanciaM === undefined ? null : `a ${formatarDistancia(distanciaM)}`,
    `fonte: ${ocorrencia.fonte.nome}`,
    horario,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={descricao}
      accessibilityHint="Abre os detalhes e o histórico da ocorrência"
      style={({ pressed }) => [estilos.cartao, pressed && estilos.pressionado]}
    >
      <View style={[estilos.icone, { backgroundColor: info.corFundo }]}>
        <MaterialCommunityIcons name={info.icone} size={22} color={info.corTexto} />
      </View>
      <View style={estilos.corpo}>
        <View style={estilos.topo}>
          <Text style={estilos.titulo} numberOfLines={2}>
            {ocorrencia.titulo}
          </Text>
          {distanciaM !== undefined && <Text style={estilos.distancia}>{formatarDistancia(distanciaM)}</Text>}
        </View>
        <Text style={estilos.endereco}>
          {ocorrencia.referencia} · {ocorrencia.bairro}
        </Text>
        <SeloEstado estado={estado} />
        <Text style={estilos.rodape}>
          {ocorrencia.fonte.nome} · {horario}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color={cores.textoSecundario} style={estilos.seta} />
    </Pressable>
  );
}
