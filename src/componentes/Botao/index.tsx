import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

import { cores } from '@/estilos/tema';

import { estilos } from './estilos';

type Variante = 'primario' | 'secundario' | 'perigo' | 'link';

interface Props {
  rotulo: string;
  onPress: () => void;
  icone?: ComponentProps<typeof MaterialCommunityIcons>['name'];
  variante?: Variante;
  dica?: string;
  ocupado?: boolean;
  desabilitado?: boolean;
}

const COR_TEXTO: Record<Variante, string> = {
  primario: cores.textoSobrePrimaria,
  secundario: cores.primaria,
  perigo: cores.erroTexto,
  link: cores.primaria,
};

export function Botao({
  rotulo,
  onPress,
  icone,
  variante = 'primario',
  dica,
  ocupado = false,
  desabilitado = false,
}: Props) {
  const corTexto = COR_TEXTO[variante];
  const inativo = desabilitado || ocupado;

  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole={variante === 'link' ? 'link' : 'button'}
      accessibilityLabel={rotulo}
      accessibilityHint={dica}
      accessibilityState={{ disabled: inativo, busy: ocupado }}
      style={({ pressed }) => [
        estilos.botao,
        estilos[variante],
        (pressed || inativo) && estilos.atenuado,
      ]}
    >
      {ocupado ? (
        <ActivityIndicator color={corTexto} />
      ) : (
        icone && <MaterialCommunityIcons name={icone} size={22} color={corTexto} />
      )}
      <Text style={[estilos.texto, { color: corTexto }, variante === 'link' && estilos.textoLink]}>
        {rotulo}
      </Text>
    </Pressable>
  );
}
