import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, Text, View } from 'react-native';

import { dadosDesatualizados, INFO_RISCO } from '@/dominio/risco';
import type { PontoMonitorado } from '@/dominio/tipos';
import { cores } from '@/estilos/tema';
import { formatarCm, formatarDataHora } from '@/utilitarios/formato';

import { SeloRisco } from '../SeloRisco';
import { estilos } from './estilos';

interface Props {
  ponto: PontoMonitorado;
  seguido?: boolean;
  onPress: () => void;
}

export function CartaoPonto({ ponto, seguido = false, onPress }: Props) {
  const antigo = dadosDesatualizados(ponto);
  const descricao = [
    ponto.nome,
    `risco ${INFO_RISCO[ponto.risco].rotulo}`,
    `água em ${formatarCm(ponto.nivelAtualCm)}`,
    antigo ? 'sem leituras recentes' : null,
    seguido ? 'você acompanha este ponto' : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={descricao}
      accessibilityHint="Abre o histórico e as orientações deste ponto"
      style={({ pressed }) => [estilos.cartao, pressed && estilos.pressionado]}
    >
      <View style={estilos.topo}>
        <Text style={estilos.nome}>{ponto.nome}</Text>
        {seguido && <MaterialCommunityIcons name="bell-ring" size={22} color={cores.primaria} />}
      </View>
      <Text style={estilos.endereco}>
        {ponto.endereco} · {ponto.regiao}
      </Text>
      <View style={estilos.linha}>
        <SeloRisco risco={ponto.risco} />
        <Text style={estilos.nivel}>Água: {formatarCm(ponto.nivelAtualCm)}</Text>
      </View>
      <Text style={[estilos.atualizacao, antigo && estilos.antigo]}>
        {antigo ? 'Sem leituras recentes. Última: ' : 'Última leitura: '}
        {formatarDataHora(ponto.atualizadoEm)}
      </Text>
    </Pressable>
  );
}
