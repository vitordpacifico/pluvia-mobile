import { Pressable, Text, View } from 'react-native';

import { formatarDistancia } from '@/dominio/geo';
import { estadoExibido, INFO_ESTADO, type Ocorrencia } from '@/dominio/ocorrencia';
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
  const horario =
    ocorrencia.status === 'ENCERRADO' && ocorrencia.encerradaEm
      ? `Encerrada às ${formatarHoraCurta(ocorrencia.encerradaEm)}`
      : `Atualizada ${formatarHaQuanto(ocorrencia.atualizadaEm)}`;
  const descricao = [
    ocorrencia.titulo,
    INFO_ESTADO[estado].rotulo,
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
      <View style={estilos.topo}>
        <Text style={estilos.titulo}>{ocorrencia.titulo}</Text>
        {distanciaM !== undefined && <Text style={estilos.distancia}>{formatarDistancia(distanciaM)}</Text>}
      </View>
      <Text style={estilos.endereco}>
        {ocorrencia.referencia} · {ocorrencia.bairro}
      </Text>
      <SeloEstado estado={estado} />
      <Text style={estilos.rodape}>
        {ocorrencia.fonte.nome} · {horario}
      </Text>
    </Pressable>
  );
}
