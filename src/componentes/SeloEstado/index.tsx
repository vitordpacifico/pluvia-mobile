import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, View } from 'react-native';

import { INFO_ESTADO, type EstadoExibido } from '@/dominio/ocorrencia';
import { INFO_STATUS_RELATO, type StatusRelato } from '@/dominio/relato';
import { INFO_FAIXA, type FaixaRisco } from '@/dominio/riscoEstimado';
import { cores } from '@/estilos/tema';

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

export const VISUAL_STATUS_RELATO: Record<
  StatusRelato,
  { fundo: string; texto: string; icone: 'progress-clock' | 'account-group' | 'close-circle-outline' }
> = {
  EM_ANALISE: { fundo: cores.avisoFundo, texto: cores.avisoTexto, icone: 'progress-clock' },
  PUBLICADO: { fundo: cores.sucessoSuave, texto: cores.sucesso, icone: 'account-group' },
  RECUSADO: { fundo: cores.erroFundo, texto: cores.erroTexto, icone: 'close-circle-outline' },
};

export function SeloRelato({ status, grande = false }: { status: StatusRelato; grande?: boolean }) {
  const visual = VISUAL_STATUS_RELATO[status];
  const rotulo = INFO_STATUS_RELATO[status].rotulo;
  return (
    <View
      style={[estilos.selo, grande && estilos.seloGrande, { backgroundColor: visual.fundo }]}
      accessible
      accessibilityLabel={`Situação do relato: ${rotulo}`}
    >
      <MaterialCommunityIcons name={visual.icone} size={grande ? 22 : 16} color={visual.texto} />
      <Text style={[estilos.texto, grande && estilos.textoGrande, { color: visual.texto }]}>{rotulo}</Text>
    </View>
  );
}
