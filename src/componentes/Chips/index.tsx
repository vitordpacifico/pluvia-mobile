import { Pressable, Text, View } from 'react-native';

import { estilos } from './estilos';

interface Opcao<T extends string> {
  valor: T;
  rotulo: string;
}

interface Props<T extends string> {
  rotulo: string;
  opcoes: readonly Opcao<T>[];
  valor: T;
  onMudar: (valor: T) => void;
}

export function Chips<T extends string>({ rotulo, opcoes, valor, onMudar }: Props<T>) {
  return (
    <View style={estilos.grupo}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <View style={estilos.opcoes} accessibilityRole="radiogroup" accessibilityLabel={rotulo}>
        {opcoes.map((opcao) => {
          const marcada = opcao.valor === valor;
          return (
            <Pressable
              key={opcao.valor}
              onPress={() => onMudar(opcao.valor)}
              accessibilityRole="radio"
              accessibilityState={{ checked: marcada }}
              accessibilityLabel={`${rotulo}: ${opcao.rotulo}`}
              style={[estilos.chip, marcada && estilos.chipMarcado]}
            >
              <Text style={[estilos.texto, marcada && estilos.textoMarcado]}>{opcao.rotulo}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
